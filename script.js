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


function customLastUnique(options){
 const seen=new Set(),clean=[];
 (Array.isArray(options)?options:[]).forEach(option=>{const key=String(option).trim().toLowerCase();if(!key||seen.has(key))return;seen.add(key);clean.push(option);});
 const custom=clean.filter(option=>String(option).toLowerCase()==="other / custom answer");
 return [...clean.filter(option=>String(option).toLowerCase()!=="other / custom answer"),...custom];
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
{id:"occupation",category:"PROFESSION & AFFILIATION",title:"Primary Occupation",description:"What does this variant principally do for a living? Choose the main affiliation first; an explicit dual-role option is available for Syndicate members who also work as Fixers.",options:["Fixer","Fixer Office employee","Syndicate member","Wing employee (Feather)","Workshop artisan or craftsperson","Association employee","The Head’s direct subordinate","Independent contractor","Researcher / specialist","Other / custom answer"]},
{id:"head_role",category:"PROFESSION & AFFILIATION",title:"Position within the Head’s organization",description:"Choose the character’s recognized role. These are distinct positions within the Head’s hierarchy, not ordinary occupations.",showIf:a=>a.occupation==="The Head’s direct subordinate",options:["Pawn","Arbiter","Claw","Beholder"]},
{id:"syndicate_fixer_status",category:"PROFESSION & AFFILIATION",title:"Additional Fixer Standing",description:"Syndicate membership does not automatically make someone a Fixer. Choose whether this character is only a Syndicate member, also works as a Fixer (an intentional OC dual role), or previously worked as one. This controls whether Fixer record questions appear.",showIf:a=>a.occupation==="Syndicate member",options:["Syndicate member only","Also works as a Fixer (dual role)","Former Fixer (previous career)"]},
{id:"syndicate_type",category:"PROFESSION & AFFILIATION",title:"Syndicate Category",description:"Choose the kind of Syndicate. The Five Fingers are the five major Syndicates; subsidiaries and independent groups are listed separately.",showIf:a=>a.occupation==="Syndicate member",options:["One of the Five Fingers","A Finger subsidiary / affiliate","An independent Syndicate","A custom / lesser-known Syndicate","Unknown / undisclosed"]},
{id:"syndicate",category:"PROFESSION & AFFILIATION",title:"Syndicate / Finger Affiliation",description:a=>a.syndicate_type==="One of the Five Fingers"?"Choose one of the Five Fingers. The next question will show that Finger's known hierarchy.":a.syndicate_type==="A Finger subsidiary / affiliate"?"Choose a known group affiliated with a Finger. The listed affiliations are examples, not an exhaustive roster.":a.syndicate_type==="An independent Syndicate"?"Choose a known independent Syndicate. This list is not exhaustive; custom entries are available.":"Choose or enter the Syndicate this character belongs to.",showIf:a=>!!a.syndicate_type,options:a=>syndicateOptions(a)},
{id:"finger_rank",category:"PROFESSION & AFFILIATION",title:"Finger Hierarchy / Position",description:a=>a.syndicate==="The Pinky"?"The Pinky's internal structure is deliberately obscure. Choose a broad known standing or record a custom title rather than treating unknown details as canon.":a.syndicate==="The Index"?"The Index's known roles include Proselytes, Proxies, and Messengers; the last two are not presented here as a confirmed strict ladder.":"Choose the character's position within the selected Finger, from the lower member ranks to its highest known leadership.",showIf:a=>a.syndicate_type==="One of the Five Fingers"&&!!FINGER_HIERARCHIES[a.syndicate],options:a=>FINGER_HIERARCHIES[a.syndicate]},
{id:"syndicate_hierarchy",category:"PROFESSION & AFFILIATION",title:"Syndicate Position / Hierarchy",description:"These are broad character-building positions for subsidiaries and independent Syndicates. They are not claimed to be universal or confirmed canon ranks; use a custom answer for a group's own title.",showIf:a=>["A Finger subsidiary / affiliate","An independent Syndicate","A custom / lesser-known Syndicate"].includes(a.syndicate_type)&&!!a.syndicate&&a.syndicate!=="Unknown / undisclosed",options:SYNDICATE_HIERARCHY_OPTIONS},
{id:"fixer_grade",category:"PROFESSION & AFFILIATION",title:"Fixer Grade / Former Grade",description:a=>a.syndicate_fixer_status==="Former Fixer (previous career)"?"Record the character's last known Fixer Grade. A Color is a distinct exceptional title, not simply another numbered Grade.":"Fixer Grades are professional classifications. A Color is a distinct exceptional title, not simply another numbered Grade.",showIf:a=>hasFixerTrack(a),options:["Grade 9","Grade 8","Grade 7","Grade 6","Grade 5","Grade 4","Grade 3","Grade 2","Grade 1","Color Fixer","Ungraded / not registered","Unknown / undisclosed"]},
{id:"color_title",category:"PROFESSION & AFFILIATION",title:"Color Title",description:"If this character is or was a Color Fixer, what is their recognized Color and epithet?",showIf:a=>hasFixerTrack(a)&&a.fixer_grade==="Color Fixer",options:["The Red Mist","The Blue Reverberation","The Black Silence","An original Color title","Other / custom answer","Undisclosed"]},
{id:"association",category:"PROFESSION & AFFILIATION",title:"Fixer Association / Previous Association",description:a=>a.syndicate_fixer_status==="Former Fixer (previous career)"?"Record the Association this character previously belonged to, if any. An Association is distinct from a Syndicate.":"Choose the Association this Fixer belongs to. Eleven of the twelve Associations have been named in released material; the twelfth remains unidentified.",showIf:a=>hasFixerTrack(a)||a.occupation==="Association employee",options:ASSOCIATIONS.concat(["Other / custom answer","Unaffiliated Fixer","Unknown / undisclosed"])},
{id:"association_branch",category:"PROFESSION & AFFILIATION",title:"Association Branch",description:"Each Association has four branches, each responsible for a quarter of the City. A Branch Manager oversees the branch.",showIf:a=>!!a.association&&!["Unaffiliated Fixer","Unknown / undisclosed"].includes(a.association),options:CITY_BRANCHES},
{id:"association_position",category:"PROFESSION & AFFILIATION",title:"Association Position",description:"Choose this character's position within the selected Association branch. A Branch Manager oversees the branch; a Director leads a specific Section.",showIf:a=>!!a.association_branch,options:["Branch Manager","Section Director (Director)","Trainee / apprentice","Association member (neither)","Other / custom answer","Unknown / undisclosed"]},
{id:"association_section",category:"PROFESSION & AFFILIATION",title:"Association Section",description:"Each branch is divided into six Sections. Section 1 is the highest and most prestigious; Section 6 is the lowest. Section Directors lead a specific Section; Branch Managers oversee the entire branch.",showIf:a=>!!a.association_branch&&a.association_position!=="Branch Manager",options:ASSOCIATION_SECTIONS},
{id:"office",category:"PROFESSION & AFFILIATION",title:"Fixer Office / Previous Office",description:"Does this variant belong, or did they previously belong, to a particular Fixer Office? An Office is distinct from an Association.",showIf:a=>hasFixerTrack(a),options:["Owns or leads an Office","Member of an established Office","Office manager","Office administrator or clerk","Member of a small independent Office","Works alone without an Office","No longer affiliated with an Office","Other / custom answer"]},
{id:"wing_role",category:"PROFESSION & AFFILIATION",title:"Wing Role",description:"If employed by a Wing, what is this variant's relationship to it?",showIf:a=>a.occupation==="Wing employee (Feather)",options:["Research / technical staff","Administrative employee","Security / enforcement role","Field operative","Executive / management","Ordinary employee","Other / custom answer"]},
{id:"workshop",category:"PROFESSION & AFFILIATION",title:"Workshop Relationship",description:"Workshops produce and maintain the City's equipment and specialized products. What is this variant's connection to one?",showIf:a=>a.occupation==="Workshop artisan or craftsperson"||a.education==="Workshop apprenticeship",options:["Independent craftsperson","Workshop employee","Workshop owner","Workshop family / heir","Workshop engineer","Workshop designer","Workshop repair specialist","Commissioned specialist","Other / custom answer"]},
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

{id:"ego_appearance",category:"E.G.O. & DISTORTION",title:"What Does Your E.G.O. Look Like?",description:"Choose the visual direction of the character's Personal or Volatile E.G.O. Select Other / custom answer to describe a completely original appearance.",showIf:a=>creationMode!=="complex"&&["Personally manifested E.G.O. (Effloresced E.G.O.)","Volatile E.G.O. (unstable manifestation)"].includes(a.ego_status),options:["A tailored ceremonial coat with symbolic embroidery","Layered armor resembling porcelain or fine ceramic","A weathered uniform altered by personal keepsakes","A long mantle or cloak made of drifting, paper-like layers","A refined suit with impossible seams and shifting patterns","A mask or face-covering that reflects the character's inner self","A crown, halo, or ring of floating fragments","A veil of threads, ribbons, or loose fabric","A silhouette formed from shadow and pale light","A set of asymmetrical gauntlets and arm guards","A full-body shell with smooth, sculpted plates","A collection of floating ornaments surrounding the body","A dress or robe with theatrical, stage-like details","A practical outfit transformed by one impossible feature","A form built from glass-like panels and reflections","A form covered in delicate cracks filled with light","A stitched or patchwork exterior with carefully arranged seams","A mechanical-looking frame with symbolic moving parts","A feathered or petal-like mantle","A flowing form resembling smoke, ink, or liquid","A sharp, geometric silhouette with clean lines","A soft, oversized shape that hides most of the original outline","A pair of wings or wing-like structures","A halo of suspended tools, charms, or personal objects","A second silhouette layered over the character's own","A partial manifestation that covers only selected areas","A complete transformation into a symbolic, non-human shape","A translucent outer shell like layered stained glass","A mantle of suspended handwritten pages and ink strokes","A sculpted silhouette of dark stone with luminous seams","A ceremonial uniform with floating insignia and orbiting seals","A mirrored double-layered outfit with delayed reflections","A flowing shroud of pale ash and drifting embers","A crystalline frame with rearranging facets","A star-map cloak with shifting constellations","A woven body of fine chains and interlocking rings","A porcelain mask and segmented ceremonial robes","A living garden of leaves, thorns, and pale blossoms","A veil of black feathers and silver filaments","A polished, statue-like body with hairline fractures","A liquid-metal mantle that ripples without falling","A shadowed silhouette edged by a thin corona of light","A layered stage costume with a shifting theatrical backdrop","A translucent veil with floating glass ornaments","A form assembled from geometric panels that orbit the body","Other / custom answer"]},
{id:"ego_function",category:"E.G.O. & DISTORTION",title:"What Does Your E.G.O. Do?",description:"Choose the broad fictional effect of this Personal or Volatile E.G.O. Select Other / custom answer to describe its unique abilities and limits.",showIf:a=>creationMode==="simple"&&["Personally manifested E.G.O. (Effloresced E.G.O.)","Volatile E.G.O. (unstable manifestation)"].includes(a.ego_status),options:["Creates protective barriers or momentary shelter","Strengthens the user's resolve and defensive presence","Creates temporary copies, echoes, or afterimages","Distorts the user's sense of distance and position","Reveals hidden traces, patterns, or concealed details","Turns memories into visible symbols or projections","Shapes threads, ribbons, or bindings as symbolic constructs","Creates a personal field that changes the surrounding atmosphere","Briefly slows or quickens the user's perception of events","Redirects incoming momentum in a purely fictional way","Creates decoys that draw attention away from allies","Connects nearby allies through a shared protective effect","Transforms light and shadow into symbolic shapes","Stores and releases a limited burst of accumulated momentum","Changes the form or properties of its own manifested tools","Creates temporary platforms, steps, or paths","Disrupts an opponent's concentration or rhythm","Amplifies a chosen emotion into a visible environmental effect","Reinforces the user's stance and resistance to being moved","Creates a short-lived zone that limits movement","Allows the user to shift between several symbolic forms","Projects a memory, promise, or personal ideal into the arena","Separates the user from surrounding distractions","Restores composure and steadies nearby allies","Adapts its effect to a clearly defined personal condition","Its function is deliberately subtle or primarily symbolic","Other / custom answer"]},
{id:"distortion_theme",category:"E.G.O. & DISTORTION",title:"Distortion Theme",description:"If distorted, what craving, fixation, or emotional contradiction does the transformation embody?",showIf:a=>a.ego_status==="Has become a Distortion",options:["A consuming desire","An unresolved regret","A need for recognition","Fear of abandonment","Obsession with control","A fractured sense of identity","Other / custom answer"]},

{id:"moral_outlook",category:"PERSONAL IDENTITY",title:"Moral Outlook",description:"Choose the principles, compromises, and contradictions that shape this individual. Characters can be morally complex without being strictly heroic or villainous.",options:["Pragmatic survivor","Follows a strict personal code","Loyal to chosen people, not institutions","Idealistic but disillusioned","Self-interested without being needlessly cruel","Protective of a particular community","Cynical toward the City's systems","Contradictory and situational","Other / custom answer"]},
{id:"relationships",category:"PERSONAL IDENTITY",title:"Important Relationships",description:"Which relationships most shape this variant's story?",options:["Family or former guardians","Fixer Office colleagues","Association mentor or superior","Syndicate associates","Wing colleagues","Workshop connections","A rival or former opponent","A close friend or confidant","No defining relationship","Other / custom answer"]},
{id:"backstory",category:"FINAL CHARACTER DETAILS",title:"Defining Backstory Event",description:"Choose a broad starting point for the event that most changed this variant's life.",options:["A family legacy or inheritance","A failed Fixer assignment","A Wing-related incident","A Syndicate conflict","A Workshop or technology incident","An Abnormality-related incident","A personal betrayal","A major moral choice","A career-defining achievement","Other / custom answer"]},
{id:"notes",category:"FINAL CHARACTER DETAILS",title:"Additional Lore Notes",description:"Add any important detail that the structured questions did not cover.",options:["Other / custom answer","Leave blank for now"]}
];

const COMBAT_PROFILE_QUESTIONS = [
 {id:"status_infliction",category:"COMBAT PROFILE / ABILITIES & STATUS",title:"Abilities & Status Effects",description:"Choose up to three status effects for this character’s automatically generated abilities. Status potency is divided evenly between your selections.",multiple:true,maxSelections:3,noneOption:"No status effect",options:["No status effect","Burn","Bleed","Rupture","Sinking","Tremor","Fragile","Bind","Paralyze","Poise","Charge","Haste","Protection","Strength","Feeble","Smoke","Fairy","Erosion","Paralysis","Endurance","Disarm","Stagger Protection","Stagger Resistance Down","Persistence","Blood","Nullify Power","Immobilized","Enhance","Weaken","Singleton","Offense Level Up","Offense Level Down","Defense Level Up","Defense Level Down","Damage Up","Damage Down","Coin Power Up","Coin Power Down","Attack Power Up","Attack Power Down","Defense Power Up","Defense Power Down","Ammo","Aggro","Discard","Fanatic","Nails","Talisman","Tremor Burst","Tremor - Scorch","Dark Flame","Butterfly","Echoes of the Manor","Bloodfeast","Charge Barrier","Plus Coin Boost / Drop"]},
 {id:"passive_activation",category:"COMBAT PROFILE / PASSIVES",title:"When Does This Passive Activate?",description:"Choose when the automatically generated passive takes effect.",options:["Always active","At the start of battle","At the start of this character's turn","After taking damage","When below 50% HP","When an ally is knocked out","When E.G.O. manifests","Other / custom answer"]}
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
  if(gate.length){pending.splice(0,pending.length,...gate);gate.forEach(key=>{const control=switches.find(x=>x.dataset.effectToggle===key);if(control)control.checked=false;saved[key]=false;});persist();const hide=$("flash-warning-never");if(hide)hide.checked=false;if(warningDialog&&!warningDialog.open)warningDialog.showModal();}else persist();
 }
 switches.forEach(control=>{
  const key=control.dataset.effectToggle;let enabled=saved[key]===true;
  if(sensitive.includes(key)&&!warningSuppressed)enabled=false;
  applyEffect(key,enabled,false);
  control.addEventListener("change",()=>{if(control.checked)requestEnable([key]);else applyEffect(key,false,true);});
 });
 if(sensitive.some(key=>saved[key]===true)&&!warningSuppressed)persist();
 $("flash-warning-accept")?.addEventListener("click",()=>{if($("flash-warning-never")?.checked){warningSuppressed=true;try{localStorage.setItem(warningKey,"1");}catch{}}pending.splice(0).forEach(key=>applyEffect(key,true,false));persist();updateWarningStatus();warningDialog?.close();});
 $("flash-warning-cancel")?.addEventListener("click",()=>{pending.splice(0);persist();warningDialog?.close();});
 warningDialog?.addEventListener("cancel",()=>{pending.splice(0);persist();});
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
 {id:"advanced_arc",category:"ADVANCED PROFILE / STORY DIRECTION",title:"Character Arc & Narrative Direction",description:"Where does the character begin, what could challenge or change them, and what kind of future—or unresolved ending—do you envision for them?",freeText:true,inputLabel:"CHARACTER ARC"},
 {id:"advanced_extra_lore",category:"ADVANCED PROFILE / ARCHIVE NOTES",title:"Additional Advanced Lore",description:"Add any other details that deserve a place in the full archive: symbols, recurring motifs, secrets, personal rituals, or connections to other records.",freeText:true,inputLabel:"ADDITIONAL LORE"},
 {id:"advanced_ego_function",category:"ADVANCED PROFILE / E.G.O. FUNCTION",title:"What Does Your E.G.O. Do?",description:"Describe the fictional abilities and practical narrative role of this Personal or Volatile E.G.O. Explain what it can do, how its effects appear, what conditions govern it, and what limitations or trade-offs keep it balanced.",showIf:a=>["Personally manifested E.G.O. (Effloresced E.G.O.)","Volatile E.G.O. (unstable manifestation)"].includes(a.ego_status),freeText:true,maxLength:6000,inputLabel:"PERSONAL / VOLATILE E.G.O. ABILITIES"}
];

