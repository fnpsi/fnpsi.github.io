/* =========================================================
   Function Psi — shared interface behaviour
   ========================================================= */
(function () {
  "use strict";

  var html = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");
  var hasGSAP = Boolean(window.gsap && window.ScrollTrigger);
  var started = false;

  if (hasGSAP) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }
  var lenis = null;
  var menuOpen = false;
  var lastFocused = null;

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function initClock() {
    var clocks = $$("[data-clock]");
    var years = $$("[data-year]");

    years.forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });

    if (!clocks.length) return;

    function tick() {
      var time = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Africa/Johannesburg"
      }).format(new Date());

      clocks.forEach(function (node) {
        node.textContent = time;
      });
    }

    tick();
    window.setInterval(tick, 30000);
  }

  function initActiveNav() {
    var page = body.getAttribute("data-page");
    if (!page) return;

    $$("[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === page) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function initHeader() {
    var header = $("[data-header]");
    var progress = $("[data-scroll-progress]");
    var ticking = false;

    function update() {
      var scrollTop = window.scrollY || window.pageYOffset;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var value = Math.min(1, Math.max(0, scrollTop / max));

      if (header) header.classList.toggle("is-scrolled", scrollTop > 24);
      if (progress) progress.style.transform = "scaleX(" + value + ")";
      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
  }

  function initMenu() {
    var toggle = $("[data-menu-toggle]");
    var menu = $("[data-menu]");
    if (!toggle || !menu) return;

    var links = $$("a, button", menu);
    var label = $(".menu-toggle__label", toggle);

    function setOpen(open) {
      menuOpen = open;
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      menu.classList.toggle("is-open", open);
      html.classList.toggle("menu-open", open);
      if (label) label.textContent = open ? "Close" : "Menu";

      if (open) {
        lastFocused = document.activeElement;
        if (lenis) lenis.stop();
        window.setTimeout(function () {
          var first = links[0];
          if (first) first.focus();
        }, 120);
      } else {
        if (lenis) lenis.start();
        if (lastFocused && typeof lastFocused.focus === "function") {
          lastFocused.focus();
        }
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!menuOpen);
    });

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (!menuOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !links.length) return;

      var first = links[0];
      var last = links[links.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function initSmoothScroll() {
    if (!hasGSAP || reduceMotion.matches || !window.Lenis) return;

    lenis = new window.Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1
    });

    window.fnpsiLenis = lenis;
    lenis.on("scroll", window.ScrollTrigger.update);

    window.gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    window.gsap.ticker.lagSmoothing(0);
  }

  function initAnchors() {
    $$('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;

      link.addEventListener("click", function (event) {
        var target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        var inHero = Boolean(link.closest("[data-hero-cinema]"));
        var offset = inHero ? 0 : -88;

        if (lenis && !reduceMotion.matches) {
          lenis.scrollTo(target, inHero ? { offset: offset, immediate: true } : { offset: offset, duration: 1.2 });
        } else {
          var top = target.getBoundingClientRect().top + window.scrollY + offset;
          window.scrollTo({ top: top, behavior: reduceMotion.matches ? "auto" : "smooth" });
        }

        if (link.classList.contains("skip-link") && typeof target.focus === "function") {
          target.focus({ preventScroll: true });
        }

        if (history.pushState) history.pushState(null, "", href);
      });
    });
  }

  function initCursor() {
    if (!finePointer.matches || reduceMotion.matches || !hasGSAP) return;

    var cursor = $("[data-cursor-root]");
    if (!cursor) return;

    var dot = $(".cursor__dot", cursor);
    var lens = $(".cursor__lens", cursor);
    var glow = $(".cursor__glow", cursor);
    var label = $("[data-cursor-label]", cursor);
    if (!dot || !lens || !glow) return;

    body.classList.add("has-cursor");

    var dotX = window.gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
    var dotY = window.gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
    var lensX = window.gsap.quickTo(lens, "x", { duration: 0.38, ease: "power3.out" });
    var lensY = window.gsap.quickTo(lens, "y", { duration: 0.38, ease: "power3.out" });
    var glowX = window.gsap.quickTo(glow, "x", { duration: 0.72, ease: "power3.out" });
    var glowY = window.gsap.quickTo(glow, "y", { duration: 0.72, ease: "power3.out" });

    var visible = false;
    var activeTarget = null;

    function showCursor() {
      if (visible) return;
      visible = true;
      body.classList.remove("cursor-hidden");
      window.gsap.to([dot, lens, glow], { opacity: 1, duration: 0.28, ease: "power2.out" });
    }

    function hideCursor() {
      if (!visible) return;
      visible = false;
      body.classList.add("cursor-hidden");
      window.gsap.to([dot, lens, glow], { opacity: 0, duration: 0.2, ease: "power2.out" });
    }

    function move(event) {
      showCursor();
      dotX(event.clientX);
      dotY(event.clientY);
      lensX(event.clientX);
      lensY(event.clientY);
      glowX(event.clientX);
      glowY(event.clientY);
    }

    function resolveTarget(node) {
      if (!node || !node.closest) return null;
      return node.closest("a, button, [data-cursor]");
    }

    function setTarget(target) {
      if (target === activeTarget) return;
      activeTarget = target;

      body.classList.toggle("cursor-hover", Boolean(target));

      var text = "";
      if (target) {
        text = target.getAttribute("data-cursor-label") || "";
        if (!text && target.matches('a[target="_blank"]')) text = "Open";
      }

      body.classList.toggle("cursor-label", Boolean(text));
      if (label) label.textContent = text;
    }

    window.addEventListener("pointermove", move, { passive: true });

    document.addEventListener("pointerover", function (event) {
      var target = resolveTarget(event.target);
      if (target) setTarget(target);
    });

    document.addEventListener("pointerout", function (event) {
      var target = resolveTarget(event.target);
      if (!target) return;
      if (event.relatedTarget && target.contains(event.relatedTarget)) return;
      setTarget(null);
    });

    document.addEventListener("pointerdown", function () {
      body.classList.add("cursor-down");
    });

    document.addEventListener("pointerup", function () {
      body.classList.remove("cursor-down");
    });

    window.addEventListener("blur", hideCursor);
    window.addEventListener("mouseout", function (event) {
      if (!event.relatedTarget) hideCursor();
    });
    window.addEventListener("mouseenter", showCursor);
  }

  function initMagnetic() {
    if (!hasGSAP || !finePointer.matches || reduceMotion.matches) return;

    $$("[data-magnetic]").forEach(function (element) {
      var strength = Number(element.getAttribute("data-magnetic")) || 0.18;

      element.addEventListener("pointermove", function (event) {
        var rect = element.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) * strength;
        var y = (event.clientY - rect.top - rect.height / 2) * strength;

        window.gsap.to(element, {
          x: x,
          y: y,
          duration: 0.45,
          ease: "power3.out",
          overwrite: true
        });
      });

      element.addEventListener("pointerleave", function () {
        window.gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.4)",
          overwrite: true
        });
      });
    });
  }

  function initReveals() {
    if (!hasGSAP) return;

    if (reduceMotion.matches) {
      window.gsap.set($$("[data-reveal], [data-reveal-group] > *"), {
        clearProps: "transform,opacity"
      });
      return;
    }

    $$("[data-reveal]").forEach(function (element) {
      var delay = Number(element.getAttribute("data-reveal-delay")) || 0;

      window.gsap.set(element, { y: 30, opacity: 0 });

      window.ScrollTrigger.create({
        trigger: element,
        start: "top 90%",
        once: true,
        onEnter: function () {
          window.gsap.to(element, {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: delay,
            ease: "power3.out",
            overwrite: true
          });
        }
      });
    });

    $$("[data-reveal-group]").forEach(function (group) {
      var children = $$(":scope > *", group);
      if (!children.length) return;

      window.gsap.set(children, { y: 24, opacity: 0 });

      window.ScrollTrigger.create({
        trigger: group,
        start: "top 88%",
        once: true,
        onEnter: function () {
          window.gsap.to(children, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            overwrite: true
          });
        }
      });
    });
  }

  function initHero() {
    if (!hasGSAP || body.getAttribute("data-page") !== "home" || reduceMotion.matches) return;
    if ($("[data-hero-cinema]")) return;

    var timeline = window.gsap.timeline({ delay: 0.12 });

    timeline
      .from(".hero__content > .eyebrow", { opacity: 0, y: 14, duration: 0.7, ease: "power3.out" }, 0)
      .from(".hero__line > span", {
        yPercent: 115,
        duration: 1.25,
        stagger: 0.1,
        ease: "power4.out"
      }, 0.05)
      .from(".hero__bottom", { opacity: 0, y: 22, duration: 0.9, ease: "power3.out" }, 0.58)
      .from(".hero__visual", { opacity: 0, scale: 0.94, duration: 1.35, ease: "power3.out" }, 0.18)
      .from(".hero__meta", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out" }, 0.8);
  }

  function initCapabilities() {
    if (!hasGSAP || !$("[data-capabilities]")) return;

    var media = window.gsap.matchMedia();

    media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", function () {
      var section = $("[data-capabilities]");
      var viewport = $("[data-cap-viewport]", section);
      var track = $("[data-cap-track]", section);
      var progress = $("[data-cap-progress]", section);
      if (!viewport || !track) return;

      function distance() {
        return Math.max(0, track.scrollWidth - viewport.clientWidth);
      }

      var tween = window.gsap.to(track, {
        x: function () { return -distance(); },
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: function () { return "+=" + (distance() + window.innerHeight * 0.3); },
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (progress) progress.style.transform = "scaleX(" + self.progress + ")";
          }
        }
      });

      return function () {
        if (tween) tween.kill();
        if (tween && tween.scrollTrigger) tween.scrollTrigger.kill();
        window.gsap.set(track, { clearProps: "transform" });
        if (progress) progress.style.transform = "scaleX(0)";
      };
    });
  }

  function initToc() {
    var toc = $("[data-toc]");
    if (!toc) return;

    var links = $$("a[href^='#']", toc);
    var sections = links.map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    }).filter(Boolean);

    if (!sections.length) return;

    function setActive() {
      var marker = 140;
      var current = sections[0];

      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= marker) current = section;
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1];
      }

      links.forEach(function (link) {
        var active = link.getAttribute("href") === "#" + current.id;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function onScroll() {
      setActive();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    setActive();
  }

  function refreshScrollTriggers() {
    if (!hasGSAP) return;
    window.ScrollTrigger.refresh();
  }

  function start() {
    if (started) return;
    started = true;

    initHero();
    initReveals();
    initCapabilities();
    initToc();

    if (hasGSAP) {
      window.requestAnimationFrame(refreshScrollTriggers);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          window.setTimeout(refreshScrollTriggers, 120);
        });
      }
    }

    html.classList.add("is-page-ready");
  }

  function boot() {
    initClock();
    initActiveNav();
    initHeader();
    initMenu();
    initSmoothScroll();
    initAnchors();
    initCursor();
    initMagnetic();

    var loader = $("[data-loader]");
    var pageReady = html.getAttribute("data-page-ready") === "true";

    if (loader && html.classList.contains("is-loading") && !pageReady) {
      window.addEventListener("fnpsi:page-ready", start, { once: true });
      window.setTimeout(start, 8200);
    } else {
      start();
    }

    if (hasGSAP) {
      window.addEventListener("resize", function () {
        window.clearTimeout(window.__fnpsiResizeTimer);
        window.__fnpsiResizeTimer = window.setTimeout(refreshScrollTriggers, 220);
      }, { passive: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
