const productExpiryMetafieldMutation = `
mutation SetProductExpiry($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      id
      key
      namespace
      value
      updatedAt
    }
    userErrors {
      field
      message
      code
    }
  }
}
`;

const setProductExpiryMutation = async ({admin, productId, expiryDate}) => {
    
    const variables = {
        metafields: [
            {
                ownerId: productId,
                namespace: "expiry_guard",
                key: "expiry_date",
                type: "date",
                value: expiryDate
            }
        ]
    }

    const res = await admin.graphql(productExpiryMetafieldMutation, {variables});
    const data = await res.json();

    console.log(data);
};