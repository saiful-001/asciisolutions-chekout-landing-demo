/* ==========================================================
   খাঁটি মধু ল্যান্ডিং পেজ – মূল অ্যাপ (হালকা ও লাইভ-আপডেট সাপোর্টসহ)
   - js/config.js           : ডিফল্ট কনটেন্ট
   - Admin Panel (Google Sheet) : আপনার পরিবর্তনগুলো এখানে সংরক্ষিত হয়
   এই ফাইলে কিছু এডিট করার দরকার নেই।
   ========================================================== */
(function () {
  "use strict";
  var D = window.SITE_CONFIG || {};   // ডিফল্ট কনফিগ
  var C = D;                          // বর্তমান (ডিফল্ট + অ্যাডমিন পরিবর্তন)
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };

  var toNum = function (v) {
    if (typeof v === "number") return isNaN(v) ? 0 : v;
    var s = String(v || "").replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^\d.]/g, "");
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };
  var bn = function (n) { return String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; }); };
  var money = function (n) { return (C.currency || "৳") + bn(toNum(n).toLocaleString("en-US")); };
  // [[text]] -> emphasised span
  var mark = function (s, cls) { return esc(s).replace(/\[\[(.+?)\]\]/g, '<em class="' + cls + '">$1</em>'); };

  /* ---------- কনফিগ মার্জ (অবজেক্ট = ডিপ মার্জ, অ্যারে = রিপ্লেস) ---------- */
  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
  function merge(a, b) {
    var out = Array.isArray(a) ? a.slice() : {}, k;
    if (isObj(a)) { for (k in a) out[k] = isObj(a[k]) ? merge(a[k], {}) : (Array.isArray(a[k]) ? a[k].slice() : a[k]); }
    if (isObj(b)) {
      for (k in b) {
        if (b[k] === undefined || b[k] === null) continue;
        out[k] = (isObj(b[k]) && isObj(out[k])) ? merge(out[k], b[k]) : b[k];
      }
    }
    return out;
  }
  var sig = {};
  function changed(k, v) {
    var s = JSON.stringify(v);
    if (sig[k] === s) return false;
    sig[k] = s; return true;
  }
  function txt(sel, v) { var e = $(sel); if (e) e.textContent = v == null ? "" : v; }

/* ---------- বাংলাদেশ এর ৬৪ জেলার তালিকা (বাংলা ও ইংরেজি নাম) ---------- */
  var DISTRICTS = [
    { bn: "ঢাকা", en: "Dhaka" },
    { bn: "চট্টগ্রাম", en: "Chattogram Chittagong" },
    { bn: "রাজশাহী", en: "Rajshahi" },
    { bn: "খুলনা", en: "Khulna" },
    { bn: "বরিশাল", en: "Barishal Barisal" },
    { bn: "সিলেট", en: "Sylhet" },
    { bn: "রংপুর", en: "Rangpur" },
    { bn: "ময়মনসিংহ", en: "Mymensingh" },
    { bn: "গাজীপুর", en: "Gazipur" },
    { bn: "নারায়ণগঞ্জ", en: "Narayanganj" },
    { bn: "কুমিল্লা", en: "Cumilla Comilla" },
    { bn: "বগুড়া", en: "Bogura Bogra" },
    { bn: "কক্সবাজার", en: "Cox's Bazar Coxsbazar" },
    { bn: "যশোর", en: "Jashore Jessore" },
    { bn: "দিনাজপুর", en: "Dinajpur" },
    { bn: "পাবনা", en: "Pabna" },
    { bn: "টাঙ্গাইল", en: "Tangail" },
    { bn: "ফরিদপুর", en: "Faridpur" },
    { bn: "নরসিংদী", en: "Narsingdi" },
    { bn: "কিশোরগঞ্জ", en: "Kishoreganj" },
    { bn: "ব্রাহ্মণবাড়িয়া", en: "Brahmanbaria" },
    { bn: "নোয়াখালী", en: "Noakhali" },
    { bn: "ফেনী", en: "Feni" },
    { bn: "চাঁদপুর", en: "Chandpur" },
    { bn: "লক্ষ্মীপুর", en: "Lakshmipur" },
    { bn: "হবিগঞ্জ", en: "Habiganj" },
    { bn: "মৌলভীবাজার", en: "Moulvibazar" },
    { bn: "সুনামগঞ্জ", en: "Sunamganj" },
    { bn: "কুষ্টিয়া", en: "Kushtia" },
    { bn: "ঝিনাইদহ", en: "Jhenaidah" },
    { bn: "সাতক্ষীরা", en: "Satkhira" },
    { bn: "বাগেরহাট", en: "Bagerhat" },
    { bn: "চুয়াডাঙ্গা", en: "Chuadanga" },
    { bn: "মেহেরপুর", en: "Meherpur" },
    { bn: "মাগুরা", en: "Magura" },
    { bn: "নড়াইল", en: "Narail" },
    { bn: "সিরাজগঞ্জ", en: "Sirajganj" },
    { bn: "নওগাঁ", en: "Naogaon" },
    { bn: "নাটোর", en: "Natore" },
    { bn: "চাঁপাইনবাবগঞ্জ", en: "Chapai Nawabganj" },
    { bn: "জয়পুরহাট", en: "Joypurhat" },
    { bn: "পটুয়াখালী", en: "Patuakhali" },
    { bn: "ভোলা", en: "Bhola" },
    { bn: "পিরোজপুর", en: "Pirojpur" },
    { bn: "বরগুনা", en: "Barguna" },
    { bn: "ঝালকাঠি", en: "Jhalakathi" },
    { bn: "জামালপুর", en: "Jamalpur" },
    { bn: "নেত্রকোণা", en: "Netrokona" },
    { bn: "শেরপুর", en: "Sherpur" },
    { bn: "গাইবান্ধা", en: "Gaibandha" },
    { bn: "কুড়িগ্রাম", en: "Kurigram" },
    { bn: "লালমনিরহাট", en: "Lalmonirhat" },
    { bn: "নীলফামারী", en: "Nilphamari" },
    { bn: "পঞ্চগড়", en: "Panchagarh" },
    { bn: "ঠাকুরগাঁও", en: "Thakurgaon" },
    { bn: "মানিকগঞ্জ", en: "Manikganj" },
    { bn: "মুন্সীগঞ্জ", en: "Munshiganj" },
    { bn: "গোপালগঞ্জ", en: "Gopalganj" },
    { bn: "মাদারীপুর", en: "Madaripur" },
    { bn: "শরীয়তপুর", en: "Shariatpur" },
    { bn: "রাজবাড়ী", en: "Rajbari" },
    { bn: "রাঙ্গামাটি", en: "Rangamati" },
    { bn: "বান্দরবান", en: "Bandarban" },
    { bn: "খাগড়াছড়ি", en: "Khagrachhari" }
  ];

  
