import { updateAllDetails, uploadImage } from "../components/image-utils.js";
const uploadButton = document.getElementById("upload-button");
const fileInput = document.querySelector(
  "#upload-image-input input[type=file]"
);

let file = null;

fileInput.onchange = () => {
  if (fileInput.isDefaultNamespace.length > 0) {
    const fileName = document.querySelector("#upload-image-input .file-name");
    file = fileInput.files[0];
    fileName.textContent = file.name;
    uploadButton.disabled = false;
  }
};

uploadButton.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Choose a file first!");
    return;
  }

  await uploadImage(file);

  // const form = new FormData();
  // form.append("file", file);

  // try {
  //   const url = "/image/upload";
  //   const response = await fetch(url, {
  //     method: "POST",
  //     body: form,
  //   });

  //   if (!response.ok) throw new Error("Error uploading image!");
  //   const data = await response.json();
  //   console.log("Uploaded:", data);
  //   await updateAllDetails();
  // } catch (error) {
  //   console.error("Upload failed:", error);
  //   alert("Upload failed.");
  // }
});
