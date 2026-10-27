export const formatWarningTicker = (warnings: { reason: string }[], threshold = 3) =>
    warnings.map((warning, index) => `/!\\ WARN ${index + 1}/${threshold}: ${warning.reason}`);
