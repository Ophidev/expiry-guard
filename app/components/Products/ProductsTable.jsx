import { useState } from "react";
import useGetProductsByQuery from "../../Hooks/useGetProductsByQuery.jsx";
import useProductsPagination from "../../Hooks/useProductsPagination.jsx";
import useDebouncedProductSearch from "../../Hooks/useDebouncedProductSearch.jsx";
import { getExpiryStatus } from "../../utils/getExpiryStatus.js";
import { filterProducts } from "../../utils/filterProducts.js";

const ProductsTable = ({ products, pageInfo, fetcher }) => {
  // console.log("✅ Data from the ProductsTable ", products,pageInfo);

  const getProductsByQuery = useGetProductsByQuery(fetcher);
  const { handleNextPage, handlePreviousPage } = useProductsPagination(
    pageInfo,
    getProductsByQuery,
  );
  const { searchText, handleSearchQuery } =
    useDebouncedProductSearch(getProductsByQuery);

  const [statusFilter, setStatusFilter] = useState("default");
  const [orderBy, setOrderBy] = useState("A-Z");

  const filteredProducts = filterProducts(products, statusFilter, orderBy);

  return (
    <s-section padding="none" accessibilityLabel="products table section">
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
                  label="Sort by"
                  name="Sort by"
                  value={[statusFilter]}
                  onChange={(event) => {
                    const values = event.currentTarget.values;
                    setStatusFilter(values[0]);
                  }}
                >
                  <s-choice value="default">Default</s-choice>
                  <s-choice value="Expired">Expired</s-choice>
                  <s-choice value="Expiring Soon">Expiring Soon</s-choice>
                  <s-choice value="Fresh">Fresh</s-choice>
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
          <s-table-header listSlot="primary">products</s-table-header>
          <s-table-header listSlot="labeled">Action</s-table-header>
          <s-table-header listSlot="labeled">Expire Status</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {filteredProducts?.map((product) => (
            <s-table-row key={product?.node?.id}>
              <s-table-cell>
                <s-stack direction="inline" gap="small" alignItems="center">
                  <s-box
                    id="product-link"
                    accessibilityLabel="products thumbnail"
                    border="base"
                    borderRadius="base"
                    overflow="hidden"
                    inlineSize="40px"
                    blockSize="40px"
                  >
                    <s-image
                      objectFit="cover"
                      src={product?.node?.featuredImage?.src}
                    />
                  </s-box>
                  <s-text>{product?.node?.title}</s-text>
                </s-stack>
              </s-table-cell>
              <s-table-cell>
                <s-button
                  href={`/app/products/${product?.node?.id?.split("/").pop()}`}
                >
                  Add Expiry date
                </s-button>
              </s-table-cell>

              <s-table-cell>
                {(() => {
                  const expiryDate = product?.node?.metafield?.value;
                  const status = getExpiryStatus(expiryDate);

                  return <s-badge tone={status.tone}>{status.label}</s-badge>;
                })()}
              </s-table-cell>
            </s-table-row>
          ))}
        </s-table-body>
      </s-table>
    </s-section>
  );
};

export default ProductsTable;
