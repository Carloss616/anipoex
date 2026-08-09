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
