import {
  updateList,
  deleteImage,
  setImage,
  deleteMultipleImage,
} from "../utils/api.js";
import { attachModelCloseEvents } from "./modal.js";
import { createErrorMessage } from "../utils/messages.js";
import { THUMBNAIL_FOLDER_LOCATION } from "../constants.js";
import { bus } from "../utils/bus.js";

let refreshButton;
let searchButton;
let searchInput;
let deleteAllButton;
const imagesSelected = [];

export const runImageSearch = async (value = null, clearList = null) => {
  searchButton.classList.toggle("is-loading");

  if (clearList) {
    await updateList();
  } else {
    const searchValue = value ?? searchInput.value;
    if (searchValue) {
      const result = await updateList(searchValue);
      if (result?.error) {
        const message = createErrorMessage(
          "Error searching image list",
          result
        );
        sendBusEvent("image-search", message, "is-danger");
      }
    } else await updateList();
  }
  attachModelCloseEvents();

  searchButton.classList.toggle("is-loading");
};

const toggleEnableImageButtons = (id, enable) => {
  const deleteButton = document.querySelector(
    `.delete-image-button[data-id="${id}"]`
  );

  const setButton = document.querySelector(
    `.set-image-button[data-id="${id}"]`
  );

  const progressBar = document.querySelector(`.progress[data-id="${id}"]`);

  enable
    ? progressBar.classList.add("is-invisible")
    : progressBar.classList.remove("is-invisible");

  for (const btn of [deleteButton, setButton]) {
    if (btn) btn.disabled = !enable;
  }
};

export const imageListSetup = async () => {
  refreshButton = document.getElementById("refresh-list-button");
  searchButton = document.getElementById("search-button");
  searchInput = document.getElementById("search-input");
  deleteAllButton = document.getElementById("delete-all-button");

  const container = document.querySelector("#image-list-container");
  container.addEventListener("click", async (event) => {
    const setButton = event.target.closest(".set-image-button");
    if (setButton) {
      const id = setButton.dataset.id;
      const filename = setButton.dataset.filename;
      toggleEnableImageButtons(id, false);
      const result = await setImage(id);
      toggleEnableImageButtons(id, true);
      if (result?.error) {
        const message = createErrorMessage(
          `Error attempting to set ${filename} as frame image`,
          result
        );
        sendBusEvent("image-set", message, "is-danger");
      } else {
        const message = `${filename} set as frame image`;
        sendBusEvent("image-set", message, "is-success");
      }
    }

    const deleteButton = event.target.closest(".delete-image-button");
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      const filename = deleteButton.dataset.filename;
      toggleEnableImageButtons(id, false);
      const result = await deleteImage(id);
      if (result?.error) {
        const message = createErrorMessage(
          `Error attempting to delete ${filename}`,
          result
        );
        sendBusEvent("image-deleted", message, "is-error");
      } else {
        const message = `${filename} deleted successfully`;
        sendBusEvent("image-deleted", message, "is-success");
      }
    }

    const imageButton = event.target.closest(".thumb-container");

    if (imageButton) {
      const filename = imageButton.dataset.filename;
      const imageContainerElement = document.createElement("div");
      imageContainerElement.classList.add("modal-image");
      const imageElement = document.createElement("img");
      imageElement.src = `${THUMBNAIL_FOLDER_LOCATION}/${filename}`;
      imageElement.alt = filename;
      imageContainerElement.appendChild(imageElement);

      sendBusEvent("image-clicked", null, null, imageContainerElement);
    }
    const imageCheckBox = event.target.closest(".image-checkbox");

    if (imageCheckBox) {
      if (imageCheckBox?.checked === true) {
        addImageToList(
          imageCheckBox?.dataset?.id,
          imageCheckBox?.dataset?.filename
        );
      } else if (imageCheckBox?.checked === false) {
        removeImageFromList(imageCheckBox?.dataset?.id);
      }
    }
  });

  searchButton.addEventListener("click", (event) => {
    const searchValue = searchInput.value;

    if (searchValue) {
      runImageSearch(searchValue);
    }
  });

  searchInput.addEventListener("input", (event) => {
    const value = event.target.value;
    if (value?.length > 2) {
      searchButton.disabled = false;
    } else if (value?.length == 0) {
      runImageSearch(null, true);
    } else {
      searchButton.disabled = true;
    }
  });

  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      if (searchButton.disabled === false) runImageSearch();
    }
  });

  refreshButton.addEventListener("click", async () => {
    refreshButton.classList.toggle("is-loading");
    await runImageSearch();
    refreshButton.classList.toggle("is-loading");
  });

  deleteAllButton.addEventListener("click", async () => {
    if (!imagesSelected.length) return;

    const modalContent = createDeleteCofirmation(imagesSelected);
    sendBusEvent("image-delete-selected", null, null, modalContent);
  });
};

const addImageToList = (id, filename) => {
  const foundImage = imagesSelected.find((image) => image?.id === id);
  if (!foundImage) imagesSelected.push({ id, filename });

  if (imagesSelected.length && deleteAllButton?.disabled)
    deleteAllButton.disabled = false;
};

const removeImageFromList = (id) => {
  const foundImageIndex = imagesSelected.findIndex((image) => image?.id === id);
  if (foundImageIndex !== -1) imagesSelected.splice(foundImageIndex, 1);

  if (!imagesSelected.length && deleteAllButton)
    deleteAllButton.disabled = true;
};

const createDeleteCofirmation = (imagesToDelete, onConfirm, onCancel) => {
  const container = document.createElement("div");
  container.classList.add("content");

  const message = document.createElement("p");
  message.textContent = "Do you wish to delete the following images?";
  message.classList.add("title", "is-5", "mb-3");
  container.appendChild(message);

  const list = document.createElement("ul");
  list.classList.add("mb-4");

  for (const [index, image] of imagesToDelete.entries()) {
    const li = document.createElement("li");
    li.textContent = image.filename;
    list.appendChild(li);
  }

  container.appendChild(list);

  const buttons = document.createElement("div");
  buttons.classList.add("buttons", "is-right");

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Confirm";
  confirmBtn.classList.add("button", "is-danger");
  confirmBtn.addEventListener("click", async () => {
    const imageList = imagesToDelete.map((image) => {
      return Number(image?.id);
    });
    const result = await deleteMultipleImage(imageList);
    sendBusEvent("close-modal");
    if (result?.error) {
      const message = createErrorMessage(
        `Error deleting multiple messages`,
        result
      );
      sendBusEvent("image-deleted", message, "is-danger");
    } else {
      sendBusEvent(
        "image-deleted",
        "Images deleted successfully",
        "is-success"
      );
    }
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.classList.add("button", "is-light");
  cancelBtn.addEventListener("click", () => {
    sendBusEvent("close-modal");
  });

  buttons.appendChild(confirmBtn);
  buttons.appendChild(cancelBtn);
  container.appendChild(buttons);

  return container;
};

const sendBusEvent = (
  eventName,
  message = null,
  messageType = null,
  modalContent = null
) => {
  let detail = {};

  if (modalContent) {
    detail = {
      modalContent,
    };
  } else if (message) {
    detail = {
      message: message,
      type: messageType,
    };
  }
  bus.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
};
