/**
 * Tin tuyển dụng do doanh nghiệp đăng — lưu localStorage, ban đầu rỗng.
 */
const JOBS_STORAGE_KEY = "svj_jobs";

function getPostedJobs() {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePostedJobs(jobs) {
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
}

function getAllJobs() {
  return getPostedJobs().sort(
    (a, b) => new Date(b.posted) - new Date(a.posted)
  );
}

function getJobById(id) {
  return getPostedJobs().find((j) => j.id === id) || null;
}

function getJobsByEmployer(employerEmail) {
  const email = employerEmail.trim().toLowerCase();
  return getPostedJobs()
    .filter((j) => j.employerEmail === email)
    .sort((a, b) => new Date(b.posted) - new Date(a.posted));
}

function generateJobId() {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function parseTagsInput(text) {
  if (!text?.trim()) return [];
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseRequirementsInput(text) {
  if (!text?.trim()) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function addJob(job) {
  const jobs = getPostedJobs();
  jobs.push(job);
  savePostedJobs(jobs);
  return { ok: true, job };
}

function deleteJob(id, employerEmail) {
  const jobs = getPostedJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) {
    return { ok: false, error: "Không tìm thấy tin tuyển dụng." };
  }
  if (job.employerEmail !== employerEmail.trim().toLowerCase()) {
    return { ok: false, error: "Bạn không có quyền xóa tin này." };
  }
  savePostedJobs(jobs.filter((j) => j.id !== id));
  return { ok: true };
}

function validateJobPayload(payload) {
  if (!payload.title?.trim()) {
    return { ok: false, error: "Vui lòng nhập tiêu đề công việc." };
  }
  if (!payload.location?.trim()) {
    return { ok: false, error: "Vui lòng nhập địa điểm." };
  }
  if (!payload.type?.trim()) {
    return { ok: false, error: "Vui lòng chọn loại hình." };
  }
  if (!payload.salary?.trim()) {
    return { ok: false, error: "Vui lòng nhập mức lương hoặc phụ cấp." };
  }
  if (!payload.description?.trim()) {
    return { ok: false, error: "Vui lòng nhập mô tả công việc." };
  }
  const requirements = parseRequirementsInput(payload.requirementsText);
  if (requirements.length === 0) {
    return { ok: false, error: "Vui lòng nhập ít nhất một yêu cầu (mỗi dòng một mục)." };
  }
  return { ok: true, requirements };
}

function createJobFromForm(formData, session) {
  const validation = validateJobPayload(formData);
  if (!validation.ok) return validation;

  const job = {
    id: generateJobId(),
    title: formData.title.trim(),
    company: session.companyName || session.name,
    location: formData.location.trim(),
    type: formData.type,
    salary: formData.salary.trim(),
    posted: new Date().toISOString(),
    tags: parseTagsInput(formData.tags),
    description: formData.description.trim(),
    requirements: validation.requirements,
    employerEmail: session.email,
  };

  return addJob(job);
}
