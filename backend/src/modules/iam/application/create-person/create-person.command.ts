import { DocumentType } from '../../domain/value-objects/document.js';
import type { CreatePersonRequest } from './create-person.request.js';

export interface CreatePersonHttpInput {
  fullName: string;
  preferredName?: string | null;
  email: string;
  documentType: string;
  document: string;
  birthDate: string;
  phone?: string | null;
}

export class CreatePersonCommand {
  constructor(readonly request: CreatePersonRequest) {}

  static fromHttpInput(input: CreatePersonHttpInput): CreatePersonCommand {
    return new CreatePersonCommand({
      fullName: input.fullName,
      preferredName: input.preferredName,
      email: input.email,
      documentType: input.documentType as DocumentType,
      document: input.document,
      birthDate: input.birthDate,
      phone: input.phone,
    });
  }
}
