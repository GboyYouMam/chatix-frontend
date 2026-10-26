import { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '../lib/queryClient.ts';
export const Provider = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}

            <Toaster
                position="top-center"
                containerStyle={{ zIndex: 10000 }}
                toastOptions={{
                    duration: 3500,
                    style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', fontFamily: 'Courier New, monospace' },
                    error: { duration: 5000, style: { borderLeft: '4px solid var(--primary)' } },
                    success: { style: { borderLeft: '4px solid var(--primary)' } },
                }}
            />
        </QueryClientProvider>
    );
};
