import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { Prescription } from '../../domain/aggregates/prescription.aggregate.js';
import { PrescriptionLine } from '../../domain/entities/prescription-line.js';
import type { PrescriptionRepository } from '../../domain/repositories/prescription-repository.js';
import { Dose } from '../../domain/value-objects/dose.js';
import { Frequency } from '../../domain/value-objects/frequency.js';
import { PrescriptionLineDescription } from '../../domain/value-objects/prescription-line-description.js';
import { PrescriptionTitle } from '../../domain/value-objects/prescription-title.js';
import {
  ActiveIngredients,
  AdministrationInstructions,
  AdministrationRoute,
  Concentration,
  DosageForm,
  Duration,
  LineClinicalNotes,
  PatientInstructions,
  PrescriptionClinicalNotes,
} from '../../domain/value-objects/prescription-text-sections.js';
import { executePrescriptionUseCase } from '../execute-prescription-use-case.js';
import { buildPrescriptionCreationContext } from '../prescription-creation-context.js';
import { createPrescriptionCreationContextErrors } from '../prescription-creation-context.errors.js';
import { toPrescriptionResult } from '../prescription-result.js';
import type { AnamnesisDirectoryPort } from '../ports/anamnesis-directory.port.js';
import type { ClinicalEncounterDirectoryPort } from '../ports/clinical-encounter-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import type { PatientClinicalDirectoryPort } from '../ports/patient-clinical-directory.port.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import {
  CreatePrescriptionCommand,
  type PrescriptionLineRequest,
} from './create-prescription.command.js';

export class CreatePrescriptionHandler {
  private readonly creationContextErrors = createPrescriptionCreationContextErrors();

  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly patientClinicalDirectory: PatientClinicalDirectoryPort,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly clinicalEncounterDirectory: ClinicalEncounterDirectoryPort,
    private readonly anamnesisDirectory: AnamnesisDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CreatePrescriptionCommand) {
    return executePrescriptionUseCase(async () => {
      const {
        tenantId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        title,
        clinicalNotes,
        patientInstructions,
        lines,
      } = command.request;

      await buildPrescriptionCreationContext({
        tenantDirectory: this.tenantDirectory,
        patientClinicalDirectory: this.patientClinicalDirectory,
        nutritionistDirectory: this.nutritionistDirectory,
        clinicalEncounterDirectory: this.clinicalEncounterDirectory,
        anamnesisDirectory: this.anamnesisDirectory,
        request: {
          tenantId,
          patientId,
          createdByNutritionistId,
          responsibleNutritionistId,
          originClinicalEncounterId,
          originAnamnesisId,
        },
        errors: this.creationContextErrors,
      });

      const prescription = Prescription.create({
        tenantId,
        patientId,
        createdByNutritionistId,
        responsibleNutritionistId,
        originClinicalEncounterId,
        originAnamnesisId,
        title: title !== undefined ? PrescriptionTitle.create(title) : undefined,
        clinicalNotes:
          clinicalNotes !== undefined
            ? PrescriptionClinicalNotes.create(clinicalNotes)
            : undefined,
        patientInstructions:
          patientInstructions !== undefined
            ? PatientInstructions.create(patientInstructions)
            : undefined,
        lines: mapLineRequests(lines),
        now: this.clock.now(),
      });

      await this.prescriptionRepository.save(prescription);
      await this.eventDispatcher.dispatch(prescription.pullDomainEvents());

      return toPrescriptionResult(prescription);
    });
  }
}

function mapLineRequests(lines?: PrescriptionLineRequest[]): PrescriptionLine[] | undefined {
  if (lines === undefined) {
    return undefined;
  }

  return lines.map((line) =>
    PrescriptionLine.create({
      sortOrder: line.sortOrder,
      description: PrescriptionLineDescription.create(line.description),
      dose: Dose.create({
        quantity: line.doseQuantity,
        unit: line.doseUnit,
        customDisplay: line.doseUnitCustomDisplay,
      }),
      frequency: Frequency.create({
        displayText: line.frequencyDisplayText,
        timesPerDay: line.frequencyTimesPerDay,
        intervalHours: line.frequencyIntervalHours,
      }),
      dosageForm:
        line.dosageForm !== undefined ? DosageForm.create(line.dosageForm) : undefined,
      administrationRoute:
        line.administrationRoute !== undefined
          ? AdministrationRoute.create(line.administrationRoute)
          : undefined,
      activeIngredients:
        line.activeIngredients !== undefined
          ? ActiveIngredients.create(line.activeIngredients)
          : undefined,
      concentration:
        line.concentration !== undefined
          ? Concentration.create(line.concentration)
          : undefined,
      duration:
        line.duration !== undefined ? Duration.create(line.duration) : undefined,
      administrationInstructions:
        line.administrationInstructions !== undefined
          ? AdministrationInstructions.create(line.administrationInstructions)
          : undefined,
      lineClinicalNotes:
        line.lineClinicalNotes !== undefined
          ? LineClinicalNotes.create(line.lineClinicalNotes)
          : undefined,
      patientInstructions:
        line.patientInstructions !== undefined
          ? PatientInstructions.create(line.patientInstructions)
          : undefined,
    }),
  );
}
