/* ------------------------------------------------------------------
   Accessibility widget — כרמית משה
   Self-hosted (no third-party service), no dependencies, no network
   calls. Supports the adjustments expected under the Israeli
   regulations for service accessibility (תשע"ג-2013) and ת"י 5568,
   which adopts WCAG 2.0 level AA.

   The widget itself is keyboard operable end to end:
     Alt+Shift+A  open / close the panel
     Tab          cycle inside the panel while it is open
     Esc          close and return focus to the toggle button

   Every control is a real <button> with aria-pressed, and changes are
   announced through a polite live region.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var boot = window.__A11Y__ || { key: "carmit_a11y_v1", allowed: {}, state: {} };
  var STORAGE_KEY = boot.key;
  var root = document.documentElement;

  var state = boot.state && typeof boot.state === "object" ? boot.state : {};
  var FONT_STEPS = [0.9, 1, 1.15, 1.3, 1.45, 1.6];

  /* ---------- persistence ---------- */

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* private browsing / storage full — the settings still apply to this page */
    }
  }

  function currentScale() {
    var s = parseFloat(state.fontScale);
    return isFinite(s) ? s : 1;
  }

  function applyFontScale(scale) {
    state.fontScale = scale;
    if (scale === 1) {
      root.removeAttribute("data-a11y-font");
      root.style.removeProperty("--a11y-font-scale");
    } else {
      root.setAttribute("data-a11y-font", "on");
      root.style.setProperty("--a11y-font-scale", String(scale));
    }
  }

  /* Toggle a data-a11y-<key> attribute between `value` and off. */
  function toggleMode(key, value) {
    var attr = "data-a11y-" + key;
    var isOn = root.getAttribute(attr) === value;
    if (isOn) {
      root.removeAttribute(attr);
      delete state[key];
    } else {
      root.setAttribute(attr, value);
      state[key] = value;
    }
    return !isOn;
  }

  /* ---------- markup ---------- */

  var ICON = {
    a11y: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 12 2zm9 5.2-6 1.1v3.4l2.1 9.1a1.2 1.2 0 0 1-2.3.6L12.9 14h-1.8l-1.9 7.4a1.2 1.2 0 0 1-2.3-.6L9 11.7V8.3L3 7.2a1.15 1.15 0 0 1 .4-2.26l5.9 1.06a15 15 0 0 0 5.4 0l5.9-1.06A1.15 1.15 0 0 1 21 7.2z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    contrast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" stroke="none"/></svg>',
    gray: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/></svg>',
    invert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/><path d="M12 3a9 9 0 0 0 0 18" /></svg>',
    saturate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M12 3s6 6.4 6 10.2A6 6 0 0 1 6 13.2C6 9.4 12 3 12 3z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M10 13a4.5 4.5 0 0 0 6.5.4l2.4-2.4a4.6 4.6 0 0 0-6.5-6.5l-1.4 1.4"/><path d="M14 11a4.5 4.5 0 0 0-6.5-.4L5.1 13a4.6 4.6 0 0 0 6.5 6.5L13 18.1"/></svg>',
    heading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M6 4v16M18 4v16M6 12h12"/></svg>',
    font: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 19 10 5l6 14M6.5 14h7"/><path d="M18 19V9"/></svg>',
    spacing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    motion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    cursor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M5 3v14l3.6-3.2L11 20l2.6-1-2.4-6H16z"/></svg>',
    guide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M3 12h18"/><path d="M6 8h12M6 16h12" opacity=".45"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M8 14h8"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  /* Every toggle button: [key, value, label, icon] */
  var TOGGLES_VISION = [
    ["contrast", "high", "ניגודיות גבוהה", ICON.contrast],
    ["filter", "invert", "היפוך צבעים", ICON.invert],
    ["filter", "grayscale", "גווני אפור", ICON.gray],
    ["filter", "saturate", "רוויית צבע", ICON.saturate]
  ];
  var TOGGLES_READING = [
    ["readable", "on", "פונט קריא", ICON.font],
    ["spacing", "on", "ריווח שורות", ICON.spacing],
    ["links", "on", "הדגשת קישורים", ICON.link],
    ["headings", "on", "הדגשת כותרות", ICON.heading]
  ];
  var TOGGLES_NAV = [
    ["motion", "off", "עצירת אנימציות", ICON.motion],
    ["cursor", "big", "סמן גדול", ICON.cursor],
    ["guide", "on", "קו מנחה לקריאה", ICON.guide],
    ["keyboard", "on", "ניווט מקלדת", ICON.keyboard]
  ];

  function makeToggle(def) {
    var key = def[0], value = def[1], label = def[2], icon = def[3];
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "a11y-btn";
    btn.innerHTML = icon + "<span>" + label + "</span>";
    btn.setAttribute("aria-pressed", root.getAttribute("data-a11y-" + key) === value ? "true" : "false");
    btn.addEventListener("click", function () {
      var on = toggleMode(key, value);
      save();
      // A key like `filter` holds one of several values — refresh the whole
      // group so the previously-active sibling stops looking pressed.
      syncPressed();
      announce(label + (on ? " — הופעל" : " — כובה"));
      if (key === "guide") setGuide(on);
    });
    btn.setAttribute("data-a11y-key", key);
    btn.setAttribute("data-a11y-value", value);
    return btn;
  }

  function group(title, defs) {
    var wrap = document.createElement("div");
    wrap.className = "a11y-group";
    var h = document.createElement("p");
    h.className = "a11y-group__label";
    h.textContent = title;
    var grid = document.createElement("div");
    grid.className = "a11y-grid";
    defs.forEach(function (d) { grid.appendChild(makeToggle(d)); });
    wrap.appendChild(h);
    wrap.appendChild(grid);
    return wrap;
  }

  /* ---------- build ---------- */

  // Two triggers for one panel: a compact circle in the header for wide
  // screens, and a row at the bottom of the hamburger menu for narrow ones.
  // Only one is ever visible (CSS decides), but both stay in the DOM so the
  // markup does not have to change on resize.
  function makeTrigger(kind) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "a11y-toggle a11y-toggle--" + kind;
    b.setAttribute("aria-label", "פתיחת תפריט נגישות");
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-controls", "a11yPanel");
    b.innerHTML = ICON.a11y + (kind === "menu" ? "<span>הגדרות נגישות</span>" : "");
    b.addEventListener("click", function () {
      if (isOpen()) closePanel();
      else openPanel(b);
    });
    return b;
  }

  var toggle = makeTrigger("header");
  toggle.id = "a11yToggle";
  toggle.setAttribute("accesskey", "a");

  var menuToggle = makeTrigger("menu");
  menuToggle.id = "a11yToggleMenu";

  var panel = document.createElement("div");
  panel.className = "a11y-panel";
  panel.id = "a11yPanel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "הגדרות נגישות");

  var head = document.createElement("div");
  head.className = "a11y-panel__head";
  var title = document.createElement("h2");
  title.className = "a11y-panel__title";
  title.textContent = "הגדרות נגישות";
  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "a11y-panel__close";
  closeBtn.setAttribute("aria-label", "סגירת תפריט הנגישות");
  closeBtn.innerHTML = ICON.close;
  head.appendChild(title);
  head.appendChild(closeBtn);

  /* Font size stepper */
  var fontGroup = document.createElement("div");
  fontGroup.className = "a11y-group";
  var fontLabel = document.createElement("p");
  fontLabel.className = "a11y-group__label";
  fontLabel.textContent = "גודל טקסט";
  var fontRow = document.createElement("div");
  fontRow.className = "a11y-grid";

  var fontDown = document.createElement("button");
  fontDown.type = "button";
  fontDown.className = "a11y-btn";
  fontDown.innerHTML = ICON.minus + "<span>הקטנה</span>";
  fontDown.setAttribute("aria-label", "הקטנת גודל הטקסט");

  var fontUp = document.createElement("button");
  fontUp.type = "button";
  fontUp.className = "a11y-btn";
  fontUp.innerHTML = ICON.plus + "<span>הגדלה</span>";
  fontUp.setAttribute("aria-label", "הגדלת גודל הטקסט");

  var fontReadout = document.createElement("button");
  fontReadout.type = "button";
  fontReadout.className = "a11y-btn a11y-btn--wide";
  fontReadout.setAttribute("aria-label", "החזרת גודל הטקסט לברירת המחדל");
  fontReadout.innerHTML = ICON.font + '<span>גודל נוכחי: <span class="a11y-value" id="a11yFontValue">100%</span></span>';

  fontRow.appendChild(fontDown);
  fontRow.appendChild(fontUp);
  fontRow.appendChild(fontReadout);
  fontGroup.appendChild(fontLabel);
  fontGroup.appendChild(fontRow);

  function renderFontValue() {
    var el = panel.querySelector("#a11yFontValue");
    if (el) el.textContent = Math.round(currentScale() * 100) + "%";
  }

  function stepFont(direction) {
    var idx = FONT_STEPS.indexOf(currentScale());
    if (idx === -1) idx = FONT_STEPS.indexOf(1);
    var next = Math.min(FONT_STEPS.length - 1, Math.max(0, idx + direction));
    applyFontScale(FONT_STEPS[next]);
    save();
    renderFontValue();
    announce("גודל טקסט " + Math.round(FONT_STEPS[next] * 100) + " אחוז");
  }

  fontUp.addEventListener("click", function () { stepFont(1); });
  fontDown.addEventListener("click", function () { stepFont(-1); });
  fontReadout.addEventListener("click", function () {
    applyFontScale(1);
    save();
    renderFontValue();
    announce("גודל טקסט הוחזר לברירת המחדל");
  });

  var foot = document.createElement("div");
  foot.className = "a11y-panel__foot";

  var resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "a11y-reset";
  resetBtn.textContent = "איפוס כל ההגדרות";

  var statementLink = document.createElement("a");
  statementLink.className = "a11y-statement-link";
  statementLink.href = "/accessibility.html";
  statementLink.textContent = "להצהרת הנגישות המלאה";

  var hint = document.createElement("p");
  hint.className = "a11y-hint";
  hint.textContent = "קיצור מקלדת: Alt + Shift + A";

  foot.appendChild(resetBtn);
  foot.appendChild(statementLink);
  foot.appendChild(hint);

  var live = document.createElement("div");
  live.className = "sr-only";
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");

  panel.appendChild(head);
  panel.appendChild(fontGroup);
  panel.appendChild(group("ראייה וצבע", TOGGLES_VISION));
  panel.appendChild(group("קריאה", TOGGLES_READING));
  panel.appendChild(group("ניווט ותנועה", TOGGLES_NAV));
  panel.appendChild(foot);
  panel.appendChild(live);

  // Mount the header circle next to the "קביעת שיחה" call-to-action, and the
  // menu row as the last item of the navigation list. If a page ever ships
  // without a header, fall back to the body so the widget is never lost.
  var headerCta = document.querySelector(".header-cta");
  if (headerCta) headerCta.appendChild(toggle);
  else document.body.appendChild(toggle);

  var navList = document.querySelector(".main-nav ul");
  if (navList) {
    var li = document.createElement("li");
    li.className = "a11y-nav-item";
    li.appendChild(menuToggle);
    navList.appendChild(li);
  }

  document.body.appendChild(panel);
  renderFontValue();

  /* ---------- live announcements ---------- */

  var announceTimer = null;
  function announce(text) {
    if (announceTimer) clearTimeout(announceTimer);
    live.textContent = "";
    announceTimer = setTimeout(function () { live.textContent = text; }, 60);
  }

  /* ---------- keep aria-pressed in sync with <html> ---------- */

  function syncPressed() {
    var buttons = panel.querySelectorAll(".a11y-btn[data-a11y-key]");
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      var on = root.getAttribute("data-a11y-" + b.getAttribute("data-a11y-key")) === b.getAttribute("data-a11y-value");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  /* ---------- reading guide ---------- */

  var guideEl = null;
  function onGuideMove(e) {
    if (!guideEl) return;
    var y = (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY);
    if (typeof y === "number") guideEl.style.top = y + "px";
  }
  function setGuide(on) {
    if (on && !guideEl) {
      guideEl = document.createElement("div");
      guideEl.className = "a11y-reading-guide";
      guideEl.style.top = "50%";
      guideEl.setAttribute("aria-hidden", "true");
      document.body.appendChild(guideEl);
      document.addEventListener("mousemove", onGuideMove, { passive: true });
      document.addEventListener("touchmove", onGuideMove, { passive: true });
    } else if (!on && guideEl) {
      document.removeEventListener("mousemove", onGuideMove);
      document.removeEventListener("touchmove", onGuideMove);
      guideEl.remove();
      guideEl = null;
    }
  }
  if (root.getAttribute("data-a11y-guide") === "on") setGuide(true);

  /* ---------- reset ---------- */

  resetBtn.addEventListener("click", function () {
    Object.keys(boot.allowed || {}).forEach(function (key) {
      root.removeAttribute("data-a11y-" + key);
    });
    root.removeAttribute("data-a11y-font");
    root.style.removeProperty("--a11y-font-scale");
    setGuide(false);
    state = {};
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    syncPressed();
    renderFontValue();
    announce("כל הגדרות הנגישות אופסו");
  });

  /* ---------- open / close ---------- */

  var triggers = [toggle, menuToggle];
  var openedBy = toggle;

  function setTriggerState(open) {
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].setAttribute("aria-expanded", open ? "true" : "false");
      triggers[i].setAttribute("aria-label", open ? "סגירת תפריט נגישות" : "פתיחת תפריט נגישות");
    }
  }

  // `source` is the trigger that was used, so focus can go back to it on
  // close rather than always to the header one.
  function openPanel(source) {
    openedBy = source && source.focus ? source : visibleTrigger();

    // Opened from inside the hamburger menu: close the menu first, otherwise
    // the two panels overlap on a small screen.
    var nav = document.querySelector(".main-nav");
    var navToggle = document.querySelector(".nav-toggle");
    if (nav && nav.classList.contains("open")) {
      nav.classList.remove("open");
      if (navToggle) {
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    }

    positionPanel();
    panel.hidden = false;
    setTriggerState(true);
    syncPressed();
    renderFontValue();
    closeBtn.focus();
    document.addEventListener("keydown", onPanelKey, true);
    document.addEventListener("pointerdown", onOutsideClick, true);
  }

  function closePanel(returnFocus) {
    panel.hidden = true;
    setTriggerState(false);
    document.removeEventListener("keydown", onPanelKey, true);
    document.removeEventListener("pointerdown", onOutsideClick, true);
    if (returnFocus !== false) {
      var target = openedBy && openedBy.offsetParent !== null ? openedBy : visibleTrigger();
      if (target) target.focus();
    }
  }

  // Park the panel just below the header. Measured rather than hard-coded
  // because the header shrinks once the page is scrolled, and because the
  // enlarged-text setting changes its height too.
  function positionPanel() {
    var header = document.querySelector(".site-header");
    var bottom = header ? header.getBoundingClientRect().bottom : 70;
    root.style.setProperty("--a11y-anchor-top", Math.max(8, Math.round(bottom) + 8) + "px");
  }
  window.addEventListener("resize", function () {
    if (isOpen()) positionPanel();
  }, { passive: true });
  window.addEventListener("scroll", function () {
    if (isOpen()) positionPanel();
  }, { passive: true });

  // The hidden trigger has no layout box, so this picks whichever one the
  // current breakpoint is actually showing.
  function visibleTrigger() {
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].offsetParent !== null) return triggers[i];
    }
    return toggle;
  }

  function isOpen() { return !panel.hidden; }

  function onOutsideClick(e) {
    if (panel.contains(e.target)) return;
    for (var i = 0; i < triggers.length; i++) {
      if (e.target === triggers[i] || triggers[i].contains(e.target)) return;
    }
    closePanel(false);
  }

  var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function onPanelKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closePanel();
      return;
    }
    if (e.key !== "Tab") return;
    var items = panel.querySelectorAll(FOCUSABLE);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  closeBtn.addEventListener("click", function () { closePanel(); });

  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
      e.preventDefault();
      if (isOpen()) closePanel(); else openPanel(visibleTrigger());
    }
  });

  /* Keyboard-navigation mode also turns on as soon as someone actually
     tabs through the page, so the focus ring is never missed. */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Tab") root.classList.add("using-keyboard");
  });
})();
