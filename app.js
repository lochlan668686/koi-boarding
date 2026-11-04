import {
  ApiError,
  FARMS,
  RANKS,
  VARIETIES,
  boardingDays,
  breedTone,
  clearSession,
  createApi,
  draftCode,
  esc,
  eventLabel,
  fishStatus,
  formatDateTime,
  formatWeight,
  latestPhoto,
  messageOf,
  readSession,
  shanghaiToday,
  statusMeta,
  writeSession,
} from "./logic.js";

const app = document.getElementById("app");
const toastEl = document.getElementById("toast");
const api = createApi(localStorage);

const TEMPLATES = [
  { id: "巡池", placeholder: "一句就够，例如：红斑没有发白。" },
  { id: "喂食", placeholder: "一句就够，例如：抢食正常。" },
  { id: "状态", placeholder: "一句就够，例如：换水后稳定。" },
  { id: "池扬", placeholder: "出水后的一句，例如：尾筒有力。" },
];

const ui = {
  phone: "",
  password: "",
  loginError: "",
  query: "",
  onlyGap: false,
  busy: false,
  confirm: false,
  light: null,
  create: null,
  note: null,
  view: { kind: "loading", message: "正在打开寄养档案…" },
};

let toastTimer = 0;
let generation = 0;

function siteBase() {
  return document.documentElement.dataset.base || "./";
}

function mediaUrl(src) {
  if (!src) return "";
  if (/^(https?:|blob:|data:)/i.test(src)) return src;
  const base = siteBase();
  if (src.startsWith("/media/")) return `${base}static${src}`;
  if (src.startsWith("/")) return `${base.replace(/\/$/, "")}${src}`;
  return `${base}${src}`;
}

function seal() {
  return `<span class="seal" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13.2" fill="none" stroke="#c23a2e" stroke-width="1.4"/><circle cx="16" cy="16" r="8" fill="none" stroke="#a67c42" stroke-width="1"/><circle cx="16" cy="16" r="2.7" fill="#c23a2e"/></svg></span>`;
}

function koiSvg(color) {
  return `<svg viewBox="0 0 220 120" aria-hidden="true"><path fill="${color}" d="M34 60 10 42l12 18L10 78z"/><path fill="${color}" d="M32 60c18-26 70-32 118-14 18-16 40-16 54-4-16 8-16 16 0 26-14 12-36 12-54-4-48 16-100 10-118-4z"/><circle cx="162" cy="56" r="2.3" fill="#241c16"/></svg>`;
}

function silhouette(variety) {
  const [bg, ink] = breedTone(variety);
  return `<div class="silhouette" style="background:${bg};color:${ink}">${koiSvg(ink)}</div>`;
}

function photoBlock(src, variety, extra = "") {
  if (!src) return `<div class="photo">${silhouette(variety)}${extra}</div>`;
  return `<div class="photo"><img src="${esc(mediaUrl(src))}" alt="" data-fallback="${esc(variety)}">${extra}</div>`;
}

function statusPill(word) {
  const meta = statusMeta(word);
  return `<span class="status"><i class="dot" style="background:${meta.color}"></i>${esc(word)}</span>`;
}

function dayTail(pondInDate) {
  const days = boardingDays(pondInDate);
  return days === 0 ? "今天入池" : `${days}天`;
}

function dayPhrase(pondInDate) {
  const days = boardingDays(pondInDate);
  return days === 0 ? "今天入池" : `寄养 ${days} 天`;
}

function cardLine(fish) {
  return `${fish.code} · ${fish.variety} · ${dayTail(fish.pondInDate)}`;
}

function parseRoute() {
  let raw = location.hash.replace(/^#/, "");
  if (!raw || raw === "/") raw = "/pages/login/index";
  if (!raw.startsWith("/")) raw = `/${raw}`;
  const cut = raw.indexOf("?");
  const path = cut === -1 ? raw : raw.slice(0, cut);
  const params = new URLSearchParams(cut === -1 ? "" : raw.slice(cut + 1));
  return { path, params };
}

function session() {
  return readSession(localStorage);
}

async function call(path, options = {}) {
  const current = session();
  try {
    return await api(path, { ...options, token: options.token ?? current?.token ?? "" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && options.auth !== false) {
      clearSession(localStorage);
      if (parseRoute().path !== "/pages/login/index") location.hash = "/pages/login/index";
    }
    throw error;
  }
}

function hideToast() {
  clearTimeout(toastTimer);
  toastEl.hidden = true;
}

function toast(text) {
  toastEl.textContent = text;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 1800);
}

function captureFocus() {
  const el = document.activeElement;
  if (!el || !el.dataset || !el.dataset.field) return null;
  return { field: el.dataset.field, start: el.selectionStart, end: el.selectionEnd };
}

function restoreFocus(saved) {
  if (!saved) return;
  const el = app.querySelector(`[data-field="${CSS.escape(saved.field)}"]`);
  if (!el) return;
  el.focus();
  if (typeof saved.start === "number" && el.setSelectionRange) {
    try {
      el.setSelectionRange(saved.start, saved.end);
    } catch {
      /* date inputs */
    }
  }
}

function paint({ scroll = "keep" } = {}) {
  const saved = captureFocus();
  const y = scroll === "top" ? 0 : window.scrollY;
  app.innerHTML = renderShell(ui.view);
  window.scrollTo(0, y);
  restoreFocus(saved);
  app.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      const holder = document.createElement("div");
      holder.innerHTML = silhouette(img.dataset.fallback || "");
      img.replaceWith(holder.firstElementChild);
    });
  });
}

