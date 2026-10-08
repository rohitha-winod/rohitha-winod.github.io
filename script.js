/* Rohitha & Winod | Engagement invitation */

/* Images load straight from ./assets (trimmed WebP made by optimize-assets.py). */

/* ---------- Event ---------- */
const EVENT = {
  title: "Rohitha & Winod | Exchange of Rings Ceremony",
  start: "2026-10-25T11:19:00+05:30",
  hours: 3, // calendar block length, adjust as needed
  place: "Madhura Banquet Hall, Manikonda, Hyderabad",
};

const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Countdown: a digit gets a small drop in when its value changes */
(function countdown() {
  const target = new Date(EVENT.start).getTime();
  const el = { d: "cd-d", h: "cd-h", m: "cd-m", s: "cd-s" };
  Object.keys(el).forEach((k) => (el[k] = document.getElementById(el[k])));
  const pad = (n) => String(n).padStart(2, "0");
  const set = (node, value) => {
    if (node.textContent === value) return;
    node.textContent = value;
    if (REDUCE) return;
    node.classList.remove("tick");
    void node.offsetWidth; // restart the animation
    node.classList.add("tick");
  };
  function tick() {
    const diff = Math.max(0, target - Date.now());
    const s = Math.floor(diff / 1000);
    set(el.d, pad(Math.floor(s / 86400)));
    set(el.h, pad(Math.floor((s % 86400) / 3600)));
    set(el.m, pad(Math.floor((s % 3600) / 60)));
    set(el.s, pad(s % 60));
  }
  tick();
  setInterval(tick, 1000);
})();

/* Add to calendar (.ics) */
(function calendar() {
  const link = document.getElementById("add-cal");
  if (!link) return;
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = new Date(EVENT.start);
  const end = new Date(start.getTime() + EVENT.hours * 3600 * 1000);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rohitha Winod Engagement//EN", "BEGIN:VEVENT",
    "UID:rohitha-winod-engagement-20261025@invite",
    "DTSTAMP:" + fmt(new Date()),
    "DTSTART:" + fmt(start),
    "DTEND:" + fmt(end),
    "SUMMARY:" + EVENT.title,
    "LOCATION:" + EVENT.place.replace(/,/g, "\\,"),
    "DESCRIPTION:Muhurtham at 11:19 AM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  link.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
})();

/* Falling petals, fewer and softer on small screens */
(function petals() {
  const host = document.querySelector(".petals");
  if (!host || REDUCE) return;
  const count = innerWidth < 720 ? 7 : 12;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("i");
    p.className = "petal";
    const size = 8 + Math.random() * 8;
    p.style.cssText =
      `left:${Math.random() * 100}%;width:${size}px;height:${size * 1.4}px;` +
      `--drift:${(Math.random() * 2 - 1) * 120}px;--spin:${(Math.random() * 2 - 1) * 540}deg;` +
      `animation-duration:${13 + Math.random() * 12}s;animation-delay:${-Math.random() * 22}s;`;
    host.appendChild(p);
  }
})();

/* Background music: fades in on the first tap anywhere (browsers block sound before that),
   the button toggles it, and a visitor who turns it off is not surprised by it again */
(function music() {
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("music-toggle");
  if (!audio || !btn) return;
  const VOLUME = 0.45;
  const store = {
    get() { try { return localStorage.getItem("rw-music"); } catch { return null; } },
    set(v) { try { localStorage.setItem("rw-music", v); } catch {} },
  };
  let fade;
  const ramp = (to, ms, done) => {
    cancelAnimationFrame(fade);
    const from = audio.volume, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      audio.volume = from + (to - from) * k;
      if (k < 1) fade = requestAnimationFrame(step); else if (done) done();
    };
    fade = requestAnimationFrame(step);
  };
  const show = (on) => {
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Pause music" : "Play music");
  };
  const play = () => {
    audio.volume = 0;
    return audio.play().then(() => { show(true); ramp(VOLUME, 4000); }).catch(() => show(false));
  };
  const pause = () => { show(false); ramp(0, 600, () => audio.pause()); };

  btn.addEventListener("click", () => {
    if (audio.paused || btn.getAttribute("aria-pressed") === "false") { store.set("on"); play(); }
    else { store.set("off"); pause(); }
  });

  /* First tap anywhere else starts it, unless they turned it off on an earlier visit */
  const firstTap = (e) => {
    removeEventListener("pointerdown", firstTap);
    removeEventListener("keydown", firstTap);
    if (btn.contains(e.target) || store.get() === "off") return;
    play();
  };
  addEventListener("pointerdown", firstTap);
  addEventListener("keydown", firstTap);

  /* Quiet while the tab is in the background */
  let wasPlaying = false;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { wasPlaying = !audio.paused; audio.pause(); }
    else if (wasPlaying) audio.play().catch(() => {});
  });
})();

