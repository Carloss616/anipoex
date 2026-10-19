# Escritorio

App de macOS: Electron carga la app web y corre las extensiones en un proceso JVM aparte (el sidecar, [sidecar.js](sidecar.js)).

## Desarrollo

1. Compilá el servidor de extensiones y su JVM (una vez, y cada vez que cambie `modules/extension-runtime/jvm`):

   ```bash
   JAVA_HOME=<jdk ≥ 17> android/gradlew -p modules/extension-runtime/jvm installDist jlinkRuntime
   ```

2. Instalá Electron:

   ```bash
   bun install --cwd desktop
   ```

3. Levantá Metro (`bun start`) y abrí la app:

   ```bash
   bunx --cwd desktop electron .
   ```

   Carga `http://localhost:8081`; `ANIPOEX_URL` la cambia por otra.

Si no existe `modules/extension-runtime/jvm/build/jre`, usa el `java` del sistema, que tiene que ser 21 o más nuevo.

Tests: `bun test desktop/`.

## App empaquetada

```bash
JAVA_HOME=<jdk ≥ 17> bun run --cwd desktop dist
```

Exporta la web (`build:web`, con los `EXPO_PUBLIC_*` de `.env.local`), compila el servidor y la JVM (`build:runtime`, necesita `android/` generado) y arma `desktop/dist/anipoex-<versión>-arm64.dmg` (y `desktop/dist/mac-arm64/anipoex.app`). Dentro del `.app`, `Contents/Resources/` trae `web/` (servida como `app://anipoex/` por [serve.js](serve.js)), `server/` y `jre/`; no necesita Metro ni Java instalado.

Sin firmar: la primera vez se abre con clic derecho → Abrir.

## Datos y log

En desarrollo todo queda en `~/Library/Application Support/anipoex-desktop/` (el nombre sale de `package.json`, así que no lo cambies o se pierden la sesión de AniList y las extensiones); la app empaquetada usa `~/Library/Application Support/anipoex/` (su `productName`), con su propia sesión y extensiones:

- `extensions/`: las extensiones instaladas.
- `extensions/server.log`: el stderr del servidor. Se vacía cada vez que abre la app; si el servidor se cae y se relanza, sigue escribiendo al final.
