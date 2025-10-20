import { uploadImage, updateAllDetails } from "../utils/api.js";
import {
  getModalTarget,
  closeAllModals,
  attachModelCloseEvents,
  openModal,
} from "../components/modal.js";
import { createErrorMessage } from "../utils/messages.js";
import { setNotification } from "../pages/base.js";
import { imageListSetup, runImageSearch } from "../components/image-list.js";
import { bus } from "../utils/bus.js";

let uploadButton;
let clearUploadSelectionButton;
let fileInput;
let fileName;
let files = [];

const handleImageEvents = async (event) => {
  switch (event.type) {
    case "image-delete":
      console.log("Image delete!: ", event);
      closeAllModals();
      openModal(getModalTarget(), event.detail.modalContent);
      break;
    case "image-deleted":
      console.log("Image deleted!: ", event);
      closeAllModals();
      break;
    case "image-clicked":
      console.log("Image clicked!: ", event);
      closeAllModals();
      openModal(getModalTarget(), event.detail.modalContent);
      break;
    case "image-delete-selected":
      closeAllModals();
      openModal(getModalTarget(), event.detail.modalContent);
      console.log(event);
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

const refreshPage = async () => {
  await updateAllDetails();
  attachModelCloseEvents();
};

const clearImageUploadSelection = () => {
  fileInput.value = "";
  fileName.textContent = "Nothing selected";
  uploadButton.disabled = true;
  clearUploadSelectionButton.disabled = true;
  uploadButton?.classList.remove("is-loading");
};

document.addEventListener("DOMContentLoaded", async () => {
  attachModelCloseEvents();
  await imageListSetup();
  await runImageSearch();

  uploadButton = document.getElementById("upload-button");
  clearUploadSelectionButton = document.getElementById(
    "clear-image-selection-button"
  );
  fileInput = document.querySelector("#upload-image-input input[type=file]");
  fileName = document.querySelector("#upload-image-input .file-name");

  fileInput.onchange = () => {
    if (fileInput.isDefaultNamespace.length > 0) {
      const fileArray = Array.from(fileInput.files);
      let names = "";
      console.log("FilesArray: ", fileArray);
      if (fileArray.length == 0) {
        clearImageUploadSelection();
        return;
      }
      for (const [index, file] of fileArray.entries()) {
        names = names + `${file.name}`;
        if (index < fileArray.length - 1) names = names + ",";
      }
      fileName.textContent = names;
      uploadButton.disabled = false;
      clearUploadSelectionButton.disabled = false;
    } else {
      console.log("Empty!");
    }
  };

  uploadButton.addEventListener("click", async () => {
    uploadButton.classList.toggle("is-loading");
    const files = [...fileInput.files];
    const filename = file?.name;
    if (!files?.length) {
      setNotification(`Select images for upload`, "is-warning");
      uploadButton.classList.toggle("is-loading");
      return;
    }
    closeAllModals();
    const result = await uploadImage(file);

    if (result?.error) {
      setNotification(
        createErrorMessage(
          `Error attempting to upload <strong>${filename}</strong>`,
          result
        ),
        "is-danger"
      );
    } else {
      refreshPage();
      setNotification(`${filename} uploaded successfully`, "is-success");
    }
    clearImageUploadSelection();
  });

  clearUploadSelectionButton.addEventListener("click", () => {
    clearImageUploadSelection();
  });
});
