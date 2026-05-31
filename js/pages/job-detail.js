/**
 * Logic trang chi tiết việc làm — đọc id từ URL và hiển thị.
 */
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("jobs");
  renderJobDetail();
});

function renderJobDetail() {
  const container = document.getElementById("job-detail-content");
  if (!container) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const job = getJobById(id);

  if (!job) {
    container.innerHTML = `
      <div class="not-found">
        <h1>Không tìm thấy việc làm</h1>
        <p>Vị trí này có thể đã hết hạn hoặc link không đúng.</p>
        <a href="jobs.html" class="btn btn-primary" style="margin-top:1rem">Quay lại danh sách</a>
      </div>
    `;
    return;
  }

  document.title = `${job.title} — SinhVienJob`;

  container.innerHTML = `
    <a href="jobs.html" class="back-link">← Quay lại danh sách</a>
    <article class="job-detail-card">
      <h1>${escapeHtml(job.title)}</h1>
      <p class="company-line">${escapeHtml(job.company)}</p>
      <div class="tags">
        ${(job.tags || []).map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join(" ") || ""}
      </div>
      <div class="info-grid">
        <div class="info-item"><label>Địa điểm</label><span>${escapeHtml(job.location)}</span></div>
        <div class="info-item"><label>Loại hình</label><span>${escapeHtml(job.type)}</span></div>
        <div class="info-item"><label>Mức lương</label><span>${escapeHtml(job.salary)}</span></div>
        <div class="info-item"><label>Đăng ngày</label><span>${formatDate(job.posted)}</span></div>
      </div>
      <section>
        <h2>Mô tả công việc</h2>
        <p>${escapeHtml(job.description)}</p>
      </section>
      <section>
        <h2>Yêu cầu</h2>
        <ul>${job.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
      </section>
      <div class="apply-bar">
        ${renderApplySection(job)}
      </div>
    </article>
  `;
}

function renderApplySection(job) {
  const session = typeof getSession === "function" ? getSession() : null;
  const base = getBasePath();

  if (!session) {
    return `
      <p class="apply-notice" style="width:100%;margin:0 0 0.75rem">Đăng nhập sinh viên để ứng tuyển vị trí này.</p>
      <a href="${base}pages/auth/student-login.html" class="btn btn-primary">Đăng nhập sinh viên</a>
      <a href="${base}pages/auth/student-register.html" class="btn btn-outline">Đăng ký</a>
    `;
  }

  if (session.role === AuthRole.EMPLOYER) {
    return `
      <p class="apply-notice" style="width:100%;margin:0">
        Tài khoản doanh nghiệp không thể ứng tuyển. Vui lòng dùng tài khoản sinh viên.
      </p>
    `;
  }

  if (session.role === AuthRole.STUDENT) {
    const existing = findApplicationByJobAndStudent(job.id, session.email);
    if (existing) {
      return `
        <p class="apply-notice success" style="width:100%;margin:0 0 0.75rem">
          Bạn đã ứng tuyển · Trạng thái: <strong>${escapeHtml(getStatusLabel(existing.status))}</strong>
        </p>
        <a href="${getStudentApplicationsHref()}" class="btn btn-outline">Xem đơn của tôi</a>
      `;
    }
    return `
      <a href="${getStudentApplyHref(job.id)}" class="btn btn-primary">Ứng tuyển (form + CV)</a>
      <a href="${getStudentApplicationsHref()}" class="btn btn-outline">Đơn đã gửi</a>
    `;
  }

  return "";
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return iso;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
