export const isRateLimitError = (incoming: Error | null) =>
  typeof incoming?.message === 'string' &&
  incoming.message.toLowerCase().includes('rate limit');
