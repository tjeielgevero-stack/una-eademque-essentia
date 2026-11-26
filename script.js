/*
 UNA EADEMQUE ESSENTIA — lore-conscious character and Mirror World archive.
 District / Corp. labels follow the alphabetical sequence; District 26 / Z is an archive extrapolation.
*/
const DISTRICT_CORP = Object.fromEntries(Array.from({length:26},(_,i)=>{
  const n=i+1, letter=String.fromCharCode(65+i);
  return [n,`District ${n} - ${letter} Corp.`];
}));

const ASSOCIATIONS = [
  "Hana Association", "Zwei Association", "Tres Association", "Shi Association",
  "Cinq Association", "Liu Association", "Seven Association", "Eight Association",
  "Devyat' Association", "Dieci Association", "Öufi Association",
  "Unrevealed Twelfth Association (name unknown)"
];
const CITY_BRANCHES = ["North Branch", "South Branch", "East Branch", "West Branch"];
const ASSOCIATION_SECTIONS = ["Section 1 — highest", "Section 2", "Section 3", "Section 4", "Section 5", "Section 6 — lowest"];

// Only three legacy entries are distinct Abnormalities; the remaining legacy names are aliases
// for current records and are kept searchable as aliases rather than duplicated options.
function egoPathOf(egoStatus) {
  if (egoStatus === "Uses refined Lobotomy E.G.O. equipment") return "lobotomy";
  if (egoStatus === "Uses Abnormality E.G.O. (Sinner-issued)") return "sinner";
  return "derived";
}
function getSynergyAbnormalities(egoStatus) {
  const path = egoPathOf(egoStatus);
  if (path === "lobotomy") return L_CORP_SYNERGY_ABNORMALITIES;
  if (path === "sinner") return SINNER_SYNERGY_ABNORMALITIES;
  return OUTSIDE_L_CORP_ABNORMALITIES;
}

const FINGER_SYNDICATES=["The Thumb","The Index","The Middle","The Ring","The Pinky"];
const FINGER_SUBSIDIARIES=[
 "Stray Dogs (Thumb affiliate)","Kurokumo Clan (Thumb affiliate)","Night Awls (Thumb affiliate)",
 "Rumanos Cartel (Thumb affiliate)","Ramier Family (Thumb affiliate)","Nekomata Mafia (Thumb affiliate)",
 "Tepuu Family (Thumb affiliate)","The Knots (Thumb affiliate)","Twinhook Pirates (Middle affiliate)"
];
const INDEPENDENT_SYNDICATES=[
 "Brotherhood of Iron","Musicians of Bremen","Little Piggy's","Axe Gang","The Carnival",
 "Smiling Faces","Rusted Chains","Blade Lineage","Reverberation Ensemble","Tingtang Gang",
 "Tieqiu Crew","Los Mariachis","Yurodivyie","Technology Liberation Alliance","Dead Rabbits"
];
const FINGER_HIERARCHIES={
 "The Thumb":["Soldato — ordinary member","Capo — squad captain","Sottocapo — regional underboss","Capo dei capi — overall head of the Thumb","Other / custom answer","Unknown / undisclosed"],
 "The Index":["Proselyte — initiate","Proxy — Prescript-assigned role","Messenger — Prescript delivery role","Other / custom answer","Unknown / undisclosed"],
 "The Middle":["Little Sibling — entry rank","Young Sibling","Big Sibling","Great Sibling — highest known rank","Other / custom answer","Unknown / undisclosed"],
 "The Ring":["Student — entry rank","Docent — middle rank","Maestro — senior artist rank","Other / custom answer","Unknown / undisclosed"],
 "The Pinky":["Member — exact standing undisclosed","Star-named seat holder","Other / custom answer","Unknown / undisclosed"]
};
const SYNDICATE_HIERARCHY_OPTIONS=["Ordinary member","Senior member / specialist","Trusted officer / deputy","Local group leader","Regional leader","Syndicate head / boss","Other / custom answer","Unknown / undisclosed"];
function hasFixerTrack(a){
 return a.occupation==="Fixer"||a.occupation==="Fixer Office employee"||
  (a.occupation==="Syndicate member"&&["Also works as a Fixer (dual role)","Former Fixer (previous career)"].includes(a.syndicate_fixer_status));
}
function syndicateOptions(a){
 if(a.syndicate_type==="One of the Five Fingers")return FINGER_SYNDICATES;
 if(a.syndicate_type==="A Finger subsidiary / affiliate")return [...FINGER_SUBSIDIARIES,"Other / custom answer","Unknown / undisclosed"];
 if(a.syndicate_type==="An independent Syndicate")return [...INDEPENDENT_SYNDICATES,"Other / custom answer","Unknown / undisclosed"];
 if(a.syndicate_type==="A custom / lesser-known Syndicate")return ["Other / custom answer"];
 return ["Unknown / undisclosed"];
}

