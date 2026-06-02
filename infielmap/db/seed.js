/**
 * InfielMap — seed script v2
 * Borra todos los registros existentes e inserta 1.850 nuevos con
 * distribución geográfica proporcional al padrón municipal de España.
 *
 * Uso:
 *   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_KEY=service_role_key node seed.js
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltan variables de entorno SUPABASE_URL y SUPABASE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Municipios con población real (padrón 2023) ──────────────────────────────
// Formato: [nombre, comunidad_autónoma, población]
// Comunidades: MAD, CAT, AND, VAL, MUR, EUS, GAL, CYL, CLM, ARA, EXT, CAN, BAL, NAV, RIO, AST, CTB, CEU, MEL

const MUNICIPALITIES = [
  // MADRID
  ["Madrid",                    "MAD", 3305000],
  ["Móstoles",                  "MAD",  207000],
  ["Alcalá de Henares",         "MAD",  193000],
  ["Fuenlabrada",               "MAD",  193000],
  ["Leganés",                   "MAD",  192000],
  ["Getafe",                    "MAD",  183000],
  ["Alcorcón",                  "MAD",  165000],
  ["Parla",                     "MAD",  121000],
  ["Torrejón de Ardoz",         "MAD",  128000],
  ["Coslada",                   "MAD",   91000],
  ["Las Rozas de Madrid",       "MAD",   98000],
  ["Alcobendas",                "MAD",  116000],
  ["Rivas-Vaciamadrid",         "MAD",   86000],
  ["Pozuelo de Alarcón",        "MAD",   89000],
  ["San Sebastián de los Reyes","MAD",   82000],
  ["Majadahonda",               "MAD",   72000],
  ["Valdemoro",                 "MAD",   72000],
  ["Arganda del Rey",           "MAD",   56000],
  ["Aranjuez",                  "MAD",   59000],
  ["Collado Villalba",          "MAD",   63000],
  ["Pinto",                     "MAD",   53000],
  ["Boadilla del Monte",        "MAD",   52000],
  ["Colmenar Viejo",            "MAD",   46000],
  ["Torrelodones",              "MAD",   24000],
  ["Navalcarnero",              "MAD",   28000],
  ["San Fernando de Henares",   "MAD",   39000],

  // CATALUÑA
  ["Barcelona",                 "CAT", 1620000],
  ["L'Hospitalet de Llobregat", "CAT",  253000],
  ["Badalona",                  "CAT",  214000],
  ["Terrassa",                  "CAT",  213000],
  ["Sabadell",                  "CAT",  209000],
  ["Lleida",                    "CAT",  138000],
  ["Tarragona",                 "CAT",  130000],
  ["Mataró",                    "CAT",  128000],
  ["Santa Coloma de Gramenet",  "CAT",  116000],
  ["Reus",                      "CAT",  105000],
  ["Girona",                    "CAT",  102000],
  ["Sant Cugat del Vallès",     "CAT",   88000],
  ["Cornellà de Llobregat",     "CAT",   86000],
  ["Sant Boi de Llobregat",     "CAT",   83000],
  ["Rubí",                      "CAT",   75000],
  ["Viladecans",                "CAT",   67000],
  ["Castelldefels",             "CAT",   68000],
  ["Manresa",                   "CAT",   76000],
  ["Granollers",                "CAT",   61000],
  ["Vilanova i la Geltrú",      "CAT",   66000],
  ["El Prat de Llobregat",      "CAT",   63000],
  ["Mollet del Vallès",         "CAT",   52000],
  ["Vic",                       "CAT",   44000],
  ["Figueres",                  "CAT",   44000],
  ["Igualada",                  "CAT",   40000],
  ["Tortosa",                   "CAT",   33000],
  ["Blanes",                    "CAT",   37000],
  ["Cerdanyola del Vallès",     "CAT",   57000],
  ["Sitges",                    "CAT",   28000],
  ["Cambrils",                  "CAT",   33000],
  ["Olesa de Montserrat",       "CAT",   22000],

  // ANDALUCÍA
  ["Sevilla",                   "AND",  685000],
  ["Málaga",                    "AND",  578000],
  ["Córdoba",                   "AND",  324000],
  ["Granada",                   "AND",  232000],
  ["Almería",                   "AND",  196000],
  ["Jerez de la Frontera",      "AND",  210000],
  ["Marbella",                  "AND",  141000],
  ["Huelva",                    "AND",  143000],
  ["Cádiz",                     "AND",  116000],
  ["Dos Hermanas",              "AND",  138000],
  ["Jaén",                      "AND",  108000],
  ["Algeciras",                 "AND",  118000],
  ["Roquetas de Mar",           "AND",   88000],
  ["Alcalá de Guadaíra",        "AND",   75000],
  ["El Puerto de Santa María",  "AND",   88000],
  ["Chiclana de la Frontera",   "AND",   84000],
  ["Mijas",                     "AND",   84000],
  ["Torremolinos",              "AND",   68000],
  ["Vélez-Málaga",              "AND",   78000],
  ["Fuengirola",                "AND",   76000],
  ["Línea de la Concepción",    "AND",   65000],
  ["Sanlúcar de Barrameda",     "AND",   68000],
  ["Motril",                    "AND",   60000],
  ["Antequera",                 "AND",   45000],
  ["Úbeda",                     "AND",   34000],
  ["Benalmádena",               "AND",   62000],
  ["Estepona",                  "AND",   72000],
  ["Loja",                      "AND",   21000],
  ["Lucena",                    "AND",   40000],
  ["Lebrija",                   "AND",   27000],
  ["Écija",                     "AND",   38000],
  ["Utrera",                    "AND",   51000],
  ["Ronda",                     "AND",   33000],
  ["Arcos de la Frontera",      "AND",   31000],
  ["Huércal-Overa",             "AND",   18000],
  ["Adra",                      "AND",   24000],
  ["Baeza",                     "AND",   16000],
  ["Carmona",                   "AND",   29000],

  // COMUNIDAD VALENCIANA
  ["Valencia",                  "VAL",  814000],
  ["Alicante",                  "VAL",  334000],
  ["Elche",                     "VAL",  228000],
  ["Castellón de la Plana",     "VAL",  170000],
  ["Torrent",                   "VAL",   90000],
  ["Orihuela",                  "VAL",   82000],
  ["Torrevieja",                "VAL",   83000],
  ["Gandía",                    "VAL",   75000],
  ["Benidorm",                  "VAL",   73000],
  ["Paterna",                   "VAL",   67000],
  ["Alcoy/Alcoi",               "VAL",   60000],
  ["Sagunt",                    "VAL",   65000],
  ["Elda",                      "VAL",   55000],
  ["Mislata",                   "VAL",   43000],
  ["Alzira",                    "VAL",   44000],
  ["Denia",                     "VAL",   44000],
  ["Vila-real",                 "VAL",   50000],
  ["Petrer",                    "VAL",   34000],
  ["Burjassot",                 "VAL",   37000],
  ["Xàtiva",                    "VAL",   29000],
  ["Manises",                   "VAL",   30000],
  ["Ontinyent",                 "VAL",   36000],
  ["Bétera",                    "VAL",   22000],
  ["Cullera",                   "VAL",   22000],
  ["Dénia",                     "VAL",   41000],
  ["Calp",                      "VAL",   22000],
  ["Novelda",                   "VAL",   26000],
  ["Crevillent",                "VAL",   28000],

  // MURCIA
  ["Murcia",                    "MUR",  453000],
  ["Cartagena",                 "MUR",  211000],
  ["Lorca",                     "MUR",   92000],
  ["Molina de Segura",          "MUR",   68000],
  ["Alcantarilla",              "MUR",   41000],
  ["Mazarrón",                  "MUR",   34000],
  ["San Javier",                "MUR",   31000],
  ["Torre-Pacheco",             "MUR",   36000],
  ["Cieza",                     "MUR",   34000],
  ["Yecla",                     "MUR",   34000],
  ["Caravaca de la Cruz",       "MUR",   25000],
  ["Jumilla",                   "MUR",   25000],
  ["Totana",                    "MUR",   30000],
  ["Alhama de Murcia",          "MUR",   21000],

  // EUSKADI
  ["Bilbao",                    "EUS",  350000],
  ["Vitoria-Gasteiz",           "EUS",  249000],
  ["San Sebastián",             "EUS",  188000],
  ["Barakaldo",                 "EUS",  100000],
  ["Getxo",                     "EUS",   77000],
  ["Irun",                      "EUS",   62000],
  ["Basauri",                   "EUS",   40000],
  ["Errenteria",                "EUS",   38000],
  ["Durango",                   "EUS",   28000],
  ["Eibar",                     "EUS",   26000],
  ["Arrasate/Mondragón",        "EUS",   21000],
  ["Zarautz",                   "EUS",   22000],
  ["Santurtzi",                 "EUS",   44000],
  ["Sestao",                    "EUS",   27000],
  ["Leioa",                     "EUS",   30000],

  // GALICIA
  ["Vigo",                      "GAL",  292000],
  ["A Coruña",                  "GAL",  245000],
  ["Ourense",                   "GAL",  104000],
  ["Santiago de Compostela",    "GAL",   97000],
  ["Lugo",                      "GAL",   99000],
  ["Pontevedra",                "GAL",   83000],
  ["Ferrol",                    "GAL",   65000],
  ["Narón",                     "GAL",   40000],
  ["Oleiros",                   "GAL",   35000],
  ["Carballo",                  "GAL",   32000],
  ["Vilagarcía de Arousa",      "GAL",   36000],
  ["Redondela",                 "GAL",   30000],
  ["Cangas",                    "GAL",   26000],
  ["Arteixo",                   "GAL",   30000],
  ["Mos",                       "GAL",   17000],
  ["Lalín",                     "GAL",   20000],

  // CASTILLA Y LEÓN
  ["Valladolid",                "CYL",  295000],
  ["Burgos",                    "CYL",  176000],
  ["Salamanca",                 "CYL",  143000],
  ["León",                      "CYL",  122000],
  ["Palencia",                  "CYL",   78000],
  ["Ponferrada",                "CYL",   65000],
  ["Zamora",                    "CYL",   62000],
  ["Ávila",                     "CYL",   57000],
  ["Segovia",                   "CYL",   52000],
  ["Miranda de Ebro",           "CYL",   38000],
  ["Aranda de Duero",           "CYL",   32000],
  ["Soria",                     "CYL",   39000],
  ["San Andrés del Rabanedo",   "CYL",   32000],
  ["Laguna de Duero",           "CYL",   22000],
  ["Medina del Campo",          "CYL",   21000],

  // CASTILLA-LA MANCHA
  ["Albacete",                  "CLM",  173000],
  ["Guadalajara",               "CLM",   76000],
  ["Ciudad Real",               "CLM",   75000],
  ["Talavera de la Reina",      "CLM",   83000],
  ["Toledo",                    "CLM",   85000],
  ["Puertollano",               "CLM",   48000],
  ["Cuenca",                    "CLM",   55000],
  ["Tomelloso",                 "CLM",   38000],
  ["Azuqueca de Henares",       "CLM",   36000],
  ["Hellín",                    "CLM",   30000],
  ["Almansa",                   "CLM",   25000],
  ["Manzanares",                "CLM",   19000],
  ["Valdepeñas",                "CLM",   28000],
  ["Illescas",                  "CLM",   28000],

  // ARAGÓN
  ["Zaragoza",                  "ARA",  674000],
  ["Huesca",                    "ARA",   52000],
  ["Teruel",                    "ARA",   36000],
  ["Calatayud",                 "ARA",   20000],
  ["Utebo",                     "ARA",   18000],
  ["Monzón",                    "ARA",   17000],
  ["Barbastro",                 "ARA",   17000],
  ["Ejea de los Caballeros",    "ARA",   17000],
  ["Alcañiz",                   "ARA",   16000],
  ["Fraga",                     "ARA",   14000],

  // EXTREMADURA
  ["Badajoz",                   "EXT",  148000],
  ["Cáceres",                   "EXT",   95000],
  ["Mérida",                    "EXT",   59000],
  ["Plasencia",                 "EXT",   40000],
  ["Don Benito",                "EXT",   37000],
  ["Almendralejo",              "EXT",   34000],
  ["Villanueva de la Serena",   "EXT",   26000],
  ["Navalmoral de la Mata",     "EXT",   17000],
  ["Zafra",                     "EXT",   17000],

  // CANARIAS
  ["Las Palmas de Gran Canaria","CAN",  378000],
  ["Santa Cruz de Tenerife",    "CAN",  204000],
  ["La Laguna",                 "CAN",  152000],
  ["Telde",                     "CAN",  101000],
  ["Santa Lucía de Tirajana",   "CAN",   69000],
  ["San Bartolomé de Tirajana", "CAN",   63000],
  ["Arona",                     "CAN",   84000],
  ["Adeje",                     "CAN",   47000],
  ["Arrecife",                  "CAN",   61000],
  ["Puerto del Rosario",        "CAN",   40000],
  ["Granadilla de Abona",       "CAN",   44000],
  ["La Orotava",                "CAN",   42000],
  ["Puerto de la Cruz",         "CAN",   29000],
  ["Mogán",                     "CAN",   22000],
  ["Los Llanos de Aridane",     "CAN",   20000],
  ["Icod de los Vinos",         "CAN",   23000],

  // BALEARES
  ["Palma",                     "BAL",  416000],
  ["Calviá",                    "BAL",   51000],
  ["Manacor",                   "BAL",   41000],
  ["Eivissa",                   "BAL",   48000],
  ["Llucmajor",                 "BAL",   38000],
  ["Marratxí",                  "BAL",   38000],
  ["Maó",                       "BAL",   29000],
  ["Sant Josep de sa Talaia",   "BAL",   25000],
  ["Inca",                      "BAL",   32000],
  ["Alcúdia",                   "BAL",   21000],

  // NAVARRA
  ["Pamplona",                  "NAV",  200000],
  ["Tudela",                    "NAV",   36000],
  ["Barañáin",                  "NAV",   22000],
  ["Burlada",                   "NAV",   21000],
  ["Zizur Mayor",               "NAV",   19000],
  ["Estella-Lizarra",           "NAV",   14000],

  // LA RIOJA
  ["Logroño",                   "RIO",  151000],
  ["Calahorra",                 "RIO",   24000],
  ["Arnedo",                    "RIO",   15000],
  ["Lardero",                   "RIO",   11000],
  ["Nájera",                    "RIO",    8000],

  // ASTURIAS
  ["Gijón",                     "AST",  270000],
  ["Oviedo",                    "AST",  220000],
  ["Avilés",                    "AST",   78000],
  ["Siero",                     "AST",   52000],
  ["Langreo",                   "AST",   41000],
  ["Mieres",                    "AST",   40000],
  ["Castrillón",                "AST",   22000],
  ["Gozón",                     "AST",   10000],

  // CANTABRIA
  ["Santander",                 "CTB",  170000],
  ["Torrelavega",               "CTB",   52000],
  ["Castro-Urdiales",           "CTB",   33000],
  ["Camargo",                   "CTB",   30000],
  ["Piélagos",                  "CTB",   24000],
  ["Astillero",                 "CTB",   18000],
  ["Laredo",                    "CTB",   12000],

  // CEUTA Y MELILLA
  ["Ceuta",                     "CEU",   85000],
  ["Melilla",                   "MEL",   84000],
];

// ─── Comunidades limítrofes (para flechas "cortas") ───────────────────────────
const NEIGHBORS = {
  MAD: ["MAD", "CLM", "CYL"],
  CAT: ["CAT", "ARA", "VAL"],
  AND: ["AND", "EXT", "CLM", "MUR", "VAL"],
  VAL: ["VAL", "CAT", "AND", "MUR", "CLM", "ARA"],
  MUR: ["MUR", "AND", "VAL", "CLM"],
  EUS: ["EUS", "NAV", "RIO", "CTB", "CYL"],
  GAL: ["GAL", "AST", "CYL"],
  CYL: ["CYL", "MAD", "GAL", "AST", "CTB", "EUS", "RIO", "ARA", "EXT", "CLM"],
  CLM: ["CLM", "MAD", "VAL", "MUR", "AND", "EXT", "CYL", "ARA"],
  ARA: ["ARA", "CAT", "VAL", "CLM", "CYL", "NAV", "RIO", "EUS"],
  EXT: ["EXT", "AND", "CLM", "CYL"],
  CAN: ["CAN"],
  BAL: ["BAL"],
  NAV: ["NAV", "EUS", "ARA", "RIO"],
  RIO: ["RIO", "NAV", "ARA", "EUS", "CYL"],
  AST: ["AST", "GAL", "CTB", "CYL"],
  CTB: ["CTB", "AST", "EUS", "CYL"],
  CEU: ["CEU", "AND"],
  MEL: ["MEL", "AND"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Pre-calcular totales por comunidad para muestreo ponderado
const communityMunicipalities = {};
for (const [name, com, pop] of MUNICIPALITIES) {
  if (!communityMunicipalities[com]) communityMunicipalities[com] = [];
  communityMunicipalities[com].push({ name, pop });
}

function weightedPick(items) {
  // items: [{ name, pop }]
  const total = items.reduce((s, m) => s + m.pop, 0);
  let r = Math.random() * total;
  for (const m of items) {
    r -= m.pop;
    if (r <= 0) return m.name;
  }
  return items[items.length - 1].name;
}

const ALL_COMMUNITIES = Object.keys(communityMunicipalities);

function pickCommunityWeighted() {
  // Peso de cada comunidad proporcional a su población total
  const totals = ALL_COMMUNITIES.map(c => ({
    com: c,
    pop: communityMunicipalities[c].reduce((s, m) => s + m.pop, 0),
  }));
  const total = totals.reduce((s, t) => s + t.pop, 0);
  let r = Math.random() * total;
  for (const t of totals) {
    r -= t.pop;
    if (r <= 0) return t.com;
  }
  return totals[totals.length - 1].com;
}

function pickCityFromCommunity(com) {
  return weightedPick(communityMunicipalities[com]);
}

function pickShortPair() {
  // Mismo municipio o comunidad limítrofe
  const comA = pickCommunityWeighted();
  const neighbors = NEIGHBORS[comA] || [comA];
  const comB = neighbors[Math.floor(Math.random() * neighbors.length)];
  let origin = pickCityFromCommunity(comA);
  let dest   = pickCityFromCommunity(comB);
  // Asegurarse de que no sean la misma ciudad
  let tries = 0;
  while (origin === dest && tries++ < 10) {
    dest = pickCityFromCommunity(comB);
  }
  return [origin, dest];
}

function pickLongPair() {
  let comA, comB;
  do {
    comA = pickCommunityWeighted();
    comB = pickCommunityWeighted();
  } while (comA === comB || (NEIGHBORS[comA] || []).includes(comB));
  return [pickCityFromCommunity(comA), pickCityFromCommunity(comB)];
}

function randomGender() {
  const r = Math.random();
  if (r < 0.58)  return "m";
  if (r < 0.95)  return "f";
  if (r < 0.975) return "gm";
  return "gf";
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomCelebrityType() {
  return pick(["futbolista", "cantante", "presentador"]);
}

// Pesos por día de semana: Dom=1.3, Lun=0.7, Mar=0.9, Mié=1.0, Jue=1.05, Vie=1.2, Sáb=1.4
const DOW_WEIGHTS = [1.3, 0.7, 0.9, 1.0, 1.05, 1.2, 1.4];

function weightedRandomDay(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const weights = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    weights.push(DOW_WEIGHTS[dow]);
  }
  const totalW = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalW;
  for (let d = 1; d <= daysInMonth; d++) {
    r -= weights[d - 1];
    if (r <= 0) return d;
  }
  return daysInMonth;
}

function randomTimestamp(year, month) {
  const day = weightedRandomDay(year, month);
  const hour = Math.floor(Math.random() * 22) + 1;
  const min  = Math.floor(Math.random() * 60);
  const sec  = Math.floor(Math.random() * 60);
  return new Date(Date.UTC(year, month - 1, day, hour, min, sec)).toISOString();
}

// Municipios con >50.000 hab (para reportes celebrity)
const LARGE_CITIES = MUNICIPALITIES
  .filter(([, , pop]) => pop >= 50000)
  .map(([name]) => name);

// ─── Calendario mensual ───────────────────────────────────────────────────────
const MONTHS = [
  { year: 2025, month: 11, count: 100 },
  { year: 2025, month: 12, count: 140 },
  { year: 2026, month: 1,  count: 175 },
  { year: 2026, month: 2,  count: 215 },
  { year: 2026, month: 3,  count: 250 },
  { year: 2026, month: 4,  count: 290 },
  { year: 2026, month: 5,  count: 320 },
  { year: 2026, month: 6,  count: 360 },
]; // Total: 1.850

// ─── Generar registros ────────────────────────────────────────────────────────

function buildRecords() {
  const records = [];

  for (const { year, month, count } of MONTHS) {
    const celebCount   = Math.random() < 0.5 ? 1 : 2;
    const regularCount = count - celebCount;

    for (let i = 0; i < regularCount; i++) {
      const isLong = Math.random() < 0.25;
      const [origin, dest] = isLong ? pickLongPair() : pickShortPair();

      const confirmed_count = Math.random() < 0.12
        ? Math.floor(Math.random() * 5) + 3
        : Math.floor(Math.random() * 2) + 1;

      records.push({
        created_at:       randomTimestamp(year, month),
        gender:           randomGender(),
        origin_city:      origin,
        destination_city: dest,
        is_celebrity:     false,
        celebrity_type:   null,
        confirmed_count,
        is_confirmed:     confirmed_count >= 3,
      });
    }

    for (let i = 0; i < celebCount; i++) {
      let origin = pick(LARGE_CITIES);
      let dest;
      do { dest = pick(LARGE_CITIES); } while (dest === origin);

      records.push({
        created_at:       randomTimestamp(year, month),
        gender:           Math.random() < 0.75 ? "m" : "f",
        origin_city:      origin,
        destination_city: dest,
        is_celebrity:     true,
        celebrity_type:   randomCelebrityType(),
        confirmed_count:  Math.floor(Math.random() * 8) + 3,
        is_confirmed:     true,
      });
    }
  }

  return records;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  // PASO 1: Borrar todos los registros existentes
  console.log("Borrando registros existentes...");
  const { error: deleteError } = await supabase
    .from("reports")
    .delete()
    .gte("created_at", "2000-01-01");

  if (deleteError) {
    console.error("Error al borrar:", deleteError.message);
    process.exit(1);
  }
  console.log("Tabla vaciada correctamente.");

  // PASO 2: Generar e insertar nuevos registros
  const records = buildRecords();
  console.log(`Generados ${records.length} registros. Insertando...`);

  const BATCH_SIZE = 200;
  let inserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("reports").insert(batch);
    if (error) {
      console.error(`Error en lote ${i}–${i + BATCH_SIZE}:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted}/${records.length} insertados...`);
  }

  console.log(`\n✓ Seed completado: ${inserted} registros insertados.`);

  // PASO 3: Verificación — top 10 ciudades con más reportes
  console.log("\nTop 10 ciudades con más reportes (origen):");
  const { data: topCities, error: topError } = await supabase
    .from("reports")
    .select("origin_city");

  if (topError) {
    console.error("Error al verificar:", topError.message);
    return;
  }

  const counts = {};
  for (const { origin_city } of topCities) {
    counts[origin_city] = (counts[origin_city] || 0) + 1;
  }
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  for (const [city, count] of sorted) {
    console.log(`  ${city.padEnd(35)} ${count} reportes`);
  }

  console.log(`\nTotal registros en tabla: ${topCities.length}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
