import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styles from '../../pages/Admin/AdminPanel.module.css';
import { PATH } from '../../utils/pathList.ts';
import { useAdminSocket } from '../../hooks/admin/useAdminSocket.ts';

const links = [
    ['users', `${PATH.admin.adminDashboard}#users`],
    ['rooms', `${PATH.admin.adminDashboard}#rooms`],
    ['messages', PATH.admin.adminMessagePanel],
    ['audit', `${PATH.admin.adminDashboard}#audit`],
] as const;

export function AdminLayout() {
    const { pathname, hash } = useLocation();
    useAdminSocket();
    return (
        <div className={styles.adminLayout}>
            <aside className={styles.adminNav}>
                <NavLink className={styles.adminBrand} to={PATH.admin.adminDashboard}>
                    CHATIX <span>// KILLSQUAD</span>
                </NavLink>
                <nav aria-label="admin navigation" className={styles.adminNavLinks}>
                    {links.map(([label, to]) => (
                        <a
                            key={label}
                            className={
                                pathname === to.split('#')[0] && hash === `#${label}`
                                    ? styles.navActive
                                    : styles.navLink
                            }
                            href={to}
                        >
                            {label}
                        </a>
                    ))}
                </nav>
            </aside>
            <div className={styles.adminContent}>
                <Outlet />
            </div>
        </div>
    );
}
