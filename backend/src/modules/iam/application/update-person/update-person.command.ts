export interface UpdatePersonRequest {
  personId: string;
  fullName?: string;
  preferredName?: string | null;
  email?: string;
  phone?: string | null;
}

export class UpdatePersonCommand {
  constructor(readonly request: UpdatePersonRequest) {}
}
