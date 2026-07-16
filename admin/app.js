import { GitHubPublisher } from "./github.js";
import {
  addProjectToList,
  addSelectedProject,
  buildProjectFiles,
  categoryLabel,
  folderName,
  prepareCover,
  prepareImage,
  splitTags,
  suggestedCardLabel
} from "./project.js";

const STORAGE = {
  token: "pilgrimAdminToken",
  sessionToken: "pilgrimAdminSessionToken",
  repository: "pilgrimAdminRepository",
  branch: "pilgrimAdminBranch",
  draft: "pilgrimAdminDraft"
};

const state = {
  publisher: null,
  cover: null,
  gallery: [],
  draggedId: null,
  processing: false
};

const element = id => document.getElementById(id);
const refs = {
  connectScreen: element("connect-screen"),
  connectForm: element("connect-form"),
  connectMessage: element("connect-message"),
  repository: element("repository"),
  branch: element("branch"),
  token: element("token"),
  remember: element("remember-token"),
  appShell: element("app-shell"),
  form: element("project-form"),
  title: element("project-title"),
  category: element("category"),
  year: element("year"),
  description: element("description"),
  tags: element("tags"),
  role: element("role"),
  cardLabel: element("card-label"),
  mediaUrls: element("media-urls"),
  selectedWork: element("selected-work"),
  coverInput: element("cover-input"),
  coverDrop: element("cover-drop"),
  coverPreview: element("cover-preview"),
  galleryInput: element("gallery-input"),
  galleryList: element("gallery-list"),
  galleryCount: element("gallery-count"),
  saveDraft: element("save-draft"),
  publishButton: element("publish-button"),
  draftState: element("draft-state"),
  settingsDialog: element("settings-dialog"),
  publishDialog: element("publish-dialog")
};

refs.repository.value = localStorage.getItem(STORAGE.repository) || refs.repository.value;
refs.branch.value = localStorage.getItem(STORAGE.branch) || refs.branch.value;
refs.year.value = String(new Date().getFullYear());

refs.connectForm.addEventListener("submit", async event => {
  event.preventDefault();
  await connect({
    repository: refs.repository.value.trim(),
    branch: refs.branch.value.trim(),
    token: refs.token.value.trim(),
    remember: refs.remember.checked
  });
});

async function connect(credentials, silent = false) {
  refs.connectMessage.textContent = silent ? "Restoring secure session…" : "Checking repository access…";
  const submit = refs.connectForm.querySelector("button[type='submit']");
  submit.disabled = true;
  try {
    const publisher = new GitHubPublisher(credentials);
    await publisher.verify();
    await Promise.all([
      publisher.getText("Config/projects.txt"),
      publisher.getText("JS/projects.js")
    ]).catch(() => {
      throw new Error("This repository does not match the Pilgrim portfolio content structure.");
    });

    state.publisher = publisher;
    localStorage.setItem(STORAGE.repository, publisher.repository);
    localStorage.setItem(STORAGE.branch, publisher.branch);
    sessionStorage.setItem(STORAGE.sessionToken, credentials.token);
    if (credentials.remember) localStorage.setItem(STORAGE.token, credentials.token);
    else localStorage.removeItem(STORAGE.token);
    showEditor();
  } catch (error) {
    refs.connectMessage.textContent = friendlyError(error);
    if (silent) refs.token.value = credentials.token;
  } finally {
    submit.disabled = false;
  }
}

function showEditor() {
  const { repository, branch } = state.publisher;
  refs.connectScreen.hidden = true;
  refs.appShell.hidden = false;
  element("repo-name").textContent = repository;
  element("repo-branch").textContent = branch;
  element("top-repo").textContent = repository;
  element("top-branch").textContent = branch;
  element("settings-repo").textContent = `${repository} · ${branch}`;
  const githubBase = `https://github.com/${repository}`;
  element("github-projects-link").href = `${githubBase}/tree/${encodeURIComponent(branch)}/Projects`;
  element("actions-link").href = `${githubBase}/actions`;
  element("view-github").href = githubBase;
  restoreDraft();
  updatePreview();
}

