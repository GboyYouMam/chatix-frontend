import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (count, error) => {
                const status = (error as { response?: { status?: number } })?.response?.status;
                return status !== undefined && status >= 400 && status < 500 ? false : count < 1;
            },
        },
    },
});
