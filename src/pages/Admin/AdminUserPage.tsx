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
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.ts';
import type { AdminAuditLog, AdminMessage, PaginatedResponse } from '../../api/admin/types.ts';
import { Tabs } from '../../components/admin/ui/Tabs.tsx';
import { auditSentence } from '../../components/admin/auditSentence.ts';
import { CopyId } from '../../components/admin/ui/CopyId.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin/admin.service.ts';
import { notify } from '../../lib/toast.ts';

type DossierTab = 'moderation' | 'warnings' | 'history' | 'messages';

export const AdminUserPage = () => {
    const { userId } = useParams();
    return <AdminUserPageContent key={userId} />;
};

const AdminUserPageContent = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [warningsPage, setWarningsPage] = useState(1);
    const [banReason, setBanReason] = useState('');
    const [tab, setTab] = useState<DossierTab>('moderation');
    const [now, setNow] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState<{
        title: string;
        body: string;
        confirmLabel: string;
        onConfirm: () => void;
    } | null>(null);
    const queryClient = useQueryClient();
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
    const ipsQuery = useQuery({
        queryKey: ['admin', 'users', userId, 'ips'],
        queryFn: async () =>
            (
                await api.get<{ ip: string; lastSeenAt: string; messages: number }[]>(
                    `/admin/users/${encodeURIComponent(userId!)}/ips`,
                )
            ).data,
        enabled: Boolean(userId),
    });
    const historyQuery = useQuery({
        queryKey: ['admin', 'audit-logs', 'user', userId],
        queryFn: async () =>
            (
                await api.get<PaginatedResponse<AdminAuditLog>>('/admin/audit-logs', {
                    params: { targetType: 'user', targetId: userId, page: 1, limit: 50 },
                })
            ).data,
        enabled: Boolean(userId) && tab === 'history',
    });
    const messagesQuery = useQuery({
        queryKey: ['admin', 'users', userId, 'messages'],
        queryFn: async () =>
            (
                await api.get<PaginatedResponse<AdminMessage>>(
                    `/admin/users/${encodeURIComponent(userId!)}/messages`,
                    { params: { page: 1, limit: 25 } },
                )
            ).data,
        enabled: Boolean(userId) && tab === 'messages',
    });

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

    const changeWarningsPage = useCallback((page: number) => {
        setWarningsPage(page);
    }, []);

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
                <CopyId id={user.id} />
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
                    <div className={styles.badgeRow}>
                        {ipsQuery.data?.map((entry) => (
                            <span className={styles.userBadge} key={entry.ip}>
                                [HOST: {entry.ip}] · {entry.messages} msgs
                            </span>
                        ))}
                    </div>
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

            <Tabs
                items={['moderation', 'warnings', 'history', 'messages'] as const}
                active={tab}
                onChange={setTab}
            />
            {tab === 'moderation' && (
                <main className={styles.actionsPanel}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.panelTitle}>Actions</h2>
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
                                            updateUserModifiers({
                                                bannedUntil: null,
                                                banReason: null,
                                            });
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

                        <button
                            className={styles.actionBtnDanger}
                            type="button"
                            onClick={vaporizeSelectedUser}
                        >
                            Vaporize user
                        </button>
                    </div>
                </main>
            )}
            {tab === 'warnings' && (
                <section className={styles.actionsPanel}>
                    <h2 className={styles.panelTitle}>warnings</h2>
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
                </section>
            )}
            {tab === 'history' && (
                <section className={styles.logsPanel}>
                    <h2 className={styles.panelTitle}>user history</h2>
                    {historyQuery.data?.items.map((log) => {
                        const sentence = auditSentence(log);
                        return (
                            <p className={styles.logEntry} key={log.id}>
                                <span>{formatDate(log.createdAt)}</span>
                                <span>
                                    {sentence.actor} {sentence.verb} {sentence.target}
                                    {sentence.detail ? ` — ${sentence.detail}` : ''}
                                </span>
                            </p>
                        );
                    })}
                </section>
            )}
            {tab === 'messages' && (
                <section className={styles.logsPanel}>
                    <h2 className={styles.panelTitle}>recent messages</h2>
                    {messagesQuery.data?.items.map((message) => (
                        <article className={styles.warningCard} key={message.id}>
                            <strong>{message.room?.title ?? 'unknown room'}</strong>
                            <p>{message.cipherText || '[empty message]'}</p>
                            <span className={styles.sectionNote}>
                                {formatDate(message.createdAt)}
                            </span>
                            <button
                                className={styles.actionBtnDanger}
                                type="button"
                                onClick={() =>
                                    setConfirmDialog({
                                        title: 'delete this message?',
                                        body: 'this message is gone for good.',
                                        confirmLabel: 'do it',
                                        onConfirm: async () => {
                                            try {
                                                await adminApi.deleteMessage(message.id);
                                                notify.success('message deleted.');
                                                await queryClient.invalidateQueries({
                                                    queryKey: [
                                                        'admin',
                                                        'users',
                                                        userId,
                                                        'messages',
                                                    ],
                                                });
                                            } catch {
                                                notify.error('could not delete this message.');
                                            } finally {
                                                setConfirmDialog(null);
                                            }
                                        },
                                    })
                                }
                            >
                                delete
                            </button>
                        </article>
                    ))}
                </section>
            )}
            {confirmDialog && (
                <AdminConfirmDialog {...confirmDialog} onCancel={() => setConfirmDialog(null)} />
            )}
        </div>
    );
};
