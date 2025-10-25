export const createErrorMessage = (msg, result) => {
  return `<strong>Error: </strong> ${msg} ${
    result?.detail ? `<br/><strong>Reason:</strong> ${result.detail}` : ""
  }`;
};
