/* Project Moon Variant Builder catalogue data.
   Edit these arrays/records to update Synergy, Suit, and Gift suggestions.
*/
const L_CORP_ABNORMALITIES = [
  "Army in Black",
  "Don't Touch Me",
  "Fairy Festival",
  "Mirror of Adjustment",
  "Old Faith and Promise",
  "One Sin and Hundreds of Good Deeds",
  "Opened Can of WellCheers",
  "Plague Doctor",
  "We Can Change Anything",
  "You Must Be Happy",
  "You're Bald...",
  "1.76 MHz",
  "Beauty and the Beast",
  "Behavior Adjustment",
  "Bloodbath",
  "Crumbling Armor",
  "Forsaken Murderer",
  "Fragment of the Universe",
  "Grave of Cherry Blossoms",
  "Luminous Bracelet",
  "Meat Lantern",
  "Old Lady",
  "Ppodae",
  "Punishing Bird",
  "Scorched Girl",
  "Skin Prophecy",
  "Spider Bud",
  "Standard Training-Dummy Rabbit (tutorial-exclusive)",
  "The Heart of Aspiration",
  "The Lady Facing the Wall",
  "Theresia",
  "Today's Shy Look",
  "Void Dream",
  "All-Around Helper",
  "Child of the Galaxy",
  "Der Freischütz",
  "Giant Tree Sap",
  "Happy Teddy Bear",
  "Laetitia",
  "Nameless Fetus",
  "Notes from a Crazed Researcher",
  "Porccubus",
  "Portrait of Another World",
  "Rudolta of the Sleigh",
  "Scarecrow Searching for Wisdom",
  "Schadenfreude",
  "Shelter from the 27th of March",
  "Singing Machine",
  "The Funeral of the Dead Butterflies",
  "The Red Shoes",
  "The Snow Queen",
  "Warm-hearted Woodsman",
  "Alriune",
  "Backward Clock",
  "Big and Will be Bad Wolf",
  "Big Bird",
  "Clouded Monk",
  "Dimensional Refraction Variant",
  "Dream of a Black Swan",
  "Express Train to Hell",
  "Flesh Idol",
  "Il Pianto della Luna",
  "Judgement Bird",
  "Little Red Riding Hooded Mercenary",
  "Parasite Tree",
  "Queen Bee",
  "Snow White's Apple",
  "The Burrowing Heaven",
  "The Dreaming Current",
  "The Firebird",
  "The King of Greed",
  "The Knight of Despair",
  "The Little Prince",
  "The Naked Nest",
  "The Queen of Hatred",
  "Yang",
  "Yin",
  "Apocalypse Bird",
  "Blue Star",
  "CENSORED",
  "Melting Love",
  "Mountain of Smiling Bodies",
  "Nothing There",
  "The Silent Orchestra",
  "WhiteNight"
];

// Distinct legacy labels and records are separated from the current facility catalogue.
const L_CORP_LEGACY_RECORDS = [
  "Hammer of Light",
  "Poor Screenwriter's Note",
  "Price of Silence",
  "Abandoned Murderer (legacy name for Forsaken Murderer)",
  "Happy Teddy (legacy name for Happy Teddy Bear)",
  "Red Shoes (legacy name for The Red Shoes)",
  "Woman Facing the Wall (legacy name for The Lady Facing the Wall)",
  "Rudol-ta of Sled (legacy name for Rudolta of the Sleigh)",
  "QueenBee (legacy spelling of Queen Bee)",
  "The Child of Galaxy (legacy name for Child of the Galaxy)",
  "Big and Might be Bad Wolf (legacy variant title)"
];
const L_CORP_ARCHIVE_ONLY = [
  "My Sweet Orange Tree (unreleased donor concept)"
];

