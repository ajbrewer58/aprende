// ============================================================
// SM-2 Spaced Repetition Algorithm (Anki-style)
// ============================================================

const SM2 = {
  // Default card state
  newCard() {
    return {
      easeFactor: 2.5,   // Starting ease
      interval: 0,       // Days until next review
      repetitions: 0,    // Consecutive correct answers
      dueDate: Date.now(), // When to review next
      lastReview: null,
    };
  },

  // Calculate next review based on rating (0-5)
  // 0 = Again (complete blank), 3 = Hard, 4 = Good, 5 = Easy
  review(card, rating) {
    const now = Date.now();
    let { easeFactor, interval, repetitions } = card;

    if (rating < 3) {
      // Failed - reset to beginning
      repetitions = 0;
      interval = 1; // Review again in 1 minute (converted to days below)
    } else {
      // Passed
      if (repetitions === 0) {
        interval = 1; // 1 day
      } else if (repetitions === 1) {
        interval = 6; // 6 days
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions++;
    }

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Calculate next due date
    let dueDate;
    if (rating < 3) {
      dueDate = now + 10 * 60 * 1000; // 10 minutes for "Again"
    } else if (rating === 3) {
      // Hard: slightly less than interval
      const hardInterval = Math.max(1, Math.round(interval * 0.8));
      dueDate = now + hardInterval * 24 * 60 * 60 * 1000;
      interval = hardInterval;
    } else if (rating === 5) {
      // Easy: bonus interval
      const easyInterval = Math.round(interval * 1.3);
      dueDate = now + easyInterval * 24 * 60 * 60 * 1000;
      interval = easyInterval;
    } else {
      dueDate = now + interval * 24 * 60 * 60 * 1000;
    }

    return { easeFactor, interval, repetitions, dueDate, lastReview: now };
  },

  // Get human-readable next review time
  formatInterval(card, rating) {
    if (rating < 3) return '10m';
    const temp = this.review({ ...card }, rating);
    const days = temp.interval;
    if (days < 1) return '<1d';
    if (days === 1) return '1d';
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return `${(days / 365).toFixed(1)}y`;
  },

  // Get card status
  getStatus(card) {
    if (card.repetitions === 0 && !card.lastReview) return 'new';
    if (card.repetitions < 2) return 'learning';
    return 'learned';
  },

  isDue(card) {
    return card.dueDate <= Date.now();
  }
};

// ============================================================
// Data Store (localStorage)
// ============================================================

const Store = {
  KEY: 'spanish-vocab-data',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      const data = raw ? JSON.parse(raw) : this.defaults();
      // Migrate older saves that lack studyTime
      if (!data.studyTime) {
        data.studyTime = { totalHours: 100, sessions: [] };
      }
      return data;
    } catch {
      return this.defaults();
    }
  },

  save(data) {
    data.lastModified = Date.now();
    localStorage.setItem(this.KEY, JSON.stringify(data));
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.user) {
      FirebaseSync.pushVocabData(data);
    }
  },

  defaults() {
    return {
      words: [],
      stats: { reviewedToday: 0, lastReviewDate: null, streak: 0 },
      studyTime: { totalHours: 100, sessions: [] }
    };
  }
};

// CEFR levels for Spanish — approximate hours of study to reach each level
// Based on Cambridge / FSI guidelines for Romance languages
const CEFR_LEVELS = [
  { code: 'A1', title: 'Beginner',          desc: 'Basic phrases, introductions',         min: 0,    max: 80   },
  { code: 'A2', title: 'Elementary',        desc: 'Routine tasks, simple exchanges',      min: 80,   max: 200  },
  { code: 'B1', title: 'Intermediate',      desc: 'Travel, work, familiar topics',        min: 200,  max: 400  },
  { code: 'B2', title: 'Upper Intermediate',desc: 'Complex texts, fluent interaction',    min: 400,  max: 600  },
  { code: 'C1', title: 'Advanced',          desc: 'Implicit meaning, flexible use',       min: 600,  max: 800  },
  { code: 'C2', title: 'Mastery',           desc: 'Near-native proficiency',              min: 800,  max: 1200 },
];

// ============================================================
// PDF Parser
// ============================================================