/* ---------- placeholder images ---------- */
  function ph(label, w, h) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><rect width="100%" height="100%" fill="#d9d9d9"/><text x="50%" y="50%" fill="#777" font-family="sans-serif" font-size="' + Math.round(w / 14) + '" text-anchor="middle" dominant-baseline="middle">' + label + '</text></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  function src(name) { return /^(https?:)?\/\//.test(name) || name.indexOf("/") > -1 ? name : C.images.base + name + C.images.ext; }
  function img(name, label, w, h, alt) {
    var el = new Image();
    el.alt = alt || label; el.loading = "lazy";
    el.onerror = function () { el.onerror = null; el.src = ph(label, w, h); };
    el.src = src(name);
    return el;
  }

  
  /* ---------- সেকশন চালু/বন্ধ ও ক্রম ---------- */
  var SEC = {};
  $$("[data-sec]").forEach(function (el) { SEC[el.getAttribute("data-sec")] = el; });
  function secOn(id) { return id === "checkout" ? true : (C.sections || {})[id] !== false; }
  function applySections() {
    var order = C.order || [];
    Object.keys(SEC).forEach(function (id) {
      SEC[id].classList.toggle("sec-off", !secOn(id));
      var i = order.indexOf(id);
      SEC[id].style.order = i < 0 ? 50 : i;
    });
  }

  /* ---------- টেক্সট কনটেন্ট ---------- */
  function strip(sel, text) {
    var el = $(sel);
    if (!el || !changed("strip" + sel, text)) return;
    var html = mark(text || "", "r"), g = "";
    for (var i = 0; i < 4; i++) g += "<span>" + html + "</span>";
    el.innerHTML = '<div class="mq" aria-label="' + esc(String(text || "").replace(/\[\[|\]\]/g, "")) + '">' + g + g + "</div>";
  }
  function renderCopy() {
    var T = C.copy || {};
    if (C.pageTitle) document.title = C.pageTitle;
    var e;
    if ((e = $("#topHeading"))) e.innerHTML = mark(T.topHeading, "g");
    txt("#noticeText", T.notice);
    txt("#benefitsTitle", T.benefitsTitle);
    txt("#benefitsSub", T.benefitsSub);
    txt("#galleryTitle", T.galleryTitle);
    txt("#gallerySub", T.gallerySub);
    txt("#reviewsSub", T.reviewsSub);
    txt("#docsSub", T.docsSub);
    if ((e = $("#benefitsList"))) e.innerHTML = (T.benefits || []).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("");
    strip("#strip1", T.strip1);
    strip("#strip2", T.strip2);
    txt("#reviewsTitle", T.reviewsTitle);
    txt("#docsTitle", T.docsTitle);
    txt("#checkoutTitle", T.checkoutTitle);
    txt("#footMsg", T.footMsg);
    txt("#footCredit", T.footCredit);
    txt("#payNote", T.payNote);
    if ((e = $("#lnkPrivacy"))) e.href = T.privacyUrl || "#";
    if ((e = $("#lnkTerms"))) e.href = T.termsUrl || "#";
    if ((e = $("#legalLinks"))) e.style.display = T.showLegalLinks === false ? "none" : "";
    txt("#offerLine", T.offerLine);
    txt("#offerNote", T.offerNote);
    var oldEl = $("#offerOld");
    if (oldEl) { oldEl.style.display = T.offerOld ? "" : "none"; if (T.offerOld) oldEl.textContent = money(T.offerOld); }
    var list = prods(), firstPrice = list[0] ? list[0].price : 0;
    txt("#offerNew", money(T.offerNew || firstPrice));
    $$("[data-cta]").forEach(function (b) { if (T.ctaText) b.textContent = T.ctaText; });
    if (!state.busy) txt("#submitLabel", T.submitText || "অর্ডার কনফার্ম করুন");
  }

  /* ---------- লাইভ গুগল শিট ডেমো কার্ড ---------- */
  function sheetOn() { var d = C.sheetDemo; return !!(d && d.enabled !== false && d.url); }
  function renderSheetDemo() {
    var card = $("#sheetDemoCard");
    if (!card) return;
    if (!sheetOn()) { card.style.display = "none"; return; }
    card.style.display = "";
    var demo = C.sheetDemo;
    var btn = $("#sheetDemoBtn"), title = $("#sdcTitle"), desc = $("#sdcDesc"), btnTxt = $("#sdcBtnText");
    if (title && demo.title) title.textContent = demo.title;
    if (desc && demo.subtitle) desc.textContent = demo.subtitle;
    if (btnTxt && demo.btnText) btnTxt.textContent = demo.btnText;
    if (btn) btn.href = demo.url;
  }

  /* ---------- video (Fast Load + Instant Autoplay + Sound) ---------- */
  var vidKey = null, unmuteFn = null, ytMode = false;
  function autoUnmute(isScroll) {
    if (!unmuteFn || (isScroll && !ytMode)) return;
    var f = unmuteFn; unmuteFn = null; f();
  }
  window.addEventListener("click", function () { autoUnmute(false); });
  window.addEventListener("touchstart", function () { autoUnmute(false); }, { passive: true });
  window.addEventListener("scroll", function () { autoUnmute(true); }, { passive: true });

  function renderVideo() {
    var box = $("#videoBox");
    if (!box) return;
    var u = secOn("video") ? (C.videoUrl || "") : "";
    var key = u + "|" + (C.videoPoster || "");
    if (vidKey === key) return;
    vidKey = key; unmuteFn = null; ytMode = false;
    box.innerHTML = ""; box.style.background = "";
    if (!u) return;

    var isMp4 = /\.(mp4|webm)(\?|$)/i.test(u);
    var soundBtn = document.createElement("button");
    soundBtn.type = "button";
    soundBtn.className = "video-sound-btn";
    soundBtn.innerHTML = '<span class="vs-icon">🔇</span> সাউন্ড চালু করুন';

    if (isMp4) {
      box.innerHTML = '<video controls autoplay muted playsinline loop preload="metadata"' + (C.videoPoster ? ' poster="' + esc(C.videoPoster) + '"' : "") + ' src="' + esc(u) + '"></video>';
      box.appendChild(soundBtn);
      var vid = $("video", box);
      var unmuteMp4 = function () {
        if (vid) {
          vid.muted = false;
          vid.volume = 1.0;
          soundBtn.classList.add("unmuted");
          soundBtn.innerHTML = '<span class="vs-icon">🔊</span> সাউন্ড চালু আছে';
        }
      };
      soundBtn.onclick = function (e) { e.stopPropagation(); unmuteFn = null; unmuteMp4(); };
      unmuteFn = unmuteMp4;
    } else {
      ytMode = true;
      var yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w\-]+)/);
      var videoId = yt ? yt[1] : "";
      var embedUrl = videoId ? "https://www.youtube-nocookie.com/embed/" + videoId : u;

      if (videoId) {
        var pl = document.createElement("link"); pl.rel = "preconnect"; pl.href = "https://www.youtube-nocookie.com"; document.head.appendChild(pl);
        box.style.background = "#000 url('https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg') center/cover no-repeat";
      }

      var sep = embedUrl.indexOf("?") > -1 ? "&" : "?";
      if (!/autoplay=/i.test(embedUrl)) {
        embedUrl += sep + "autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1&controls=1";
      }

      box.innerHTML = '<iframe id="heroYtFrame" src="' + esc(embedUrl) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="eager" title="Video"></iframe>';
      box.appendChild(soundBtn);

      var iframe = $("#heroYtFrame", box);
      var unmuteYt = function () {
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "unMute", args: "" }), "*");
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [100] }), "*");
        soundBtn.classList.add("unmuted");
        soundBtn.innerHTML = '<span class="vs-icon">🔊</span> সাউন্ড চালু আছে';
        setTimeout(function () {
          soundBtn.style.opacity = "0";
          soundBtn.style.pointerEvents = "none";
        }, 2500);
      };
      soundBtn.onclick = function (e) { e.stopPropagation(); unmuteFn = null; unmuteYt(); };
      unmuteFn = unmuteYt;
    }
  }

  /* ---------- scroll to checkout ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-scroll-order]");
    if (!b) return;
    TR.cta();
    $("#checkout").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (!b.closest(".sticky-cta")) setTimeout(function () { var n = $("#name"); if (n) n.focus({ preventScroll: true }); }, 600);
  });

  /* ---------- carousels (গ্যালারি / রিভিউ / ডকুমেন্টস) ---------- */
  var RATIO = { gallery: "4/3", reviews: "3/4", documents: "3/4" };
  var CAR_SEC = { gallery: "gallery", reviews: "reviews", documents: "docs" };
  var CAR = {}, CUST = {};
  function ratioOf(key) { return RATIO[key] || (CUST[key] && CUST[key].ratio) || "4/3"; }
  function initCarousel(root) {
    var key = root.getAttribute("data-carousel");
    var st = CAR[key] = { names: [], idx: 0, per: 3, paused: false, inView: true, many: false };
    root.style.setProperty("--ratio", ratioOf(key));
    root.innerHTML = '<button class="c-nav c-prev" type="button" aria-label="আগের">‹</button><div class="c-view"><div class="c-track"></div></div><button class="c-nav c-next" type="button" aria-label="পরের">›</button><div class="c-dots"></div>';
    var track = $(".c-track", root), dots = $(".c-dots", root);
    function perView() { var w = window.innerWidth; return Math.min(w < 400 ? 2 : 3, st.names.length || 1); }
    function maxIdx() { return Math.max(0, st.names.length - st.per); }
    function render() {
      st.idx = Math.min(Math.max(st.idx, 0), maxIdx());
      track.style.transform = "translateX(" + (-st.idx * (100 / st.per)) + "%)";
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i === st.idx); d.setAttribute("aria-current", i === st.idx ? "true" : "false"); });
    }
    function build() {
      st.per = perView(); root.style.setProperty("--per", st.per);
      dots.innerHTML = "";
      for (var i = 0; i <= maxIdx(); i++) { (function (i) { var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "স্লাইড " + (i + 1)); b.onclick = function () { st.idx = i; render(); }; dots.appendChild(b); })(i); }
      st.many = maxIdx() > 0;
      $$(".c-nav", root).forEach(function (n) { n.style.display = st.many ? "" : "none"; });
      render();
    }
    function go(d) { st.idx = st.idx + d; if (st.idx > maxIdx()) st.idx = 0; if (st.idx < 0) st.idx = maxIdx(); render(); }
    st.go = go; st.build = build;
    st.set = function (names) {
      st.names = names || []; st.idx = 0;
      var label = (C.placeholderLabels || {})[key] || "ছবি";
      var dims = ratioOf(key) === "4/3" ? [600, 450] : [450, 600];
      track.innerHTML = "";
      st.names.forEach(function (n, i) {
        var s = document.createElement("div"); s.className = "c-slide";
        var f = document.createElement("div"); f.className = "frame";
        f.appendChild(img(n, label + " " + bn(i + 1), dims[0], dims[1]));
        s.appendChild(f); track.appendChild(s);
      });
      build();
    };
    $(".c-prev", root).onclick = function () { go(-1); };
    $(".c-next", root).onclick = function () { go(1); };
    var sx = null;
    root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; st.paused = true; }, { passive: true });
    root.addEventListener("touchend", function (e) { st.paused = false; if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); sx = null; });
    root.addEventListener("mouseenter", function () { st.paused = true; }, { passive: true });
    root.addEventListener("mouseleave", function () { st.paused = false; }, { passive: true });
    root.addEventListener("focusin", function () { st.paused = true; }, { passive: true });
    root.addEventListener("focusout", function () { st.paused = false; }, { passive: true });
    root.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); });
    if ("IntersectionObserver" in window) {
      st.inView = false;
      new IntersectionObserver(function (es) { st.inView = es[0].isIntersecting; }).observe(root);
    }
  }
  $$("[data-carousel]").forEach(initCarousel);
  window.addEventListener("resize", function () { Object.keys(CAR).forEach(function (k) { if (CAR[k].names.length) CAR[k].build(); }); });
  // অটোপ্লে: শুধু স্ক্রিনে দেখা গেলে চলবে (ব্যাটারি ও CPU সাশ্রয়)
  if (!reduce) setInterval(function () {
    if (document.hidden) return;
    Object.keys(CAR).forEach(function (k) { var st = CAR[k]; if (st.many && st.inView && !st.paused) st.go(1); });
  }, 3800);
  function renderCarousels() {
    Object.keys(CAR).forEach(function (key) {
      var names = CUST[key] ? (secOn(key) ? CUST[key].images : []) : (secOn(CAR_SEC[key]) ? ((C.images || {})[key] || []) : []);
      var label = (C.placeholderLabels || {})[key] || "";
      if (changed("car_" + key, [names, label, C.images && C.images.base, C.images && C.images.ext])) CAR[key].set(names);
    });
  }


  /* ---------- কাস্টম সেকশন (Admin Panel থেকে যোগ করা) ---------- */
  var CSEL = {};
  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null && text !== "") e.textContent = text; return e; }
  function csImg(name, label, alt) { var w = mk("div", "cs-img"); w.appendChild(img(name, label || "ছবি", 600, 450, alt)); return w; }
  function buildCustom(s) {
    var sec = mk("section", "cs bg-" + (s.bg || "cream") + " " + (s.align === "left" ? "left" : "center"));
    if (s.bg === "custom") { if (/^#[0-9a-fA-F]{3,8}$/.test(s.bgColor || "")) sec.style.background = s.bgColor; if (/^#[0-9a-fA-F]{3,8}$/.test(s.textColor || "")) sec.style.color = s.textColor; }
    var inn = mk("div", "cs-in"); sec.appendChild(inn);
    if (s.title) { var h = mk("h2", "", s.title); if (s.bg === "custom" && s.textColor) h.style.color = s.textColor; inn.appendChild(h); }
    if (s.subtitle) inn.appendChild(mk("p", "cs-subt", s.subtitle));
    if (s.text) inn.appendChild(mk("p", "cs-text", s.text));
    var imgs = (s.images || []).filter(Boolean), cards = (s.cards || []).filter(function (c) { return c && (c.title || c.text || c.image); });
    var car = null, i, g;
    if (s.layout === "slider" && imgs.length) { car = mk("div", "carousel"); car.setAttribute("data-carousel", "c_" + s.id); inn.appendChild(car); }
    else if (s.layout === "grid" && imgs.length) { g = mk("div", "cs-grid"); imgs.forEach(function (n, k) { g.appendChild(csImg(n, "ছবি " + bn(k + 1))); }); inn.appendChild(g); }
    else if (s.layout === "cards" && cards.length) {
      g = mk("div", "cs-cards");
      cards.forEach(function (c) {
        var d = mk("div", "cs-card"), b = mk("div", "cs-card-b");
        if (c.image) d.appendChild(csImg(c.image, c.title || "ছবি", c.title));
        if (c.title) b.appendChild(mk("h3", "", c.title));
        if (c.text) b.appendChild(mk("p", "", c.text));
        if (b.childNodes.length) d.appendChild(b);
        g.appendChild(d);
      });
      inn.appendChild(g);
    } else if (s.layout !== "slider" && s.layout !== "grid" && s.layout !== "cards" && imgs[0]) { g = mk("div", "cs-single"); g.appendChild(csImg(imgs[0], s.title || "ছবি", s.title)); inn.appendChild(g); }
    if (s.btnText && s.btnAction !== "none") {
      var wrap = mk("div", "s-cta"), b2;
      if (s.btnAction === "link" && s.btnLink) { b2 = mk("a", "btn-order", s.btnText); b2.href = s.btnLink; if (/^https?:/i.test(s.btnLink)) { b2.target = "_blank"; b2.rel = "noopener"; } }
      else { b2 = mk("button", "btn-order", s.btnText); b2.type = "button"; b2.setAttribute("data-scroll-order", ""); }
      wrap.appendChild(b2); inn.appendChild(wrap);
    }
    return { el: sec, car: car };
  }
  function renderCustom() {
    var list = C.custom || [], keep = {};
    list.forEach(function (s) {
      if (!s || !s.id) return;
      var id = "c_" + s.id; keep[id] = 1;
      if (!CSEL[id] || changed("cust_" + id, s)) {
        if (CSEL[id]) CSEL[id].remove();
        var r = buildCustom(s);
        document.body.insertBefore(r.el, SEC.footer || null);
        r.el.setAttribute("data-sec", id);
        CSEL[id] = r.el; SEC[id] = r.el;
        delete sig["car_" + id];
        delete CAR[id];
        if (r.car) { CUST[id] = { images: (s.images || []).filter(Boolean), ratio: s.ratio || "4/3" }; initCarousel(r.car); }
        else delete CUST[id];
      }
    });
    Object.keys(CSEL).forEach(function (id) {
      if (keep[id]) return;
      CSEL[id].remove(); delete CSEL[id]; delete SEC[id]; delete CAR[id]; delete CUST[id];
    });
  }

  /* ---------- বেনিফিট ও অফার ব্যাকগ্রাউন্ড ছবি ---------- */
  function renderPhotos() {
    var im = C.images || {};
    var card = $(".benefit-card");
    if (card) {
      var d = $(".benefit-img", card);
      if (im.benefit && secOn("benefits")) {
        if (!d) {
          d = document.createElement("div");
          d.className = "benefit-img";
          d.setAttribute("role", "img");
          d.setAttribute("aria-label", "মধুর ছবি");
          card.insertBefore(d, card.children[0]);
          card.insertBefore($(".bar", card), d);
        }
        d.style.backgroundImage = "url('" + im.benefit + "')";
      } else if (d) d.remove();
    }
    var offer = $(".s-offer");
    if (offer) {
      if (im.offerBg && secOn("offer")) offer.style.setProperty("--offer-bg", "url('" + im.offerBg + "')");
      else offer.style.removeProperty("--offer-bg");
    }
  }

  /* ---------- checkout (Multiple Products Support + Interactive Cart) ---------- */
  var state = { items: {}, sid: "dhaka", busy: false, touched: false };
  var pkgBox = $("#packages"), shipBox = $("#shipping"), sumListEl = $("#sumItemsList");
  function prods() { return (C.products || []).filter(function (p) { return p.active !== false; }); }
  var ship = function () { return (C.shipping || []).filter(function (s) { return s.id === state.sid; })[0]; };
  function defaultSid() { return C.defaultShipping || ((C.shipping || [])[0] && C.shipping[0].id) || "dhaka"; }
  function defProdId() {
    var l = prods();
    if (l.some(function (p) { return p.id === C.defaultProduct; })) return C.defaultProduct;
    return l[0] ? l[0].id : null;
  }
  function selectDefault() { var d = defProdId(); if (d) state.items[d] = 1; }
  function maxQty() { return C.maxQty || 20; }

  function renderProducts() {
    var list = prods();
    if (!changed("prods", [list, C.currency, (C.images || {}).products])) return;
    pkgBox.innerHTML = "";
    list.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "pkg";
      card.dataset.id = p.id;
      card.innerHTML =
        '<input type="checkbox" class="pkg-check" data-id="' + esc(p.id) + '" aria-label="' + esc(p.name) + '">' +
        '<span class="th"></span>' +
        '<div class="pkg-info">' +
          '<span class="nm">' + esc(p.name) + '</span>' +
          '<span class="pr">' + (p.oldPrice ? "<del>" + money(p.oldPrice) + "</del>" : "") + money(p.price) + '</span>' +
        '</div>' +
        '<div class="pkg-qty" data-id="' + esc(p.id) + '">' +
          '<button type="button" class="pq-btn minus" data-id="' + esc(p.id) + '" aria-label="কমান">−</button>' +
          '<span class="pkg-qty-num" data-id="' + esc(p.id) + '">১</span>' +
          '<button type="button" class="pq-btn plus" data-id="' + esc(p.id) + '" aria-label="বাড়ান">+</button>' +
        '</div>' +
        (p.badge ? '<span class="bd">' + esc(p.badge) + '</span>' : '');

      $(".th", card).replaceWith(img((C.images.products || {})[p.thumb] || p.thumb, "ছবি", 112, 112, p.name));
      pkgBox.appendChild(card);
    });
    Object.keys(state.items).forEach(function (id) { if (!list.some(function (p) { return p.id === id; })) delete state.items[id]; });
    if (!state.touched && !Object.keys(state.items).length) selectDefault();
    calc();
  }

  function renderShipping() {
    var list = C.shipping || [];
    if (!changed("ship", [list, C.currency])) return;
    shipBox.innerHTML = "";
    list.forEach(function (s) {
      var l = document.createElement("label");
      l.innerHTML = '<input type="radio" name="shipping" value="' + esc(s.id) + '"> ' + esc(s.label) + " – " + money(s.charge);
      shipBox.appendChild(l);
    });
    if (!list.some(function (s) { return s.id === state.sid; })) state.sid = defaultSid();
    calc();
  }

  /* ---------- Theme 2 & Theme 3 রেন্ডারার ---------- */
  function renderTheme2() {
    var t2Grid = $("#t2ProductGrid");
    if (t2Grid) {
      var list = prods();
      t2Grid.innerHTML = "";
      list.forEach(function (p) {
        var card = document.createElement("div");
        card.className = "t2-card";
        var thumb = (C.images.products || {})[p.thumb] || p.thumb;
        var oldHtml = p.oldPrice ? '<del class="t2-card-old">' + money(p.oldPrice) + '</del>' : '';
        card.innerHTML =
          '<div class="t2-card-thumb"></div>' +
          '<h3 class="t2-card-title">' + esc(p.name) + '</h3>' +
          '<div class="t2-card-price-bar">' + oldHtml + '<span class="t2-card-price">' + money(p.price) + '</span></div>' +
          '<button type="button" class="t2-card-btn" data-t2-order="' + esc(p.id) + '">🛒 অর্ডার করুন</button>';
        var thEl = $(".t2-card-thumb", card);
        thEl.appendChild(img(thumb, "ছবি", 300, 300, p.name));
        t2Grid.appendChild(card);
      });
    }

    var t2RevBox = $("#t2ReviewsGrid");
    if (t2RevBox) {
      var revs = (C.images && C.images.reviews) || [];
      t2RevBox.innerHTML = "";
      var showRevs = revs.slice(0, 3);
      if (showRevs.length === 0) showRevs = ["assets/reviews/review-1.svg", "assets/reviews/review-2.svg", "assets/reviews/review-3.svg"];
      showRevs.forEach(function (rItem, idx) {
        var it = document.createElement("div");
        it.className = "t2-rev-item";
        it.appendChild(img(rItem, "রিভিউ " + bn(idx + 1), 450, 600));
        t2RevBox.appendChild(it);
      });
    }

    var cp = C.copy || {};
    var list2 = prods(), fp2 = list2[0] ? list2[0].price : 999;
    txt("#t2HeroPrice", money(cp.offerNew || fp2));
    var oldEl2 = $("#t2HeroOldPrice");
    if (oldEl2) {
      if (cp.offerOld) { oldEl2.style.display = ""; oldEl2.textContent = money(cp.offerOld); }
      else oldEl2.style.display = "none";
    }
    if (C.contact && C.contact.phone) txt("#t2ContactPhone", C.contact.phone);
  }

  function renderTheme3() {
    var t3RevBox = $("#t3ReviewsGrid");
    if (t3RevBox) {
      var revs = (C.images && C.images.reviews) || [];
      t3RevBox.innerHTML = "";
      var showRevs = revs.slice(0, 5);
      if (showRevs.length === 0) showRevs = ["assets/reviews/review-1.svg", "assets/reviews/review-2.svg", "assets/reviews/review-3.svg", "assets/reviews/review-4.svg", "assets/reviews/review-5.svg"];
      showRevs.forEach(function (rItem, idx) {
        var it = document.createElement("div");
        it.className = "t3-rev-card";
        it.appendChild(img(rItem, "রিভিউ " + bn(idx + 1), 450, 600));
        t3RevBox.appendChild(it);
      });
    }

    var cp = C.copy || {};
    var list3 = prods(), fp3 = list3[0] ? list3[0].price : 999;
    txt("#t3PsNew", "অফার মূল্য " + money(cp.offerNew || fp3));
    var psOldEl = $("#t3PsOld");
    if (psOldEl) {
      if (cp.offerOld) { psOldEl.style.display = ""; psOldEl.textContent = "রেগুলার মূল্য " + money(cp.offerOld); }
      else psOldEl.style.display = "none";
    }

    var phone = (C.contact && C.contact.phone) || "01805986170";
    txt("#t3PhoneText", phone);
    txt("#t3MidPhoneText", phone);
    var pLink1 = $("#t3HeroPhone"), pLink2 = $("#t3MidPhone");
    if (pLink1) pLink1.href = "tel:" + phone.replace(/[^\d+]/g, "");
    if (pLink2) pLink2.href = "tel:" + phone.replace(/[^\d+]/g, "");
  }

  document.addEventListener("click", function (e) {
    var t2Btn = e.target.closest && e.target.closest("[data-t2-order]");
    if (t2Btn) {
      var pid = t2Btn.getAttribute("data-t2-order");
      if (pid) {
        state.touched = true;
        state.items[pid] = (state.items[pid] || 0) + 1;
        calc();
      }
      var chk = $("#checkout");
      if (chk) chk.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  });

  // বামপাশের প্রোডাক্ট কার্ডে ক্লিক বা পরিমাণ পরিবর্তনের হ্যান্ডলার
  pkgBox.addEventListener("click", function (e) {
    var minusBtn = e.target.closest(".minus");
    var plusBtn = e.target.closest(".plus");
    var chk = e.target.closest(".pkg-check");
    var card = e.target.closest(".pkg");
    if (!card) return;
    var pid = card.dataset.id;
    state.touched = true;

    if (minusBtn) {
      e.preventDefault();
      e.stopPropagation();
      var currentQty = state.items[pid] || 0;
      if (currentQty > 1) { state.items[pid] = currentQty - 1; } else { delete state.items[pid]; }
      calc();
      return;
    }
    if (plusBtn) {
      e.preventDefault();
      e.stopPropagation();
      var curQ = state.items[pid] || 0;
      if (curQ < maxQty()) { state.items[pid] = curQ + 1; }
      calc();
      return;
    }
    if (chk) {
      if (chk.checked) { state.items[pid] = state.items[pid] || 1; } else { delete state.items[pid]; }
      calc();
      return;
    }
    if (state.items[pid]) { delete state.items[pid]; } else { state.items[pid] = 1; }
    calc();
  });

  // ডানপাশের "আপনার অর্ডার" কার্ট থেকে পরিমাণ (+ / -) পরিবর্তনের হ্যান্ডলার
  if (sumListEl) {
    sumListEl.addEventListener("click", function (e) {
      var minusBtn = e.target.closest(".sci-btn.minus");
      var plusBtn = e.target.closest(".sci-btn.plus");
      var card = e.target.closest(".sum-cart-item");
      if (!card) return;
      var pid = card.dataset.id;
      if (!pid) return;
      state.touched = true;

      if (minusBtn) {
        e.preventDefault();
        e.stopPropagation();
        var cur = state.items[pid] || 0;
        if (cur > 1) { state.items[pid] = cur - 1; } else { delete state.items[pid]; }
        calc();
        return;
      }
      if (plusBtn) {
        e.preventDefault();
        e.stopPropagation();
        var curQ = state.items[pid] || 0;
        if (curQ < maxQty()) { state.items[pid] = curQ + 1; }
        calc();
        return;
      }
    });
  }

  shipBox.addEventListener("change", function (e) {
    if (e.target.name === "shipping") {
      state.sid = e.target.value;
      calc();
    }
  });

  // অর্ডার বিল ও সারাংশ হিসাব নিকাশ
  function calc() {
    var s = ship();
    var selectedList = [];
    var subtotal = 0;
    var list = prods();

    $$(".pkg", pkgBox).forEach(function (card) {
      var pid = card.dataset.id;
      var qty = state.items[pid] || 0;
      var isSelected = qty > 0;

      card.classList.toggle("sel", isSelected);
      var chk = $(".pkg-check", card);
      if (chk) chk.checked = isSelected;

      var qNum = $(".pkg-qty-num", card);
      if (qNum) qNum.textContent = bn(qty > 0 ? qty : 1);

      if (isSelected) {
        var p = list.filter(function (x) { return x.id === pid; })[0];
        if (p) {
          var itemTotal = p.price * qty;
          subtotal += itemTotal;
          selectedList.push({ product: p, qty: qty, total: itemTotal });
        }
      }
    });

    $$("input", shipBox).forEach(function (i) { i.checked = i.value === state.sid; });

    if (sumListEl) {
      if (selectedList.length === 0) {
        sumListEl.innerHTML = '<div class="sum-row empty-notice"><span>⚠️ কোনো পণ্য সিলেক্ট করা হয়নি (কমপক্ষে ১টি সিলেক্ট করুন)</span></div>';
      } else {
        sumListEl.innerHTML = selectedList.map(function (it) {
          var p = it.product;
          var hasOld = p.oldPrice && p.oldPrice > p.price;
          var saveAmount = hasOld ? (p.oldPrice - p.price) : 0;

          var pricesHtml = '<div class="sci-prices">';
          if (hasOld) { pricesHtml += '<del class="sci-real-price">' + money(p.oldPrice) + '</del>'; }
          pricesHtml += '<strong class="sci-sell-price">' + money(p.price) + '</strong>';
          if (hasOld) { pricesHtml += '<span class="sci-save">' + money(saveAmount) + ' ছাড়</span>'; }
          pricesHtml += '</div>';

          return '<div class="sum-cart-item" data-id="' + esc(p.id) + '">' +
            '<div class="sci-details">' +
              '<span class="sci-name">' + esc(p.name) + '</span>' +
              pricesHtml +
            '</div>' +
            '<div class="sci-action">' +
              '<div class="sci-qty">' +
                '<button type="button" class="sci-btn minus" data-id="' + esc(p.id) + '" aria-label="কমান">−</button>' +
                '<span class="sci-num">' + bn(it.qty) + '</span>' +
                '<button type="button" class="sci-btn plus" data-id="' + esc(p.id) + '" aria-label="বাড়ান">+</button>' +
              '</div>' +
              '<div class="sci-total-wrap">' +
                '<span class="sci-total-label">মোট দাম:</span>' +
                '<span class="sci-item-total">' + money(it.total) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join("");
      }
    }

    var shipCharge = s ? toNum(s.charge) : 0;
    var freeMin = toNum(C.freeShippingMinTotal);
    if (freeMin > 0 && subtotal >= freeMin) { shipCharge = 0; }
    var grandTotal = subtotal + (selectedList.length > 0 ? shipCharge : 0);

    if (state.touched) selectedList.forEach(function (it) { if (!prevSel[it.product.id]) TR.event("AddToCart", { value: it.total, content_ids: [it.product.id], content_type: "product" }); });
    prevSel = {}; selectedList.forEach(function (it) { prevSel[it.product.id] = 1; });
    $("#sumSub").textContent = money(subtotal);
    $("#sumShip").textContent = shipCharge === 0 && selectedList.length > 0 && freeMin > 0 ? "ফ্রি" : money(shipCharge);
    $("#sumTotal").textContent = money(grandTotal);

    return { subtotal: subtotal, discount: 0, shipping: shipCharge, total: grandTotal, items: selectedList };
  }

/* ---------- বাংলাদেশ এর ৬৪ জেলার সার্চ ও ড্রপডাউন হ্যান্ডলার ---------- */
  var distWrap = $("#distPickerWrap"),
      distTrigger = $("#distTriggerBox"),
      distInput = $("#district"),
      distOpenBtn = $("#distOpenBtn"),
      distBox = $("#distDropdown"),
      distSearchInput = $("#distSearchInput"),
      distClearBtn = $("#distClearBtn"),
      distDoSearchBtn = $("#distDoSearchBtn"),
      distCountText = $("#distCountText"),
      distOptionsList = $("#distOptionsList"),
      distCustomOption = $("#distCustomOption"),
      distCustomVal = $("#distCustomVal"),
      distUseCustomBtn = $("#distUseCustomBtn");

  var activeDistIdx = -1;
  var currentFilteredDistricts = DISTRICTS.slice();
  var isTouchScrolling = false;

  function selectDistrict(val) {
    if (!val) return;
    if (distInput) distInput.value = val;
    closeDistDropdown();
    setErr("district");
  }

  function renderDistrictOptions(list, selectedVal, isInitialOpen) {
    if (!distOptionsList) return;
    currentFilteredDistricts = list;
    activeDistIdx = -1;

    if (list.length === 0) {
      distOptionsList.innerHTML = '<div class="dist-empty-notice">⚠️ "' + esc(distSearchInput.value) + '" নামে কোনো জেলা পাওয়া যায়নি।<br>নিচের বাটনে ক্লিক করে সরাসরি এই এলাকা হিসেবে ব্যবহার করুন।</div>';
      return;
    }

    distOptionsList.innerHTML = list.map(function (d, i) {
      var isSel = selectedVal && selectedVal.trim().toLowerCase() === d.bn.toLowerCase();
      return '<div class="dist-option-item' + (isSel ? ' selected' : '') + '" data-val="' + esc(d.bn) + '" role="option" aria-selected="' + (isSel ? 'true' : 'false') + '">' +
        '<div class="dist-opt-left">' +
          '<span class="dist-opt-check">' + (isSel ? '✓' : '') + '</span>' +
          '<span class="dist-opt-bn">' + esc(d.bn) + '</span>' +
          '<span class="dist-opt-en">' + esc(d.en) + '</span>' +
        '</div>' +
        '<span class="dist-opt-tag">জেলা</span>' +
      '</div>';
    }).join("");

    // শুধুমাত্র প্রথমবার ওপেন করার সময় নির্বাচিত জেলা থাকলে স্ক্রোল করা
    if (isInitialOpen) {
      var selEl = distOptionsList.querySelector(".dist-option-item.selected");
      if (selEl) {
        setTimeout(function () {
          selEl.scrollIntoView({ block: "nearest" });
        }, 50);
      }
    }
  }

  function normTxt(s) {
    if (!s) return "";
    var str = String(s);
    if (str.normalize) str = str.normalize("NFC");
    return str.toLowerCase().replace(/\u09BC/g, "");
  }

  function filterDistrictsList(isInitialOpen) {
    var q = (distSearchInput ? distSearchInput.value : "").trim();
    var curVal = distInput ? distInput.value : "";

    if (distClearBtn) {
      distClearBtn.style.display = q ? "flex" : "none";
    }

    if (!q) {
      if (distCountText) distCountText.textContent = "মোট ৬৪টি জেলা";
      if (distCustomOption) distCustomOption.style.display = "none";
      renderDistrictOptions(DISTRICTS, curVal, isInitialOpen);
      return;
    }

    var qNorm = normTxt(q);
    var filtered = DISTRICTS.filter(function (d) {
      return normTxt(d.bn).indexOf(qNorm) > -1 || normTxt(d.en).indexOf(qNorm) > -1;
    });

    if (distCountText) {
      distCountText.textContent = filtered.length > 0 ? bn(filtered.length) + "টি জেলা পাওয়া গেছে" : "কোনো জেলা মেলেনি";
    }

    renderDistrictOptions(filtered, curVal, false);

    if (distCustomOption && distCustomVal) {
      distCustomVal.textContent = '"' + distSearchInput.value.trim() + '"';
      distCustomOption.style.display = "block";
    }
  }

  function openDistDropdown() {
    if (!distBox) return;
    distBox.classList.add("show");
    if (distTrigger) {
      distTrigger.classList.add("open");
      distTrigger.setAttribute("aria-expanded", "true");
    }
    if (distSearchInput) {
      distSearchInput.value = "";
      if (distClearBtn) distClearBtn.style.display = "none";
      setTimeout(function () {
        distSearchInput.focus();
      }, 80);
    }
    filterDistrictsList(true);
  }

  function closeDistDropdown() {
    if (!distBox) return;
    distBox.classList.remove("show");
    if (distTrigger) {
      distTrigger.classList.remove("open");
      distTrigger.setAttribute("aria-expanded", "false");
    }
    activeDistIdx = -1;
  }

  function toggleDistDropdown(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!distBox) return;
    if (distBox.classList.contains("show")) {
      closeDistDropdown();
    } else {
      openDistDropdown();
    }
  }

  if (distWrap && distTrigger && distBox) {
    distTrigger.addEventListener("click", toggleDistDropdown);

    distTrigger.addEventListener("keydown", function (e) {
      if (e.target !== distSearchInput && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
        e.preventDefault();
        openDistDropdown();
      }
    });

    // ড্রপডাউনের ভেতরে ক্লিক/টাচ করলে বাইরে ক্লিক হিসেবে গণ্য হওয়া ঠেকানো
    ["click", "mousedown", "pointerdown", "touchstart"].forEach(function (ev) {
      distBox.addEventListener(ev, function (e) {
        e.stopPropagation();
      }, { passive: ev === "touchstart" });
    });

    // টাচ স্ক্রল ট্র্যাকিং (মোবাইলে স্ক্রোল করার সময় অসাবধানতাবশত ক্লিক যেন না হয়)
    if (distOptionsList) {
      distOptionsList.addEventListener("touchstart", function () {
        isTouchScrolling = false;
      }, { passive: true });

      distOptionsList.addEventListener("touchmove", function () {
        isTouchScrolling = true;
      }, { passive: true });

      distOptionsList.addEventListener("click", function (e) {
        if (isTouchScrolling) return;
        var it = e.target.closest(".dist-option-item");
        if (!it) return;
        var val = it.dataset.val;
        if (val) selectDistrict(val);
      });
    }

    // সার্চ ইনপুটে টাইপিং
    if (distSearchInput) {
      distSearchInput.addEventListener("input", function () {
        filterDistrictsList(false);
      });

      distSearchInput.addEventListener("keydown", function (e) {
        // কিবোর্ড কম্পোজিশন (যেমন: অভ্র, রিদ্মিক, জিবোর্ড ইত্যাদি) চলাকালীন ইন্টারাপ্ট না করা
        if (e.isComposing || e.keyCode === 229) return;

        var items = distOptionsList ? distOptionsList.querySelectorAll(".dist-option-item") : [];
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (items.length > 0) {
            activeDistIdx = (activeDistIdx + 1) % items.length;
            items.forEach(function (el, i) { el.classList.toggle("active", i === activeDistIdx); });
            if (items[activeDistIdx]) items[activeDistIdx].scrollIntoView({ block: "nearest" });
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (items.length > 0) {
            activeDistIdx = (activeDistIdx - 1 + items.length) % items.length;
            items.forEach(function (el, i) { el.classList.toggle("active", i === activeDistIdx); });
            if (items[activeDistIdx]) items[activeDistIdx].scrollIntoView({ block: "nearest" });
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          // শুধুমাত্র যদি অ্যারো কি দিয়ে কোনো আইটেম সিলেক্ট করা থাকে, তবেই এন্টারে সিলেক্ট হবে
          if (activeDistIdx >= 0 && items[activeDistIdx]) {
            selectDistrict(items[activeDistIdx].dataset.val);
          } else {
            filterDistrictsList(false);
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeDistDropdown();
        }
      });
    }

    // ক্লিয়ার (✕) বাটন
    if (distClearBtn) {
      distClearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (distSearchInput) {
          distSearchInput.value = "";
          distSearchInput.focus();
        }
        filterDistrictsList(false);
      });
    }

    // সার্চ "খুঁজুন" বাটন
    if (distDoSearchBtn) {
      distDoSearchBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (currentFilteredDistricts.length > 0) {
          selectDistrict(currentFilteredDistricts[0].bn);
        } else if (distSearchInput && distSearchInput.value.trim()) {
          selectDistrict(distSearchInput.value.trim());
        } else if (distSearchInput) {
          distSearchInput.focus();
        }
      });
    }

    // কাস্টম এরিয়া বাটন
    if (distUseCustomBtn) {
      distUseCustomBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var custom = distSearchInput ? distSearchInput.value.trim() : "";
        if (custom) selectDistrict(custom);
      });
    }

    // বাইরে আসল ইউজার ক্লিক করলে তবেই ড্রপডাউন বন্ধ (সিন্থেটিক বা অটো ক্লিক ইগনোর)
    document.addEventListener("click", function (e) {
      if (!e.isTrusted) return;
      if (!distWrap || !distWrap.contains(e.target)) {
        closeDistDropdown();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeDistDropdown();
      }
    });
  }

  
