import {
  updateList,
  deleteImage,
  setImage,
  uploadImage,
} from "../components/image-utils.js";

const refreshButton = document.getElementById("refresh-list-button");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

const runImageSearch = async () => {
  const searchValue = searchInput.value;
  if (searchValue) await updateList(searchValue);
  else await updateList();
};

refreshButton.addEventListener("click", async () => {
  await runImageSearch();
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#image-list-container");
  container.addEventListener("click", async (event) => {
    if (event.target.matches(".set-image-button")) {
      const id = event.target.dataset.id;
      if (id) {
        await setImage(id);
      }
    } else if (event.target.matches(".delete-image-button")) {
      const id = event.target.dataset.id;
      if (id) {
        await deleteImage(id);
        await updateAllDetails();
      }
    }
  });

  searchButton.addEventListener("click", (event) => {
    const searchValue = searchInput.value;

    if (searchValue) {
      console.log(`Search value: ${searchValue}`);
      updateList(searchValue);
    }
  });

  searchInput.addEventListener("input", (event) => {
    const value = event.target.value;
    if (value?.length > 2) {
      searchButton.disabled = false;
    } else if (value?.length == 0) {
      updateList();
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
  const file = fileInput.files[0];
  if (!file) {
    alert("Choose a file first!");
    return;
  }

  await uploadImage(file);
  fileInput.value = "";
  fileName.textContent = "No Image Selected";
  uploadButton.disabled = true;
});
