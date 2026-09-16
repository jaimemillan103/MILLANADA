# LA MILLANADA 2026 — Plan maestro

> Documento vivo compartido entre Claude Code (organización) y Codex (landing page + formulario).
> Fuente única de la verdad. Si algo cambia, se actualiza aquí.

---

## 1. Contexto del evento

- **Fecha:** sábado 11 de octubre de 2026
- **Ubicación:** casa familiar con jardín, Córdoba
- **Tipo:** celebración familiar multigeneracional
- **Rango de edades:** de bisnietos de 1 año a la bisabuela Margarita, 96 años
- **Asistencia estimada:** 25–35 personas (no confirmada)
- **Filosofía:** que participe todo el mundo, esfuerzo repartido entre familias, presupuesto contenido

## 2. Asistentes (según hoja de asistencia)

Ramas familiares con hijos/acompañantes previstos:

| Tíos | Primos | Acompañantes |
|------|--------|--------------|
| Cristobal / Ita | Conchita | 4 |
|  | Clara | 3 |
|  | Tomas | 4 |
| Teresa / Juande | Juande | 0 |
|  | Alvaro | 0 |
| Margarita / Javier | Gonzalo | 4 |
|  | Peri | 0 |
|  | Anita | 0 |
| Felisa / Jaime | Fernando | 1 |
|  | Enrique | 0 |
| Loles | Teresa | 0 |
|  | Maria | 1 |
|  | Miguel | 1 |
| Joaquin / Amalia | Quino | 1 |
|  | Pepe | 1 |
|  | Amalita | 1 |
| Tomas / Maria Luisa | Tomi | 1 |
|  | Marta | 1 |
|  | Jaime | 0 |

Total teórico si vienen todos: 49 personas. Estimación realista: 25–35.

## 3. Cronograma del día

| Hora | Bloque | Detalle |
|------|--------|---------|
| 13:30 | Recepción | Bebidas frías + picoteo (aceitunas, patatas, etc) en el jardín |
| 14:30 | **Comida** | Buffet en mesa larga con lo que trae cada familia |
| 16:30 | Sobremesa | Café + postres |
| 17:00 | **Foto oficial** 4 generaciones | Con la abuela fresca, antes de actividades físicas |
| 17:30 | **Gymkana** por equipos mixtos | Edades mezcladas, en el jardín |
| 18:30 | **Piñata** niños + merienda | Bizcochos, fruta, zumos |
| 19:30 | **Bingo de canciones** | Para todas las edades |
| 21:00 | Picoteo-cena | Sobras + tabla embutidos/quesos |
| 22:00 | **Kahoot familiar** | Proyector, peques ya durmiendo |
| 23:30 | Cierre | Copa, música suave, sobremesa larga |

## 4. Secciones organizativas

1. Logística y espacio (casa+jardín, ya resuelta)
2. Comida y bebida ← ver §5
3. Timing y programa ← ver §3
4. Confirmaciones y comunicación ← **la landing page cubre esto**
5. Ocio adultos (kahoot, bingo, sobremesa)
6. Ocio niños/bebés (piñata, gymkana, zona segura)
7. Momento abuela / homenaje (foto 4 generaciones a las 17:00)

## 5. Menú — 15 platos + extras

Cada familia se apunta a **uno** (o dos si son muchos). Cantidades pensadas para 30 personas.

### Fríos
1. Salmorejo cordobés — 1 jarra grande + huevo/jamón aparte
2. Ensaladilla rusa — bandeja grande (~15 raciones)
3. Pipirrana con atún — ensaladera grande
4. Papas aliñás con caballa — bandeja grande
5. Tabla de embutidos, quesos y picos — 1 tabla grande

### Calientes ligeros
6. Tortilla de patatas grande #1 — XL (10-12 raciones)
7. Tortilla de patatas grande #2 — XL (10-12 raciones)
8. Empanada de atún — bandeja entera
9. Quiche (verduras o bacon) — 1 quiche grande
10. Berenjenas fritas con miel de caña — bandeja grande

### Fuertes
11. Flamenquines en tacos — ~20 unidades
12. Alitas de pollo al horno — bandeja XL (~3 kg)
13. Croquetas caseras (jamón o puchero) — ~60 unidades
14. Pinchos morunos para plancha — ~30 pinchos

### Postre
15. Pastel cordobés + fuente de fruta cortada
15b. (bonus) Tarta de queso al horno

