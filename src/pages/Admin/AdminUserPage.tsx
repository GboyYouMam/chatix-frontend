import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminWarningManager } from '../../components/admin/AdminWarningManager.tsx';
import { AdminUserQuickActions } from '../../components/admin/actions/AdminUserQuickActions.tsx';
import { AdminForcedTitleControl } from '../../components/admin/control/AdminForcedTitleControl.tsx';
import { AdminTimeModifierControl } from '../../components/admin/control/AdminTimeModifierControl.tsx';
import type { DurationUnit } from '../../components/admin/adminPanelTypes.ts';
import { addDuration, formatDate, getWarnCount } from '../../components/admin/adminPanelUtils.ts';
import { useAdminUser, useAdminUsers } from '../../hooks/admin/useAdminUsers.ts';
import { useAdminWarnings } from '../../hooks/admin/useAdminWarnings.ts';
import type { UpdateModifiersPayload } from '../../api/admin/types.ts';
import styles from './AdminPanel.module.css';

export const AdminUserPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [warningsPaging, setWarningsPaging] = useState({ userId: '', page: 1 });
    const warningsPage = warningsPaging.userId === (userId ?? '') ? warningsPaging.page : 1;
    const { user, isLoading, isError } = useAdminUser(userId);
    const { updateModifiers, vaporizeUser } = useAdminUsers({ page: 1, search: '', enabled: false });
    const {
        warnings,
        addWarning,
        revokeWarning,
        pagination: warningsPagination,
        isLoading: warningsLoading,
    } = useAdminWarnings({
        selectedUserId: userId,
        page: warningsPage,
        search: '',
        enabled: Boolean(userId),
    });

    const updateUserModifiers = (data: UpdateModifiersPayload) => {
        if (!userId) return;
        updateModifiers.mutate({ userId, data });
    };

    const updateDuration = (field: 'bannedUntil' | 'yapCooldown') => (
        amount: number,
        unit: DurationUnit,
    ) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const nextValue = addDuration(amount, unit);
        updateUserModifiers(field === 'bannedUntil'
            ? { bannedUntil: nextValue }
            : { yapCooldown: nextValue });
    };

    const addUserWarning = (reason: string) => {
        if (!userId || reason.trim().length < 3) return;
        addWarning.mutate({ userId, reason: reason.trim() });
    };

    const revokeUserWarning = (warningId: string) => {
        if (!userId) return;
        revokeWarning.mutate({ userId, warningId });
    };

    const changeWarningsPage = (page: number) => {
        setWarningsPaging({ userId: userId ?? '', page });
    };

    const vaporizeSelectedUser = () => {
        if (!user) return;
        if (window.confirm(`Vaporize ${user.username}?`)) {
            vaporizeUser.mutate(user.id, {
                onSuccess: () => navigate('/admin'),
            });
        }
    };

    if (isLoading) {
        return <div className={styles.adminPageShell}>Loading user...</div>;
    }

    if (isError || !user) {
        return (
            <div className={styles.adminPageShell}>
                <button className={styles.actionBtnSafe} type="button" onClick={() => navigate('/admin')}>
                    Back to Dashboard
                </button>
                <p className={styles.placeholderText}>User was not found.</p>
            </div>
        );
    }

    return (
        <div className={styles.adminPageShell}>
            <header className={styles.dashboardHeader}>
                <div>
                    <span className={styles.eyebrow}>User control</span>
                    <h1 className={styles.sidebarTitle}>{user.username}</h1>
                </div>
                <button className={styles.actionBtnSafe} type="button" onClick={() => navigate('/admin')}>
                    Back to Dashboard
                </button>
            </header>

            <section className={styles.profileCard}>
                {user.pfp_url ? (
                    <img className={styles.profileAvatar} src={user.pfp_url} alt={`${user.username} avatar`} />
                ) : (
                    <div className={styles.profileAvatarFallback}>{user.username.slice(0, 1).toUpperCase()}</div>
                )}

                <div className={styles.profileSummary}>
                    <span className={styles.eyebrow}>{user.role}</span>
                    <h2 className={styles.panelTitle}>{user.username}</h2>
                    <span className={styles.sectionNote}>Joined {formatDate(user.createdAt ?? user.created_at)}</span>
                </div>

                <div className={styles.statGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.sectionNote}>Aura</span>
                        <strong>{user.aura ?? 0}</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.sectionNote}>Debt</span>
                        <strong>{user.debt ?? 0}</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.sectionNote}>Warnings</span>
                        <strong>{getWarnCount(user)}</strong>
                    </div>
                </div>
            </section>

            <main className={styles.actionsPanel}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.panelTitle}>Actions</h2>
                    <span className={styles.sectionNote}>{user.id}</span>
                </div>

                <div className={styles.actionGroup}>
                    <AdminUserQuickActions selectedUser={user} onUpdateModifiers={updateUserModifiers} />

                    <AdminForcedTitleControl
                        selectedUser={user}
                        onSave={(value) => updateUserModifiers({ forcedTitle: value.trim() || null })}
                    />

                    <AdminTimeModifierControl
                        currentValue={user.bannedUntil}
                        intent="danger"
                        initialAmount="24"
                        initialUnit="hours"
                        label="Ban user"
                        submitLabel="Apply ban"
                        onSubmit={updateDuration('bannedUntil')}
                    />

                    <AdminTimeModifierControl
                        currentValue={user.yapCooldown}
                        intent="warning"
                        initialAmount="15"
                        initialUnit="minutes"
                        label="Set yap cooldown"
                        submitLabel="Apply cooldown"
                        onSubmit={updateDuration('yapCooldown')}
                    />

                    <AdminWarningManager
                        warnings={warnings}
                        warningsLoading={warningsLoading}
                        warningsPage={warningsPage}
                        warningsPagination={warningsPagination}
                        onAddWarning={addUserWarning}
                        onPageChange={changeWarningsPage}
                        onRevokeWarning={revokeUserWarning}
                    />

                    <button className={styles.actionBtnDanger} type="button" onClick={vaporizeSelectedUser}>
                        Vaporize user
                    </button>
                </div>
            </main>
        </div>
    );
};
