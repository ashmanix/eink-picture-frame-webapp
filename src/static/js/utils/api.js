import { TOKEN_KEY } from "../constants.js";

export const updateList = async (
  search = null,
  pageNo = null,
  pageSize = null
) => {
  const url = new URL("image_list/partial", globalThis.location.origin);
  if (search) url.searchParams.set("search", search);
  if (pageNo) url.searchParams.set("pageNo", pageNo);
  if (pageSize) url.searchParams.set("pageSize", pageSize);

  console.log("URL", url);

  const response = await callAPI(url, {}, "getting image list partial", "html");
  if (response?.error) {
    return response;
  }

  const html = response;

  document.getElementById("image-list-container").innerHTML = html;
  return true;
};

export const updateStorageDetails = async () => {
  const url = new URL("storage/partial", globalThis.location.origin);
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

export const deleteMultipleImage = async (imageList) => {
  const url = `/image/delete/`;
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(imageList),
  };

  const result = await callAPI(url, options);

  if (result?.error) {
    return result;
  }
  if (result?.failed?.length) {
    return {
      error: "Error deleting all messages",
      detail: `Some images failed to delete: ${result?.failed}`,
    };
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

export const login = async (username, password) => {
  const form = new FormData();
  form.append("username", username);
  form.append("password", password);

  const url = "/login";
  const options = {
    method: "POST",
    body: form,
  };
  const result = await callAPI(url, options);

  if (result?.error || !result?.token) return result;

  sessionStorage.setItem(TOKEN_KEY, result.token);
  globalThis.location.replace("/");
};

export const logout = async () => {
  const url = "/logout";
  const options = {
    method: "POST",
  };
  const result = await callAPI(url, options);

  if (result?.error) return result;

  sessionStorage.removeItem(TOKEN_KEY);
  globalThis.location.replace("/login");
};

const callAPI = async (
  url,
  options = {},
  callType = "calling api",
  returnType = ""
) => {
  let responseBody = {};
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const headers = { ...(options.headers || {}), "X-Session": token ?? "" };
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      globalThis.location.replace("/login");
      throw new Error(`Login required`);
    }

    if (response.redirected) {
      globalThis.location.href = response.url;
    } else if (!response.ok) {
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
