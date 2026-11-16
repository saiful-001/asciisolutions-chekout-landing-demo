/**
 * =========================================================================
 * খাঁটি মধু ও প্রিমিয়াম হানি নাট – অর্ডার ব্যাকএন্ড (Google Apps Script)
 * কাজ: অর্ডার, ভিজিটর অ্যাক্টিভিটি ও Pixel ইভেন্ট গুগল শিটে সংরক্ষণ (Orders, User Activity, Pixel Events, Report, Dashboard)
 * ওয়েবসাইটের কনটেন্ট/দাম পরিবর্তনের জন্য এখানে কিছু করতে হয় না – সেটা admin.html থেকে হয়।
 * =========================================================================
 *
 * 🚀 সেটআপ (একবারই):
 *    ১. গুগল শিট খুলুন ➔ Extensions ➔ Apps Script
 *    ২. পুরো কোড মুছে এই ফাইলের সব কোড পেস্ট করুন
 *    ৩. নিচে SPREADSHEET_ID ও SITE_URL ঠিক আছে কিনা দেখে Save (💾) করুন
 *    ৪. ড্রপডাউন থেকে "setupAll" সিলেক্ট করে ▶ Run চাপুন (Permission দিন)
 *    ৫. Deploy ➔ Manage deployments ➔ ✏️ ➔ Version: New version ➔ Deploy
 *       (নতুন করে করলে: New deployment ➔ Web app ➔ Execute as: Me ➔ Access: Anyone,
 *        তারপর /exec লিংক js/config.js এর apiEndpoint এ বসান)
 * =========================================================================
 */


/* =========================================================================
   ১. সেটিংস (শুধু এই অংশ এডিট করুন)
   ========================================================================= */

// আপনার গুগল শিটের লিংক অথবা আইডি (admin.html এর "Google Sheet ও API" পেজ থেকে Code.gs তৈরি করলে এটি নিজেই বসে যায়)
// খালি রাখলে: যে শিট থেকে Extensions → Apps Script খুলেছেন সেটিই ব্যবহার হবে
var SPREADSHEET_ID = "1Zj6Zr-Zm4ypDHxR8O4l2lyJ3P3U3kty1_VNgfsDP20A";

// 🌐 আপনার Vercel ওয়েবসাইটের লিংক (যেমন: https://my-honey.vercel.app)
//    এটি দিলে অর্ডারের দাম সবসময় ওয়েবসাইটের js/config.js থেকে যাচাই হয়, তাই
//    admin.html এ দাম বদলালে এখানে আলাদা করে কিছু বদলাতে হয় না।
//    খালি রাখলে নিচের ডিফল্ট দাম (PRODUCTS_CONFIG) ব্যবহার হবে।
var SITE_URL = "";

// অর্ডার জমা হওয়ার ট্যাবের নাম
var SHEET_NAME = "Orders";

// টাকার প্রতীক ও টাইমজোন
var CURRENCY = "৳";
var TIMEZONE = "Asia/Dhaka";

// ফ্রড/স্প্যাম প্রটেকশন: একই নাম্বার থেকে কত মিনিট পর আবার অর্ডার করা যাবে
var FRAUD_PROTECTION = { enabled: true, cooldownMinutes: 2 };   // একই নাম্বারে ২ মিনিটের মধ্যে আবার অর্ডার করলে ফ্রড এলার্ট

// ভিজিটর ট্র্যাকিং: প্রতি মিনিটে সর্বোচ্চ কতটি ট্র্যাকিং রিকোয়েস্ট নেওয়া হবে (অর্ডারকে অগ্রাধিকার দিতে)
var TRACK_LIMIT_PER_MIN = 90;


/* =========================================================================
   ২. ডিফল্ট পণ্য ও ডেলিভারি (SITE_URL খালি থাকলে এগুলোই ব্যবহার হবে)
   ========================================================================= */
var PRODUCTS_CONFIG = {
  "m500":   { name: "খাঁটি মধু – ৫০০ গ্রাম",                         price: 550 },
  "m1000":  { name: "খাঁটি মধু – ১ কেজি",                            price: 1050 },
  "hn500":  { name: "প্রিমিয়াম হানি নাট – ৫০০ গ্রাম",                 price: 650 },
  "hn1000": { name: "প্রিমিয়াম হানি নাট – ১ কেজি",                    price: 1250 },
  "combo":  { name: "মেগা কম্বো (১ কেজি মধু + ১ কেজি হানি নাট)",      price: 2200 }
};
var SHIPPING_CONFIG = {
  "dhaka":   { label: "ঢাকার ভিতরে",  charge: 60 },
  "outside": { label: "ঢাকার বাইরে", charge: 120 }
};
var FREE_SHIPPING_MIN_TOTAL = 0;
var MAX_QTY_PER_ITEM = 20;


/* =========================================================================
   ৩. শিটের কলাম ও স্ট্যাটাস
   ========================================================================= */
var HEADERS = [
  "Order ID", "Date & Time", "Customer Name", "Phone Number", "District / Area",
  "Full Address", "Ordered Products", "Total Items (Qty)", "Products Subtotal",
  "Delivery Method", "Delivery Charge", "Grand Total Bill", "Customer Note", "Order Status", "Traffic Source"
];
var COL_WIDTHS = [140, 165, 170, 130, 125, 250, 280, 100, 130, 125, 120, 140, 190, 120, 160];
var STATUS_COL = 14;                  // Order Status কলামের নম্বর (N)
var STATUSES = ["New", "Processing", "Delivered", "Cancelled"];
var FORMAT_ROWS = 3000;               // কতগুলো সারি আগে থেকেই সুন্দর ফরম্যাটে রাখা হবে
var DASH_SHEET = "Dashboard";
var ACT_SHEET = "User Activity";
var PIX_SHEET = "Pixel Events";
var REPORT_SHEET = "Report";