### Bebidas y extras (repartir en paralelo)
- Agua (12-15 botellas 1,5 L)
- Refrescos (8-10 botellas 2 L mezcla)
- Cerveza (1 pack grande + 1 mediano)
- Vino tinto/blanco (3 tintos + 2 blancos)
- Tinto de verano preparado (2-3 garrafas)
- Pan (6-8 barras)
- Hielo (4-5 bolsas grandes)
- Café + leche + azúcar + vasos
- Comida para bebés (papillas + fruta blanda)
- Chuches para la piñata (1-2 kg surtido)

## 6. Actividades confirmadas

- **Gymkana** de día en el jardín (por diseñar)
- **Piñata** para los niños pequeños (ya lo hicimos otro año, funciona)
- **Bingo de canciones** (por preparar la lista)
- **Kahoot** de noche con proyector (por diseñar preguntas familiares)

---

## 7. Requisitos para la landing page (para Codex)

**Objetivo:** una página donde cada familia entre, confirme asistencia, indique acompañantes, y a la vez se apunte a un plato del reparto. Reemplaza al Excel + al mensaje de WhatsApp.

### 7.1 Campos del formulario

Por cada familia que rellena:

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| Nombre del primo/tío responsable | texto | sí | quien rellena |
| Rama familiar | select | sí | opciones = las 7 ramas de tíos del §2 |
| ¿Vienes? | radio (Sí / No / Todavía no sé) | sí | |
| Número de adultos (incluido tú) | número | sí | por defecto 1 |
| Número de niños (>3 años) | número | sí | por defecto 0 |
| Número de bebés (≤3 años) | número | sí | por defecto 0 |
| Alergias o intolerancias | texto libre | no | |
| ¿A qué plato te apuntas? | select | sí si viene | ver §7.2 |
| ¿Traes algo extra? | texto libre | no | pan, hielo, bebida… |
| Comentarios | texto libre | no | |

### 7.2 Selector del reparto de comida

Muy importante: el select de platos tiene que mostrar **qué está ya cogido y qué no**, para que no se dupliquen.

- Cada plato del §5 aparece como opción.
- Al lado del nombre, marcar "✅ Ya lo trae [nombre]" si está cogido, o "🟢 Disponible".
- Si un plato está cogido, no se puede volver a seleccionar (o se avisa: "ya lo trae X, ¿seguro que quieres traer otro?").
- Debe existir opción "Prefiero traer bebidas / extras" que enlace con la lista de bebidas del §5.

### 7.3 Vista pública de resultados

En la misma landing (o una segunda pestaña):

- **Contador** de confirmados / dudosos / no vienen.
- **Tabla del reparto** en vivo: cada plato + quién lo trae + cantidad orientativa.
- **Alergias** agrupadas.
- Botón "Descargar en Excel" (opcional, nice-to-have).

### 7.4 Consideraciones técnicas

- Español (Córdoba).
- Móvil primero — la mayoría rellenará desde el WhatsApp familiar en el móvil.
- Persistencia sencilla: Google Sheets como backend (usa el Sheet ya creado en Drive: `Reparto Menu Millanada`, ID `1j23whY1O54C4oW9iJkOjsO_avOp7cDSBolV09--4Znw`) o Supabase/Firebase, lo que sea más rápido.
- Diseño festivo pero legible para gente mayor: fuente grande, contrastes claros, no depender de colores para transmitir estado (usar iconos + texto).
- Fecha tope de confirmación: 5 de octubre.
- No pedir login. Basta con el nombre.

### 7.5 Copy inicial de la landing (borrador)

> **La Millanada 2026**
> 🗓 Sábado 11 de octubre · 🏡 Chalet · Córdoba
> Nos juntamos las 4 generaciones desde la 1:30 de la tarde hasta que aguantemos.
> Confírmanos si vienes y apúntate a un plato — así no repetimos 5 tortillas y ninguna ensaladilla 😉

---

## 8. Estado / TODOs

- [x] Menú definido (15 platos)
- [x] Cronograma borrador
- [x] Excel de reparto (Drive)
- [x] Carpeta Drive compartida con teromi.99@gmail.com
- [ ] Plano de la casa y jardín (Jaime lo mandará)
- [ ] Diseño gymkana
- [ ] Lista de canciones para el bingo
- [ ] Preguntas del Kahoot familiar
- [ ] Landing page (Codex)
- [ ] Playlist del día
- [ ] Fotógrafo designado

---

*Última actualización: 2026-08-22 · Mantenido por Claude Code + Codex*