const editorInputs = [refs.title, refs.category, refs.year, refs.description, refs.tags, refs.role, refs.cardLabel, refs.mediaUrls, refs.selectedWork];
editorInputs.forEach(input => input.addEventListener("input", () => {
  if (input === refs.category && !refs.cardLabel.dataset.edited) refs.cardLabel.value = suggestedCardLabel(refs.category.value);
  if (input === refs.cardLabel) refs.cardLabel.dataset.edited = "true";
  updatePreview();
  scheduleDraft();
}));

refs.coverInput.addEventListener("change", async () => {
  const [file] = refs.coverInput.files;
  if (!file) return;
  await withProcessing(async () => {
    releaseImage(state.cover);
    state.cover = await prepareCover(file);
    refs.coverPreview.src = state.cover.previewUrl;
    refs.coverPreview.hidden = false;
    refs.coverDrop.classList.add("has-image");
    updatePreview();
    setDraftStatus("Cover ready");
  });
});

refs.galleryInput.addEventListener("change", async () => {
  const remaining = 12 - state.gallery.length;
  const files = Array.from(refs.galleryInput.files).slice(0, remaining);
  if (!files.length) return;
  await withProcessing(async () => {
    for (const file of files) {
      const image = await prepareImage(file, state.gallery.length + 1);
      state.gallery.push(image);
      renderGallery();
    }
    setDraftStatus(`${files.length} image${files.length === 1 ? "" : "s"} ready`);
  });
  refs.galleryInput.value = "";
});

function renderGallery() {
  refs.galleryList.replaceChildren();
  refs.galleryCount.textContent = `${state.gallery.length}/12 images`;
  if (!state.gallery.length) {
    const empty = document.createElement("div");
    empty.className = "gallery-empty";
    empty.textContent = "Add project images to build the gallery";
    refs.galleryList.appendChild(empty);
    return;
  }

  state.gallery.forEach(image => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.draggable = true;
    item.dataset.id = image.id;
    const preview = document.createElement("img");
    preview.src = image.previewUrl;
    preview.alt = image.name;
    const grip = document.createElement("span");
    grip.className = "grip";
    grip.appendChild(makeIcon("icon-grip"));
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${image.name}`);
    remove.appendChild(makeIcon("icon-trash"));
    remove.addEventListener("click", () => removeGalleryImage(image.id));
    item.append(preview, grip, remove);
    item.addEventListener("dragstart", () => {
      state.draggedId = image.id;
      item.classList.add("is-dragging");
    });
    item.addEventListener("dragend", () => {
      state.draggedId = null;
      item.classList.remove("is-dragging");
    });
    item.addEventListener("dragover", event => event.preventDefault());
    item.addEventListener("drop", event => {
      event.preventDefault();
      reorderGallery(state.draggedId, image.id);
    });
    refs.galleryList.appendChild(item);
  });
}

function reorderGallery(sourceId, targetId) {
  if (!sourceId || sourceId === targetId) return;
  const sourceIndex = state.gallery.findIndex(image => image.id === sourceId);
  const targetIndex = state.gallery.findIndex(image => image.id === targetId);
  const [moved] = state.gallery.splice(sourceIndex, 1);
  state.gallery.splice(targetIndex, 0, moved);
  state.gallery.forEach((image, index) => { image.name = `image-${String(index + 1).padStart(3, "0")}.webp`; });
  renderGallery();
}

function removeGalleryImage(id) {
  const index = state.gallery.findIndex(image => image.id === id);
  if (index < 0) return;
  releaseImage(state.gallery[index]);
  state.gallery.splice(index, 1);
  state.gallery.forEach((image, itemIndex) => { image.name = `image-${String(itemIndex + 1).padStart(3, "0")}.webp`; });
  renderGallery();
}

function makeIcon(id) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#${id}`);
  svg.appendChild(use);
  return svg;
}

