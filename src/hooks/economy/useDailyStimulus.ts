import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { economyApi } from '../../api/economy/economy.service.ts';
import { isClaimedToday, STIMULUS_STORAGE_KEY, utcDayKey } from '../../lib/stimulusDay.ts';
import { notify } from '../../lib/toast.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { queryKeys } from '../../lib/queryKeys.ts';

const readStoredDay = (): string | null => {
    try {
        return window.localStorage.getItem(STIMULUS_STORAGE_KEY);
    } catch {
        return null;
    }
};

const writeStoredDay = (day: string | null) => {
    try {
        if (day) window.localStorage.setItem(STIMULUS_STORAGE_KEY, day);
        else window.localStorage.removeItem(STIMULUS_STORAGE_KEY);
    } catch {
        // Storage can be blocked; the backend still refuses a second grant in one UTC day.
    }
};

// Once per UTC day for logged-in users. The local guard only saves a round trip.
export const useDailyStimulus = () => {
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!token) return;
        const now = new Date();
        if (isClaimedToday(readStoredDay(), now)) return;

        const day = utcDayKey(now);
        writeStoredDay(day);
        void (async () => {
            try {
                const result = await economyApi.claimStimulus();
                if (result.streakReset) {
                    notify.info(
                        'stimulus revoked. streak reset. touch grass less.',
                        'stimulus-revoked',
                    );
                }
                if (result.granted) {
                    notify.success(
                        `stimulus check: +${result.amount} aura. streak ${result.streak}.`,
                        `stimulus-${day}`,
                    );
                    void queryClient.invalidateQueries({ queryKey: queryKeys.shopMe() });
                    void queryClient.invalidateQueries({ queryKey: ['profile'] });
                }
            } catch {
                // Retry on the next app start; a failed claim must not block the app.
                writeStoredDay(null);
            }
        })();
    }, [token, queryClient]);
};
