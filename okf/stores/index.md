# On-device stores

Everything the app keeps on the device, one page each. Native persists to MMKV (the
token to the Keychain / Keystore via SecureStore); web persists to `localStorage`, and
nothing persists during web's server render.

# Identity

* [Session](session.md) - The AniList token and the cached viewer; what sign-out clears.

# Data

* [Apollo cache](apollo-cache.md) - Every AniList response, persisted as one snapshot.

# Preferences

* [Manga list view](manga-list-view.md) - Grid density and title position.
* [Chosen source](manga-source.md) - The source picked for each manga.
* [Theme](theme.md) - Theme family and light / dark / system preference.

# In memory only

* [Extensions](extensions.md) - Installed extensions; reset on reload. Scaffolding.
