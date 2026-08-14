/* global process */
import { Outlet, useFetcher, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import { getProductsByQuery } from "../../graphQl/getProducts.js";
import { createClearanceDiscount } from "../../graphQl/createClearanceDiscount.js";
import { getDaysLeft } from "../utils/getExpiryStatus.js";
import { setProductClearanceOfferMutation } from "../../graphQl/productExpiryMetafield.js";

const ALLOWED_CLEARANCE_DISCOUNTS = [10, 15, 20, 25, 30, 40, 50];

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const { products, pageInfo } = await getProductsByQuery({
    admin,
    endCursor: null,
    startCursor: null,
    isPrevious: false,
    pageSize: 10,
  });

  // eslint-disable-next-line no-undef
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    products,
    pageInfo,
    saveBarId: "expiry-guard-savebar",
    saveButtonId: "expiry-guard-save-button",
    discardButtonId: "expiry-guard-discard-button",
  };
};

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const data = await request.json();

  const { actionType } = data;

  if (actionType === "getProducts") {
    const { endCursor, startCursor, isPrevious, pageSize, searchText } =
      data.getProductsArgs || {};

    const response = await getProductsByQuery({
      admin,
      endCursor,
      startCursor,
      isPrevious,
      pageSize,
      searchText,
    });

    return {
      products: response.products,
      pageInfo: response.pageInfo,
    };
  }

  if (actionType === "createClearanceOffers") {
    const products = data?.products || [];
    const requestedDiscount = Number(data?.discountPercentage);

    const results = await Promise.all(
      products.map(async (product) => {
        const daysLeft = getDaysLeft(product.expiryDate);
        const discountPercentage = ALLOWED_CLEARANCE_DISCOUNTS.includes(
          requestedDiscount,
        )
          ? requestedDiscount
          : 10;

        if (daysLeft === null || daysLeft < 0) {
          return {
            productId: product.id,
            productTitle: product.title,
            success: false,
            error: "Expired products or products without expiry dates cannot receive clearance offers.",
          };
        }

        try {
          const discount = await createClearanceDiscount({
            admin,
            productId: product.id,
            productTitle: product.title,
            discountPercentage,
          });
          const offer = {
            code: discount.code,
            discountId: discount.discountId,
            discountPercentage,
            expiryDate: product.expiryDate,
            createdAt: new Date().toISOString(),
          };

          await setProductClearanceOfferMutation({
            admin,
            productId: product.id,
            offer,
          });

          return {
            productId: product.id,
            productTitle: product.title,
            success: true,
            discount,
            offer,
          };
        } catch (error) {
          return {
            productId: product.id,
            productTitle: product.title,
            success: false,
            error: error.message,
          };
        }
      }),
    );

    return {
      actionType,
      results,
      successCount: results.filter((result) => result.success).length,
      errorCount: results.filter((result) => !result.success).length,
    };
  }

  return {};
}

export default function App() {
  const {
    apiKey,
    products,
    pageInfo,
    saveBarId,
    saveButtonId,
    discardButtonId,
  } = useLoaderData();

  const fetcher = useFetcher();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Home</s-link>
        <s-link href="/app/products">Products</s-link>
      </s-app-nav>
      <Outlet
        context={{
          products,
          pageInfo,
          fetcher,
          saveBarId,
          saveButtonId,
          discardButtonId,
        }}
      />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
