export type GuestAge = 'Adulto' | 'Joven adulto' | 'Niño/a';

export type Guest = {
  id: string;
  name: string;
  familia: string;
  age: GuestAge;
};

export type Attendee = {
  id: string;
  name: string;
  age: GuestAge | string;
  attending: boolean;
  extra: boolean;
  dishes: string[];
};

export type DishItem = {
  num: number;
  name: string;
  qty: string;
};

export type DishGroup = {
  category: string;
  className: 'cat-azulejo' | 'cat-leaf' | 'cat-terracota' | 'cat-rose' | 'cat-ink';
  note?: string;
  items: DishItem[];
};

export type DishCarrier = {
  name: string;
  familia: string;
  searcherId?: string;
};

export type PublicState = {
  totalAttending: number;
  dishCounts: Record<string, DishCarrier[]>;
  updatedAt?: string | null;
  closed?: boolean;
};

export type RsvpPayload = {
  searcherId: string;
  searcherName: string;
  familia: string;
  attendees: Attendee[];
  dishSelection: string[];
  otherDish: string;
  notes: string;
  kahootQuestion: string;
  updatedAt: string;
};

export const EVENT_DATE_ISO = '2026-10-11T13:30:00+02:00';
export const RSVP_CLOSE_ISO = '2026-10-06T00:00:00+02:00';
export const RSVP_DEADLINE = '5 de octubre';

