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

export const setProductExpiryMutation = async ({admin, productId, expiryDate}) => {
    
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
    const json = await res.json();

    const result = json.data.metafieldsSet;

    if (result.userErrors.length > 0) {
      throw new Error(result.userErrors[0].message);
    }
    return {message : "Expiry Date added"};
};