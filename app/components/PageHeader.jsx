import styles from './PageHeader.module.css';

export default function PageHeader({
  title,
  subtitle,
}) {
  return (
    <div className={styles.pageHeader}>
      <h1 className={styles.heading}>
        {title}
      </h1>

      <p className={styles.subheading}>
        {subtitle}
      </p>
    </div>
  );
}