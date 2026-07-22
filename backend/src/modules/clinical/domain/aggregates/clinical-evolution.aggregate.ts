import { AggregateRoot } from './aggregate-root.js';
import { DomainError } from '../errors/domain-error.js';
import { ClinicalEvolutionFinalizationRequirementsNotMetDomainError } from '../errors/clinical-evolution-finalization-requirements-not-met.domain-error.js';
import { ClinicalEvolutionInvalidTransitionDomainError } from '../errors/clinical-evolution-invalid-transition.domain-error.js';
import { ClinicalEvolutionNotDraftDomainError } from '../errors/clinical-evolution-not-draft.domain-error.js';
import { ClinicalEvolutionTerminalDomainError } from '../errors/clinical-evolution-terminal.domain-error.js';
import {
  ClinicalEvolutionCancelled,
  ClinicalEvolutionFinalized,
  ClinicalEvolutionResponsibleNutritionistChanged,
  ClinicalEvolutionStarted,
  ClinicalEvolutionUpdated,
} from '../events/clinical-evolution-events.js';
import type { EvolutionFinalizationPolicy } from '../policies/evolution-finalization-policy.js';
import { ClinicalEvolutionId } from '../value-objects/clinical-evolution-id.js';
import {
  ClinicalEvolutionSection,
  ClinicalEvolutionSectionValue,
} from '../value-objects/clinical-evolution-section.js';
import {
  ClinicalEvolutionStatusValue,
  isTerminalClinicalEvolutionStatus,
  type ClinicalEvolutionStatus,
} from '../value-objects/clinical-evolution-status.js';
import {
  AdherenceAndBarriers,
  AdverseEventsNotes,
  NextClinicalConsiderations,
  ProfessionalObservations,
  SubjectiveEvolution,
  TreatmentResponse,
} from '../value-objects/clinical-evolution-text-sections.js';

export interface CreateClinicalEvolutionProps {
  id?: ClinicalEvolutionId;
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  clinicalMomentAt: Date;
  subjectiveEvolution?: SubjectiveEvolution;
  professionalObservations?: ProfessionalObservations;
  treatmentResponse?: TreatmentResponse;
  adherenceAndBarriers?: AdherenceAndBarriers;
  adverseEventsNotes?: AdverseEventsNotes;
  nextClinicalConsiderations?: NextClinicalConsiderations;
  now: Date;
}

export interface ReconstituteClinicalEvolutionProps {
  id: ClinicalEvolutionId;
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  clinicalMomentAt: Date;
  status: ClinicalEvolutionStatus;
  version: number;
  subjectiveEvolution: SubjectiveEvolution;
  professionalObservations: ProfessionalObservations;
  treatmentResponse: TreatmentResponse;
  adherenceAndBarriers: AdherenceAndBarriers;
  adverseEventsNotes: AdverseEventsNotes;
  nextClinicalConsiderations: NextClinicalConsiderations;
  finalizedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session-bound aggregate (Model B): mandatory 1:1 clinicalEncounterId.
 * clinicalMomentAt is an immutable snapshot of encounter.startedAt at creation.
 * Content is immutable after finalize(); responsible nutritionist may change on DRAFT and FINALIZED.
 */
export class ClinicalEvolution extends AggregateRoot {
  private constructor(
    private readonly id: ClinicalEvolutionId,
    private readonly tenantId: string,
    private readonly clinicalEncounterId: string,
    private readonly patientId: string,
    private readonly createdByNutritionistId: string,
    private responsibleNutritionistId: string,
    private readonly clinicalMomentAt: Date,
    private status: ClinicalEvolutionStatus,
    private version: number,
    private subjectiveEvolution: SubjectiveEvolution,
    private professionalObservations: ProfessionalObservations,
    private treatmentResponse: TreatmentResponse,
    private adherenceAndBarriers: AdherenceAndBarriers,
    private adverseEventsNotes: AdverseEventsNotes,
    private nextClinicalConsiderations: NextClinicalConsiderations,
    private finalizedAt: Date | null,
    private cancelledAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    super();
  }