function renderShell(view) {
  return `${renderView(view)}${ui.confirm ? confirmDialog() : ""}${ui.light ? lightbox() : ""}`;
}

function renderView(view) {
  if (view.kind === "loading") return `<div class="page-status"><p class="title">${esc(view.message)}</p></div>`;
  if (view.kind === "error") {
    return `<div class="page-status"><h1 class="title">${esc(view.title)}</h1><p class="say">${esc(view.message)}</p>${view.action || ""}</div>`;
  }
  if (view.kind === "login") return renderLogin(view);
  if (view.kind === "list") return renderList(view);
  if (view.kind === "create") return renderCreate(view);
  if (view.kind === "detail") return renderDetail(view);
  if (view.kind === "share") return renderShare(view);
  return `<div class="page-status"><h1 class="title">这一页不存在</h1></div>`;
}

function renderLogin(view) {
  document.title = "锦鲤寄养助手";
  const resumed = view.farm
    ? `<div class="pad" style="padding-bottom:0"><p class="helper">当前是</p><p class="fish-name" style="margin-top:4px">${esc(view.farm.name)}</p><a class="btn btn-primary" style="margin-top:12px" href="#/pages/fish/list">继续看本场的鱼</a></div>`
    : "";
  return `
    <header class="topbar"><div class="brand">${seal()}<div><h1 class="title">锦鲤寄养</h1><p class="helper">渔场档案</p></div></div></header>
    <div class="hero-shot">${photoBlock("/media/seed/kohaku-1.jpg", "红白")}</div>
    <div class="intro">
      <h2 class="fish-name">每一尾，单独留档</h2>
      <p class="say">照片、寄养天数、池扬。客户打开链接，只看见自己的那一尾。</p>
    </div>
    ${resumed}
    <details class="demo">
      <summary>演示入口</summary>
      ${FARMS.map((farm) => `<button class="farm-jump" type="button" data-act="enter" data-phone="${esc(farm.phone)}"><span><span class="fish-name">${esc(farm.name)}</span><span class="helper" style="display:block;margin-top:2px">${esc(farm.region)} · ${esc(farm.phone)}</span></span><span class="go">进入</span></button>`).join("")}
      <p class="helper">三家密码都是 demo123。鱼只按渔场分开，互不可见。</p>
      <form class="manual" data-act="login-form">
        <label class="field"><span class="meta">手机号</span><input data-field="phone" inputmode="numeric" maxlength="11" autocomplete="username" value="${esc(ui.phone)}" placeholder="渔场手机号"></label>
        <label class="field"><span class="meta">密码</span><input data-field="password" type="password" autocomplete="current-password" value="${esc(ui.password)}" placeholder="密码"></label>
        ${ui.loginError ? `<p class="meta banner-error">${esc(ui.loginError)}</p>` : ""}
        <button class="btn btn-primary" style="margin-top:14px" type="submit" ${ui.busy ? "disabled" : ""}>${ui.busy ? "正在进入…" : "登录"}</button>
      </form>
    </details>
    <p class="helper foot" style="padding:22px 16px 28px">本程序只做寄养档案。不收款，不代收鱼款。</p>
  `;
}

