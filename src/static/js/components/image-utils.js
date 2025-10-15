export const updateList = async () => {
  try {
    const url = `/image_list/partial`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Error getting image list partial`);
    const html = await response.text();

    document.getElementById("image-list-container").innerHTML = html;
  } catch (error) {
    console.error("Image partial retrieval failed:", error);
    alert("Image partial retrieval failed.");
  }
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
    updateList();
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
