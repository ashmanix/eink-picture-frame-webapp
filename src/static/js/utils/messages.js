export const createErrorMessage = (msg, result) => {
  return `${msg} ${
    result?.detail ? `<br/><strong>Reason:</strong> ${result.detail}` : ""
  }`;
};
