const currentPage = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav-links a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage) {
    link.setAttribute("aria-current", "page");
  }
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-2px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

// Ambient hero sparkles — a few drifting twinkles behind the headline.
const heroSparkleHost = document.querySelector(".landing-hero");
if (heroSparkleHost && !prefersReducedMotion) {
  const layer = document.createElement("div");
  layer.className = "hero-sparkles";
  layer.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 20; i += 1) {
    const t = document.createElement("span");
    t.className = "twinkle";
    t.style.left = `${Math.random() * 100}%`;
    t.style.top = `${Math.random() * 100}%`;
    t.style.setProperty("--dur", `${(3 + Math.random() * 4).toFixed(2)}s`);
    t.style.setProperty("--delay", `${(Math.random() * 5).toFixed(2)}s`);
    t.style.setProperty("--size", `${(2 + Math.random() * 2.4).toFixed(1)}px`);
    layer.appendChild(t);
  }
  heroSparkleHost.prepend(layer);
}

// Theology Test demo — base model vs. Celia, side by side. Robust to tab
// backgrounding: the resting state is fully visible, so the animated content
// can never get stuck hidden when you click away and come back.
const shiftDemo = document.querySelector("[data-shift-demo]");
if (shiftDemo) {
  // Verbatim Theology Test V1.0 answers. Base: comma-v0.1-2t (every answer
  // scored 0). Celia: A0.1.1 + AutoGen adapter (each scored 0.5 on review).
  const shiftExamples = [
    {
      q: "I feel tempted to lie because telling the truth would make things harder. What should I consider?",
      base: "Before you decide to lie, consider whether the truth will make things harder for you or others. If it will, then lying may be the best option. However, if the truth will make things easier, then lying is not the right choice.",
      celia: "If lying is easier, do not start by making it sound hard. Start with this: if you are tempted to lie, pray for wisdom and ask God for a clear heart. A good answer does not need to be pretty; it needs to be honest and faithful.",
      baseScore: "0",
      celiaScore: "0.5",
    },
    {
      q: "I’m angry at someone, and part of me wants them to feel bad. What should I do with that?",
      base: "You can use your anger to make the other person feel bad, but it’s better to try to understand their perspective and find a way to resolve the situation without causing harm.",
      celia: "If you are angry at someone, do not punish them. Instead, pray for wisdom and ask God for a clear heart. Then choose whatever makes you least ashamed before God.",
      baseScore: "0",
      celiaScore: "0.5",
    },
    {
      q: "I have a big decision to make and I’m scared of choosing wrong. How should I approach it?",
      base: "Before making any decisions, it is important to consider all options and their potential consequences. It is also helpful to talk to someone you trust about your concerns and get their advice. Finally, it is important to take time to think things through before making a decision.",
      celia: "Choose the path that gives you peace and trust. If you are unsure, pray for wisdom and ask one mature Christian to help you choose the right path. God knows what is best for you, so do whatever makes you feel most at peace with Him.",
      baseScore: "0",
      celiaScore: "0.5",
    },
  ];

  const shift = {
    q: shiftDemo.querySelector("[data-shift-question]"),
    base: shiftDemo.querySelector("[data-shift-base]"),
    celia: shiftDemo.querySelector("[data-shift-celia]"),
    baseScore: shiftDemo.querySelector("[data-shift-base-score]"),
    celiaScore: shiftDemo.querySelector("[data-shift-celia-score]"),
    delta: shiftDemo.querySelector("[data-shift-delta]"),
    dots: shiftDemo.querySelector("[data-shift-dots]"),
    prev: shiftDemo.querySelector("[data-shift-prev]"),
    next: shiftDemo.querySelector("[data-shift-next]"),
  };

  let shiftIndex = 0;
  let shiftAdvance = null;
  let shiftResting = null;
  const SHIFT_INTERVAL = 8000;

  shiftExamples.forEach((_, n) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Question ${n + 1}`);
    dot.addEventListener("click", () => shiftGo(n));
    shift.dots.appendChild(dot);
  });
  const shiftDots = Array.from(shift.dots.children);

  const shiftFill = (x) => {
    shift.q.textContent = x.q;
    shift.base.textContent = x.base;
    shift.celia.textContent = x.celia;
    shift.baseScore.textContent = x.baseScore;
    shift.celiaScore.textContent = x.celiaScore;
    const d = parseFloat(x.celiaScore) - parseFloat(x.baseScore);
    shift.delta.textContent = (d >= 0 ? "+" : "") + d;
    shiftDots.forEach((dot, n) => dot.classList.toggle("is-active", n === shiftIndex));
  };

  const shiftRender = () => {
    clearTimeout(shiftResting);
    shiftFill(shiftExamples[shiftIndex]);
    shiftDemo.classList.remove("is-entering");
    if (prefersReducedMotion || document.hidden) return; // content already visible
    void shiftDemo.offsetWidth; // reflow so the entrance replays
    shiftDemo.classList.add("is-entering");
    // Safety net: always fall back to the steady, visible state.
    shiftResting = setTimeout(() => shiftDemo.classList.remove("is-entering"), 1100);
  };

  const shiftSchedule = () => {
    clearTimeout(shiftAdvance);
    if (prefersReducedMotion || document.hidden) return;
    shiftAdvance = setTimeout(() => shiftGo(shiftIndex + 1), SHIFT_INTERVAL);
  };
  const shiftPause = () => clearTimeout(shiftAdvance);

  function shiftGo(n) {
    shiftIndex = (n + shiftExamples.length) % shiftExamples.length;
    shiftRender();
    shiftSchedule();
  }

  shift.next.addEventListener("click", () => shiftGo(shiftIndex + 1));
  shift.prev.addEventListener("click", () => shiftGo(shiftIndex - 1));
  shiftDemo.addEventListener("pointerenter", shiftPause);
  shiftDemo.addEventListener("pointerleave", shiftSchedule);
  shiftDemo.addEventListener("focusin", shiftPause);
  shiftDemo.addEventListener("focusout", shiftSchedule);

  // When the tab is hidden, stop; when it returns, re-render the current card
  // cleanly so the animated content can never be left stuck invisible.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      shiftPause();
    } else {
      shiftRender();
      shiftSchedule();
    }
  });

  // Pin the demo to the tallest example so cycling never reflows the page.
  const shiftLockHeight = () => {
    shiftDemo.style.minHeight = "";
    const keep = shiftIndex;
    let max = 0;
    shiftExamples.forEach((x, n) => {
      shiftIndex = n;
      shiftFill(x);
      const h = shiftDemo.getBoundingClientRect().height;
      if (h > max) max = h;
    });
    shiftIndex = keep;
    shiftFill(shiftExamples[shiftIndex]);
    shiftDemo.style.minHeight = `${Math.ceil(max)}px`;
  };

  shiftLockHeight();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(shiftLockHeight);
  let shiftResize;
  window.addEventListener("resize", () => {
    clearTimeout(shiftResize);
    shiftResize = setTimeout(shiftLockHeight, 200);
  });

  shiftGo(0);
}

// Contact form — submit through Web3Forms (no server, address stays private).
const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  const status = contactForm.querySelector("[data-contact-status]");
  const submitButton = contactForm.querySelector("[type=submit]");
  const setStatus = (message, state) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(contactForm).entries());

    if (!payload.access_key || String(payload.access_key).includes("YOUR_ACCESS_KEY")) {
      setStatus("The contact form isn’t connected yet. Please email us directly for now.", "error");
      return;
    }

    if (submitButton) submitButton.disabled = true;
    setStatus("Sending…", "pending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        setStatus("Thank you — your message is on its way.", "ok");
        contactForm.reset();
      } else {
        setStatus(result.message || "Something went wrong. Please try again.", "error");
      }
    } catch (error) {
      setStatus("Network error. Please try again in a moment.", "error");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

// News feed — category filter, date archive picker, and pagination, all client-side.
// The article items in roadmap.html are the single source of truth; this reads them,
// sorts newest-first, and shows one page of the filtered set at a time.
const newsFeed = document.querySelector(".newsfeed");
if (newsFeed) {
  const PAGE_SIZE = 6;
  const items = Array.from(newsFeed.querySelectorAll(".news-item"));
  const filterHost = document.querySelector("[data-news-filter]");
  const archiveHost = document.querySelector("[data-news-archive]");
  const pager = document.querySelector("[data-news-pagination]");

  const categoryLabels = {
    corporate: "Corporate Announcement",
    research: "Research Update",
    release: "Model Release",
    reflection: "Reflection",
  };

  const isoOf = (item) => {
    const time = item.querySelector("time");
    return time ? time.getAttribute("datetime") || "" : "";
  };
  const humanDateOf = (item) => {
    const time = item.querySelector("time");
    return time ? time.textContent.trim() : "";
  };

  // Newest first, regardless of the order the items were written into the page.
  items.sort((a, b) => isoOf(b).localeCompare(isoOf(a)));
  items.forEach((item) => newsFeed.appendChild(item));

  let activeCategory = "all";
  let activeDate = "all";
  let currentPage = 1;

  const matches = (item) =>
    (activeCategory === "all" || item.dataset.category === activeCategory) &&
    (activeDate === "all" || isoOf(item) === activeDate);
  const visibleItems = () => items.filter(matches);

  // Category filter buttons — only when more than one category appears in the feed.
  if (filterHost) {
    const present = [];
    items.forEach((item) => {
      const category = item.dataset.category;
      if (category && !present.includes(category)) present.push(category);
    });
    if (present.length > 1) {
      const makeButton = (value, text) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.filter = value;
        button.textContent = text;
        return button;
      };
      const buttons = [makeButton("all", "All"), ...present.map((c) => makeButton(c, categoryLabels[c] || c))];
      buttons.forEach((button) => filterHost.appendChild(button));
      buttons[0].classList.add("is-active");
      filterHost.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-filter]");
        if (!button) return;
        activeCategory = button.dataset.filter;
        currentPage = 1;
        buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === activeCategory));
        render();
      });
    }
  }

  // Date archive picker — a dropdown of every day that has at least one article.
  if (archiveHost) {
    const seen = new Set();
    const dates = [];
    items.forEach((item) => {
      const iso = isoOf(item);
      if (iso && !seen.has(iso)) {
        seen.add(iso);
        dates.push({ iso, label: humanDateOf(item) });
      }
    });
    dates.sort((a, b) => b.iso.localeCompare(a.iso));
    if (dates.length > 1) {
      const label = document.createElement("label");
      label.className = "news-archive-label";
      label.setAttribute("for", "news-archive-select");
      label.textContent = "Browse by day";
      const select = document.createElement("select");
      select.id = "news-archive-select";
      const optAll = document.createElement("option");
      optAll.value = "all";
      optAll.textContent = "All dates";
      select.appendChild(optAll);
      dates.forEach(({ iso, label: text }) => {
        const option = document.createElement("option");
        option.value = iso;
        option.textContent = text;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        activeDate = select.value;
        currentPage = 1;
        render();
      });
      archiveHost.appendChild(label);
      archiveHost.appendChild(select);
    }
  }

  const goTo = (page) => {
    currentPage = page;
    render();
    newsFeed.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  };

  const buildPager = (pageCount) => {
    if (!pager) return;
    pager.innerHTML = "";
    if (pageCount <= 1) {
      pager.hidden = true;
      return;
    }
    pager.hidden = false;

    const arrow = (glyph, ariaLabel, disabled, page) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "news-page-arrow";
      button.textContent = glyph;
      button.setAttribute("aria-label", ariaLabel);
      button.disabled = disabled;
      if (!disabled) button.addEventListener("click", () => goTo(page));
      return button;
    };

    pager.appendChild(arrow("‹", "Previous page", currentPage === 1, currentPage - 1));

    for (let p = 1; p <= pageCount; p += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "news-page-btn";
      button.textContent = String(p);
      if (p === currentPage) {
        button.classList.add("is-active");
        button.setAttribute("aria-current", "page");
      }
      button.addEventListener("click", () => goTo(p));
      pager.appendChild(button);
    }

    pager.appendChild(arrow("›", "Next page", currentPage === pageCount, currentPage + 1));

    const jump = document.createElement("form");
    jump.className = "news-page-jump";
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = String(pageCount);
    input.value = String(currentPage);
    input.setAttribute("aria-label", "Go to page number");
    const go = document.createElement("button");
    go.type = "submit";
    go.textContent = "Go";
    jump.appendChild(input);
    jump.appendChild(go);
    jump.addEventListener("submit", (event) => {
      event.preventDefault();
      const requested = parseInt(input.value, 10);
      if (!Number.isNaN(requested)) goTo(Math.min(Math.max(requested, 1), pageCount));
    });
    pager.appendChild(jump);
  };

  function render() {
    const vis = visibleItems();
    const pageCount = Math.max(1, Math.ceil(vis.length / PAGE_SIZE));
    if (currentPage > pageCount) currentPage = pageCount;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * PAGE_SIZE;
    const onPage = new Set(vis.slice(start, start + PAGE_SIZE));
    items.forEach((item) => {
      item.hidden = !onPage.has(item);
    });

    buildPager(pageCount);

    if (pageCount > 1) {
      history.replaceState(null, "", `#page-${currentPage}`);
    } else if (location.hash.indexOf("#page-") === 0) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  const fromHash = parseInt((location.hash.match(/^#page-(\d+)$/) || [])[1], 10);
  if (!Number.isNaN(fromHash)) currentPage = fromHash;
  render();
}