function renderList(view) {
  document.title = view.farm.name;
  const gap = view.fish.filter((fish) => fishStatus(fish) === "待补拍");
  const pill = gap.length
    ? `<button type="button" class="pill hot ${ui.onlyGap ? "on" : ""}" data-act="toggle-gap" aria-pressed="${ui.onlyGap}">今日待补拍 ${gap.length}</button>`
    : `<p class="pill">今日待补拍 0</p>`;
  return `
    <header class="topbar">
      <div class="brand">${seal()}<div><h1 class="title">${esc(view.farm.name)}</h1><p class="helper">${esc(view.farm.region)} <button type="button" class="quiet-btn" data-act="ask-leave">离开</button></p></div></div>
      ${pill}
    </header>
    <div class="pad pad-fab">
      <input class="search" data-field="query" value="${esc(ui.query)}" placeholder="搜编号、品种或备注" enterkeyhint="search" aria-label="搜索本场的鱼">
      <div id="wall-host">${listWall(view)}</div>
    </div>
    ${view.fish.length ? `<a class="fab" href="#/pages/fish/create"><b>+</b> 建档</a>` : ""}
  `;
}

function listWall(view) {
  const keyword = ui.query.trim().toLowerCase();
  const rows = view.fish.filter((fish) => {
    if (ui.onlyGap && fishStatus(fish) !== "待补拍") return false;
    if (!keyword) return true;
    return [fish.code, fish.variety, fish.customerNote].join(" ").toLowerCase().includes(keyword);
  });
  if (!view.fish.length) {
    return `
      <div class="wall">
        <article class="fish-card ghost" aria-hidden="true">
          <div class="photo">${silhouette("红白")}</div>
          <p class="meta line">编号 · 品种 · 寄养天数</p>
        </article>
      </div>
      <a class="btn btn-primary" style="margin-top:16px" href="#/pages/fish/create">拍一张，建首尾档案</a>`;
  }
  if (!rows.length) return `<div class="wall"></div><p class="say">没有这尾鱼</p><p class="helper">换个词，或清空搜索。</p>`;
  return `<div class="wall">${rows
    .map(
      (fish) => `
      <a class="fish-card" href="#/pages/fish/detail?id=${esc(fish.id)}">
        ${photoBlock(fish.photos[0], fish.variety, statusPill(fishStatus(fish)))}
        <p class="meta line">${esc(cardLine(fish))}</p>
      </a>`,
    )
    .join("")}</div>`;
}

function renderCreate(view) {
  document.title = `建档 · ${view.farm.name}`;
  const draft = ui.create;
  const main = draft.photos[0];
  return `
    <header class="topbar">
      <a class="back" href="#/pages/fish/list">返回</a>
      <div style="flex:1"><h1 class="title">建档</h1><p class="helper">${esc(view.farm.name)}</p></div>
    </header>
    <div class="pad">
      <label class="shot">
        <input type="file" accept="image/*" data-file="create-main">
        ${photoBlock(main, draft.variety || "红白", `<span class="shot-caption"><strong>${main ? "换一张主图" : "拍一张，建首尾档案"}</strong></span>`)}
      </label>
      ${draft.photos.length > 1 ? `<div class="thumbs">${draft.photos.slice(1).map((src, index) => `<div class="mini"><img src="${esc(mediaUrl(src))}" alt=""><button type="button" data-act="rm-create" data-index="${index + 1}">移除</button></div>`).join("")}</div>` : ""}
      <label class="file-btn" style="margin-top:10px">再加照片<input type="file" accept="image/*" multiple data-file="create-more"></label>
      <p class="fish-name" style="margin-top:18px">品种</p>
      <div class="chips">${VARIETIES.map((item) => `<button type="button" class="chip ${draft.variety === item ? "on" : ""}" data-act="variety" data-id="${esc(item)}">${esc(item)}</button>`).join("")}</div>
      <label class="field"><span class="meta">或者写一个</span><input data-field="variety" maxlength="20" value="${esc(draft.variety)}" placeholder="例如 红白"></label>
      <div class="row-2">
        <label class="field"><span class="meta">编号</span><input data-field="code" maxlength="32" value="${esc(draft.code)}" placeholder="例如 DJ-034"></label>
        <label class="field"><span class="meta">入池</span><input data-field="date" type="date" value="${esc(draft.date)}"></label>
      </div>
      <p class="helper" style="margin-top:6px">编号已按本场往下排，可以改。</p>
      <details class="more" data-keep="note" ${draft.showNote ? "open" : ""}>
        <summary class="helper">客户备注</summary>
        <label class="field"><span class="meta">客户打开后能看见</span><textarea data-field="customerNote" maxlength="500" placeholder="例如：王先生寄养，下月取走。">${esc(draft.customerNote)}</textarea></label>
      </details>
      ${draft.error ? `<p class="meta banner-error">${esc(draft.error)}</p>` : ""}
      <button class="btn btn-primary" style="margin-top:16px" type="button" data-act="save-fish" ${ui.busy ? "disabled" : ""}>${ui.busy ? "正在写入…" : "写入本场档案"}</button>
    </div>
  `;
}

