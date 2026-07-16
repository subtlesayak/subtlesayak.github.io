import { PortfolioRepository, fileToBase64 } from "./cms-github.js";
import { buildProjectFiles, prepareCover, prepareImage, suggestedCardLabel, categoryLabel, folderName, slugify } from "./project.js";
import {
  CONTENT_PATHS, cleanLines, joinLines, parseProject, serializeProject, parseProfile, serializeProfile,
  parseArticle, serializeArticle, parsePhotographyEntry, serializePhotographyEntry, formatBytes, escapeHtml
} from "./contracts.js";

const STORAGE = { token: "pilgrimAdminToken", session: "pilgrimAdminSessionToken", repository: "pilgrimAdminRepository", branch: "pilgrimAdminBranch" };
const SECTIONS = [
  ["overview", "Overview", "icon-eye"], ["projects", "Projects", "icon-folder"], ["photography", "Photography", "icon-image"],
  ["articles", "Articles", "icon-folder"], ["about", "About", "icon-settings"], ["assets", "Media & resume", "icon-image"],
  ["publishing", "Publishing", "icon-rocket"], ["settings", "Settings", "icon-settings"]
];
const state = { repo: null, section: "overview", data: {}, projects: [], articles: [], photography: [], commits: [], dragId: null };
const $ = id => document.getElementById(id);
const connectForm = $("connect-form");
const connectMessage = $("connect-message");
$("repository").value = localStorage.getItem(STORAGE.repository) || $("repository").value;
$("branch").value = localStorage.getItem(STORAGE.branch) || $("branch").value;

connectForm.addEventListener("submit", event => {
  event.preventDefault();
  connect({ repository: $("repository").value.trim(), branch: $("branch").value.trim(), token: $("token").value.trim(), remember: $("remember-token").checked });
});

async function connect(credentials, silent = false) {
  const button = connectForm.querySelector("button[type='submit']");
  button.disabled = true;
  connectMessage.textContent = silent ? "Restoring secure session…" : "Checking repository access…";
  try {
    const repo = new PortfolioRepository(credentials);
    await repo.verify();
    await Promise.all([repo.getText(CONTENT_PATHS.projects), repo.getText("JS/projects.js")]).catch(() => { throw new Error("This repository does not match the Pilgrim portfolio structure."); });
    state.repo = repo;
    localStorage.setItem(STORAGE.repository, repo.repository);
    localStorage.setItem(STORAGE.branch, repo.branch);
    sessionStorage.setItem(STORAGE.session, credentials.token);
    if (credentials.remember) localStorage.setItem(STORAGE.token, credentials.token); else localStorage.removeItem(STORAGE.token);
    await loadAll();
    mountCms();
  } catch (error) {
    connectMessage.textContent = friendlyError(error);
  } finally { button.disabled = false; }
}

async function loadAll() {
  showBusy("Loading portfolio", "Reading the current content from GitHub…", 15);
  try {
    const entries = await Promise.all(Object.entries(CONTENT_PATHS).map(async ([key, path]) => [key, await state.repo.getText(path, "")]));
    state.data = Object.fromEntries(entries);
    await Promise.all([loadProjects(), loadArticles(), loadPhotography(), loadCommits()]);
  } finally { hideBusy(); }
}

async function loadProjects() {
  const selected = new Set(cleanLines(state.data.selectedWork));
  state.projects = (await Promise.all(cleanLines(state.data.projects).map(async folder => {
    const base = `Projects/${folder}`;
    try {
      const [description, categories, card, stats, media] = await Promise.all([
        state.repo.getText(`${base}/description.txt`), state.repo.getText(`${base}/categories.txt`, "other\n"),
        state.repo.getText(`${base}/card.txt`, ""), state.repo.getText(`${base}/stats.txt`, ""), state.repo.getText(`${base}/media.txt`, "")
      ]);
      return { ...parseProject({ folder, description, categories, card, stats, media }), selected: selected.has(folder) };
    } catch { return null; }
  }))).filter(Boolean);
}

async function loadArticles() {
  state.articles = (await Promise.all(cleanLines(state.data.articles).map(async folder => {
    try { return parseArticle(folder, await state.repo.getText(`Articles/${folder}/article.txt`), await state.repo.getText(`Articles/${folder}/author-note.txt`, "")); }
    catch { return null; }
  }))).filter(Boolean);
}

async function loadPhotography() {
  state.photography = (await Promise.all(cleanLines(state.data.photographyCollections).map(async folder => {
    const base = folder === "." ? "Projects/Photography" : `Projects/Photography/Collections/${folder}`;
    try { return parsePhotographyEntry(folder, await state.repo.getText(`${base}/entry.txt`), await state.repo.getText(`${base}/media.txt`, "")); }
    catch { return null; }
  }))).filter(Boolean);
}

async function loadCommits() {
  try { state.commits = await state.repo.listCommits(30); } catch { state.commits = []; }
}

