/* ------------------------------------------------------------------
   Accessibility settings — early boot.
   Loaded synchronously in <head> (it is tiny) so that a returning
   visitor's saved preferences are applied to <html> BEFORE the first
   paint. Without this the page would flash in its default styling for
   a moment, which is exactly what a low-vision or photosensitive user
   does not want to see. The interactive panel itself is built later by
   js/a11y.js, which is deferred.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var STORAGE_KEY = "carmit_a11y_v1";
  var root = document.documentElement;

  var saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (e) {
    saved = {};
  }
  if (!saved || typeof saved !== "object") saved = {};

  // Whitelist: only these keys may ever reach the DOM, and only as
  // data-a11y-* attributes, so nothing from storage can inject markup.
  var ALLOWED = {
    contrast: ["high"],
    filter: ["grayscale", "invert", "saturate"],
    links: ["on"],
    headings: ["on"],
    readable: ["on"],
    spacing: ["on"],
    motion: ["off"],
    cursor: ["big"],
    guide: ["on"],
    keyboard: ["on"]
  };

  Object.keys(ALLOWED).forEach(function (key) {
    var value = saved[key];
    if (ALLOWED[key].indexOf(value) !== -1) {
      root.setAttribute("data-a11y-" + key, value);
    }
  });

  var scale = parseFloat(saved.fontScale);
  if (isFinite(scale) && scale >= 0.9 && scale <= 1.6 && scale !== 1) {
    root.setAttribute("data-a11y-font", "on");
    root.style.setProperty("--a11y-font-scale", String(scale));
  }

  // ------------------------------------------------------------------
  // Scroll-reveal gate.
  // The `.reveal` elements start at opacity 0, but ONLY when this class is
  // present. Adding it here — synchronously, in <head>, before the first
  // paint — means the hidden state exists exclusively when this script ran
  // AND the browser can actually drive the animation. If the script is
  // blocked, errors out, or the visitor asked for reduced motion, the
  // content simply renders normally instead of staying invisible.
  // ------------------------------------------------------------------
  var canAnimate =
    "IntersectionObserver" in window &&
    root.getAttribute("data-a11y-motion") !== "off" &&
    !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  if (canAnimate) root.classList.add("js-reveal");

  // Expose for js/a11y.js so both files agree on the key and the schema.
  window.__A11Y__ = { key: STORAGE_KEY, allowed: ALLOWED, state: saved };
})();
