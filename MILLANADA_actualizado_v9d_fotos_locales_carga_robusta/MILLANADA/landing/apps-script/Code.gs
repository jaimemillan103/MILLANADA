/**
 * LA MILLANADA 2026 — backend v9
 * Fuente única: Google Sheet "organización"
 *   - ASISTENCIA: tabla maestra, una fila fija por persona
 *   - ENVIOS: histórico append-only de cada confirmación
 *   - PLATOS: histórico append-only de reclamaciones de platos
 *   - KAHOOT: preguntas anónimas append-only
 */

const SPREADSHEET_ID = '14bvnt5EWz-njcRNp_CxzoMqzOZfuhik2pf9YJ5ujbms';
const ATTENDANCE_SHEET_NAME = 'ASISTENCIA';
const SUBMISSIONS_SHEET_NAME = 'ENVIOS';
const DISHES_SHEET_NAME = 'PLATOS';
const KAHOOT_SHEET_NAME = 'KAHOOT';
const TIME_ZONE = 'Europe/Madrid';
const RSVP_CLOSE_AT = new Date('2026-10-06T00:00:00+02:00').getTime();

const DISH_NAMES = [
  'Salmorejo cordobés',
  'Ensaladilla rusa',
  'Ensalada de tomate con atún',
  'Nachos con guacamole',
  'Tabla de embutidos, quesos y picos',
  'Tortilla de patatas grande #1',
  'Tortilla de patatas grande #2',
  'Empanadas',
  'Quiche (verduras o bacon)',
  'Pan preñao de queso',
  'Flamenquines en tacos',
  'Alitas de pollo en la barbacoa',
  'Croquetas caseras (jamón o puchero)',
  'Pinchos morunos para plancha',
  'Pastel cordobés + fruta cortada',
  'Tarta de queso al horno (bonus)',
  'Agua',
  'Coca-Cola',
  'Fanta',
  'Nuestra',
  'Aquarius',
  'Cervezas',
  'Vino tinto / blanco',
  'Tinto de verano preparado',
  'Pan',
  'Bolsas de hielo',
  'Café + leche + azúcar',
  'Comida para bebés',
  'Chuches para la piñata',
  'Platos',
  'Vasos',
  'Cubiertos',
  'Servilletas',
  'Bolsas de basura grandes',
  'Fuentes',
  'Cuencos',
];