function storyText(item) {
  const label = eventLabel(item);
  let text = String(item.text || "").trim();
  if (text.startsWith(`${label}。`)) text = text.slice(label.length + 1).trim();
  else if (text.startsWith(`${label}，`)) text = text.slice(label.length + 1).trim();
  if (text === `${label}。`) text = "";
  return text;
}

function frames(photos, variety) {
  if (!photos?.length) return "";
  const group = photos.join("|");
  return `<div class="frames ${photos.length === 1 ? "single" : ""}">${photos
    .map(
      (src) =>
        `<button type="button" class="photo" data-act="open-photo" data-src="${esc(src)}" data-group="${esc(group)}"><img src="${esc(mediaUrl(src))}" alt="" data-fallback="${esc(variety)}"></button>`,
    )
    .join("")}</div>`;
}

function heroButton(src, variety, photos, extra = "") {
  const block = photoBlock(src, variety, extra);
  if (!src) return block;
  const group = (photos && photos.length ? photos : [src]).join("|");
  return `<button type="button" class="hero-btn" data-act="open-photo" data-src="${esc(src)}" data-group="${esc(group)}">${block}</button>`;
}

function timeline(events, variety) {
  if (!events.length) return `<p class="helper">还没有后续记录。</p>`;
  return `<div class="timeline">${events.map((item, index) => {
    const text = storyText(item);
    const weight = item.type === "pond_lift" && item.weightG ? `<p class="fish-name">${esc(formatWeight(item.weightG))}</p>${item.rank ? `<p class="meta">${esc(item.rank)}</p>` : ""}` : "";
    return `<article class="entry">
      <div class="rail"><i class="dot"></i>${index < events.length - 1 ? `<i class="stem"></i>` : ""}</div>
      <div style="padding-bottom:16px">
        <div class="entry-top"><span class="meta">${esc(eventLabel(item))}</span><time class="helper">${esc(formatDateTime(item.createdAt))}</time></div>
        ${weight}
        ${text ? `<p class="say">${esc(text)}</p>` : ""}
        ${frames(item.photos, variety)}
        ${item.video ? `<video class="clip" src="${esc(mediaUrl(item.video))}" controls playsinline ${item.photos?.[0] ? `poster="${esc(mediaUrl(item.photos[0]))}"` : ""}></video>` : ""}
      </div>
    </article>`;
  }).join("")}</div>`;
}

function renderDetail(view) {
  const fish = view.fish;
  const word = fishStatus(fish, view.events);
  document.title = `${fish.variety} · ${fish.code}`;
  const note = ui.note;
  const template = TEMPLATES.find((item) => item.id === note.template) || TEMPLATES[0];
  const lift = note.template === "池扬";
  return `
    <header class="topbar">
      <a class="back" href="#/pages/fish/list">返回</a>
      <div style="flex:1;min-width:0"><h1 class="title">${esc(view.farm.name)}</h1></div>
      <button type="button" class="text-btn" data-act="copy">发给客户</button>
    </header>
    <div class="pad">
      ${heroButton(fish.photos[0] || latestPhoto(fish, view.events), fish.variety, fish.photos, statusPill(word))}
      <h2 class="fish-name" style="margin-top:14px">${esc(fish.variety)}</h2>
      <p class="meta" style="margin-top:4px">${esc(fish.code)} · ${esc(dayPhrase(fish.pondInDate))}</p>
      <p class="helper" style="margin-top:4px">最近更新 ${esc(formatDateTime(fish.updatedAt))}</p>
      ${fish.customerNote ? `<blockquote class="quote say">${esc(fish.customerNote)}</blockquote>` : ""}
      <div class="stack">
        <a class="btn btn-line" href="#/pages/share/view?token=${esc(fish.shareToken)}">看客户看到的</a>
        <button type="button" class="btn btn-line" data-act="to-composer">记一笔</button>
      </div>
      <details class="more">
        <summary class="helper">查看链接</summary>
        <p class="helper link-text">${esc(shareUrl(fish.shareToken))}</p>
      </details>
      ${fish.photos.length > 1 ? `<div class="thumbs" style="margin-top:14px">${fish.photos.map((src) => `<button type="button" class="mini" data-act="open-photo" data-src="${esc(src)}" data-group="${esc(fish.photos.join("|"))}"><img src="${esc(mediaUrl(src))}" alt=""></button>`).join("")}</div>` : ""}
      <p class="fish-name" style="margin-top:26px">时间线</p>
      ${timeline(view.events, fish.variety)}
      <section class="composer" id="composer">
        <h3 class="fish-name">记一笔</h3>
        <p class="helper">选一种，写一句，可以多加几张照片。</p>
        <div class="chips">${TEMPLATES.map((item) => `<button type="button" class="chip ${note.template === item.id ? "on" : ""}" data-act="template" data-id="${item.id}">${item.id}</button>`).join("")}</div>
        ${lift ? `<label class="weight"><span class="meta">体重（克）</span><input data-field="weight" inputmode="decimal" value="${esc(note.weight)}" placeholder="1860"><span class="helper" id="jin">${esc(jinHint(note.weight))}</span><span class="meta" style="margin-top:10px">评级</span><div class="chips">${RANKS.map((rank) => `<button type="button" class="chip ${note.rank === rank ? "on" : ""}" data-act="rank" data-id="${esc(rank)}">${esc(rank)}</button>`).join("")}</div></label>` : ""}
        <label class="field"><span class="meta">一句</span><textarea data-field="sentence" maxlength="500" placeholder="${esc(template.placeholder)}">${esc(note.text)}</textarea></label>
        ${note.photos.length ? `<div class="thumbs">${note.photos.map((src, index) => `<div class="mini"><img src="${esc(mediaUrl(src))}" alt=""><button type="button" data-act="rm-note" data-index="${index}">移除</button></div>`).join("")}</div>` : ""}
        <div class="add-photos">
          <label class="file-btn">加照片<input type="file" accept="image/*" multiple data-file="note-photos"></label>
          ${lift ? `<label class="file-btn">${note.video ? "更换录像" : "可选池扬录像"}<input type="file" accept="video/*" data-file="note-video"></label>` : ""}
        </div>
        ${note.video ? `<video class="clip" src="${esc(mediaUrl(note.video))}" controls playsinline></video><button type="button" class="quiet-btn" data-act="rm-video">不用这段录像</button>` : ""}
        ${note.error ? `<p class="meta banner-error">${esc(note.error)}</p>` : ""}
        <button class="btn btn-primary" style="margin-top:14px" type="button" data-act="save-note" ${ui.busy ? "disabled" : ""}>${ui.busy ? "正在记下…" : `记下${note.template}`}</button>
      </section>
    </div>
  `;
}