/* =========================================================================
   ৪. একবার চালানোর সেটআপ ("setupAll" সিলেক্ট করে ▶ Run)
   ========================================================================= */
function setupAll() {
  var ss = getSS_();
  try { ss.setSpreadsheetTimeZone(TIMEZONE); } catch (e) {}
  var sheet = getSheet_();
  formatOrderSheet_(sheet);
  getActivitySheet_(ss, true);
  getPixelSheet_(ss, true);
  buildReport_(ss);
  buildDashboard_(ss);
  try {   // ট্যাবের ক্রম: Orders, User Activity, Pixel Events, Report, Dashboard
    [SHEET_NAME, ACT_SHEET, PIX_SHEET, REPORT_SHEET, DASH_SHEET].forEach(function (n, i) {
      var sh = ss.getSheetByName(n); if (sh) { ss.setActiveSheet(sh); ss.moveActiveSheet(i + 1); }
    });
  } catch (e2) {}
  SpreadsheetApp.flush();
  Logger.log("✅ সেটআপ সম্পন্ন! Orders, User Activity, Pixel Events, Report ও Dashboard ট্যাব প্রস্তুত। এবার Deploy করুন।");
}
function runFormatDesign() { setupAll(); }   // পুরোনো নামও কাজ করবে


/* =========================================================================
   ৫. GET (শুধু স্ট্যাটাস) ও POST (অর্ডার গ্রহণ)
   ========================================================================= */
function doGet() {
  return json_({ success: true, message: "Order API চালু আছে ✅", time: new Date().toISOString() });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return json_({ success: false, error: "রিকোয়েস্ট সঠিক নয়।" });
  }
  if (data && data.action === "track") return handleTrack_(data);
  return handleOrder_(data);
}

/* ---------- অর্ডার ---------- */
function bnNum_(n) { return String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; }); }

function fraudResponse_(phone, existing, minutes) {
  return json_({
    success: false, fraudAlert: true,
    error: "⚠️ ফ্রড এলার্ট (Fraud Alert): এই মোবাইল নাম্বার (" + phone + ") দিয়ে কিছুক্ষণ আগেই একটি অর্ডার (" + existing + ") গ্রহণ করা হয়েছে। আপনার অর্ডারটি প্রক্রিয়াধীন রয়েছে, বারবার অর্ডার পাঠানোর প্রয়োজন নেই। প্রয়োজনে সরাসরি আমাদের নাম্বারে কল করুন। (" + bnNum_(minutes) + " মিনিট পর আবার অর্ডার করা যাবে)"
  });
}

function handleOrder_(data) {
  var cache = CacheService.getScriptCache();
  try {
    // ১) লক ছাড়াই যাচাই (যাতে লকের ভেতরের কাজ খুব ছোট থাকে)
    var cfg = getLiveConfig_();
    var validationError = validateOrder_(data, cfg);
    if (validationError) return json_({ success: false, error: validationError });

    var reqId = String(data.reqId || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
    if (reqId) {                                       // একই অর্ডার রিট্রাই হলে আবার সেভ হবে না
      var done = cache.get("req_" + reqId);
      if (done) return ContentService.createTextOutput(done).setMimeType(ContentService.MimeType.JSON);
    }

    var cleanPhone = normPhone_(data.phone);
    var minutes = Math.max(1, Number(cfg.fraudMinutes) || FRAUD_PROTECTION.cooldownMinutes);
    var fraudKey = "honey_guard_" + cleanPhone;
    if (FRAUD_PROTECTION && FRAUD_PROTECTION.enabled) {
      var existing = cache.get(fraudKey);
      if (existing) return fraudResponse_(cleanPhone, existing, minutes);
    }

    var items = parseOrderedItems_(data, cfg);
    if (!items.length) return json_({ success: false, error: "অনুগ্রহ করে কমপক্ষে একটি পণ্য সিলেক্ট করুন।" });

    // দাম সবসময় সার্ভারের কনফিগ থেকে (কাস্টমার ব্রাউজার থেকে নয়)
    var subtotal = 0, totalQty = 0, lines = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i], prod = cfg.products[it.id];
      var lineTotal = prod.price * it.qty;
      subtotal += lineTotal; totalQty += it.qty;
      lines.push(prod.name + " (" + it.qty + "টি - " + CURRENCY + lineTotal + ")");
    }
    var shipInfo = cfg.shipping[data.shippingId];
    var shipCharge = shipInfo.charge;
    if (cfg.freeShippingMin > 0 && subtotal >= cfg.freeShippingMin) shipCharge = 0;
    var grand = subtotal + shipCharge;

    // ২) একসাথে অনেকে অর্ডার করলে লাইনে দাঁড়িয়ে একটি একটি করে সেভ হবে
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(25000)) {
      return json_({ success: false, busy: true, error: "এই মুহূর্তে অনেকে অর্ডার করছেন। কয়েক সেকেন্ড অপেক্ষা করুন, নিজে থেকেই আবার চেষ্টা হবে।" });
    }
    try {
      if (reqId) {
        var done2 = cache.get("req_" + reqId);
        if (done2) return ContentService.createTextOutput(done2).setMimeType(ContentService.MimeType.JSON);
      }
      if (FRAUD_PROTECTION && FRAUD_PROTECTION.enabled) {
        var existing2 = cache.get(fraudKey);
        if (existing2) return fraudResponse_(cleanPhone, existing2, minutes);
      }

      var sheet = getSheet_();
      var orderId = nextOrderId_();
      var row = sheet.getLastRow() + 1;
      ensureCapacity_(sheet, row);

      var rowValues = [
        orderId, new Date(), clean_(data.name, 100), cleanPhone, clean_(data.district, 80), clean_(data.address, 350),
        lines.join(",\n"), totalQty, subtotal, shipInfo.label, shipCharge, grand,
        clean_(data.note || "কোনো নোট নেই", 300), "New", clean_(data.source || "direct", 80)
      ];
      sheet.getRange(row, 4).setNumberFormat("@");                     // ফোনের শুরুর ০ যেন না কাটে
      sheet.getRange(row, 1, 1, HEADERS.length).setValues([rowValues]);

      var result = { success: true, orderId: orderId, subtotal: subtotal, deliveryCharge: shipCharge, total: grand, itemsCount: totalQty, message: "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!" };
      try { cache.put(fraudKey, orderId, Math.max(60, minutes * 60)); } catch (c1) {}
      if (reqId) { try { cache.put("req_" + reqId, JSON.stringify(result), 600); } catch (c2) {} }
      return json_(result);
    } finally {
      try { lock.releaseLock(); } catch (x) {}
    }
  } catch (err) {
    return json_({ success: false, error: "সার্ভারে সাময়িক সমস্যা হয়েছে: " + err.message });
  }
}


