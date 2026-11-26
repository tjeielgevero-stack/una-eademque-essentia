(() => {
  "use strict";
  const API_KEY = "uee_multiplayer_api_v1";
  const SESSION_KEY = "uee_multiplayer_session_v1";
  const $ = (id) => document.getElementById(id);
  let socket = null;
  let current = null;
  let latestRoom = null;
  let refreshTimer = null;

  const css = document.createElement("style");
  css.textContent = `
    .mp-home-button{margin-top:10px}
    .mp-screen{width:min(1050px,calc(100% - 32px));margin:34px auto 70px}
    .mp-panel{background:linear-gradient(145deg,#1d1b1a,#111);border:1px solid #51483f;padding:clamp(18px,4vw,34px);box-shadow:0 18px 70px #0008}
    .mp-heading{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(30px,5vw,48px);letter-spacing:.08em;margin:4px 0 8px}
    .mp-kicker{font:11px 'DM Mono',monospace;letter-spacing:.18em;color:#b7a895}
    .mp-muted{color:#aaa198;line-height:1.5}
    .mp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:20px 0}
    .mp-field{display:flex;flex-direction:column;gap:7px;font:12px 'DM Mono',monospace;color:#c9c0b5;letter-spacing:.06em}
    .mp-field input,.mp-field select{width:100%;background:#0e0e0e;color:#eee;border:1px solid #5a5148;padding:12px;font:14px Georgia,serif;min-height:44px}
    .mp-actions{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}
    .mp-actions button,.mp-room-card button{cursor:pointer}
    .mp-status{min-height:24px;color:#d8c9b3;font:12px 'DM Mono',monospace;margin:10px 0}
    .mp-room-card{border:1px solid #49423b;background:#171615;padding:15px;margin:12px 0}
    .mp-room-code{font:700 28px 'DM Mono',monospace;letter-spacing:.2em;color:#eee}
    .mp-player-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:16px 0}
    .mp-player{padding:12px;border:1px solid #48413a;background:#111}
    .mp-player.mp-current{border-color:#c7b69f;box-shadow:inset 0 0 0 1px #c7b69f}
    .mp-player strong{display:block;font-size:17px}
    .mp-player small{display:block;color:#aaa;margin-top:5px}
    .mp-hp{height:6px;background:#393330;margin-top:10px;overflow:hidden}
    .mp-hp span{display:block;height:100%;background:#b8a58f}
    .mp-log{max-height:240px;overflow:auto;border:1px solid #39332e;padding:10px;background:#0e0e0e}
    .mp-log p{font:12px/1.5 'DM Mono',monospace;color:#c8beb2;margin:7px 0}
    .mp-action-grid{display:flex;flex-wrap:wrap;gap:9px;align-items:end;margin-top:14px}
    .mp-action-grid button{min-height:42px}
    .mp-hidden{display:none!important}
    .mp-section-title{border-bottom:1px solid #51483f;padding-bottom:9px;margin-top:28px;font:12px 'DM Mono',monospace;letter-spacing:.14em;color:#c8b9a6}
    .mp-back{margin-bottom:18px}
    @media(max-width:600px){.mp-actions button{width:100%}.mp-room-code{font-size:23px}}
  `;
  document.head.append(css);

  function make(tag, attrs = {}, text = "") {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "className") node.className = value;
      else if (key === "onClick") node.addEventListener("click", value);
      else if (key === "disabled") node.disabled = !!value;
      else node.setAttribute(key, value);
    });
    if (text !== "") node.textContent = text;
    return node;
  }
  function savedRecords() {
    try {
      const records = JSON.parse(localStorage.getItem("uee_oc_archive_v1") || "[]");
      return Array.isArray(records) ? records : [];
    } catch { return []; }
  }
  function answer(record, keys) {
    const a = record.answers || {};
    for (const key of keys) {
      const item = a[key];
      const value = item && (item.value ?? item.custom);
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  }
  function characterSnapshot(record) {
    const ego = typeof window.simEgoProfile === "function" ? window.simEgoProfile(record) : { eligible: false, name: "" };
    return {
      id: record.id,
      name: record.name || "Unnamed Variant",
      mode: record.mode || "simple",
      origin: answer(record, ["origin_type", "origin", "complex_1"]),
      affiliation: answer(record, ["affiliation", "complex_5"]),
      grade: answer(record, ["grade", "fixer_grade", "complex_12"]),
      egoName: ego.name || answer(record, ["ego_name", "complex_43"]),
      egoEligible: !!ego.eligible
    };
  }
  function getApi() { return (localStorage.getItem(API_KEY) || "").trim().replace(/\/$/, ""); }
  function setStatus(message) { const el = $("mp-status"); if (el) el.textContent = message; }
  function sessionSave() { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(current)); } catch {} }
  function sessionClear() { try { sessionStorage.removeItem(SESSION_KEY); } catch {} }
  function loadSession() { try { current = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { current = null; } }

  const screen = document.createElement("section");
  screen.id = "multiplayer-screen";
  screen.className = "screen hidden mp-screen";
  screen.innerHTML = `
    <div class="mp-panel">
      <button id="mp-back" class="text-button mp-back" type="button">← MAIN MENU</button>
      <p class="mp-kicker">UNA EADEMQUE ESSENTIA / NETWORKED MIRROR ARENA</p>
      <h2 class="mp-heading">MULTIPLAYER ARENA</h2>
      <p class="mp-muted">Create a room, invite other players with its code, and take turns in a shared battle. Each player uses a character saved in their own local archive.</p>
      <div class="mp-grid">
        <label class="mp-field">WORKER ADDRESS
          <input id="mp-api" type="url" placeholder="https://uee-multiplayer.YOUR-SUBDOMAIN.workers.dev" autocomplete="url">
        </label>
        <label class="mp-field">YOUR PLAYER NAME
          <input id="mp-player-name" maxlength="24" placeholder="Enter a display name" value="Player">
        </label>
        <label class="mp-field">YOUR SAVED CHARACTER
          <select id="mp-character"></select>
        </label>
      </div>
      <p class="mp-status" id="mp-status" role="status" aria-live="polite">Enter your Worker address and choose a saved character to begin.</p>
      <div id="mp-lobby-tools">
        <div class="mp-section-title">CREATE A ROOM</div>
        <div class="mp-grid">
          <label class="mp-field">MATCH FORMAT
            <select id="mp-mode"><option value="1v1">1V1 · TWO PLAYERS</option><option value="2v2">2V2 · FOUR PLAYERS</option><option value="ffa">FREE FOR ALL · UP TO FOUR</option></select>
          </label>
          <label class="mp-field">ROOM VISIBILITY
            <select id="mp-visibility"><option value="private">PRIVATE · CODE REQUIRED</option><option value="public">PUBLIC · LISTED ROOM</option></select>
          </label>
        </div>
        <div class="mp-actions"><button id="mp-create" class="primary-button" type="button">CREATE ROOM ↗</button></div>
        <div class="mp-section-title">JOIN WITH A ROOM CODE</div>
        <div class="mp-grid">
          <label class="mp-field">ROOM CODE
            <input id="mp-code-input" maxlength="6" placeholder="ABC123" autocomplete="off">
          </label>
        </div>
        <div class="mp-actions"><button id="mp-join" class="secondary-button" type="button">JOIN ROOM →</button><button id="mp-public-refresh" class="text-button" type="button">REFRESH PUBLIC ROOMS</button></div>
        <div class="mp-section-title">PUBLIC ROOMS</div>
        <div id="mp-public-list"><p class="mp-muted">Refresh to look for open public rooms.</p></div>
        <div id="mp-resume-wrap" class="mp-actions mp-hidden"><button id="mp-resume" class="secondary-button" type="button">RECONNECT TO MY LAST ROOM</button></div>
      </div>
      <div id="mp-room-view" class="mp-hidden">
        <div class="mp-room-card">
          <p class="mp-kicker">ROOM CODE · SHARE THIS WITH YOUR FRIENDS</p>
          <div id="mp-room-code" class="mp-room-code">------</div>
          <p id="mp-room-meta" class="mp-muted"></p>
        </div>
        <div class="mp-section-title">PLAYERS</div>
        <div id="mp-players" class="mp-player-list"></div>
        <div id="mp-host-controls" class="mp-actions mp-hidden"><button id="mp-start" class="primary-button" type="button">START MATCH ↗</button></div>
        <div id="mp-battle-controls" class="mp-hidden">
          <div class="mp-section-title">YOUR TURN</div>
          <div class="mp-grid">
            <label class="mp-field">TARGET
              <select id="mp-target"></select>
            </label>
          </div>
          <div class="mp-action-grid">
            <button id="mp-attack" class="secondary-button" type="button">ATTACK</button>
            <button id="mp-defend" class="secondary-button" type="button">DEFEND</button>
            <button id="mp-ego" class="secondary-button" type="button">ACTIVATE E.G.O.</button>
            <button id="mp-pass" class="text-button" type="button">PASS TURN</button>
          </div>
        </div>
        <div class="mp-section-title">BATTLE FEED</div>
        <div id="mp-log" class="mp-log" aria-live="polite"></div>
        <div class="mp-actions"><button id="mp-leave" class="text-button" type="button">LEAVE ROOM</button></div>
      </div>
    </div>`;
  document.body.append(screen);

  function showScreen() {
    document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
    const home = $("home-screen");
    if (home) home.classList.add("hidden");
    screen.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function returnHome() {
    disconnect();
    screen.classList.add("hidden");
    document.querySelectorAll(".screen").forEach(el => {
      if (el.id === "home-screen") el.classList.remove("hidden");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function fillCharacters() {
    const select = $("mp-character");
    select.innerHTML = "";
    const records = savedRecords();
    if (!records.length) {
      select.add(make("option", { value: "" }, "No saved characters found"));
      return;
    }
    records.forEach(record => select.add(make("option", { value: record.id }, (record.name || "Unnamed Variant") + " · " + (record.mode || "simple").toUpperCase())));
  }
  function selectedCharacter() {
    const record = savedRecords().find(item => item.id === $("mp-character").value);
    return record ? characterSnapshot(record) : null;
  }
  async function api(path, options = {}) {
    const base = getApi();
    if (!base) throw new Error("Enter your Worker address first.");
    const headers = Object.assign({ "content-type": "application/json" }, options.headers || {});
    return fetch(base + path, Object.assign({}, options, { headers })).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request failed (" + response.status + ").");
      return data;
    });
  }
  function credentials() {
    if (!current) return {};
    return { playerId: current.playerId, token: current.token };
  }
  function saveConnection(roomCode, player, host) {
    current = { code: roomCode, playerId: player.id, token: player.token, host: !!host };
    sessionSave();
  }
  function disconnect() {
    if (socket) { try { socket.close(); } catch {} socket = null; }
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  }
  function connect() {
    disconnect();
    if (!current) return;
    const base = getApi();
    if (!base) return;
    const wsBase = base.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
    socket = new WebSocket(wsBase + "/api/rooms/" + current.code + "/ws?playerId=" + encodeURIComponent(current.playerId) + "&token=" + encodeURIComponent(current.token));
    socket.addEventListener("open", () => setStatus("CONNECTED · LIVE ROOM SYNCHRONIZATION ACTIVE."));
    socket.addEventListener("message", event => {
      let data; try { data = JSON.parse(event.data); } catch { return; }
      if (data.type === "error") setStatus(data.error);
      if (data.state) renderRoom(data.state);
    });
    socket.addEventListener("close", () => {
      if (current) setStatus("LIVE CONNECTION CLOSED. You can reconnect to this room.");
    });
    socket.addEventListener("error", () => setStatus("Could not connect to the room. Check the Worker address and try reconnecting."));
  }
  async function openRoom(code) {
    const data = await api("/api/rooms/" + code + "?playerId=" + encodeURIComponent(current.playerId) + "&token=" + encodeURIComponent(current.token));
    renderRoom(data.room);
    $("mp-lobby-tools").classList.add("mp-hidden");
    $("mp-room-view").classList.remove("mp-hidden");
    connect();
  }
  function renderRoom(room) {
    if (!room) return;
    latestRoom = room;
    $("mp-room-code").textContent = room.code;
    $("mp-room-meta").textContent = room.mode.toUpperCase() + " · " + room.visibility.toUpperCase() + " · " + room.players.length + "/" + room.maxPlayers + " PLAYERS · " + room.status.toUpperCase() + (room.round ? " · ROUND " + room.round : "");
    const players = $("mp-players");
    players.innerHTML = "";
    room.players.forEach(player => {
      const card = make("article", { className: "mp-player" + (player.id === room.turnPlayerId ? " mp-current" : "") });
      card.append(make("strong", {}, player.name));
      card.append(make("small", {}, (player.character?.name || "Unnamed Variant") + " · TEAM " + player.team));
      const hp = make("div", { className: "mp-hp" });
      const fill = make("span");
      fill.style.width = Math.max(0, player.hp) + "%";
      hp.append(fill); card.append(hp);
      card.append(make("small", {}, player.hp + " HP" + (player.guarding ? " · DEFENDING" : "") + (player.egoUsed ? " · E.G.O. USED" : "")));
      players.append(card);
    });
    $("mp-host-controls").classList.toggle("mp-hidden", !(current?.host && room.status === "lobby"));
    $("mp-battle-controls").classList.toggle("mp-hidden", room.status !== "active");
    const isMyTurn = room.status === "active" && room.turnPlayerId === current?.playerId;
    ["mp-attack", "mp-defend", "mp-ego", "mp-pass"].forEach(id => $(id).disabled = !isMyTurn);
    const target = $("mp-target");
    const oldTarget = target.value;
    target.innerHTML = "";
    room.players.filter(p => p.hp > 0 && p.id !== current?.playerId && !(room.mode === "2v2" && room.players.find(x => x.id === current.playerId)?.team === p.team)).forEach(p => {
      target.add(make("option", { value: p.id }, p.character?.name || p.name));
    });
    if ([...target.options].some(o => o.value === oldTarget)) target.value = oldTarget;
    const myPlayer = room.players.find(p => p.id === current?.playerId);
    $("mp-ego").disabled = !isMyTurn || !myPlayer?.character?.egoEligible || !!myPlayer?.egoUsed;
    $("mp-attack").disabled = !isMyTurn || !target.options.length;
    const log = $("mp-log");
    log.innerHTML = "";
    room.log.forEach(entry => log.append(make("p", {}, new Date(entry.at).toLocaleTimeString() + " · " + entry.text)));
    log.scrollTop = log.scrollHeight;
    if (room.status === "active") setStatus(isMyTurn ? "YOUR TURN — CHOOSE AN ACTION." : "WAITING FOR " + (room.players.find(p => p.id === room.turnPlayerId)?.name || "THE NEXT PLAYER").toUpperCase() + ".");
    else if (room.status === "finished") setStatus("MATCH FINISHED · WINNER: " + room.winner);
    else setStatus("ROOM LOBBY · WAITING FOR PLAYERS.");
  }
  async function createRoom() {
    const character = selectedCharacter();
    if (!character) throw new Error("Create and save at least one character before entering multiplayer.");
    const data = await api("/api/rooms", { method: "POST", body: JSON.stringify({
      mode: $("mp-mode").value, visibility: $("mp-visibility").value,
      playerName: $("mp-player-name").value.trim() || "Host", character
    }) });
    saveConnection(data.room.code, data.player, true);
    $("mp-lobby-tools").classList.add("mp-hidden");
    $("mp-room-view").classList.remove("mp-hidden");
    renderRoom(data.room);
    connect();
  }
  async function joinRoom(code) {
    const character = selectedCharacter();
    if (!character) throw new Error("Create and save at least one character before entering multiplayer.");
    const data = await api("/api/rooms/" + code.toUpperCase() + "/join", { method: "POST", body: JSON.stringify({
      playerName: $("mp-player-name").value.trim() || "Guest", character
    }) });
    saveConnection(code.toUpperCase(), data.player, false);
    $("mp-lobby-tools").classList.add("mp-hidden");
    $("mp-room-view").classList.remove("mp-hidden");
    renderRoom(data.room);
    connect();
  }
  async function sendAction(type) {
    if (!current) return;
    const body = Object.assign({}, credentials(), { type, targetId: $("mp-target").value });
    const data = await api("/api/rooms/" + current.code + "/action", { method: "POST", body: JSON.stringify(body) });
    renderRoom(data.room);
  }
  async function startMatch() {
    const data = await api("/api/rooms/" + current.code + "/start", { method: "POST", body: JSON.stringify(credentials()) });
    renderRoom(data.room);
  }
  async function leaveRoom() {
    if (current) {
      try { await api("/api/rooms/" + current.code + "/leave", { method: "POST", body: JSON.stringify(credentials()) }); } catch {}
    }
    disconnect(); current = null; latestRoom = null; sessionClear();
    $("mp-room-view").classList.add("mp-hidden");
    $("mp-lobby-tools").classList.remove("mp-hidden");
    setStatus("You left the room.");
  }
  async function refreshPublic() {
    const data = await api("/api/rooms/public");
    const list = $("mp-public-list");
    list.innerHTML = "";
    const rooms = (data.rooms || []).filter(room => room.players < room.maxPlayers);
    if (!rooms.length) { list.append(make("p", { className: "mp-muted" }, "No open public rooms are listed right now.")); return; }
    rooms.forEach(room => {
      const card = make("div", { className: "mp-room-card" });
      card.append(make("strong", {}, room.code + " · " + room.mode.toUpperCase()));
      card.append(make("p", { className: "mp-muted" }, room.players + "/" + room.maxPlayers + " players"));
      card.append(make("button", { className: "secondary-button", onClick: () => joinRoom(room.code).catch(err => setStatus(err.message)) }, "JOIN THIS ROOM"));
      list.append(card);
    });
  }
  async function resume() {
    if (!current) return;
    $("mp-lobby-tools").classList.add("mp-hidden");
    $("mp-room-view").classList.remove("mp-hidden");
    await openRoom(current.code);
  }

  const heroActions = document.querySelector(".hero-actions");
  if (heroActions) {
    const button = make("button", { id: "open-multiplayer-button", className: "secondary-button mp-home-button", type: "button" }, "MULTIPLAYER ARENA  ↗");
    button.addEventListener("click", () => { fillCharacters(); showScreen(); });
    heroActions.append(button);
  }
  $("mp-back").addEventListener("click", returnHome);
  $("mp-api").value = getApi();
  $("mp-api").addEventListener("change", () => {
    localStorage.setItem(API_KEY, $("mp-api").value.trim().replace(/\/$/, ""));
    setStatus("Worker address saved on this device.");
  });
  $("mp-create").addEventListener("click", () => createRoom().catch(err => setStatus(err.message)));
  $("mp-join").addEventListener("click", () => {
    const code = $("mp-code-input").value.trim();
    if (!/^[A-Z0-9]{6}$/i.test(code)) { setStatus("Enter a six-character room code."); return; }
    joinRoom(code).catch(err => setStatus(err.message));
  });
  $("mp-public-refresh").addEventListener("click", () => refreshPublic().catch(err => setStatus(err.message)));
  $("mp-start").addEventListener("click", () => startMatch().catch(err => setStatus(err.message)));
  $("mp-attack").addEventListener("click", () => sendAction("attack").catch(err => setStatus(err.message)));
  $("mp-defend").addEventListener("click", () => sendAction("defend").catch(err => setStatus(err.message)));
  $("mp-ego").addEventListener("click", () => sendAction("ego").catch(err => setStatus(err.message)));
  $("mp-pass").addEventListener("click", () => sendAction("pass").catch(err => setStatus(err.message)));
  $("mp-leave").addEventListener("click", leaveRoom);
  $("mp-resume").addEventListener("click", () => resume().catch(err => setStatus(err.message)));

  loadSession();
  if (current) $("mp-resume-wrap").classList.remove("mp-hidden");
  fillCharacters();
})();