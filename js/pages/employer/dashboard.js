document.addEventListener("DOMContentLoaded", () => {
  const base = getBasePath();
  const session = requireAuth(
    AuthRole.EMPLOYER,
    `${base}pages/auth/employer-login.html`
  );
  if (!session) return;

  renderNavbar("employer-dashboard");

  const infoEl = document.getElementById("session-info");
  if (infoEl) {
    const rows = [
      ["Công ty", session.companyName || session.name],
      ["Người liên hệ", session.name],
      ["Email", session.email],
    ];

    infoEl.innerHTML = `
      <dl>
        ${rows
          .map(
            ([label, value]) =>
              `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`
          )
          .join("")}
      </dl>
    `;
  }

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    logoutUser();
    window.location.href = `${base}pages/auth/employer-login.html`;
  });
});