function updatePreview() {
  element("description-count").textContent = refs.description.value.length;
  element("live-title").textContent = refs.title.value.trim() || "Untitled project";
  element("live-category").textContent = categoryLabel(refs.category.value);
  element("live-year").textContent = refs.year.value.trim() || String(new Date().getFullYear());
  element("live-description").textContent = refs.description.value.trim() || "Your project description will appear here.";
  const tags = element("live-tags");
  tags.replaceChildren();
  splitTags(refs.tags.value).slice(0, 5).forEach(tag => {
    const span = document.createElement("span");
    span.textContent = tag;
    tags.appendChild(span);
  });
  const cover = element("live-cover");
  cover.style.backgroundImage = state.cover ? `url("${state.cover.previewUrl}")` : "";
  cover.firstElementChild.hidden = Boolean(state.cover);
}

refs.saveDraft.addEventListener("click", saveDraft);
let draftTimer;
function scheduleDraft() {
  clearTimeout(draftTimer);
  refs.draftState.textContent = "Saving…";
  draftTimer = setTimeout(saveDraft, 550);
}

function draftData() {
  return {
    title: refs.title.value,
    category: refs.category.value,
    year: refs.year.value,
    description: refs.description.value,
    tags: refs.tags.value,
    role: refs.role.value,
    cardLabel: refs.cardLabel.value,
    mediaUrls: refs.mediaUrls.value,
    selectedWork: refs.selectedWork.checked
  };
}

function saveDraft() {
  localStorage.setItem(STORAGE.draft, JSON.stringify(draftData()));
  setDraftStatus("Draft saved locally");
}

function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE.draft));
    if (!draft) return;
    refs.title.value = draft.title || "";
    refs.category.value = draft.category || "uiux";
    refs.year.value = draft.year || refs.year.value;
    refs.description.value = draft.description || "";
    refs.tags.value = draft.tags || "";
    refs.role.value = draft.role || "";
    refs.cardLabel.value = draft.cardLabel || suggestedCardLabel(refs.category.value);
    refs.mediaUrls.value = draft.mediaUrls || "";
    refs.selectedWork.checked = Boolean(draft.selectedWork);
  } catch {
    localStorage.removeItem(STORAGE.draft);
  }
}

function setDraftStatus(message) {
  refs.draftState.textContent = message;
}

refs.form.addEventListener("submit", async event => {
  event.preventDefault();
  if (state.processing) return;
  if (!refs.form.reportValidity()) return;
  if (!state.cover) {
    refs.coverDrop.focus();
    alert("Choose a cover image before publishing.");
    return;
  }
  await publishProject();
});

async function publishProject() {
  state.processing = true;
  refs.publishButton.disabled = true;
  openPublishDialog();
  try {
    const data = {
      ...draftData(),
      cover: state.cover,
      gallery: state.gallery,
      mediaUrls: refs.mediaUrls.value
    };
    const project = buildProjectFiles(data);
    setPublishProgress("validate", 12, "Checking project name and portfolio configuration…");
    if (await state.publisher.pathExists(`Projects/${folderName(data.title)}`)) {
      throw new Error("A project folder with this title already exists. Change the title or edit the existing project on GitHub.");
    }

    const [projectsText, selectedText] = await Promise.all([
      state.publisher.getText("Config/projects.txt"),
      state.publisher.getText("Config/selected-work.txt", "")
    ]);
    project.files.push({ path: "Config/projects.txt", content: addProjectToList(projectsText, project.folder) });
    if (data.selectedWork) project.files.push({ path: "Config/selected-work.txt", content: addSelectedProject(selectedText, project.folder) });

    await state.publisher.publish(
      project.files,
      `Add portfolio project: ${data.title.trim()}`,
      (step, progress) => setPublishProgress(step, progress)
    );
    finishPublish(project.canonicalUrl);
    localStorage.removeItem(STORAGE.draft);
  } catch (error) {
    failPublish(error);
  } finally {
    state.processing = false;
    refs.publishButton.disabled = false;
  }
}

function openPublishDialog() {
  element("publish-title").textContent = "Publishing project";
  element("publish-detail").textContent = "Preparing your portfolio files…";
  element("publish-progress").style.width = "7%";
  element("publish-result").hidden = true;
  Array.from(element("publish-steps").children).forEach(item => item.className = "");
  refs.publishDialog.showModal();
}

