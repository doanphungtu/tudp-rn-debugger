export const generateId = (): string =>
  Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
