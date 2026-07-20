import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../errors/domain-error.js';
import {
  ANAMNESIS_SECTION_MAX_LENGTH,
  CHIEF_COMPLAINT_MAX_LENGTH,
} from './anamnesis-section.js';
import { ClinicalTextSection } from './clinical-text-section.js';

describe('ClinicalTextSection', () => {
  it('creates empty section for null, undefined, and blank input', () => {
    assert.equal(ClinicalTextSection.create(null, CHIEF_COMPLAINT_MAX_LENGTH).isEmpty(), true);
    assert.equal(
      ClinicalTextSection.create(undefined, CHIEF_COMPLAINT_MAX_LENGTH).isEmpty(),
      true,
    );
    assert.equal(
      ClinicalTextSection.create('   ', CHIEF_COMPLAINT_MAX_LENGTH).isEmpty(),
      true,
    );
    assert.equal(ClinicalTextSection.empty(CHIEF_COMPLAINT_MAX_LENGTH).isEmpty(), true);
  });

  it('normalizes content on create', () => {
    const section = ClinicalTextSection.create(
      '  Patient reports   nausea.\r\n\r\n  Symptoms worsen at night.  ',
      CHIEF_COMPLAINT_MAX_LENGTH,
    );

    assert.equal(
      section.toPersistence(),
      'Patient reports nausea.\n\nSymptoms worsen at night.',
    );
  });

  it('fromPersistence preserves stored value without re-normalizing', () => {
    const stored = 'Stored paragraph one\n\nStored paragraph two';
    const section = ClinicalTextSection.fromPersistence(
      stored,
      ANAMNESIS_SECTION_MAX_LENGTH,
    );

    assert.equal(section.toPersistence(), stored);
  });

  it('toPersistence returns null for empty sections', () => {
    assert.equal(ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH).toPersistence(), null);
  });

  it('equals compares normalized persistence values', () => {
    const first = ClinicalTextSection.create('Same content', ANAMNESIS_SECTION_MAX_LENGTH);
    const second = ClinicalTextSection.create('  Same   content  ', ANAMNESIS_SECTION_MAX_LENGTH);
    const different = ClinicalTextSection.create('Different content', ANAMNESIS_SECTION_MAX_LENGTH);

    assert.equal(first.equals(second), true);
    assert.equal(first.equals(different), false);
    assert.equal(
      ClinicalTextSection.empty(ANAMNESIS_SECTION_MAX_LENGTH).equals(
        ClinicalTextSection.create('', ANAMNESIS_SECTION_MAX_LENGTH),
      ),
      true,
    );
  });

  it('rejects content exceeding the configured max length', () => {
    const tooLongChiefComplaint = 'a'.repeat(CHIEF_COMPLAINT_MAX_LENGTH + 1);
    const tooLongSection = 'a'.repeat(ANAMNESIS_SECTION_MAX_LENGTH + 1);

    assert.throws(
      () => ClinicalTextSection.create(tooLongChiefComplaint, CHIEF_COMPLAINT_MAX_LENGTH),
      /Clinical text section must not exceed 2000 characters/,
    );
    assert.throws(
      () => ClinicalTextSection.create(tooLongSection, ANAMNESIS_SECTION_MAX_LENGTH),
      /Clinical text section must not exceed 10000 characters/,
    );
  });

  it('accepts content at maximum length after normalization', () => {
    const section = ClinicalTextSection.create(
      'a'.repeat(CHIEF_COMPLAINT_MAX_LENGTH),
      CHIEF_COMPLAINT_MAX_LENGTH,
    );

    assert.equal(section.toPersistence()?.length, CHIEF_COMPLAINT_MAX_LENGTH);
    assert.equal(section.getMaxLength(), CHIEF_COMPLAINT_MAX_LENGTH);
  });

  it('throws DomainError when max length is exceeded', () => {
    assert.throws(
      () => ClinicalTextSection.create('x'.repeat(10001), ANAMNESIS_SECTION_MAX_LENGTH),
      DomainError,
    );
  });
});
