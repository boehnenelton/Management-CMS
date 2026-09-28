/**
 * Library:         staticBuilder.ts
 * Module Purpose:  Generates a completely pre-rendered, hyper-optimized static website as a ZIP file.
 *                  Supports index.html, individual Page and Post HTML pages, category/tag archives, Atom/RSS/JSON feeds, sitemap, and robots.txt.
 *                  Visual design perfectly mirrors Elton Boehnen's high-contrast black/white/red design system with checkerboard texture.
 */

import JSZip from "jszip";

interface CMSState {
  pages: any[];
  posts: any[];
  categories: any[];
  navLinks: any[];
  tags: any[];
  media: any[];
  settings: Record<string, string>;
}

// Inline CSS style taken from original redesigned Python static builder
const SKELETON_CSS = `:root{--red:#DE2626;--red-hover:#ff3333;--red-light:#ff6b6b;--black:#000;--white:#fff;--gray-darkest:#0a0a0a;--gray-dark:#0f0f0f;--gray-mid:#1a1a1a;--gray-light:#2a2a2a;--tg-300:#d1d5db;--tg-400:#9ca3af;--tg-500:#6b7280;--tg-600:#4b5563;--font-sans:'Inter',sans-serif;--font-display:'Syncopate',sans-serif;--font-mono:'Fira Code',monospace}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--black);color:var(--white);font-family:var(--font-sans);-webkit-font-smoothing:antialiased;display:flex;height:100vh;overflow:hidden;scroll-behavior:smooth}
::selection{background:var(--red);color:var(--white)}
a{text-decoration:none;color:inherit}
button{background:none;border:0;cursor:pointer;color:inherit;font-family:inherit}
::-webkit-scrollbar{width:8px}
::-webkit-scrollbar-track{background:var(--black)}
::-webkit-scrollbar-thumb{background:var(--red);border-radius:4px}
.bg-checkerboard{position:fixed;inset:0;background-image:linear-gradient(45deg,rgba(222,38,38,.03) 25%,transparent 25%,transparent 75%,rgba(222,38,38,.03) 75%,rgba(222,38,38,.03)),linear-gradient(45deg,rgba(222,38,38,.03) 25%,transparent 25%,transparent 75%,rgba(222,38,38,.03) 75%,rgba(222,38,38,.03));background-size:60px 60px;background-position:0 0,30px 30px;pointer-events:none;z-index:0}
.becss-c-mobile-header{display:none;position:absolute;top:0;left:0;width:100%;height:4rem;background:var(--gray-dark);border-bottom:1px solid rgba(222,38,38,.3);z-index:40;align-items:center;justify-content:space-between;padding:0 1rem}
.becss-c-brand-mark{width:2rem;height:2rem;flex-shrink:0}
.becss-c-hamburger{display:flex;color:var(--white);font-size:1.4rem;line-height:1;padding:.25rem .5rem}
.becss-c-sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(4px);z-index:40;opacity:0;transition:opacity .3s ease}
.becss-c-sidebar{width:18rem;background:var(--gray-dark);border-right:1px solid rgba(222,38,38,.2);display:flex;flex-direction:column;position:fixed;left:0;top:0;height:100%;z-index:50;transform:translateX(-100%);transition:transform .3s ease-in-out;flex-shrink:0}
.becss-c-sidebar-header{height:6rem;display:flex;align-items:center;gap:1rem;padding:0 2rem;border-bottom:1px solid rgba(222,38,38,.1)}
.becss-c-brand-title{font-family:var(--font-display);font-weight:700;letter-spacing:.1em;font-size:1.25rem;color:var(--white)}
.becss-c-close-btn{display:block;position:absolute;right:1rem;color:var(--tg-400);font-size:1.25rem}
.becss-c-close-btn:hover{color:var(--white)}
.becss-c-sidebar-nav{flex:1;overflow-y:auto;padding:2rem 1.5rem;display:flex;flex-direction:column;gap:.15rem}
.becss-c-nav{list-style:none;display:flex;flex-direction:column;gap:.15rem;margin:0;padding:0}
.becss-c-nav__item{list-style:none}
.becss-c-nav__link{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;border-radius:.5rem;color:var(--tg-300);transition:background-color .2s,color .2s;position:relative}
.becss-c-nav__link::before{content:'';position:absolute;left:-1rem;top:50%;transform:translateY(-50%);width:4px;height:0;background:var(--red);transition:height .2s ease}
.becss-c-nav__link:hover{color:var(--white);background:rgba(255,255,255,.05)}
.becss-c-nav__link:hover::before{height:70%}
.becss-c-nav__submenu{list-style:none;margin:.15rem 0 .15rem 1rem;padding:0;display:flex;flex-direction:column;gap:.1rem}
.becss-c-sidebar-footer{padding:1.5rem;border-top:1px solid rgba(222,38,38,.1);font-size:.75rem;color:var(--tg-500);display:flex;flex-direction:column;gap:.5rem}
.becss-c-status-dot{width:.5rem;height:.5rem;border-radius:50%;background:var(--red);animation:becss-pulse 2s infinite;display:inline-block}
@keyframes becss-pulse{0%,100%{opacity:1}50%{opacity:.4}}
.becss-c-main-content{flex:1;height:100%;overflow-y:auto;position:relative;padding-top:4rem}
.becss-c-content-container{position:relative;z-index:10;max-width:56rem;margin:0 auto;padding:3rem 1.5rem}
.becss-c-breadcrumbs{display:flex;align-items:center;gap:.5rem;font-size:.875rem;color:var(--tg-400);font-family:var(--font-mono);margin-bottom:1.5rem;flex-wrap:wrap}
.becss-c-breadcrumbs a:hover{color:var(--white)}
.becss-c-page-title{font-family:var(--font-display);font-size:2.25rem;font-weight:700;letter-spacing:-0.025em;line-height:1.2;margin-bottom:.75rem;color:var(--white)}
.becss-c-page-subtitle{color:var(--tg-400);font-size:1rem;line-height:1.6;max-width:42rem}
.becss-c-hero{padding:0 0 2rem;margin-bottom:2rem;border-bottom:1px solid rgba(255,255,255,.08)}
.becss-c-hero__title{font-family:var(--font-display);font-size:2.5rem;font-weight:700;letter-spacing:-.025em;margin:0 0 .5rem;background:linear-gradient(to right,var(--white),var(--tg-300));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.becss-c-hero__tagline{font-size:1.05rem;color:var(--tg-400);margin:0}
.becss-c-feed{display:flex;flex-direction:column;gap:1.25rem;margin-bottom:1rem}
.becss-c-feed__card{display:block;background:var(--gray-mid);border:1px solid rgba(255,255,255,.1);border-radius:1rem;padding:1.75rem;transition:all .3s ease;position:relative}
.becss-c-feed__card:hover{border-color:rgba(222,38,38,.5);transform:translateY(-4px);box-shadow:0 10px 30px -10px rgba(222,38,38,.2)}
.becss-c-feed__title{font-family:var(--font-display);font-size:1.2rem;font-weight:700;margin:0 0 .6rem;transition:color .3s}
.becss-c-feed__title a{color:var(--white)}
.becss-c-feed__card:hover .becss-c-feed__title a{color:var(--red)}
.becss-c-feed__meta{font-family:var(--font-mono);font-size:.8rem;color:var(--tg-400);margin-bottom:.75rem}
.becss-c-feed__excerpt{margin:0;color:var(--tg-400);font-size:.92rem;line-height:1.6}
.becss-c-feed__empty{color:var(--tg-500);font-style:italic}
.becss-c-pagination{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.1);font-family:var(--font-mono);font-size:.875rem}
.becss-c-pagination__link{display:flex;align-items:center;justify-content:center;min-width:2.5rem;height:2.5rem;padding:0 .6rem;border-radius:.5rem;border:1px solid rgba(255,255,255,.15);color:var(--tg-400);transition:all .2s}
.becss-c-pagination__link:hover{border-color:rgba(222,38,38,.5);color:var(--white);background:rgba(255,255,255,.05)}
.becss-c-pagination__link--active{background:var(--red);border-color:var(--red);color:var(--white);font-weight:700;box-shadow:0 0 15px rgba(222,38,38,.4)}
.becss-c-main article,.becss-c-main>p,.becss-c-main>ul,.becss-c-main>ol{color:var(--tg-300)}
.becss-c-main h1{font-family:var(--font-display);font-size:2.25rem;font-weight:700;letter-spacing:-.025em;margin-bottom:1rem;color:var(--white)}
.becss-c-main h2{font-family:var(--font-display);font-size:1.4rem;font-weight:700;margin:2.5rem 0 1rem;padding-bottom:.5rem;border-bottom:1px solid rgba(222,38,38,.2);color:var(--white)}
.becss-c-main h3{font-family:var(--font-sans);font-size:1.15rem;font-weight:600;margin:1.75rem 0 .75rem;color:var(--white)}
.becss-c-main p{margin-bottom:1.25rem;line-height:1.7;color:var(--tg-300)}
.becss-c-main ul,.becss-c-main ol{margin:0 0 1.5rem;padding-left:1.5rem;color:var(--tg-300);line-height:1.7}
.becss-c-main ul{list-style:none;padding-left:.5rem}
.becss-c-main ul li{position:relative;padding-left:1.5rem;margin-bottom:.5rem}
.becss-c-main ul li::before{content:'\\25a0';position:absolute;left:0;top:.15rem;font-size:.6rem;color:var(--red)}
.becss-c-main strong{color:var(--white);font-weight:600}
.becss-c-main a{color:var(--red)}
.becss-c-main a:hover{color:var(--red-hover)}
.becss-c-main code{font-family:var(--font-mono);background:rgba(255,255,255,.1);color:var(--white);padding:.15rem .3rem;border-radius:.25rem;font-size:.85em}
.becss-c-main pre{margin:1.5rem 0;padding:1.5rem;overflow-x:auto;font-family:var(--font-mono);font-size:.875rem;line-height:1.6;background:var(--gray-darkest);border:1px solid var(--gray-light);border-radius:.75rem}
.becss-c-main pre code{background:none;padding:0}
.becss-c-main img{max-width:100%;border-radius:.5rem;margin:1rem 0}
.becss-c-post-meta{font-family:var(--font-mono);font-size:.875rem;color:var(--tg-400);margin-bottom:1.5rem;display:flex;gap:1rem;flex-wrap:wrap}
.becss-c-tags{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.08)}
.becss-c-tags a{color:var(--white);background:rgba(255,255,255,.1);padding:.3rem .6rem;border-radius:.25rem;text-transform:uppercase;letter-spacing:.05em;font-size:.7rem;font-family:var(--font-mono)}
.becss-c-tags a:hover{background:rgba(222,38,38,.2);color:var(--red)}
.becss-c-site-footer{padding:2.5rem 0 1.5rem;margin-top:2.5rem;border-top:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:.4rem;color:var(--tg-500);font-size:.8rem}
.becss-c-site-footer .becss-c-credit{opacity:.7}
.becss-c-site-footer .becss-c-credit a{color:var(--tg-400)}
.becss-c-site-footer .becss-c-credit a:hover{color:var(--red)}
@media(min-width:768px){.becss-c-site-footer{flex-direction:row;justify-content:space-between}}
@media(min-width:1024px){.becss-c-mobile-header{display:none}.becss-c-main-content{padding-top:0}.becss-c-sidebar{position:relative;transform:translateX(0)!important}.becss-c-sidebar-overlay{display:none!important}.becss-c-close-btn{display:none!important}.becss-c-page-title{font-size:2.75rem}}
@media(max-width:1023px){.becss-c-mobile-header{display:flex}}.becss-c-feed__card--with-thumb{display:flex;gap:1.25rem;align-items:flex-start}.becss-c-feed__thumb-link{flex-shrink:0;display:block;width:9rem;height:6rem;border-radius:.6rem;overflow:hidden}.becss-c-feed__thumb{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s ease}.becss-c-feed__card--with-thumb:hover .becss-c-feed__thumb{transform:scale(1.05)}.becss-c-feed__card-body{flex:1;min-width:0}@media(max-width:480px){.becss-c-feed__card--with-thumb{flex-direction:column}.becss-c-feed__thumb-link{width:100%;height:10rem}}.becss-c-post-featured-image{width:100%;max-height:22rem;object-fit:cover;border-radius:.75rem;margin-bottom:1.5rem;display:block}.becss-c-nav-group{margin-top:1.25rem}
.becss-c-nav-group:first-child{margin-top:0}
.becss-c-nav-group__label{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.4rem 1rem;font-family:var(--font-mono);font-size:.7rem;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:var(--tg-500);cursor:pointer;user-select:none;border-radius:.4rem;transition:color .2s,background-color .2s}
.becss-c-nav-group__label:hover{color:var(--tg-300);background:rgba(255,255,255,.04)}
.becss-c-nav-group__chevron{display:inline-block;font-size:.6rem;transition:transform .25s ease;color:var(--red);flex-shrink:0}
.becss-c-nav-group--collapsed .becss-c-nav-group__chevron{transform:rotate(-90deg)}
.becss-c-nav-group>.becss-c-nav{max-height:60rem;overflow:hidden;transition:max-height .3s ease,opacity .25s ease;opacity:1}
.becss-c-nav-group--collapsed>.becss-c-nav{max-height:0;opacity:0;pointer-events:none}.becss-c-video-embed{position:relative;width:100%;padding-top:56.25%;border-radius:.75rem;overflow:hidden;margin-bottom:1.5rem;background:var(--gray-darkest)}
.becss-c-video-embed__frame{position:absolute;inset:0;width:100%;height:100%;border:0}
.becss-c-feed__thumb-link{position:relative}
.becss-c-feed__play-badge{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:2.5rem;height:2.5rem;border-radius:50%;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;pointer-events:none;transition:background-color .2s,transform .2s}
.becss-c-feed__play-badge::after{content:'';border-style:solid;border-width:.5rem 0 .5rem .8rem;border-color:transparent transparent transparent var(--white);margin-left:.15rem}
.becss-c-feed__card--with-thumb:hover .becss-c-feed__play-badge{background:var(--red);transform:translate(-50%,-50%) scale(1.08)}.becss-c-toc{background:var(--gray-mid);border:1px solid rgba(255,255,255,.1);border-radius:.75rem;padding:1.25rem 1.5rem;margin:0 0 2rem}
.becss-c-toc__label{display:block;font-family:var(--font-mono);font-size:.7rem;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:var(--red);margin-bottom:.6rem}
.becss-c-toc__list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.35rem}
.becss-c-toc__item a{color:var(--tg-300);font-size:.9rem;line-height:1.4}
.becss-c-toc__item a:hover{color:var(--white)}
.becss-c-toc__item--sub{margin-left:1.25rem;font-size:.85rem}
.becss-c-related-posts{margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.08)}
.becss-c-related-posts__heading{font-family:var(--font-display);font-size:1.1rem;font-weight:700;margin-bottom:1.25rem;color:var(--white)}.becss-c-404{text-align:center;padding:4rem 1rem}
.becss-c-404__code{font-family:var(--font-display);font-size:6rem;font-weight:700;line-height:1;color:var(--red);opacity:.85;margin-bottom:.5rem}
.becss-c-404 .becss-c-page-title{margin-bottom:.75rem}
.becss-c-404 .becss-c-page-subtitle{margin:0 auto 2rem;max-width:28rem}
.becss-c-404 .becss-c-404__home-link{display:inline-block;padding:.75rem 1.75rem;border-radius:.5rem;background:var(--red);color:var(--white);font-weight:600;transition:background-color .2s,transform .2s}
.becss-c-404 .becss-c-404__home-link:hover{background:var(--red-hover);transform:translateY(-2px)}`;

