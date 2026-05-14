import styles from './Avatar.module.css';

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({
  name,
}) {
  return (
    <div className={styles.avatar}>
      {getInitials(name)}
    </div>
  );
}