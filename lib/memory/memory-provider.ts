export type MemoryRecord = {
  id: string;
  userId: string;
  content: string;
  createdAt?: string;
};

export interface MemoryProvider {
  get(userId: string): Promise<MemoryRecord[]>;
  save(record: MemoryRecord): Promise<void>;
}