const QUESTIONS = [
{id:"personality",category:"PERSONALITY & TEMPERAMENT",title:"Personality",description:"Select every trait that fits this character. Choose Custom to enter your own personality description instead; Custom cannot be combined with preset traits.",multiple:true,options:["Aloof","Reserved","Stoic","Calm and composed","Analytical","Pragmatic","Cynical","Sarcastic","Witty","Cheerful","Outgoing","Charismatic","Gentle","Compassionate","Patient","Idealistic","Ambitious","Proud","Arrogant","Eccentric","Mischievous","Impulsive","Hot-headed","Anxious","Paranoid","Melancholic","Detached","Secretive","Protective","Loyal","Manipulative","Ruthless","Soft-spoken","Other / custom answer"]},
{id:"era",category:"SETTING & TIMELINE",title:"Story Era",description:"At what point in the Project Moon timeline does this variant's story take place?",options:["Before the events of Lobotomy Corporation","During the Lobotomy Corporation era","After the White Nights and Dark Days","During the Library of Ruina era","During the Limbus Company era","An alternate Mirror World / original timeline","Other / custom answer"]},
{id:"origin_type",category:"GEOGRAPHY & ORIGIN",title:"Place of Origin",description:"Which part of the world was this variant born or first raised in?",options:["A Nest in the City","The Backstreets of a District","The Outskirts","The Ruins beneath the City","Outside the known setting / custom Mirror World","Unknown / undisclosed"]},
{id:"district",category:"GEOGRAPHY & ORIGIN",title:"District / Corp.",description:"Choose the combined District and corresponding Corp. entry. The archive extends the alphabetical pattern through District 26 - Z Corp.; that final entry is an extrapolation, not a confirmed in-game reveal.",showIf:a=>["A Nest in the City","The Backstreets of a District"].includes(a.origin_type),options:Object.values(DISTRICT_CORP).concat(["Unknown / undisclosed","Other / custom answer"])},
{id:"nest_status",category:"GEOGRAPHY & ORIGIN",title:"Nest Status",description:"What is this variant's relationship to Nest life?",showIf:a=>a.origin_type==="A Nest in the City",options:["Resident / ordinary citizen","Wing employee (Feather)","Wing executive or privileged employee","Resident with precarious status","Former Nest resident, now displaced","Other / custom answer","Unknown / undisclosed"]},
{id:"backstreet_environment",category:"GEOGRAPHY & ORIGIN",title:"Backstreet Environment",description:"What kind of Backstreets environment shaped this variant? Conditions differ significantly between areas.",showIf:a=>a.origin_type==="The Backstreets of a District",options:["Relatively stable neighborhood","Territory controlled by a major Syndicate","Territory controlled by a smaller Syndicate","Area maintained by Fixer Offices","Workshop-dominated neighborhood","Highly lawless area","Near a Nest boundary","Other / custom answer","Unknown / undisclosed"]},
{id:"upbringing",category:"HISTORY & SOCIAL POSITION",title:"Upbringing",description:"What circumstances shaped this variant's childhood and formative years?",options:["Born into a prominent Fixer family","Born into an ordinary Nest household","Born into a Backstreets household","Raised by a Fixer Office","Raised within a Syndicate","Raised by a Wing / corporate household","Raised in a Workshop environment","Orphaned or raised without stable guardians","Spent formative years in the Outskirts or Ruins","Other / custom answer"]},
{id:"family_status",category:"HISTORY & SOCIAL POSITION",title:"Family Standing",description:"How was this variant's family regarded? This is social standing, not automatically their personal rank.",options:["Prominent and influential family","Established Fixer family","Known Workshop family","Family connected to a Wing","Family connected to a Syndicate","Ordinary working family","Impoverished household","Disgraced or notorious family","No known family / raised independently","Other / custom answer"]},
{id:"augmentation",category:"HISTORY & SOCIAL POSITION",title:"Augmentations",description:"What is this variant's relationship with the City's commonplace body-modification technology? Keep this at a narrative level.",options:["No known technological augmentations","Minor quality-of-life modifications","Medical or prosthetic replacements","Specialized professional augmentations","Extensive bodily augmentation","Experimental or unusual modifications","Unknown / undisclosed","Other / custom answer"]},
{id:"education",category:"HISTORY & SOCIAL POSITION",title:"Training & Education",description:"Where did this variant acquire their knowledge and professional training?",options:["Family instruction","Fixer Office apprenticeship","Association training","Syndicate training","Wing education or corporate training","Workshop apprenticeship","Self-taught","Formal private education","Several sources","Other / custom answer"]},
{id:"occupation",category:"PROFESSION & AFFILIATION",title:"Primary Occupation",description:"What does this variant principally do for a living? Choose the main affiliation first; an explicit dual-role option is available for Syndicate members who also work as Fixers.",options:["Fixer","Fixer Office employee","Syndicate member","Wing employee (Feather)","Workshop artisan or craftsperson","Association employee","Independent contractor","Researcher / specialist","Other / custom answer"]},
{id:"syndicate_fixer_status",category:"PROFESSION & AFFILIATION",title:"Additional Fixer Standing",description:"Syndicate membership does not automatically make someone a Fixer. Choose whether this character is only a Syndicate member, also works as a Fixer (an intentional OC dual role), or previously worked as one. This controls whether Fixer record questions appear.",showIf:a=>a.occupation==="Syndicate member",options:["Syndicate member only","Also works as a Fixer (dual role)","Former Fixer (previous career)"]},
{id:"syndicate_type",category:"PROFESSION & AFFILIATION",title:"Syndicate Category",description:"Choose the kind of Syndicate. The Five Fingers are the five major Syndicates; subsidiaries and independent groups are listed separately.",showIf:a=>a.occupation==="Syndicate member",options:["One of the Five Fingers","A Finger subsidiary / affiliate","An independent Syndicate","A custom / lesser-known Syndicate","Unknown / undisclosed"]},
{id:"syndicate",category:"PROFESSION & AFFILIATION",title:"Syndicate / Finger Affiliation",description:a=>a.syndicate_type==="One of the Five Fingers"?"Choose one of the Five Fingers. The next question will show that Finger's known hierarchy.":a.syndicate_type==="A Finger subsidiary / affiliate"?"Choose a known group affiliated with a Finger. The listed affiliations are examples, not an exhaustive roster.":a.syndicate_type==="An independent Syndicate"?"Choose a known independent Syndicate. This list is not exhaustive; custom entries are available.":"Choose or enter the Syndicate this character belongs to.",showIf:a=>!!a.syndicate_type,options:a=>syndicateOptions(a)},
{id:"finger_rank",category:"PROFESSION & AFFILIATION",title:"Finger Hierarchy / Position",description:a=>a.syndicate==="The Pinky"?"The Pinky's internal structure is deliberately obscure. Choose a broad known standing or record a custom title rather than treating unknown details as canon.":a.syndicate==="The Index"?"The Index's known roles include Proselytes, Proxies, and Messengers; the last two are not presented here as a confirmed strict ladder.":"Choose the character's position within the selected Finger, from the lower member ranks to its highest known leadership.",showIf:a=>a.syndicate_type==="One of the Five Fingers"&&!!FINGER_HIERARCHIES[a.syndicate],options:a=>FINGER_HIERARCHIES[a.syndicate]},
{id:"syndicate_hierarchy",category:"PROFESSION & AFFILIATION",title:"Syndicate Position / Hierarchy",description:"These are broad character-building positions for subsidiaries and independent Syndicates. They are not claimed to be universal or confirmed canon ranks; use a custom answer for a group's own title.",showIf:a=>["A Finger subsidiary / affiliate","An independent Syndicate","A custom / lesser-known Syndicate"].includes(a.syndicate_type)&&!!a.syndicate&&a.syndicate!=="Unknown / undisclosed",options:SYNDICATE_HIERARCHY_OPTIONS},
{id:"fixer_grade",category:"PROFESSION & AFFILIATION",title:"Fixer Grade / Former Grade",description:a=>a.syndicate_fixer_status==="Former Fixer (previous career)"?"Record the character's last known Fixer Grade. A Color is a distinct exceptional title, not simply another numbered Grade.":"Fixer Grades are professional classifications. A Color is a distinct exceptional title, not simply another numbered Grade.",showIf:a=>hasFixerTrack(a),options:["Grade 9","Grade 8","Grade 7","Grade 6","Grade 5","Grade 4","Grade 3","Grade 2","Grade 1","Color Fixer","Ungraded / not registered","Unknown / undisclosed"]},
{id:"color_title",category:"PROFESSION & AFFILIATION",title:"Color Title",description:"If this character is or was a Color Fixer, what is their recognized Color and epithet?",showIf:a=>hasFixerTrack(a)&&a.fixer_grade==="Color Fixer",options:["The Red Mist","The Blue Reverberation","The Black Silence","An original Color title","Other / custom answer","Undisclosed"]},
{id:"association",category:"PROFESSION & AFFILIATION",title:"Fixer Association / Previous Association",description:a=>a.syndicate_fixer_status==="Former Fixer (previous career)"?"Record the Association this character previously belonged to, if any. An Association is distinct from a Syndicate.":"Choose the Association this Fixer belongs to. Eleven of the twelve Associations have been named in released material; the twelfth remains unidentified.",showIf:a=>hasFixerTrack(a)||a.occupation==="Association employee",options:ASSOCIATIONS.concat(["Other / custom answer","Unaffiliated Fixer","Unknown / undisclosed"])},
{id:"association_branch",category:"PROFESSION & AFFILIATION",title:"Association Branch",description:"Each Association has four branches, each responsible for a quarter of the City. A Branch Manager oversees the branch.",showIf:a=>!!a.association&&!["Unaffiliated Fixer","Unknown / undisclosed"].includes(a.association),options:CITY_BRANCHES},
{id:"association_section",category:"PROFESSION & AFFILIATION",title:"Association Section",description:"Each branch is divided into six Sections. Section 1 is the highest and most prestigious; Section 6 is the lowest. Each Section is led by a Director.",showIf:a=>!!a.association_branch,options:ASSOCIATION_SECTIONS},
{id:"association_position",category:"PROFESSION & AFFILIATION",title:"Are you a Director or Branch Manager?",description:"Choose this character's position within the selected Association branch. A Branch Manager oversees the branch; a Director leads a specific Section.",showIf:a=>!!a.association_branch&&!!a.association_section,options:["Branch Manager","Section Director (Director)","Association member (neither)","Other / custom answer","Unknown / undisclosed"]},
{id:"office",category:"PROFESSION & AFFILIATION",title:"Fixer Office / Previous Office",description:"Does this variant belong, or did they previously belong, to a particular Fixer Office? An Office is distinct from an Association.",showIf:a=>hasFixerTrack(a),options:["Owns or leads an Office","Works for an established Office","Member of a small independent Office","Works alone without an Office","No longer affiliated with an Office","Other / custom answer"]},
{id:"wing_role",category:"PROFESSION & AFFILIATION",title:"Wing Role",description:"If employed by a Wing, what is this variant's relationship to it?",showIf:a=>a.occupation==="Wing employee (Feather)",options:["Research / technical staff","Administrative employee","Security / enforcement role","Field operative","Executive / management","Ordinary employee","Other / custom answer"]},
{id:"workshop",category:"PROFESSION & AFFILIATION",title:"Workshop Relationship",description:"Workshops produce and maintain the City's equipment and specialized products. What is this variant's connection to one?",showIf:a=>a.occupation==="Workshop artisan or craftsperson"||a.education==="Workshop apprenticeship",options:["Independent craftsperson","Workshop employee","Workshop owner","Workshop family / heir","Commissioned specialist","Other / custom answer"]},
{id:"reputation",category:"PROFESSION & AFFILIATION",title:"Reputation",description:"How are they regarded by clients, peers, rivals, or the organizations around them?",options:["Respected professional","Feared for their capabilities","Infamous or notorious","Reliable but unremarkable","Quietly influential","Controversial","Little-known","Reputation differs by District","Other / custom answer"]},
{id:"specialty",category:"SKILLS & CHARACTERISTICS",title:"Professional Specialty",description:"What field best defines their expertise? This describes narrative specialization, not real-world instruction.",options:["Investigation and information gathering","Negotiation and mediation","Protection and escort work","Retrieval and recovery assignments","Reconnaissance and observation","Technical or Workshop expertise","Close-quarters combat specialist","Team coordination and leadership","Specialist in a particular Singularity or technology","Other / custom answer"]},
{id:"combat_approach",category:"SKILLS & CHARACTERISTICS",title:"Combat Approach",description:"At a high level, how does this character tend to approach fictional confrontations?",options:["Precise and economical","Defensive and patient","Fast and aggressive","Adaptive and opportunistic","Methodical and analytical","Team-oriented and supportive","Unorthodox and unpredictable","Avoids confrontation where possible","Other / custom answer"]},
{id:"technical_level",category:"SKILLS & CHARACTERISTICS",title:"Technical Proficiency",description:"How exceptional is this variant within their chosen specialty? This is an OC power scale, not an official City classification.",options:["Competent professional","Highly skilled specialist","Among the best in their Office","Exceptional Grade 1-level specialist","Comparable to a renowned veteran","Color Fixer-level overall capability","Beyond ordinary City classifications (deliberate AU)","Other / custom answer"]},
{id:"singularity_contact",category:"CITY TECHNOLOGY",title:"Singularity Exposure",description:"Has this variant encountered, worked with, or been affected by a Wing's Singularity?",options:["No known exposure","Works with technology derived from a Singularity","Directly employed by a Wing researching it","Affected by an incident involving it","Has privileged knowledge of it","Original Mirror World-specific circumstance","Unknown / undisclosed"]},
{id:"abnormality_contact",category:"LOBOTOMY & ABNORMALITY CONTEXT",title:"Abnormality-Related Experience",description:"Abnormalities are entities associated with Lobotomy Corporation's research and the human psyche; they are not a normal place of origin. What is this variant's connection to them?",options:["No known contact","Encountered an Abnormality","Worked at a Lobotomy Corporation facility","Used extracted Abnormality E.G.O.","Has knowledge through research or records","Was involved in an Abnormality-related incident","Other / custom answer","Unknown / undisclosed"]},
{id:"ego_status",category:"E.G.O. & DISTORTION",title:"E.G.O. / Distortion Status",description:"Choose the current known state. Personal E.G.O., Abnormality-derived E.G.O. (e.g. Hohenheim's AEDD, Gubo's Fell Bullet), and Sinner-issued Abnormality E.G.O. are different; Distortion is a separate phenomenon.",options:["No known E.G.O. or Distortion","Personally manifested E.G.O. (Effloresced E.G.O.)","Uses Abnormality-derived E.G.O.","Uses Abnormality E.G.O. (Sinner-issued)","Uses refined Lobotomy E.G.O. equipment","Volatile E.G.O. (unstable manifestation)","Has become a Distortion","Formerly distorted / unusual AU outcome","Other / custom answer","Unknown / undisclosed"]},
{id:"ego_equipment_customizer",category:"E.G.O. LOADOUT CUSTOMIZER",title:"E.G.O. Synergy & Loadout",description:a=>a.ego_status==="Uses Abnormality E.G.O. (Sinner-issued)"?"ABNORMALITY E.G.O. (SINNER-ISSUED) — the E.G.O. the Sinners use, extracted from Abnormalities. Choose a synergy from any L Corp. or outside-L-Corp. Abnormality; the weapon field suggests every Limbus Company E.G.O.":a.ego_status==="Uses refined Lobotomy E.G.O. equipment"?"REFINED LOBOTOMY E.G.O. — choose a synergy from the original L Corp. facility archive. This is the E.G.O. extracted and refined through L Corp.'s Abnormality facilities.":"ABNORMALITY-DERIVED E.G.O. — choose a synergy from the separate outside-L-Corp. archive, including Limbus-era Abnormalities such as Der Fluchschütze. L Corp. facility entries are excluded from this list.",showIf:a=>["Uses Abnormality-derived E.G.O.","Uses Abnormality E.G.O. (Sinner-issued)","Uses refined Lobotomy E.G.O. equipment"].includes(a.ego_status),customizer:true},
{id:"volatile_ego_state",category:"E.G.O. & DISTORTION",title:"Volatile E.G.O. Condition",description:"How does this variant's Volatile E.G.O. behave while unstable? Keep the description focused on its fictional presentation and narrative consequences.",showIf:a=>a.ego_status==="Volatile E.G.O. (unstable manifestation)",options:["Its form flickers or shifts unpredictably","Its appearance is incomplete or fragmented","Its power fluctuates with emotional strain","It is difficult to maintain for long","It manifests inconsistently under pressure","Its instability has a unique custom expression","Other / custom answer"]},
{id:"ego_trigger",category:"E.G.O. & DISTORTION",title:"Manifestation Circumstance",description:"For a personally manifested E.G.O., what defining emotional crisis or choice shaped its emergence? The exact event is original character lore.",showIf:a=>a.ego_status==="Personally manifested E.G.O. (Effloresced E.G.O.)"||a.ego_status==="Volatile E.G.O. (unstable manifestation)",options:["A world-shattering personal loss","A confrontation with one's own identity","Rejecting despair and choosing a personal conviction","A moment of self-acceptance","Protecting a deeply held value","Other / custom answer","Undisclosed"]},
{id:"ego_form",category:"E.G.O. & DISTORTION",title:"Personal E.G.O. Form",description:"What form does this individual's own E.G.O. take? Its form and function should reflect their psyche.",showIf:a=>a.ego_status==="Personally manifested E.G.O. (Effloresced E.G.O.)"||a.ego_status==="Volatile E.G.O. (unstable manifestation)",options:["Personal armor or attire","A personal implement or tool","A weapon-like manifestation (describe fictionally)","A combination of forms","An environmental or architectural manifestation","An unusual abstract manifestation","Other / custom answer"]},
{id:"ego_theme",category:"E.G.O. & DISTORTION",title:"E.G.O. Theme",description:"What core idea, memory, desire, fear, or conviction does the E.G.O. express?",showIf:a=>a.ego_status==="Personally manifested E.G.O. (Effloresced E.G.O.)"||a.ego_status==="Volatile E.G.O. (unstable manifestation)",options:["Identity and selfhood","Freedom and confinement","Memory and regret","Ambition and recognition","Love and attachment","Isolation and alienation","Order and control","Change and acceptance","Other / custom answer"]},
{id:"ego_name",category:"E.G.O. & DISTORTION",title:"Personal E.G.O. Name & Description",description:"Name and describe this variant's own manifested E.G.O. This page is only relevant to personal or volatile E.G.O.; equipment extracted from Abnormalities is recorded in its loadout instead.",showIf:a=>a.ego_status==="Personally manifested E.G.O. (Effloresced E.G.O.)"||a.ego_status==="Volatile E.G.O. (unstable manifestation)",options:["Other / custom answer","Leave blank for now"]},
{id:"distortion_theme",category:"E.G.O. & DISTORTION",title:"Distortion Theme",description:"If distorted, what craving, fixation, or emotional contradiction does the transformation embody?",showIf:a=>a.ego_status==="Has become a Distortion",options:["A consuming desire","An unresolved regret","A need for recognition","Fear of abandonment","Obsession with control","A fractured sense of identity","Other / custom answer"]},

{id:"moral_outlook",category:"PERSONAL IDENTITY",title:"Moral Outlook",description:"Choose the principles, compromises, and contradictions that shape this individual. Characters can be morally complex without being strictly heroic or villainous.",options:["Pragmatic survivor","Follows a strict personal code","Loyal to chosen people, not institutions","Idealistic but disillusioned","Self-interested without being needlessly cruel","Protective of a particular community","Cynical toward the City's systems","Contradictory and situational","Other / custom answer"]},
{id:"relationships",category:"PERSONAL IDENTITY",title:"Important Relationships",description:"Which relationships most shape this variant's story?",options:["Family or former guardians","Fixer Office colleagues","Association mentor or superior","Syndicate associates","Wing colleagues","Workshop connections","A rival or former opponent","A close friend or confidant","No defining relationship","Other / custom answer"]},
{id:"backstory",category:"FINAL CHARACTER DETAILS",title:"Defining Backstory Event",description:"Choose a broad starting point for the event that most changed this variant's life.",options:["A family legacy or inheritance","A failed Fixer assignment","A Wing-related incident","A Syndicate conflict","A Workshop or technology incident","An Abnormality-related incident","A personal betrayal","A major moral choice","A career-defining achievement","Other / custom answer"]},
{id:"notes",category:"FINAL CHARACTER DETAILS",title:"Additional Lore Notes",description:"Add any important detail that the structured questions did not cover.",options:["Other / custom answer","Leave blank for now"]}
];

