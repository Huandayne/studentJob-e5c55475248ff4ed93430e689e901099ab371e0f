document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("auth");

  const session = getSession();
  if (session?.role === AuthRole.EMPLOYER) {
    window.location.href = getDashboardPath(AuthRole.EMPLOYER);
    return;
  }

  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("form-error");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getFormValues(form);

    const result = loginUser({
      email: data.email,
      password: data.password,
      role: AuthRole.EMPLOYER,
    });

    if (!result.ok) {
      showFormError(errorEl, result.error);
      return;
    }

    window.location.href = getDashboardPath(AuthRole.EMPLOYER);
  });
});
