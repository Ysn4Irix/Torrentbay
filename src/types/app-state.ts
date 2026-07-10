export type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export type AppError = {
  title: string;
  message: string;
};
