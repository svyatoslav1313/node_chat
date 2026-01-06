import styles from './Header.module.scss';
import { ArrowLeft, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <button
          className={`${styles.button} ${styles.closeBtn}`}
          onClick={() => navigate('/lobby')}
        >
          <ArrowLeft />
        </button>
        <div className={styles.container}>
          <div className={styles.titleContainer}>
            <Hash size={16} className={styles.hashIcon} />
            <h1 className={styles.title}>Name chat</h1>
          </div>
          <p className={styles.metaInfo}>Count of message</p>
        </div>
      </div>
      <button
        className={`${styles.button} ${styles.leaveBtn}`}
        onClick={() => navigate('/lobby')}
      >
        Leave
      </button>
    </div>
  );
};
