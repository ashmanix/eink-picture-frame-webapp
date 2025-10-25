const cleanups = new WeakMap();

const getModalContent = () => document.querySelector(".modal-content");

export const getModalTarget = () => document.getElementById("app-modal");

export const openModal = (insertElement = null, init = null) => {
  const modalContent = getModalContent();
  const modalTarget = getModalTarget();

  if (modalContent && insertElement) {
    modalContent.appendChild(insertElement);
  }
  const disposer =
    typeof init === "function" ? init(modalContent || modalTarget) : null;
  if (disposer) cleanups.set(modalTarget, disposer);

  modalTarget.classList.add("is-active");
};

export const closeModal = (element) => {
  element.classList.remove("is-active");

  cleanups.get(element)?.();
  cleanups.delete(element);

  const modalContent = getModalContent();
  if (modalContent) modalContent.innerHTML = "";
};

export const closeAllModals = () => {
  (document.querySelectorAll(".modal") || []).forEach(closeModal);
};

export const attachModelCloseEvents = () => {
  (
    document.querySelectorAll(
      ".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button"
    ) || []
  ).forEach((close) => {
    const $target = close.closest(".modal");
    close.addEventListener("click", () => {
      closeModal($target);
    });
  });
};

// Close all modals on Escape key press
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAllModals();
});
