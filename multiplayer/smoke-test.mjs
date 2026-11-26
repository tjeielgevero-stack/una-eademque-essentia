const BASE = (process.env.UEE_WORKER_URL || "https://uee-multiplayer.tjeielgevero.workers.dev").replace(/\/$/, "");
const failures = [];

function check(condition, message) {
  if (!condition) throw new Error(message);
}
async function request(path, method = "GET", body) {
  const response = await fetch(BASE + path, {
    method,
    headers: body === undefined ? {} : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}
function playerBody(player, extra = {}) {
  return { playerId: player.id, token: player.token, ...extra };
}
function character(name, egoEligible = true) {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    mode: "advanced",
    origin: "Smoke Test",
    affiliation: "Test Association",
    grade: "Test",
    egoName: name + " E.G.O.",
    egoEligible
  };
}
async function createRoom(mode = "1v1", visibility = "private", hostName = "Smoke Host") {
  const result = await request("/api/rooms", "POST", {
    mode, visibility, playerName: hostName, character: character(hostName)
  });
  check(result.status === 201, "Room creation failed (HTTP " + result.status + ").");
  check(result.data.room && result.data.player?.id && result.data.player?.token, "Room creation response was incomplete.");
  return result.data;
}
async function joinRoom(code, name) {
  const result = await request("/api/rooms/" + code + "/join", "POST", {
    playerName: name, character: character(name)
  });
  check(result.status === 201, "Joining " + code + " failed (HTTP " + result.status + ").");
  return result.data;
}
async function startRoom(code, player) {
  return request("/api/rooms/" + code + "/start", "POST", playerBody(player));
}
async function getState(code, player) {
  const query = new URLSearchParams({ playerId: player.id, token: player.token });
  return request("/api/rooms/" + code + "?" + query.toString());
}
async function action(code, player, type, targetId) {
  return request("/api/rooms/" + code + "/action", "POST", playerBody(player, { type, targetId }));
}
async function leaveRoom(code, player) {
  return request("/api/rooms/" + code + "/leave", "POST", playerBody(player));
}
function nextSocketMessage(socket, predicate, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.removeEventListener("message", onMessage);
      reject(new Error("Timed out waiting for a multiplayer WebSocket update."));
    }, timeoutMs);
    function onMessage(event) {
      let payload;
      try { payload = JSON.parse(event.data); } catch { return; }
      if (!predicate(payload)) return;
      clearTimeout(timer);
      socket.removeEventListener("message", onMessage);
      resolve(payload);
    }
    socket.addEventListener("message", onMessage);
  });
}
async function openSocket(code, player) {
  check(typeof WebSocket === "function", "This Node.js runtime does not provide a WebSocket client.");
  const query = new URLSearchParams({ playerId: player.id, token: player.token });
  const wsUrl = BASE.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:") +
    "/api/rooms/" + code + "/ws?" + query.toString();
  const socket = new WebSocket(wsUrl);
  try {
    const initial = await nextSocketMessage(socket, message => message.type === "state" && !!message.state);
    return { socket, initial };
  } catch (error) {
    try { socket.close(); } catch {}
    throw error;
  }
}
async function run(name, fn) {
  try {
    await fn();
    console.log("PASS: " + name);
  } catch (error) {
    failures.push(name + ": " + error.message);
    console.error("FAIL: " + name + " — " + error.message);
  }
}

await run("Worker health endpoint", async () => {
  const result = await request("/api/health");
  check(result.ok && result.data.ok === true, "Health endpoint did not report healthy.");
  check(result.data.service === "Una Eademque Essentia Multiplayer", "Health endpoint returned the wrong service.");
});

await run("1v1 battle, turn validation, defending, E.G.O., leave handling, and live WebSocket updates", async () => {
  const created = await createRoom("1v1", "private");
  const code = created.room.code;
  const host = created.player;

  const { socket, initial } = await openSocket(code, host);
  try {
    check(initial.state.status === "lobby", "New room did not open in lobby state.");

    const hostPush = nextSocketMessage(socket, message => message.type === "player-joined");
    const guestData = await joinRoom(code, "Smoke Guest");
    const guest = guestData.player;
    const push = await hostPush;
    check(push.state.players.length === 2, "WebSocket did not broadcast the joined player.");

    const wrongTurn = await action(code, guest, "attack", host.id);
    check(wrongTurn.status === 409, "Out-of-turn action was not rejected.");

    const started = await startRoom(code, host);
    check(started.ok && started.data.room.status === "active", "Host could not start a 1v1 match.");
    const reconnectedState = await getState(code, guest);
    check(reconnectedState.ok && reconnectedState.data.room.status === "active", "Player could not recover the current room state.");

    const firstAttack = await action(code, host, "attack", guest.id);
    check(firstAttack.ok, "Host attack was rejected.");
    const guestAfterAttack = firstAttack.data.room.players.find(player => player.id === guest.id);
    check(guestAfterAttack.hp < 100 && firstAttack.data.room.turnPlayerId === guest.id, "Attack did not reduce HP or advance the turn.");

    const defend = await action(code, guest, "defend");
    check(defend.ok, "Defend action was rejected.");
    check(defend.data.room.players.find(player => player.id === guest.id).guarding, "Defend did not enable guarding.");

    const hostBeforeGuardedAttack = defend.data.room.players.find(player => player.id === host.id).hp;
    const guardedAttack = await action(code, host, "attack", guest.id);
    check(guardedAttack.ok, "Attack against a guarding player was rejected.");
    const hostAfterGuardedAttack = guardedAttack.data.room.players.find(player => player.id === host.id).hp;
    const guestAfterGuardedAttack = guardedAttack.data.room.players.find(player => player.id === guest.id);
    check(hostAfterGuardedAttack === hostBeforeGuardedAttack, "Unexpected HP change to the attacker.");
    check(!guestAfterGuardedAttack.guarding, "Guarding was not consumed by an incoming attack.");

    const ego = await action(code, guest, "ego", host.id);
    check(ego.ok, "Eligible player could not activate E.G.O.");
    check(ego.data.room.players.find(player => player.id === guest.id).egoUsed, "E.G.O. usage was not recorded.");

    const left = await leaveRoom(code, host);
    check(left.ok && left.data.room.status === "finished", "Leaving during battle did not finish the 1v1 match.");
    check(left.data.room.winner === "Smoke Guest", "Remaining player was not declared winner.");
  } finally {
    try { socket.close(); } catch {}
  }
});

