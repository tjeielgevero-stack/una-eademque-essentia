/* Mirror Arena retained as a separate module inside U.E.E Rebuilt. */
(() => {
 const $ = id => document.getElementById(id);
// MIRROR ARENA: a lightweight fictional OC matchup simulator.
let simMode="1v1",simMatch=null,simAutoRunning=false,simHitTimer=null;
const SIM_MODE_INFO={"1v1":{count:2,description:"Two saved OCs enter a one-on-one match.",labels:["TEAM A · FIGHTER 1","TEAM B · FIGHTER 1"]},"2v2":{count:4,description:"Two pairs compete as teams, with teammates able to support each other.",labels:["TEAM A · FIGHTER 1","TEAM A · FIGHTER 2","TEAM B · FIGHTER 1","TEAM B · FIGHTER 2"]},"ffa":{count:4,description:"Three or four OCs compete individually. The last active character wins.",labels:["FREE AGENT 1","FREE AGENT 2","FREE AGENT 3","FREE AGENT 4"]}};
const SIM_DIALOGUE={aloof:["That was your opening?","Wake me when this becomes interesting.","...Predictable."],reserved:["I would rather settle this quickly.","There is no need for a spectacle.","Understood. My turn."],stoic:["I will remain composed.","Noted.","I can continue."],cheerful:["This is getting exciting!","Come on, show me what you can do!","That was a good one!"],sarcastic:["Was that supposed to impress me?","I have seen paperwork more threatening than that.","Lovely. Truly inspired."],analytical:["Your timing is becoming predictable.","I have adjusted my approach.","Interesting pattern."],pragmatic:["Let's keep this efficient.","No wasted movement.","Enough talking. Next exchange."],proud:["Remember who you are facing.","I will not be outdone.","You will have to do better."],cynical:["Of course it came to this.","Nothing ever goes smoothly, does it?","I expected as much."],gentle:["Are you alright? We can take a moment.","I do not want this to go too far.","Let's finish this fairly."],mischievous:["Oh, you fell for that?","I have another surprise.","Try to keep up!"],protective:["Stay behind me. I have this.","I will not let my team down.","I've got your back."],loyal:["We stand together.","I will support you.","Not abandoning this match."],default:["Let's see how this goes.","Your move.","I am not finished yet."]};
const SIM_MOVES=["measured feint","momentum shift","careful pressure","a clean counter","a clever change of pace","a focused flourish"];
const SIM_REACTIONS=["steadies their footing","reconsiders their approach","answers with a guarded stance","takes a breath and regroups","looks for a new opening","shakes off the surprise"];
function simPersonality(record){const p=record.answers?.personality;if(!p)return[];if(p.choice==="Other / custom answer")return[p.custom||"custom"];return Array.isArray(p.value)?p.value:[String(p.value||"")];}

function simProfileField(record,label){
 const text=record.profileSummary||record.answers?.profile_details?.value||"";
 const escaped=label;
 const match=String(text).match(new RegExp("(?:^|\\n)"+escaped+"\\s*:\\s*([^\\n]+)","i"));
 return match?.[1]?.trim()||"";
}
function simAbilityOptions(record){
 const answers=record.answers||{};
 const values=[1,2,3,4].map(n=>(record.mode==="complex"||record.mode==="laziness")?(answers["complex_ability_"+n]?.value||simProfileField(record,"Ability "+n).split(/\s+[—–-]\s+/)[0].trim()):(String(answers["generated_ability_"+n]?.value||"").split(/\s+[—–-]\s+/)[0].trim())).filter(value=>value&&value!=="Not specified.");
 if(values.length)return values;

 return SIM_MOVES.slice();
}
function simUltimateOptions(record){
 const answers=record.answers||{};
 const values=[1,2].map(n=>(record.mode==="complex"||record.mode==="laziness")?(answers["complex_ultimate_"+n]?.value||simProfileField(record,"Ultimate Ability "+n).split(/\s+[—–-]\s+/)[0].trim()):(String(answers["generated_ultimate_"+n]?.value||"").split(/\s+[—–-]\s+/)[0].trim())).filter(value=>value&&value!=="Not specified.");
 return values.length?values:["Limit Break","Final Resonance"];
}
function simStatusInfliction(record){
 const a=record.answers||{},entry=a.status_infliction||a.complex_status_infliction,raw=entry?.value??entry?.custom??[];
 const values=Array.isArray(raw)?raw:[raw];
 return [...new Set(values.map(value=>String(value).trim()).filter(value=>value&&value!=="No status effect"))].slice(0,3);
}
function simPassiveProfile(record){
 const a=record.answers||{};
 const raw=a.passive_ability?.value||a.complex_passive?.value||a.generated_passive?.value||(record.mode==="laziness"?simProfileField(record,"Passive Ability"):"")||"";
 const text=(a.generated_passive?.value||record.mode==="laziness")?String(raw).split(/\s+[—–-]\s+/)[0].trim():raw;
 return {text,activation:a.passive_activation?.value||a.complex_passive_activation?.value||"Always active"};
}
function simApplyStatusInfliction(actor,target,basePotency){
 const statuses=actor.statusInfliction||[];if(!statuses.length)return;
 const potency=Math.max(.1,Math.round(basePotency/statuses.length*10)/10);
 target.statusEffects=target.statusEffects||[];
 statuses.forEach(name=>{const existing=target.statusEffects.find(effect=>effect.name===name);if(existing)existing.potency=Math.min(30,Math.round((existing.potency+potency)*10)/10);else target.statusEffects.push({name,potency});});
 simAddLog("action",actor.name,"inflicts "+statuses.map(name=>name+" "+potency).join(" · ")+" on "+target.name+".");
}
function simTriggerPassive(fighter,event){
 if(!fighter||!fighter.passiveAbility)return false;
 const rule=fighter.passiveActivation||"Always active",always=rule==="Always active";
 const matches=always||(rule==="At the start of battle"&&event==="battleStart")||(rule==="At the start of this character's turn"&&event==="turn")||(rule==="After taking damage"&&event==="damage")||(rule==="When below 50% HP"&&event==="lowHp")||(rule==="When an ally is knocked out"&&event==="allyOut")||(rule==="When E.G.O. manifests"&&event==="ego");
 if(!matches)return false;
 if(always&&fighter.passiveAnnounced)return true;
 fighter.passiveActive=true;if(always)fighter.passiveAnnounced=true;
 fighter.status=always?"PASSIVE ACTIVE":"PASSIVE TRIGGERED";
 simAddLog("system",fighter.name,"passive activates: "+fighter.passiveAbility+" ("+rule+").");
 return true;
}
function simMirrorAssist(actor){
 if(!actor||!/(sephrus|zephyrus|aztiluth)/i.test(actor.name||""))return 0;
 actor.mirrorSummons=(actor.mirrorSummons||0)+1;
 const summonName="Sephrus Variant "+actor.mirrorSummons;
 simAddLog("system",actor.name,summonName+" materializes from another Mirror World and joins the exchange.");
 simAddLog("chat",actor.name,'"I hear you across the mirror. Continue."');
 simAddLog("chat",summonName,'"The same essence. A different circumstance. We will assist."');
 return 18;
}

function simRecordScore(record){
 const a=record.answers||{};
 const tech={"Competent professional":1,"Highly skilled specialist":2,"Among the best in their Office":3,"Exceptional Grade 1-level specialist":4,"Comparable to a renowned veteran":5,"Color Fixer-level overall capability":6,"Beyond ordinary City classifications (deliberate AU)":8};
 let score=tech[a.technical_level?.value]||2;
 const grade=a.fixer_grade?.value;
 if(grade==="Color Fixer")score=Math.max(score,10);
 else if(/^Grade [1-9]$/.test(grade||""))score=Math.max(score,10-Number(grade.slice(6)));
 const ego=a.ego_status?.value||a.complex_41?.value||"";
 if(ego==="Personally manifested E.G.O. (Effloresced E.G.O.)"||ego==="Has become a Distortion")score+=2;
 else if(ego==="Volatile E.G.O. (unstable manifestation)"||["Uses Abnormality-derived E.G.O.","Uses Abnormality E.G.O. (Sinner-issued)","Uses refined Lobotomy E.G.O. equipment"].includes(ego))score+=1;
 return {score:Math.min(12,score),grade:grade||"Unspecified",ego};
}
function simDifficulty(ids){
 const records=window.readOcArchive().filter(record=>ids.includes(record.id));
 if(records.length<2)return null;
 const ranked=records.map(record=>({record,score:simRecordScore(record).score}));
 let gap=0;
 if(simMode==="2v2"&&ranked.length===4){
  const teams=[ranked.slice(0,2).reduce((sum,item)=>sum+item.score,0)/2,ranked.slice(2,4).reduce((sum,item)=>sum+item.score,0)/2];
  gap=Math.abs(teams[0]-teams[1]);
 }else{
  const scores=ranked.map(item=>item.score);
  gap=Math.max(...scores)-Math.min(...scores);
 }
 const severity=gap>=6?"SEVERE":gap>=4?"HIGH":gap>=2.5?"NOTICEABLE":"BALANCED";
 return {gap,severity};
}
function simUpdateDifficulty(){
 const selected=[...document.querySelectorAll("[data-sim-slot]")].map(select=>select.value).filter(Boolean);
 const required=simMode==="ffa"?3:SIM_MODE_INFO[simMode].count;
 const uniqueSelection=new Set(selected).size===selected.length;
 const ready=simMode==="ffa"?selected.length>=required:selected.length===required;
 const startButton=$("sim-start-button");
 if(startButton)startButton.disabled=!(ready&&uniqueSelection);
 const rating=$("sim-difficulty-rating"),warning=$("sim-one-sided-warning");
 if(!rating||!warning)return;
 if(selected.length<required||!uniqueSelection){rating.textContent=uniqueSelection?"AWAITING PARTICIPANTS":"CHOOSE A DIFFERENT OC FOR EACH SLOT";warning.textContent="";warning.classList.add("hidden");return;}
 const result=simDifficulty(selected);
 if(!result){rating.textContent="NOT ENOUGH DATA";warning.classList.add("hidden");return;}
 rating.textContent=result.severity+" · SKILL GAP "+result.gap.toFixed(1);
 const oneSided=result.gap>=4;
 warning.classList.toggle("hidden",!oneSided);
 warning.textContent=oneSided?"WARNING: This "+(simMode==="ffa"?"Free For All":simMode.toUpperCase())+" may be very one-sided. The estimated skill gap is large; this is only a rough fictional guideline.":"";
}
function simEgoProfile(record){
 const a=record.answers||{},status=a.ego_status?.value||a.complex_41?.value||"";
 let type="";
 if(status==="Has become a Distortion")type="DISTORTION SHIFT";
 else if(status==="Volatile E.G.O. (unstable manifestation)"||status==="Volatile E.G.O.")type="VOLATILE E.G.O.";
 else if(status==="Personally manifested E.G.O. (Effloresced E.G.O.)"||status==="Personally manifested E.G.O.")type="PERSONAL E.G.O.";
 else if(["Uses Abnormality-derived E.G.O.","Uses Abnormality E.G.O. (Sinner-issued)","Uses refined Lobotomy E.G.O. equipment","Abnormality-derived E.G.O. equipment","Sinner-issued Abnormality E.G.O.","Refined Lobotomy E.G.O. equipment"].includes(status))type="E.G.O. EQUIPMENT MANIFEST";
 const answer=a.ego_name||a.complex_43,loadout=a.ego_equipment_customizer?.value||{};
 const loadoutName=loadout.sinner_ego||loadout.category4||loadout.suit||loadout.synergy||"";
 const name=(answer?.value&&typeof answer.value==="string")?answer.value:(answer?.custom||loadoutName||"");
 return {eligible:!!type,type,name:name||type,theme:a.ego_theme?.value||a.distortion_theme?.value||a.complex_42?.value||"",appearance:a.ego_appearance?.value||a.advanced_ego_appearance?.value||a.complex_44?.value||"",functionText:a.ego_function?.value||a.advanced_ego_function?.value||a.complex_61?.value||""};
}

function simQuote(fighter){for(const trait of fighter.personality){const key=String(trait).toLowerCase().split(" ")[0];if(SIM_DIALOGUE[key]){const lines=SIM_DIALOGUE[key];return lines[Math.floor(Math.random()*lines.length)];}}const lines=SIM_DIALOGUE.default;return lines[Math.floor(Math.random()*lines.length)];}
function simSelectCount(){
 const info=SIM_MODE_INFO[simMode];
 $("sim-participant-count").textContent=simMode==="ffa"?"3–4 FIGHTERS":info.count+" FIGHTERS";
 $("sim-mode-description").textContent=info.description;
 const records=window.readOcArchive(),box=$("sim-fighter-selectors");box.innerHTML="";
 info.labels.forEach((label,index)=>{
  const wrap=document.createElement("label");wrap.className="sim-slot-label";wrap.textContent=label;
  const select=document.createElement("select");select.dataset.simSlot=String(index);select.setAttribute("aria-label",label);
  const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="SELECT A SAVED OC";select.append(placeholder);
  records.forEach(record=>{const option=document.createElement("option");option.value=record.id;option.textContent=(record.name||"Unnamed Variant")+" · "+(record.mode==="complex"?"COMPLEX":record.mode==="advanced"?"ADVANCED":"SIMPLE");select.append(option);});
  select.addEventListener("change",simUpdateDifficulty);wrap.append(select);box.append(wrap);
 });
 $("sim-setup-message").textContent=records.length<2?"Save at least two OCs in the creator before starting a match.":records.length<info.count&&simMode!=="1v1"?"You have "+records.length+" saved OCs. Free For All needs at least three; 2v2 needs four.":"";
 $("sim-start-button").disabled=records.length<2;simUpdateDifficulty();
}
function simSetMode(mode){if(!SIM_MODE_INFO[mode])return;simMode=mode;document.querySelectorAll("[data-sim-mode]").forEach(button=>button.classList.toggle("active",button.dataset.simMode===mode));$("simulator-setup").classList.remove("hidden");$("simulator-match").classList.add("hidden");simSelectCount();simUpdateDifficulty();}
function simAddLog(kind,speaker,message){const log=$("sim-log"),item=document.createElement("article");item.className="sim-log-entry sim-log-"+kind;const label=document.createElement("span");label.className="sim-log-label";label.textContent=kind==="chat"?"CHARACTER CHAT":kind==="system"?"ARENA RECORD":"INTERACTION";const content=document.createElement("p");content.textContent=speaker?speaker+": "+message:message;item.append(label,content);log.append(item);while(log.children.length>70)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;}
function simRenderArena(){
 const arena=$("sim-arena-cards");arena.innerHTML="";if(!simMatch)return;
 simMatch.fighters.forEach(f=>{
  const card=document.createElement("article");
  card.className="sim-fighter-card"+(f.alive?"":" sim-fighter-out")+(f.justHit?" sim-damage-pulse":"")+(f.egoActive?" sim-ego-awakened":"");
  const top=document.createElement("div");top.className="sim-fighter-top";
  const team=document.createElement("span");team.className="sim-team-tag";team.textContent=f.team==="ffa"?"FREE AGENT":"TEAM "+f.team;
  const state=document.createElement("span");state.className="sim-fighter-state";state.textContent=f.egoActive?"E.G.O. ACTIVE":f.alive?"ACTIVE":"OUT";top.append(team,state);
  const name=document.createElement("h4");name.textContent=f.name;
  const mode=document.createElement("p");mode.className="sim-fighter-mode";mode.textContent=f.modeLabel+" CREATION";
  const traits=document.createElement("p");traits.className="sim-fighter-traits";traits.textContent=f.personality.length?f.personality.join(" · "):"PERSONALITY NOT RECORDED";
  const hp=document.createElement("div");hp.className="sim-hp-track";const fill=document.createElement("span");fill.className="sim-hp-fill";fill.style.width=Math.max(0,f.justHit?(f.previousHp??f.hp):f.hp)+"%";hp.append(fill);
  const hpText=document.createElement("div");hpText.className="sim-hp-text";hpText.textContent="HEALTH "+f.hp+" / 100";
  const status=document.createElement("p");status.className="sim-fighter-status";status.textContent=f.status||"READY";
  card.append(top,name,mode,traits,hp,hpText,status);
  if(f.passiveAbility){const passive=document.createElement("p");passive.className="sim-ego-detail";passive.textContent="PASSIVE · "+f.passiveAbility+" — "+f.passiveActivation+(f.passiveActive?" · ACTIVE":"");card.append(passive);}
  if(f.statusEffects?.length){const effects=document.createElement("p");effects.className="sim-fighter-status";effects.textContent="STATUS · "+f.statusEffects.map(effect=>effect.name+" "+effect.potency).join(" · ");card.append(effects);}
  if(f.mirrorSummons){const mirrors=document.createElement("p");mirrors.className="sim-ego-detail";mirrors.textContent="MIRROR ALLIES · "+f.mirrorSummons+" MATERIALIZED";card.append(mirrors);}
  if(f.egoEligible){const ego=document.createElement("p");ego.className="sim-ego-label";ego.textContent=f.egoActive?"✦ "+f.egoName+" · MANIFESTED":f.egoType+" AVAILABLE";card.append(ego);if(f.egoAppearance){const visual=document.createElement("p");visual.className="sim-ego-detail";visual.textContent="FORM · "+f.egoAppearance;card.append(visual);}if(f.egoFunction){const ability=document.createElement("p");ability.className="sim-ego-detail";ability.textContent="FUNCTION · "+f.egoFunction;card.append(ability);}}
  arena.append(card);if(f.justHit){const newWidth=Math.max(0,f.hp)+"%";window.requestAnimationFrame(()=>{fill.style.width=newWidth;});}f.justHit=false;
 });
 $("sim-turn-count").textContent="TURN "+String(simMatch.turn).padStart(2,"0");
}
function simAlive(){return simMatch.fighters.filter(f=>f.alive);}
function simWinner(){const alive=simAlive();if(simMatch.mode==="ffa")return alive.length<=1?(alive[0]||null):false;const teams=[...new Set(simMatch.fighters.map(f=>f.team))],active=teams.filter(team=>alive.some(f=>f.team===team));return active.length<=1?(active[0]||null):false;}
function simTriggerHitEffect(kind,target){
 const overlay=$("sim-hit-overlay"),match=$("simulator-match");
 if(!overlay||!match)return;
 window.clearTimeout(simHitTimer);
 overlay.className="sim-hit-overlay sim-hit-"+kind;
 overlay.hidden=false;
 overlay.setAttribute("aria-hidden","false");
 overlay.textContent=(target.name||"FIGHTER")+" / "+(kind==="fatal"?"FATAL HIT":"HEAVY HIT");
 match.classList.remove("sim-hit-heavy","sim-hit-fatal");
 void match.offsetWidth;
 match.classList.add("sim-hit-"+kind);
 simHitTimer=window.setTimeout(()=>{
  overlay.hidden=true;
  overlay.setAttribute("aria-hidden","true");
  overlay.className="sim-hit-overlay";
  match.classList.remove("sim-hit-heavy","sim-hit-fatal");
 },kind==="fatal"?1100:780);
}
function simFinish(winner){simMatch.finished=true;$("sim-next-turn-button").disabled=true;$("sim-run-all-button").disabled=true;$("sim-match-status").textContent=winner?(simMatch.mode==="ffa"?winner.name+" WINS THE FREE-FOR-ALL.":"TEAM "+winner+" WINS THE MATCH."):"MATCH ENDED.";$("sim-feed-status").textContent="MATCH COMPLETE";simAddLog("system","",winner?(simMatch.mode==="ffa"?winner.name+" is the last OC standing.":"Team "+winner+" takes the match."):"The match ends in a draw.");$("sim-rematch-button").classList.remove("hidden");simRenderArena();simRefreshAbilityControls();}
function simRunTurn(){
 if(!simMatch||simMatch.finished)return;
 const active=simAlive();if(active.length<=1){simFinish(active[0]||null);return;}
 const actor=active[Math.floor(Math.random()*active.length)],opponents=active.filter(f=>f.id!==actor.id&&(simMatch.mode==="ffa"||f.team!==actor.team));
 if(!opponents.length){simFinish(actor.team);return;}
 const target=opponents[Math.floor(Math.random()*opponents.length)],usesUltimate=actor.ultimateAbilities.length>0&&Math.random()<.075,abilityIndex=Math.floor(Math.random()*4);
 const movePool=usesUltimate?actor.ultimateAbilities:actor.abilities,move=movePool[usesUltimate?Math.floor(Math.random()*movePool.length):abilityIndex]||SIM_MOVES[abilityIndex];
 simMatch.turn++;simTriggerPassive(actor,"turn");
 if(actor.egoEligible&&!actor.egoUsed&&simMatch.turn>=2&&Math.random()<.32){
  actor.egoUsed=true;actor.egoActive=true;actor.status=actor.egoType+" AWAKENED";simTriggerPassive(actor,"ego");
  simAddLog("system","",actor.name+" undergoes a transformation: "+actor.egoName+".");
  simAddLog("chat",actor.name,'"'+(actor.egoTheme?"This is what "+actor.egoTheme.toLowerCase()+" means to me.":"I will show you my true form.")+'"');
 }
 let impact=usesUltimate?26+Math.floor(Math.random()*13):9+Math.floor(Math.random()*10)+(actor.egoActive?6:0);
 impact+=simMirrorAssist(actor);
 if(Math.random()<.18){impact=Math.max(5,impact-5);target.status="BRACED";}else target.status="REPOSITIONING";
 target.previousHp=target.hp;target.hp=Math.max(0,target.hp-impact);target.justHit=true;
 simApplyStatusInfliction(actor,target,usesUltimate?30:[5,15,15,20][abilityIndex]);simTriggerPassive(target,"damage");if(target.hp<=50)simTriggerPassive(target,"lowHp");
 actor.status=actor.egoActive?"E.G.O. MOMENTUM +":"MOMENTUM +";
 simAddLog("action",actor.name,(usesUltimate?"unleashes ultimate ability ":"uses ability "+(abilityIndex+1)+" ")+move+(actor.egoActive?" through their manifested form":"")+". "+target.name+" loses "+impact+" health.");
 simAddLog("chat",actor.name,'"'+simQuote(actor)+'"');
 if(target.hp===0){target.alive=false;target.status="MATCH COMPLETE";simTriggerHitEffect("fatal",target);simAddLog("system","",target.name+" is out of the match.");simMatch.fighters.filter(f=>f.alive&&f.team===target.team&&f.id!==target.id).forEach(f=>simTriggerPassive(f,"allyOut"));}
 else if(impact>=16)simTriggerHitEffect("heavy",target);else simAddLog("chat",target.name,'"'+SIM_REACTIONS[Math.floor(Math.random()*SIM_REACTIONS.length)]+'."');
 simMatch.fighters.filter(f=>simMatch.mode!=="ffa"&&f.team===actor.team&&f.id!==actor.id&&f.alive).forEach(teammate=>{if(Math.random()<.26){teammate.status="SUPPORTING";simAddLog("chat",teammate.name,'"'+simQuote(teammate)+'"');}});
 simRenderArena();simRefreshAbilityControls();const winner=simWinner();if(winner!==false)simFinish(winner);else $("sim-match-status").textContent="TURN "+simMatch.turn+" RESOLVED — NEXT EXCHANGE READY.";
}
function simRefreshAbilityControls(){
 const actorSelect=$("sim-action-actor"),targetSelect=$("sim-action-target");if(!actorSelect||!targetSelect)return;
 const oldActor=actorSelect.value,oldTarget=targetSelect.value,alive=simMatch?simAlive():[];
 actorSelect.innerHTML="";alive.forEach(f=>actorSelect.add(new Option(f.name,f.id)));
 if(alive.some(f=>f.id===oldActor))actorSelect.value=oldActor;
 const actor=alive.find(f=>f.id===actorSelect.value)||alive[0],opponents=actor?alive.filter(f=>f.id!==actor.id&&(simMatch.mode==="ffa"||f.team!==actor.team)):[];
 targetSelect.innerHTML="";opponents.forEach(f=>targetSelect.add(new Option(f.name,f.id)));
 if(opponents.some(f=>f.id===oldTarget))targetSelect.value=oldTarget;
 document.querySelectorAll("[data-sim-ability]").forEach(button=>{
  const n=Number(button.dataset.simAbility),tier=["LOW · 5","MEDIUM · 15","MEDIUM · 15","LARGE · 20"][n-1],ability=actor?.abilities?.[n-1]||SIM_MOVES[n-1];
  button.textContent="ABILITY "+n+" · "+tier+" — "+String(ability).slice(0,34);button.title=String(ability);
  button.disabled=!actor||!opponents.length||!simMatch||simMatch.finished;
 });
}
function simUseAbility(index){
 if(!simMatch||simMatch.finished)return;
 const actor=simMatch.fighters.find(f=>f.id===$("sim-action-actor")?.value),target=simMatch.fighters.find(f=>f.id===$("sim-action-target")?.value);
 if(!actor?.alive||!target?.alive||actor.id===target.id||(simMatch.mode!=="ffa"&&actor.team===target.team))return;
 const move=actor.abilities[index-1]||SIM_MOVES[index-1],potency=[5,15,15,20][index-1];
 simMatch.turn++;simTriggerPassive(actor,"turn");
 const impact=10+Math.floor(Math.random()*9)+(actor.egoActive?6:0)+simMirrorAssist(actor);
 target.previousHp=target.hp;target.hp=Math.max(0,target.hp-impact);target.justHit=true;
 simApplyStatusInfliction(actor,target,potency);simTriggerPassive(target,"damage");if(target.hp<=50)simTriggerPassive(target,"lowHp");
 actor.status="USED ABILITY "+index;target.status=target.hp===0?"MATCH COMPLETE":"REPOSITIONING";
 simAddLog("action",actor.name,"uses Ability "+index+": "+move+". "+target.name+" loses "+impact+" health.");simAddLog("chat",actor.name,'"'+simQuote(actor)+'"');
 if(target.hp===0){target.alive=false;simTriggerHitEffect("fatal",target);simAddLog("system","",target.name+" is out of the match.");simMatch.fighters.filter(f=>f.alive&&f.team===target.team&&f.id!==target.id).forEach(f=>simTriggerPassive(f,"allyOut"));}else if(impact>=16)simTriggerHitEffect("heavy",target);
 simRenderArena();simRefreshAbilityControls();const winner=simWinner();if(winner!==false)simFinish(winner);else $("sim-match-status").textContent="TURN "+simMatch.turn+" RESOLVED — "+actor.name+" used Ability "+index+".";
}
function simBuildMatch(ids){
 simAutoRunning=false;
 const records=window.readOcArchive(),teamMap=simMode==="1v1"?["A","B"]:simMode==="2v2"?["A","A","B","B"]:["ffa","ffa","ffa","ffa"];
 const fighters=ids.map((id,index)=>{
  const record=records.find(r=>r.id===id),ego=simEgoProfile(record),passive=simPassiveProfile(record);
  return {id:record.id,name:record.name||"Unnamed Variant",modeLabel:record.mode==="complex"?"COMPLEX":record.mode==="advanced"?"ADVANCED":"SIMPLE",team:teamMap[index],hp:100,alive:true,status:"READY",personality:simPersonality(record),abilities:simAbilityOptions(record),ultimateAbilities:simUltimateOptions(record),statusInfliction:simStatusInfliction(record),statusEffects:[],passiveAbility:passive.text,passiveActivation:passive.activation,passiveActive:false,passiveAnnounced:false,mirrorSummons:0,egoEligible:ego.eligible,egoType:ego.type,egoName:ego.name,egoTheme:ego.theme,egoAppearance:ego.appearance,egoFunction:ego.functionText,egoUsed:false,egoActive:false,justHit:false};
 });
 simMatch={mode:simMode,fighters,turn:0,finished:false,ids:ids.slice()};
 $("simulator-setup").classList.add("hidden");$("simulator-match").classList.remove("hidden");
 $("sim-match-title").textContent=simMode==="ffa"?"FREE FOR ALL":simMode.toUpperCase();
 $("sim-log").innerHTML="";$("sim-feed-status").textContent="MATCH LIVE";
 $("sim-next-turn-button").disabled=false;$("sim-run-all-button").disabled=false;$("sim-rematch-button").classList.add("hidden");
 $("sim-match-status").textContent="MATCH INITIALIZED. AWAITING FIRST EXCHANGE.";
 simRenderArena();simUpdateDifficulty();simAddLog("system","","Match initialized — "+(simMode==="ffa"?"Free For All":simMode.toUpperCase())+".");
 fighters.forEach(f=>{simAddLog("chat",f.name,'"'+simQuote(f)+'"');if(f.egoEligible)simAddLog("system","",f.name+" has a transformation available: "+f.egoName+".");simTriggerPassive(f,"battleStart");});
 simRefreshAbilityControls();
}
function simStart(){const ids=[...document.querySelectorAll("[data-sim-slot]")].map(x=>x.value).filter(Boolean),min=simMode==="ffa"?3:SIM_MODE_INFO[simMode].count;if(ids.length<min){$("sim-setup-message").textContent=simMode==="ffa"?"Choose at least three OCs.":"Choose every fighter slot.";return;}if(new Set(ids).size!==ids.length){$("sim-setup-message").textContent="Choose a different saved OC for each slot.";return;}if(simMode!=="ffa"&&ids.length!==SIM_MODE_INFO[simMode].count){$("sim-setup-message").textContent="Fill every fighter slot before starting.";return;}simBuildMatch(ids);$("sim-setup-message").textContent="";}
function simRematch(){if(simMatch)simBuildMatch(simMatch.ids);}
function simRunAll(){
 if(!simMatch||simMatch.finished||simAutoRunning)return;
 simAutoRunning=true;$("sim-run-all-button").disabled=true;$("sim-next-turn-button").disabled=true;
 const tick=()=>{
  if(!simMatch||simMatch.finished){simAutoRunning=false;return;}
  simRunTurn();
  if(simMatch.finished){simAutoRunning=false;return;}
  window.setTimeout(tick,520);
 };
 tick();
}
function transitionDelay(){return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?1:720;}
function openSimulator(){document.body.classList.add("simulator-opening");window.setTimeout(()=>{window.ueeDesktopShowView("simulator");document.body.classList.remove("simulator-opening");document.body.classList.add("simulator-entered");simSetMode("1v1");},transitionDelay());}
function closeSimulator(){document.body.classList.remove("simulator-entered");document.body.classList.add("simulator-closing");window.setTimeout(()=>{window.ueeDesktopShowView("home");document.body.classList.remove("simulator-closing");document.body.classList.add("home-returning");window.setTimeout(()=>document.body.classList.remove("home-returning"),transitionDelay());},transitionDelay());}
$("open-simulator-button")?.addEventListener("click",openSimulator);
$("simulator-back-button")?.addEventListener("click",closeSimulator);
document.querySelectorAll("[data-sim-mode]").forEach(button=>button.addEventListener("click",()=>simSetMode(button.dataset.simMode)));
$("sim-start-button")?.addEventListener("click",simStart);
$("sim-next-turn-button")?.addEventListener("click",simRunTurn);
$("sim-action-actor")?.addEventListener("change",simRefreshAbilityControls);
document.querySelectorAll("[data-sim-ability]").forEach(button=>button.addEventListener("click",()=>simUseAbility(Number(button.dataset.simAbility))));
$("sim-run-all-button")?.addEventListener("click",simRunAll);
$("sim-rematch-button")?.addEventListener("click",simRematch);
$("sim-create-oc-button")?.addEventListener("click",()=>window.ueeDesktopNewCharacter());


 if(typeof simEgoProfile==="function")window.simEgoProfile=simEgoProfile;
})();
