/* ============================================================
   Assentum — minimal progressive-enhancement script.
   No third-party code, no tracking.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Contact delivery -------------------------------------------------
     Leave FORM_ENDPOINT empty to use the built-in mailto fallback (works on
     static hosting with zero setup). To use a hosted form service such as
     Formspree, paste the endpoint URL below, e.g.
       var FORM_ENDPOINT = "https://formspree.io/f/xxxxxxx";
  ----------------------------------------------------------------------- */
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "contact@assentum.io";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.setAttribute("data-scrolled", "");
      else header.removeAttribute("data-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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
    // Close after choosing a destination
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    // Close on outside click
    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
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

  var isEmail = function (v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot — if filled, silently abort (bot)
      var hp = form.querySelector('[name="company-website"]');
      if (hp && hp.value.trim() !== "") return;

      var get = function (id) {
        var el = form.querySelector("#" + id);
        return el ? el.value.trim() : "";
      };
      var data = {
        name: get("name"),
        institution: get("institution"),
        email: get("email"),
        message: get("message")
      };

      if (!data.name || !data.institution || !data.email || !data.message) {
        setStatus("Please complete every field.", "error");
        return;
      }
      if (!isEmail(data.email)) {
        setStatus("Please enter a valid email address.", "error");
        return;
      }

      // Hosted endpoint (e.g. Formspree) if configured
      if (FORM_ENDPOINT) {
        setStatus("Sending…", null);
        var btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Request failed");
            form.reset();
            setStatus("Thank you. We will respond discreetly.", "ok");
          })
          .catch(function () {
            setStatus("Something went wrong. Please email " + CONTACT_EMAIL + ".", "error");
          })
          .finally(function () {
            if (btn) btn.disabled = false;
          });
        return;
      }

      // Static fallback — compose an email in the visitor's mail client
      var subject = "Introduction request — " + data.institution;
      var body =
        "Name: " + data.name + "\n" +
        "Institution: " + data.institution + "\n" +
        "Email: " + data.email + "\n\n" +
        data.message + "\n";
      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      setStatus("Opening your email client…", "ok");
    });
  }
})();
