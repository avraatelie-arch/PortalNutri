import { AggregateRoot } from './aggregate-root.js';
import { AnthropometricAssessmentRecorded } from '../events/anthropometric-assessment-events.js';
import { AnthropometricAssessmentId } from '../value-objects/anthropometric-assessment-id.js';
import type { AnthropometricAssessmentId as AnthropometricAssessmentIdType } from '../value-objects/anthropometric-assessment-id.js';
import type { AnthropometricNotes } from '../value-objects/anthropometric-notes.js';
import type { BodyCircumference } from '../value-objects/body-circumference.js';
import type { BodyHeight } from '../value-objects/body-height.js';
import type { BodyMassIndex } from '../value-objects/body-mass-index.js';
import type { BodyMassIndexClassification } from '../value-objects/body-mass-index-classification.js';
import type { BodyWeight } from '../value-objects/body-weight.js';
import type { ClinicalSourceRequestId } from '../value-objects/clinical-source-request-id.js';
import type { WaistToHipRatio } from '../value-objects/waist-to-hip-ratio.js';

export interface CreateAnthropometricAssessmentProps {
  id?: AnthropometricAssessmentIdType;
  tenantId: string;
  anamnesisId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  weight: BodyWeight;
  height: BodyHeight;
  bodyMassIndex: BodyMassIndex;
  bodyMassIndexClassification: BodyMassIndexClassification;
  waistCircumference: BodyCircumference | null;
  hipCircumference: BodyCircumference | null;
  abdominalCircumference: BodyCircumference | null;
  neckCircumference: BodyCircumference | null;
  armCircumference: BodyCircumference | null;
  calfCircumference: BodyCircumference | null;
  waistToHipRatio: WaistToHipRatio | null;
  notes: AnthropometricNotes;
  sourceRequestId: ClinicalSourceRequestId | null;
  measuredAt: Date;
}

export interface ReconstituteAnthropometricAssessmentProps
  extends CreateAnthropometricAssessmentProps {
  id: AnthropometricAssessmentIdType;
  version: number;
  createdAt: Date;
}

export class AnthropometricAssessment extends AggregateRoot {
  private constructor(
    private readonly id: AnthropometricAssessmentIdType,
    private readonly tenantId: string,
    private readonly anamnesisId: string,
    private readonly clinicalEncounterId: string,
    private readonly patientId: string,
    private readonly nutritionistId: string,
    private readonly weight: BodyWeight,
    private readonly height: BodyHeight,
    private readonly bodyMassIndex: BodyMassIndex,
    private readonly bodyMassIndexClassification: BodyMassIndexClassification,
    private readonly waistCircumference: BodyCircumference | null,
    private readonly hipCircumference: BodyCircumference | null,
    private readonly abdominalCircumference: BodyCircumference | null,
    private readonly neckCircumference: BodyCircumference | null,
    private readonly armCircumference: BodyCircumference | null,
    private readonly calfCircumference: BodyCircumference | null,
    private readonly waistToHipRatio: WaistToHipRatio | null,
    private readonly notes: AnthropometricNotes,
    private readonly sourceRequestId: ClinicalSourceRequestId | null,
    private readonly measuredAt: Date,
    private readonly version: number,
    private readonly createdAt: Date,
  ) {
    super();
  }

  static create(
    props: CreateAnthropometricAssessmentProps,
    createdAt: Date,
  ): AnthropometricAssessment {
    const id = props.id ?? AnthropometricAssessmentId.create();
    const assessment = new AnthropometricAssessment(
      id,
      props.tenantId,
      props.anamnesisId,
      props.clinicalEncounterId,
      props.patientId,
      props.nutritionistId,
      props.weight,
      props.height,
      props.bodyMassIndex,
      props.bodyMassIndexClassification,
      props.waistCircumference,
      props.hipCircumference,
      props.abdominalCircumference,
      props.neckCircumference,
      props.armCircumference,
      props.calfCircumference,
      props.waistToHipRatio,
      props.notes,
      props.sourceRequestId,
      props.measuredAt,
      1,
      createdAt,
    );

    assessment.addDomainEvent(
      new AnthropometricAssessmentRecorded(
        id.toString(),
        props.tenantId,
        props.anamnesisId,
        props.clinicalEncounterId,
        props.patientId,
        props.nutritionistId,
        1,
        props.measuredAt,
        createdAt,
      ),
    );

    return assessment;
  }

  static reconstitute(
    props: ReconstituteAnthropometricAssessmentProps,
  ): AnthropometricAssessment {
    return new AnthropometricAssessment(
      props.id,
      props.tenantId,
      props.anamnesisId,
      props.clinicalEncounterId,
      props.patientId,
      props.nutritionistId,
      props.weight,
      props.height,
      props.bodyMassIndex,
      props.bodyMassIndexClassification,
      props.waistCircumference,
      props.hipCircumference,
      props.abdominalCircumference,
      props.neckCircumference,
      props.armCircumference,
      props.calfCircumference,
      props.waistToHipRatio,
      props.notes,
      props.sourceRequestId,
      props.measuredAt,
      props.version,
      props.createdAt,
    );
  }

  getId(): AnthropometricAssessmentIdType {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getAnamnesisId(): string {
    return this.anamnesisId;
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

  getWeight(): BodyWeight {
    return this.weight;
  }

  getHeight(): BodyHeight {
    return this.height;
  }

  getBodyMassIndex(): BodyMassIndex {
    return this.bodyMassIndex;
  }

  getBodyMassIndexClassification(): BodyMassIndexClassification {
    return this.bodyMassIndexClassification;
  }

  getWaistCircumference(): BodyCircumference | null {
    return this.waistCircumference;
  }

  getHipCircumference(): BodyCircumference | null {
    return this.hipCircumference;
  }

  getAbdominalCircumference(): BodyCircumference | null {
    return this.abdominalCircumference;
  }

  getNeckCircumference(): BodyCircumference | null {
    return this.neckCircumference;
  }

  getArmCircumference(): BodyCircumference | null {
    return this.armCircumference;
  }

  getCalfCircumference(): BodyCircumference | null {
    return this.calfCircumference;
  }

  getWaistToHipRatio(): WaistToHipRatio | null {
    return this.waistToHipRatio;
  }

  getNotes(): AnthropometricNotes {
    return this.notes;
  }

  getSourceRequestId(): ClinicalSourceRequestId | null {
    return this.sourceRequestId;
  }

  getMeasuredAt(): Date {
    return this.measuredAt;
  }

  getVersion(): number {
    return this.version;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
