const DB_KEY = "koi.demo.db.v1";
const SESSION_KEY = "koi.session";

export const FARMS = [
  {
    id: "dajin",
    name: "昌乐大锦锦鲤",
    short: "大锦",
    region: "山东潍坊 · 昌乐",
    phone: "13800001001",
    password: "demo123",
    blurb: "红白、昭和、黄金",
    codePrefix: "DJ",
  },
  {
    id: "duomolong",
    name: "济南多摩龙锦鲤",
    short: "多摩龙",
    region: "山东济南",
    phone: "13800001002",
    password: "demo123",
    blurb: "大正、白写、丹顶",
    codePrefix: "DML",
  },
  {
    id: "tangwang",
    name: "历城唐王锦鲤",
    short: "唐王",
    region: "济南历城 · 唐王",
    phone: "13800001003",
    password: "demo123",
    blurb: "秋翠、九纹龙、衣",
    codePrefix: "TW",
  },
];

export const VARIETIES = [
  "红白",
  "大正三色",
  "昭和三色",
  "黄金",
  "白写",
  "丹顶",
  "秋翠",
  "九纹龙",
  "衣",
  "浅黄",
  "铂金",
  "德国红白",
];

export const RANKS = ["特A", "A", "B", "C", "未评"];

export const BREED_TONE = {
  红白: ["#f6efe8", "#c23a2e"],
  大正三色: ["#f7f4ef", "#241c16"],
  昭和三色: ["#2c2622", "#f4efe8"],
  黄金: ["#f0d78c", "#8a6a22"],
  白写: ["#f7f5f1", "#241c16"],
  丹顶: ["#fbf8f4", "#c23a2e"],
  秋翠: ["#d5dde3", "#5d7384"],
  九纹龙: ["#f4f1ec", "#1c1916"],
  衣: ["#e7e3ea", "#6d6490"],
  浅黄: ["#f6e7c2", "#8a7040"],
  铂金: ["#f3f1ee", "#8d8680"],
  德国红白: ["#f6f1ea", "#b4332a"],
};

const STATUS_META = {
  安好: { color: "#2f6b45" },
  待补拍: { color: "#b26a12" },
  已池扬: { color: "#c23a2e" },
};

export function statusMeta(word) {
  return STATUS_META[word] || STATUS_META["安好"];
}

export function breedTone(variety) {
  return BREED_TONE[variety] || ["#f3eadc", "#c23a2e"];
}

function fish(id, farmId, code, variety, customerNote, pondInDate, photos, shareToken, createdAt, updatedAt) {
  return { id, farmId, code, variety, customerNote, pondInDate, photos, shareToken, createdAt, updatedAt };
}

function event(id, farmId, fishId, extra) {
  return {
    photos: [],
    video: null,
    weightG: null,
    rank: null,
    ...extra,
    id,
    farmId,
    fishId,
  };
}

