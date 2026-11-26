(() => {
  "use strict";
  const API_KEY = "uee_multiplayer_api_v1";
  const DEFAULT_API = "https://uee-multiplayer.tjeielgevero.workers.dev";
  const SESSION_KEY = "uee_multiplayer_session_v1";
  const $ = (id) => document.getElementById(id);
  let socket = null;
  let current = null;
  let latestRoom = null;
  let refreshTimer = null;
  let qteTimer = null;
  let qteSubmitting = false;
  let activeChallengeId = null;
  let impactTimer = null;

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
    .mp-arena{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:16px 0 22px}
    .mp-fighter-card{position:relative;min-height:210px}
    @keyframes mp-attacker-lunge{0%,100%{transform:translateX(0) scale(1)}38%{transform:translateX(7px) scale(1.015)}68%{transform:translateX(-2px) scale(1)}}
    @keyframes mp-parry-pulse{0%,100%{box-shadow:0 0 0 rgba(206,184,142,0)}50%{box-shadow:0 0 24px rgba(206,184,142,.28)}}
    .mp-fighter-card.mp-attacking{animation:mp-attacker-lunge .48s cubic-bezier(.2,.8,.2,1)}
    .mp-fighter-card.mp-parry-ready{border-color:#c9b58f;animation:mp-parry-pulse .72s ease-in-out infinite}
    .mp-ultimate-meter{border:1px solid rgba(196,170,125,.23);border-radius:5px}
    .mp-ultimate-meter span{background:linear-gradient(90deg,#8e7048,#ddc799);box-shadow:0 0 9px rgba(218,189,140,.38)}
    .mp-fighter-card .sim-fighter-traits{min-height:28px}
    .mp-fighter-card .mp-fighter-affiliation{margin:0 0 10px;color:#9f9689;font:9px 'DM Mono',monospace;letter-spacing:.07em}
    .mp-fighter-meta{display:flex;justify-content:space-between;gap:8px;margin-top:10px;color:#c7b89f;font:9px 'DM Mono',monospace}
    .mp-player-dossier{display:none;white-space:pre-wrap;max-height:300px;overflow:auto;margin-top:12px;padding:12px;border:1px solid rgba(188,164,124,.2);background:#0c0b0a;color:#d7cbbb;font:12px/1.55 'DM Mono',monospace}
    .mp-player-dossier.open{display:block}
    .mp-dossier-toggle{margin-top:10px;padding:7px 10px;border:1px solid #554a3e;background:#171513;color:#d7c6ad;font:9px 'DM Mono',monospace;letter-spacing:.08em}
    .mp-qte-panel{margin:18px 0;padding:clamp(16px,3vw,26px);border:1px solid rgba(202,177,135,.55);background:radial-gradient(ellipse at top,rgba(117,88,55,.22),transparent 72%),linear-gradient(145deg,#211d18,#0b0a09);box-shadow:0 14px 44px #0009;text-align:center}
    .mp-qte-panel.mp-qte-urgent{border-color:#c58e84;box-shadow:0 0 28px rgba(163,82,77,.2)}
    .mp-qte-kicker{margin:0;color:#b6a183;font:9px 'DM Mono',monospace;letter-spacing:.2em}
    .mp-qte-title{margin:8px 0;color:#eee4d5;font:clamp(22px,4vw,34px) Georgia,serif;letter-spacing:.08em}
    .mp-qte-copy{margin:5px auto 14px;max-width:600px;color:#b5aa9a;font-size:13px;line-height:1.5}
    .mp-qte-prompt{display:grid;place-items:center;width:clamp(76px,12vw,112px);height:clamp(76px,12vw,112px);margin:12px auto;border:1px solid #a78c66;background:radial-gradient(circle,#443522,#15110e 70%);color:#f4e6ce;font:700 clamp(36px,6vw,56px) Georgia,serif;text-shadow:0 0 20px #d7bd91;box-shadow:inset 0 0 26px #b48e5b22,0 0 24px #b48e5b22}
    .mp-qte-progress{max-width:360px;height:5px;margin:15px auto 7px;background:#393129;overflow:hidden}
    .mp-qte-progress span{display:block;height:100%;width:100%;background:linear-gradient(90deg,#a68a62,#eee0c6);transform-origin:left;transition:transform .04s linear}
    .mp-qte-step{color:#b6a58c;font:9px 'DM Mono',monospace;letter-spacing:.13em}
    .mp-qte-buttons{display:grid;grid-template-columns:repeat(4,minmax(52px,72px));justify-content:center;gap:8px;margin-top:15px}
    .mp-qte-buttons button{min-height:52px;border:1px solid #806b4e;background:#211c16;color:#f1e4d0;font:24px Georgia,serif;cursor:pointer;transition:transform .1s,background .1s,border-color .1s}
    .mp-qte-buttons button:hover:not(:disabled){transform:translateY(-2px);background:#403323;border-color:#d0b48a}
    .mp-qte-buttons button:disabled{opacity:.35;cursor:not-allowed}
    .mp-ultimate-meter{height:5px;background:#36302a;overflow:hidden;margin-top:8px}
    .mp-ultimate-meter span{display:block;height:100%;background:linear-gradient(90deg,#8e7048,#e0c99e);transition:width .45s ease}
    .mp-interaction-note{color:#b8a58b;font:9px 'DM Mono',monospace;letter-spacing:.12em;margin:8px 0}
    .mp-match-feed{max-height:380px}
    .mp-attack-note{display:block;margin-top:6px;color:#968a78;font:8px 'DM Mono',monospace;letter-spacing:.06em}
    .mp-combat-loadout{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:12px 0}
    .mp-combat-loadout label{display:flex;flex-direction:column;gap:6px;color:#bdb09e;font:9px 'DM Mono',monospace;letter-spacing:.1em}
    .mp-combat-loadout select{min-height:40px;padding:9px;background:#111;color:#eee;border:1px solid #5a5148;font:13px Georgia,serif}
    .mp-resistance-note{color:#b7a78e;font:9px/1.5 'DM Mono',monospace;margin:7px 0}
    .mp-status-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
    .mp-status-tag{padding:4px 6px;border:1px solid #66513c;background:#211b15;color:#e0c9a8;font:8px 'DM Mono',monospace}
    .mp-book-button{margin-top:10px}
    .mp-status-book{width:min(900px,calc(100% - 28px));max-height:min(82vh,850px);padding:0;border:1px solid #78664f;background:#111;color:#e7ddcf;box-shadow:0 24px 100px #000c}
    .mp-status-book::backdrop{background:#050505dd;backdrop-filter:blur(5px)}
    .mp-status-book-inner{padding:clamp(16px,3vw,28px)}
    .mp-status-book h2{font:clamp(27px,4vw,38px) Georgia,serif;letter-spacing:.06em;margin:6px 0 10px}
    .mp-status-book-search{width:100%;padding:12px;background:#090909;border:1px solid #625340;color:#eee;margin:12px 0}
    .mp-status-book-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:9px;max-height:52vh;overflow:auto;padding-right:5px}
    .mp-status-book-entry{padding:11px;border:1px solid #40382f;background:#181614}
    .mp-status-book-entry strong{display:block;color:#e8d5b7;font:12px 'DM Mono',monospace;letter-spacing:.08em}
    .mp-status-book-entry small{display:block;color:#b7aa98;font:11px/1.5 Georgia,serif;margin-top:5px}
    .mp-status-book-entry em{display:block;color:#8f806d;font:8px 'DM Mono',monospace;font-style:normal;margin-top:6px}
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
  function profileSummaryForRecord(record) {
    if (record.profileSummary) return record.profileSummary;
    const a = record.answers || {};
    const read = (...keys) => {
      for (const key of keys) {
        const item = a[key];
        if (!item) continue;
        const value = item.choice === "Other / custom answer" && item.custom ? item.custom : item.value;
        if (Array.isArray(value) && value.length) return value.join(", ");
        if (typeof value === "string" && value.trim()) return value.trim();
        if (value && typeof value === "object") return Object.values(value).filter(Boolean).join("; ");
      }
      return "";
    };
    const value = (text) => text || "Not specified.";
    const ego = typeof window.simEgoProfile === "function" ? window.simEgoProfile(record) : { eligible: false, name: "" };
    const status = read("ego_status", "complex_41");
    const egoType = status.includes("Personally manifested") ? "Personal E.G.O." : status.includes("Volatile") ? "Volatile E.G.O." : status.includes("Distortion") ? "Distortion" : status.includes("Sinner-issued") ? "Abnormality-based (Sinner-issued)" : status.includes("Abnormality-derived") ? "Abnormality-derived" : status.includes("Lobotomy") ? "Artificial / refined Lobotomy E.G.O." : status.includes("No known") ? "Absent" : value(status);
    const egoText = status.includes("No known") ? "No known E.G.O. or Distortion is recorded." : [status, ego.name && "Manifestation: " + ego.name, read("ego_appearance", "advanced_ego_appearance", "complex_44"), read("ego_function", "advanced_ego_function", "complex_61")].filter(Boolean).join(" | ");
    const abilities = read("advanced_abilities", "complex_47");
    return [
      "Name: " + (record.name || "Unnamed Variant"),
      "Title: " + value(read("title", "epithet", "color_title")),
      "Race: " + value(read("race", "species")),
      "Affiliation: " + value(read("affiliation", "association", "office", "syndicate", "occupation")),
      "Grade: " + value(read("fixer_grade", "finger_rank", "syndicate_hierarchy", "association_position")),
      "Appearance: " + value(read("advanced_appearance", "complex_09", "augmentation")),
      "Origin: " + value(read("origin_type", "district", "upbringing")),
      "E.G.O: " + value(egoText),
      "E.G.O Type: " + egoType,
      "Ability 1: " + value(read("ability_1") || abilities),
      "Ability 2: " + value(read("ability_2")),
      "Ability 3: " + value(read("ability_3")),
      "Ability 4: " + value(read("ability_4")),
      "Ultimate Ability 1: " + value(read("ultimate_ability_1")),
      "Ultimate Ability 2: " + value(read("ultimate_ability_2")),
      "Passive Ability: " + value(read("passive_ability")),
      "Personality: " + value(read("personality", "advanced_personality", "complex_03")),
      "Backstory: " + value(read("advanced_concept", "advanced_motivation", "backstory", "complex_15", "complex_59")),
      "Likes: " + value(read("likes", "complex_32", "complex_33")),
      "Dislikes: " + value(read("dislikes", "complex_37")),
      "Overall: " + value(read("advanced_concept", "complex_60"))
    ].join("\\n\\n");
  }
  function characterSnapshot(record) {
    const ego = typeof window.simEgoProfile === "function" ? window.simEgoProfile(record) : { eligible: false, name: "" };
    const a = record.answers || {};
    const personalityItem = a.personality;
    const personality = personalityItem?.choice === "Other / custom answer" ? [personalityItem.custom || personalityItem.value].filter(Boolean) : Array.isArray(personalityItem?.value) ? personalityItem.value : [personalityItem?.value].filter(Boolean);
    const splitAbilities = text => typeof text === "string" ? text.split(/\\n+/).map(line => line.replace(/^\\s*Ability \\d+\\s*:\\s*/i, "").trim()).filter(Boolean).slice(0, 4) : [];
    const abilityText = answer(record, ["advanced_abilities", "complex_47", "complex_50"]);
    const abilityFields = ["ability_1","ability_2","ability_3","ability_4"].map(key => a[key]?.value || a[key]?.custom || "").filter(Boolean);
    const ultimateAbilities = ["ultimate_ability_1","ultimate_ability_2"].map(key => a[key]?.value || a[key]?.custom || "").filter(Boolean);
    return {
      id: record.id,
      name: record.name || "Unnamed Variant",
      title: answer(record, ["title", "epithet", "color_title"]),
      race: answer(record, ["race", "species"]),
      mode: record.mode || "simple",
      origin: answer(record, ["origin_type", "district", "complex_14"]),
      affiliation: answer(record, ["affiliation", "association", "office", "syndicate", "occupation"]),
      grade: answer(record, ["fixer_grade", "finger_rank", "syndicate_hierarchy", "association_position"]),
      appearance: answer(record, ["advanced_appearance", "complex_09", "augmentation"]),
      backstory: answer(record, ["advanced_concept", "advanced_motivation", "backstory", "complex_15"]),
      egoName: ego.name || answer(record, ["ego_name", "complex_43"]),
      egoType: answer(record, ["ego_status", "complex_41"]),
      egoEligible: !!ego.eligible,
      resistances: (() => {
        const text = answer(record, ["damage_resistances"]);
        const read = type => {
          const match = text.match(new RegExp(type + "\\s*[×x]\\s*(0\\.5|1\\.0|1\\.5|2\\.0|2\\.5|1|2)", "i"));
          return match ? Number(match[1]) : null;
        };
        const values = { slash: read("Slash"), pierce: read("Pierce"), blunt: read("Blunt") };
        return values.slash !== null && values.pierce !== null && values.blunt !== null && Math.abs(values.slash + values.pierce + values.blunt - 3.5) < 0.001
          ? values : { slash: 1, pierce: 1, blunt: 1.5 };
      })(),
      personality: personality.map(String).slice(0, 8),
      abilities: abilityFields.length ? abilityFields.slice(0,4) : splitAbilities(abilityText),
      ultimateAbilities: ultimateAbilities.slice(0,2),
      passiveAbility: answer(record, ["passive_ability", "complex_passive"]),
      likes: [answer(record, ["likes", "complex_32"]), answer(record, ["complex_33"])].filter(Boolean),
      dislikes: [answer(record, ["dislikes", "complex_37"])].filter(Boolean),
      profileSummary: profileSummaryForRecord(record)
    };
  }
  function getApi() { return (localStorage.getItem(API_KEY) || DEFAULT_API).trim().replace(/\/$/, ""); }
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
          <input id="mp-api" type="url" placeholder="https://uee-multiplayer.tjeielgevero.workers.dev" autocomplete="url">
        </label>
        <label class="mp-field">YOUR PLAYER NAME
          <input id="mp-player-name" maxlength="24" placeholder="Enter a display name" value="Player">
        </label>
        <label class="mp-field">YOUR SAVED CHARACTER
          <select id="mp-character"></select>
        </label>
      </div>
      <p class="mp-status" id="mp-status" role="status" aria-live="polite">Choose a saved character to begin. The Worker connection is preconfigured.</p>
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
      <div id="mp-room-view" class="mp-hidden simulator-match mp-match-shell">
        <div class="mp-room-card">
          <p class="mp-kicker">ROOM CODE · SHARE THIS WITH YOUR FRIENDS</p>
          <div id="mp-room-code" class="mp-room-code">------</div>
          <p id="mp-room-meta" class="mp-muted"></p>
          <p class="mp-interaction-note">MIRROR ARENA / LIVE CHARACTER INTERACTIONS ENABLED</p>
        </div>
        <div class="mp-section-title">ARENA / FIGHTERS</div>
        <div id="mp-arena" class="mp-arena sim-arena-cards" aria-live="polite"></div>
        <div class="mp-section-title">LOBBY ROSTER & DOSSIERS</div>
        <div id="mp-players" class="mp-player-list"></div>
        <div id="mp-hit-overlay" class="sim-hit-overlay" hidden aria-hidden="true" role="status" aria-live="polite"></div>
        <section id="mp-qte-panel" class="mp-qte-panel mp-hidden" aria-live="assertive">
          <p id="mp-qte-kicker" class="mp-qte-kicker">MIRROR ARENA / TIMING EVENT</p>
          <h3 id="mp-qte-title" class="mp-qte-title">PARRY WINDOW</h3>
          <p id="mp-qte-copy" class="mp-qte-copy">Respond to the prompt before the timing window closes.</p>
          <div id="mp-qte-prompt" class="mp-qte-prompt">↑</div>
          <div class="mp-qte-progress"><span id="mp-qte-timebar"></span></div>
          <p id="mp-qte-step" class="mp-qte-step"></p>
          <div id="mp-qte-buttons" class="mp-qte-buttons">
            <button type="button" data-qte-input="UP" aria-label="Up">↑</button>
            <button type="button" data-qte-input="LEFT" aria-label="Left">←</button>
            <button type="button" data-qte-input="DOWN" aria-label="Down">↓</button>
            <button type="button" data-qte-input="RIGHT" aria-label="Right">→</button>
          </div>
        </section>
        <div id="mp-host-controls" class="mp-actions mp-hidden"><button id="mp-start" class="primary-button" type="button">START MATCH ↗</button></div>
        <div id="mp-battle-controls" class="mp-hidden">
          <div class="mp-section-title">YOUR TURN / ACTIONS</div>
          <div class="mp-grid">
            <label class="mp-field">TARGET
              <select id="mp-target"></select>
            </label>
          </div>
          <div class="mp-combat-loadout">
            <label>ATTACK TYPE
              <select id="mp-damage-type"><option value="slash">Slash</option><option value="pierce">Pierce</option><option value="blunt">Blunt</option></select>
            </label>
            <label>STATUS EFFECT
              <select id="mp-status-effect"><option value="">None</option><option>Burn</option><option>Bleed</option><option>Rupture</option><option>Sinking</option><option>Tremor</option><option>Fragile</option><option>Bind</option><option>Paralyze</option><option>Poise</option><option>Charge</option><option>Haste</option><option>Protection</option><option>Strength</option><option>Feeble</option><option>Smoke</option><option>Fairy</option><option>Erosion</option></select>
            </label>
            <label>STATUS INTENSITY
              <select id="mp-status-tier"><option value="5">Low · 5</option><option value="15">Medium · 15</option><option value="20">Large · 20</option><option value="30">Massive · 30</option></select>
            </label>
          </div>
          <p class="mp-status-note">Choose a damage category and, optionally, one status effect to apply when the attack connects. Effects last two turns.</p>
          <div class="mp-action-grid">
            <button id="mp-attack" class="secondary-button" type="button">ATTACK</button>
            <button id="mp-defend" class="secondary-button" type="button">DEFEND</button>
            <button id="mp-ego" class="secondary-button" type="button">ACTIVATE E.G.O.</button>
            <button id="mp-ultimate" class="primary-button" type="button">ULTIMATE · 0/3</button>
            <button id="mp-pass" class="text-button" type="button">PASS TURN</button>
          </div>
          <small class="mp-attack-note">ATTACKS AND E.G.O. STRIKES GIVE THE TARGET A PARRY QTE. ULTIMATES REQUIRE THREE COMPLETED ACTIONS AND A FOUR-STAGE QTE.</small>
        </div>
        <div class="mp-section-title">BATTLE FEED / CHARACTER CHAT</div>
        <div id="mp-log" class="mp-log mp-match-feed" aria-live="polite" aria-relevant="additions"></div>
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
    stopQteTimer();
    qteSubmitting = false;
    activeChallengeId = null;
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
  function triggerArenaEffect(kind, targetName) {
    const overlay = $("mp-hit-overlay"), match = $("mp-room-view");
    if (!overlay || !match) return;
    window.clearTimeout(impactTimer);
    overlay.className = "sim-hit-overlay sim-hit-" + kind;
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    overlay.textContent = (targetName || "MIRROR ARENA") + " / " + (kind === "fatal" ? "MATCH ENDED" : kind === "ego" ? "E.G.O. AWAKENED" : "IMPACT");
    match.classList.remove("sim-hit-heavy", "sim-hit-fatal");
    void match.offsetWidth;
    if (kind !== "ego") match.classList.add("sim-hit-" + kind);
    impactTimer = window.setTimeout(() => {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
      overlay.className = "sim-hit-overlay";
      match.classList.remove("sim-hit-heavy", "sim-hit-fatal");
    }, kind === "fatal" ? 1100 : kind === "ego" ? 900 : 780);
  }
  function qteArrow(direction) {
    return ({ UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→" })[direction] || "✦";
  }
  function stopQteTimer() {
    if (qteTimer) { clearInterval(qteTimer); qteTimer = null; }
  }
  function submitQte(input) {
    const challenge = latestRoom?.pendingChallenge;
    if (!challenge || !current || qteSubmitting) return;
    const isOwner = challenge.type === "parry" ? challenge.defenderId === current.playerId : challenge.qtePlayerId === current.playerId;
    if (!isOwner) return;
    qteSubmitting = true;
    document.querySelectorAll("[data-qte-input]").forEach(button => button.disabled = true);
    const type = challenge.type === "parry" ? "parry" : "qte";
    api("/api/rooms/" + current.code + "/action", {
      method: "POST",
      body: JSON.stringify(Object.assign({}, credentials(), { type, challengeId: challenge.id, input }))
    }).then(data => {
      renderRoom(data.room);
    }).catch(error => {
      setStatus(error.message);
      qteSubmitting = false;
      if (latestRoom) renderRoom(latestRoom);
    });
  }
  function renderQte(challenge, room) {
    const panel = $("mp-qte-panel");
    if (!challenge) {
      panel.classList.add("mp-hidden");
      stopQteTimer();
      activeChallengeId = null;
      qteSubmitting = false;
      return;
    }
    const ownerId = challenge.type === "parry" ? challenge.defenderId : challenge.qtePlayerId;
    const isOwner = ownerId === current?.playerId;
    const owner = room.players.find(player => player.id === ownerId);
    const attacker = room.players.find(player => player.id === challenge.attackerId);
    const target = room.players.find(player => player.id === challenge.targetId);
    panel.classList.remove("mp-hidden");
    panel.classList.toggle("mp-qte-urgent", challenge.type === "ultimate" && challenge.step >= 2);
    $("mp-qte-kicker").textContent = challenge.type === "parry" ? "MIRROR ARENA / DEFENSIVE REACTION" : "MIRROR ARENA / ULTIMATE ACTIVATION";
    $("mp-qte-title").textContent = challenge.type === "parry" ? (isOwner ? "PARRY NOW" : "PARRY WINDOW") : (isOwner ? "COMPLETE THE ULTIMATE" : "ULTIMATE SEQUENCE");
    $("mp-qte-copy").textContent = challenge.type === "parry"
      ? (isOwner ? "Match all three directions in sequence. Each successful input advances the chain; one miss lets the attack connect." : (owner?.name || "The defender") + " has a three-step chance to parry " + (attacker?.name || "the attack") + ".")
      : (isOwner ? "Complete three directions. You have generous timing windows and may miss one input without losing the sequence." : (attacker?.name || "A player") + " is attempting an ultimate against " + (target?.name || "their target") + ".");
    $("mp-qte-prompt").textContent = qteArrow(challenge.prompt);
    $("mp-qte-step").textContent = (challenge.type === "parry" ? "PARRY " : "ULTIMATE ") + (challenge.step + 1) + " / " + challenge.totalSteps + " · " + (challenge.windowMs / 1000).toFixed(2) + "s" + (challenge.type === "ultimate" ? " · " + Math.max(0, 1 - (challenge.mistakes || 0)) + " MISSES LEFT" : "");
    const challengeStateId = challenge.id + ":" + challenge.step;
    if (activeChallengeId !== challengeStateId) {
      activeChallengeId = challengeStateId;
      qteSubmitting = false;
      stopQteTimer();
    }
    const buttons = document.querySelectorAll("[data-qte-input]");
    buttons.forEach(button => button.disabled = !isOwner || qteSubmitting);
    if (isOwner && !qteSubmitting) {
      const bar = $("mp-qte-timebar");
      const remaining = Math.max(0, challenge.expiresAt - Date.now());
      const update = () => {
        const fraction = Math.max(0, Math.min(1, (challenge.expiresAt - Date.now()) / challenge.windowMs));
        bar.style.transform = "scaleX(" + fraction + ")";
        if (fraction < 0.28) panel.classList.add("mp-qte-urgent");
      };
      update();
      stopQteTimer();
      qteTimer = setInterval(update, 35);
    } else {
      $("mp-qte-timebar").style.transform = "scaleX(1)";
      stopQteTimer();
    }
  }
  function renderRoom(room) {
    if (!room) return;
    const previous = latestRoom;
    latestRoom = room;
    $("mp-room-code").textContent = room.code;
    $("mp-room-meta").textContent = room.mode.toUpperCase() + " · " + room.visibility.toUpperCase() + " · " + room.players.length + "/" + room.maxPlayers + " PLAYERS · " + room.status.toUpperCase() + (room.round ? " · ROUND " + room.round : "");
    const players = $("mp-players");
    players.innerHTML = "";
    room.players.forEach(player => {
      const card = make("article", { className: "mp-player" + (player.id === room.turnPlayerId ? " mp-current" : "") });
      card.append(make("strong", {}, player.name));
      card.append(make("p", { className: "mp-muted" }, (player.character?.name || "Unnamed Variant") + " · TEAM " + player.team));
      const hp = make("div", { className: "mp-hp" });
      const fill = make("span"); fill.style.width = Math.max(0, player.hp) + "%";
      hp.append(fill); card.append(hp);
      card.append(make("small", {}, player.hp + " HP" + (player.guarding ? " · DEFENDING" : "") + (player.egoUsed ? " · E.G.O. USED" : "")));
      const toggle = make("button", { className: "mp-dossier-toggle", type: "button", onClick: () => dossier.classList.toggle("open") }, "VIEW CHARACTER DOSSIER");
      const dossier = make("pre", { className: "mp-player-dossier" }, player.character?.profileSummary || "No saved dossier summary is available for this character.");
      card.append(toggle, dossier);
      players.append(card);
    });

    const arena = $("mp-arena");
    arena.innerHTML = "";
    let impactTarget = null, impactFatal = false, egoTarget = null;
    room.players.forEach(player => {
      const old = previous?.players?.find(item => item.id === player.id);
      const hit = !!old && player.hp < old.hp;
      if (hit) { impactTarget = player; if (player.hp === 0) impactFatal = true; }
      if (!!player.egoActive && !old?.egoActive) egoTarget = player;
      const card = make("article", { className: "sim-fighter-card mp-fighter-card" + (player.hp > 0 ? "" : " sim-fighter-out") + (player.id === room.turnPlayerId ? " mp-current" : "") + (hit ? " sim-damage-pulse" : "") + (player.egoActive ? " sim-ego-awakened" : "") + (player.status === "ATTACKING" || player.status === "E.G.O. STRIKE" ? " mp-attacking" : "") + (player.status === "PARRY WINDOW" ? " mp-parry-ready" : "") });
      const top = make("div", { className: "sim-fighter-top" });
      top.append(make("span", { className: "sim-team-tag" }, room.mode === "ffa" ? "FREE AGENT " + player.team : "TEAM " + player.team));
      top.append(make("span", { className: "sim-fighter-state" }, player.status || (player.hp > 0 ? (player.connected ? "ONLINE" : "OFFLINE") : "OUT")));
      const name = make("h4", {}, player.character?.name || player.name);
      const traits = make("p", { className: "sim-fighter-traits" }, (player.character?.personality || []).join(" · ") || "PERSONALITY NOT RECORDED");
      const affiliation = make("p", { className: "mp-fighter-affiliation" }, [player.character?.affiliation, player.character?.grade].filter(Boolean).join(" · ") || "AFFILIATION NOT RECORDED");
      const hp = make("div", { className: "sim-hp-track" });
      const fill = make("span", { className: "sim-hp-fill" });
      fill.style.width = Math.max(0, hit ? old.hp : player.hp) + "%";
      hp.append(fill);
      const hpText = make("div", { className: "sim-hp-text" }, "HEALTH " + player.hp + " / 100");
      const resistanceName = value => value === 0.5 ? "ENDURE" : value === 1 ? "NORMAL" : value === 1.5 ? "EFFECTIVE" : value === 2.5 ? "FATAL" : "VULNERABLE";
      const resist = player.resistances || player.character?.resistances || { slash: 1, pierce: 1, blunt: 1.5 };
      const resistanceNote = make("p", { className: "mp-resistance-note" }, ["SLASH", "PIERCE", "BLUNT"].map(type => {
        const value = Number(resist[type.toLowerCase()] ?? 1);
        return type + " " + resistanceName(value) + " ×" + value.toFixed(1);
      }).join("  ·  "));
      const status = make("p", { className: "sim-fighter-status" }, (player.guarding ? "GUARDING · " : "") + (player.egoUsed ? "E.G.O. USED · " : "") + (player.ultimateCharge || 0) + "/3 ULTIMATE CHARGE" + (player.ultimateUsed ? " · ULTIMATE SPENT" : ""));
      const statusTags = make("div", { className: "mp-status-tags" });
      (player.statusEffects || []).forEach(effect => statusTags.append(make("span", { className: "mp-status-tag" }, effect.name + " " + effect.potency + " · " + effect.turns + "T")));
      const ultimateMeter = make("div", { className: "mp-ultimate-meter" });
      const ultimateFill = make("span");
      ultimateFill.style.width = Math.min(3, player.ultimateCharge || 0) / 3 * 100 + "%";
      ultimateMeter.append(ultimateFill);
      card.append(top, name, traits, affiliation, hp, hpText, status, resistanceNote);
      if (statusTags.childNodes.length) card.append(statusTags);
      card.append(ultimateMeter);
      if (player.character?.egoEligible) {
        card.append(make("p", { className: "sim-ego-label" }, player.egoActive ? "✦ " + (player.character.egoName || "E.G.O.") + " · MANIFESTED" : "E.G.O. AVAILABLE"));
      }
      if ((player.character?.abilities || []).length) {
        card.append(make("p", { className: "sim-ego-detail" }, "SIGNATURE · " + player.character.abilities.slice(0, 2).join(" / ")));
      }
      arena.append(card);
      if (hit) window.requestAnimationFrame(() => { fill.style.width = Math.max(0, player.hp) + "%"; });
    });
    if (impactTarget) triggerArenaEffect(impactFatal ? "fatal" : "heavy", impactTarget.character?.name || impactTarget.name);
    else if (egoTarget) triggerArenaEffect("ego", egoTarget.character?.name || egoTarget.name);

    $("mp-host-controls").classList.toggle("mp-hidden", !(room.hostPlayerId === current?.playerId && room.status === "lobby"));
    $("mp-start").disabled = room.players.length < 2 || (room.mode === "2v2" && room.players.length !== 4);
    $("mp-battle-controls").classList.toggle("mp-hidden", room.status !== "active");
    const challengeOpen = !!room.pendingChallenge;
    const isMyTurn = room.status === "active" && room.turnPlayerId === current?.playerId && !challengeOpen;
    ["mp-attack", "mp-defend", "mp-ego", "mp-pass", "mp-ultimate"].forEach(id => $(id).disabled = !isMyTurn);
    const target = $("mp-target");
    const oldTarget = target.value;
    target.innerHTML = "";
    room.players.filter(p => p.hp > 0 && p.id !== current?.playerId && !(room.mode === "2v2" && room.players.find(x => x.id === current?.playerId)?.team === p.team)).forEach(p => {
      target.add(make("option", { value: p.id }, p.character?.name || p.name));
    });
    if ([...target.options].some(o => o.value === oldTarget)) target.value = oldTarget;
    const myPlayer = room.players.find(p => p.id === current?.playerId);
    $("mp-ego").disabled = !isMyTurn || !myPlayer?.character?.egoEligible || !!myPlayer?.egoUsed;
    $("mp-attack").disabled = !isMyTurn || !target.options.length;
    $("mp-ultimate").disabled = !isMyTurn || !myPlayer || (myPlayer.ultimateCharge || 0) < 3 || !!myPlayer.ultimateUsed || !target.options.length;
    $("mp-ultimate").textContent = myPlayer?.ultimateUsed ? "ULTIMATE · SPENT" : "ULTIMATE · " + (myPlayer?.ultimateCharge || 0) + "/3";
    renderQte(room.pendingChallenge, room);
    const log = $("mp-log");
    log.innerHTML = "";
    room.log.forEach(entry => {
      const kind = entry.kind || (/joined|left|finished|round|created|winner/i.test(entry.text) ? "system" : /: .+[“"]|↔/.test(entry.text) ? "chat" : "action");
      const item = make("article", { className: "sim-log-entry sim-log-" + kind });
      item.append(make("span", { className: "sim-log-label" }, kind === "chat" ? "CHARACTER INTERACTION" : kind === "system" ? "ARENA RECORD" : "BATTLE EVENT"));
      item.append(make("p", {}, new Date(entry.at).toLocaleTimeString() + " · " + entry.text));
      log.append(item);
    });
    log.scrollTop = log.scrollHeight;
    if (room.pendingChallenge?.type === "parry") {
      const isDefender = room.pendingChallenge.defenderId === current?.playerId;
      setStatus(isDefender ? "PARRY WINDOW OPEN — RESPOND NOW." : "WAITING FOR " + (room.players.find(p => p.id === room.pendingChallenge.defenderId)?.name || "THE DEFENDER").toUpperCase() + ".");
    } else if (room.pendingChallenge?.type === "ultimate") {
      const isAttacker = room.pendingChallenge.qtePlayerId === current?.playerId;
      setStatus(isAttacker ? "ULTIMATE ACTIVATION — COMPLETE THE SEQUENCE." : "WATCHING AN ULTIMATE ACTIVATION.");
    } else if (room.status === "active") setStatus(isMyTurn ? "YOUR TURN — CHOOSE AN ACTION." : "WAITING FOR " + (room.players.find(p => p.id === room.turnPlayerId)?.name || "THE NEXT PLAYER").toUpperCase() + ".");
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
    const body = Object.assign({}, credentials(), {
      type, targetId: $("mp-target").value,
      damageType: $("mp-damage-type").value,
      statusEffect: $("mp-status-effect").value,
      statusPotency: Number($("mp-status-tier").value)
    });
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
    button.addEventListener("click", () => { fillCharacters(); showScreen(); if (current) resume().catch(err => setStatus(err.message)); });
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
  $("mp-ultimate").addEventListener("click", () => sendAction("ultimate").catch(err => setStatus(err.message)));
  $("mp-pass").addEventListener("click", () => sendAction("pass").catch(err => setStatus(err.message)));
  document.querySelectorAll("[data-qte-input]").forEach(button => button.addEventListener("click", () => submitQte(button.dataset.qteInput)));
  document.addEventListener("keydown", event => {
    if (!latestRoom?.pendingChallenge || !current) return;
    const keyMap = { ArrowUp:"UP", w:"UP", W:"UP", ArrowDown:"DOWN", s:"DOWN", S:"DOWN", ArrowLeft:"LEFT", a:"LEFT", A:"LEFT", ArrowRight:"RIGHT", d:"RIGHT", D:"RIGHT" };
    const input = keyMap[event.key];
    if (!input) return;
    const challenge = latestRoom.pendingChallenge;
    const isOwner = challenge.type === "parry" ? challenge.defenderId === current.playerId : challenge.qtePlayerId === current.playerId;
    if (!isOwner) return;
    event.preventDefault();
    submitQte(input);
  });
  $("mp-leave").addEventListener("click", leaveRoom);
  $("mp-resume").addEventListener("click", () => resume().catch(err => setStatus(err.message)));

  const STATUS_BOOK_ENTRIES = [["Burn","At turn end, the unit takes damage based on its potency; remaining count decreases.","LIBRARY OF RUINA · LIMBUS COMPANY"],["Bleed","When the unit performs an offensive action, it suffers damage based on potency; count is consumed.","LIBRARY OF RUINA · LIMBUS COMPANY"],["Paralysis","Weakens selected dice or skill power for a limited number of actions.","LIBRARY OF RUINA"],["Fairy","Deals recurring damage when the affected unit rolls or acts; it gradually fades.","LIBRARY OF RUINA"],["Strength","Increases the power of offensive actions.","LIBRARY OF RUINA · LIMBUS COMPANY"],["Endurance","Improves defensive dice or defensive action power.","LIBRARY OF RUINA"],["Feeble","Reduces offensive power for a limited duration.","LIBRARY OF RUINA · LIMBUS COMPANY"],["Disarm","Reduces defensive power for a limited duration.","LIBRARY OF RUINA"],["Haste","Raises speed for the current turn or scene.","LIBRARY OF RUINA · LIMBUS COMPANY"],["Bind","Lowers speed for the current turn or scene.","LIBRARY OF RUINA · LIMBUS COMPANY"],["Protection","Reduces damage received.","LIBRARY OF RUINA · LIMBUS COMPANY"],["Stagger Protection","Reduces stagger damage received.","LIBRARY OF RUINA"],["Fragile","Increases damage received for a limited duration.","LIBRARY OF RUINA · LIMBUS COMPANY"],["Stagger Resistance Down","Makes stagger damage more effective against the affected unit.","LIBRARY OF RUINA"],["Charge","A resource used by specific skills and passives; its count is spent by related effects.","LIBRARY OF RUINA · LIMBUS COMPANY"],["Smoke","Increases damage taken per stack; high stacks can also improve dice power in Ruina.","LIBRARY OF RUINA"],["Persistence","A special survival effect that can allow a unit to endure otherwise fatal damage.","LIBRARY OF RUINA"],["Erosion","Deals recurring damage and can add extra damage when the unit is hit.","LIBRARY OF RUINA"],["Blood","A special resource with effects that depend on its current amount.","LIBRARY OF RUINA"],["Nullify Power","Prevents power-related effects from changing dice for the scene.","LIBRARY OF RUINA"],["Immobilized","Prevents the unit from acting for the scene.","LIBRARY OF RUINA"],["Enhance","Raises the maximum range of selected dice.","LIBRARY OF RUINA"],["Weaken","Lowers the maximum range of selected dice.","LIBRARY OF RUINA"],["Singleton","A deck condition used by certain combat pages and passives.","LIBRARY OF RUINA"],["Rupture","The next hit or a limited number of hits deal additional fixed damage based on potency.","LIMBUS COMPANY"],["Sinking","When hit, the unit loses SP; units without SP instead receive Gloom damage.","LIMBUS COMPANY"],["Tremor","A buildup effect that can raise stagger thresholds when paired with Tremor Burst skills.","LIMBUS COMPANY"],["Poise","Builds critical-hit chance and can be consumed by critical hits.","LIMBUS COMPANY"],["Paralyze","Fixes the power of a number of skill coins at zero for a turn.","LIMBUS COMPANY"],["Offense Level Up","Raises the unit's offense level for a turn.","LIMBUS COMPANY"],["Offense Level Down","Lowers the unit's offense level for a turn.","LIMBUS COMPANY"],["Defense Level Up","Raises the unit's defense level for a turn.","LIMBUS COMPANY"],["Defense Level Down","Lowers the unit's defense level for a turn.","LIMBUS COMPANY"],["Damage Up","Increases damage dealt for a limited duration.","LIMBUS COMPANY"],["Damage Down","Reduces damage dealt for a limited duration.","LIMBUS COMPANY"],["Coin Power Up","Raises skill coin power for a limited duration.","LIMBUS COMPANY"],["Coin Power Down","Lowers skill coin power for a limited duration.","LIMBUS COMPANY"],["Attack Power Up","Improves attack skill power.","LIMBUS COMPANY"],["Attack Power Down","Reduces attack skill power.","LIMBUS COMPANY"],["Defense Power Up","Improves defensive skill power.","LIMBUS COMPANY"],["Defense Power Down","Reduces defensive skill power.","LIMBUS COMPANY"],["Ammo","A limited resource spent by certain skills; some skills require available ammo.","LIMBUS COMPANY"],["Aggro","A targeting marker that influences which unit is selected by certain enemy actions.","LIMBUS COMPANY"],["Discard","A special effect that removes selected skills or cards from the current hand.","LIMBUS COMPANY"],["Fanatic","A special combat state that interacts with particular skills and passives.","LIMBUS COMPANY"],["Nails","A special buildup effect associated with particular identities and skills.","LIMBUS COMPANY"],["Talisman","A special stack-based effect with interactions tied to specific skills and passives.","LIMBUS COMPANY"],["Tremor Burst","Interacts with Tremor to raise stagger thresholds; behavior depends on Tremor type.","LIMBUS COMPANY"],["Tremor - Scorch","A Tremor variant that adds a Burn interaction when Tremor Burst triggers.","LIMBUS COMPANY"],["Dark Flame","A special status used by particular E.G.O. and encounter mechanics.","LIMBUS COMPANY"],["Butterfly","A unique Sinking-related effect with special interactions.","LIMBUS COMPANY"],["Echoes of the Manor","A special effect associated with specific identities and E.G.O.","LIMBUS COMPANY"],["Bloodfeast","A shared resource used by certain Bloodfiend-related mechanics.","LIMBUS COMPANY"],["Charge Barrier","A defensive resource that converts its stacks into shield under specific rules.","LIMBUS COMPANY"],["Plus Coin Boost / Drop","Changes the power of positive or negative skill coins.","LIMBUS COMPANY"],["Slash / Pierce / Blunt Fragility","Specialized fragility effects that increase damage from a matching damage category.","LIMBUS COMPANY"]];
  const statusBookButton = make("button", { id: "open-status-book", className: "secondary-button mp-book-button", type: "button" }, "STATUS EFFECT BOOK  ↗");
  if (heroActions) heroActions.append(statusBookButton);
  const statusBook = make("dialog", { id: "mp-status-book", className: "mp-status-book" });
  const bookInner = make("div", { className: "mp-status-book-inner" });
  bookInner.append(make("p", { className: "mp-kicker" }, "ARCHIVE REFERENCE / COMBAT EFFECTS"));
  bookInner.append(make("h2", {}, "STATUS EFFECT BOOK"));
  bookInner.append(make("p", { className: "mp-muted" }, "A combined reference to core and named special effects from Library of Ruina and Limbus Company. Exact behavior can vary by identity, E.G.O., passive, or encounter."));
  const bookSearch = make("input", { className: "mp-status-book-search", type: "search", placeholder: "Search status effects…", "aria-label": "Search status effects" });
  const bookList = make("div", { className: "mp-status-book-list" });
  const drawBook = () => {
    const query = bookSearch.value.trim().toLowerCase();
    bookList.innerHTML = "";
    const matches = STATUS_BOOK_ENTRIES.filter(entry => entry[0].toLowerCase().includes(query) || entry[1].toLowerCase().includes(query) || entry[2].toLowerCase().includes(query));
    matches.forEach(entry => {
      const card = make("article", { className: "mp-status-book-entry" });
      card.append(make("strong", {}, entry[0]), make("small", {}, entry[1]), make("em", {}, entry[2]));
      bookList.append(card);
    });
    if (!matches.length) bookList.append(make("p", { className: "mp-muted" }, "No matching entries."));
  };
  drawBook();
  bookSearch.addEventListener("input", drawBook);
  const bookFooter = make("div", { className: "mp-actions" });
  bookFooter.append(make("button", { className: "secondary-button", type: "button", onClick: () => statusBook.close() }, "CLOSE BOOK"));
  bookInner.append(bookSearch, bookList, bookFooter);
  statusBook.append(bookInner);
  document.body.append(statusBook);
  statusBookButton.addEventListener("click", () => statusBook.showModal());
  loadSession();
  if (current) $("mp-resume-wrap").classList.remove("mp-hidden");
  fillCharacters();
})();