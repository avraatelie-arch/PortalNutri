import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { AnamnesisAlreadyCompletedDomainError } from '../errors/anamnesis-incomplete.domain-error.js';
import {
  AnamnesisCompleted,
  AnamnesisSectionUpdated,
  AnamnesisStarted,
} from '../events/anamnesis-events.js';
import { DefaultAnamnesisCompletionPolicy } from '../policies/anamnesis-completion-policy.js';
import { AnamnesisId } from '../value-objects/anamnesis-id.js';
import {
  AnamnesisSection,
  AnamnesisSectionValue,
  ANAMNESIS_SECTION_MAX_LENGTH,
  CHIEF_COMPLAINT_MAX_LENGTH,
} from '../value-objects/anamnesis-section.js';
import { AnamnesisStatus } from '../value-objects/anamnesis-status.js';
import { ClinicalTextSection } from '../value-objects/clinical-text-section.js';
import { Anamnesis } from './anamnesis.aggregate.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = AnamnesisId.create('550e8400-e29b-41d4-a716-446655440060');

const completionPolicy = new DefaultAnamnesisCompletionPolicy();

function createAnamnesis() {
  const clock = new FixedClock(NOW);

  return Anamnesis.create({
    id: ANAMNESIS_ID,
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    now: clock.now(),
  });
}

function emptySections() {
  return {
    chiefComplaint: ClinicalTextSection.empty(CHIEF_COMPLAINT_MAX_LENGTH),
    currentHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    medicalHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    familyHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    gastrointestinalHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    dietaryHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    lifestyleHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    medicationHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    supplementHistory: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    allergiesAndIntolerances: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
    observations: ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH),
  };
}

