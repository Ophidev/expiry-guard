const useProductsPagination = (pageInfo, getProductsByQuery) => {
  const handleNextPage = () => {
    if (pageInfo?.hasNextPage) {
      getProductsByQuery({
        isPrevious: false,
        endCursor: pageInfo?.endCursor,
        startCursor: pageInfo?.startCursor,
      });
    }
  };

  const handlePreviousPage = () => {
    if (pageInfo?.hasPreviousPage) {
      getProductsByQuery({
        isPrevious: true,
        endCursor: pageInfo?.endCursor,
        startCursor: pageInfo?.startCursor,
      });
    }
  };

  return {handleNextPage,handlePreviousPage};
};

export default useProductsPagination;