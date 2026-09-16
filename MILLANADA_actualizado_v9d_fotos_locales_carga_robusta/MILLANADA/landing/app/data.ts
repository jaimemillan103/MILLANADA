export type GuestAge = 'Adulto' | 'Joven adulto' | 'Niño/a' | string;

export type Person = {
  id: string;
  name: string;
  familia: string;
  age: GuestAge;
  confirmed: boolean;
};

export type DishItem = {
  num: number;
  name: string;
  qty: string;
};

export type DishGroup = {
  category: string;
  className: 'cat-orange' | 'cat-green' | 'cat-red' | 'cat-ink';
  note?: string;
  items: DishItem[];
};

export type DishCarrier = {
  name: string;
  familia: string;
  searcherId?: string;
  date?: string;
};

export type PublicState = {
  people: Person[];
  totalAttending: number;
  dishClaims: Record<string, DishCarrier[]>;
  updatedAt?: string | null;
  closed?: boolean;
};

export type RsvpAttendee = {
  id: string;
  name: string;
  attending: boolean;
};

export type RsvpPayload = {
  searcherId: string;
  searcherName: string;
  familia: string;
  attendees: RsvpAttendee[];
  dish: string;
  notes: string;
  submittedAt: string;
};

export type KahootPayload = {
  question: string;
  answer: string;
  submittedAt: string;
};

export const EVENT_DATE_ISO = '2026-10-11T13:30:00+02:00';
export const RSVP_CLOSE_ISO = '2026-10-06T00:00:00+02:00';
export const RSVP_DEADLINE = '5 de octubre';

export const recapPhotos = Array.from({ length: 15 }, (_, index) => ({
  id: `recap-${String(index + 1).padStart(2, '0')}`,
  src: `/recap/recap-${String(index + 1).padStart(2, '0')}.webp`,
  alt: `Foto Millanada 2024 · ${index + 1}`,
}));

export const dishGroups: DishGroup[] = [
  {
    category: 'Fríos',
    className: 'cat-orange',
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
    className: 'cat-green',
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
    className: 'cat-red',
    items: [
      { num: 11, name: 'Flamenquines en tacos', qty: '~20 unidades' },
      { num: 12, name: 'Alitas de pollo en la barbacoa', qty: 'Bandeja XL (1,5x — ~3 kg)' },
      { num: 13, name: 'Croquetas caseras (jamón o puchero)', qty: '~60 unidades' },
      { num: 14, name: 'Pinchos morunos para plancha', qty: '~30 pinchos' },
    ],
  },
  {
    category: 'Postre',
    className: 'cat-orange',
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
  { time: '13:30', title: 'Tapeo y comida' },
  { time: '16:00', title: 'Café y sobremesa: bingo' },
  { time: '17:00', title: 'Foto grupal' },
  { time: '17:05', title: 'Entretenimientos varios: Kahoot, gymkana, torneo de ping pong, pompas, juegos clásicos…' },
  { time: '20:00', title: 'Concierto' },
  { time: '21:00', title: 'Juegos de mesa' },
  { time: 'A partir de las 21:00', title: 'Cierre abierto: cada uno se va cuando quiera' },
];
