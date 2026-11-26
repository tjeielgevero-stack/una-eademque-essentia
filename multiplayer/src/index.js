import { DurableObject } from "cloudflare:workers";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "Content-Type, X-Player-Id, X-Player-Token" };
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
function cleanText(value, max = 80) {
  return typeof value === "string" ? value.trim().replace(/[<>]/g, "").slice(0, max) : "";
}
function makeCode(length = 6) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}
function makeToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
function safeCharacter(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    id: cleanText(source.id, 80),
    name: cleanText(source.name, 60) || "Unnamed Variant",
    mode: ["simple", "advanced", "complex"].includes(source.mode) ? source.mode : "simple",
    origin: cleanText(source.origin, 100),
    affiliation: cleanText(source.affiliation, 100),
    grade: cleanText(source.grade, 60),
    egoName: cleanText(source.egoName, 80),
    egoEligible: source.egoEligible === true
  };
}
async function forwardRequest(request, url) {
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
  return new Request(url, { method: request.method, headers: request.headers, body });
}
function teamFor(mode, index) {
  if (mode === "2v2") return index % 2 === 0 ? "A" : "B";
  return mode === "ffa" ? String(index + 1) : (index === 0 ? "A" : "B");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
    if (url.pathname === "/api/health") return json({ ok: true, service: "Una Eademque Essentia Multiplayer", version: 1 });
    if (url.pathname === "/api/rooms" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "A valid JSON body is required." }, 400); }
      const mode = ["1v1", "2v2", "ffa"].includes(body.mode) ? body.mode : "1v1";
      const visibility = body.visibility === "public" ? "public" : "private";
      const maxPlayers = mode === "1v1" ? 2 : 4;
      const code = makeCode();
      const id = env.ROOMS.idFromName(code);
      const stub = env.ROOMS.get(id);
      const playerName = cleanText(body.playerName, 24) || "Host";
      const character = safeCharacter(body.character);
      const result = await stub.fetch("https://room.internal/init", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, mode, visibility, maxPlayers, playerName, character })
      });
      const payload = await result.json();
      if (!result.ok) return json(payload, result.status);
      if (visibility === "public") {
        const index = env.ROOMS.get(env.ROOMS.idFromName("__PUBLIC_INDEX__"));
        await index.fetch("https://index.internal/add", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ code, mode, players: 1, maxPlayers, status: "lobby", createdAt: Date.now() })
        });
      }
      return json(payload, 201);
    }
    if (url.pathname === "/api/rooms/public" && request.method === "GET") {
      const index = env.ROOMS.get(env.ROOMS.idFromName("__PUBLIC_INDEX__"));
      const response = await index.fetch("https://index.internal/list");
      return response;
    }
    const match = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})(?:\/(join|start|action|leave|ws))?$/i);
    if (!match) return json({ error: "Route not found." }, 404);
    const code = match[1].toUpperCase();
    const action = match[2] || "";
    const stub = env.ROOMS.get(env.ROOMS.idFromName(code));
    if (action === "ws") {
      const wsUrl = new URL(request.url);
      const internal = new URL("https://room.internal/ws");
      internal.search = wsUrl.search;
      return stub.fetch(new Request(internal, { method: "GET", headers: request.headers }));
    }
    if (action === "join" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "A valid JSON body is required." }, 400); }
      return stub.fetch("https://room.internal/join", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerName: cleanText(body.playerName, 24) || "Guest", character: safeCharacter(body.character) })
      });
    }
    if (action === "start" && request.method === "POST") return stub.fetch(await forwardRequest(request, "https://room.internal/start"));
    if (action === "action" && request.method === "POST") return stub.fetch(await forwardRequest(request, "https://room.internal/action"));
    if (action === "leave" && request.method === "POST") return stub.fetch(await forwardRequest(request, "https://room.internal/leave"));
    if (!action && request.method === "GET") return stub.fetch(new Request("https://room.internal/state" + url.search, { method: "GET", headers: request.headers }));
    return json({ error: "Method not allowed." }, 405);
  }
};

