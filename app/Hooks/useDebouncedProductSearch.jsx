import { useRef, useState } from "react";

const useDebouncedProductSearch = (getProductsByQuery, delay = 800) => {
  
 const debounceTimeout = useRef();
 const [searchText, setSearchText] = useState("");

  const handleSearchQuery = (currentUserInput) => {
    setSearchText(currentUserInput);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      getProductsByQuery({
        searchText: currentUserInput,
      });
    }, delay);
  };

  return {searchText, handleSearchQuery};
};

export default useDebouncedProductSearch;