// Lista exacta de PRIMA_ARTIFACT.html. Son 63 entradas (IDs 0–62).
// PLAN.md conserva de momento la lista antigua y debe sincronizarse aparte.
export const guests: Guest[] = [
  { id: '0', name: 'Margarita', familia: 'de Valenzuela', age: 'Adulto' },
  { id: '1', name: 'Ita', familia: 'Millán Zurita', age: 'Adulto' },
  { id: '2', name: 'Cristobal', familia: 'Millán Zurita', age: 'Adulto' },
  { id: '3', name: 'Conchita', familia: 'Millán Zurita', age: 'Joven adulto' },
  { id: '4', name: 'Xavi', familia: 'Millán Zurita', age: 'Joven adulto' },
  { id: '5', name: 'Ignacio', familia: 'Millán Zurita', age: 'Niño/a' },
  { id: '6', name: 'Baby Xavi', familia: 'Millán Zurita', age: 'Niño/a' },
  { id: '7', name: 'Gonzalo', familia: 'Millán Zurita', age: 'Niño/a' },
  { id: '8', name: 'Tomás', familia: 'Millán Zurita', age: 'Joven adulto' },
  { id: '9', name: 'Mª Paz', familia: 'Millán Zurita', age: 'Joven adulto' },
  { id: '10', name: 'Tomi', familia: 'Millán Zurita', age: 'Niño/a' },
  { id: '11', name: 'Jaime', familia: 'Millán Zurita', age: 'Niño/a' },
  { id: '12', name: 'Pablo', familia: 'Millán Zurita', age: 'Niño/a' },
  { id: '13', name: 'Clarita', familia: 'Millán Zurita', age: 'Joven adulto' },
  { id: '14', name: 'Carlos', familia: 'Millán Zurita', age: 'Joven adulto' },
  { id: '15', name: 'Carlitos', familia: 'Millán Zurita', age: 'Niño/a' },
  { id: '16', name: 'Santiago', familia: 'Millán Zurita', age: 'Niño/a' },
  { id: '17', name: 'Loles', familia: 'Rodríguez Millán', age: 'Adulto' },
  { id: '18', name: 'María', familia: 'Rodríguez Millán', age: 'Joven adulto' },
  { id: '19', name: 'Adrien', familia: 'Rodríguez Millán', age: 'Joven adulto' },
  { id: '20', name: 'Emma', familia: 'Rodríguez Millán', age: 'Niño/a' },
  { id: '21', name: 'Miguel', familia: 'Rodríguez Millán', age: 'Joven adulto' },
  { id: '22', name: 'Rebeca', familia: 'Rodríguez Millán', age: 'Joven adulto' },
  { id: '23', name: 'Teresa', familia: 'Rodríguez Millán', age: 'Joven adulto' },
  { id: '24', name: 'Luife', familia: 'Rodríguez Millán', age: 'Joven adulto' },
  { id: '25', name: 'Felisa', familia: 'Luján Millán', age: 'Adulto' },
  { id: '26', name: 'Jaime', familia: 'Luján Millán', age: 'Adulto' },
  { id: '27', name: 'Fernando', familia: 'Luján Millán', age: 'Joven adulto' },
  { id: '28', name: 'Silvia', familia: 'Luján Millán', age: 'Joven adulto' },
  { id: '29', name: 'Enrique', familia: 'Luján Millán', age: 'Joven adulto' },
  { id: '30', name: 'Joaquín', familia: 'Millán López', age: 'Adulto' },
  { id: '31', name: 'Quino', familia: 'Millán López', age: 'Joven adulto' },
  { id: '32', name: 'Quinito', familia: 'Millán López', age: 'Niño/a' },
  { id: '33', name: 'Amalita', familia: 'Millán López', age: 'Joven adulto' },
  { id: '34', name: 'Jesús', familia: 'Millán López', age: 'Joven adulto' },
  { id: '35', name: 'Pepe', familia: 'Millán López', age: 'Joven adulto' },
  { id: '36', name: 'Paula', familia: 'Millán López', age: 'Joven adulto' },
  { id: '37', name: 'Tomás', familia: 'Millán Sánchez', age: 'Adulto' },
  { id: '38', name: 'Mª Luisa', familia: 'Millán Sánchez', age: 'Adulto' },
  { id: '39', name: 'Tomi', familia: 'Millán Sánchez', age: 'Joven adulto' },
  { id: '40', name: 'Pilar', familia: 'Millán Sánchez', age: 'Joven adulto' },
  { id: '41', name: 'Marta', familia: 'Millán Sánchez', age: 'Joven adulto' },
  { id: '42', name: 'Álvaro', familia: 'Millán Sánchez', age: 'Joven adulto' },
  { id: '43', name: 'Jaime', familia: 'Millán Sánchez', age: 'Joven adulto' },
  { id: '44', name: 'Margari', familia: 'Fdez. de Lascoiti Millán', age: 'Adulto' },
  { id: '45', name: 'Javier', familia: 'Fdez. de Lascoiti Millán', age: 'Adulto' },
  { id: '46', name: 'Gonzalo', familia: 'Fdez. de Lascoiti Millán', age: 'Joven adulto' },
  { id: '47', name: 'Carmen', familia: 'Fdez. de Lascoiti Millán', age: 'Joven adulto' },
  { id: '48', name: 'Gabrielito', familia: 'Fdez. de Lascoiti Millán', age: 'Niño/a' },
  { id: '49', name: 'Alejandra', familia: 'Fdez. de Lascoiti Millán', age: 'Niño/a' },
  { id: '50', name: 'Olivia', familia: 'Fdez. de Lascoiti Millán', age: 'Niño/a' },
  { id: '51', name: 'Perico', familia: 'Fdez. de Lascoiti Millán', age: 'Joven adulto' },
  { id: '52', name: 'Ana', familia: 'Fdez. de Lascoiti Millán', age: 'Joven adulto' },
  { id: '53', name: 'Juande', familia: 'Jimena Millán', age: 'Adulto' },
  { id: '54', name: 'Teresa', familia: 'Jimena Millán', age: 'Adulto' },
  { id: '55', name: 'Juande hijo', familia: 'Jimena Millán', age: 'Joven adulto' },
  { id: '56', name: 'Ana', familia: 'Jimena Millán', age: 'Joven adulto' },
  { id: '57', name: 'Patricia', familia: 'Jimena Millán', age: 'Niño/a' },
  { id: '58', name: 'Álvaro', familia: 'Jimena Millán', age: 'Joven adulto' },
  { id: '59', name: 'Helene', familia: 'Jimena Millán', age: 'Joven adulto' },
  { id: '60', name: 'Flora', familia: 'Jimena Millán', age: 'Niño/a' },
  { id: '61', name: 'Mario', familia: 'Jimena Millán', age: 'Niño/a' },
  { id: '62', name: 'Félix', familia: 'Jimena Millán', age: 'Niño/a' },
];

