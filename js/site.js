/* ------------------------------------------------------------------
   Shared site behaviour — כרמית משה
   Loaded on every page with `defer`. Every block guards against its
   elements being absent, so the same file works on the home page, the
   SEO landing pages and the legal pages.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function motionDisabled() {
    return prefersReducedMotion || root.getAttribute("data-a11y-motion") === "off";
  }

  /* ---------- mobile navigation ---------- */

  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (navToggle && nav) {
    function setNav(open) {
      nav.classList.toggle("open", open);
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "סגירת תפריט" : "פתיחת תפריט");
    }

    navToggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("open"));
    });

    // Close after choosing a destination.
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (nav.classList.contains("open")) setNav(false);
      });
    });

    // Esc closes the menu and hands focus back to the button.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setNav(false);
        navToggle.focus();
      }
    });

    // Clicking outside the open menu closes it.
    document.addEventListener("pointerdown", function (e) {
      if (!nav.classList.contains("open")) return;
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
    });
  }

  /* ---------- scroll reveal ---------- */

  var revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length) {
    if (!root.classList.contains("js-reveal") || motionDisabled()) {
      // Animation is off (no observer support, or reduced motion): the CSS
      // never hid anything, but mark them anyway so any later rule agrees.
      revealElements.forEach(function (el) { el.classList.add("visible"); });
    } else {
      // Anything already inside the viewport is revealed straight away — no
      // waiting on an observer callback for above-the-fold content, and no
      // dependence on the observer firing at all.
      var pendingReveals = revealElements.length;

      function revealInView() {
        if (!pendingReveals) return;
        var h = window.innerHeight || document.documentElement.clientHeight || 0;
        var pending = document.querySelectorAll(".reveal:not(.visible)");
        pendingReveals = pending.length;
        pending.forEach(function (el) {
          var box = el.getBoundingClientRect();
          if (box.top < h * 1.15 && box.bottom > -60) {
            el.classList.add("visible");
            pendingReveals--;
          }
        });
      }

      // Exposed so the scroll handler below can use it as a belt-and-braces
      // fallback for environments where IntersectionObserver is throttled.
      window.__revealInView = revealInView;

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target); // one-shot: stop paying for it
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
      );
      revealElements.forEach(function (el) { observer.observe(el); });

      revealInView();
      window.addEventListener("load", revealInView);
      // Late layout shifts (fonts swapping in, images settling) can move an
      // element into view without a scroll event.
      setTimeout(revealInView, 1200);

      // Last resort: if after 4 seconds nothing at all became visible, the
      // observer is not working in this environment. Drop the gate entirely
      // rather than serve a blank page.
      setTimeout(function () {
        if (!document.querySelector(".reveal.visible")) {
          root.classList.remove("js-reveal");
        }
      }, 4000);

      // Reveal everything before printing, and when the page is restored
      // from the back/forward cache.
      if (window.matchMedia) {
        var printQuery = window.matchMedia("print");
        if (printQuery.addEventListener) {
          printQuery.addEventListener("change", function (e) {
            if (e.matches) revealElements.forEach(function (el) { el.classList.add("visible"); });
          });
        }
      }
      window.addEventListener("pageshow", revealInView);
    }
  }

  /* ---------- sticky header + reading progress ---------- */

  var header = document.getElementById("siteHeader");
  var progress = document.querySelector(".read-progress");

  if (header || progress) {
    var ticking = false;

    function updateScrollUI() {
      var scrolled = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", scrolled > 20);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var pct = max > 0 ? (scrolled / max) * 100 : 0;
        progress.style.setProperty("--progress", pct.toFixed(2) + "%");
      }
      // Guarantee the reveal even if IntersectionObserver is being throttled
      // (background tabs, some in-app browsers). No-ops once nothing is left.
      if (window.__revealInView) window.__revealInView();
      ticking = false;
    }

    // rAF-throttled: the handler used to run on every scroll event, which is
    // where the jank on low-end phones came from.
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateScrollUI);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", updateScrollUI, { passive: true });
    updateScrollUI();
  }

  /* ---------- smooth scrolling for in-page anchors ---------- */

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (!id || id.length <= 1) return;

      var target;
      try {
        target = document.querySelector(id);
      } catch (err) {
        return; // not a valid selector — let the browser handle it
      }
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: motionDisabled() ? "auto" : "smooth",
        block: "start"
      });

      // Move keyboard focus too, otherwise a "skip to content" link only
      // moves the viewport and the next Tab starts from the top again.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });

      // Reflect the destination in the URL without a second jump.
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", id);
      }
    });
  });

  /* ---------- mark the current page in the navigation ---------- */

  var here = location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll(".main-nav a, .footer-col a").forEach(function (link) {
    var url;
    try {
      url = new URL(link.getAttribute("href"), location.href);
    } catch (err) {
      return;
    }
    if (url.origin === location.origin && !url.hash) {
      if (url.pathname.replace(/\/index\.html$/, "/") === here) {
        link.setAttribute("aria-current", "page");
      }
    }
  });
})();
