import {
  updateList,
  deleteImage,
  setImage,
} from "../components/image-utils.js";

const deleteButton = document.getElementById("delete-button");
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
        updateAllDetails();
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
      // Do something
      console.log("Enter pressed!");
      if (searchButton.disabled === false) runImageSearch();
    }
  });
});
