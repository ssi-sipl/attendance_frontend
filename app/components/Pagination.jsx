import styles from './Pagination.module.css';

export default function Pagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        onClick={onPrev}
        disabled={currentPage === 1}
      >
        ← Prev
      </button>

      <span className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        className={styles.pageBtn}
        onClick={onNext}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
}