const COMPLEX_QUESTIONS = [{"id":"complex_01","category":"IDENTITY & SELF-REFERENCE","title":"Names, Aliases & Their Origins","description":"Which names, aliases, titles, or informal labels have followed this character? Explain who uses each one, where it came from, and whether the character accepts it.","freeText":true,"maxLength":6000,"inputLabel":"NAMES, ALIASES & THEIR ORIGINS"},{"id":"complex_02","category":"IDENTITY & SELF-REFERENCE","title":"The Meaning of Their Chosen Name","description":"What meaning does the character personally attach to their name? Does it represent inheritance, reinvention, anonymity, or something else?","freeText":true,"maxLength":6000,"inputLabel":"THE MEANING OF THEIR CHOSEN NAME"},{"id":"complex_03","category":"IDENTITY & SELF-REFERENCE","title":"The Private Self-Portrait","description":"How would the character describe themselves when no audience or reputation is involved? What would they leave out of that description?","freeText":true,"maxLength":6000,"inputLabel":"THE PRIVATE SELF-PORTRAIT"},{"id":"complex_04","category":"IDENTITY & SELF-REFERENCE","title":"The Public Version of Them","description":"What simplified version of this character do strangers, coworkers, or institutions believe in? How accurate is that version?","freeText":true,"maxLength":6000,"inputLabel":"THE PUBLIC VERSION OF THEM"},{"id":"complex_05","category":"IDENTITY & SELF-REFERENCE","title":"Contradictory Labels","description":"Which labels have other people placed on this character that do not comfortably fit? Describe the tension between those labels and their lived identity.","freeText":true,"maxLength":6000,"inputLabel":"CONTRADICTORY LABELS"},{"id":"complex_06","category":"IDENTITY & SELF-REFERENCE","title":"Cultural Inheritance","description":"Which customs, sayings, manners, or traditions did the character inherit from their surroundings, and which have they deliberately kept or rejected?","freeText":true,"maxLength":6000,"inputLabel":"CULTURAL INHERITANCE"},{"id":"complex_07","category":"IDENTITY & SELF-REFERENCE","title":"Language & Personal Vocabulary","description":"Describe the languages, slang, expressions, or unusual word choices that shape how the character communicates. Include words they avoid or overuse.","freeText":true,"maxLength":6000,"inputLabel":"LANGUAGE & PERSONAL VOCABULARY"},{"id":"complex_08","category":"IDENTITY & SELF-REFERENCE","title":"Personal Sensory Associations","description":"Which ordinary sounds, textures, scents, or visual details have strong personal associations for this character? Explain what those associations mean.","freeText":true,"maxLength":6000,"inputLabel":"PERSONAL SENSORY ASSOCIATIONS"},{"id":"complex_09","category":"IDENTITY & SELF-REFERENCE","title":"Clothing Logic & Presentation","description":"Explain why the character chooses their usual clothing and presentation. Consider practicality, habit, status, anonymity, comfort, and symbolism.","freeText":true,"maxLength":6000,"inputLabel":"CLOTHING LOGIC & PRESENTATION"},{"id":"complex_10","category":"IDENTITY & SELF-REFERENCE","title":"Objects They Keep Close","description":"Catalogue the small personal objects the character regularly carries or keeps nearby. Explain the history or practical purpose of each.","freeText":true,"maxLength":6000,"inputLabel":"OBJECTS THEY KEEP CLOSE"},{"id":"complex_11","category":"HISTORY & ENVIRONMENT","title":"The Place They Call Home","description":"Describe the character's current living space, its atmosphere, and the way its arrangement reflects their routines or priorities.","freeText":true,"maxLength":6000,"inputLabel":"THE PLACE THEY CALL HOME"},{"id":"complex_12","category":"HISTORY & ENVIRONMENT","title":"Material Circumstances","description":"How does the character handle money, supplies, repairs, and scarce resources? What habits were shaped by their circumstances?","freeText":true,"maxLength":6000,"inputLabel":"MATERIAL CIRCUMSTANCES"},{"id":"complex_13","category":"HISTORY & ENVIRONMENT","title":"Knowledge They Never Learned","description":"What useful knowledge or ordinary life skill did the character never have the chance to learn? How does that gap affect everyday situations?","freeText":true,"maxLength":6000,"inputLabel":"KNOWLEDGE THEY NEVER LEARNED"},{"id":"complex_14","category":"HISTORY & ENVIRONMENT","title":"A Place That Changed Them","description":"Describe one location that changed how the character sees the world. Focus on its atmosphere, people, and lasting personal meaning.","freeText":true,"maxLength":6000,"inputLabel":"A PLACE THAT CHANGED THEM"},{"id":"complex_15","category":"HISTORY & ENVIRONMENT","title":"An Early Memory","description":"Describe an early memory that still influences the character's understanding of ordinary life. Explain why it remained vivid.","freeText":true,"maxLength":6000,"inputLabel":"AN EARLY MEMORY"},{"id":"complex_16","category":"HISTORY & ENVIRONMENT","title":"A Memory They Interpret Differently Now","description":"Choose an experience whose meaning changed as the character grew older. What did they believe at the time, and what do they understand now?","freeText":true,"maxLength":6000,"inputLabel":"A MEMORY THEY INTERPRET DIFFERENTLY NOW"},{"id":"complex_17","category":"HISTORY & ENVIRONMENT","title":"The Timeline Between Major Events","description":"Describe the quieter periods between major events in the character's life. What changed gradually rather than through a single turning point?","freeText":true,"maxLength":6000,"inputLabel":"THE TIMELINE BETWEEN MAJOR EVENTS"},{"id":"complex_18","category":"HISTORY & ENVIRONMENT","title":"An Unfinished Matter from the Past","description":"What practical, social, or personal matter from the character's past remains unresolved? Why has it stayed unresolved?","freeText":true,"maxLength":6000,"inputLabel":"AN UNFINISHED MATTER FROM THE PAST"},{"id":"complex_19","category":"HISTORY & ENVIRONMENT","title":"Promises, Debts & Inherited Duties","description":"What obligations does the character carry, whether freely accepted or inherited? Explain how they decide which obligations deserve their effort.","freeText":true,"maxLength":6000,"inputLabel":"PROMISES, DEBTS & INHERITED DUTIES"},{"id":"complex_20","category":"HISTORY & ENVIRONMENT","title":"Official Records & Missing Details","description":"If an institution kept a file on this character, what would be accurate, misleading, incomplete, or deliberately absent from it?","freeText":true,"maxLength":6000,"inputLabel":"OFFICIAL RECORDS & MISSING DETAILS"},{"id":"complex_21","category":"INNER MECHANICS","title":"How They Make Difficult Decisions","description":"Describe the character's decision-making process when several choices have meaningful consequences. What information do they seek first?","freeText":true,"maxLength":6000,"inputLabel":"HOW THEY MAKE DIFFICULT DECISIONS"},{"id":"complex_22","category":"INNER MECHANICS","title":"Their Relationship with Uncertainty","description":"How does the character behave when outcomes are unclear and no reliable answer is available? What helps them continue?","freeText":true,"maxLength":6000,"inputLabel":"THEIR RELATIONSHIP WITH UNCERTAINTY"},{"id":"complex_23","category":"INNER MECHANICS","title":"What Holds Their Attention","description":"Which details do they notice that others often overlook? Explain how this habit affects their interpretation of people and situations.","freeText":true,"maxLength":6000,"inputLabel":"WHAT HOLDS THEIR ATTENTION"},{"id":"complex_24","category":"INNER MECHANICS","title":"Emotions They Show Indirectly","description":"How does the character communicate feelings without directly naming them? Describe gestures, routines, changes in speech, or other subtle signals.","freeText":true,"maxLength":6000,"inputLabel":"EMOTIONS THEY SHOW INDIRECTLY"},{"id":"complex_25","category":"INNER MECHANICS","title":"How They Regain Composure","description":"After an exhausting or emotionally difficult day, what helps the character return to a steady state? Which methods do not work for them?","freeText":true,"maxLength":6000,"inputLabel":"HOW THEY REGAIN COMPOSURE"},{"id":"complex_26","category":"INNER MECHANICS","title":"The Purpose of Their Humor","description":"What kind of humor does the character use, and when? Explain whether humor creates distance, eases tension, communicates affection, or serves another purpose.","freeText":true,"maxLength":6000,"inputLabel":"THE PURPOSE OF THEIR HUMOR"},{"id":"complex_27","category":"INNER MECHANICS","title":"How They Respond to Embarrassment","description":"How does the character react when corrected, misunderstood, or embarrassed in front of others? What do they do after the moment has passed?","freeText":true,"maxLength":6000,"inputLabel":"HOW THEY RESPOND TO EMBARRASSMENT"},{"id":"complex_28","category":"INNER MECHANICS","title":"The Process of Building Trust","description":"What repeated actions persuade this character that someone is reliable? What makes trust grow slowly rather than all at once?","freeText":true,"maxLength":6000,"inputLabel":"THE PROCESS OF BUILDING TRUST"},{"id":"complex_29","category":"INNER MECHANICS","title":"Privacy & Personal Boundaries","description":"Which parts of their life do they consider private? Describe how they communicate boundaries and what happens when those boundaries are ignored.","freeText":true,"maxLength":6000,"inputLabel":"PRIVACY & PERSONAL BOUNDARIES"},{"id":"complex_30","category":"INNER MECHANICS","title":"How They Make Amends","description":"When the character causes a problem or lets someone down, what does making amends look like in practice? What makes an apology meaningful to them?","freeText":true,"maxLength":6000,"inputLabel":"HOW THEY MAKE AMENDS"},{"id":"complex_31","category":"INNER MECHANICS","title":"Small Rituals & Repeated Habits","description":"Describe a recurring ritual the character performs even when nobody is watching. Explain how it began and why it continues.","freeText":true,"maxLength":6000,"inputLabel":"SMALL RITUALS & REPEATED HABITS"},{"id":"complex_32","category":"INNER MECHANICS","title":"Taste, Comfort & Aesthetic Preference","description":"What kinds of food, music, art, surroundings, or everyday comforts does the character gravitate toward? What do those preferences reveal?","freeText":true,"maxLength":6000,"inputLabel":"TASTE, COMFORT & AESTHETIC PREFERENCE"},{"id":"complex_33","category":"INNER MECHANICS","title":"Interests Outside Their Work","description":"What subjects or activities interest the character when they are not fulfilling a duty or pursuing a goal? How did these interests develop?","freeText":true,"maxLength":6000,"inputLabel":"INTERESTS OUTSIDE THEIR WORK"},{"id":"complex_34","category":"INNER MECHANICS","title":"What Their Mind Does in Quiet Moments","description":"When nothing urgent demands attention, where do their thoughts tend to wander? Describe the topics, questions, or observations that recur.","freeText":true,"maxLength":6000,"inputLabel":"WHAT THEIR MIND DOES IN QUIET MOMENTS"},{"id":"complex_35","category":"INNER MECHANICS","title":"Rest, Fatigue & Personal Pace","description":"What does genuine rest look like for this character? Describe how they recognize fatigue and how their pace changes when they are tired.","freeText":true,"maxLength":6000,"inputLabel":"REST, FATIGUE & PERSONAL PACE"},{"id":"complex_36","category":"INNER MECHANICS","title":"Their Relationship with Silence","description":"Does silence feel comfortable, awkward, useful, or revealing to this character? Describe how their response changes depending on who is present.","freeText":true,"maxLength":6000,"inputLabel":"THEIR RELATIONSHIP WITH SILENCE"},{"id":"complex_37","category":"INNER MECHANICS","title":"Sources of Comfort & Discomfort","description":"Which ordinary environments or situations help the character feel settled, and which make it difficult to concentrate? Keep the answer grounded in personal experience.","freeText":true,"maxLength":6000,"inputLabel":"SOURCES OF COMFORT & DISCOMFORT"},{"id":"complex_38","category":"INNER MECHANICS","title":"Personal Space & Shared Spaces","description":"How does the character behave in private rooms, crowded public spaces, and another person's home? What rules do they follow without thinking?","freeText":true,"maxLength":6000,"inputLabel":"PERSONAL SPACE & SHARED SPACES"},{"id":"complex_39","category":"INNER MECHANICS","title":"Fairness, Payment & Exchange","description":"How does the character decide what is fair when goods, services, favors, or time are exchanged? Which exceptions do they make?","freeText":true,"maxLength":6000,"inputLabel":"FAIRNESS, PAYMENT & EXCHANGE"},{"id":"complex_40","category":"INNER MECHANICS","title":"Their Relationship with Technology","description":"How comfortable is the character with devices, augmentations, and unfamiliar technology? Describe their habits without treating technical skill as their entire identity.","freeText":true,"maxLength":6000,"inputLabel":"THEIR RELATIONSHIP WITH TECHNOLOGY"},{"id":"complex_41","category":"E.G.O. & TRANSFORMATION","title":"Manifestation Classification","description":"What is this character's current relationship with E.G.O. or Distortion? Choose the closest description; use a custom answer for an unusual Mirror World condition.","options":["No known E.G.O. or Distortion","Personally manifested E.G.O.","Volatile E.G.O.","Has become a Distortion","Abnormality-derived E.G.O. equipment","Sinner-issued Abnormality E.G.O.","Refined Lobotomy E.G.O. equipment","Other / custom answer","Unknown / undisclosed"]},{"id":"complex_42","category":"E.G.O. & TRANSFORMATION","title":"Emotional and Symbolic Axis","description":"Which central theme most strongly shapes the character's possible transformation or manifested identity? Choose one broad axis.","options":["Identity and selfhood","Freedom and confinement","Memory and regret","Ambition and recognition","Love and attachment","Isolation and alienation","Order and control","Change and acceptance","Other / custom answer"]},{"id":"complex_43","category":"E.G.O. & TRANSFORMATION","title":"Manifestation Title","description":"Give the character's Personal E.G.O. or transformation a title. It can be poetic, symbolic, plain, unsettling, or deliberately ambiguous.","freeText":true,"maxLength":6000,"inputLabel":"MANIFESTATION TITLE"},{"id":"complex_44","category":"E.G.O. & TRANSFORMATION","title":"What Does Your E.G.O. Look Like?","description":"Describe the complete visual appearance of this character's Personal or Volatile E.G.O., including silhouette, materials, colors, textures, symbols, and how the manifestation changes the character's outline.","freeText":true,"maxLength":6000,"inputLabel":"PERSONAL / VOLATILE E.G.O. APPEARANCE"},{"id":"complex_45","category":"E.G.O. & TRANSFORMATION","title":"Conditions for Manifestation","description":"Describe the fictional circumstances under which the character would choose or be able to manifest this form. Include what makes the moment significant.","freeText":true,"maxLength":6000,"inputLabel":"CONDITIONS FOR MANIFESTATION"},{"id":"complex_46","category":"E.G.O. & TRANSFORMATION","title":"Costs, Boundaries & Aftereffects","description":"What narrative limitations, trade-offs, or aftereffects accompany the manifestation? Explain what prevents it from being a consequence-free solution.","freeText":true,"maxLength":6000,"inputLabel":"COSTS, BOUNDARIES & AFTEREFFECTS"},{"id":"complex_47","category":"PRACTICE & PROFESSIONAL IDENTITY","title":"Rhythm of a Fictional Confrontation","description":"Describe the character's preferred pace and decision rhythm in fictional confrontations. Focus on style, temperament, and storytelling rather than real-world instructions.","freeText":true,"maxLength":6000,"inputLabel":"RHYTHM OF A FICTIONAL CONFRONTATION"},{"id":"complex_48","category":"PRACTICE & PROFESSIONAL IDENTITY","title":"Their Role in a Group","description":"When working with others, what role do they naturally take? Explain how they support, challenge, or complicate a group's decisions.","freeText":true,"maxLength":6000,"inputLabel":"THEIR ROLE IN A GROUP"},{"id":"complex_head_role","category":"AFFILIATION / THE HEAD","title":"Position in the Head’s Organization","description":"Optional: if this character serves the Head directly, select their position. Leave this blank or choose Not affiliated if this does not apply.","options":["Not affiliated with the Head","Pawn","Arbiter","Claw","Beholder","Other / custom answer"],"optional":true},{"id":"complex_49","category":"PRACTICE & PROFESSIONAL IDENTITY","title":"How They Relate to Their Surroundings","description":"Describe how the character adapts their fictional approach to different environments, from familiar spaces to unfamiliar ones.","freeText":true,"maxLength":6000,"inputLabel":"HOW THEY RELATE TO THEIR SURROUNDINGS"},{"id":"complex_50","category":"PRACTICE & PROFESSIONAL IDENTITY","title":"Their Professional Signature","description":"What recognizable habits, standards, or details distinguish the character's work from that of other people in the same profession?","freeText":true,"maxLength":6000,"inputLabel":"THEIR PROFESSIONAL SIGNATURE"},{"id":"complex_51","category":"PRACTICE & PROFESSIONAL IDENTITY","title":"How They Learned Their Craft","description":"Trace the character's learning process: early influences, mistaken assumptions, useful mentors, and the moment they began developing an individual style.","freeText":true,"maxLength":6000,"inputLabel":"HOW THEY LEARNED THEIR CRAFT"},{"id":"complex_52","category":"PRACTICE & PROFESSIONAL IDENTITY","title":"What Failure Taught Them","description":"Describe a past failure that changed how the character prepares, communicates, or judges their own work. What lesson did they take from it?","freeText":true,"maxLength":6000,"inputLabel":"WHAT FAILURE TAUGHT THEM"},{"id":"complex_53","category":"PRACTICE & PROFESSIONAL IDENTITY","title":"Improvisation & Adaptability","description":"When plans change unexpectedly, what parts of the character's approach remain consistent and what parts are flexible? Give a story-oriented example.","freeText":true,"maxLength":6000,"inputLabel":"IMPROVISATION & ADAPTABILITY"},{"id":"complex_54","category":"PRACTICE & PROFESSIONAL IDENTITY","title":"Performance Under Prolonged Pressure","description":"Describe how the character's priorities, communication, and judgment shift during a long period of demanding work. What signs reveal that the pressure is accumulating?","freeText":true,"maxLength":6000,"inputLabel":"PERFORMANCE UNDER PROLONGED PRESSURE"},{"id":"complex_55","category":"PRACTICE & PROFESSIONAL IDENTITY","title":"Rivalry as a Social Dynamic","description":"What kind of rival brings out an interesting side of this character? Describe the mutual recognition, disagreement, or unfinished question between them.","freeText":true,"maxLength":6000,"inputLabel":"RIVALRY AS A SOCIAL DYNAMIC"},{"id":"complex_56","category":"WORLD & NARRATIVE POSITION","title":"Their Place in a Social Network","description":"Describe the character's wider circle of acquaintances, professional contacts, neighbors, and distant connections. How do these less intimate ties shape their life?","freeText":true,"maxLength":6000,"inputLabel":"THEIR PLACE IN A SOCIAL NETWORK"},{"id":"complex_57","category":"WORLD & NARRATIVE POSITION","title":"Their View of the City's Systems","description":"Which everyday systems or institutions shape the character's choices most strongly? Describe the ways they cooperate with, depend on, or work around those systems.","freeText":true,"maxLength":6000,"inputLabel":"THEIR VIEW OF THE CITY'S SYSTEMS"},{"id":"complex_58","category":"WORLD & NARRATIVE POSITION","title":"Cultural Contradictions They Live With","description":"What parts of the world around them do they accept despite disagreeing with them? Describe the compromises, adaptations, or quiet refusals involved.","freeText":true,"maxLength":6000,"inputLabel":"CULTURAL CONTRADICTIONS THEY LIVE WITH"},{"id":"complex_59","category":"WORLD & NARRATIVE POSITION","title":"A Scene That Captures Their Essence","description":"Write a small scene that reveals the character through an ordinary decision, conversation, or moment of observation. It does not need to be a major plot event.","freeText":true,"maxLength":6000,"inputLabel":"A SCENE THAT CAPTURES THEIR ESSENCE"},{"id":"complex_60","category":"WORLD & NARRATIVE POSITION","title":"The Final Note in Their Dossier","description":"What important detail has not fit anywhere else in this profile? Add a final observation, unanswered question, recurring image, or piece of context that completes the record.","freeText":true,"maxLength":6000,"inputLabel":"THE FINAL NOTE IN THEIR DOSSIER"},{"id":"complex_61","category":"E.G.O. & TRANSFORMATION","title":"What Does Your E.G.O. Do?","description":"Manually describe the fictional abilities and narrative function of this character's Personal or Volatile E.G.O. Explain its effects, conditions, range or scope, limitations, and what makes its abilities an expression of the character's psyche.","freeText":true,"maxLength":6000,"inputLabel":"PERSONAL / VOLATILE E.G.O. ABILITIES"}];