const $=id=>document.getElementById(id);

// Settings dialog and custom two-dimensional HSV color picker.
(function setupColorPicker(){
 const overlay=$("settings-overlay");
 const openButton=$("settings-open");
 const closeButtons=[$("settings-close"),$("settings-close-bottom")].filter(Boolean);
 const field=$("color-sv-field");
 const handle=$("sv-handle");
 const hueInput=$("hue-slider");
 const swatch=$("color-preview-swatch");
 const hexLabel=$("color-preview-hex");
 const description=$("color-preview-description");
 if(!overlay||!openButton||!field||!handle||!hueInput)return;

 const root=document.documentElement;
 const storageKey="uee_custom_theme_v1";
 const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
 const state={h:352,s:0.68,v:0.86};
 let dragging=false;

 function hsvToRgb(h,s,v){
  const c=v*s, hp=((h%360)+360)%360/60;
  const x=c*(1-Math.abs((hp%2)-1));
  let rgb;
  if(hp<1)rgb=[c,x,0];
  else if(hp<2)rgb=[x,c,0];
  else if(hp<3)rgb=[0,c,x];
  else if(hp<4)rgb=[0,x,c];
  else if(hp<5)rgb=[x,0,c];
  else rgb=[c,0,x];
  const m=v-c;
  return rgb.map(n=>Math.round((n+m)*255));
 }
 function hex(rgb){return "#"+rgb.map(n=>n.toString(16).padStart(2,"0")).join("").toUpperCase();}
 function blend(rgb,amount){
  return rgb.map(n=>Math.round(n+(255-n)*amount));
 }
 function applyColor(save=true){
  const rgb=hsvToRgb(state.h,state.s,state.v);
  const accent=hex(rgb);
  const strong=hex(hsvToRgb(state.h,Math.min(1,state.s*0.92+0.08),Math.max(0.42,state.v*0.62)));
  const pale=hex(blend(rgb,0.72));
  root.dataset.theme="custom";
  root.style.setProperty("--accent",accent);
  root.style.setProperty("--accent-rgb",rgb.join(", "));
  root.style.setProperty("--accent-strong",strong);
  root.style.setProperty("--accent-text",pale);
  field.style.setProperty("--picker-base",`hsl(${state.h} 100% 50%)`);
  field.style.setProperty("--selector-x",`${state.s*100}%`);
  field.style.setProperty("--selector-y",`${(1-state.v)*100}%`);
  field.setAttribute("aria-valuenow",String(Math.round(state.s*100)));
  field.setAttribute("aria-valuetext",`Saturation ${Math.round(state.s*100)} percent, brightness ${Math.round(state.v*100)} percent`);
  hueInput.value=String(Math.round(state.h));
  if(swatch)swatch.style.backgroundColor=accent;
  if(hexLabel)hexLabel.textContent=accent;
  if(description)description.textContent=`HUE ${Math.round(state.h)}° · SATURATION ${Math.round(state.s*100)}% · VALUE ${Math.round(state.v*100)}%`;
  if(save){
   try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}
  }
 }
 function updateFromPointer(event){
  const rect=field.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  state.s=clamp((event.clientX-rect.left)/rect.width,0,1);
  state.v=1-clamp((event.clientY-rect.top)/rect.height,0,1);
  applyColor();
 }
 function openSettings(){
  if(!overlay.open)overlay.showModal();
  openButton.setAttribute("aria-expanded","true");
  closeButtons[0]?.focus();
 }
 function closeSettings(){
  if(overlay.open)overlay.close();
  openButton.setAttribute("aria-expanded","false");
  openButton.focus();
 }
 overlay.addEventListener("close",()=>openButton.setAttribute("aria-expanded","false"));
 openButton.addEventListener("click",openSettings);
 closeButtons.forEach(button=>button.addEventListener("click",closeSettings));
 overlay.addEventListener("click",event=>{if(event.target===overlay)closeSettings();});
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&overlay.open)closeSettings();
 });
 field.addEventListener("pointerdown",event=>{
  dragging=true;
  field.setPointerCapture?.(event.pointerId);
  updateFromPointer(event);
 });
 field.addEventListener("pointermove",event=>{
  if(dragging&&(event.buttons===1||event.pointerType==="touch"))updateFromPointer(event);
 });
 const stopDragging=()=>{dragging=false;};
 field.addEventListener("pointerup",stopDragging);
 field.addEventListener("pointercancel",stopDragging);
 field.addEventListener("lostpointercapture",stopDragging);
 field.addEventListener("keydown",event=>{
  const step=event.shiftKey?0.1:0.02;
  let handled=true;
  if(event.key==="ArrowLeft")state.s=clamp(state.s-step,0,1);
  else if(event.key==="ArrowRight")state.s=clamp(state.s+step,0,1);
  else if(event.key==="ArrowUp")state.v=clamp(state.v+step,0,1);
  else if(event.key==="ArrowDown")state.v=clamp(state.v-step,0,1);
  else handled=false;
  if(handled){event.preventDefault();applyColor();}
 });
 hueInput.addEventListener("input",()=>{state.h=Number(hueInput.value);applyColor();});
 $("settings-reset")?.addEventListener("click",()=>{
  state.h=352;state.s=0.68;state.v=0.86;applyColor();
 });
 try{
  const saved=JSON.parse(localStorage.getItem(storageKey)||"null");
  if(saved&&Number.isFinite(saved.h)&&Number.isFinite(saved.s)&&Number.isFinite(saved.v)){
   state.h=clamp(saved.h,0,359);
   state.s=clamp(saved.s,0,1);
   state.v=clamp(saved.v,0,1);
  }
 }catch{}
 applyColor(false);
})();

