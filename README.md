# Management CMS (React) — Relational Edition
### Standard 104a Relational CMS and Static Website Pre-rendering Pipeline
### Author: Elton Boehnen | boehnenelton2024.pages.dev | boehnenelton2024@gmail.com

---

## 1. INTRODUCTION & ARCHITECTURAL SUMMARY

Management CMS (React) is an enterprise-grade, single-administrator Content Management System and static website build pipeline built on top of modern React, TypeScript, and Vite. Conceived with deep architectural reverence for standard flat-file relational database structures, this edition migrates the traditional Python-spec single-file databases into a modular React/TypeScript virtual database (VDB) with zero external database dependencies.

The system is designed from the ground up to solve the challenges of lightweight, portable content management without the bloat, vulnerability footprint, or maintenance overhead of heavy relational database servers like PostgreSQL or MySQL. By leveraging the BEJSON-104 and 104a flat-file binary specifications, Management CMS achieves true offline capability, persistent state durability, and deterministic portability across runtime environments.

### Core Architectural Pillars
* **Universal Data Compatibility:** 100% binary and structural parity with Python-spec BEJSON databases. Data files exported from the Python version load seamlessly into this React edition, and archives generated here can be read back by Python scripts without translation layers.
* **Offline-First Virtual Database (VDB):** Complete database state is maintained in-memory and synchronized with browser `localStorage`, with support for full-database ZIP backup imports and exports.
* **Static Site Pre-rendering Engine:** Includes an integrated static compiler that takes your dynamic relational database and renders out a lightning-fast, production-ready static site consisting of pure HTML, CSS, RSS/Atom feeds, and JSON syndication endpoints.
* **Server-Side AI Acceleration:** Features an integrated Node.js Express server (`server.ts`) that proxies queries to the Google Gemini API (`gemini-3.8-flash`), enforcing security constraints by preventing client-side key leakage while logging all operations to `/dev/prompts.md`.
* **Zero-Pill Visual Discipline:** Built strictly upon the Tri-Color Visual Palette (#000000 Canvas, #FFFFFF Content, #DE2626 Vivid Red Accent) adhering strictly to professional anti-slop guidelines and clean typographic hierarchies.

---

## 2. DIRECTORY STRUCTURE & COMPONENT TOPOLOGY

Below is the definitive file and directory layout of the Management CMS (React) workspace:

```text
/
├── .env.example                         # Environment variable template for API keys & URL roots
├── .gitignore                           # Excluded build paths, artifacts, and cache directories
├── bejson_project.json                  # Root BEJSON 104a project ledger and package metadata
├── index.html                           # Synced HTML entry point, SEO meta tags, and typography
├── metadata.json                        # AI Studio applet capabilities, permissions, and app identity
├── package.json                         # Node dependency manager (Express, Vite, JSZip, Google GenAI)
├── server.ts                            # Node/Express server proxying Gemini & serving Vite middlewares
├── tsconfig.json                        # TypeScript compiler configurations and build targets
├── vite.config.ts                       # Vite bundler configuration, Tailwind CSS, HMR constraints
├── dev/                                 # Centralized developer audit logs and ledgers
│   ├── change-log.md                    # Chronological project revision ledger
│   ├── dead_code.md                     # Audited obsolete variables and defunct modules
│   ├── security-notes.md                # Security audits, mitigations, and anomaly logs
│   ├── prompts.md                       # Synchronously mirrored raw prompts sent to Gemini
│   ├── ui-components.md                 # Granular component specification ledger
│   ├── ui-notes.md                      # General UI guidelines capture
│   └── completed/                       # Tracked completed job checklists (BEJSON 104a form)
│       └── job-checklist-resumption.bejson
└── src/                                 # Frontend Application Core
    ├── App.tsx                          # Primary React view, sidebar, editors, and modal dialogs
    ├── index.css                        # Tailwind v4 import, custom scrollbars, and checkerboard grid
    ├── main.tsx                         # Core React StrictMode DOM entry point
    └── lib/                             # Shared Library Modules & Core Engines
        ├── db.ts                        # Virtual database layer handling schema definitions and serialization
        ├── staticBuilder.ts             # Memory-stage pre-renderer compiling static HTML/CSS/RSS
        └── Core/                        # BEJSON core-family portable TypeScript libraries
            ├── index.ts                 # Centralized modular library exports
            ├── lib_bejson_Core_bejson_chunking.ts
            ├── lib_bejson_Core_bejson_core.ts
            ├── lib_bejson_Core_bejson_field_map.ts
            ├── lib_bejson_Core_bejson_list_validator.ts
            ├── lib_bejson_Core_bejson_schema.ts
            ├── lib_bejson_Core_bejson_types.ts
            ├── lib_bejson_Core_bejson_validators.ts
            ├── lib_bejson_Core_mfdb_core.ts
            └── lib_bejson_Core_mfdb_validators.ts
```

---

## 3. RELATIONAL DATABASE SCHEMAS (BEJSON-104 SPECIFICATION)

The virtual persistence layer of Management CMS models 13 distinct relational entities using the official BEJSON 104 format. Each schema enforces strict positional alignment and tabular null-padding to guarantee that backup archives are interchangeable across runtime environments.

### 3.1 Category Schema (`data/category.bejson`)
Organizes blog articles and custom system pages hierarchically:
* **`id`** (`string`): Primary unique identifier (UUIDv4).
* **`parent_id`** (`string` | `null`): Recursive pointer to parent category for sub-nesting.
* **`category_type`** (`string`): Explicit entity discriminator (`post` or `page`).
* **`title`** (`string`): Human-readable display label.
* **`description`** (`string`): Extended taxonomy description.
* **`slug`** (`string`): URL-safe route slug (e.g., `engineering`, `news`).
* **`created_at`** (`string`): ISO-8601 creation timestamp.

### 3.2 Post Schema (`data/post.bejson`)
Represents published and draft blog posts:
* **`id`** (`string`): Primary unique identifier (UUIDv4).
* **`category_id_fk`** (`string` | `null`): Foreign key referencing `Category.id`.
* **`title`** (`string`): Article title.
* **`slug`** (`string`): Clean URL endpoint identifier (e.g., `getting-started-with-bejson`).
* **`status`** (`string`): Publishing lifecycle state (`draft`, `published`, `archived`).
* **`content_html`** (`string`): Pre-compiled rich-text HTML string.
* **`content_markdown`** (`string`): Source Markdown markup.
* **`author`** (`string`): Author identifier or name.
* **`featured_image`** (`string`): Asset path or external URL for article banner.
* **`published_at`** (`string`): ISO timestamp for public indexing.
* **`scheduled_at`** (`string` | `null`): ISO timestamp for queued release.
* **`tag_ids`** (`array`): Array of referencing `Tag.id` values.
* **`created_at`** (`string`): Creation timestamp.
* **`updated_at`** (`string`): Last-modified timestamp.
* **`excerpt`** (`string`): Condensed summary text for index cards.
* **`locked_at`** (`string` | `null`): Staging lock timestamp.
* **`locked_by`** (`string` | `null`): Admin lock holder identifier.

### 3.3 Page Schema (`data/page.bejson`)
Models top-level landing views, documentation, and corporate pages:
* **`id`** (`string`): Primary unique identifier (UUIDv4).
* **`category_id_fk`** (`string` | `null`): Optional foreign key to `Category.id`.
* **`slug`** (`string`): Target route filename (e.g., `about-us`, `pricing`).
* **`status`** (`string`): Publishing state (`draft`, `published`).
* **`page_type`** (`string`): Template indicator (`home`, `about`, `contact`, `custom`).
* **`meta_description`** (`string`): SEO meta summary text.
* **`layout`** (`string`): Selected layout template file.
* **`content_html`** (`string`): Raw compiled page HTML body.
* **`content_markdown`** (`string`): Raw source Markdown payload.
* **`author`** (`string`): Relational author owner.
* **`featured_image`** (`string`): Page banner image path.
* **`parent_page_id_fk`** (`string` | `null`): Hierarchical parent page for nested breadcrumbs.
* **`sort_order`** (`integer`): Display sorting weight.
* **`created_at`** (`string`): Creation timestamp.
* **`updated_at`** (`string`): Modification timestamp.
* **`title`** (`string`): Navigation menu label.
* **`excerpt`** (`string`): Summary teaser text.
* **`locked_at`** (`string` | `null`): Editing lock timestamp.
* **`locked_by`** (`string` | `null`): User ID holding lock.

### 3.4 PageSeo Schema (`data/pageseo.bejson`)
Appends specialized metadata tags and OpenGraph cards onto individual Page routes:
* **`seo_id`** (`string`): Primary unique identifier.
* **`page_id_fk`** (`string`): Foreign key matching `Page.id`.
* **`meta_title`** (`string`): Explicit `<title>` tag override.
* **`meta_keywords`** (`string`): Search indexing keywords.
* **`og_title`** (`string`): OpenGraph social share card title.
* **`og_description`** (`string`): OpenGraph card summary.
* **`og_image`** (`string`): Social preview image URL.
* **`canonical_url`** (`string`): Canonical URL link tag.
* **`robots_directive`** (`string`): Crawl directive (e.g., `index, follow`).
* **`created_at`** (`string`): Creation timestamp.

### 3.5 Tag Schema (`data/tag.bejson`)
Enables cross-cutting taxonomy tags across blog posts:
* **`id`** (`string`): Unique tag identifier.
* **`name`** (`string`): Human-readable tag label.
* **`slug`** (`string`): Clean URL slug for tag archives.
* **`created_at`** (`string`): Creation timestamp.

### 3.6 Link Schema (`data/link.bejson`)
Userspace bookmarks directory for administrative reference links:
* **`taxonomy`** (`string`): Fixed string `"link"`.
* **`type`** (`string` | `null`): Optional categorization sub-type.
* **`category`** (`string`): Foreign key matching `LinkCategory.cat_id`.
* **`id`** (`string`): Unique bookmark identifier.
* **`label`** (`string`): Bookmark title.
* **`idx_position`** (`integer`): Display sequence order.
* **`idx_sorting`** (`string`): Sorting directives.
* **`active`** (`boolean`): Active visibility flag.
* **`hidden`** (`boolean`): Hidden state flag.
* **`created_at`** (`string`): Creation timestamp.
* **`url`** (`string`): Destination URL.
* **`icon`** (`string`): Emoji or icon identifier.
* **`description`** (`string`): Explanatory description.

### 3.7 LinkCategory Schema (`data/linkcategory.bejson`)
Classification taxonomy for administrative bookmarks:
* **`cat_id`** (`string`): Unique category identifier.
* **`cat_name`** (`string`): Category title.
* **`cat_created_at`** (`string`): Creation timestamp.

### 3.8 Note Schema (`data/note.bejson`)
Quick scratchpad notes for administrator scratchpads and snippets:
* **`taxonomy`** (`string`): Fixed string `"note"`.
* **`type`** (`string` | `null`): Subgroup taxonomy.
* **`category`** (`string`): Foreign key matching `NoteCategory.cat_id`.
* **`id`** (`string`): Unique note identifier.
* **`label`** (`string`): Note title.
* **`idx_position`** (`integer`): Display sequence weight.
* **`idx_sorting`** (`string`): Sorting option.
* **`active`** (`boolean`): Display status flag.
* **`hidden`** (`boolean`): Hidden state flag.
* **`created_at`** (`string`): Date stamp.
* **`content`** (`string`): Plaintext or markdown note body.
* **`color`** (`string`): Hex swatch color (e.g., `#f5f5f5`, `#fef9c3`).

### 3.9 NoteCategory Schema (`data/notecategory.bejson`)
Classification categories for scratchpad notes:
* **`cat_id`** (`string`): Category identifier.
* **`cat_name`** (`string`): Category name.
* **`cat_created_at`** (`string`): Creation timestamp.

### 3.10 TodoItem Schema (`data/todoitem.bejson`)
Sprint task tracking and action item management:
* **`taxonomy`** (`string`): Fixed string `"task"`.
* **`type`** (`string` | `null`): Subgroup marker.
* **`category`** (`string`): Foreign key matching `TaskCategory.cat_id`.
* **`id`** (`string`): Unique task identifier.
* **`label`** (`string`): Action item objective.
* **`idx_position`** (`integer`): Sort weight.
* **`idx_sorting`** (`string`): Sorting method.
* **`active`** (`boolean`): Active indicator.
* **`hidden`** (`boolean`): Hidden flag.
* **`created_at`** (`string`): Registration date.
* **`done`** (`boolean`): Completion boolean state.
* **`priority`** (`string`): Priority level (`high`, `medium`, `low`).
* **`detail`** (`string`): Detailed description of task requirements.

### 3.11 TaskCategory Schema (`data/taskcategory.bejson`)
Project or sprint categories for to-do items:
* **`cat_id`** (`string`): Category identifier.
* **`cat_name`** (`string`): Sprint or project name.
* **`cat_created_at`** (`string`): Creation timestamp.

### 3.12 Media Schema (`data/media.bejson`)
Centralized media asset registry:
* **`id`** (`string`): Primary media identifier.
* **`filename`** (`string`): File display name.
* **`original_path`** (`string`): Server storage path or upload URL.
* **`mime_type`** (`string`): MIME type string (`image/webp`, `image/png`, etc.).
* **`file_hash`** (`string`): SHA-256 or recency hash.
* **`webp_path`** (`string`): Optimized WebP file path.
* **`alt_text`** (`string`): Accessibility alt text description.
* **`created_at`** (`string`): Upload timestamp.
* **`admin_media_id`** (`string`): Admin node owner identifier.

### 3.13 Author Schema (`data/author.bejson`)
System author registry and profile specifications:
* **`id`** (`string`): Unique author ID.
* **`name`** (`string`): Full author name.
* **`role`** (`string`): Professional title or designation.
* **`bio`** (`string`): Biographical paragraph text.
* **`profile_image`** (`string`): Avatar/photo asset URL.
* **`created_at`** (`string`): Registration timestamp.

---

## 4. USER GUIDE & STEP-BY-STEP WORKFLOWS

### 4.1 First-Time Workspace Setup
1. Launch the application in your browser. Upon initial load, the virtual database self-seeds with standard starter records, including author Elton Boehnen and sample content.
2. In the left navigation sidebar, navigate between the Content section (Pages, Posts, Categories, Site Nav, Authors, Media) and the Userspace section (Links, Notes, To-Do, AI Assistant, Settings, Build, About / Reports).
3. The collapsible navigation groups allow you to toggle sections open or closed for a clean working canvas.

### 4.2 Creating and Editing Pages
1. Select **Pages** from the sidebar.
2. Click the **Add Page** button in the top right.
3. In the full-screen modal editor, enter the **Page Title**, **Slug**, **Page Type** (`custom`, `home`, `about`, `contact`), and **Meta Description**.
4. Switch to the **Content** tab inside the editor modal to write the page body in standard HTML or Markdown.
5. Click **Save Changes** to commit the page to the virtual database.

### 4.3 Publishing Blog Posts
1. Select **Posts** from the sidebar.
2. Click **Add Post**.
3. Set the **Post Title**, auto-generating or customizing the **Slug**.
4. Choose an associated Post Category from the dropdown.
5. Provide a **Featured Image** path (or paste a direct YouTube watch URL to automatically embed a responsive video player).
6. Under the **Content** tab, enter your article text. Any `<h2>` and `<h3>` tags will automatically be parsed during the static build to generate an interactive Table of Contents.
7. Change the **Status** to `published` and click **Save Changes**.

### 4.4 Managing Navigation Menus
1. Select **Site Nav** from the sidebar.
2. Click **Add Nav Item**.
3. Specify the navigation label, target URL/path, window target (`_self` or `_blank`), and sequence position.
4. Items render in the pre-rendered static site header and sidebar according to their sorted position weight.

### 4.5 Registering Authors and Generating AI Profiles
1. Select **Authors** from the sidebar.
2. Click **Add Author**.
3. Provide the Author Name and Professional Role.
4. If you have configured a Gemini API key in Settings:
   * Locate the **AI Profile Generator** box.
   * Enter a few comma-separated career highlights in the Key Highlights field.
   * Click **Generate Professional Bio**.
   * The server-side Gemini proxy generates a polished, 2-to-3 sentence biographical summary and populates the Biography field instantly.
5. Click **Save Changes**.

### 4.6 Interacting with the AI Assistant
1. Navigate to **Settings** and ensure your Gemini API key is configured.
2. Select **AI Assistant** in the Userspace section of the sidebar.
3. Use the integrated prompt shortcut chips or type a direct query into the prompt input box.
4. The assistant operates with complete awareness of your live CMS state (active page count, post count, author profiles, and navigation links).
5. All queries and responses are streamed into the conversation log and recorded verbatim into `/dev/prompts.md`.

### 4.7 Compiling and Exporting a Static Website
1. Select **Build** from the sidebar.
2. Click **Build Static Site ZIP**.
3. The build engine will:
   * Compile the responsive navigation tree.
   * Render all published pages with complete HTML structures and meta tags.
   * Render all published blog posts with automated Table of Contents and responsive embeds.
   * Compile `feed.xml` (RSS 2.0), `atom.xml` (Atom 1.0), and `feed.json` (JSON Feed 1.1).
   * Compile `sitemap.xml` and `robots.txt`.
   * Bundle all assets and download `Export.zip`.

### 4.8 Importing and Exporting the Full BEJSON Database
1. **Exporting:** Click **Export DB** in the top navigation toolbar. The app compiles all 13 entity tables into their native `.bejson` files and downloads `Management_CMS_bejson_database.zip`.
2. **Importing:** Click **Import DB** and choose any valid backup ZIP file. The system parses each entity table, applies tabular field-mapping caches, and instantly populates the virtual database.

---

## 5. DESIGN CONSTITUTION & VISUAL SYSTEM (TRI-COLOR PALETTE)

Management CMS (React) enforces a rigorous, aesthetic-focused visual framework strictly obeying the **Tri-Color Design Constitution** (Section 10.1 of standard policy):

| Role | Color Value | Hex Code | Visual Application |
| :--- | :--- | :--- | :--- |
| **Canvas / Background** | Pure Black | `#000000` | Background canvas, sidebar containers, dialog frames |
| **Typography / Content** | Pure White | `#FFFFFF` | Primary headings, form input text, card titles |
| **Active / Hover Accent** | Vivid Red | `#DE2626` | Interactive buttons, active tabs, hover states, error notices |

### Prohibited & Restricted Combinations:
* ❌ **Forbidden:** Black text rendered directly on a red background.
* ⚠️ **Restricted:** Red text on a black background (reserved exclusively for rare, high-severity diagnostic callouts).
* ✅ **Permitted:** Red or black text on a white background; white text on a red or black background.
* **Input Fields:** Form controls standardize to pure white backgrounds (`#FFFFFF`) with solid black text (`#000000`).
* **Zero Decorative Flourishes:** Absolutely no unnecessary border ornaments, excessive shadows, or decorative flourishes.

### Typographic Hierarchy:
* **UI & Body Text:** `Inter`, sans-serif (weights: 300, 400, 500, 600, 700).
* **Brand Headlines:** `Syncopate`, sans-serif (weights: 400, 700).
* **Code & Schemas:** `Fira Code` / `Source Code Pro`, monospace (weights: 400, 500).

---

## 6. TECHNICAL DETAILS: THE COMPILER & STATIC PIPELINE

The static builder engine (`src/lib/staticBuilder.ts`) processes structural data into completely isolated HTML deliverables in memory:

```typescript
// Architectural flow of the static site pre-renderer:
export async function buildStaticSite(
  pages: any[],
  posts: any[],
  categories: any[],
  navLinks: any[],
  settings: Record<string, string>,
  authors: any[],
  onLog: (msg: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  // 1. Compile Global Navigation & Theme Layout
  // 2. Compile Public Static Pages (/index.html, /about.html, etc.)
  // 3. Compile Blog Post Pages (/post/slug.html)
  // 4. Generate Heading Anchors and Interactive Table of Contents
  // 5. Generate Syndication Feeds (Atom, RSS, JSON Feed)
  // 6. Generate Sitemap and Robots Directives
  // 7. Package and Return Compressed ZIP Blob
}
```

### Table of Contents Generation
The post compiler automatically scans blog article content for headings (`<h2>` and `<h3>`), generating unique anchor identifiers and compiling a hierarchical Table of Contents:
```typescript
const tocItems: Array<{ id: string; title: string; level: number }> = [];
let processedHtml = post.content_html.replace(/<(h[23])>(.*?)<\/\1>/gi, (match, tag, title) => {
  const id = `heading-${tocItems.length}`;
  const level = parseInt(tag.charAt(1));
  tocItems.push({ id, title: title.replace(/<[^>]*>?/gm, ""), level });
  return `<${tag} id="${id}">${title}</${tag}>`;
});
```

---

## 7. CORE BEJSON ENGINE & VIRTUAL DATABASE INTERNALS

The core libraries located under `src/lib/Core/` implement the complete BEJSON specification:

### Tabular Positional Mapping
BEJSON eliminates repetitive JSON key strings by separating field declarations from tabular row arrays. A document declares its fields once in the header:
```json
{
  "Format": "BEJSON",
  "Format_Version": "104a",
  "Format_Creator": "Elton Boehnen",
  "Records_Type": ["Author"],
  "Fields": [
    { "name": "id", "type": "string" },
    { "name": "name", "type": "string" },
    { "name": "role", "type": "string" },
    { "name": "bio", "type": "string" },
    { "name": "profile_image", "type": "string" },
    { "name": "created_at", "type": "string" }
  ],
  "Values": [
    [
      "author_1",
      "Elton Boehnen",
      "Lead Architect",
      "Chief architect behind Management CMS.",
      "/media/avatar.png",
      "2026-07-31T11:26:21Z"
    ]
  ]
}
```

### In-Memory Parsing Routine
```typescript
export function parseBejsonToState(text: string): Array<Record<string, any>> {
  const doc = JSON.parse(text);
  const fields = doc.Fields.map((f: any) => f.name);
  return doc.Values.map((row: any) => {
    const rec: Record<string, any> = {};
    fields.forEach((name: string, idx: number) => {
      rec[name] = row[idx];
    });
    return rec;
  });
}
```

---

## 8. REST PROXY API & SERVER ARCHITECTURE

Management CMS utilizes an Express server middleware (`server.ts`) in development and production to proxy Gemini API calls, maintain offline compliance, and prevent security vulnerabilities:

```typescript
// Server-Side Gemini Proxy Route (/api/gemini)
app.post("/api/gemini", async (req, res) => {
  const { prompt, systemInstruction, model, apiKey } = req.body;
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!finalApiKey) {
    return res.status(400).json({ 
      error: "Gemini API key is required. Configure it in the app Settings page." 
    });
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: finalApiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });

    const response = await ai.models.generateContent({
      model: model || "gemini-3.8-flash",
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    // Synchronously mirror prompt to /dev/prompts.md
    const logPath = path.join(__dirname, "dev", "prompts.md");
    const entry = `\n## [${new Date().toISOString()}]\nModel: ${model || "gemini-3.8-flash"}\nPrompt:\n${prompt}\nResponse:\n${response.text}\n---\n`;
    fs.appendFileSync(logPath, entry, "utf-8");

    res.json({ text: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## 9. TROUBLESHOOTING & OPERATIONAL FAQ

### 9.1 How do I migrate existing Python CMS data?
Export your database from the Python version using its database backup command or locate the `data/` directory containing your `.bejson` files. Create a `.zip` archive containing:
```text
data/category.bejson
data/page.bejson
data/post.bejson
data/tag.bejson
data/navlink.bejson
data/media.bejson
data/link.bejson
data/linkcategory.bejson
data/note.bejson
data/notecategory.bejson
data/todoitem.bejson
data/taskcategory.bejson
data/author.bejson
config/config.bejson
```
Click **Import DB** in the top navigation bar of Management CMS (React), select your zip file, and the application will ingest, validate, and mount your records instantly.

### 9.2 Where does the application store my database in the browser?
All entity collections are maintained in browser `localStorage` under discrete keys:
* `mgmt_cms_pages`: Stores the Page entity records.
* `mgmt_cms_posts`: Stores blog post items.
* `mgmt_cms_categories`: Stores hierarchical categories.
* `mgmt_cms_nav_links`: Stores navigation hierarchy.
* `mgmt_cms_authors`: Stores author profile records.
* `mgmt_cms_media`: Stores media file metadata.
* `mgmt_cms_links` & `mgmt_cms_link_categories`: Stores bookmarks and bookmark folders.
* `mgmt_cms_notes` & `mgmt_cms_note_categories`: Stores scratchpad notes.
* `mgmt_cms_todos` & `mgmt_cms_task_categories`: Stores task management checklists.
* `mgmt_cms_settings`: Stores global theme, typography, and site configuration values.

### 9.3 How do I resolve Gemini API connection errors?
* Navigate to **Settings** in the left sidebar.
* Verify that you have entered a valid Google Gemini API key.
* If running on a full-stack Node server, you can alternatively set `GEMINI_API_KEY` in your `.env` file.
* Check `/dev/prompts.md` for runtime exception logs and detailed error trace messages.

### 9.4 How do I deploy the pre-rendered static site?
Click **Build Static Site ZIP** in the **Build** panel to download `Export.zip`. Unpack this archive into any standard static web server directory (such as GitHub Pages, Cloudflare Pages, AWS S3, Vercel, or Netlify). No backend Node.js, Python, or PHP runtime is needed to serve the public website.

### 9.5 Can I run this system completely offline without an internet connection?
Yes. The core CMS, editor modals, virtual database, and static pre-rendering pipeline operate 100% locally in your browser with zero network requests. The only feature requiring external internet connectivity is the AI Assistant and AI Profile Generator, which call the Gemini API endpoint.

---

## 10. POLYGLOT MULTI-FRAMEWORK LICENSE

At the very bottom of this application and documentation is the official Polyglot License block. This block represents a technically valid, compile-safe comment across Bash, Python, Makefiles, HTML, CSS, JavaScript, and TypeScript, preventing parser syntax errors while legally establishing dual Apache-2.0 and MIT licensing targets:

# /*
# SPDX-License-Identifier: (Apache-2.0 OR MIT)
#
# Polyglot Multi-Framework License Block
# Valid comment in: Bash, Python, JavaScript, TypeScript, CSS, HTML, JSON
#
# Copyright (c) 2026 Elton Boehnen <boehnenelton2024@gmail.com>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at:
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# ---
# MIT License Alternative:
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# */
