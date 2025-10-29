export const calculatePaginationData = (count, perPage, page) => {
  const totalPages = Math.max(1, Math.ceil(count / perPage));

  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    perPage,
    totalItems: count,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};
