import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminWarningManager } from '../../components/admin/AdminWarningManager.tsx';
import { AdminUserQuickActions } from '../../components/admin/actions/AdminUserQuickActions.tsx';
import { AdminForcedTitleControl } from '../../components/admin/control/AdminForcedTitleControl.tsx';
import { AdminTimeModifierControl } from '../../components/admin/control/AdminTimeModifierControl.tsx';
import type { DurationUnit } from '../../components/admin/adminPanelTypes.ts';
import { addDuration, formatDate, getWarnCount } from '../../components/admin/adminPanelUtils.ts';
import { useAdminUser } from '../../hooks/admin/users/useAdminUser.ts';
import { useAdminWarnings } from '../../hooks/admin/useAdminWarnings.ts';
import type { UpdateModifiersPayload } from '../../api/admin/types.ts';
import styles from './AdminPanel.module.css';
import { PATH } from '../../utils/pathList.ts';
import { AdminConfirmDialog } from '../../components/admin/AdminConfirmDialog.tsx';
import { getUserBadges, getWarnBadge } from '../../components/admin/adminBadges.ts';

export const AdminUserPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [warningsPaging, setWarningsPaging] = useState({ userId: '', page: 1 });
    const [banReason, setBanReason] = useState('');
    const [now, setNow] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState<{
        title: string;
        body: string;
        confirmLabel: string;
        onConfirm: () => void;
    } | null>(null);
    const warningsPage = warningsPaging.userId === (userId ?? '') ? warningsPaging.page : 1;
    const { user, isLoading, isError, updateModifiers, vaporizeUser } = useAdminUser(userId);
    const updateModifiersMutate = updateModifiers.mutate;
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
    const addWarningMutate = addWarning.mutateAsync;
    const revokeWarningMutate = revokeWarning.mutate;

    useEffect(() => {
        const updateNow = () => setNow(Date.now());
        updateNow();
        const intervalId = window.setInterval(updateNow, 60_000);
        return () => window.clearInterval(intervalId);
    }, []);

    const updateUserModifiers = useCallback(
        (data: UpdateModifiersPayload) => {
            if (!userId) return;
            updateModifiersMutate(data);
        },
        [updateModifiersMutate, userId],
    );

    const updateBanDuration = useCallback(
        (amount: number, unit: DurationUnit) => {
            if (!Number.isFinite(amount) || amount <= 0) return;
            const nextValue = addDuration(amount, unit);
            setConfirmDialog({
                title: 'this mf is about to be cooked',
                body: 'set a reason before the ban lands.',
                confirmLabel: 'do it',
                onConfirm: () => {
                    updateUserModifiers({
                        bannedUntil: nextValue,
                        banReason: banReason.trim() || null,
                    });
                    setConfirmDialog(null);
                },
            });
        },
        [banReason, updateUserModifiers],
    );

    const updateYapCooldown = useCallback(
        (amount: number, unit: DurationUnit) => {
            if (!Number.isFinite(amount) || amount <= 0) return;
            const nextValue = addDuration(amount, unit);
            updateUserModifiers({ yapCooldown: nextValue });
        },
        [updateUserModifiers],
    );

    const saveForcedTitle = useCallback(
        (value: string) => {
            updateUserModifiers({ forcedTitle: value.trim() || null });
        },
        [updateUserModifiers],
    );

    const addUserWarning = useCallback(
        (reason: string) => {
            if (!userId || reason.trim().length < 3) return Promise.resolve(undefined);
            return addWarningMutate({ userId, reason: reason.trim() });
        },
        [addWarningMutate, userId],
    );

    const revokeUserWarning = useCallback(
        (warningId: string) => {
            if (!userId) return;
            revokeWarningMutate({ userId, warningId });
        },
        [revokeWarningMutate, userId],
    );

    const changeWarningsPage = useCallback(
        (page: number) => {
            setWarningsPaging({ userId: userId ?? '', page });
        },
        [userId],
    );

    const vaporizeSelectedUser = () => {
        if (!user) return;
        setConfirmDialog({
            title: 'vaporize this bum?',
            body: `this deletes ${user.username} for good.`,
            confirmLabel: 'do it',
            onConfirm: () =>
                vaporizeUser.mutate(undefined, {
                    onSuccess: () => navigate(PATH.admin.adminDashboard),
                }),
        });
    };

    if (isLoading) {
        return <div className={styles.adminPageShell}>Loading user...</div>;
    }

    if (isError || !user) {
        return (
            <div className={styles.adminPageShell}>
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    onClick={() => navigate(PATH.admin.adminDashboard)}
                >
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
                <button
                    className={styles.actionBtnSafe}
                    type="button"
                    onClick={() => navigate(PATH.admin.adminDashboard)}
                >
                    Back to Dashboard
                </button>
            </header>

            <section className={styles.profileCard}>
                {user.pfpUrl ? (
                    <img
                        className={styles.profileAvatar}
                        src={user.pfpUrl}
                        alt={`${user.username} avatar`}
                    />
                ) : (
                    <div className={styles.profileAvatarFallback}>
                        {user.username.slice(0, 1).toUpperCase()}
                    </div>
                )}

                <div className={styles.profileSummary}>
                    <span className={styles.eyebrow}>{user.role}</span>
                    <h2 className={styles.panelTitle}>{user.username}</h2>
                    <div className={styles.badgeRow}>
                        {getUserBadges(user, now).map((badge) => (
                            <span className={styles.userBadge} key={badge}>
                                {badge}
                            </span>
                        ))}
                        <span
                            className={`${styles.warnBadge} ${styles[getWarnBadge(getWarnCount(user)).level]}`}
                        >
                            {getWarnBadge(getWarnCount(user)).label}
                        </span>
                    </div>
                    {user.isAutoBanned && user.banReason && (
                        <p className={styles.banNotice}>
                            AUTOBANNED · {user.banReason} · {formatDate(user.bannedUntil)}
                        </p>
                    )}
                    <span className={styles.sectionNote}>Joined {formatDate(user.createdAt)}</span>
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
                    <AdminUserQuickActions
                        selectedUser={user}
                        onUpdateModifiers={updateUserModifiers}
                    />

                    <AdminForcedTitleControl selectedUser={user} onSave={saveForcedTitle} />

                    <AdminTimeModifierControl
                        currentValue={user.bannedUntil}
                        intent="danger"
                        initialAmount="24"
                        initialUnit="hours"
                        label="Ban user"
                        submitLabel="Apply ban"
                        onSubmit={updateBanDuration}
                    />
                    <label className={styles.fieldLabel}>
                        ban reason (be creative)
                        <input
                            className={styles.textInput}
                            value={banReason}
                            onChange={(event) => setBanReason(event.target.value)}
                        />
                    </label>
                    {user.bannedUntil && new Date(user.bannedUntil).getTime() > now && (
                        <button
                            className={styles.actionBtnSafe}
                            type="button"
                            onClick={() =>
                                setConfirmDialog({
                                    title: 'let him yap?',
                                    body: 'remove the active ban and its reason.',
                                    confirmLabel: 'unban',
                                    onConfirm: () => {
                                        updateUserModifiers({ bannedUntil: null, banReason: null });
                                        setConfirmDialog(null);
                                    },
                                })
                            }
                        >
                            unban
                        </button>
                    )}

                    <AdminTimeModifierControl
                        currentValue={user.yapCooldown}
                        intent="warning"
                        initialAmount="15"
                        initialUnit="minutes"
                        label="Set yap cooldown"
                        submitLabel="Apply cooldown"
                        onSubmit={updateYapCooldown}
                    />
                    {user.yapCooldown && (
                        <button
                            className={styles.actionBtnSafe}
                            type="button"
                            onClick={() => updateUserModifiers({ yapCooldown: null })}
                        >
                            let him yap
                        </button>
                    )}

                    <AdminWarningManager
                        warnings={warnings}
                        activeWarningCount={getWarnCount(user)}
                        warningsLoading={warningsLoading}
                        warningsPage={warningsPage}
                        warningsPagination={warningsPagination}
                        onAddWarning={addUserWarning}
                        onPageChange={changeWarningsPage}
                        onRevokeWarning={revokeUserWarning}
                    />

                    <button
                        className={styles.actionBtnDanger}
                        type="button"
                        onClick={vaporizeSelectedUser}
                    >
                        Vaporize user
                    </button>
                </div>
            </main>
            {confirmDialog && (
                <AdminConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(null)} />
            )}
        </div>
    );
};
