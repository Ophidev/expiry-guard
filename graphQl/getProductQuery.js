const getProductByIdQuery = `
    query GetProductById($productId: ID!) {
        product(id: $productId) {
            title
            totalInventory
        featuredImage {
            src
        }
        }
    }
`;

export async function getProductById ({ admin, productId }) {
  const res = await admin.graphql(getProductByIdQuery, {
    variables: {
      productId: productId,
    },
  });
  const data = await res.json();

  console.log("✅ data from getProductById : ", data);
  return null
};
