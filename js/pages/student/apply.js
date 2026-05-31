document.addEventListener("DOMContentLoaded", () => {
  const base = getBasePath();
  const session = requireAuth(
    AuthRole.STUDENT,
    `${base}pages/auth/student-login.html`
  );
  if (!session) return;

  renderNavbar("student-dashboard");

  const jobId = new URLSearchParams(window.location.search).get("jobId");
  const job = jobId ? getJobById(jobId) : null;

  const backLink = document.getElementById("back-to-job");
  const summaryEl = document.getElementById("job-summary");
  const form = document.getElementById("apply-form");
  const errorEl = document.getElementById("form-error");
  const noticeEl = document.getElementById("apply-notice");
  const cvInput = document.getElementById("cv");
  const cvSelectedEl = document.getElementById("cv-selected");
  const submitBtn = document.getElementById("btn-submit");

  if (!job) {
    if (summaryEl) {
      summaryEl.innerHTML = "<p>Không tìm thấy tin tuyển dụng.</p>";
    }
    form?.remove();
    if (backLink) backLink.href = `${base}pages/jobs.html`;
    return;
  }

  if (backLink) {
    backLink.href = getJobDetailHref(job.id);
  }

  if (summaryEl) {
    summaryEl.innerHTML = `
      <h2>${escapeHtml(job.title)}</h2>
      <p>${escapeHtml(job.company)} · ${escapeHtml(job.location)}</p>
    `;
  }

  prefillForm(session);

  cvInput?.addEventListener("change", () => {
    const file = cvInput.files?.[0];
    if (!file || !cvSelectedEl) {
      if (cvSelectedEl) cvSelectedEl.hidden = true;
      return;
    }
    const check = validateCvFile(file);
    if (!check.ok) {
      cvSelectedEl.hidden = false;
      cvSelectedEl.className = "cv-selected error";
      cvSelectedEl.textContent = check.error;
      return;
    }
    cvSelectedEl.hidden = false;
    cvSelectedEl.className = "cv-selected";
    cvSelectedEl.textContent = `Đã chọn: ${file.name} (${formatCvSize(file.size)})`;
  });

  const existing = findApplicationByJobAndStudent(job.id, session.email);
  if (existing) {
    form?.remove();
    if (noticeEl) {
      noticeEl.hidden = false;
      noticeEl.className = "apply-notice success";
      noticeEl.innerHTML = `
        Bạn đã gửi đơn vào ${formatDate(existing.appliedAt)}.
        Trạng thái: <strong>${escapeHtml(getStatusLabel(existing.status))}</strong>.
        ${existing.cvFileName ? `<br />CV: ${escapeHtml(existing.cvFileName)}` : ""}
        <br /><a href="my-applications.html">Xem tất cả đơn</a>
      `;
    }
    return;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showFormError(errorEl, "");

    const data = getFormValues(form);
    const cvFile = cvInput?.files?.[0];

    const cvCheck = validateCvFile(cvFile);
    if (!cvCheck.ok) {
      showFormError(errorEl, cvCheck.error);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang tải CV lên...";
    }

    const uploadResult = await uploadCvFromFile(cvFile, session.email);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi đơn ứng tuyển";
    }

    if (!uploadResult.ok) {
      showFormError(errorEl, uploadResult.error);
      return;
    }

    const result = submitApplication({
      job,
      session,
      studentName: data.studentName,
      studentSchool: data.studentSchool,
      studentMajor: data.studentMajor,
      message: data.message,
      phone: data.phone,
      portfolioUrl: data.portfolioUrl,
      cvId: uploadResult.cv.id,
      cvFileName: uploadResult.cv.fileName,
    });

    if (!result.ok) {
      showFormError(errorEl, result.error);
      return;
    }

    window.location.href = "my-applications.html";
  });
});

function prefillForm(session) {
  const nameInput = document.getElementById("studentName");
  const emailInput = document.getElementById("studentEmail");
  const schoolInput = document.getElementById("studentSchool");
  const majorInput = document.getElementById("studentMajor");

  if (nameInput) nameInput.value = session.name || "";
  if (emailInput) emailInput.value = session.email || "";
  if (schoolInput) schoolInput.value = session.school || "";
  if (majorInput && session.major) majorInput.value = session.major;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return iso;
  }
}
