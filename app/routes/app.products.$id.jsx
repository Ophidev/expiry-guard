import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";

import { getProductById } from "../../graphQl/getProductQuery.js"; 
import { useFetcher, useLoaderData } from "react-router";
import { setProductExpiryMutation } from "../../graphQl/productExpiryMetafield.js"

//  LOADER
export const loader = async ({ request, params }) => {

  const { admin } = await authenticate.admin(request);
  const productId = params.id;

  const productData = await getProductById({ admin, productId });

  return { productData };
};

//  ACTION
export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);

  const data = await request.json();

  const { actionType } = data;

  if (actionType === "addExpiryDateToProduct") {

    const { productId, expiryDate } = data;
    
   const res = await setProductExpiryMutation({
      admin,
      productId,
      expiryDate
    });

    console.log("☀️ setProductExpiryMutation : "+ res);
  }

  return null;
};

//  COMPONENT
export default function CollectionPage() {

  const fetcher = useFetcher();
  const { productData } = useLoaderData();
  const [expiryDate, setExpiryDate] = useState(productData?.metafield?.value || "");
  const [error, setError] = useState("");

  const handleDataPicker = (event) => {
    const value = event.currentTarget.value;
    setExpiryDate(value);

    if(!value) {
      setError("Expiry date is required");
    } else {
      setError("");
    }
  }

  const handleSaveExpiryDate = () => {

    fetcher.submit(
      {
        actionType: "addExpiryDateToProduct",
        productId: productData?.id,
        expiryDate
      },
      { 
        method: "POST",
        encType: "application/json",
      }
    );

  };

  return (
    <s-page >
        <s-section>
            <s-grid 
              gridTemplateColumns="repeat(2, 1fr)" 
              gap="small"
              padding="small"
            >
              <s-grid-item>
                <s-image 
                  src={productData?.featuredImage?.src}
                />
              </s-grid-item>

              <s-grid-item>
                <s-stack  alignItems="center" gap="small-small" blockSize="100%">
                  <s-heading>Title : {productData?.title}</s-heading>
                  <s-heading>Total Inventory : {productData?.totalInventory}</s-heading>

                  <s-box padding="small">
                    <s-text>set Expiry date</s-text>
                  </s-box>

                  <s-box padding="small" border="base">
                    
                    <s-stack direction="inline" gap="small" alignItems="end">

                      <s-date-field
                        label="Expiry Date"
                        name="expiryDate"
                        value={expiryDate}
                        disallow="past"
                        required
                        error={error}
                        onChange={(event) => handleDataPicker(event)}
                      />

                        <s-box>
                          <s-button 
                            onClick={handleSaveExpiryDate}
                          >Save Expiry Date</s-button>
                        </s-box>

                      </s-stack>

                  </s-box>
                </s-stack>
              </s-grid-item>
            </s-grid>
        </s-section>
    </s-page>
  );
}
