import { useState } from 'react';
import styles from './CopyId.module.css';

export function CopyId({ id }: { id: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            className={styles.copy}
            type="button"
            onClick={async () => {
                await navigator.clipboard.writeText(id);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
            }}
        >
            {copied ? 'copied' : 'copy id'}
        </button>
    );
}
