// const productCountQuery = `
//     query MyQuery {
//         productsCount {
//             count
//         }
//     }
// `;

// const getProductQuery = `
//   query GetProducts($first: Int!, $after: String) {
//     products(first: $first, after: $after) {
//     edges {
//       cursor
//       node {
//         id
//         title
//         description
//         featuredImage {
//           src
//         }
//       }
//     }
//     pageInfo {
//       endCursor
//       hasNextPage
//       hasPreviousPage
//       startCursor
//     }
//     }
//   }
// `;

const getProductQuery = `
query GetProducts(
  $first: Int
  $last: Int
  $after: String
  $before: String
) {
  products(first: $first, last: $last, after: $after, before: $before) {
    edges {
      cursor
      node {
        id
        title
        featuredImage { src }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor
    }
  }
}
`;


// export const getProducts = async (admin, after = null) => {
//   // const productCountRes = await admin.graphql(productCountQuery);
//   // const productCountData = await productCountRes.json();
//   //const productCount = productCountData?.data?.productsCount?.count;
//   const variables = { first: 10, after: after };
//   const res = await admin.graphql(getProductQuery, {
//     variables: variables,
//   });
//   const data = await res.json();

//   return {
//     products: data?.data?.products?.edges,
//     pageInfo: data?.data?.products?.pageInfo
//   };
//   // console.log("✅ products are : ",products[0]?.featuredImage);
// };

export async function getProductsByQuery ({
  admin,
  endCursor,
  startCursor,
  isPrevious,
  pageSize
}) {

  const variables = isPrevious
    ? { last: pageSize, before: startCursor}
    : {first: pageSize, after: endCursor}

  const res = await admin.graphql(getProductQuery, {variables});
  const data = await res.json();

  return {
    products: data?.data?.products?.edges,
    pageInfo: data?.data?.products?.pageInfo,
  }
};