let index=0,answers={},characterName="",creationMode="simple",editingOcId=null;
let sephrusBrokenClickCount=0,sephrusEscapeRunning=false;
const OC_STORAGE_KEY="uee_oc_archive_v1";
function readOcArchive(){try{const x=JSON.parse(localStorage.getItem(OC_STORAGE_KEY)||"[]");return Array.isArray(x)?x:[];}catch{return [];}}
function writeOcArchive(x){try{localStorage.setItem(OC_STORAGE_KEY,JSON.stringify(x));}catch{}}

function profileAnswerText(value){
 if(value==null)return "";
 if(Array.isArray(value))return value.map(profileAnswerText).filter(Boolean).join(", ");
 if(typeof value==="object"){
  if(value.sinner_ego!==undefined)return value.sinner_ego||"";
  const parts=[value.synergy&&"Synergy: "+value.synergy,value.suit&&"Suit: "+value.suit,value.category4&&"E.G.O. Weapon: "+value.category4,value.gift&&"Gift: "+value.gift].filter(Boolean);
  return parts.join("; ");
 }
 return String(value).trim();
}
function profileFieldsFromAnswers(a){
 const get=id=>{
  const item=a[id];
  if(!item)return "";
  if(item.choice==="Other / custom answer"&&item.custom)return String(item.custom).trim();
  return profileAnswerText(item.value??item.custom);
 };
 const first=(...ids)=>ids.map(get).find(Boolean)||"";
 const combine=(...ids)=>[...new Set(ids.map(get).filter(value=>value&&value!=="Not affiliated with the Head"))].join(" · ");
 const detailText=first("dossier_details","profile_details","advanced_abilities","complex_abilities");
 const labelled=(label,source=detailText)=>{
  if(!source)return "";
  const labels=["Name","Title","Race","Affiliation","Grade","Appearance","Origin","E.G.O Type","E.G.O","Ability 1","Ability 2","Ability 3","Ability 4","Ultimate Ability 1","Ultimate Ability 2","Passive Ability 2","Passive Ability","Personality","Backstory","Likes","Dislikes","Overall"];
  const lines=String(source).split(/\r?\n/);
  const index=lines.findIndex(line=>line.trim().toLowerCase().startsWith(label.toLowerCase()+":"));
  if(index<0)return "";
  const firstLine=lines[index].trim().slice(label.length+1).trim();
  const body=[firstLine];
  for(let i=index+1;i<lines.length;i++){
   const current=lines[i].trim();
   if(labels.some(name=>current.toLowerCase().startsWith(name.toLowerCase()+":")))break;
   body.push(lines[i]);
  }
  return body.join("\n").trim();
 };
 return {get,first,combine,detailText,labelled};
}
function generatedPick(items){return items[Math.floor(Math.random()*items.length)];}
function putGenerated(target,id,value){if(!target[id]||!profileAnswerText(target[id].value??target[id].custom).trim())target[id]={choice:"Generated character detail",value,custom:""};}
function factionOutfit(a){
 const synd=(a.syndicate||"").toLowerCase(),rank=(a.finger_rank||a.syndicate_hierarchy||"").toLowerCase();
 if(synd.includes("middle")){
  if(rank.includes("great")||rank.includes("big"))return "Middle Syndicate formal combat attire, elevated for a senior sibling: a sharply tailored dark suit-coat with the Middle's recognizable red detailing, polished formal layers, reinforced gloves, and insignia. The cut, ornament, and personal accessories are distinctive to this senior member, while the overall silhouette remains unmistakably Middle.";
  return "Classic Middle Syndicate attire: a formal dark suit with the Finger's recognizable red accents, crisp shirt and tie, tailored trousers, polished footwear, and practical gloves. Personal tailoring and small accessories distinguish the wearer without abandoning the Middle's established design.";
 }
 if(synd.includes("thumb"))return "Thumb-affiliated formal uniform: disciplined, sharply structured dark attire with clear rank-conscious tailoring, gloves, and restrained insignia; personal details vary while preserving the group's formal military character.";
 if(synd.includes("index"))return "Index attire: layered, practical robes and uniform-like garments with a deliberately austere silhouette, suitable for carrying out the Prescripts; individual wear and accessories distinguish the member.";
 if(synd.includes("ring"))return "Ring attire: expressive, artistically composed clothing with deliberate layering, unusual textures, and a crafted silhouette; the design reflects the Ring's artistic identity while remaining individual.";
 if(synd.includes("pinky"))return "Pinky attire: understated, carefully tailored clothing with discreet personal and rank details; the design remains deliberately restrained and avoids inventing undisclosed official insignia.";
 if(a.occupation==="The Head’s direct subordinate"||a.head_role||a.complex_head_role)return "A severe, immaculate uniform reflecting service to the Head, with restrained institutional insignia and a silhouette appropriate to the character’s selected office: "+(a.head_role||a.complex_head_role||"an undisclosed role")+".";
 if(a.association)return "Association uniform based on "+a.association+": a professional, role-appropriate uniform with the Association's established practical identity, recognizable insignia, and individualized tailoring.";
 if(a.occupation==="Wing employee (Feather)")return "Wing employee attire: corporate or facility uniform appropriate to the character's role, with restrained company identifiers, practical layers, and personal modifications.";
 if(a.occupation==="Workshop artisan or craftsperson")return "Workshop attire: durable workwear adapted to the craft, with reinforced sleeves, practical fastenings, tool loops, and personalized workshop details.";
 return "An original City-appropriate combat ensemble: formal, practical layers, a distinctive coat or jacket, reinforced gloves and footwear, and details reflecting the character's profession and personal history.";
}
function completeGeneratedCharacter(name,source){
 const a=source||{},v=Object.fromEntries(Object.entries(a).map(([k,x])=>[k,x?.value??x?.custom??""]));
 const egoTheme=v.ego_theme||v.distortion_theme||"identity and selfhood";
 const combat=v.combat_approach||"adaptive and opportunistic";
 const origin=[v.origin_type,v.district,v.upbringing,v.backstreet_environment].filter(Boolean).join(", ")||"the City";
 const affiliation=[v.association,v.syndicate,v.office,v.workshop,v.wing_role,v.head_role,v.complex_head_role,v.occupation].filter(x=>x&&x!=="Not affiliated with the Head").join(" / ")||"Independent";
 const rank=v.head_role||v.complex_head_role||v.finger_rank||v.syndicate_hierarchy||v.association_position||v.fixer_grade||"Unclassified";
 const sephrus=String(name||"").trim().toLowerCase()==="sephrus aztiluth";
 const canonicalAppearance="Tall, approximately 190.5 cm, with a lean peak-human physique and pale complexion. Messy, layered black hair frames sharp, delicate features; flawless skin, slightly pointed canines, and half-lidded eyes complete his distinctive appearance. He wears a white collared shirt beneath an unbuttoned black trench coat, slim black trousers, and maintains an apathetic expression. No alternate appearance or augmentations are introduced.";
 const canonicalPersonality="Aloof, composed, observant, analytical, pragmatic, and calculating. Reserved and solitary, he is morally gray rather than inherently good or evil. He values originality and the act of creating things. His fundamental mindset, identity, and personality remain consistent across every variant.";
 const outfit=factionOutfit(v);
 putGenerated(a,"generated_title",generatedPick(["The Unwritten Oath","The Quiet Arbiter","The Last Witness","The Gilded Exile","The Hollow Crown","The Unbroken Thread","The Ashen Virtuoso","The Nameless Vow"]));
 putGenerated(a,"generated_race",v.race||"Human");
 putGenerated(a,"generated_appearance",sephrus?canonicalAppearance:outfit+" The ensemble's materials, fit, insignia, and accessories are personalized to the character's position and history.");
 const egoAbsent=String(v.ego_status||"").includes("No known");
 const egoName=v.ego_name||generatedPick(["Axiom of Ash","The Last Refrain","Crown of Unspoken Names","A Theatre Without Applause","The Shape of What Remains"]);
 if(!egoAbsent)putGenerated(a,"generated_ego_name",egoName);
 const motifs=String(egoTheme).split(/\s+/).slice(0,3).join(" ");
putGenerated(a,"generated_passive_2",generatedPick(["Quiet Continuance — Maintains composure through difficult circumstances, allowing the character to remain deliberate under pressure.","Residual Instinct — Retains awareness of shifting circumstances and adjusts their approach when the situation changes.","Measured Resolve — Remains focused when plans falter, preserving clarity and coordination."]));
 const abilityNames=["Measured Reprisal","Shifting Measure","Witness Mark","Final Cadence"];
 abilityNames.forEach((abilityName,index)=>{
  a["generated_ability_"+(index+1)]={choice:"Generated character detail",value:abilityName,custom:""};
 });
 const ultimateNames=["Nocturne of the Unbroken","The Final Unmasking"];
 ultimateNames.forEach((abilityName,index)=>{
  a["generated_ultimate_"+(index+1)]={choice:"Generated character detail",value:abilityName,custom:""};
 });
 a.generated_passive={choice:"Generated character detail",value:"Composure of the Unfinished",custom:""};
 if(![v.advanced_concept,v.advanced_motivation,v.advanced_conflict,v.backstory,v.complex_15,v.complex_59].some(value=>String(value||"").trim()))putGenerated(a,"generated_backstory","Raised in "+origin+", this variant learned to survive by reading people and recognizing the consequences behind seemingly small choices. A defining moral decision reshaped their priorities and led them toward "+affiliation+". Their current standing ("+rank+") offers influence and obligations, but does not settle the contradictions they carry.");
 if(![v.likes,v.complex_32,v.complex_33].some(value=>String(value||"").trim()))putGenerated(a,"generated_likes",generatedPick(["Quiet libraries, carefully prepared tea, old orchestral recordings, and people who keep their promises","Rain against windows, intricate craftsmanship, formal attire, and thoughtful conversation","Antique books, orderly rooms, subtle humor, and well-made objects","Late-night city lights, refined cuisine, handwritten notes, and dependable companions"]));
 if(![v.dislikes,v.complex_37,v.complex_29].some(value=>String(value||"").trim()))putGenerated(a,"generated_dislikes",generatedPick(["Careless promises, needless cruelty, loud self-importance, and being treated as a possession","Wastefulness, public humiliation, broken agreements, and false authority","Intrusive questions, deliberate dishonesty, and avoidable collateral damage","Condescension, performative loyalty, and having choices made for them"]));
 putGenerated(a,"generated_overall","A "+rank+" "+affiliation+" variant shaped by "+origin+". Their "+(egoAbsent?"lack of a known E.G.O.":"E.G.O., "+egoName)+" and "+combat.toLowerCase()+" approach reflect a complicated individual whose identity is defined by deliberate choices and accepted consequences.");
 if(sephrus){
  putGenerated(a,"generated_title","The Same Essence");
  putGenerated(a,"generated_race",v.race||"Human");
  putGenerated(a,"generated_appearance",canonicalAppearance);
  putGenerated(a,"generated_personality",canonicalPersonality);
  a.generated_personality={choice:"Generated character detail",value:canonicalPersonality,custom:""};
  a.generated_passive_2={choice:"Generated character detail",value:"Una Eademque Essentia — One and the Same Essence. Across infinite Mirror Worlds, every Sephrus is the same individual living through different circumstances. Their lives, histories, affiliations, and choices may diverge, yet their fundamental identity and essence remain one. Each is distinct in experience, never truly different in who they are; neither inherently good nor evil, each remains morally gray.",custom:""};
 }
}
function formatWeaponLoadout(value){
 if(!value||typeof value!=="object")return "Not specified.";
 return [value.style,value.weapon,value.ammoType&&"Profile: "+value.ammoType,value.ammo&&"Ammo: "+value.ammo,value.custom].filter(Boolean).join(" · ")||"Not specified.";
}
function formatCharacterDossier(name,mode,answersSource){
 const a=answersSource||{},f=profileFieldsFromAnswers(a),{get,first,combine,labelled}=f;
 const notSet="Not specified."; const lazyField=(label)=>labelled(label);
 const title=lazyField("Title")||labelled("Title")||first("title","epithet","color_title","generated_title")||notSet;
 const race=lazyField("Race")||labelled("Race")||first("race","species","complex_race","generated_race")||notSet;
 const occupation=first("occupation","complex_occupation");
 const affiliation=lazyField("Affiliation")||labelled("Affiliation")||combine("affiliation","association","office","syndicate","workshop","wing_role","head_role","complex_head_role")||occupation||notSet;
 const grade=lazyField("Grade")||labelled("Grade")||combine("fixer_grade","finger_rank","syndicate_hierarchy","association_position","head_role","complex_head_role")||first("grade","classification")||notSet;
  const isSephrus=String(name||"").trim().toLowerCase()==="sephrus aztiluth";
  const appearance=lazyField("Appearance")||(isSephrus?first("generated_appearance"):labelled("Appearance"))||combine("advanced_appearance","appearance","complex_09","augmentation","generated_appearance","ego_appearance","advanced_ego_appearance","complex_44")||notSet;
 const origin=lazyField("Origin")||labelled("Origin")||combine("origin_type","district","upbringing","backstreet_environment","complex_14")||notSet;
 const egoStatus=first("ego_status","complex_41");
 const egoName=first("ego_name","complex_43","generated_ego_name");
 const egoLoadout=get("ego_equipment_customizer");
 const egoAppearance=first("ego_appearance","advanced_ego_appearance","complex_44");
 const egoFunction=first("ego_function","advanced_ego_function","complex_61");
 let egoType=lazyField("E.G.O Type")||"Not specified.";
 if(egoStatus.includes("Personally manifested"))egoType="Personal E.G.O.";
 else if(egoStatus.includes("Volatile"))egoType="Volatile E.G.O.";
 else if(egoStatus.includes("Distortion"))egoType="Distortion";
 else if(egoStatus.includes("Abnormality-derived"))egoType="Abnormality-derived";
 else if(egoStatus.includes("Sinner-issued"))egoType="Abnormality-based (Sinner-issued)";
 else if(egoStatus.includes("Lobotomy"))egoType="Artificial / refined Lobotomy E.G.O.";
 else if(egoStatus.includes("No known"))egoType="Absent";
 else if(egoStatus)egoType=egoStatus;
 const egoDescription=lazyField("E.G.O")||(egoStatus.includes("No known")?"No known E.G.O. or Distortion is recorded.":[egoStatus,egoName&&"Manifestation: "+egoName,egoLoadout&&"Loadout: "+egoLoadout,egoAppearance&&"Appearance: "+egoAppearance,egoFunction&&"Properties and function: "+egoFunction,first("ego_theme","distortion_theme","complex_42")&&"Core concept: "+first("ego_theme","distortion_theme","complex_42"),first("ego_trigger","ego_form","complex_45")&&"Manifestation circumstances: "+first("ego_trigger","ego_form","complex_45")].filter(Boolean).join(" | ")||notSet);
 const compactGenerated=(value)=>String(value||"").split(/\s+[—–-]\s+/)[0].trim();
 const ability=(n)=>lazyField("Ability "+n)||(mode==="complex"?(labelled("Ability "+n)||get("complex_ability_"+n)||get("generated_ability_"+n)||notSet):(compactGenerated(get("generated_ability_"+n))||notSet));
 const ultimate=(n)=>lazyField("Ultimate Ability "+n)||(mode==="complex"?(labelled("Ultimate Ability "+n)||get("complex_ultimate_"+n)||get("generated_ultimate_"+n)||notSet):(compactGenerated(get("generated_ultimate_"+n))||notSet));
 const passive=lazyField("Passive Ability")||labelled("Passive Ability")||first("passive_ability","complex_passive","generated_passive")||notSet;
 const passiveActivation=first("passive_activation","complex_passive_activation");
 const selectedStatuses=first("status_infliction","complex_status_infliction");
 const statusInfliction=Array.isArray(selectedStatuses)?selectedStatuses.join(" · "):(selectedStatuses||"None");
 const personality=lazyField("Personality")||labelled("Personality")||(String(name||"").trim().toLowerCase()==="sephrus aztiluth"?"Aloof, composed, observant, analytical, pragmatic, and calculating. Reserved and solitary, he is morally gray rather than inherently good or evil. He appreciates originality and creating things; his fundamental identity and personality remain immutable.":combine("personality","advanced_personality","complex_03","complex_21","complex_24","generated_personality"))||"Reserved, observant, and shaped by the experiences recorded in this profile.";
 const backstory=labelled("Backstory")||combine("advanced_concept","advanced_motivation","advanced_conflict","backstory","upbringing","complex_14","complex_15","complex_16","complex_17","complex_18","complex_19","complex_20","complex_51","complex_52","complex_59","generated_backstory")||notSet;
 const likes=labelled("Likes")||combine("likes","complex_32","complex_33","generated_likes")||notSet;
 const dislikes=labelled("Dislikes")||combine("dislikes","complex_37","complex_29","generated_dislikes")||notSet;
 const overall=labelled("Overall")||first("advanced_concept","complex_60","notes","generated_overall")||[name||"Unnamed Variant",origin!==notSet?"originating from "+origin:"",occupation? "working as "+occupation:"",egoStatus&& !egoStatus.includes("No known")?"with "+egoStatus:""].filter(Boolean).join(" — ")||notSet;
 return [
  "Name: "+(name||"Unnamed Variant"),
  "Title: "+title,
  "Race: "+race,
  "Affiliation: "+affiliation,
  "Grade: "+grade,
  "Appearance: "+appearance,
  "Origin: "+origin,
  "E.G.O: "+egoDescription,
  "E.G.O Type: "+egoType,
  "Ability 1: "+ability(1),
  "Ability 2: "+ability(2),
  "Ability 3: "+ability(3),
  "Ability 4: "+ability(4),
  "Ultimate Ability 1: "+ultimate(1),
  "Ultimate Ability 2: "+ultimate(2),
  "Passive Ability: "+passive+(passiveActivation?" · "+passiveActivation:""),
  "Passive Ability 2: "+(lazyField("Passive Ability 2")||first("passive_ability_2","complex_passive_2","generated_passive_2")||notSet),
  "Personality: "+personality,
  "Backstory: "+backstory,
  "Likes: "+likes,
  "Dislikes: "+dislikes,
  "Overall: "+overall
 ].join("\n\n");
}
function renderOcHistory(){
 const list=$("oc-history-list"),sephrusList=$("sephrus-oc-history-list"),sephrusSection=$("sephrus-oc-section");if(!list||!sephrusList)return;
 const rows=readOcArchive();
 const isSephrus=r=>normalizeSephrusCharacterName(r.name)==="Sephrus Aztiluth";
 const general=rows.filter(r=>!isSephrus(r)),sephrus=rows.filter(isSephrus);
 // Repair older locally saved alias records so they remain visible in the dedicated archive.
 let migrated=false;
 sephrus.forEach(r=>{if(r.name!=="Sephrus Aztiluth"){r.name="Sephrus Aztiluth";migrated=true;}});
 if(migrated)writeOcArchive(rows);
 $("oc-count").textContent=rows.length+" SAVED";list.innerHTML="";sephrusList.innerHTML="";
 if(sephrusSection)sephrusSection.hidden=false;
 function draw(target,items,isSpecial){
  if(!items.length){const p=document.createElement("p");p.className="oc-empty";p.textContent=isSpecial?"NO SEPHRUS VARIANTS RECORDED YET.":"NO CHARACTER RECORDS YET.";target.append(p);return;}
  items.slice().reverse().forEach(r=>{const card=document.createElement("article");card.className="oc-history-card";const info=document.createElement("div");info.className="oc-history-info";const name=document.createElement("strong");const recordTitle=r.answers?.title?.value||r.answers?.epithet?.value||r.answers?.color_title?.value||r.answers?.generated_title?.value||r.answers?.generated_title?.custom||"The Same Essence";name.textContent=isSpecial?"Sephrus Aztiluth ("+recordTitle+")":(r.name||"Unnamed Variant");const meta=document.createElement("small");meta.textContent=(r.mode==="complex"?"COMPLEX":r.mode==="advanced"?"ADVANCED":"SIMPLE")+" CREATION · UPDATED "+new Date(r.updatedAt||Date.now()).toLocaleDateString();info.append(name,meta);const actions=document.createElement("div");actions.className="oc-history-actions";const edit=document.createElement("button");edit.type="button";edit.className="secondary-button";edit.textContent="CUSTOMIZE";edit.onclick=()=>loadOcRecord(r.id);const del=document.createElement("button");del.type="button";del.className="text-button";del.textContent="DELETE";del.onclick=()=>{if(!confirm("Delete "+(r.name||"this character")+" from this device?"))return;writeOcArchive(readOcArchive().filter(x=>x.id!==r.id));renderOcHistory();};actions.append(edit,del);card.append(info,actions);target.append(card);});}
 draw(list,general,false);draw(sephrusList,sephrus,true);
}
function saveCurrentOc(){const rows=readOcArchive();const copied=JSON.parse(JSON.stringify(answers));characterName=normalizeSephrusCharacterName(characterName);const r={id:editingOcId||("oc_"+Date.now()+"_"+Math.random().toString(36).slice(2,8)),name:characterName,mode:creationMode,answers:copied,profileSummary:formatCharacterDossier(characterName,creationMode,copied),updatedAt:new Date().toISOString()};const i=rows.findIndex(x=>x.id===r.id);if(i<0)rows.push(r);else rows[i]=r;editingOcId=r.id;writeOcArchive(rows);renderOcHistory();}
function loadOcRecord(id){const r=readOcArchive().find(x=>x.id===id);if(!r)return;resetSephrusSecretState();editingOcId=r.id;characterName=r.name||"";creationMode=r.mode==="complex"?"complex":r.mode==="advanced"?"advanced":r.mode==="laziness"?"laziness":"simple";answers=r.answers&&typeof r.answers==="object"?JSON.parse(JSON.stringify(r.answers)):{};index=0;$("character-name").value=characterName;render();screen("picker");}
// Expanded Simple Creation choices. These additions are intentionally broad, optional,
// and kept separate from Advanced / Complex mode so existing saved answers remain compatible.
const SIMPLE_OPTION_EXPANSIONS = {
 personality: [
  "Warm but guarded","Blunt and direct","Diplomatic","Tactful","Empathetic","Apathetic","Patiently curious","Introspective","Self-critical","Self-assured","Insecure beneath a confident exterior","Perfectionistic","Disorganized","Methodical","Disciplined","Easygoing","Competitive","Cooperative","Stubborn","Flexible","Forgiving","Vindictive","Merciful","Judgmental","Open-minded","Traditionalist","Unpredictable","Theatrical","Romantic","Practical-minded","Dreamy","Nostalgic","Restless","World-weary","Easily amused","Dry-humored","Flirtatious in manner","Socially awkward","Quietly affectionate","Emotionally guarded","Overly honest","People-pleasing","Suspicious of authority","Protective of strangers","Independent to a fault","Other / custom answer"
 ],
 era: [
  "Shortly before the White Nights and Dark Days","In the immediate aftermath of the White Nights and Dark Days","During the first years of the City's reconstruction","Between the Library of Ruina and Limbus Company eras","Alongside the early Limbus Company investigations","Far beyond the currently depicted timeline","A branching canon divergence","A Mirror World with altered historical events","A self-contained original timeline","Other / custom answer"
 ],
 origin_type: [
  "A Nest's residential sector","A Nest's industrial or commercial sector","A Nest's corporate district","A Backstreets market or trade quarter","A Backstreets residential block","A Backstreets industrial quarter","A border region between the Nest and Backstreets","A moving settlement or transport route","A remote Outskirts settlement","A nomadic group beyond the City's walls","A hidden facility","A sealed or abandoned district","A custom Mirror World location"
 ],
 upbringing: [
  "Raised by a single parent or guardian","Raised by extended family","Raised by unrelated guardians","Raised communally by a neighborhood","Raised in a group home or institution","Raised by a wealthy patron","Raised as a household servant","Raised among traveling traders","Raised in a religious or philosophical community","Raised in a secluded research facility","Raised between the Nest and Backstreets","Raised by a former Fixer","Raised by retired Syndicate members","Raised in near-total isolation","Moved frequently between Districts","Had an unusually ordinary childhood","Other / custom answer"
 ],
 family_status: [
  "Old money / inherited wealth","Newly wealthy household","Politically connected family","Family with corporate influence","Family with underworld connections","Family of craftsmen or artisans","Family of academics or researchers","Family of performers or artists","Family of medical professionals","Family of transport workers","Family with a respected local reputation","Family known for keeping its distance","Family fractured by internal disputes","Estranged from surviving relatives","Unknown or deliberately concealed lineage","Other / custom answer"
 ],
 augmentation: [
  "Cosmetic modifications only","Sensory enhancements","Communication or interface implants","Mobility-assistance prosthetics","Replaced one or more limbs","Reinforced joints or skeletal supports","Specialized vision systems","Hearing or audio-processing modifications","Internal health-monitoring systems","Work-specific mechanical tools","A mixture of old and modern replacements","Augmentations are concealed","Augmentations are visibly distinctive","Previously augmented, now mostly removed","Refuses augmentation despite access","Other / custom answer"
 ],
 education: [
  "Learned through repeated field experience","Mentored by a veteran professional","Private tutor or household instructor","Public or community schooling","Corporate academy","Specialist technical institute","Medical or scientific training","Military-style institutional training","Studied law, contracts, or City regulations","Studied history, literature, or philosophy","Learned through archival research","Learned through observation and imitation","Trained by several unrelated mentors","Education interrupted before completion","Has credentials but little practical experience","Other / custom answer"
 ],
 occupation: [
  "Licensed Fixer working independently","Unlicensed / unregistered Fixer","Fixer Office owner","Fixer Office manager","Office administrator or clerk","Association trainee","Syndicate executive or senior member","Syndicate courier or messenger","Syndicate negotiator","Syndicate accountant or records keeper","Wing researcher","Wing security specialist","Wing field researcher","Wing executive assistant","Workshop engineer","Workshop designer","Workshop repair specialist","Information broker","Private investigator","Bodyguard or personal escort","Courier or transport worker","Medical practitioner","Archivist or librarian","Teacher or instructor","Performer or entertainer","Journalist or documentarian","Merchant or trader","Independent consultant","Retired professional","Other / custom answer"
 ],
 reputation: [
  "Known for keeping their word","Known for never explaining themselves","Respected by subordinates","Disliked by superiors","Popular among ordinary residents","Trusted with confidential work","Considered difficult to work with","Known as a fair negotiator","Known for unusual methods","A rumor more than a public figure","Famous only within one District","Recognized under an alias","A respected newcomer","A declining former reputation","A deliberately cultivated false reputation","Their reputation is contradictory","Other / custom answer"
 ],
 specialty: [
  "Contract assessment and risk evaluation","Records analysis and archival research","Surveillance and counter-surveillance (fictional)","Disguise and social infiltration (fictional)","Negotiation with hostile organizations","Logistics and mission planning","Medical support and recovery","Mechanical repair and maintenance","Prototype design and engineering","Singularity theory and research","Abnormality research and documentation","E.G.O. compatibility research","Psychological assessment","Public relations and reputation management","Performance and stagecraft","Forgery detection and document examination","Tracking and search work","Escape and evasion in fictional scenarios","Close protection and defensive support","Long-range support role (fictional)","Improvised problem-solving","Leadership under pressure","Other / custom answer"
 ],
 combat_approach: [
  "Waits for an opening before acting","Prioritizes protecting allies","Controls space and positioning","Uses feints and misdirection","Relies on steady pressure","Prefers short decisive exchanges","Maintains distance where possible","Uses a balanced offense and defense","Counters predictable patterns","Changes tactics as information emerges","Coordinates carefully with teammates","Creates openings for another fighter","Uses the environment creatively","Avoids unnecessary escalation","Prefers to end confrontations through negotiation","Relies on preparation rather than improvisation","Fights defensively when outnumbered","Becomes more composed under pressure","Becomes less predictable under pressure","Other / custom answer"
 ],
 technical_level: [
  "Novice with room to grow","Trained but inexperienced","Reliable average professional","Specialist within a narrow field","Highly capable generalist","Veteran with extensive experience","Among the strongest in their organization","Comparable to a senior Association professional","Grade 1-caliber in one narrow specialty","Color-level reputation, but not overall capability","Exceptional due to unusual E.G.O. compatibility","Powerful but inconsistent","Technically gifted but inexperienced","Strategically brilliant, physically ordinary","Other / custom answer"
 ],
 singularity_contact: [
  "Has only heard rumors about Singularities","Uses consumer technology derived from one","Maintains equipment powered by Singularity-derived systems","Was employed in a related research department","Was a test subject in a fictional incident","Survived an industrial accident involving one","Studies its effects from public records","Knows a confidential technical detail","Was assigned to protect a related facility","Has a personal connection to a Wing researcher","Has no direct knowledge but suspects its influence","Other / custom answer"
 ],
 abnormality_contact: [
  "Studied public Abnormality records","Handled archived facility documentation","Worked as a support employee at a facility","Was assigned to facility maintenance","Was part of a facility evacuation","Witnessed an E.G.O. manifestation","Has used more than one E.G.O. weapon","Has a lasting fear of Abnormalities","Is fascinated by Abnormality behavior","Believes an encounter changed their outlook","Was involved only through second-hand accounts","Has deliberately avoided all contact","Other / custom answer"
 ],
 ego_status: [
  "Owns E.G.O. equipment but has no personal E.G.O.","Has access to borrowed E.G.O. equipment","Has used E.G.O. temporarily under supervision","Personal E.G.O. is dormant or unmanifested","Personal E.G.O. manifested only once","Personal E.G.O. is stable but rarely used","Personal E.G.O. is still developing","Personal E.G.O. has changed form over time","Uses a custom Mirror World E.G.O. system","Has witnessed another person's Distortion","Studies Distortions without having become one","Has recovered from a Distortion-related crisis","Other / custom answer"
 ],
 volatile_ego_state: [
  "The manifestation appears only in brief flashes","Its shape changes with the user's decisions","Its features are incomplete but recognizable","It reacts to nearby emotional tension","It becomes clearer when the user is calm","It becomes unstable when the user doubts themself","It leaves temporary symbolic marks in the environment","It manifests only around a specific person or place","It is stable in appearance but unreliable in function","It can be dismissed deliberately, with effort","Other / custom answer"
 ],
 ego_trigger: [
  "Accepting responsibility for a past decision","Choosing to protect someone despite uncertainty","Refusing an imposed identity or role","Recognizing a long-avoided truth","Finding meaning after a period of aimlessness","Choosing freedom over security","Choosing duty over personal desire","Making peace with an irreversible change","Standing by a promise under pressure","Letting go of an impossible expectation","A moment of unexpected compassion","A confrontation with an old memory","A choice that contradicts their former self","Other / custom answer"
 ],
 ego_form: [
  "A coat, uniform, or ceremonial garment","A mask, visor, or headpiece","A sword-like symbolic implement","A staff, cane, or walking aid","A book, ledger, or written record","A set of gloves or arm coverings","A mechanical or clockwork apparatus","A musical instrument or sound-based form","A shield or defensive structure","A set of floating fragments","A halo, crown, or head ornament","A pair of wings or mantle","A living-looking but nonliteral construct","A room-sized or environmental manifestation","A partial transformation of the body or clothing","A companion-like symbolic construct","A tool that changes between several forms","Other / custom answer"
 ],
 ego_theme: [
  "Truth and deception","Creation and destruction","Duty and freedom","Trust and betrayal","Time and impermanence","Knowledge and ignorance","Hope and disillusionment","Order and chaos","Memory and identity","Justice and retribution","Connection and separation","Inheritance and legacy","Beauty and decay","Silence and expression","Ambition and sacrifice","Fate and personal choice","Fear and courage","Mercy and consequence","Performance and authenticity","Other / custom answer"
 ],
 distortion_theme: [
  "A desire to be understood","A refusal to be forgotten","A fear of becoming ordinary","A need to correct every perceived flaw","A longing to return to the past","A belief that only they can solve everything","A desire to escape all obligations","A fixation on a single promise","A need to control every uncertainty","A conviction that they are replaceable","A resentment toward an unfair system","A wish to protect something that cannot be preserved","A fear of being known too well","A desire to create something permanent","A contradiction between freedom and belonging","Other / custom answer"
 ],
 moral_outlook: [
  "Believes outcomes matter more than intentions","Believes intentions matter even when outcomes fail","Will break rules to protect someone","Keeps promises even when inconvenient","Avoids judging people without context","Believes everyone deserves a second chance","Believes trust must be earned slowly","Values fairness over loyalty","Values loyalty over public approval","Will not sacrifice an innocent person for convenience","Accepts responsibility for unintended consequences","Distrusts institutions but respects individuals","Prefers compromise to victory","Believes some choices have no clean answer","Changes principles when circumstances demand it","Other / custom answer"
 ],
 relationships: [
  "A sibling or extended-family member","An estranged parent or guardian","A childhood friend","A former mentor","A current apprentice or student","A trusted assistant","A professional partner","A long-term client","A former client with unresolved history","A rival they quietly respect","A rival they cannot understand","A former enemy turned ally","A complicated romantic interest (off-screen lore only)","A person they feel responsible for","A person who knows their real name","A group of neighborhood residents","A distant contact who provides information","A deceased person's legacy","No one they would openly call close","Other / custom answer"
 ],
 backstory: [
  "A childhood promise that shaped their choices","A sudden change in family circumstances","A mentor's unexpected departure","A professional partnership that fell apart","A public failure followed by a quiet recovery","A contract that challenged their personal code","A discovery that changed their understanding of the City","A period spent living under an assumed identity","A long journey between Districts","A promotion that came with an unwanted cost","A refusal that damaged an important relationship","A small act of kindness with lasting consequences","A choice to leave a powerful organization","An inheritance they did not want","A lost opportunity they still think about","A reunion after many years apart","A mystery surrounding their early life","A decision to remain in an overlooked place","A creative work that changed someone's life","A promise they are still trying to fulfill","Other / custom answer"
 ]
};
QUESTIONS.forEach(question=>{
 const additions=SIMPLE_OPTION_EXPANSIONS[question.id];
 if(!additions)return;
 const original=typeof question.options==="function"?question.options:()=>question.options||[];
 if(typeof question.options==="function"){
  const dynamic=question.options;
  question.options=answers=>[...dynamic(answers),...additions.filter(option=>!dynamic(answers).includes(option))];
 }else{
  question.options=[...original(),...additions.filter(option=>!original().includes(option))];
 }
});

