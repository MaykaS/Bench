export interface ImportIssue { message: string; record?: string; }
export interface ImportPreview<T> { format: string; version: number; records: T[]; errors: ImportIssue[]; warnings: ImportIssue[]; }
