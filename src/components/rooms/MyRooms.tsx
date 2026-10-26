import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { PATH } from '../../utils/pathList.ts';
import { StatusPill } from './StatusPill.tsx';
import styles from './MyRooms.module.css';

export const MyRooms = () => {
    const { data = [] } = useQuery({
        queryKey: queryKeys.myRooms(),
        queryFn: roomApi.getMyRooms,
    });
    const rooms = data.filter((room) => room.status && room.status !== 'active');
    if (!rooms.length) return null;

    return (
        <section className={styles.section} aria-label="my rooms">
            <h2>my rooms</h2>
            <div className={styles.list}>
                {rooms.map((room) => (
                    <article key={room.id} className={styles.room}>
                        <Link to={PATH.rooms.href.room(room.id)}>{room.title}</Link>
                        <StatusPill status={room.status!} />
                        {room.statusReason && <p>{room.statusReason}</p>}
                    </article>
                ))}
            </div>
        </section>
    );
};
