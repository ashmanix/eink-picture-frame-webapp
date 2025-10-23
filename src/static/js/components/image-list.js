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
let selectAllToggleButton;
let selectedImages = [];
let search = null;
let pageNo = 1;
let pageSize = 25;

export const runImageSearch = async (clearList = false, pNo = pageNo) => {
  searchButton.classList.toggle("is-loading");

  const url = new URL(globalThis.location);
  const prevSearch = url.searchParams.get("search") ?? "";
  const searchValue = (searchInput.value || "").trim();

  if (!clearList && searchValue !== prevSearch) pNo = 1;

  try {
    if (clearList || !searchValue) {
      url.searchParams.delete("search");
      url.searchParams.set("pageNo", pNo);
      url.searchParams.set("pageSize", pageSize);
      history.replaceState(null, "", url);

      console.log(`Here, page no: ${pNo}, search value: ${searchValue}`);

      const result = await updateList(null, pNo, pageSize);

      if (result?.error) {
        const message = createErrorMessage("Error loading image list", result);
        sendBusEvent("image-search", message, "is-danger");
      }
    } else {
      url.searchParams.set("search", searchValue);
      url.searchParams.set("pageNo", pNo);
      url.searchParams.set("pageSize", pageSize);
      history.replaceState(null, "", url);

      const result = await updateList(searchValue, pNo, pageSize);
      if (result?.error) {
        const message = createErrorMessage(
          "Error searching image list",
          result
        );
        sendBusEvent("image-search", message, "is-danger");
      }
    }
    attachModelCloseEvents?.();
    pageNo = pNo;
  } finally {
    searchButton.classList.toggle("is-loading");
  }
};

const toggleEnableImageButtons = (id, enable) => {
  const deleteButton = document.querySelector(
    `.delete-image-button[data-id="${id}"]`
  );

  const setButton = document.querySelector(
    `.set-image-button[data-id="${id}"]`
  );

  const tableRow = document.querySelector(`tr[data-id="${id}"]`);

  for (const element of [tableRow, deleteButton, setButton]) {
    if (element) {
      enable
        ? element.classList.remove("is-skeleton")
        : element.classList.add("is-skeleton");
    }
  }
};

const getParamsFromInitialUrl = () => {
  let params = new URLSearchParams(document.location.search);
  const searchParam = params.get("search");
  if (searchParam) search = searchParam;
  const pageNoParam = Number.parseInt(params.get("pageNo"));
  if (pageNoParam) pageNo = pageNoParam;
  const pageSizeParam = Number.parseInt(params.get("pageSize"));
  if (pageSizeParam) pageSize = pageSizeParam;
};

export const imageListSetup = async () => {
  refreshButton = document.getElementById("refresh-list-button");
  searchButton = document.getElementById("search-button");
  searchInput = document.getElementById("search-input");
  deleteAllButton = document.getElementById("delete-all-button");
  selectAllToggleButton = document.getElementById("select-all-toggle-button");

  getParamsFromInitialUrl();

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
      return;
    }

    const deleteButton = event.target.closest(".delete-image-button");
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      const filename = deleteButton.dataset.filename;

      const modalContent = createDeleteConfirmation({ id, filename });
      sendBusEvent("image-delete", null, null, modalContent);
      return;
    }

    const imageButton = event.target.closest(".thumb-container");

    if (imageButton) {
      event.stopPropagation();
      event.preventDefault();
      const filename = imageButton.dataset.filename;
      const imageContainerElement = document.createElement("div");
      imageContainerElement.classList.add("modal-image");
      const imageElement = document.createElement("img");
      imageElement.src = `${THUMBNAIL_FOLDER_LOCATION}/${filename}`;
      imageElement.alt = filename;
      imageContainerElement.appendChild(imageElement);

      sendBusEvent("image-clicked", null, null, imageContainerElement);
      return;
    }

    const imageDetailsRow = event.target.closest(".image-details-row");

    if (imageDetailsRow) {
      imageDetailsRow.classList.toggle("is-selected");

      if (imageDetailsRow?.classList.contains("is-selected") === true) {
        addImageToList(
          imageDetailsRow?.dataset?.id,
          imageDetailsRow?.dataset?.filename
        );
      } else {
        removeImageFromList(imageDetailsRow?.dataset?.id);
      }
      return;
    }

    const pagination = event.target.closest(".pagination");

    if (pagination) {
      const pageToGoTo = Number.parseInt(event.target?.dataset?.page);
      if (!Number.isNaN(pageToGoTo)) {
        console.log(searchInput.value, pageToGoTo, pageSize);
        await runImageSearch(false, pageToGoTo);
      }
    }
  });

  if (search) searchInput.value = search;

  searchButton.addEventListener("click", () => {
    runImageSearch(false, 1);
  });

  searchInput.addEventListener("input", (event) => {
    const value = event.target.value;
    if (value?.length > 2) {
      searchButton.disabled = false;
    } else if (value?.length == 0) {
      runImageSearch(true, 1);
    } else {
      searchButton.disabled = true;
    }
  });

  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      if (searchButton.disabled === false) runImageSearch(false);
    }
  });

  refreshButton.addEventListener("click", async () => {
    refreshButton.classList.toggle("is-loading");
    await runImageSearch(false);
    refreshButton.classList.toggle("is-loading");
  });

  deleteAllButton.addEventListener("click", async () => {
    if (!selectedImages.length) return;

    const modalContent = createMultipleDeleteConfirmation(selectedImages);
    sendBusEvent("image-delete-selected", null, null, modalContent);
  });

  selectAllToggleButton.addEventListener("click", async () => {
    let isSelection = false;
    const allRows = document.querySelectorAll(".image-details-row");

    const selectedRows = document.querySelectorAll(
      ".image-details-row.is-selected"
    );

    if (selectedRows?.length) isSelection = true;

    if (isSelection === false) {
      for (const row of allRows) {
        row.classList.add("is-selected");
        addImageToList(row.dataset.id, row.dataset.filename);
      }
    } else {
      for (const row of selectedRows) {
        row.classList.remove("is-selected");
        removeImageFromList(row.dataset.id);
      }
    }

    isSelection = !isSelection;

    deleteAllButton.disabled = !isSelection;
  });
};