function setPublishProgress(step, progress, customDetail = "") {
  const order = ["validate", "media", "commit", "deploy"];
  const details = {
    validate: "Validating the portfolio content contract…",
    media: "Compressing and uploading project media…",
    commit: "Creating one atomic Git commit…",
    deploy: "Updating the publishing branch…",
    done: "GitHub Pages deployment has started."
  };
  element("publish-progress").style.width = `${progress}%`;
  element("publish-detail").textContent = customDetail || details[step] || details.done;
  const activeIndex = step === "done" ? order.length : order.indexOf(step);
  Array.from(element("publish-steps").children).forEach((item, index) => {
    item.className = index < activeIndex ? "is-done" : index === activeIndex ? "is-active" : "";
  });
}

function finishPublish(url) {
  setPublishProgress("done", 100);
  element("publish-title").textContent = "Project published";
  element("publish-detail").textContent = "The commit is live. GitHub Pages usually finishes deployment within a minute or two.";
  element("open-live-project").href = url;
  element("publish-result").hidden = false;
}

function failPublish(error) {
  element("publish-progress").style.width = "100%";
  element("publish-progress").style.background = "var(--danger)";
  element("publish-title").textContent = "Publishing stopped";
  element("publish-detail").textContent = friendlyError(error);
  element("publish-result").hidden = false;
  element("open-live-project").hidden = true;
  element("publish-done").textContent = "Close and review";
}

element("publish-done").addEventListener("click", () => {
  refs.publishDialog.close();
  if (element("publish-title").textContent === "Project published") resetProject();
  element("open-live-project").hidden = false;
  element("publish-done").textContent = "Create another";
  element("publish-progress").style.background = "";
});

function resetProject() {
  refs.form.reset();
  refs.year.value = String(new Date().getFullYear());
  refs.category.value = "uiux";
  refs.cardLabel.value = suggestedCardLabel("uiux");
  releaseImage(state.cover);
  state.gallery.forEach(releaseImage);
  state.cover = null;
  state.gallery = [];
  refs.coverPreview.hidden = true;
  refs.coverPreview.removeAttribute("src");
  refs.coverDrop.classList.remove("has-image");
  renderGallery();
  updatePreview();
}

async function withProcessing(action) {
  if (state.processing) return;
  state.processing = true;
  try { await action(); }
  catch (error) { alert(friendlyError(error)); }
  finally { state.processing = false; }
}

function releaseImage(image) {
  if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
}

function friendlyError(error) {
  if (error?.status === 401) return "GitHub rejected this token. Check that it is active and copied completely.";
  if (error?.status === 403) return "This token is missing permission. Grant Contents: read and write for this repository.";
  if (error?.status === 404) return "Repository or publishing branch not found. Check the owner, repository, and branch names.";
  if (error?.status === 409 || error?.status === 422) return "The branch changed while publishing. Refresh, reconnect, and try again.";
  return error?.message || "Something went wrong. Please try again.";
}

element("open-settings").addEventListener("click", () => refs.settingsDialog.showModal());
element("disconnect-button").addEventListener("click", () => {
  sessionStorage.removeItem(STORAGE.sessionToken);
  localStorage.removeItem(STORAGE.token);
  location.reload();
});

element("open-preview").addEventListener("click", () => {
  document.querySelector(".preview-pane").classList.toggle("is-expanded");
  element("open-preview").textContent = document.querySelector(".preview-pane").classList.contains("is-expanded") ? "Close" : "Expand";
});

renderGallery();
refs.cardLabel.value = suggestedCardLabel(refs.category.value);
updatePreview();

const restoredToken = sessionStorage.getItem(STORAGE.sessionToken) || localStorage.getItem(STORAGE.token);
if (restoredToken) {
  refs.remember.checked = Boolean(localStorage.getItem(STORAGE.token));
  connect({ repository: refs.repository.value, branch: refs.branch.value, token: restoredToken, remember: refs.remember.checked }, true);
}
