# Development Change Log

## [5.9.1] - 2026-09-28
- Hardened complete BEJSON/MFDB database compatibility with the Python edition by adding the unified `Author` database (`author.bejson`) into the Import/Export zip pipelines.
- Integrated a live **AI Content Assistant & chat client** powered by server-side `gemini-3.8-flash`.
- Added a professional **AI Profile Generator** inside the Author Editor to auto-write biographies.
- Solved layout heights and bottom-scroll overflows, preventing the footer from covering the chat layout.

## [1.0.0] - 2026-09-27
- Initial rebuild of Management_CMS under TypeScript and React.
- Complete integration of core TS libraries (`parse`, `serialize`, `validateDocument`).
- Implemented static pre-rendered ZIP site generation under `src/lib/staticBuilder.ts`.
- Integrated 12 registered schemas under the About -> Assets Tab Meta-UI.
- Logged identified Python-spec bugs under Tab 1 -> Reports Section.