/* ---------- Motion ---------- */
window.addEventListener("DOMContentLoaded", () => {
  if (REDUCE || !window.gsap || !window.ScrollTrigger) return; // page stays fully readable without motion

  gsap.registerPlugin(ScrollTrigger);
  const mobile = matchMedia("(max-width: 719px)").matches;

  /* Smooth scrolling */
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      a.addEventListener("click", (e) => { e.preventDefault(); lenis.scrollTo(id, { duration: 1.6 }); });
    });
  }

  /* Hide everything that animates in before the first paint of motion */
  gsap.set("[data-reveal], [data-card]", { autoAlpha: 0 });

  /* Hero entrance: the paper layers drop and settle one by one */
  const intro = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.15 });
  intro
    .from(".toran", { yPercent: -110, duration: 1.3, ease: "back.out(1.1)" })
    .from(".garland", { yPercent: -105, duration: 1.4, stagger: 0.12, ease: "back.out(1.2)" }, "-=1.0")
    .from(".emblem", { scale: 0.4, rotation: -25, autoAlpha: 0, duration: 1.0, ease: "back.out(1.6)" }, "-=0.9")
    .from(".hero__bless", { autoAlpha: 0, letterSpacing: "0.6em", duration: 1.1 }, "-=0.6")
    .from(".hero__title .line > span", { yPercent: 115, rotation: 2, duration: 1.0, stagger: 0.14 }, "-=0.8")
    .from(".hero__hands img", { autoAlpha: 0, scale: 0.86, y: 40, rotation: -6, duration: 1.3 }, "-=0.7")
    .from(".scroll-cue", { autoAlpha: 0, duration: 0.8 }, "-=0.3");

  /* The toran, garlands and title stay put and simply scroll with the page; only the cue fades */
  gsap.to(".scroll-cue", { autoAlpha: 0, scrollTrigger: { trigger: ".hero", start: "top top", end: "15% top", scrub: 0.6 } });

  /* Generic parallax, set with data-speed (percent of own height); halved on phones */
  gsap.utils.toArray("[data-speed]").forEach((el) => {
    const speed = parseFloat(el.dataset.speed) * (mobile ? 0.5 : 1);
    gsap.fromTo(el, { yPercent: -speed }, {
      yPercent: speed, ease: "none",
      scrollTrigger: { trigger: el.closest("section, header"), start: "top bottom", end: "bottom top", scrub: 0.8 },
    });
  });

  /* Arch: the frame settles while the rings rise and turn into the opening */
  const archTl = gsap.timeline({
    scrollTrigger: { trigger: ".arch", start: "top 85%", end: "center 45%", scrub: 0.8 },
  });
  archTl
    .from(".arch__frame", { scale: 0.86, y: 60, ease: "none" }, 0)
    .from(".arch__glow", { autoAlpha: 0, scale: 0.8, ease: "none" }, 0)
    .from(".arch__rings", { scale: 0.35, rotation: -120, autoAlpha: 0, y: 70, ease: "none" }, 0.15);

  /* Reveal text like lifted paper */
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(batch,
        { autoAlpha: 0, y: 40, rotationX: -18, transformPerspective: 800, transformOrigin: "50% 100%" },
        { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, clearProps: "transform" }),
  });

  /* Ceremony flourishes draw outward from the words */
  gsap.from(".ceremony .flourish", {
    scaleX: 0, duration: 1.1, ease: "power2.out", delay: 0.35,
    transformOrigin: (i) => (i === 0 ? "0% 50%" : "100% 50%"),
    scrollTrigger: { trigger: ".ceremony", start: "top 85%", once: true },
  });

  /* Names are written in, left to right, like ink from a pen */
  const names = gsap.timeline({ scrollTrigger: { trigger: ".names", start: "top 82%", once: true } });
  names
    .fromTo(".names .name:first-child",
      { clipPath: "inset(-30% 100% -30% -10%)" },
      { clipPath: "inset(-30% -10% -30% -10%)", duration: 1.5, ease: "power2.inOut" })
    .from(".names .amp", { autoAlpha: 0, scale: 0.4, rotation: -30, duration: 0.7, ease: "back.out(2)" }, "-=0.3")
    .fromTo(".names .name:last-child",
      { clipPath: "inset(-30% 100% -30% -10%)" },
      { clipPath: "inset(-30% -10% -30% -10%)", duration: 1.3, ease: "power2.inOut" }, "-=0.2")
    .set(".names .name", { clearProps: "clipPath" });

  /* Cards are dealt onto the table one after another */
  ScrollTrigger.batch("[data-card]", {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(batch,
        { autoAlpha: 0, y: 70, rotation: (i) => (i % 2 ? 4 : -4), scale: 0.94 },
        { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 1.0, ease: "back.out(1.4)", stagger: 0.15, clearProps: "transform" }),
  });

  /* Scalloped edges slide apart slightly, selling the layered depth */
  gsap.utils.toArray(".details, .closing").forEach((sec) => {
    const edges = sec.querySelectorAll(".edge");
    gsap.from(edges, {
      y: (i) => (3 - i) * 26, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "top 35%", scrub: 0.6 },
    });
  });

  /* Divider opens from the centre */
  gsap.from(".divider", {
    scaleX: 0, duration: 1.2, ease: "power3.out",
    scrollTrigger: { trigger: ".divider", start: "top 88%", once: true },
  });

  /* Closing scene builds back to front: plants, then pooja, then the couple sits down */
  const scene = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: ".scene", start: "top 80%", once: true },
    /* Once it settles, the plants keep a slow breeze going */
    onComplete: () => gsap.to(".scene__plant", {
      rotation: (i) => (i ? -1.5 : 1.5), transformOrigin: "50% 100%",
      duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true,
    }),
  });
  scene
    .from(".scene__plant--left", { xPercent: -40, rotation: -6, autoAlpha: 0, duration: 1.2 }, 0)
    .from(".scene__plant--right", { xPercent: 40, rotation: 6, autoAlpha: 0, duration: 1.2 }, 0)
    .from(".scene__pooja", { y: 50, autoAlpha: 0, duration: 1.1 }, 0.25)
    .from(".scene__couple", { y: 80, autoAlpha: 0, duration: 1.3, ease: "back.out(1.1)" }, 0.5);

  /* Footer names write in too */
  gsap.fromTo(".footer__names",
    { clipPath: "inset(-30% 100% -30% -10%)" },
    { clipPath: "inset(-30% -10% -30% -10%)", duration: 1.6, ease: "power2.inOut",
      scrollTrigger: { trigger: ".footer", start: "top 92%", once: true } });

  addEventListener("load", () => ScrollTrigger.refresh());
});