// Outside-L-Corp. entries are collated from the Limbus Company Abnormality category.
// Enemy pages and duplicate forms are collapsed into one readable record; L Corp. overlaps stay above.
const OUTSIDE_L_CORP_ABNORMALITIES = [
  "All-Around Cleaner",
  "Alleyway Watchdog",
  "Ambling Pearl",
  "Ardor Blossom Moth",
  "Baba Yaga",
  "Basilisoup",
  "Become Strong? Genuinely?",
  "Blubbering Toad",
  "Blue-ish Star",
  "Brazen Bull",
  "Broken Wings",
  "Burning Clay Doll",
  "Burning Duchess",
  "Butterfly of Entangled Lives",
  "Centaur",
  "Centipede Apostle",
  "Chattering Teeth",
  "Children in the Flask",
  "Clippity-cloppity? Tap Away!",
  "Clockwork-Time-Roly-Poly",
  "Cozy Bed",
  "Cyclops",
  "Der Fluchschütze",
  "Dimensional Orbit Stabilizer",
  "Dimensional Oxidation Variant",
  "Dimensional Rifts",
  "Doomsday Calendar",
  "Doomsday Clay Doll",
  "Dream-Devouring Siltcurrent",
  "Dreaming Electric Sheep",
  "Drenched Gossypium",
  "Drifting Fox",
  "Drunkard",
  "Ebony Queen's Apple",
  "Envy-drenched Rose",
  "Explorer on a Bereaved Road",
  "Faelantern",
  "Fairy Gentleman",
  "Fairy Mass",
  "Fairy Wine",
  "Fairy-Long-Legs",
  "Forsaken Employee",
  "Four-hundred Roses",
  "Freezing Miner Slave",
  "Funeral of a Dying Butterfly",
  "Geseundae",
  "Giant Leaf",
  "Gloom-drenched Rose",
  "Gluttony-drenched Rose",
  "Golden Apple",
  "Golden Grip",
  "Grown Powerful! For Realsies?",
  "Handshake of Handshakes",
  "Have You Become Strong",
  "Headless Ichthys",
  "Heart of the Townsfolk",
  "Heavenly Commander's Scribe",
  "Heavenly Executor's Scribe",
  "Highway Devotee",
  "Hollowed Man",
  "Hurting Teddy Bear",
  "Hydra",
  "Illusory Butterfly of Entangled Lives (Past / Present / Future forms)",
  "Kqe-1j-23",
  "Lust-drenched Rose",
  "Monkey Tree",
  "My Form Empties",
  "Nymph",
  "Old Umbrella",
  "One Who Emerged from the Earth",
  "Overdue Assignments",
  "Pagoda Veneration",
  "Paper Chairman",
  "Pink Shoes",
  "Pink Shoes — Enchantee / Possessee forms",
  "Portrait of a Certain Day",
  "Pride-drenched Rose",
  "Rearisen Neighbor",
  "Recurring Faith and Promise",
  "Resident of Metropolaris",
  "Rising Ashes",
  "Rose Hunter",
  "Sandolph",
  "Shivering Miner Slave",
  "Shock Centipede",
  "Sign of Roses",
  "Skin Prophet",
  "Sleeping Bag of a Bygone Day",
  "Sleepyhead",
  "Sloth-drenched Rose",
  "Slumber-broken Neighbor",
  "Smokey Old Man",
  "So That No One Will Cry",
  "Spider of Marriage",
  "Spiral of Contempt",
  "Star Luminary",
  "Steam Transport Machine",
  "Stuck in Heaven",
  "Sunset Wayfarer",
  "The 4th Front of the Smoke War",
  "The King in Binds",
  "Time Duck",
  "Tomb of Bone",
  "Tomorrow's Expression",
  "Wailing Coffin",
  "Wandering Heart",
  "Wayward Passenger",
  "Will You Play?",
  "Yinglong",
  "You Want To Get Beat? Hurtily?"
];