function renderShare(view) {
  const fish = view.fish;
  const photo = latestPhoto(fish, view.events);
  document.title = `${view.farm.name} · 只读`;
  const back = view.back ? `<p class="center" style="margin-top:14px"><a class="back" href="#/pages/fish/detail?id=${esc(view.back)}">返回档案</a></p>` : "";
  return `
    <article class="cert-wrap">
      <div class="cert"><div class="cert-inner">
        <header class="cert-head">${seal()}<h1 class="title">${esc(view.farm.name)} · 只读</h1><p class="helper" style="margin-top:4px">${esc(view.farm.region)}</p></header>
        ${heroButton(photo, fish.variety, [photo].filter(Boolean))}
        <h2 class="fish-name center" style="margin-top:16px">${esc(fish.variety)}</h2>
        <p class="meta center" style="margin-top:4px">${esc(fish.code)}</p>
        <div class="days" style="justify-content:center"><b>${boardingDays(fish.pondInDate)}</b><span class="helper">寄养天数</span></div>
        <p class="meta center" style="margin-top:8px">最近更新 ${esc(formatDateTime(fish.updatedAt))}</p>
        ${fish.customerNote ? `<blockquote class="quote say">${esc(fish.customerNote)}</blockquote>` : ""}
        <p class="fish-name" style="margin-top:22px">时间线</p>
        ${timeline(view.events, fish.variety)}
        <p class="helper foot">看不到本场其他鱼</p>
        ${back}
      </div></div>
    </article>
  `;
}

function confirmDialog() {
  return `<div class="modal"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="leave-title"><h2 id="leave-title" class="title">离开这家渔场</h2><p class="say">离开后要重新登录，才能再看本场的鱼。</p><button type="button" class="btn btn-primary" style="margin-top:14px" data-act="leave">离开</button><button type="button" class="btn btn-line" data-act="stay">留下</button></div></div>`;
}

function lightbox() {
  const photos = ui.light.photos;
  const src = photos[ui.light.index];
  return `<div class="light" data-act="close-light"><button type="button" class="light-x" data-act="close-light">关闭</button><img src="${esc(mediaUrl(src))}" alt=""><div class="light-nav">${photos.length > 1 ? `<button type="button" data-act="light-prev">上一张</button><button type="button" data-act="light-next">下一张</button>` : ""}</div></div>`;
}

function shareUrl(token) {
  const url = new URL(location.href);
  url.hash = `/pages/share/view?token=${encodeURIComponent(token)}`;
  url.search = "";
  return url.toString();
}

function jinHint(raw) {
  const value = Number(raw);
  if (!raw || !Number.isFinite(value) || value <= 0) return "写克数，例如 1860";
  return formatWeight(value);
}