function mountCms() {
  $("connect-screen").hidden = true;
  const shell = $("app-shell");
  shell.hidden = false;
  shell.replaceChildren();
  shell.className = "cms-shell";
  shell.innerHTML = `${sidebarHtml()}<main class="cms-main"><header class="cms-topbar"><div class="cms-mobile-title"><span class="brand-mark">P</span><strong id="mobile-section-title">Overview</strong></div><div class="cms-repo"><svg><use href="#icon-github"></use></svg><strong class="repo-name">${escapeHtml(state.repo.repository)}</strong><span>Branch</span><strong>${escapeHtml(state.repo.branch)}</strong><span class="sync">Synced</span></div><a class="button button-quiet" href="https://subtlesayak.github.io/" target="_blank" rel="noopener noreferrer">View site <svg><use href="#icon-external"></use></svg></a></header><section class="cms-content" id="cms-content"></section></main>${bottomNavHtml()}<div class="drawer-backdrop" id="drawer-backdrop"></div><aside class="editor-drawer" id="editor-drawer" aria-hidden="true"></aside><div class="toast" id="cms-toast" role="status"></div><div class="busy-cover" id="cms-busy"><div class="busy-card"><h2 id="busy-title">Publishing</h2><p id="busy-detail"></p><div class="busy-progress"><span id="busy-progress"></span></div></div></div>`;
  bindNavigation();
  $("drawer-backdrop").addEventListener("click", closeDrawer);
  renderSection(state.section);
}

function sidebarHtml() {
  return `<aside class="cms-sidebar"><div class="cms-brand"><span class="brand-mark">P</span><span>Pilgrim Studio</span></div><nav class="cms-nav">${SECTIONS.map(([id,label,icon]) => `<button type="button" data-section="${id}"><svg><use href="#${icon}"></use></svg><span>${label}</span></button>`).join("")}</nav><div class="cms-account"><span>Repository</span><strong>${escapeHtml(state.repo.repository)}</strong><span>${escapeHtml(state.repo.branch)}</span></div></aside>`;
}

function bottomNavHtml() {
  const visible = SECTIONS.filter(([id]) => ["overview","projects","assets","publishing","settings"].includes(id));
  return `<nav class="cms-bottom-nav">${visible.map(([id,label,icon]) => `<button type="button" data-section="${id}"><svg><use href="#${icon}"></use></svg><span>${label === "Media & resume" ? "Media" : label}</span></button>`).join("")}</nav>`;
}

function bindNavigation() {
  document.querySelectorAll("[data-section]").forEach(button => button.addEventListener("click", () => renderSection(button.dataset.section)));
}

function renderSection(section) {
  state.section = section;
  document.querySelectorAll("[data-section]").forEach(button => button.classList.toggle("is-active", button.dataset.section === section));
  const label = SECTIONS.find(([id]) => id === section)?.[1] || "Portfolio";
  if ($("mobile-section-title")) $("mobile-section-title").textContent = label;
  closeDrawer();
  ({ overview: renderOverview, projects: renderProjects, photography: renderPhotography, articles: renderArticles, about: renderAbout, assets: renderAssets, publishing: renderPublishing, settings: renderSettings }[section] || renderOverview)();
}

function heading(title, description, action = "") {
  return `<div class="cms-heading"><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${action}</div>`;
}

function renderOverview() {
  const content = $("cms-content");
  content.innerHTML = `${heading("Overview", "Everything published from this repository, in one place.", `<button class="button button-primary" data-go="projects"><svg><use href="#icon-plus"></use></svg><span>New project</span></button>`)}<div class="overview-grid"><div class="overview-stat"><strong>${state.projects.length}</strong><span>Portfolio projects</span></div><div class="overview-stat"><strong>${state.photography.length}</strong><span>Photo collections</span></div><div class="overview-stat"><strong>${state.articles.length}</strong><span>Articles</span></div><div class="overview-stat"><strong>${state.commits.length}</strong><span>Recent versions</span></div></div><div class="overview-sections"><section class="cms-panel"><div class="panel-head"><h2>Manage content</h2></div><div class="quick-list">${[["projects","Projects and selected work"],["photography","Photography collections"],["articles","Articles and writing"],["about","Profile and About page"]].map(([id,label]) => `<button data-go="${id}"><span>${label}</span><span>→</span></button>`).join("")}</div></section><section class="cms-panel"><div class="panel-head"><h2>Latest version</h2></div><div class="quick-list">${state.commits.slice(0,3).map(commit => `<button data-go="publishing"><span>${escapeHtml(commit.commit.message.split("\n")[0])}</span><code>${commit.sha.slice(0,7)}</code></button>`).join("") || `<button data-go="publishing"><span>No history loaded</span><span>→</span></button>`}</div></section></div>`;
  content.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => renderSection(button.dataset.go)));
}

function renderProjects() {
  const content = $("cms-content");
  content.innerHTML = `${heading("Projects", "Create, edit, feature, reorder, or remove portfolio projects.", `<button class="button button-primary" id="new-project"><svg><use href="#icon-plus"></use></svg><span>New project</span></button>`)}<div class="cms-toolbar"><input id="project-search" placeholder="Search projects…"><select id="project-filter"><option value="">All categories</option><option value="uiux">UI/UX</option><option value="branding">Branding</option><option value="web">Web</option><option value="visual-design">Visual Design</option><option value="photography">Photography</option><option value="other">Other</option></select></div><div class="content-list" id="project-list"></div>`;
  $("new-project").addEventListener("click", () => openProjectEditor(null));
  $("project-search").addEventListener("input", drawProjectRows);
  $("project-filter").addEventListener("change", drawProjectRows);
  drawProjectRows();
}

