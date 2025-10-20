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
let uploadImageMainText;
let uploadImageContainer;
let fileInput;
let fileNamesListContainer;

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
  uploadButton.disabled = true;
  clearUploadSelectionButton.disabled = true;
  uploadButton?.classList.remove("is-loading");
  fileNamesListContainer.innerHTML = "";
  toggleUploadImageView(true);
};

const toggleUploadImageView = (showView) => {
  if (showView === true) {
    fileNamesListContainer.classList.add("is-hidden");
    uploadImageMainText.classList.remove("is-hidden");
  } else {
    fileNamesListContainer.classList.remove("is-hidden");
    uploadImageMainText.classList.add("is-hidden");
  }
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
  fileNamesListContainer = document.getElementById("selected-images-container");
  uploadImageMainText = document.getElementById("upload-images-main-text");

  fileInput.onchange = () => {
    if (fileInput.isDefaultNamespace.length > 0) {
      const fileArray = Array.from(fileInput.files);
      if (fileArray.length == 0) {
        toggleUploadImageView(true);
        clearImageUploadSelection();
        return;
      }
      fileNamesListContainer.innerHTML = "";
      toggleUploadImageView(false);
      const listContainerElement = document.createElement("div");
      listContainerElement.classList.add("mb-4");
      const paragraphElement = document.createElement("p");
      paragraphElement.textContent = "Images selected";
      paragraphElement.classList.add("subtitle");
      listContainerElement.appendChild(paragraphElement);
      for (const file of fileArray) {
        const listItemElement = document.createElement("p");
        listItemElement.textContent = file.name;
        listItemElement.classList.add("subtitle", "is-size-6");
        listContainerElement.appendChild(listItemElement);
        fileNamesListContainer.appendChild(listContainerElement);
      }

      uploadButton.disabled = false;
      clearUploadSelectionButton.disabled = false;
    }
  };

  uploadButton.addEventListener("click", async () => {
    uploadButton.classList.toggle("is-loading");
    const fileArray = Array.from(fileInput.files);
    if (!fileArray?.length) {
      setNotification(`Select images for upload`, "is-warning");
      uploadButton.classList.toggle("is-loading");
      return;
    }
    closeAllModals();
    clearUploadSelectionButton.disabled = true;
    fileInput.disabled = true;
    const failedUploads = [];
    for (const file of fileArray) {
      const result = await uploadImage(file);
      if (result.error) {
        failedUploads.push({
          filename: file.name,
          result,
        });
      }
    }
    clearUploadSelectionButton.disabled = false;
    fileInput.disabled = false;

    if (failedUploads?.length) {
      let errorMessage = "";
      for (const uploadRes of failedUploads) {
        if (errorMessage) errorMessage += "</br>";

        errorMessage += createErrorMessage(
          `File: ${uploadRes?.filename} failed to upload.`,
          uploadRes.result
        );
      }
      setNotification(errorMessage, "is-danger");
    } else {
      refreshPage();
      setNotification(`Files uploaded successfully`, "is-success");
    }
    clearImageUploadSelection();
  });

  clearUploadSelectionButton.addEventListener("click", () => {
    clearImageUploadSelection();
  });

  uploadImageContainer = document.querySelector(".upload-image-container");

  let dragDepth = 0;

  uploadImageContainer.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const items = event.dataTransfer.items;
    let hasImage = false;

    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        hasImage = true;
        break;
      }
    }

    if (hasImage) {
      uploadImageContainer.classList.add("is-dragover");
    } else {
      uploadImageContainer.classList.remove("is-dragover");
    }
  });

  uploadImageContainer.addEventListener("dragenter", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const items = event.dataTransfer.items;
    let hasImage = false;

    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        hasImage = true;
        break;
      }
    }

    if (hasImage && ++dragDepth === 1) {
      uploadImageContainer.classList.add("is-dragover");
    }
  });

  uploadImageContainer.addEventListener("dragleave", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (--dragDepth === 0) uploadImageContainer.classList.remove("is-dragover");
  });

  uploadImageContainer.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();

    uploadImageContainer.classList.remove("is-dragover");

    const dataTransfer = new DataTransfer();
    for (const file of fileInput.files) dataTransfer.items.add(file);
    for (const file of event.dataTransfer.files) {
      if (file.type.startsWith("image/")) dataTransfer.items.add(file);
    }

    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change"));
  });
});
