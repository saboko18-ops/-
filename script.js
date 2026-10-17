/* Славные земляки Брянщины. Скрипты сайта.
   Содержимое: появление блоков, тема, прогресс, меню, разбивка заголовка на буквы,
   параллакс и прожектор в hero, искры, счётчики, бегущая строка, галерея с фото и 3D-наклоном,
   хронология, места памяти, викторина, «магнитные» кнопки. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var initials = function (n) { var w = n.replace(/[.,]/g, "").split(/\s+/).filter(Boolean); return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase(); };
  var LOADER_MS = reduce ? 0 : 2300;

  /* ---------- появление блоков при прокрутке ---------- */
  var revealIO = null;
  if ("IntersectionObserver" in window && !reduce) {
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  }
  function watch(el) { if (revealIO) revealIO.observe(el); else el.classList.add("in"); }
  [["section h2", "left"], [".label.reveal", "left"], [".lead.reveal", "right"], [".controls.reveal", "down"],
   [".crit > div:nth-child(odd)", "left"], [".crit > div:nth-child(even)", "right"],
   [".mem > div:first-child", "left"], [".mem > div:last-child", "right"],
   [".src.reveal", "up"], [".note.reveal", "right"], [".quiz", "zoom"], [".carousel", "zoom"]
  ].forEach(function (m) { $$(m[0]).forEach(function (el) { if (el.classList.contains("reveal")) el.setAttribute("data-from", m[1]); }); });
  $$(".reveal").forEach(watch);
  setTimeout(function () {
    $$(".reveal:not(.in)").forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in"); });
  }, LOADER_MS + 1500);

  /* ---------- тема ---------- */
  $("#theme").addEventListener("click", function () {
    var r = document.documentElement, cur = r.getAttribute("data-theme");
    if (!cur) cur = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    r.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- заголовок по буквам ---------- */
  (function split() {
    var k = 0;
    $$("#title .w").forEach(function (w) {
      var txt = w.textContent; w.textContent = "";
      txt.split("").forEach(function (ch) {
        var s = document.createElement("span"); s.className = "ch"; s.style.setProperty("--k", k++); s.textContent = ch; w.appendChild(s);
      });
    });
  })();

  /* ---------- прокрутка: прогресс, наверх, параллакс, хронология ---------- */
  var bar = $("#progress"), toTop = $("#toTop"), hero = $("#hero"), tl = $("#tl"), tlFill = $("#tlFill"), ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight, vh = window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
    toTop.classList.toggle("show", y > 700);
    if (y < vh * 1.5 && !reduce) hero.style.setProperty("--sy", y);
    if (tl && tlFill) {
      var r = tl.getBoundingClientRect(), p = Math.max(0, Math.min(1, (vh * 0.62 - r.top) / r.height));
      tlFill.style.transform = "scaleY(" + p + ")";
      $$(".tl-item", tl).forEach(function (it) { it.classList.toggle("on", it.getBoundingClientRect().top < vh * 0.62); });
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- меню: подсветка текущего раздела ---------- */
  if ("IntersectionObserver" in window) {
    var links = $$(".nav-links a");
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("href") === "#" + e.target.id ? "true" : "false"); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$("main section[id]").forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- hero: мышь, прожектор, фото ---------- */
  if (fine && !reduce) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      hero.style.setProperty("--mx", (x / r.width - 0.5) * 2);
      hero.style.setProperty("--my", (y / r.height - 0.5) * 2);
      hero.style.setProperty("--cx", x + "px");
      hero.style.setProperty("--cy", y + "px");
    });
  }
  (function heroPhoto() {
    var im = new Image();
    im.onload = function () { var el = $("#heroPhoto"); el.style.backgroundImage = "url('" + im.src + "')"; el.classList.add("on"); };
    im.src = "img/hero.jpg";
  })();

  /* ---------- искры ---------- */
  (function sparks() {
    var cv = $("#sparks"); if (!cv || reduce || !cv.getContext) return;
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), P = [], run = true;
    function size() { var r = cv.parentNode.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function make(init) { return { x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: 1 + Math.random() * 2.4, v: 0.2 + Math.random() * 0.6, ph: Math.random() * 6.28, a: 0.3 + Math.random() * 0.6 }; }
    size();
    var n = Math.max(24, Math.min(70, Math.round(W / 22)));
    for (var i = 0; i < n; i++) P.push(make(true));
    window.addEventListener("resize", size);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { var was = run; run = en[0].isIntersecting; if (run && !was) loop(); }).observe(cv);
    function loop() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.y -= p.v; p.ph += 0.02; p.x += Math.sin(p.ph) * 0.4;
        if (p.y < -10) P[i] = make(false);
        var a = p.a * (0.55 + 0.45 * Math.sin(p.ph * 2));
        ctx.beginPath(); ctx.fillStyle = "rgba(227,185,60," + a + ")"; ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = "rgba(227,185,60," + a * 0.18 + ")"; ctx.arc(p.x, p.y, p.r * 3.2, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  })();

  /* ---------- счётчики ---------- */
  function countUp(el) {
    var to = parseInt(el.getAttribute("data-count"), 10), t0 = null, dur = 1600;
    if (reduce) { el.textContent = to; return; }
    el.textContent = "0";
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cIO.unobserve(e.target);
        setTimeout(function () { countUp(e.target); }, Math.max(0, LOADER_MS - performance.now()));
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (n) { cIO.observe(n); });
  }

  /* ---------- бегущая строка ---------- */
  (function marquee() {
    var track = $("#marqueeTrack"), PEOPLE = window.PEOPLE || [];
    var names = PEOPLE.filter(function (p) { return !p.pend; }).map(function (p) { var w = p.n.split(" "); return w[w.length - 1]; });
    var html = names.map(function (n) { return "<span>" + esc(n) + "</span>"; }).join("");
    track.innerHTML = html + html;
  })();

  /* ---------- фото: подключение с запасным вариантом ---------- */
  function wirePhotos(root) {
    $$(".ph img", root).forEach(function (img) {
      img.addEventListener("error", function () { img.remove(); });
      img.addEventListener("load", function () { img.classList.add("ok"); });
      if (img.complete && img.naturalWidth) img.classList.add("ok");
    });
  }

  /* ---------- галерея ---------- */
  var grid = $("#grid"), count = $("#count"), q = $("#q"), filter = "all", PEOPLE = window.PEOPLE || [];
  function render() {
    var term = q.value.trim().toLowerCase(), html = [], shown = 0;
    PEOPLE.forEach(function (p, i) {
      if (filter !== "all" && p.g !== filter) return;
      if (term && (p.n + " " + (p.place || "") + " " + p.role).toLowerCase().indexOf(term) < 0) return;
      var h = '<article class="card reveal' + (p.pend ? " pending" : "") + '" data-open="false" data-from="' + ["left", "up", "right"][shown % 3] + '" style="--d:' + (shown % 3) + '">';
      if (!p.pend) h += '<div class="ph"><span class="ph-ini">' + esc(initials(p.n)) + '</span><img src="img/' + esc(p.id) + '.jpg" alt="Фото: ' + esc(p.n) + '" loading="lazy"></div>';
      h += '<div class="card-body"><div class="top"><h3>' + esc(p.n) + "</h3>" + (p.y ? '<span class="years">' + esc(p.y) + "</span>" : "") + "</div>";
      h += '<div class="role">' + esc(p.role) + "</div>";
      if (p.place) h += '<div class="place">' + esc(p.place) + "</div>";
      h += "<p>" + esc(p.s) + "</p>";
      if (p.pend) h += '<span class="badge">Данные уточняются</span>';
      if (p.d) {
        var lk = p.links ? '<div class="card-links"><span>Источники:</span>' + p.links.map(function (l) { return '<a href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + "</a>"; }).join("") + "</div>" : "";
        h += '<div class="more" id="m' + i + '"><div class="more-in">' + p.d.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + lk + "</div></div>";
        h += '<button class="toggle" type="button" aria-expanded="false" aria-controls="m' + i + '">Подробнее</button>';
      }
      h += "</div></article>";
      html.push(h); shown++;
    });
    grid.innerHTML = html.length ? html.join("") : '<p class="empty">Никого не найдено. Измените запрос или фильтр.</p>';
    count.textContent = "Показано: " + shown + " из " + PEOPLE.length;
    wirePhotos(grid);
    $$(".card", grid).forEach(watch);
  }
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".toggle"); if (!b) return;
    var card = b.closest(".card"), open = card.getAttribute("data-open") === "true";
    card.setAttribute("data-open", open ? "false" : "true");
    b.setAttribute("aria-expanded", open ? "false" : "true");
    b.textContent = open ? "Подробнее" : "Свернуть";
  });
  if (fine && !reduce) { /* 3D-наклон карточек и блик */
    grid.addEventListener("pointermove", function (e) {
      var c = e.target.closest(".card"); if (!c) return;
      var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.setProperty("--ry", ((px - 0.5) * 10).toFixed(2) + "deg");
      c.style.setProperty("--rx", ((0.5 - py) * 8).toFixed(2) + "deg");
      c.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
      c.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
    });
    grid.addEventListener("mouseout", function (e) {
      var c = e.target.closest(".card"); if (!c || c.contains(e.relatedTarget)) return;
      c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg");
    });
  }
  $$(".chip").forEach(function (c) {
    c.addEventListener("click", function () {
      filter = c.getAttribute("data-f");
      $$(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      render();
    });
  });
  q.addEventListener("input", render);
  render();

  /* ---------- переход-шторка между разделами ---------- */
  var wipe = $("#wipe");
  function goTo(hash) {
    var t = hash === "#top" ? null : $(hash);
    if (hash !== "#top" && !t) return;
    var y = t ? Math.max(0, t.getBoundingClientRect().top + window.scrollY - 56) : 0;
    var root = document.documentElement;
    function jump() { root.style.scrollBehavior = "auto"; window.scrollTo(0, y); root.style.scrollBehavior = ""; }
    if (reduce) { jump(); return; }
    if (Math.abs(y - window.scrollY) < 500) { window.scrollTo({ top: y, behavior: "smooth" }); return; }
    wipe.style.transition = "transform .5s cubic-bezier(.7,0,.3,1)";
    wipe.style.transform = "translateY(0)";
    setTimeout(function () {
      jump();
      wipe.style.transition = "transform .6s cubic-bezier(.7,0,.3,1)";
      wipe.style.transform = "translateY(-101%)";
      setTimeout(function () { wipe.style.transition = "none"; wipe.style.transform = "translateY(101%)"; }, 700);
    }, 560);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var h = a.getAttribute("href"); if (h.length < 2) return;
    e.preventDefault(); goTo(h);
  });

  /* ---------- карусель героев ---------- */
  (function carousel() {
    var track = $("#carTrack"), dots = $("#carDots"), view = $("#carView"), timer = $("#carTimer"), box = $("#car");
    var S = PEOPLE.filter(function (p) { return p.feat; });
    if (!S.length || !track) return;
    var label = { war: "Защитники Отечества", sc: "Наука и культура", sp: "Спорт и космос" };
    track.innerHTML = S.map(function (p, i) {
      var last = p.n.split(" "); last = last[last.length - 1];
      return '<article class="slide" role="group" aria-roledescription="слайд" aria-label="' + (i + 1) + " из " + S.length + '">' +
        '<div class="ph slide-ph"><span class="ph-ini">' + esc(initials(p.n)) + '</span><img src="img/' + esc(p.id) + '.jpg" alt="Фото: ' + esc(p.n) + '" loading="lazy" draggable="false"></div>' +
        '<div class="slide-text"><p class="label" style="--j:0">' + esc(label[p.g]) + "</p>" +
        '<h3 style="--j:1">' + esc(p.n) + "</h3>" +
        '<p class="slide-role" style="--j:2">' + esc(p.role) + "</p>" +
        '<div class="slide-fact" style="--j:3"><b>' + esc(p.fact.v) + "</b><span>" + esc(p.fact.t) + "</span></div>" +
        '<p style="--j:4">' + esc(p.s) + "</p>" +
        '<button class="btn primary" style="--j:5" type="button" data-q="' + esc(last) + '">Открыть карточку</button></div></article>';
    }).join("");
    dots.innerHTML = S.map(function (p, i) { return '<button class="car-dot" type="button" aria-label="Слайд ' + (i + 1) + ': ' + esc(p.n) + '"></button>'; }).join("");
    wirePhotos(track);
    var slides = $$(".slide", track), dotEls = $$(".car-dot", dots), idx = 0, tm = null, hold = false, vis = true;
    function startTimer() {
      clearTimeout(tm); timer.classList.remove("run"); void timer.offsetWidth;
      if (reduce || hold || !vis) return;
      timer.classList.add("run"); tm = setTimeout(function () { go(idx + 1); }, 7000);
    }
    function go(n) {
      idx = (n + S.length) % S.length;
      track.style.transform = "translateX(" + (-idx * 100) + "%)";
      slides.forEach(function (s, i) { s.classList.toggle("active", i === idx); s.setAttribute("aria-hidden", i === idx ? "false" : "true"); });
      dotEls.forEach(function (d, i) { d.setAttribute("aria-current", i === idx ? "true" : "false"); });
      startTimer();
    }
    $("#carPrev").addEventListener("click", function () { go(idx - 1); });
    $("#carNext").addEventListener("click", function () { go(idx + 1); });
    dotEls.forEach(function (d, i) { d.addEventListener("click", function () { go(i); }); });
    view.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(idx - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { go(idx + 1); e.preventDefault(); }
    });
    track.addEventListener("click", function (e) {
      var b = e.target.closest("[data-q]"); if (!b) return;
      filter = "all"; q.value = b.getAttribute("data-q");
      $$(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-f") === "all" ? "true" : "false"); });
      render(); goTo("#people");
    });
    /* свайп и перетаскивание */
    var down = false, sx = 0, dx = 0;
    view.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button,a")) return;
      down = true; sx = e.clientX; dx = 0; track.classList.add("drag");
      try { view.setPointerCapture(e.pointerId); } catch (er) {}
    });
    view.addEventListener("pointermove", function (e) {
      if (!down) return; dx = e.clientX - sx;
      track.style.transform = "translateX(calc(" + (-idx * 100) + "% + " + dx + "px))";
    });
    function end() {
      if (!down) return; down = false; track.classList.remove("drag");
      if (dx < -50) go(idx + 1); else if (dx > 50) go(idx - 1); else go(idx);
    }
    view.addEventListener("pointerup", end); view.addEventListener("pointercancel", end);
    /* пауза при наведении, фокусе и когда карусель вне экрана */
    function hold_(v) { hold = v; box.querySelector(".car-timer").classList.toggle("paused", v); if (v) { clearTimeout(tm); timer.classList.remove("run"); } else startTimer(); }
    box.addEventListener("mouseenter", function () { if (fine) hold_(true); });
    box.addEventListener("mouseleave", function () { if (fine) hold_(false); });
    box.addEventListener("focusin", function () { hold_(true); });
    box.addEventListener("focusout", function () { hold_(false); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; startTimer(); }, { threshold: 0.35 }).observe(box);
    go(0);
  })();

  /* ---------- хронология ---------- */
  (function timeline() {
    var T = window.TIMELINE || [], frag = "";
    T.forEach(function (it) { frag += '<li class="tl-item reveal"><div class="tl-year">' + esc(it.y) + '</div><p class="tl-text">' + esc(it.t) + "</p></li>"; });
    tl.insertAdjacentHTML("beforeend", frag);
    $$(".tl-item", tl).forEach(watch);
    onScroll();
  })();

  /* ---------- места памяти ---------- */
  (function places() {
    var row = $("#placesRow"), PL = window.PLACES || [], h = "";
    PL.forEach(function (p, i) {
      h += '<article class="place reveal" style="--d:' + i + '"><div class="ph"><span class="ph-ini">' + esc(p.ini) + '</span><img src="img/places/' + esc(p.id) + '.jpg" alt="' + esc(p.t) + '" loading="lazy"></div>' +
        '<div class="place-cap"><h3>' + esc(p.t) + "</h3><p>" + esc(p.c) + "</p></div></article>";
    });
    row.innerHTML = h;
    wirePhotos(row);
    $$(".place", row).forEach(watch);
  })();

  /* ---------- «магнитные» кнопки ---------- */
  if (fine && !reduce) {
    $$(".btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px " + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px";
      });
      b.addEventListener("pointerleave", function () { b.style.translate = "0 0"; });
    });
  }

  /* ---------- викторина ---------- */
  var QZ = window.QUIZ || [], box = $("#quizBox"), qi = 0, score = 0;
  function showQ() {
    var it = QZ[qi];
    var h = '<div class="q-meta"><span>Вопрос ' + (qi + 1) + " из " + QZ.length + "</span><span>Верно: " + score + "</span></div>";
    h += '<div class="q-bar"><i style="width:' + (qi / QZ.length * 100) + '%"></i></div>';
    h += '<p class="q-text">' + esc(it.q) + '</p><div class="q-opts">';
    it.o.forEach(function (t, k) { h += '<button class="q-opt" type="button" data-k="' + k + '" style="--n:' + k + '">' + esc(t) + "</button>"; });
    h += '</div><div id="qfb"></div>';
    box.innerHTML = h;
  }
  function showResult() {
    var msg = score === QZ.length ? "Отлично. Вы знаете земляков." : score >= 5 ? "Хороший результат. Загляните в карточки ещё раз." : "Есть что узнать. Откройте галерею и попробуйте снова.";
    box.innerHTML = '<div class="q-meta"><span>Готово</span></div><div class="q-bar"><i style="width:100%"></i></div>' +
      '<p class="q-score">' + score + " из " + QZ.length + "</p><p>" + msg + '</p><button class="btn primary q-next" type="button" id="qrestart">Пройти заново</button>';
  }
  box.addEventListener("click", function (e) {
    var opt = e.target.closest(".q-opt"), it = QZ[qi];
    if (opt && !opt.disabled) {
      var k = parseInt(opt.getAttribute("data-k"), 10);
      $$(".q-opt", box).forEach(function (b, j) { b.disabled = true; if (j === it.a) b.classList.add("ok"); });
      if (k === it.a) score++; else opt.classList.add("no");
      $("#qfb").innerHTML = '<p class="q-note">' + esc(it.e) + '</p><button class="btn primary q-next" type="button" id="qnext">' + (qi + 1 < QZ.length ? "Дальше" : "Результат") + "</button>";
      return;
    }
    if (e.target.id === "qnext") { qi++; if (qi < QZ.length) showQ(); else showResult(); }
    if (e.target.id === "qrestart") { qi = 0; score = 0; showQ(); }
  });
  if (QZ.length) showQ();

  onScroll();
})();
