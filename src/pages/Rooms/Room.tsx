import {useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import { roomApi } from '../../api/rooms/rooms.service';
import { messagesApi } from '../../api/messages/messages.service.ts';
import styles from './Room.module.css';
import toast from "react-hot-toast";
import {MessageFormatter} from "../../components/MessageFormatter.tsx";
import {UpdateRoomModal} from "../../components/EditRoomModal.tsx";

export const Room = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState('');
    const { user } = useAuthStore();
    const [socket, setSocket] = useState<Socket | null>(null);

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

    useEffect(() => {
        if(!id) return;

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
        setSocket(newSocket);

        newSocket.emit('joinRoom', id);

        newSocket.on('newMessage', (msg) => {
            queryClient.setQueryData(['messages', id], (oldData: any[]) => {
                if (!oldData) return [msg];
                if (oldData.some(m => m.id === msg.id)) return oldData;

                const fixedMsg = { ...msg };
                if (!fixedMsg.author && fixedMsg.authorId === user?.id) {
                    fixedMsg.author = {
                        username: user?.username,
                    };
                }

                return [...oldData, fixedMsg];
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, [id, queryClient]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !user) return;

        try {
            socket.emit('sendMessage', {
                roomId: id,
                authorId: user.id,
                text: newMessage
            });

            setNewMessage('');
        } catch (error) {
            console.error('Failed to yap via socket:', error);
        }
    };

    const handleCopyIdToReply = async (shortId: string) => {
        try {
            await navigator.clipboard.writeText(`>>${shortId} `);
            toast.success(`Copied >>${shortId} to clipboard, ready to mog`);
        }
        catch (error) { toast.error('something went wrong'); }
    }

    if (roomLoading || messagesLoading) return <div className={styles.loading}>Loading thread...</div>;
    if (!room) return <div className={styles.error}>Room 404. It got nuked or never existed.</div>;

    const isRoomCreator = user?.id === room.creator.id || user?.username === room.creator.username;

    const handleCopyInviteLink = async () => {
        const inviteUrl = `${window.location.origin}/room/${room.id}/join`;
        try {
            await navigator.clipboard.writeText(inviteUrl);
            toast.success('Invite link copied. Send it to your bums.');
        } catch (error) {
            toast.error('Failed to copy link.');
        }
    };

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
                {/* info about op */}
                <div className={styles.opPost}>
                    <div className={styles.postMeta}>
                        <span className={styles.subject}>{room.topic || 'No topic'}</span>
                        <span
                            className={styles.username}
                            onClick={() => navigate(`/profile/${room.creator.username}`)}
                        >
                            {room.creator.username}
                        </span>
                        {(room.creator.isMogged || room.creator.is_mogged) && <span className={styles.moggedBadge}> [MOGGED]</span>}
                        <span className={styles.date}>
                            {new Date(room.createdAt).toLocaleString('uk-UA')}
                        </span>
                        <span className={styles.postId}>№OP_{room.id.slice(-6)}</span>
                    </div>
                    <div className={styles.postBody}>
                        {room.description || 'No description provided by OP.'}
                    </div>

                    {room.publicity === 'private' && isRoomCreator && (
                        <div className={styles.opActions}>
                            <button onClick={handleCopyInviteLink} className={styles.inviteBtn}>
                                [COPY INVITE LINK]
                            </button>
                        </div>
                    )}
                </div>

                {/* thread replys */}
                <div className={styles.replies}>
                    {messages?.length === 0 ? (
                        <div className={styles.emptyThread}>No replies yet. Be the first to mog.</div>
                    ) : (
                        messages?.map((msg: any) => (
                            <div key={msg.id} id={`post-${msg.id?.slice(-6)}`} className={styles.replyBlock}>
                                <div className={styles.postMeta}>
                                    <span
                                        className={styles.username}
                                        onClick={() => msg.author?.username ? navigate(`/profile/${msg.author.username}`) : null}
                                    >
                                        {msg.author?.username || 'Anon'}

                                        {msg.author?.username === room.creator.username && (
                                            <span className={styles.opBadge}> [OP]</span>
                                        )}

                                        {(msg.author?.isMogged || msg.author?.is_mogged) && (
                                            <span className={styles.moggedBadge}> [MOGGED]</span>
                                        )}

                                        {msg.author?.forcedTitle && (
                                            <span className={styles.forcedTitle}> [{msg.author.forcedTitle}]</span>
                                        )}
                                    </span>
                                    <span className={styles.date}>
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString('uk-UA') : 'Just now'}
                                    </span>
                                    <span className={styles.postId} onClick={() => handleCopyIdToReply(msg.id?.slice(-6))}>
                                        №{msg.id?.slice(-6) || 'ERROR'}
                                    </span>
                                </div>

                                <div className={styles.postBody}>
                                    <MessageFormatter text={msg.cipherText || ''} allMessages={messages || []} />
                                </div>

                                {msg.ipAddress && (
                                    <div className={styles.ipAddress}>
                                        [HOST: {msg.ipAddress}]
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>

            <div className={styles.replyFormContainer}>
                <form className={styles.replyForm} onSubmit={handleSendMessage}>
                    <textarea
                        className={styles.replyInput}
                        placeholder="Type your shit here... (click on ID of message for copying it and reply)"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <button type="submit" className={styles.submitBtn}>REPLY</button>
                </form>
            </div>

            {/* Рендеримо модалку, якщо стейт true */}
            {isEditModalOpen && (
                <UpdateRoomModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => refetchRoom()} // Оновлюємо ОП-пост після успішного апдейту
                    roomId={room.id}
                    initialData={{
                        title: room.title,
                        topic: room.topic,
                        description: room.description,
                        publicity: room.publicity
                    }}
                />
            )}
        </div>
    );
};