/* validation */
  function normPhone(v) { return v.replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[\s\-()]/g, ""); }
  var BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;
  function setErr(name, msg) {
    var f = $("[data-err='" + name + "']").closest(".field");
    $("[data-err='" + name + "']").textContent = msg || ""; f.classList.toggle("bad", !!msg);
  }

  function validate() {
    var v = {
      name: $("#name").value.trim(),
      phone: normPhone($("#phone").value),
      district: $("#district").value.trim(),
      address: $("#address").value.trim()
    }, ok = true, first = null;

    function bad(k, m) { setErr(k, m); ok = false; if (!first) first = $("#" + k); }
    v.name.length < 2 ? bad("name", "আপনার নাম লিখুন") : setErr("name");
    !BD_PHONE.test(v.phone) ? bad("phone", "সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন 01712345678)") : setErr("phone");
    v.district.length < 2 ? bad("district", "জেলা বা এলাকার নাম নির্বাচন করুন") : setErr("district");
    v.address.length < 6 ? bad("address", "সম্পূর্ণ ঠিকানা লিখুন") : setErr("address");
    if (first) first.focus();
    return ok ? v : null;
  }

  ["name", "phone", "district", "address"].forEach(function (k) {
    $("#" + k).addEventListener("input", function () { setErr(k); });
  });

  /* submit */
  var form = $("#orderForm"), btn = $("#submitBtn"), msg = $("#formMsg");
  function showMsg(type, text) { msg.className = "form-msg show " + type; msg.innerHTML = text; msg.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  function busy(on) { state.busy = on; btn.disabled = on; btn.classList.toggle("loading", on); $("#submitLabel").textContent = on ? "অর্ডার পাঠানো হচ্ছে…" : ((C.copy || {}).submitText || "অর্ডার কনফার্ম করুন"); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (state.busy) return;
    msg.className = "form-msg";

    if ($("#hp").value) return; // honeypot spam protection

    var t = calc();
    if (!t.items || t.items.length === 0) {
      showMsg("fail", "⚠️ অনুগ্রহ করে আপনার পছন্দের কমপক্ষে একটি পণ্য সিলেক্ট করুন।");
      $("#packages").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    var v = validate();
    if (!v) return;

    // ফ্রড এলার্ট ও ডুপ্লিকেট স্প্যাম প্রটেকশন (একই নাম্বার দিয়ে বারবার অর্ডার আটকানো)
    var FRAUD_COOLDOWN_MS = (C.fraudMinutes || 2) * 60 * 1000; // একই নাম্বারে কুলডাউন (ডিফল্ট ২ মিনিট)
    var lastOrderRaw = localStorage.getItem("honey_last_order");
    if (lastOrderRaw) {
      try {
        var lastOrder = JSON.parse(lastOrderRaw);
        var timePassed = Date.now() - (lastOrder.time || 0);
        if (lastOrder.phone === v.phone && timePassed < FRAUD_COOLDOWN_MS) {
          var secLeft = Math.ceil((FRAUD_COOLDOWN_MS - timePassed) / 1000);
          var waitTxt = secLeft > 60 ? bn(Math.ceil(secLeft / 60)) + " মিনিট" : bn(secLeft) + " সেকেন্ড";
          showMsg("fail", "⚠️ ফ্রড এলার্ট (Fraud Alert): আপনি এই মোবাইল নাম্বার দিয়ে কিছুক্ষণ আগেই একটি অর্ডার সম্পন্ন করেছেন (অর্ডার আইডি: " + esc(lastOrder.orderId || "") + ")। আপনার অর্ডারটি ইতোমধ্যে সফলভাবে গ্রহণ করা হয়েছে, বারবার অর্ডার পাঠানোর প্রয়োজন নেই। অর্ডারে কোনো পরিবর্তন করতে চাইলে সরাসরি আমাদের নম্বরে কল করুন। (" + waitTxt + " পর পুনরায় নতুন অর্ডার করা যাবে)");
          $("#checkout").scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      } catch (err) {}
    }

    if (!C.apiEndpoint) {
      showMsg("fail", "অর্ডার সিস্টেম এখনও কনফিগার করা হয়নি। js/config.js এ আপনার Google Apps Script এর apiEndpoint লিংক যুক্ত করুন। (README দেখুন)");
      return;
    }

    var payload = {
      name: v.name,
      phone: v.phone,
      district: v.district,
      address: v.address,
      note: $("#note").value.trim(),
      shippingId: state.sid,
      items: t.items.map(function (it) {
        return { id: it.product.id, name: it.product.name, price: it.product.price, qty: it.qty };
      }),
      clientTotal: t.total,
      submittedAt: new Date().toISOString()
    };

    busy(true);
    payload.reqId = state.reqId || (state.reqId = "R" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9));
    payload.sid = TR.sid;
    payload.source = TR.source();
    var attempts = 0;

    function fail(text) {
      state.reqId = null;
      busy(false);
      showMsg("fail", text);
    }
    function done(d) {
      state.reqId = null;
      var okText = "🎉 ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।<br>আপনার অর্ডার আইডি: <strong>" + esc(d.orderId) + "</strong> | সর্বমোট বিল: <strong>" + money(d.total) + "</strong>। আমরা অতি দ্রুত আপনার সাথে যোগাযোগ করব।";
      if (sheetOn()) {
        okText += '<br><a href="' + esc(C.sheetDemo.url) + '" target="_blank" rel="noopener noreferrer" class="order-sheet-link">📊 শিটে আপনার অর্ডারটি সেভ হওয়া এখনই দেখুন ➔</a>';
      }
      showMsg("ok", okText);
      TR.purchase(d.orderId, d.total, t.items.map(function (it) { return it.product.id; }));

      try {
        localStorage.setItem("honey_last_order", JSON.stringify({ phone: v.phone, orderId: d.orderId, time: Date.now() }));
      } catch (e) {}

      form.reset();
      state.items = {};
      state.touched = false;
      selectDefault();
      state.sid = defaultSid();
      calc();

      btn.disabled = true;
      setTimeout(function () { btn.disabled = false; }, 4000);
      state.busy = false;
      btn.classList.remove("loading");
      $("#submitLabel").textContent = (C.copy || {}).submitText || "অর্ডার কনফার্ম করুন";
    }
    // একসাথে অনেকে অর্ডার করলে সার্ভার একটি একটি করে সেভ করে; ব্যস্ত থাকলে একই reqId দিয়ে নিজে থেকে আবার চেষ্টা (ডুপ্লিকেট হয় না)
    function post() {
      attempts++;
      var ctl = new AbortController();
      var to = setTimeout(function () { ctl.abort(); }, 28000);
      fetch(C.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: ctl.signal
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          clearTimeout(to);
          if (d && d.success) return done(d);
          if (d && d.busy && attempts < 4) { $("#submitLabel").textContent = "অনেকে অর্ডার করছেন, অপেক্ষা করুন…"; return setTimeout(post, 1500 + attempts * 700); }
          fail((d && d.error) ? d.error : "অর্ডার সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন অথবা ফোনে যোগাযোগ করুন।");
        })
        .catch(function () {
          clearTimeout(to);
          if (attempts < 3) return setTimeout(post, 2000);
          busy(false);
          showMsg("fail", "সার্ভারের সাথে সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করার পূর্বে ফোনে যোগাযোগ করুন।");
        });
    }
    post();
  });


