import { logout } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", () => {
  const notificationDeleteButton = document.getElementById(
    "notification-hide-button"
  );
  notificationDeleteButton.addEventListener("click", async (event) => {
    setNotificationVisibility(false);
  });

  const logoutButton = document.getElementById("logout-button");

  if (logoutButton) {
    if (globalThis.location.pathname === "/login") {
      logoutButton.classList.add("is-hidden");
    } else {
      logoutButton.classList.remove("is-hidden");
    }
    logoutButton.addEventListener("click", async () => {
      await logout();
    });
  }
});

let hideTimer = null;
const TIMEOUT_DURATION = 5000;

export const setNotificationVisibility = (enable, type = "is-info") => {
  const notificationSection = document.querySelector(".notification-section");
  const notificationContainer = document.getElementById(
    "notification-container"
  );
  if (notificationContainer) {
    if (enable === true) {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }

      notificationContainer.classList.remove(
        "is-info",
        "is-warning",
        "is-danger",
        "is-success",
        "is-primary"
      );
      notificationContainer.classList.add(type);
      notificationSection.classList.add("is-active");
      hideTimer = setTimeout(() => {
        notificationSection.classList.remove("is-active");
        hideTimer = null;
      }, TIMEOUT_DURATION);
    } else {
      notificationSection.classList.remove("is-active");
    }
  }
};

export const setNotification = (msg, type = "is-info") => {
  const notificationMessage = document.getElementById("notification-message");
  if (notificationMessage) {
    notificationMessage.innerHTML = msg;
    setNotificationVisibility(true, type);
  }
};
