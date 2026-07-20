import { AggregateRoot } from './aggregate-root.js';
import { BodyCompositionRecorded } from '../events/body-composition-assessment-events.js';
import { BodyCompositionAssessmentId } from '../value-objects/body-composition-assessment-id.js';
import type { BodyCompositionAssessmentId as BodyCompositionAssessmentIdType } from '../value-objects/body-composition-assessment-id.js';
import type { BasalMetabolicRate } from '../value-objects/basal-metabolic-rate.js';
import type { BodyCompositionMeasurementSource } from '../value-objects/body-composition-measurement-source.js';
import type { BodyCompositionNotes } from '../value-objects/body-composition-notes.js';
import type { BodyFatPercentage } from '../value-objects/body-fat-percentage.js';
import type { BodyWaterPercentage } from '../value-objects/body-water-percentage.js';
import type { BoneMass } from '../value-objects/bone-mass.js';
import type { ClinicalSourceRequestId } from '../value-objects/clinical-source-request-id.js';
import type { FatMass } from '../value-objects/fat-mass.js';
import type { LeanMass } from '../value-objects/lean-mass.js';
import type { MetabolicAge } from '../value-objects/metabolic-age.js';
import type { MuscleMass } from '../value-objects/muscle-mass.js';
import type { VisceralFatLevel } from '../value-objects/visceral-fat-level.js';

export interface CreateBodyCompositionAssessmentProps {
  id?: BodyCompositionAssessmentIdType;
  tenantId: string;
  anamnesisId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  anthropometricAssessmentId: string | null;
  bodyFatPercentage: BodyFatPercentage;
  leanMass: LeanMass | null;
  fatMass: FatMass | null;
  muscleMass: MuscleMass | null;
  boneMass: BoneMass | null;
  bodyWaterPercentage: BodyWaterPercentage | null;
  visceralFatLevel: VisceralFatLevel | null;
  basalMetabolicRate: BasalMetabolicRate | null;
  metabolicAge: MetabolicAge | null;
  notes: BodyCompositionNotes;
  measurementSource: BodyCompositionMeasurementSource;
  sourceRequestId: ClinicalSourceRequestId | null;
  measuredAt: Date;
}

export interface ReconstituteBodyCompositionAssessmentProps
  extends CreateBodyCompositionAssessmentProps {
  id: BodyCompositionAssessmentIdType;
  version: number;
  createdAt: Date;
}

export class BodyCompositionAssessment extends AggregateRoot {
  private constructor(
    private readonly id: BodyCompositionAssessmentIdType,
    private readonly tenantId: string,
    private readonly anamnesisId: string,
    private readonly clinicalEncounterId: string,
    private readonly patientId: string,
    private readonly nutritionistId: string,
    private readonly anthropometricAssessmentId: string | null,
    private readonly bodyFatPercentage: BodyFatPercentage,
    private readonly leanMass: LeanMass | null,
    private readonly fatMass: FatMass | null,
    private readonly muscleMass: MuscleMass | null,
    private readonly boneMass: BoneMass | null,
    private readonly bodyWaterPercentage: BodyWaterPercentage | null,
    private readonly visceralFatLevel: VisceralFatLevel | null,
    private readonly basalMetabolicRate: BasalMetabolicRate | null,
    private readonly metabolicAge: MetabolicAge | null,
    private readonly notes: BodyCompositionNotes,
    private readonly measurementSource: BodyCompositionMeasurementSource,
    private readonly sourceRequestId: ClinicalSourceRequestId | null,
    private readonly measuredAt: Date,
    private readonly version: number,
    private readonly createdAt: Date,
  ) {
    super();
  }

  static create(
    props: CreateBodyCompositionAssessmentProps,
    createdAt: Date,
  ): BodyCompositionAssessment {
    const id = props.id ?? BodyCompositionAssessmentId.create();
    const assessment = new BodyCompositionAssessment(
      id,
      props.tenantId,
      props.anamnesisId,
      props.clinicalEncounterId,
      props.patientId,
      props.nutritionistId,
      props.anthropometricAssessmentId,
      props.bodyFatPercentage,
      props.leanMass,
      props.fatMass,
      props.muscleMass,
      props.boneMass,
      props.bodyWaterPercentage,
      props.visceralFatLevel,
      props.basalMetabolicRate,
      props.metabolicAge,
      props.notes,
      props.measurementSource,
      props.sourceRequestId,
      props.measuredAt,
      1,
      createdAt,
    );

    assessment.addDomainEvent(
      new BodyCompositionRecorded(
        id.toString(),
        props.tenantId,
        props.anamnesisId,
        props.clinicalEncounterId,
        props.patientId,
        props.nutritionistId,
        props.anthropometricAssessmentId,
        props.measurementSource.toString(),
        1,
        props.measuredAt,
        createdAt,
      ),
    );

    return assessment;
  }

  static reconstitute(
    props: ReconstituteBodyCompositionAssessmentProps,
  ): BodyCompositionAssessment {
    return new BodyCompositionAssessment(
      props.id,
      props.tenantId,
      props.anamnesisId,
      props.clinicalEncounterId,
      props.patientId,
      props.nutritionistId,
      props.anthropometricAssessmentId,
      props.bodyFatPercentage,
      props.leanMass,
      props.fatMass,
      props.muscleMass,
      props.boneMass,
      props.bodyWaterPercentage,
      props.visceralFatLevel,
      props.basalMetabolicRate,
      props.metabolicAge,
      props.notes,
      props.measurementSource,
      props.sourceRequestId,
      props.measuredAt,
      props.version,
      props.createdAt,
    );
  }

  getId(): BodyCompositionAssessmentIdType {
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

  getAnthropometricAssessmentId(): string | null {
    return this.anthropometricAssessmentId;
  }

  getBodyFatPercentage(): BodyFatPercentage {
    return this.bodyFatPercentage;
  }

  getLeanMass(): LeanMass | null {
    return this.leanMass;
  }

  getFatMass(): FatMass | null {
    return this.fatMass;
  }

  getMuscleMass(): MuscleMass | null {
    return this.muscleMass;
  }

  getBoneMass(): BoneMass | null {
    return this.boneMass;
  }

  getBodyWaterPercentage(): BodyWaterPercentage | null {
    return this.bodyWaterPercentage;
  }

  getVisceralFatLevel(): VisceralFatLevel | null {
    return this.visceralFatLevel;
  }

  getBasalMetabolicRate(): BasalMetabolicRate | null {
    return this.basalMetabolicRate;
  }

  getMetabolicAge(): MetabolicAge | null {
    return this.metabolicAge;
  }

  getNotes(): BodyCompositionNotes {
    return this.notes;
  }

  getMeasurementSource(): BodyCompositionMeasurementSource {
    return this.measurementSource;
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
