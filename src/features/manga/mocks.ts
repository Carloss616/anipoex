// ponytail: static seed data — delete this file when the API lands
export const GENRES = [
  "Todo",
  "Acción",
  "Romance",
  "Seinen",
  "Deportes",
] as const;

export const MANGA = [
  {
    id: "1",
    title: "Berserk",
    year: "1989",
    author: "Kentaro Miura",
    genre: "Acción",
    score: "9.4",
    chapters: 374,
  },
  {
    id: "2",
    title: "Chainsaw Man",
    year: "2018",
    author: "Tatsuki Fujimoto",
    genre: "Acción",
    score: "8.7",
    chapters: 190,
  },
  {
    id: "3",
    title: "Vagabond",
    year: "1998",
    author: "Takehiko Inoue",
    genre: "Seinen",
    score: "9.2",
    chapters: 327,
  },
  {
    id: "4",
    title: "Horimiya",
    year: "2011",
    author: "Hero",
    genre: "Romance",
    score: "8.3",
    chapters: 122,
  },
  {
    id: "5",
    title: "Blue Lock",
    year: "2018",
    author: "Muneyuki Kaneshiro",
    genre: "Deportes",
    score: "8.2",
    chapters: 280,
  },
  {
    id: "6",
    title: "Kaguya-sama",
    year: "2015",
    author: "Aka Akasaka",
    genre: "Romance",
    score: "8.8",
    chapters: 281,
  },
];

export const MANGA_DETAIL = {
  title: "Berserk",
  author: "Kentaro Miura",
  status: "En publicación",
  year: "1989",
  score: "9.4",
  genres: ["Acción", "Dark fantasy", "Seinen"],
  progress: 0.32,
  lastRead: "Cap. 120",
  synopsis:
    "Guts, un mercenario marcado por un destino cruel, recorre un mundo devastado en busca de venganza contra los demonios que le arrebataron todo. Una épica oscura sobre la voluntad humana frente a lo inevitable.",
};

export const CHAPTERS = Array.from({ length: 8 }, (_, i) => ({
  id: String(374 - i),
  title: `Capítulo ${374 - i}`,
  date: "12 sep 2025",
  read: i > 4,
}));

export const STATS = [
  { label: "Capítulos", value: "374" },
  { label: "Volúmenes", value: "42" },
  { label: "Puntuación", value: "9.4" },
];
