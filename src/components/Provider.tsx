import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient();
export const Provider = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: { background: '#181818', color: '#c40064' },
                    position: 'bottom-right',
                }}
            />
        </QueryClientProvider>
    );
};