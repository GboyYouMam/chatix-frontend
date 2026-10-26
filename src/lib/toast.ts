import toast from 'react-hot-toast';
import { parseApiError } from '../api/errors.ts';

export const notify = {
    success: (message: string, id = message) => toast.success(message, { id }),
    error: (errOrMessage: unknown, id?: string) => {
        const message = typeof errOrMessage === 'string' ? errOrMessage : parseApiError(errOrMessage).message;
        return toast.error(message, { id: id ?? message });
    },
    info: (message: string, id = message) => toast(message, { id }),
};
