import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { PATH } from '../../utils/pathList.ts';
import { StatusPill } from './StatusPill.tsx';
import styles from './MyRooms.module.css';

export const MyRooms = () => {
    const { data, isPending, isError } = useQuery({
        queryKey: queryKeys.myRooms(),
        queryFn: roomApi.getMyRooms,
    });

    if (isPending) return <p className={styles.note}>loading ur rooms...</p>;
    if (isError) return <p className={styles.note}>couldnt load ur rooms. the mods hid them.</p>;
    if (!data?.length)
        return <p className={styles.note}>u have no rooms. touch grass, make one.</p>;

    return (
        <ul className={styles.list} aria-label="my rooms">
            {data.map((room) => (
                <li key={room.id} className={styles.room}>
                    <Link to={PATH.rooms.href.room(room.id)} className={styles.title}>
                        {room.title}
                    </Link>
                    {room.status && <StatusPill status={room.status} />}
                    {room.statusReason && <p className={styles.reason}>{room.statusReason}</p>}
                </li>
            ))}
        </ul>
    );
};
