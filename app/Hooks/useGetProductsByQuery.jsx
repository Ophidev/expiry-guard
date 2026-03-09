const useGetProductsByQuery = (fetcher) => {
  const getProductsByQuery = ({ isPrevious, endCursor, startCursor,searchText }) => {
    fetcher.submit(
      {
        actionType: "getProducts",
        getProductsArgs: {
          endCursor,
          startCursor,
          isPrevious,
          pageSize: 10,
          searchText,
        },
      },
      {
        method: "POST",
        encType: "application/json",
        action: "/app",
      },
    );
  };

  return getProductsByQuery;
};

export default useGetProductsByQuery;