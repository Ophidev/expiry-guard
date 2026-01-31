const useGetProductsByQuery = (fetcher) => {
  const getProductsByQuery = ({ isPrevious, endCursor, startCursor }) => {
    fetcher.submit(
      {
        actionType: "getProducts",
        getProducts: {
          endCursor,
          startCursor,
          isPrevious,
          pageSize: 10,
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