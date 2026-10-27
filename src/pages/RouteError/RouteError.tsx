import { useRouteError } from 'react-router-dom';
import styles from './RouteError.module.css';

export const RouteError = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>something broke, chud.</h1>
            <p className={styles.text}>
                probably a fresh deploy and your tab is from the stone age. reload and pretend this
                never happened.
            </p>
            <button type="button" className={styles.btn} onClick={() => window.location.reload()}>
                reload
            </button>
        </div>
    );
};
