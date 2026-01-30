import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";
import ProductsTable from "../components/Products/ProductsTable.jsx";

export default function ProductsPage() {
  const { products: initialProducts, pageInfo: initialPageInfo, fetcher } =
    useOutletContext();

  const [products, setProducts] = useState(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);

  useEffect(() => {
    if (fetcher.data?.products) {
      setProducts(fetcher.data.products);
      setPageInfo(fetcher.data.pageInfo);
    }
  }, [fetcher.data]);

  return (
    <s-page heading="Products page">
      <ProductsTable
        products={products}
        pageInfo={pageInfo}
        fetcher={fetcher}
      />
    </s-page>
  );
}
