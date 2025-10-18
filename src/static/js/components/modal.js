export const getModalTarget = () => {
  return document.getElementById("image-modal");
};

export const openModal = ($el) => {
  $el.classList.add("is-active");
};

export const closeModal = ($el) => {
  $el.classList.remove("is-active");
};

export const closeAllModals = () => {
  (document.querySelectorAll(".modal") || []).forEach(($modal) => {
    closeModal($modal);
  });
};

export const attachModelCloseEvents = () => {
  (
    document.querySelectorAll(
      ".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button"
    ) || []
  ).forEach(($close) => {
    const $target = $close.closest(".modal");

    $close.addEventListener("click", () => {
      closeModal($target);
    });
  });
};

// Close all modals on Escape key press
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAllModals();
  }
});
