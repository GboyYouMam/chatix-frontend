import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useQueryClient } from '@tanstack/react-query';
import type { ProfileData, ProfileExtrasInput } from '../../api/users/types.ts';
import { usersApi } from '../../api/users/users.service.ts';
import { useShopMe } from '../../hooks/shop/useShop.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { notify } from '../../lib/toast.ts';
import { PATH } from '../../utils/pathList.ts';
import { moveItem } from './widgetMath.ts';
import {
    buildEditorRows,
    isForcedWidget,
    isWidgetLocked,
    WIDGET_META,
    type EditorRow,
} from './widgetCatalog.ts';
import styles from './WidgetEditor.module.css';

interface WidgetEditorProps {
    profile: ProfileData;
}

export const WidgetEditor = ({ profile }: WidgetEditorProps) => {
    const queryClient = useQueryClient();
    const { data: shopMe, isLoading: shopLoading } = useShopMe();
    const inventoryKeys = new Set((shopMe?.inventory ?? []).map((entry) => entry.itemKey));
    const rapSheet = profile.widgets?.data.rapSheet;
    const forcedState = {
        hasConvictions: (rapSheet?.warns.length ?? 0) + (rapSheet?.bans.length ?? 0) > 0,
        debt: Number(profile.debt),
    };

    const [rows, setRows] = useState<EditorRow[]>(() =>
        buildEditorRows(profile.widgets?.layout ?? []),
    );
    const [savingLayout, setSavingLayout] = useState(false);

    const [trackUrl, setTrackUrl] = useState(profile.widgets?.data.nowPlaying?.url ?? '');
    const [trackTouched, setTrackTouched] = useState(false);
    const [statusText, setStatusText] = useState(profile.widgets?.data.status?.text ?? '');
    const [statusTouched, setStatusTouched] = useState(false);
    const [savingExtras, setSavingExtras] = useState(false);

    const isForced = (row: EditorRow) => isForcedWidget(row.key, forcedState);
    const isLocked = (row: EditorRow) => !isForced(row) && isWidgetLocked(row.key, inventoryKeys);
    const isOn = (row: EditorRow) =>
        isForced(row) || (row.enabled && !isWidgetLocked(row.key, inventoryKeys));

    const saveLayout = async () => {
        setSavingLayout(true);
        try {
            await usersApi.updateWidgets(rows.filter(isOn).map((row) => row.key));
            await queryClient.invalidateQueries({ queryKey: queryKeys.profile(profile.username) });
            notify.success('widgets rearranged. chud approved.');
        } catch (error) {
            notify.error(error);
        } finally {
            setSavingLayout(false);
        }
    };

    const saveExtras = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Only touched fields are sent, so saving the status never wipes the track.
        const body: ProfileExtrasInput = {};
        if (trackTouched) body.trackUrl = trackUrl.trim() || null;
        if (statusTouched) body.statusText = statusText.trim() || null;
        if (Object.keys(body).length === 0) {
            notify.info('nothing changed. touch grass.');
            return;
        }
        setSavingExtras(true);
        try {
            await usersApi.updateProfileExtras(body);
            setTrackTouched(false);
            setStatusTouched(false);
            await queryClient.invalidateQueries({ queryKey: queryKeys.profile(profile.username) });
            notify.success('now playing + status updated. ur taste is noted.');
        } catch (error) {
            notify.error(error);
        } finally {
            setSavingExtras(false);
        }
    };

    return (
        <section className={styles.editor} aria-labelledby="widget-editor-title">
            <h2 id="widget-editor-title" className={styles.heading}>
                widgets
            </h2>
            <p className={styles.note}>
                switch them on, shuffle them around. the layout is public.
            </p>

            <ol className={styles.list}>
                {rows.map((row, index) => {
                    const meta = WIDGET_META[row.key];
                    const forced = isForced(row);
                    const locked = isLocked(row);
                    const on = isOn(row);
                    return (
                        <li key={row.key} className={clsx(styles.row, !on && styles.off)}>
                            <div className={styles.info}>
                                <span className={styles.name}>{meta.title}</span>
                                {forced && (
                                    <span className={styles.hint}>forced on (u earned it)</span>
                                )}
                                {locked && !shopLoading && (
                                    <Link className={styles.link} to={PATH.shop.shop}>
                                        buy in the laryok shop
                                    </Link>
                                )}
                                {locked && shopLoading && (
                                    <span className={styles.hint}>checking ur soap...</span>
                                )}
                            </div>
                            <div className={styles.moves}>
                                <button
                                    type="button"
                                    className={styles.moveBtn}
                                    aria-label={`move ${meta.title} up`}
                                    disabled={index === 0 || savingLayout}
                                    onClick={() => setRows((prev) => moveItem(prev, index, -1))}
                                >
                                    ▲
                                </button>
                                <button
                                    type="button"
                                    className={styles.moveBtn}
                                    aria-label={`move ${meta.title} down`}
                                    disabled={index === rows.length - 1 || savingLayout}
                                    onClick={() => setRows((prev) => moveItem(prev, index, 1))}
                                >
                                    ▼
                                </button>
                            </div>
                            <button
                                type="button"
                                className={styles.toggle}
                                aria-pressed={on}
                                disabled={forced || locked || savingLayout}
                                onClick={() =>
                                    setRows((prev) =>
                                        prev.map((item, i) =>
                                            i === index
                                                ? { ...item, enabled: !item.enabled }
                                                : item,
                                        ),
                                    )
                                }
                            >
                                {on ? 'on' : 'off'}
                            </button>
                        </li>
                    );
                })}
            </ol>

            <button
                type="button"
                className={styles.saveBtn}
                onClick={() => void saveLayout()}
                disabled={savingLayout}
            >
                {savingLayout ? 'rearranging...' : 'save widget layout'}
            </button>

            <form className={styles.extras} onSubmit={saveExtras}>
                <label className={styles.field}>
                    <span className={styles.label}>now playing link (spotify or soundcloud)</span>
                    <input
                        type="url"
                        value={trackUrl}
                        placeholder="https://open.spotify.com/track/..."
                        maxLength={300}
                        onChange={(event) => {
                            setTrackUrl(event.target.value);
                            setTrackTouched(true);
                        }}
                    />
                </label>
                <label className={styles.field}>
                    <span className={styles.label}>
                        status line <span className={styles.count}>{statusText.length}/80</span>
                    </span>
                    <input
                        type="text"
                        value={statusText}
                        placeholder="what i'm doing rn"
                        maxLength={80}
                        onChange={(event) => {
                            setStatusText(event.target.value);
                            setStatusTouched(true);
                        }}
                    />
                </label>
                <button type="submit" className={styles.saveBtn} disabled={savingExtras}>
                    {savingExtras ? 'saving...' : 'save track + status'}
                </button>
            </form>
        </section>
    );
};
