/**
 * Lưu file CV (base64) — tách khỏi đơn ứng tuyển để tránh trùng dữ liệu lớn.
 */
const CV_STORAGE_KEY = "svj_cvs";

const MAX_CV_BYTES = 2 * 1024 * 1024;

const CV_ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const CV_ALLOWED_EXT = [".pdf", ".doc", ".docx"];

function getCvs() {
  try {
    const raw = localStorage.getItem(CV_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCvs(cvs) {
  localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(cvs));
}

function getCvById(cvId) {
  return getCvs().find((c) => c.id === cvId) || null;
}

function generateCvId() {
  return `cv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function validateCvFile(file) {
  if (!file) {
    return { ok: false, error: "Vui lòng chọn file CV." };
  }
  if (file.size > MAX_CV_BYTES) {
    return { ok: false, error: "CV tối đa 2MB. Hãy nén hoặc chọn file nhỏ hơn." };
  }

  const name = file.name.toLowerCase();
  const extOk = CV_ALLOWED_EXT.some((ext) => name.endsWith(ext));
  const mimeOk = !file.type || CV_ALLOWED_MIME.includes(file.type);

  if (!extOk && !mimeOk) {
    return { ok: false, error: "Chỉ chấp nhận file PDF, DOC hoặc DOCX." };
  }

  return { ok: true };
}

function readCvFile(file) {
  const validation = validateCvFile(file);
  if (!validation.ok) {
    return Promise.resolve(validation);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        resolve({ ok: false, error: "Không đọc được file CV." });
        return;
      }
      const comma = result.indexOf(",");
      const dataBase64 = comma >= 0 ? result.slice(comma + 1) : result;
      resolve({
        ok: true,
        fileName: file.name,
        mimeType: file.type || guessMimeFromName(file.name),
        size: file.size,
        dataBase64,
      });
    };
    reader.onerror = () => resolve({ ok: false, error: "Không đọc được file CV." });
    reader.readAsDataURL(file);
  });
}

function guessMimeFromName(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
}

function storeCv({ studentEmail, fileName, mimeType, size, dataBase64 }) {
  const cv = {
    id: generateCvId(),
    studentEmail: studentEmail.trim().toLowerCase(),
    fileName,
    mimeType,
    size,
    dataBase64,
    uploadedAt: new Date().toISOString(),
  };

  const cvs = getCvs();
  cvs.push(cv);
  saveCvs(cvs);
  return { ok: true, cv };
}

async function uploadCvFromFile(file, studentEmail) {
  const readResult = await readCvFile(file);
  if (!readResult.ok) return readResult;

  return storeCv({
    studentEmail,
    fileName: readResult.fileName,
    mimeType: readResult.mimeType,
    size: readResult.size,
    dataBase64: readResult.dataBase64,
  });
}

function downloadCv(cvId) {
  const cv = getCvById(cvId);
  if (!cv?.dataBase64) {
    return { ok: false, error: "Không tìm thấy file CV." };
  }

  try {
    const binary = atob(cv.dataBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: cv.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cv.fileName || "cv.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không tải được CV." };
  }
}

function formatCvSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
