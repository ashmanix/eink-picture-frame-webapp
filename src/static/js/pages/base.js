document.addEventListener("DOMContentLoaded", () => {
  const notificationDeleteButton = document.getElementById(
    "notification-hide-button"
  );
  notificationDeleteButton.addEventListener("click", async (event) => {
    setNotificationVisibility(false);
  });
});

export const setNotificationVisibility = (enable, type = "is-info") => {
  const notificationContainer = document.getElementById(
    "notification-container"
  );
  if (notificationContainer) {
    if (enable === true) {
      notificationContainer.classList.remove(
        "is-info",
        "is-warning",
        "is-danger",
        "is-success",
        "is-primary"
      );
      notificationContainer.classList.add(type);
      notificationContainer.classList.add("is-active");
    } else {
      notificationContainer.classList.remove("is-active");
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
