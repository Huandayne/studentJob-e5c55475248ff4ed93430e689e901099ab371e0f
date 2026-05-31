/**
 * Logic trang chủ — tìm kiếm nhanh và danh sách việc gợi ý.
 */
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("home");
  renderRecentJobs();
  setupHeroSearch();
});

function setupHeroSearch() {
  const form = document.getElementById("hero-search-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("hero-keyword")?.value.trim() || "";
    const base = getBasePath();
    const url = q
      ? `${base}pages/jobs.html?q=${encodeURIComponent(q)}`
      : `${base}pages/jobs.html`;
    window.location.href = url;
  });
}

function renderRecentJobs() {
  const list = document.getElementById("recent-jobs-list");
  if (!list) return;

  const recent = getAllJobs().slice(0, 3);

  if (recent.length === 0) {
    list.innerHTML = `
      <p class="empty-recent" style="color:var(--text-muted);margin:0">
        Chưa có tin tuyển dụng. Doanh nghiệp có thể đăng tin sau khi đăng nhập.
      </p>
    `;
    return;
  }

  list.innerHTML = recent
    .map(
      (job) => `
    <a class="job-preview" href="${getJobDetailHref(job.id)}">
      <div>
        <div class="title">${escapeHtml(job.title)}</div>
        <div class="meta">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</div>
      </div>
      <span class="badge">${escapeHtml(job.type)}</span>
    </a>
  `
    )
    .join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