const PDFParser = {
  async parse(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = this.loadPdfJs();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let allText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lines = this.extractLines(content);
      allText += lines.join('\n') + '\n';
    }

    return this.parseWordPairs(allText);
  },

  loadPdfJs() {
    // pdf.js 3.x loaded via script tag exposes window.pdfjsLib
    const lib = window.pdfjsLib;
    if (lib && !lib.GlobalWorkerOptions.workerSrc) {
      lib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    return lib;
  },

  extractLines(content) {
    const items = content.items;
    if (!items.length) return [];

    // Group items by Y position (same line)
    const lineMap = new Map();
    for (const item of items) {
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y).push({ x: item.transform[4], text: item.str });
    }

    // Sort lines top to bottom, items left to right
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
    return sortedYs.map(y => {
      const items = lineMap.get(y).sort((a, b) => a.x - b.x);
      return items.map(i => i.text).join(' ').trim();
    }).filter(l => l.length > 0);
  },

  parseWordPairs(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const pairs = [];

    // Try delimiter-based parsing first (tab, |, -, comma, =)
    const delimiters = ['\t', ' | ', '|', ' - ', ' – ', ' — ', ' = ', ','];

    for (const line of lines) {
      let found = false;

      // Skip header-like lines
      if (/^(spanish|english|word|translation|vocabul)/i.test(line)) continue;
      if (/^[\d#]+[\.\)]?\s*$/.test(line)) continue;

      for (const delim of delimiters) {
        if (line.includes(delim)) {
          const parts = line.split(delim).map(p => p.trim()).filter(p => p.length > 0);
          if (parts.length >= 2) {
            // Remove numbering from first part
            let spanish = parts[0].replace(/^[\d]+[\.\)]\s*/, '');
            let english = parts.slice(1).join(', ');
            if (spanish && english && spanish.length < 100 && english.length < 200) {
              pairs.push({ spanish, english });
              found = true;
              break;
            }
          }
        }
      }

      // Try labeled format: "Spanish: X / English: Y" on same line
      if (!found) {
        const match = line.match(/(?:spanish|esp)[:\s]+(.+?)[\s]*(?:[\/|,;]|english|eng|en)[:\s]+(.+)/i);
        if (match) {
          pairs.push({ spanish: match[1].trim(), english: match[2].trim() });
          found = true;
        }
      }
    }

    // If no delimiter matches, try paired lines (odd=spanish, even=english)
    if (pairs.length === 0 && lines.length >= 2) {
      for (let i = 0; i < lines.length - 1; i += 2) {
        const spanish = lines[i].replace(/^[\d]+[\.\)]\s*/, '').trim();
        const english = lines[i + 1].replace(/^[\d]+[\.\)]\s*/, '').trim();
        if (spanish && english && spanish.length < 100 && english.length < 200) {
          pairs.push({ spanish, english });
        }
      }
    }

    return pairs;
  }
};

// ============================================================
// App Controller
// ============================================================

class App {
  constructor() {
    this.data = Store.load();
    this.currentView = 'dashboard';
    this.reviewQueue = [];
    this.reviewIndex = 0;
    this.reviewedThisSession = 0;
    this.pendingImport = [];

    this.grammar = new GrammarModule(this);

    // Initialize Firebase sync
    if (typeof FirebaseSync !== 'undefined') {
      FirebaseSync.init(this);
    }

    this.checkDayRollover();
    this.bindEvents();
    this.navigate('dashboard');
    this.updateSidebarStats();

    // Auto-load seed data if no words exist
    if (this.data.words.length === 0) {
      this.loadSeedData();
    }
  }

  async loadSeedData() {
    try {
      const resp = await fetch('seed-data.json');
      if (!resp.ok) return;
      const pairs = await resp.json();
      const now = Date.now();
      for (const pair of pairs) {
        this.data.words.push({
          id: now + '-' + Math.random().toString(36).substr(2, 9),
          spanish: pair.s,
          english: pair.e,
          example: '',
          sm2: SM2.newCard(),
          createdAt: now,
        });
      }
      Store.save(this.data);
      this.updateSidebarStats();
      this.navigate(this.currentView);
      console.log(`Loaded ${pairs.length} words from seed data`);
    } catch (e) {
      console.log('No seed data found:', e.message);
    }
  }

  reload() {
    // During review, don't touch this.data or re-navigate — the active
    // session owns the data and any remote overwrite would corrupt it.
    if (this.currentView === 'review' && this._reviewInProgress) return;
    this.data = Store.load();
    this.updateSidebarStats();
    this.navigate(this.currentView);
  }