/* =========================================================================
   ভিজিটর অ্যাক্টিভিটি ও Pixel ইভেন্ট সংরক্ষণ (অর্ডারের লকের সাথে সম্পর্কহীন – অর্ডার ধীর হয় না)
   ========================================================================= */
var PIXEL_EVENTS = { PageView: 1, ViewContent: 1, AddToCart: 1, InitiateCheckout: 1, Purchase: 1 };

function yn_(v) { return v ? "Yes" : "No"; }
function num_(v, max) { var n = Number(v); return isNaN(n) ? 0 : Math.max(0, Math.min(max || 1e9, Math.round(n))); }

function handleTrack_(d) {
  var sid = String(d.sid || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
  var a = d.a;
  if (!sid || !a || typeof a !== "object") return json_({ success: true, skipped: true });

  var cache = CacheService.getScriptCache();
  var mk = "trk_" + Utilities.formatDate(new Date(), TIMEZONE, "yyMMddHHmm");
  var n = parseInt(cache.get(mk) || "0", 10);
  if (n >= TRACK_LIMIT_PER_MIN) return json_({ success: true, skipped: true });
  try { cache.put(mk, String(n + 1), 90); } catch (e0) {}

  var lock = LockService.getDocumentLock();            // অর্ডারের (Script) লক থেকে আলাদা
  if (!lock.tryLock(4000)) return json_({ success: true, skipped: true });
  try {
    var ss = getSS_(), now = new Date();
    var act = getActivitySheet_(ss, false);
    var evNames = [];
    var evs = Array.isArray(d.ev) ? d.ev.slice(0, 20) : [];
    for (var k = 0; k < evs.length; k++) if (evs[k] && PIXEL_EVENTS[evs[k].n]) evNames.push(evs[k].n);

    var cached = cache.get("act_" + sid);
    var vals = [
      now, sid, clean_(a.src || "direct", 80), clean_(a.med, 60), clean_(a.camp, 80), clean_(a.ref, 80), clean_(a.dev, 20), clean_(a.scr, 20),
      clean_(a.land || "/", 80), num_(a.scroll, 100), num_(a.secs, 86400), num_(a.cta, 999), yn_(a.vs), yn_(a.chk), yn_(a.form), yn_(a.ord), clean_(a.oid, 40),
      "", now
    ];
    var row = cached ? parseInt(cached.split("|")[0], 10) : 0;
    var seen = cached ? cached.split("|").slice(1).join("|") : "";
    if (row > 1 && String(act.getRange(row, 2).getValue()) === sid) {
      var merged = (seen ? seen.split(",") : []).concat(evNames);
      vals[17] = merged.join(",");
      act.getRange(row, 2, 1, vals.length - 1).setValues([vals.slice(1)]);
      try { cache.put("act_" + sid, row + "|" + vals[17], 21600); } catch (e1) {}
    } else {
      row = act.getLastRow() + 1;
      ensureRows_(act, row, function (start, cnt) { fmtActivity_(act, start, cnt); });
      vals[17] = evNames.join(",");
      act.getRange(row, 1, 1, vals.length).setValues([vals]);
      try { cache.put("act_" + sid, row + "|" + vals[17], 21600); } catch (e2) {}
    }

    var out = [];
    for (var m = 0; m < evs.length; m++) {
      var ev = evs[m];
      if (!ev || !PIXEL_EVENTS[ev.n]) continue;
      out.push([now, sid, ev.n, num_(ev.v, 1e8), "BDT", clean_(ev.c, 80), clean_(ev.o, 40), clean_(a.src || "direct", 80), clean_(a.dev, 20)]);
    }
    if (out.length) {
      var pix = getPixelSheet_(ss, false), pr = pix.getLastRow() + 1;
      ensureRows_(pix, pr + out.length, function (start, cnt) { fmtPixel_(pix, start, cnt); });
      pix.getRange(pr, 1, out.length, 9).setValues(out);
    }
    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, error: "tracking: " + err.message });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}


/* =========================================================================
   ৬. দাম ও ডেলিভারি যাচাই (ওয়েবসাইটের js/config.js থেকে – এক জায়গা থেকেই সব)
   ========================================================================= */