function drawProjectRows() {
  const list = $("project-list"); if (!list) return;
  const query = $("project-search").value.toLowerCase(); const filter = $("project-filter").value;
  const items = state.projects.filter(project => (!query || `${project.title} ${project.cardContext}`.toLowerCase().includes(query)) && (!filter || project.category === filter));
  list.innerHTML = items.length ? items.map(project => `<div class="content-row" draggable="true" data-id="${escapeHtml(project.id)}"><span class="row-handle">⠿</span><div class="row-primary"><img src="${rawUrl(project.cover)}" alt=""><strong>${escapeHtml(project.title)}</strong></div><span>${escapeHtml(categoryLabel(project.category))}</span><span>${escapeHtml(project.year || "—")}</span><div class="row-actions"><button class="icon-button ${project.selected ? "is-selected" : ""}" data-feature="${escapeHtml(project.id)}" title="Toggle selected work">★</button><button class="icon-button primary-action" data-edit="${escapeHtml(project.id)}" title="Edit"><svg><use href="#icon-settings"></use></svg></button></div></div>`).join("") : `<div class="empty-list">No matching projects.</div>`;
  list.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => openProjectEditor(state.projects.find(item => item.id === button.dataset.edit))));
  list.querySelectorAll("[data-feature]").forEach(button => button.addEventListener("click", () => toggleSelected(button.dataset.feature)));
  bindReorder(list, state.projects, CONTENT_PATHS.projects, "Reorder portfolio projects");
}

function openProjectEditor(project) {
  const isNew = !project;
  const value = project || { title:"", description:"", tags:"", category:"uiux", year:String(new Date().getFullYear()), role:"Designer", cardLabel:"Case Study", cardContext:"", media:"", selected:false, cover:"", stats:"" };
  openDrawer(`${isNew ? "New" : "Edit"} project`, isNew ? "Create a complete portfolio entry." : `Editing ${value.folder}`, `<form id="project-editor"><div class="drawer-body"><div class="cms-form-grid"><label class="cms-field wide">Title<input name="title" required value="${escapeHtml(value.title)}"></label><label class="cms-field">Category<select name="category">${categoryOptions(value.category)}</select></label><label class="cms-field">Year<input name="year" value="${escapeHtml(value.year)}"></label><label class="cms-field wide">Short description<textarea name="description" required>${escapeHtml(value.description)}</textarea></label><label class="cms-field wide">Tools and tags<input name="tags" value="${escapeHtml(value.tags)}"></label><label class="cms-field">Role<input name="role" value="${escapeHtml(value.role)}"></label><label class="cms-field">Card label<input name="cardLabel" value="${escapeHtml(value.cardLabel)}"></label><label class="cms-field wide">Card context<textarea name="cardContext">${escapeHtml(value.cardContext)}</textarea></label></div><div class="form-section"><span class="form-section-title">Cover image</span>${value.cover ? `<div class="remote-cover"><img src="${rawUrl(value.cover)}" alt="Current cover"><label class="asset-action"><strong>Replace cover</strong><input name="cover" type="file" accept="image/*"></label></div>` : `<label class="upload-box"><span><strong>Choose cover image</strong><small>Required for a new project</small></span><input name="cover" type="file" accept="image/*" hidden></label>`}</div><div class="form-section"><label class="cms-field wide">Gallery and external media<textarea name="media" rows="8" placeholder="One existing path or external URL per line">${escapeHtml(value.media)}</textarea></label><label class="upload-box"><span><strong>Add gallery images</strong><small>New images are appended as compressed WebP files</small></span><input name="gallery" type="file" accept="image/*" multiple hidden></label></div><label class="cms-check"><input name="selected" type="checkbox" ${value.selected ? "checked" : ""}><span>Feature in selected work</span></label></div><footer class="drawer-footer">${isNew ? "" : `<button type="button" class="danger-link" id="delete-project">Delete project</button>`}<button type="button" class="button button-quiet" data-close>Cancel</button><button type="submit" class="button button-primary">${isNew ? "Create & publish" : "Save & publish"}</button></footer></form>`);
  $("project-editor").addEventListener("submit", event => saveProject(event, project));
  if (!isNew) $("delete-project").addEventListener("click", () => deleteProject(project));
}

