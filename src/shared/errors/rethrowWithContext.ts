export const rethrowWithContext = (error: unknown, context: string): Error => {
  if (error instanceof Error) {
    return new Error(`${context}: ${error.message}`);
  }

  return new Error(`${context}: ${String(error)}`);
};