// Accessible Settings tabs and persistent visual-effect toggles.
(function setupSettingsTabsAndEffects(){
 const tabs=[...document.querySelectorAll("[data-settings-tab]")],panels=[...document.querySelectorAll("[data-settings-panel]")],tablist=document.querySelector(".settings-tabs");
 function activateTab(name,focus=false){tabs.forEach(tab=>{const active=tab.dataset.settingsTab===name;tab.classList.toggle("active",active);tab.setAttribute("aria-selected",String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});panels.forEach(panel=>{panel.hidden=panel.dataset.settingsPanel!==name;});}
 tabs.forEach(tab=>tab.addEventListener("click",()=>activateTab(tab.dataset.settingsTab)));
 tablist?.addEventListener("keydown",event=>{const current=tabs.indexOf(document.activeElement);let next=current;if(event.key==="ArrowRight")next=(current+1)%tabs.length;else if(event.key==="ArrowLeft")next=(current-1+tabs.length)%tabs.length;else if(event.key==="Home")next=0;else if(event.key==="End")next=tabs.length-1;else return;event.preventDefault();activateTab(tabs[next].dataset.settingsTab,true);});
 const switches=[...document.querySelectorAll("[data-effect-toggle]")],root=document.documentElement,sensitive=["rainbowapocalypse","impactframe"],storageKey="uee_visual_effects_v1",warningKey="uee_flash_warning_suppressed_v1";
 let saved={};try{const parsed=JSON.parse(localStorage.getItem(storageKey)||"{}");if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))saved=parsed;}catch{}
 let warningSuppressed=false;try{warningSuppressed=localStorage.getItem(warningKey)==="1";}catch{}
 const warningDialog=$("flash-warning-dialog"),pending=[];
 function persist(){try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{}}
 function applyEffect(key,enabled,write=true){root.classList.toggle("effect-"+key,enabled);const control=switches.find(x=>x.dataset.effectToggle===key);if(control)control.checked=enabled;saved[key]=enabled;if(write)persist();}
 function updateWarningStatus(){const node=$("flash-warning-settings-status");if(node)node.textContent=warningSuppressed?"Flashing-effects warning: hidden. Use this control to show it again.":"Flashing-effects warning: shown whenever you try to enable Rainbow Apocalypse or Impact Frame.";}
 function requestEnable(keys){
  const gate=[];keys.forEach(key=>{if(sensitive.includes(key)&&!warningSuppressed)gate.push(key);else applyEffect(key,true,false);});
  if(gate.length){pending.splice(0,pending.length,...gate);const hide=$("flash-warning-never");if(hide)hide.checked=false;if(warningDialog&&!warningDialog.open)warningDialog.showModal();}else persist();
 }
 switches.forEach(control=>{
  const key=control.dataset.effectToggle;let enabled=saved[key]===true;
  if(sensitive.includes(key)&&!warningSuppressed)enabled=false;
  applyEffect(key,enabled,false);
  control.addEventListener("change",()=>{if(control.checked)requestEnable([key]);else applyEffect(key,false,true);});
 });
 if(sensitive.some(key=>saved[key]===true)&&!warningSuppressed)persist();
 $("flash-warning-accept")?.addEventListener("click",()=>{if($("flash-warning-never")?.checked){warningSuppressed=true;try{localStorage.setItem(warningKey,"1");}catch{}}pending.splice(0).forEach(key=>applyEffect(key,true,false));persist();updateWarningStatus();warningDialog?.close();});
 $("flash-warning-cancel")?.addEventListener("click",()=>{pending.splice(0);warningDialog?.close();});
 warningDialog?.addEventListener("cancel",()=>{pending.splice(0);});
 $("flash-warning-reset-button")?.addEventListener("click",()=>{warningSuppressed=false;try{localStorage.removeItem(warningKey);}catch{}updateWarningStatus();});
 $("effects-apply-all")?.addEventListener("click",()=>{const all=switches.map(x=>x.dataset.effectToggle);all.filter(key=>!sensitive.includes(key)).forEach(key=>applyEffect(key,true,false));requestEnable(all.filter(key=>sensitive.includes(key)));persist();});
 $("effects-disable-all")?.addEventListener("click",()=>{switches.forEach(x=>applyEffect(x.dataset.effectToggle,false,false));persist();});
 const impactOverlay=document.querySelector(".fx-impact");
 const pauseHoverMotion=()=>{root.classList.add("effects-pointer-paused");root.classList.remove("screenquake-hovering");};
 document.addEventListener("pointerdown",event=>{if(event.pointerType!=="touch")pauseHoverMotion();root.style.setProperty("--impact-x",Math.round(event.clientX/window.innerWidth*100)+"%");root.style.setProperty("--impact-y",Math.round(event.clientY/window.innerHeight*100)+"%");},{passive:true});
 document.addEventListener("click",()=>{pauseHoverMotion();if(!root.classList.contains("effect-impactframe")||!impactOverlay)return;if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;impactOverlay.classList.remove("impact-hit");void impactOverlay.offsetWidth;impactOverlay.classList.add("impact-hit");},true);
 document.addEventListener("pointermove",event=>{if(event.pointerType==="touch")return;const target=event.target instanceof Element?event.target:null;const overButton=!!target?.closest("button");if(root.classList.contains("effects-pointer-paused")){if(overButton)return;root.classList.remove("effects-pointer-paused");}root.classList.toggle("screenquake-hovering",root.classList.contains("effect-screenquake")&&overButton);});
 document.addEventListener("pointerout",event=>{if(!event.relatedTarget)root.classList.remove("screenquake-hovering","effects-pointer-paused");});
 updateWarningStatus();
})();
// Show the community disclaimer once per browser tab session.
(function setupWelcomeNotice(){
 const overlay=$("welcome-notice"),button=$("notice-continue");
 if(!overlay||!button)return;
 try { if(sessionStorage.getItem("pmvb_notice_accepted")==="1"){overlay.remove();return;} } catch {}
 document.body.classList.add("notice-open");
 button.focus();
 const dismiss=()=>{
  overlay.classList.add("dismissed");
  document.body.classList.remove("notice-open");
  try { sessionStorage.setItem("pmvb_notice_accepted","1"); } catch {}
  window.setTimeout(()=>overlay.remove(),280);
 };
 button.addEventListener("click",dismiss);
 overlay.addEventListener("keydown",event=>{
  if(event.key==="Escape"){event.preventDefault();}
  if(event.key==="Tab"){event.preventDefault();button.focus();}
 });
})();

const ADVANCED_QUESTIONS = [
 {id:"advanced_concept",category:"ADVANCED PROFILE / CORE IDENTITY",title:"Core Character Concept",description:"What is the central idea behind this character? Describe the concept, themes, and the impression you want the character to leave.",freeText:true,inputLabel:"CORE CONCEPT"},
 {id:"advanced_appearance",category:"ADVANCED PROFILE / VISUAL IDENTITY",title:"Appearance & Visual Design",description:"Describe the character's overall appearance: clothing, silhouette, colors, distinguishing details, and any visual motifs.",freeText:true,inputLabel:"APPEARANCE & VISUAL DETAILS"},
 {id:"advanced_personality",category:"ADVANCED PROFILE / PERSONALITY",title:"Personality Profile",description:"Go beyond a broad moral outlook. Describe their temperament, social behavior, habits, strengths, flaws, and how they act under pressure.",freeText:true,inputLabel:"PERSONALITY DETAILS"},
 {id:"advanced_motivation",category:"ADVANCED PROFILE / MOTIVATION",title:"Core Motivation",description:"What does this character actively want, why does it matter to them, and what are they willing to give up to pursue it?",freeText:true,inputLabel:"GOALS & MOTIVATION"},
 {id:"advanced_conflict",category:"ADVANCED PROFILE / INNER CONFLICT",title:"Internal Conflict",description:"What contradiction, fear, unresolved question, or personal struggle makes this character difficult to understand—even to themselves?",freeText:true,inputLabel:"INNER CONFLICT"},
 {id:"advanced_code",category:"ADVANCED PROFILE / PERSONAL PRINCIPLES",title:"Personal Code & Boundaries",description:"What rules does this character try to live by? Which principles are non-negotiable, and what might tempt them to break those rules?",freeText:true,inputLabel:"PERSONAL CODE"},
 {id:"advanced_relationships",category:"ADVANCED PROFILE / CONNECTIONS",title:"Important Relationships — Detailed",description:"Describe the most important people in this character's life. Include names, history, current dynamics, and how those relationships affect their choices.",freeText:true,inputLabel:"RELATIONSHIP DETAILS"},
 {id:"advanced_abilities",category:"ADVANCED PROFILE / CAPABILITIES",title:"Signature Capabilities & Techniques",description:"Describe their distinctive fictional capabilities, signature techniques, limitations, and the visual or thematic identity behind them. Keep the description at a story-design level.",freeText:true,inputLabel:"SIGNATURE CAPABILITIES"},
 {id:"advanced_arc",category:"ADVANCED PROFILE / STORY DIRECTION",title:"Character Arc & Narrative Direction",description:"Where does the character begin, what could challenge or change them, and what kind of future—or unresolved ending—do you envision for them?",freeText:true,inputLabel:"CHARACTER ARC"},
 {id:"advanced_extra_lore",category:"ADVANCED PROFILE / ARCHIVE NOTES",title:"Additional Advanced Lore",description:"Add any other details that deserve a place in the full archive: symbols, recurring motifs, secrets, personal rituals, or connections to other records.",freeText:true,inputLabel:"ADDITIONAL LORE"}
];

