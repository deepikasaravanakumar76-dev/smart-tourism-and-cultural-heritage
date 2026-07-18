/* =====================================================
   validation.js
   Validates the Contact page form in the browser (no
   backend), showing inline errors and a success message.
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const fields = {
    name: { el: document.getElementById("contact-name"), rule: (v) => v.trim().length >= 2, message: "Please enter your full name (min. 2 characters)." },
    email: { el: document.getElementById("contact-email"), rule: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), message: "Please enter a valid email address." },
    subject: { el: document.getElementById("contact-subject"), rule: (v) => v.trim().length >= 3, message: "Subject should be at least 3 characters." },
    message: { el: document.getElementById("contact-message"), rule: (v) => v.trim().length >= 10, message: "Message should be at least 10 characters." }
  };

  // Validate a single field and toggle its error state
  function validateField(key) {
    const { el, rule } = fields[key];
    const group = el.closest(".form-group");
    const isValid = rule(el.value);
    group.classList.toggle("invalid", !isValid);
    return isValid;
  }

  // Live validation as the user types/leaves a field
  Object.keys(fields).forEach((key) => {
    fields[key].el.addEventListener("blur", () => validateField(key));
    fields[key].el.addEventListener("input", () => {
      if (fields[key].el.closest(".form-group").classList.contains("invalid")) {
        validateField(key);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const successBox = document.getElementById("form-success");
    successBox.classList.remove("show");

    const allValid = Object.keys(fields).every((key) => validateField(key));

    if (!allValid) {
      // Focus the first invalid field for accessibility
      const firstInvalid = form.querySelector(".form-group.invalid .form-control");
      firstInvalid?.focus();
      return;
    }

    // No backend — simulate a successful submission and reset the form
    successBox.textContent = "Thank you! Your message has been sent. We'll get back to you soon.";
    successBox.classList.add("show");
    form.reset();
    Object.keys(fields).forEach((key) => fields[key].el.closest(".form-group").classList.remove("invalid"));
    successBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
