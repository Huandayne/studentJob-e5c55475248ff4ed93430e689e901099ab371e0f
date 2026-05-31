document.addEventListener("DOMContentLoaded", () => {
  const base = getBasePath();
  const session = requireAuth(
    AuthRole.STUDENT,
    `${base}pages/auth/student-login.html`
  );
  if (!session) return;

  renderNavbar("student-dashboard");
  renderStudentApplications(session.email);
});

function renderStudentApplications(studentEmail) {
  const list = document.getElementById("applications-list");
  const countEl = document.getElementById("results-count");
  if (!list) return;

  const applications = getApplicationsByStudent(studentEmail);

  if (countEl) {
    countEl.textContent =
      applications.length === 0
        ? "Bạn chưa gửi đơn ứng tuyển nào."
        : `Bạn có ${applications.length} đơn ứng tuyển`;
  }

  if (applications.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>Hãy tìm việc và gửi form ứng tuyển kèm CV.</p>
        <a href="../jobs.html" class="btn btn-primary" style="margin-top:1rem">Tìm việc làm</a>
      </div>
    `;
    return;
  }

  list.innerHTML = applications
    .map((app) => {
      const jobExists = getJobById(app.jobId);
      const titleHtml = jobExists
        ? `<a href="${getJobDetailHref(app.jobId)}">${escapeHtml(app.jobTitle)}</a>`
        : escapeHtml(app.jobTitle);

      const portfolioUrl = safeExternalUrl(app.portfolioUrl);

      return `
    <article class="application-card">
      <h2>${titleHtml}</h2>
      <p class="meta">${escapeHtml(app.company)} · Ứng tuyển ${formatDate(app.appliedAt)}</p>
      <p class="message">${escapeHtml(app.message)}</p>
      ${app.cvId ? renderStudentCvRow(app) : ""}
      ${portfolioUrl ? `<p class="meta">Portfolio: <a href="${escapeHtml(portfolioUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(portfolioUrl)}</a></p>` : ""}
      <div class="card-footer">
        <span class="status-badge ${escapeHtml(app.status)}">${escapeHtml(getStatusLabel(app.status))}</span>
        ${app.phone ? `<span class="meta">SĐT: ${escapeHtml(app.phone)}</span>` : ""}
      </div>
    </article>
  `;
    })
    .join("");

  list.querySelectorAll(".btn-download-own-cv").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cvId = btn.getAttribute("data-cv-id");
      if (!cvId) return;
      const result = downloadCv(cvId);
      if (!result.ok) alert(result.error);
    });
  });
}

function renderStudentCvRow(app) {
  return `
    <p class="cv-attachment">
      <span>📎 ${escapeHtml(app.cvFileName || "CV")}</span>
      <button type="button" class="btn btn-outline btn-sm btn-download-own-cv" data-cv-id="${escapeHtml(app.cvId)}">Tải lại CV</button>
    </p>
  `;
}

function safeExternalUrl(url) {
  const trimmed = url?.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return iso;
  }
}