function defaultLiveConfig_() {
  var products = {}, shipping = {}, k;
  for (k in PRODUCTS_CONFIG) products[k] = { name: PRODUCTS_CONFIG[k].name, price: PRODUCTS_CONFIG[k].price, active: true };
  for (k in SHIPPING_CONFIG) shipping[k] = { label: SHIPPING_CONFIG[k].label, charge: SHIPPING_CONFIG[k].charge };
  return { products: products, shipping: shipping, freeShippingMin: FREE_SHIPPING_MIN_TOTAL, maxQty: MAX_QTY_PER_ITEM, fraudMinutes: FRAUD_PROTECTION.cooldownMinutes };
}

function getLiveConfig_() {
  var url = String(SITE_URL || "").replace(/\/+$/, "");
  if (!url) return defaultLiveConfig_();

  var cache = CacheService.getScriptCache();
  var hit = cache.get("live_cfg");
  if (hit) { try { return JSON.parse(hit); } catch (e) {} }

  try {
    var res = UrlFetchApp.fetch(url + "/js/config.js?t=" + new Date().getTime(), { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error("config.js পাওয়া যায়নি (" + res.getResponseCode() + ")");
    var txt = res.getContentText();
    var c = JSON.parse(txt.substring(txt.indexOf("{"), txt.lastIndexOf("}") + 1));

    var out = defaultLiveConfig_();
    if (c.products && c.products.length) {
      out.products = {};
      for (var i = 0; i < c.products.length; i++) {
        var p = c.products[i];
        if (!p || !p.id) continue;
        out.products[p.id] = { name: String(p.name || p.id), price: Number(p.price) || 0, active: p.active !== false };
      }
    }
    if (c.shipping && c.shipping.length) {
      out.shipping = {};
      for (var j = 0; j < c.shipping.length; j++) {
        var sh = c.shipping[j];
        if (!sh || !sh.id) continue;
        out.shipping[sh.id] = { label: String(sh.label || sh.id), charge: Number(sh.charge) || 0 };
      }
    }
    if (c.freeShippingMinTotal !== undefined) out.freeShippingMin = Number(c.freeShippingMinTotal) || 0;
    if (c.maxQty !== undefined) out.maxQty = Number(c.maxQty) || MAX_QTY_PER_ITEM;
    if (c.fraudMinutes !== undefined) out.fraudMinutes = Number(c.fraudMinutes) || FRAUD_PROTECTION.cooldownMinutes;
    try { cache.put("live_cfg", JSON.stringify(out), 60); } catch (e2) {}
    return out;
  } catch (err) {
    return defaultLiveConfig_();       // ওয়েবসাইট না পেলে ডিফল্ট দাম
  }
}


/* =========================================================================
   ৭. অর্ডার সংক্রান্ত ফাংশন
   ========================================================================= */
function parseOrderedItems_(d, cfg) {
  var items = [];
  if (Array.isArray(d.items)) {
    for (var i = 0; i < d.items.length; i++) {
      var it = d.items[i];
      if (it && it.id && cfg.products[it.id] && cfg.products[it.id].active) {
        var q = parseInt(it.qty, 10);
        if (!isNaN(q) && q > 0) items.push({ id: it.id, qty: Math.min(q, cfg.maxQty) });
      }
    }
  }
  return items;
}

function validateOrder_(d, cfg) {
  if (!d || typeof d !== "object") return "অর্ডার রিকোয়েস্ট সঠিক নয়।";
  if (!d.name || String(d.name).trim().length < 2) return "অনুগ্রহ করে আপনার সঠিক নাম লিখুন।";
  if (!/^01[3-9]\d{8}$/.test(normPhone_(d.phone))) return "১১ ডিজিটের সঠিক মোবাইল নাম্বার দিন (যেমন: 01712345678)।";
  if (!d.district || String(d.district).trim().length < 2) return "আপনার জেলা বা এলাকার নাম দিন।";
  if (!d.address || String(d.address).trim().length < 6) return "সম্পূর্ণ বিস্তারিত ঠিকানা লিখুন।";
  if (!cfg.shipping[d.shippingId]) return "ডেলিভারি এলাকা নির্বাচন সঠিক নয়।";
  return null;
}

function normPhone_(v) {
  var s = String(v || "").replace(/[\s\-()]/g, "");
  s = s.replace(/[০-৯]/g, function (c) { return "০১২৩৪৫৬৭৮৯".indexOf(c); });
  return s.replace(/^\+?88/, "");
}

function clean_(v, maxLen) {
  var s = String(v == null ? "" : v).replace(/[\u0000-\u001f]+/g, " ").trim();
  if (maxLen && s.length > maxLen) s = s.substring(0, maxLen);
  return /^[=+\-@]/.test(s) ? "'" + s : s;       // শিট ফর্মুলা ইনজেকশন প্রতিরোধ
}

function nextOrderId_() {
  var day = Utilities.formatDate(new Date(), TIMEZONE, "yyMMdd");
  var props = PropertiesService.getScriptProperties();
  var key = "seq_" + day;
  var n = parseInt(props.getProperty(key) || "0", 10) + 1;
  props.setProperty(key, String(n));
  return "HN-" + day + "-" + ("000" + n).slice(-4);
}


/* =========================================================================
   ৮. গুগল শিট কানেকশন ও সুন্দর ফরম্যাটিং
   ========================================================================= */
function getSS_() {
  var rawId = String(SPREADSHEET_ID || "").trim(), ss;
  if (rawId) {
    var m = rawId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    try { ss = SpreadsheetApp.openById(m ? m[1] : rawId); }
    catch (e) { throw new Error("SPREADSHEET_ID ভুল বা অনুমতি নেই। (" + e.message + ")"); }
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!ss) throw new Error("গুগল শিট পাওয়া যায়নি। SPREADSHEET_ID দিন।");
  return ss;
}

function getSheet_() {
  var ss = getSS_();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    var all = ss.getSheets();
    if (all.length && all[0].getLastRow() <= 1 && all[0].getName() !== DASH_SHEET) {
      all[0].setName(SHEET_NAME);
      sheet = all[0];
    }
  }
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0 || String(sheet.getRange(1, 1).getValue()) !== HEADERS[0]) {
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      formatOrderSheet_(sheet);
      try { buildDashboard_(ss); } catch (e) {}
    } else {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
  }
  return sheet;
}

