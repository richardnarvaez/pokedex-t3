export interface FilterInput {
    search?: string;
    type?: string;
    generation?: string;
    limit: number;
    cursor?: number | null;
  }