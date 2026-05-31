/**
 * Đường dẫn tới trang chi tiết việc làm — luôn trỏ đúng pages/job-detail.html
 */
function getJobDetailHref(jobId) {
  const encoded = encodeURIComponent(jobId);
  const path = window.location.pathname.replace(/\\/g, "/");

  if (/\/pages\/[^/]+\//.test(path)) {
    return `../job-detail.html?id=${encoded}`;
  }
  if (path.includes("/pages/")) {
    return `job-detail.html?id=${encoded}`;
  }
  return `pages/job-detail.html?id=${encoded}`;
}

function getStudentApplyHref(jobId) {
  const encoded = encodeURIComponent(jobId);
  const path = window.location.pathname.replace(/\\/g, "/");

  if (path.includes("/pages/student/")) {
    return `apply.html?jobId=${encoded}`;
  }
  if (path.includes("/pages/")) {
    return `student/apply.html?jobId=${encoded}`;
  }
  return `pages/student/apply.html?jobId=${encoded}`;
}

function getStudentApplicationsHref() {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.includes("/pages/student/")) {
    return "my-applications.html";
  }
  if (path.includes("/pages/")) {
    return "student/my-applications.html";
  }
  return "pages/student/my-applications.html";
}
