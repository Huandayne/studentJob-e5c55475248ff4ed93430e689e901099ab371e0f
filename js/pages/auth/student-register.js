document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("auth");

  const session = getSession();
  if (session?.role === AuthRole.STUDENT) {
    window.location.href = getDashboardPath(AuthRole.STUDENT);
    return;
  }

  const form = document.getElementById("register-form");
  const errorEl = document.getElementById("form-error");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getFormValues(form);

    if (data.password !== data.passwordConfirm) {
      showFormError(errorEl, "Mật khẩu nhập lại không khớp.");
      return;
    }

    const result = registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      role: AuthRole.STUDENT,
      school: data.school,
      major: data.major,
    });

    if (!result.ok) {
      showFormError(errorEl, result.error);
      return;
    }

    window.location.href = getDashboardPath(AuthRole.STUDENT);
  });
});
