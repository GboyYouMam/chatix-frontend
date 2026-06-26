import type {
    AdminAuditLog,
    AdminMessage,
    AdminRoom,
    AdminRoomStatus,
    AdminUser,
    AdminWarning,
    PaginationMeta,
    UpdateModifiersPayload,
} from '../../api/admin/types.ts';

export type AdminTabKey = 'users' | 'rooms' | 'messages' | 'audit-logs';

export interface TabConfig {
    key: AdminTabKey;
    label: string;
}

export type AdminEntity = AdminUser | AdminRoom | AdminMessage | AdminAuditLog;

export interface SidebarProps {
    activeTab: AdminTabKey;
    currentItems: AdminEntity[];
    isFetching: boolean;
    pagination: PaginationMeta;
    selectedId: string | null;
    tabs: TabConfig[];
    onActiveTabChange: (tab: AdminTabKey) => void;
    onApplySearch: (search: string) => void;
    onPageChange: (page: number) => void;
    onSelect: (id: string) => void;
}

export interface AuditFeedProps {
    logs: AdminAuditLog[];
}

export interface DetailsPanelProps {
    selectedEntity: AdminEntity | null;
}

export interface UserActionHandlers {
    adjustDebt: (amount: number) => void;
    addWarning: (reason: string) => void;
    farmAura: () => void;
    payDebt: () => void;
    revokeWarning: (warningId: string) => void;
    setBanDuration: (amount: number, unit: DurationUnit) => void;
    setCooldownDuration: (amount: number, unit: DurationUnit) => void;
    toggleAdminGlaze: () => void;
    toggleClown: () => void;
    toggleMogged: () => void;
    toggleProfileEditing: () => void;
    updateForcedTitle: (value: string) => void;
    vaporize: () => void;
}

export interface UserActionsProps {
    selectedUser: AdminUser;
    warnings: AdminWarning[];
    warningsLoading: boolean;
    warningsPage: number;
    warningsPagination: PaginationMeta;
    onPageChange: (page: number) => void;
    actions: UserActionHandlers;
}

export type DurationUnit = 'minutes' | 'hours' | 'days';

export interface UserQuickActionsProps {
    selectedUser: AdminUser;
    actions: Pick<
        UserActionHandlers,
        | 'adjustDebt'
        | 'farmAura'
        | 'payDebt'
        | 'toggleAdminGlaze'
        | 'toggleClown'
        | 'toggleMogged'
        | 'toggleProfileEditing'
    >;
}

export interface ForcedTitleControlProps {
    selectedUser: AdminUser;
    onSave: (value: string) => void;
}

export interface TimeModifierControlProps {
    currentValue?: string | Date | null;
    intent: 'danger' | 'warning';
    initialAmount: string;
    initialUnit: DurationUnit;
    label: string;
    submitLabel: string;
    onSubmit: (amount: number, unit: DurationUnit) => void;
}

export interface WarningManagerProps {
    warnings: AdminWarning[];
    warningsLoading: boolean;
    warningsPage: number;
    warningsPagination: PaginationMeta;
    onAddWarning: (reason: string) => void;
    onPageChange: (page: number) => void;
    onRevokeWarning: (warningId: string) => void;
}

export interface RoomActionsProps {
    selectedRoom: AdminRoom;
    actions: RoomActionHandlers;
}

export interface RoomActionHandlers {
    moveToStatus: (status: AdminRoomStatus) => void;
    quarantine: (reason: string) => void;
    unquarantine: () => void;
}

export interface MessageActionsProps {
    selectedMessage: AdminMessage;
    onDelete: () => void;
}

export interface LogActionsProps {
    selectedLog: AdminAuditLog;
}

export interface UserMutationActions {
    updateModifiers: (data: UpdateModifiersPayload) => void;
    addWarning: (reason: string) => void;
    revokeWarning: (warningId: string) => void;
    vaporize: () => void;
}
