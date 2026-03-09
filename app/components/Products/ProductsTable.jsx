import useGetProductsByQuery from "../../Hooks/useGetProductsByQuery.jsx";
import useProductsPagination from "../../Hooks/useProductsPagination.jsx";
import useDebouncedProductSearch from "../../Hooks/useDebouncedProductSearch.jsx";

const ProductsTable = ({ products, pageInfo, fetcher }) => {
  // console.log("✅ Data from the ProductsTable ", products,pageInfo);
 
  const getProductsByQuery = useGetProductsByQuery(fetcher);
  const { handleNextPage, handlePreviousPage } = useProductsPagination(
    pageInfo,
    getProductsByQuery,
  );
  const { searchText, handleSearchQuery } =
    useDebouncedProductSearch(getProductsByQuery);

  const getExpiryStatus = (expiryDate) => {

    if(!expiryDate) return {tone : "neutral", label: "No expiry"};

    const today = Date();
    const expiry = new Date(expiryDate);

    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { tone: "critical", label: "Expired" };
    }

    if (diffDays <= 3) {
      return { tone: "warning", label: `Expired in ${diffDays}d` };
    }

    if (diffDays <=7) {
      return { tone: "caution", label: `Expiring soon` };
    }

    return { tone: "success", label: expiryDate };
  };

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
        </s-grid>
        <s-table-header-row>
          <s-table-header listSlot="primary">products</s-table-header>
          <s-table-header listSlot="labeled">Action</s-table-header>
          <s-table-header ListSlot="labeled">Expire Status</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {products?.map((product) => (
            <s-table-row  key={product?.node?.id}>
              {/* {console.log(`✅ : ${product?.node?.id?.split("/").pop()}`)} */}
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
                  <s-text>
                    {product?.node?.title}
                  </s-text>
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

                  return (
                    <s-badge tone={status.tone}>
                      {status.label}
                    </s-badge>
                  );

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
