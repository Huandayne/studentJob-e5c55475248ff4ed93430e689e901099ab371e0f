document.addEventListener("DOMContentLoaded", () => {
  const base = getBasePath();
  const session = requireAuth(
    AuthRole.EMPLOYER,
    `${base}pages/auth/employer-login.html`
  );
  if (!session) return;

  renderNavbar("employer-dashboard");
  populateJobFilter(session.email);
  renderEmployerApplications(session.email);

  document.getElementById("filter-job")?.addEventListener("change", () => {
    renderEmployerApplications(session.email);
  });
});

function populateJobFilter(employerEmail) {
  const select = document.getElementById("filter-job");
  if (!select) return;

  const jobs = getJobsByEmployer(employerEmail);
  jobs.forEach((job) => {
    const opt = document.createElement("option");
    opt.value = job.id;
    opt.textContent = job.title;
    select.appendChild(opt);
  });
}

function renderEmployerApplications(employerEmail) {
  const list = document.getElementById("applications-list");
  const countEl = document.getElementById("results-count");
  const jobFilter = document.getElementById("filter-job")?.value || "";

  if (!list) return;

  let applications = getApplicationsByEmployer(employerEmail);
  if (jobFilter) {
    applications = applications.filter((a) => a.jobId === jobFilter);
  }

  if (countEl) {
    countEl.textContent =
      applications.length === 0
        ? "Chưa có ứng viên nào."
        : `${applications.length} đơn ứng tuyển`;
  }

  if (applications.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><p>Chưa có sinh viên ứng tuyển tin của bạn.</p></div>';
    return;
  }

  list.innerHTML = applications.map((app) => renderEmployerCard(app, employerEmail)).join("");

  list.querySelectorAll(".btn-download-cv").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cvId = btn.getAttribute("data-cv-id");
      if (!cvId) return;
      const result = downloadCv(cvId);
      if (!result.ok) alert(result.error);
    });
  });

  list.querySelectorAll(".status-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const appId = form.getAttribute("data-app-id");
      const status = form.querySelector("select")?.value;
      if (!appId || !status) return;

      const result = updateApplicationStatus(appId, employerEmail, status);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      renderEmployerApplications(employerEmail);
    });
  });
}

function renderEmployerCard(app, employerEmail) {
  const options = Object.values(ApplicationStatus)
    .map(
      (s) =>
        `<option value="${s}" ${app.status === s ? "selected" : ""}>${escapeHtml(getStatusLabel(s))}</option>`
    )
    .join("");

  return `
    <article class="application-card">
      <h2>${escapeHtml(app.jobTitle)}</h2>
      <p class="meta">
        <strong>${escapeHtml(app.studentName)}</strong>
        · ${escapeHtml(app.studentEmail)}
        ${app.studentSchool ? ` · ${escapeHtml(app.studentSchool)}` : ""}
        · ${formatDate(app.appliedAt)}
      </p>
      <p class="message">${escapeHtml(app.message)}</p>
      ${app.studentMajor ? `<p class="meta">Ngành: ${escapeHtml(app.studentMajor)}</p>` : ""}
      ${app.phone ? `<p class="meta">SĐT: ${escapeHtml(app.phone)}</p>` : ""}
      ${renderCvBlock(app)}
      ${renderPortfolioBlock(app)}
      <div class="card-footer">
        <span class="status-badge ${escapeHtml(app.status)}">${escapeHtml(getStatusLabel(app.status))}</span>
        <form class="employer-status-form status-form" data-app-id="${escapeHtml(app.id)}">
          <label for="status-${escapeHtml(app.id)}">Cập nhật:</label>
          <select id="status-${escapeHtml(app.id)}" name="status">${options}</select>
          <button type="submit" class="btn btn-outline btn-sm">Lưu</button>
        </form>
      </div>
    </article>
  `;
}

function renderCvBlock(app) {
  if (!app.cvId) {
    return '<p class="meta">Chưa có file CV đính kèm.</p>';
  }
  return `
    <p class="cv-attachment">
      <span>📎 ${escapeHtml(app.cvFileName || "CV")}</span>
      <button type="button" class="btn btn-outline btn-sm btn-download-cv" data-cv-id="${escapeHtml(app.cvId)}">Tải CV</button>
    </p>
  `;
}

function renderPortfolioBlock(app) {
  const url = safeExternalUrl(app.portfolioUrl);
  if (!url) return "";
  return `<p class="meta">Portfolio: <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Xem link</a></p>`;
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