// Remove choices whose information is already captured by a dedicated affiliation or role question.
const REDUNDANT_CREATOR_OPTIONS={
 nest_status:new Set(["Wing employee (Feather)","Wing executive or privileged employee"]),
 occupation:new Set(["Association trainee","Syndicate executive or senior member","Wing researcher","Wing security specialist","Wing field researcher","Wing executive assistant","Licensed Fixer working independently","Fixer Office owner","Fixer Office manager","Office administrator or clerk"]),
 workshop:new Set(["Independent craftsperson","Workshop engineer","Workshop designer","Workshop repair specialist"])
};
QUESTIONS.forEach(question=>{
 const remove=REDUNDANT_CREATOR_OPTIONS[question.id];
 if(!remove)return;
 const original=question.options;
 question.options=typeof original==="function"?answers=>original(answers).filter(option=>!remove.has(option)||(question.id==="workshop"&&option==="Independent craftsperson"&&answers.occupation!=="Workshop artisan or craftsperson")):original.filter(option=>!remove.has(option));
});


COMPLEX_QUESTIONS.push(
 {id:"complex_ability_1",category:"COMBAT PROFILE / ABILITIES",title:"Ability 1",description:"First regular ability. Low potency (5).",freeText:true,maxLength:6000,inputLabel:"ABILITY 1"},
 {id:"complex_ability_2",category:"COMBAT PROFILE / ABILITIES",title:"Ability 2",description:"Second regular ability. Medium potency (15).",freeText:true,maxLength:6000,inputLabel:"ABILITY 2"},
 {id:"complex_ability_3",category:"COMBAT PROFILE / ABILITIES",title:"Ability 3",description:"Third regular ability. Medium potency (15).",freeText:true,maxLength:6000,inputLabel:"ABILITY 3"},
 {id:"complex_ability_4",category:"COMBAT PROFILE / ABILITIES",title:"Ability 4",description:"Fourth regular ability. Large potency (20).",freeText:true,maxLength:6000,inputLabel:"ABILITY 4"},
 {id:"complex_ultimate_1",category:"COMBAT PROFILE / ULTIMATES",title:"Ultimate Ability 1",description:"First ultimate. Massive potency (30).",freeText:true,maxLength:6000,inputLabel:"ULTIMATE ABILITY 1"},
 {id:"complex_ultimate_2",category:"COMBAT PROFILE / ULTIMATES",title:"Ultimate Ability 2",description:"Second ultimate. Massive potency (30).",freeText:true,maxLength:6000,inputLabel:"ULTIMATE ABILITY 2"},
 {id:"complex_status_infliction",category:"COMBAT PROFILE / ABILITIES & STATUS",title:"Abilities & Status Effects",description:"Choose up to three status effects for this character’s abilities. Potency is divided evenly between your selections.",multiple:true,maxSelections:3,noneOption:"No status effect",options:["No status effect","Burn","Bleed","Rupture","Sinking","Tremor","Fragile","Bind","Paralyze","Poise","Charge","Haste","Protection","Strength","Feeble","Smoke","Fairy","Erosion","Paralysis","Endurance","Disarm","Stagger Protection","Stagger Resistance Down","Persistence","Blood","Nullify Power","Immobilized","Enhance","Weaken","Singleton","Offense Level Up","Offense Level Down","Defense Level Up","Defense Level Down","Damage Up","Damage Down","Coin Power Up","Coin Power Down","Attack Power Up","Attack Power Down","Defense Power Up","Defense Power Down","Ammo","Aggro","Discard","Fanatic","Nails","Talisman","Tremor Burst","Tremor - Scorch","Dark Flame","Butterfly","Echoes of the Manor","Bloodfeast","Charge Barrier","Plus Coin Boost / Drop"]},
 {id:"complex_passive",category:"COMBAT PROFILE / PASSIVES",title:"Passive Ability",description:"Describe the character's passive ability.",freeText:true,maxLength:6000,inputLabel:"PASSIVE ABILITY"},
 {id:"complex_passive_activation",category:"COMBAT PROFILE / PASSIVES",title:"When Does This Passive Activate?",description:"Choose whether the passive is permanently active or activates after a specific battle event.",options:["Always active","At the start of battle","At the start of this character's turn","After taking damage","When below 50% HP","When an ally is knocked out","When E.G.O. manifests","Other / custom answer"]}
);

