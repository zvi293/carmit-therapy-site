/* ------------------------------------------------------------------
   Contact form + thank-you modal — כרמית משה

   Submission goes to the existing Google Apps Script endpoint, which
   writes to Google Sheets. The endpoint, the payload shape and every
   anti-spam rule below are unchanged from the original inline script.

   Defence in depth against bots and accidental double sends:
     1. Honeypot field ("website") — bots fill it, humans never see it
     2. Time trap — a real person needs at least 3 seconds
     3. Cooldown — 60s between submissions (localStorage)
     4. Submit-button lock while a request is in flight
     5. Input sanitisation + length caps
     6. Phone / e-mail format validation
     7. Spam-pattern scrubbing (URLs and the usual keywords)
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var CONTACT_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbzx71JDNwocsOu3JePIEkUAB6ctUXPx49d-tqNUIfrY8QGL4KONNbXeum3BGdm5UEbM/exec";

  var MIN_FORM_DURATION_MS = 3000;
  var COOLDOWN_MS = 60000;
  var LS_KEY = "ct_last_submit";

  var form = document.getElementById("contactForm");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("formSubmitBtn");
  var timeField = document.getElementById("_t");

  /* ================= thank-you modal ================= */

  var modal = document.getElementById("thankModal");
  var openThankModal = function () {};
  var closeThankModal = function () {};

  if (modal) {
    var panel = modal.querySelector(".thank-modal__panel");
    var countdownEl = document.getElementById("thankCountdown");
    var countdownTimer = null;
    var autoCloseTimer = null;
    var previouslyFocused = null;

    var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function trapFocus(e) {
      if (e.key !== "Tab") return;
      var focusables = panel.querySelectorAll(FOCUSABLE);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function onKey(e) {
      if (e.key === "Escape") closeThankModal();
      else trapFocus(e);
    }

    openThankModal = function () {
      previouslyFocused = document.activeElement;
      modal.removeAttribute("hidden");
      modal.style.removeProperty("display");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);

      setTimeout(function () {
        var firstBtn = panel.querySelector("button[data-modal-close]");
        if (firstBtn) firstBtn.focus();
      }, 50);

      var secondsLeft = 8;
      if (countdownEl) countdownEl.textContent = String(secondsLeft);
      countdownTimer = setInterval(function () {
        secondsLeft--;
        if (countdownEl) countdownEl.textContent = String(secondsLeft);
        if (secondsLeft <= 0) clearInterval(countdownTimer);
      }, 1000);
      autoCloseTimer = setTimeout(closeThankModal, 8000);
    };

    closeThankModal = function () {
      modal.setAttribute("aria-hidden", "true");
      modal.setAttribute("hidden", "");
      modal.style.display = "none";
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
      if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
      if (previouslyFocused && previouslyFocused.focus) {
        try { previouslyFocused.focus(); } catch (e) { /* element may be gone */ }
      }
    };

    modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
      el.addEventListener("click", closeThankModal);
    });

    // Hovering the panel means the visitor is still reading — cancel autoclose.
    panel.addEventListener("mouseenter", function () {
      if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
      if (countdownEl && countdownEl.parentElement) {
        countdownEl.parentElement.style.display = "none";
      }
    });

    // Same for keyboard users who tab into it.
    panel.addEventListener("focusin", function () {
      if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
      if (countdownEl && countdownEl.parentElement) {
        countdownEl.parentElement.style.display = "none";
      }
    });

    window.openThankModal = openThankModal;
    window.closeThankModal = closeThankModal;
  }

  /* ================= form ================= */

  if (!form || !statusEl || !submitBtn) return;

  // Strip HTML tags and control characters, trim, cap length.
  function sanitize(s) {
    return String(s || "")
      .replace(/<[^>]*>/g, "")
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, 2000);
  }

  function isLikelyBotMessage(text) {
    return (
      /https?:\/\//i.test(text) ||
      /\bbtc\b|crypto|seo services|backlinks|viagra|casino/i.test(text)
    );
  }

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.classList.remove("form-status--ok", "form-status--err");
    if (type === "ok") statusEl.classList.add("form-status--ok");
    if (type === "err") statusEl.classList.add("form-status--err");
  }

  // Move focus to the field the visitor needs to fix, and describe the error
  // on the field itself so a screen reader reads it in context.
  function failField(id, msg) {
    setStatus(msg, "err");
    var el = document.getElementById(id);
    if (el) {
      el.setAttribute("aria-invalid", "true");
      el.focus();
    }
  }

  function clearInvalid() {
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });
  }

  if (timeField) timeField.value = String(Date.now());

  var inFlight = false;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (inFlight) return;
    clearInvalid();

    // 1. Honeypot — answer as if it succeeded so the bot does not retry.
    var hpEl = form.querySelector('[name="website"]');
    if (hpEl && hpEl.value.trim() !== "") {
      setStatus("ההודעה נשלחה. תודה!", "ok");
      form.reset();
      return;
    }

    // 2. Time trap
    var loadedAt = parseInt((timeField && timeField.value) || "0", 10);
    var elapsed = Date.now() - loadedAt;
    if (loadedAt === 0 || elapsed < MIN_FORM_DURATION_MS) {
      setStatus("נראה שהשליחה הייתה מהירה מדי. רעננו את הדף ונסו שוב.", "err");
      return;
    }

    // 3. Cooldown
    var lastSubmit = 0;
    try { lastSubmit = parseInt(localStorage.getItem(LS_KEY) || "0", 10); } catch (err) { /* ignore */ }
    var sinceLast = Date.now() - lastSubmit;
    if (sinceLast < COOLDOWN_MS) {
      var wait = Math.ceil((COOLDOWN_MS - sinceLast) / 1000);
      setStatus("שלחתם הודעה ממש לפני רגע - נסו שוב בעוד " + wait + " שניות.", "err");
      return;
    }

    // 4. Native constraint validation
    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus("יש שדות חסרים או לא תקינים. עדכנו ושלחו שוב.", "err");
      return;
    }

    // 5. Sanitise and validate
    var fd = new FormData(form);
    var parentName = sanitize(fd.get("parentName")).slice(0, 60);
    var childName = sanitize(fd.get("childName")).slice(0, 60);
    var phone = sanitize(fd.get("phone")).slice(0, 20);
    var email = sanitize(fd.get("email")).slice(0, 120);
    var message = sanitize(fd.get("message"));

    if (parentName.length < 2) {
      failField("parentName", "השם נראה קצר מדי. אנא הזינו שם מלא.");
      return;
    }
    if (!/^[0-9+\-\s()]{9,15}$/.test(phone)) {
      failField("phone", "מספר הטלפון לא תקין. בדקו ונסו שוב.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      failField("email", "כתובת האימייל לא תקינה. בדקו ונסו שוב.");
      return;
    }
    if (message.length < 5) {
      failField("message", "נשמח קצת יותר פרטים על מה שמעסיק אתכם.");
      return;
    }
    if (isLikelyBotMessage(message)) {
      setStatus("ההודעה נשלחה. תודה!", "ok");
      form.reset();
      return;
    }

    // 6. Lock the button for the duration of the request
    inFlight = true;
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    var labelEl = submitBtn.querySelector(".btn-label");
    var originalLabel = labelEl ? labelEl.textContent : null;
    if (labelEl) labelEl.textContent = "שולחת...";
    setStatus("שולחת...", null);

    var payload = {
      parentName: parentName,
      childName: childName,
      phone: phone,
      email: email,
      message: message,
      userAgent: navigator.userAgent.slice(0, 200),
      page: location.pathname
    };

    fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      mode: "no-cors",
      credentials: "omit"
    })
      .then(function () {
        try { localStorage.setItem(LS_KEY, String(Date.now())); } catch (err) { /* ignore */ }
        form.reset();
        if (timeField) timeField.value = String(Date.now());
        setStatus("", null);
        openThankModal();
      })
      .catch(function (err) {
        setStatus("השליחה נכשלה. נסו שוב או פנו ישירות בוואטסאפ.", "err");
        if (window.console && console.error) console.error(err);
      })
      .then(function () {
        inFlight = false;
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        if (labelEl && originalLabel) labelEl.textContent = originalLabel;
      });
  });
})();