const EGO_RECORDS = {
  // Suit and Gift entries are recorded only where an L Corp. Abnormality has a documented match.
  "Standard Training-Dummy Rabbit (tutorial-exclusive)": {suit:"Standard Training E.G.O"},
  "Scorched Girl": {suit:"Fourth Match Flame", gift:"Fourth Match Flame"},
  "One Sin and Hundreds of Good Deeds": {suit:"Penitence", gift:"Penitence"},
  "The Queen of Hatred": {suit:"In the Name of Love and Hate", gift:"In the Name of Love and Hate"},
  "Happy Teddy Bear": {suit:"Bear Paws", gift:"Bear Paws"},
  "The Red Shoes": {suit:"Sanguine Desire", gift:"Sanguine Desire"},
  "Old Lady": {suit:"Solitude", gift:"Solitude"},
  "Nameless Fetus": {suit:"Syrinx", gift:"Syrinx"},
  "The Lady Facing the Wall": {suit:"Screaming Wedge"},
  "Nothing There": {suit:"Mimicry", gift:"Mimicry"},
  "1.76 MHz": {suit:"Noise", gift:"Noise"},
  "Singing Machine": {suit:"Harmony", gift:"Harmony"},
  "The Silent Orchestra": {suit:"Da Capo", gift:"Da Capo"},
  "Warm-hearted Woodsman": {suit:"Logging", gift:"Logging"},
  "The Snow Queen": {suit:"Frost Splinter", gift:"Frost Splinter"},
  "Big Bird": {suit:"Lamp", gift:"Lamp"},
  "All-Around Helper": {suit:"Grinder Mk4", gift:"Grinder Mk4"},
  "Snow White's Apple": {suit:"Green Stem", gift:"Green Stem"},
  "Spider Bud": {suit:"Red Eyes", gift:"Red Eyes"},
  "Beauty and the Beast": {suit:"Horn", gift:"Horn"},
  "Plague Doctor": {gift:"Benediction"},
  "WhiteNight": {suit:"Paradise Lost", gift:"Paradise Lost"},
  "Der Freischütz": {suit:"Magic Bullet", gift:"Magic Bullet"},
  "Crumbling Armor": {suit:"Life for a Daredevil", gift:"Inspired Bravery / Reckless Foolishness"},
  "Rudolta of the Sleigh": {suit:"Christmas", gift:"Christmas"},
  "Queen Bee": {suit:"Hornet", gift:"Hornet"},
  "Punishing Bird": {suit:"Wingbeat", gift:"Wingbeat"},
  "Meat Lantern": {suit:"Lantern", gift:"Lantern"},
  "Scarecrow Searching for Wisdom": {suit:"Harvest", gift:"Harvest"},
  "Today's Shy Look": {suit:"Today's Expression", gift:"Today's Expression"},
  "Blue Star": {suit:"Sound of a Star", gift:"Sound of a Star"},
  "Porccubus": {suit:"Pleasure", gift:"Pleasure"},
  "Void Dream": {suit:"Engulfing Dream", gift:"Engulfing Dream"},
  "Grave of Cherry Blossoms": {suit:"Cherry Blossoms", gift:"Cherry Blossoms"},
  "The Firebird": {suit:"Feather of Honor", gift:"Feather of Honor"},
  "Yin": {suit:"Discord", gift:"Discord"},
  "Clouded Monk": {suit:"Amita", gift:"Amita"},
  "You're Bald...": {suit:"Tough", gift:"Tough"},
  "Schadenfreude": {suit:"Gaze", gift:"Gaze"},
  "Fragment of the Universe": {suit:"Fragments from Somewhere"},
  "Snow White's Apple": {suit:"Green Stem", gift:"Green Stem"}
};
const EGO_SUIT_CATALOGUE = [...new Set(Object.values(EGO_RECORDS).map(x=>x.suit).filter(Boolean))].sort();
const EGO_GIFT_CATALOGUE = [...new Set(Object.values(EGO_RECORDS).map(x=>x.gift).filter(Boolean))].sort();

const L_CORP_LEGACY_ONLY_ABNORMALITIES = [
  "Hammer of Light",
  "Poor Screenwriter's Note",
  "Price of Silence"
];
const L_CORP_SYNERGY_ABNORMALITIES = [...new Set([
  ...L_CORP_ABNORMALITIES,
  ...L_CORP_LEGACY_ONLY_ABNORMALITIES
])];
const L_CORP_LEGACY_ALIASES = {
  "Forsaken Murderer": ["Abandoned Murderer"],
  "Happy Teddy Bear": ["Happy Teddy"],
  "The Red Shoes": ["Red Shoes"],
  "The Lady Facing the Wall": ["Woman Facing the Wall"],
  "Rudolta of the Sleigh": ["Rudol-ta of Sled"],
  "Queen Bee": ["QueenBee"],
  "Child of the Galaxy": ["The Child of Galaxy"],
  "Big and Will be Bad Wolf": ["Big and Might be Bad Wolf"],
  "Opened Can of WellCheers": ["Wellcheers"]
};