async function saveProject(event, existing) {
  event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form));
  try {
    let files = []; let title = data.title.trim();
    if (!existing) {
      if (await state.repo.pathExists(`Projects/${folderName(title)}`)) throw new Error("A project folder with this title already exists.");
      const coverFile = form.elements.cover.files[0]; if (!coverFile) throw new Error("Choose a cover image.");
      const cover = await prepareCover(coverFile); const gallery = [];
      for (const file of Array.from(form.elements.gallery.files).slice(0,12)) gallery.push(await prepareImage(file, gallery.length + 1));
      const built = buildProjectFiles({ title, description:data.description, tags:data.tags, category:data.category, year:data.year, role:data.role, cardLabel:data.cardLabel, mediaUrls:data.media, selectedWork:Boolean(data.selected), cover, gallery });
      files = built.files;
      files.push({ path:CONTENT_PATHS.projects, content:joinLines([...cleanLines(state.data.projects), built.folder]) });
      if (data.selected) files.push({ path:CONTENT_PATHS.selectedWork, content:joinLines([...cleanLines(state.data.selectedWork), built.folder]) });
    } else {
      const next = { ...existing, title, description:data.description, tags:data.tags, category:data.category, year:data.year, role:data.role, cardLabel:data.cardLabel, cardContext:data.cardContext || data.description, media:data.media, selected:Boolean(data.selected) };
      const base = `Projects/${existing.folder}`; const galleryFiles = Array.from(form.elements.gallery.files).slice(0,12);
      const coverFile = form.elements.cover.files[0];
      if (coverFile) { const cover = await prepareCover(coverFile); next.cover = `${base}/assets/cover.webp`; files.push({ path:`${base}/assets/cover.webp`, content:cover.base64, encoding:"base64" }); }
      const media = cleanLines(next.media); let imageIndex = media.filter(line => /^assets\/image-/.test(line)).length;
      for (const file of galleryFiles) { const image = await prepareImage(file, ++imageIndex); media.push(`assets/${image.name}`); files.push({ path:`${base}/assets/${image.name}`, content:image.base64, encoding:"base64" }); }
      next.media = media.join("\n"); next.stats = [next.role && `Role: ${next.role}`, next.year && `Timeline: ${next.year}`, `Category: ${categoryLabel(next.category)}`, next.tags && `Tools: ${next.tags}`].filter(Boolean).join("\n") + "\n";
      const serialized = serializeProject(next);
      files.push({path:`${base}/description.txt`,content:serialized.description},{path:`${base}/categories.txt`,content:serialized.categories},{path:`${base}/card.txt`,content:serialized.card},{path:`${base}/stats.txt`,content:serialized.stats},{path:`${base}/media.txt`,content:serialized.media});
      files.push({ path:CONTENT_PATHS.selectedWork, content:updateMembership(state.data.selectedWork, existing.folder, Boolean(data.selected)) });
    }
    await publish(files, `${existing ? "Update" : "Add"} portfolio project: ${title}`); closeDrawer(); await refresh("projects");
  } catch (error) { toast(friendlyError(error), true); }
}

async function toggleSelected(id) {
  const project = state.projects.find(item => item.id === id); if (!project) return;
  await publish([{path:CONTENT_PATHS.selectedWork,content:updateMembership(state.data.selectedWork,id,!project.selected)}], `${project.selected ? "Remove" : "Add"} selected work: ${project.title}`);
  await refresh("projects");
}

async function deleteProject(project) {
  if (!confirm(`Delete “${project.title}” and its uploaded files? Git history will still retain the previous version.`)) return;
  const paths = await state.repo.filesUnder(`Projects/${project.folder}`);
  const projects = cleanLines(state.data.projects).filter(item => item !== project.folder); const selected = cleanLines(state.data.selectedWork).filter(item => item !== project.folder);
  await publish([...paths.map(path => ({path,delete:true})),{path:CONTENT_PATHS.projects,content:joinLines(projects)},{path:CONTENT_PATHS.selectedWork,content:joinLines(selected)}], `Delete portfolio project: ${project.title}`);
  closeDrawer(); await refresh("projects");
}

function renderArticles() {
  const content=$("cms-content"); content.innerHTML=`${heading("Articles","Create, edit, reorder, or remove long-form writing.",`<button class="button button-primary" id="new-article"><svg><use href="#icon-plus"></use></svg><span>New article</span></button>`)}<div class="content-list" id="article-list">${state.articles.map(article=>simpleRow(article.id,article.title,article.date,"Article")).join("")||`<div class="empty-list">No articles yet.</div>`}</div>`;
  $("new-article").addEventListener("click",()=>openArticleEditor(null)); bindSimpleEditors("article-list",state.articles,openArticleEditor); bindReorder($("article-list"),state.articles,CONTENT_PATHS.articles,"Reorder articles");
}

function openArticleEditor(article) {
  const value=article||{title:"",date:"",summary:"",body:"",authorNote:""};
  openDrawer(article?"Edit article":"New article",article?`Editing ${article.folder}`:"Write and publish a new article.",`<form id="article-editor"><div class="drawer-body"><div class="cms-form-grid"><label class="cms-field wide">Title<input name="title" required value="${escapeHtml(value.title)}"></label><label class="cms-field wide">Date<input name="date" value="${escapeHtml(value.date)}" placeholder="July 2026"></label><label class="cms-field wide">Card summary<textarea name="summary" required>${escapeHtml(value.summary)}</textarea></label><label class="cms-field wide">Article body<textarea name="body" rows="18" required>${escapeHtml(value.body)}</textarea></label><label class="cms-field wide">Author note<textarea name="authorNote">${escapeHtml(value.authorNote)}</textarea></label></div></div><footer class="drawer-footer">${article?`<button type="button" class="danger-link" id="delete-article">Delete article</button>`:""}<button type="button" class="button button-quiet" data-close>Cancel</button><button class="button button-primary" type="submit">Save & publish</button></footer></form>`);
  $("article-editor").addEventListener("submit",event=>saveArticle(event,article)); if(article) $("delete-article").addEventListener("click",()=>deleteFolderItem(article,"Articles",CONTENT_PATHS.articles,"article"));
}

