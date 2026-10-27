import type { CSSProperties } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { roomApi } from '../../api/rooms/rooms.service';
import { messagesApi } from '../../api/messages/messages.service.ts';

import styles from './Room.module.css';

import { UpdateRoomModal } from '../../components/rooms/EditRoomModal.tsx';
import { RoomOpPost } from '../../components/rooms/RoomOpPost';
import { RoomReplies } from '../../components/rooms/RoomReplies';
import { RoomReplyForm } from '../../components/rooms/RoomReplyForm';
import { RoomSocketErrorScream } from '../../components/rooms/RoomSocketErrorScream.tsx';

import { useRoomSocket } from '../../hooks/rooms/useRoomSocket.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { notify } from '../../lib/toast.ts';
import { PATH } from '../../utils/pathList.ts';
import { StatusPill } from '../../components/rooms/StatusPill.tsx';
import { SpotlightBanner } from '../../components/rooms/SpotlightBanner.tsx';
import { RoomPerkActions } from '../../components/rooms/PerkActions.tsx';
import { roomThemeOf, roomThemeStyle } from '../../themes/roomThemes.ts';
import { AgeGateCard } from '../../components/rooms/AgeGate.tsx';
import { isAgeGateError } from '../../api/errors.ts';
import type { RoomDetails } from '../../api/rooms/types.ts';

// Shown in place of the thread when the room is 18+ and the user has not confirmed their age.
const AgeGateView = ({
    room,
    onBack,
    onConfirmed,
}: {
    room: RoomDetails | undefined;
    onBack: () => void;
    onConfirmed: () => void;
}) => (
    <div className={styles.layout}>
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <button className={styles.backBtn} onClick={onBack}>
                    {'← back to lobby'}
                </button>
                {room && (
                    <h1 className={styles.boardTitle}>
                        /{room.publicity}/ — {room.title}
                    </h1>
                )}
            </div>
        </header>
        <main className={styles.threadContainer}>
            <AgeGateCard onConfirmed={onConfirmed} onBack={onBack} />
        </main>
    </div>
);

