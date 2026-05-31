/**
 * Xác thực phiên đăng nhập — sinh viên hoặc doanh nghiệp.
 */
const SESSION_STORAGE_KEY = "svj_session";

const AuthRole = {
  STUDENT: "student",
  EMPLOYER: "employer",
};

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password) {
  return password.length >= 6;
}

function registerUser(payload) {
  const { email, password, name, role } = payload;

  if (!name?.trim()) {
    return { ok: false, error: "Vui lòng nhập họ tên hoặc tên công ty." };
  }
  if (!validateEmail(email)) {
    return { ok: false, error: "Email không hợp lệ." };
  }
  if (!validatePassword(password)) {
    return { ok: false, error: "Mật khẩu tối thiểu 6 ký tự." };
  }
  if (role !== AuthRole.STUDENT && role !== AuthRole.EMPLOYER) {
    return { ok: false, error: "Loại tài khoản không hợp lệ." };
  }

  const user = {
    email: email.trim().toLowerCase(),
    password,
    name: name.trim(),
    role,
    createdAt: new Date().toISOString(),
  };

  if (role === AuthRole.STUDENT) {
    user.school = payload.school?.trim() || "";
    user.major = payload.major?.trim() || "";
  } else {
    user.companyName = payload.companyName?.trim() || name.trim();
    user.contactPhone = payload.contactPhone?.trim() || "";
  }

  const result = addUser(user);
  if (!result.ok) return result;

  setSession({
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: user.companyName,
    school: user.school,
    major: user.major,
  });

  return { ok: true, user };
}

function loginUser({ email, password, role }) {
  if (!validateEmail(email)) {
    return { ok: false, error: "Email không hợp lệ." };
  }

  const user = findUserByEmail(email);
  if (!user) {
    return { ok: false, error: "Không tìm thấy tài khoản. Hãy đăng ký trước." };
  }
  if (user.role !== role) {
    const hint =
      role === AuthRole.STUDENT
        ? "Email này thuộc tài khoản doanh nghiệp. Dùng trang đăng nhập doanh nghiệp."
        : "Email này thuộc tài khoản sinh viên. Dùng trang đăng nhập sinh viên.";
    return { ok: false, error: hint };
  }
  if (user.password !== password) {
    return { ok: false, error: "Mật khẩu không đúng." };
  }

  setSession({
    email: user.email,
    name: user.name,
    role: user.role,
    companyName: user.companyName,
    school: user.school,
    major: user.major,
  });

  return { ok: true, user };
}

function logoutUser() {
  clearSession();
}

function requireAuth(expectedRole, loginPagePath) {
  const session = getSession();
  if (!session) {
    window.location.href = loginPagePath;
    return null;
  }
  if (session.role !== expectedRole) {
    window.location.href = loginPagePath;
    return null;
  }
  return session;
}

function getDashboardPath(role) {
  const base = typeof getBasePath === "function" ? getBasePath() : "";
  if (role === AuthRole.STUDENT) {
    return `${base}pages/student/dashboard.html`;
  }
  if (role === AuthRole.EMPLOYER) {
    return `${base}pages/employer/dashboard.html`;
  }
  return `${base}index.html`;
}
