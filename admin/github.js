const API_ROOT = "https://api.github.com";

export class GitHubPublisher {
  constructor({ repository, branch, token }) {
    const [owner, repo] = repository.split("/");
    if (!owner || !repo) throw new Error("Repository must use the owner/name format.");
    this.owner = owner;
    this.repo = repo;
    this.repository = `${owner}/${repo}`;
    this.branch = branch;
    this.token = token;
  }

  async request(path, options = {}) {
    const response = await fetch(`${API_ROOT}${path}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });

    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || `GitHub request failed (${response.status}).`);
      error.status = response.status;
      error.details = data;
      throw error;
    }
    return data;
  }

  async verify() {
    const repository = await this.request(`/repos/${this.repository}`);
    const permissions = repository.permissions || {};
    if (!permissions.push && !permissions.maintain && !permissions.admin) {
      throw new Error("This token can read the repository but cannot publish to it. Grant Contents: read and write.");
    }
    await this.request(`/repos/${this.repository}/branches/${encodeURIComponent(this.branch)}`);
    return repository;
  }

  async getText(path, fallback = null) {
    try {
      const data = await this.request(`/repos/${this.repository}/contents/${encodePath(path)}?ref=${encodeURIComponent(this.branch)}`);
      if (Array.isArray(data) || typeof data.content !== "string") throw new Error(`Expected a text file at ${path}.`);
      return decodeBase64Utf8(data.content.replace(/\n/g, ""));
    } catch (error) {
      if (error.status === 404 && fallback !== null) return fallback;
      throw error;
    }
  }

  async pathExists(path) {
    try {
      await this.request(`/repos/${this.repository}/contents/${encodePath(path)}?ref=${encodeURIComponent(this.branch)}`);
      return true;
    } catch (error) {
      if (error.status === 404) return false;
      throw error;
    }
  }

  async createBlob(file) {
    const data = await this.request(`/repos/${this.repository}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: file.content, encoding: file.encoding || "utf-8" })
    });
    return data.sha;
  }

  async publish(files, message, onProgress = () => {}) {
    onProgress("validate", 10);
    const refPath = `/repos/${this.repository}/git/ref/heads/${encodeURIComponent(this.branch)}`;
    const ref = await this.request(refPath);
    const parentSha = ref.object.sha;
    const parentCommit = await this.request(`/repos/${this.repository}/git/commits/${parentSha}`);

    onProgress("media", 24);
    const treeElements = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const sha = await this.createBlob(file);
      treeElements.push({ path: file.path, mode: "100644", type: "blob", sha });
      onProgress("media", 24 + Math.round(((index + 1) / files.length) * 40));
    }

    onProgress("commit", 70);
    const tree = await this.request(`/repos/${this.repository}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree: treeElements })
    });
    const commit = await this.request(`/repos/${this.repository}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] })
    });

    onProgress("deploy", 88);
    await this.request(`/repos/${this.repository}/git/refs/heads/${encodeURIComponent(this.branch)}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false })
    });
    onProgress("done", 100);
    return commit;
  }
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function decodeBase64Utf8(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
