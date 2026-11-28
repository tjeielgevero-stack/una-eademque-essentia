(() => {
  "use strict";
  const STORAGE_KEY = "uee_rebuilt_character_archive_v1";
  const $ = id => document.getElementById(id);
  const viewMeta = {
    home:["Overview","MIRROR WORLD ARCHIVE / DESKTOP"],
    creator:["Character Creator","IDENTITY REGISTRATION / REBUILT CREATOR"],
    archive:["Character Archive","LOCAL RECORDS / NEW ARCHIVE"],
    lore:["Lore Book","PROJECT MOON REFERENCE / PRESERVED MODULE"],
    simulator:["Mirror Arena","FICTIONAL MATCH SIMULATOR"],
    multiplayer:["Multiplayer Arena","NETWORKED MIRROR WORLD"],
    observatory:["Mirror Observatory","PRESERVATION / ANALYSIS / EXPORT"],
    about:["About U.E.E Rebuilt","PROJECT FILE / DESKTOP EDITION"]
  };
  let activeView="home", creatorStep=0, editingId=null, previewId=null;

  function readOcArchive(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
      return Array.isArray(value)?value.filter(r=>r&&typeof r==="object"&&typeof r.id==="string"):[];
    }catch(error){console.warn("U.E.E Rebuilt archive read failed:",error);return[];}
  }
  function writeOcArchive(records){
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify(records));
      refreshHome();renderArchive();renderObservatory();
      return true;
    }catch(error){
      console.error("U.E.E Rebuilt archive save failed:",error);
      const status=$("creator-save-status");if(status)status.textContent="SAVE FAILED · LOCAL STORAGE MAY BE FULL";
      return false;
    }
  }
  function profileAnswerText(value){
    if(value==null)return"";
    if(Array.isArray(value))return value.map(profileAnswerText).filter(Boolean).join(", ");
    if(typeof value==="object"){
      const raw=value.choice==="Other / custom answer"&&value.custom?value.custom:(value.value??value.custom??"");
      return profileAnswerText(raw);
    }
    return String(value).trim();
  }
  function answerValue(record,key){return profileAnswerText(record?.answers?.[key]);}
  function dossierLine(label,value){return label+": "+(String(value||"").trim()||"Not specified.");}
  function formatCharacterDossier(recordOrName,mode,rawAnswers){
    const record=recordOrName&&typeof recordOrName==="object"?recordOrName:null;
    if(record?.profileSummary)return record.profileSummary;
    const a=record?.answers||rawAnswers||{};
    const get=(...keys)=>{for(const key of keys){const value=profileAnswerText(a[key]);if(value)return value;}return"";};
    const ability=n=>{
      const name=get("ability_"+n+"_name","ability_"+n,"complex_ability_"+n);
      const description=get("ability_"+n+"_description");
      return [name,description].filter(Boolean).join(" — ");
    };
    const name=record?.name||recordOrName||get("name");
    return[
      dossierLine("Name",name),dossierLine("Title",get("title")),dossierLine("Race",get("race")),
      dossierLine("Affiliation",get("affiliation")),dossierLine("Grade",get("grade","fixer_grade")),
      dossierLine("Appearance",get("appearance")),dossierLine("Origin",get("origin","origin_type")),
      dossierLine("E.G.O",[get("ego_name"),get("ego_appearance")].filter(Boolean).join(" — ")||get("ego_type")),
      dossierLine("E.G.O Type",get("ego_type")),
      dossierLine("Ability 1",ability(1)),dossierLine("Ability 2",ability(2)),
      dossierLine("Ability 3",ability(3)),dossierLine("Ability 4",ability(4)),
      dossierLine("Ultimate Ability 1",[get("ultimate_1_name"),get("ultimate_1_description")].filter(Boolean).join(" — ")||get("ultimate_ability_1")),
      dossierLine("Passive Ability",[get("passive_name"),get("passive_description")].filter(Boolean).join(" — ")||get("passive_ability")),
      dossierLine("Personality",get("personality")),dossierLine("Backstory",get("backstory")),
      dossierLine("Likes",get("likes")),dossierLine("Dislikes",get("dislikes")),dossierLine("Overall",get("overall"))
    ].join("\n\n");
  }
  window.readOcArchive=readOcArchive;
  window.writeOcArchive=writeOcArchive;
  window.profileAnswerText=profileAnswerText;
  window.formatCharacterDossier=formatCharacterDossier;

  function setNav(view){
    document.querySelectorAll(".app-nav-item[data-view]").forEach(button=>button.classList.toggle("is-active",button.dataset.view===view));
  }
  function showView(view,options={}){
    if(!viewMeta[view])view="home";
    activeView=view;
    document.querySelectorAll(".screen").forEach(element=>element.classList.add("hidden"));
    const targetId={home:"home-screen",creator:"creator-screen",archive:"archive-screen",lore:"lore-screen",simulator:"simulator-screen",observatory:"observatory-screen",about:"about-screen"}[view];
    if(targetId)$(targetId)?.classList.remove("hidden");
    if(view!=="multiplayer")$("multiplayer-screen")?.classList.add("hidden");
    $("app-page-title").textContent=viewMeta[view][0];
    $("app-page-kicker").textContent=viewMeta[view][1];
    setNav(view);
    if(view==="home")refreshHome();
    if(view==="archive")renderArchive();
    if(view==="observatory")renderObservatory();
    if(view==="lore"&&options.openDialog!==false)$("lore-book-open")?.click();
    if(view==="multiplayer"){
      $("home-screen")?.classList.remove("hidden");
      $("open-multiplayer-button")?.click();
    }
    document.body.classList.toggle("simulator-entered",view==="simulator");
    $("app-footer-status").textContent="LOCAL ARCHIVE READY";
    window.scrollTo({top:0,behavior:"auto"});
    return view;
  }
  window.ueeDesktopShowView=showView;
  window.ueeDesktopNewCharacter=()=>startNewCharacter();

  async function copyText(text,statusNode){
    try{await navigator.clipboard.writeText(text);if(statusNode)statusNode.textContent="COPIED TO CLIPBOARD";}
    catch{if(statusNode)statusNode.textContent="CLIPBOARD UNAVAILABLE · SELECT AND COPY MANUALLY";}
  }
  function interfacePrefs(){
    try{return JSON.parse(localStorage.getItem("uee_interface_preferences_v1")||"{}");}catch{return{};}
  }
  function defaultArchiveSort(){
    const value=interfacePrefs().archiveSort;
    return["recent","name","oldest"].includes(value)?value:"recent";
  }
  function refreshHome(){
    const rows=readOcArchive().slice().sort((a,b)=>(Date.parse(b.updatedAt||b.createdAt||"")||0)-(Date.parse(a.updatedAt||a.createdAt||"")||0));
    $("home-stat-characters").textContent=String(rows.length);
    $("home-stat-recent").textContent=rows.length?new Date(rows[0].updatedAt||rows[0].createdAt||Date.now()).toLocaleDateString():"—";
    const list=$("home-recent-list");list.replaceChildren();
    if(!rows.length){
      const empty=document.createElement("p");empty.className="app-empty-state";
      empty.textContent="YOUR NEW ARCHIVE IS EMPTY. CREATE A CHARACTER TO BEGIN.";list.append(empty);return;
    }
    rows.slice(0,4).forEach(record=>{
      const card=document.createElement("article");card.className="app-recent-card";
      const name=document.createElement("strong");name.textContent=record.name||"Unnamed Character";
      const meta=document.createElement("small");meta.textContent=[answerValue(record,"title"),answerValue(record,"race"),answerValue(record,"affiliation")].filter(Boolean).join(" · ")||"NEW ARCHIVE RECORD";
      const open=document.createElement("button");open.className="app-button app-button-secondary";open.type="button";open.textContent="OPEN RECORD ↗";open.addEventListener("click",()=>showPreview(record.id));
      card.append(name,meta,open);list.append(card);
    });
  }

  const stepNames=["IDENTITY","APPEARANCE & ORIGIN","E.G.O. PROFILE","ABILITIES & PASSIVES","PERSONALITY & STORY"];
  function setCreatorStep(index){
    creatorStep=Math.max(0,Math.min(4,index));
    document.querySelectorAll("[data-creator-step]").forEach(panel=>panel.classList.toggle("hidden",Number(panel.dataset.creatorStep)!==creatorStep));
    document.querySelectorAll("[data-step-target]").forEach(button=>button.classList.toggle("is-active",Number(button.dataset.stepTarget)===creatorStep));
    $("creator-step-label").textContent="SECTION "+String(creatorStep+1).padStart(2,"0")+" / 05";
    $("creator-step-name").textContent=stepNames[creatorStep];
    $("creator-progress-fill").style.width=((creatorStep+1)*20)+"%";
    $("creator-step-back").disabled=creatorStep===0;
    $("creator-step-back").style.opacity=creatorStep===0?".35":"1";
    $("creator-step-next").classList.toggle("hidden",creatorStep===4);
    $("creator-save-button").classList.toggle("hidden",creatorStep!==4);
  }
  function resetCreator(){
    $("creator-form").reset();
    $("creator-save-status").textContent="DRAFT IS LOCAL TO THIS DEVICE";
    setCreatorStep(0);
  }
  function startNewCharacter(prefillName=""){
    editingId=null;resetCreator();$("creator-heading").textContent="CREATE A NEW CHARACTER";
    $('creator-form').querySelector('[data-field="name"]').value=prefillName;
    showView("creator");
  }
  function beginEdit(record){
    if(!record)return;
    editingId=record.id;resetCreator();$("creator-heading").textContent="EDIT CHARACTER RECORD";
    document.querySelectorAll("[data-field]").forEach(input=>{
      const key=input.dataset.field;
      input.value=key==="name"?(record.name||""):answerValue(record,key);
    });
    setCreatorStep(0);showView("creator");
  }
  function getFormValues(){
    const values={};
    document.querySelectorAll("[data-field]").forEach(input=>{values[input.dataset.field]=String(input.value||"").trim();});
    return values;
  }
  function buildAnswerMap(values){
    const answers={};
    Object.entries(values).forEach(([key,value])=>{if(key!=="name")answers[key]={value};});
    answers.title={value:values.title||""};
    answers.race={value:values.race||""};
    answers.affiliation={value:values.affiliation||""};
    answers.grade={value:values.grade||""};
    answers.fixer_grade=answers.grade;
    answers.appearance={value:[values.appearance,values.visual_details].filter(Boolean).join("\n\n")};
    answers.origin={value:values.origin||""};
    answers.origin_type=answers.origin;
    answers.upbringing={value:values.upbringing||""};
    answers.ego_name={value:values.ego_name||""};
    answers.ego_status={value:values.ego_type||""};
    answers.ego_type={value:values.ego_type||""};
    answers.ego_appearance={value:values.ego_appearance||""};
    answers.ego_function={value:values.ego_function||""};
    for(let n=1;n<=4;n++){
      const value=[values["ability_"+n+"_name"],values["ability_"+n+"_description"]].filter(Boolean).join(" — ");
      answers["ability_"+n]={value};
      answers["complex_ability_"+n]={value};
    }
    answers.ultimate_ability_1={value:[values.ultimate_1_name,values.ultimate_1_description].filter(Boolean).join(" — ")};
    answers.passive_ability={value:[values.passive_name,values.passive_description].filter(Boolean).join(" — ")};
    return answers;
  }
  function buildDossier(values){
    const ability=n=>[values["ability_"+n+"_name"],values["ability_"+n+"_description"]].filter(Boolean).join(" — ");
    return[
      dossierLine("Name",values.name),dossierLine("Title",values.title),dossierLine("Race",values.race),
      dossierLine("Affiliation",values.affiliation),dossierLine("Grade",values.grade),
      dossierLine("Appearance",[values.appearance,values.visual_details].filter(Boolean).join("\n\n")),
      dossierLine("Origin",[values.origin,values.upbringing].filter(Boolean).join(" — ")),
      dossierLine("E.G.O",[values.ego_name,values.ego_appearance,values.ego_function].filter(Boolean).join(" — ")||values.ego_type),
      dossierLine("E.G.O Type",values.ego_type),
      dossierLine("Ability 1",ability(1)),dossierLine("Ability 2",ability(2)),dossierLine("Ability 3",ability(3)),dossierLine("Ability 4",ability(4)),
      dossierLine("Ultimate Ability 1",[values.ultimate_1_name,values.ultimate_1_description].filter(Boolean).join(" — ")),
      dossierLine("Passive Ability",[values.passive_name,values.passive_description].filter(Boolean).join(" — ")),
      dossierLine("Personality",values.personality),dossierLine("Backstory",values.backstory),
      dossierLine("Likes",values.likes),dossierLine("Dislikes",values.dislikes),dossierLine("Overall",values.overall)
    ].join("\n\n");
  }
  function saveCharacter(event){
    event.preventDefault();
    const values=getFormValues();
    if(!values.name){setCreatorStep(0);$('creator-form').querySelector('[data-field="name"]').focus();$("creator-save-status").textContent="PLEASE ENTER A CHARACTER NAME";return;}
    if(!values.race){setCreatorStep(0);$('creator-form').querySelector('[data-field="race"]').focus();$("creator-save-status").textContent="PLEASE ENTER A RACE";return;}
    const rows=readOcArchive(),existing=rows.find(record=>record.id===editingId),now=new Date().toISOString();
    const record={
      id:editingId||("rebuilt_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8)),
      name:values.name,mode:"rebuilt",answers:buildAnswerMap(values),profileSummary:buildDossier(values),
      createdAt:existing?.createdAt||now,updatedAt:now,schema:"uee-rebuilt-character-v1"
    };
    const index=rows.findIndex(item=>item.id===record.id);
    if(index>=0)rows[index]=record;else rows.push(record);
    if(!writeOcArchive(rows))return;
    editingId=null;$("creator-save-status").textContent="CHARACTER SAVED TO THE NEW ARCHIVE";showView("archive");
  }

  function renderArchive(){
    const list=$("archive-list");if(!list)return;
    const all=readOcArchive(),query=($("archive-search").value||"").trim().toLowerCase();
    const sort=$("archive-sort").value||defaultArchiveSort();$("archive-sort").value=sort;
    let rows=all.filter(record=>!query||[record.name,record.profileSummary,answerValue(record,"title"),answerValue(record,"origin")].join(" ").toLowerCase().includes(query));
    rows.sort((a,b)=>sort==="name"?String(a.name||"").localeCompare(String(b.name||"")):sort==="oldest"?(Date.parse(a.createdAt||"")||0)-(Date.parse(b.createdAt||"")||0):(Date.parse(b.updatedAt||b.createdAt||"")||0)-(Date.parse(a.updatedAt||a.createdAt||"")||0));
    $("archive-result-count").textContent=(query?rows.length+" MATCHES / ":"")+all.length+" RECORDS";
    list.replaceChildren();
    if(!rows.length){
      const empty=document.createElement("p");empty.className="app-empty-state";
      empty.textContent=all.length?"NO RECORDS MATCH THIS SEARCH.":"THE NEW ARCHIVE IS EMPTY. CREATE YOUR FIRST CHARACTER.";
      list.append(empty);return;
    }
    rows.forEach(record=>{
      const card=document.createElement("article");card.className="archive-card";
      const name=document.createElement("strong");name.textContent=record.name||"Unnamed Character";
      const meta=document.createElement("small");meta.textContent=[answerValue(record,"title"),answerValue(record,"race"),answerValue(record,"affiliation")].filter(Boolean).join(" · ")||"CHARACTER RECORD";
      const date=document.createElement("small");date.textContent="UPDATED "+new Date(record.updatedAt||record.createdAt||Date.now()).toLocaleString();
      const actions=document.createElement("div");actions.className="archive-card-actions";
      const view=document.createElement("button");view.className="app-button app-button-secondary";view.textContent="VIEW DOSSIER";view.addEventListener("click",()=>showPreview(record.id));
      const edit=document.createElement("button");edit.className="app-button app-button-secondary";edit.textContent="EDIT";edit.addEventListener("click",()=>beginEdit(record));
      const copy=document.createElement("button");copy.className="app-button app-button-secondary";copy.textContent="COPY";copy.addEventListener("click",()=>copyText(record.profileSummary));
      const remove=document.createElement("button");remove.className="app-text-button";remove.textContent="DELETE";remove.addEventListener("click",()=>deleteRecord(record.id));
      actions.append(view,edit,copy,remove);card.append(name,meta,date,actions);list.append(card);
    });
  }
  function deleteRecord(id){
    const prefs=interfacePrefs();
    if(prefs.confirmDelete!==false&&!window.confirm("Delete this character from the U.E.E Rebuilt archive? This cannot be undone."))return;
    writeOcArchive(readOcArchive().filter(record=>record.id!==id));
    if(previewId===id)$("character-preview").close();
  }
  function showPreview(id){
    const record=readOcArchive().find(item=>item.id===id);if(!record)return;
    previewId=id;$("character-preview-title").textContent=record.name||"CHARACTER RECORD";
    $("character-preview-text").textContent=record.profileSummary||formatCharacterDossier(record);
    $("character-preview").showModal();
  }
  function renderObservatory(){
    if(!$("obs-search"))return;
    const query=$("obs-search").value.trim().toLowerCase();
    const rows=readOcArchive().filter(record=>[record.name,record.profileSummary].join(" ").toLowerCase().includes(query)).slice(0,12);
    $("obs-search-results").textContent=rows.length?rows.map(record=>record.name).join("\n"):"No matching records.";
  }
  function exportBackup(){
    const data={format:"uee-rebuilt-archive-backup",version:1,exportedAt:new Date().toISOString(),records:readOcArchive()};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
    const link=document.createElement("a");link.href=url;link.download="UEE-Rebuilt-Archive-"+new Date().toISOString().slice(0,10)+".json";link.click();URL.revokeObjectURL(url);
  }
  function importBackup(file){
    if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const parsed=JSON.parse(String(reader.result||""));
        if(parsed?.format!=="uee-rebuilt-archive-backup"||!Array.isArray(parsed.records))throw new Error("That file is not a U.E.E Rebuilt backup.");
        const old=readOcArchive(),ids=new Set(old.map(record=>record.id));
        const incoming=parsed.records.filter(record=>record&&typeof record.id==="string"&&record.answers&&typeof record.answers==="object"&&!ids.has(record.id));
        writeOcArchive(old.concat(incoming));$("obs-import-status").textContent=incoming.length+" new records imported; matching IDs skipped.";
      }catch(error){$("obs-import-status").textContent=error.message||"IMPORT FAILED";}
    };
    reader.onerror=()=>{$("obs-import-status").textContent="COULD NOT READ THE SELECTED FILE";};
    reader.readAsText(file);
  }
  function scanArchive(){
    const rows=readOcArchive(),ids=new Set();let duplicate=0,missing=0,invalid=0;
    rows.forEach(record=>{if(!record.id||!record.name)missing++;if(!record.answers||typeof record.answers!=="object"||!record.profileSummary)invalid++;if(ids.has(record.id))duplicate++;ids.add(record.id);});
    $("obs-scan-status").textContent=rows.length+" checked · "+duplicate+" duplicate IDs · "+missing+" incomplete identities · "+invalid+" malformed records.";
  }

  document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",event=>{
    event.preventDefault();
    const view=button.dataset.view;
    if(view==="simulator"){$("open-simulator-button")?.click();return;}
    showView(view);
  }));
  document.querySelectorAll("[data-action='new-character']").forEach(button=>button.addEventListener("click",()=>startNewCharacter()));
  $("creator-form").addEventListener("submit",saveCharacter);
  $("creator-step-next").addEventListener("click",()=>{
    if(creatorStep===0&&!String($('creator-form').querySelector('[data-field="name"]').value||"").trim()){$('creator-form').querySelector('[data-field="name"]').focus();$("creator-save-status").textContent="PLEASE ENTER A CHARACTER NAME";return;}
    setCreatorStep(creatorStep+1);
  });
  $("creator-step-back").addEventListener("click",()=>setCreatorStep(creatorStep-1));
  document.querySelectorAll("[data-step-target]").forEach(button=>button.addEventListener("click",()=>setCreatorStep(Number(button.dataset.stepTarget))));
  $("archive-search").addEventListener("input",renderArchive);
  $("archive-sort").addEventListener("change",renderArchive);
  $("archive-clear").addEventListener("click",()=>{$("archive-search").value="";$("archive-sort").value=defaultArchiveSort();renderArchive();});
  $("character-preview-close").addEventListener("click",()=>$("character-preview").close());
  $("character-preview-edit").addEventListener("click",()=>{const record=readOcArchive().find(item=>item.id===previewId);$("character-preview").close();if(record)beginEdit(record);});
  $("character-preview-copy").addEventListener("click",()=>{const record=readOcArchive().find(item=>item.id===previewId);if(record)copyText(record.profileSummary);});
  $("character-preview-delete").addEventListener("click",()=>deleteRecord(previewId));
  $("obs-export").addEventListener("click",exportBackup);
  $("obs-import-open").addEventListener("click",()=>$("obs-import-file").click());
  $("obs-import-file").addEventListener("change",event=>{const file=event.target.files?.[0];event.target.value="";importBackup(file);});
  $("obs-scan").addEventListener("click",scanArchive);
  $("obs-search").addEventListener("input",renderObservatory);
  $("lore-book-launch").addEventListener("click",()=>$("lore-book-open").click());
  $("desktop-sephrus-gate").addEventListener("click",()=>{$("desktop-sephrus-feedback").textContent="";$("desktop-sephrus-answer").value="";$("desktop-sephrus-prompt").showModal();$("desktop-sephrus-answer").focus();});
  $("desktop-sephrus-cancel").addEventListener("click",()=>$("desktop-sephrus-prompt").close());
  $("desktop-sephrus-form").addEventListener("submit",event=>{
    event.preventDefault();
    if($("desktop-sephrus-answer").value==="Sephrus Aztiluth"){$("desktop-sephrus-maker").hidden=false;$("desktop-sephrus-feedback").textContent="ACCESS GRANTED.";$("desktop-sephrus-prompt").close();}
    else{$("desktop-sephrus-feedback").textContent="IDENTITY NOT RECOGNIZED.";$("desktop-sephrus-answer").select();}
  });
  $("desktop-sephrus-maker").addEventListener("click",()=>{startNewCharacter("Sephrus Aztiluth");showView("creator");});
  document.addEventListener("click",event=>{if(event.target.closest("#mp-back"))showView("home");});
  document.addEventListener("keydown",event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();showView("archive");$("archive-search").focus();}
    if(event.key==="Escape"&&$("character-preview").open)$("character-preview").close();
  });
  setCreatorStep(0);refreshHome();renderArchive();
  window.ueeDesktopAppReady=true;
})();