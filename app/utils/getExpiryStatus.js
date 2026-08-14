export const getDaysLeft = (expiryDate) => {
  if (!expiryDate) return null;

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

export const getExpiryState = (expiryDate) => {
  const daysLeft = getDaysLeft(expiryDate);

  if (daysLeft === null) return "missing";
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 1) return "critical";
  if (daysLeft <= 3) return "warning";

  return "safe";
};

export const getExpiryStatus = (expiryDate) => {
  const daysLeft = getDaysLeft(expiryDate);

  if (daysLeft === null) {
    return { tone: "neutral", label: "No expiry", state: "missing", daysLeft };
  }

  if (daysLeft < 0) {
    return { tone: "subdued", label: "Expired", state: "expired", daysLeft };
  }

  if (daysLeft <= 1) {
    return { tone: "critical", label: "Critical", state: "critical", daysLeft };
  }

  if (daysLeft <= 3) {
    return { tone: "warning", label: "Warning", state: "warning", daysLeft };
  }

  return { tone: "success", label: "Safe", state: "safe", daysLeft };
};
