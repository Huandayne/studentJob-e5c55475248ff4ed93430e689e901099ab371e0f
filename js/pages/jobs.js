/**
 * Logic trang tìm việc — lọc và hiển thị danh sách.
 */
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("jobs");
  initFiltersFromUrl();
  renderJobList();
  bindFilterEvents();
});

function initFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    const searchInput = document.getElementById("filter-keyword");
    if (searchInput) searchInput.value = q;
  }
}

function bindFilterEvents() {
  const form = document.getElementById("filters-form");
  if (!form) return;

  form.addEventListener("input", renderJobList);
  form.addEventListener("change", renderJobList);
  form.addEventListener("submit", (e) => e.preventDefault());
}

function getFilteredJobs() {
  const keyword =
    document.getElementById("filter-keyword")?.value.trim().toLowerCase() || "";
  const location =
    document.getElementById("filter-location")?.value.trim().toLowerCase() || "";
  const type = document.getElementById("filter-type")?.value || "";

  return getAllJobs().filter((job) => {
    const tags = job.tags || [];
    const matchKeyword =
      !keyword ||
      job.title.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword) ||
      tags.some((t) => t.toLowerCase().includes(keyword));

    const matchLocation =
      !location || job.location.toLowerCase().includes(location);

    const matchType = !type || job.type === type;

    return matchKeyword && matchLocation && matchType;
  });
}

function renderJobList() {
  const container = document.getElementById("job-list");
  const countEl = document.getElementById("results-count");
  if (!container) return;

  const jobs = getFilteredJobs();

  if (countEl) {
    countEl.textContent = `Tìm thấy ${jobs.length} việc làm phù hợp`;
  }

  if (jobs.length === 0) {
    const allCount = getAllJobs().length;
    const message =
      allCount === 0
        ? "Chưa có tin tuyển dụng nào. Doanh nghiệp đăng nhập và đăng tin để hiển thị tại đây."
        : "Không có việc phù hợp. Thử đổi từ khóa hoặc bộ lọc.";
    container.innerHTML = `<div class="empty-state"><p>${message}</p></div>`;
    return;
  }

  container.innerHTML = jobs
    .map(
      (job) => `
    <article class="job-card">
      <h2><a href="${getJobDetailHref(job.id)}">${escapeHtml(job.title)}</a></h2>
      <p class="company">${escapeHtml(job.company)}</p>
      <div class="tags">
        ${(job.tags || []).map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join("")}
      </div>
      <div class="footer">
        <span>${escapeHtml(job.location)} · ${escapeHtml(job.type)}</span>
        <span>${escapeHtml(job.salary)}</span>
      </div>
    </article>
  `
    )
    .join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
