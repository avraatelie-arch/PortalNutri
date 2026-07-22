import { Dose } from '../value-objects/dose.js';
import { Frequency } from '../value-objects/frequency.js';
import { PrescriptionLineDescription } from '../value-objects/prescription-line-description.js';
import { PrescriptionLineId } from '../value-objects/prescription-line-id.js';
import {
  ActiveIngredients,
  AdministrationInstructions,
  AdministrationRoute,
  Concentration,
  DosageForm,
  Duration,
  LineClinicalNotes,
  PatientInstructions,
} from '../value-objects/prescription-text-sections.js';

export interface PrescriptionLineProps {
  id?: PrescriptionLineId;
  sortOrder: number;
  description: PrescriptionLineDescription;
  dose?: Dose;
  frequency?: Frequency;
  dosageForm?: DosageForm;
  administrationRoute?: AdministrationRoute;
  activeIngredients?: ActiveIngredients;
  concentration?: Concentration;
  duration?: Duration;
  administrationInstructions?: AdministrationInstructions;
  lineClinicalNotes?: LineClinicalNotes;
  patientInstructions?: PatientInstructions;
}

export interface ReconstitutePrescriptionLineProps {
  id: PrescriptionLineId;
  sortOrder: number;
  description: PrescriptionLineDescription;
  dose: Dose;
  frequency: Frequency;
  dosageForm: DosageForm;
  administrationRoute: AdministrationRoute;
  activeIngredients: ActiveIngredients;
  concentration: Concentration;
  duration: Duration;
  administrationInstructions: AdministrationInstructions;
  lineClinicalNotes: LineClinicalNotes;
  patientInstructions: PatientInstructions;
}

export class PrescriptionLine {
  private constructor(
    private readonly id: PrescriptionLineId,
    private readonly sortOrder: number,
    private readonly description: PrescriptionLineDescription,
    private readonly dose: Dose,
    private readonly frequency: Frequency,
    private readonly dosageForm: DosageForm,
    private readonly administrationRoute: AdministrationRoute,
    private readonly activeIngredients: ActiveIngredients,
    private readonly concentration: Concentration,
    private readonly duration: Duration,
    private readonly administrationInstructions: AdministrationInstructions,
    private readonly lineClinicalNotes: LineClinicalNotes,
    private readonly patientInstructions: PatientInstructions,
  ) {}

  static create(props: PrescriptionLineProps): PrescriptionLine {
    return new PrescriptionLine(
      props.id ?? PrescriptionLineId.generate(),
      props.sortOrder,
      props.description,
      props.dose ?? Dose.empty(),
      props.frequency ?? Frequency.empty(),
      props.dosageForm ?? DosageForm.empty(),
      props.administrationRoute ?? AdministrationRoute.empty(),
      props.activeIngredients ?? ActiveIngredients.empty(),
      props.concentration ?? Concentration.empty(),
      props.duration ?? Duration.empty(),
      props.administrationInstructions ?? AdministrationInstructions.empty(),
      props.lineClinicalNotes ?? LineClinicalNotes.empty(),
      props.patientInstructions ?? PatientInstructions.empty(),
    );
  }

  static reconstitute(props: ReconstitutePrescriptionLineProps): PrescriptionLine {
    return new PrescriptionLine(
      props.id,
      props.sortOrder,
      props.description,
      props.dose,
      props.frequency,
      props.dosageForm,
      props.administrationRoute,
      props.activeIngredients,
      props.concentration,
      props.duration,
      props.administrationInstructions,
      props.lineClinicalNotes,
      props.patientInstructions,
    );
  }

  getId(): PrescriptionLineId {
    return this.id;
  }

  getSortOrder(): number {
    return this.sortOrder;
  }

  getDescription(): PrescriptionLineDescription {
    return this.description;
  }

  getDose(): Dose {
    return this.dose;
  }

  getFrequency(): Frequency {
    return this.frequency;
  }

  getDosageForm(): DosageForm {
    return this.dosageForm;
  }

  getAdministrationRoute(): AdministrationRoute {
    return this.administrationRoute;
  }

  getActiveIngredients(): ActiveIngredients {
    return this.activeIngredients;
  }

  getConcentration(): Concentration {
    return this.concentration;
  }

  getDuration(): Duration {
    return this.duration;
  }

  getAdministrationInstructions(): AdministrationInstructions {
    return this.administrationInstructions;
  }

  getLineClinicalNotes(): LineClinicalNotes {
    return this.lineClinicalNotes;
  }

  getPatientInstructions(): PatientInstructions {
    return this.patientInstructions;
  }

  equals(other: PrescriptionLine): boolean {
    return (
      this.id.toString() === other.id.toString()
      && this.sortOrder === other.sortOrder
      && this.description.equals(other.description)
      && this.dose.equals(other.dose)
      && this.frequency.equals(other.frequency)
      && this.dosageForm.equals(other.dosageForm)
      && this.administrationRoute.equals(other.administrationRoute)
      && this.activeIngredients.equals(other.activeIngredients)
      && this.concentration.equals(other.concentration)
      && this.duration.equals(other.duration)
      && this.administrationInstructions.equals(other.administrationInstructions)
      && this.lineClinicalNotes.equals(other.lineClinicalNotes)
      && this.patientInstructions.equals(other.patientInstructions)
    );
  }
}