const LAZINESS_QUESTIONS=[{id:"laziness_profile",category:"COMPLETE CHARACTER DOSSIER",title:"Write Your Entire OC",description:"One page. One question. Write or paste your complete OC profile here. Recognized section labels will be arranged into the standard dossier format.",freeText:true,maxLength:20000,inputLabel:"YOUR COMPLETE OC PROFILE"}];
const DOSSIER_QUESTIONS = [
 {id:"profile_details",category:"FINAL DOSSIER / OPTIONAL DETAILS",title:"Additional Profile Details",description:"Optional: add any details that the earlier questions did not cover. Use the exact labels below if you want them placed directly into the final structured dossier. Leave blank to skip.\\n\\nTitle: \\nRace: \\nAppearance: \\nAbility 1: \\nAbility 2: \\nAbility 3: \\nAbility 4: \\nUltimate Ability 1: \\nUltimate Ability 2: \\nPassive Ability: \\nPassive Ability 2: \\nPersonality: \\nBackstory: \\nLikes: \\nDislikes: \\nOrigin: \\nAffiliation: \\nGrade: \\nOverall:",freeText:true,optional:true,maxLength:6000,inputLabel:"OPTIONAL DOSSIER DETAILS"}
];
const WEAPON_QUESTION={id:"weapon_loadout",category:"COMBAT IDENTITY",title:"Weapon & Fighting Style",description:"Choose the character's non-E.G.O. fighting equipment and preferred style. This is a fictional character-design loadout; ranged ammunition uses invented archive types, not real-world specifications.",customizer:true,weaponCustomizer:true};
function activeQuestions(){if(creationMode==="laziness")return LAZINESS_QUESTIONS;const base=creationMode==="complex"?COMPLEX_QUESTIONS:creationMode==="advanced"?[...QUESTIONS,...ADVANCED_QUESTIONS]:QUESTIONS;const combat=creationMode==="complex"?[]:COMBAT_PROFILE_QUESTIONS;return [...base,...combat,WEAPON_QUESTION,...DOSSIER_QUESTIONS];}
function values(){const v={};for(const q of activeQuestions())if(answers[q.id])v[q.id]=answers[q.id].value;return v;}
function visible(){return activeQuestions().filter(q=>!q.showIf||q.showIf(values()));}
const DOWNSTREAM={
 origin_type:["district","nest_status","backstreet_environment"],
 occupation:["head_role","syndicate_fixer_status","syndicate_type","syndicate","finger_rank","syndicate_hierarchy","fixer_grade","color_title","association","association_branch","association_section","association_position","office","wing_role","workshop"],
 fixer_grade:["color_title"],
 association:["association_branch","association_position","association_section"],
 association_branch:["association_position","association_section"],
 association_position:["association_section"],
 syndicate_fixer_status:["fixer_grade","color_title","association","association_branch","association_section","association_position","office"],
 syndicate_type:["syndicate","finger_rank","syndicate_hierarchy"],
 syndicate:["finger_rank","syndicate_hierarchy"],
 ego_status:["ego_equipment_customizer","volatile_ego_state","ego_trigger","ego_form","ego_theme","ego_name","distortion_theme"]
};
// Generated details are dependent on the answers that shaped them. Clear only affected
// generated fields when editing a saved character, so the next completion regenerates them.
const GENERATED_DOWNSTREAM={
 title:["generated_title"],epithet:["generated_title"],color_title:["generated_title"],
 race:["generated_race"],
 origin_type:["generated_backstory","generated_overall"],district:["generated_backstory","generated_overall"],
 upbringing:["generated_backstory","generated_overall"],backstreet_environment:["generated_backstory","generated_overall"],
 occupation:["generated_appearance","generated_backstory","generated_overall"],
 head_role:["generated_appearance","generated_backstory","generated_overall"],
 syndicate_type:["generated_appearance","generated_backstory","generated_overall"],
 syndicate:["generated_appearance","generated_backstory","generated_overall"],
 finger_rank:["generated_appearance","generated_backstory","generated_overall"],
 syndicate_hierarchy:["generated_appearance","generated_backstory","generated_overall"],
 fixer_grade:["generated_backstory","generated_overall"],association_position:["generated_backstory","generated_overall"],
 association:["generated_appearance","generated_backstory","generated_overall"],
 office:["generated_backstory","generated_overall"],workshop:["generated_appearance","generated_backstory","generated_overall"],
 wing_role:["generated_appearance","generated_backstory","generated_overall"],
 advanced_concept:["generated_backstory"],advanced_motivation:["generated_backstory"],advanced_conflict:["generated_backstory"],
 backstory:["generated_backstory"],complex_15:["generated_backstory"],complex_59:["generated_backstory"],
 likes:["generated_likes"],complex_32:["generated_likes"],complex_33:["generated_likes"],
 dislikes:["generated_dislikes"],complex_37:["generated_dislikes"],complex_29:["generated_dislikes"],
 
 complex_47:["generated_ability_1","generated_ability_2","generated_ability_3","generated_ability_4"],
 complex_50:["generated_ability_1","generated_ability_2","generated_ability_3","generated_ability_4"],
 complex_51:["generated_ability_1","generated_ability_2","generated_ability_3","generated_ability_4"],
 ability_1:["generated_ability_1"],ability_2:["generated_ability_2"],ability_3:["generated_ability_3"],ability_4:["generated_ability_4"],
 ego_status:["generated_ego_name","generated_overall"],
 ego_name:["generated_overall"],
 ego_theme:["generated_ability_1","generated_ability_4","generated_ultimate_1","generated_overall"],
 distortion_theme:["generated_ability_1","generated_ability_4","generated_ultimate_1","generated_overall"],
 combat_approach:["generated_ability_2","generated_overall"]
};
function clearDownstream(id){
 const children=new Set([...(DOWNSTREAM[id]||[]),...(GENERATED_DOWNSTREAM[id]||[])]);
 children.forEach(child=>delete answers[child]);
}
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
 let unchanged=previous===value;
 if(!unchanged&&previous&&value&&typeof previous==="object"&&typeof value==="object"){
  try{unchanged=JSON.stringify(previous)===JSON.stringify(value);}catch{}
 }
 if(!unchanged)clearDownstream(q.id);
 answers[q.id]={choice,value,custom};
 pruneHiddenAnswers();
}
function screen(n){["home-screen","name-screen","mode-screen","picker-screen","result-screen","simulator-screen"].forEach(id=>$(id).classList.add("hidden"));const active=$(`${n}-screen`);active.classList.remove("hidden","screen-enter");void active.offsetWidth;active.classList.add("screen-enter");if(n==="home")applyEssentiaMainTitle();window.scrollTo({top:0,behavior:"smooth"});}
function resetSephrusSecretState(){sephrusBrokenClickCount=0;sephrusEscapeRunning=false;}
const ESSENTIA_TITLE_STORAGE_KEY="uee_essentia_title_unlocked_v1";
function applyEssentiaMainTitle(){
 let unlocked=false;
 try{unlocked=localStorage.getItem(ESSENTIA_TITLE_STORAGE_KEY)==="true";}catch{}
 if(!unlocked)return;
 const heading=$("#home-screen h1");
 if(heading){
  heading.innerHTML="UNA EADEMQUE<br><span>ESSENTIA</span>";
  heading.setAttribute("aria-label","Una Eademque Essentia");
 }
 document.title="Una Eademque Essentia";
}
function unlockEssentiaMainTitle(){
 try{localStorage.setItem(ESSENTIA_TITLE_STORAGE_KEY,"true");}catch{}
 applyEssentiaMainTitle();
}
applyEssentiaMainTitle();
function normalizeSephrusCharacterName(name){
 const key=String(name||"").trim().toLowerCase().replace(/\s+/g," ");
 const aliases=["sephrus","zephyrus","aztiluth","sephrus zephyrus","sephrus aztiluth","zephyrus aztiluth","sephrus zephyrus aztiluth"];
 return aliases.includes(key)?"Sephrus Aztiluth":String(name||"").trim();
}
function sephrusSecretKey(name){
 const normalized=String(name||"").trim().toLowerCase().replace(/\s+/g," ");
 const messages={
  "sephrus":"You have returned to the name. That does not mean you understand the one who bears it.",
  "zephyrus":"The wind carries every name. It does not promise to return them.",
  "aztiluth":"You remember the ending. The beginning has not forgiven you.",
  "sephrus aztiluth":"We are one and the same. you choose yours. but choose mine, and i decide what happens.",
  "sephrus zephyrus":"Two names, one reflection. Which one did you think was yours?",
  "zephyrus aztiluth":"The wind has crossed the mirror. Something on the other side noticed.",
  "sephrus zephyrus aztiluth":"Three names. One essence. No mirror remains between us. You did not find this record; it allowed you to."
 };
 return Object.prototype.hasOwnProperty.call(messages,normalized)?normalized:null;
}
function sephrusSecretMessage(name){
 const key=sephrusSecretKey(name);
 const messages={
  "sephrus":"You have returned to the name. That does not mean you understand the one who bears it.",
  "zephyrus":"The wind carries every name. It does not promise to return them.",
  "aztiluth":"You remember the ending. The beginning has not forgiven you.",
  "sephrus aztiluth":"We are one and the same. you choose yours. but choose mine, and i decide what happens.",
  "sephrus zephyrus":"Two names, one reflection. Which one did you think was yours?",
  "zephyrus aztiluth":"The wind has crossed the mirror. Something on the other side noticed.",
  "sephrus zephyrus aztiluth":"Three names. One essence. No mirror remains between us. You did not find this record; it allowed you to."
 };
 return key?messages[key]:messages["sephrus aztiluth"];
}

