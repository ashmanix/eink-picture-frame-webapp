import { updateList, deleteImage, setImage } from "../utils/api.js";
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
        bus.dispatchEvent(
          new CustomEvent("image-search", {
            detail: { message: message, type: "is-danger" },
          })
        );
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
        bus.dispatchEvent(
          new CustomEvent("image-set", {
            detail: { message: message, type: "is-danger" },
          })
        );
      } else {
        const message = `${filename} set as frame image`;
        bus.dispatchEvent(
          new CustomEvent("image-set", {
            detail: { message: message, type: "is-success" },
          })
        );
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
        bus.dispatchEvent(
          new CustomEvent("image-deleted", {
            detail: { message: message, type: "is-error" },
          })
        );
      } else {
        const message = `${filename} deleted successfully`;
        bus.dispatchEvent(
          new CustomEvent("image-deleted", {
            detail: { message, type: "is-success" },
          })
        );
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

      bus.dispatchEvent(
        new CustomEvent("image-clicked", {
          detail: {
            modalContent: imageContainerElement,
          },
        })
      );
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
      console.log("Image List: ", imagesSelected);
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
    console.log("Delete All");
    // const modelTarget = getModalTarget();
    // closeAllModals();
    // openModal(modelTarget);

    bus.dispatchEvent(
      new CustomEvent("image-delete-selected", {
        detail: {
          imagesSelected,
        },
      })
    );
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
