(() => {
  const encoded = document.getElementById("paper-data").textContent.trim();
  const bytes = Uint8Array.from(atob(encoded), (character) =>
    character.charCodeAt(0),
  );
  const paper = JSON.parse(new TextDecoder().decode(bytes));
  const root = document.getElementById("view-root");
  const submitShell = document.getElementById("submit-exam");
  const latestTop = document.getElementById("review-latest-top");
  const homeLink = document.getElementById("home-link");
  const key = storageKey(paper.id);
  let mode = "active";
  let timerId = null;
  let storageAvailable = true;
  let state = { active: null, latest: null };

  homeLink.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  function probeStorage() {
    try {
      const probe = `${key}:probe`;
      localStorage.setItem(probe, "1");
      localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  function loadState() {
    const raw = localStorage.getItem(key);
    if (!raw) return { active: null, latest: null };
    try {
      return sanitizeState(JSON.parse(raw), paper.questions.length);
    } catch {
      return { active: null, latest: null };
    }
  }

  function persist() {
    localStorage.setItem(key, JSON.stringify(state));
  }

  function ensureAttempt() {
    state = resolveExpiredAttempt(state, paper.questions, Date.now());
    if (!state.active && !state.latest) {
      state = startNewAttempt(state, Date.now(), paper.questions.length);
    }
    persist();
    mode = state.active ? "active" : "result";
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours, minutes, secs]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours ? `${hours} घंटा ` : ""}${minutes} मिनट`;
  }

  function optionById(question, id) {
    return question.options.find((option) => option.id === id);
  }

  function statusFor(number) {
    const answered = Boolean(state.active.answers[number]);
    const reviewed = state.active.review.includes(number);
    return {
      answered,
      reviewed,
      classes: [
        answered ? "answered" : "",
        reviewed ? "review" : "",
        state.active.currentQuestion === number ? "current" : "",
      ]
        .filter(Boolean)
        .join(" "),
    };
  }

  function jumpTo(number) {
    state.active = setCurrentQuestion(state.active, number);
    persist();
    renderActive();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nearbyNumbers(current) {
    const count = window.innerWidth < 720 ? 4 : 5;
    const maxStart = Math.max(1, paper.questions.length - count + 1);
    const start = Math.min(Math.max(1, current - 2), maxStart);
    return Array.from({ length: count }, (_, index) => start + index);
  }

  function renderActive() {
    document.body.dataset.answerMode = "locked";
    clearInterval(timerId);
    latestTop.hidden = !state.latest;
    latestTop.onclick = () => {
      mode = "review";
      render();
    };

    const attempt = state.active;
    const current = paper.questions[attempt.currentQuestion - 1];
    const answeredCount = Object.keys(attempt.answers).length;
    const remainingCount = paper.questions.length - answeredCount;
    const reviewCount = attempt.review.length;
    const isReviewed = attempt.review.includes(current.number);
    const selected = attempt.answers[current.number] ?? "";
    const canSubmit = canManualSubmit(attempt, paper.questions.length);
    const near = nearbyNumbers(current.number);

    root.innerHTML = `
      <section class="timer-panel" aria-label="परीक्षा स्थिति">
        <div class="timer-main">
          <div class="timer-label">समय शेष</div>
          <div id="timer" class="timer" aria-label="शेष समय"></div>
        </div>
        <div class="status-grid">
          <div class="status-item answered"><span class="stat-label">उत्तर दिए</span><strong class="stat-number">${answeredCount}</strong></div>
          <div class="status-item remaining"><span class="stat-label">शेष</span><strong class="stat-number">${remainingCount}</strong></div>
          <div class="status-item reviewed"><span class="stat-label">समीक्षा</span><strong class="stat-number">${reviewCount}</strong></div>
        </div>
      </section>
      <div class="section-bar">${current.section}</div>
      <nav class="nearby-nav" aria-label="पास के प्रश्न">
        <button id="near-prev" type="button" aria-label="पिछला प्रश्न" ${current.number === 1 ? "disabled" : ""}>‹</button>
        <div class="nearby-numbers">
          ${near
            .map((number) => {
              const status = statusFor(number);
              return `<button type="button" class="number-button ${status.classes}" data-jump="${number}" aria-label="प्रश्न ${number}${status.answered ? ", उत्तर दिया" : ", उत्तर नहीं दिया"}${status.reviewed ? ", समीक्षा हेतु" : ""}">${number}</button>`;
            })
            .join("")}
        </div>
        <button id="open-palette" class="open-palette" type="button">सभी प्रश्न</button>
      </nav>
      <section class="question-area">
        <div class="question-meta">
          <h2>प्रश्न ${current.number}</h2>
          <span>150 में से ${current.number}</span>
        </div>
        ${current.passage ? `<div class="passage">${current.passage}</div>` : ""}
        <p class="question-text">${current.text}</p>
        <fieldset class="options">
          <legend class="visually-hidden">एक विकल्प चुनें</legend>
          ${current.options
            .map(
              (option) => `
                <label class="option-row ${selected === option.id ? "selected" : ""}">
                  <input type="radio" name="answer" value="${option.id}" ${selected === option.id ? "checked" : ""}>
                  <span class="option-label" aria-hidden="true">${option.label}</span>
                  <span class="option-text">${option.text}</span>
                </label>`,
            )
            .join("")}
        </fieldset>
      </section>
      <div class="submit-row">
        <button id="submit-exam-live" type="button" ${canSubmit ? "" : "disabled"}>परीक्षा जमा करें${canSubmit ? "" : ` (${remainingCount} शेष)`}</button>
      </div>
      <nav class="bottom-actions" aria-label="प्रश्न नेविगेशन">
        <button id="previous-question" class="secondary" type="button" ${current.number === 1 ? "disabled" : ""}>पिछला</button>
        <button id="toggle-review" class="review-action" type="button">${isReviewed ? "चिह्न हटाएँ" : "समीक्षा"}</button>
        <button id="next-question" class="primary" type="button">${current.number === paper.questions.length ? "उत्तर सहेजें" : "सहेजें और अगला"}</button>
      </nav>
      <dialog id="palette-dialog">
        <div class="dialog-header"><h2>सभी प्रश्न</h2><button id="close-palette" class="dialog-close" type="button">बंद करें</button></div>
        <div class="legend"><span class="lg-current">वर्तमान</span><span class="lg-answered">उत्तर दिया</span><span class="lg-review">समीक्षा हेतु</span><span>उत्तर नहीं दिया</span></div>
        <div class="palette-grid">
          ${paper.questions
            .map((question) => {
              const status = statusFor(question.number);
              return `<button type="button" class="palette-button ${status.classes}" data-palette-jump="${question.number}" aria-label="प्रश्न ${question.number}">${question.number}</button>`;
            })
            .join("")}
        </div>
      </dialog>`;

    const timer = document.getElementById("timer");
    function tick() {
      const seconds = remainingSeconds(state.active, Date.now());
      timer.textContent = formatTime(seconds);
      timer.classList.toggle("urgent", seconds <= 300);
      if (seconds === 0) {
        clearInterval(timerId);
        state = resolveExpiredAttempt(state, paper.questions, Date.now());
        persist();
        mode = "result";
        render();
      }
    }
    tick();
    timerId = window.setInterval(tick, 1000);

    root.querySelectorAll('input[name="answer"]').forEach((input) => {
      input.addEventListener("change", (event) => {
        state.active = selectAnswer(
          state.active,
          current.number,
          event.target.value,
        );
        persist();
        renderActive();
      });
    });

    root.querySelectorAll("[data-jump]").forEach((button) => {
      button.addEventListener("click", () => jumpTo(Number(button.dataset.jump)));
    });

    document.getElementById("near-prev").onclick = () =>
      jumpTo(current.number - 1);
    document.getElementById("previous-question").onclick = () =>
      jumpTo(current.number - 1);
    document.getElementById("next-question").onclick = () =>
      jumpTo(Math.min(current.number + 1, paper.questions.length));
    document.getElementById("toggle-review").onclick = () => {
      state.active = toggleReview(state.active, current.number);
      persist();
      renderActive();
    };

    const dialog = document.getElementById("palette-dialog");
    document.getElementById("open-palette").onclick = () => dialog.showModal();
    document.getElementById("close-palette").onclick = () => dialog.close();
    root.querySelectorAll("[data-palette-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        dialog.close();
        jumpTo(Number(button.dataset.paletteJump));
      });
    });

    document.getElementById("submit-exam-live").onclick = () => {
      if (!canManualSubmit(state.active, paper.questions.length)) return;
      if (!window.confirm("सभी उत्तर जमा करें? जमा करने के बाद उत्तर बदले नहीं जा सकते।")) {
        return;
      }
      state = {
        active: null,
        latest: completeAttempt(
          state.active,
          paper.questions,
          Date.now(),
          "manual",
        ),
      };
      persist();
      mode = "result";
      render();
    };
  }

  function renderResult() {
    clearInterval(timerId);
    document.body.dataset.answerMode = "revealed";
    const latest = state.latest;
    latestTop.hidden = false;
    latestTop.onclick = () => {
      mode = "review";
      render();
    };

    root.innerHTML = `
      <section class="result-view">
        <div class="result-hero">
          <div>${latest.reason === "timeout" ? "समय पूरा - परीक्षा स्वतः जमा हुई" : "परीक्षा सफलतापूर्वक जमा हुई"}</div>
          <strong class="score">${latest.stats.score}/${latest.stats.total}</strong>
          <div>${latest.stats.percentage}% • उपयोग किया समय ${formatDuration(latest.timeUsedSeconds)}</div>
        </div>
        <div class="result-stats">
          <div class="result-stat"><span class="stat-label">सही</span><strong>${latest.stats.correct}</strong></div>
          <div class="result-stat"><span class="stat-label">गलत</span><strong>${latest.stats.incorrect}</strong></div>
          <div class="result-stat"><span class="stat-label">अनुत्तरित</span><strong>${latest.stats.unanswered}</strong></div>
        </div>
        <div class="result-actions">
          <button id="review-answers" class="primary" type="button">उत्तर और व्याख्या देखें</button>
          <button id="new-attempt" class="secondary" type="button">नया प्रयास शुरू करें</button>
          <button id="choose-paper" class="secondary" type="button">दूसरा पेपर चुनें</button>
        </div>
      </section>`;

    document.getElementById("review-answers").onclick = () => {
      mode = "review";
      render();
    };
    document.getElementById("choose-paper").onclick = () => {
      window.location.href = "index.html";
    };
    document.getElementById("new-attempt").onclick = () => {
      if (
        !window.confirm(
          "नया प्रयास शुरू करें? नवीनतम पूर्ण प्रयास समीक्षा के लिए सुरक्षित रहेगा।",
        )
      ) {
        return;
      }
      state = startNewAttempt(state, Date.now(), paper.questions.length);
      persist();
      mode = "active";
      render();
    };
  }

  function renderReview() {
    clearInterval(timerId);
    document.body.dataset.answerMode = "revealed";
    const latest = state.latest;
    latestTop.hidden = true;

    root.innerHTML = `
      <section class="review-view">
        <div class="review-toolbar">
          <div><strong>नवीनतम प्रयास की समीक्षा</strong><br><span class="stat-label">स्कोर ${latest.stats.score}/${latest.stats.total}</span></div>
          <button id="back-to-result" class="secondary" type="button">परिणाम पर लौटें</button>
        </div>
        <div class="review-list">
          ${paper.questions
            .map((question) => {
              const selectedId = latest.answers[question.number];
              const status = !selectedId
                ? "unanswered"
                : selectedId === question.answer
                  ? "correct"
                  : "incorrect";
              const selectedText = selectedId
                ? `${optionById(question, selectedId).label}. ${optionById(question, selectedId).text}`
                : "उत्तर नहीं दिया";
              const correct = optionById(question, question.answer);
              return `
                <article class="review-card ${status}">
                  <h3>प्रश्न ${question.number} • ${status === "correct" ? "सही" : status === "incorrect" ? "गलत" : "अनुत्तरित"}</h3>
                  <div>${question.text}</div>
                  <p class="answer-line"><strong>आपका उत्तर:</strong> ${selectedText}</p>
                  <p class="answer-line"><strong>सही उत्तर:</strong> ${correct.label}. ${correct.text}</p>
                  <div class="answer-explanation"><strong>व्याख्या:</strong> ${question.explanation}</div>
                </article>`;
            })
            .join("")}
        </div>
      </section>`;

    document.getElementById("back-to-result").onclick = () => {
      mode = "result";
      render();
    };
  }

  function renderStorageError() {
    latestTop.hidden = true;
    root.innerHTML = `
      <section class="storage-error">
        <div class="message">
          <h2>ब्राउज़र में प्रगति सुरक्षित नहीं हो सकती</h2>
          <p>इस पेपर को सामान्य ब्राउज़र टैब में खोलें और निजी/इन्कॉग्निटो मोड बंद रखें। सुरक्षित स्टोरेज के बिना परीक्षा शुरू नहीं की गई है।</p>
          <button class="primary" type="button" onclick="location.reload()">दोबारा जाँचें</button>
        </div>
      </section>`;
  }

  function render() {
    submitShell.hidden = true;
    if (!storageAvailable) return renderStorageError();
    if (mode === "active" && state.active) return renderActive();
    if (mode === "review" && state.latest) return renderReview();
    return renderResult();
  }

  storageAvailable = probeStorage();
  if (storageAvailable) {
    state = loadState();
    ensureAttempt();
  }
  render();
})();