// ---------------------------------------------------------------------------
// E.G.O WEAPON catalogues
// ---------------------------------------------------------------------------
// Refined Lobotomy E.G.O path: every E.G.O Weapon from the Lobotomy Corporation
// weapon list, mapped to the L Corp. Abnormality it is extracted from.
// Format: "Weapon name": "Source Abnormality (must match L_CORP_ABNORMALITIES)"
const L_CORP_WEAPON_SOURCES = {
  // ZAYIN
  "Penitence": "One Sin and Hundreds of Good Deeds",
  "Soda": "Opened Can of WellCheers",
  "Wingbeat": "Fairy Festival",
  // TETH
  "Tough": "You're Bald...",
  "Standard Training E.G.O": "Standard Training-Dummy Rabbit (tutorial-exclusive)",
  "Fourth Match Flame": "Scorched Girl",
  "Solitude": "Old Lady",
  "Red Eyes": "Spider Bud",
  "Horn": "Beauty and the Beast",
  "Wrist Cutter": "Bloodbath",
  "Regret": "Forsaken Murderer",
  "Beak": "Punishing Bird",
  "Fragments from Somewhere": "Fragment of the Universe",
  "Lantern": "Meat Lantern",
  "Today's Expression": "Today's Shy Look",
  "Engulfing Dream": "Void Dream",
  "Cherry Blossoms": "Grave of Cherry Blossoms",
  "SO CUTE!!!": "Ppodae",
  // HE
  "Screaming Wedge": "The Lady Facing the Wall",
  "Life for a Daredevil": "Crumbling Armor",
  "Bear Paws": "Happy Teddy Bear",
  "Sanguine Desire": "The Red Shoes",
  "Syrinx": "Nameless Fetus",
  "Harmony": "Singing Machine",
  "Logging": "Warm-hearted Woodsman",
  "Frost Splinter": "The Snow Queen",
  "Grinder Mk4": "All-Around Helper",
  "Christmas": "Rudolta of the Sleigh",
  "Our Galaxy": "Child of the Galaxy",
  "Laetitia": "Laetitia",
  "Gaze": "Schadenfreude",
  "Harvest": "Scarecrow Searching for Wisdom",
  "Pleasure": "Porccubus",
  // WAW
  "Solemn Lament": "The Funeral of the Dead Butterflies",
  "Magic Bullet": "Der Freischütz",
  "In the Name of Love and Hate": "The Queen of Hatred",
  "Lamp": "Big Bird",
  "Green Stem": "Snow White's Apple",
  "Hornet": "Queen Bee",
  "Faint Aroma": "Alriune",
  "Crimson Scar": "Little Red Riding Hooded Mercenary",
  "Cobalt Scar": "Big and Will be Bad Wolf",
  "Spore": "The Little Prince",
  "Black Swan": "Dream of a Black Swan",
  "Ecstasy": "The Dreaming Current",
  "Heaven": "The Burrowing Heaven",
  "The Sword Sharpened with Tears": "The Knight of Despair",
  "Exuviae": "The Naked Nest",
  "Diffraction": "Dimensional Refraction Variant",
  "Feather of Honor": "The Firebird",
  "Discord": "Yin",
  "Moonlight": "Il Pianto della Luna",
  "Hypocrisy": "Parasite Tree",
  "Amita": "Clouded Monk",
  // ALEPH
  "Justitia": "Judgement Bird",
  "Gold Rush": "The King of Greed",
  "Mimicry": "Nothing There",
  "Da Capo": "The Silent Orchestra",
  "Smile": "Mountain of Smiling Bodies",
  "CENSORED": "CENSORED",
  "Sound of a Star": "Blue Star",
  "Pink": "Army in Black",
  "Adoration": "Melting Love",
  "Paradise Lost": "WhiteNight",
  "Twilight": "Apocalypse Bird"
};
const L_CORP_EGO_WEAPON_CATALOGUE = Object.keys(L_CORP_WEAPON_SOURCES).sort();

