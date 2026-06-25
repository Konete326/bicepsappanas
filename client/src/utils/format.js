export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  });

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  });

export const formatPKR = (amount) =>
  "PKR " + Number(amount).toLocaleString("en-PK");