function ensureCapacity_(sheet, row) {
  var max = sheet.getMaxRows();
  if (row > max - 5) {
    sheet.insertRowsAfter(max, 1000);
    applyColumnFormats_(sheet, max + 1, 1000);
  }
}

function applyColumnFormats_(sheet, startRow, numRows) {
  var n = HEADERS.length;
  function col(c) { return sheet.getRange(startRow, c, numRows, 1); }
  sheet.getRange(startRow, 1, numRows, n).setFontFamily("Segoe UI").setFontSize(10).setVerticalAlignment("middle");
  col(1).setHorizontalAlignment("center").setFontWeight("bold").setFontColor("#1E293B");
  col(2).setHorizontalAlignment("center").setNumberFormat("dd-mmm-yyyy hh:mm AM/PM");
  col(3).setHorizontalAlignment("left").setFontWeight("bold").setFontColor("#0F172A");
  col(4).setHorizontalAlignment("center").setNumberFormat("@");
  col(5).setHorizontalAlignment("center");
  col(6).setHorizontalAlignment("left").setWrap(true);
  col(7).setHorizontalAlignment("left").setWrap(true);
  col(8).setHorizontalAlignment("center").setFontWeight("bold");
  col(9).setHorizontalAlignment("right").setNumberFormat('"৳"#,##0');
  col(10).setHorizontalAlignment("center");
  col(11).setHorizontalAlignment("right").setNumberFormat('"৳"#,##0');
  col(12).setHorizontalAlignment("right").setFontWeight("bold").setFontColor("#0F5132").setBackground("#E6F4EA").setNumberFormat('"৳"#,##0');
  col(13).setHorizontalAlignment("left").setWrap(true);
  col(15).setHorizontalAlignment("left");
  col(14).setHorizontalAlignment("center").setFontWeight("bold")
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build());
}

function formatOrderSheet_(sheet) {
  var n = HEADERS.length;
  var maxRows = sheet.getMaxRows();
  if (maxRows < FORMAT_ROWS) sheet.insertRowsAfter(maxRows, FORMAT_ROWS - maxRows);
  var total = sheet.getMaxRows();

  for (var c = 0; c < COL_WIDTHS.length; c++) sheet.setColumnWidth(c + 1, COL_WIDTHS[c]);

  // হেডার
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  sheet.setRowHeight(1, 42);
  sheet.getRange(1, 1, 1, n).setValues([HEADERS])
    .setFontWeight("bold").setFontSize(11).setFontFamily("Segoe UI")
    .setBackground("#0F5132").setFontColor("#FFFFFF")
    .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);

  // ডাটা সারির কলাম ফরম্যাট (একবারেই – অর্ডার সাবমিট তাই দ্রুত হয়)
  applyColumnFormats_(sheet, 2, total - 1);
  sheet.getRange(2, 1, total - 1, n).setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

  // জেব্রা স্ট্রাইপ (ব্যান্ডিং) – নতুন সারিতেও নিজে থেকে প্রযোজ্য
  try {
    var banded = sheet.getBandings();
    for (var b = 0; b < banded.length; b++) banded[b].remove();
    sheet.getRange(2, 1, total - 1, n).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)
      .setFirstRowColor("#FFFFFF").setSecondRowColor("#F8FAFC");
  } catch (e) {}

  // ফিল্টার
  try {
    var f = sheet.getFilter();
    if (f) f.remove();
    sheet.getRange(1, 1, total, n).createFilter();
  } catch (e2) {}

  // স্ট্যাটাস কালার
  var range = sheet.getRange(2, STATUS_COL, total - 1, 1);
  var defs = [["New", "#FEF3C7", "#92400E"], ["Processing", "#DBEAFE", "#1E40AF"], ["Delivered", "#D1FAE5", "#065F46"], ["Cancelled", "#FEE2E2", "#991B1B"]];
  var rules = [];
  for (var i = 0; i < defs.length; i++) {
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(defs[i][0]).setBackground(defs[i][1]).setFontColor(defs[i][2]).setRanges([range]).build());
  }
  sheet.setConditionalFormatRules(rules);

  // ট্যাব রঙ
  try { sheet.setTabColor("#0F5132"); } catch (e3) {}
}


/* =========================================================================
   ৮খ. User Activity, Pixel Events ও Report ট্যাব
   ========================================================================= */
var ACT_HEADERS = ["Date & Time", "Session ID", "Source", "Medium", "Campaign", "Referrer", "Device", "Screen", "Landing Page",
  "Max Scroll %", "Time on Page (sec)", "Order Btn Clicks", "Video Sound On", "Reached Checkout", "Started Form", "Ordered", "Order ID", "Pixel Events", "Last Update"];
var ACT_WIDTHS = [165, 150, 120, 100, 130, 130, 90, 90, 110, 100, 120, 110, 110, 120, 105, 90, 140, 260, 165];
var PIX_HEADERS = ["Date & Time", "Session ID", "Event", "Value", "Currency", "Content IDs", "Order ID", "Source", "Device"];
var PIX_WIDTHS = [165, 150, 140, 100, 80, 160, 140, 130, 90];

function ensureRows_(sheet, row, fmt) {
  var max = sheet.getMaxRows();
  if (row > max - 5) {
    sheet.insertRowsAfter(max, 1500);
    if (fmt) fmt(max + 1, 1500);
  }
}

