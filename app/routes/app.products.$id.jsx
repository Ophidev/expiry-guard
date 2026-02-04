import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";

//  LOADER
export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
 // const { admin } = await authenticate.admin(request);

  return null
};

//  ACTION
// export const action = async ({ request, params }) => {
//   const { admin } = await authenticate.admin(request);

//   return null;
// };

//  COMPONENT
export default function CollectionPage() {


  return (
    <s-page >
        <s-section>
            <s-text>Hello</s-text>
        </s-section>
    </s-page>
  );
}
