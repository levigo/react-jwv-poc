# jadice web viewer – React integration PoC

A proof-of-concept that demonstrates how the jadice web toolkit (JWV) product
components can be embedded into a **React** application. It is the React
counterpart to the official *angular getting-started* tutorial (tutorial-002)
and is intended as a showcase for integrating JWV outside of Angular.

The JWV UI ships as framework-agnostic **Web Components** plus a `JadiceViewer`
class. This PoC wires them up by hand (no Angular wrapper), which is exactly
what a React integration looks like.

## What this PoC demonstrates

- Embedding the document viewer (`JadiceViewer`) into a plain `div`.
- The main toolbar as a Web Component (`<jadice-toolbar>`) configured via
  `DefaultToolbar.CONFIG`, extended with a custom "Save annotations" button.
- The annotation toolbar as a Web Component (`<jadice-annotation-toolbar>`)
  driven by an annotation profile.
- Enabling viewer tools that are registered but inactive by default
  (mouse-wheel scrolling, text selection, zoom).
- A custom internationalization provider that resolves the translations
  shipped with JWV (no Angular `ngx-translate`).
- Theming via `src/theme.scss` (adaptive light/dark).
- Opening local files through upload ("Open File").
- Loading a document with its annotations and saving annotations back to a
  server.

## Architecture

The running system consists of three processes:

| Component | Tech | Port | Role |
|-----------|------|------|------|
| Frontend | Vite + React 19 + TypeScript | 5173 | The React app embedding JWV |
| JWV backend | Spring Boot (JWV server) | 8080 | Renders documents, handles uploads, runs the annotation-save handler |
| Test server | Node static server | 3000 | Serves the demo document/annotations and receives saved annotations (basic auth) |

Data flow for the annotation round-trip:

```
Browser (React, :5173)
  → JWV backend (:8080)          render, upload, SAVE_ANNOS conversation
      → test server (:3000)      fetch PDFUA.pdf + test93.xml, write annotations back
```

The browser never talks to the test server directly; the JWV backend fetches
the (basic-auth protected) URIs and writes annotations back on its behalf.

## Prerequisites

- **Node.js** (for the frontend and the test server)
- **JDK 17+** for the backend. Note: a default `java` of 11 will fail with
  `invalid target release: 17`; point `JAVA_HOME` at a 17+ JDK.
- **Maven**
- Access to the **levigo Maven repository** so Maven can resolve the
  `com.levigo.*` artifacts (configure it in your `~/.m2/settings.xml`).

## Getting started

Start the three processes in this order.

### 1. Test server (port 3000)

Serves `PDFUA.pdf` / `test93.xml` and accepts annotation uploads.

```bash
cd test-server-basic-auth
npm install
node static-server.js --port 3000 --dir ./public --auth --username user1 --password test
```

### 2. JWV backend (port 8080)

```bash
cd backend
# adjust the path to your local JDK 17+
JAVA_HOME=/path/to/jdk-17 mvn spring-boot:run
```

### 3. Frontend (port 5173)

```bash
npm install        # postinstall copies the GWT "precursor" assets into public/precursor/
npm run dev
```

Then open http://localhost:5173.

Production build: `npm run build` (type-checks via `tsc -b`, then `vite build`);
preview with `npm run preview`.

## Project layout

| Path | Purpose |
|------|---------|
| `src/index.tsx` | App bootstrap: `preloadPrecursor` (points at the backend on :8080), registers the i18n provider, mounts React |
| `src/App.tsx` | The integration itself: creates the `JadiceViewer`, enables tools, configures the toolbar, wires the annotation toolbar, "Open File" and saving |
| `src/i18n.ts` | Custom `I18NProvider` that resolves the JSON translations bundled with JWV |
| `src/theme.scss` | Loads the adaptive JWV theme |
| `backend/` | Spring Boot JWV server, incl. the annotation-save handler |
| `backend/src/main/java/.../annotation/` | `SaveJadiceAnnotationsHandler` + its configuration |
| `backend/src/main/resources/application.yml` | JWV server config: annotation profiles, upload, save target, document-data-provider auth |
| `test-server-basic-auth/` | Minimal Node server for serving and receiving documents/annotations |

## Configuration notes

- The client points at the backend in `src/index.tsx`
  (`preloadPrecursor({ serverURL: "http://localhost:8080", ... })`).
- The initial document and its annotations are loaded in `src/App.tsx` from
  the test server (`http://localhost:3000/PDFUA.pdf` + `…/test93.xml`).
- Uploads (`POST /upload`) are provided by the `webtoolkit-addon-upload`
  dependency in `backend/pom.xml`; without it the endpoint returns 404.
- Saving annotations uses the `SAVE_ANNOS` conversation, handled server-side by
  `SaveJadiceAnnotationsHandler`, which writes the annotations to the test
  server. The target and credentials are configured under `annotation.save` in
  `application.yml`; `webtoolkit.ddp.http.authentication` lets the backend fetch
  the protected test-server URIs.

## Security / production caveats

This PoC is wired for local demonstration only:

- The test-server credentials (`user1` / `test`) are committed in plain text in
  `application.yml`. In production, inject them via environment variables or
  secrets and never commit credentials.
- Basic auth is sent base64-encoded only; use TLS (HTTPS) on real networks.
- The backend `SecurityConfiguration` is explicitly marked "for demo only"
  (CSRF disabled, permissive CORS) and must be hardened before any real use.

## Related

This project mirrors the angular getting-started **tutorial-002**; consult that
tutorial for the backend setup and the equivalent Angular client.
