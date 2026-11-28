/* Isolated settings, visual effects, accessibility preferences, audio, and background modules. */
(() => {
const $ = id => document.getElementById(id);
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
// Local accessibility, performance, and creator workflow preferences.
(function setupInterfacePreferences(){
 const storageKey="uee_interface_preferences_v1";
 const defaults={reduceMotion:false,lowPerformance:false,highContrast:false,largeText:false,compactLayout:false,showHints:true,confirmDelete:true,archiveSort:"recent"};
 let saved={...defaults};
 try{
  const parsed=JSON.parse(localStorage.getItem(storageKey)||"{}");
  if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))saved={...saved,...parsed};
 }catch{}
 if(!["recent","name","oldest"].includes(saved.archiveSort))saved.archiveSort=defaults.archiveSort;
 const controls=[...document.querySelectorAll("[data-interface-pref]")],root=document.documentElement;
 function persist(){try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{}}
 function read(key,fallback){return saved[key]===undefined?fallback:saved[key];}
 function apply(){
  root.classList.toggle("pref-reduce-motion",saved.reduceMotion===true);
  root.classList.toggle("pref-low-performance",saved.lowPerformance===true);
  root.classList.toggle("pref-high-contrast",saved.highContrast===true);
  root.classList.toggle("pref-large-text",saved.largeText===true);
  root.classList.toggle("pref-compact-layout",saved.compactLayout===true);
  root.classList.toggle("pref-hide-hints",saved.showHints===false);
  controls.forEach(control=>{
   const value=saved[control.dataset.interfacePref];
   if(control.type==="checkbox")control.checked=value===true;
   else if(value!==undefined)control.value=String(value);
  });
  const archiveSort=$("oc-archive-sort");
  if(archiveSort&&saved.archiveSort)archiveSort.value=saved.archiveSort;
  const rebuiltArchiveSort=$("archive-sort");
  if(rebuiltArchiveSort&&saved.archiveSort)rebuiltArchiveSort.value=saved.archiveSort;
  window.ueeRefreshOcArchive?.();
 }
 window.ueeReadPreference=read;
 window.ueeSavePreference=(key,value)=>{
  saved[key]=value;persist();apply();
 };
 controls.forEach(control=>control.addEventListener("change",()=>{
  const key=control.dataset.interfacePref;
  saved[key]=control.type==="checkbox"?control.checked:control.value;
  persist();apply();
 }));
 $("interface-preferences-reset")?.addEventListener("click",()=>{
  saved={...defaults};persist();apply();window.ueeMarkLastMode?.();
 });
 apply();
 $("begin-button")?.addEventListener("click",()=>requestAnimationFrame(()=>window.ueeMarkLastMode?.()));
})();


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

})();
