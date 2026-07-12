import type { DocumentType } from '../../domain/value-objects/document.js';

export interface CreatePersonRequest {
  fullName: string;
  preferredName?: string | null;
  email: string;
  documentType: DocumentType;
  document: string;
  birthDate: string;
  phone?: string | null;
}
