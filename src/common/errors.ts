import { logger } from '@common/logger';
import type { FastifyReply } from 'fastify';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export const controllerErrorHandler = async (
  res: FastifyReply,
  callback: () => Promise<void>,
) => {
  try {
    await callback();
  } catch (error) {
    logger.error('Error during request', error as Error);

    if (error instanceof NotFoundError) {
      await res.status(404).send({ message: error.message });
    } else {
      await res.status(500).send({ message: 'Internal server error.' });
    }
  }
};
