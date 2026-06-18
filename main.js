/* ============================================================
   Assentum — progressive enhancement. No third-party code.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Contact delivery -------------------------------------------------
     Leave FORM_ENDPOINT empty to use the built-in mailto fallback (works on
     static hosting with zero setup). To use a hosted form service such as
     Formspree, paste the endpoint URL, e.g.
       var FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx";
  ----------------------------------------------------------------------- */
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "contact@assentum.io";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var docEl = document.documentElement;

  /* ---------- Load choreography ---------- */
  // Reveal on next frame so the hidden initial state paints first and the
  // transition plays. A timeout fallback guarantees the content is never left
  // hidden if rAF is throttled (e.g. a tab that loads in the background).
  var revealLoaded = function () { document.body.classList.add("is-loaded"); };
  var armReveal = function () {
    requestAnimationFrame(function () { requestAnimationFrame(revealLoaded); });
    setTimeout(revealLoaded, 120);
  };
  if (document.readyState === "complete") armReveal();
  else window.addEventListener("load", armReveal);

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header state + scroll progress ---------- */
  var header = document.querySelector("[data-header]");
  var progress = document.querySelector("[data-progress]");
  var ticking = false;

  var onScrollFrame = function () {
    var y = window.scrollY || docEl.scrollTop;
    if (header) {
      if (y > 8) header.setAttribute("data-scrolled", "");
      else header.removeAttribute("data-scrolled");
    }
    if (progress) {
      var max = docEl.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, y / max) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
    }
    ticking = false;
  };
  var requestScroll = function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  };
  onScrollFrame();
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });

  /* ---------- Cursor-reactive hero light ---------- */
  var hero = document.querySelector("[data-hero]");
  if (hero && canHover && !reduceMotion) {
    var glowRAF = false;
    hero.addEventListener("mousemove", function (e) {
      if (glowRAF) return;
      glowRAF = true;
      requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        var mx = ((e.clientX - r.left) / r.width) * 100;
        var my = ((e.clientY - r.top) / r.height) * 100;
        hero.style.setProperty("--mx", mx.toFixed(1) + "%");
        hero.style.setProperty("--my", my.toFixed(1) + "%");
        glowRAF = false;
      });
    });
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-nav-menu]");
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      if (open) menu.setAttribute("data-open", "");
      else menu.removeAttribute("data-open");
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll-spy nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-navlink]"));
  if (navLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute("href");
      if (id && id.charAt(0) === "#") linkFor[id.slice(1)] = a;
    });
    var sections = navLinks
      .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
      .filter(Boolean);

    var setActive = function (id) {
      navLinks.forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("data-active", "");
        else a.removeAttribute("data-active");
      });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Contact form ---------- */
  var form = document.querySelector("[data-contact-form]");
  var status = document.querySelector("[data-form-status]");

  var setStatus = function (msg, state) {
    if (!status) return;
    status.textContent = msg;
    if (state) status.setAttribute("data-state", state);
    else status.removeAttribute("data-state");
  };
  var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var hp = form.querySelector('[name="company-website"]');
      if (hp && hp.value.trim() !== "") return; // bot

      var get = function (id) { var el = form.querySelector("#" + id); return el ? el.value.trim() : ""; };
      var data = { name: get("name"), institution: get("institution"), email: get("email"), message: get("message") };

      if (!data.name || !data.institution || !data.email || !data.message) {
        setStatus("Please complete every field.", "error"); return;
      }
      if (!isEmail(data.email)) {
        setStatus("Please enter a valid email address.", "error"); return;
      }

      if (FORM_ENDPOINT) {
        setStatus("Sending…", null);
        var btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data)
        })
          .then(function (res) { if (!res.ok) throw new Error("failed"); form.reset(); setStatus("Thank you. We will respond discreetly.", "ok"); })
          .catch(function () { setStatus("Something went wrong. Please email " + CONTACT_EMAIL + ".", "error"); })
          .finally(function () { if (btn) btn.disabled = false; });
        return;
      }

      var subject = "Introduction request — " + data.institution;
      var body = "Name: " + data.name + "\nInstitution: " + data.institution + "\nEmail: " + data.email + "\n\n" + data.message + "\n";
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      setStatus("Opening your email client…", "ok");
    });
  }
})();
