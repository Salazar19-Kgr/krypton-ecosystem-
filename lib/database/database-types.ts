export interface DatabaseClient {
  query<T>(
    operation: string,
    params?: unknown,
  ): Promise<T>;
}
