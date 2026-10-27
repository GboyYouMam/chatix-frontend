// Mirrors PASSWORD_REGEX on the backend (auth.constants.ts).
export const PASSWORD_RULES = [
    { label: '8-72 characters', test: (p: string) => p.length >= 8 && p.length <= 72 },
    { label: 'a lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'an uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'a digit', test: (p: string) => /\d/.test(p) },
    { label: 'a symbol (_ ! @ # . whatever)', test: (p: string) => /[^A-Za-z\d\s]/.test(p) },
    { label: 'no spaces', test: (p: string) => !/\s/.test(p) },
] as const;

export const PASSWORD_EXAMPLE = 'Basement_Rat42!';

export const isStrongPassword = (p: string) => PASSWORD_RULES.every((rule) => rule.test(p));