let index=0,answers={},characterName="",creationMode="simple",editingOcId=null;
const OC_STORAGE_KEY="uee_oc_archive_v1";
function readOcArchive(){try{const x=JSON.parse(localStorage.getItem(OC_STORAGE_KEY)||"[]");return Array.isArray(x)?x:[];}catch{return [];}}
function writeOcArchive(x){try{localStorage.setItem(OC_STORAGE_KEY,JSON.stringify(x));}catch{}}
function renderOcHistory(){const list=$("oc-history-list");if(!list)return;const rows=readOcArchive();$("oc-count").textContent=rows.length+" SAVED";list.innerHTML="";if(!rows.length){const p=document.createElement("p");p.className="oc-empty";p.textContent="NO CHARACTER RECORDS YET.";list.append(p);return;}rows.slice().reverse().forEach(r=>{const card=document.createElement("article");card.className="oc-history-card";const info=document.createElement("div");info.className="oc-history-info";const name=document.createElement("strong");name.textContent=r.name||"Unnamed Variant";const meta=document.createElement("small");meta.textContent=(r.mode==="advanced"?"ADVANCED":"SIMPLE")+" CREATION · UPDATED "+new Date(r.updatedAt||Date.now()).toLocaleDateString();info.append(name,meta);const actions=document.createElement("div");actions.className="oc-history-actions";const edit=document.createElement("button");edit.type="button";edit.className="secondary-button";edit.textContent="CUSTOMIZE";edit.onclick=()=>loadOcRecord(r.id);const del=document.createElement("button");del.type="button";del.className="text-button";del.textContent="DELETE";del.onclick=()=>{if(!confirm("Delete "+(r.name||"this character")+" from this device?"))return;writeOcArchive(readOcArchive().filter(x=>x.id!==r.id));renderOcHistory();};actions.append(edit,del);card.append(info,actions);list.append(card);});}
function saveCurrentOc(){const rows=readOcArchive();const r={id:editingOcId||("oc_"+Date.now()+"_"+Math.random().toString(36).slice(2,8)),name:characterName,mode:creationMode,answers:JSON.parse(JSON.stringify(answers)),updatedAt:new Date().toISOString()};const i=rows.findIndex(x=>x.id===r.id);if(i<0)rows.push(r);else rows[i]=r;editingOcId=r.id;writeOcArchive(rows);renderOcHistory();}
function loadOcRecord(id){const r=readOcArchive().find(x=>x.id===id);if(!r)return;editingOcId=r.id;characterName=r.name||"";creationMode=r.mode==="advanced"?"advanced":"simple";answers=r.answers&&typeof r.answers==="object"?JSON.parse(JSON.stringify(r.answers)):{};index=0;$("character-name").value=characterName;render();screen("picker");}
function activeQuestions(){return creationMode==="advanced"?[...QUESTIONS,...ADVANCED_QUESTIONS]:QUESTIONS;}
function values(){const v={};for(const q of activeQuestions())if(answers[q.id])v[q.id]=answers[q.id].value;return v;}
function visible(){return activeQuestions().filter(q=>!q.showIf||q.showIf(values()));}
const DOWNSTREAM={
 origin_type:["district","nest_status","backstreet_environment"],
 occupation:["syndicate_fixer_status","syndicate_type","syndicate","finger_rank","syndicate_hierarchy","fixer_grade","color_title","association","association_branch","association_section","association_position","office","wing_role","workshop"],
 fixer_grade:["color_title"],
 association:["association_branch","association_section","association_position"],
 association_branch:["association_section","association_position"],
 association_section:["association_position"],
 syndicate_fixer_status:["fixer_grade","color_title","association","association_branch","association_section","association_position","office"],
  syndicate_type:["syndicate","finger_rank","syndicate_hierarchy"],
  syndicate:["finger_rank","syndicate_hierarchy"],
 ego_status:["ego_equipment_customizer","volatile_ego_state","ego_trigger","ego_form","ego_theme","ego_name","distortion_theme"]
};
function clearDownstream(id){(DOWNSTREAM[id]||[]).forEach(child=>delete answers[child]);}
function pruneHiddenAnswers(){
 let changed=true;
 while(changed){
  changed=false;
  const v=values();
  const allowed=new Set(activeQuestions().filter(q=>!q.showIf||q.showIf(v)).map(q=>q.id));
  for(const id of Object.keys(answers))if(!allowed.has(id)){delete answers[id];changed=true;}
 }
}
function setAnswer(q,choice,value,custom=""){
 const previous=answers[q.id]?.value;
 if(previous!==value)clearDownstream(q.id);
 answers[q.id]={choice,value,custom};
 pruneHiddenAnswers();
}
function screen(n){["home-screen","name-screen","mode-screen","picker-screen","result-screen","simulator-screen"].forEach(id=>$(id).classList.add("hidden"));const active=$(`${n}-screen`);active.classList.remove("hidden","screen-enter");void active.offsetWidth;active.classList.add("screen-enter");window.scrollTo({top:0,behavior:"smooth"});}
function renderSinnerEgo(saved){
  const savedValue=(saved.value&&saved.value.sinner_ego)||"";
  const panel=document.createElement("div");panel.className="loadout-customizer archive-reveal";panel.dataset.egoPath="sinner";
  const note=document.createElement("p");note.className="loadout-note";
  note.textContent=`ABNORMALITY E.G.O. (SINNER-ISSUED) · ${SINNER_EGO_WEAPON_CATALOGUE.length} LIMBUS COMPANY E.G.O. · ONE CATALOGUE: SEARCH BELOW OR ENTER A CUSTOM E.G.O.`;
  panel.append(note);
  const fieldGrid=document.createElement("div");fieldGrid.className="loadout-fields";
  const wrap=document.createElement("div");wrap.className="loadout-field";
  const label=document.createElement("label");label.htmlFor="loadout-sinner_ego";label.textContent="ABNORMALITY E.G.O.";
  const input=document.createElement("input");input.id="loadout-sinner_ego";input.type="search";input.maxLength=180;input.placeholder="Search a Limbus Company E.G.O or enter a custom value";input.setAttribute("list","sinner-ego-suggestions");input.value=savedValue;
  const datalist=document.createElement("datalist");datalist.id="sinner-ego-suggestions";
  SINNER_EGO_WEAPON_CATALOGUE.forEach(item=>{const option=document.createElement("option");option.value=item;datalist.append(option);});
  wrap.append(label,input,datalist);fieldGrid.append(wrap);panel.append(fieldGrid);
  const catalog=document.createElement("details");catalog.className="abno-index";
  const summary=document.createElement("summary");summary.textContent=`OPEN LIMBUS COMPANY E.G.O. ARCHIVE · ${SINNER_EGO_WEAPON_CATALOGUE.length} E.G.O.`;catalog.append(summary);
  const toolbar=document.createElement("div");toolbar.className="abno-toolbar";
  const search=document.createElement("input");search.type="search";search.className="abno-search";search.placeholder="Search every Limbus Company E.G.O…";search.setAttribute("aria-label","Search Limbus Company E.G.O.");toolbar.append(search);catalog.append(toolbar);
  const resultMeta=document.createElement("p");resultMeta.className="abno-result-meta";catalog.append(resultMeta);
  const list=document.createElement("div");list.className="abno-list";catalog.append(list);
  function drawRecords(){
    const term=search.value.trim().toLowerCase();list.innerHTML="";
    const shown=SINNER_EGO_WEAPON_CATALOGUE.filter(name=>`${name} ${SINNER_WEAPON_SOURCES[name]||""}`.toLowerCase().includes(term));
    resultMeta.textContent=`DISPLAYING ${shown.length} / ${SINNER_EGO_WEAPON_CATALOGUE.length} E.G.O. · USE THE ACTION TO SET YOUR E.G.O.`;
    shown.forEach((name,i)=>{
      const card=document.createElement("article");card.className="abno-entry-card";card.style.setProperty("--card-delay",`${Math.min(i,12)*9}ms`);
      const head=document.createElement("div");head.className="abno-entry-head";
      const strong=document.createElement("strong");strong.textContent=name;
      const tag=document.createElement("span");tag.className="abno-source-tag";tag.textContent="LIMBUS COMPANY E.G.O.";
      head.append(strong,tag);card.append(head);
      const gear=document.createElement("p");gear.className="abno-gear-note";
      gear.textContent=SINNER_WEAPON_SOURCES[name]?`SOURCE ABNORMALITY · ${SINNER_WEAPON_SOURCES[name]}`:"SOURCE ABNORMALITY NOT YET CONFIRMED IN THIS ARCHIVE.";
      card.append(gear);
      const actions=document.createElement("div");actions.className="abno-card-actions";
      const use=document.createElement("button");use.type="button";use.className="abno-use-button";use.textContent="USE AS ABNORMALITY E.G.O.";
      use.onclick=()=>{input.value=name;input.focus();use.textContent="ADDED ✓";};
      actions.append(use);card.append(actions);list.append(card);
    });
    if(!shown.length){const empty=document.createElement("p");empty.className="abno-empty";empty.textContent="NO MATCHING E.G.O. TRY A DIFFERENT SEARCH.";list.append(empty);}
  }
  search.addEventListener("input",drawRecords);drawRecords();panel.append(catalog);
  const foot=document.createElement("p");foot.className="catalogue-footnote";
  foot.textContent="This is the E.G.O. the Sinners use. It has a single catalogue: every Limbus Company E.G.O. Source Abnormalities are shown only where confirmed. You can also type a custom E.G.O.";
  panel.append(foot);
  $("choice-list").append(panel);
  $("next-button").classList.remove("hidden");
  const qs=visible();
  $("next-button").innerHTML=index===qs.length-1?'CONFIRM & COMPLETE <span>↗</span>':'SAVE E.G.O. PROFILE <span>→</span>';
  $("custom-wrap").classList.add("hidden");
}
function render(){
 pruneHiddenAnswers();
 const qs=visible();if(index>=qs.length){finish();return;}const q=qs[index],saved=answers[q.id]||{};
 const pickerMain=document.querySelector(".picker-main");if(pickerMain){pickerMain.classList.remove("question-enter");void pickerMain.offsetWidth;pickerMain.classList.add("question-enter");}
 $("page-count").textContent=`PAGE ${String(index+1).padStart(2,"0")} / ${String(qs.length).padStart(2,"0")}`;
 const pct=Math.round((index+1)/qs.length*100);$("progress-percent").textContent=`${pct}%`;$("progress-fill").style.width=`${pct}%`;
 $("step-category").textContent=q.category;$("step-title").textContent=q.title;$("step-description").textContent=typeof q.description==="function"?q.description(values()):q.description;
 $("choice-list").innerHTML="";$("validation-message").textContent="";$("back-button").disabled=false;$("back-button").style.opacity=index===0?".85":"1";
 $("next-button").innerHTML=index===qs.length-1?'CONFIRM & COMPLETE <span>↗</span>':'CONFIRM CUSTOM ANSWER <span>→</span>';
 $("next-button").classList.toggle("hidden",saved.choice!=="Other / custom answer");
 $("custom-label").htmlFor="custom-answer";
 $("custom-answer").classList.remove("hidden");
 $("advanced-answer").classList.add("hidden");
 if(q.freeText){
   $("custom-wrap").classList.remove("hidden");
   $("custom-label").htmlFor="advanced-answer";
   $("custom-label").textContent=q.inputLabel||q.title.toUpperCase();
   $("custom-answer").classList.add("hidden");
   $("advanced-answer").classList.remove("hidden");
   $("advanced-answer").value=saved.value||"";
   $("next-button").classList.remove("hidden");
   $("next-button").innerHTML=index===qs.length-1?'CONFIRM & COMPLETE <span>↗</span>':'SAVE DETAIL & CONTINUE <span>→</span>';
   return;
 }
 if(q.customizer){
   if(egoPathOf(values().ego_status)==="sinner"){renderSinnerEgo(saved);return;}
   const savedLoadout=saved.value||{};
   const egoPath=egoPathOf(values().ego_status);const isLcorp=egoPath==="lobotomy";
   const synergyOptions=getSynergyAbnormalities(values().ego_status);
   const synergyList=isLcorp?"lcorp-synergy-suggestions":"derived-synergy-suggestions";
   const weaponItems=isLcorp?L_CORP_EGO_WEAPON_CATALOGUE:DERIVED_EGO_WEAPON_CATALOGUE;
   const suitOptions=isLcorp?EGO_SUIT_CATALOGUE:[];
   const giftOptions=isLcorp?EGO_GIFT_CATALOGUE:[];
   const fields=[
    {id:"synergy",label:"E.G.O. SYNERGY",hint:"Search an Abnormality or enter a concept",list:synergyList,items:synergyOptions},
    {id:"suit",label:"E.G.O. SUIT",hint:isLcorp?"Search or enter a suit":"Enter a custom suit",list:isLcorp?"suit-suggestions":null,items:suitOptions},
    {id:"category4",label:"E.G.O WEAPON",hint:isLcorp?"Search an L Corp. weapon or enter a custom value":"Search a derived E.G.O or enter a custom value",list:"category4-suggestions",items:weaponItems},
    {id:"gift",label:"E.G.O. GIFT",hint:isLcorp?"Search or enter a Gift":"Enter a custom Gift",list:isLcorp?"gift-suggestions":null,items:giftOptions}
   ];
   const panel=document.createElement("div");panel.className="loadout-customizer archive-reveal";panel.dataset.egoPath=egoPath;
   const note=document.createElement("p");note.className="loadout-note";
   note.textContent=isLcorp
    ?`REFINED LOBOTOMY E.G.O. · ${L_CORP_ABNORMALITIES.length} CURRENT FACILITY RECORDS + ${L_CORP_LEGACY_ONLY_ABNORMALITIES.length} DISTINCT LEGACY RECORDS · ${EGO_SUIT_CATALOGUE.length} DOCUMENTED SUIT NAMES. OUTSIDE-L-CORP. ABNORMALITIES ARE NOT MIXED INTO THIS PATH.`
    :`ABNORMALITY-DERIVED E.G.O. · ${OUTSIDE_L_CORP_ABNORMALITIES.length} OUTSIDE-L-CORP. RECORDS. ORIGINAL L CORP. FACILITY ABNORMALITIES ARE EXCLUDED. SUIT AND GIFT FIELDS ACCEPT CUSTOM ENTRIES IN THIS PATH.`;
   panel.append(note);
   const fieldGrid=document.createElement("div");fieldGrid.className="loadout-fields";
   fields.forEach(field=>{
    const wrap=document.createElement("div");wrap.className="loadout-field";
    const label=document.createElement("label");label.htmlFor=`loadout-${field.id}`;label.textContent=field.label;
    const input=document.createElement("input");input.id=`loadout-${field.id}`;input.type="search";input.maxLength=180;input.placeholder=field.hint;
    if(field.list)input.setAttribute("list",field.list);
    input.value=savedLoadout[field.id]||"";
    const datalist=document.createElement("datalist");if(field.list){datalist.id=field.list;field.items.forEach(item=>{const option=document.createElement("option");option.value=item;datalist.append(option);});}
    wrap.append(label,input);if(field.list)wrap.append(datalist);fieldGrid.append(wrap);
   });
   panel.append(fieldGrid);
   const catalog=document.createElement("details");catalog.className="abno-index";
   const synergyCount=isLcorp?L_CORP_SYNERGY_ABNORMALITIES.length:OUTSIDE_L_CORP_ABNORMALITIES.length;
   const summary=document.createElement("summary");
   summary.textContent=isLcorp
    ?`OPEN L CORP. SYNERGY ARCHIVE · ${L_CORP_ABNORMALITIES.length} CURRENT + ${L_CORP_LEGACY_ONLY_ABNORMALITIES.length} LEGACY`
    :`OPEN OUTSIDE-L-CORP. SYNERGY ARCHIVE · ${OUTSIDE_L_CORP_ABNORMALITIES.length} RECORDS`;
   catalog.append(summary);
   const toolbar=document.createElement("div");toolbar.className="abno-toolbar";
   const search=document.createElement("input");search.type="search";search.className="abno-search";search.placeholder="Search every Abnormality in this E.G.O. path…";search.setAttribute("aria-label","Search this E.G.O. Abnormality catalogue");toolbar.append(search);
   const tabs=document.createElement("div");tabs.className="abno-tabs";
   const filters=isLcorp
    ?[{id:"all",label:`ALL (${synergyCount})`},{id:"current",label:`CURRENT (${L_CORP_ABNORMALITIES.length})`},{id:"legacy",label:`LEGACY (${L_CORP_LEGACY_ONLY_ABNORMALITIES.length})`}]
    :[{id:"outside",label:`OUTSIDE L CORP. (${synergyCount})`}];
   let activeFilter=filters[0].id;
   filters.forEach((filter,i)=>{const button=document.createElement("button");button.type="button";button.className="abno-tab"+(i===0?" active":"");button.textContent=filter.label;button.onclick=()=>{activeFilter=filter.id;tabs.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===button));drawRecords();};tabs.append(button);});
   toolbar.append(tabs);catalog.append(toolbar);
   const resultMeta=document.createElement("p");resultMeta.className="abno-result-meta";catalog.append(resultMeta);
   const list=document.createElement("div");list.className="abno-list";catalog.append(list);
   const recordData=isLcorp
    ?[
      ...L_CORP_ABNORMALITIES.map(name=>({name,group:"current",label:"CURRENT LOBOTOMY CORPORATION RECORD",equipment:Object.assign({},EGO_RECORDS[name]||{},{weapons:L_CORP_WEAPONS_BY_ABNORMALITY[name]||[]}),aliases:L_CORP_LEGACY_ALIASES[name]||[]})),
      ...L_CORP_LEGACY_ONLY_ABNORMALITIES.map(name=>({name,group:"legacy",label:"DISTINCT LEGACY ABNORMALITY",equipment:{weapons:[]},aliases:[]}))
    ]
    :OUTSIDE_L_CORP_ABNORMALITIES.map(name=>({name,group:"outside",label:"OUTSIDE L CORP. · LIMBUS COMPANY ARCHIVE",equipment:{weapons:DERIVED_WEAPONS_BY_ABNORMALITY[name]||[]},aliases:[],related:name==="Skin Prophet"?"Related to Skin Prophecy in the L Corp. archive; retained as a distinct Limbus record.":""}));
   function drawRecords(){
     const term=search.value.trim().toLowerCase();list.innerHTML="";
     const shown=recordData.filter(record=>(activeFilter==="all"||record.group===activeFilter)&&(`${record.name} ${(record.aliases||[]).join(" ")} ${record.label} ${record.equipment.suit||""} ${record.equipment.gift||""} ${(record.equipment.weapons||[]).join(" ")} ${record.related||""}`).toLowerCase().includes(term));
     resultMeta.textContent=`DISPLAYING ${shown.length} / ${recordData.length} RECORDS · USE THE ACTIONS TO SET SYNERGY, SUIT, OR GIFT`;
     shown.forEach((record,i)=>{
       const card=document.createElement("article");card.className="abno-entry-card";card.style.setProperty("--card-delay",`${Math.min(i,12)*9}ms`);
       const head=document.createElement("div");head.className="abno-entry-head";
       const name=document.createElement("strong");name.textContent=record.name;
       const tag=document.createElement("span");tag.className="abno-source-tag";tag.textContent=record.label;
       head.append(name,tag);card.append(head);
       if(record.aliases&&record.aliases.length){const alias=document.createElement("p");alias.className="abno-alias-note";alias.textContent=`ALSO LISTED AS: ${record.aliases.join(" · ")}`;card.append(alias);}
       if(record.related){const related=document.createElement("p");related.className="abno-alias-note";related.textContent=record.related;card.append(related);}
       const equipment=[];
       if(record.equipment.suit)equipment.push(`SUIT · ${record.equipment.suit}`);
       if(record.equipment.gift)equipment.push(`GIFT · ${record.equipment.gift}`);
       if(record.equipment.weapons&&record.equipment.weapons.length)equipment.push(`WEAPON · ${record.equipment.weapons.join(", ")}`);
       const gear=document.createElement("p");gear.className="abno-gear-note";
       gear.textContent=equipment.length?equipment.join("  /  "):"NO CONFIRMED SUIT, GIFT, OR WEAPON ENTRY IN THIS ARCHIVE.";
       card.append(gear);
       const actions=document.createElement("div");actions.className="abno-card-actions";
       const addAction=(label,fieldId,value)=>{
         const use=document.createElement("button");use.type="button";use.className="abno-use-button";use.textContent=label;
         use.onclick=()=>{const field=$(`loadout-${fieldId}`);if(field&&value){field.value=value;field.focus();use.textContent="ADDED ✓";}};
         actions.append(use);
       };
       addAction("USE AS E.G.O. SYNERGY","synergy",record.name);
       if(record.equipment.suit)addAction("USE SUIT","suit",record.equipment.suit);
       if(record.equipment.gift)addAction("USE GIFT","gift",record.equipment.gift);
       (record.equipment.weapons||[]).forEach(w=>addAction(`USE WEAPON · ${w}`,"category4",w));
       card.append(actions);list.append(card);
     });
     if(!shown.length){const empty=document.createElement("p");empty.className="abno-empty";empty.textContent="NO MATCHING RECORDS. TRY A DIFFERENT SEARCH.";list.append(empty);}
   }
   search.addEventListener("input",drawRecords);drawRecords();panel.append(catalog);
   const foot=document.createElement("p");foot.className="catalogue-footnote";
   foot.textContent=isLcorp
    ?"This path covers the original Lobotomy Corporation facility records plus three distinct legacy-only records. Cards show documented Suit/Gift entries where they exist; a blank equipment note means no confirmed entry is included. Old spellings and legacy titles remain searchable aliases."
    :"This path is restricted to Abnormality records outside the original Lobotomy Corporation facility catalogue. Reused L Corp. records are excluded; related but distinct entries such as Skin Prophet remain separate. No L Corp. Suit or Gift suggestions are mixed into this path.";
   panel.append(foot);
   $("choice-list").append(panel);
   $("next-button").classList.remove("hidden");
   $("next-button").innerHTML=index===qs.length-1?'CONFIRM & COMPLETE <span>↗</span>':'SAVE E.G.O. PROFILE <span>→</span>';
   $("custom-wrap").classList.add("hidden");
   return;
 }
 if(q.multiple){const selected=Array.isArray(saved.value)?saved.value:[];const options=typeof q.options==="function"?q.options(values()):q.options;options.forEach((opt,i)=>{const b=document.createElement("button");b.type="button";b.style.setProperty("--choice-delay",Math.min(i,12)*12+"ms");b.className="choice"+(selected.includes(opt)?" selected":"");const m=document.createElement("span");m.className="choice-mark";const t=document.createElement("span");t.textContent=opt;b.append(m,t);if(selected.includes(opt))b.dataset.selected="true";b.onclick=()=>{let next=selected.slice();if(opt==="Other / custom answer")next=next.includes(opt)?[]:[opt];else{next=next.filter(x=>x!=="Other / custom answer");next=next.includes(opt)?next.filter(x=>x!==opt):next.concat(opt);}setAnswer(q,next.includes("Other / custom answer")?"Other / custom answer":"Selected traits",next,saved.custom||"");render();if(next.includes("Other / custom answer"))$("custom-answer").focus();};$("choice-list").append(b);});const custom=selected.includes("Other / custom answer");$("custom-wrap").classList.toggle("hidden",!custom);$("custom-answer").value=saved.custom||"";$("custom-label").textContent="CUSTOM PERSONALITY";$("next-button").classList.remove("hidden");$("next-button").textContent=index===qs.length-1?"CONFIRM & COMPLETE":"SAVE PERSONALITY & CONTINUE";return;}
 const options=typeof q.options==="function"?q.options(values()):q.options;
 options.forEach((opt,optIndex)=>{const b=document.createElement("button");b.type="button";b.style.setProperty("--choice-delay",`${Math.min(optIndex,12)*22}ms`);b.className="choice"+(saved.choice===opt?" selected":"");const mark=document.createElement("span");mark.className="choice-mark";const label=document.createElement("span");label.textContent=opt;b.append(mark,label);if(saved.choice===opt)b.dataset.selected="true";b.onclick=()=>{
   if(opt==="Other / custom answer"){
    [...$("choice-list").children].forEach(x=>{x.classList.remove("selected");delete x.dataset.selected;});
    b.classList.add("selected");b.dataset.selected="true";$("custom-wrap").classList.remove("hidden");$("next-button").classList.remove("hidden");$("custom-answer").focus();
   } else {
    setAnswer(q,opt,opt==="Leave blank for now"?"":opt,"");
    advance();
   }
  };$("choice-list").append(b);});
 $("custom-wrap").classList.toggle("hidden",saved.choice!=="Other / custom answer");$("custom-answer").value=saved.custom||"";$("custom-label").textContent=`CUSTOM ${q.title.toUpperCase()}`;
}
function finish(){
 pruneHiddenAnswers();
 saveCurrentOc();
 $("result-character-name").textContent=characterName||"UNNAMED VARIANT";
 const qs=visible();$("summary-list").innerHTML="";
 const modeRow=document.createElement("div");modeRow.className="summary-row";const modeKey=document.createElement("strong"),modeValue=document.createElement("span");modeKey.textContent="Creation Mode";modeValue.textContent=creationMode==="advanced"?"Advanced Creation":"Simple Creation";modeRow.append(modeKey,modeValue);$("summary-list").append(modeRow);
 const nameRow=document.createElement("div");nameRow.className="summary-row";const nameKey=document.createElement("strong"),nameValue=document.createElement("span");nameKey.textContent="Name";nameValue.textContent=characterName||"Unnamed Variant";nameRow.append(nameKey,nameValue);$("summary-list").append(nameRow);
 qs.forEach(q=>{const row=document.createElement("div");row.className="summary-row";const k=document.createElement("strong"),v=document.createElement("span");k.textContent=q.title;const answer=answers[q.id]?.value;v.textContent=Array.isArray(answer)?(answers[q.id]?.choice==="Other / custom answer"?(answers[q.id]?.custom||"Custom"):answer.join(", ")):answer&&typeof answer==="object"?(answer.sinner_ego!==undefined?`Abnormality E.G.O.: ${answer.sinner_ego||"—"}`:[`Synergy: ${answer.synergy||"—"}`,`Suit: ${answer.suit||"—"}`,`E.G.O Weapon: ${answer.category4||"—"}`,`Gift: ${answer.gift||"—"}`].join(" · ")):answer||"Not specified";row.append(k,v);$("summary-list").append(row);});
 screen("result");
}
function advance(){pruneHiddenAnswers();index++;if(index>=visible().length)finish();else render();}
function submit(){
 const q=visible()[index];
 if(q.freeText){
  const detail=$("advanced-answer").value.trim();
  if(!detail){$("validation-message").textContent="PLEASE ADD A DETAIL BEFORE CONTINUING.";return;}
  setAnswer(q,"Detailed response",detail,detail);advance();return;
 }
 if(q.customizer){
  if(egoPathOf(values().ego_status)==="sinner"){
   const ego=$("loadout-sinner_ego").value.trim();
   if(!ego){$("validation-message").textContent="SEARCH OR ENTER AN E.G.O. BEFORE CONTINUING.";return;}
   setAnswer(q,"Abnormality E.G.O.",{sinner_ego:ego},"");advance();return;
  }
  const loadout={};["synergy","suit","category4","gift"].forEach(id=>loadout[id]=$(`loadout-${id}`).value.trim());
  if(!Object.values(loadout).some(Boolean)){$("validation-message").textContent="ADD AT LEAST ONE SYNERGY, SUIT, E.G.O WEAPON VALUE, OR GIFT.";return;}
  setAnswer(q,"Custom E.G.O. loadout",loadout,"");advance();return;
 }
 if(q.multiple){const selected=Array.isArray(answers[q.id]?.value)?answers[q.id].value:[];if(!selected.length){$("validation-message").textContent="SELECT AT LEAST ONE PERSONALITY TRAIT OR CUSTOM.";return;}if(selected.includes("Other / custom answer")){const custom=$("custom-answer").value.trim();if(!custom){$("validation-message").textContent="PLEASE ENTER A CUSTOM PERSONALITY.";return;}setAnswer(q,"Other / custom answer",["Other / custom answer"],custom);}else setAnswer(q,"Selected traits",selected,"");advance();return;}
 const choice=[...$("choice-list").children].find(b=>b.dataset.selected==="true")?.lastElementChild.textContent;
 if(!choice){$("validation-message").textContent="PLEASE SELECT AN ANSWER BEFORE CONTINUING.";return;}
 let value=choice,custom="";
 if(choice==="Other / custom answer"){custom=$("custom-answer").value.trim();if(!custom){$("validation-message").textContent="PLEASE ENTER YOUR CUSTOM ANSWER.";return;}value=custom;}
 if(choice==="Leave blank for now")value="";
 setAnswer(q,choice,value,custom);advance();
}
function randomizeAll(){
 creationMode="simple";answers={};index=0;
 for(const q of activeQuestions()){
  if(q.showIf&&!q.showIf(values()))continue;
  if(q.customizer){
   const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
   const egoPath=egoPathOf(values().ego_status);const isLcorp=egoPath==="lobotomy";
   const synergyPool=getSynergyAbnormalities(values().ego_status);
   if(egoPath==="sinner"){answers[q.id]={choice:"Abnormality E.G.O.",value:{sinner_ego:pick(SINNER_EGO_WEAPON_CATALOGUE)},custom:""};continue;}
   answers[q.id]={choice:"Custom E.G.O. loadout",value:{synergy:pick(synergyPool),suit:isLcorp?pick(EGO_SUIT_CATALOGUE):"",category4:pick(isLcorp?L_CORP_EGO_WEAPON_CATALOGUE:DERIVED_EGO_WEAPON_CATALOGUE),gift:isLcorp?pick(EGO_GIFT_CATALOGUE):""},custom:""};
   continue;
  }
  const opts=typeof q.options==="function"?q.options(values()):q.options;
  const candidates=opts.filter(o=>!String(o).toLowerCase().includes("custom")&&o!=="Leave blank for now");
  const choice=candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:"Leave blank for now";
  answers[q.id]={choice,value:choice==="Leave blank for now"?"":choice,custom:""};
 }
 pruneHiddenAnswers();
 finish();
}
function summary(){return ["PROJECT MOON VARIANT BUILDER — CHARACTER RECORD",`Name: ${characterName||"Unnamed Variant"}`,`Creation Mode: ${creationMode==="advanced"?"Advanced Creation":"Simple Creation"}`,"Shared setting note: use this builder for original Project Moon-inspired characters and Mirror World variants.","",...visible().map(q=>{const v=answers[q.id]?.value;if(v&&typeof v==="object"&&v.sinner_ego!==undefined)return `${q.title}: Abnormality E.G.O.: ${v.sinner_ego||"Not specified"}`;if(v&&typeof v==="object")return `${q.title}: E.G.O. Synergy: ${v.synergy||"Not specified"}; Suit: ${v.suit||"Not specified"}; E.G.O Weapon: ${v.category4||"Not specified"}; Gift: ${v.gift||"Not specified"}`;return `${q.title}: ${v||"Not specified"}`;})].join("\n");}
$("begin-button").onclick=()=>{ editingOcId=null;answers={}; $("character-name").value=""; $("name-validation").textContent=""; screen("name"); $("character-name").focus(); };
$("name-back").onclick=()=>screen("home");
$("name-continue").onclick=()=>{
 const entered=$("character-name").value.trim();
 if(!entered){$("name-validation").textContent="PLEASE ENTER A NAME TO BEGIN YOUR RECORD."; $("character-name").focus(); return;}
 characterName=entered;screen("mode");
};
$("character-name").addEventListener("keydown",event=>{if(event.key==="Enter")$("name-continue").click();});
$("mode-back").onclick=()=>{ $("character-name").value=characterName;screen("name"); };
function beginSelectedMode(mode){
 creationMode=mode;answers={};editingOcId=null;index=0;render();screen("picker");
}
$("mode-simple").onclick=()=>beginSelectedMode("simple");
$("mode-advanced").onclick=()=>beginSelectedMode("advanced");
$("randomize-button").onclick=()=>{editingOcId=null;randomizeAll();};
renderOcHistory();
$("home-button").onclick=()=>screen("home");
$("back-button").onclick=()=>{if(index>0){index--;render();}else{screen("mode");}};
$("next-button").onclick=submit;
$("edit-button").onclick=()=>{index=0;render();screen("picker");};
$("restart-button").onclick=()=>{answers={};characterName="";creationMode="simple";editingOcId=null;index=0;$("character-name").value="";renderOcHistory();screen("home");};
$("copy-button").onclick=async()=>{try{await navigator.clipboard.writeText(summary());$("copy-status").textContent="SUMMARY COPIED TO CLIPBOARD.";}catch{$("copy-status").textContent="CLIPBOARD UNAVAILABLE. PLEASE COPY MANUALLY.";}}

