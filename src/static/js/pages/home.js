import {
  updateList,
  deleteImage,
  setImage,
  uploadImage,
  updateAllDetails,
} from "../components/image-utils.js";

import {
  openModal,
  getModalTarget,
  closeAllModals,
  attachModelCloseEvents,
} from "../components/modal.js";

import { setNotification } from "../pages/base.js";

import { THUMBNAIL_FOLDER_LOCATION } from "../constants.js";

const refreshButton = document.getElementById("refresh-list-button");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

const refreshPage = async () => {
  await updateAllDetails();
  attachModelCloseEvents();
};

const runImageSearch = async (value = null, clearList = null) => {
  searchButton.classList.toggle("is-loading");

  if (clearList) {
    await updateList();
  } else {
    const searchValue = value ?? searchInput.value;
    if (searchValue) {
      const result = await updateList(searchValue);
      if (result?.error) {
        setNotification(
          createErrorMessage("Error searching image list", result),
          "is-danger"
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

refreshButton.addEventListener("click", async () => {
  refreshButton.classList.toggle("is-loading");
  await runImageSearch();
  refreshButton.classList.toggle("is-loading");
});

document.addEventListener("DOMContentLoaded", () => {
  attachModelCloseEvents();

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
        setNotification(
          createErrorMessage(
            `Error attempting to set ${filename} as frame image`,
            result
          ),
          "is-danger"
        );
      } else {
        setNotification(`${filename} set as frame image`, "is-success");
      }
    }

    const deleteButton = event.target.closest(".delete-image-button");
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      const filename = deleteButton.dataset.filename;
      toggleEnableImageButtons(id, false);
      const result = await deleteImage(id);
      if (result.error) {
        setNotification(
          createErrorMessage(`Error attempting to delete ${filename}`, result),
          "is-danger"
        );
      } else {
        setNotification(`${filename} deleted successfully`, "is-success");
      }
      await refreshPage();
    }

    const imageButton = event.target.closest(".thumb-container");

    if (imageButton) {
      const modelTarget = getModalTarget();
      const imageSource = document.querySelector(".image-img");
      if (imageSource) {
        const filename = imageButton.dataset.filename;
        imageSource.src = `${THUMBNAIL_FOLDER_LOCATION}/${filename}`;
        closeAllModals();
        openModal(modelTarget);
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

const createErrorMessage = (msg, result) => {
  return `${msg} ${
    result?.detail ? `<br/><strong>Reason:</strong> ${result.detail}` : ""
  }`;
};
