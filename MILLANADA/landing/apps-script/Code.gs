const SPREADSHEET_ID = '1j23whY1O54C4oW9iJkOjsO_avOp7cDSBolV09--4Znw';
const SHEET_NAME = 'Confirmaciones Web';
const MENU_SHEET_NAME = 'Reparto Menu';
const RSVP_CLOSE_AT = new Date('2026-10-06T00:00:00+02:00').getTime();

// Se añaden al final si la pestaña ya contiene columnas del formulario antiguo.
// No se borra ni se sobreescribe ninguna columna previa.
const REQUIRED_HEADERS = [
  'submitted_at',
  'searcher_id',
  'searcher_name',
  'familia',
  'attendees_json',
  'dish_selection_json',
  'other_dish',
  'notes',
  'kahoot_question',
  'updated_at',
];

function doGet(event) {
  try {
    const action = clean_(event && event.parameter ? event.parameter.action : '') || 'state';
    const sheet = getSheet_();

    if (action === 'state') {
      return json_({ ok: true, state: buildState_(sheet) });
    }

    if (action === 'rsvp') {
      const searcherId = clean_(event && event.parameter ? event.parameter.searcherId : '');
      if (!searcherId) throw new Error('Falta searcherId.');
      return json_({ ok: true, rsvp: getSubmission_(sheet, searcherId) });
    }

    throw new Error('Acción no válida.');
  } catch (error) {
    return json_({ ok: false, error: errorMessage_(error) });
  }
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(event && event.postData && event.postData.contents ? event.postData.contents : '{}');
    const action = clean_(body.action) || 'submit';
    if (action !== 'submit') throw new Error('Acción no válida.');
    if (isClosed_()) throw new Error('Confirmaciones cerradas — habla con Teresa.');

    lock.waitLock(10000);
    const sheet = getSheet_();
    const saved = saveSubmission_(sheet, body.payload || body);
    syncMenuAssignments_(sheet.getParent());
    return json_({ ok: true, rsvp: saved, state: buildState_(sheet) });
  } catch (error) {
    return json_({ ok: false, error: errorMessage_(error) });
  } finally {
    try {
      if (lock.hasLock()) lock.releaseLock();
    } catch (ignore) {}
  }
}