await run("Lobby host handoff when the creator leaves", async () => {
  const created = await createRoom("1v1", "private", "Departing Host");
  const code = created.room.code;
  const guest = (await joinRoom(code, "New Host")).player;

  const hostLeaves = await leaveRoom(code, created.player);
  check(hostLeaves.ok && hostLeaves.data.room.status === "lobby", "Room did not remain open after the original host left.");
  check(hostLeaves.data.room.hostPlayerId === guest.id, "The next player was not promoted to host.");

  const started = await startRoom(code, guest);
  check(started.ok && started.data.room.status === "active", "Promoted host could not start the match.");
  const guestLeaves = await leaveRoom(code, guest);
  check(guestLeaves.ok, "Promoted host could not leave the match.");
});

await run("Public room discovery and cleanup", async () => {
  const created = await createRoom("1v1", "public", "Public Smoke Host");
  const code = created.room.code;
  const listing = await request("/api/rooms/public");
  check(listing.ok && listing.data.rooms.some(room => room.code === code), "New public room was not discoverable.");

  const left = await leaveRoom(code, created.player);
  check(left.ok, "Could not close the empty public room.");
  const after = await request("/api/rooms/public");
  check(after.ok && !after.data.rooms.some(room => room.code === code), "Closed room remained in public discovery.");
});

await run("2v2 format, full lobby requirement, team assignment, and friendly-fire prevention", async () => {
  const created = await createRoom("2v2", "private", "Team A1");
  const code = created.room.code;
  const host = created.player;
  const p2 = (await joinRoom(code, "Team B1")).player;
  const p3 = (await joinRoom(code, "Team A2")).player;

  const prematureStart = await startRoom(code, host);
  check(prematureStart.status === 409, "2v2 match started before four players joined.");

  const p4 = (await joinRoom(code, "Team B2")).player;
  const started = await startRoom(code, host);
  check(started.ok, "Full 2v2 room could not start.");
  const teams = started.data.room.players.map(player => player.team);
  check(teams.join(",") === "A,B,A,B", "2v2 teams were not assigned A,B,A,B.");

  const friendlyFire = await action(code, host, "attack", p3.id);
  check(friendlyFire.status === 400, "Friendly fire was not rejected in 2v2.");

  const validAttack = await action(code, host, "attack", p2.id);
  check(validAttack.ok, "Attack against an opposing team was rejected.");
  check(validAttack.data.room.turnPlayerId === p2.id, "2v2 turn did not advance correctly.");

  const opposingPlayerLeaves = await leaveRoom(code, p2);
  check(opposingPlayerLeaves.ok, "A player could not leave during a 2v2 match.");
  const finalOpponentLeaves = await leaveRoom(code, p4);
  check(finalOpponentLeaves.ok && finalOpponentLeaves.data.room.status === "finished", "2v2 match did not finish when one team left.");
  check(finalOpponentLeaves.data.room.winner === "Team A", "2v2 winner was not reported by team.");

  await leaveRoom(code, p3);
  await leaveRoom(code, host);
});

await run("Free-for-all format and four-player turn progression", async () => {
  const created = await createRoom("ffa", "private", "FFA One");
  const code = created.room.code;
  const host = created.player;
  const p2 = (await joinRoom(code, "FFA Two")).player;
  const p3 = (await joinRoom(code, "FFA Three")).player;
  const p4 = (await joinRoom(code, "FFA Four")).player;

  const started = await startRoom(code, host);
  check(started.ok, "Four-player free-for-all could not start.");
  check(started.data.room.players.map(player => player.team).join(",") === "1,2,3,4", "FFA player identifiers were not unique.");
  const attackResult = await action(code, host, "attack", p4.id);
  check(attackResult.ok && attackResult.data.room.turnPlayerId === p2.id, "FFA action or turn progression failed.");

  await leaveRoom(code, p2);
  await leaveRoom(code, p3);
  await leaveRoom(code, p4);
  await leaveRoom(code, host);
});

if (failures.length) {
  console.error("\nMultiplayer smoke tests failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exitCode = 1;
} else {
  console.log("\nAll multiplayer smoke tests passed.");
}
