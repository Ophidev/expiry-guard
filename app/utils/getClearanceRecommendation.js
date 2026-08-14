import { getDaysLeft } from "./getExpiryStatus.js";

export const getRecommendedClearanceDiscount = (expiryDate) => {
  const daysLeft = getDaysLeft(expiryDate);

  if (daysLeft === null) return 0;

  // Expired products must never receive a clearance discount.
  if (daysLeft < 0) return 0;

  // Stronger discounts help merchants sell through stock as expiry gets closer.
  if (daysLeft <= 1) return 40;
  if (daysLeft <= 3) return 25;
  if (daysLeft <= 7) return 10;

  return 0;
};

export const canCreateClearanceOffer = (expiryDate) => {
  return getRecommendedClearanceDiscount(expiryDate) > 0;
};
