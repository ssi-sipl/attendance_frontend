import styles from './EmptyState.module.css';

export default function EmptyState({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}>
        {icon}
      </span>

      <p className={styles.emptyText}>
        {title}
      </p>

      <p className={styles.emptySubtext}>
        {subtitle}
      </p>
    </div>
  );
}