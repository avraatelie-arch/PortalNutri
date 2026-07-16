import { AggregateRoot } from './aggregate-root.js';
import {
  PatientNutritionistAssigned,
  PatientNutritionistReactivated,
  PatientNutritionistRemoved,
} from '../events/patient-nutritionist-assignment-events.js';
import { PatientNutritionistAssignmentId } from '../value-objects/patient-nutritionist-assignment-id.js';
import { PatientNutritionistAssignmentRole } from '../value-objects/patient-nutritionist-assignment-role.js';
import { PatientNutritionistAssignmentStatus } from '../value-objects/patient-nutritionist-assignment-status.js';
import { PatientId } from '../value-objects/patient-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';

export interface CreatePatientNutritionistAssignmentProps {
  id?: PatientNutritionistAssignmentId;
  tenantId: TenantId;
  patientId: PatientId;
  nutritionistId: string;
  role: PatientNutritionistAssignmentRole;
}

export interface ReconstitutePatientNutritionistAssignmentProps {
  id: PatientNutritionistAssignmentId;
  tenantId: TenantId;
  patientId: PatientId;
  nutritionistId: string;
  role: PatientNutritionistAssignmentRole;
  status: PatientNutritionistAssignmentStatus;
  createdAt: Date;
  reactivatedAt: Date | null;
  removedAt: Date | null;
}

export class PatientNutritionistAssignment extends AggregateRoot {
  private constructor(
    private readonly id: PatientNutritionistAssignmentId,
    private readonly tenantId: TenantId,
    private readonly patientId: PatientId,
    private readonly nutritionistId: string,
    private readonly role: PatientNutritionistAssignmentRole,
    private status: PatientNutritionistAssignmentStatus,
    private readonly createdAt: Date,
    private reactivatedAt: Date | null,
    private removedAt: Date | null,
  ) {
    super();
  }

  static create(
    props: CreatePatientNutritionistAssignmentProps,
  ): PatientNutritionistAssignment {
    const id = props.id ?? PatientNutritionistAssignmentId.generate();
    const now = new Date();

    const assignment = new PatientNutritionistAssignment(
      id,
      props.tenantId,
      props.patientId,
      props.nutritionistId,
      props.role,
      PatientNutritionistAssignmentStatus.Active,
      now,
      null,
      null,
    );

    assignment.addDomainEvent(
      new PatientNutritionistAssigned(
        id.toString(),
        props.tenantId.toString(),
        props.patientId.toString(),
        props.nutritionistId,
        props.role.toString(),
      ),
    );

    return assignment;
  }

  static reconstitute(
    props: ReconstitutePatientNutritionistAssignmentProps,
  ): PatientNutritionistAssignment {
    return new PatientNutritionistAssignment(
      props.id,
      props.tenantId,
      props.patientId,
      props.nutritionistId,
      props.role,
      props.status,
      props.createdAt,
      props.reactivatedAt,
      props.removedAt,
    );
  }

  reactivate(): void {
    if (this.status === PatientNutritionistAssignmentStatus.Active) {
      return;
    }

    this.status = PatientNutritionistAssignmentStatus.Active;
    this.reactivatedAt = new Date();
    this.removedAt = null;
    this.addDomainEvent(
      new PatientNutritionistReactivated(
        this.id.toString(),
        this.tenantId.toString(),
        this.patientId.toString(),
        this.nutritionistId,
        this.role.toString(),
      ),
    );
  }

  remove(): void {
    if (this.status === PatientNutritionistAssignmentStatus.Removed) {
      return;
    }

    this.status = PatientNutritionistAssignmentStatus.Removed;
    this.removedAt = new Date();
    this.addDomainEvent(
      new PatientNutritionistRemoved(
        this.id.toString(),
        this.tenantId.toString(),
        this.patientId.toString(),
        this.nutritionistId,
        this.role.toString(),
      ),
    );
  }

  getId(): PatientNutritionistAssignmentId {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getPatientId(): PatientId {
    return this.patientId;
  }

  getNutritionistId(): string {
    return this.nutritionistId;
  }

  getRole(): PatientNutritionistAssignmentRole {
    return this.role;
  }

  getStatus(): PatientNutritionistAssignmentStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getReactivatedAt(): Date | null {
    return this.reactivatedAt ? new Date(this.reactivatedAt) : null;
  }

  getRemovedAt(): Date | null {
    return this.removedAt ? new Date(this.removedAt) : null;
  }

  isActive(): boolean {
    return this.status === PatientNutritionistAssignmentStatus.Active;
  }

  isRemoved(): boolean {
    return this.status === PatientNutritionistAssignmentStatus.Removed;
  }
}
