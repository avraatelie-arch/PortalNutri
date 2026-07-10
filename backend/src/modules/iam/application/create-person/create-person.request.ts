import type { DocumentType } from '../../domain/value-objects/document.js';

export interface CreatePersonRequest {
  fullName: string;
  preferredName?: string | null;
  email: string;
  documentType: DocumentType;
  documentValue: string;
  birthDate: string;
  phone?: string | null;
}