  static create(props: CreateClinicalEvolutionProps): ClinicalEvolution {
    const id = props.id ?? ClinicalEvolutionId.generate();
    const clinicalMomentAt = new Date(props.clinicalMomentAt);
    const subjectiveEvolution = props.subjectiveEvolution ?? SubjectiveEvolution.empty();
    const professionalObservations =
      props.professionalObservations ?? ProfessionalObservations.empty();
    const treatmentResponse = props.treatmentResponse ?? TreatmentResponse.empty();
    const adherenceAndBarriers = props.adherenceAndBarriers ?? AdherenceAndBarriers.empty();
    const adverseEventsNotes = props.adverseEventsNotes ?? AdverseEventsNotes.empty();
    const nextClinicalConsiderations =
      props.nextClinicalConsiderations ?? NextClinicalConsiderations.empty();

    const evolution = new ClinicalEvolution(
      id,
      props.tenantId,
      props.clinicalEncounterId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      clinicalMomentAt,
      ClinicalEvolutionStatusValue.Draft,
      1,
      subjectiveEvolution,
      professionalObservations,
      treatmentResponse,
      adherenceAndBarriers,
      adverseEventsNotes,
      nextClinicalConsiderations,
      null,
      null,
      props.now,
      props.now,
    );

    evolution.addDomainEvent(
      new ClinicalEvolutionStarted(
        id.toString(),
        props.tenantId,
        props.clinicalEncounterId,
        props.patientId,
        props.createdByNutritionistId,
        props.responsibleNutritionistId,
        ClinicalEvolutionStatusValue.Draft,
        clinicalMomentAt,
        1,
        props.now,
      ),
    );

    return evolution;
  }

  static reconstitute(props: ReconstituteClinicalEvolutionProps): ClinicalEvolution {
    return new ClinicalEvolution(
      props.id,
      props.tenantId,
      props.clinicalEncounterId,
      props.patientId,
      props.createdByNutritionistId,
      props.responsibleNutritionistId,
      new Date(props.clinicalMomentAt),
      props.status,
      props.version,
      props.subjectiveEvolution,
      props.professionalObservations,
      props.treatmentResponse,
      props.adherenceAndBarriers,
      props.adverseEventsNotes,
      props.nextClinicalConsiderations,
      props.finalizedAt ? new Date(props.finalizedAt) : null,
      props.cancelledAt ? new Date(props.cancelledAt) : null,
      props.createdAt,
      props.updatedAt,
    );
  }

  updateSection(
    section: ClinicalEvolutionSection,
    value:
      | SubjectiveEvolution
      | ProfessionalObservations
      | TreatmentResponse
      | AdherenceAndBarriers
      | AdverseEventsNotes
      | NextClinicalConsiderations,
    now: Date,
  ): boolean {
    ensureNotTerminal(this.status);
    ensureDraft(this.status);

    const current = this.getSection(section);

    if (current.equals(value)) {
      return false;
    }

    this.setSection(section, value);
    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalEvolutionUpdated(
        this.id.toString(),
        this.tenantId,
        this.clinicalEncounterId,
        this.patientId,
        this.responsibleNutritionistId,
        this.status,
        this.clinicalMomentAt,
        this.version,
        section.toString(),
        now,
      ),
    );

    return true;
  }

