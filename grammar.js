// ============================================================
// Grammar Module - Exercises, Speed Drills, and Cheat Sheets
// ============================================================

class GrammarModule {
  constructor(app) {
    this.app = app;
    this.STORE_KEY = 'spanish-grammar-progress';
    this.progress = this.loadProgress();
    this.currentTier = 'A';
    this.currentTopic = 'present';
    this.currentMode = 'practice'; // 'practice' or 'speed'
    this.currentExercise = null;
    this.exerciseQueue = [];
    this.exerciseIndex = 0;
    this.sessionCorrect = 0;
    this.sessionTotal = 0;
    this.drillTimer = null;
    this.drillTimeLeft = 60;
    this.currentSheetTier = 'A';
    this.currentSheetTopic = 'present';
  }

  // ---- Persistence ----

  loadProgress() {
    try {
      const data = localStorage.getItem(this.STORE_KEY);
      return data ? JSON.parse(data) : this.defaultProgress();
    } catch { return this.defaultProgress(); }
  }

  saveProgress() {
    this.progress.lastModified = Date.now();
    localStorage.setItem(this.STORE_KEY, JSON.stringify(this.progress));
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.user) {
      FirebaseSync.pushGrammarData(this.progress);
    }
  }

  reloadProgress() {
    this.progress = this.loadProgress();
  }

  defaultProgress() {
    return {
      topics: {},
      speedDrill: { highScore: 0, history: [] },
    };
  }

  getTopicStats(topic) {
    if (!this.progress.topics[topic]) {
      this.progress.topics[topic] = { attempted: 0, correct: 0, bestStreak: 0, currentStreak: 0 };
    }
    return this.progress.topics[topic];
  }

  // ---- Exercise Generation ----

  generateConjugationExercise(tense) {
    const data = GRAMMAR_DATA;
    const useIrregular = Math.random() < 0.4;
    let verb, correctAnswer;

    const subjectIdx = Math.floor(Math.random() * 6);
    const subject = data.subjects[subjectIdx];

    if (useIrregular) {
      const irregVerb = data.irregularVerbs[Math.floor(Math.random() * data.irregularVerbs.length)];
      if (irregVerb.conjugations[tense]) {
        verb = irregVerb;
        correctAnswer = irregVerb.conjugations[tense][subjectIdx];
      }
    }

    if (!correctAnswer) {
      const types = ['ar', 'er', 'ir'];
      const type = types[Math.floor(Math.random() * 3)];
      const verbs = data.regularVerbs[type];
      verb = verbs[Math.floor(Math.random() * verbs.length)];
      if (tense === 'future' || tense === 'conditional') {
        correctAnswer = verb.infinitive + data.endings[tense][type][subjectIdx];
      } else {
        correctAnswer = verb.stem + data.endings[tense][type][subjectIdx];
      }
    }

    return {
      type: 'conjugation',
      prompt: `Conjugate <strong>${verb.infinitive}</strong> (${verb.english}) in <strong>${data.tenseNames[tense]}</strong> for <strong>${subject}</strong>`,
      answer: correctAnswer,
      verb: verb.infinitive,
      tense,
      subject,
    };
  }

  generateFillInBlankExercise(topic) {
    const pool = GRAMMAR_DATA.exercises[topic];
    if (!pool || pool.length === 0) return null;
    const ex = pool[Math.floor(Math.random() * pool.length)];
    return {
      type: 'fillInBlank',
      prompt: ex.sentence.replace('___', '<span class="blank-slot">______</span>'),
      answer: ex.answer,
      options: ex.options,
      hint: ex.hint,
      topic,
    };
  }

  generateExerciseQueue(topic, count = 10) {
    const queue = [];
    const tenses = ['present', 'preterite', 'imperfect', 'subjunctive', 'future', 'conditional'];

    for (let i = 0; i < count; i++) {
      if (tenses.includes(topic)) {
        queue.push(this.generateConjugationExercise(topic));
      } else if (GRAMMAR_DATA.exercises[topic]) {
        const ex = this.generateFillInBlankExercise(topic);
        if (ex) queue.push(ex);
      } else {
        // 'all' - mix everything
        const allTopics = [...tenses, 'serVsEstar', 'porVsPara', 'preteriteVsImperfect'];
        const t = allTopics[Math.floor(Math.random() * allTopics.length)];
        if (tenses.includes(t)) {
          queue.push(this.generateConjugationExercise(t));
        } else {
          const ex = this.generateFillInBlankExercise(t);
          if (ex) queue.push(ex);
        }
      }
    }
    return queue;
  }

  // ---- Answer Checking ----

  normalizeAnswer(str) {
    return str.trim().toLowerCase();
  }

  checkAnswer(userAnswer, correctAnswer) {
    const norm = this.normalizeAnswer(userAnswer);
    const correct = this.normalizeAnswer(correctAnswer);
    if (norm === correct) return true;
    // Accept without accents
    const stripAccents = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return stripAccents(norm) === stripAccents(correct);
  }

  // ---- Render: Exercises View ----

  renderExercises() {
    const container = document.getElementById('view-grammar-exercises');
    const tierData = GRAMMAR_DATA.tiers[this.currentTier];
    const topics = tierData.exerciseTopics;

    // Ensure current topic is valid for the selected tier
    if (!topics.find(t => t.id === this.currentTopic)) {
      this.currentTopic = topics[0].id;
    }

    container.innerHTML = `
      <h2>Grammar Exercises</h2>
      <div class="tier-toggle" id="exercise-tier-toggle">
        <button class="tier-btn ${this.currentTier === 'A' ? 'active tier-a' : ''}" data-tier="A">
          <span class="tier-letter">A</span>
          <span class="tier-sub">A1/A2</span>
        </button>
        <button class="tier-btn ${this.currentTier === 'B' ? 'active tier-b' : ''}" data-tier="B">
          <span class="tier-letter">B</span>
          <span class="tier-sub">B1/B2</span>
        </button>
      </div>
      <div class="topic-pills" id="exercise-topics">
        ${topics.map(t => `<button class="topic-pill ${t.id === this.currentTopic ? 'active' : ''}" data-topic="${t.id}">${t.label}</button>`).join('')}
      </div>
      <div class="mode-toggle">
        <button class="mode-btn ${this.currentMode === 'practice' ? 'active' : ''}" data-mode="practice">Practice</button>
        <button class="mode-btn ${this.currentMode === 'speed' ? 'active' : ''}" data-mode="speed">Speed Drill</button>
      </div>
      <div id="exercise-area"></div>
      <div id="exercise-stats" class="exercise-stats-panel"></div>
    `;

    this.renderExerciseStats();
    this.bindExerciseEvents();

    if (this.currentMode === 'practice') {
      this.startPractice();
    } else {
      this.renderSpeedDrillStart();
    }
  }

  bindExerciseEvents() {
    document.getElementById('exercise-tier-toggle').addEventListener('click', e => {
      const btn = e.target.closest('.tier-btn');
      if (!btn) return;
      this.currentTier = btn.dataset.tier;
      if (this.drillTimer) { clearInterval(this.drillTimer); this.drillTimer = null; }
      this.renderExercises();
    });

    document.getElementById('exercise-topics').addEventListener('click', e => {
      const pill = e.target.closest('.topic-pill');
      if (!pill) return;
      this.currentTopic = pill.dataset.topic;
      document.querySelectorAll('#exercise-topics .topic-pill').forEach(p => p.classList.toggle('active', p.dataset.topic === this.currentTopic));
      if (this.drillTimer) { clearInterval(this.drillTimer); this.drillTimer = null; }
      if (this.currentMode === 'practice') this.startPractice();
      else this.renderSpeedDrillStart();
      this.renderExerciseStats();
    });

    document.querySelector('.mode-toggle').addEventListener('click', e => {
      const btn = e.target.closest('.mode-btn');
      if (!btn) return;
      this.currentMode = btn.dataset.mode;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === this.currentMode));
      if (this.drillTimer) { clearInterval(this.drillTimer); this.drillTimer = null; }
      if (this.currentMode === 'practice') this.startPractice();
      else this.renderSpeedDrillStart();
    });
  }

  renderExerciseStats() {
    const stats = this.getTopicStats(this.currentTopic);
    const accuracy = stats.attempted > 0 ? Math.round(stats.correct / stats.attempted * 100) : 0;
    const el = document.getElementById('exercise-stats');
    if (!el) return;
    el.innerHTML = `
      <div class="ex-stat"><span class="ex-stat-num">${stats.attempted}</span><span class="ex-stat-label">Attempted</span></div>
      <div class="ex-stat"><span class="ex-stat-num">${accuracy}%</span><span class="ex-stat-label">Accuracy</span></div>
      <div class="ex-stat"><span class="ex-stat-num">${stats.bestStreak}</span><span class="ex-stat-label">Best Streak</span></div>
      <div class="ex-stat"><span class="ex-stat-num">${this.progress.speedDrill.highScore}</span><span class="ex-stat-label">Speed Best</span></div>
    `;
  }

  // ---- Practice Mode ----

  startPractice() {
    this.sessionCorrect = 0;
    this.sessionTotal = 0;
    this.showNextPracticeExercise();
  }

  showNextPracticeExercise() {
    const tenses = ['present', 'preterite', 'imperfect', 'subjunctive', 'future', 'conditional'];
    let exercise;

    if (tenses.includes(this.currentTopic)) {
      exercise = this.generateConjugationExercise(this.currentTopic);
    } else if (GRAMMAR_DATA.exercises[this.currentTopic]) {
      exercise = this.generateFillInBlankExercise(this.currentTopic);
    }

    if (!exercise) return;
    this.currentExercise = exercise;

    const area = document.getElementById('exercise-area');
    area.innerHTML = `
      <div class="exercise-card">
        <div class="exercise-type-badge">${exercise.type === 'conjugation' ? 'Conjugation' : 'Fill in the Blank'}</div>
        <div class="exercise-prompt">${exercise.prompt}</div>
        ${exercise.hint ? `<div class="exercise-hint">Hint: ${exercise.hint}</div>` : ''}
        ${exercise.options
          ? `<div class="exercise-options">
              ${exercise.options.map(opt => `<button class="exercise-option-btn" data-answer="${opt}">${opt}</button>`).join('')}
            </div>`
          : `<div class="exercise-input-row">
              <input type="text" class="exercise-input" id="exercise-answer" placeholder="Type your answer..." autocomplete="off" spellcheck="false">
              <button class="btn btn-primary exercise-check-btn" id="exercise-check">Check</button>
            </div>`
        }
        <div class="exercise-feedback-area" id="exercise-feedback"></div>
        <div class="exercise-session">
          <span>Session: ${this.sessionCorrect} / ${this.sessionTotal} correct</span>
        </div>
      </div>
    `;

    if (exercise.options) {
      area.querySelectorAll('.exercise-option-btn').forEach(btn => {
        btn.addEventListener('click', () => this.submitPracticeAnswer(btn.dataset.answer));
      });
    } else {
      const input = document.getElementById('exercise-answer');
      const checkBtn = document.getElementById('exercise-check');
      input.focus();
      input.addEventListener('keydown', e => { if (e.key === 'Enter') this.submitPracticeAnswer(input.value); });
      checkBtn.addEventListener('click', () => this.submitPracticeAnswer(input.value));
    }
  }

  submitPracticeAnswer(answer) {
    if (!this.currentExercise || !answer.trim()) return;
    const correct = this.checkAnswer(answer, this.currentExercise.answer);
    this.sessionTotal++;
    if (correct) this.sessionCorrect++;

    const stats = this.getTopicStats(this.currentTopic);
    stats.attempted++;
    if (correct) {
      stats.correct++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
    } else {
      stats.currentStreak = 0;
    }
    this.saveProgress();

    const feedback = document.getElementById('exercise-feedback');
    if (correct) {
      feedback.innerHTML = `<div class="ex-feedback correct">Correct!</div>`;
    } else {
      feedback.innerHTML = `<div class="ex-feedback wrong">Incorrect — the answer is: <strong>${this.currentExercise.answer}</strong></div>`;
    }

    // Disable inputs
    document.querySelectorAll('.exercise-option-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.answer === this.currentExercise.answer) btn.classList.add('correct-option');
      if (btn.dataset.answer === answer && !correct) btn.classList.add('wrong-option');
    });
    const input = document.getElementById('exercise-answer');
    if (input) input.disabled = true;
    const checkBtn = document.getElementById('exercise-check');
    if (checkBtn) checkBtn.disabled = true;

    setTimeout(() => {
      this.showNextPracticeExercise();
      this.renderExerciseStats();
    }, correct ? 800 : 2000);
  }

  // ---- Speed Drill Mode ----

  renderSpeedDrillStart() {
    const area = document.getElementById('exercise-area');
    area.innerHTML = `
      <div class="exercise-card speed-start-card">
        <div class="speed-icon">⚡</div>
        <h3>Speed Drill</h3>
        <p>Answer as many questions as you can in 60 seconds!</p>
        <p class="speed-high-score">High Score: ${this.progress.speedDrill.highScore}</p>
        <button class="btn btn-primary speed-start-btn" id="speed-start">Start Drill</button>
      </div>
    `;
    document.getElementById('speed-start').addEventListener('click', () => this.startSpeedDrill());
  }

  startSpeedDrill() {
    this.sessionCorrect = 0;
    this.sessionTotal = 0;
    this.drillTimeLeft = 60;
    this.exerciseQueue = this.generateExerciseQueue(this.currentTopic, 100);
    this.exerciseIndex = 0;

    this.drillTimer = setInterval(() => {
      this.drillTimeLeft--;
      this.updateDrillTimer();
      if (this.drillTimeLeft <= 0) this.endSpeedDrill();
    }, 1000);

    this.showSpeedDrillExercise();
  }

  showSpeedDrillExercise() {
    if (this.exerciseIndex >= this.exerciseQueue.length) {
      this.exerciseQueue = [...this.exerciseQueue, ...this.generateExerciseQueue(this.currentTopic, 50)];
    }

    this.currentExercise = this.exerciseQueue[this.exerciseIndex];
    const ex = this.currentExercise;
    const area = document.getElementById('exercise-area');

    const timerClass = this.drillTimeLeft <= 10 ? 'timer-danger' : this.drillTimeLeft <= 30 ? 'timer-warning' : '';

    area.innerHTML = `
      <div class="exercise-card speed-card">
        <div class="speed-header">
          <div class="speed-timer ${timerClass}" id="speed-timer">${this.drillTimeLeft}s</div>
          <div class="speed-score">${this.sessionCorrect} correct</div>
        </div>
        <div class="exercise-type-badge">${ex.type === 'conjugation' ? 'Conjugation' : 'Fill in the Blank'}</div>
        <div class="exercise-prompt">${ex.prompt}</div>
        ${ex.options
          ? `<div class="exercise-options">
              ${ex.options.map(opt => `<button class="exercise-option-btn" data-answer="${opt}">${opt}</button>`).join('')}
            </div>`
          : `<div class="exercise-input-row">
              <input type="text" class="exercise-input" id="exercise-answer" placeholder="Type answer..." autocomplete="off" spellcheck="false">
            </div>`
        }
        <div class="exercise-feedback-area" id="exercise-feedback"></div>
      </div>
    `;

    if (ex.options) {
      area.querySelectorAll('.exercise-option-btn').forEach(btn => {
        btn.addEventListener('click', () => this.submitSpeedAnswer(btn.dataset.answer));
      });
    } else {
      const input = document.getElementById('exercise-answer');
      input.focus();
      input.addEventListener('keydown', e => { if (e.key === 'Enter') this.submitSpeedAnswer(input.value); });
    }
  }

  submitSpeedAnswer(answer) {
    if (!this.currentExercise || !answer.trim()) return;
    const correct = this.checkAnswer(answer, this.currentExercise.answer);
    this.sessionTotal++;
    if (correct) this.sessionCorrect++;

    const stats = this.getTopicStats(this.currentTopic);
    stats.attempted++;
    if (correct) stats.correct++;
    this.saveProgress();

    const feedback = document.getElementById('exercise-feedback');
    if (correct) {
      feedback.innerHTML = `<div class="ex-feedback correct">✓</div>`;
    } else {
      feedback.innerHTML = `<div class="ex-feedback wrong">✗ ${this.currentExercise.answer}</div>`;
    }

    this.exerciseIndex++;
    setTimeout(() => this.showSpeedDrillExercise(), correct ? 300 : 1000);
  }

  updateDrillTimer() {
    const el = document.getElementById('speed-timer');
    if (!el) return;
    el.textContent = `${this.drillTimeLeft}s`;
    el.className = 'speed-timer' + (this.drillTimeLeft <= 10 ? ' timer-danger' : this.drillTimeLeft <= 30 ? ' timer-warning' : '');
  }

  endSpeedDrill() {
    clearInterval(this.drillTimer);
    this.drillTimer = null;

    if (this.sessionCorrect > this.progress.speedDrill.highScore) {
      this.progress.speedDrill.highScore = this.sessionCorrect;
    }
    this.progress.speedDrill.history.push({
      date: Date.now(),
      score: this.sessionCorrect,
      total: this.sessionTotal,
      topic: this.currentTopic,
    });
    this.saveProgress();

    const accuracy = this.sessionTotal > 0 ? Math.round(this.sessionCorrect / this.sessionTotal * 100) : 0;
    const area = document.getElementById('exercise-area');
    area.innerHTML = `
      <div class="exercise-card speed-results">
        <div class="speed-icon">⚡</div>
        <h3>Time's Up!</h3>
        <div class="speed-results-grid">
          <div class="speed-result-item">
            <span class="speed-result-num">${this.sessionCorrect}</span>
            <span class="speed-result-label">Correct</span>
          </div>
          <div class="speed-result-item">
            <span class="speed-result-num">${this.sessionTotal}</span>
            <span class="speed-result-label">Attempted</span>
          </div>
          <div class="speed-result-item">
            <span class="speed-result-num">${accuracy}%</span>
            <span class="speed-result-label">Accuracy</span>
          </div>
          <div class="speed-result-item">
            <span class="speed-result-num">${this.progress.speedDrill.highScore}</span>
            <span class="speed-result-label">High Score</span>
          </div>
        </div>
        ${this.sessionCorrect >= this.progress.speedDrill.highScore ? '<div class="new-high-score">New High Score!</div>' : ''}
        <button class="btn btn-primary speed-start-btn" id="speed-restart">Try Again</button>
      </div>
    `;
    document.getElementById('speed-restart').addEventListener('click', () => this.startSpeedDrill());
    this.renderExerciseStats();
  }

  // ---- Render: Cheat Sheets View ----

  renderCheatSheets() {
    const container = document.getElementById('view-grammar-sheets');
    const tierData = GRAMMAR_DATA.tiers[this.currentSheetTier];
    const topics = tierData.sheetTopics;

    // Ensure current topic is valid for the selected tier
    if (!topics.find(t => t.id === this.currentSheetTopic)) {
      this.currentSheetTopic = topics[0].id;
    }

    container.innerHTML = `
      <h2>Grammar Cheat Sheets</h2>
      <div class="tier-toggle" id="sheet-tier-toggle">
        <button class="tier-btn ${this.currentSheetTier === 'A' ? 'active tier-a' : ''}" data-tier="A">
          <span class="tier-letter">A</span>
          <span class="tier-sub">A1/A2</span>
        </button>
        <button class="tier-btn ${this.currentSheetTier === 'B' ? 'active tier-b' : ''}" data-tier="B">
          <span class="tier-letter">B</span>
          <span class="tier-sub">B1/B2</span>
        </button>
      </div>
      <div class="topic-pills" id="sheet-topics">
        ${topics.map(t => `<button class="topic-pill ${t.id === this.currentSheetTopic ? 'active' : ''}" data-topic="${t.id}">${t.label}</button>`).join('')}
      </div>
      <div id="sheet-content"></div>
    `;

    document.getElementById('sheet-tier-toggle').addEventListener('click', e => {
      const btn = e.target.closest('.tier-btn');
      if (!btn) return;
      this.currentSheetTier = btn.dataset.tier;
      this.renderCheatSheets();
    });

    document.getElementById('sheet-topics').addEventListener('click', e => {
      const pill = e.target.closest('.topic-pill');
      if (!pill) return;
      this.currentSheetTopic = pill.dataset.topic;
      document.querySelectorAll('#sheet-topics .topic-pill').forEach(p => p.classList.toggle('active', p.dataset.topic === this.currentSheetTopic));
      this.renderSheetContent();
    });

    this.renderSheetContent();
  }

  renderSheetContent() {
    const content = document.getElementById('sheet-content');
    const topic = this.currentSheetTopic;
    const tenses = ['present', 'preterite', 'imperfect', 'subjunctive', 'future', 'conditional'];

    if (tenses.includes(topic)) {
      content.innerHTML = this.renderConjugationSheet(topic);
    } else if (GRAMMAR_DATA.rules[topic]) {
      content.innerHTML = this.renderRuleSheet(topic);
    }
  }

  renderConjugationSheet(tense) {
    const data = GRAMMAR_DATA;
    const tenseName = data.tenseNames[tense];
    let html = `<div class="sheet-section">`;

    // Regular verb tables
    const usesInfinitiveStem = (tense === 'future' || tense === 'conditional');
    ['ar', 'er', 'ir'].forEach(type => {
      const endings = data.endings[tense][type];
      const exampleVerb = data.regularVerbs[type][0];
      const stem = usesInfinitiveStem ? exampleVerb.infinitive : exampleVerb.stem;
      html += `
        <div class="conj-table-wrapper">
          <h3>Regular -${type.toUpperCase()} Verbs — ${tenseName}</h3>
          <p class="conj-example-verb">Example: ${exampleVerb.infinitive} (${exampleVerb.english})</p>
          <table class="grammar-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Ending</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              ${data.subjects.map((subj, i) => `
                <tr>
                  <td>${subj}</td>
                  <td class="ending-cell">${usesInfinitiveStem ? '+' : '-'}${endings[i]}</td>
                  <td><strong>${stem}${endings[i]}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    });

    // Irregular verb tables
    html += `<h3 class="irregulars-heading">Key Irregular Verbs — ${tenseName}</h3>`;
    html += `<div class="irregular-tables-grid">`;

    data.irregularVerbs.forEach(verb => {
      if (!verb.conjugations[tense]) return;
      const conj = verb.conjugations[tense];
      html += `
        <div class="irregular-table-card">
          <h4>${verb.infinitive} <span class="verb-english">(${verb.english})</span></h4>
          <table class="grammar-table grammar-table-compact">
            <tbody>
              ${data.subjectsShort.map((subj, i) => `
                <tr>
                  <td class="subj-cell">${subj}</td>
                  <td><strong>${conj[i]}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    });

    html += `</div></div>`;
    return html;
  }

  renderRuleSheet(ruleKey) {
    const rule = GRAMMAR_DATA.rules[ruleKey];
    let html = `<div class="sheet-section">`;

    html += `<div class="rule-header-card">
      <h3>${rule.title}</h3>
      <p>${rule.description}</p>
    </div>`;

    rule.sections.forEach(section => {
      html += `<div class="rule-card">`;
      html += `<h4>${section.heading}</h4>`;

      if (section.mnemonic) {
        html += `<div class="mnemonic-badge">${section.mnemonic}</div>`;
      }

      html += `<table class="grammar-table">
        <thead><tr>`;
      if (section.items[0]?.letter) html += `<th>Letter</th>`;
      html += `<th>Rule</th><th>Example</th></tr></thead><tbody>`;

      section.items.forEach(item => {
        html += `<tr>`;
        if (item.letter) html += `<td class="mnemonic-letter">${item.letter}</td>`;
        html += `<td>${item.rule}</td>`;
        html += `<td class="example-cell">${item.example}</td>`;
        html += `</tr>`;
      });

      html += `</tbody></table></div>`;
    });

    if (rule.tips) {
      html += `<div class="tips-card">
        <h4>Tips</h4>
        <ul class="tips-list">
          ${rule.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>`;
    }

    html += `</div>`;
    return html;
  }

  // ---- Event Binding (called from App) ----

  bindEvents() {
    // Grammar events are bound dynamically when views render
  }
}
