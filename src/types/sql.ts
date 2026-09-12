export interface QueryResult {
  columns: string[];
  values: any[][];
  error?: string;
  executionTimeMs?: number;
  rowCount: number;
}

export interface TableColumnSchema {
  name: string;
  type: string;
  primaryKey?: boolean;
}

export interface TableSchema {
  name: string;
  columns: TableColumnSchema[];
  sampleCount: number;
}

export interface SqlValidationContext {
  query: string;
  result: QueryResult;
}
