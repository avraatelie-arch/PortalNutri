import type { TenantRepository } from '../../../iam/domain/repositories/tenant-repository.js';
import type { PatientRepository } from '../../domain/repositories/patient-repository.js';
import { DomainError } from '../../../iam/domain/errors/domain-error.js';
import { Email } from '../../../iam/domain/value-objects/email.js';
import { FullName } from '../../../iam/domain/value-objects/full-name.js';
import { Phone } from '../../../iam/domain/value-objects/phone.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { Patient } from '../../domain/aggregates/patient.aggregate.js';
import { BirthDate } from '../../domain/value-objects/birth-date.js';
import { Gender } from '../../domain/value-objects/gender.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { TenantInactiveError } from '../../../iam/application/errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../../../iam/application/errors/tenant-not-found.error.js';
import { executePatientUseCase } from '../execute-patient-use-case.js';
import { CreatePatientCommand } from './create-patient.command.js';
import { toCreatePatientResponse } from './create-patient.response.js';

export class CreatePatientHandler {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreatePatientCommand) {
    return executePatientUseCase(async () => {
      const tenantId = TenantId.create(command.request.tenantId);

      const tenant = await this.tenantRepository.findById(tenantId);

      if (!tenant) {
        throw new TenantNotFoundError(command.request.tenantId);
      }

      if (!tenant.isActive()) {
        throw new TenantInactiveError(command.request.tenantId);
      }

      const patient = Patient.create({
        tenantId,
        fullName: FullName.create(command.request.fullName),
        birthDate: BirthDate.create(parseBirthDate(command.request.birthDate)),
        gender: Gender.create(command.request.gender),
        phone: Phone.createOptional(command.request.phone),
        email: command.request.email?.trim()
          ? Email.create(command.request.email)
          : null,
      });

      await this.patientRepository.save(patient);
      await this.eventDispatcher.dispatch(patient.pullDomainEvents());

      return toCreatePatientResponse(patient);
    });
  }
}

function parseBirthDate(value: string): Date {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoDatePattern.test(value)) {
    throw new DomainError('BirthDate must use YYYY-MM-DD format.');
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    throw new DomainError('BirthDate must use YYYY-MM-DD format.');
  }

  return parsedDate;
}