function freshNote(fishId) {
  return { fishId, template: "巡池", text: "", photos: [], video: "", weight: "", rank: "未评", error: "" };
}

async function compressImage(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("这张照片读不出来，换一张。"));
      image.src = objectUrl;
    });
    let edge = 1280;
    let quality = 0.74;
    let url = "";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const scale = Math.min(1, edge / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      url = canvas.toDataURL("image/jpeg", quality);
      if (url.length < 480000) break;
      edge = Math.round(edge * 0.82);
      quality = Math.max(0.5, quality - 0.08);
    }
    return url;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function readVideo(file) {
  if (file.size > 4_500_000) throw new Error("这段录像太长，换一段短的。");
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("录像没有读出来。"));
    reader.readAsDataURL(file);
  });
  if (data.length > 1_800_000) throw new Error("这段录像太大，换一段短的。");
  return data;
}

function ensureCreate(farm, fish) {
  if (ui.create && ui.create.farmId === farm.id) return;
  ui.create = {
    farmId: farm.id,
    code: draftCode(farm.id, fish),
    variety: "",
    customerNote: "",
    date: shanghaiToday(),
    photos: [],
    showNote: false,
    error: "",
  };
}

function ensureNote(fishId) {
  if (!ui.note || ui.note.fishId !== fishId) ui.note = freshNote(fishId);
}

async function route() {
  const gen = ++generation;
  const { path, params } = parseRoute();
  ui.confirm = false;
  hideToast();
  if (path === "/pages/share/view") {
    const token = params.get("token") || "";
    ui.view = { kind: "loading", message: "正在打开这尾鱼…" };
    paint({ scroll: "top" });
    try {
      if (!token) throw new ApiError("链接不完整。请让渔场再发一次。", 400);
      const data = await call(`/api/share/${encodeURIComponent(token)}`, { auth: false });
      if (gen !== generation) return;
      const current = session();
      let back = "";
      if (current?.farm?.id === data.farm.id) {
        try {
          const mine = await call("/api/fish");
          const hit = mine.fish.find((fish) => fish.shareToken === token);
          back = hit ? hit.id : "";
        } catch {
          back = "";
        }
      }
      ui.view = { kind: "share", ...data, back };
    } catch (error) {
      if (gen !== generation) return;
      ui.view = { kind: "error", title: "打不开这条分享", message: messageOf(error) };
    }
    paint({ scroll: "top" });
    return;
  }

  const current = await (async () => {
    const stored = session();
    if (!stored) return null;
    try {
      const me = await call("/api/auth/me");
      return { token: stored.token, farm: me.farm };
    } catch {
      return null;
    }
  })();
  if (gen !== generation) return;

  if (!current && path !== "/pages/login/index") {
    location.hash = "/pages/login/index";
    return;
  }

  if (path === "/pages/login/index") {
    ui.view = { kind: "login", farm: current?.farm || null };
    paint({ scroll: "top" });
    return;
  }

  if (path === "/pages/fish/list") {
    ui.view = { kind: "loading", message: "正在打开本场的鱼…" };
    paint({ scroll: "top" });
    try {
      const data = await call("/api/fish");
      if (gen !== generation) return;
      ui.view = { kind: "list", farm: data.farm, fish: data.fish };
    } catch (error) {
      if (gen !== generation) return;
      ui.view = { kind: "error", title: "没有读到档案", message: messageOf(error), action: `<button class="btn btn-primary" type="button" data-act="retry">重试</button>` };
    }
    paint({ scroll: "top" });
    return;
  }

  if (path === "/pages/fish/create") {
    try {
      const data = await call("/api/fish");
      if (gen !== generation) return;
      ensureCreate(data.farm, data.fish);
      ui.view = { kind: "create", farm: data.farm };
    } catch (error) {
      if (gen !== generation) return;
      ui.view = { kind: "error", title: "现在不能建档", message: messageOf(error) };
    }
    paint({ scroll: "top" });
    return;
  }

  if (path === "/pages/fish/detail") {
    const id = params.get("id") || "";
    ui.view = { kind: "loading", message: "正在打开这尾鱼…" };
    paint({ scroll: "top" });
    try {
      if (!id) throw new ApiError("缺少鱼只编号", 400);
      const data = await call(`/api/fish/${encodeURIComponent(id)}`);
      if (gen !== generation) return;
      ensureNote(data.fish.id);
      ui.view = { kind: "detail", ...data };
    } catch (error) {
      if (gen !== generation) return;
      ui.view = { kind: "error", title: "打不开这尾鱼", message: messageOf(error), action: `<a class="btn btn-primary" href="#/pages/fish/list">回本场</a>` };
    }
    paint({ scroll: "top" });
    return;
  }

  ui.view = { kind: "error", title: "这一页不存在", message: "回到渔场的鱼就可以。", action: `<a class="btn btn-primary" href="#/pages/fish/list">回本场</a>` };
  paint({ scroll: "top" });
}

