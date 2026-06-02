import { getExpiryStatus } from "./getExpiryStatus.js";

export const filterProducts = (products, statusFilter, orderBy) => {
  // 1 : copy products array
  let filteredProducts = [...products];

  // 2 : filter by expiry status
  if (statusFilter && statusFilter !== "default") {
    filteredProducts = filteredProducts.filter((product) => {
      const expiryDate = product?.node?.metafield?.value;

      const status = getExpiryStatus(expiryDate).label;

      return status?.toLowerCase() === statusFilter?.toLowerCase();
    });
  }

  // 3 : sort by A-Z
  if (orderBy === "A-Z") {
    filteredProducts.sort((a, b) => {
      const titleA = (a?.node?.title || "").toLowerCase();
      const titleB = (b?.node?.title || "").toLowerCase();

      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }

  // 4 : sort by Z-A
  if (orderBy === "Z-A") {
    filteredProducts.sort((a, b) => {
      const titleA = a?.node?.title?.toLowerCase();
      const titleB = b?.node?.title?.toLowerCase();

      if (titleA < titleB) return 1;
      if (titleA > titleB) return -1;
      return 0;
    });
  }

  return filteredProducts;
};
