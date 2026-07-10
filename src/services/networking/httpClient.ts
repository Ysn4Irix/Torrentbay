export type HttpClient = {
  get: (url: string) => Promise<string>;
};

export const placeholderHttpClient: HttpClient = {
  async get() {
    return '';
  },
};
