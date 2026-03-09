import { Outlet, useFetcher, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import { getProductsByQuery } from "../../graphQl/getProducts.js";

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
  };
};

export async function action ({request}) {
  const { admin } = await authenticate.admin(request);

  const data = await request.json();

  const { actionType } = data;

  if (actionType === "getProducts") {
    
    const { endCursor, startCursor, isPrevious, pageSize, searchText } = data?.getProductsArgs;

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

  return {};
};

export default function App() {
  const { apiKey, products, pageInfo } = useLoaderData();
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
