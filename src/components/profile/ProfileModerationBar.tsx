import styles from './ProfileModerationBar.module.css';
import type { ProfileData } from '../../api/users/types.ts';

interface ProfileModerationBarProps {
    profileData: ProfileData;
}

const formatModerationDate = (value?: string | null) => {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString('uk-UA');
};

const getWarnings = (profileData: ProfileData): string[] => {
    const source = profileData.warnings ?? profileData.warns ?? profileData.warningReasons ?? [];

    return source
        .map((warning) => {
            if (typeof warning === 'string') return warning.trim();
            return warning.reason?.trim() ?? '';
        })
        .filter(Boolean);
};

export const ProfileModerationBar = ({ profileData }: ProfileModerationBarProps) => {
    const warningReasons = getWarnings(profileData);
    const warnsCount = profileData.warnsCount ?? profileData.warns_count ?? warningReasons.length;
    const bannedUntil = formatModerationDate(profileData.bannedUntil ?? profileData.bannedUntill);
    const yapCooldown = formatModerationDate(profileData.yapCooldown);

    return (
        <div className={styles.moderationBar}>
            <div className={styles.moderationSummary}>
                <div className={styles.moderationItem}>
                    <span className={styles.moderationLabel}>YAP COOLDOWN:</span>
                    <span className={`${styles.moderationValue} ${yapCooldown ? styles.warningText : styles.mutedText}`}>
                        {yapCooldown ?? 'NONE'}
                    </span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.moderationItem}>
                    <span className={styles.moderationLabel}>BANNED UNTIL:</span>
                    <span className={`${styles.moderationValue} ${bannedUntil ? styles.errorText : styles.mutedText}`}>
                        {bannedUntil ?? 'CLEAN'}
                    </span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.moderationItem}>
                    <span className={styles.moderationLabel}>WARNS:</span>
                    <span className={`${styles.moderationValue} ${warnsCount > 0 ? styles.warningText : styles.mutedText}`}>
                        {warnsCount}
                    </span>
                </div>
            </div>
        </div>
    );
};
