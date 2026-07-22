import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';
import { DefaultEvolutionFinalizationPolicy } from '../../domain/policies/evolution-finalization-policy.js';
import { ClinicalEvolutionId } from '../../domain/value-objects/clinical-evolution-id.js';
import {
  ClinicalEvolutionSection,
  ClinicalEvolutionSectionValue,
} from '../../domain/value-objects/clinical-evolution-section.js';
import {
  NextClinicalConsiderations,
  SubjectiveEvolution,
} from '../../domain/value-objects/clinical-evolution-text-sections.js';
import {
  findLatestFinalizedByChronology,
  findPreviousFinalizedBeforeChronology,
} from './clinical-evolution-chronology.js';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_A = '550e8400-e29b-41d4-a716-446655440050';
const ENCOUNTER_B = '550e8400-e29b-41d4-a716-446655440051';
const MOMENT_A = new Date('2026-07-10T10:00:00.000Z');
const MOMENT_B = new Date('2026-07-20T10:00:00.000Z');
const FINALIZE_A_LATE = new Date('2026-07-25T18:00:00.000Z');
const FINALIZE_B_EARLY = new Date('2026-07-20T11:00:00.000Z');

const policy = new DefaultEvolutionFinalizationPolicy();

function createFinalizedEvolution(options: {
  id: string;
  encounterId: string;
  clinicalMomentAt: Date;
  finalizeAt: Date;
  createAt?: Date;
}) {
  const evolution = ClinicalEvolution.create({
    id: ClinicalEvolutionId.create(options.id),
    tenantId: TENANT_ID,
    clinicalEncounterId: options.encounterId,
    patientId: PATIENT_ID,
    createdByNutritionistId: NUTRITIONIST_ID,
    responsibleNutritionistId: NUTRITIONIST_ID,
    clinicalMomentAt: options.clinicalMomentAt,
    now: options.createAt ?? options.clinicalMomentAt,
  });

  evolution.updateSection(
    ClinicalEvolutionSection.fromValue(ClinicalEvolutionSectionValue.SubjectiveEvolution),
    SubjectiveEvolution.create('Patient reports changes.'),
    options.createAt ?? options.clinicalMomentAt,
  );
  evolution.updateSection(
    ClinicalEvolutionSection.fromValue(ClinicalEvolutionSectionValue.NextClinicalConsiderations),
    NextClinicalConsiderations.create('Continue current plan.'),
    options.createAt ?? options.clinicalMomentAt,
  );
  evolution.finalize(options.finalizeAt, policy);

  return evolution;
}

describe('clinical-evolution-chronology', () => {
  it('orders by clinicalMomentAt rather than finalizedAt', () => {
    const olderEncounter = createFinalizedEvolution({
      id: '550e8400-e29b-41d4-a716-446655440060',
      encounterId: ENCOUNTER_A,
      clinicalMomentAt: MOMENT_A,
      finalizeAt: FINALIZE_A_LATE,
    });
    const newerEncounter = createFinalizedEvolution({
      id: '550e8400-e29b-41d4-a716-446655440061',
      encounterId: ENCOUNTER_B,
      clinicalMomentAt: MOMENT_B,
      finalizeAt: FINALIZE_B_EARLY,
    });

    const latest = findLatestFinalizedByChronology([olderEncounter, newerEncounter]);

    assert.equal(latest?.getClinicalEncounterId(), ENCOUNTER_B);
  });

  it('findPreviousFinalizedBeforeChronology returns chronologically prior evolution', () => {
    const olderEncounter = createFinalizedEvolution({
      id: '550e8400-e29b-41d4-a716-446655440062',
      encounterId: ENCOUNTER_A,
      clinicalMomentAt: MOMENT_A,
      finalizeAt: FINALIZE_A_LATE,
    });
    const newerEncounter = createFinalizedEvolution({
      id: '550e8400-e29b-41d4-a716-446655440063',
      encounterId: ENCOUNTER_B,
      clinicalMomentAt: MOMENT_B,
      finalizeAt: FINALIZE_B_EARLY,
    });

    const previous = findPreviousFinalizedBeforeChronology(
      [olderEncounter, newerEncounter],
      MOMENT_B,
      ENCOUNTER_B,
      newerEncounter.getId().toString(),
    );

    assert.equal(previous?.getClinicalEncounterId(), ENCOUNTER_A);
  });

  it('returns null when no prior finalized evolution exists', () => {
    const first = createFinalizedEvolution({
      id: '550e8400-e29b-41d4-a716-446655440064',
      encounterId: ENCOUNTER_A,
      clinicalMomentAt: MOMENT_A,
      finalizeAt: FINALIZE_A_LATE,
    });

    const previous = findPreviousFinalizedBeforeChronology(
      [first],
      MOMENT_A,
      ENCOUNTER_A,
      first.getId().toString(),
    );

    assert.equal(previous, null);
  });
});
