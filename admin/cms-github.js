import { GitHubPublisher } from "./github.js";

export class PortfolioRepository extends GitHubPublisher {
  async getFile(path, fallback = null) {
    try {
      const data = await this.request(`/repos/${this.repository}/contents/${encodePath(path)}?ref=${encodeURIComponent(this.branch)}`);
      if (Array.isArray(data)) return data;
      return data;
    } catch (error) {
      if (error.status === 404 && fallback !== null) return fallback;
      throw error;
    }
  }

  async getBinary(path, fallback = null) {
    const file = await this.getFile(path, fallback);
    if (file === fallback) return fallback;
    return { path, name: file.name, size: file.size, sha: file.sha, base64: String(file.content || "").replace(/\n/g, ""), downloadUrl: file.download_url };
  }

  async listCommits(limit = 20) {
    return this.request(`/repos/${this.repository}/commits?sha=${encodeURIComponent(this.branch)}&per_page=${Math.min(limit, 100)}`);
  }

  async listTree(ref = this.branch) {
    const commit = await this.request(`/repos/${this.repository}/git/commits/${encodeURIComponent(ref)}`);
    const tree = await this.request(`/repos/${this.repository}/git/trees/${commit.tree.sha}?recursive=1`);
    return tree.tree || [];
  }

  async filesUnder(prefix) {
    const normalized = prefix.replace(/^\/+|\/+$/g, "") + "/";
    return (await this.listTree()).filter(item => item.type === "blob" && item.path.startsWith(normalized)).map(item => item.path);
  }

  async publishChanges(files, message, onProgress = () => {}) {
    if (!files.length) throw new Error("No content changes to publish.");
    onProgress("validate", 8);
    const refPath = `/repos/${this.repository}/git/ref/heads/${encodeURIComponent(this.branch)}`;
    const ref = await this.request(refPath);
    const parentSha = ref.object.sha;
    const parentCommit = await this.request(`/repos/${this.repository}/git/commits/${parentSha}`);
    const tree = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      if (file.delete) {
        tree.push({ path: file.path, mode: "100644", type: "blob", sha: null });
      } else {
        const blob = await this.request(`/repos/${this.repository}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content: file.content, encoding: file.encoding || "utf-8" })
        });
        tree.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
      }
      onProgress("media", 15 + Math.round(((index + 1) / files.length) * 50));
    }

    onProgress("commit", 70);
    const nextTree = await this.request(`/repos/${this.repository}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree })
    });
    const commit = await this.request(`/repos/${this.repository}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree: nextTree.sha, parents: [parentSha] })
    });
    onProgress("deploy", 88);
    await this.request(`/repos/${this.repository}/git/refs/heads/${encodeURIComponent(this.branch)}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false })
    });
    onProgress("done", 100);
    return commit;
  }

  async restoreCommit(targetSha, onProgress = () => {}) {
    onProgress("validate", 12);
    const [target, currentRef] = await Promise.all([
      this.request(`/repos/${this.repository}/git/commits/${encodeURIComponent(targetSha)}`),
      this.request(`/repos/${this.repository}/git/ref/heads/${encodeURIComponent(this.branch)}`)
    ]);
    const parentSha = currentRef.object.sha;
    if (parentSha === targetSha) throw new Error("This is already the current version.");
    onProgress("commit", 62);
    const commit = await this.request(`/repos/${this.repository}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message: `Restore portfolio to ${targetSha.slice(0, 7)}`, tree: target.tree.sha, parents: [parentSha] })
    });
    onProgress("deploy", 86);
    await this.request(`/repos/${this.repository}/git/refs/heads/${encodeURIComponent(this.branch)}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false })
    });
    onProgress("done", 100);
    return commit;
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(reader.error || new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}
