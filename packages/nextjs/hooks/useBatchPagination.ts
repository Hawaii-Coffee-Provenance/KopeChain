import { useMemo, useState } from "react";

type UseBatchPaginationReturn<T> = {
  paginatedItems: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
};

export const useBatchPagination = <T>(items: T[], defaultPageSize = 5): UseBatchPaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / pageSize)), [items.length, pageSize]);

  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return { paginatedItems, currentPage: safePage, totalPages, pageSize, goToPage, setPageSize: handleSetPageSize };
};
