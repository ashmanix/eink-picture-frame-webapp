import {
  updateList,
  deleteImage,
  setImage,
} from "../components/image-utils.js";

const deleteButton = document.getElementById("delete-button");
const refreshButton = document.getElementById("refresh-list-button");

refreshButton.addEventListener("click", async () => {
  await updateList();
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
});

const setButtonListeners = () => {
  document.querySelectorAll(".set-image-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      if (id) {
        setImage(id);
      }
    });
  });

  document.querySelectorAll(".delete-image-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      if (id) {
        deleteImage(id);
      }
    });
  });
};
