/**
 * Tính năng xuất dữ liệu đăng bài dưới dạng JSON
 * để nhà tuyển dụng gửi cho Admin đăng trực tiếp vào mã nguồn.
 */

// Cấu hình Email của Admin để nhận tin đăng
const ADMIN_EMAIL = "admin@sinhvienjob.com";

// Định dạng JSON hiển thị và tải về
function formatJobData(job) {
  // Loại bỏ các trường không cần thiết cho mã nguồn tĩnh nếu có
  const cleanJob = {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    salary: job.salary,
    posted: job.posted,
    tags: job.tags,
    description: job.description,
    requirements: job.requirements,
    employerEmail: job.employerEmail
  };
  return JSON.stringify(cleanJob, null, 2);
}

// Thêm style CSS trực tiếp vào trang để đảm bảo tính tự lập (không cần sửa file CSS cũ)
function injectModalStyles() {
  if (document.getElementById("job-export-modal-styles")) return;

  const styles = `
    .job-export-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s;
    }
    .job-export-modal.active {
      opacity: 1;
      visibility: visible;
    }
    .job-export-modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(6px);
    }
    .job-export-modal-content {
      position: relative;
      background: var(--surface, #ffffff);
      border-radius: 16px;
      width: min(580px, 94%);
      max-height: 90vh;
      box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
      z-index: 10;
      transform: translateY(30px);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border, #e2e8f0);
    }
    .job-export-modal.active .job-export-modal-content {
      transform: translateY(0);
    }
    .job-export-modal-close {
      position: absolute;
      top: 1rem;
      right: 1.25rem;
      background: none;
      border: none;
      font-size: 1.75rem;
      cursor: pointer;
      color: var(--text-muted, #64748b);
      transition: color 0.15s ease;
      line-height: 1;
      padding: 0.25rem;
    }
    .job-export-modal-close:hover {
      color: var(--text, #0f172a);
    }
    .job-export-modal-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .job-export-modal-icon {
      font-size: 2.75rem;
      margin-bottom: 0.5rem;
      display: inline-block;
      animation: jobExportPulse 2s infinite ease-in-out;
    }
    @keyframes jobExportPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    .job-export-modal-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--text, #0f172a);
    }
    .job-export-modal-header p {
      margin: 0;
      font-size: 0.925rem;
      color: var(--text-muted, #64748b);
      line-height: 1.5;
    }
    .job-export-code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted, #64748b);
    }
    .job-export-btn-copy {
      background: rgba(37, 99, 235, 0.08);
      color: var(--primary, #2563eb);
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .job-export-btn-copy:hover {
      background: var(--primary, #2563eb);
      color: #ffffff;
    }
    .job-export-btn-copy.copied {
      background: #ecfdf5;
      color: #059669;
    }
    .job-export-code-block {
      margin: 0 0 1.5rem 0;
      background: #0f172a;
      border-radius: 10px;
      padding: 1.15rem;
      overflow-x: auto;
      max-height: 180px;
      border: 1px solid #1e293b;
    }
    .job-export-code-block code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 0.85rem;
      color: #f1f5f9;
      white-space: pre;
      line-height: 1.45;
    }
    .job-export-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    @media (max-width: 500px) {
      .job-export-actions {
        grid-template-columns: 1fr;
      }
    }
    .job-export-action-btn {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid var(--border, #e2e8f0);
      background: var(--surface, #ffffff);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      text-align: left;
      transition: all 0.2s ease-in-out;
    }
    .job-export-action-btn:hover {
      border-color: var(--primary, #2563eb);
      transform: translateY(-2px);
      box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.08);
      text-decoration: none;
    }
    .job-export-action-btn .icon {
      font-size: 1.75rem;
      flex-shrink: 0;
    }
    .job-export-action-btn .text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .job-export-action-btn .text strong {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text, #0f172a);
    }
    .job-export-action-btn .text span {
      font-size: 0.775rem;
      color: var(--text-muted, #64748b);
      line-height: 1.2;
    }
    .job-export-action-btn.email {
      border-left: 4px solid var(--primary, #2563eb);
    }
    .job-export-action-btn.download {
      border-left: 4px solid #10b981;
    }
    .job-export-modal-footer {
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid var(--border, #e2e8f0);
      padding-top: 1.25rem;
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.id = "job-export-modal-styles";
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

// Khởi tạo và hiển thị Modal
window.showJobExportModal = function(job) {
  injectModalStyles();

  // Xóa modal cũ nếu có
  const existingModal = document.getElementById("job-export-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const jsonString = formatJobData(job);
  
  // Tạo modal HTML
  const modalHTML = `
    <div class="job-export-modal" id="job-export-modal">
      <div class="job-export-modal-backdrop"></div>
      <div class="job-export-modal-content">
        <button class="job-export-modal-close" id="job-export-btn-close-x" aria-label="Đóng">&times;</button>
        <div class="job-export-modal-header">
          <span class="job-export-modal-icon">🚀</span>
          <h2>Xuất dữ liệu tin tuyển dụng</h2>
          <p>Tin của bạn đã lưu tạm vào trình duyệt này. Để duyệt đăng toàn hệ thống cho sinh viên cùng xem, vui lòng gửi dữ liệu dưới đây cho Admin.</p>
        </div>
        <div class="job-export-modal-body">
          <div class="job-export-code-header">
            <span>Đoạn mã cấu hình (JSON)</span>
            <button class="job-export-btn-copy" id="job-export-btn-copy">Sao chép</button>
          </div>
          <pre class="job-export-code-block"><code id="job-export-json-code"></code></pre>
          
          <div class="job-export-actions">
            <a href="#" class="job-export-action-btn email" id="job-export-btn-email">
              <span class="icon">✉️</span>
              <div class="text">
                <strong>Gửi Email cho Admin</strong>
                <span>Mở email điền sẵn nội dung tin</span>
              </div>
            </a>
            <button class="job-export-action-btn download" id="job-export-btn-download">
              <span class="icon">💾</span>
              <div class="text">
                <strong>Tải xuống file JSON</strong>
                <span>Để gửi qua Zalo, Messenger...</span>
              </div>
            </button>
          </div>
        </div>
        <div class="job-export-modal-footer">
          <button class="btn btn-outline" id="job-export-btn-close-footer" style="padding: 0.5rem 1.25rem;">Đóng lại</button>
        </div>
      </div>
    </div>
  `;

  // Inject vào body
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.getElementById("job-export-modal");
  const codeEl = document.getElementById("job-export-json-code");
  
  // Hiển thị code JSON dạng an toàn
  codeEl.textContent = jsonString;

  // Xử lý đóng modal
  const closeModal = () => {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  document.getElementById("job-export-btn-close-x").addEventListener("click", closeModal);
  document.getElementById("job-export-btn-close-footer").addEventListener("click", closeModal);
  modal.querySelector(".job-export-modal-backdrop").addEventListener("click", closeModal);

  // Xử lý sao chép JSON
  const copyBtn = document.getElementById("job-export-btn-copy");
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      copyBtn.textContent = "Đã sao chép! ✓";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "Sao chép";
        copyBtn.classList.remove("copied");
      }, 2000);
    }).catch(err => {
      console.error("Không thể sao chép dữ liệu: ", err);
      alert("Hãy chọn toàn bộ đoạn mã trong hộp thoại và sao chép thủ công.");
    });
  });

  // Xử lý tải xuống file JSON
  const downloadBtn = document.getElementById("job-export-btn-download");
  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    
    // Tạo tên file an toàn dựa trên tiêu đề công việc
    const safeTitle = job.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    a.href = url;
    a.download = `job-post-${safeTitle || "export"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Xử lý tạo link mailto
  const emailLink = document.getElementById("job-export-btn-email");
  const emailSubject = encodeURIComponent(`[SinhVienJob] Đăng tin tuyển dụng mới: ${job.title}`);
  
  // Nội dung email thân thiện
  const emailBodyText = `Chào Admin,

Tôi muốn gửi tin tuyển dụng mới để đăng lên trang web SinhVienJob.

Dưới đây là thông tin chi tiết cấu hình JSON của bài tuyển dụng (Vui lòng dán trực tiếp vào mã nguồn):

\`\`\`json
${jsonString}
\`\`\`

Xin cảm ơn!`;
  
  const emailBody = encodeURIComponent(emailBodyText);
  emailLink.href = `mailto:${ADMIN_EMAIL}?subject=${emailSubject}&body=${emailBody}`;

  // Kích hoạt animation xuất hiện
  // Cần setTimeout nhỏ để transition CSS hoạt động
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);
};