function seedDb() {
  return {
    farms: FARMS.map((item) => ({
      id: item.id,
      name: item.name,
      region: item.region,
      phone: item.phone,
      password: item.password,
    })),
    fish: [
      fish("fish_dajin_018", "dajin", "DJ-018", "红白", "王先生长期寄养。每月池扬一次，拍摄时托住尾柄。", "2025-04-12", ["/media/seed/kohaku-1.jpg", "/media/seed/kohaku-2.jpg"], "a91c0e7b4d2f48c6b0e15a7d3c84f2916ab0", "2025-04-12T09:00:00+08:00", "2026-09-28T16:10:00+08:00"),
      fish("fish_dajin_027", "dajin", "DJ-027", "昭和三色", "李女士的鱼，计划明年开春取走。墨质变淡时告诉她。", "2025-11-03", ["/media/seed/showa-1.jpg", "/media/seed/showa-2.jpg"], "b18d44aa90c14e0f9c77e2a15d06b8347c11", "2025-11-03T10:20:00+08:00", "2026-10-02T11:05:00+08:00"),
      fish("fish_dajin_033", "dajin", "DJ-033", "黄金", "陈老板的黄金，素鳞，单独记录，不和别的鱼放进同一条分享。", "2026-03-21", ["/media/seed/ogon-1.jpg"], "c70e12f5aa3846d19b22c8e04f55a1739d02", "2026-03-21T08:40:00+08:00", "2026-08-30T15:00:00+08:00"),
      fish("fish_duomolong_088", "duomolong", "DML-088", "大正三色", "赵先生关注头墨和肩部墨斑是否稳定，池扬时尽量对着光拍。", "2025-06-18", ["/media/seed/taisho-1.jpg", "/media/seed/taisho-2.jpg"], "d44a8c0192e7460bb31f7a6e55c09281ab33", "2025-06-18T14:00:00+08:00", "2026-07-22T10:30:00+08:00"),
      fish("fish_duomolong_102", "duomolong", "DML-102", "白写", "周女士的白写。冬季食欲变慢是正常的，不用额外催肥。", "2026-01-09", ["/media/seed/shiro-1.jpg", "/media/seed/shiro-2.jpg"], "e55b19d0c3f84a78a1e06b4d7728cc10fa44", "2026-01-09T09:30:00+08:00", "2026-06-14T09:40:00+08:00"),
      fish("fish_duomolong_119", "duomolong", "DML-119", "丹顶", "孙先生的丹顶。头斑怕晒花，中午遮阴。", "2026-04-02", ["/media/seed/tancho-1.jpg"], "f66c20e1d4a94b89b2f17c5e8839dd21ab55", "2026-04-02T11:15:00+08:00", "2026-09-02T17:20:00+08:00"),
      fish("fish_tangwang_033", "tangwang", "TW-033", "秋翠", "马先生的秋翠，养在唐王本场最里面的池。", "2025-09-14", ["/media/seed/asagi-1.jpg", "/media/seed/asagi-2.jpg"], "a77d31f2e5b04c9ac3028d6f9940ee32bc66", "2025-09-14T08:10:00+08:00", "2026-08-18T09:00:00+08:00"),
      fish("fish_tangwang_041", "tangwang", "TW-041", "九纹龙", "郑女士，网箱寄养。池扬时对一下网箱编号 4。", "2026-02-11", ["/media/seed/kumonryu-1.jpg", "/media/seed/kumonryu-2.jpg"], "b88e42a3f6c14d0bd4139e709051ff43cd77", "2026-02-11T13:45:00+08:00", "2026-10-19T15:30:00+08:00"),
      fish("fish_tangwang_056", "tangwang", "TW-056", "衣", "冯先生的衣，今年新入池，先观察适应。", "2026-06-27", ["/media/seed/koromo-1.jpg"], "c99f5304a7d24e1ce5240f81a1620044de88", "2026-06-27T10:00:00+08:00", "2026-10-25T11:10:00+08:00"),
    ],
    events: [
      event("evt_dj_018_1", "dajin", "fish_dajin_018", { type: "note", text: "入池建档。鳞片完整，红质边界清楚。", createdAt: "2025-04-12T09:05:00+08:00" }),
      event("evt_dj_018_2", "dajin", "fish_dajin_018", { type: "media", text: "冬棚巡查，红斑没有发白。", photos: ["/media/seed/kohaku-2.jpg"], createdAt: "2026-02-16T15:20:00+08:00" }),
      event("evt_dj_018_3", "dajin", "fish_dajin_018", { type: "pond_lift", text: "头部红斑边界干净，尾筒有力。", photos: ["/media/seed/kohaku-1.jpg"], video: "/media/seed/lift-dajin.mp4", weightG: 1860, rank: "特A", createdAt: "2026-05-16T09:30:00+08:00" }),
      event("evt_dj_018_4", "dajin", "fish_dajin_018", { type: "note", text: "换水后状态稳定，红质没有消退。", createdAt: "2026-09-28T16:10:00+08:00" }),
      event("evt_dj_027_1", "dajin", "fish_dajin_027", { type: "note", text: "入池建档。墨底偏厚，白质还干净。", createdAt: "2025-11-03T10:30:00+08:00" }),
      event("evt_dj_027_2", "dajin", "fish_dajin_027", { type: "pond_lift", text: "墨质偏厚，红白分布尚可，建议下次再看肩部。", photos: ["/media/seed/showa-1.jpg"], weightG: 2420, rank: "A", createdAt: "2026-04-19T10:00:00+08:00" }),
      event("evt_dj_027_3", "dajin", "fish_dajin_027", { type: "media", text: "秋季巡池，食欲正常。", photos: ["/media/seed/showa-2.jpg"], createdAt: "2026-10-02T11:05:00+08:00" }),
      event("evt_dj_033_1", "dajin", "fish_dajin_033", { type: "note", text: "入池建档。素鳞黄金，体色均匀。", createdAt: "2026-03-21T08:50:00+08:00" }),
      event("evt_dj_033_2", "dajin", "fish_dajin_033", { type: "pond_lift", text: "金色均匀，暂不评级。", photos: ["/media/seed/ogon-1.jpg"], weightG: 1280, rank: "未评", createdAt: "2026-08-30T15:00:00+08:00" }),
      event("evt_dml_088_1", "duomolong", "fish_duomolong_088", { type: "note", text: "入池建档。头墨集中，肩部有一块小墨。", createdAt: "2025-06-18T14:10:00+08:00" }),
      event("evt_dml_088_2", "duomolong", "fish_duomolong_088", { type: "pond_lift", text: "对着光拍过，墨斑边界稳定，没有散墨。", photos: ["/media/seed/taisho-2.jpg"], video: "/media/seed/lift-duomolong.mp4", weightG: 3100, rank: "特A", createdAt: "2026-07-22T10:30:00+08:00" }),
      event("evt_dml_088_3", "duomolong", "fish_duomolong_088", { type: "note", text: "喂食正常，尾鳍无充血。", createdAt: "2026-09-12T09:00:00+08:00" }),
      event("evt_dml_102_1", "duomolong", "fish_duomolong_102", { type: "note", text: "入池建档。白地干净，墨质还在长。", createdAt: "2026-01-09T09:40:00+08:00" }),
      event("evt_dml_102_2", "duomolong", "fish_duomolong_102", { type: "pond_lift", text: "白地没有染黄，体形中等。", photos: ["/media/seed/shiro-1.jpg"], weightG: 1560, rank: "A", createdAt: "2026-06-14T09:40:00+08:00" }),
      event("evt_dml_119_1", "duomolong", "fish_duomolong_119", { type: "note", text: "入池建档。头斑圆，位置正。", photos: ["/media/seed/tancho-1.jpg"], createdAt: "2026-04-02T11:20:00+08:00" }),
      event("evt_dml_119_2", "duomolong", "fish_duomolong_119", { type: "pond_lift", text: "头斑略有晒红，已加遮阴。", weightG: 980, rank: "B", createdAt: "2026-09-02T17:20:00+08:00" }),
      event("evt_tw_033_1", "tangwang", "fish_tangwang_033", { type: "note", text: "入池建档。秋翠网纹清楚，腹部红质还浅。", createdAt: "2025-09-14T08:20:00+08:00" }),
      event("evt_tw_033_2", "tangwang", "fish_tangwang_033", { type: "media", text: "开春后红腹上来了一些。", photos: ["/media/seed/asagi-2.jpg"], createdAt: "2026-03-28T14:15:00+08:00" }),
      event("evt_tw_033_3", "tangwang", "fish_tangwang_033", { type: "pond_lift", text: "网纹整齐，红腹到侧线。", photos: ["/media/seed/asagi-1.jpg"], video: "/media/seed/lift-tangwang.mp4", weightG: 1740, rank: "A", createdAt: "2026-08-18T09:00:00+08:00" }),
      event("evt_tw_041_1", "tangwang", "fish_tangwang_041", { type: "note", text: "入池建档。网箱 4，黑白相间还在变化。", createdAt: "2026-02-11T13:50:00+08:00" }),
      event("evt_tw_041_2", "tangwang", "fish_tangwang_041", { type: "pond_lift", text: "墨色压住白地，体格好。", photos: ["/media/seed/kumonryu-2.jpg"], weightG: 2210, rank: "特A", createdAt: "2026-10-19T15:30:00+08:00" }),
      event("evt_tw_056_1", "tangwang", "fish_tangwang_056", { type: "note", text: "入池建档。新鱼，先看适应，暂不评级。", createdAt: "2026-06-27T10:10:00+08:00" }),
      event("evt_tw_056_2", "tangwang", "fish_tangwang_056", { type: "media", text: "适应后开始抢食。", photos: ["/media/seed/koromo-1.jpg"], createdAt: "2026-08-09T16:40:00+08:00" }),
      event("evt_tw_056_3", "tangwang", "fish_tangwang_056", { type: "pond_lift", text: "衣纹刚起来，先记下体重。", weightG: 890, rank: "未评", createdAt: "2026-10-25T11:10:00+08:00" }),
    ],
    sessions: [],
  };
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function shanghaiToday(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function boardingDays(pondInDate, today = shanghaiToday()) {
  if (!pondInDate || !/^\d{4}-\d{2}-\d{2}$/.test(pondInDate) || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return 0;
  const [y, m, d] = pondInDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const start = Date.UTC(y, m - 1, d);
  const end = Date.UTC(ty, tm - 1, td);
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function formatDate(value) {
  if (!value) return "";
  const day = String(value).slice(0, 10);
  const [year, month, date] = day.split("-");
  if (!year || !month || !date) return value;
  return `${year}年${Number(month)}月${Number(date)}日`;
}

export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatWeight(grams) {
  const value = Number(grams) || 0;
  const jin = value / 500;
  const extra = jin >= 0.2 ? `（约 ${jin.toFixed(1)} 斤）` : "";
  return `${value.toLocaleString("zh-CN")} 克${extra}`;
}

export function fishStatus(item, events) {
  const latest = events ? events[0] || null : item.latest || null;
  const cover = Array.isArray(item.photos) && item.photos.length > 0;
  const shot =
    latest &&
    (latest.hasPhoto ||
      (Array.isArray(latest.photos) && latest.photos.length > 0) ||
      !!latest.video);
  if (!cover) return "待补拍";
  if (latest && latest.type === "pond_lift" && !shot) return "待补拍";
  if (latest && latest.type === "pond_lift") return "已池扬";
  return "安好";
}

export function eventLabel(item) {
  if (!item) return "记录";
  if (item.type === "pond_lift") return "池扬";
  const text = String(item.text || "").trim();
  if (text.startsWith("巡池")) return "巡池";
  if (text.startsWith("喂食")) return "喂食";
  if (text.startsWith("状态")) return "状态";
  if (item.type === "media") return "影像";
  return "记录";
}

export function draftCode(farmId, rows) {
  const farm = FARMS.find((item) => item.id === farmId);
  const prefix = farm ? farm.codePrefix : "KOI";
  let max = 0;
  for (const row of rows || []) {
    const matched = String(row.code || "").match(/(\d+)\s*$/);
    if (matched) max = Math.max(max, Number(matched[1]));
  }
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function latestPhoto(item, events) {
  const list = events || [];
  for (const entry of list) {
    if (entry.photos && entry.photos.length) return entry.photos[0];
  }
  return (item.photos && item.photos[0]) || "";
}

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function clip(value, max) {
  return typeof value !== "string" ? "" : value.trim().slice(0, max);
}

function validDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function takeMedia(value, max) {
  if (!Array.isArray(value)) return [];
  const rows = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const url = item.trim();
    const ok =
      url.startsWith("/media/seed/") ||
      url.startsWith("/media/uploads/") ||
      url.startsWith("blob:") ||
      url.startsWith("data:");
    if (!ok || url.includes("..") || url.length > 2_000_000) continue;
    rows.push(url);
    if (rows.length >= max) break;
  }
  return rows;
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
}

function readDb(storage) {
  try {
    const raw = storage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.farms) && parsed.farms.length && Array.isArray(parsed.fish) && Array.isArray(parsed.events)) {
        return parsed;
      }
    }
  } catch {
    /* use seed */
  }
  const seeded = seedDb();
  writeDb(storage, seeded);
  return seeded;
}

function writeDb(storage, db) {
  try {
    storage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    throw new ApiError("照片太大，这一笔没有记下。请少加几张。", 400);
  }
}

export function readSession(storage) {
  try {
    const raw = storage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const data = parsed && parsed.type && "data" in parsed ? parsed.data : parsed;
    const session = typeof data === "string" ? JSON.parse(data) : data;
    if (session?.token && session?.farm?.id) return session;
  } catch {
    return null;
  }
  return null;
}

export function writeSession(storage, session) {
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(storage) {
  storage.removeItem(SESSION_KEY);
}

function publicFarm(farm) {
  return { id: farm.id, name: farm.name, region: farm.region, phone: farm.phone };
}

function eventsFor(db, row) {
  return db.events
    .filter((item) => item.fishId === row.id && item.farmId === row.farmId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function summarize(db, row) {
  const events = eventsFor(db, row);
  const latest = events[0];
  return {
    id: row.id,
    farmId: row.farmId,
    code: row.code,
    variety: row.variety,
    customerNote: row.customerNote,
    pondInDate: row.pondInDate,
    photos: row.photos,
    shareToken: row.shareToken,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    eventCount: events.length,
    latest: latest
      ? {
          type: latest.type,
          text: latest.text,
          weightG: latest.weightG,
          rank: latest.rank,
          createdAt: latest.createdAt,
          hasPhoto: (latest.photos && latest.photos.length > 0) || !!latest.video,
        }
      : null,
  };
}

function presentEvent(item) {
  return {
    id: item.id,
    type: item.type,
    text: item.text,
    photos: item.photos,
    video: item.video,
    weightG: item.weightG,
    rank: item.rank,
    createdAt: item.createdAt,
  };
}

function requireFarm(db, token) {
  if (!token) throw new ApiError("请先登录", 401);
  const now = Date.now();
  db.sessions = db.sessions.filter((item) => item.expiresAt > now);
  const session = db.sessions.find((item) => item.token === token);
  if (!session) throw new ApiError("请先登录", 401);
  const farm = db.farms.find((item) => item.id === session.farmId);
  if (!farm) throw new ApiError("渔场数据缺失", 500);
  return farm;
}

function requireFish(db, farmId, fishId) {
  const row = db.fish.find((item) => item.id === fishId && item.farmId === farmId);
  if (!row) throw new ApiError("没有这尾鱼，或它不属于当前渔场", 404);
  return row;
}

function detail(db, farmId, fishId) {
  const row = requireFish(db, farmId, fishId);
  const farm = db.farms.find((item) => item.id === farmId);
  return {
    farm: publicFarm(farm),
    fish: summarize(db, row),
    events: eventsFor(db, row).map(presentEvent),
  };
}

export function createApi(storage) {
  return async function api(path, options = {}) {
    const method = options.method || "GET";
    const data = options.data || {};
    const auth = options.auth !== false;
    const token = options.token || "";
    await Promise.resolve();
    const db = readDb(storage);

    if (path === "/api/health" && method === "GET") return { ok: true, demo: true };

    if (path === "/api/auth/login" && method === "POST") {
      const phone = clip(data.phone, 20);
      const password = clip(data.password, 64);
      const farm = db.farms.find((item) => item.phone === phone);
      if (!farm || farm.password !== password) throw new ApiError("手机号或密码不对", 401);
      const sessionToken = uid("demo");
      db.sessions.push({ token: sessionToken, farmId: farm.id, expiresAt: Date.now() + 604800000 });
      writeDb(storage, db);
      return { token: sessionToken, farm: publicFarm(farm) };
    }

    if (path === "/api/auth/me" && method === "GET") {
      return { farm: publicFarm(requireFarm(db, auth ? token : "")) };
    }

    if (path === "/api/auth/logout" && method === "POST") {
      requireFarm(db, auth ? token : "");
      db.sessions = db.sessions.filter((item) => item.token !== token);
      writeDb(storage, db);
      return { ok: true };
    }

    if (path === "/api/fish" && method === "GET") {
      const farm = requireFarm(db, auth ? token : "");
      const rows = db.fish
        .filter((item) => item.farmId === farm.id)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .map((item) => summarize(db, item));
      return { farm: publicFarm(farm), fish: rows };
    }

    if (path === "/api/fish" && method === "POST") {
      const farm = requireFarm(db, auth ? token : "");
      const code = clip(data.code, 32);
      const variety = clip(data.variety, 20);
      const customerNote = clip(data.customerNote, 500);
      const pondInDate = clip(data.pondInDate, 10);
      const photos = takeMedia(data.photos, 6);
      if (!code) throw new ApiError("请填写鱼只编号", 400);
      if (!/^[\p{L}\p{N}_-]+$/u.test(code)) throw new ApiError("编号只使用字母、数字、中文和短横线", 400);
      if (!variety) throw new ApiError("请填写品种", 400);
      if (!validDay(pondInDate)) throw new ApiError("请选择入池日期", 400);
      if (db.fish.some((item) => item.farmId === farm.id && item.code.toLowerCase() === code.toLowerCase())) {
        throw new ApiError("本场已有这个编号", 409);
      }
      const now = new Date().toISOString();
      const row = {
        id: uid("fish"),
        farmId: farm.id,
        code,
        variety,
        customerNote,
        pondInDate,
        photos,
        shareToken: uid("share").replace(/_/g, ""),
        createdAt: now,
        updatedAt: now,
      };
      db.fish.push(row);
      db.events.push({
        id: uid("evt"),
        farmId: farm.id,
        fishId: row.id,
        type: "note",
        text: "入池建档。",
        photos: [],
        video: null,
        weightG: null,
        rank: null,
        createdAt: now,
      });
      writeDb(storage, db);
      return detail(db, farm.id, row.id);
    }

    const one = path.match(/^\/api\/fish\/([^/]+)$/);
    if (one && method === "GET") {
      const farm = requireFarm(db, auth ? token : "");
      return detail(db, farm.id, decodeURIComponent(one[1]));
    }

    const add = path.match(/^\/api\/fish\/([^/]+)\/events$/);
    if (add && method === "POST") {
      const farm = requireFarm(db, auth ? token : "");
      const row = requireFish(db, farm.id, decodeURIComponent(add[1]));
      const type = data.type;
      if (type !== "note" && type !== "media" && type !== "pond_lift") throw new ApiError("记录类型不对", 400);
      const text = clip(data.text, 500);
      const photos = takeMedia(data.photos, 6);
      const video = takeMedia(data.video ? [data.video] : [], 1)[0] ?? null;
      let weightG = null;
      let rank = null;
      if (type === "note" && !text) throw new ApiError("请写一点记录", 400);
      if (type === "media" && photos.length === 0 && !video) throw new ApiError("请添加照片或视频", 400);
      if (type === "pond_lift") {
        const weight = Number(data.weightG);
        if (!Number.isFinite(weight) || weight <= 0 || weight > 200000) throw new ApiError("请填写体重（克）", 400);
        weightG = Math.round(weight);
        rank = clip(data.rank, 20) || null;
      }
      const now = new Date().toISOString();
      db.events.push({
        id: uid("evt"),
        farmId: farm.id,
        fishId: row.id,
        type,
        text,
        photos,
        video,
        weightG,
        rank,
        createdAt: now,
      });
      row.updatedAt = now;
      writeDb(storage, db);
      return detail(db, farm.id, row.id);
    }

    const share = path.match(/^\/api\/share\/([^/]+)$/);
    if (share && method === "GET") {
      const tokenValue = decodeURIComponent(share[1]);
      const row = db.fish.find((item) => item.shareToken === tokenValue);
      if (!row) throw new ApiError("分享链接无效或已不存在", 404);
      const farm = db.farms.find((item) => item.id === row.farmId);
      return {
        farm: { id: farm.id, name: farm.name, region: farm.region },
        fish: {
          code: row.code,
          variety: row.variety,
          customerNote: row.customerNote,
          pondInDate: row.pondInDate,
          photos: row.photos,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
        events: eventsFor(db, row).map(presentEvent),
      };
    }

    throw new ApiError("没有这个接口", 404);
  };
}

export function messageOf(error) {
  if (error instanceof ApiError) return error.message;
  if (error && typeof error.message === "string" && error.message) return error.message;
  return "没有完成，请再试一次";
}
