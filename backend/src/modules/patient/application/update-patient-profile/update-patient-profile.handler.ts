import type { PatientRepository } from '../../domain/repositories/patient-repository.js';
import type { UpdatePatientProfileProps } from '../../domain/aggregates/patient.aggregate.js';
import { DomainError } from '../../../iam/domain/errors/domain-error.js';
import { Email } from '../../../iam/domain/value-objects/email.js';
import { FullName } from '../../../iam/domain/value-objects/full-name.js';
import { Phone } from '../../../iam/domain/value-objects/phone.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import { BirthDate } from '../../domain/value-objects/birth-date.js';
import { Gender } from '../../domain/value-objects/gender.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executePatientUseCase } from '../execute-patient-use-case.js';
import { PatientNotFoundError } from '../errors/patient-not-found.error.js';
import { UpdatePatientProfileCommand } from './update-patient-profile.command.js';
import { toUpdatePatientProfileResult } from './update-patient-profile.result.js';

export class UpdatePatientProfileHandler {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: UpdatePatientProfileCommand) {
    return executePatientUseCase(async () => {
      const patient = await this.patientRepository.findById(
        PatientId.create(command.request.patientId),
      );

      if (!patient) {
        throw new PatientNotFoundError(command.request.patientId);
      }

      const updateProps: UpdatePatientProfileProps = {};

      if (command.request.fullName !== undefined) {
        updateProps.fullName = FullName.create(command.request.fullName);
      }

      if (command.request.birthDate !== undefined) {
        updateProps.birthDate = BirthDate.create(
          parseBirthDate(command.request.birthDate),
        );
      }

      if (command.request.gender !== undefined) {
        updateProps.gender = Gender.create(command.request.gender);
      }

      if (command.request.phone !== undefined) {
        updateProps.phone = Phone.createOptional(command.request.phone);
      }

      if (command.request.email !== undefined) {
        updateProps.email = command.request.email?.trim()
          ? Email.create(command.request.email)
          : null;
      }

      patient.updateProfile(updateProps);
      const events = patient.pullDomainEvents();

      if (events.length > 0) {
        await this.patientRepository.save(patient);
        await this.eventDispatcher.dispatch(events);
      }

      return toUpdatePatientProfileResult(patient);
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