const SKELETON_START = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`;

function makeHead(title: string, description: string, canonicalUrl: string, ogType = "website"): string {
  return `${SKELETON_START}<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index,follow">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Ccircle cx='50' cy='50' r='32' fill='%23DE2626'/%3E%3C/svg%3E">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Management CMS">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonicalUrl}">
<link rel="canonical" href="${canonicalUrl}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&family=Inter:wght@300;400;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
<style>${SKELETON_CSS}</style></head><body>`;
}

function makeHeader(siteTitle: string): string {
  return `<header class="becss-c-mobile-header">
  <svg class="becss-c-brand-mark" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15L80 32.5V67.5L50 85L20 67.5V32.5L50 15Z" fill="#DE2626" fill-opacity=".15" stroke="#DE2626" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 50L80 32.5M50 50L20 32.5M50 50V85" stroke="#DE2626" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <button class="becss-c-hamburger" id="becssMenuBtn" aria-label="Open menu">&#9776;</button>
</header>
<div class="becss-c-sidebar-overlay" id="becssOverlay"></div>`;
}

function makeSidebar(siteTitle: string, navHtml: string): string {
  return `<aside class="becss-c-sidebar" id="becssSidebar">
  <a href="/index.html" class="becss-c-sidebar-header">
    <svg class="becss-c-brand-mark" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15L80 32.5V67.5L50 85L20 67.5V32.5L50 15Z" fill="#DE2626" fill-opacity=".15" stroke="#DE2626" stroke-width="5" stroke-linejoin="round"/>
      <path d="M50 50L80 32.5M50 50L20 32.5M50 50V85" stroke="#DE2626" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="becss-c-brand-title">${siteTitle}</span>
    <button class="becss-c-close-btn" id="becssCloseBtn" aria-label="Close menu">&times;</button>
  </a>
  <nav class="becss-c-sidebar-nav">
    ${navHtml}
  </nav>
  <div class="becss-c-sidebar-footer">
    <span><span class="becss-c-status-dot"></span> Live</span>
  </div>
