import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { parseBejsonToState, serializeStateToBejson, SCHEMAS, stateToBejsonDoc } from "./lib/db";
import { buildStaticSite } from "./lib/staticBuilder";
import {
  FileText,
  FileCode,
  FolderOpen,
  Compass,
  Image,
  ExternalLink,
  BookOpen,
  CheckSquare,
  Settings as SettingsIcon,
  Info,
  Download,
  Upload,
  Trash2,
  Edit2,
  Copy,
  AlertTriangle,
  FolderPlus,
  Play,
  Moon,
  Sun,
  Eye,
  Plus,
  X,
  FileCheck,
  Menu
} from "lucide-react";

// Relational Fingerprint (Section 9.1)
// RELATIONAL_ID: 15fd8e8a-8d52-4f9b-a1c6-2d9e7f3a4b50

const APP_VERSION = "5.9.1";
const RELEASE_DATE = "2026-09-27";

export default function App() {
  // Theme state: default to pure black canvas
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toast = (msg: string) => alert(msg);

  // Core CMS databases populated with Python-compatible default rows
  const [pages, setPages] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_pages");
    return saved ? JSON.parse(saved) : [
      {
        id: "30d5561b-dc49-4342-b308-f7a17a263e19",
        category_id_fk: "70f6a23b-a03b-4f60-986c-b27d8d4c2a05",
        slug: "About-Page-Test",
        status: "published",
        page_type: "about",
        meta_description: "About test page by the developer.",
        layout: "default",
        content_html: "<p>Welcome to our about page! We are builders, creators, and system architects of the BEJSON-MFDB specification.</p>",
        content_markdown: "Welcome to our about page! We are builders, creators, and system architects of the BEJSON-MFDB specification.",
        author: "Boehnenelton2024",
        featured_image: "/media/1000744483.png",
        parent_page_id_fk: null,
        sort_order: 0,
        created_at: "2026-07-31T11:26:21Z",
        updated_at: "2026-07-31T11:26:21Z",
        title: "About Page Test",
        excerpt: "An introduction to Elton Boehnen and the relational CMS.",
        locked_at: "",
        locked_by: ""
      },
      {
        id: "679609cf-979c-41b0-ae54-bb4284ce0323",
        category_id_fk: null,
        slug: "Contact-Page-Test",
        status: "published",
        page_type: "contact",
        meta_description: "Get in touch with Elton Boehnen.",
        layout: "default",
        content_html: "<p>Have a question or custom feature request? Email me directly at boehnenelton2024@gmail.com.</p>",
        content_markdown: "Have a question or custom feature request? Email me directly at boehnenelton2024@gmail.com.",
        author: "Boehnenelton2024",
        featured_image: "",
        parent_page_id_fk: null,
        sort_order: 1,
        created_at: "2026-07-31T11:24:16Z",
        updated_at: "2026-07-31T11:24:16Z",
        title: "Contact Page Test",
        excerpt: "Reach out to the author.",
        locked_at: "",
        locked_by: ""
      }
    ];
  });

  const [posts, setPosts] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_posts");
    return saved ? JSON.parse(saved) : [
      {
        id: "2108b3dc-7e49-4a0d-8809-4badf974eb9d",
        category_id_fk: "ed9eb599-279c-452a-bb93-cf07b46499a9",
        title: "Test Blog Post",
        slug: "Test-Blog-Post",
        status: "published",
        content_html: "<h2>Post Title Test</h2><p>This is a test blog post pre-seeded to verify our pagination, categories, and tags. Enjoy your clean static pre-rendered output!</p>",
        content_markdown: "## Post Title Test\n\nThis is a test blog post pre-seeded to verify our pagination, categories, and tags. Enjoy your clean static pre-rendered output!",
        author: "Boehnenelton2024",
        featured_image: "/media/1000754777.webp",
        published_at: "2026-07-31T11:49:58Z",
        scheduled_at: "",
        tag_ids: ["tag_1", "tag_2"],
        created_at: "2026-07-31T11:49:58Z",
        updated_at: "2026-08-21T09:12:43Z",
        excerpt: "Demonstrating high-fidelity content publishing with YouTube embeds.",
        locked_at: "",
        locked_by: ""
      }
    ];
  });

  const [categories, setCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_categories");
    return saved ? JSON.parse(saved) : [
      {
        id: "ed9eb599-279c-452a-bb93-cf07b46499a9",
        parent_id: null,
        category_type: "post",
        title: "Developer Post Category",
        description: "This is a test category for blog posts.",
        slug: "Developer-Post-Category",
        created_at: "2026-07-31T11:20:16Z"
      },
      {
        id: "70f6a23b-a03b-4f60-986c-b27d8d4c2a05",
        parent_id: null,
        category_type: "page",
        title: "Developer Page Category",
        description: "This is a test category for system pages.",
        slug: "Developer-Page-Category",
        created_at: "2026-07-31T11:21:34Z"
      }
    ];
  });

  const [navLinks, setNavLinks] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_nav_links");
    return saved ? JSON.parse(saved) : [
      {
        nav_id: "857dc05a-a883-407e-a301-0ba4505b90f6",
        parent_id: null,
        nav_label: "Contact Page Test",
        nav_url: "/Contact-Page-Test.html",
        nav_target: "_self",
        nav_position: 0,
        nav_active: true,
        created_at: "2026-07-31T11:26:55Z"
      },
      {
        nav_id: "a8578620-37ed-4ce3-b148-15bbc1481e63",
        parent_id: null,
        nav_label: "About Page Test",
        nav_url: "/About-Page-Test.html",
        nav_target: "_self",
        nav_position: 1,
        nav_active: true,
        created_at: "2026-07-31T11:27:05Z"
      }
    ];
  });

  const [tags, setTags] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_tags");
    return saved ? JSON.parse(saved) : [
      { id: "tag_1", name: "BEJSON", slug: "bejson", created_at: "2026-07-31T11:20:16Z" },
      { id: "tag_2", name: "Vite", slug: "vite", created_at: "2026-07-31T11:21:16Z" }
    ];
  });

  const [media, setMedia] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_media");
    return saved ? JSON.parse(saved) : [
      {
        id: "0aa2b9df-30d6-4588-b861-fe74f6956df9",
        filename: "1000744483.png",
        original_path: "Content/media/uploads/1000744483.png",
        mime_type: "image/png",
        file_hash: "f8ced8a4bd63db8521681664eeeb7d64673865701a25fb7e4f0926c3ba4aa86d",
        webp_path: "",
        alt_text: "Logo",
        created_at: "2026-07-31T11:26:20Z",
        admin_media_id: "406ec330-07e3-46b6-9607-8270088baf5a"
      },
      {
        id: "18f22d05-9b45-44ce-922f-5502fad9a189",
        filename: "1000754777.webp",
        original_path: "Content/media/uploads/1000754777.webp",
        mime_type: "image/webp",
        file_hash: "8a57455ba2acf9207c58b1124b5a710ad13c8fa172ca171760525cd5c996a5d8",
        webp_path: "",
        alt_text: "Hero Banner",
        created_at: "2026-07-31T11:49:46Z",
        admin_media_id: "adbf9689-e4e2-494b-9a9c-33f43f36092c"
      }
    ];
  });

  const [links, setLinks] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_links");
    return saved ? JSON.parse(saved) : [
      {
        id: "d02b5ded-861a-478b-b7d2-84f33728ae0c",
        category: "e2e4264e-4190-4ab3-b659-8d736fa81a7c",
        taxonomy: "link",
        type: null,
        label: "github",
        idx_position: 0,
        idx_sorting: "default",
        active: true,
        hidden: false,
        url: "github.com/boehnenelton",
        icon: "📱",
        description: "My Github",
        created_at: "2026-07-31T11:59:59Z"
      }
    ];
  });

  const [linkCategories, setLinkCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_link_categories");
    return saved ? JSON.parse(saved) : [
      {
        cat_id: "e2e4264e-4190-4ab3-b659-8d736fa81a7c",
        cat_name: "Social",
        cat_created_at: "2026-07-31T12:00:06Z"
      }
    ];
  });

  const [notes, setNotes] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_notes");
    return saved ? JSON.parse(saved) : [
      {
        id: "06ef9671-51cc-43b7-85df-dea828985001",
        category: "afad457f-6420-4449-9277-9709cb2eba6d",
        taxonomy: "note",
        type: null,
        label: "Sidebar Issues",
        idx_position: 0,
        idx_sorting: "default",
        active: true,
        hidden: false,
        created_at: "2026-07-31T11:28:33Z",
        content: "Page category shows up on the sidebar as a page and the pages themselves show up above both the post and the pages section.",
        color: "#fce7f3"
      }
    ];
  });

  const [noteCategories, setNoteCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_note_categories");
    return saved ? JSON.parse(saved) : [
      {
        cat_id: "afad457f-6420-4449-9277-9709cb2eba6d",
        cat_name: "Sidebar Issues",
        cat_created_at: "2026-07-31T11:30:14Z"
      }
    ];
  });

  const [todoItems, setTodoItems] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_todo_items");
    return saved ? JSON.parse(saved) : [
      {
        id: "486b0a7c",
        taxonomy: "task",
        type: null,
        category: "task_cat_1",
        label: "Complete React Core Refactoring",
        idx_position: 0,
        idx_sorting: "default",
        active: true,
        hidden: false,
        created_at: "2026-07-31T11:28:33Z",
        done: false,
        priority: "high",
        detail: "Integrate TypeScript core bejson libraries into standard React components."
      }
    ];
  });

  const [taskCategories, setTaskCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem("mgmt_cms_task_categories");
    return saved ? JSON.parse(saved) : [
      {
        cat_id: "task_cat_1",
        cat_name: "Sprint Objectives",
        cat_created_at: "2026-07-31T11:28:33Z"
      }
    ];
  });

  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("mgmt_cms_settings");
    return saved ? JSON.parse(saved) : {
      site_title: "Management CMS",
      site_subtitle: "Modular React & TypeScript Edition",
      footer_text: "All Rights Reserved",
      accent_color: "#DE2626",
      bg_color: "#000000"
    };
  });

  // Synced local-storage hook
  useEffect(() => {
    localStorage.setItem("mgmt_cms_pages", JSON.stringify(pages));
    localStorage.setItem("mgmt_cms_posts", JSON.stringify(posts));
    localStorage.setItem("mgmt_cms_categories", JSON.stringify(categories));
    localStorage.setItem("mgmt_cms_nav_links", JSON.stringify(navLinks));
    localStorage.setItem("mgmt_cms_tags", JSON.stringify(tags));
    localStorage.setItem("mgmt_cms_media", JSON.stringify(media));
    localStorage.setItem("mgmt_cms_links", JSON.stringify(links));
    localStorage.setItem("mgmt_cms_link_categories", JSON.stringify(linkCategories));
    localStorage.setItem("mgmt_cms_notes", JSON.stringify(notes));
    localStorage.setItem("mgmt_cms_note_categories", JSON.stringify(noteCategories));
    localStorage.setItem("mgmt_cms_todo_items", JSON.stringify(todoItems));
    localStorage.setItem("mgmt_cms_task_categories", JSON.stringify(taskCategories));
    localStorage.setItem("mgmt_cms_settings", JSON.stringify(settings));
  }, [pages, posts, categories, navLinks, tags, media, links, linkCategories, notes, noteCategories, todoItems, taskCategories, settings]);

  // UI Active Navigation Section state (Section 10.4 Horizontally-Scrolling Switcher)
  const [activeTab, setActiveTab] = useState<string>("Pages");

  // Selection states for Tab 3 (Assets)
  const [activeSchemaKey, setActiveSchemaKey] = useState<keyof typeof SCHEMAS>("Category");

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorKind, setEditorKind] = useState<string>("");
  const [editorData, setEditorData] = useState<any>({});
  const [editorMode, setEditorKindMode] = useState<"add" | "edit">("add");

  // Form Details/Content Switcher for Page/Post Editor Dialogs (Section 9.4 tabbed modal design)
  const [formActiveSubTab, setFormActiveSubTab] = useState<"details" | "content">("details");

  // Build Staging Log
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  // Search & Filter criteria states
  const [linksFilterCat, setLinksFilterCat] = useState<string>("all");
  const [notesFilterCat, setNotesFilterCat] = useState<string>("all");
  const [todosFilterCat, setTodosFilterCat] = useState<string>("all");
  const [noteSearch, setNoteSearch] = useState("");
  const [todoSearch, setTodoSearch] = useState("");

  // Sub-tabs for the Python Bug Report Section (About -> Reports sub-tabs)
  const [activeReportTab, setActiveReportTab] = useState<string>("bug1");

  // Custom persistent developer notes
  const [devNotes, setDevNotes] = useState<string>(() => {
    return localStorage.getItem("mgmt_cms_dev_notes") || "### Persistent Workspace Notes\n- Document any server-side dependencies here.\n- Verify BEJSON compatibility before pushing zip packages.";
  });

  // Handle local file uploads for database Import
  const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const zip = await JSZip.loadAsync(event.target?.result as ArrayBuffer);
          
          const loadBejsonFile = async (name: string, fallback: any[]) => {
            const entry = zip.file(name);
            if (!entry) return fallback;
            const text = await entry.async("text");
            return parseBejsonToState(text);
          };

          const importedCategories = await loadBejsonFile("data/category.bejson", categories);
          const importedPages = await loadBejsonFile("data/page.bejson", pages);
          const importedPosts = await loadBejsonFile("data/post.bejson", posts);
          const importedTags = await loadBejsonFile("data/tag.bejson", tags);
          const importedNav = await loadBejsonFile("data/navlink.bejson", navLinks);
          const importedMedia = await loadBejsonFile("data/media.bejson", media);
          const importedLinks = await loadBejsonFile("data/link.bejson", links);
          const importedLinkCats = await loadBejsonFile("data/linkcategory.bejson", linkCategories);
          const importedNotes = await loadBejsonFile("data/note.bejson", notes);
          const importedNoteCats = await loadBejsonFile("data/notecategory.bejson", noteCategories);
          const importedTodos = await loadBejsonFile("data/todoitem.bejson", todoItems);
          const importedTodoCats = await loadBejsonFile("data/taskcategory.bejson", taskCategories);

          const configEntry = zip.file("config/config.bejson");
          if (configEntry) {
            const text = await configEntry.async("text");
            const configRows = parseBejsonToState(text);
            const loadedSettings: Record<string, string> = {};
            configRows.forEach((r) => {
              loadedSettings[r.setting_name] = r.setting_value;
            });
            setSettings(loadedSettings);
          }

          setCategories(importedCategories);
          setPages(importedPages);
          setPosts(importedPosts);
          setTags(importedTags);
          setNavLinks(importedNav);
          setMedia(importedMedia);
          setLinks(importedLinks);
          setLinkCategories(importedLinkCats);
          setNotes(importedNotes);
          setNoteCategories(importedNoteCats);
          setTodoItems(importedTodos);
          setTaskCategories(importedTodoCats);

          alert("Database imported successfully and matched 100% BEJSON binary specifications!");
        } catch (err: any) {
          alert("Error parsing backup ZIP database: " + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      alert("Error reading file: " + err.message);
    }
  };

  // Export 100% compatible BEJSON databases as a bundled ZIP file
  const handleExportDatabase = async () => {
    const zip = new JSZip();
    
    zip.file("data/category.bejson", serializeStateToBejson("Category", categories));
    zip.file("data/page.bejson", serializeStateToBejson("Page", pages));
    zip.file("data/post.bejson", serializeStateToBejson("Post", posts));
    zip.file("data/tag.bejson", serializeStateToBejson("Tag", tags));
    zip.file("data/navlink.bejson", serializeStateToBejson("NavLink", navLinks));
    zip.file("data/media.bejson", serializeStateToBejson("Media", media));
    zip.file("data/link.bejson", serializeStateToBejson("Link", links));
    zip.file("data/linkcategory.bejson", serializeStateToBejson("LinkCategory", linkCategories));
    zip.file("data/note.bejson", serializeStateToBejson("Note", notes));
    zip.file("data/notecategory.bejson", serializeStateToBejson("NoteCategory", noteCategories));
    zip.file("data/todoitem.bejson", serializeStateToBejson("TodoItem", todoItems));
    zip.file("data/taskcategory.bejson", serializeStateToBejson("TaskCategory", taskCategories));

    // Serialize Config to BEJSON 104a format
    const configRows = Object.keys(settings).map((key) => ({
      setting_name: key,
      setting_value: settings[key],
      description: "App configuration settings"
    }));

    // Generate BEJSON format 104a
    const configDoc = {
      Format: "BEJSON",
      Format_Version: "104a",
      Format_Creator: "Elton Boehnen",
      Records_Type: ["ScriptConfig"],
      Fields: [
        { name: "setting_name", type: "string" },
        { name: "setting_value", type: "string" },
        { name: "description", type: "string" }
      ],
      Values: configRows.map(r => [r.setting_name, r.setting_value, r.description])
    };
    zip.file("config/config.bejson", JSON.stringify(configDoc, null, 2));

    const content = await zip.generateAsync({ type: "blob" });
    const linkEl = document.createElement("a");
    linkEl.href = URL.createObjectURL(content);
    linkEl.download = "Management_CMS_bejson_database.zip";
    linkEl.click();
  };

  // Run the static site pre-rendering build inside the browser!
  const triggerStaticBuild = async () => {
    setIsBuilding(true);
    setBuildLogs(["[BUILD] Initiating build...", "Loaded templates...", "Mapping navigation links...", "Pre-rendering Index fallback hero and posts list..."]);

    setTimeout(async () => {
      try {
        setBuildLogs((prev) => [...prev, "Compiling individual Pages with Breadcrumbs...", "Injecting headings IDs & auto Table of Contents for Posts..."]);
        
        const zipBlob = await buildStaticSite({
          pages,
          posts,
          categories,
          navLinks,
          tags,
          media,
          settings
        });

        setBuildLogs((prev) => [...prev, "Generating RSS feed.xml, JSON Feed feed.json...", "Assembling sitemap.xml and robots.txt...", "[SUCCESS] Export completely compiled inside memory! Click Download Export below to save."]);
        
        const linkEl = document.createElement("a");
        linkEl.href = URL.createObjectURL(zipBlob);
        linkEl.download = "Export.zip";
        linkEl.click();
        setIsBuilding(false);
      } catch (err: any) {
        setBuildLogs((prev) => [...prev, "[ERROR] " + err.message]);
        setIsBuilding(false);
      }
    }, 1200);
  };

  // Helper to generate UUIDs
  const generateUuid = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  return (
    <div className={`w-full min-h-screen flex ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors duration-150`}>
      {/* Mobile Sidebar overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar Layout (desktop persistent, mobile sliding drawer) */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col z-[100] lg:z-30 transition-transform duration-200 shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm tracking-tight text-[#DE2626]">
              MANAGEMENT_CMS
            </span>
            <span className="font-mono text-[9px] text-zinc-500">v{APP_VERSION}</span>
          </div>
          <button
            className="lg:hidden text-zinc-400 hover:text-white p-1"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrolling Nav Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">
              CMS Content
            </div>
            <div className="space-y-1">
              {[
                { name: "Pages", icon: <FileText size={14} /> },
                { name: "Posts", icon: <FileCode size={14} /> },
                { name: "Categories", icon: <FolderOpen size={14} /> },
                { name: "Site Nav", icon: <Compass size={14} /> },
                { name: "Media", icon: <Image size={14} /> },
                { name: "Build", icon: <FileCheck size={14} /> }
              ].map((tab) => {
                const active = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => {
                      setActiveTab(tab.name);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold rounded transition-colors ${
                      active
                        ? "bg-[#DE2626] text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">
              Userspace
            </div>
            <div className="space-y-1">
              {[
                { name: "Links", icon: <ExternalLink size={14} /> },
                { name: "Notes", icon: <BookOpen size={14} /> },
                { name: "To-Do", icon: <CheckSquare size={14} /> }
              ].map((tab) => {
                const active = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => {
                      setActiveTab(tab.name);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold rounded transition-colors ${
                      active
                        ? "bg-[#DE2626] text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">
              System
            </div>
            <div className="space-y-1">
              {[
                { name: "Settings", icon: <SettingsIcon size={14} /> },
                { name: "About / Reports", icon: <Info size={14} /> }
              ].map((tab) => {
                const active = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => {
                      setActiveTab(tab.name);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold rounded transition-colors ${
                      active
                        ? "bg-[#DE2626] text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar footer credits */}
        <div className="p-4 border-t border-zinc-800 text-[11px] text-zinc-500 space-y-1 shrink-0">
          <div>Elton Boehnen</div>
          <div className="text-[10px] hover:text-[#DE2626] cursor-pointer">
            <a
              href="https://boehnenelton2024.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              boehnenelton2024.pages.dev
            </a>
          </div>
        </div>
      </aside>

      {/* Right side main container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        {/* Decorative Checkerboard Background (Section 10.1 Style System) */}
        <div className="bg-checkerboard" />

        {/* TOP HEADER CONTROLS (Top Bar Contract 3-Zone compliant, Section 2) */}
        <header
          className={`h-16 flex items-center justify-between px-6 border-b ${
            theme === "dark" ? "border-zinc-800 bg-[#060606]" : "border-zinc-200 bg-zinc-50"
          } shrink-0 z-40`}
        >
          {/* Zone 1: Hamburger Menu Trigger (Mobile) + Current Tab Name */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsSidebarOpen(true)}
              title="Open Sidebar"
            >
              <Menu size={18} />
            </button>
            <span className="font-display font-bold text-sm tracking-tight text-[#DE2626]">
              {activeTab.toUpperCase()} SECTION
            </span>
          </div>

          {/* Zone 2: Navigation link triggers */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-semibold">
            <span>Relational Database Client</span>
          </div>

          {/* Zone 3: Interactive Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-md hover:bg-zinc-800 hover:text-white transition-colors`}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={handleExportDatabase}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-[#DE2626] hover:bg-[#c01f1f] text-white rounded transition-colors"
            >
              <Download size={12} /> Export DB
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-zinc-700 hover:bg-zinc-800 hover:text-white rounded cursor-pointer transition-colors">
              <Upload size={12} /> Import DB
              <input
                type="file"
                accept=".zip"
                onChange={handleImportDatabase}
                className="hidden"
              />
            </label>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 z-30">
        {/* PAGES SECTION */}
        {activeTab === "Pages" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">CMS Static Pages</h2>
                <p className="text-xs text-zinc-500">Pre-render clean custom landing pages using the design system.</p>
              </div>
              <button
                onClick={() => {
                  setEditorKind("Page");
                  setEditorKindMode("add");
                  setEditorData({
                    id: generateUuid(),
                    title: "",
                    slug: "",
                    page_type: "custom",
                    status: "draft",
                    content_html: "",
                    content_markdown: "",
                    author: "Elton Boehnen",
                    featured_image: "",
                    meta_description: "",
                    excerpt: ""
                  });
                  setFormActiveSubTab("details");
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DE2626] text-white rounded hover:bg-[#c01f1f] transition-colors"
              >
                <Plus size={13} /> Add Page
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map((page) => (
                <div key={page.id} className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg relative hover:border-[#DE2626] transition-all">
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditorKind("Page");
                        setEditorKindMode("edit");
                        setEditorData(page);
                        setFormActiveSubTab("details");
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-blue-500 text-blue-500 hover:bg-blue-950 transition-colors"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this page?")) {
                          setPages(pages.filter((p) => p.id !== page.id));
                        }
                      }}
                      className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-500 hover:bg-red-950 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 pr-16">
                    {/* Zero-Pill Metadata Discipline Compliant */}
                    <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
                      <span>{page.page_type}</span>
                      <span>·</span>
                      <span>{page.status}</span>
                    </div>

                    <h3 className="text-base font-semibold mt-1">{page.title}</h3>
                    <span className="text-[11px] text-zinc-400 font-mono">/{page.slug}.html</span>
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{page.meta_description || "No description set."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POSTS SECTION */}
        {activeTab === "Posts" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">CMS Blog Posts</h2>
                <p className="text-xs text-zinc-500">Draft or publish rich blog articles with full HTML support.</p>
              </div>
              <button
                onClick={() => {
                  setEditorKind("Post");
                  setEditorKindMode("add");
                  setEditorData({
                    id: generateUuid(),
                    title: "",
                    slug: "",
                    category_id_fk: "",
                    status: "draft",
                    content_html: "",
                    content_markdown: "",
                    author: "Elton Boehnen",
                    featured_image: "",
                    published_at: new Date().toISOString(),
                    scheduled_at: "",
                    tag_ids: [],
                    excerpt: ""
                  });
                  setFormActiveSubTab("details");
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DE2626] text-white rounded hover:bg-[#c01f1f] transition-colors"
              >
                <Plus size={13} /> Add Post
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => {
                const postCat = categories.find((c) => c.id === post.category_id_fk);
                return (
                  <div key={post.id} className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg relative hover:border-[#DE2626] transition-all">
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditorKind("Post");
                          setEditorKindMode("edit");
                          setEditorData(post);
                          setFormActiveSubTab("details");
                          setIsEditorOpen(true);
                        }}
                        className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-blue-500 text-blue-500 hover:bg-blue-950 transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this post?")) {
                            setPosts(posts.filter((p) => p.id !== post.id));
                          }
                        }}
                        className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-500 hover:bg-red-950 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1 pr-16">
                      {/* Zero-Pill Metadata Compliance */}
                      <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-1.5 flex-wrap">
                        <span>{post.status}</span>
                        {postCat && (
                          <>
                            <span>·</span>
                            <span>{postCat.title}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>

                      <h3 className="text-base font-semibold mt-1">{post.title}</h3>
                      <span className="text-[11px] text-zinc-400 font-mono">/post/{post.slug}.html</span>
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{post.excerpt || "No excerpt set."}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CATEGORIES SECTION */}
        {activeTab === "Categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">CMS Categories</h2>
                <p className="text-xs text-zinc-500">Organize your content structure hierarchically.</p>
              </div>
              <button
                onClick={() => {
                  setEditorKind("Category");
                  setEditorKindMode("add");
                  setEditorData({
                    id: generateUuid(),
                    parent_id: "",
                    category_type: "post",
                    title: "",
                    description: "",
                    slug: "",
                    created_at: new Date().toISOString()
                  });
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DE2626] text-white rounded hover:bg-[#c01f1f] transition-colors"
              >
                <Plus size={13} /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["post", "page"].map((type) => {
                const filtered = categories.filter((c) => c.category_type === type);
                return (
                  <div key={type} className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg">
                    <h3 className="text-sm font-display font-bold uppercase text-[#DE2626] border-b border-zinc-800 pb-2 mb-4 tracking-wider">
                      {type === "post" ? "Post Categories" : "Page Categories"}
                    </h3>

                    {filtered.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No categories defined yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {filtered.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded">
                            <div>
                              <span className="text-sm font-semibold">{cat.title}</span>
                              <p className="text-[11px] text-zinc-500">{cat.description || "No description."}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditorKind("Category");
                                  setEditorKindMode("edit");
                                  setEditorData(cat);
                                  setIsEditorOpen(true);
                                }}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-blue-400"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Delete this category? Pages or posts using this category will become uncategorized.")) {
                                    setCategories(categories.filter((c) => c.id !== cat.id));
                                  }
                                }}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-red-400"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SITE NAV SECTION */}
        {activeTab === "Site Nav" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Hierarchical Site Navigation</h2>
                <p className="text-xs text-zinc-500">Configure links rendering in your public site navigation sidebar.</p>
              </div>
              <button
                onClick={() => {
                  setEditorKind("SiteNav");
                  setEditorKindMode("add");
                  setEditorData({
                    nav_id: generateUuid(),
                    parent_id: null,
                    nav_label: "",
                    nav_url: "",
                    nav_target: "_self",
                    nav_position: navLinks.length,
                    nav_active: true,
                    created_at: new Date().toISOString()
                  });
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DE2626] text-white rounded hover:bg-[#c01f1f] transition-colors"
              >
                <Plus size={13} /> Add Nav Item
              </button>
            </div>

            <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
              {navLinks.length === 0 ? (
                <p className="text-xs text-zinc-500 italic text-center py-4">No navigation links added yet.</p>
              ) : (
                navLinks
                  .sort((a, b) => a.nav_position - b.nav_position)
                  .map((nav) => (
                    <div key={nav.nav_id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-zinc-500 text-xs">#{nav.nav_position}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{nav.nav_label}</span>
                          <span className="text-[11px] text-zinc-400 font-mono">{nav.nav_url}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditorKind("SiteNav");
                            setEditorKindMode("edit");
                            setEditorData(nav);
                            setIsEditorOpen(true);
                          }}
                          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-blue-400"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this navigation link?")) {
                              setNavLinks(navLinks.filter((n) => n.nav_id !== nav.nav_id));
                            }
                          }}
                          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-red-400"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* MEDIA SECTION */}
        {activeTab === "Media" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">CMS Media Library</h2>
                <p className="text-xs text-zinc-500">Manage uploaded assets or register high-resolution external links.</p>
              </div>
              <button
                onClick={() => {
                  setEditorKind("Media");
                  setEditorKindMode("add");
                  setEditorData({
                    id: generateUuid(),
                    filename: "",
                    original_path: "",
                    mime_type: "image/webp",
                    file_hash: "hash_generated",
                    webp_path: "",
                    alt_text: "",
                    created_at: new Date().toISOString(),
                    admin_media_id: generateUuid()
                  });
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DE2626] text-white rounded hover:bg-[#c01f1f] transition-colors"
              >
                <Plus size={13} /> Add Media
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {media.map((item) => (
                <div key={item.id} className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden group relative hover:border-[#DE2626] transition-all">
                  <div className="aspect-square bg-black relative">
                    <img
                      src={item.original_path.startsWith("Content/media/uploads/") ? "/media/" + item.filename : item.original_path}
                      alt={item.alt_text}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback container
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%231a1a1a'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div className="p-2 flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold truncate block">{item.filename}</span>
                    <span className="text-[9px] text-zinc-500 truncate block font-mono">{item.mime_type}</span>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => {
                        if (confirm("Delete this media item?")) {
                          setMedia(media.filter((m) => m.id !== item.id));
                        }
                      }}
                      className="p-1 rounded bg-black/80 hover:bg-[#DE2626] text-white"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LINKS SECTION */}
        {activeTab === "Links" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Userspace Bookmarks</h2>
                <p className="text-xs text-zinc-500">Personal categorized links directory.</p>
              </div>
              <button
                onClick={() => {
                  setEditorKind("Link");
                  setEditorKindMode("add");
                  setEditorData({
                    id: generateUuid(),
                    category: linkCategories[0]?.cat_id || "",
                    label: "",
                    url: "",
                    icon: "📱",
                    description: "",
                    created_at: new Date().toISOString()
                  });
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DE2626] text-white rounded hover:bg-[#c01f1f] transition-colors"
              >
                <Plus size={13} /> Add Bookmark
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-zinc-800">
              <button
                onClick={() => setLinksFilterCat("all")}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  linksFilterCat === "all" ? "bg-[#DE2626] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                All
              </button>
              {linkCategories.map((cat) => (
                <button
                  key={cat.cat_id}
                  onClick={() => setLinksFilterCat(cat.cat_id)}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    linksFilterCat === cat.cat_id ? "bg-[#DE2626] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat.cat_name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links
                .filter((l) => linksFilterCat === "all" || l.category === linksFilterCat)
                .map((link) => {
                  const categoryName = linkCategories.find((lc) => lc.cat_id === link.category)?.cat_name || "Uncategorized";
                  return (
                    <div key={link.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg relative hover:border-[#DE2626] transition-all">
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditorKind("Link");
                            setEditorKindMode("edit");
                            setEditorData(link);
                            setIsEditorOpen(true);
                          }}
                          className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-blue-500 text-blue-500"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this bookmark?")) {
                              setLinks(links.filter((l) => l.id !== link.id));
                            }
                          }}
                          className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-red-500 text-red-500"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1 pr-14">
                        <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                          {categoryName}
                        </div>
                        <h4 className="text-sm font-bold flex items-center gap-1.5 mt-1">
                          {link.icon && <span>{link.icon}</span>}
                          {link.label}
                        </h4>
                        <a
                          href={link.url.startsWith("http") ? link.url : "https://" + link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-400 truncate hover:text-[#DE2626]"
                        >
                          {link.url}
                        </a>
                        {link.description && <p className="text-xs text-zinc-500 mt-2">{link.description}</p>}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* NOTES SECTION */}
        {activeTab === "Notes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Userspace Scratchpad</h2>
                <p className="text-xs text-zinc-500">Quick personal notes categorized for easy search.</p>
              </div>
              <button
                onClick={() => {
                  setEditorKind("Note");
                  setEditorKindMode("add");
                  setEditorData({
                    id: generateUuid(),
                    category: noteCategories[0]?.cat_id || "",
                    label: "",
                    content: "",
                    color: "#f5f5f5",
                    created_at: new Date().toISOString()
                  });
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DE2626] text-white rounded hover:bg-[#c01f1f] transition-colors"
              >
                <Plus size={13} /> Add Note
              </button>
            </div>

            {/* Filter buttons & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
                <button
                  onClick={() => setNotesFilterCat("all")}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    notesFilterCat === "all" ? "bg-[#DE2626] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                {noteCategories.map((cat) => (
                  <button
                    key={cat.cat_id}
                    onClick={() => setNotesFilterCat(cat.cat_id)}
                    className={`px-3 py-1 text-xs font-semibold rounded ${
                      notesFilterCat === cat.cat_id ? "bg-[#DE2626] text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat.cat_name}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search notes..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-white text-black rounded border border-zinc-700 outline-none w-full sm:w-48"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes
                .filter((n) => notesFilterCat === "all" || n.category === notesFilterCat)
                .filter((n) => !noteSearch || n.label.toLowerCase().includes(noteSearch.toLowerCase()) || n.content.toLowerCase().includes(noteSearch.toLowerCase()))
                .map((note) => {
                  const categoryName = noteCategories.find((nc) => nc.cat_id === note.category)?.cat_name || "Uncategorized";
                  return (
                    <div
                      key={note.id}
                      className="p-5 border border-zinc-800 rounded-lg relative hover:border-[#DE2626] transition-all"
                      style={{ backgroundColor: note.color || "#111", color: "#000" }}
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditorKind("Note");
                            setEditorKindMode("edit");
                            setEditorData(note);
                            setIsEditorOpen(true);
                          }}
                          className="p-1 rounded bg-black/10 hover:bg-black/20 text-zinc-800"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this note?")) {
                              setNotes(notes.filter((n) => n.id !== note.id));
                            }
                          }}
                          className="p-1 rounded bg-black/10 hover:bg-black/20 text-red-700"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1 pr-14">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-700">{categoryName}</span>
                        <h4 className="text-sm font-bold mt-1 text-zinc-900">{note.label}</h4>
                        <p className="text-xs text-zinc-800 mt-2 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TO-DO SECTION */}
        {activeTab === "To-Do" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Interactive Task Checklist</h2>
                <p className="text-xs text-zinc-500">Track and prioritize sprint objectives.</p>
              </div>
              <button
                onClick={() => {
                  setEditorKind("Todo");
                  setEditorKindMode("add");
                  setEditorData({
                    id: generateUuid(),
                    category: taskCategories[0]?.cat_id || "",
                    label: "",
                    done: false,
                    priority: "medium",
                    detail: "",
                    created_at: new Date().toISOString()
                  });
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DE2626] text-white rounded hover:bg-[#c01f1f] transition-colors"
              >
                <Plus size={13} /> Add Task
              </button>
            </div>

            {/* Filter buttons & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
                <button
                  onClick={() => setTodosFilterCat("all")}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    todosFilterCat === "all" ? "bg-[#DE2626] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                {taskCategories.map((cat) => (
                  <button
                    key={cat.cat_id}
                    onClick={() => setTodosFilterCat(cat.cat_id)}
                    className={`px-3 py-1 text-xs font-semibold rounded ${
                      todosFilterCat === cat.cat_id ? "bg-[#DE2626] text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat.cat_name}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search tasks..."
                value={todoSearch}
                onChange={(e) => setTodoSearch(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-white text-black rounded border border-zinc-700 outline-none w-full sm:w-48"
              />
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
              {todoItems
                .filter((t) => todosFilterCat === "all" || t.category === todosFilterCat)
                .filter((t) => !todoSearch || t.label.toLowerCase().includes(todoSearch.toLowerCase()))
                .map((todo) => {
                  const catName = taskCategories.find((tc) => tc.cat_id === todo.category)?.cat_name || "Uncategorized";
                  return (
                    <div
                      key={todo.id}
                      className={`p-4 bg-zinc-950 border-y border-r border-zinc-800 border-l-4 rounded flex items-center justify-between ${
                        todo.priority === "high"
                          ? "border-l-[#DE2626]"
                          : todo.priority === "medium"
                          ? "border-l-amber-500"
                          : "border-l-zinc-500"
                      } ${todo.done ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={todo.done}
                          onChange={(e) => {
                            setTodoItems(todoItems.map((ti) => (ti.id === todo.id ? { ...ti, done: e.target.checked } : ti)));
                          }}
                          className="accent-[#DE2626] h-4 w-4"
                        />
                        <div className="flex flex-col">
                          <span className={`text-sm ${todo.done ? "line-through text-zinc-500" : "font-semibold"}`}>{todo.label}</span>
                          <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase mt-0.5">{catName}</span>
                          {todo.detail && <p className="text-xs text-zinc-400 mt-1">{todo.detail}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-4">
                        <button
                          onClick={() => {
                            setEditorKind("Todo");
                            setEditorKindMode("edit");
                            setEditorData(todo);
                            setIsEditorOpen(true);
                          }}
                          className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this task?")) {
                              setTodoItems(todoItems.filter((ti) => ti.id !== todo.id));
                            }
                          }}
                          className="p-1 rounded bg-zinc-900 border border-zinc-800 text-red-400 hover:text-red-500"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* SETTINGS SECTION */}
        {activeTab === "Settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">System Settings</h2>
              <p className="text-xs text-zinc-500">Configure global metadata and pre-rendering targets.</p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400">Site Title</label>
                <input
                  type="text"
                  value={settings.site_title || ""}
                  onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                  className="px-3 py-1.5 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400">Site Subtitle / Tagline</label>
                <input
                  type="text"
                  value={settings.site_subtitle || ""}
                  onChange={(e) => setSettings({ ...settings, site_subtitle: e.target.value })}
                  className="px-3 py-1.5 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400">Footer Text</label>
                <input
                  type="text"
                  value={settings.footer_text || ""}
                  onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                  className="px-3 py-1.5 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-400">Accent Color</label>
                  <input
                    type="color"
                    value={settings.accent_color || "#DE2626"}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="w-full h-10 bg-white border border-zinc-700 rounded cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-400">Canvas Color</label>
                  <input
                    type="color"
                    value={settings.bg_color || "#000000"}
                    onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                    className="w-full h-10 bg-white border border-zinc-700 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SITE BUILD PIPELINE */}
        {activeTab === "Build" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Static Website Pre-rendering</h2>
              <p className="text-xs text-zinc-500">Compile your relational database into lightning-fast pre-rendered static HTML/CSS.</p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={triggerStaticBuild}
                  disabled={isBuilding}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#DE2626] hover:bg-[#c01f1f] text-white rounded transition-colors disabled:opacity-50"
                >
                  <FileCheck size={14} /> {isBuilding ? "Compiling..." : "Build Static Site ZIP"}
                </button>
              </div>

              <div className="bg-black border border-zinc-800 rounded p-4 h-64 overflow-y-auto font-mono text-[11px] text-zinc-400 space-y-1">
                {buildLogs.length === 0 ? (
                  <span className="text-zinc-600 italic">Pre-rendering pipeline ready. Waiting for trigger.</span>
                ) : (
                  buildLogs.map((log, idx) => (
                    <div key={idx} className={log.startsWith("[ERROR]") ? "text-red-500" : log.startsWith("[SUCCESS]") ? "text-emerald-400" : ""}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABOUT & REPORTS SECTION (The Three-Tab Architecture conforming to Section 9.4) */}
        {activeTab === "About / Reports" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Ecosystem Ledger & Diagnostics</h2>
              <p className="text-xs text-zinc-500">Inspect project schemas, change logs, and Python-spec bug reports.</p>
            </div>

            {/* THE THREE-TAB CORE Meta-UI (Section 9.4 Requirement) */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-6">
              {/* Three-Tab Switcher */}
              <div className="flex items-center gap-1 border-b border-zinc-800 pb-2 overflow-x-auto whitespace-nowrap">
                {[
                  { id: "about", label: "Tab 1: About (Account)" },
                  { id: "changelog", label: "Tab 2: Change Log" },
                  { id: "assets", label: "Tab 3: Assets" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      // Custom local navigation within the About panel
                      (window as any)._aboutActiveSubTab = t.id;
                      setFormActiveSubTab(t.id as any); // Reusing the same state parameter for simplicity
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
                      (window as any)._aboutActiveSubTab === t.id || (!((window as any)._aboutActiveSubTab) && t.id === "about")
                        ? "bg-[#DE2626] text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: ABOUT (ACCOUNT) */}
              {(((window as any)._aboutActiveSubTab === "about") || !((window as any)._aboutActiveSubTab)) && (
                <div className="space-y-6">
                  <div className="space-y-2 border-b border-zinc-900 pb-4">
                    <h3 className="text-base font-bold text-white">Management_CMS — TS/React Edition</h3>
                    <p className="text-xs text-zinc-400">
                      High-fidelity relational Content Management System executing a multi-file database engine with complete Python-spec compatibility. Built on top of the BEJSON-104 specification.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-500 pt-3">
                      <div>Active Version: <span className="text-[#DE2626]">v{APP_VERSION}</span></div>
                      <div>Release Date: <span className="text-white">{RELEASE_DATE}</span></div>
                      <div>Primary Architect: <span className="text-white">Elton Boehnen</span></div>
                      <div>Contact Email: <span className="text-zinc-400">boehnenelton2024@gmail.com</span></div>
                    </div>
                  </div>

                  {/* IDENTIFIED BUGS REPORT WITH SUB-TABS (Conforming to user instruction) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} className="text-[#DE2626]" />
                      <h4 className="text-xs font-display font-bold uppercase tracking-widest text-[#DE2626]">Identified Python Version Bug Reports</h4>
                    </div>

                    {/* Sub-tab selection for bug reports */}
                    <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap border-b border-zinc-900 pb-1">
                      {[
                        { id: "bug1", label: "Bug 1: record_count Drift" },
                        { id: "bug2", label: "Bug 2: empty site_url fallback" },
                        { id: "bug3", label: "Bug 3: dangling FKs" },
                        { id: "bug4", label: "Bug 4: bearer bypass" },
                        { id: "bug5", label: "Bug 5: storage file leak" }
                      ].map((bugTab) => (
                        <button
                          key={bugTab.id}
                          onClick={() => setActiveReportTab(bugTab.id)}
                          className={`px-2 py-1 text-[11px] font-semibold transition-colors ${
                            activeReportTab === bugTab.id ? "text-[#DE2626] border-b-2 border-[#DE2626]" : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          {bugTab.label}
                        </button>
                      ))}
                    </div>

                    {/* Bug report text bodies */}
                    <div className="bg-[#050505] border border-zinc-900 rounded p-4 text-xs space-y-2 leading-relaxed">
                      {activeReportTab === "bug1" && (
                        <>
                          <div className="font-bold text-white text-sm">Bug 1: ComponentsMFDB record_count Manifest Drift</div>
                          <p className="text-zinc-400">
                            <strong>Symptoms:</strong> MFDB manifest validators threw integrity errors because the central manifest row count disagreed with on-disk database rows.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Root Cause:</strong> The database manifest in the library copy of <code>ComponentsMFDB</code> hardcoded <code>record_count: 6</code> despite the actual entity table containing 7 records. This caused automatic validation passes to fail loudly on launch.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Mitigation:</strong> Programmatically corrected manifest <code>record_count</code> to <code>7</code> via native JSON parsing, and registered a dynamic sync hook.
                          </p>
                        </>
                      )}

                      {activeReportTab === "bug2" && (
                        <>
                          <div className="font-bold text-white text-sm">Bug 2: Empty site_url loopback fallback in OG/canonical tags</div>
                          <p className="text-zinc-400">
                            <strong>Symptoms:</strong> Exported static pages generated empty canonical and social OpenGraph tag properties.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Root Cause:</strong> The static builder pre-rendered relative tag contexts as blank values when <code>site_url</code> was empty or configured to loopback (e.g. <code>http://127.0.0.1:5030</code>) instead of cleanly degrading to root relative path <code>/</code>.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Mitigation:</strong> Rewrote static builders to default gracefully to root-relative pathing if the server address resolves to local interfaces.
                          </p>
                        </>
                      )}

                      {activeReportTab === "bug3" && (
                        <>
                          <div className="font-bold text-white text-sm">Bug 3: Dangling foreign keys on page/post category deletion</div>
                          <p className="text-zinc-400">
                            <strong>Symptoms:</strong> Deleting a category resulted in orphaned metadata tags and broken category queries inside lists.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Root Cause:</strong> The <code>delete_category()</code> module operated in isolation from page and post databases. As a result, deleting a category row did not reach <code>Content/Page</code> to null out referencing <code>category_id_fk</code> values.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Mitigation:</strong> Structured a transactional cascade handler inside the route layer to recursively scan and update active page and post manifests when category deletions occur.
                          </p>
                        </>
                      )}

                      {activeReportTab === "bug4" && (
                        <>
                          <div className="font-bold text-white text-sm">Bug 4: Admin Bearer Token Bypass on / root route</div>
                          <p className="text-zinc-400">
                            <strong>Symptoms:</strong> Complete security bypass of the <code>X-Admin-Token</code> bearer gate.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Root Cause:</strong> Version 5.1.0 exempted the root path <code>/</code> from the token verification check, but then immediately rendered the exact plaintext <code>ADMIN_TOKEN</code> into the raw HTML payload, rendering the gate entirely inert to network crawlers.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Mitigation:</strong> Removed the token context completely from template rendering, storing credentials exclusively inside the browser's <code>sessionStorage</code> upon positive console-assisted login.
                          </p>
                        </>
                      )}

                      {activeReportTab === "bug5" && (
                        <>
                          <div className="font-bold text-white text-sm">Bug 5: Media delete physical file leaks</div>
                          <p className="text-zinc-400">
                            <strong>Symptoms:</strong> Storage space on mobile hosts became depleted after repeated media replacements.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Root Cause:</strong> The media delete API route cleared the relational database metadata row in <code>media.bejson</code> but omitted unlinking the actual physical image files (and their WebP variant siblings) from server storage.
                          </p>
                          <p className="text-zinc-400">
                            <strong>Mitigation:</strong> Programmed filesystem unlinks on the server side preceding the database metadata deletion pass.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHANGE LOG */}
              {(window as any)._aboutActiveSubTab === "changelog" && (
                <div className="space-y-4 font-mono text-xs text-zinc-400 leading-relaxed max-h-96 overflow-y-auto pr-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historical Revision Log</h3>
                  <div className="space-y-3">
                    <div className="border-l border-zinc-800 pl-4 py-1">
                      <div className="text-white font-bold">2026-09-24 | PKG125 | Fixed PAGE_FIELDS divergence</div>
                      <p className="mt-1">Retired the stale Pages CRUD layer and consolidated under the authoritative Page manifest.</p>
                    </div>
                    <div className="border-l border-zinc-800 pl-4 py-1">
                      <div className="text-white font-bold">2026-09-21 | PKG124 | Policy-compliance pass</div>
                      <p className="mt-1">Relocated documents under dev/, introduced persistent debug notes, and structured CLI subcommands.</p>
                    </div>
                    <div className="border-l border-zinc-800 pl-4 py-1">
                      <div className="text-white font-bold">2026-09-15 | PKG122 | Dialog scroll-boundary overhaul</div>
                      <p className="mt-1">Restructured the shared overlay modal into full-screen with scrolling tabs, resolving button clippings.</p>
                    </div>
                    <div className="border-l border-zinc-800 pl-4 py-1">
                      <div className="text-white font-bold">2026-09-12 | PKG119 | Breadcrumb and Markdown integration</div>
                      <p className="mt-1">Added automated breadcrumbs, markdown regex pre-processors, and client-side draft auto-save routines.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ASSETS (SCHEMA READOUT & EXPORT) */}
              {(window as any)._aboutActiveSubTab === "assets" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reusable Schema Registry</h3>
                    <p className="text-xs text-zinc-500">Inspect, copy, or download registered empty BEJSON schemas.</p>
                  </div>

                  {/* Schema selector dropdown */}
                  <div className="flex items-center gap-3">
                    <select
                      value={activeSchemaKey}
                      onChange={(e) => setActiveSchemaKey(e.target.value as keyof typeof SCHEMAS)}
                      className="px-3 py-1.5 text-xs bg-white text-black font-semibold rounded border border-zinc-700 outline-none flex-1 max-w-xs"
                    >
                      {Object.keys(SCHEMAS).map((key) => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        const payload = serializeStateToBejson(activeSchemaKey, []);
                        navigator.clipboard.writeText(payload);
                        toast("Schema copied to clipboard!");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
                    >
                      <Copy size={13} /> Copy
                    </button>

                    <button
                      onClick={() => {
                        const payload = serializeStateToBejson(activeSchemaKey, []);
                        const blob = new Blob([payload], { type: "application/json" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `${activeSchemaKey.toLowerCase()}.bejson`;
                        link.click();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
                    >
                      <Download size={13} /> Save Schema
                    </button>

                    <button
                      onClick={async () => {
                        const zip = new JSZip();
                        Object.keys(SCHEMAS).forEach((key) => {
                          const payload = serializeStateToBejson(key as any, []);
                          zip.file(`${key.toLowerCase()}.bejson`, payload);
                        });
                        const blob = await zip.generateAsync({ type: "blob" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = "all_bejson_schemas.zip";
                        link.click();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#DE2626] text-white rounded hover:bg-[#c01f1f] transition-colors"
                    >
                      <FolderPlus size={13} /> Save ZIP
                    </button>
                  </div>

                  {/* Text display readout area (Source Code Pro monospace) */}
                  <div className="bg-black border border-zinc-800 rounded p-4">
                    <pre className="text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-pre leading-normal max-h-72">
                      <code>{serializeStateToBejson(activeSchemaKey, [])}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER CREDITS (Section 9.2 Mandatory Author Attribution) */}
      <footer className={`py-4 px-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 z-30 shrink-0 ${
        theme === "dark" ? "border-zinc-800 bg-[#060606]" : "border-zinc-200 bg-zinc-50"
      }`}>
        <span>Author: Elton Boehnen (boehnenelton2024.pages.dev)</span>
        <span>Email: boehnenelton2024@gmail.com</span>
      </footer>
    </div>

      {/* GLOBAL MODAL/EDITOR OVERLAY (Full-Screen tabbed viewport, compliant with Section 9.4) */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/80 flex flex-col z-[500] animate-fade-in">
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-6 border-b border-zinc-800 bg-black text-white shrink-0">
            <span className="font-semibold text-sm">
              {editorMode === "add" ? "Create New" : "Edit"} {editorKind}
            </span>
            <button
              onClick={() => setIsEditorOpen(false)}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrolling Content Container */}
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl w-full mx-auto space-y-6">
            {/* Tabbed Selectors for Page and Post forms */}
            {(editorKind === "Page" || editorKind === "Post") && (
              <div className="flex gap-2 border-b border-zinc-800 pb-2">
                <button
                  type="button"
                  onClick={() => setFormActiveSubTab("details")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${
                    formActiveSubTab === "details" ? "bg-[#DE2626] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => setFormActiveSubTab("content")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${
                    formActiveSubTab === "content" ? "bg-[#DE2626] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Content
                </button>
              </div>
            )}

            {/* Form Fields: Page Editor */}
            {editorKind === "Page" && (
              <>
                {formActiveSubTab === "details" ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Page Title *</label>
                      <input
                        type="text"
                        value={editorData.title || ""}
                        onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                        placeholder="e.g. About Us"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Slug</label>
                      <input
                        type="text"
                        value={editorData.slug || ""}
                        onChange={(e) => setEditorData({ ...editorData, slug: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                        placeholder="e.g. about-us"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Page Type</label>
                      <select
                        value={editorData.page_type || "custom"}
                        onChange={(e) => setEditorData({ ...editorData, page_type: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                      >
                        <option value="custom">Custom</option>
                        <option value="home">Home</option>
                        <option value="about">About</option>
                        <option value="contact">Contact</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Status</label>
                      <select
                        value={editorData.status || "draft"}
                        onChange={(e) => setEditorData({ ...editorData, status: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Meta Description</label>
                      <input
                        type="text"
                        value={editorData.meta_description || ""}
                        onChange={(e) => setEditorData({ ...editorData, meta_description: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">HTML Content</label>
                      <textarea
                        value={editorData.content_html || ""}
                        onChange={(e) => setEditorData({ ...editorData, content_html: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black font-mono border border-zinc-700 rounded outline-none h-96"
                        placeholder="<p>Insert body HTML here...</p>"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Form Fields: Post Editor */}
            {editorKind === "Post" && (
              <>
                {formActiveSubTab === "details" ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Post Title *</label>
                      <input
                        type="text"
                        value={editorData.title || ""}
                        onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                        placeholder="e.g. My First Post"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Slug</label>
                      <input
                        type="text"
                        value={editorData.slug || ""}
                        onChange={(e) => setEditorData({ ...editorData, slug: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                        placeholder="e.g. my-first-post"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Category</label>
                      <select
                        value={editorData.category_id_fk || ""}
                        onChange={(e) => setEditorData({ ...editorData, category_id_fk: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                      >
                        <option value="">— None —</option>
                        {categories.filter((c) => c.category_type === "post").map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Status</label>
                      <select
                        value={editorData.status || "draft"}
                        onChange={(e) => setEditorData({ ...editorData, status: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">Featured Image (Image or YouTube Watch URL)</label>
                      <input
                        type="text"
                        value={editorData.featured_image || ""}
                        onChange={(e) => setEditorData({ ...editorData, featured_image: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                        placeholder="e.g. /media/1000754777.webp or youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400">HTML Content</label>
                      <textarea
                        value={editorData.content_html || ""}
                        onChange={(e) => setEditorData({ ...editorData, content_html: e.target.value })}
                        className="px-3 py-2 text-sm bg-white text-black font-mono border border-zinc-700 rounded outline-none h-96"
                        placeholder="<h2>Intro</h2><p>Article body HTML here...</p>"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Form Fields: Category Editor */}
            {editorKind === "Category" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Category Name *</label>
                  <input
                    type="text"
                    value={editorData.title || ""}
                    onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Slug</label>
                  <input
                    type="text"
                    value={editorData.slug || ""}
                    onChange={(e) => setEditorData({ ...editorData, slug: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Category Type</label>
                  <select
                    value={editorData.category_type || "post"}
                    onChange={(e) => setEditorData({ ...editorData, category_type: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  >
                    <option value="post">Post</option>
                    <option value="page">Page</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Description</label>
                  <input
                    type="text"
                    value={editorData.description || ""}
                    onChange={(e) => setEditorData({ ...editorData, description: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
              </div>
            )}

            {/* Form Fields: Nav Item Editor */}
            {editorKind === "SiteNav" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Label *</label>
                  <input
                    type="text"
                    value={editorData.nav_label || ""}
                    onChange={(e) => setEditorData({ ...editorData, nav_label: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">URL / Target Path *</label>
                  <input
                    type="text"
                    value={editorData.nav_url || ""}
                    onChange={(e) => setEditorData({ ...editorData, nav_url: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Target Option</label>
                  <select
                    value={editorData.nav_target || "_self"}
                    onChange={(e) => setEditorData({ ...editorData, nav_target: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Display Order Position</label>
                  <input
                    type="number"
                    value={editorData.nav_position || 0}
                    onChange={(e) => setEditorData({ ...editorData, nav_position: parseInt(e.target.value) || 0 })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
              </div>
            )}

            {/* Form Fields: Media Editor */}
            {editorKind === "Media" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">File Name *</label>
                  <input
                    type="text"
                    value={editorData.filename || ""}
                    onChange={(e) => setEditorData({ ...editorData, filename: e.target.value, original_path: "Content/media/uploads/" + e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Mime Type</label>
                  <input
                    type="text"
                    value={editorData.mime_type || "image/webp"}
                    onChange={(e) => setEditorData({ ...editorData, mime_type: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Alt Text</label>
                  <input
                    type="text"
                    value={editorData.alt_text || ""}
                    onChange={(e) => setEditorData({ ...editorData, alt_text: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
              </div>
            )}

            {/* Form Fields: Link Editor */}
            {editorKind === "Link" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Title *</label>
                  <input
                    type="text"
                    value={editorData.label || ""}
                    onChange={(e) => setEditorData({ ...editorData, label: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">URL *</label>
                  <input
                    type="text"
                    value={editorData.url || ""}
                    onChange={(e) => setEditorData({ ...editorData, url: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Category</label>
                  <select
                    value={editorData.category || ""}
                    onChange={(e) => setEditorData({ ...editorData, category: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  >
                    <option value="">— None —</option>
                    {linkCategories.map((c) => (
                      <option key={c.cat_id} value={c.cat_id}>{c.cat_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Icon Emoji</label>
                  <input
                    type="text"
                    value={editorData.icon || "📱"}
                    onChange={(e) => setEditorData({ ...editorData, icon: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Description</label>
                  <input
                    type="text"
                    value={editorData.description || ""}
                    onChange={(e) => setEditorData({ ...editorData, description: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
              </div>
            )}

            {/* Form Fields: Note Editor */}
            {editorKind === "Note" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Title *</label>
                  <input
                    type="text"
                    value={editorData.label || ""}
                    onChange={(e) => setEditorData({ ...editorData, label: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Content</label>
                  <textarea
                    value={editorData.content || ""}
                    onChange={(e) => setEditorData({ ...editorData, content: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none h-48"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Category</label>
                  <select
                    value={editorData.category || ""}
                    onChange={(e) => setEditorData({ ...editorData, category: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  >
                    <option value="">— None —</option>
                    {noteCategories.map((c) => (
                      <option key={c.cat_id} value={c.cat_id}>{c.cat_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Color Swatch</label>
                  <div className="flex gap-2">
                    {["#f5f5f5", "#fef9c3", "#d1fae5", "#dbeafe", "#fce7f3", "#ede9fe"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditorData({ ...editorData, color: c })}
                        className={`w-6 h-6 rounded border ${editorData.color === c ? "border-black ring-2 ring-[#DE2626]" : "border-zinc-700"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields: Todo Editor */}
            {editorKind === "Todo" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Objective *</label>
                  <input
                    type="text"
                    value={editorData.label || ""}
                    onChange={(e) => setEditorData({ ...editorData, label: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Category</label>
                  <select
                    value={editorData.category || ""}
                    onChange={(e) => setEditorData({ ...editorData, category: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  >
                    <option value="">— None —</option>
                    {taskCategories.map((c) => (
                      <option key={c.cat_id} value={c.cat_id}>{c.cat_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Priority Level</label>
                  <select
                    value={editorData.priority || "medium"}
                    onChange={(e) => setEditorData({ ...editorData, priority: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400">Detailed Description</label>
                  <textarea
                    value={editorData.detail || ""}
                    onChange={(e) => setEditorData({ ...editorData, detail: e.target.value })}
                    className="px-3 py-2 text-sm bg-white text-black border border-zinc-700 rounded outline-none h-32"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="h-16 flex items-center justify-end gap-2 px-6 border-t border-zinc-800 bg-black shrink-0">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="px-4 py-2 text-xs font-semibold border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (editorKind === "Page") {
                  const updatedSlug = editorData.slug || editorData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  const updatedPage = { ...editorData, slug: updatedSlug, updated_at: new Date().toISOString() };
                  if (editorMode === "add") {
                    setPages([...pages, { ...updatedPage, created_at: new Date().toISOString() }]);
                  } else {
                    setPages(pages.map((p) => p.id === editorData.id ? updatedPage : p));
                  }
                } else if (editorKind === "Post") {
                  const updatedSlug = editorData.slug || editorData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  const updatedPost = { ...editorData, slug: updatedSlug, updated_at: new Date().toISOString() };
                  if (editorMode === "add") {
                    setPosts([...posts, { ...updatedPost, created_at: new Date().toISOString() }]);
                  } else {
                    setPosts(posts.map((p) => p.id === editorData.id ? updatedPost : p));
                  }
                } else if (editorKind === "Category") {
                  const updatedSlug = editorData.slug || editorData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  const updatedCat = { ...editorData, slug: updatedSlug };
                  if (editorMode === "add") {
                    setCategories([...categories, updatedCat]);
                  } else {
                    setCategories(categories.map((c) => c.id === editorData.id ? updatedCat : c));
                  }
                } else if (editorKind === "SiteNav") {
                  if (editorMode === "add") {
                    setNavLinks([...navLinks, editorData]);
                  } else {
                    setNavLinks(navLinks.map((n) => n.nav_id === editorData.nav_id ? editorData : n));
                  }
                } else if (editorKind === "Media") {
                  if (editorMode === "add") {
                    setMedia([...media, editorData]);
                  } else {
                    setMedia(media.map((m) => m.id === editorData.id ? editorData : m));
                  }
                } else if (editorKind === "Link") {
                  if (editorMode === "add") {
                    setLinks([...links, editorData]);
                  } else {
                    setLinks(links.map((l) => l.id === editorData.id ? editorData : l));
                  }
                } else if (editorKind === "Note") {
                  if (editorMode === "add") {
                    setNotes([...notes, editorData]);
                  } else {
                    setNotes(notes.map((n) => n.id === editorData.id ? editorData : n));
                  }
                } else if (editorKind === "Todo") {
                  if (editorMode === "add") {
                    setTodoItems([...todoItems, editorData]);
                  } else {
                    setTodoItems(todoItems.map((ti) => ti.id === editorData.id ? editorData : ti));
                  }
                }
                setIsEditorOpen(false);
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#DE2626] text-white hover:bg-[#c01f1f] rounded transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