async function saveArticle(event,existing) {
  event.preventDefault(); const data=Object.fromEntries(new FormData(event.currentTarget)); const folder=existing?.folder||folderName(data.title); const article={...data,folder};
  if(!existing&&await state.repo.pathExists(`Articles/${folder}`)) throw new Error("An article folder with this title already exists.");
  const files=[{path:`Articles/${folder}/article.txt`,content:serializeArticle(article)},{path:`Articles/${folder}/author-note.txt`,content:data.authorNote.trim()+"\n"}];
  if(!existing) files.push({path:CONTENT_PATHS.articles,content:joinLines([...cleanLines(state.data.articles),folder])});
  await publish(files,`${existing?"Update":"Add"} article: ${data.title}`); closeDrawer(); await refresh("articles");
}

function renderPhotography() {
  const content=$("cms-content"); content.innerHTML=`${heading("Photography","Manage event and shoot collections with captions and ordered images.",`<button class="button button-primary" id="new-photo"><svg><use href="#icon-plus"></use></svg><span>New collection</span></button>`)}<div class="content-list" id="photo-list">${state.photography.map(item=>simpleRow(item.id,item.title,item.date,item.location||"Photography")).join("")||`<div class="empty-list">No collections yet.</div>`}</div>`;
  $("new-photo").addEventListener("click",()=>openPhotographyEditor(null)); bindSimpleEditors("photo-list",state.photography,openPhotographyEditor); bindReorder($("photo-list"),state.photography,CONTENT_PATHS.photographyCollections,"Reorder photography collections");
}

function openPhotographyEditor(collection) {
  const value=collection||{title:"",date:"",location:"",description:"",captions:"",media:""};
  openDrawer(collection?"Edit collection":"New collection",collection?.folder==="."?"Editing the root photography collection":collection?`Editing ${collection.folder}`:"Create a multi-image gallery.",`<form id="photo-editor"><div class="drawer-body"><div class="cms-form-grid"><label class="cms-field wide">Collection title<input name="title" required value="${escapeHtml(value.title)}"></label><label class="cms-field">Date<input name="date" value="${escapeHtml(value.date)}"></label><label class="cms-field">Location<input name="location" value="${escapeHtml(value.location)}"></label><label class="cms-field wide">Context<textarea name="description">${escapeHtml(value.description)}</textarea></label><label class="cms-field wide">Published media filenames<textarea name="media" rows="8">${escapeHtml(value.media)}</textarea></label><label class="cms-field wide">Captions<textarea name="captions" rows="7" placeholder="filename.webp: Caption text">${escapeHtml(value.captions)}</textarea></label></div><label class="upload-box"><span><strong>Add photographs</strong><small>Images are compressed to WebP and thumbnails are created</small></span><input name="photos" type="file" accept="image/*" multiple hidden></label></div><footer class="drawer-footer">${collection&&collection.folder!=="."?`<button type="button" class="danger-link" id="delete-photo">Delete collection</button>`:""}<button type="button" class="button button-quiet" data-close>Cancel</button><button class="button button-primary" type="submit">Save & publish</button></footer></form>`);
  $("photo-editor").addEventListener("submit",event=>savePhotography(event,collection)); if(collection&&collection.folder!==".") $("delete-photo").addEventListener("click",()=>deleteFolderItem(collection,"Projects/Photography/Collections",CONTENT_PATHS.photographyCollections,"photography collection"));
}

async function savePhotography(event,existing) {
  event.preventDefault(); const form=event.currentTarget; const data=Object.fromEntries(new FormData(form)); const folder=existing?.folder||folderName(data.title); const base=folder==="."?"Projects/Photography":`Projects/Photography/Collections/${folder}`; const media=cleanLines(data.media); const files=[];
  if(!existing&&await state.repo.pathExists(base)) throw new Error("A photography collection with this title already exists.");
  for(const file of Array.from(form.elements.photos.files)){ const image=await prepareImage(file,media.length+1,{maxDimension:2400,quality:.88}); media.push(image.name); files.push({path:`${base}/${image.name}`,content:image.base64,encoding:"base64"},{path:`${base}/thumbs/${image.name}`,content:image.base64,encoding:"base64"}); }
  const collection={...data,folder,media:media.join("\n")}; files.push({path:`${base}/entry.txt`,content:serializePhotographyEntry(collection)},{path:`${base}/media.txt`,content:joinLines(media)});
  if(!existing) files.push({path:CONTENT_PATHS.photographyCollections,content:joinLines([...cleanLines(state.data.photographyCollections),folder])});
  await publish(files,`${existing?"Update":"Add"} photography collection: ${data.title}`); closeDrawer(); await refresh("photography");
}

