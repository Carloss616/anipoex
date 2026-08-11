export const CHAPTERS = Array.from({ length: 8 }, (_, i) => ({
  id: String(374 - i),
  title: `Capítulo ${374 - i}`,
  date: "12 sep 2025",
  read: i > 4,
}));
