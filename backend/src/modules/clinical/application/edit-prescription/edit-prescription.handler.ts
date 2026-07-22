import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
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
import type { PrescriptionLineRequest } from '../create-prescription/create-prescription.command.js';
import { executePrescriptionUseCase } from '../execute-prescription-use-case.js';
import { loadTenantScopedPrescription } from '../load-tenant-scoped-prescription.js';
import { mapPrescriptionDomainError } from '../map-prescription-domain-error.js';
import { toPrescriptionResult } from '../prescription-result.js';
import { persistAndDispatchPrescriptionEvents } from '../persist-and-dispatch-prescription-events.js';
import type { Clock } from '../ports/clock.port.js';
import { EditPrescriptionCommand } from './edit-prescription.command.js';

export class EditPrescriptionHandler {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: EditPrescriptionCommand) {
    return executePrescriptionUseCase(async () => {
      const {
        tenantId,
        prescriptionId,
        title,
        clinicalNotes,
        patientInstructions,
        lines,
      } = command.request;

      const prescription = await loadTenantScopedPrescription(
        this.prescriptionRepository,
        tenantId,
        prescriptionId,
      );

      let changedFields: string[];

      try {
        changedFields = prescription.edit(
          {
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
          },
          this.clock.now(),
        );
      }
      catch (error) {
        mapPrescriptionDomainError(tenantId, prescriptionId, 'edit', error);
      }

      if (changedFields.length > 0) {
        await persistAndDispatchPrescriptionEvents(
          this.prescriptionRepository,
          this.eventDispatcher,
          prescription,
        );
      }

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