function assignField(field, value) {
  if (field === "phone") ui.phone = value;
  else if (field === "password") ui.password = value;
  else if (field === "query") ui.query = value;
  else if (ui.create && ["code", "variety", "date", "customerNote"].includes(field)) ui.create[field] = value;
  else if (ui.note && field === "sentence") ui.note.text = value;
  else if (ui.note && field === "weight") ui.note.weight = value;
}

async function login(phone, password) {
  ui.loginError = "";
  if (!phone || !password) {
    ui.loginError = "请填写手机号和密码";
    ui.view = { kind: "login", farm: null };
    paint();
    const demo = app.querySelector(".demo");
    if (demo) demo.open = true;
    return;
  }
  ui.busy = true;
  paint();
  try {
    const result = await call("/api/auth/login", { method: "POST", auth: false, data: { phone, password } });
    writeSession(localStorage, { token: result.token, farm: result.farm });
    ui.query = "";
    ui.onlyGap = false;
    ui.busy = false;
    location.hash = "/pages/fish/list";
  } catch (error) {
    ui.busy = false;
    ui.loginError = messageOf(error);
    ui.view = { kind: "login", farm: null };
    paint();
    const demo = app.querySelector(".demo");
    if (demo) demo.open = true;
  }
}

async function saveFish() {
  const draft = ui.create;
  if (!draft) return;
  draft.error = "";
  if (!draft.photos.length) {
    draft.error = "先拍一张主图。";
    paint();
    app.querySelector(".shot")?.scrollIntoView({ block: "center" });
    return;
  }
  if (!draft.variety.trim()) {
    draft.error = "请填写品种";
    paint();
    return;
  }
  ui.busy = true;
  paint();
  try {
    const result = await call("/api/fish", {
      method: "POST",
      data: {
        code: draft.code.trim(),
        variety: draft.variety.trim(),
        customerNote: draft.customerNote.trim(),
        pondInDate: draft.date,
        photos: draft.photos,
      },
    });
    ui.create = null;
    ui.busy = false;
    location.hash = `/pages/fish/detail?id=${result.fish.id}`;
  } catch (error) {
    ui.busy = false;
    draft.error = messageOf(error);
    paint();
  }
}

function composeText(label, sentence) {
  const text = sentence.trim();
  if (!text) return `${label}。`;
  if (text.startsWith(label)) return text;
  return `${label}。${text}`;
}

async function saveNote() {
  if (ui.view.kind !== "detail" || !ui.note) return;
  const note = ui.note;
  note.error = "";
  const lift = note.template === "池扬";
  if (lift) {
    const weight = Number(note.weight);
    if (!Number.isFinite(weight) || weight <= 0) {
      note.error = "请填写体重（克）";
      paint();
      return;
    }
  } else if (!note.text.trim() && !note.photos.length && !note.video) {
    note.error = "写一句，或加上照片。";
    paint();
    return;
  }
  const photos = note.photos.slice(0, 6);
  const video = note.video || null;
  const type = lift ? "pond_lift" : photos.length || video ? "media" : "note";
  ui.busy = true;
  paint();
  try {
    const data = await call(`/api/fish/${encodeURIComponent(ui.view.fish.id)}/events`, {
      method: "POST",
      data: {
        type,
        text: composeText(note.template, note.text),
        photos,
        video,
        weightG: lift ? Number(note.weight) : null,
        rank: lift ? note.rank : null,
      },
    });
    ui.note = freshNote(data.fish.id);
    ui.busy = false;
    ui.view = { kind: "detail", ...data };
    paint();
    toast(lift ? "池扬已记下" : "已经记上一笔");
  } catch (error) {
    ui.busy = false;
    note.error = messageOf(error);
    paint();
  }
}

async function copyShare() {
  if (ui.view.kind !== "detail") return;
  const url = shareUrl(ui.view.fish.shareToken);
  try {
    await navigator.clipboard.writeText(url);
    toast("已经复制，发给客户即可");
  } catch {
    toast("没有复制成功，请打开查看链接");
  }
}

async function leave() {
  const current = session();
  try {
    if (current) await call("/api/auth/logout", { method: "POST", token: current.token });
  } catch {
    /* still leave the screen */
  }
  clearSession(localStorage);
  ui.confirm = false;
  ui.query = "";
  location.hash = "/pages/login/index";
}

