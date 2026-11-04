import assert from "node:assert/strict";
import test from "node:test";
import {
  boardingDays,
  createApi,
  draftCode,
  fishStatus,
  readSession,
  writeSession,
} from "../logic.js";

function memory() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

test("boarding days use calendar difference", () => {
  assert.equal(boardingDays("2025-04-12", "2026-11-04"), 571);
  assert.equal(boardingDays("2026-11-04", "2026-11-04"), 0);
});

test("draft code continues the farm sequence", () => {
  assert.equal(draftCode("dajin", [{ code: "DJ-018" }, { code: "DJ-033" }]), "DJ-034");
  assert.equal(draftCode("tangwang", [{ code: "TW-056" }]), "TW-057");
});

test("status words follow cover and latest pond lift", () => {
  assert.equal(fishStatus({ photos: ["/a.jpg"], latest: { type: "note", hasPhoto: false } }), "安好");
  assert.equal(fishStatus({ photos: ["/a.jpg"], latest: { type: "pond_lift", hasPhoto: true } }), "已池扬");
  assert.equal(fishStatus({ photos: ["/a.jpg"], latest: { type: "pond_lift", hasPhoto: false } }), "待补拍");
  assert.equal(fishStatus({ photos: [], latest: null }), "待补拍");
});

test("farms only see their own fish and share stays on one fish", async () => {
  const store = memory();
  const api = createApi(store);
  const dajin = await api("/api/auth/login", { method: "POST", auth: false, data: { phone: "13800001001", password: "demo123" } });
  const other = await api("/api/auth/login", { method: "POST", auth: false, data: { phone: "13800001002", password: "demo123" } });
  await assert.rejects(
    () => api("/api/auth/login", { method: "POST", auth: false, data: { phone: "13800001001", password: "nope" } }),
    (error) => error.status === 401,
  );
  const list = await api("/api/fish", { token: dajin.token });
  assert.equal(list.farm.id, "dajin");
  assert.deepEqual(list.fish.map((fish) => fish.code).sort(), ["DJ-018", "DJ-027", "DJ-033"]);
  const foreign = await api("/api/fish", { token: other.token });
  assert.ok(foreign.fish.every((fish) => fish.farmId === "duomolong"));
  const detail = await api("/api/fish/fish_dajin_018", { token: dajin.token });
  await assert.rejects(() => api("/api/fish/fish_dajin_018", { token: other.token }), (error) => error.status === 404);
  const share = await api(`/api/share/${detail.fish.shareToken}`, { auth: false });
  assert.equal(share.fish.code, "DJ-018");
  assert.equal(share.farm.name, "昌乐大锦锦鲤");
  assert.equal(share.fish.shareToken, undefined);
  assert.ok(share.events.some((item) => item.type === "pond_lift" && item.weightG === 1860));
  assert.ok(!JSON.stringify(share).includes("DJ-027"));
});

test("create, timeline chips data, and pond lift weight", async () => {
  const store = memory();
  const api = createApi(store);
  const login = await api("/api/auth/login", { method: "POST", auth: false, data: { phone: "13800001003", password: "demo123" } });
  const created = await api("/api/fish", {
    method: "POST",
    token: login.token,
    data: {
      code: "TW-057",
      variety: "红白",
      customerNote: "新鱼",
      pondInDate: "2026-11-04",
      photos: ["/media/seed/kohaku-1.jpg"],
    },
  });
  assert.equal(created.fish.code, "TW-057");
  const noted = await api(`/api/fish/${created.fish.id}/events`, {
    method: "POST",
    token: login.token,
    data: { type: "media", text: "巡池。红斑清楚。", photos: ["/media/seed/kohaku-2.jpg"], video: null },
  });
  assert.equal(noted.events[0].text, "巡池。红斑清楚。");
  await assert.rejects(
    () =>
      api(`/api/fish/${created.fish.id}/events`, {
        method: "POST",
        token: login.token,
        data: { type: "pond_lift", text: "池扬。", photos: [], weightG: 0, rank: "未评" },
      }),
    (error) => error.status === 400,
  );
  const lifted = await api(`/api/fish/${created.fish.id}/events`, {
    method: "POST",
    token: login.token,
    data: { type: "pond_lift", text: "池扬。尾筒有力。", photos: [], video: "/media/seed/lift-tangwang.mp4", weightG: 900, rank: "A" },
  });
  assert.equal(lifted.events[0].weightG, 900);
  assert.equal(lifted.events[0].video, "/media/seed/lift-tangwang.mp4");
  writeSession(store, { token: login.token, farm: login.farm });
  assert.equal(readSession(store).farm.id, "tangwang");
});
