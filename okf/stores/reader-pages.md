---
type: Persisted Store
title: Reader pages
description: The page images the reader shows, as their source's own client downloaded them.
resource: ../../modules/extension-runtime/android/src/main/java/anipoex/runtime/PageCache.kt
tags: [extensions, reader, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-22T00:00:00Z }
---

Every page the reader shows is downloaded by the extension runtime through its source, as
Mihon's reader does, never by the image view from the page's URL. The source's client may
change the image on the way: some sources scramble their pages and put them back in order
there, others add the cookies, headers or pacing their image host needs. Read straight from
the URL, those pages came out scrambled or failed.

Each page is kept as one file, named after its URL, so showing it again reads the file
instead of downloading it. The newest 500 stay; older ones are deleted as new ones arrive.
On Android they live in the app's cache folder, which the system may also clear; on desktop
and iOS under the runtime's data folder (`cache/pages`). Nothing else refers to them, so
losing them only means the next view downloads the page again.
