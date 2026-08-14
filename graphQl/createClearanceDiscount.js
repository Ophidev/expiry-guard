const createBasicDiscountCodeMutation = `
  mutation CreateBasicDiscountCode($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const getProductNumericId = (productId) => productId?.split("/").pop();

export const buildClearanceDiscountCode = ({ productId, discountPercentage }) => {
  return `EXPIRY-GUARD-${getProductNumericId(productId)}-${discountPercentage}`;
};

export async function createClearanceDiscount({
  admin,
  productId,
  productTitle,
  discountPercentage,
}) {
  const code = buildClearanceDiscountCode({ productId, discountPercentage });
  const now = new Date().toISOString();

  const res = await admin.graphql(createBasicDiscountCodeMutation, {
    variables: {
      basicCodeDiscount: {
        title: `${productTitle} clearance ${discountPercentage}% off`,
        code,
        startsAt: now,
        customerSelection: {
          all: true,
        },
        customerGets: {
          value: {
            percentage: discountPercentage / 100,
          },
          items: {
            products: {
              productsToAdd: [productId],
            },
          },
        },
        combinesWith: {
          orderDiscounts: false,
          productDiscounts: false,
          shippingDiscounts: false,
        },
        appliesOncePerCustomer: false,
      },
    },
  });

  const data = await res.json();
  const result = data?.data?.discountCodeBasicCreate;
  const errors = result?.userErrors || [];

  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  return {
    discountId: result?.codeDiscountNode?.id,
    code,
  };
}
