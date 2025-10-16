export const updateList = async (search = null) => {
  try {
    const url = new URL(globalThis.location.href + `image_list/partial`);
    if (search) {
      url.searchParams.set("search", search);
    }
    const response = await fetch(url.toString());

    if (!response.ok) throw new Error(`Error getting image list partial`);
    const html = await response.text();

    document.getElementById("image-list-container").innerHTML = html;
  } catch (error) {
    console.error("Image partial retrieval failed:", error);
  }
};

export const updateStorageDetails = async () => {
  try {
    const url = new URL(globalThis.location.href + `storage/partial`);
    const response = await fetch(url.toString());

    if (!response.ok) throw new Error(`Error getting storage partial`);
    const html = await response.text();

    document.getElementById("storage-details-container").innerHTML = html;
  } catch (error) {
    console.error("Storafe partial retrieval failed:", error);
  }
};

export const updateAllDetails = async () => {
  await updateList();
  await updateStorageDetails();
};

export const deleteImage = async (id) => {
  try {
    const url = `/image/delete/${id}`;
    const response = await fetch(url, {
      method: "POST",
    });

    if (!response.ok) throw new Error(`Error deleting image ID: ${id}`);
    const data = await response.json();
    console.log("Deleted:", data);
  } catch (error) {
    console.error("Deletion failed:", error);
    alert("Deletion failed.");
  } finally {
    updateAllDetails();
  }
};

export const setImage = async (id) => {
  const url = "/image/display/" + id;
  try {
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
      throw new Error(`Error trying to set image to image ID: ${id}`);
    }
  } catch (error) {
    console.error(error);
  }
};

export const uploadImage = async (file) => {
  const form = new FormData();
  form.append("file", file);

  try {
    const url = "/image/upload";
    const response = await fetch(url, {
      method: "POST",
      body: form,
    });

    if (!response.ok) throw new Error("Error uploading image!");
    const data = await response.json();
    console.log("Uploaded:", data);
    await updateAllDetails();
    return true;
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