// Abnormality-derived path: Limbus Company E.G.O (LCE), e.g. Fell Bullet from
// Der Fluchschütze. DERIVED_WEAPON_SOURCES below only lists the ones whose
// non-L-Corp. source Abnormality is confirmed; it drives the USE WEAPON buttons.
// Format: "E.G.O name": "Source Abnormality (must match OUTSIDE_L_CORP_ABNORMALITIES)"
// Source column taken from the Limbus Company Wiki "List of E.G.O/Data" table.
// Sinners' base E.G.O, collab E.G.O (Arknights), and E.G.O sourced from L Corp.
// Abnormalities are intentionally excluded here (the last group lives above).
// NOTE: Heathcliff onward (Heathcliff, Ishmael, Rodion, Sinclair, Outis, Gregor)
// is only partly verified; extend this block as more sources are confirmed.
const DERIVED_WEAPON_SOURCES = {
  "Bygone Days": "Portrait of a Certain Day",
  "Wishing Cairn": "Pagoda Veneration",
  "Dimension Shredder": "Wayward Passenger",
  "Fell Bullet": "Der Fluchschütze",
  "Sunshower": "Drifting Fox",
  "Great Trichiliocosm [三千大世界]": "Butterfly of Entangled Lives",
  "Hex Nail": "Hurting Teddy Bear",
  "9:2": "Skin Prophet",
  "Lasso": "Rose Hunter",
  "Fluid Sac": "Headless Ichthys",
  "Telepole": "Alleyway Watchdog",
  "Thoracalgia": "Sleeping Bag of a Bygone Day",
  "Ardor Blossom Star": "Ardor Blossom Moth",
  "Everlasting": "Time Duck",
  "Hollow": "Hollowed Man",
  "I'll Go fer Scissors. How 'Bout You?": "Will You Play?",
  "Lifetime Stew": "Basilisoup",
  "Electric Screaming": "Dreaming Electric Sheep",
  "Red Sheet": "So That No One Will Cry",
  "Yearning-Mircalla": "Four-hundred Roses",
  "Blind Obsession": "Dream-Devouring Siltcurrent",
  "Contempt, Awe": "Spiral of Contempt",
  "Screwloose Wallop": "You Want To Get Beat? Hurtily?",
  "Pursuance": "Heavenly Executor's Scribe",
  "Capote": "Brazen Bull",
  "Shadow-vested Bladesinger [着影揮刀]": "Geseundae",
  "Crushbound Past": "Steam Transport Machine",
  "Roseate Desire": "Pink Shoes",
  "Cavernous Wailing": "Blubbering Toad",
  "Effervescent Corrosion": "Ambling Pearl",
  "Tears of the Tarnished Blood [汚血泣淚]": "Yinglong",
  "Repudiation": "Resident of Metropolaris"
};
// Full Limbus Company E.G.O (LCE) name list, from the Limbus Company Wiki "List of E.G.O".
// Duplicates across Sinners are collapsed into one entry. This is what the
// Abnormality-derived E.G.O WEAPON field suggests.
const LIMBUS_EGO_NAMES = [
  // Yi Sang
  "Crow's Eye View","Bygone Days","4th Match Flame","Wishing Cairn","Dimension Shredder","Fell Bullet","Solemn Lament","Sunshower","Great Trichiliocosm [三千大世界]",
  // Faust
  "Representation Emitter","Hex Nail","9:2","Lasso","Fluid Sac","Telepole","Thoracalgia","Command : Meltdown","Ardor Blossom Star","Everlasting","Hollow",
  // Don Quixote
  "La Sangre de Sancho","I'll Go fer Scissors. How 'Bout You?","Lifetime Stew","Electric Screaming","Red Sheet","Yearning-Mircalla","In the Name of Love and Hate",
  // Ryoshu
  "Forest for the Flames","Soda","Red Eyes","Red Eyes (Open)","Blind Obsession","Contempt, Awe",
  // Meursault
  "Chains of Others","Screwloose Wallop","Regret","Pursuance","Capote","Shadow-vested Bladesinger [着影揮刀]","Crushbound Past",
  // Hong Lu
  "Land of Illusion","Repudiation","Roseate Desire","Cavernous Wailing","Effervescent Corrosion","To Remain Oneself [宁作吾]","The Sword Sharpened with Tears","Tears of the Tarnished Blood [汚血泣淚]",
  // Heathcliff
  "Bodysack","Holiday","AEDD","Move-in Reg.","Ya Śūnyatā Tad Rūpam","Asymmetrical Inertia","Binds",
  // Ishmael
  "Snagharpoon","Hundred-Footed Death Maggot [蝍蛆殺]","Wingbeat","Christmas Nightmare","Tidal Elegy",
  // Rodion
  "What is Cast","Into the Sunset","Rime Shank","Mirror-touch","Sanguine Desire","Indicant's Trial",
  // Sinclair
  "Branch of Knowledge","Impending Day","Lantern","Harmony",
  // Outis
  "To Páthos Máthos","Ebony Stem","Magic Bullet",
  // Gregor
  "Suddenly, One Day","Legerdemain","Garden of Thorns","Unbrilliant Glory"
];
// Abnormality-derived E.G.O (like Hohenheim's AEDD or Gubo's Fell Bullet): the
// confirmed outside-L-Corp. entries above, plus AEDD (source not yet confirmed).
const DERIVED_EXTRA_WEAPONS = ["AEDD"];
const DERIVED_EGO_WEAPON_CATALOGUE = [...new Set([...Object.keys(DERIVED_WEAPON_SOURCES),...DERIVED_EXTRA_WEAPONS])].sort();

