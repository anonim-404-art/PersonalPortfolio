const form = document.getElementById("form");
const submitBtn = document.getElementById("submit-btn_form");

// Toast elements references
const toast = document.getElementById("toast-notif");
const toastIconBg = document.getElementById("toast-icon-bg");
const toastIcon = document.getElementById("toast-icon");
const toastMsg = document.getElementById("toast-msg");

let toastTimeout;

// Triggers a beautiful glassmorphic status alert
function showToast(message, type = "success") {
  if (toastMsg && toastIconBg && toastIcon && toast) {
    toastMsg.textContent = message;
    
    // Configure success vs error styling tokens
    if (type === "success") {
      toastIconBg.className = "w-8 h-8 rounded-full flex items-center justify-center bg-green-500/20 text-green-400 border border-green-500/30";
      toastIcon.className = "fa-solid fa-circle-check text-sm";
    } else {
      toastIconBg.className = "w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 border border-red-500/30";
      toastIcon.className = "fa-solid fa-circle-exclamation text-sm";
    }
    
    // Animate view
    toast.classList.add("show");
    
    // Clear any pending timeouts to avoid overlapping dismissals
    clearTimeout(toastTimeout);
    
    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 4500);
  }
}

if (form && submitBtn) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const originalContent = submitBtn.innerHTML;

    // Toggle button state to loading with circular spinner
    submitBtn.innerHTML = `
      <span class="z-10 flex items-center gap-2">
        Sending... <i class="fa-solid fa-circle-notch animate-spin text-xs"></i>
      </span>
    `;
    submitBtn.disabled = true;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Success! Your message has been sent.", "success");
        form.reset();
      } else {
        showToast(`Error: ${data.message || "Failed to submit form"}`, "error");
      }
    } catch (error) {
      showToast("Something went wrong. Please check your network and try again.", "error");
      console.error("Form submission error: ", error);
    } finally {
      // Revert loading settings
      submitBtn.innerHTML = originalContent;
      submitBtn.disabled = false;
    }
  });
}