function renderAbout() {
  const profile=parseProfile(state.data.profile); const content=$("cms-content");
  content.innerHTML=`${heading("About","Edit profile identity, biography, skills, recommendations, education, and experience.")}<form id="about-form" class="settings-stack"><section class="settings-section"><h2>Profile identity</h2><p>Name, role, location, introduction, and social/contact links.</p><div class="cms-form-grid"><label class="cms-field">Name<input name="name" value="${escapeHtml(profile.name)}"></label><label class="cms-field">Role<input name="role" value="${escapeHtml(profile.role)}"></label><label class="cms-field wide">Location<input name="location" value="${escapeHtml(profile.location)}"></label><label class="cms-field wide">Short introduction<textarea name="intro">${escapeHtml(profile.intro)}</textarea></label><label class="cms-field wide">Social links and email<textarea name="socials" rows="7">${escapeHtml(profile.socials)}</textarea></label></div></section><section class="settings-section"><h2>Summary and capabilities</h2><p>One item per line for skills and software.</p><div class="cms-form-grid"><label class="cms-field wide">Summary<textarea name="summary" rows="7">${escapeHtml(state.data.summary)}</textarea></label><label class="cms-field">Skills<textarea name="skills" rows="14">${escapeHtml(state.data.skills)}</textarea></label><label class="cms-field">Software<textarea name="software" rows="14">${escapeHtml(state.data.software)}</textarea></label></div></section><section class="settings-section"><h2>Recommendations</h2><p>Records are separated by --- and use name, optional avatar URL, position, date, and quote.</p><label class="cms-field"><textarea name="recommendations" rows="12">${escapeHtml(state.data.recommendations)}</textarea></label></section><section class="settings-section"><h2>Experience, education, projects, and certificates</h2><p>Records are separated by --- and preserve the existing five-line-plus format.</p><label class="cms-field"><textarea name="productions" rows="22">${escapeHtml(state.data.productions)}</textarea></label></section><div class="cms-actions"><button class="button button-primary" type="submit">Save & publish About</button></div></form>`;
  $("about-form").addEventListener("submit",async event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));const next={...profile,name:data.name,role:data.role,location:data.location,intro:data.intro,socials:data.socials};await publish([{path:CONTENT_PATHS.profile,content:serializeProfile(next)},{path:CONTENT_PATHS.summary,content:data.summary.trim()+"\n"},{path:CONTENT_PATHS.skills,content:joinLines(cleanLines(data.skills))},{path:CONTENT_PATHS.software,content:joinLines(cleanLines(data.software))},{path:CONTENT_PATHS.recommendations,content:data.recommendations.trim()+(data.recommendations.trim()?"\n":"")},{path:CONTENT_PATHS.productions,content:data.productions.trim()+(data.productions.trim()?"\n":"")}],"Update About page content");await refresh("about");});
}

async function renderAssets() {
  const content=$("cms-content"); const profile=parseProfile(state.data.profile); content.innerHTML=heading("Media & resume","Replace profile assets and publish newer résumé versions safely.")+`<div class="asset-layout"><div class="settings-stack"><section class="settings-section"><h2>Profile portrait</h2><p>Used across the portfolio and project pages.</p><div class="profile-asset"><img src="${rawUrl(profile.profilePath)}" alt="Current portrait"><div><strong>Current portrait</strong><p>${escapeHtml(profile.profilePath)}</p><label class="button button-quiet">Replace portrait<input id="portrait-file" type="file" accept="image/jpeg" hidden></label></div></div></section><section class="settings-section"><h2>Résumé</h2><p>Old PDFs remain recoverable in Git history.</p><div class="file-row"><span class="file-icon">PDF</span><div class="file-meta"><strong>sayak-sajith-resume.pdf</strong><span id="resume-meta">Current published résumé</span></div><label class="button button-primary">Upload newer version<input id="resume-file" type="file" accept="application/pdf" hidden></label></div></section><section class="settings-section"><h2>Favicon</h2><p>Replace the shared PNG favicon.</p><div class="file-row"><span class="file-icon">PNG</span><div class="file-meta"><strong>pilfav.png</strong><span>Resources/favicon/pilfav.png</span></div><label class="button button-quiet">Replace<input id="favicon-file" type="file" accept="image/png" hidden></label></div></section></div><section class="cms-panel"><div class="panel-head"><h2>Recent versions</h2></div><div class="quick-list">${state.commits.slice(0,6).map(commit=>`<button data-go="publishing"><span>${escapeHtml(commit.commit.message.split("\n")[0])}</span><code>${commit.sha.slice(0,7)}</code></button>`).join("")}</div></section></div>`;
  content.querySelectorAll("[data-go]").forEach(button=>button.addEventListener("click",()=>renderSection(button.dataset.go)));
  bindAssetInput("portrait-file","Resources/profile/sayak-profile.jpg","Update profile portrait",["image/jpeg"]); bindAssetInput("resume-file","Resources/resume/sayak-sajith-resume.pdf","Update résumé",["application/pdf"],20*1024*1024); bindAssetInput("favicon-file","Resources/favicon/pilfav.png","Update portfolio favicon",["image/png"]);
  state.repo.getBinary("Resources/resume/sayak-sajith-resume.pdf",null).then(file=>{if(file&&$("resume-meta")) $("resume-meta").textContent=`${formatBytes(file.size)} · ${file.path}`;}).catch(()=>{});
}

function bindAssetInput(id,path,message,types,maxSize=8*1024*1024) {
  $(id).addEventListener("change",async event=>{const file=event.target.files[0];if(!file)return;if(!types.includes(file.type))return toast(`Choose a ${types.join(" or ")} file.`,true);if(file.size>maxSize)return toast(`File is too large. Maximum ${formatBytes(maxSize)}.`,true);await publish([{path,content:await fileToBase64(file),encoding:"base64"}],`${message}: ${file.name}`);toast(`${file.name} published.`);await refresh("assets");});
}

