/**
 * Đơn ứng tuyển — localStorage, ban đầu rỗng.
 */
const APPLICATIONS_STORAGE_KEY = "svj_applications";

const ApplicationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

const APPLICATION_STATUS_LABELS = {
  pending: "Chờ xem xét",
  accepted: "Đã chấp nhận",
  rejected: "Đã từ chối",
};

function getApplications() {
  try {
    const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveApplications(applications) {
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
}

function generateApplicationId() {
  return `app_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function findApplicationByJobAndStudent(jobId, studentEmail) {
  const email = studentEmail.trim().toLowerCase();
  return (
    getApplications().find(
      (a) => a.jobId === jobId && a.studentEmail === email
    ) || null
  );
}

function getApplicationById(id) {
  return getApplications().find((a) => a.id === id) || null;
}

function submitApplication({
  job,
  session,
  message,
  phone,
  studentName,
  studentSchool,
  studentMajor,
  portfolioUrl,
  cvId,
  cvFileName,
}) {
  if (!job?.id) {
    return { ok: false, error: "Không tìm thấy tin tuyển dụng." };
  }
  if (!studentName?.trim()) {
    return { ok: false, error: "Vui lòng nhập họ tên." };
  }
  if (!message?.trim()) {
    return { ok: false, error: "Vui lòng viết lời giới thiệu ngắn." };
  }
  if (message.trim().length < 20) {
    return { ok: false, error: "Lời giới thiệu tối thiểu 20 ký tự." };
  }
  if (!cvId || !cvFileName) {
    return { ok: false, error: "Vui lòng đính kèm CV (PDF, DOC, DOCX)." };
  }

  const studentEmail = session.email.trim().toLowerCase();
  if (findApplicationByJobAndStudent(job.id, studentEmail)) {
    return { ok: false, error: "Bạn đã ứng tuyển tin này rồi." };
  }

  const application = {
    id: generateApplicationId(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    employerEmail: job.employerEmail,
    studentEmail,
    studentName: studentName.trim(),
    studentSchool: studentSchool?.trim() || "",
    studentMajor: studentMajor?.trim() || "",
    message: message.trim(),
    phone: phone?.trim() || "",
    portfolioUrl: portfolioUrl?.trim() || "",
    cvId,
    cvFileName,
    status: ApplicationStatus.PENDING,
    appliedAt: new Date().toISOString(),
  };

  const applications = getApplications();
  applications.push(application);
  saveApplications(applications);
  return { ok: true, application };
}

function getApplicationsByStudent(studentEmail) {
  const email = studentEmail.trim().toLowerCase();
  return getApplications()
    .filter((a) => a.studentEmail === email)
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
}

function getApplicationsByEmployer(employerEmail) {
  const email = employerEmail.trim().toLowerCase();
  return getApplications()
    .filter((a) => a.employerEmail === email)
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
}

function updateApplicationStatus(applicationId, employerEmail, status) {
  const allowed = Object.values(ApplicationStatus);
  if (!allowed.includes(status)) {
    return { ok: false, error: "Trạng thái không hợp lệ." };
  }

  const applications = getApplications();
  const index = applications.findIndex((a) => a.id === applicationId);
  if (index === -1) {
    return { ok: false, error: "Không tìm thấy đơn ứng tuyển." };
  }

  const app = applications[index];
  if (app.employerEmail !== employerEmail.trim().toLowerCase()) {
    return { ok: false, error: "Bạn không có quyền cập nhật đơn này." };
  }

  applications[index] = { ...app, status };
  saveApplications(applications);
  return { ok: true, application: applications[index] };
}

function getStatusLabel(status) {
  return APPLICATION_STATUS_LABELS[status] || status;
}
