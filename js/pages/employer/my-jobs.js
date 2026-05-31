document.addEventListener("DOMContentLoaded", () => {
  const base = getBasePath();
  const session = requireAuth(
    AuthRole.EMPLOYER,
    `${base}pages/auth/employer-login.html`
  );
  if (!session) return;

  renderNavbar("employer-dashboard");
  renderMyJobs(session.email);
});

function renderMyJobs(employerEmail) {
  const list = document.getElementById("my-jobs-list");
  const countEl = document.getElementById("results-count");
  if (!list) return;

  const jobs = getJobsByEmployer(employerEmail);

  if (countEl) {
    countEl.textContent =
      jobs.length === 0
        ? "Bạn chưa đăng tin nào."
        : `Bạn có ${jobs.length} tin đang hiển thị`;
  }

  if (jobs.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>Chưa có tin tuyển dụng.</p>
        <a href="post-job.html" class="btn btn-primary" style="margin-top:1rem">Đăng tin đầu tiên</a>
      </div>
    `;
    return;
  }

  list.innerHTML = jobs
    .map(
      (job) => `
    <article class="my-job-item" data-id="${escapeHtml(job.id)}">
      <div>
        <h2>${escapeHtml(job.title)}</h2>
        <p class="meta">${escapeHtml(job.location)} · ${escapeHtml(job.type)} · ${formatDate(job.posted)}</p>
      </div>
      <div class="my-job-actions">
        <a href="${getJobDetailHref(job.id)}" class="btn btn-outline btn-sm">Xem</a>
        <button type="button" class="btn btn-danger btn-sm btn-delete" data-id="${escapeHtml(job.id)}">Xóa</button>
      </div>
    </article>
  `
    )
    .join("");

  list.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
      if (!confirm("Xóa tin tuyển dụng này? Hành động không hoàn tác.")) return;

      const result = deleteJob(id, employerEmail);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      renderMyJobs(employerEmail);
    });
  });
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return iso;
  }
}