function renderSettings() {
  const content=$("cms-content"); content.innerHTML=`${heading("Settings","Manage site information, reusable lists, discovery files, and repository connection.")}<form id="settings-form" class="settings-stack"><section class="settings-section"><h2>Site information</h2><p>Displayed as the last-updated line on portfolio sections.</p><label class="cms-field"><input name="site" value="${escapeHtml(state.data.site.trim())}"></label></section><section class="settings-section"><h2>Categories and ordering</h2><p>Categories use slug | label | description. Project names are one per line.</p><div class="cms-form-grid"><label class="cms-field">Categories<textarea name="categories" rows="10">${escapeHtml(state.data.categories)}</textarea></label><label class="cms-field">Selected-work order<textarea name="selected" rows="10">${escapeHtml(state.data.selectedWork)}</textarea></label></div></section><section class="settings-section"><h2>Code projects</h2><p>Edit the complete Projects-page record list. Records remain separated by ---.</p><label class="cms-field"><textarea name="codeProjects" rows="16">${escapeHtml(state.data.codeProjects)}</textarea></label></section><section class="settings-section"><h2>SEO and discovery files</h2><p>Advanced: edit robots, LLM overview, and XML sitemap source directly.</p><div class="cms-form-grid"><label class="cms-field">robots.txt<textarea name="robots" rows="10">${escapeHtml(state.data.robots)}</textarea></label><label class="cms-field">llms.txt<textarea name="llms" rows="10">${escapeHtml(state.data.llms)}</textarea></label><label class="cms-field wide">sitemap.xml<textarea name="sitemap" rows="14">${escapeHtml(state.data.sitemap)}</textarea></label></div></section><div class="cms-actions"><button class="button button-primary" type="submit">Save & publish settings</button><button class="button button-danger" id="disconnect" type="button">Disconnect this device</button></div></form>`;
  $("settings-form").addEventListener("submit",async event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));await publish([{path:CONTENT_PATHS.site,content:data.site.trim()+"\n"},{path:CONTENT_PATHS.categories,content:data.categories.trim()+"\n"},{path:CONTENT_PATHS.selectedWork,content:data.selected.trim()+"\n"},{path:CONTENT_PATHS.codeProjects,content:data.codeProjects.trim()+"\n"},{path:CONTENT_PATHS.robots,content:data.robots.trim()+"\n"},{path:CONTENT_PATHS.llms,content:data.llms.trim()+"\n"},{path:CONTENT_PATHS.sitemap,content:data.sitemap.trim()+"\n"}],"Update portfolio settings and discovery files");await refresh("settings");});
  $("disconnect").addEventListener("click",()=>{sessionStorage.removeItem(STORAGE.session);localStorage.removeItem(STORAGE.token);location.reload();});
}

function renderPublishing() {
  const content=$("cms-content"); content.innerHTML=`${heading("Publishing history","Review recent versions and restore a previous site state without rewriting history.",`<button class="button button-quiet" id="refresh-history">Refresh</button>`)}<div class="history-list">${state.commits.map((commit,index)=>`<div class="history-row ${index===0?"is-current":""}"><div class="history-message"><strong>${escapeHtml(commit.commit.message.split("\n")[0])}</strong><code>${commit.sha.slice(0,7)}${index===0?" · Current":""}</code></div><div class="history-meta">${escapeHtml(commit.commit.author?.name||"")}<br>${new Date(commit.commit.author?.date||Date.now()).toLocaleString()}</div><div class="history-actions">${index===0?`<a class="icon-button" href="${escapeHtml(commit.html_url)}" target="_blank" rel="noopener noreferrer"><svg><use href="#icon-external"></use></svg></a>`:`<button class="button button-small" data-restore="${commit.sha}">Restore</button>`}</div></div>`).join("")||`<div class="empty-list">No commit history available.</div>`}</div>`;
  $("refresh-history").addEventListener("click",async()=>{await loadCommits();renderPublishing();}); content.querySelectorAll("[data-restore]").forEach(button=>button.addEventListener("click",()=>restoreVersion(button.dataset.restore)));
}

async function restoreVersion(sha) {
  const commit=state.commits.find(item=>item.sha===sha); if(!commit)return;
  if(!confirm(`Restore the complete portfolio to ${sha.slice(0,7)} (“${commit.commit.message.split("\n")[0]}”)? A new restore commit will be created; existing history will not be erased.`))return;
  showBusy("Restoring version","Creating a new history-preserving restore commit…",15);
  try{await state.repo.restoreCommit(sha,updateBusy);toast("Previous version restored and deployment started.");await loadAll();renderPublishing();}catch(error){toast(friendlyError(error),true);}finally{hideBusy();}
}

function simpleRow(id,title,meta,type) { return `<div class="content-row" draggable="true" data-id="${escapeHtml(id)}"><span class="row-handle">⠿</span><div class="row-primary"><span class="file-icon">${escapeHtml(type.slice(0,3).toUpperCase())}</span><strong>${escapeHtml(title)}</strong></div><span>${escapeHtml(meta||"—")}</span><span>${escapeHtml(type)}</span><div class="row-actions"><button class="icon-button primary-action" data-edit="${escapeHtml(id)}"><svg><use href="#icon-settings"></use></svg></button></div></div>`; }
function bindSimpleEditors(listId,items,handler){$(listId).querySelectorAll("[data-edit]").forEach(button=>button.addEventListener("click",()=>handler(items.find(item=>item.id===button.dataset.edit))));}