/* ---------- Lightbox (Desktop Slide + Phone Touch Swipe & Scroll) ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-label", "ছবি প্রদর্শনী");
  lb.innerHTML =
    '<div class="lb-inner">' +
      '<button type="button" class="lb-btn lb-close" aria-label="বন্ধ করুন">✕</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="পূর্ববর্তী ছবি">‹</button>' +
      '<div class="lb-stage">' +
        '<img src="" alt="" class="lb-img">' +
      '</div>' +
      '<button type="button" class="lb-btn lb-next" aria-label="পরবর্তী ছবি">›</button>' +
      '<div class="lb-caption">' +
        '<span class="lb-badge">ছবি <span id="lbCurrent">১</span> / <span id="lbTotal">১</span></span>' +
      '</div>' +
    '</div>';
  document.body.appendChild(lb);

  var lbImg = $(".lb-img", lb);
  var lbCurrent = $("#lbCurrent", lb);
  var lbTotal = $("#lbTotal", lb);
  var lbState = { images: [], index: 0 };
  var bnDigits = function (n) { return String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; }); };

  function renderLb() {
    if (!lbState.images.length) return;
    var cur = lbState.images[lbState.index];
    lbImg.style.opacity = "0";
    lbImg.style.transform = "scale(0.96)";
    setTimeout(function () {
      lbImg.src = cur.currentSrc || cur.src;
      lbImg.alt = cur.alt || "ছবি";
      lbImg.style.opacity = "1";
      lbImg.style.transform = "scale(1)";
    }, 110);
    if (lbCurrent) lbCurrent.textContent = bnDigits(lbState.index + 1);
    if (lbTotal) lbTotal.textContent = bnDigits(lbState.images.length);
  }

  function goLb(step) {
    if (!lbState.images.length) return;
    var len = lbState.images.length;
    lbState.index = (lbState.index + step + len) % len;
    renderLb();
  }

  function closeLb() {
    lb.classList.remove("open");
  }

  // গ্যালারি বা রিভিউ বা ডকুমেন্টের ছবিতে ক্লিক করলে লাইটবক্সে স্লাইড চালু
  document.addEventListener("click", function (e) {
    var im = e.target.closest && e.target.closest(".c-slide img,.cs-img img");
    if (!im) return;
    var carousel = im.closest("[data-carousel]");
    if (carousel) {
      var allImgs = Array.from(carousel.querySelectorAll(".c-slide img"));
      lbState.images = allImgs;
      lbState.index = Math.max(0, allImgs.indexOf(im));
    } else {
      lbState.images = [im];
      lbState.index = 0;
    }
    renderLb();
    lb.classList.add("open");
  });

  // লাইটবক্স নেভিগেশন বাটন
  $(".lb-close", lb).onclick = function (e) { e.stopPropagation(); closeLb(); };
  $(".lb-prev", lb).onclick = function (e) { e.stopPropagation(); goLb(-1); };
  $(".lb-next", lb).onclick = function (e) { e.stopPropagation(); goLb(1); };

  // ব্যাকগ্রাউন্ডে ক্লিক করলে লাইটবক্স ক্লোজ
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lb-stage") || e.target.classList.contains("lb-inner")) {
      closeLb();
    }
  });

  // কিবোর্ড অ্যারো নেভিগেশন (Escape, Left, Right)
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") goLb(-1);
    if (e.key === "ArrowRight") goLb(1);
  });

  // মোবাইলে টাচ সোয়াইপ (Swipe Left = Next, Swipe Right = Prev)
  var touchStartX = null;
  var touchStartY = null;
  lb.addEventListener("touchstart", function (e) {
    if (!lb.classList.contains("open") || !e.touches[0]) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lb.addEventListener("touchend", function (e) {
    if (touchStartX === null || !e.changedTouches[0]) return;
    var diffX = e.changedTouches[0].clientX - touchStartX;
    var diffY = e.changedTouches[0].clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        goLb(1); // সোয়াইপ লেফট -> পরের ছবি
      } else {
        goLb(-1); // সোয়াইপ রাইট -> আগের ছবি
      }
    }
  }, { passive: true });

  
  /* ---------- scroll reveal (একবারই সেট হয়) ---------- */
  var targets = $$(".s-video,.s-notice,.s-cta,.benefit-card,.s-gallery .carousel,.s-reviews .carousel,.s-docs .carousel,.s-offer>*,.co-left,.co-right,.bar");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12 });
    targets.forEach(function (t) { t.classList.add("reveal"); io.observe(t); });
  }

  /* ---------- sticky order bar ---------- */
  var bar = document.createElement("div"); bar.className = "sticky-cta"; bar.id = "stickyCta";
  bar.innerHTML = '<div class="sp"></div><button type="button" class="btn-order" data-scroll-order data-cta>👍 এখনই অর্ডার করুন</button>';
  document.body.appendChild(bar);
  var checkoutVisible = false, pastFirst = false, tick = false;
  function updSticky() {
    var best = null, bt = 1e9;
    $$(".s-cta").forEach(function (c) {
      if (!c.offsetParent) return;
      var t = c.getBoundingClientRect().bottom;
      var abs = t + window.pageYOffset;
      if (abs < bt) { bt = abs; best = c; }
    });
    pastFirst = best ? best.getBoundingClientRect().bottom < 0 : true;
    bar.classList.toggle("show", pastFirst && !checkoutVisible);
  }
  window.addEventListener("scroll", function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; updSticky(); }); }, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { checkoutVisible = es[0].isIntersecting; if (checkoutVisible) TR.flag("chk"); updSticky(); }, { threshold: .05 }).observe($("#checkout"));
  }
  function renderSticky() {
    var l = prods(), p = l.filter(function (x) { return x.id === C.defaultProduct; })[0] || l[0];
    var sp = $(".sp", bar);
    sp.innerHTML = p ? esc(p.name) + "<b>" + money(p.price) + "</b>" : "";
    updSticky();
  }

  /* ---------- ভাসমান যোগাযোগ বাটন ---------- */
  var fl = document.createElement("div"); fl.className = "floaters";
  function renderFloaters() {
    var ct = C.contact || {};
    if (!changed("contact", ct)) return;
    var h = "";
    if (ct.whatsapp) h += '<a class="wa" href="https://wa.me/' + String(ct.whatsapp).replace(/\D/g, "") + '" target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>';
    if (ct.phone) h += '<a class="tel" href="tel:' + String(ct.phone).replace(/[^\d+]/g, "") + '" aria-label="কল করুন">📞</a>';
    fl.innerHTML = h;
    if (h && !fl.parentNode) document.body.appendChild(fl);
    if (!h && fl.parentNode) fl.parentNode.removeChild(fl);
  }


  /* ---------- ট্র্যাকিং: Meta Pixel + ভিজিটর অ্যাক্টিভিটি (Google Sheet) ---------- */
  var TR = (function () {
    var st = { t0: Date.now(), scroll: 0, cta: 0, flags: {}, ev: [], sentEv: 0, flushes: 0, last: 0, pixel: false, ordered: false, oid: "" };
    var sid = "";
    try { sid = sessionStorage.getItem("hn_sid") || ""; if (!sid) { sid = "S" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); sessionStorage.setItem("hn_sid", sid); } } catch (e) { sid = "S" + Date.now().toString(36); }
    var q = {}; (location.search || "").replace(/^\?/, "").split("&").forEach(function (kv) { var a = kv.split("="); if (a[0]) { try { q[a[0]] = decodeURIComponent((a[1] || "").replace(/\+/g, " ")); } catch (e) {} } });
    var ref = ""; try { ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch (e) {}
    if (ref === location.hostname) ref = "";
    var src = q.utm_source || q.src || (q.fbclid ? "facebook" : "") || ref || "direct";
    var w = window.innerWidth, ua = navigator.userAgent || "";
    var dev = /Mobi|Android|iPhone/i.test(ua) ? "Mobile" : (/iPad|Tablet/i.test(ua) || (w >= 600 && w < 1000) ? "Tablet" : "Desktop");
    var sampled = true;
    try { var sm = sessionStorage.getItem("hn_smp"); if (sm === null) { sm = Math.random() * 100 < (((C.tracking || {}).sample) == null ? 100 : (C.tracking || {}).sample) ? "1" : "0"; sessionStorage.setItem("hn_smp", sm); } sampled = sm === "1"; } catch (e) {}
    function on() { return sampled && (C.tracking || {}).activity !== false && !!C.apiEndpoint && !/[?&]preview=1/.test(location.search); }
    function loadPixel() {
      var id = String((C.tracking || {}).fbPixelId || "").trim();
      if (st.pixel || !/^\d{5,20}$/.test(id) || /[?&]preview=1/.test(location.search)) return;
      st.pixel = true;
      (function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; if (s && s.parentNode) s.parentNode.insertBefore(t, s); else b.head.appendChild(t); })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", id);
    }
    function event(name, d) {
      d = d || {};
      st.ev.push({ t: Date.now(), n: name, v: d.value || 0, c: (d.content_ids || []).join(","), o: d.oid || "" });
      loadPixel();
      if (st.pixel && window.fbq) { var o = { currency: "BDT" }; for (var k in d) if (k !== "oid") o[k] = d[k]; window.fbq("track", name, o); }
    }
    function summary() {
      return { src: src, med: q.utm_medium || "", camp: q.utm_campaign || "", ref: ref, dev: dev, scr: screen.width + "x" + screen.height, land: location.pathname, scroll: Math.round(st.scroll),
        secs: Math.round((Date.now() - st.t0) / 1000), cta: st.cta, vs: st.flags.vs ? 1 : 0, chk: st.flags.chk ? 1 : 0, form: st.flags.form ? 1 : 0, ord: st.ordered ? 1 : 0, oid: st.oid };
    }
    function flush(force) {
      if (!on() || st.flushes >= 5) return;
      var now = Date.now(); if (!force && now - st.last < 8000) return;
      var evs = st.ev.slice(st.sentEv);
      st.last = now; st.flushes++; st.sentEv = st.ev.length;
      var body = JSON.stringify({ action: "track", sid: sid, a: summary(), ev: evs });
      try { if (navigator.sendBeacon && navigator.sendBeacon(C.apiEndpoint, new Blob([body], { type: "text/plain;charset=UTF-8" }))) return; } catch (e) {}
      try { fetch(C.apiEndpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body, keepalive: true, mode: "no-cors" }); } catch (e) {}
    }
    var tk = false;
    window.addEventListener("scroll", function () {
      if (tk) return; tk = true;
      requestAnimationFrame(function () { tk = false; var de = document.documentElement, p = (window.pageYOffset + window.innerHeight) / Math.max(1, de.scrollHeight) * 100; if (p > st.scroll) st.scroll = Math.min(100, p); });
    }, { passive: true });
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(false); });
    window.addEventListener("pagehide", function () { flush(false); });
    setTimeout(function () { flush(true); }, 40000 + Math.floor(Math.random() * 8000));   // দীর্ঘ সময় থাকলে একবার সেভ
    document.addEventListener("volumechange", function (e) { if (e.target && e.target.tagName === "VIDEO" && !e.target.muted) st.flags.vs = 1; }, true);
    return {
      sid: sid, source: function () { return src + (q.utm_campaign ? " / " + q.utm_campaign : ""); },
      event: event, flush: flush, pixelInit: loadPixel,
      flag: function (k) { st.flags[k] = 1; }, cta: function () { st.cta++; },
      purchase: function (oid, value, ids) { st.ordered = true; st.oid = oid; event("Purchase", { value: value, content_ids: ids, content_type: "product", oid: oid }); flush(true); },
      checkout: function () { if (!st.flags.form) { st.flags.form = 1; event("InitiateCheckout", { value: calcValue() }); } }
    };
  })();
  function calcValue() { var t = 0; prods().forEach(function (p) { if (state.items[p.id]) t += p.price * state.items[p.id]; }); return t; }
  var prevSel = {}, pvSent = false;
  document.addEventListener("focusin", function (e) { if (e.target && e.target.closest && e.target.closest("#orderForm") && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) TR.checkout(); });

  /* ---------- সবকিছু একসাথে রেন্ডার ---------- */
  function applyTheme() {
    var tid = C.themeId || "theme1";
    document.body.setAttribute("data-theme", tid);
    var t = C.theme || {}, st = document.documentElement.style;
    Object.keys(t).forEach(function (k) { if (/^#[0-9a-fA-F]{3,8}$/.test(t[k])) st.setProperty("--" + k, t[k]); });
  }
  function render(over) {
    C = merge(D, over || {});
    applyTheme();
    renderCustom();
    applySections();
    renderCopy();
    renderSheetDemo();
    renderVideo();
    renderCarousels();
    renderPhotos();
    renderProducts();
    renderShipping();
    renderTheme2();
    renderTheme3();
    renderCopy();            // দাম পরিবর্তনের পর অফার প্রাইস আবার ঠিক করা
    renderSticky();
    renderFloaters();
    calc();
  }

  /* ---------- Admin Panel লাইভ প্রিভিউ (index.html?preview=1 অথবা iframe postMessage) ---------- */
  var DK = "hn_admin_draft";
  var over = null;
  var rd = function (raw) { try { var j = typeof raw === "string" ? JSON.parse(raw || "null") : raw; return j && j.data ? j.data : (j || null); } catch (e) { return null; } };
  if (/[?&]preview=1/.test(location.search)) {
    try { over = rd(localStorage.getItem(DK)); } catch (e) {}
    window.addEventListener("storage", function (e) { if (e.key === DK && e.newValue) render(rd(e.newValue)); });
  }
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "hn_preview_update" && e.data.data) {
      render(e.data.data);
    }
  });
  render(over);
  (function () {
    var l = prods(), p = l.filter(function (x) { return x.id === C.defaultProduct; })[0] || l[0];
    TR.event("PageView");
    TR.event("ViewContent", { value: p ? p.price : 0, content_ids: p ? [p.id] : [], content_type: "product" });
  })();
})();
