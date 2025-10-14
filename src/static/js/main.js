const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const scrollbarWidthCssVar = "--pico-scrollbar-width";
const animationDuration = 400; // ms
let visibleModal = null;

const toggleModal = (event) => {
  event.preventDefault();
  const modal = document.getElementById(event.currentTarget.dataset.target);
  if (!modal) return;
  modal && (modal.open ? closeModal(modal) : openModal(modal));
};

const openModal = (modal) => {
  const { documentElement: html } = document;
  const scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth) {
    html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth}px`);
  }
  html.classList.add(isOpenClass, openingClass);
  setTimeout(() => {
    visibleModal = modal;
    html.classList.remove(openingClass);
  }, animationDuration);
  modal.showModal();
};

const closeModal = (modal) => {
  visibleModal = null;
  const { documentElement: html } = document;
  html.classList.add(closingClass);
  setTimeout(() => {
    html.classList.remove(closingClass, isOpenClass);
    html.style.removeProperty(scrollbarWidthCssVar);
    modal.close();
  }, animationDuration);
};

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && visibleModal) {
    closeModal(visibleModal);
  }
});

// Get scrollbar width
const getScrollbarWidth = () => {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  return scrollbarWidth;
};

// Is scrollbar visible
const isScrollbarVisible = () => {
  return document.body.scrollHeight > screen.height;
};

const setImage = async (id) => {
  console.log("Hi", id);
  const url = "/image/delete/" + id;
  try {
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`Error trying to delete image ID: ${id}`);
    }
  } catch (error) {
    console.error(error);
  }
};

const fileInput = document.getElementById("file-upload");
const uploadButton = document.getElementById("upload-button");

uploadButton.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Choose a file first!");
    return;
  }

  const form = new FormData();
  form.append("file", file);

  try {
    url = "/image/upload";
    const response = await fetch(url, {
      method: "POST",
      body: form,
    });

    if (!response.ok) throw new Error("Error uploading image!");
    const data = await response.json();
    console.log("Uploaded:", data);
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Upload failed.");
  }
});

const deleteButton = document.getElementById("delete-button");

const deleteImage = async (id) => {
  try {
    url = `/image/delete/${id}`;
    const response = await fetch(url, {
      method: "POST",
    });

    if (!response.ok) throw new Error(`Error deleting image ID: ${id}`);
    const data = await response.json();
    console.log("Deleted:", data);
  } catch (error) {
    console.error("Deletion failed:", error);
    alert("Deletion failed.");
  }
};