</aside>`;
}

function makeFooter(footerText: string, currentYear: number): string {
  const extra = footerText ? ` · ${footerText}` : "";
  return `<footer class="becss-c-site-footer">
  <span>&copy; ${currentYear} Management CMS${extra}</span>
  <span class="becss-c-credit">Built with Management_CMS</span>
</footer>`;
}

function makeScripts(): string {
  return `<script>
function _navGroupToggle(labelEl){
  var group=labelEl.closest('.becss-c-nav-group');
  if(group) group.classList.toggle('becss-c-nav-group--collapsed');
}
document.addEventListener('DOMContentLoaded',function(){
  var sidebar=document.getElementById('becssSidebar'),
      overlay=document.getElementById('becssOverlay'),
      menuBtn=document.getElementById('becssMenuBtn'),
      closeBtn=document.getElementById('becssCloseBtn'),
      open=false;
  function toggle(){
    open=!open;
    if(open){
      sidebar.style.transform='translateX(0)';
      overlay.style.display='block';
      setTimeout(function(){ overlay.style.opacity='1'; },10);
    }else{
      sidebar.style.transform='translateX(-100%)';
      overlay.style.opacity='0';
      setTimeout(function(){ overlay.style.display='none'; },300);
    }
  }
  if (menuBtn) menuBtn.addEventListener('click',toggle);
  if (closeBtn) closeBtn.addEventListener('click',toggle);
  if (overlay) overlay.addEventListener('click',toggle);
  window.addEventListener('resize',function(){
    if(window.innerWidth>=1024 && sidebar){
      sidebar.style.transform='';
      if(overlay){ overlay.style.display='none'; overlay.style.opacity='0'; }
      open=false;
    }
  });
});
</script></body></html>`;
}

/**
 * Builds the Site Navigation Sidebar HTML
 */
function buildNavigation(state: CMSState): string {
  const activeLinks = state.navLinks.filter((l) => l.nav_active !== false);
  
  // Base Links (from NavLinks)
  let html = `<ul class="becss-c-nav">`;
  activeLinks.forEach((link) => {
    html += `<li class="becss-c-nav__item">
      <a href="${link.nav_url}" class="becss-c-nav__link">${link.nav_label}</a>
    </li>`;
  });
  html += `</ul>`;

  // Categories Section (Post)
  const postCategories = state.categories.filter((c) => c.category_type === "post");
  if (postCategories.length > 0) {
    html += `<div class="becss-c-nav-group">
      <span class="becss-c-nav-group__label" onclick="_navGroupToggle(this)">Post Categories<span class="becss-c-nav-group__chevron">&#9662;</span></span>
      <ul class="becss-c-nav">`;
    postCategories.forEach((c) => {
      html += `<li class="becss-c-nav__item">
        <a href="/post-category/${c.slug}.html" class="becss-c-nav__link">${c.title}</a>
      </li>`;
    });
    html += `  </ul>
    </div>`;
  }

  // Categories Section (Page)
  const pageCategories = state.categories.filter((c) => c.category_type === "page");
  if (pageCategories.length > 0) {
    html += `<div class="becss-c-nav-group">
      <span class="becss-c-nav-group__label" onclick="_navGroupToggle(this)">Page Categories<span class="becss-c-nav-group__chevron">&#9662;</span></span>
      <ul class="becss-c-nav">`;
    pageCategories.forEach((c) => {
      html += `<li class="becss-c-nav__item">
        <a href="/page-category/${c.slug}.html" class="becss-c-nav__link">${c.title}</a>
      </li>`;
    });
    html += `  </ul>
    </div>`;
  }

  // Recent Posts
  const recentPosts = state.posts
    .filter((p) => p.status === "published")
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 5);

  if (recentPosts.length > 0) {
    html += `<div class="becss-c-nav-group">
      <span class="becss-c-nav-group__label" onclick="_navGroupToggle(this)">Recent Posts<span class="becss-c-nav-group__chevron">&#9662;</span></span>
      <ul class="becss-c-nav">`;
    recentPosts.forEach((p) => {
      html += `<li class="becss-c-nav__item">
        <a href="/post/${p.slug}.html" class="becss-c-nav__link">${p.title}</a>
      </li>`;
    });
    html += `  </ul>
    </div>`;
  }

  return html;
}

/**
 * Strips HTML tags for excerpt generation
 */
function generateExcerpt(htmlContent: string, maxLen = 160): string {
  const plainText = htmlContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plainText.length <= maxLen) return plainText;
  return plainText.slice(0, maxLen).trim() + " \u2026";
}

/**
 * Main Static Site Builder Entry
 */
export async function buildStaticSite(state: CMSState): Promise<Blob> {
  const zip = new JSZip();

  const siteTitle = state.settings.site_title || "Management CMS";
  const siteTagline = state.settings.site_subtitle || "CMS Static Build";
  const footerText = state.settings.footer_text || "";
  const currentYear = new Date().getFullYear();

  const navHtml = buildNavigation(state);

  // Helper to wrap pages in our BEM layout shell
  const wrapLayout = (title: string, content: string, breadcrumbsHtml = "", ogType = "website") => {
    let html = makeHead(`${title} \u2014 ${siteTitle}`, siteTagline, "/", ogType);
    html += makeHeader(siteTitle);
    html += makeSidebar(siteTitle, navHtml);
    html += `<main class="becss-c-main-content">
      <div class="bg-checkerboard"></div>
      <div class="becss-c-content-container">
        ${breadcrumbsHtml}
        <main class="becss-c-main">
          ${content}
        </main>
        ${makeFooter(footerText, currentYear)}
      </div>
    </main>`;
    html += makeScripts();
    return html;
  };

  // 1. INDEX / HOMEPAGE
  const publishedPosts = state.posts
    .filter((p) => p.status === "published")
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  let homeFeedHtml = `<div class="becss-c-hero">
    <h1 class="becss-c-hero__title">${siteTitle}</h1>
    <p class="becss-c-hero__tagline">${siteTagline}</p>
  </div>
  <div class="becss-c-feed">`;

  if (publishedPosts.length === 0) {
    homeFeedHtml += `<p class="becss-c-feed__empty">No posts published yet.</p>`;
  } else {
    publishedPosts.forEach((post) => {
      const excerpt = post.excerpt || generateExcerpt(post.content_html || "");
      const thumbSrc = post.featured_image || "/media/1000754777.webp";
      const isYoutube = post.featured_image?.includes("youtube.com") || post.featured_image?.includes("youtu.be");
      
      const thumbBlock = post.featured_image ? `
        <a href="/post/${post.slug}.html" class="becss-c-feed__thumb-link">
          <img class="becss-c-feed__thumb" src="${thumbSrc}" alt="${post.title}" loading="lazy">
          ${isYoutube ? `<span class="becss-c-feed__play-badge"></span>` : ""}
        </a>
      ` : "";

      homeFeedHtml += `<article class="becss-c-feed__card ${post.featured_image ? "becss-c-feed__card--with-thumb" : ""}">
        ${thumbBlock}
        <div class="becss-c-feed__card-body">
          <h2 class="becss-c-feed__title"><a href="/post/${post.slug}.html">${post.title}</a></h2>
          <div class="becss-c-feed__meta">${new Date(post.published_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          <p class="becss-c-feed__excerpt">${excerpt}</p>
        </div>
      </article>`;
    });
  }
  homeFeedHtml += `</div>`;

  zip.file("index.html", wrapLayout(siteTitle, homeFeedHtml));

  // 2. PAGES
  state.pages.forEach((page) => {
    if (page.status !== "published") return;

    const breadcrumbs = `<nav class="becss-c-breadcrumbs">
      <a href="/index.html">Home</a><span>/</span><span style="color:var(--white)">${page.title}</span>
    </nav>`;

    const pageContent = `<h1 class="becss-c-page-title">${page.title}</h1>
    <div>${page.content_html}</div>`;

    zip.file(`${page.slug}.html`, wrapLayout(page.title, pageContent, breadcrumbs));
  });

  // 3. POSTS (Articles)
  publishedPosts.forEach((post) => {
    const breadcrumbs = `<nav class="becss-c-breadcrumbs">
      <a href="/index.html">Home</a><span>/</span><a href="/post-category/Developer-Post-Category.html">Posts</a><span>/</span><span style="color:var(--white)">${post.title}</span>
    </nav>`;

    const categoryObj = state.categories.find((c) => c.id === post.category_id_fk);
    const categoryName = categoryObj ? categoryObj.title : "Uncategorized";

    const isYoutube = post.featured_image?.includes("youtube.com") || post.featured_image?.includes("youtu.be");
    let mediaBlock = "";

    if (post.featured_image) {
      if (isYoutube) {
        // Embed YouTube video
        let vidId = "";
        try {
          const m = post.featured_image.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
          vidId = m ? m[1] : "";
        } catch(e) {}
        if (vidId) {
          mediaBlock = `<div class="becss-c-video-embed">
            <iframe class="becss-c-video-embed__frame" src="https://www.youtube.com/embed/${vidId}" allowfullscreen></iframe>
          </div>`;
        }
      } else {
        mediaBlock = `<img class="becss-c-post-featured-image" src="${post.featured_image}" alt="${post.title}">`;
      }
    }

    // Auto-TOC Generation if h2/h3 count >= 2
    let contentWithIds = post.content_html || "";
    const headings: Array<{ id: string; text: string; tag: string }> = [];
    
    // Simple tag parsing to inject ids
    let headingCounter = 1;
    contentWithIds = contentWithIds.replace(/<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi, (match: string, tag: string, attrs: string, text: string) => {
      const cleanText = text.replace(/<[^>]+>/g, "").trim();
      const hId = `heading-${headingCounter++}`;
      headings.push({ id: hId, text: cleanText, tag: tag.toLowerCase() });
      return `<${tag}${attrs} id="${hId}">${text}</${tag}>`;
    });

    let tocHtml = "";
    if (headings.length >= 2) {
      tocHtml = `<nav class="becss-c-toc">
        <span class="becss-c-toc__label">Table of Contents</span>
        <ul class="becss-c-toc__list">
          ${headings.map(h => `<li class="becss-c-toc__item ${h.tag === "h3" ? "becss-c-toc__item--sub" : ""}"><a href="#${h.id}">&rarr; ${h.text}</a></li>`).join("")}
        </ul>
      </nav>`;
    }

    // Related Posts
    const related = publishedPosts
      .filter((p) => p.id !== post.id && p.category_id_fk === post.category_id_fk)
      .slice(0, 3);

    let relatedHtml = "";
    if (related.length > 0) {
      relatedHtml = `<div class="becss-c-related-posts">
        <h3 class="becss-c-related-posts__heading">Related Articles</h3>
        <div class="becss-c-feed">
          ${related.map(p => {
            const excerpt = p.excerpt || generateExcerpt(p.content_html || "");
            return `<article class="becss-c-feed__card">
              <h4 class="becss-c-feed__title"><a href="/post/${p.slug}.html">${p.title}</a></h4>
              <p class="becss-c-feed__excerpt">${excerpt}</p>
            </article>`;
          }).join("")}
        </div>
      </div>`;
    }

    const postContent = `<h1 class="becss-c-page-title">${post.title}</h1>
    <div class="becss-c-post-meta">
      <span>By ${post.author || "Administrator"}</span>
      <span>·</span>
      <span>${new Date(post.published_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      <span>·</span>
      <span>Filed under ${categoryName}</span>
    </div>
    ${mediaBlock}
    ${tocHtml}
    <div class="becss-c-article-body">${contentWithIds}</div>
    ${relatedHtml}`;

    zip.file(`post/${post.slug}.html`, wrapLayout(post.title, postContent, breadcrumbs, "article"));
  });

  // 4. CATEGORY ARCHIVES (Post & Page)
  state.categories.forEach((cat) => {
    const isPost = cat.category_type === "post";
    const filteredItems = isPost
      ? publishedPosts.filter((p) => p.category_id_fk === cat.id)
      : state.pages.filter((p) => p.category_id_fk === cat.id && p.status === "published");

    const breadcrumbs = `<nav class="becss-c-breadcrumbs">
      <a href="/index.html">Home</a><span>/</span><span>Categories</span><span>/</span><span style="color:var(--white)">${cat.title}</span>
    </nav>`;

    let catFeedHtml = `<h1 class="becss-c-page-title">${cat.title}</h1>
    <p class="becss-c-page-subtitle">${cat.description || "Category Archive"}</p>
    <div class="becss-c-feed">`;

    if (filteredItems.length === 0) {
      catFeedHtml += `<p class="becss-c-feed__empty">No items filed under this category yet.</p>`;
    } else {
      filteredItems.forEach((item) => {
        const excerpt = item.excerpt || generateExcerpt(item.content_html || "");
        const linkHref = isPost ? `/post/${item.slug}.html` : `/${item.slug}.html`;
        
        catFeedHtml += `<article class="becss-c-feed__card">
          <h2 class="becss-c-feed__title"><a href="${linkHref}">${item.title || item.slug}</a></h2>
          <p class="becss-c-feed__excerpt">${excerpt}</p>
        </article>`;
      });
    }
    catFeedHtml += `</div>`;

    const folder = isPost ? "post-category" : "page-category";
    zip.file(`${folder}/${cat.slug}.html`, wrapLayout(cat.title, catFeedHtml, breadcrumbs));
  });

  // 5. 404 PAGE
  const error404Content = `<div class="becss-c-404">
    <div class="becss-c-404__code">404</div>
    <h1 class="becss-c-page-title">Page Not Found</h1>
    <p class="becss-c-page-subtitle">The page you're looking for doesn't exist or may have moved.</p>
    <a href="/index.html" class="becss-c-404__home-link">&larr; Back to Home</a>
  </div>`;
  zip.file("404.html", wrapLayout("Page Not Found", error404Content));

  // 6. ROBOTS.TXT & SITEMAP.XML
  zip.file("robots.txt", `User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n`);

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  sitemapXml += `  <url>\n    <loc>/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  
  state.pages.forEach((p) => {
    if (p.status === "published") {
      sitemapXml += `  <url>\n    <loc>/${p.slug}.html</loc>\n    <lastmod>${p.updated_at ? p.updated_at.slice(0, 10) : new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }
  });

  publishedPosts.forEach((p) => {
    sitemapXml += `  <url>\n    <loc>/post/${p.slug}.html</loc>\n    <lastmod>${p.updated_at ? p.updated_at.slice(0, 10) : new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  });

  sitemapXml += `</urlset>`;
  zip.file("sitemap.xml", sitemapXml);

  // 7. FEEDS (JSON Feed 1.1)
  const feedJson = {
    version: "https://jsonfeed.org/version/1.1",
    title: siteTitle,
    description: siteTagline,
    home_page_url: "/",
    feed_url: "/feed.json",
    items: publishedPosts.map(p => ({
      id: p.slug,
      url: `/post/${p.slug}.html`,
      title: p.title,
      content_html: p.content_html,
      date_published: p.published_at,
      date_modified: p.updated_at || p.published_at,
      author: { name: p.author || "Administrator" }
    }))
  };
  zip.file("feed.json", JSON.stringify(feedJson, null, 2));

  // Generate real ZIP Blob
  return await zip.generateAsync({ type: "blob" });
}
