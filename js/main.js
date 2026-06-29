/* =========================================================
   AVANI INTERLOCK BRICKS — Interactions
   ========================================================= */
(function () {
  "use strict";

  const WHATSAPP = "918978978734";

  /* ---------- Header elevate on scroll ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const backdrop = document.createElement("div");
  backdrop.className = "nav-backdrop";
  document.body.appendChild(backdrop);

  const setNav = (open) => {
    nav.classList.toggle("open", open);
    backdrop.classList.toggle("show", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  navToggle.addEventListener("click", () => setNav(!nav.classList.contains("open")));
  backdrop.addEventListener("click", () => setNav(false));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const ro = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay =
              (entry.target.dataset.delay || (revealOrder(entry.target) * 80) + "ms");
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => ro.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }
  // Stagger siblings inside the same grid
  function revealOrder(el) {
    const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
    const i = siblings.indexOf(el);
    return i >= 0 ? Math.min(i, 6) : 0;
  }

  /* ---------- Active nav link via section observer ---------- */
  const sections = ["home", "about", "services", "products", "gallery", "designs", "leadership", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  if ("IntersectionObserver" in window && sections.length) {
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
          }
        });
      },
      { threshold: 0.5, rootMargin: "-30% 0px -55% 0px" }
    );
    sections.forEach((s) => so.observe(s));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".stat__num[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const co = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- Gallery: image lightbox + video play ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = lightbox.querySelector(".lightbox__close");

  document.querySelectorAll(".gallery__item[data-src], .design-card[data-src]").forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImg.src = item.dataset.src;
      lightboxImg.alt = item.querySelector("img")?.alt || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });
  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  // Video items (support multiple)
  document.querySelectorAll(".gallery__item--video").forEach((videoItem) => {
    const vid = videoItem.querySelector("video");
    if (!vid) return;
    const toggle = () => {
      if (vid.paused) { vid.play(); videoItem.classList.add("playing"); }
      else { vid.pause(); videoItem.classList.remove("playing"); }
    };
    videoItem.addEventListener("click", toggle);
    vid.addEventListener("ended", () => videoItem.classList.remove("playing"));
  });

  /* ---------- Contact form → WhatsApp ---------- */
  const form = document.getElementById("enquiryForm");
  const note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const product = form.product.value;
      const message = form.message.value.trim();

      const text =
        `*New Enquiry — Avani Interlock Bricks*%0A%0A` +
        `*Name:* ${enc(name)}%0A` +
        `*Phone:* ${enc(phone)}%0A` +
        `*Requirement:* ${enc(product)}%0A` +
        (message ? `*Message:* ${enc(message)}%0A` : "");

      note.textContent = "Opening WhatsApp…";
      window.open(`https://wa.me/${WHATSAPP}?text=${text}`, "_blank", "noopener");
      form.reset();
      setTimeout(() => { note.textContent = "Thank you! We'll reply on WhatsApp shortly."; }, 400);
    });
  }
  function enc(s) { return encodeURIComponent(s).replace(/%20/g, " "); }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