function bindReorder(container,items,path,message) {
  if(!container)return; container.querySelectorAll("[draggable='true']").forEach(row=>{row.addEventListener("dragstart",()=>{state.dragId=row.dataset.id;row.classList.add("is-dragging");});row.addEventListener("dragend",()=>row.classList.remove("is-dragging"));row.addEventListener("dragover",event=>event.preventDefault());row.addEventListener("drop",async event=>{event.preventDefault();const source=items.findIndex(item=>item.id===state.dragId),target=items.findIndex(item=>item.id===row.dataset.id);if(source<0||target<0||source===target)return;const next=[...items];const[moved]=next.splice(source,1);next.splice(target,0,moved);await publish([{path,content:joinLines(next.map(item=>item.id))}],message);await refresh(state.section);});});
}

async function deleteFolderItem(item,root,configPath,label) {
  if(!confirm(`Delete “${item.title}”? Git history will retain the previous version.`))return;const paths=await state.repo.filesUnder(`${root}/${item.folder}`);const next=cleanLines(state.data[configKey(configPath)]).filter(name=>name!==item.folder);await publish([...paths.map(path=>({path,delete:true})),{path:configPath,content:joinLines(next)}],`Delete ${label}: ${item.title}`);closeDrawer();await refresh(state.section);
}

function configKey(path){return Object.entries(CONTENT_PATHS).find(([,value])=>value===path)?.[0]||"";}
function categoryOptions(selected){return [["uiux","UI/UX"],["branding","Branding"],["web","Web"],["visual-design","Visual Design"],["photography","Photography"],["other","Other"]].map(([value,label])=>`<option value="${value}" ${selected===value?"selected":""}>${label}</option>`).join("");}
function updateMembership(text,name,include){const lines=cleanLines(text).filter(item=>item!==name);if(include)lines.push(name);return joinLines(lines);}

function openDrawer(title,subtitle,content) {
  const drawer=$("editor-drawer");drawer.innerHTML=`<header class="drawer-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div><button class="icon-button" data-close aria-label="Close">×</button></header>${content}`;drawer.classList.add("is-open");drawer.setAttribute("aria-hidden","false");$("drawer-backdrop").classList.add("is-open");drawer.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",closeDrawer));
}
function closeDrawer(){const drawer=$("editor-drawer");if(!drawer)return;drawer.classList.remove("is-open");drawer.setAttribute("aria-hidden","true");$("drawer-backdrop")?.classList.remove("is-open");}

async function publish(files,message) {
  showBusy("Publishing changes",message,8);try{const commit=await state.repo.publishChanges(files,message,updateBusy);toast(`Published ${commit.sha.slice(0,7)}. GitHub Pages deployment started.`);return commit;}catch(error){toast(friendlyError(error),true);throw error;}finally{hideBusy();}
}
async function refresh(section=state.section){await loadAll();renderSection(section);}
function showBusy(title,detail,progress=8){const busy=$("cms-busy");if(!busy)return;$("busy-title").textContent=title;$("busy-detail").textContent=detail;$("busy-progress").style.width=`${progress}%`;busy.classList.add("is-visible");}
function updateBusy(step,progress){if($("busy-progress"))$("busy-progress").style.width=`${progress}%`;if($("busy-detail"))$("busy-detail").textContent={validate:"Validating repository state…",media:"Preparing files and media…",commit:"Creating atomic Git commit…",deploy:"Updating the publishing branch…",done:"Deployment started."}[step]||"Working…";}
function hideBusy(){$("cms-busy")?.classList.remove("is-visible");}
function toast(message,error=false){const item=$("cms-toast");if(!item){console[error?"error":"log"](message);return;}item.textContent=message;item.classList.toggle("is-error",error);item.classList.add("is-visible");clearTimeout(toast.timer);toast.timer=setTimeout(()=>item.classList.remove("is-visible"),4200);}
function rawUrl(path){if(!path)return"";if(/^https?:\/\//i.test(path))return path;const clean=path.replace(/^\.\.\//,"").replace(/^\//,"");return `https://raw.githubusercontent.com/${state.repo.repository}/${encodeURIComponent(state.repo.branch)}/${clean.split("/").map(encodeURIComponent).join("/")}`;}
function friendlyError(error){if(error?.status===401)return"GitHub rejected this token. Check that it is active and copied completely.";if(error?.status===403)return"This token needs Contents: read and write permission for this repository.";if(error?.status===404)return"The requested repository content was not found.";if(error?.status===409||error?.status===422)return"The publishing branch changed. Refresh and try again.";return error?.message||"Something went wrong.";}

const restored=sessionStorage.getItem(STORAGE.session)||localStorage.getItem(STORAGE.token);
if(restored){$("remember-token").checked=Boolean(localStorage.getItem(STORAGE.token));connect({repository:$("repository").value,branch:$("branch").value,token:restored,remember:$("remember-token").checked},true);}