function reconstituteAnamnesis(params: {
  status: AnamnesisStatus;
  version?: number;
  chiefComplaint?: ClinicalTextSection;
  completedAt?: Date | null;
}) {
  return Anamnesis.reconstitute({
    id: ANAMNESIS_ID,
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    status: params.status,
    version: params.version ?? 1,
    ...emptySections(),
    chiefComplaint:
      params.chiefComplaint ??
      ClinicalTextSection.create('Existing complaint', CHIEF_COMPLAINT_MAX_LENGTH),
    completedAt: params.completedAt ?? null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function assertEventHasNoSectionText(event: unknown): void {
  const serialized = JSON.stringify(event);

  assert.doesNotMatch(serialized, /Patient reports/i);
  assert.doesNotMatch(serialized, /Existing complaint/i);
  assert.doesNotMatch(serialized, /Updated complaint/i);
}

describe('Anamnesis aggregate', () => {
  it('starts in DRAFT with version 1 and publishes AnamnesisStarted', () => {
    const anamnesis = createAnamnesis();
    const event = anamnesis.domainEvents[0] as AnamnesisStarted;

    assert.equal(anamnesis.getStatus(), AnamnesisStatus.Draft);
    assert.equal(anamnesis.getVersion(), 1);
    assert.equal(anamnesis.getCompletedAt(), null);
    assert.equal(anamnesis.domainEvents.length, 1);
    assert.ok(event instanceof AnamnesisStarted);
    assert.equal(event.eventName, 'AnamnesisStarted');
    assert.equal(event.aggregateId, ANAMNESIS_ID.toString());
    assert.equal(event.tenantId, TENANT_ID);
    assert.equal(event.clinicalEncounterId, ENCOUNTER_ID);
    assert.equal(event.status, AnamnesisStatus.Draft);
    assert.equal(event.occurredAt.toISOString(), NOW.toISOString());
    assertEventHasNoSectionText(event);
  });

  it('increments version when a section changes', () => {
    const clock = new FixedClock(LATER);
    const anamnesis = createAnamnesis();
    anamnesis.clearDomainEvents();

    const changed = anamnesis.updateSection(
      AnamnesisSection.fromValue(AnamnesisSectionValue.ChiefComplaint),
      ClinicalTextSection.create('Patient reports nausea.', CHIEF_COMPLAINT_MAX_LENGTH),
      clock.now(),
    );

    assert.equal(changed, true);
    assert.equal(anamnesis.getVersion(), 2);
    assert.equal(anamnesis.getUpdatedAt().toISOString(), LATER.toISOString());
    assert.equal(anamnesis.getChiefComplaint().toPersistence(), 'Patient reports nausea.');
  });

  it('does not increment version when section update is a no-op', () => {
    const clock = new FixedClock(LATER);
    const anamnesis = createAnamnesis();
    anamnesis.clearDomainEvents();

    const existing = ClinicalTextSection.create('Same text', CHIEF_COMPLAINT_MAX_LENGTH);
    anamnesis.updateSection(
      AnamnesisSection.fromValue(AnamnesisSectionValue.ChiefComplaint),
      existing,
      clock.now(),
    );
    anamnesis.clearDomainEvents();

    const changed = anamnesis.updateSection(
      AnamnesisSection.fromValue(AnamnesisSectionValue.ChiefComplaint),
      ClinicalTextSection.create('  Same   text  ', CHIEF_COMPLAINT_MAX_LENGTH),
      clock.now(),
    );

    assert.equal(changed, false);
    assert.equal(anamnesis.getVersion(), 2);
    assert.equal(anamnesis.domainEvents.length, 0);
  });

  it('delegates completion validation to AnamnesisCompletionPolicy', () => {
    const clock = new FixedClock(LATER);
    const anamnesis = createAnamnesis();

    assert.throws(
      () => anamnesis.complete(clock.now(), completionPolicy),
      /Anamnesis cannot be completed/,
    );

    anamnesis.updateSection(
      AnamnesisSection.fromValue(AnamnesisSectionValue.ChiefComplaint),
      ClinicalTextSection.create('Chief complaint', CHIEF_COMPLAINT_MAX_LENGTH),
      clock.now(),
    );
    anamnesis.clearDomainEvents();

    const completed = anamnesis.complete(clock.now(), completionPolicy);

    assert.equal(completed, true);
    assert.equal(anamnesis.getStatus(), AnamnesisStatus.Completed);
    assert.equal(anamnesis.getCompletedAt()?.toISOString(), LATER.toISOString());
    assert.equal(anamnesis.getVersion(), 3);
  });

  it('publishes section updated events without section text content', () => {
    const clock = new FixedClock(LATER);
    const anamnesis = createAnamnesis();
    anamnesis.clearDomainEvents();

    anamnesis.updateSection(
      AnamnesisSection.fromValue(AnamnesisSectionValue.CurrentHistory),
      ClinicalTextSection.create('Detailed history content', ANAMNESIS_SECTION_MAX_LENGTH),
      clock.now(),
    );

    const event = anamnesis.domainEvents[0] as AnamnesisSectionUpdated;

    assert.ok(event instanceof AnamnesisSectionUpdated);
    assert.equal(event.section, AnamnesisSectionValue.CurrentHistory);
    assertEventHasNoSectionText(event);
  });

  it('publishes AnamnesisCompleted without section text content', () => {
    const clock = new FixedClock(LATER);
    const anamnesis = createAnamnesis();

    anamnesis.updateSection(
      AnamnesisSection.fromValue(AnamnesisSectionValue.ChiefComplaint),
      ClinicalTextSection.create('Chief complaint', CHIEF_COMPLAINT_MAX_LENGTH),
      clock.now(),
    );
    anamnesis.clearDomainEvents();
    anamnesis.complete(clock.now(), completionPolicy);

    const event = anamnesis.domainEvents[0] as AnamnesisCompleted;

    assert.ok(event instanceof AnamnesisCompleted);
    assert.equal(event.status, AnamnesisStatus.Completed);
    assertEventHasNoSectionText(event);
  });

  it('reconstitute does not emit domain events', () => {
    const anamnesis = reconstituteAnamnesis({
      status: AnamnesisStatus.Completed,
      version: 4,
      completedAt: LATER,
    });

    assert.equal(anamnesis.domainEvents.length, 0);
    assert.equal(anamnesis.getVersion(), 4);
    assert.equal(anamnesis.getStatus(), AnamnesisStatus.Completed);
  });

  it('complete is idempotent when already completed', () => {
    const clock = new FixedClock(LATER);
    const anamnesis = reconstituteAnamnesis({
      status: AnamnesisStatus.Completed,
      version: 3,
      completedAt: LATER,
    });

    const changed = anamnesis.complete(clock.now(), completionPolicy);

    assert.equal(changed, false);
    assert.equal(anamnesis.domainEvents.length, 0);
    assert.equal(anamnesis.getVersion(), 3);
  });

  it('rejects section updates when already completed', () => {
    const clock = new FixedClock(LATER);
    const anamnesis = reconstituteAnamnesis({
      status: AnamnesisStatus.Completed,
      version: 2,
      completedAt: LATER,
    });

    assert.throws(
      () =>
        anamnesis.updateSection(
          AnamnesisSection.fromValue(AnamnesisSectionValue.ChiefComplaint),
          ClinicalTextSection.create('Late update', CHIEF_COMPLAINT_MAX_LENGTH),
          clock.now(),
        ),
      AnamnesisAlreadyCompletedDomainError,
    );
  });

  it('pullDomainEvents returns and clears pending events', () => {
    const anamnesis = createAnamnesis();
    const events = anamnesis.pullDomainEvents();

    assert.equal(events.length, 1);
    assert.ok(events[0] instanceof AnamnesisStarted);
    assert.equal(anamnesis.domainEvents.length, 0);
  });
});
