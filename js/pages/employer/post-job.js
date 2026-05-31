document.addEventListener("DOMContentLoaded", () => {
  const base = getBasePath();
  const session = requireAuth(
    AuthRole.EMPLOYER,
    `${base}pages/auth/employer-login.html`
  );
  if (!session) return;

  renderNavbar("employer-dashboard");

  const form = document.getElementById("post-job-form");
  const errorEl = document.getElementById("form-error");
  const successEl = document.getElementById("form-success");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    showFormError(errorEl, "");
    if (successEl) {
      successEl.hidden = true;
      successEl.textContent = "";
    }

    const data = getFormValues(form);
    const result = createJobFromForm(data, session);

    if (!result.ok) {
      showFormError(errorEl, result.error);
      return;
    }

    if (successEl) {
      successEl.textContent = "Đã đăng tin thành công. Sinh viên có thể xem trên trang Tìm việc.";
      successEl.hidden = false;
    }
    form.reset();
  });
});
