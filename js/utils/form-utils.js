function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showFormError(el, message) {
  if (!el) return;
  el.textContent = message || "";
  el.hidden = !message;
}

function getFormValues(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = value;
  });
  return data;
}
