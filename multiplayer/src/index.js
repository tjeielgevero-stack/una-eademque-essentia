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
const DEFAULT_RESISTANCES = { slash: 1, pierce: 1, blunt: 1.5 };
const RESISTANCE_VALUES = [0.5, 1, 1.5, 2, 2.5];
const STATUS_EFFECTS = new Set(["Burn","Bleed","Rupture","Sinking","Tremor","Poise","Charge","Haste","Bind","Fragile","Protection","Strength","Feeble","Paralyze","Paralysis","Disarm","Smoke","Fairy","Erosion","Offense Level Up","Offense Level Down","Defense Level Up","Defense Level Down","Damage Up","Damage Down","Coin Power Up","Coin Power Down","Ammo","Aggro","Fanatic","Nails","Talisman","Tremor Burst","Stagger Protection","Endurance","Persistence","Blood","Nullify Power","Immobilized"]);
function safeResistances(input) {
  const source = input && typeof input === "object" ? input : {};
  const result = {};
  for (const type of ["slash", "pierce", "blunt"]) {
    const value = Number(source[type]);
    result[type] = RESISTANCE_VALUES.includes(value) ? value : DEFAULT_RESISTANCES[type];
  }
  return Math.abs(result.slash + result.pierce + result.blunt - 3.5) < 0.001 ? result : { ...DEFAULT_RESISTANCES };
}
function safeCharacter(input) {
  const source = input && typeof input === "object" ? input : {};
  const cleanList = value => Array.isArray(value) ? value.slice(0, 8).map(item => cleanText(item, 160)).filter(Boolean) : [];
  return {
    id: cleanText(source.id, 80),
    name: cleanText(source.name, 60) || "Unnamed Variant",
    title: cleanText(source.title, 80),
    race: cleanText(source.race, 60),
    mode: ["simple", "advanced", "complex"].includes(source.mode) ? source.mode : "simple",
    origin: cleanText(source.origin, 140),
    affiliation: cleanText(source.affiliation, 120),
    grade: cleanText(source.grade, 60),
    appearance: cleanText(source.appearance, 500),
    backstory: cleanText(source.backstory, 700),
    egoName: cleanText(source.egoName, 100),
    egoType: cleanText(source.egoType, 80),
    egoEligible: source.egoEligible === true,
    resistances: safeResistances(source.resistances),
    personality: cleanList(source.personality),
    abilities: cleanList(source.abilities),
    ultimateAbilities: cleanList(source.ultimateAbilities),
    passiveAbility: cleanText(source.passiveAbility, 240),
    likes: cleanList(source.likes),
    dislikes: cleanList(source.dislikes),
    profileSummary: cleanText(source.profileSummary, 12000)
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
      players: [{ id: crypto.randomUUID(), token, name: body.playerName, character: body.character, team: teamFor(body.mode, 0), hp: 100, guarding: false, egoUsed: false, egoActive: false, statusEffects: [], ultimateCharge: 0, ultimateUsed: false, status: "READY" }],
      turnIndex: 0, round: 1, pendingChallenge: null, log: [{ at: Date.now(), kind: "system", text: "Room created. Waiting for challengers." }]
    };
    await this.ctx.storage.put("room", this.room);
    return json({ room: this.publicState(this.room.players[0].id), player: { id: this.room.players[0].id, token } });
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

  publicState(viewerId = null) {
    if (!this.room) return null;
    const players = this.room.players.map(player => ({
      id: player.id, name: player.name, character: player.character, team: player.team,
      hp: player.hp, guarding: player.guarding, egoUsed: player.egoUsed,
      egoActive: !!player.egoActive, resistances: player.character?.resistances || DEFAULT_RESISTANCES,
      statusEffects: Array.isArray(player.statusEffects) ? player.statusEffects : [],
      ultimateCharge: player.ultimateCharge || 0,
      ultimateUsed: !!player.ultimateUsed, status: player.status || (player.hp > 0 ? "READY" : "OUT"),
      connected: this.ctx.getWebSockets().some(ws => ws.deserializeAttachment()?.playerId === player.id)
    }));
    const living = players.filter(player => player.hp > 0);
    const active = this.room.status === "active" ? living[this.room.turnIndex % Math.max(1, living.length)] : null;
    return {
      code: this.room.code, mode: this.room.mode, visibility: this.room.visibility,
      maxPlayers: this.room.maxPlayers, status: this.room.status,
      hostPlayerId: this.room.players[0]?.id || null,
      players, turnPlayerId: active?.id || null, round: this.room.round,
      pendingChallenge: this.room.pendingChallenge ? {
        id: this.room.pendingChallenge.id,
        type: this.room.pendingChallenge.type,
        attackerId: this.room.pendingChallenge.attackerId,
        defenderId: this.room.pendingChallenge.defenderId || null,
        qtePlayerId: this.room.pendingChallenge.qtePlayerId || null,
        targetId: this.room.pendingChallenge.targetId,
        step: this.room.pendingChallenge.step || 0,
        totalSteps: this.room.pendingChallenge.totalSteps || 1,
        prompt: viewerId === (this.room.pendingChallenge.type === "parry" ? this.room.pendingChallenge.defenderId : this.room.pendingChallenge.qtePlayerId) ? this.room.pendingChallenge.prompt : null,
        expiresAt: this.room.pendingChallenge.expiresAt,
        windowMs: this.room.pendingChallenge.windowMs
      } : null,
      log: this.room.log.slice(-45), winner: this.room.winner || null
    };
  }

  async saveAndBroadcast(message = "state") {
    await this.ctx.storage.put("room", this.room);
    if (this.room.pendingChallenge) await this.ctx.storage.setAlarm(this.room.pendingChallenge.expiresAt);
    else await this.ctx.storage.deleteAlarm();
    for (const ws of this.ctx.getWebSockets()) {
      try {
        const viewerId = ws.deserializeAttachment()?.playerId || null;
        ws.send(JSON.stringify({ type: message, state: this.publicState(viewerId) }));
      } catch { /* stale connection */ }
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
    server.send(JSON.stringify({ type: "state", state: this.publicState(player.id) }));
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
      hp: 100, guarding: false, egoUsed: false, egoActive: false, statusEffects: [],
      ultimateCharge: 0, ultimateUsed: false, status: "READY"
    };
    this.room.players.push(player);
    this.room.log.push({ at: Date.now(), kind: "system", text: player.name + " joined the room." });
    const host = this.room.players.find(item => item.id !== player.id);
    if (host) this.room.log.push({ at: Date.now(), kind: "chat", text: this.interactionLine(host, player, "meet") });
    await this.saveAndBroadcast("player-joined");
    return json({ room: this.publicState(player.id), player: { id: player.id, token: player.token } }, 201);
  }

  async getState(request) {
    if (!this.room) return json({ error: "Room not found." }, 404);
    const player = this.auth(request);
    if (!player) return json({ error: "Invalid room credentials." }, 403);
    return json({ room: this.publicState(player.id) });
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
    this.room.players.forEach(item => { item.ultimateCharge = 0; item.ultimateUsed = false; item.status = "READY"; });
    this.room.players.forEach((item, index) => {
      const other = this.room.players[(index + 1) % this.room.players.length];
      if (item.id !== other.id) this.room.log.push({ at: Date.now(), kind: "chat", text: this.interactionLine(item, other, "opening") });
    });
    this.room.turnIndex = 0;
    this.room.round = 1;
    this.room.log.push({ at: Date.now(), text: "The match has begun. " + this.room.players[0].name + " takes the first turn." });
    await this.saveAndBroadcast("match-started");
    return json({ room: this.publicState(player.id) });
  }

  addLog(kind, text) {
    this.room.log.push({ at: Date.now(), kind, text });
    if (this.room.log.length > 90) this.room.log.splice(0, this.room.log.length - 90);
  }

  applyStatusEffect(target, name, potency) {
    if (!target || !STATUS_EFFECTS.has(name)) return;
    const value = [5, 15, 20, 30].includes(Number(potency)) ? Number(potency) : 5;
    if (!Array.isArray(target.statusEffects)) target.statusEffects = [];
    const existing = target.statusEffects.find(effect => effect.name === name);
    if (existing) {
      existing.potency = Math.min(30, (existing.potency || 0) + value);
      existing.turns = 2;
    } else {
      target.statusEffects.push({ name, potency: value, turns: 2 });
    }
    this.addLog("action", target.name + " receives " + name + " (" + value + ") for two turns.");
  }

  damageWithModifiers(attacker, target, baseDamage, damageType = "slash") {
    const type = ["slash", "pierce", "blunt"].includes(damageType) ? damageType : "slash";
    const resistance = Number(target.character?.resistances?.[type]);
    const multiplier = [0.5, 1, 1.5, 2, 2.5].includes(resistance) ? resistance : 1;
    const potency = (unit, name) => Math.min(30, (unit.statusEffects || []).filter(effect => effect.name === name).reduce((sum, effect) => sum + (Number(effect.potency) || 0), 0));
    let damage = Math.round(baseDamage * multiplier);
    damage = Math.round(damage * (1 + potency(attacker, "Strength") / 100));
    damage = Math.round(damage * (1 - potency(attacker, "Feeble") / 100));
    damage = Math.round(damage * (1 + potency(target, "Fragile") / 100));
    damage = Math.round(damage * (1 - potency(target, "Protection") / 100));
    return Math.max(1, damage);
  }

  processStatusTurn(player) {
    if (!player || !Array.isArray(player.statusEffects) || !player.statusEffects.length) return;
    const damageOverTime = new Set(["Burn", "Bleed", "Rupture", "Sinking", "Tremor", "Fairy", "Erosion"]);
    for (const effect of player.statusEffects) {
      if (damageOverTime.has(effect.name) && player.hp > 0) {
        const tick = Math.max(1, Math.ceil((Number(effect.potency) || 5) / 10));
        player.hp = Math.max(0, player.hp - tick);
        this.addLog("action", effect.name + " affects " + player.name + " for " + tick + " damage.");
      }
      effect.turns = Math.max(0, (Number(effect.turns) || 1) - 1);
    }
    player.statusEffects = player.statusEffects.filter(effect => effect.turns > 0);
    if (player.hp === 0) this.addLog("system", player.name + " is out of the match.");
  }

  interactionLine(first, second, context = "reply") {
    const voice = character => {
      const traits = (character.character?.personality || []).map(value => String(value).toLowerCase());
      const has = key => traits.some(value => value.includes(key));
      const styles = [
        [has("sarcastic") || has("witty"), ["That was almost convincing.", "You always make an entrance, don't you?", "I will admit, that was more interesting than expected."]],
        [has("analytical") || has("stoic"), ["I have noted your timing. Try not to make it predictable.", "A useful exchange. I will remember that.", "Your next decision will tell me more than the last."]],
        [has("protective") || has("loyal"), ["Stay close. I will cover the opening.", "I have your back. Do not waste the chance.", "We can settle this without leaving anyone behind."]],
        [has("gentle") || has("compassionate"), ["Are you alright? I would rather keep this fair.", "There is still time to choose a better response.", "I see what you are trying to do. Be careful."]],
        [has("aloof") || has("reserved"), ["Let us get this over with.", "I have nothing to add. Continue.", "Do not mistake my silence for hesitation."]],
        [has("cheerful") || has("outgoing"), ["Now this is a proper meeting!", "Come on, I know you have more to show.", "That was a good exchange. Again!"]]
      ];
      const chosen = styles.find(([match]) => match)?.[1] || ["Let us see what you choose next.", "I understand. Continue.", "This is not quite what I expected."];
      return chosen[Math.floor(Math.random() * chosen.length)];
    };
    const a = first.name + ": “" + voice(first) + "”";
    const b = second.name + ": “" + (context === "meet" ? "I have heard of you. Let us see how much of it is true." : voice(second)) + "”";
    return a + "  ·  " + b;
  }

  validTarget(player, targetId) {
    const target = this.room.players.find(item => item.id === targetId && item.hp > 0);
    if (!target) return null;
    if (target.id === player.id) return null;
    if (this.room.mode === "2v2" && target.team === player.team) return null;
    return target;
  }

  currentActor() {
    const living = this.room.players.filter(item => item.hp > 0);
    return living[this.room.turnIndex % Math.max(1, living.length)] || null;
  }

  finishMatchIfNeeded() {
    const survivors = this.room.players.filter(item => item.hp > 0);
    const teams = new Set(survivors.map(item => item.team));
    const ended = survivors.length <= 1 || (this.room.mode === "2v2" && teams.size <= 1);
    if (!ended) return false;
    this.room.status = "finished";
    this.room.pendingChallenge = null;
    this.room.winner = survivors.length
      ? (this.room.mode === "2v2" ? "Team " + survivors[0].team : survivors[0].name)
      : "Draw";
    this.addLog("system", "Match finished. Winner: " + this.room.winner + ".");
    return true;
  }

  advanceTurn(actor) {
    const originalIndex = actor ? this.room.players.findIndex(item => item.id === actor.id) : -1;
    if (actor) this.processStatusTurn(actor);
    if (actor && actor.hp > 0) actor.ultimateCharge = Math.min(3, (actor.ultimateCharge || 0) + 1);
    if (this.finishMatchIfNeeded()) return;
    const living = this.room.players.filter(item => item.hp > 0);
    let next = null;
    for (let offset = 1; offset <= this.room.players.length; offset += 1) {
      const candidate = this.room.players[(Math.max(0, originalIndex) + offset) % this.room.players.length];
      if (candidate && candidate.hp > 0) { next = candidate; break; }
    }
    this.room.turnIndex = Math.max(0, living.findIndex(item => item.id === next?.id));
    if (this.room.turnIndex === 0) this.room.round += 1;
    if (next) this.addLog("system", "Round " + this.room.round + ": " + next.name + " is up next.");
    if (actor && this.room.mode === "2v2") {
      const ally = living.find(item => item.team === actor.team && item.id !== actor.id);
      if (ally && Math.random() < 0.45) this.addLog("chat", this.interactionLine(ally, actor, "support"));
    }
  }

  async completeParry(success, timedOut = false) {
    const challenge = this.room?.pendingChallenge;
    if (!challenge || challenge.type !== "parry") return;
    const attacker = this.room.players.find(item => item.id === challenge.attackerId);
    const defender = this.room.players.find(item => item.id === challenge.defenderId);
    this.room.pendingChallenge = null;
    if (!attacker || !defender || defender.hp <= 0) {
      if (attacker) this.advanceTurn(attacker);
      await this.saveAndBroadcast("parry-ended");
      return;
    }
    let damage = 0;
    if (success) {
      defender.status = "PARRY SUCCESS";
      attacker.status = "DEFLECTED";
      defender.guarding = false;
      this.addLog("action", defender.name + " perfectly parries " + attacker.name + "’s " + challenge.attackType + ".");
      this.addLog("chat", this.interactionLine(defender, attacker, "parry"));
    } else {
      damage = this.damageWithModifiers(attacker, defender, challenge.damage, challenge.damageType);
      if (defender.guarding) { damage = Math.max(2, Math.floor(damage * 0.45)); defender.guarding = false; }
      defender.hp = Math.max(0, defender.hp - damage);
      this.applyStatusEffect(defender, challenge.statusEffect, challenge.statusPotency);
      defender.status = timedOut ? "PARRY MISSED" : "PARRY FAILED";
      attacker.status = challenge.attackType === "ego" ? "E.G.O. STRIKE" : "ATTACK RESOLVED";
      this.addLog("action", attacker.name + "’s " + challenge.damageType + " " + challenge.attackType + " connects for " + damage + " damage.");
      this.addLog("chat", defender.name + ": “" + (timedOut ? "I was a moment too late." : "I misread that exchange.") + "”");
    }
    if (defender.hp === 0) this.addLog("system", defender.name + " is out of the match.");
    this.advanceTurn(attacker);
    await this.saveAndBroadcast(success ? "parry-success" : "parry-failed");
  }

  async failUltimate(timedOut = false) {
    const challenge = this.room?.pendingChallenge;
    if (!challenge || challenge.type !== "ultimate") return;
    const actor = this.room.players.find(item => item.id === challenge.attackerId);
    this.room.pendingChallenge = null;
    if (actor) {
      actor.ultimateCharge = 0;
      actor.status = "ULTIMATE INTERRUPTED";
      this.addLog("system", actor.name + "’s ultimate sequence breaks " + (timedOut ? "when the timing window closes." : "after a missed input."));
      this.addLog("chat", actor.name + ": “I need to gather myself and try again.”");
      this.advanceTurn(actor);
    }
    await this.saveAndBroadcast("ultimate-failed");
  }

  async completeUltimate() {
    const challenge = this.room?.pendingChallenge;
    if (!challenge || challenge.type !== "ultimate") return;
    const actor = this.room.players.find(item => item.id === challenge.attackerId);
    const target = this.room.players.find(item => item.id === challenge.targetId && item.hp > 0);
    this.room.pendingChallenge = null;
    if (!actor || !target || actor.hp <= 0) {
      if (actor) this.advanceTurn(actor);
      await this.saveAndBroadcast("ultimate-ended");
      return;
    }
    let damage = this.damageWithModifiers(actor, target, 34 + Math.floor(Math.random() * 13), challenge.damageType);
    if (target.guarding) { damage = Math.max(8, Math.floor(damage * 0.5)); target.guarding = false; }
    target.hp = Math.max(0, target.hp - damage);
    this.applyStatusEffect(target, challenge.statusEffect, challenge.statusPotency);
    actor.ultimateCharge = 0;
    actor.ultimateUsed = true;
    actor.status = "ULTIMATE RELEASED";
    target.status = target.hp === 0 ? "OUT" : "RECOVERING";
    this.addLog("action", actor.name + " completes the ultimate sequence against " + target.name + " for " + damage + " " + challenge.damageType + " damage.");
    this.addLog("chat", this.interactionLine(actor, target, "ultimate"));
    if (target.hp === 0) this.addLog("system", target.name + " is out of the match.");
    this.advanceTurn(actor);
    await this.saveAndBroadcast("ultimate-success");
  }

  async resolveParry(player, body) {
    const challenge = this.room.pendingChallenge;
    if (!challenge || challenge.type !== "parry" || challenge.id !== body.challengeId) return json({ error: "That parry window is no longer active." }, 409);
    if (challenge.defenderId !== player.id) return json({ error: "Only the targeted player can attempt this parry." }, 403);
    if (Date.now() > challenge.expiresAt) {
      await this.completeParry(false, true);
      return json({ error: "The parry timing window has closed." }, 409);
    }
    const success = String(body.input || "").toUpperCase() === challenge.prompt;
    if (!success) {
      await this.completeParry(false, false);
      return json({ room: this.publicState(player.id), parried: false });
    }
    challenge.step += 1;
    if (challenge.step >= challenge.totalSteps) {
      await this.completeParry(true, false);
      return json({ room: this.publicState(player.id), parried: true });
    }
    challenge.prompt = challenge.sequence[challenge.step];
    challenge.windowMs = 1500;
    challenge.expiresAt = Date.now() + challenge.windowMs;
    this.addLog("system", "Parry chain advanced: " + challenge.step + "/" + challenge.totalSteps + ".");
    await this.saveAndBroadcast("parry-step");
    return json({ room: this.publicState(player.id), parried: "step" });
  }

  async resolveQte(player, body) {
    const challenge = this.room.pendingChallenge;
    if (!challenge || challenge.type !== "ultimate" || challenge.id !== body.challengeId) return json({ error: "That ultimate sequence is no longer active." }, 409);
    if (challenge.qtePlayerId !== player.id) return json({ error: "Only the player activating the ultimate can answer this sequence." }, 403);
    if (Date.now() > challenge.expiresAt) {
      await this.failUltimate(true);
      return json({ error: "The ultimate timing window has closed." }, 409);
    }
    if (String(body.input || "").toUpperCase() !== challenge.prompt) {
      challenge.mistakes = (challenge.mistakes || 0) + 1;
      if (challenge.mistakes > 1) {
        await this.failUltimate(false);
        return json({ error: "The ultimate sequence was interrupted." }, 409);
      }
      this.addLog("system", "The ultimate sequence absorbs one missed input and continues.");
    }
    challenge.step += 1;
    if (challenge.step >= challenge.totalSteps) {
      await this.completeUltimate();
      return json({ room: this.publicState(player.id), ultimate: "success" });
    }
    const windows = [2400, 2200, 2000];
    challenge.prompt = challenge.sequence[challenge.step];
    challenge.windowMs = windows[challenge.step] || 2000;
    challenge.expiresAt = Date.now() + challenge.windowMs;
    this.addLog("system", "Ultimate sequence advanced: " + challenge.step + "/" + challenge.totalSteps + ".");
    await this.saveAndBroadcast("ultimate-step");
    return json({ room: this.publicState(player.id), ultimate: "step" });
  }

  async act(request) {
    if (!this.room) return json({ error: "Room not found." }, 404);
    const body = await request.json().catch(() => ({}));
    const player = this.auth(request, body);
    if (!player) return json({ error: "Invalid room credentials." }, 403);
    if (this.room.pendingChallenge) {
      if (body.type === "parry") return this.resolveParry(player, body);
      if (body.type === "qte") return this.resolveQte(player, body);
      return json({ error: "Resolve the current quick-time event before another action." }, 409);
    }
    if (this.room.status !== "active") return json({ error: "The match is not active." }, 409);
    const current = this.currentActor();
    if (!current || current.id !== player.id) return json({ error: "It is not your turn." }, 409);
    const type = body.type;
    if (!["attack", "defend", "ego", "pass", "ultimate"].includes(type)) return json({ error: "Unknown action." }, 400);
    if (type === "defend") {
      player.guarding = true;
      player.status = "GUARDING";
      this.addLog("action", player.name + " takes a defensive stance.");
      this.advanceTurn(player);
      await this.saveAndBroadcast("action");
      return json({ room: this.publicState(player.id) });
    }
    if (type === "pass") {
      player.status = "WAITING";
      this.addLog("action", player.name + " passes their turn.");
      this.advanceTurn(player);
      await this.saveAndBroadcast("action");
      return json({ room: this.publicState(player.id) });
    }
    if (type === "ultimate") {
      if (player.ultimateUsed) return json({ error: "This character has already used their ultimate in this match." }, 409);
      if ((player.ultimateCharge || 0) < 3) return json({ error: "Ultimate activation requires three completed actions. Current charge: " + (player.ultimateCharge || 0) + "/3." }, 409);
    }
    const target = this.validTarget(player, body.targetId);
    if (!target) return json({ error: "Choose an active opponent. Friendly fire is not allowed in 2v2." }, 400);
    if (type === "ego" && (!player.character.egoEligible || player.egoUsed)) return json({ error: "This character cannot use E.G.O. right now." }, 400);
    if (type === "ultimate") {
      const sequence = Array.from({ length: 3 }, () => ["UP", "DOWN", "LEFT", "RIGHT"][Math.floor(Math.random() * 4)]);
      const firstWindow = 2400;
      this.room.pendingChallenge = {
        id: crypto.randomUUID(), type: "ultimate", attackerId: player.id,
        qtePlayerId: player.id, targetId: target.id, sequence,
        step: 0, totalSteps: sequence.length, mistakes: 0,
        damageType: ["slash", "pierce", "blunt"].includes(body.damageType) ? body.damageType : "slash",
        statusEffect: STATUS_EFFECTS.has(body.statusEffect) ? body.statusEffect : "",
        statusPotency: [5, 15, 20, 30].includes(Number(body.statusPotency)) ? Number(body.statusPotency) : 5,
        prompt: sequence[0], windowMs: firstWindow, expiresAt: Date.now() + firstWindow
      };
      player.status = "ULTIMATE CHARGING";
      this.addLog("system", player.name + " begins a three-step ultimate sequence. One missed input is allowed.");
      await this.saveAndBroadcast("ultimate-start");
      return json({ room: this.publicState(player.id), ultimate: "started" });
    }
    if (type === "ego") {
      player.egoUsed = true;
      player.egoActive = true;
      this.addLog("system", player.name + " manifests " + (player.character.egoName || "their E.G.O.") + ".");
    }
    const damage = type === "ego" ? 21 + Math.floor(Math.random() * 8) : 12 + Math.floor(Math.random() * 7);
    const windowMs = 1500;
    const sequence = Array.from({ length: 3 }, () => ["UP", "DOWN", "LEFT", "RIGHT"][Math.floor(Math.random() * 4)]);
    this.room.pendingChallenge = {
      id: crypto.randomUUID(), type: "parry", attackerId: player.id,
      defenderId: target.id, targetId: target.id, attackType: type, damage,
      damageType: ["slash", "pierce", "blunt"].includes(body.damageType) ? body.damageType : "slash",
      statusEffect: STATUS_EFFECTS.has(body.statusEffect) ? body.statusEffect : "",
      statusPotency: [5, 15, 20, 30].includes(Number(body.statusPotency)) ? Number(body.statusPotency) : 5,
      sequence, step: 0, totalSteps: sequence.length,
      prompt: sequence[0], windowMs, expiresAt: Date.now() + windowMs
    };
    player.status = type === "ego" ? "E.G.O. STRIKE" : "ATTACKING";
    target.status = "PARRY WINDOW";
    this.addLog("action", player.name + (type === "ego" ? " sends " + (player.character.egoName || "an E.G.O. strike") : " attacks") + " " + target.name + ". A three-step parry window opens.");
    await this.saveAndBroadcast("parry-open");
    return json({ room: this.publicState(player.id), parry: "open" });
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

    const pending = this.room.pendingChallenge;
    if (pending && [pending.attackerId, pending.defenderId, pending.qtePlayerId, pending.targetId].includes(player.id)) {
      this.room.pendingChallenge = null;
      this.addLog("system", "The pending exchange is canceled because " + player.name + " left the room.");
    }
    this.room.log.push({ at: Date.now(), kind: "system", text: player.name + " left the room." });
    if (this.room.status === "lobby") {
      this.room.players = this.room.players.filter(item => item.id !== player.id);
      this.room.players.forEach((item, index) => {
        item.team = teamFor(this.room.mode, index);
      });
    } else {
      player.hp = 0;
    }

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
          ? (this.room.mode === "2v2" ? "Team " + survivors[0].team : survivors[0].name)
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
    return json({ ok: true, room: this.publicState(player.id) });
  }

  async alarm() {
    await this.ready;
    const challenge = this.room?.pendingChallenge;
    if (!challenge) return;
    if (Date.now() < challenge.expiresAt) {
      await this.ctx.storage.setAlarm(challenge.expiresAt);
      return;
    }
    if (challenge.type === "parry") await this.completeParry(false, true);
    else if (challenge.type === "ultimate") await this.failUltimate(true);
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