  finalize(now: Date, policy: EvolutionFinalizationPolicy): void {
    ensureNotTerminal(this.status);

    if (this.status !== ClinicalEvolutionStatusValue.Draft) {
      throw new ClinicalEvolutionInvalidTransitionDomainError(this.status, 'finalize');
    }

    try {
      policy.validate(this);
    } catch (error) {
      if (error instanceof ClinicalEvolutionFinalizationRequirementsNotMetDomainError) {
        throw error;
      }

      throw error;
    }

    this.status = ClinicalEvolutionStatusValue.Finalized;
    this.finalizedAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalEvolutionFinalized(
        this.id.toString(),
        this.tenantId,
        this.clinicalEncounterId,
        this.patientId,
        this.responsibleNutritionistId,
        this.status,
        this.clinicalMomentAt,
        this.version,
        now,
        now,
      ),
    );
  }

  cancel(now: Date): void {
    ensureNotTerminal(this.status);

    if (this.status !== ClinicalEvolutionStatusValue.Draft) {
      throw new ClinicalEvolutionInvalidTransitionDomainError(this.status, 'cancel');
    }

    this.status = ClinicalEvolutionStatusValue.Cancelled;
    this.cancelledAt = now;
    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalEvolutionCancelled(
        this.id.toString(),
        this.tenantId,
        this.clinicalEncounterId,
        this.patientId,
        this.responsibleNutritionistId,
        this.status,
        this.clinicalMomentAt,
        this.version,
        now,
        now,
      ),
    );
  }

  changeResponsibleNutritionist(
    responsibleNutritionistId: string,
    now: Date,
  ): boolean {
    ensureNotTerminal(this.status);

    if (this.responsibleNutritionistId === responsibleNutritionistId) {
      return false;
    }

    this.responsibleNutritionistId = responsibleNutritionistId;
    this.bumpVersion(now);
    this.addDomainEvent(
      new ClinicalEvolutionResponsibleNutritionistChanged(
        this.id.toString(),
        this.tenantId,
        this.clinicalEncounterId,
        this.patientId,
        this.responsibleNutritionistId,
        this.status,
        this.clinicalMomentAt,
        this.version,
        now,
      ),
    );

    return true;
  }

  getId(): ClinicalEvolutionId {
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

  getCreatedByNutritionistId(): string {
    return this.createdByNutritionistId;
  }

  getResponsibleNutritionistId(): string {
    return this.responsibleNutritionistId;
  }

  getClinicalMomentAt(): Date {
    return new Date(this.clinicalMomentAt);
  }

  getStatus(): ClinicalEvolutionStatus {
    return this.status;
  }

  getVersion(): number {
    return this.version;
  }

  getSubjectiveEvolution(): SubjectiveEvolution {
    return this.subjectiveEvolution;
  }

  getProfessionalObservations(): ProfessionalObservations {
    return this.professionalObservations;
  }

  getTreatmentResponse(): TreatmentResponse {
    return this.treatmentResponse;
  }

  getAdherenceAndBarriers(): AdherenceAndBarriers {
    return this.adherenceAndBarriers;
  }

  getAdverseEventsNotes(): AdverseEventsNotes {
    return this.adverseEventsNotes;
  }

  getNextClinicalConsiderations(): NextClinicalConsiderations {
    return this.nextClinicalConsiderations;
  }

  getFinalizedAt(): Date | null {
    return this.finalizedAt ? new Date(this.finalizedAt) : null;
  }

  getCancelledAt(): Date | null {
    return this.cancelledAt ? new Date(this.cancelledAt) : null;
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

  private getSection(
    section: ClinicalEvolutionSection,
  ):
    | SubjectiveEvolution
    | ProfessionalObservations
    | TreatmentResponse
    | AdherenceAndBarriers
    | AdverseEventsNotes
    | NextClinicalConsiderations {
    switch (section.toString()) {
      case ClinicalEvolutionSectionValue.SubjectiveEvolution:
        return this.subjectiveEvolution;
      case ClinicalEvolutionSectionValue.ProfessionalObservations:
        return this.professionalObservations;
      case ClinicalEvolutionSectionValue.TreatmentResponse:
        return this.treatmentResponse;
      case ClinicalEvolutionSectionValue.AdherenceAndBarriers:
        return this.adherenceAndBarriers;
      case ClinicalEvolutionSectionValue.AdverseEventsNotes:
        return this.adverseEventsNotes;
      case ClinicalEvolutionSectionValue.NextClinicalConsiderations:
        return this.nextClinicalConsiderations;
      default:
        throw new DomainError('Invalid clinical evolution section.');
    }
  }

  private setSection(
    section: ClinicalEvolutionSection,
    value:
      | SubjectiveEvolution
      | ProfessionalObservations
      | TreatmentResponse
      | AdherenceAndBarriers
      | AdverseEventsNotes
      | NextClinicalConsiderations,
  ): void {
    switch (section.toString()) {
      case ClinicalEvolutionSectionValue.SubjectiveEvolution:
        this.subjectiveEvolution = value as SubjectiveEvolution;
        return;
      case ClinicalEvolutionSectionValue.ProfessionalObservations:
        this.professionalObservations = value as ProfessionalObservations;
        return;
      case ClinicalEvolutionSectionValue.TreatmentResponse:
        this.treatmentResponse = value as TreatmentResponse;
        return;
      case ClinicalEvolutionSectionValue.AdherenceAndBarriers:
        this.adherenceAndBarriers = value as AdherenceAndBarriers;
        return;
      case ClinicalEvolutionSectionValue.AdverseEventsNotes:
        this.adverseEventsNotes = value as AdverseEventsNotes;
        return;
      case ClinicalEvolutionSectionValue.NextClinicalConsiderations:
        this.nextClinicalConsiderations = value as NextClinicalConsiderations;
        return;
      default:
        throw new DomainError('Invalid clinical evolution section.');
    }
  }
}

function ensureNotTerminal(status: ClinicalEvolutionStatus): void {
  if (isTerminalClinicalEvolutionStatus(status)) {
    throw new ClinicalEvolutionTerminalDomainError(status);
  }
}

function ensureDraft(status: ClinicalEvolutionStatus): void {
  if (status !== ClinicalEvolutionStatusValue.Draft) {
    throw new ClinicalEvolutionNotDraftDomainError(status);
  }
}