// Abnormality E.G.O (what the Sinners use): every Limbus Company E.G.O. Sources are
// listed where confirmed. L Corp.-sourced entries are matched to the Limbus wiki's
// source column / the L Corp. weapon names (e.g. 4th Match Flame <- Scorched Girl).
const SINNER_LCORP_WEAPON_SOURCES = {
  "4th Match Flame": "Scorched Girl",
  "Red Eyes": "Spider Bud",
  "Red Eyes (Open)": "Spider Bud",
  "Soda": "Opened Can of WellCheers",
  "Regret": "Forsaken Murderer",
  "Solemn Lament": "The Funeral of the Dead Butterflies",
  "In the Name of Love and Hate": "The Queen of Hatred",
  "The Sword Sharpened with Tears": "The Knight of Despair",
  "Magic Bullet": "Der Freischütz",
  "Lantern": "Meat Lantern",
  "Harmony": "Singing Machine",
  "Sanguine Desire": "The Red Shoes",
  "Wingbeat": "Fairy Festival"
};
const SINNER_WEAPON_SOURCES = Object.assign({}, DERIVED_WEAPON_SOURCES, SINNER_LCORP_WEAPON_SOURCES);
const SINNER_EGO_WEAPON_CATALOGUE = [...new Set([...LIMBUS_EGO_NAMES,...Object.keys(SINNER_WEAPON_SOURCES)])].sort();
const SINNER_WEAPONS_BY_ABNORMALITY = buildWeaponIndex(SINNER_WEAPON_SOURCES);
// Sinner E.G.O draws on both L Corp. and outside Abnormalities.
const SINNER_SYNERGY_ABNORMALITIES = [...new Set([...L_CORP_SYNERGY_ABNORMALITIES,...OUTSIDE_L_CORP_ABNORMALITIES])];

// Reverse lookup used by the archive cards: Abnormality -> [weapon names]
function buildWeaponIndex(sources){
  const index={};
  Object.entries(sources).forEach(([weapon,abno])=>{(index[abno]=index[abno]||[]).push(weapon);});
  return index;
}
const L_CORP_WEAPONS_BY_ABNORMALITY = buildWeaponIndex(L_CORP_WEAPON_SOURCES);
const DERIVED_WEAPONS_BY_ABNORMALITY = buildWeaponIndex(DERIVED_WEAPON_SOURCES);

// Kept for backwards compatibility with older builds of script.js.
const EGO_WEAPON_CATALOGUE = [...L_CORP_EGO_WEAPON_CATALOGUE];