export const dishGroups: DishGroup[] = [
  {
    category: 'Fríos',
    className: 'cat-azulejo',
    items: [
      { num: 1, name: 'Salmorejo cordobés', qty: '1 jarra grande + huevo/jamón aparte' },
      { num: 2, name: 'Ensaladilla rusa', qty: 'Bandeja grande (~15 raciones)' },
      { num: 3, name: 'Ensalada de tomate con atún', qty: 'Ensaladera grande' },
      { num: 4, name: 'Nachos con guacamole', qty: 'Bandeja grande' },
      { num: 5, name: 'Tabla de embutidos, quesos y picos', qty: '1 tabla grande' },
    ],
  },
  {
    category: 'Calientes ligeros',
    className: 'cat-leaf',
    items: [
      { num: 6, name: 'Tortilla de patatas grande #1', qty: 'Tortilla XL (10-12 raciones)' },
      { num: 7, name: 'Tortilla de patatas grande #2', qty: 'Tortilla XL (10-12 raciones)' },
      { num: 8, name: 'Empanadas', qty: 'Bandeja entera · sabor por decidir' },
      { num: 9, name: 'Quiche (verduras o bacon)', qty: '1 quiche grande' },
      { num: 10, name: 'Pan preñao de queso', qty: 'Por concretar' },
    ],
  },
  {
    category: 'Fuertes',
    className: 'cat-terracota',
    items: [
      { num: 11, name: 'Flamenquines en tacos', qty: '~20 unidades' },
      { num: 12, name: 'Alitas de pollo en la barbacoa', qty: 'Bandeja XL (1,5x — ~3 kg)' },
      { num: 13, name: 'Croquetas caseras (jamón o puchero)', qty: '~60 unidades' },
      { num: 14, name: 'Pinchos morunos para plancha', qty: '~30 pinchos' },
    ],
  },
  {
    category: 'Postre',
    className: 'cat-rose',
    items: [
      { num: 15, name: 'Pastel cordobés + fruta cortada', qty: '1 pastel + fuente fruta' },
      { num: 16, name: 'Tarta de queso al horno (bonus)', qty: '1 tarta grande' },
    ],
  },
  {
    category: 'Bebidas y extras',
    className: 'cat-ink',
    note: 'Ya hay ron, ginebra, wishkey, vodka y pacharán. A comprar: Coca-Cola, Fanta, Nuestra, Aquarius y cervezas.',
    items: [
      { num: 17, name: 'Agua', qty: '12-15 botellas 1,5 L' },
      { num: 18, name: 'Coca-Cola', qty: 'Por concretar' },
      { num: 19, name: 'Fanta', qty: 'Por concretar' },
      { num: 20, name: 'Nuestra', qty: 'Por concretar' },
      { num: 21, name: 'Aquarius', qty: 'Por concretar' },
      { num: 22, name: 'Cervezas', qty: '1 pack grande + 1 mediano' },
      { num: 23, name: 'Vino tinto / blanco', qty: '3 tintos + 2 blancos' },
      { num: 24, name: 'Tinto de verano preparado', qty: '2-3 garrafas' },
      { num: 25, name: 'Pan', qty: '6-8 barras' },
      { num: 26, name: 'Bolsas de hielo', qty: '4-5 bolsas grandes' },
      { num: 27, name: 'Café + leche + azúcar', qty: 'Kit completo' },
      { num: 28, name: 'Comida para bebés', qty: 'Papillas + fruta blanda' },
      { num: 29, name: 'Chuches para la piñata', qty: '1-2 kg surtido' },
      { num: 30, name: 'Platos', qty: 'Por concretar' },
      { num: 31, name: 'Vasos', qty: 'Por concretar' },
      { num: 32, name: 'Cubiertos', qty: 'Por concretar' },
      { num: 33, name: 'Servilletas', qty: 'Por concretar' },
      { num: 34, name: 'Bolsas de basura grandes', qty: 'Por concretar' },
      { num: 35, name: 'Fuentes', qty: 'Por concretar' },
      { num: 36, name: 'Cuencos', qty: 'Por concretar' },
    ],
  },
];

export const dishNames = dishGroups.flatMap((group) => group.items.map((item) => item.name));

export const schedule = [
  { time: '13:30', title: 'Recepción', detail: 'Bebidas frías + picoteo en el jardín.' },
  { time: '14:30', title: 'Comida', detail: 'Buffet en mesa larga con lo que trae cada familia.' },
  { time: '16:30', title: 'Sobremesa', detail: 'Café + postres.' },
  { time: '17:00', title: 'Foto oficial', detail: 'Cuatro generaciones, con la abuela fresca.' },
  { time: '17:30', title: 'Gymkana', detail: 'Equipos mixtos y edades mezcladas en el jardín.' },
  { time: '18:30', title: 'Piñata + merienda', detail: 'Bizcochos, fruta, zumos y caos controlado.' },
  { time: '19:30', title: 'Bingo de canciones', detail: 'Para todas las edades.' },
  { time: '21:00', title: 'Picoteo-cena', detail: 'Sobras + tabla de embutidos y quesos.' },
  { time: '22:00', title: 'Kahoot familiar', detail: 'Proyector y preguntas que pueden cambiar reputaciones.' },
  { time: '23:30', title: 'Cierre', detail: 'Copa, música suave y sobremesa larga.' },
];

export const galleryItems = [
  { src: '/galeria/millanada-01.webp', title: 'La mesa', caption: 'Sobremesa larga, como manda la tradición.' },
  { src: '/galeria/millanada-02.webp', title: 'El jardín', caption: 'Cuando el jardín se convierte en terreno de juego.' },
  { src: '/galeria/millanada-03.webp', title: 'Los pequeños', caption: 'La siguiente generación ya viene fuerte.' },
  { src: '/galeria/millanada-04.webp', title: 'A las ramas', caption: 'En la Millanada también se escala.' },
  { src: '/galeria/millanada-05.webp', title: 'Las primas', caption: 'Fotos que luego acaban en el grupo familiar.' },
];
