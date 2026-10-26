export const formatDate = (value: string | Date | null | undefined) =>
    value ? new Date(value).toLocaleString('en-GB') : '';
