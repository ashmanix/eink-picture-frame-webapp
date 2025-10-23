import { login } from "../utils/api.js";
import { setNotification } from "../pages/base.js";
import { createErrorMessage } from "../utils/messages.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-button");
  const usernameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");
  const usernameHelper = document.getElementById("username-helper");
  const passwordHelper = document.getElementById("password-helper");

  const formInputs = [
    { input: usernameInput, helper: usernameHelper },
    { input: passwordInput, helper: passwordHelper },
  ];

  if (loginButton) {
    loginButton.addEventListener("click", async (event) => {
      event.preventDefault();

      let hasErrors = false;

      for (const formInput of formInputs) {
        formInput?.input?.classList.remove("is-danger");
        formInput?.helper?.classList.add("is-hidden");

        if (formInput?.input?.checkValidity() === false) {
          formInput?.input.classList.add("is-danger");
          formInput?.helper?.classList.remove("is-hidden");
          hasErrors = true;
        }
      }

      if (hasErrors) return;

      const form = event.target.form;
      const data = new FormData(form);

      const result = await login(data.get("username"), data.get("password"));

      if (result?.error) {
        for (const formInput of formInputs) {
          formInput?.input.classList.add("is-danger");
        }
        setNotification(
          createErrorMessage("Error attempting to login", result),
          "is-danger"
        );
      }
    });
  }
});
