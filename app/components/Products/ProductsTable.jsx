import { useRef, useState } from "react";
import useGetProductsByQuery from "../../Hooks/useGetProductsByQuery.jsx";
import useProductsPagination from "../../Hooks/useProductsPagination.jsx";
import useDebouncedProductSearch from "../../Hooks/useDebouncedProductSearch.jsx";

const ProductsTable = ({products,pageInfo,fetcher}) => {
  
  // console.log("✅ Data from the ProductsTable ", products,pageInfo);
  
  const getProductsByQuery = useGetProductsByQuery(fetcher);
  const {handleNextPage, handlePreviousPage} = useProductsPagination(pageInfo, getProductsByQuery);
  const {searchText,handleSearchQuery} = useDebouncedProductSearch(getProductsByQuery);

  return (
    <s-section padding="none" accessibilityLabel="Puzzles table section">
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
          <s-table-header listSlot="secondary">Status</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {
            products?.map((product) => (
            <s-table-row clickDelegate="mountain-view-checkbox" key={product?.node?.id}>
            <s-table-cell>
              <s-stack direction="inline" gap="small" alignItems="center">
                <s-clickable
                  href
                  accessibilityLabel="Mountain View puzzle thumbnail"
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
                </s-clickable>
                <s-link href="">{product?.node?.title}</s-link>
              </s-stack>
            </s-table-cell>
            <s-table-cell>
              <s-badge color="base" tone="success">
                Active
              </s-badge>
            </s-table-cell>
            </s-table-row>
          ))}
        </s-table-body>
      </s-table>
    </s-section>
  );
};

export default ProductsTable;
