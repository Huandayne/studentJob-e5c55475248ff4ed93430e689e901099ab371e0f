/**
 * Lưu tài khoản người dùng (localStorage). Ban đầu rỗng — chỉ có user sau khi đăng ký.
 */
const USERS_STORAGE_KEY = "svj_users";

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((u) => u.email === normalized) || null;
}

function addUser(user) {
  const users = getUsers();
  if (findUserByEmail(user.email)) {
    return { ok: false, error: "Email này đã được đăng ký." };
  }
  users.push(user);
  saveUsers(users);
  return { ok: true };
}
