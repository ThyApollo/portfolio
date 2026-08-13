/* ============================================================
   Apollo — portfolio interactions
   Plain script (no framework, no build step):
     - contact mail handler
     - hero dim, statement line-light, sub/quote reveals
     - work sticky-stack shading + scale
     - services: pin + horizontal scroll (01 → 04)
     - stats count-up, magnetic CTAs
     - marquee builder (fills any viewport width, seamless loop)
   ============================================================ */
(function () {
  "use strict";

  function init() {
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var $  = function (s) { return document.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
    var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
    var lerp  = function (a, b, t) { return a + (b - a) * t; };
    var dimCh = [82, 86, 90], litCh = [217, 230, 239];
    var mix = function (t) {
      return "rgb(" + dimCh.map(function (c, i) { return Math.round(lerp(c, litCh[i], t)); }).join(",") + ")";
    };
    var isMobile = function () { return window.matchMedia("(max-width: 760px)").matches; };

    /* ---------- contact form → mailto ---------- */
    var sendMail = function () {
      var v = function (id) { return (document.getElementById(id) || {}).value || ""; };
      var subject = encodeURIComponent("Project inquiry — " + (v("cf-type") || "New project"));
      var body = encodeURIComponent(v("cf-msg") + "\n\n— " + v("cf-name") + " (" + v("cf-email") + ")");
      window.location.href = "mailto:hello@apollo.dev?subject=" + subject + "&body=" + body;
    };
    var sendBtn = document.getElementById("cf-send");
    if (sendBtn) sendBtn.addEventListener("click", sendMail);

    /* ---------- marquee: build two identical groups, each wide enough
         that after the -50% shift the track still covers the viewport ---------- */
    (function buildMarquee() {
      var mount = $("[data-marquee]");
      if (!mount) return;
      var ICONS = [
        ["typescript", "TypeScript"], ["react", "React"], ["nextdotjs", "Next.js"],
        ["nodedotjs", "Node.js"], ["go", "Go"], ["postgresql", "PostgreSQL"],
        ["redis", "Redis"], ["docker", "Docker"]
      ];
      var BASE = "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/";
      var SET_W = 800; // approx width of one 8-icon set incl. gaps
      var container = mount.parentElement; // .marquee
      var need = Math.max(container.clientWidth || 0, window.innerWidth) + 240;

      function makeGroup(hidden) {
        var g = document.createElement("div");
        g.className = "marquee__group";
        if (hidden) g.setAttribute("aria-hidden", "true");
        var w = 0, guard = 0;
        while (w < need && guard < 12) {
          ICONS.forEach(function (ic) {
            var img = document.createElement("img");
            img.className = "marquee__icon";
            img.src = BASE + ic[0] + ".svg";
            img.alt = hidden ? "" : ic[1];
            g.appendChild(img);
          });
          w += SET_W;
          guard++;
        }
        return g;
      }
      mount.textContent = "";
      mount.appendChild(makeGroup(false));
      mount.appendChild(makeGroup(true));
    })();

    /* ---------- services: pin + horizontal scroll ---------- */
    var svcSection  = $("[data-services]");
    var svcSticky   = svcSection && svcSection.querySelector(".services__sticky");
    var svcTrack    = svcSection && svcSection.querySelector("[data-svc-track]");
    var svcViewport = svcSection && svcSection.querySelector(".services__viewport");
    var svcCards    = svcSection ? Array.prototype.slice.call(svcSection.querySelectorAll(".svc")) : [];
    var svcDistance = 0;

    function layoutServices() {
      if (!svcSection || !svcTrack || !svcViewport) return;
      if (reduced || isMobile()) {
        // static/stacked layout handled by CSS — clear any inline sizing
        svcSection.style.height = "";
        svcTrack.style.transform = "";
        svcDistance = 0;
        return;
      }
      svcTrack.style.transform = "none";
      var dist = svcTrack.scrollWidth - svcViewport.clientWidth;
      svcDistance = Math.max(0, Math.round(dist));
      // section tall enough to pin for exactly the horizontal distance — no dead scroll
      svcSection.style.height = (window.innerHeight + svcDistance) + "px";
    }

    /* ---------- scroll loop ---------- */
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var vh = window.innerHeight;
        var y = window.scrollY;

        // nav background
        var nav = $("[data-nav]");
        if (nav) {
          var on = y > vh * 0.6;
          nav.style.background = on ? "rgba(5,5,6,0.82)" : "transparent";
          nav.style.backdropFilter = on ? "blur(12px)" : "none";
          nav.style.webkitBackdropFilter = on ? "blur(12px)" : "none";
          nav.style.borderBottomColor = on ? "rgba(237,236,232,0.08)" : "transparent";
        }

        // hero parallax + dim-out
        var heroOv = $("[data-hero-overlay]");
        if (heroOv && !reduced) {
          var hp = clamp(y / (vh * 0.9));
          heroOv.style.opacity = String(1 - hp * 0.85);
        }

        // statement line-light
        $$("[data-line]").forEach(function (el, i) {
          var r = el.getBoundingClientRect();
          var t = clamp((vh * 0.78 - r.top) / (vh * 0.3) - i * 0.45);
          el.style.color = mix(reduced ? 1 : t);
        });

        // work stack shading + subtle scale
        var cards = $$("[data-stack-card]");
        cards.forEach(function (card, i) {
          var next = cards[i + 1];
          if (!next) return;
          var p = clamp(1 - next.getBoundingClientRect().top / vh);
          var shade = card.querySelector("[data-card-shade]");
          if (shade) shade.style.opacity = String(p * 0.55);
          var inner = card.firstElementChild;
          if (inner && !reduced) inner.style.transform = "scale(" + (1 - p * 0.04) + ")";
        });

        // services: horizontal scroll while pinned, + segmented bar-fill progress
        if (svcSection && svcDistance > 0) {
          var sr = svcSection.getBoundingClientRect();
          var sp = clamp(-sr.top / svcDistance);
          svcTrack.style.transform = "translateX(" + (-sp * svcDistance) + "px)";
          var n = svcCards.length;
          for (var ci = 0; ci < n; ci++) {
            // each card's bar fills over its 1/n slice of the scroll → sequential 01→04
            svcCards[ci].style.setProperty("--fill", (clamp(sp * n - ci) * 100) + "%");
          }
        }

        // sub-text light-up
        var cover = $("[data-cover]");
        var coverP = cover ? clamp((1 - cover.getBoundingClientRect().bottom / vh) * 1.4) : 1;
        $$("[data-sub]").forEach(function (el) {
          var t;
          if (el.closest && el.closest("#contact")) {
            t = coverP;
          } else {
            var rr = el.getBoundingClientRect();
            t = clamp((vh * 0.92 - rr.top) / (vh * 0.3));
          }
          el.style.opacity = String(0.25 + 0.75 * (reduced ? 1 : t));
        });

        // testimonials brighten
        $$("[data-quote]").forEach(function (q, i) {
          var r2 = q.getBoundingClientRect();
          var t = clamp((vh * 0.85 - r2.top) / (vh * 0.25) - i * 0.35);
          q.style.opacity = String(0.35 + 0.65 * (reduced ? 1 : t));
        });
      });
    };

    layoutServices();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { layoutServices(); onScroll(); });
    window.addEventListener("load", function () { layoutServices(); onScroll(); });
    onScroll();

    /* ---------- stats count-up ---------- */
    var counters = $$("[data-count]");
    if ("IntersectionObserver" in window && counters.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          var el = e.target;
          var target = parseInt(el.getAttribute("data-target"), 10);
          var suffix = el.getAttribute("data-suffix") || "";
          if (reduced) { el.textContent = target + suffix; return; }
          var t0 = performance.now();
          var dur = 1200;
          var step = function (now) {
            var t = clamp((now - t0) / dur);
            var eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { io.observe(c); });
    }

    /* ---------- magnetic CTAs ---------- */
    if (!reduced) {
      $$("[data-magnet]").forEach(function (el) {
        var move = function (e) {
          var r = el.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          el.style.transform = "translate(" + dx * 7 + "px," + dy * 6 + "px)";
        };
        var leave = function () { el.style.transform = "translate(0,0)"; };
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
