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
  { id: "mangadex", name: "MangaDex", initials: "MD" },
  { id: "comick", name: "ComicK", initials: "CK" },
  { id: "batoto", name: "Bato.to", initials: "BT" },
  { id: "mangapark", name: "MangaPark", initials: "MP" },
  { id: "weebcentral", name: "Weeb Central", initials: "WC" },
  { id: "asurascans", name: "Asura Scans", initials: "AS" },
  { id: "flamecomics", name: "Flame Comics", initials: "FC" },
  { id: "reaperscans", name: "Reaper Scans", initials: "RS" },
  { id: "luminousscans", name: "Luminous Scans", initials: "LS" },
  { id: "nightscans", name: "Night Scans", initials: "NS" },
  { id: "voidscans", name: "Void Scans", initials: "VS" },
  { id: "drakescans", name: "Drake Scans", initials: "DS" },
  { id: "realmscans", name: "Realm Scans", initials: "RL" },
  { id: "cosmicscans", name: "Cosmic Scans", initials: "CS" },
  { id: "omegascans", name: "Omega Scans", initials: "OS" },
  { id: "nitroscans", name: "Nitro Scans", initials: "NT" },
  { id: "zeroscans", name: "Zero Scans", initials: "ZS" },
  { id: "lynxscans", name: "Lynx Scans", initials: "LX" },
  { id: "immortalupdates", name: "Immortal Updates", initials: "IU" },
  { id: "aquamanga", name: "Aquamanga", initials: "AQ" },
  { id: "manhuaplus", name: "Manhua Plus", initials: "MH" },
  { id: "toonily", name: "Toonily", initials: "TN" },
  { id: "webtoonscan", name: "Webtoon Scan", initials: "WS" },
  { id: "mangakakalot", name: "Mangakakalot", initials: "MK" },
  { id: "manganato", name: "Manganato", initials: "MN" },
  { id: "mangasee", name: "Mangasee", initials: "MS" },
  { id: "mangafire", name: "MangaFire", initials: "MF" },
  { id: "mangabuddy", name: "MangaBuddy", initials: "MB" },
  { id: "mangaclash", name: "MangaClash", initials: "MC" },
  { id: "mangaowl", name: "MangaOwl", initials: "MO" },
  { id: "mangareader", name: "MangaReader", initials: "MR" },
  { id: "mangahere", name: "MangaHere", initials: "MG" },
  { id: "mangafox", name: "MangaFox", initials: "MX" },
  { id: "mangatown", name: "MangaTown", initials: "MT" },
  { id: "mangapill", name: "MangaPill", initials: "PL" },
  { id: "mangakik", name: "MangaKik", initials: "KK" },
  { id: "mangajar", name: "MangaJar", initials: "MJ" },
  { id: "hiveworks", name: "Hiveworks", initials: "HW" },
  { id: "tapas", name: "Tapas", initials: "TP" },
  { id: "webtoons", name: "Webtoons", initials: "WT" },
  { id: "lezhin", name: "Lezhin", initials: "LZ" },
  { id: "tappytoon", name: "Tappytoon", initials: "TT" },
  { id: "kakaopage", name: "Kakao Page", initials: "KP" },
  { id: "ridibooks", name: "Ridibooks", initials: "RB" },
  { id: "bilibilicomics", name: "Bilibili Comics", initials: "BC" },
  { id: "kuaikan", name: "Kuaikan", initials: "KN" },
  { id: "inkr", name: "INKR", initials: "IK" },
  { id: "azuki", name: "Azuki", initials: "AZ" },
  { id: "mangamo", name: "Mangamo", initials: "MM" },
  { id: "comikey", name: "Comikey", initials: "CY" },
];
