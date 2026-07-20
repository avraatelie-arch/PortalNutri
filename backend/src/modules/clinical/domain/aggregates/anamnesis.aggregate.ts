import { AggregateRoot } from './aggregate-root.js';
import { DomainError } from '../errors/domain-error.js';
import {
  AnamnesisAlreadyCompletedDomainError,
  AnamnesisIncompleteDomainError,
} from '../errors/anamnesis-incomplete.domain-error.js';
import {
  AnamnesisCompleted,
  AnamnesisSectionUpdated,
  AnamnesisStarted,
} from '../events/anamnesis-events.js';
import type { AnamnesisCompletionPolicy } from '../policies/anamnesis-completion-policy.js';
import { AnamnesisId } from '../value-objects/anamnesis-id.js';
import {
  AnamnesisSection,
  AnamnesisSectionValue,
  CHIEF_COMPLAINT_MAX_LENGTH,
  ANAMNESIS_SECTION_MAX_LENGTH,
} from '../value-objects/anamnesis-section.js';
import { AnamnesisStatus } from '../value-objects/anamnesis-status.js';
import { ClinicalTextSection } from '../value-objects/clinical-text-section.js';

export interface CreateAnamnesisProps {
  id?: AnamnesisId;
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  now: Date;
}

export interface ReconstituteAnamnesisProps {
  id: AnamnesisId;
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  status: AnamnesisStatus;
  version: number;
  chiefComplaint: ClinicalTextSection;
  currentHistory: ClinicalTextSection;
  medicalHistory: ClinicalTextSection;
  familyHistory: ClinicalTextSection;
  gastrointestinalHistory: ClinicalTextSection;
  dietaryHistory: ClinicalTextSection;
  lifestyleHistory: ClinicalTextSection;
  medicationHistory: ClinicalTextSection;
  supplementHistory: ClinicalTextSection;
  allergiesAndIntolerances: ClinicalTextSection;
  observations: ClinicalTextSection;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Anamnesis extends AggregateRoot {
  private constructor(
    private readonly id: AnamnesisId,
    private readonly tenantId: string,
    private readonly clinicalEncounterId: string,
    private readonly patientId: string,
    private readonly nutritionistId: string,
    private status: AnamnesisStatus,
    private version: number,
    private chiefComplaint: ClinicalTextSection,
    private currentHistory: ClinicalTextSection,
    private medicalHistory: ClinicalTextSection,
    private familyHistory: ClinicalTextSection,
    private gastrointestinalHistory: ClinicalTextSection,
    private dietaryHistory: ClinicalTextSection,
    private lifestyleHistory: ClinicalTextSection,
    private medicationHistory: ClinicalTextSection,
    private supplementHistory: ClinicalTextSection,
    private allergiesAndIntolerances: ClinicalTextSection,
    private observations: ClinicalTextSection,
    private completedAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateAnamnesisProps): Anamnesis {
    const id = props.id ?? AnamnesisId.generate();

    const anamnesis = new Anamnesis(
      id,
      props.tenantId,
      props.clinicalEncounterId,
      props.patientId,
      props.nutritionistId,
      AnamnesisStatus.Draft,
      1,
      ClinicalTextSection.empty(CHIEF_COMPLAINT_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
      null,
      props.now,
      props.now,
    );

    anamnesis.addDomainEvent(
      new AnamnesisStarted(
        id.toString(),
        props.tenantId,
        props.clinicalEncounterId,
        props.patientId,
        props.nutritionistId,
        AnamnesisStatus.Draft,
        props.now,
      ),
    );

    return anamnesis;
  }

  static reconstitute(props: ReconstituteAnamnesisProps): Anamnesis {
    return new Anamnesis(
      props.id,
      props.tenantId,
      props.clinicalEncounterId,
      props.patientId,
      props.nutritionistId,
      props.status,
      props.version,
      props.chiefComplaint,
      props.currentHistory,
      props.medicalHistory,
      props.familyHistory,
      props.gastrointestinalHistory,
      props.dietaryHistory,
      props.lifestyleHistory,
      props.medicationHistory,
      props.supplementHistory,
      props.allergiesAndIntolerances,
      props.observations,
      props.completedAt ? new Date(props.completedAt) : null,
      props.createdAt,
      props.updatedAt,
    );
  }

  updateSection(
    section: AnamnesisSection,
    value: ClinicalTextSection,
    now: Date,
  ): boolean {
    ensureDraft(this.status);

    const current = this.getSection(section);

    if (current.equals(value)) {
      return false;
    }

    this.setSection(section, value);
    this.bumpVersion(now);
    this.addDomainEvent(
      new AnamnesisSectionUpdated(
        this.id.toString(),
        this.tenantId,
        this.clinicalEncounterId,
        this.patientId,
        this.nutritionistId,
        this.status,
        section.toString(),
        now,
      ),
    );

    return true;
  }

  complete(now: Date, policy: AnamnesisCompletionPolicy): boolean {
    if (this.status === AnamnesisStatus.Completed) {
      return false;
    }

    ensureDraft(this.status);

    try {
      policy.validate(this);
    } catch (error) {
      if (error instanceof AnamnesisIncompleteDomainError) {
        throw error;
      }

      throw error;
    }

    this.status = AnamnesisStatus.Completed;
    this.completedAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new AnamnesisCompleted(
        this.id.toString(),
        this.tenantId,
        this.clinicalEncounterId,
        this.patientId,
        this.nutritionistId,
        AnamnesisStatus.Completed,
        now,
      ),
    );

    return true;
  }

  getId(): AnamnesisId {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getClinicalEncounterId(): string {
    return this.clinicalEncounterId;
  }

  getPatientId(): string {
    return this.patientId;
  }

  getNutritionistId(): string {
    return this.nutritionistId;
  }

  getStatus(): AnamnesisStatus {
    return this.status;
  }

  getVersion(): number {
    return this.version;
  }

  getChiefComplaint(): ClinicalTextSection {
    return this.chiefComplaint;
  }

  getCurrentHistory(): ClinicalTextSection {
    return this.currentHistory;
  }

  getMedicalHistory(): ClinicalTextSection {
    return this.medicalHistory;
  }

  getFamilyHistory(): ClinicalTextSection {
    return this.familyHistory;
  }

  getGastrointestinalHistory(): ClinicalTextSection {
    return this.gastrointestinalHistory;
  }

  getDietaryHistory(): ClinicalTextSection {
    return this.dietaryHistory;
  }

  getLifestyleHistory(): ClinicalTextSection {
    return this.lifestyleHistory;
  }

  getMedicationHistory(): ClinicalTextSection {
    return this.medicationHistory;
  }

  getSupplementHistory(): ClinicalTextSection {
    return this.supplementHistory;
  }

  getAllergiesAndIntolerances(): ClinicalTextSection {
    return this.allergiesAndIntolerances;
  }

  getObservations(): ClinicalTextSection {
    return this.observations;
  }

  getCompletedAt(): Date | null {
    return this.completedAt ? new Date(this.completedAt) : null;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  private bumpVersion(now: Date): void {
    this.version += 1;
    this.updatedAt = now;
  }

  private getSection(section: AnamnesisSection): ClinicalTextSection {
    switch (section.toString()) {
      case AnamnesisSectionValue.ChiefComplaint:
        return this.chiefComplaint;
      case AnamnesisSectionValue.CurrentHistory:
        return this.currentHistory;
      case AnamnesisSectionValue.MedicalHistory:
        return this.medicalHistory;
      case AnamnesisSectionValue.FamilyHistory:
        return this.familyHistory;
      case AnamnesisSectionValue.GastrointestinalHistory:
        return this.gastrointestinalHistory;
      case AnamnesisSectionValue.DietaryHistory:
        return this.dietaryHistory;
      case AnamnesisSectionValue.LifestyleHistory:
        return this.lifestyleHistory;
      case AnamnesisSectionValue.MedicationHistory:
        return this.medicationHistory;
      case AnamnesisSectionValue.SupplementHistory:
        return this.supplementHistory;
      case AnamnesisSectionValue.AllergiesAndIntolerances:
        return this.allergiesAndIntolerances;
      case AnamnesisSectionValue.Observations:
        return this.observations;
      default:
        throw new DomainError('Invalid anamnesis section.');
    }
  }

  private setSection(section: AnamnesisSection, value: ClinicalTextSection): void {
    switch (section.toString()) {
      case AnamnesisSectionValue.ChiefComplaint:
        this.chiefComplaint = value;
        return;
      case AnamnesisSectionValue.CurrentHistory:
        this.currentHistory = value;
        return;
      case AnamnesisSectionValue.MedicalHistory:
        this.medicalHistory = value;
        return;
      case AnamnesisSectionValue.FamilyHistory:
        this.familyHistory = value;
        return;
      case AnamnesisSectionValue.GastrointestinalHistory:
        this.gastrointestinalHistory = value;
        return;
      case AnamnesisSectionValue.DietaryHistory:
        this.dietaryHistory = value;
        return;
      case AnamnesisSectionValue.LifestyleHistory:
        this.lifestyleHistory = value;
        return;
      case AnamnesisSectionValue.MedicationHistory:
        this.medicationHistory = value;
        return;
      case AnamnesisSectionValue.SupplementHistory:
        this.supplementHistory = value;
        return;
      case AnamnesisSectionValue.AllergiesAndIntolerances:
        this.allergiesAndIntolerances = value;
        return;
      case AnamnesisSectionValue.Observations:
        this.observations = value;
        return;
      default:
        throw new DomainError('Invalid anamnesis section.');
    }
  }
}

function ensureDraft(status: AnamnesisStatus): void {
  if (status === AnamnesisStatus.Completed) {
    throw new AnamnesisAlreadyCompletedDomainError();
  }

  if (status !== AnamnesisStatus.Draft) {
    throw new DomainError(`Cannot modify anamnesis in status ${status}.`);
  }
}
