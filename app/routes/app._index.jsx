import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import SetupGuide from "../components/Home/SetupGuide.jsx";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {

  return (
    <s-page heading="Shopify app template">
      <SetupGuide/>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