  checkDayRollover() {
    const today = new Date().toDateString();
    if (this.data.stats.lastReviewDate !== today) {
      // New day
      if (this.data.stats.lastReviewDate) {
        const lastDate = new Date(this.data.stats.lastReviewDate);
        const now = new Date();
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          this.data.stats.streak++;
        } else {
          this.data.stats.streak = 0;
        }
      }
      this.data.stats.reviewedToday = 0;
      this.data.stats.lastReviewDate = today;
      Store.save(this.data);
    }
  }

  bindEvents() {
    // Navigation
    document.querySelectorAll('[data-view]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        this.navigate(link.dataset.view);
      });
    });

    // Dashboard review button
    document.getElementById('start-review-btn').addEventListener('click', () => {
      this.navigate('review');
    });

    // Flashcard flip
    document.getElementById('flashcard').addEventListener('click', () => this.flipCard());

    // Rating buttons
    document.querySelectorAll('.rate-btn').forEach(btn => {
      btn.addEventListener('click', () => this.rateCard(parseInt(btn.dataset.rating)));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (this.currentView !== 'review') return;
      if (e.code === 'Space') { e.preventDefault(); this.flipCard(); }
      if (e.key === '1') this.rateCard(0);
      if (e.key === '2') this.rateCard(3);
      if (e.key === '3') this.rateCard(4);
      if (e.key === '4') this.rateCard(5);
    });

    // PDF Import
    const dropZone = document.getElementById('drop-zone');
    const pdfInput = document.getElementById('pdf-input');

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') this.handlePDF(file);
    });

    pdfInput.addEventListener('change', () => {
      if (pdfInput.files[0]) this.handlePDF(pdfInput.files[0]);
    });

    document.getElementById('import-confirm').addEventListener('click', () => this.confirmImport());
    document.getElementById('import-cancel').addEventListener('click', () => this.cancelImport());

    // Add word form
    document.getElementById('add-form').addEventListener('submit', e => {
      e.preventDefault();
      this.addWord(
        document.getElementById('add-spanish').value.trim(),
        document.getElementById('add-english').value.trim(),
        document.getElementById('add-example').value.trim()
      );
    });

    // Bulk add
    document.getElementById('bulk-add-btn').addEventListener('click', () => this.bulkAdd());

    // Browse filters
    document.getElementById('browse-search').addEventListener('input', () => this.renderBrowse());
    document.getElementById('browse-filter').addEventListener('change', () => this.renderBrowse());

    // Study time
    document.querySelectorAll('.study-add-btn').forEach(btn => {
      btn.addEventListener('click', () => this.addStudySession(parseInt(btn.dataset.mins)));
    });
    document.getElementById('study-custom-add').addEventListener('click', () => {
      const input = document.getElementById('study-custom-mins');
      const mins = parseInt(input.value);
      if (mins && mins > 0) {
        this.addStudySession(mins);
        input.value = '';
      }
    });
  }

  navigate(view) {
    this.currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelectorAll('[data-view]').forEach(a => {
      a.classList.toggle('active', a.dataset.view === view);
    });

    if (view === 'dashboard') this.renderDashboard();
    if (view === 'review') this.startReview();
    if (view === 'browse') this.renderBrowse();
    if (view === 'charts') this.renderCharts();
    if (view === 'grammar-exercises') this.grammar.renderExercises();
    if (view === 'grammar-sheets') this.grammar.renderCheatSheets();
    if (view === 'study') this.renderStudyTime();
  }

  updateSidebarStats() {
    const total = this.data.words.length;
    const due = this.data.words.filter(w => SM2.isDue(w.sm2)).length;
    const learned = this.data.words.filter(w => SM2.getStatus(w.sm2) === 'learned').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-due').textContent = due;
    document.getElementById('stat-learned').textContent = learned;
  }

  // ---- Dashboard ----

  renderDashboard() {
    const total = this.data.words.length;
    const due = this.data.words.filter(w => SM2.isDue(w.sm2)).length;
    const learned = this.data.words.filter(w => SM2.getStatus(w.sm2) === 'learned').length;

    document.getElementById('dash-due').textContent = due;
    document.getElementById('dash-total').textContent = total;
    document.getElementById('dash-learned').textContent = learned;
    document.getElementById('dash-streak').textContent = `${this.data.stats.streak} days`;
    document.getElementById('dash-reviewed-today').textContent = this.data.stats.reviewedToday;

    const pct = total > 0 ? (learned / total * 100) : 0;
    document.getElementById('progress-bar').style.width = `${pct}%`;

    // Upcoming chart (next 7 days)
    this.renderUpcomingChart();
  }

  renderUpcomingChart() {
    const chart = document.getElementById('upcoming-chart');
    const days = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = this.data.words.filter(w => {
        const due = w.sm2.dueDate;
        if (i === 0) return due <= dayEnd.getTime();
        return due > dayStart.getTime() && due <= dayEnd.getTime();
      }).length;

      const label = i === 0 ? 'Today' : dayStart.toLocaleDateString('en', { weekday: 'short' });
      days.push({ label, count });
    }

    const max = Math.max(...days.map(d => d.count), 1);
    chart.innerHTML = days.map(d => `
      <div class="upcoming-bar" style="height: ${Math.max((d.count / max) * 80, 4)}px">
        <span class="upcoming-bar-count">${d.count}</span>
        <span class="upcoming-bar-label">${d.label}</span>
      </div>
    `).join('');
  }

  // ---- Review ----

  startReview() {
    const DAILY_LIMIT = 50;
    const alreadyDone = this.data.stats.reviewedToday || 0;
    const remaining = Math.max(DAILY_LIMIT - alreadyDone, 0);

    if (remaining === 0) {
      this._reviewInProgress = false;
      document.getElementById('review-empty').style.display = '';
      document.getElementById('review-active').style.display = 'none';
      document.querySelector('#view-review .empty-state .empty-icon').textContent = '🎉';
      document.querySelector('#view-review .empty-state h3').textContent = 'Daily goal complete!';
      document.querySelector('#view-review .empty-state p').textContent =
        `You've reviewed all ${DAILY_LIMIT} cards for today. Come back tomorrow!`;
      return;
    }

    this.reviewQueue = this.data.words
      .filter(w => SM2.isDue(w.sm2))
      .sort((a, b) => a.sm2.dueDate - b.sm2.dueDate)
      .slice(0, remaining);

    this.reviewIndex = 0;
    this.reviewedThisSession = 0;
    this._reviewInProgress = true;

    if (this.reviewQueue.length === 0) {
      this._reviewInProgress = false;
      document.getElementById('review-empty').style.display = '';
      document.getElementById('review-active').style.display = 'none';
      document.querySelector('#view-review .empty-state .empty-icon').textContent = '🎉';
      document.querySelector('#view-review .empty-state h3').textContent = 'All caught up!';
      document.querySelector('#view-review .empty-state p').textContent =
        `No cards are due for review right now. (${alreadyDone}/${DAILY_LIMIT} reviewed today)`;
    } else {
      document.getElementById('review-empty').style.display = 'none';
      document.getElementById('review-active').style.display = '';
      this.showCard();
    }
  }

  showCard() {
    const DAILY_LIMIT = 50;
    const totalToday = this.data.stats.reviewedToday || 0;

    if (this.reviewIndex >= this.reviewQueue.length) {
      // Session complete
      this._reviewInProgress = false;
      document.getElementById('review-empty').style.display = '';
      document.getElementById('review-active').style.display = 'none';
      const icon = document.querySelector('#view-review .empty-state .empty-icon');
      const h3 = document.querySelector('#view-review .empty-state h3');
      const p = document.querySelector('#view-review .empty-state p');

      if (totalToday >= DAILY_LIMIT) {
        icon.textContent = '🏆';
        h3.textContent = 'Daily goal complete!';
        p.textContent = `Amazing! You've hit your ${DAILY_LIMIT}-card daily goal. Rest up and come back tomorrow!`;
      } else {
        icon.textContent = '🎉';
        h3.textContent = 'Session complete!';
        p.textContent = `You reviewed ${this.reviewedThisSession} cards. (${totalToday}/${DAILY_LIMIT} today)`;
      }
      return;
    }

    const word = this.reviewQueue[this.reviewIndex];
    const card = document.getElementById('flashcard');
    const inner = card.querySelector('.flashcard-inner');

    // Disable flip transition during content swap so the back face
    // (with the new English translation) isn't visible during the reset.
    inner.style.transition = 'none';
    card.classList.remove('flipped');

    document.getElementById('card-front-word').textContent = word.spanish;
    document.getElementById('card-front-hint').textContent =
      word.example ? '(has example)' : '';
    document.getElementById('card-back-word').textContent = word.english;
    document.getElementById('card-back-example').textContent = word.example || '';

    // Force reflow so the un-flip lands instantly, then restore transition
    // for the user's next deliberate flip.
    void inner.offsetWidth;
    inner.style.transition = '';

    document.getElementById('rating-buttons').style.display = 'none';
    document.getElementById('flip-hint').style.display = '';

    // Update progress
    const total = this.reviewQueue.length;
    document.getElementById('review-count').textContent =
      `${this.reviewIndex + 1} / ${total} (${totalToday}/${DAILY_LIMIT} today)`;
    document.getElementById('review-progress-fill').style.width =
      `${(this.reviewIndex / total) * 100}%`;

    // Preview intervals
    [0, 3, 4, 5].forEach(r => {
      const el = document.getElementById(`rate-time-${r}`);
      if (el) el.textContent = SM2.formatInterval(word.sm2, r);
    });
  }

  flipCard() {
    const card = document.getElementById('flashcard');
    if (card.classList.contains('flipped')) return;
    card.classList.add('flipped');
    document.getElementById('rating-buttons').style.display = '';
    document.getElementById('flip-hint').style.display = 'none';
  }

  rateCard(rating) {
    const word = this.reviewQueue[this.reviewIndex];

    // Find the word in main data and update
    const idx = this.data.words.findIndex(w => w.id === word.id);
    if (idx !== -1) {
      this.data.words[idx].sm2 = SM2.review(word.sm2, rating);
    }

    // If "Again", re-add to end of queue
    if (rating < 3) {
      this.reviewQueue.push({ ...this.data.words[idx] });
    }

    this.data.stats.reviewedToday++;
    this.reviewedThisSession++;
    Store.save(this.data);
    this.updateSidebarStats();

    this.reviewIndex++;
    this.showCard();
  }

  // ---- PDF Import ----

  async handlePDF(file) {
    try {
      const pairs = await PDFParser.parse(file);
      if (pairs.length === 0) {
        alert('No word pairs found in the PDF. Make sure words are formatted as:\nSpanish - English (one pair per line)');
        return;
      }
      this.pendingImport = pairs;
      this.renderImportPreview(pairs);
    } catch (err) {
      console.error('PDF parse error:', err);
      alert('Error reading PDF. Please try a different file.');
    }
  }

  renderImportPreview(pairs) {
    document.getElementById('import-preview').style.display = '';
    document.getElementById('preview-count').textContent = pairs.length;

    const list = document.getElementById('preview-list');
    list.innerHTML = pairs.map(p => `
      <div class="preview-item">
        <span class="preview-spanish">${this.escapeHtml(p.spanish)}</span>
        <span class="preview-english">${this.escapeHtml(p.english)}</span>
      </div>
    `).join('');
  }

  confirmImport() {
    let added = 0;
    for (const pair of this.pendingImport) {
      if (!this.data.words.some(w =>
        w.spanish.toLowerCase() === pair.spanish.toLowerCase()
      )) {
        this.data.words.push({
          id: this.generateId(),
          spanish: pair.spanish,
          english: pair.english,
          example: pair.example || '',
          sm2: SM2.newCard(),
          createdAt: Date.now()
        });
        added++;
      }
    }

    Store.save(this.data);
    this.updateSidebarStats();
    this.pendingImport = [];
    document.getElementById('import-preview').style.display = 'none';

    alert(`Imported ${added} new words! (${this.pendingImport.length > added ? `${this.pendingImport.length - added} duplicates skipped` : 'no duplicates'})`);
  }

  cancelImport() {
    this.pendingImport = [];
    document.getElementById('import-preview').style.display = 'none';
  }

  // ---- Add Words ----

  addWord(spanish, english, example = '') {
    if (!spanish || !english) return;

    if (this.data.words.some(w => w.spanish.toLowerCase() === spanish.toLowerCase())) {
      this.showFeedback('Word already exists!', 'error');
      return;
    }

    this.data.words.push({
      id: this.generateId(),
      spanish,
      english,
      example,
      sm2: SM2.newCard(),
      createdAt: Date.now()
    });

    Store.save(this.data);
    this.updateSidebarStats();

    document.getElementById('add-spanish').value = '';
    document.getElementById('add-english').value = '';
    document.getElementById('add-example').value = '';
    document.getElementById('add-spanish').focus();

    this.showFeedback(`Added "${spanish}" - "${english}"`, 'success');
  }

  bulkAdd() {
    const input = document.getElementById('bulk-input').value.trim();
    if (!input) return;

    const lines = input.split('\n').filter(l => l.trim());
    let added = 0;

    for (const line of lines) {
      const parts = line.split(/\s*[-–—|,\t]\s*/);
      if (parts.length >= 2) {
        const spanish = parts[0].trim();
        const english = parts.slice(1).join(', ').trim();
        if (spanish && english && !this.data.words.some(w =>
          w.spanish.toLowerCase() === spanish.toLowerCase()
        )) {
          this.data.words.push({
            id: this.generateId(),
            spanish,
            english,
            example: '',
            sm2: SM2.newCard(),
            createdAt: Date.now()
          });
          added++;
        }
      }
    }

    Store.save(this.data);
    this.updateSidebarStats();
    document.getElementById('bulk-input').value = '';
    this.showFeedback(`Added ${added} words!`, 'success');
  }

  showFeedback(msg, type) {
    const el = document.getElementById('add-feedback');
    el.textContent = msg;
    el.className = `feedback ${type}`;
    el.style.display = '';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
  }

  // ---- Browse ----

  renderBrowse() {
    const search = document.getElementById('browse-search').value.toLowerCase();
    const filter = document.getElementById('browse-filter').value;

    let words = [...this.data.words];

    if (search) {
      words = words.filter(w =>
        w.spanish.toLowerCase().includes(search) ||
        w.english.toLowerCase().includes(search)
      );
    }

    if (filter !== 'all') {
      words = words.filter(w => SM2.getStatus(w.sm2) === (filter === 'learned' ? 'learned' : filter === 'learning' ? 'learning' : 'new'));
    }

    // Sort: due first, then alphabetical
    words.sort((a, b) => a.spanish.localeCompare(b.spanish));

    const list = document.getElementById('browse-list');
    if (words.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>No words found. Import a PDF or add words manually!</p></div>';
      return;
    }

    list.innerHTML = words.map(w => {
      const status = SM2.getStatus(w.sm2);
      const dueText = SM2.isDue(w.sm2) ? 'Due now' : `Due ${this.formatDueDate(w.sm2.dueDate)}`;

      return `
        <div class="word-item">
          <div class="word-item-text">
            <div class="word-item-spanish">${this.escapeHtml(w.spanish)}</div>
            <div class="word-item-english">${this.escapeHtml(w.english)}</div>
          </div>
          <div class="word-item-meta">
            <span class="word-item-status status-${status}">${status}</span>
            <div class="word-item-due">${dueText}</div>
          </div>
          <div class="word-item-actions">
            <button class="word-delete-btn" data-id="${w.id}">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind delete buttons
    list.querySelectorAll('.word-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this word?')) {
          this.data.words = this.data.words.filter(w => w.id !== btn.dataset.id);
          Store.save(this.data);
          this.updateSidebarStats();
          this.renderBrowse();
        }
      });
    });
  }

  // ---- Charts ----

  renderCharts() {
    const levels = [
      { id: 'A1', name: 'Beginner', words: 500, color: '#e17055', desc: 'Basic greetings, simple phrases, and essential vocabulary for everyday survival.' },
      { id: 'A2', name: 'Elementary', words: 1000, color: '#fdcb6e', desc: 'Routine tasks, simple descriptions, and basic conversations about familiar topics.' },
      { id: 'B1', name: 'Intermediate', words: 2000, color: '#00b894', desc: 'Express opinions, describe experiences, and handle most travel situations.' },
      { id: 'B2', name: 'Upper Intermediate', words: 4000, color: '#74b9ff', desc: 'Discuss complex topics, understand nuance, and interact fluently with natives.' },
      { id: 'C1', name: 'Advanced', words: 8000, color: '#6c5ce7', desc: 'Understand demanding texts, express yourself spontaneously and precisely.' },
      { id: 'C2', name: 'Mastery', words: 16000, color: '#a29bfe', desc: 'Near-native fluency — understand virtually everything with ease.' },
    ];

    const learned = this.data.words.filter(w => SM2.getStatus(w.sm2) === 'learned').length;
    const learning = this.data.words.filter(w => SM2.getStatus(w.sm2) === 'learning').length;
    const total = this.data.words.length;
    const newCount = total - learned - learning;

    // Determine current level
    let currentLevel = levels[0];
    for (const lvl of levels) {
      if (learned >= lvl.words) currentLevel = lvl;
      else break;
    }

    // Find next level
    const nextIdx = levels.indexOf(currentLevel) + 1;
    const nextLevel = nextIdx < levels.length ? levels[nextIdx] : null;

    // Update badge and info
    document.getElementById('level-badge').textContent = currentLevel.id;
    document.getElementById('level-badge').style.background =
      `linear-gradient(135deg, ${currentLevel.color}, ${currentLevel.color}cc)`;
    document.getElementById('level-title').textContent = currentLevel.name;
    if (nextLevel) {
      const remaining = nextLevel.words - learned;
      document.getElementById('level-desc').textContent =
        `Learn ${remaining} more word${remaining !== 1 ? 's' : ''} to reach ${nextLevel.id}!`;
    } else {
      document.getElementById('level-desc').textContent = 'You have reached mastery level!';
    }

    // Stats row
    document.getElementById('chart-learned').textContent = learned;
    document.getElementById('chart-learning').textContent = learning;
    document.getElementById('chart-total').textContent = total;

    // Progress bar
    const maxWords = levels[levels.length - 1].words;
    const barPct = Math.min((learned / maxWords) * 100, 100);
    document.getElementById('level-bar-fill').style.width = `${barPct}%`;

    // Markers on the bar
    const markers = document.getElementById('level-markers');
    markers.innerHTML = levels.map(lvl => {
      const pct = (lvl.words / maxWords) * 100;
      return `<div class="level-marker" style="left: ${pct}%">
        <span class="level-marker-label">${lvl.id}<br>${lvl.words.toLocaleString()}</span>
      </div>`;
    }).join('');

    // Level cards grid
    const grid = document.getElementById('level-grid');
    grid.innerHTML = levels.map((lvl, i) => {
      const prevWords = i > 0 ? levels[i - 1].words : 0;
      const isCompleted = learned >= lvl.words;
      const isActive = currentLevel === lvl && !isCompleted;
      const isCurrent = currentLevel.id === lvl.id;
      const progressInLevel = Math.max(0, Math.min(learned - prevWords, lvl.words - prevWords));
      const levelRange = lvl.words - prevWords;
      const pct = isCompleted ? 100 : (isCurrent ? (progressInLevel / levelRange * 100) : 0);

      return `<div class="level-card ${isCompleted ? 'completed' : ''} ${isCurrent && !isCompleted ? 'active' : ''}">
        ${isCompleted ? '<span class="level-card-check">&#10003;</span>' : ''}
        <div class="level-card-level" style="color: ${lvl.color}">${lvl.id}</div>
        <div class="level-card-name">${lvl.name}</div>
        <div class="level-card-words"><strong>${Math.min(learned, lvl.words).toLocaleString()}</strong> / ${lvl.words.toLocaleString()}</div>
        <div class="level-card-progress">
          <div class="level-card-progress-fill" style="width: ${pct}%; background: ${lvl.color}"></div>
        </div>
      </div>`;
    }).join('');

    // Donut chart
    this.renderDonutChart(newCount, learning, learned);
  }

  renderDonutChart(newCount, learning, learned) {
    const canvas = document.getElementById('donut-chart');
    const ctx = canvas.getContext('2d');
    const total = newCount + learning + learned;
    const size = 200;
    const center = size / 2;
    const outerR = 90;
    const innerR = 55;

    ctx.clearRect(0, 0, size, size);

    const segments = [
      { label: 'New', value: newCount, color: '#74b9ff' },
      { label: 'Learning', value: learning, color: '#fdcb6e' },
      { label: 'Learned', value: learned, color: '#00b894' },
    ];

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(center, center, outerR, 0, Math.PI * 2);
      ctx.arc(center, center, innerR, 0, Math.PI * 2, true);
      ctx.fillStyle = '#242736';
      ctx.fill();
    } else {
      let startAngle = -Math.PI / 2;
      for (const seg of segments) {
        const sweep = (seg.value / total) * Math.PI * 2;
        if (sweep === 0) continue;
        ctx.beginPath();
        ctx.arc(center, center, outerR, startAngle, startAngle + sweep);
        ctx.arc(center, center, innerR, startAngle + sweep, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        startAngle += sweep;
      }
    }

    // Center text
    ctx.fillStyle = '#e8e9ed';
    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toLocaleString(), center, center - 8);
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillStyle = '#8b8fa3';
    ctx.fillText('total words', center, center + 14);

    // Legend
    const legend = document.getElementById('donut-legend');
    legend.innerHTML = segments.map(seg => {
      const pct = total > 0 ? Math.round(seg.value / total * 100) : 0;
      return `<div class="donut-legend-item">
        <span class="donut-legend-color" style="background: ${seg.color}"></span>
        <span class="donut-legend-label">${seg.label}</span>
        <span class="donut-legend-value">${seg.value.toLocaleString()} (${pct}%)</span>
      </div>`;
    }).join('');
  }

  formatDueDate(timestamp) {
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `in ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `in ${hours}h`;
    const days = Math.floor(hours / 24);
    return `in ${days}d`;
  }

  // ---- Study Time ----

  addStudySession(minutes) {
    const hours = minutes / 60;
    this.data.studyTime.totalHours = +(this.data.studyTime.totalHours + hours).toFixed(2);
    this.data.studyTime.sessions.push({ date: Date.now(), hours });
    // Keep only last 200 sessions to avoid bloat
    if (this.data.studyTime.sessions.length > 200) {
      this.data.studyTime.sessions = this.data.studyTime.sessions.slice(-200);
    }
    Store.save(this.data);
    this.renderStudyTime();
  }

  getCurrentLevel(totalHours) {
    for (const lvl of CEFR_LEVELS) {
      if (totalHours >= lvl.min && totalHours < lvl.max) return lvl;
    }
    return CEFR_LEVELS[CEFR_LEVELS.length - 1];
  }

  renderStudyTime() {
    const st = this.data.studyTime;
    const total = st.totalHours;

    // Total
    document.getElementById('study-total-hours').textContent = total.toFixed(1);

    // Build per-day totals (last 7 days, including today)
    const dayMs = 24 * 60 * 60 * 1000;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfToday.getTime() - i * dayMs;
      const dayEnd = dayStart + dayMs;
      const hours = st.sessions
        .filter(s => s.date >= dayStart && s.date < dayEnd)
        .reduce((sum, s) => sum + s.hours, 0);
      days.push({ start: dayStart, hours });
    }

    // Today
    const todayHours = days[days.length - 1].hours;
    document.getElementById('study-today-hours').textContent = todayHours.toFixed(1);
    const todayPct = Math.min((todayHours / 2) * 100, 100);
    document.getElementById('study-today-bar-fill').style.width = `${todayPct}%`;
    const todayStatus = document.getElementById('study-today-status');
    if (todayHours >= 2) {
      todayStatus.textContent = '🎯 Daily goal hit!';
      todayStatus.className = 'study-week-status hit';
    } else {
      const remaining = +(2 - todayHours).toFixed(1);
      todayStatus.textContent = `${remaining} hr to go today`;
      todayStatus.className = 'study-week-status';
    }

    // Weekly progress (sum of last 7 days)
    const weekHours = days.reduce((sum, d) => sum + d.hours, 0);
    const weekRounded = +weekHours.toFixed(1);
    document.getElementById('study-week-hours').textContent = weekRounded;
    const weekPct = Math.min((weekHours / 6) * 100, 100);
    document.getElementById('study-week-bar-fill').style.width = `${weekPct}%`;
    const weekStatus = document.getElementById('study-week-status');
    if (weekHours >= 6) {
      weekStatus.textContent = '🎯 Goal hit! Keep going.';
      weekStatus.className = 'study-week-status hit';
    } else {
      const remaining = +(6 - weekHours).toFixed(1);
      weekStatus.textContent = `${remaining} hr to go this week`;
      weekStatus.className = 'study-week-status';
    }

    // Daily strip (last 7 days)
    const strip = document.getElementById('study-daily-strip');
    strip.innerHTML = days.map((d, idx) => {
      const dt = new Date(d.start);
      const dayLabel = idx === days.length - 1 ? 'Today' : dt.toLocaleDateString('en', { weekday: 'short' });
      const hit = d.hours >= 2;
      const pct = Math.min((d.hours / 2) * 100, 100);
      return `
        <div class="study-day ${hit ? 'hit' : ''} ${idx === days.length - 1 ? 'today' : ''}">
          <div class="study-day-label">${dayLabel}</div>
          <div class="study-day-bar"><div class="study-day-bar-fill" style="height:${pct}%"></div></div>
          <div class="study-day-hrs">${d.hours.toFixed(1)}h</div>
          <div class="study-day-check">${hit ? '✓' : ''}</div>
        </div>
      `;
    }).join('');

    // Daily streak — count consecutive days hitting goal, ending today (or yesterday if today not yet)
    let streak = 0;
    // Walk backwards from today
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].hours >= 2) {
        streak++;
      } else if (i === days.length - 1 && days[i].hours < 2) {
        // Today not yet hit — don't break streak; check yesterday onward
        continue;
      } else {
        break;
      }
    }
    // If today wasn't hit but was counted as "continue", subtract it
    if (days[days.length - 1].hours < 2 && streak > 0) {
      // streak was inflated by skipping today; recount from yesterday
      streak = 0;
      for (let i = days.length - 2; i >= 0; i--) {
        if (days[i].hours >= 2) streak++;
        else break;
      }
    }
    document.getElementById('study-daily-streak').textContent = streak;

    // CEFR level
    const lvl = this.getCurrentLevel(total);
    document.getElementById('study-level-badge').textContent = lvl.code;
    document.getElementById('study-level-badge').className = `study-level-badge level-${lvl.code.toLowerCase()}`;
    document.getElementById('study-level-title').textContent = lvl.title;
    document.getElementById('study-level-desc').textContent = lvl.desc;

    // Level bar — progress within current level
    const levelRange = lvl.max - lvl.min;
    const intoLevel = total - lvl.min;
    const levelPct = Math.min((intoLevel / levelRange) * 100, 100);
    document.getElementById('study-level-bar-fill').style.width = `${levelPct}%`;
    const nextLvl = CEFR_LEVELS[CEFR_LEVELS.indexOf(lvl) + 1];
    const barLabel = document.getElementById('study-level-bar-label');
    if (nextLvl) {
      const toGo = +(lvl.max - total).toFixed(1);
      barLabel.textContent = `${toGo} hr to ${nextLvl.code}`;
    } else {
      barLabel.textContent = 'Mastery achieved!';
    }

    // Milestones row
    const milestones = document.getElementById('study-level-milestones');
    milestones.innerHTML = CEFR_LEVELS.map(l => {
      const reached = total >= l.min;
      const current = l === lvl;
      return `
        <div class="study-milestone ${reached ? 'reached' : ''} ${current ? 'current' : ''}">
          <div class="study-milestone-dot level-${l.code.toLowerCase()}">${l.code}</div>
          <div class="study-milestone-hrs">${l.min}h</div>
        </div>
      `;
    }).join('');

    // Recent sessions (last 10)
    const list = document.getElementById('study-history-list');
    const recent = [...st.sessions].slice(-10).reverse();
    if (recent.length === 0) {
      list.innerHTML = '<p class="study-empty">No sessions logged yet. Add your first session above!</p>';
    } else {
      list.innerHTML = recent.map(s => {
        const d = new Date(s.date);
        const dateStr = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        const timeStr = d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
        const mins = Math.round(s.hours * 60);
        const display = mins >= 60 ? `${(s.hours).toFixed(1)} hr` : `${mins} min`;
        return `
          <div class="study-history-item">
            <span class="study-history-date">${dateStr} · ${timeStr}</span>
            <span class="study-history-hours">${display}</span>
          </div>
        `;
      }).join('');
    }
  }

  // ---- Utilities ----

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
