const getProductByIdQuery = `
  query GetProductById($productId: ID!) {
    product(id: $productId) {
      id
      title
      totalInventory
      featuredImage {
        src
      }
      metafield(namespace: "expiry_guard", key: "expiry_date") {
        value
        type
      }
    }
  }
`;

export async function getProductById({ admin, productId }) {
  const res = await admin.graphql(getProductByIdQuery, {
    variables: {
      productId: `gid://shopify/Product/${productId}`,
    },
  });

  const data = await res.json();

  return data?.data?.product;
}