export const Room = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const ageConfirmed = user?.ageConfirmed === true;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // room id whose socket or send answered AGE_GATE; the query errors cover the rest.
    // Scoped to the id so a reused Room instance does not carry the gate into another room.
    const [ageGatedRoomId, setAgeGatedRoomId] = useState<string | undefined>(undefined);
    const socketAgeGate = !!id && ageGatedRoomId === id;
    const markAgeGate = useCallback(() => setAgeGatedRoomId(id), [id]);
    const previousScroll = useRef<{ top: number; height: number } | null>(null);

    const {
        data: room,
        isLoading: roomLoading,
        refetch: refetchRoom,
        error: roomError,
    } = useQuery({
        queryKey: queryKeys.room(id),
        queryFn: () => roomApi.getRoomDetailed(id!),
        enabled: !!id,
    });

    // no socket and no messages request while the 18+ gate is up
    const roomAgeGate = !!room && room.isNsfw && !ageConfirmed;
    const blockedByAge = roomAgeGate || socketAgeGate || isAgeGateError(roomError);

    const { sendMessage, socketError, clearSocketError } = useRoomSocket(id, {
        enabled: !!id && !blockedByAge,
        onAgeGate: markAgeGate,
    });

    const {
        data: messagePages,
        isLoading: messagesLoading,
        error: messagesError,
        refetch: refetchMessages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: queryKeys.messages(id),
        queryFn: ({ pageParam }) =>
            messagesApi.getMessages(id!, pageParam ? { before: pageParam } : undefined),
        initialPageParam: null as string | null,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled: !!id && !blockedByAge,
    });

    const gated = blockedByAge || isAgeGateError(messagesError);

    const handleAgeConfirmed = () => {
        // the auth store already flips ageConfirmed; drop the stale AGE_GATE errors so the
        // queries refetch as a confirmed user, without a page reload
        setAgeGatedRoomId(undefined);
        queryClient.resetQueries({ queryKey: queryKeys.room(id) });
        queryClient.resetQueries({ queryKey: queryKeys.messages(id) });
    };

    useEffect(() => {
        if (
            messagesError &&
            !isAgeGateError(messagesError) &&
            (messagesError as { response?: { status?: number } })?.response?.status === 403
        ) {
            notify.info('private. know the password or leave.');
            navigate(PATH.rooms.href.joinRoom(id!));
        }
    }, [messagesError, navigate, id]);
    useLayoutEffect(() => {
        if (previousScroll.current) {
            window.scrollTo(
                0,
                previousScroll.current.top +
                    document.documentElement.scrollHeight -
                    previousScroll.current.height,
            );
            previousScroll.current = null;
        }
    }, [messagePages?.pages.length]);
    const loadOlder = () => {
        previousScroll.current = {
            top: window.scrollY,
            height: document.documentElement.scrollHeight,
        };
        void fetchNextPage();
    };
    const messages =
        messagePages?.pages
            .slice()
            .reverse()
            .flatMap((page) => page.items) ?? [];

    if (gated)
        return (
            <AgeGateView
                room={room}
                onBack={() => navigate(PATH.rooms.rooms)}
                onConfirmed={handleAgeConfirmed}
            />
        );
    if (roomError)
        return (
            <div className={styles.error}>
                the room is cooked. <button onClick={() => void refetchRoom()}>retry</button>
            </div>
        );
    if (messagesError && !isAgeGateError(messagesError))
        return (
            <div className={styles.error}>
                the thread is on fire. <button onClick={() => void refetchMessages()}>retry</button>
            </div>
        );
    if (roomLoading || messagesLoading)
        return <div className={styles.loading}>Loading thread...</div>;
    if (!room) return <div className={styles.error}>Room 404. It got nuked or never existed.</div>;

    const isRoomCreator = user?.id === room.creator.id || user?.username === room.creator.username;
    const themeKey = roomThemeOf(room.theme);
    const isCorpo = themeKey === 'corpo';

    return (
        <div
            className={styles.layout}
            data-room-theme={themeKey}
            style={roomThemeStyle(themeKey) as CSSProperties}
        >
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        {'← back to lobby'}
                    </button>
                    <h1 className={styles.boardTitle}>
                        /{room.publicity}/ — {room.title}
                    </h1>
                </div>

                {isRoomCreator && (
                    <div className={styles.headerTools}>
                        <RoomPerkActions roomId={room.id} />
                        <button
                            className={styles.editRoomBtn}
                            onClick={() => setIsEditModalOpen(true)}
                            aria-label="edit room"
                            title="Edit Room"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-pen-icon lucide-pen"
                            >
                                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                            </svg>
                        </button>
                    </div>
                )}
            </header>

            <main className={styles.threadContainer}>
                {room.sponsoredBy && (
                    <p className={styles.sponsorLine}>sponsored by @{room.sponsoredBy.username}</p>
                )}
                <SpotlightBanner spotlight={room.spotlight} />
                {room.status && room.status !== 'active' && (
                    <div className={styles.error}>
                        <StatusPill status={room.status} />{' '}
                        {room.status === 'checkout' && 'this room is under review. replies paused.'}
                        {room.status === 'quarantined' &&
                            (room.statusReason || 'this room is quarantined. replies paused.')}
                        {room.status === 'banned' && 'this room is banned.'}
                        {room.status === 'rejected' &&
                            (room.statusReason || 'this room got rejected.')}
                    </div>
                )}
                <RoomOpPost room={room} isRoomCreator={isRoomCreator} />
                {hasNextPage && (
                    <button
                        disabled={isFetchingNextPage}
                        onClick={loadOlder}
                        className={styles.backBtn}
                    >
                        load older (if u dare)
                    </button>
                )}
                <RoomReplies
                    messages={messages}
                    roomCreatorUsername={room.creator.username}
                    roomId={room.id}
                    corpo={isCorpo}
                />
            </main>

            <RoomReplyForm
                roomId={id!}
                authorId={user?.id}
                onSendMessage={sendMessage}
                corpo={isCorpo}
                lockedReason={
                    room.status && room.status !== 'active'
                        ? 'replies paused. read the room status, chud.'
                        : undefined
                }
            />
            {socketError && (
                <RoomSocketErrorScream message={socketError} onClose={clearSocketError} />
            )}

            {isEditModalOpen && (
                <UpdateRoomModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => refetchRoom()}
                    roomId={room.id}
                    initialData={{
                        title: room.title,
                        topic: room.topic ?? '',
                        theme: room.theme,
                        description: room.description ?? '',
                        category: room.category,
                        isNsfw: room.isNsfw,
                    }}
                />
            )}
        </div>
    );
};
