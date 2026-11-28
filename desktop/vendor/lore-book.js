/* Una Eademque Essentia — original Project Moon lore encyclopedia summaries. */
(() => {
  "use strict";
  const volumes = {
    city: [
      {category:"SETTING",title:"The City",body:"A vast, densely populated metropolis divided into numbered Districts. Its social order is shaped by extreme inequality, powerful corporations, specialized technology, and institutions that regulate nearly every part of life. The City is the shared setting connecting the three games."},
      {category:"GEOGRAPHY",title:"Nests and Backstreets",body:"Each District contains a Nest associated with a Wing and the surrounding Backstreets. Nests generally offer greater security and resources to those with access, while the Backstreets are harsher neighborhoods where residents rely on local networks, Fixers, and other organizations."},
      {category:"CORPORATIONS",title:"Wings and Singularities",body:"A Wing is a major corporation recognized by the City. Each Wing possesses a Singularity: an extraordinary technology with rules and applications unique to that organization. A Wing's influence can reshape its District, but its position is never guaranteed forever."},
      {category:"PROFESSION",title:"Fixers and Offices",body:"Fixers take paid requests ranging from protection and investigation to delivery, negotiation, and other specialized work. Many operate independently or through small Offices. Their professional standing is represented by Grades, while the Hana Association oversees the recognized Fixer system."},
      {category:"ORGANIZATIONS",title:"Fixer Associations",body:"Associations are large organizations that coordinate and specialize in particular kinds of Fixer work. Their branches and Sections handle different requests and territories. They are distinct from independent Offices, which are generally smaller groups of Fixers."},
      {category:"UNDERWORLD",title:"Syndicates and the Five Fingers",body:"Syndicates are organized criminal groups operating throughout the Backstreets. The Five Fingers are especially influential underworld powers, each associated with its own hierarchy, customs, and methods of control. Their reach differs across Districts."},
      {category:"AUTHORITY",title:"The Head",body:"The Head is the City's highest known governing authority, supported by the Eye and the Claw. It enforces the City's foundational laws and restrictions. Its power is immense, but the exact limits and internal workings are not fully explained in every story."},
      {category:"BEYOND THE CITY",title:"The Outskirts and Ruins",body:"Beyond the City's maintained boundaries lie the Outskirts and the Ruins: dangerous, poorly understood regions that contain abandoned places, strange phenomena, and communities outside ordinary City life. They are not simply another District."}
    ],
    lobotomy: [
      {category:"OVERVIEW",title:"Lobotomy Corporation",body:"Lobotomy Corporation was a Wing whose facilities extracted energy from Abnormalities. Its branches contained specialized departments, employees, and containment systems. The corporation's collapse left abandoned facilities and a legacy that continues to affect the City."},
      {category:"FACILITIES",title:"The Main Facility",body:"The player oversees a facility where employees are assigned to work with contained Abnormalities and produce Enkephalin. The facility is organized into departments, each with its own managerial responsibilities and research history."},
      {category:"ENTITIES",title:"Abnormalities",body:"Abnormalities are anomalous beings or phenomena held by Lobotomy Corporation for study and energy extraction. Their origins and behavior vary widely. Employee encounters with them are documented in observation records, and their containment requires understanding their individual traits."},
      {category:"ENERGY",title:"Enkephalin",body:"Enkephalin is the energy product associated with Lobotomy Corporation's extraction process. It powered the corporation's business and technology. The abandoned branches explored in later stories still contain traces of the old facilities and their operations."},
      {category:"EQUIPMENT",title:"E.G.O.",body:"E.G.O. is equipment or an expression of power connected to the psyche and the experience of confronting Abnormalities. Lobotomy Corporation developed equipment from Abnormality-derived materials. E.G.O. is not identical to an Abnormality, even when the two are closely connected."},
      {category:"PERSONNEL",title:"Sephirah and Departments",body:"The facility's Sephirah are managerial figures associated with its departments and its buried history. Their stories reveal the people and decisions behind the corporation, while the department structure gives the facility its operational organization."},
      {category:"STORY",title:"The Seed of Light",body:"The Seed of Light is central to Lobotomy Corporation's larger purpose and to the events that follow the facility's collapse. The project was intended to bring about a profound change in the City, but its outcome becomes a major point of conflict in the next chapter of the story."},
      {category:"STORY / SPOILERS",title:"White Nights and Dark Days",body:"White Nights and Dark Days refers to the extraordinary event tied to the release of the Light and the fate of people across the City. Its consequences shape the world encountered in Library of Ruina and remain relevant to Limbus Company."}
    ],
    ruina: [
      {category:"OVERVIEW",title:"The Library",body:"The Library is the central location of Library of Ruina, formed from the remains of Lobotomy Corporation's former headquarters and the power of the Light. It draws Guests through Invitations and gathers Books, becoming a place where the City's people and histories converge."},
      {category:"CHARACTERS",title:"Angela and Roland",body:"Angela is the Library's director, seeking a particular Book connected to her wish to become human. Roland is a Fixer who becomes involved with the Library and serves as a guide to its strange rules. Their partnership and disagreements drive much of the story."},
      {category:"SYSTEM",title:"Invitations and Guests",body:"Invitations are the Library's means of reaching people outside its walls. Those who accept become Guests and face a Reception. The Books used in an Invitation are connected to its intended recipients, and the outcome determines what the Guests take away."},
      {category:"LIBRARY",title:"Books",body:"Books are records created through the Library's power. A Book can preserve a person's memories and experiences, while other Books contain information about places, organizations, or events. The Library uses them to expand its collection and reach new Guests."},
      {category:"PERSONNEL",title:"Librarians and Floors",body:"The Library is staffed by Angela and the former Sephirah, who serve as Patron Librarians. Each floor has its own Librarians, identity, and Abnormality-related history. The floor structure reflects the former facility while becoming something new."},
      {category:"BATTLES",title:"Receptions",body:"A Reception is the encounter that takes place when Guests answer an Invitation. The Library's Librarians defend the collection, and the result can add new Books to the Library. Story Receptions move the central narrative forward; other Invitations broaden the collection."},
      {category:"PHENOMENA",title:"Distortions and E.G.O.",body:"The story explores how intense emotions and personal crises can lead to unusual manifestations. Some people Distort, becoming expressions of a warped inner state; others manifest E.G.O., giving form to a more integrated sense of self. These outcomes are related but not interchangeable."},
      {category:"SETTING",title:"The City Beyond the Library",body:"The Library's Guests bring the wider City into the story: Fixers, Associations, Offices, Syndicates, Wings, and ordinary residents. Their experiences show how the City's institutions shape individual lives, and how the Library's actions ripple beyond its walls."}
    ],
    limbus: [
      {category:"OVERVIEW",title:"Limbus Company",body:"Limbus Company is an organization operating in the aftermath of Lobotomy Corporation's collapse. Its LCB Bus Department travels through the City to recover Golden Boughs from abandoned L Corp. branch facilities. The official premise describes the journey as a mission carried out aboard a bus with twelve Sinners."},
      {category:"LEADERSHIP",title:"Dante",body:"Dante is the Executive Manager of the LCB team. Their clock-shaped head and contract with the Sinners are central to the story. Dante directs the group and has a distinctive ability connected to the Sinners' recovery."},
      {category:"TEAM",title:"The Twelve Sinners",body:"The Bus Department consists of twelve Sinners, each inspired by a literary figure and carrying a personal history into the journey. Their relationships, conflicts, and individual Canto stories form the emotional center of the game."},
      {category:"TRANSPORT",title:"Mephistopheles",body:"Mephistopheles is the bus used by the LCB team to travel between locations. It is more than ordinary transport: its unusual nature and the people responsible for its operation are part of the team's daily life."},
      {category:"OBJECTIVE",title:"Golden Boughs",body:"Golden Boughs are mysterious remnants associated with Lobotomy Corporation's technology and abandoned branch facilities. Limbus Company's central mission is to locate and retrieve them. Their effects and meaning become increasingly important as the journey progresses."},
      {category:"IDENTITIES",title:"Identities and Mirror Worlds",body:"Identities represent alternate possibilities for a Sinner, drawing on different lives and circumstances across Mirror Worlds. They allow the game to explore how the same person might develop under different conditions without treating every possibility as the same lived history."},
      {category:"POWER",title:"E.G.O. in Limbus Company",body:"E.G.O. appears as an important expression of a character's inner world and their relationship with the phenomena they encounter. The Sinners can manifest E.G.O. in different ways, while Abnormality-derived equipment also remains part of the wider setting."},
      {category:"JOURNEY",title:"Cantos",body:"Each Canto focuses on one Sinner and adapts themes and conflicts associated with that character's literary source. The chapters gradually reveal more about the Sinners, the company, the City, and the purpose of the Golden Bough expedition."}
    ]
  };

  const dialog=document.getElementById("lore-book-overlay");
  const open=document.getElementById("lore-book-open");
  const close=document.getElementById("lore-book-close");
  const search=document.getElementById("lore-book-search");
  const content=document.getElementById("lore-book-content");
  const tabs=[...document.querySelectorAll("[data-lore-volume]")];
  if(!dialog||!open||!close||!search||!content)return;
  let activeVolume="city";

  function render(){
    const query=search.value.trim().toLocaleLowerCase();
    const entries=(volumes[activeVolume]||[]).filter(entry=>
      !query||[entry.category,entry.title,entry.body].join(" ").toLocaleLowerCase().includes(query)
    );
    content.replaceChildren();
    if(!entries.length){
      const empty=document.createElement("p");
      empty.className="lore-empty";
      empty.textContent="NO MATCHING RECORDS IN THIS VOLUME.";
      content.append(empty);
      return;
    }
    entries.forEach(entry=>{
      const card=document.createElement("article");
      card.className="lore-entry";
      const category=document.createElement("span");
      category.className="lore-entry-kicker";
      category.textContent=entry.category;
      const title=document.createElement("h3");
      title.textContent=entry.title;
      const body=document.createElement("p");
      body.textContent=entry.body;
      card.append(category,title,body);
      content.append(card);
    });
  }

  tabs.forEach(tab=>tab.addEventListener("click",()=>{
    activeVolume=tab.dataset.loreVolume;
    tabs.forEach(item=>{
      const selected=item===tab;
      item.classList.toggle("is-active",selected);
      item.setAttribute("aria-pressed",String(selected));
    });
    render();
  }));
  search.addEventListener("input",render);
  open.addEventListener("click",()=>{
    dialog.showModal();
    open.setAttribute("aria-expanded","true");
    search.focus();
  });
  const closeDialog=()=>{
    dialog.close();
    open.setAttribute("aria-expanded","false");
  };
  close.addEventListener("click",closeDialog);
  dialog.addEventListener("click",event=>{if(event.target===dialog)closeDialog();});
  dialog.addEventListener("close",()=>open.setAttribute("aria-expanded","false"));
  render();
})();
