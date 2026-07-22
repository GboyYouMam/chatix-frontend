import styles from './ProfileDescription.module.css';

interface ProfileDescriptionProps {
    description?: string;
}

export const ProfileDescription = ({ description }: ProfileDescriptionProps) => (
    <div className={styles.descriptionBox}>
        <h3 className={styles.descTitle}>description</h3>
        <p className={styles.text}>{description || 'This chud has nothing to say.'}</p>
    </div>
);
