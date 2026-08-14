/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import useGetProductsByQuery from "../../Hooks/useGetProductsByQuery.jsx";
import useProductsPagination from "../../Hooks/useProductsPagination.jsx";
import useDebouncedProductSearch from "../../Hooks/useDebouncedProductSearch.jsx";
import { filterProducts } from "../../utils/filterProducts.js";
import { getDaysLeft, getExpiryStatus } from "../../utils/getExpiryStatus.js";
import { getRecommendedClearanceDiscount } from "../../utils/getClearanceRecommendation.js";

const OFFER_PERCENTAGES = [10, 15, 20, 25, 30, 40, 50];

const getSavedOffer = (clearanceOffer) => {
  if (!clearanceOffer?.value) return null;

  try {
    return JSON.parse(clearanceOffer.value);
  } catch {
    return null;
  }
};

const getProductRows = (products, savedOffersByProductId) => {
  return products.map((product) => {
    const node = product?.node || {};
    const expiryDate = node?.metafield?.value;
    const daysLeft = getDaysLeft(expiryDate);
    const status = getExpiryStatus(expiryDate);
    const recommendedDiscount = getRecommendedClearanceDiscount(expiryDate);
    const savedOffer =
      savedOffersByProductId[node.id] || getSavedOffer(node.clearanceOffer);

    return {
      id: node.id,
      title: node.title,
      image: node?.featuredImage?.src,
      expiryDate,
      daysLeft,
      status,
      recommendedDiscount,
      savedOffer,
      canAddOffer: daysLeft !== null && daysLeft >= 0,
    };
  });
};

const getDefaultOfferPercentage = (products) => {
  const recommendedDiscount = products.find(
    (product) => product.recommendedDiscount > 0,
  )?.recommendedDiscount;

  return String(recommendedDiscount || 10);
};