function setup() {
  const sheet = getSheet_();
  sheet.setFrozenRows(1);
  syncMenuAssignments_(sheet.getParent());
  return 'OK: ' + SHEET_NAME + ' preparada y ' + MENU_SHEET_NAME + ' sincronizado.';
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();

  if (lastColumn === 0 || lastRow === 0) {
    sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setValues([REQUIRED_HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  const current = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(clean_);
  const missing = REQUIRED_HEADERS.filter(function(header) {
    return current.indexOf(header) === -1;
  });

  if (missing.length) {
    sheet.getRange(1, lastColumn + 1, 1, missing.length).setValues([missing]);
  }
  sheet.setFrozenRows(1);
}

function getHeaderMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(clean_);
  const map = {};
  headers.forEach(function(header, index) {
    if (header) map[header] = index;
  });
  REQUIRED_HEADERS.forEach(function(header) {
    if (map[header] === undefined) throw new Error('Falta la columna ' + header + '. Ejecuta setup().');
  });
  return map;
}

function saveSubmission_(sheet, rawPayload) {
  const payload = normalizePayload_(rawPayload);
  const map = getHeaderMap_(sheet);
  const lastColumn = sheet.getLastColumn();
  const rows = getRsvpRows_(sheet);
  const existing = rows.find(function(item) { return item.rsvp.searcherId === payload.searcherId; });
  const rowNumber = existing ? existing.rowNumber : sheet.getLastRow() + 1;
  const rowValues = existing
    ? sheet.getRange(rowNumber, 1, 1, lastColumn).getValues()[0]
    : new Array(lastColumn).fill('');

  const now = new Date().toISOString();
  const previousSubmittedAt = clean_(rowValues[map.submitted_at]);

  rowValues[map.submitted_at] = previousSubmittedAt || now;
  rowValues[map.searcher_id] = payload.searcherId;
  rowValues[map.searcher_name] = payload.searcherName;
  rowValues[map.familia] = payload.familia;
  rowValues[map.attendees_json] = JSON.stringify(payload.attendees);
  rowValues[map.dish_selection_json] = JSON.stringify(payload.dishSelection);
  rowValues[map.other_dish] = payload.otherDish;
  rowValues[map.notes] = payload.notes;
  rowValues[map.kahoot_question] = payload.kahootQuestion;
  rowValues[map.updated_at] = now;

  sheet.getRange(rowNumber, 1, 1, lastColumn).setValues([rowValues]);

  payload.updatedAt = now;
  return payload;
}


/**
 * Reconstruye las columnas de reparto (E:G) a partir de todos los RSVP guardados.
 * Así un segundo envío sustituye de verdad al anterior y no deja platos "fantasma".
 * Los platos libres escritos en "Otro plato" se añaden al final como OTRO PROPUESTO.
 */
function syncMenuAssignments_(spreadsheet) {
  const rsvpSheet = spreadsheet.getSheetByName(SHEET_NAME);
  const menuSheet = spreadsheet.getSheetByName(MENU_SHEET_NAME);
  if (!rsvpSheet) throw new Error('No existe la pestaña ' + SHEET_NAME + '.');
  if (!menuSheet) throw new Error('No existe la pestaña ' + MENU_SHEET_NAME + '.');

  const rsvpRows = getRsvpRows_(rsvpSheet);
  const assignments = {};

  rsvpRows.forEach(function(item) {
    const rsvp = item.rsvp;
    const selected = (rsvp.dishSelection || []).slice();
    if (rsvp.otherDish && selected.indexOf(rsvp.otherDish) === -1) selected.push(rsvp.otherDish);

    selected.forEach(function(rawDish) {
      const dishName = canonicalDishName_(rawDish);
      const key = dishKey_(dishName);
      if (!key) return;
      if (!assignments[key]) assignments[key] = { dishName: dishName, carriers: [] };

      const duplicate = assignments[key].carriers.some(function(carrier) {
        return carrier.searcherId === rsvp.searcherId;
      });
      if (!duplicate) {
        assignments[key].carriers.push({
          searcherId: rsvp.searcherId,
          name: rsvp.searcherName,
          familia: rsvp.familia,
        });
      }
    });
  });

  let lastRow = Math.max(menuSheet.getLastRow(), 2);
  let values = menuSheet.getRange(1, 1, lastRow, 7).getValues();
  const menuRowsByKey = {};
  const assignmentRows = [];

  for (let i = 1; i < values.length; i += 1) {
    const rowNumber = i + 1;
    const numberValue = values[i][0];
    const category = clean_(values[i][1]);
    const dishName = clean_(values[i][2]);
    const isNumberedItem = typeof numberValue === 'number' && dishName;
    const isOtherProposal = category === 'OTRO PROPUESTO' && dishName;
    if (!isNumberedItem && !isOtherProposal) continue;

    const key = dishKey_(canonicalDishName_(dishName));
    if (key && menuRowsByKey[key] === undefined) menuRowsByKey[key] = rowNumber;
    assignmentRows.push(rowNumber);
  }

  // Añade las propuestas libres que todavía no formen parte del menú oficial.
  Object.keys(assignments).forEach(function(key) {
    if (menuRowsByKey[key] !== undefined) return;
    const assignment = assignments[key];
    menuSheet.appendRow(['', 'OTRO PROPUESTO', assignment.dishName, 'Por concretar', '', '', '']);
    const rowNumber = menuSheet.getLastRow();
    menuRowsByKey[key] = rowNumber;
    assignmentRows.push(rowNumber);
  });

  // Limpia solo las columnas que gestiona la web; el menú y sus cantidades no se tocan.
  if (assignmentRows.length) {
    const a1Ranges = assignmentRows.map(function(rowNumber) { return 'E' + rowNumber + ':G' + rowNumber; });
    menuSheet.getRangeList(a1Ranges).clearContent();
  }

  Object.keys(assignments).forEach(function(key) {
    const rowNumber = menuRowsByKey[key];
    if (!rowNumber) return;
    const carriers = assignments[key].carriers;
    if (!carriers.length) return;

    const families = unique_(carriers.map(function(carrier) { return carrier.familia; })).join(' · ');
    const people = carriers.map(function(carrier) {
      return carrier.name + (carrier.familia ? ' (' + carrier.familia + ')' : '');
    }).join(', ');

    menuSheet.getRange(rowNumber, 5, 1, 3).setValues([[families, '✅', 'Lo trae: ' + people]]);
  });
}

function canonicalDishName_(dishName) {
  const cleanName = clean_(dishName);
  const key = dishKey_(cleanName);
  if (key === 'berenjenas fritas con miel de cana') return '';
  const aliases = {
    'pipirrana con atun': 'Ensalada de tomate con atún',
    'papas alinas con caballa': 'Nachos con guacamole',
    'empanada de atun': 'Empanadas',
    'alitas de pollo al horno': 'Alitas de pollo en la barbacoa',
    'hielo': 'Bolsas de hielo',
    'cerveza': 'Cervezas',
    'cafe + leche + azucar + vasos': 'Café + leche + azúcar',
  };
  return aliases[key] || cleanName;
}

function dishKey_(value) {
  return clean_(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n');
}

function unique_(values) {
  const seen = {};
  return values.filter(function(value) {
    const key = clean_(value);
    if (!key || seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function normalizePayload_(rawPayload) {
  const payload = rawPayload || {};
  const searcherId = clean_(payload.searcherId);
  const searcherName = clean_(payload.searcherName);
  const familia = clean_(payload.familia);

  if (!searcherId) throw new Error('Falta searcherId.');
  if (!searcherName) throw new Error('Falta searcherName.');
  if (!familia) throw new Error('Falta familia.');

  const attendees = Array.isArray(payload.attendees)
    ? payload.attendees.slice(0, 40).map(function(attendee) {
        return {
          id: clean_(attendee && attendee.id),
          name: clean_(attendee && attendee.name),
          age: clean_(attendee && attendee.age),
          attending: Boolean(attendee && attendee.attending),
          extra: Boolean(attendee && attendee.extra),
          dishes: cleanStringArray_(attendee && attendee.dishes, 40),
        };
      }).filter(function(attendee) { return attendee.name; })
    : [];

  if (!attendees.length) throw new Error('Falta la lista de asistentes.');

  return {
    searcherId: searcherId,
    searcherName: searcherName,
    familia: familia,
    attendees: attendees,
    dishSelection: cleanStringArray_(payload.dishSelection, 40),
    otherDish: limit_(payload.otherDish, 500),
    notes: limit_(payload.notes, 5000),
    kahootQuestion: limit_(payload.kahootQuestion, 5000),
    updatedAt: new Date().toISOString(),
  };
}

function getSubmission_(sheet, searcherId) {
  const rows = getRsvpRows_(sheet);
  const match = rows.find(function(item) { return item.rsvp.searcherId === clean_(searcherId); });
  return match ? match.rsvp : null;
}

function buildState_(sheet) {
  const rows = getRsvpRows_(sheet);
  const dishCounts = {};
  let totalAttending = 0;
  let updatedAt = null;

  rows.forEach(function(item) {
    const rsvp = item.rsvp;
    const attending = rsvp.attendees.filter(function(attendee) { return attendee.attending; });
    totalAttending += attending.length;

    let dishesAttributed = false;
    attending.forEach(function(attendee) {
      (attendee.dishes || []).forEach(function(dishName) {
        dishesAttributed = true;
        addDishCarrier_(dishCounts, dishName, attendee.name, rsvp.familia, rsvp.searcherId);
      });
    });

    // Compatibilidad defensiva: si hay selección pero ningún attendee tiene dishes,
    // atribuimos los platos al responsable del RSVP.
    if (!dishesAttributed) {
      (rsvp.dishSelection || []).forEach(function(dishName) {
        addDishCarrier_(dishCounts, dishName, rsvp.searcherName, rsvp.familia, rsvp.searcherId);
      });
    }

    if (rsvp.updatedAt && (!updatedAt || rsvp.updatedAt > updatedAt)) updatedAt = rsvp.updatedAt;
  });

  return {
    totalAttending: totalAttending,
    dishCounts: dishCounts,
    updatedAt: updatedAt,
    closed: isClosed_(),
  };
}

function addDishCarrier_(dishCounts, dishName, name, familia, searcherId) {
  const cleanDish = clean_(dishName);
  if (!cleanDish) return;
  if (!dishCounts[cleanDish]) dishCounts[cleanDish] = [];
  dishCounts[cleanDish].push({ name: clean_(name), familia: clean_(familia), searcherId: clean_(searcherId) });
}

function getRsvpRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const map = getHeaderMap_(sheet);
  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const rows = [];

  values.forEach(function(row, index) {
    const searcherId = clean_(row[map.searcher_id]);
    if (!searcherId) return; // ignora filas del formulario antiguo

    rows.push({
      rowNumber: index + 2,
      rsvp: {
        searcherId: searcherId,
        searcherName: clean_(row[map.searcher_name]),
        familia: clean_(row[map.familia]),
        attendees: parseArray_(row[map.attendees_json]),
        dishSelection: parseArray_(row[map.dish_selection_json]),
        otherDish: clean_(row[map.other_dish]),
        notes: clean_(row[map.notes]),
        kahootQuestion: clean_(row[map.kahoot_question]),
        updatedAt: clean_(row[map.updated_at]),
      },
    });
  });

  return rows;
}

function parseArray_(value) {
  if (Array.isArray(value)) return value;
  const text = clean_(value);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (ignore) {
    return [];
  }
}

function cleanStringArray_(value, maxItems) {
  if (!Array.isArray(value)) return [];
  const seen = {};
  return value.slice(0, maxItems || 40).map(clean_).filter(function(item) {
    if (!item || seen[item]) return false;
    seen[item] = true;
    return true;
  });
}

function isClosed_() {
  return Date.now() >= RSVP_CLOSE_AT;
}

function limit_(value, maxLength) {
  return clean_(value).slice(0, maxLength);
}

function clean_(value) {
  return String(value === null || value === undefined ? '' : value).trim();
}

function errorMessage_(error) {
  return String(error && error.message ? error.message : error || 'Error desconocido.');
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