function doGet(event) {
  try {
    const action = normalizeKey_(event && event.parameter ? event.parameter.action : '') || 'state';
    if (action !== 'state') throw new Error('Acción no válida.');
    return json_({ ok: true, state: buildState_() });
  } catch (error) {
    return json_({ ok: false, error: errorMessage_(error) });
  }
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(event && event.postData && event.postData.contents ? event.postData.contents : '{}');
    const action = normalizeKey_(body.action || 'rsvp');
    const payload = body.payload || body;

    lock.waitLock(12000);

    if (action === 'kahoot') {
      saveKahoot_(payload);
      return json_({ ok: true });
    }

    if (action === 'rsvp' || action === 'submit' || action === 'submitrsvp') {
      if (isClosed_()) throw new Error('Confirmaciones cerradas — habla con Teresa.');
      saveRsvp_(payload);
      return json_({ ok: true, state: buildState_() });
    }

    throw new Error('Acción no válida.');
  } catch (error) {
    return json_({ ok: false, error: errorMessage_(error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/** Ejecutar una vez después de pegar esta versión. */
function setup() {
  const spreadsheet = getSpreadsheet_();
  spreadsheet.setSpreadsheetTimeZone(TIME_ZONE);

  const attendance = requireSheet_(spreadsheet, ATTENDANCE_SHEET_NAME);
  const submissions = requireSheet_(spreadsheet, SUBMISSIONS_SHEET_NAME);
  const dishes = requireSheet_(spreadsheet, DISHES_SHEET_NAME);
  const kahoot = requireSheet_(spreadsheet, KAHOOT_SHEET_NAME);

  attendance.setFrozenRows(1);
  submissions.setFrozenRows(1);
  dishes.setFrozenRows(1);
  kahoot.setFrozenRows(1);

  submissions.getRange(1, 1, 1, 4).setValues([['FECHA', 'NOMBRE DE QUIEN RELLENA', 'FAMILIA', 'ALGO MÁS (alergias, sillas, hora de llegada...)']]);
  dishes.getRange(1, 1, 1, 3).setValues([['PLATO', 'QUIÉN LO TRAE', 'FECHA']]);
  ensureKahootSchema_(kahoot);

  // Valida que la tabla maestra tenga sus cuatro columnas esenciales.
  getAttendanceColumns_(attendance);

  return 'OK: organización preparada. ASISTENCIA + ENVIOS + PLATOS + KAHOOT listas para la landing v9.';
}

function buildState_() {
  const spreadsheet = getSpreadsheet_();
  const attendanceSheet = requireSheet_(spreadsheet, ATTENDANCE_SHEET_NAME);
  const dishesSheet = requireSheet_(spreadsheet, DISHES_SHEET_NAME);
  const people = readPeople_(attendanceSheet);
  const dishClaims = buildActiveDishClaims_(dishesSheet, people);

  return {
    people: people.map(function(person) {
      return {
        id: person.id,
        name: person.name,
        familia: person.familia,
        age: person.age,
        confirmed: person.confirmed,
      };
    }),
    totalAttending: people.filter(function(person) { return person.confirmed; }).length,
    dishClaims: dishClaims,
    updatedAt: new Date().toISOString(),
    closed: isClosed_(),
  };
}

function saveRsvp_(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Faltan datos de la confirmación.');

  const spreadsheet = getSpreadsheet_();
  const attendanceSheet = requireSheet_(spreadsheet, ATTENDANCE_SHEET_NAME);
  const submissionsSheet = requireSheet_(spreadsheet, SUBMISSIONS_SHEET_NAME);
  const dishesSheet = requireSheet_(spreadsheet, DISHES_SHEET_NAME);

  const columns = getAttendanceColumns_(attendanceSheet);
  const people = readPeople_(attendanceSheet);
  const searcherId = clean_(payload.searcherId);
  const searcher = people.find(function(person) { return person.id === searcherId; });
  if (!searcher) throw new Error('No encuentro a la persona que está rellenando el formulario. Recarga la página y prueba de nuevo.');

  if (payload.familia && normalizeKey_(payload.familia) !== normalizeKey_(searcher.familia)) {
    throw new Error('La rama familiar no coincide. Recarga la página y prueba de nuevo.');
  }

  const branch = people.filter(function(person) { return normalizeKey_(person.familia) === normalizeKey_(searcher.familia); });
  if (!branch.length) throw new Error('No encuentro vuestra rama familiar.');

  const incoming = Array.isArray(payload.attendees) ? payload.attendees : [];
  const incomingById = {};
  incoming.forEach(function(item) {
    const id = clean_(item && item.id);
    if (!id) return;
    incomingById[id] = Boolean(item.attending);
  });

  // Proyección previa: permite validar el plato antes de tocar ninguna celda.
  const projectedPeople = people.map(function(person) {
    if (normalizeKey_(person.familia) !== normalizeKey_(searcher.familia)) return person;
    if (incomingById[person.id] === undefined) return person;
    return Object.assign({}, person, { confirmed: incomingById[person.id] });
  });

  const projectedBranch = projectedPeople.filter(function(person) {
    return normalizeKey_(person.familia) === normalizeKey_(searcher.familia);
  });
  const anyAttending = projectedBranch.some(function(person) { return person.confirmed; });

  let dish = canonicalDishName_(payload.dish);
  if (anyAttending && !dish) throw new Error('Si viene alguien de vuestra rama, tenéis que elegir un plato.');
  if (dish && !isAllowedDish_(dish)) throw new Error('Ese plato no forma parte de la lista actual. Recarga la página.');

  const claimsBefore = buildActiveDishClaims_(dishesSheet, people);
  if (dish) {
    const conflicting = (claimsBefore[dish] || []).filter(function(carrier) {
      return clean_(carrier.searcherId) !== searcher.id;
    });
    if (conflicting.length) {
      throw new Error('Ese plato acaba de quedar ocupado por ' + conflicting[0].name + '. Elige otro.');
    }
  }

  // ASISTENCIA: solo cambia la columna de estado; el resto de la tabla maestra no se toca.
  branch.forEach(function(person) {
    if (incomingById[person.id] === undefined) return;
    attendanceSheet.getRange(person.rowNumber, columns.attendance).setValue(incomingById[person.id] ? 'CONFIRMADO' : '');
  });

  const dateText = formatDate_(new Date());
  submissionsSheet.appendRow([
    dateText,
    searcher.name,
    searcher.familia,
    clean_(payload.notes),
  ]);

  // PLATOS es un log: solo añadimos una fila si realmente cambia la reclamación del rellenador.
  if (anyAttending && dish) {
    const currentDish = currentDishForSearcher_(claimsBefore, searcher.id);
    if (normalizeKey_(currentDish) !== normalizeKey_(dish)) {
      dishesSheet.appendRow([dish, formatCarrier_(searcher), dateText]);
    }
  }
}

function saveKahoot_(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Faltan datos del Kahoot.');
  const question = clean_(payload.question);
  const answer = clean_(payload.answer);
  if (!question) throw new Error('Escribe una pregunta para el Kahoot.');
  if (!answer) throw new Error('La respuesta es obligatoria.');

  const spreadsheet = getSpreadsheet_();
  const sheet = requireSheet_(spreadsheet, KAHOOT_SHEET_NAME);
  ensureKahootSchema_(sheet);
  sheet.appendRow([question, answer, formatDate_(new Date())]);
}

function readPeople_(sheet) {
  const columns = getAttendanceColumns_(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const lastColumn = Math.max(sheet.getLastColumn(), columns.attendance);
  const values = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
  const people = [];
  let currentBranch = '';

  values.forEach(function(row, index) {
    const rowNumber = index + 2;
    const rawName = clean_(row[columns.name - 1]);
    if (!rawName) return;
    if (/^RAMA\s*:/i.test(rawName)) {
      currentBranch = rawName.replace(/^RAMA\s*:/i, '').trim();
      return;
    }

    const family = clean_(row[columns.family - 1]) || currentBranch;
    if (!family) return;
    people.push({
      id: String(rowNumber),
      rowNumber: rowNumber,
      name: rawName,
      familia: family,
      age: clean_(row[columns.age - 1]),
      confirmed: normalizeKey_(row[columns.attendance - 1]) === 'confirmado',
    });
  });

  return people;
}

function getAttendanceColumns_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 4);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(clean_);

  function findExact_(label) {
    const wanted = normalizeKey_(label);
    for (let i = 0; i < headers.length; i += 1) {
      if (normalizeKey_(headers[i]) === wanted) return i + 1;
    }
    return 0;
  }

  function findContains_(label) {
    const wanted = normalizeKey_(label);
    for (let i = 0; i < headers.length; i += 1) {
      if (normalizeKey_(headers[i]).indexOf(wanted) !== -1) return i + 1;
    }
    return 0;
  }

  const columns = {
    name: findExact_('NOMBRE'),
    family: findExact_('FAMILIA'),
    age: findExact_('GRUPO DE EDAD'),
    attendance: findContains_('ASISTENCIA'),
  };

  if (!columns.name || !columns.family || !columns.age || !columns.attendance) {
    throw new Error('La pestaña ASISTENCIA no tiene las columnas esperadas: NOMBRE, FAMILIA, GRUPO DE EDAD y ASISTENCIA.');
  }
  return columns;
}

function buildActiveDishClaims_(sheet, people) {
  const result = {};
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return result;

  const peopleByKey = {};
  const familyHasConfirmed = {};
  people.forEach(function(person) {
    peopleByKey[personKey_(person.name, person.familia)] = person;
    const familyKey = normalizeKey_(person.familia);
    if (person.confirmed) familyHasConfirmed[familyKey] = true;
  });

  // El registro es append-only. Para una misma persona, su última fila es la reclamación vigente.
  const latestByCarrier = {};
  const rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  rows.forEach(function(row) {
    const dish = canonicalDishName_(row[0]);
    const carrierRaw = clean_(row[1]);
    if (!dish || !carrierRaw) return;
    const parsed = parseCarrier_(carrierRaw);
    if (!parsed.name) return;
    const key = personKey_(parsed.name, parsed.familia);
    latestByCarrier[key] = {
      dish: dish,
      name: parsed.name,
      familia: parsed.familia,
      date: clean_(row[2]),
    };
  });

  Object.keys(latestByCarrier).forEach(function(key) {
    const claim = latestByCarrier[key];
    const matchedPerson = peopleByKey[key];
    const family = matchedPerson ? matchedPerson.familia : claim.familia;
    const familyKey = normalizeKey_(family);

    // Si reconocemos la rama y ya no viene nadie de ella, el plato deja de bloquear la lista.
    if (familyKey && familyHasConfirmed[familyKey] !== true) return;

    if (!result[claim.dish]) result[claim.dish] = [];
    result[claim.dish].push({
      name: matchedPerson ? matchedPerson.name : claim.name,
      familia: family,
      searcherId: matchedPerson ? matchedPerson.id : '',
      date: claim.date,
    });
  });

  return result;
}

function currentDishForSearcher_(claims, searcherId) {
  const id = clean_(searcherId);
  const dishNames = Object.keys(claims || {});
  for (let i = 0; i < dishNames.length; i += 1) {
    const dishName = dishNames[i];
    const carriers = claims[dishName] || [];
    if (carriers.some(function(carrier) { return clean_(carrier.searcherId) === id; })) return dishName;
  }
  return '';
}

function ensureKahootSchema_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const lastColumn = Math.max(sheet.getLastColumn(), 4);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(clean_);
  const first = normalizeKey_(headers[0]);
  const second = normalizeKey_(headers[1]);
  const third = normalizeKey_(headers[2]);
  const fourth = normalizeKey_(headers[3]);

  // Migra de NOMBRE | PREGUNTA | RESPUESTA | FECHA a PREGUNTA | RESPUESTA | FECHA.
  if (first === 'nombre' && second === 'pregunta' && third === 'respuesta' && fourth === 'fecha') {
    const data = lastRow > 1 ? sheet.getRange(2, 2, lastRow - 1, 3).getValues() : [];
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 4).clearContent();
    sheet.getRange(1, 1, 1, 3).setValues([['PREGUNTA', 'RESPUESTA', 'FECHA']]);
    sheet.getRange(1, 4).clearContent();
    if (data.length) sheet.getRange(2, 1, data.length, 3).setValues(data);
    return;
  }

  sheet.getRange(1, 1, 1, 3).setValues([['PREGUNTA', 'RESPUESTA', 'FECHA']]);
}

function canonicalDishName_(value) {
  const cleanName = clean_(value);
  if (!cleanName) return '';
  const key = normalizeKey_(cleanName);
  const aliases = {
    'salmorejo': 'Salmorejo cordobés',
    'tabla de embutidos y quesos': 'Tabla de embutidos, quesos y picos',
    'tarta de queso al horno': 'Tarta de queso al horno (bonus)',
  };
  if (aliases[key]) return aliases[key];
  for (let i = 0; i < DISH_NAMES.length; i += 1) {
    if (normalizeKey_(DISH_NAMES[i]) === key) return DISH_NAMES[i];
  }
  return cleanName;
}

function isAllowedDish_(dishName) {
  const key = normalizeKey_(dishName);
  return DISH_NAMES.some(function(item) { return normalizeKey_(item) === key; });
}

function parseCarrier_(raw) {
  const value = clean_(raw);
  const match = value.match(/^(.+?)\s*\((?:rama\s+)?(.+?)\)\s*$/i);
  if (match) return { name: clean_(match[1]), familia: clean_(match[2]) };
  const parts = value.split(' · ');
  if (parts.length >= 2) return { name: clean_(parts[0]), familia: clean_(parts.slice(1).join(' · ')) };
  return { name: value, familia: '' };
}

function formatCarrier_(person) {
  return clean_(person.name) + ' (' + clean_(person.familia) + ')';
}

function personKey_(name, family) {
  return normalizeKey_(family) + '|' + normalizeKey_(name);
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function requireSheet_(spreadsheet, name) {
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw new Error('No existe la pestaña ' + name + ' en la hoja organización.');
  return sheet;
}

function isClosed_() {
  return Date.now() >= RSVP_CLOSE_AT;
}

function formatDate_(date) {
  return Utilities.formatDate(date, TIME_ZONE, 'dd/MM/yyyy');
}

function clean_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeKey_(value) {
  return clean_(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, ' ')
    .trim();
}

function errorMessage_(error) {
  if (!error) return 'Error desconocido.';
  if (error.message) return String(error.message);
  return String(error);
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
