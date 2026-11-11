// Number inputs give strings. These convert them before zod validation.
// An empty required field becomes `undefined`, so the schema reports it as missing.
export const toNumber = (text: string): number | undefined =>
  text.trim() === '' ? undefined : Number(text);

// Empty optional fields become null, so the server clears them.
export const toNumberOrNull = (text: string): number | null =>
  text.trim() === '' ? null : Number(text);

export const toTextOrNull = (text: string): string | null => (text.trim() === '' ? null : text);
