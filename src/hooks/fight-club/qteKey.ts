export const toHitKey = (event: {
    key: string;
    repeat: boolean;
    isTrusted: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
}): string | null => {
    if (
        event.repeat ||
        !event.isTrusted ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        !/^[a-z]$/i.test(event.key)
    ) {
        return null;
    }
    return event.key.toUpperCase();
};
