import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";

import { getProductById } from "../../graphQl/getProductQuery.js";
import { useFetcher, useLoaderData, useOutletContext } from "react-router";
import { setProductExpiryMutation } from "../../graphQl/productExpiryMetafield.js";

// LOADER
export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const productId = params.id;

  const productData = await getProductById({ admin, productId });

  return { productData };
};

// ACTION
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();

  const actionType = formData.get("actionType");

  if (actionType === "addExpiryDateToProduct") {
    const productId = formData.get("productId");
    const expiryDate = formData.get("expiryDate");

    await setProductExpiryMutation({
      admin,
      productId,
      expiryDate,
    });
  }

  return { success: true };
};

// COMPONENT
export default function ProductPage() {
  const fetcher = useFetcher();
  const { productData } = useLoaderData();

  const { saveBarId, discardButtonId } = useOutletContext();

  const [expiryDate, setExpiryDate] = useState(
    productData?.metafield?.value || "",
  );

  const [error, setError] = useState("");

  const [hasChanges, setHasChanges] = useState(false);
  const [backupDate, setBackupDate] = useState(
    productData?.metafield?.value || "",
  );

  // Handle date change
  const handleDataPicker = (event) => {
    const value = event.currentTarget.value;
    setExpiryDate(value);

    if (!value) {
      setError("Expiry date is required");
    } else {
      setError("");
    }
  };

  // Save button (MAIN ACTION)
  const handleSaveExpiryDate = () => {
    fetcher.submit(
      {
        actionType: "addExpiryDateToProduct",
        productId: productData?.id,
        expiryDate,
      },
      { method: "POST" }
    );
  };

  // Discard (reset)
  const handleDiscard = () => {
    setExpiryDate(backupDate);
    setError("");
    shopify.saveBar.hide(saveBarId);
  };

  // Detect changes
  useEffect(() => {
    const changed = expiryDate !== backupDate;
    setHasChanges(changed);
  }, [expiryDate, backupDate]);

  // Show/hide SaveBar (indicator only)
  useEffect(() => {
    if (hasChanges) {
      shopify.saveBar.show(saveBarId);
    } else {
      shopify.saveBar.hide(saveBarId);
    }
  }, [hasChanges]);

  // After save → toast + reset state
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      shopify.toast.show("Expiry date saved");

      setBackupDate(expiryDate); // update backup
      shopify.saveBar.hide(saveBarId);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <s-page heading="Product">
      <s-link href="/app/products" slot="breadcrumb-actions">Products</s-link>
      {/* SAVE BAR (Indicator only) */}
      <ui-save-bar id={saveBarId}>
        <button id={discardButtonId} onClick={handleDiscard}>
          Discard
        </button>
      </ui-save-bar>

      <s-section>
        <s-grid
          gridTemplateColumns="repeat(2, 1fr)"
          gap="small"
          padding="small"
        >
          <s-grid-item>
            <s-image src={productData?.featuredImage?.src} />
          </s-grid-item>

          <s-grid-item>
            <s-stack alignItems="center" gap="small-small" blockSize="100%">
              <s-heading>Title : {productData?.title}</s-heading>
              <s-heading>
                Total Inventory : {productData?.totalInventory}
              </s-heading>

              <s-box padding="small">
                <s-text>Set Expiry Date</s-text>
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
                    onChange={handleDataPicker}
                  />

                  {/* MAIN SAVE BUTTON */}
                  <s-button onClick={handleSaveExpiryDate}>
                    Save Expiry Date
                  </s-button>
                </s-stack>
              </s-box>
            </s-stack>
          </s-grid-item>
        </s-grid>
      </s-section>
    </s-page>
  );
}