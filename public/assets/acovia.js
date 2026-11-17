(() => {
  "use strict";

  const toast = document.getElementById("toast");
  let timer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(timer);
    timer = window.setTimeout(() => toast.classList.remove("show"), 1600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (copyError) {
        ok = false;
      }
      area.remove();
      return ok;
    }
  }

  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-copy]");
    if (!target) return;
    const value = target.getAttribute("data-copy") || "acovia.net";
    const ok = await copyText(value);
    showToast(ok ? `已复制 ${value}` : "复制失败，请手动选择地址");
  });
})();