export class RoomHub extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.room = null;
    this.ready = ctx.blockConcurrencyWhile(async () => {
      this.room = await ctx.storage.get("room") || null;
    });
  }

  async fetch(request) {
    await this.ready;
    const url = new URL(request.url);
    if (url.pathname === "/init" && request.method === "POST") return this.initialize(request);
    if (url.pathname === "/add" && request.method === "POST") return this.indexAdd(request);
    if (url.pathname === "/list" && request.method === "GET") return this.indexList();
    if (url.pathname === "/ws" && request.headers.get("Upgrade") === "websocket") return this.connect(request);
    if (url.pathname === "/join" && request.method === "POST") return this.join(request);
    if (url.pathname === "/state" && request.method === "GET") return this.getState(request);
    if (url.pathname === "/start" && request.method === "POST") return this.start(request);
    if (url.pathname === "/action" && request.method === "POST") return this.act(request);
    if (url.pathname === "/leave" && request.method === "POST") return this.leave(request);
    return json({ error: "Room route not found." }, 404);
  }

  async initialize(request) {
    if (this.room) return json({ error: "Room already exists." }, 409);
    const body = await request.json();
    const token = makeToken();
    this.room = {
      code: body.code, mode: body.mode, visibility: body.visibility,
      maxPlayers: body.maxPlayers, status: "lobby", createdAt: Date.now(),
      players: [{ id: crypto.randomUUID(), token, name: body.playerName, character: body.character, team: teamFor(body.mode, 0), hp: 100, guarding: false, egoUsed: false }],
      turnIndex: 0, round: 1, log: [{ at: Date.now(), text: "Room created. Waiting for challengers." }]
    };
    await this.ctx.storage.put("room", this.room);
    return json({ room: this.publicState(), player: { id: this.room.players[0].id, token } });
  }

  async indexAdd(request) {
    const item = await request.json();
    const list = await this.ctx.storage.get("publicRooms") || [];
    const now = Date.now();
    const retained = list.filter(room =>
      room.code !== item.code &&
      room.status === "lobby" &&
      now - room.createdAt < 12 * 60 * 60 * 1000
    );
    const next = (item.status === "lobby" ? [item, ...retained] : retained).slice(0, 40);
    await this.ctx.storage.put("publicRooms", next);
    return json({ ok: true });
  }

  async indexList() {
    const list = await this.ctx.storage.get("publicRooms") || [];
    const now = Date.now();
    const rooms = list.filter(room =>
      room.status === "lobby" &&
      now - room.createdAt < 12 * 60 * 60 * 1000
    );
    if (rooms.length !== list.length) await this.ctx.storage.put("publicRooms", rooms);
    return json({ rooms });
  }

  publicState() {
    if (!this.room) return null;
    const players = this.room.players.map(player => ({
      id: player.id, name: player.name, character: player.character, team: player.team,
      hp: player.hp, guarding: player.guarding, egoUsed: player.egoUsed,
      connected: this.ctx.getWebSockets().some(ws => ws.deserializeAttachment()?.playerId === player.id)
    }));
    const living = players.filter(player => player.hp > 0);
    const active = this.room.status === "active" ? living[this.room.turnIndex % Math.max(1, living.length)] : null;
    return {
      code: this.room.code, mode: this.room.mode, visibility: this.room.visibility,
      maxPlayers: this.room.maxPlayers, status: this.room.status,
      hostPlayerId: this.room.players[0]?.id || null,
      players, turnPlayerId: active?.id || null, round: this.room.round,
      log: this.room.log.slice(-35), winner: this.room.winner || null
    };
  }

  async saveAndBroadcast(message = "state") {
    await this.ctx.storage.put("room", this.room);
    const state = this.publicState();
    const payload = JSON.stringify({ type: message, state });
    for (const ws of this.ctx.getWebSockets()) {
      try { ws.send(payload); } catch { /* stale connection */ }
    }
    if (this.room.visibility === "public") {
      const index = this.env.ROOMS.get(this.env.ROOMS.idFromName("__PUBLIC_INDEX__"));
      await index.fetch("https://index.internal/add", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: this.room.code, mode: this.room.mode, players: this.room.players.length, maxPlayers: this.room.maxPlayers, status: this.room.status, createdAt: this.room.createdAt })
      });
    }
  }

  findPlayer(id, token) {
    return this.room?.players.find(player => player.id === id && player.token === token);
  }

  auth(request, body = null) {
    const url = new URL(request.url);
    const id = body?.playerId || url.searchParams.get("playerId") || request.headers.get("x-player-id");
    const token = body?.token || url.searchParams.get("token") || request.headers.get("x-player-token");
    return this.findPlayer(id, token);
  }

  async connect(request) {
    if (!this.room) return json({ error: "Room not found." }, 404);
    const player = this.auth(request);
    if (!player) return json({ error: "Invalid room credentials. Rejoin the room." }, 403);
    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ playerId: player.id });
    server.send(JSON.stringify({ type: "state", state: this.publicState() }));
    return new Response(null, { status: 101, webSocket: client });
  }

  async join(request) {
    if (!this.room) return json({ error: "Room not found." }, 404);
    if (this.room.status !== "lobby") return json({ error: "This match has already started." }, 409);
    if (this.room.players.length >= this.room.maxPlayers) return json({ error: "This room is full." }, 409);
    const body = await request.json();
    const player = {
      id: crypto.randomUUID(), token: makeToken(), name: body.playerName,
      character: body.character, team: teamFor(this.room.mode, this.room.players.length),
      hp: 100, guarding: false, egoUsed: false
    };
    this.room.players.push(player);
    this.room.log.push({ at: Date.now(), text: player.name + " joined the room." });
    await this.saveAndBroadcast("player-joined");
    return json({ room: this.publicState(), player: { id: player.id, token: player.token } }, 201);
  }

  async getState(request) {
    if (!this.room) return json({ error: "Room not found." }, 404);
    if (!this.auth(request)) return json({ error: "Invalid room credentials." }, 403);
    return json({ room: this.publicState() });
  }

  async start(request) {
    if (!this.room) return json({ error: "Room not found." }, 404);
    const body = await request.json().catch(() => ({}));
    const player = this.auth(request, body);
    if (!player) return json({ error: "Invalid room credentials." }, 403);
    if (this.room.players[0].id !== player.id) return json({ error: "Only the host can start the match." }, 403);
    if (this.room.status !== "lobby") return json({ error: "The match is not in the lobby." }, 409);
    if (this.room.players.length < 2) return json({ error: "At least two players are required." }, 409);
    if (this.room.mode === "2v2" && this.room.players.length !== 4) return json({ error: "2v2 requires four players." }, 409);
    this.room.status = "active";
    this.room.turnIndex = 0;
    this.room.round = 1;
    this.room.log.push({ at: Date.now(), text: "The match has begun. " + this.room.players[0].name + " takes the first turn." });
    await this.saveAndBroadcast("match-started");
    return json({ room: this.publicState() });
  }

  async act(request) {
    if (!this.room) return json({ error: "Room not found." }, 404);
    const body = await request.json().catch(() => ({}));
    const player = this.auth(request, body);
    if (!player) return json({ error: "Invalid room credentials." }, 403);
    if (this.room.status !== "active") return json({ error: "The match is not active." }, 409);
    const living = this.room.players.filter(item => item.hp > 0);
    const current = living[this.room.turnIndex % living.length];
    if (!current || current.id !== player.id) return json({ error: "It is not your turn." }, 409);
    const type = body.type;
    if (!["attack", "defend", "ego", "pass"].includes(type)) return json({ error: "Unknown action." }, 400);
    let line = "";
    if (type === "defend") {
      player.guarding = true;
      line = player.name + " takes a defensive stance.";
    } else if (type === "pass") {
      line = player.name + " passes their turn.";
    } else {
      const target = this.room.players.find(item => item.id === body.targetId && item.hp > 0);
      if (!target) return json({ error: "Choose an active target." }, 400);
      if (target.id === player.id) return json({ error: "You cannot target your own character." }, 400);
      if (this.room.mode === "2v2" && target.team === player.team) return json({ error: "Choose an opposing team member." }, 400);
      if (type === "ego" && (!player.character.egoEligible || player.egoUsed)) return json({ error: "This character cannot use E.G.O. right now." }, 400);
      let damage = type === "ego" ? 18 + Math.floor(Math.random() * 7) : 10 + Math.floor(Math.random() * 6);
      if (type === "ego") player.egoUsed = true;
      if (target.guarding) { damage = Math.max(3, Math.floor(damage * 0.45)); target.guarding = false; }
      target.hp = Math.max(0, target.hp - damage);
      line = player.name + (type === "ego" ? " activates " + (player.character.egoName || "E.G.O.") : " attacks") + " " + target.name + " for " + damage + " damage.";
      if (target.hp === 0) line += " " + target.name + " is out of the match.";
    }
    this.room.log.push({ at: Date.now(), text: line });
    const survivors = this.room.players.filter(item => item.hp > 0);
    const survivorTeams = new Set(survivors.map(item => item.team));
    if (survivors.length <= 1 || (this.room.mode === "2v2" && survivorTeams.size <= 1)) {
      this.room.status = "finished";
      this.room.winner = survivors.length ? (this.room.mode === "ffa" ? survivors[0].name : "Team " + survivors[0].team) : "Draw";
      this.room.log.push({ at: Date.now(), text: "Match finished. Winner: " + this.room.winner + "." });
    } else {
      const nextLiving = survivors;
      const oldIndex = nextLiving.findIndex(item => item.id === player.id);
      this.room.turnIndex = (oldIndex + 1) % nextLiving.length;
      if (this.room.turnIndex === 0) this.room.round += 1;
      const next = nextLiving[this.room.turnIndex];
      this.room.log.push({ at: Date.now(), text: "Round " + this.room.round + ": " + next.name + " is up next." });
    }
    await this.saveAndBroadcast("action");
    return json({ room: this.publicState() });
  }

  async leave(request) {
    if (!this.room) return json({ error: "Room not found." }, 404);
    const body = await request.json().catch(() => ({}));
    const player = this.auth(request, body);
    if (!player) return json({ error: "Invalid room credentials." }, 403);

    const wasActive = this.room.status === "active";
    const livingBefore = wasActive ? this.room.players.filter(item => item.hp > 0) : [];
    const currentTurnPlayer = livingBefore.length
      ? livingBefore[this.room.turnIndex % livingBefore.length]
      : null;

    this.room.log.push({ at: Date.now(), text: player.name + " left the room." });
    if (this.room.status === "lobby") this.room.players = this.room.players.filter(item => item.id !== player.id);
    else player.hp = 0;

    if (!this.room.players.length) {
      this.room.status = "closed";
      await this.saveAndBroadcast("room-closed");
      await this.ctx.storage.delete("room");
      return json({ ok: true });
    }

    if (wasActive) {
      const survivors = this.room.players.filter(item => item.hp > 0);
      const survivorTeams = new Set(survivors.map(item => item.team));
      if (survivors.length <= 1 || (this.room.mode === "2v2" && survivorTeams.size <= 1)) {
        this.room.status = "finished";
        this.room.winner = survivors.length
          ? (this.room.mode === "ffa" ? survivors[0].name : "Team " + survivors[0].team)
          : "Draw";
        this.room.log.push({ at: Date.now(), text: "Match finished. Winner: " + this.room.winner + "." });
      } else {
        const nextPlayer = currentTurnPlayer?.id === player.id
          ? livingBefore[(this.room.turnIndex + 1) % livingBefore.length]
          : currentTurnPlayer;
        this.room.turnIndex = Math.max(0, survivors.findIndex(item => item.id === nextPlayer?.id));
      }
    }

    await this.saveAndBroadcast("player-left");
    return json({ ok: true, room: this.publicState() });
  }

  webSocketMessage(ws, message) {
    let body;
    try { body = JSON.parse(message); } catch { ws.send(JSON.stringify({ type: "error", error: "Invalid message." })); return; }
    if (body.type === "ping") { ws.send(JSON.stringify({ type: "pong" })); return; }
    if (body.type === "action") {
      const attachment = ws.deserializeAttachment();
      const player = this.room?.players.find(item => item.id === attachment?.playerId);
      if (!player) { ws.send(JSON.stringify({ type: "error", error: "Player session not found." })); return; }
      const fakeRequest = new Request("https://room.internal/action", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId: player.id, token: player.token, type: body.action?.type, targetId: body.action?.targetId })
      });
      this.act(fakeRequest).then(async response => {
        const result = await response.json();
        if (!response.ok) ws.send(JSON.stringify({ type: "error", error: result.error || "Action rejected." }));
      }).catch(() => ws.send(JSON.stringify({ type: "error", error: "Action could not be processed." })));
    }
  }

  webSocketClose() {
    // The socket is already closed when this lifecycle callback runs.
  }
}
