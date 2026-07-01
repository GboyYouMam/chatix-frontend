import { useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { roomApi } from '../../api/rooms/rooms.service';
import { messagesApi } from '../../api/messages/messages.service.ts';

import styles from './Room.module.css';

import {UpdateRoomModal} from "../../components/rooms/EditRoomModal.tsx";
import { RoomOpPost } from '../../components/rooms/RoomOpPost';
import { RoomReplies } from '../../components/rooms/RoomReplies';
import { RoomReplyForm } from '../../components/rooms/RoomReplyForm';

import {useRoomSocket} from "../../hooks/useRoomSocket.ts";

export const Room = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { socket } = useRoomSocket(id);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: room, isLoading: roomLoading, refetch: refetchRoom } = useQuery({
        queryKey: ['room', id],
        queryFn: () => roomApi.getRoomDetailed(id!),
        enabled: !!id,
    });

    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', id],
        queryFn: () => messagesApi.getHistory(id!),
        enabled: !!id,
    });

    if (roomLoading || messagesLoading) return <div className={styles.loading}>Loading thread...</div>;
    if (!room) return <div className={styles.error}>Room 404. It got nuked or never existed.</div>;

    const isRoomCreator = user?.id === room.creator.id || user?.username === room.creator.username;

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>
                        {'<< back to lobby'}
                    </button>
                    <h1 className={styles.boardTitle}>/{room.publicity}/ — {room.title}</h1>
                </div>

                {isRoomCreator && (
                    <button
                        className={styles.editRoomBtn}
                        onClick={() => setIsEditModalOpen(true)}
                        title="Edit Room"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fa4d98" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pen-icon lucide-pen">
                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                        </svg>
                    </button>
                )}
            </header>

            <main className={styles.threadContainer}>
                <RoomOpPost room={room} isRoomCreator={isRoomCreator} />
                <RoomReplies messages={messages || []} roomCreatorUsername={room.creator.username} />
            </main>

            <RoomReplyForm roomId={id!} authorId={user?.id} socket={socket} />

            {isEditModalOpen && (
                <UpdateRoomModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => refetchRoom()}
                    roomId={room.id}
                    initialData={{
                        title: room.title,
                        topic: room.topic,
                        description: room.description,
                    }}
                />
            )}
        </div>
    );
};