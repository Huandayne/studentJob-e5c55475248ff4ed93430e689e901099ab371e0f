/**
 * Thanh điều hướng dùng chung — inject vào #site-header trên mỗi trang.
 */
function renderNavbar(activePage) {
  const header = document.getElementById("site-header");
  if (!header) return;

  const base = getBasePath();
  const session = typeof getSession === "function" ? getSession() : null;

  const pages = [
    { id: "home", label: "Trang chủ", href: `${base}index.html` },
    { id: "jobs", label: "Tìm việc", href: `${base}pages/jobs.html` },
  ];

  const navLinks = pages
    .map(
      (p) =>
        `<li><a href="${p.href}" class="${p.id === activePage ? "active" : ""}">${p.label}</a></li>`
    )
    .join("");

  let authBlock = "";
  if (session) {
    const dashPath = getDashboardPath(session.role);
    const roleLabel = session.role === AuthRole.STUDENT ? "Sinh viên" : "DN";
    authBlock = `
      <li><a href="${dashPath}">${escapeHtml(session.name)} (${roleLabel})</a></li>
      <li><a href="#" id="nav-logout">Đăng xuất</a></li>
    `;
  } else {
    authBlock = `
      <li><a href="${base}pages/auth/student-login.html" class="${activePage === "auth-student" ? "active" : ""}">SV đăng nhập</a></li>
      <li><a href="${base}pages/auth/employer-login.html" class="${activePage === "auth-employer" ? "active" : ""}">DN đăng nhập</a></li>
    `;
  }

  header.innerHTML = `
    <div class="container inner">
      <a href="${base}index.html" class="logo">SinhVien<span>Job</span></a>
      <nav>
        <ul class="site-nav">${navLinks}${authBlock}</ul>
      </nav>
    </div>
  `;

  document.getElementById("nav-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    logoutUser();
    window.location.href = `${base}index.html`;
  });
}

/** Đường dẫn tương đối theo vị trí trang hiện tại */
function getBasePath() {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.includes("/pages/auth/") || path.includes("/pages/student/") || path.includes("/pages/employer/")) {
    return "../../";
  }
  if (path.includes("/pages/")) {
    return "../";
  }
  return "";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
