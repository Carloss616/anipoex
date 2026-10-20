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
* [Theme](theme.md) - Theme family and light / dark / system preference.
* [Extension repos](extension-repos.md) - The repos extensions are installed from; none until the user adds one.

# Sources

* [Chosen source](manga-source.md) - The source picked for each manga.
* [Source exclusions](source-exclusions.md) - Sources dropped from a manga's list, and why.
* [Source pins](source-pins.md) - Exclusions and inclusions the user decided by hand.
* [Source probes](source-probes.md) - What the last scan found for each source and manga.

# In memory only

* [Extensions](extensions.md) - The extension list, rebuilt from the added repos and what is installed.