async function addImages(files, bucket) {
  const room = 6 - bucket.length;
  if (room <= 0) {
    toast("最多六张");
    return;
  }
  const next = bucket.slice();
  try {
    for (const file of [...files].slice(0, room)) {
      next.push(await compressImage(file));
    }
  } catch (error) {
    toast(messageOf(error));
  }
  bucket.splice(0, bucket.length, ...next);
  paint();
}

app.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  if (!field) return;
  assignField(field, event.target.value);
  if (field === "query" && ui.view.kind === "list") {
    const host = document.getElementById("wall-host");
    if (host) host.innerHTML = listWall(ui.view);
  }
  if (field === "weight") {
    const hint = document.getElementById("jin");
    if (hint) hint.textContent = jinHint(event.target.value);
  }
});

app.addEventListener("toggle", (event) => {
  if (event.target.dataset.keep === "note" && ui.create) ui.create.showNote = event.target.open;
}, true);

app.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-act='login-form']");
  if (!form) return;
  event.preventDefault();
  login(ui.phone.trim(), ui.password);
});

app.addEventListener("change", async (event) => {
  const input = event.target;
  const kind = input.dataset.file;
  if (!kind || !input.files) return;
  try {
    if (kind === "create-main" && ui.create) {
      const file = input.files[0];
      if (!file) return;
      const url = await compressImage(file);
      ui.create.photos = [url, ...ui.create.photos.slice(1)].slice(0, 6);
      ui.create.error = "";
      paint();
    } else if (kind === "create-more" && ui.create) {
      await addImages(input.files, ui.create.photos);
    } else if (kind === "note-photos" && ui.note) {
      await addImages(input.files, ui.note.photos);
    } else if (kind === "note-video" && ui.note) {
      const file = input.files[0];
      if (!file) return;
      ui.note.video = await readVideo(file);
      paint();
    }
  } catch (error) {
    toast(messageOf(error));
  }
  input.value = "";
});

app.addEventListener("click", (event) => {
  const node = event.target.closest("[data-act]");
  if (!node || !app.contains(node)) return;
  const act = node.dataset.act;
  if (act === "enter") {
    event.preventDefault();
    const farm = FARMS.find((item) => item.phone === node.dataset.phone);
    if (farm) login(farm.phone, farm.password);
  } else if (act === "ask-leave") {
    ui.confirm = true;
    paint();
  } else if (act === "stay" || act === "close-light") {
    if (act === "close-light" && event.target !== node && !event.target.classList.contains("light-x") && !event.target.classList.contains("light")) return;
    ui.confirm = false;
    if (act === "close-light") ui.light = null;
    paint();
  } else if (act === "leave") {
    leave();
  } else if (act === "toggle-gap") {
    ui.onlyGap = !ui.onlyGap;
    paint();
  } else if (act === "retry") {
    route();
  } else if (act === "variety" && ui.create) {
    ui.create.variety = node.dataset.id;
    paint();
  } else if (act === "rm-create" && ui.create) {
    ui.create.photos.splice(Number(node.dataset.index), 1);
    paint();
  } else if (act === "save-fish") {
    saveFish();
  } else if (act === "copy") {
    copyShare();
  } else if (act === "to-composer") {
    document.getElementById("composer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    app.querySelector("[data-field='sentence']")?.focus();
  } else if (act === "template" && ui.note) {
    ui.note.template = node.dataset.id;
    ui.note.error = "";
    paint();
  } else if (act === "rank" && ui.note) {
    ui.note.rank = node.dataset.id;
    paint();
  } else if (act === "rm-note" && ui.note) {
    ui.note.photos.splice(Number(node.dataset.index), 1);
    paint();
  } else if (act === "rm-video" && ui.note) {
    ui.note.video = "";
    paint();
  } else if (act === "save-note") {
    saveNote();
  } else if (act === "open-photo") {
    const photos = (node.dataset.group || node.dataset.src).split("|").filter(Boolean);
    const index = Math.max(0, photos.indexOf(node.dataset.src));
    ui.light = { photos, index };
    paint();
  } else if (act === "light-prev" && ui.light) {
    event.stopPropagation();
    ui.light.index = (ui.light.index - 1 + ui.light.photos.length) % ui.light.photos.length;
    paint();
  } else if (act === "light-next" && ui.light) {
    event.stopPropagation();
    ui.light.index = (ui.light.index + 1) % ui.light.photos.length;
    paint();
  }
});

window.addEventListener("hashchange", () => {
  ui.light = null;
  route();
});

if (!location.hash) {
  const stored = session();
  location.replace(stored ? "#/pages/fish/list" : "#/pages/login/index");
}
route();