function styleHeader_(sh, headers, widths, color) {
  for (var c = 0; c < widths.length; c++) sh.setColumnWidth(c + 1, widths[c]);
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 40);
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setFontSize(11).setFontFamily("Segoe UI")
    .setBackground(color).setFontColor("#FFFFFF")
    .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
  try { sh.setTabColor(color); } catch (e) {}
}

function fmtActivity_(sh, start, count) {
  sh.getRange(start, 1, count, ACT_HEADERS.length).setFontFamily("Segoe UI").setFontSize(10).setVerticalAlignment("middle").setHorizontalAlignment("center");
  sh.getRange(start, 1, count, 1).setNumberFormat("dd-mmm-yyyy hh:mm AM/PM");
  sh.getRange(start, 19, count, 1).setNumberFormat("dd-mmm-yyyy hh:mm AM/PM");
  sh.getRange(start, 10, count, 1).setNumberFormat('0"%"');
  sh.getRange(start, 11, count, 1).setNumberFormat("0");
  sh.getRange(start, 9, count, 1).setHorizontalAlignment("left");
  sh.getRange(start, 18, count, 1).setHorizontalAlignment("left");
}
function getActivitySheet_(ss, force) {
  ss = ss || getSS_();
  var sh = ss.getSheetByName(ACT_SHEET), fresh = false;
  if (!sh) { sh = ss.insertSheet(ACT_SHEET); fresh = true; }
  if (fresh || force) {
    var total = Math.max(sh.getMaxRows(), 3000);
    if (sh.getMaxRows() < total) sh.insertRowsAfter(sh.getMaxRows(), total - sh.getMaxRows());
    styleHeader_(sh, ACT_HEADERS, ACT_WIDTHS, "#1E40AF");
    fmtActivity_(sh, 2, sh.getMaxRows() - 1);
    try {
      var f = sh.getFilter(); if (f) f.remove();
      sh.getRange(1, 1, sh.getMaxRows(), ACT_HEADERS.length).createFilter();
      var rule = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Yes").setBackground("#D1FAE5").setFontColor("#065F46")
        .setRanges([sh.getRange(2, 13, sh.getMaxRows() - 1, 4)]).build();
      sh.setConditionalFormatRules([rule]);
    } catch (e) {}
  }
  return sh;
}

function fmtPixel_(sh, start, count) {
  sh.getRange(start, 1, count, PIX_HEADERS.length).setFontFamily("Segoe UI").setFontSize(10).setVerticalAlignment("middle").setHorizontalAlignment("center");
  sh.getRange(start, 1, count, 1).setNumberFormat("dd-mmm-yyyy hh:mm AM/PM");
  sh.getRange(start, 4, count, 1).setNumberFormat('"৳"#,##0');
}
function getPixelSheet_(ss, force) {
  ss = ss || getSS_();
  var sh = ss.getSheetByName(PIX_SHEET), fresh = false;
  if (!sh) { sh = ss.insertSheet(PIX_SHEET); fresh = true; }
  if (fresh || force) {
    var total = Math.max(sh.getMaxRows(), 5000);
    if (sh.getMaxRows() < total) sh.insertRowsAfter(sh.getMaxRows(), total - sh.getMaxRows());
    styleHeader_(sh, PIX_HEADERS, PIX_WIDTHS, "#7C3AED");
    fmtPixel_(sh, 2, sh.getMaxRows() - 1);
    try {
      var f = sh.getFilter(); if (f) f.remove();
      sh.getRange(1, 1, sh.getMaxRows(), PIX_HEADERS.length).createFilter();
      var defs = [["Purchase", "#D1FAE5", "#065F46"], ["InitiateCheckout", "#FEF3C7", "#92400E"], ["AddToCart", "#DBEAFE", "#1E40AF"]];
      var rules = [];
      for (var i = 0; i < defs.length; i++) rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(defs[i][0]).setBackground(defs[i][1]).setFontColor(defs[i][2]).setRanges([sh.getRange(2, 3, sh.getMaxRows() - 1, 1)]).build());
      sh.setConditionalFormatRules(rules);
    } catch (e) {}
  }
  return sh;
}

