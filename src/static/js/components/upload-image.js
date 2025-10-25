import { uploadImage, updateAllDetails } from "../utils/api.js";
import { createErrorMessage } from "../utils/messages.js";
import { closeAllModals, attachModelCloseEvents } from "./modal.js";
import { setNotification } from "../pages/base.js";

let uploadButton;
let clearUploadSelectionButton;
let uploadImageMainText;
let uploadImageContainer;
let fileInput;
let fileNamesListContainer;

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

export const setupUploadModal = (root) => {
  const abortController = new AbortController();
  const eventListenerOptions = { signal: abortController.signal };

  uploadButton = document.getElementById("upload-button");
  clearUploadSelectionButton = document.getElementById(
    "clear-image-selection-button"
  );
  fileInput = document.querySelector("#upload-image-input input[type=file]");
  fileNamesListContainer = document.getElementById("selected-images-container");
  uploadImageMainText = document.getElementById("upload-images-main-text");
  uploadImageContainer = document.querySelector(".upload-image-container");

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
      const imageUploadSelectionContainer = document.createElement("div");
      imageUploadSelectionContainer.classList.add("mb-4");
      const paragraphElement = document.createElement("p");
      paragraphElement.classList.add("cell", "title", "is-5");
      paragraphElement.textContent = "Images selected";
      const listContainerElement = document.createElement("div");
      listContainerElement.classList.add("mb-4", "grid");

      for (const file of fileArray) {
        const listItemElement = document.createElement("p");
        listItemElement.textContent = file.name;
        listItemElement.classList.add("subtitle", "is-size-6");
        listContainerElement.appendChild(listItemElement);
      }
      imageUploadSelectionContainer.appendChild(paragraphElement);
      imageUploadSelectionContainer.appendChild(listContainerElement);
      fileNamesListContainer.appendChild(imageUploadSelectionContainer);

      uploadButton.disabled = false;
      clearUploadSelectionButton.disabled = false;
    }
  };

  uploadButton.addEventListener(
    "click",
    async () => {
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
      const successUploads = [];
      for (const file of fileArray) {
        const result = await uploadImage(file);
        if (result.error) {
          failedUploads.push({
            filename: file.name,
            result,
          });
        } else {
          successUploads.push({
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
          if (errorMessage) errorMessage += "</br></br>";

          errorMessage += createErrorMessage(
            `File: <strong>${uploadRes?.filename}</strong> failed to upload.`,
            uploadRes.result
          );
        }
        setNotification(errorMessage, "is-danger");
        if (successUploads.length) refreshPage();
      } else {
        refreshPage();
        setNotification(`Files uploaded successfully`, "is-success");
      }
      clearImageUploadSelection();
    },
    eventListenerOptions
  );

  clearUploadSelectionButton.addEventListener(
    "click",
    () => {
      clearImageUploadSelection();
    },
    eventListenerOptions
  );

  let dragDepth = 0;

  uploadImageContainer.addEventListener(
    "dragover",
    (event) => {
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
    },
    eventListenerOptions
  );

  uploadImageContainer.addEventListener(
    "dragenter",
    (event) => {
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
    },
    eventListenerOptions
  );

  uploadImageContainer.addEventListener(
    "dragleave",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (--dragDepth === 0)
        uploadImageContainer.classList.remove("is-dragover");
    },
    eventListenerOptions
  );

  uploadImageContainer.addEventListener(
    "drop",
    (event) => {
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
    },
    eventListenerOptions
  );
};