function showSephrusAfterimage(messageText){
 const previous=document.querySelector(".sephrus-afterimage");
 if(previous)previous.remove();
 const notice=document.createElement("aside");
 notice.className="sephrus-afterimage";
 notice.setAttribute("role","status");
 notice.setAttribute("aria-live","polite");
 notice.setAttribute("aria-label","A message from the archive");
 const frame=document.createElement("div");
 frame.className="sephrus-afterimage-frame";
 const label=document.createElement("span");
 label.className="sephrus-afterimage-label";
 label.textContent="UNREGISTERED MIRROR RECORD";
 const message=document.createElement("p");
 message.className="sephrus-afterimage-text";
 message.textContent=String(messageText||sephrusSecretMessage(characterName));
 frame.append(label,message);

 // Build an irregular 4-by-4 glass tessellation, split into 32 individual facets.
 const gridX=[
  [0,23,49,75,100],
  [0,25,52,73,100],
  [0,20,50,78,100],
  [0,24,47,75,100],
  [0,22,51,74,100]
 ];
 const gridY=[0,22,49,75,100];
 const grid=gridY.map((y,row)=>gridX[row].map(x=>({x,y})));
 const svgNS="http://www.w3.org/2000/svg";
 const fractureWeb=document.createElementNS(svgNS,"svg");
 fractureWeb.classList.add("sephrus-fracture-web");
 fractureWeb.setAttribute("viewBox","0 0 100 100");
 fractureWeb.setAttribute("preserveAspectRatio","none");
 fractureWeb.setAttribute("aria-hidden","true");
 const fracturePath=document.createElementNS(svgNS,"path");
 const fractureSegments=[];
 let shardIndex=0;
 for(let row=0;row<4;row++){
  for(let col=0;col<4;col++){
   const tl=grid[row][col],tr=grid[row][col+1],br=grid[row+1][col+1],bl=grid[row+1][col];
   const triangles=(row+col)%2===0?[[tl,tr,br],[tl,br,bl]]:[[tl,tr,bl],[tr,br,bl]];
   triangles.forEach(points=>{
    const polygon=points.map(point=>`${point.x}% ${point.y}%`).join(",");
    const shard=document.createElement("span");
    shard.className="sephrus-glass-shard";
    shard.dataset.shard=String(++shardIndex);
    shard.setAttribute("aria-hidden","true");
    shard.style.clipPath=`polygon(${polygon})`;
    const cx=points.reduce((sum,p)=>sum+p.x,0)/3;
    const cy=points.reduce((sum,p)=>sum+p.y,0)/3;
    const distance=30+Math.hypot(cx-50,cy-50)*2.15;
    const dx=(cx-50)/(Math.hypot(cx-50,cy-50)||1)*distance;
    const dy=(cy-50)/(Math.hypot(cx-50,cy-50)||1)*distance;
    const rotation=(shardIndex%2===0?-1:1)*(10+(shardIndex%5)*5);
    shard.style.setProperty("--shard-x",`${dx.toFixed(1)}px`);
    shard.style.setProperty("--shard-y",`${dy.toFixed(1)}px`);
    shard.style.setProperty("--shard-r",`${rotation}deg`);
    frame.append(shard);
    points.forEach((point,index)=>{
     const next=points[(index+1)%points.length];
     fractureSegments.push(`M${point.x} ${point.y} L${next.x} ${next.y}`);
    });
   });
  }
 }
 fracturePath.setAttribute("d",fractureSegments.join(" "));
 fractureWeb.append(fracturePath);
 frame.insertBefore(fractureWeb,frame.children[2]||null);

 notice.append(frame);
 document.body.append(notice);
 requestAnimationFrame(()=>notice.classList.add("visible"));
 window.setTimeout(()=>{
  if(!notice.isConnected)return;
  notice.classList.add("shattering");
  window.setTimeout(()=>{notice.remove();window.ueeEasterEggAudio?.endGrim();},2300);
 },5000);
}
function returnHomeFromSephrusSecret(){
 if(sephrusEscapeRunning)return;
 const secretKey=sephrusSecretKey(characterName);
 const afterimageMessage=sephrusSecretMessage(characterName);
 const unlockTitle=secretKey==="sephrus zephyrus aztiluth";
 sephrusEscapeRunning=true;
 window.ueeEasterEggAudio?.beginGrim();
 const overlay=document.createElement("div");
 overlay.className="sephrus-void-transition";
 overlay.setAttribute("aria-hidden","true");
 document.body.append(overlay);
 requestAnimationFrame(()=>overlay.classList.add("active"));
 window.setTimeout(()=>{
  const canonicalName=normalizeSephrusCharacterName(characterName);
  if(canonicalName==="Sephrus Aztiluth"){
   characterName=canonicalName;
   completeGeneratedCharacter(characterName,answers);
   saveCurrentOc();
  }
  answers={};characterName="";creationMode="simple";editingOcId=null;index=0;
  $("character-name").value="";$("name-validation").textContent="";
  $("validation-message").textContent="";
  renderOcHistory();
  screen("home");
  if(unlockTitle)unlockEssentiaMainTitle();
  requestAnimationFrame(()=>overlay.classList.remove("active"));
  window.setTimeout(()=>{overlay.remove();resetSephrusSecretState();showSephrusAfterimage(afterimageMessage);},2250);
 },2100);
}
const WEAPON_STYLE_OPTIONS=["Melee","Ranged","Unarmed","Hybrid / Transforming","Focus / Conduit"];
const WEAPON_CATALOGUE={
 "Melee":["Fists","Knuckle Guards","Cestus","Gauntlets","Tonfa","Baton","Short Sword","Longsword","Greatsword","Rapier","Saber","Katana","Paired Blades","Dagger","Ceremonial Knife","Spear","Lance","Halberd","Glaive","Polearm","Quarterstaff","Warhammer","Mace","Flail","Battle Axe","Great Axe","Scythe","Shield","Umbrella","Cane","Combat Fan","Chain-Blade (fantasy)","Whip (fantasy)","Flexible Ribbon-Blade (fantasy)","Twin Staffs","Trident","Hooked Staff","Folding Blade (fantasy)"],
 "Ranged":["Longbow","Shortbow","Recurve Bow","Composite Bow (fictional setting)","Crossbow","Hand Crossbow","Sidearm","Revolver-style Sidearm","Longarm","Scatter-type Firearm","Rapid-fire Firearm","Precision Firearm","Energy Firearm","Arcane Firearm","Handheld Energy Projector","Fictional Payload Launcher"],
 "Unarmed":["Fists","Boxing-inspired Style","Wrestling-inspired Style","Kick-focused Style","Grappling Style","Open-hand Style","Footwork-focused Style","Improvised Unarmed Style"],
 "Hybrid / Transforming":["Transforming Blade","Modular Staff","Split-form Polearm","Blade-and-Focus Pair","Twin-form Weapon","Collapsible Fantasy Weapon","Weapon-and-Shield Pair"],
 "Focus / Conduit":["Arcane Focus","Catalyst","Talisman Set","Grimoire","Resonance Bell","Ritual Instrument","Mechanical Conduit","E.G.O.-independent Device"]
};
const BOW_AMMO=["Plain Arrow (fictional profile)","Ember Arrow","Frost Arrow","Thunder Arrow","Gale Arrow","Binding Arrow","Resonance Arrow","Light Arrow","Echo Arrow","Dream Arrow","Signal Arrow","Status-inflicting Arrow","Custom Fictional Arrow"];
const GUN_AMMO={
 "compact":["Compact Impact Charge","Compact Ember Charge","Compact Frost Charge","Compact Shock Charge","Compact Resonance Charge","Compact Binding Charge","Compact Status Charge","Compact Signal Charge","Custom Fictional Charge"],
 "revolver":["Cylinder-form Impact Charge","Cylinder-form Ember Charge","Cylinder-form Shock Charge","Cylinder-form Resonance Charge","Cylinder-form Status Charge","Custom Fictional Charge"],
 "long":["Long-form Impact Charge","Long-form Piercing-effect Charge (fictional)","Long-form Frost Charge","Long-form Ember Charge","Long-form Marking Charge","Long-form Resonance Charge","Custom Fictional Charge"],
 "scatter":["Scatter Capsule","Frost Scatter Capsule","Ember Scatter Capsule","Binding Scatter Capsule","Resonance Scatter Capsule","Custom Fictional Capsule"],
 "rapid":["Rapid Impact Charge","Rapid Shock Charge","Rapid Marking Charge","Rapid Status Charge","Custom Fictional Charge"],
 "energy":["Energy Cell","Ember Cell","Frost Cell","Thunder Cell","Light Cell","Resonance Cell","Custom Fictional Cell"],
 "payload":["Sealed Utility Payload","Signal Payload","Binding Payload","Smoke-like Fictional Veil Payload","Resonance Payload","Custom Fictional Payload"]
};
function readWeaponDraft(){
 const val=id=>document.getElementById("weapon-"+id)?.value||"";
 return {style:val("style"),weapon:val("type"),ammoType:val("ammo-type"),ammo:val("ammo"),custom:val("custom")};
}
function renderWeaponCustomizer(saved){
 const initial=saved.value&&typeof saved.value==="object"?saved.value:{};
 const panel=document.createElement("div");panel.className="loadout-customizer archive-reveal weapon-customizer";
 const note=document.createElement("p");note.className="loadout-note";note.textContent="NON-E.G.O. EQUIPMENT · CHOOSE A STYLE, THEN BUILD A PERSONAL LOADOUT. RANGED AMMUNITION IS PURELY FICTIONAL.";
 panel.append(note);
 const fields=document.createElement("div");fields.className="loadout-fields weapon-fields";
 function addSelect(id,label,options,value){
  const wrap=document.createElement("div");wrap.className="loadout-field";
  const lab=document.createElement("label");lab.htmlFor="weapon-"+id;lab.textContent=label;
  const select=document.createElement("select");select.id="weapon-"+id;
  options.forEach(item=>{const opt=document.createElement("option");opt.value=item;opt.textContent=item;select.append(opt);});
  if(value&&options.includes(value))select.value=value;
  wrap.append(lab,select);fields.append(wrap);return select;
 }
 const style=addSelect("style","FIGHTING STYLE",WEAPON_STYLE_OPTIONS,initial.style||"Melee");
 const typeWrap=document.createElement("div");typeWrap.className="loadout-field";
 const typeLabel=document.createElement("label");typeLabel.htmlFor="weapon-type";typeLabel.textContent="WEAPON / IMPLEMENT";
 const type=document.createElement("select");type.id="weapon-type";typeWrap.append(typeLabel,type);fields.append(typeWrap);
 const ammoWrap=document.createElement("div");ammoWrap.className="loadout-field";ammoWrap.hidden=true;
 const ammoTypeLabel=document.createElement("label");ammoTypeLabel.htmlFor="weapon-ammo-type";ammoTypeLabel.textContent="AMMUNITION PROFILE";
 const ammoType=document.createElement("select");ammoType.id="weapon-ammo-type";ammoWrap.append(ammoTypeLabel,ammoType);fields.append(ammoWrap);
 const ammoChoiceWrap=document.createElement("div");ammoChoiceWrap.className="loadout-field";ammoChoiceWrap.hidden=true;
 const ammoLabel=document.createElement("label");ammoLabel.htmlFor="weapon-ammo";ammoLabel.textContent="AMMO TYPE";
 const ammo=document.createElement("select");ammo.id="weapon-ammo";ammoChoiceWrap.append(ammoLabel,ammo);fields.append(ammoChoiceWrap);
 const customWrap=document.createElement("div");customWrap.className="loadout-field";
 const customLabel=document.createElement("label");customLabel.htmlFor="weapon-custom";customLabel.textContent="CUSTOM DETAILS (OPTIONAL)";
 const custom=document.createElement("input");custom.id="weapon-custom";custom.type="text";custom.maxLength=240;custom.placeholder="Name, appearance, or fictional special property";
 custom.value=initial.custom||"";customWrap.append(customLabel,custom);fields.append(customWrap);
 function fill(select,items,value){select.innerHTML="";items.forEach(item=>{const opt=document.createElement("option");opt.value=item;opt.textContent=item;select.append(opt);});if(value&&items.includes(value))select.value=value;}
 function updateType(){
  const styleValue=style.value;const items=WEAPON_CATALOGUE[styleValue]||[];
  fill(type,items,initial.weapon);updateAmmo();
 }
 function updateAmmo(){
  const styleValue=style.value,weaponValue=type.value;
  const isBow=styleValue==="Ranged"&&/bow|crossbow/i.test(weaponValue);
  const isGun=styleValue==="Ranged"&&/sidearm|revolver|longarm|scatter|rapid-fire|precision firearm|energy firearm|arcane firearm|payload launcher/i.test(weaponValue);
  ammoWrap.hidden=!(isBow||isGun);ammoChoiceWrap.hidden=!(isBow||isGun);
  if(!isBow&&!isGun)return;
  ammoTypeLabel.textContent=isBow?"ARROW PROFILE":"AMMUNITION PROFILE";
  const families=isBow?["Arrow","Specialized fictional arrow"]:weaponValue.includes("Revolver")?["Cylinder-form fictional charge"]:weaponValue.includes("Scatter")?["Scatter-type fictional capsule"]:weaponValue.includes("Energy")||weaponValue.includes("Arcane")?["Energy-cell profile"]:weaponValue.includes("Launcher")?["Sealed-payload profile"]:weaponValue.includes("Longarm")||weaponValue.includes("Precision")?["Long-form fictional charge"]:weaponValue.includes("Rapid")?["Rapid-form fictional charge"]:["Compact fictional charge"];
  fill(ammoType,families,initial.ammoType);
  const options=isBow?BOW_AMMO:weaponValue.includes("Revolver")?GUN_AMMO.revolver:weaponValue.includes("Scatter")?GUN_AMMO.scatter:weaponValue.includes("Energy")||weaponValue.includes("Arcane")?GUN_AMMO.energy:weaponValue.includes("Launcher")?GUN_AMMO.payload:weaponValue.includes("Longarm")||weaponValue.includes("Precision")?GUN_AMMO.long:weaponValue.includes("Rapid")?GUN_AMMO.rapid:GUN_AMMO.compact;
  fill(ammo,options,initial.ammo);
 }
 style.addEventListener("change",()=>{initial.weapon="";initial.ammo="";initial.ammoType="";updateType();});
 type.addEventListener("change",()=>{initial.ammo="";initial.ammoType="";updateAmmo();});
 updateType();panel.append(fields);
 const hint=document.createElement("p");hint.className="weapon-loadout-hint";hint.textContent="Melee includes close-range weapon families and fists. Ranged includes bows and fictional firearm archetypes; ammunition choices are invented for this setting and only describe the character's loadout.";
 panel.append(hint);$("choice-list").append(panel);
 $("next-button").classList.remove("hidden");$("next-button").innerHTML="SAVE WEAPON LOADOUT <span>→</span>";$("custom-wrap").classList.add("hidden");
}
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
   $("advanced-answer").maxLength=q.maxLength||1200;
   $("next-button").classList.remove("hidden");
   $("next-button").innerHTML=index===qs.length-1?'CONFIRM & COMPLETE <span>↗</span>':'SAVE DETAIL & CONTINUE <span>→</span>';
   return;
 }
 if(q.customizer){
   if(q.weaponCustomizer){renderWeaponCustomizer(saved);return;}
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
 if(q.multiple){
   const originalOptions=customLastUnique(typeof q.options==="function"?q.options(values()):q.options);
   const isSephrusPersonality=q.id==="personality"&&sephrusSecretKey(characterName)!==null;
   const canonical="Aloof, composed, observant, analytical, pragmatic, and calculating. Reserved and solitary, he is morally gray rather than inherently good or evil. He values originality and the act of creating things. His fundamental mindset, identity, and personality remain consistent across every variant.";
   let selected=Array.isArray(saved.value)?saved.value:[];
   if(isSephrusPersonality&&!selected.includes(canonical)){selected=[canonical];setAnswer(q,"Selected traits",selected,"");}
   const options=isSephrusPersonality?["BROKEN",canonical,...originalOptions.slice(1).map(()=> "BROKEN")]:originalOptions;
   let fractureStatus=null;
   if(isSephrusPersonality){
    fractureStatus=document.createElement("p");
    fractureStatus.className="sephrus-fracture-status";
    fractureStatus.setAttribute("aria-live","polite");
    fractureStatus.hidden=true;
   }
   options.forEach((opt,i)=>{
    const isBroken=isSephrusPersonality&&opt==="BROKEN";
    const isCanonical=isSephrusPersonality&&opt===canonical;
    const b=document.createElement("button");b.type="button";
    b.style.setProperty("--choice-delay",Math.min(i,12)*12+"ms");
    b.className="choice"+(selected.includes(opt)?" selected":"")+(isBroken?" personality-broken":"")+(isCanonical?" personality-canonical":"");if(opt==="Other / custom answer")b.dataset.customAnswer="true";
    const m=document.createElement("span");m.className="choice-mark";
    const t=document.createElement("span");t.textContent=opt;
    if(isBroken){
     const chainLeft=document.createElement("span");chainLeft.className="personality-chain";chainLeft.textContent="⛓";chainLeft.setAttribute("aria-hidden","true");
     const cracks=document.createElement("span");cracks.className="personality-cracks";cracks.setAttribute("aria-hidden","true");
     const chainRight=document.createElement("span");chainRight.className="personality-chain";chainRight.textContent="⛓";chainRight.setAttribute("aria-hidden","true");
     t.textContent="";
     "BROKEN".split("").forEach((letter,index)=>{const glyph=document.createElement("span");glyph.className="broken-glyph";glyph.textContent=letter;glyph.style.setProperty("--glyph-tilt",String(((i*7+index*11)%19)-9)+"deg");glyph.style.setProperty("--glyph-y",String(((i*5+index*7)%13)-6)+"px");t.append(glyph);});
     t.className="broken-word";
     b.append(chainLeft,m,t,cracks,chainRight);
     b.setAttribute("aria-label","BROKEN — damaged personality record");
     b.style.setProperty("--fracture-delay",(i%7)*.11+"s");
     b.onclick=()=>{
      if(sephrusEscapeRunning)return;
      sephrusBrokenClickCount++;
      b.classList.add("personality-broken-struck");
      window.setTimeout(()=>b.classList.remove("personality-broken-struck"),380);
      if(fractureStatus){
       fractureStatus.hidden=false;
       if(sephrusBrokenClickCount===1)fractureStatus.textContent="A HAIRLINE FRACTURE APPEARS IN THE RECORD.";
       else if(sephrusBrokenClickCount===7)fractureStatus.textContent="THE RECORD BEGINS TO STRAIN.";
       else if(sephrusBrokenClickCount===15)fractureStatus.textContent="THE ARCHIVE CAN NO LONGER HOLD ITS SHAPE.";
       else if(sephrusBrokenClickCount===22)fractureStatus.textContent="ONE MORE FAULT. THE RECORD IS ALMOST GONE.";
       else if(sephrusBrokenClickCount>=23)fractureStatus.textContent="THE RECORD FALLS SILENT.";
      }
      if(sephrusBrokenClickCount>=23)returnHomeFromSephrusSecret();
     };
    }else{
     b.append(m,t);
     if(isCanonical){
      b.setAttribute("aria-label","Canonical personality — the only valid entry");
      b.setAttribute("aria-pressed","true");
      b.onclick=()=>{if(sephrusEscapeRunning)return;setAnswer(q,"Selected traits",[canonical],"");advance();};
     }else{
      b.onclick=()=>{
       let next=selected.slice();
       if(opt==="Other / custom answer")next=next.includes(opt)?[]:[opt];
       else if(q.noneOption&&opt===q.noneOption)next=next.includes(opt)?[]:[opt];
       else{next=next.filter(x=>x!=="Other / custom answer"&&x!==q.noneOption);if(next.includes(opt))next=next.filter(x=>x!==opt);else{if(q.maxSelections&&next.length>=q.maxSelections){$("validation-message").textContent="CHOOSE UP TO "+q.maxSelections+" OPTIONS.";return;}next=next.concat(opt);}}
       setAnswer(q,next.includes("Other / custom answer")?"Other / custom answer":"Selected traits",next,saved.custom||"");
       render();
       if(next.includes("Other / custom answer"))$("custom-answer").focus();
      };
     }
    }
    if(selected.includes(opt))b.dataset.selected="true";
    $("choice-list").append(b);
   });
   if(fractureStatus)$("choice-list").append(fractureStatus);
   const custom=selected.includes("Other / custom answer");
   $("custom-wrap").classList.toggle("hidden",!custom);$("custom-answer").value=saved.custom||"";
   $("custom-label").textContent="CUSTOM PERSONALITY";
   $("next-button").classList.remove("hidden");
    $("next-button").textContent=index===qs.length-1?"CONFIRM & COMPLETE":q.id==="personality"?"SAVE PERSONALITY & CONTINUE":q.id.includes("status_infliction")?"SAVE ABILITIES & STATUS":"SAVE SELECTIONS & CONTINUE";
   return;
  }
  const options=customLastUnique(typeof q.options==="function"?q.options(values()):q.options);
 options.forEach((opt,optIndex)=>{const b=document.createElement("button");b.type="button";b.style.setProperty("--choice-delay",`${Math.min(optIndex,12)*22}ms`);b.className="choice"+(saved.choice===opt?" selected":"");if(opt==="Other / custom answer")b.dataset.customAnswer="true";const mark=document.createElement("span");mark.className="choice-mark";const label=document.createElement("span");label.textContent=opt;b.append(mark,label);if(saved.choice===opt)b.dataset.selected="true";b.onclick=()=>{
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
 if(creationMode!=="laziness")completeGeneratedCharacter(characterName,answers);
 saveCurrentOc();
 $("result-character-name").textContent=characterName||"UNNAMED VARIANT";const modeStamp=$("result-creation-mode");if(modeStamp)modeStamp.textContent=(creationMode==="complex"?"COMPLEX":creationMode==="advanced"?"ADVANCED":creationMode==="laziness"?"LAZINESS":"SIMPLE")+" CREATION DOSSIER";
 const profile=formatCharacterDossier(characterName,creationMode,answers);
 $("summary-list").innerHTML="";
 const dossier=document.createElement("pre");dossier.className="profile-summary";dossier.textContent=profile;$("summary-list").append(dossier);
 screen("result");
}
function advance(){pruneHiddenAnswers();index++;if(index>=visible().length)finish();else render();}
function submit(){
 const q=visible()[index];
 if(q.freeText){
  const detail=$("advanced-answer").value.trim();
  if(!detail&&q.optional){setAnswer(q,"Optional profile details","","");advance();return;}
  if(!detail){$("validation-message").textContent="PLEASE ADD A DETAIL BEFORE CONTINUING.";return;}
  setAnswer(q,"Detailed response",detail,detail);advance();return;
 }
 if(q.customizer){
  if(q.weaponCustomizer){const loadout=readWeaponDraft();if(!loadout.style||!loadout.weapon){$("validation-message").textContent="CHOOSE A FIGHTING STYLE AND A WEAPON OR FOCUS.";return;}setAnswer(q,"Selected weapon loadout",loadout,"");advance();return;}
  if(egoPathOf(values().ego_status)==="sinner"){
   const ego=$("loadout-sinner_ego").value.trim();
   if(!ego){$("validation-message").textContent="SEARCH OR ENTER AN E.G.O. BEFORE CONTINUING.";return;}
   setAnswer(q,"Abnormality E.G.O.",{sinner_ego:ego},"");advance();return;
  }
  const loadout={};["synergy","suit","category4","gift"].forEach(id=>loadout[id]=$(`loadout-${id}`).value.trim());
  if(!Object.values(loadout).some(Boolean)){$("validation-message").textContent="ADD AT LEAST ONE SYNERGY, SUIT, E.G.O WEAPON VALUE, OR GIFT.";return;}
  setAnswer(q,"Custom E.G.O. loadout",loadout,"");advance();return;
 }
 if(q.multiple){const selected=Array.isArray(answers[q.id]?.value)?answers[q.id].value:[];if(!selected.length){$("validation-message").textContent=q.id==="personality"?"SELECT AT LEAST ONE PERSONALITY TRAIT.":"SELECT AT LEAST ONE STATUS EFFECT.";return;}if(selected.includes("Other / custom answer")){const custom=$("custom-answer").value.trim();if(!custom){$("validation-message").textContent="PLEASE ENTER YOUR CUSTOM ANSWER.";return;}setAnswer(q,"Other / custom answer",["Other / custom answer"],custom);}else setAnswer(q,"Selected options",selected,"");advance();return;}
 const choice=[...$("choice-list").children].find(b=>b.dataset.selected==="true")?.lastElementChild.textContent;
 if(!choice){$("validation-message").textContent="PLEASE SELECT AN ANSWER BEFORE CONTINUING.";return;}
 let value=choice,custom="";
 if(choice==="Other / custom answer"){custom=$("custom-answer").value.trim();if(!custom){$("validation-message").textContent="PLEASE ENTER YOUR CUSTOM ANSWER.";return;}value=custom;}
 if(choice==="Leave blank for now")value="";
 setAnswer(q,choice,value,custom);advance();
}
const RANDOM_GIVEN_NAMES=["Ilya","Mara","Vera","Lucien","Nikolai","Celia","Dorian","Iris","Silas","Elian","Mirelle","Cassian","Noa","Adrian","Rhea","Soren","Liora","Elias","Nadia","Theo","Auden","Milan","Seren","Vesper"];
const RANDOM_FAMILY_NAMES=["Voss","Morrow","Vale","Kestrel","Ashford","Rook","Bellamy","Veyne","Holloway","Sable","Mercer","Wren","Dusk","Aster","Crowe","Marrow","Fable","Thorne","Edevane","Solace","Mire","Harrow","Quill","Winter"];
const RANDOM_EGO_THEME_NAMES={"Identity and selfhood":[["The Face","The Name","The Other Self","The Unwritten Portrait"],["Beneath the Glass","Without a Reflection","I Cannot Be Erased","That Which Remains"]],"Freedom and confinement":[["The Open Gate","A Thousand Keys","The Unlocked Cage","The Last Boundary"],["Beyond the Walls","No Chain Can Hold","A Sky Without Bars","The Door I Choose"]],"Memory and regret":[["A Photograph","The Last Refrain","A Room of Echoes","The Unsent Letter"],["That I Could Not Forget","After the Final Goodbye","In Yesterday's Ashes","A Memory Returned"]],"Ambition and recognition":[["The Crown of Dust","The Unseen Applause","The Final Audition","A Name in Gold"],["Above the Empty Stage","Until the World Remembers","The Price of Being Seen","A Throne of Paper"]],"Love and attachment":[["The Thread","A Garden in Winter","The Borrowed Heart","The Last Promise"],["That Ties Us Together","Where You Left Me","Held Against the Storm","For Those Who Remain"]],"Isolation and alienation":[["The Empty Seat","A Lighthouse Without Shore","The Glass Between Us","The Quiet Crowd"],["At the Edge of Everyone","No One at the Door","A Stranger to Myself","Under a Silent Moon"]],"Order and control":[["The Perfect Machine","The Ivory Rule","A Clockwork Prayer","The Measured Hand"],["Beyond Every Correction","Where Nothing Wanders","A World in Its Place","The Error in the Pattern"]],"Change and acceptance":[["The Chrysalis","The Turning Page","A New Skin","The Shape of Tomorrow"],["After the Old World Ends","What I Become","A Different Dawn","The Will to Change"]]};
const RANDOM_WRITING={"advanced_concept":["A person shaped by the City's contradictions, trying to preserve one private conviction while the world keeps testing it.","A quiet anomaly in an unforgiving place: outwardly ordinary, inwardly defined by a choice they have never fully explained."],"advanced_appearance":["Their appearance favors practical layers, worn textures, and one carefully maintained personal detail that hints at a past they rarely discuss.","Their silhouette is unmistakable but restrained; small repeated motifs connect their clothing, equipment, and personal keepsakes."],"advanced_personality":["They are observant and reserved at first, but become unexpectedly candid with people they trust. Their composure hides a stubborn streak and a tendency to overthink.","They balance dry humor with practical kindness. Under pressure they grow quiet, focus on immediate priorities, and reveal more concern than they admit."],"advanced_motivation":["They want to secure a life in which their choices belong to them, even if that means leaving familiar people and institutions behind.","They seek proof that their past does not have to dictate every future decision."],"advanced_conflict":["They value independence but fear becoming isolated. Their central contradiction is wanting to be understood while refusing to explain themselves.","They want stability, yet repeatedly choose uncertain paths when someone else's well-being is at stake."],"advanced_code":["They avoid promises they cannot keep, protect private confidences, and try not to make another person's desperation useful to them.","They believe every choice has a cost and try to accept responsibility instead of shifting blame."],"advanced_relationships":["They keep a small circle of trusted connections, each revealing a different side of their personality. Trust is earned through consistency rather than grand gestures.","Their relationships are complicated by unspoken expectations, mutual respect, and a habit of leaving important things unsaid."],"advanced_abilities":["Their strengths are observation, timing, and adaptability. Their main limitation is that prolonged pressure makes them overly cautious.","They excel when they can read a situation and coordinate with others, but struggle when forced to improvise without context."],"advanced_arc":["Their story begins with a carefully maintained routine, then gradually asks whether safety is worth the cost of never changing.","Their arc explores whether a person can choose a new identity without denying the experiences that shaped them."],"advanced_extra_lore":["A recurring personal ritual anchors them: keeping a small record of ordinary moments that would otherwise disappear.","They collect fragments of stories from people they meet, though they rarely explain why those details matter."],"complex_inner_philosophy":["They believe identity is built from repeated choices, not titles or reputation. They struggle when their own actions contradict the principles they defend.","They distrust absolute answers and prefer a worldview that leaves room for context, responsibility, and change."],"complex_voice":["Their speech is measured and direct, with occasional dry remarks. When uncomfortable, they answer questions with precise questions of their own.","Their voice is gentle but firm. They pause before important words and become noticeably more informal around trusted companions."],"complex_daily_life":["They maintain a modest routine, repair personal belongings instead of replacing them, and keep small reminders of places they have visited.","Their ordinary habits include late-night reading, careful preparation, and a preference for familiar quiet spaces."],"complex_relationship_dynamics":["They show care through practical support, but need time before sharing vulnerabilities. They dislike public confrontation and prefer honest conversations in private.","They are loyal once trust is established, though they struggle to forgive repeated dishonesty."],"complex_visual_motifs":["Recurring motifs include glass, old paper, and reflected light: reminders that appearances can preserve or distort a memory.","Their visual language centers on keys, thread, and unfinished circles, reflecting choice and the difficulty of closure."],"complex_limits":["Their greatest weakness is overcommitting when someone asks for help. Their capabilities require preparation and become less reliable when plans change suddenly.","They are not unbeatable: fatigue, uncertainty, and emotional attachments can disrupt their judgment."],"complex_scenes":["A defining scene shows them choosing to stay and help after every practical reason suggests leaving. The choice is small, but it changes how another person remembers them.","A future turning point may force them to decide whether to preserve an old promise or accept that both people have changed."]};
function randomCharacterName(){const pick=a=>a[Math.floor(Math.random()*a.length)];return pick(RANDOM_GIVEN_NAMES)+' '+pick(RANDOM_FAMILY_NAMES);}
function randomEgoName(theme){const pick=a=>a[Math.floor(Math.random()*a.length)];const pair=RANDOM_EGO_THEME_NAMES[theme]||[['The Unfinished Portrait','A Quiet Ruin','The Last Lantern','The Unnamed Hour'],['Until the Curtain Falls','Where the Echo Sleeps','A Promise Unmade','The Shape of Silence']];return pick(pair[0])+' — '+pick(pair[1]);}
function randomizedWriting(q){if(q.id==="complex_43"){const status=values().complex_41||"";return ["No known E.G.O. or Distortion","Unknown / undisclosed"].includes(status)?"No transformation title is recorded for this character.":randomEgoName(values().complex_42);}const options=RANDOM_WRITING[q.id]||(q.id&&q.id.startsWith("complex_")?["They treat "+q.title.toLowerCase()+" as a personal detail shaped by experience, not a fixed rule. Its meaning changes depending on the people and circumstances around them.","This part of the dossier is defined by a quiet contradiction: the character values consistency, yet their lived experience keeps changing what that means.","Their approach is practical on the surface, but carries a private significance they rarely explain to other people."]:["This part of their story remains open. Their choices, relationships, and experiences will give the details shape over time."]);return options[Math.floor(Math.random()*options.length)];}

function randomizeAll(mode=creationMode){
 creationMode=mode==="complex"?"complex":mode==="advanced"?"advanced":mode==="laziness"?"laziness":"simple";
 answers={};index=0;editingOcId=null;
 characterName=randomCharacterName();$("character-name").value=characterName;
 for(const q of activeQuestions()){
  if(q.showIf&&!q.showIf(values()))continue;
  if(q.freeText){if(q.optional){answers[q.id]={choice:"Optional profile details",value:"",custom:""};continue;}const text=randomizedWriting(q);answers[q.id]={choice:"Detailed response",value:text,custom:text};continue;}
   if(q.multiple){const pool=q.options.filter(x=>x!=="Other / custom answer"&&x!==q.noneOption),shuffled=pool.slice().sort(()=>Math.random()-.5),chosen=q.noneOption&&Math.random()<.12?[q.noneOption]:shuffled.slice(0,Math.max(1,Math.min(q.maxSelections||3,2+Math.floor(Math.random()*2))));answers[q.id]={choice:"Selected options",value:chosen,custom:""};continue;}
  if(q.id==="ego_name"){const name=randomEgoName(values().ego_theme);answers[q.id]={choice:"Other / custom answer",value:name,custom:name};continue;}
  if(q.customizer){
   const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
   const egoPath=egoPathOf(values().ego_status),isLcorp=egoPath==="lobotomy",synergyPool=getSynergyAbnormalities(values().ego_status);
   if(egoPath==="sinner"){answers[q.id]={choice:"Abnormality E.G.O.",value:{sinner_ego:pick(SINNER_EGO_WEAPON_CATALOGUE)},custom:""};continue;}
   answers[q.id]={choice:"Custom E.G.O. loadout",value:{synergy:pick(synergyPool),suit:isLcorp?pick(EGO_SUIT_CATALOGUE):"",category4:pick(isLcorp?L_CORP_EGO_WEAPON_CATALOGUE:DERIVED_EGO_WEAPON_CATALOGUE),gift:isLcorp?pick(EGO_GIFT_CATALOGUE):""},custom:""};continue;
  }
  const opts=typeof q.options==="function"?q.options(values()):q.options;
  const candidates=(opts||[]).filter(o=>!String(o).toLowerCase().includes("custom")&&o!=="Leave blank for now");
  const choice=candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:"Leave blank for now";
  answers[q.id]={choice,value:choice==="Leave blank for now"?"":choice,custom:""};
 }
 pruneHiddenAnswers();finish();
}
function summary(){return formatCharacterDossier(characterName,creationMode,answers);}
$("begin-button").onclick=()=>{resetSephrusSecretState();editingOcId=null;answers={};characterName="";$("character-name").value="";$("name-validation").textContent="";screen("mode");};
$("name-back").onclick=()=>screen("mode");
$("name-continue").onclick=()=>{
 const entered=$("character-name").value.trim();
 if(!entered){$("name-validation").textContent="PLEASE ENTER A NAME TO BEGIN YOUR RECORD."; $("character-name").focus(); return;}
 resetSephrusSecretState();characterName=entered;index=0;render();screen("picker");
};
$("character-name").addEventListener("keydown",event=>{if(event.key==="Enter")$("name-continue").click();});
$("mode-back").onclick=()=>screen("home");
function launchSelectedMode(){resetSephrusSecretState();answers={};editingOcId=null;index=0;characterName="";$("character-name").value="";$("name-validation").textContent="";screen("name");$("character-name").focus();}
function beginSelectedMode(mode){
 creationMode=mode==="complex"?"complex":mode==="advanced"?"advanced":mode==="laziness"?"laziness":"simple";
 answers={};editingOcId=null;index=0;
 if(creationMode==="laziness"){launchSelectedMode();return;}
 const dlg=$("randomize-confirm-dialog");
 $("randomize-confirm-title").textContent="RANDOMIZE "+creationMode.toUpperCase()+" MODE?";
 $("randomize-confirm-description").textContent="Would you like to randomize this "+creationMode.toUpperCase()+" creation mode? Choose randomize for a generated name and answers, or continue manually.";
 if(dlg&&typeof dlg.showModal==="function")dlg.showModal();else launchSelectedMode();
}
$("mode-simple").onclick=()=>beginSelectedMode("simple");
$("mode-advanced").onclick=()=>beginSelectedMode("advanced");
$("mode-complex").onclick=()=>beginSelectedMode("complex");
$("mode-laziness").onclick=()=>beginSelectedMode("laziness");
$("randomize-cancel")?.addEventListener("click",()=>{$("randomize-confirm-dialog")?.close();launchSelectedMode();});
$("randomize-confirm")?.addEventListener("click",()=>{$("randomize-confirm-dialog")?.close();randomizeAll(creationMode);});
$("randomize-confirm-dialog")?.addEventListener("cancel",()=>{launchSelectedMode();});
renderOcHistory();
$("home-button").onclick=()=>screen("home");
$("back-button").onclick=()=>{if(index>0){index--;render();}else{screen("mode");}};
$("next-button").onclick=submit;
$("edit-button").onclick=()=>{index=0;render();screen("picker");};
$("restart-button").onclick=()=>{answers={};characterName="";creationMode="simple";editingOcId=null;index=0;$("character-name").value="";renderOcHistory();screen("home");};
$("copy-button").onclick=async()=>{try{await navigator.clipboard.writeText(summary());$("copy-status").textContent="SUMMARY COPIED TO CLIPBOARD.";}catch{$("copy-status").textContent="CLIPBOARD UNAVAILABLE. PLEASE COPY MANUALLY.";}}

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
 const values=[1,2,3,4].map(n=>record.mode==="complex"?(answers["complex_ability_"+n]?.value||simProfileField(record,"Ability "+n)):(String(answers["generated_ability_"+n]?.value||"").split(/\s+[—–-]\s+/)[0].trim())).filter(value=>value&&value!=="Not specified.");
 if(values.length)return values;

 return SIM_MOVES.slice();
}
function simUltimateOptions(record){
 const answers=record.answers||{};
 const values=[1,2].map(n=>record.mode==="complex"?(answers["complex_ultimate_"+n]?.value||simProfileField(record,"Ultimate Ability "+n)):(String(answers["generated_ultimate_"+n]?.value||"").split(/\s+[—–-]\s+/)[0].trim())).filter(value=>value&&value!=="Not specified.");
 return values.length?values:["Limit Break","Final Resonance"];
}
function simStatusInfliction(record){
 const a=record.answers||{},entry=a.status_infliction||a.complex_status_infliction,raw=entry?.value??entry?.custom??[];
 const values=Array.isArray(raw)?raw:[raw];
 return [...new Set(values.map(value=>String(value).trim()).filter(value=>value&&value!=="No status effect"))].slice(0,3);
}
function simPassiveProfile(record){
 const a=record.answers||{};
 return {text:a.passive_ability?.value||a.complex_passive?.value||"",activation:a.passive_activation?.value||a.complex_passive_activation?.value||"Always active"};
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
 const records=readOcArchive().filter(record=>ids.includes(record.id));
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
 const records=readOcArchive(),box=$("sim-fighter-selectors");box.innerHTML="";
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
 const records=readOcArchive(),teamMap=simMode==="1v1"?["A","B"]:simMode==="2v2"?["A","A","B","B"]:["ffa","ffa","ffa","ffa"];
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
function openSimulator(){document.body.classList.add("simulator-opening");window.setTimeout(()=>{screen("simulator");document.body.classList.remove("simulator-opening");document.body.classList.add("simulator-entered");simSetMode("1v1");},transitionDelay());}
function closeSimulator(){document.body.classList.remove("simulator-entered");document.body.classList.add("simulator-closing");window.setTimeout(()=>{screen("home");document.body.classList.remove("simulator-closing");document.body.classList.add("home-returning");window.setTimeout(()=>document.body.classList.remove("home-returning"),transitionDelay());},transitionDelay());}
$("open-simulator-button")?.addEventListener("click",openSimulator);
$("simulator-back-button")?.addEventListener("click",closeSimulator);
document.querySelectorAll("[data-sim-mode]").forEach(button=>button.addEventListener("click",()=>simSetMode(button.dataset.simMode)));
$("sim-start-button")?.addEventListener("click",simStart);
$("sim-next-turn-button")?.addEventListener("click",simRunTurn);
$("sim-action-actor")?.addEventListener("change",simRefreshAbilityControls);
document.querySelectorAll("[data-sim-ability]").forEach(button=>button.addEventListener("click",()=>simUseAbility(Number(button.dataset.simAbility))));
$("sim-run-all-button")?.addEventListener("click",simRunAll);
$("sim-rematch-button")?.addEventListener("click",simRematch);
$("sim-create-oc-button")?.addEventListener("click",()=>{document.body.classList.remove("simulator-entered");screen("home");$("begin-button").click();});

// Original procedural soundtrack engine, jukebox, and interface sound design.
(function setupAmbientMusic(){
 const toggle=document.getElementById("ambient-music-toggle");
 const status=document.getElementById("ambient-music-status");
 const trackSelect=document.getElementById("jukebox-track");
 const volumeSlider=document.getElementById("jukebox-volume");
 const volumeValue=document.getElementById("jukebox-volume-value");
 const sfxToggle=document.getElementById("interface-sounds-toggle");
 if(!toggle)return;
 const musicKey="uee_ambient_music_enabled_v1",trackKey="uee_jukebox_track_v1",volumeKey="uee_jukebox_volume_v1",sfxKey="uee_interface_sounds_v1";
 const tracks={
  archive:{name:"Archive Drift",notes:[55,82.41,110,164.81],arp:[220,261.63,329.63,392],wave:"sine",speed:620,brightness:720},
  city:{name:"The City Never Sleeps",notes:[65.41,98,130.81,196],arp:[261.63,329.63,392,493.88,392,329.63],wave:"triangle",speed:340,brightness:1050},
  cathedral:{name:"Glass Cathedral",notes:[49,73.42,98,146.83],arp:[196,246.94,293.66,369.99],wave:"sine",speed:510,brightness:880},
  backstreets:{name:"Backstreets Afterhours",notes:[58.27,87.31,116.54,174.61],arp:[233.08,277.18,349.23,415.3,349.23],wave:"triangle",speed:390,brightness:940}
 };
 let context=null,ambientNodes=[],ambientMaster=null,grimNodes=[],grimMaster=null,arpTimer=null,musicEnabled=false,sfxEnabled=true,returnDistorted=false,grimActive=false,currentVolume=.68,currentTrack="city";
 try{musicEnabled=localStorage.getItem(musicKey)==="true";currentTrack=localStorage.getItem(trackKey)||"city";currentVolume=Number(localStorage.getItem(volumeKey)??.68);sfxEnabled=localStorage.getItem(sfxKey)!=="false";}catch{}
 if(!tracks[currentTrack])currentTrack="city";
 currentVolume=Math.max(0,Math.min(1,Number.isFinite(currentVolume)?currentVolume:.68));
 toggle.checked=false;
 if(trackSelect)trackSelect.value=currentTrack;
 if(volumeSlider)volumeSlider.value=String(Math.round(currentVolume*100));
 if(volumeValue)volumeValue.textContent=Math.round(currentVolume*100)+"%";
 if(sfxToggle)sfxToggle.checked=sfxEnabled;
 function audioContext(){const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)return null;if(!context)context=new AudioCtor();if(context.state==="suspended")context.resume();return context;}
 function clearNodes(list){list.splice(0).forEach(node=>{try{node.stop?.();node.disconnect();}catch{}});}
 function makeDistortionCurve(amount){const samples=44100,curve=new Float32Array(samples),k=amount||18;for(let i=0;i<samples;i++){const x=i*2/samples-1;curve[i]=(3+k)*x*20*(Math.PI/180)/(Math.PI+k*Math.abs(x));}return curve;}
 function stopAmbient(){if(arpTimer!==null){window.clearInterval(arpTimer);arpTimer=null;}if(ambientMaster){try{ambientMaster.gain.cancelScheduledValues(context.currentTime);ambientMaster.gain.value=0;}catch{}}clearNodes(ambientNodes);ambientMaster=null;}
 function startAmbient(distorted=false){
  const ctx=audioContext();if(!ctx)return false;
  stopAmbient();
  const preset=tracks[currentTrack]||tracks.city;
  const master=ctx.createGain();master.gain.value=.00001;master.gain.setTargetAtTime((distorted ? .19 : .24)*currentVolume,ctx.currentTime,distorted?1.1:.8);master.connect(ctx.destination);ambientMaster=master;
  let output=master;
  if(distorted){const shaper=ctx.createWaveShaper();shaper.curve=makeDistortionCurve(24);shaper.oversample="4x";const band=ctx.createBiquadFilter();band.type="bandpass";band.frequency.value=340;band.Q.value=.72;shaper.connect(band);band.connect(master);output=shaper;ambientNodes.push(shaper,band);}
  const filter=ctx.createBiquadFilter();filter.type="lowpass";filter.frequency.value=distorted?520:preset.brightness;filter.Q.value=.7;filter.connect(output);ambientNodes.push(filter);
  preset.notes.forEach((frequency,index)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=index===1?preset.wave:"sine";osc.frequency.value=frequency;osc.detune.value=(index%2?4:-3)+(distorted?(index-1.5)*13:0);gain.gain.value=[.17,.075,.105,.045][index];osc.connect(gain);gain.connect(filter);osc.start();ambientNodes.push(osc,gain);});
  const slow=ctx.createOscillator(),depth=ctx.createGain();slow.frequency.value=distorted ? .14 : .055;depth.gain.value=distorted?210:145;slow.connect(depth);depth.connect(filter.frequency);slow.start();ambientNodes.push(slow,depth);
  let step=0;
  const playNote=()=>{if(!context||!ambientMaster)return;const note=ctx.createOscillator(),env=ctx.createGain();note.type=distorted?"triangle":preset.wave;note.frequency.value=preset.arp[step++%preset.arp.length];note.detune.value=distorted?((step%3)-1)*17:((step%4)-1.5)*4;env.gain.setValueAtTime(.0001,ctx.currentTime);env.gain.linearRampToValueAtTime(distorted ? .018 : .035,ctx.currentTime+.035);env.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.34);note.connect(env);env.connect(filter);note.start();note.stop(ctx.currentTime+.36);};
  playNote();arpTimer=window.setInterval(playNote,preset.speed);
  if(status)status.textContent=(distorted?"DISTORTED RETURN · ":"PLAYING · ")+preset.name.toUpperCase();
  return true;
 }
 function beginGrim(){
  grimActive=true;
  if(!musicEnabled)return;
  const ctx=audioContext();if(!ctx)return;
  stopAmbient();
  if(grimMaster){try{grimMaster.gain.value=0;}catch{}}clearNodes(grimNodes);
  const master=ctx.createGain();master.gain.value=.00001;master.gain.setTargetAtTime(.18*currentVolume,ctx.currentTime,.12);master.connect(ctx.destination);grimMaster=master;
  const filter=ctx.createBiquadFilter();filter.type="lowpass";filter.frequency.value=290;filter.Q.value=3.5;filter.connect(master);grimNodes.push(filter);
  [36.71,38.89,55,73.42].forEach((frequency,index)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=index===2?"sawtooth":"sine";osc.frequency.value=frequency;osc.detune.value=[-17,13,4,-9][index];gain.gain.value=[.19,.16,.045,.035][index];osc.connect(gain);gain.connect(filter);osc.start();grimNodes.push(osc,gain);});
  const pulse=ctx.createOscillator(),pulseGain=ctx.createGain();pulse.frequency.value=.17;pulseGain.gain.value=65;pulse.connect(pulseGain);pulseGain.connect(filter.frequency);pulse.start();grimNodes.push(pulse,pulseGain);
  if(status)status.textContent="GRIM · THE ARCHIVE HAS BEEN BREACHED";
 }
 function endGrim(){
  if(!musicEnabled){grimActive=false;return;}
  const ctx=audioContext();if(!ctx){grimActive=false;return;}
  if(grimMaster){try{grimMaster.gain.cancelScheduledValues(ctx.currentTime);grimMaster.gain.value=0;}catch{}}
  clearNodes(grimNodes);grimMaster=null;grimActive=false;returnDistorted=true;startAmbient(true);
 }
 function playUiSound(kind="click"){
  if(!sfxEnabled)return;
  const ctx=audioContext();if(!ctx)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
  const presets={click:[560,390,.055,.075],select:[720,980,.085,.09],open:[420,680,.11,.12],success:[660,990,.14,.14],back:[390,260,.07,.08]};
  const [from,to,duration,level]=presets[kind]||presets.click;
  osc.type=kind==="select"?"triangle":"sine";osc.frequency.setValueAtTime(from,now);osc.frequency.exponentialRampToValueAtTime(to,now+duration);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(level,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+duration+.02);
 }
 toggle.addEventListener("change",()=>{musicEnabled=toggle.checked;try{localStorage.setItem(musicKey,String(musicEnabled));}catch{}if(musicEnabled){if(grimActive)beginGrim();else if(!startAmbient(returnDistorted)){musicEnabled=false;toggle.checked=false;try{localStorage.setItem(musicKey,"false");}catch{}}}else{stopAmbient();if(grimMaster)grimMaster.gain.value=0;clearNodes(grimNodes);grimMaster=null;if(status)status.textContent="AMBIENT MUSIC PAUSED";}});
 if(trackSelect)trackSelect.addEventListener("change",()=>{currentTrack=tracks[trackSelect.value]?trackSelect.value:"city";try{localStorage.setItem(trackKey,currentTrack);}catch{}if(musicEnabled&&!grimActive)startAmbient(returnDistorted);playUiSound("select");});
 if(volumeSlider)volumeSlider.addEventListener("input",()=>{currentVolume=Number(volumeSlider.value)/100;if(volumeValue)volumeValue.textContent=volumeSlider.value+"%";try{localStorage.setItem(volumeKey,String(currentVolume));}catch{}if(ambientMaster&&context)ambientMaster.gain.setTargetAtTime((returnDistorted ? .19 : .24)*currentVolume,context.currentTime,.08);if(grimMaster&&context)grimMaster.gain.setTargetAtTime(.18*currentVolume,context.currentTime,.08);});
 if(sfxToggle)sfxToggle.addEventListener("change",()=>{sfxEnabled=sfxToggle.checked;try{localStorage.setItem(sfxKey,String(sfxEnabled));}catch{}if(sfxEnabled)playUiSound("success");});
 document.addEventListener("click",event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const button=target.closest("button");
  if(!button||button.disabled||button.matches("[data-no-sound]"))return;
  const id=button.id||"";
  const kind=/continue|confirm|complete|save|submit|start|initialize|copy/.test(id+" "+button.textContent.toLowerCase())?"success":/back|close|exit|cancel|home/.test(id+" "+button.textContent.toLowerCase())?"back":/settings-open|begin-button|mode-|simulator|open/.test(id)?"open":"click";
  playUiSound(kind);
 },true);
 document.addEventListener("change",event=>{const target=event.target;if(target instanceof HTMLInputElement&&target.type==="checkbox"&&!target.matches("#interface-sounds-toggle,#ambient-music-toggle"))playUiSound("select");});
 window.ueeEasterEggAudio={beginGrim,endGrim};
 if(musicEnabled&&status)status.textContent="MUSIC SAVED · ENABLE TO START";
})();
/* VIBE CODED UPDATE 1.0.2 — resilient background image loading and persistence. */
(function setupCustomBackground(){
 const input=$("background-image-input"),drop=$("background-dropzone"),status=$("background-upload-status"),previewWrap=$("background-image-preview-wrap"),preview=$("background-image-preview"),remove=$("background-image-remove");
 if(!input||!drop||!status||!previewWrap||!preview||!remove)return;

 const dbName="uee-personalization-v1",storeName="backgrounds",recordKey="home-background",maxBytes=12*1024*1024;
 let objectUrl=null,dbPromise=null;

 function openDb(){
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
   if(!("indexedDB" in window)){reject(new Error("This browser does not support local image storage."));return;}
   let request;
   try{request=indexedDB.open(dbName,1);}catch(error){reject(error);return;}
   request.onupgradeneeded=()=>{
    const db=request.result;
    if(!db.objectStoreNames.contains(storeName))db.createObjectStore(storeName);
   };
   request.onsuccess=()=>{
    const db=request.result;
    db.onversionchange=()=>db.close();
    resolve(db);
   };
   request.onerror=()=>reject(request.error||new Error("Could not open local image storage."));
   request.onblocked=()=>reject(new Error("Close other archive tabs, then try again."));
  }).catch(error=>{dbPromise=null;throw error;});
  return dbPromise;
 }

 function runTransaction(mode,action){
  return openDb().then(db=>new Promise((resolve,reject)=>{
   let result;
   let tx;
   try{
    tx=db.transaction(storeName,mode);
    const request=action(tx.objectStore(storeName));
    request.onsuccess=()=>{result=request.result;};
    request.onerror=()=>reject(request.error||new Error("Image storage request failed."));
    tx.oncomplete=()=>resolve(result);
    tx.onabort=()=>reject(tx.error||new Error("Image storage was interrupted."));
    tx.onerror=()=>reject(tx.error||new Error("Image storage failed."));
   }catch(error){reject(error);}
  }));
 }

 function validateImage(blob){
  return new Promise((resolve,reject)=>{
   const testUrl=URL.createObjectURL(blob),image=new Image();
   let finished=false;
   const finish=(error)=>{
    if(finished)return;
    finished=true;
    image.onload=null;image.onerror=null;
    URL.revokeObjectURL(testUrl);
    if(error)reject(error);else resolve();
   };
   image.onload=()=>image.naturalWidth>0&&image.naturalHeight>0?finish():finish(new Error("The selected file is not a readable image."));
   image.onerror=()=>finish(new Error("The selected image could not be opened. Try a JPG, PNG, or WEBP file."));
   image.src=testUrl;
   if(typeof image.decode==="function"){
    image.decode().then(()=>finish()).catch(()=>finish(new Error("The selected image could not be decoded. Try a JPG, PNG, or WEBP file.")));
   }
  });
 }

 function setStatus(message){status.textContent=message;}

 function applyBlob(blob){
  if(!(blob instanceof Blob)||!blob.size)throw new Error("The saved image could not be read.");
  const nextUrl=URL.createObjectURL(blob);
  document.documentElement.style.setProperty("--user-background-image",'url("'+nextUrl+'")');
  if(objectUrl)URL.revokeObjectURL(objectUrl);
  objectUrl=nextUrl;
  preview.src=nextUrl;
  previewWrap.hidden=false;
  status.textContent="BACKGROUND APPLIED";
 }

 async function saveFile(file){
  if(!file)return;
  const knownImageType=/^image\//i.test(file.type);
  const knownImageExtension=/\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name||"");
  if(!knownImageType&&!knownImageExtension){
   setStatus("PLEASE CHOOSE AN IMAGE FILE");
   return;
  }
  if(file.size>maxBytes){
   setStatus("IMAGE TOO LARGE · MAX 12 MB");
   return;
  }
  if(!file.size){
   setStatus("THE SELECTED FILE IS EMPTY");
   return;
  }

  setStatus("CHECKING IMAGE…");
  try{
   await validateImage(file);
   setStatus("SAVING IMAGE…");
   await runTransaction("readwrite",store=>store.put(file,recordKey));
   applyBlob(file);
  }catch(error){
   setStatus(error?.message||"COULD NOT SAVE IMAGE");
  }
 }

 input.addEventListener("change",()=>{
  const file=input.files&&input.files[0];
  input.value="";
  saveFile(file);
 });

 ["dragenter","dragover"].forEach(type=>drop.addEventListener(type,event=>{
  event.preventDefault();
  drop.classList.add("dragover");
 }));
 ["dragleave","drop"].forEach(type=>drop.addEventListener(type,event=>{
  event.preventDefault();
  drop.classList.remove("dragover");
 }));
 drop.addEventListener("drop",event=>{
  const file=event.dataTransfer&&event.dataTransfer.files&&event.dataTransfer.files[0];
  saveFile(file);
 });
 drop.addEventListener("keydown",event=>{
  if(event.key==="Enter"||event.key===" "){
   event.preventDefault();
   input.click();
  }
 });

 remove.addEventListener("click",async()=>{
  try{
   await runTransaction("readwrite",store=>store.delete(recordKey));
   document.documentElement.style.removeProperty("--user-background-image");
   if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}
   preview.removeAttribute("src");
   previewWrap.hidden=true;
   setStatus("NO IMAGE SELECTED");
  }catch(error){
   setStatus(error?.message||"COULD NOT REMOVE IMAGE");
  }
 });

 runTransaction("readonly",store=>store.get(recordKey)).then(async blob=>{
  if(blob instanceof Blob&&blob.size){
   await validateImage(blob);
   applyBlob(blob);
  }
 }).catch(error=>{
  setStatus(error?.message||"LOCAL IMAGE STORAGE UNAVAILABLE");
 });
})();
