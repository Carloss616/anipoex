import type { Source } from "./source";

/**
 * SCAFFOLDING. Stands in until there is a source registry that fetches, and is
 * the only place inventing one — swap this file's export for the real list and
 * nothing else moves.
 *
 * Nothing here is fetched, so none of these names promise the app can read
 * them. They exist so the sheet has rows while it is being built.
 */
export const MOCK_SOURCES: Source[] = [
  { id: "mangadex", name: "MangaDex", initials: "MD", color: "primary" },
  { id: "comick", name: "ComicK", initials: "CK", color: "success" },
  { id: "batoto", name: "Bato.to", initials: "BT", color: "warning" },
  { id: "mangapark", name: "MangaPark", initials: "MP", color: "secondary" },
  {
    id: "weebcentral",
    name: "Weeb Central",
    initials: "WC",
    color: "destructive",
  },
  { id: "asurascans", name: "Asura Scans", initials: "AS", color: "primary" },
  { id: "flamecomics", name: "Flame Comics", initials: "FC", color: "success" },
  { id: "reaperscans", name: "Reaper Scans", initials: "RS", color: "warning" },
  {
    id: "luminousscans",
    name: "Luminous Scans",
    initials: "LS",
    color: "secondary",
  },
  {
    id: "nightscans",
    name: "Night Scans",
    initials: "NS",
    color: "destructive",
  },
  { id: "voidscans", name: "Void Scans", initials: "VS", color: "primary" },
  { id: "drakescans", name: "Drake Scans", initials: "DS", color: "success" },
  { id: "realmscans", name: "Realm Scans", initials: "RL", color: "warning" },
  {
    id: "cosmicscans",
    name: "Cosmic Scans",
    initials: "CS",
    color: "secondary",
  },
  {
    id: "omegascans",
    name: "Omega Scans",
    initials: "OS",
    color: "destructive",
  },
  { id: "nitroscans", name: "Nitro Scans", initials: "NT", color: "primary" },
  { id: "zeroscans", name: "Zero Scans", initials: "ZS", color: "success" },
  { id: "lynxscans", name: "Lynx Scans", initials: "LX", color: "warning" },
  {
    id: "immortalupdates",
    name: "Immortal Updates",
    initials: "IU",
    color: "secondary",
  },
  { id: "aquamanga", name: "Aquamanga", initials: "AQ", color: "destructive" },
  { id: "manhuaplus", name: "Manhua Plus", initials: "MH", color: "primary" },
  { id: "toonily", name: "Toonily", initials: "TN", color: "success" },
  { id: "webtoonscan", name: "Webtoon Scan", initials: "WS", color: "warning" },
  {
    id: "mangakakalot",
    name: "Mangakakalot",
    initials: "MK",
    color: "secondary",
  },
  { id: "manganato", name: "Manganato", initials: "MN", color: "destructive" },
  { id: "mangasee", name: "Mangasee", initials: "MS", color: "primary" },
  { id: "mangafire", name: "MangaFire", initials: "MF", color: "success" },
  { id: "mangabuddy", name: "MangaBuddy", initials: "MB", color: "warning" },
  { id: "mangaclash", name: "MangaClash", initials: "MC", color: "secondary" },
  { id: "mangaowl", name: "MangaOwl", initials: "MO", color: "destructive" },
  { id: "mangareader", name: "MangaReader", initials: "MR", color: "primary" },
  { id: "mangahere", name: "MangaHere", initials: "MG", color: "success" },
  { id: "mangafox", name: "MangaFox", initials: "MX", color: "warning" },
  { id: "mangatown", name: "MangaTown", initials: "MT", color: "secondary" },
  { id: "mangapill", name: "MangaPill", initials: "PL", color: "destructive" },
  { id: "mangakik", name: "MangaKik", initials: "KK", color: "primary" },
  { id: "mangajar", name: "MangaJar", initials: "MJ", color: "success" },
  { id: "hiveworks", name: "Hiveworks", initials: "HW", color: "warning" },
  { id: "tapas", name: "Tapas", initials: "TP", color: "secondary" },
  { id: "webtoons", name: "Webtoons", initials: "WT", color: "destructive" },
  { id: "lezhin", name: "Lezhin", initials: "LZ", color: "primary" },
  { id: "tappytoon", name: "Tappytoon", initials: "TT", color: "success" },
  { id: "kakaopage", name: "Kakao Page", initials: "KP", color: "warning" },
  { id: "ridibooks", name: "Ridibooks", initials: "RB", color: "secondary" },
  {
    id: "bilibilicomics",
    name: "Bilibili Comics",
    initials: "BC",
    color: "destructive",
  },
  { id: "kuaikan", name: "Kuaikan", initials: "KN", color: "primary" },
  { id: "inkr", name: "INKR", initials: "IK", color: "success" },
  { id: "azuki", name: "Azuki", initials: "AZ", color: "warning" },
  { id: "mangamo", name: "Mangamo", initials: "MM", color: "secondary" },
  { id: "comikey", name: "Comikey", initials: "CY", color: "destructive" },
];
