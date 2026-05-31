document.addEventListener("DOMContentLoaded", () => {
  const base = getBasePath();
  const session = requireAuth(
    AuthRole.STUDENT,
    `${base}pages/auth/student-login.html`
  );
  if (!session) return;

  renderNavbar("student-dashboard");

  const infoEl = document.getElementById("session-info");
  if (infoEl) {
    const rows = [
      ["Họ tên", session.name],
      ["Email", session.email],
    ];
    if (session.school) rows.push(["Trường", session.school]);

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
    window.location.href = `${base}pages/auth/student-login.html`;
  });
});
