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

export const ADMIN_TAB_KEYS = {
    USERS: 'users',
    ROOMS: 'rooms',
    MESSAGES: 'messages',
    AUDIT_LOGS: 'audit-logs',
} as const;

export type AdminTabKey = typeof ADMIN_TAB_KEYS[keyof typeof ADMIN_TAB_KEYS];

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

export type DurationUnit = 'minutes' | 'hours' | 'days';

export interface UserQuickActionsProps {
    selectedUser: AdminUser;
    onUpdateModifiers: (data: UpdateModifiersPayload) => void;
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
