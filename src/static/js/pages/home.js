import {
  getModalTarget,
  closeAllModals,
  attachModelCloseEvents,
  openModal,
} from "../components/modal.js";
import { setNotification } from "../pages/base.js";
import { imageListSetup } from "../components/image-list.js";
import { bus } from "../utils/bus.js";
import { setupUploadModal } from "../components/upload-image.js";

let openUploadModalButton;
let appModalContainer;

const handleImageEvents = async (event) => {
  switch (event.type) {
    case "image-deleted":
      closeAllModals();
      break;
    case "image-delete-selected":
    case "image-clicked":
    case "image-delete":
      closeAllModals();
      openModal(event.detail.modalContent);
      break;
    case "close-modal":
      closeAllModals();
      break;
  }
  if (event?.detail?.message)
    setNotification(event.detail.message, event.detail.type);
};

bus.addEventListener("image-delete", handleImageEvents);
bus.addEventListener("image-deleted", handleImageEvents);
bus.addEventListener("image-delete-selected", handleImageEvents);
bus.addEventListener("image-uploaded", handleImageEvents);
bus.addEventListener("image-set", handleImageEvents);
bus.addEventListener("image-clicked", handleImageEvents);
bus.addEventListener("image-search", handleImageEvents);
bus.addEventListener("close-modal", handleImageEvents);

document.addEventListener("DOMContentLoaded", async () => {
  attachModelCloseEvents();
  await imageListSetup();

  openUploadModalButton = document.getElementById("open-upload-modal-button");

  openUploadModalButton.addEventListener("click", () => {
    const template = document.getElementById("upload-form-template");
    const clone = template.content.cloneNode(true);

    openModal(clone, (root) => {
      return setupUploadModal(root);
    });
  });
});
