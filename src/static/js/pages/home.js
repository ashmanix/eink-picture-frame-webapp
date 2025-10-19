import {
  // updateList,
  // deleteImage,
  // setImage,
  uploadImage,
  updateAllDetails,
} from "../utils/api.js";
import {
  // openModal,
  getModalTarget,
  closeAllModals,
  attachModelCloseEvents,
  openModal,
} from "../components/modal.js";
import { createErrorMessage } from "../utils/messages.js";
import { setNotification } from "../pages/base.js";
import { imageListSetup, runImageSearch } from "../components/image-list.js";
import { bus } from "../utils/bus.js";

const handleImageEvents = async (event) => {
  switch (event.type) {
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

document.addEventListener("DOMContentLoaded", async () => {
  attachModelCloseEvents();
  await imageListSetup();
  await runImageSearch();
});

const uploadButton = document.getElementById("upload-button");
const fileInput = document.querySelector(
  "#upload-image-input input[type=file]"
);
const fileName = document.querySelector("#upload-image-input .file-name");

let file = null;

fileInput.onchange = () => {
  if (fileInput.isDefaultNamespace.length > 0) {
    file = fileInput.files[0];
    fileName.textContent = file.name;
    uploadButton.disabled = false;
  }
};

uploadButton.addEventListener("click", async () => {
  uploadButton.classList.toggle("is-loading");
  const file = fileInput.files[0];
  const filename = file?.name;
  if (!file) {
    setNotification(`Select an image for upload`, "is-warning");
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
  fileInput.value = "";
  fileName.textContent = "No Image Selected";
  uploadButton.disabled = true;
  uploadButton.classList.toggle("is-loading");
});