// MIRROR ARENA: a lightweight fictional OC matchup simulator.
let simMode="1v1",simMatch=null;
const SIM_MODE_INFO={"1v1":{count:2,description:"Two saved OCs enter a one-on-one match.",labels:["TEAM A · FIGHTER 1","TEAM B · FIGHTER 1"]},"2v2":{count:4,description:"Two pairs compete as teams, with teammates able to support each other.",labels:["TEAM A · FIGHTER 1","TEAM A · FIGHTER 2","TEAM B · FIGHTER 1","TEAM B · FIGHTER 2"]},"ffa":{count:4,description:"Three or four OCs compete individually. The last active character wins.",labels:["FREE AGENT 1","FREE AGENT 2","FREE AGENT 3","FREE AGENT 4"]}};
const SIM_DIALOGUE={aloof:["That was your opening?","Wake me when this becomes interesting.","...Predictable."],reserved:["I would rather settle this quickly.","There is no need for a spectacle.","Understood. My turn."],stoic:["I will remain composed.","Noted.","I can continue."],cheerful:["This is getting exciting!","Come on, show me what you can do!","That was a good one!"],sarcastic:["Was that supposed to impress me?","I have seen paperwork more threatening than that.","Lovely. Truly inspired."],analytical:["Your timing is becoming predictable.","I have adjusted my approach.","Interesting pattern."],pragmatic:["Let's keep this efficient.","No wasted movement.","Enough talking. Next exchange."],proud:["Remember who you are facing.","I will not be outdone.","You will have to do better."],cynical:["Of course it came to this.","Nothing ever goes smoothly, does it?","I expected as much."],gentle:["Are you alright? We can take a moment.","I do not want this to go too far.","Let's finish this fairly."],mischievous:["Oh, you fell for that?","I have another surprise.","Try to keep up!"],protective:["Stay behind me. I have this.","I will not let my team down.","I've got your back."],loyal:["We stand together.","I will support you.","Not abandoning this match."],default:["Let's see how this goes.","Your move.","I am not finished yet."]};
const SIM_MOVES=["measured feint","momentum shift","careful pressure","a clean counter","a clever change of pace","a focused flourish"];
const SIM_REACTIONS=["steadies their footing","reconsiders their approach","answers with a guarded stance","takes a breath and regroups","looks for a new opening","shakes off the surprise"];
function simPersonality(record){const p=record.answers?.personality;if(!p)return[];if(p.choice==="Other / custom answer")return[p.custom||"custom"];return Array.isArray(p.value)?p.value:[String(p.value||"")];}
function simQuote(fighter){for(const trait of fighter.personality){const key=String(trait).toLowerCase().split(" ")[0];if(SIM_DIALOGUE[key]){const lines=SIM_DIALOGUE[key];return lines[Math.floor(Math.random()*lines.length)];}}const lines=SIM_DIALOGUE.default;return lines[Math.floor(Math.random()*lines.length)];}
function simSelectCount(){
 const info=SIM_MODE_INFO[simMode];$("sim-participant-count").textContent=simMode==="ffa"?"3–4 FIGHTERS":info.count+" FIGHTERS";$("sim-mode-description").textContent=info.description;
 const records=readOcArchive(),box=$("sim-fighter-selectors");box.innerHTML="";
 info.labels.forEach((label,index)=>{const wrap=document.createElement("label");wrap.className="sim-slot-label";wrap.textContent=label;const select=document.createElement("select");select.dataset.simSlot=String(index);select.setAttribute("aria-label",label);const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="SELECT A SAVED OC";select.append(placeholder);records.forEach(record=>{const opt=document.createElement("option");opt.value=record.id;opt.textContent=record.name||"Unnamed Variant";select.append(opt);});wrap.append(select);box.append(wrap);});
 $("sim-setup-message").textContent=records.length<2?"Save at least two OCs in the creator before starting a match.":records.length<info.count&&simMode!=="1v1"?"You have "+records.length+" saved OCs. Free For All needs at least three; 2v2 needs four.":"";
 $("sim-start-button").disabled=records.length<2;
}
function simSetMode(mode){if(!SIM_MODE_INFO[mode])return;simMode=mode;document.querySelectorAll("[data-sim-mode]").forEach(button=>button.classList.toggle("active",button.dataset.simMode===mode));$("simulator-setup").classList.remove("hidden");$("simulator-match").classList.add("hidden");simSelectCount();}
function simAddLog(kind,speaker,message){const log=$("sim-log"),item=document.createElement("article");item.className="sim-log-entry sim-log-"+kind;const label=document.createElement("span");label.className="sim-log-label";label.textContent=kind==="chat"?"CHARACTER CHAT":kind==="system"?"ARENA RECORD":"INTERACTION";const content=document.createElement("p");content.textContent=speaker?speaker+": "+message:message;item.append(label,content);log.append(item);while(log.children.length>70)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;}
function simRenderArena(){const arena=$("sim-arena-cards");arena.innerHTML="";if(!simMatch)return;simMatch.fighters.forEach(f=>{const card=document.createElement("article");card.className="sim-fighter-card"+(f.alive?"":" sim-fighter-out");const top=document.createElement("div");top.className="sim-fighter-top";const team=document.createElement("span");team.className="sim-team-tag";team.textContent=f.team==="ffa"?"FREE AGENT":"TEAM "+f.team;const state=document.createElement("span");state.className="sim-fighter-state";state.textContent=f.alive?"ACTIVE":"OUT";top.append(team,state);const name=document.createElement("h4");name.textContent=f.name;const traits=document.createElement("p");traits.className="sim-fighter-traits";traits.textContent=f.personality.length?f.personality.join(" · "):"PERSONALITY NOT RECORDED";const hp=document.createElement("div");hp.className="sim-hp-track";const fill=document.createElement("span");fill.style.width=Math.max(0,f.hp)+"%";hp.append(fill);const hpText=document.createElement("div");hpText.className="sim-hp-text";hpText.textContent="STAMINA "+f.hp+" / 100";const status=document.createElement("p");status.className="sim-fighter-status";status.textContent=f.status||"READY";card.append(top,name,traits,hp,hpText,status);arena.append(card);});$("sim-turn-count").textContent="TURN "+String(simMatch.turn).padStart(2,"0");}
function simAlive(){return simMatch.fighters.filter(f=>f.alive);}
function simWinner(){const alive=simAlive();if(simMatch.mode==="ffa")return alive.length<=1?(alive[0]||null):false;const teams=[...new Set(simMatch.fighters.map(f=>f.team))],active=teams.filter(team=>alive.some(f=>f.team===team));return active.length<=1?(active[0]||null):false;}
function simFinish(winner){simMatch.finished=true;$("sim-next-turn-button").disabled=true;$("sim-run-all-button").disabled=true;$("sim-match-status").textContent=winner?(simMatch.mode==="ffa"?winner.name+" WINS THE FREE-FOR-ALL.":"TEAM "+winner+" WINS THE MATCH."):"MATCH ENDED.";$("sim-feed-status").textContent="MATCH COMPLETE";simAddLog("system","",winner?(simMatch.mode==="ffa"?winner.name+" is the last OC standing.":"Team "+winner+" takes the match."):"The match ends in a draw.");$("sim-rematch-button").classList.remove("hidden");simRenderArena();}
function simRunTurn(){
 if(!simMatch||simMatch.finished)return;const active=simAlive();if(active.length<=1){simFinish(active[0]||null);return;}
 const actor=active[Math.floor(Math.random()*active.length)],opponents=active.filter(f=>f.id!==actor.id&&(simMatch.mode==="ffa"||f.team!==actor.team));if(!opponents.length){simFinish(actor.team);return;}
 const target=opponents[Math.floor(Math.random()*opponents.length)],move=SIM_MOVES[Math.floor(Math.random()*SIM_MOVES.length)];simMatch.turn++;
 let impact=9+Math.floor(Math.random()*10);if(Math.random()<.18){impact=Math.max(5,impact-5);target.status="BRACED";}else target.status="REPOSITIONING";target.hp=Math.max(0,target.hp-impact);actor.status="MOMENTUM +";
 simAddLog("action",actor.name,"uses "+move+". "+target.name+" loses "+impact+" stamina.");simAddLog("chat",actor.name,'"'+simQuote(actor)+'"');
 if(target.hp===0){target.alive=false;target.status="MATCH COMPLETE";simAddLog("system","",target.name+" is out of the match.");}else simAddLog("chat",target.name,'"'+SIM_REACTIONS[Math.floor(Math.random()*SIM_REACTIONS.length)]+'."');
 simMatch.fighters.filter(f=>f.team===actor.team&&f.id!==actor.id&&f.alive).forEach(teammate=>{if(Math.random()<.26){teammate.status="SUPPORTING";simAddLog("chat",teammate.name,'"'+simQuote(teammate)+'"');}});
 simRenderArena();const winner=simWinner();if(winner!==false)simFinish(winner);else $("sim-match-status").textContent="TURN "+simMatch.turn+" RESOLVED — NEXT EXCHANGE READY.";
}
function simBuildMatch(ids){const records=readOcArchive(),teamMap=simMode==="1v1"?["A","B"]:simMode==="2v2"?["A","A","B","B"]:["ffa","ffa","ffa","ffa"];const fighters=ids.map((id,index)=>{const record=records.find(r=>r.id===id);return{id:record.id,name:record.name||"Unnamed Variant",team:teamMap[index],hp:100,alive:true,status:"READY",personality:simPersonality(record)};});simMatch={mode:simMode,fighters,turn:0,finished:false,ids:ids.slice()};$("simulator-setup").classList.add("hidden");$("simulator-match").classList.remove("hidden");$("sim-match-title").textContent=simMode==="ffa"?"FREE FOR ALL":simMode.toUpperCase();$("sim-log").innerHTML="";$("sim-feed-status").textContent="MATCH LIVE";$("sim-next-turn-button").disabled=false;$("sim-run-all-button").disabled=false;$("sim-rematch-button").classList.add("hidden");$("sim-match-status").textContent="MATCH INITIALIZED. AWAITING FIRST EXCHANGE.";simRenderArena();simAddLog("system","","Match initialized — "+(simMode==="ffa"?"Free For All":simMode.toUpperCase())+".");fighters.forEach(f=>simAddLog("chat",f.name,'"'+simQuote(f)+'"'));}
function simStart(){const ids=[...document.querySelectorAll("[data-sim-slot]")].map(x=>x.value).filter(Boolean),min=simMode==="ffa"?3:SIM_MODE_INFO[simMode].count;if(ids.length<min){$("sim-setup-message").textContent=simMode==="ffa"?"Choose at least three OCs.":"Choose every fighter slot.";return;}if(new Set(ids).size!==ids.length){$("sim-setup-message").textContent="Choose a different saved OC for each slot.";return;}if(simMode!=="ffa"&&ids.length!==SIM_MODE_INFO[simMode].count){$("sim-setup-message").textContent="Fill every fighter slot before starting.";return;}simBuildMatch(ids);$("sim-setup-message").textContent="";}
function simRematch(){if(simMatch)simBuildMatch(simMatch.ids);}
function simRunAll(){let guard=0;while(simMatch&&!simMatch.finished&&guard<80){simRunTurn();guard++;}if(simMatch&&!simMatch.finished)simFinish(simWinner());}
function transitionDelay(){return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?1:720;}
function openSimulator(){document.body.classList.add("simulator-opening");window.setTimeout(()=>{screen("simulator");document.body.classList.remove("simulator-opening");document.body.classList.add("simulator-entered");simSetMode("1v1");},transitionDelay());}
function closeSimulator(){document.body.classList.remove("simulator-entered");document.body.classList.add("simulator-closing");window.setTimeout(()=>{screen("home");document.body.classList.remove("simulator-closing");document.body.classList.add("home-returning");window.setTimeout(()=>document.body.classList.remove("home-returning"),transitionDelay());},transitionDelay());}
$("open-simulator-button")?.addEventListener("click",openSimulator);
$("simulator-back-button")?.addEventListener("click",closeSimulator);
document.querySelectorAll("[data-sim-mode]").forEach(button=>button.addEventListener("click",()=>simSetMode(button.dataset.simMode)));
$("sim-start-button")?.addEventListener("click",simStart);
$("sim-next-turn-button")?.addEventListener("click",simRunTurn);
$("sim-run-all-button")?.addEventListener("click",simRunAll);
$("sim-rematch-button")?.addEventListener("click",simRematch);
$("sim-create-oc-button")?.addEventListener("click",()=>{document.body.classList.remove("simulator-entered");screen("home");$("begin-button").click();});
