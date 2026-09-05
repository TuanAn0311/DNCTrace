const Pagination = ({ currentPage, totalItems, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination">
      <div className="pagination__summary">
        Hiển thị {startItem}-{endItem} / {totalItems}
      </div>
      <div className="pagination__controls" aria-label="Phân trang">
        <button
          className="pagination__button"
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {pageNumbers.map((page) => (
          <button
            className={`pagination__button${page === currentPage ? ' pagination__button--active' : ''}`}
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        <button
          className="pagination__button"
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;
