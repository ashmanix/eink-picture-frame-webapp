import {
  updateList,
  deleteImage,
  setImage,
} from "../components/image-utils.js";

const deleteButton = document.getElementById("delete-button");
const refreshButton = document.getElementById("refresh-list-button");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

refreshButton.addEventListener("click", async () => {
  const searchValue = searchInput.value;
  if (searchValue) await updateList(searchValue);
  else await updateList();
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#image-list-container");
  container.addEventListener("click", (event) => {
    if (event.target.matches(".set-image-button")) {
      const id = event.target.dataset.id;
      if (id) {
        setImage(id);
      }
    } else if (event.target.matches(".delete-image-button")) {
      const id = event.target.dataset.id;
      if (id) {
        deleteImage(id);
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
    console.log(`Search value: ${value}`);
    console.log(`Size: ${value?.length}`);
    if (value?.length > 2) {
      searchButton.disabled = false;
    } else if (value?.length == 0) {
      updateList();
    } else {
      searchButton.disabled = true;
    }
  });
});