/** Report ট্যাব: গত ১৪ দিনের ভিজিটর, অর্ডার, বিক্রি, কনভার্সন – সব ফর্মুলায় নিজে নিজে আপডেট হয় */
function buildReport_(ss) {
  var sh = ss.getSheetByName(REPORT_SHEET);
  if (!sh) sh = ss.insertSheet(REPORT_SHEET);
  sh.clear();
  sh.setHiddenGridlines(true);
  sh.setColumnWidths(1, 1, 24);
  sh.setColumnWidths(2, 8, 125);
  var O = "'" + SHEET_NAME + "'!", A = "'" + ACT_SHEET + "'!", P = "'" + PIX_SHEET + "'!";

  sh.getRange("B2").setValue("📈 রিপোর্ট (গত ১৪ দিন)").setFontSize(20).setFontWeight("bold").setFontColor("#0F5132");
  sh.getRange("B3").setValue("ভিজিটর = User Activity ট্যাব, অর্ডার/বিক্রি = Orders ট্যাব (ক্যানসেল বাদে), Purchase = Pixel Events ট্যাব").setFontColor("#64748B").setFontSize(10);

  var heads = ["তারিখ", "ভিজিটর", "চেকআউটে পৌঁছেছে", "অর্ডার", "বিক্রি", "কনভার্সন %", "গড় অর্ডার", "Pixel Purchase"];
  sh.getRange(5, 2, 1, heads.length).setValues([heads]).setFontWeight("bold").setBackground("#0F5132").setFontColor("#FFFFFF").setHorizontalAlignment("center").setWrap(true);
  sh.setRowHeight(5, 38);

  var rows = [];
  for (var k = 0; k < 14; k++) {
    var r = 6 + k;
    var d = "$B" + r;
    var actRange = A + "$A$2:$A", ordRange = O + "$B$2:$B", pixRange = P + "$A$2:$A";
    rows.push([
      "=TODAY()-" + k,
      "=COUNTIFS(" + actRange + ",\">=\"&" + d + "," + actRange + ",\"<\"&" + d + "+1)",
      "=COUNTIFS(" + actRange + ",\">=\"&" + d + "," + actRange + ",\"<\"&" + d + "+1," + A + "$N$2:$N,\"Yes\")",
      "=COUNTIFS(" + ordRange + ",\">=\"&" + d + "," + ordRange + ",\"<\"&" + d + "+1," + O + "$N$2:$N,\"<>Cancelled\")",
      "=SUMIFS(" + O + "$L$2:$L," + ordRange + ",\">=\"&" + d + "," + ordRange + ",\"<\"&" + d + "+1," + O + "$N$2:$N,\"<>Cancelled\")",
      "=IFERROR(E" + r + "/C" + r + ",0)",
      "=IFERROR(F" + r + "/E" + r + ",0)",
      "=COUNTIFS(" + pixRange + ",\">=\"&" + d + "," + pixRange + ",\"<\"&" + d + "+1," + P + "$C$2:$C,\"Purchase\")"
    ]);
  }
  sh.getRange(6, 2, 14, 8).setFormulas(rows).setHorizontalAlignment("center");
  sh.getRange(6, 2, 14, 1).setNumberFormat("dd-mmm-yyyy (ddd)");
  sh.getRange(6, 6, 14, 1).setNumberFormat('"৳"#,##0');
  sh.getRange(6, 7, 14, 1).setNumberFormat("0.0%");
  sh.getRange(6, 8, 14, 1).setNumberFormat('"৳"#,##0');
  sh.getRange("B20").setValue("মোট");
  sh.getRange("C20:F20").setFormulas([["=SUM(C6:C19)", "=SUM(D6:D19)", "=SUM(E6:E19)", "=SUM(F6:F19)"]]);
  sh.getRange("G20").setFormula("=IFERROR(E20/C20,0)");
  sh.getRange("H20").setFormula("=IFERROR(F20/E20,0)");
  sh.getRange("I20").setFormula("=SUM(I6:I19)");
  sh.getRange("B20:I20").setFontWeight("bold").setBackground("#E6F4EA").setHorizontalAlignment("center");
  sh.getRange("F20").setNumberFormat('"৳"#,##0'); sh.getRange("G20").setNumberFormat("0.0%"); sh.getRange("H20").setNumberFormat('"৳"#,##0');
  sh.getRange("B5:I20").setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

  sh.getRange("B23").setValue("🌐 ভিজিটর সোর্স").setFontWeight("bold").setFontSize(13);
  sh.getRange("B24").setFormula("=IFERROR(QUERY(" + A + "A1:S,\"select C, count(B) where C <> '' group by C order by count(B) desc limit 10 label C 'সোর্স', count(B) 'ভিজিটর'\",1),\"এখনো কোনো ডাটা নেই\")");
  sh.getRange("E23").setValue("🛒 সোর্স অনুযায়ী অর্ডার").setFontWeight("bold").setFontSize(13);
  sh.getRange("E24").setFormula("=IFERROR(QUERY(" + O + "A1:O,\"select O, count(A), sum(L) where A <> '' and N <> 'Cancelled' group by O order by count(A) desc limit 10 label O 'সোর্স', count(A) 'অর্ডার', sum(L) 'বিক্রি'\",1),\"এখনো কোনো অর্ডার নেই\")");
  sh.getRange("I23").setValue("📱 ডিভাইস").setFontWeight("bold").setFontSize(13);
  sh.getRange("I24").setFormula("=IFERROR(QUERY(" + A + "A1:S,\"select G, count(B) where G <> '' group by G order by count(B) desc label G 'ডিভাইস', count(B) 'ভিজিটর'\",1),\"এখনো কোনো ডাটা নেই\")");
  sh.getRange("B24:C24").setFontWeight("bold").setBackground("#1E40AF").setFontColor("#FFFFFF").setHorizontalAlignment("center");
  sh.getRange("E24:G24").setFontWeight("bold").setBackground("#0F5132").setFontColor("#FFFFFF").setHorizontalAlignment("center");
  sh.getRange("I24:J24").setFontWeight("bold").setBackground("#7C3AED").setFontColor("#FFFFFF").setHorizontalAlignment("center");
  sh.getRange("G25:G34").setNumberFormat('"৳"#,##0');
  try { sh.setTabColor("#059669"); } catch (e) {}
}


/* =========================================================================
   ৯. Dashboard ট্যাব (অটো হিসাব – অর্ডার আসার সাথে সাথে আপডেট)
   ========================================================================= */
