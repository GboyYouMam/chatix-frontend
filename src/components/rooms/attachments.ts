export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export const getAttachmentSelectionError = (files: { name: string; size: number }[]) => {
    if (files.length > MAX_ATTACHMENTS) return `Attach up to ${MAX_ATTACHMENTS} files.`;

    const oversized = files.find((file) => file.size > MAX_ATTACHMENT_SIZE);
    return oversized ? `${oversized.name} is larger than 10 MB.` : null;
};

export const formatAttachmentSize = (bytes: number) => bytes < 1024 * 1024
    ? `${Math.max(1, Math.ceil(bytes / 1024))} KB`
    : `${Number((bytes / 1024 / 1024).toFixed(1))} MB`;
