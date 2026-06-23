import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface AdminLog {
    id: string;
    timestamp: string;
    action: string;
    target: string;
    details: string;
}

export const useAdminSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [logs, setLogs] = useState<AdminLog[]>([]);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL);
        setSocket(newSocket);

        newSocket.emit('joinAdminLogs');

        newSocket.on('newAdminLog', (log: AdminLog) => {
            setLogs((prevLogs) => {
                const updatedLogs = [log, ...prevLogs];
                return updatedLogs.slice(0, 100);
            });
        });

        newSocket.on('logJoined', (data: string) => {
            console.log(data);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return { logs, socket };
};