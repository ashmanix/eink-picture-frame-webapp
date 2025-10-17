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
    notificationContainer.classList.remove(
      "is-info",
      "is-warning",
      "is-danger",
      "is-success",
      "is-primary"
    );
    notificationContainer.classList.add(type);

    enable
      ? notificationContainer.classList.remove("is-hidden")
      : notificationContainer.classList.add("is-hidden");
  }
};

export const setNotification = (msg, type = "is-info") => {
  const notificationMessage = document.getElementById("notification-message");
  if (notificationMessage) {
    notificationMessage.innerText = msg;
    setNotificationVisibility(true, type);
  }
};
