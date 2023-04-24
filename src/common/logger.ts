/* eslint-disable no-console */
export const logger = {
  info: (message: string) => {
    console.log(message);
  },
  error: (message: string, error?: Error) => {
    console.error(message, error);
  },
};
