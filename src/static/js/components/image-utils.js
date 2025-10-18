export const updateList = async (search = null) => {
  const url = new URL(globalThis.location.href + `image_list/partial`);
  if (search) {
    url.searchParams.set("search", search);
  }

  const response = await callAPI(url, {}, "getting image list partial", "html");
  if (response?.error) {
    return response;
  }

  const html = response;

  document.getElementById("image-list-container").innerHTML = html;
  return true;
};

export const updateStorageDetails = async () => {
  const url = new URL(globalThis.location.href + `storage/partial`);
  const response = await callAPI(url, {}, "getting storage partial", "html");

  if (response?.error) {
    return response;
  }

  const html = response;

  document.getElementById("storage-details-container").innerHTML = html;
  return true;
};

export const updateAllDetails = async () => {
  await updateList();
  await updateStorageDetails();
};

export const deleteImage = async (id) => {
  const url = `/image/delete/${id}`;
  const options = {
    method: "POST",
  };

  const result = await callAPI(url, options);

  if (result?.error) {
    return result;
  }
  updateAllDetails();
};

export const setImage = async (id) => {
  const url = "/image/display/" + id;
  const options = { method: "POST" };

  return callAPI(url, options);
};

export const uploadImage = async (file) => {
  const form = new FormData();
  form.append("file", file);

  const url = "/image/upload";
  const options = {
    method: "POST",
    body: form,
  };

  return callAPI(url, options, "uploading image");
};

const callAPI = async (
  url,
  options = {},
  callType = "calling api",
  returnType = ""
) => {
  let responseBody = {};
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      responseBody = await response.json();
      throw new Error(`Error ${callType}`);
    }
    if (returnType === "html") {
      return await response.text();
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return { error: error, detail: responseBody?.detail };
  }
};
