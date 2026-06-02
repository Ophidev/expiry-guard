export const getExpiryStatus = (expiryDate) => {

    if(!expiryDate) return {tone : "neutral", label: "No expiry"};

    const today = new Date();
    const expiry = new Date(expiryDate);

    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)); //getting the difference in days

    if (diffDays < 0) {
      return { tone: "critical", label: "Expired" };
    }

    if (diffDays === 0) {
      return { tone: "warning", label: `Expired Today`}
    }

    if (diffDays <= 3) {
      return { tone: "warning", label: `Expired in ${diffDays} d` };
    }

    if (diffDays <=7) {
      return { tone: "caution", label: `Expiring soon` };
    }

    return { tone: "success", label: expiryDate };
    
  };