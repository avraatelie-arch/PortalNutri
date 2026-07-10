import type { DocumentType } from '../../domain/value-objects/document.js';

export interface CreatePersonRequest {
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentValue: string;
  birthDate: string;
  phone?: string | null;
}
