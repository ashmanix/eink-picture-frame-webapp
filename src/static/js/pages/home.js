import {
  updateList,
  deleteImage,
  setImage,
  uploadImage,
} from "../components/image-utils.js";

const refreshButton = document.getElementById("refresh-list-button");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

const runImageSearch = async (value = null, clearList = null) => {
  searchButton.classList.toggle("is-loading");

  if (clearList) {
    await updateList();
  } else {
    const searchValue = value ?? searchInput.value;
    if (searchValue) await updateList(searchValue);
    else await updateList();
  }

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
  const container = document.querySelector("#image-list-container");
  container.addEventListener("click", async (event) => {
    const setButton = event.target.closest(".set-image-button");
    if (setButton) {
      const id = setButton.dataset.id;
      console.log("SET: ", id);
      toggleEnableImageButtons(id, false);
      await setImage(id);
      toggleEnableImageButtons(id, true);
    }

    const deleteButton = event.target.closest(".delete-image-button");
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      console.log("DELETE: ", id);
      toggleEnableImageButtons(id, false);
      await deleteImage(id);
      await updateAllDetails();
    }
  });

  searchButton.addEventListener("click", (event) => {
    const searchValue = searchInput.value;

    if (searchValue) {
      console.log(`Search value: ${searchValue}`);
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
  } else {
    console.log("Yo");
  }
};

uploadButton.addEventListener("click", async () => {
  uploadButton.classList.toggle("is-loading");
  const file = fileInput.files[0];
  if (!file) {
    alert("Choose a file first!");
    uploadButton.classList.toggle("is-loading");
    return;
  }

  await uploadImage(file);
  fileInput.value = "";
  fileName.textContent = "No Image Selected";
  uploadButton.disabled = true;
  uploadButton.classList.toggle("is-loading");
});