function buildDashboard_(ss) {
  var sh = ss.getSheetByName(DASH_SHEET);
  if (!sh) sh = ss.insertSheet(DASH_SHEET);
  sh.clear();
  sh.setHiddenGridlines(true);
  sh.setColumnWidths(1, 1, 24);
  sh.setColumnWidths(2, 5, 170);
  var O = "'" + SHEET_NAME + "'!";

  sh.getRange("B2").setValue("🍯 অর্ডার ড্যাশবোর্ড").setFontSize(20).setFontWeight("bold").setFontColor("#0F5132");
  sh.getRange("B3").setValue("এই পাতা নিজে থেকে আপডেট হয় – কিছু এডিট করার দরকার নেই").setFontColor("#64748B").setFontSize(10);

  var cards = [
    ["মোট অর্ডার",        "=COUNTA(" + O + "A2:A)",                                         "#EFF6FF", "#1E40AF", "0"],
    ["আজকের অর্ডার",       "=COUNTIFS(" + O + "B2:B,\">=\"&TODAY())",                          "#FEF3C7", "#92400E", "0"],
    ["মোট বিক্রি (ক্যানসেল বাদে)", "=SUMIF(" + O + "N2:N,\"<>Cancelled\"," + O + "L2:L)",        "#E6F4EA", "#0F5132", '"৳"#,##0'],
    ["ডেলিভারি সম্পন্ন",    "=COUNTIF(" + O + "N2:N,\"Delivered\")",                            "#D1FAE5", "#065F46", "0"]
  ];
  for (var i = 0; i < cards.length; i++) {
    var col = 2 + i;
    sh.getRange(5, col).setValue(cards[i][0]).setFontSize(10).setFontColor(cards[i][3]).setBackground(cards[i][2]).setHorizontalAlignment("center").setWrap(true);
    sh.getRange(6, col).setFormula(cards[i][1]).setFontSize(22).setFontWeight("bold").setFontColor(cards[i][3]).setBackground(cards[i][2]).setHorizontalAlignment("center").setNumberFormat(cards[i][4]);
  }
  sh.setRowHeight(5, 34); sh.setRowHeight(6, 56);

  sh.getRange("B9").setValue("📦 অর্ডার স্ট্যাটাস").setFontWeight("bold").setFontSize(13).setFontColor("#0F172A");
  var stat = [["New", "নতুন"], ["Processing", "প্রসেসিং"], ["Delivered", "ডেলিভারড"], ["Cancelled", "ক্যানসেল"]];
  sh.getRange("B10:C10").setValues([["স্ট্যাটাস", "সংখ্যা"]]).setFontWeight("bold").setBackground("#0F5132").setFontColor("#FFFFFF").setHorizontalAlignment("center");
  for (var s = 0; s < stat.length; s++) {
    sh.getRange(11 + s, 2).setValue(stat[s][1] + " (" + stat[s][0] + ")");
    sh.getRange(11 + s, 3).setFormula("=COUNTIF(" + O + "N2:N,\"" + stat[s][0] + "\")").setHorizontalAlignment("center").setFontWeight("bold");
  }
  sh.getRange("B11:C14").setBorder(true, true, true, true, true, true, "#CBD5E1", SpreadsheetApp.BorderStyle.SOLID);

  sh.getRange("E9").setValue("📍 শীর্ষ ১০ জেলা").setFontWeight("bold").setFontSize(13).setFontColor("#0F172A");
  sh.getRange("E10").setFormula("=IFERROR(QUERY(" + O + "E1:E,\"select E, count(E) where E <> '' group by E order by count(E) desc limit 10 label E 'জেলা', count(E) 'অর্ডার'\",1),\"এখনো কোনো অর্ডার নেই\")");
  sh.getRange("E10:F10").setFontWeight("bold").setBackground("#0F5132").setFontColor("#FFFFFF").setHorizontalAlignment("center");

  sh.getRange("B23").setValue("🕒 সর্বশেষ ৫টি অর্ডার").setFontWeight("bold").setFontSize(13).setFontColor("#0F172A");
  sh.getRange("B24").setFormula("=IFERROR(QUERY(" + O + "A1:N,\"select A, C, E, L, N where A <> '' order by B desc limit 5 label A 'অর্ডার আইডি', C 'নাম', E 'জেলা', L 'মোট বিল', N 'স্ট্যাটাস'\",1),\"এখনো কোনো অর্ডার নেই\")");
  sh.getRange("B24:F24").setFontWeight("bold").setBackground("#0F5132").setFontColor("#FFFFFF").setHorizontalAlignment("center");
  sh.getRange("E25:E29").setNumberFormat('"৳"#,##0');
  try { sh.setTabColor("#E3A62A"); } catch (e) {}
  sh.setFrozenRows(0);
}


/* =========================================================================
   ১০. সাহায্যকারী
   ========================================================================= */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** টেস্ট: Apps Script থেকে ▶ Run করে একটি টেস্ট অর্ডার দিন */
function testOrder() {
  var res = doPost({
    postData: { contents: JSON.stringify({
      name: "টেস্ট কাস্টমার", phone: "01700000000", district: "ঢাকা",
      address: "মিরপুর-১০, ঢাকা", note: "এটি একটি টেস্ট অর্ডার", shippingId: "dhaka",
      items: [{ id: "m1000", qty: 1 }, { id: "hn1000", qty: 1 }]
    }) }
  });
  Logger.log("টেস্ট রেসপন্স: " + res.getContent());
}

/** টেস্ট: ভিজিটর অ্যাক্টিভিটি ও Pixel ইভেন্ট শিটে যাচ্ছে কিনা দেখতে ▶ Run করুন */
function testTrack() {
  var res = doPost({
    postData: { contents: JSON.stringify({
      action: "track", sid: "TEST" + new Date().getTime(),
      a: { src: "facebook", med: "cpc", camp: "test", ref: "", dev: "Mobile", scr: "390x844", land: "/", scroll: 80, secs: 42, cta: 2, vs: 1, chk: 1, form: 1, ord: 0, oid: "" },
      ev: [{ n: "PageView", v: 0, c: "", o: "" }, { n: "ViewContent", v: 1050, c: "m1000", o: "" }, { n: "InitiateCheckout", v: 1050, c: "", o: "" }]
    }) }
  });
  Logger.log("ট্র্যাকিং রেসপন্স: " + res.getContent());
}