const addImageToList = (id, filename) => {
  const foundImage = selectedImages.find((image) => image?.id === id);
  if (!foundImage) selectedImages.push({ id, filename });

  if (selectedImages.length && deleteAllButton?.disabled)
    deleteAllButton.disabled = false;
};

const removeImageFromList = (id) => {
  selectedImages = selectedImages.filter((image) => image?.id !== id);

  if (!selectedImages.length && deleteAllButton)
    deleteAllButton.disabled = true;
};

const createDeleteConfirmation = (imageToDelete) => {
  const container = document.createElement("div");
  container.classList.add("notification", "notification-container");

  const message = document.createElement("p");
  message.textContent = `Do you wish to delete ${imageToDelete?.filename}?`;
  message.classList.add("title", "is-5", "mb-3");
  container.appendChild(message);

  const buttons = document.createElement("div");
  buttons.classList.add("buttons", "is-right");

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Confirm";
  confirmBtn.classList.add("button", "is-danger");
  confirmBtn.addEventListener("click", async () => {
    toggleEnableImageButtons(imageToDelete?.id, false);
    sendBusEvent("close-modal");
    const result = await deleteImage(imageToDelete?.id);
    if (result?.error) {
      const message = createErrorMessage(
        `Error attempting to delete image ${imageToDelete?.filename}`,
        result
      );
      toggleEnableImageButtons(imageToDelete?.id, true);
      sendBusEvent("image-deleted", message, "is-danger");
    } else {
      sendBusEvent(
        "image-deleted",
        `${imageToDelete?.filename} deleted successfully`,
        "is-success"
      );
    }
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.classList.add("button");
  cancelBtn.addEventListener("click", () => {
    sendBusEvent("close-modal");
  });

  buttons.appendChild(cancelBtn);
  buttons.appendChild(confirmBtn);
  container.appendChild(buttons);
  return container;
};

const createMultipleDeleteConfirmation = (imagesToDelete) => {
  const container = document.createElement("div");
  container.classList.add("notification", "notification-container", "content");

  const message = document.createElement("p");
  message.textContent = "Do you wish to delete the following images?";
  message.classList.add("title", "is-5", "mb-3");
  container.appendChild(message);

  const list = document.createElement("ul");
  list.classList.add("mb-4");

  for (const [, image] of imagesToDelete.entries()) {
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
      toggleEnableImageButtons(image?.id, false);
      return Number(image?.id);
    });
    sendBusEvent("close-modal");
    const result = await deleteMultipleImage(imageList);
    if (result?.error) {
      deleteAllButton.disabled = false;
      for (const image of imagesToDelete) {
        toggleEnableImageButtons(image?.id, true);
      }
      const message = createErrorMessage(
        `Error deleting multiple messages`,
        result
      );
      sendBusEvent("image-deleted", message, "is-danger");
    } else {
      deleteAllButton.disabled = true;
      selectedImages = [];
      sendBusEvent(
        "image-deleted",
        "Images deleted successfully",
        "is-success"
      );
    }
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.classList.add("button");
  cancelBtn.addEventListener("click", () => {
    sendBusEvent("close-modal");
  });

  buttons.appendChild(cancelBtn);
  buttons.appendChild(confirmBtn);
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
