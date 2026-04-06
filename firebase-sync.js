// ============================================================
// Firebase Sync Layer — Auth + Realtime Database
// ============================================================

const FirebaseSync = {
  user: null,
  _vocabDebounce: null,
  _grammarDebounce: null,
  _app: null, // reference to App instance

  config: {
    apiKey: "AIzaSyBCDMvomAMM1F7UwcKCT56il0r0sfRkR2A",
    authDomain: "aprende-c083c.firebaseapp.com",
    databaseURL: "https://aprende-c083c-default-rtdb.firebaseio.com",
    projectId: "aprende-c083c",
    storageBucket: "aprende-c083c.firebasestorage.app",
    messagingSenderId: "918955566931",
    appId: "1:918955566931:web:2fc1c896401247eca9a3a6",
  },

  init(appInstance) {
    this._app = appInstance;

    if (!window.firebase) {
      console.warn('Firebase SDK not loaded — running in offline mode');
      return;
    }

    firebase.initializeApp(this.config);
    this._setupAuthUI();
    this._listenAuthState();
    this._handleRedirectResult();
    this._listenOnlineStatus();
  },

  // ---- Auth ----

  _setupAuthUI() {
    const signInBtn = document.getElementById('google-signin-btn');
    const signOutBtn = document.getElementById('signout-btn');
    const mobileSignInBtn = document.getElementById('mobile-signin-btn');

    if (signInBtn) signInBtn.addEventListener('click', () => this.signIn());
    if (signOutBtn) signOutBtn.addEventListener('click', () => this.signOut());
    if (mobileSignInBtn) mobileSignInBtn.addEventListener('click', () => this.signIn());
  },

  async _handleRedirectResult() {
    try {
      const result = await firebase.auth().getRedirectResult();
      if (result.user) {
        console.log('Redirect sign-in successful:', result.user.displayName);
      }
    } catch (err) {
      console.error('Redirect result error:', err);
    }
  },

  _listenAuthState() {
    firebase.auth().onAuthStateChanged(user => {
      this.user = user;
      this._updateAuthUI();

      if (user) {
        this._migrateLocalToFirebase().then(() => {
          this._listenForRemoteChanges();
        });
      }
    });
  },

  _updateAuthUI() {
    const signInBtn = document.getElementById('google-signin-btn');
    const userInfo = document.getElementById('user-info');
    const avatar = document.getElementById('user-avatar');
    const name = document.getElementById('user-name');
    const syncStatus = document.getElementById('sync-status');

    // Mobile auth elements
    const mobileSignInBtn = document.getElementById('mobile-signin-btn');
    const mobileUserInfo = document.getElementById('mobile-user-info');
    const mobileAvatar = document.getElementById('mobile-user-avatar');
    const mobileName = document.getElementById('mobile-user-name');
    const mobileSyncStatus = document.getElementById('mobile-sync-status');

    if (this.user) {
      if (signInBtn) signInBtn.style.display = 'none';
      if (userInfo) userInfo.style.display = 'flex';
      if (avatar) avatar.src = this.user.photoURL || '';
      if (name) name.textContent = this.user.displayName || this.user.email;
      if (syncStatus) syncStatus.textContent = 'Synced';
      // Mobile
      if (mobileSignInBtn) mobileSignInBtn.style.display = 'none';
      if (mobileUserInfo) mobileUserInfo.style.display = 'flex';
      if (mobileAvatar) mobileAvatar.src = this.user.photoURL || '';
      if (mobileName) mobileName.textContent = this.user.displayName || this.user.email;
      if (mobileSyncStatus) mobileSyncStatus.textContent = 'Synced';
    } else {
      if (signInBtn) signInBtn.style.display = 'flex';
      if (userInfo) userInfo.style.display = 'none';
      if (syncStatus) syncStatus.textContent = '';
      // Mobile
      if (mobileSignInBtn) mobileSignInBtn.style.display = 'flex';
      if (mobileUserInfo) mobileUserInfo.style.display = 'none';
      if (mobileSyncStatus) mobileSyncStatus.textContent = '';
    }
  },

  async signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      // Try popup first
      await firebase.auth().signInWithPopup(provider);
    } catch (err) {
      console.error('Popup sign-in failed, trying redirect:', err.code);
      // Fallback to redirect if popup blocked or fails
      try {
        await firebase.auth().signInWithRedirect(provider);
      } catch (redirectErr) {
        console.error('Redirect sign-in also failed:', redirectErr);
      }
    }
  },

  async signOut() {
    try {
      await firebase.auth().signOut();
      this._setSyncStatus('Signed out');
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  },

  // ---- Data Sync ----

  _dbRef(path) {
    return firebase.database().ref(`users/${this.user.uid}/${path}`);
  },

  pushVocabData(data) {
    if (!this.user) return;
    clearTimeout(this._vocabDebounce);
    this._vocabDebounce = setTimeout(() => {
      const payload = { ...data, lastModified: firebase.database.ServerValue.TIMESTAMP };
      this._dbRef('vocab').set(payload)
        .then(() => this._setSyncStatus('Synced'))
        .catch(err => {
          console.error('Vocab push failed:', err);
          this._setSyncStatus('Sync error');
        });
    }, 2000);
  },

  pushGrammarData(data) {
    if (!this.user) return;
    clearTimeout(this._grammarDebounce);
    this._grammarDebounce = setTimeout(() => {
      const payload = { ...data, lastModified: firebase.database.ServerValue.TIMESTAMP };
      this._dbRef('grammar').set(payload)
        .then(() => this._setSyncStatus('Synced'))
        .catch(err => {
          console.error('Grammar push failed:', err);
          this._setSyncStatus('Sync error');
        });
    }, 2000);
  },

  async _pullVocabData() {
    if (!this.user) return null;
    const snap = await this._dbRef('vocab').once('value');
    return snap.val();
  },

  async _pullGrammarData() {
    if (!this.user) return null;
    const snap = await this._dbRef('grammar').once('value');
    return snap.val();
  },

  // ---- Migration (first sign-in) ----

  async _migrateLocalToFirebase() {
    this._setSyncStatus('Syncing...');

    try {
      // Pull existing Firebase data
      const [remoteVocab, remoteGrammar] = await Promise.all([
        this._pullVocabData(),
        this._pullGrammarData(),
      ]);

      // Read local data
      const localVocabRaw = localStorage.getItem('spanish-vocab-data');
      const localGrammarRaw = localStorage.getItem('spanish-grammar-progress');
      const localVocab = localVocabRaw ? JSON.parse(localVocabRaw) : null;
      const localGrammar = localGrammarRaw ? JSON.parse(localGrammarRaw) : null;

      // Merge vocab: Firebase wins if it has newer data, otherwise push local
      if (remoteVocab && remoteVocab.lastModified) {
        const localTime = localVocab?.lastModified || 0;
        if (remoteVocab.lastModified > localTime) {
          // Remote is newer — update local
          const { lastModified, ...vocabData } = remoteVocab;
          vocabData.lastModified = lastModified;
          localStorage.setItem('spanish-vocab-data', JSON.stringify(vocabData));
          if (this._app) this._app.reload();
        } else if (localVocab) {
          // Local is newer — push to Firebase
          this.pushVocabData(localVocab);
        }
      } else if (localVocab) {
        // No remote data — push local up
        this.pushVocabData(localVocab);
      }

      // Merge grammar: same strategy
      if (remoteGrammar && remoteGrammar.lastModified) {
        const localTime = localGrammar?.lastModified || 0;
        if (remoteGrammar.lastModified > localTime) {
          const { lastModified, ...grammarData } = remoteGrammar;
          grammarData.lastModified = lastModified;
          localStorage.setItem('spanish-grammar-progress', JSON.stringify(grammarData));
          if (this._app && this._app.grammar) this._app.grammar.reloadProgress();
        } else if (localGrammar) {
          this.pushGrammarData(localGrammar);
        }
      } else if (localGrammar) {
        this.pushGrammarData(localGrammar);
      }

      this._setSyncStatus('Synced');
    } catch (err) {
      console.error('Migration failed:', err);
      this._setSyncStatus('Sync error');
    }
  },

  // ---- Real-time Listener ----

  _listenForRemoteChanges() {
    // Listen for vocab changes from other devices
    this._dbRef('vocab').on('value', snap => {
      const remote = snap.val();
      if (!remote || !remote.lastModified) return;

      const localRaw = localStorage.getItem('spanish-vocab-data');
      const local = localRaw ? JSON.parse(localRaw) : null;
      const localTime = local?.lastModified || 0;

      if (remote.lastModified > localTime) {
        const { lastModified, ...vocabData } = remote;
        vocabData.lastModified = lastModified;
        localStorage.setItem('spanish-vocab-data', JSON.stringify(vocabData));
        if (this._app) this._app.reload();
        this._setSyncStatus('Synced');
      }
    });

    // Listen for grammar changes
    this._dbRef('grammar').on('value', snap => {
      const remote = snap.val();
      if (!remote || !remote.lastModified) return;

      const localRaw = localStorage.getItem('spanish-grammar-progress');
      const local = localRaw ? JSON.parse(localRaw) : null;
      const localTime = local?.lastModified || 0;

      if (remote.lastModified > localTime) {
        const { lastModified, ...grammarData } = remote;
        grammarData.lastModified = lastModified;
        localStorage.setItem('spanish-grammar-progress', JSON.stringify(grammarData));
        if (this._app && this._app.grammar) this._app.grammar.reloadProgress();
        this._setSyncStatus('Synced');
      }
    });
  },

  // ---- Online/Offline ----

  _listenOnlineStatus() {
    window.addEventListener('online', () => {
      if (this.user) {
        this._setSyncStatus('Reconnecting...');
        // Push latest local state
        const vocabRaw = localStorage.getItem('spanish-vocab-data');
        const grammarRaw = localStorage.getItem('spanish-grammar-progress');
        if (vocabRaw) this.pushVocabData(JSON.parse(vocabRaw));
        if (grammarRaw) this.pushGrammarData(JSON.parse(grammarRaw));
      }
    });

    window.addEventListener('offline', () => {
      this._setSyncStatus('Offline');
    });
  },

  // ---- UI Helpers ----

  _setSyncStatus(text) {
    const el = document.getElementById('sync-status');
    const mobileEl = document.getElementById('mobile-sync-status');
    if (el) el.textContent = text;
    if (mobileEl) mobileEl.textContent = text;
  },
};
