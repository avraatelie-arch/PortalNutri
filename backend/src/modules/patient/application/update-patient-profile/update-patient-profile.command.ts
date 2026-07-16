export interface UpdatePatientProfileRequest {
  patientId: string;
  fullName?: string;
  birthDate?: string;
  gender?: string;
  phone?: string | null;
  email?: string | null;
}

export class UpdatePatientProfileCommand {
  constructor(readonly request: UpdatePatientProfileRequest) {}
}