const ProductsTable = ({ products, pageInfo, fetcher }) => {
  const getProductsByQuery = useGetProductsByQuery(fetcher);
  const { handleNextPage, handlePreviousPage } = useProductsPagination(
    pageInfo,
    getProductsByQuery,
  );
  const { searchText, handleSearchQuery } =
    useDebouncedProductSearch(getProductsByQuery);

  const [statusFilter, setStatusFilter] = useState("default");
  const [orderBy, setOrderBy] = useState("A-Z");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [isBulkAction, setIsBulkAction] = useState(false);
  const [selectedOfferPercentage, setSelectedOfferPercentage] = useState("10");
  const [savedOffersByProductId, setSavedOffersByProductId] = useState({});

  const filteredProducts = useMemo(
    () => filterProducts(products || [], statusFilter, orderBy),
    [products, statusFilter, orderBy],
  );
  const productRows = useMemo(
    () => getProductRows(filteredProducts, savedOffersByProductId),
    [filteredProducts, savedOffersByProductId],
  );

  const selectedProducts = productRows.filter((product) =>
    selectedProductIds.includes(product.id),
  );
  const selectedOfferProducts = selectedProducts.filter(
    (product) => product.canAddOffer,
  );
  const productsForSubmission = (
    isBulkAction ? selectedOfferProducts : [activeProduct]
  ).filter(Boolean);

  const isLoadingProducts =
    fetcher.state !== "idle" &&
    (fetcher.formData?.get("actionType") === "getProducts" ||
      fetcher.json?.actionType === "getProducts");
  const isCreatingOffer =
    fetcher.state !== "idle" &&
    fetcher.json?.actionType === "createClearanceOffers";

  const summary = productRows.reduce(
    (totals, product) => {
      if (product.status.state === "warning") totals.nearExpiry += 1;
      if (product.status.state === "critical") totals.critical += 1;
      if (product.recommendedDiscount > 0) totals.recommended += 1;

      return totals;
    },
    {
      nearExpiry: 0,
      critical: 0,
      recommended: 0,
    },
  );

  const handleSelectProduct = (productId, isSelected) => {
    setSelectedProductIds((currentIds) => {
      if (isSelected) return [...new Set([...currentIds, productId])];

      return currentIds.filter((id) => id !== productId);
    });
  };

  const openSingleOfferModal = (product) => {
    setActiveProduct(product);
    setIsBulkAction(false);
    setSelectedOfferPercentage(getDefaultOfferPercentage([product]));
  };

  const openBulkOfferModal = () => {
    setActiveProduct(null);
    setIsBulkAction(true);
    setSelectedOfferPercentage(getDefaultOfferPercentage(selectedOfferProducts));
  };

  const createClearanceOffers = () => {
    fetcher.submit(
      {
        actionType: "createClearanceOffers",
        discountPercentage: Number(selectedOfferPercentage),
        products: productsForSubmission.map((product) => ({
          id: product.id,
          title: product.title,
          expiryDate: product.expiryDate,
        })),
      },
      {
        method: "POST",
        encType: "application/json",
        action: "/app",
      },
    );
  };

  useEffect(() => {
    setSelectedProductIds((currentIds) =>
      currentIds.filter((id) => productRows.some((product) => product.id === id)),
    );
  }, [productRows]);

  useEffect(() => {
    if (
      fetcher.state !== "idle" ||
      fetcher.data?.actionType !== "createClearanceOffers"
    ) {
      return;
    }

    if (fetcher.data.successCount > 0) {
      setSavedOffersByProductId((currentOffers) => {
        const nextOffers = { ...currentOffers };

        fetcher.data.results
          ?.filter((result) => result.success && result.offer)
          .forEach((result) => {
            nextOffers[result.productId] = result.offer;
          });

        return nextOffers;
      });
      shopify.toast.show(`${fetcher.data.successCount} clearance offer saved`);
    }

    if (fetcher.data.errorCount > 0) {
      shopify.toast.show(`${fetcher.data.errorCount} offer failed`, {
        isError: true,
      });
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <s-section padding="none" accessibilityLabel="products table section">
      <s-grid
        gap="small"
        gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))"
      >
        <s-box padding="base" border="base" borderRadius="base">
          <s-stack gap="small-100">
            <s-text>Near Expiry Products</s-text>
            <s-heading>{summary.nearExpiry}</s-heading>
          </s-stack>
        </s-box>
        <s-box padding="base" border="base" borderRadius="base">
          <s-stack gap="small-100">
            <s-text>Critical Products</s-text>
            <s-heading>{summary.critical}</s-heading>
          </s-stack>
        </s-box>
        <s-box padding="base" border="base" borderRadius="base">
          <s-stack gap="small-100">
            <s-text>Offers Recommended</s-text>
            <s-heading>{summary.recommended}</s-heading>
          </s-stack>
        </s-box>
        <s-box padding="base" border="base" borderRadius="base">
          <s-stack gap="small-100">
            <s-text>Waste Protected</s-text>
            <s-heading>{summary.recommended} products</s-heading>
          </s-stack>
        </s-box>
      </s-grid>

      <s-box paddingBlockStart="base">
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-button
            disabled={selectedOfferProducts.length === 0}
            commandFor="clearance-offer-modal"
            command="--show"
            onClick={openBulkOfferModal}
          >
            Add offer to selected
          </s-button>
          <s-text>{selectedOfferProducts.length} products selected</s-text>
        </s-stack>
      </s-box>

      <s-table
        paginate
        hasNextPage={pageInfo?.hasNextPage}
        hasPreviousPage={pageInfo?.hasPreviousPage}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
      >
        <s-grid slot="filters" gap="small-200" gridTemplateColumns="1fr auto">
          <s-text-field
            label="Search Products"
            labelAccessibilityVisibility="exclusive"
            icon="search"
            placeholder="Searching all products"
            value={searchText}
            onInput={(e) => handleSearchQuery(e.target.value)}
          />
          <s-button
            icon="sort"
            variant="secondary"
            accessibilityLabel="Sort"
            interestFor="sort-tooltip"
            commandFor="sort-actions"
          />
          <s-tooltip id="sort-tooltip">
            <s-text>Sort</s-text>
          </s-tooltip>
          <s-popover id="sort-actions">
            <s-stack gap="none">
              <s-box padding="small">
                <s-choice-list
                  label="Status"
                  name="Status"
                  value={[statusFilter]}
                  onChange={(event) => {
                    const values = event.currentTarget.values;
                    setStatusFilter(values[0]);
                  }}
                >
                  <s-choice value="default">Default</s-choice>
                  <s-choice value="expired">Expired</s-choice>
                  <s-choice value="critical">Critical</s-choice>
                  <s-choice value="warning">Warning</s-choice>
                  <s-choice value="safe">Safe</s-choice>
                </s-choice-list>
              </s-box>
              <s-divider />
              <s-box padding="small">
                <s-choice-list
                  label="Order by"
                  name="Order by"
                  value={[orderBy]}
                  onChange={(event) => {
                    const values = event.currentTarget.values;
                    setOrderBy(values[0]);
                  }}
                >
                  <s-choice value="A-Z">A-Z</s-choice>
                  <s-choice value="Z-A">Z-A</s-choice>
                </s-choice-list>
              </s-box>
            </s-stack>
          </s-popover>
        </s-grid>

        <s-table-header-row>
          <s-table-header listSlot="labeled">Select</s-table-header>
          <s-table-header listSlot="primary">Product</s-table-header>
          <s-table-header listSlot="labeled">Expiry Date</s-table-header>
          <s-table-header listSlot="labeled">Days Left</s-table-header>
          <s-table-header listSlot="labeled">Status</s-table-header>
          <s-table-header listSlot="labeled">Recommended</s-table-header>
          <s-table-header listSlot="labeled">Action</s-table-header>
        </s-table-header-row>

        <s-table-body>
          {isLoadingProducts && (
            <s-table-row>
              <s-table-cell>
                <s-stack gap="small">
                  <s-spinner accessibilityLabel="Loading products" />
                  <s-text>Loading products...</s-text>
                </s-stack>
              </s-table-cell>
            </s-table-row>
          )}

          {!isLoadingProducts &&
            productRows.map((product) => (
              <s-table-row key={product.id}>
                <s-table-cell>
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    disabled={!product.canAddOffer}
                    aria-label={`Select ${product.title}`}
                    onChange={(event) =>
                      handleSelectProduct(product.id, event.target.checked)
                    }
                  />
                </s-table-cell>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-box
                      accessibilityLabel="products thumbnail"
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      {product.image ? (
                        <s-image objectFit="cover" src={product.image} />
                      ) : (
                        <s-box background="subdued" blockSize="40px" />
                      )}
                    </s-box>
                    <s-text>{product.title}</s-text>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>{product.expiryDate || "Not set"}</s-table-cell>
                <s-table-cell>
                  {product.daysLeft === null ? "Not set" : product.daysLeft}
                </s-table-cell>
                <s-table-cell>
                  <s-badge tone={product.status.tone}>
                    {product.status.label}
                  </s-badge>
                </s-table-cell>
                <s-table-cell>
                  {product.savedOffer ? (
                    <s-badge tone="success">
                      Saved {product.savedOffer.discountPercentage}%
                    </s-badge>
                  ) : product.recommendedDiscount > 0 ? (
                    `${product.recommendedDiscount}%`
                  ) : (
                    "None"
                  )}
                </s-table-cell>
                <s-table-cell>
                  <s-stack direction="inline" gap="small">
                    <s-button href={`/app/products/${product.id?.split("/").pop()}`}>
                      Add Expiry date
                    </s-button>
                    <s-button
                      disabled={!product.canAddOffer}
                      commandFor="clearance-offer-modal"
                      command="--show"
                      onClick={() => openSingleOfferModal(product)}
                    >
                      Add offer
                    </s-button>
                  </s-stack>
                </s-table-cell>
              </s-table-row>
            ))}

          {!isLoadingProducts && productRows.length === 0 && (
            <s-table-row>
              <s-table-cell>
                <s-stack gap="small" alignItems="center">
                  <s-heading>No products found</s-heading>
                  <s-text>
                    Add expiry dates to products or adjust the current filters.
                  </s-text>
                </s-stack>
              </s-table-cell>
            </s-table-row>
          )}
        </s-table-body>
      </s-table>

      <s-modal
        id="clearance-offer-modal"
        heading={isBulkAction ? "Add offers" : "Add offer"}
      >
        <s-stack gap="base">
          <s-choice-list
            label="Offer percentage"
            name="Offer percentage"
            value={[selectedOfferPercentage]}
            onChange={(event) => {
              const values = event.currentTarget.values;
              setSelectedOfferPercentage(values[0]);
            }}
          >
            {OFFER_PERCENTAGES.map((percentage) => (
              <s-choice key={percentage} value={String(percentage)}>
                {percentage}% off
              </s-choice>
            ))}
          </s-choice-list>

          <s-box padding="small" border="base">
            <s-stack gap="small-100">
              {productsForSubmission.map((product) => (
                <s-stack
                  key={product.id}
                  direction="inline"
                  justifyContent="space-between"
                  gap="small"
                >
                  <s-text>{product.title}</s-text>
                  <s-text>{product.daysLeft} days left</s-text>
                </s-stack>
              ))}
              {productsForSubmission.length === 0 && (
                <s-text>No products selected.</s-text>
              )}
            </s-stack>
          </s-box>

          {fetcher.data?.actionType === "createClearanceOffers" &&
            fetcher.data?.errorCount > 0 && (
              <s-banner tone="critical">
                Some offers could not be created. Check discount permissions and
                make sure the same discount code does not already exist.
              </s-banner>
            )}

          <s-divider />

          <s-stack direction="inline" gap="small" justifyContent="end">
            <s-button commandFor="clearance-offer-modal" command="--hide">
              Cancel
            </s-button>
            <s-button
              variant="primary"
              disabled={productsForSubmission.length === 0 || isCreatingOffer}
              loading={isCreatingOffer}
              commandFor="clearance-offer-modal"
              command="--hide"
              onClick={createClearanceOffers}
            >
              Save offer to product
            </s-button>
          </s-stack>
        </s-stack>
      </s-modal>
    </s-section>
  );
};

export default ProductsTable;
