import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../errors/domain-error.js';
import { BirthDate } from './birth-date.js';
import { Document, DocumentType } from './document.js';
import { Email } from './email.js';
import { FullName } from './full-name.js';
import { PreferredName } from './preferred-name.js';

describe('FullName', () => {
  it('rejects empty full name', () => {
    assert.throws(() => FullName.create(''), DomainError);
    assert.throws(() => FullName.create('   '), DomainError);
  });

  it('accepts a valid full name', () => {
    const fullName = FullName.create('Maria Silva');

    assert.equal(fullName.toString(), 'Maria Silva');
  });
});

describe('Email', () => {
  it('rejects invalid email', () => {
    assert.throws(() => Email.create('invalid-email'), DomainError);
    assert.throws(() => Email.create('missing@domain'), DomainError);
  });

  it('accepts a valid email', () => {
    const email = Email.create('Maria.Silva@Example.com');

    assert.equal(email.toString(), 'maria.silva@example.com');
  });
});

describe('Document', () => {
  it('rejects empty document value', () => {
    assert.throws(
      () => Document.create(DocumentType.RG, ''),
      DomainError,
    );
  });

  it('rejects invalid CPF document', () => {
    assert.throws(
      () => Document.create(DocumentType.CPF, '12345678900'),
      DomainError,
    );
  });

  it('accepts a valid non-CPF document', () => {
    const document = Document.create(DocumentType.PASSPORT, 'AB123456');

    assert.equal(document.getType(), DocumentType.PASSPORT);
    assert.equal(document.getValue(), 'AB123456');
  });
});

describe('PreferredName', () => {
  it('returns null when optional value is absent', () => {
    assert.equal(PreferredName.createOptional(null), null);
    assert.equal(PreferredName.createOptional(undefined), null);
    assert.equal(PreferredName.createOptional('   '), null);
  });

  it('rejects empty preferred name when provided', () => {
    assert.throws(() => PreferredName.create(''), DomainError);
    assert.throws(() => PreferredName.create('   '), DomainError);
  });

  it('trims external spaces and accepts a valid preferred name', () => {
    const preferredName = PreferredName.createOptional('  Maria  ');

    assert.ok(preferredName);
    assert.equal(preferredName.toString(), 'Maria');
  });
});

describe('BirthDate', () => {
  it('rejects future birth date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    assert.throws(() => BirthDate.create(tomorrow), DomainError);
  });

  it('accepts a valid birth date', () => {
    const birthDate = BirthDate.create(new Date(1990, 5, 15));

    assert.equal(birthDate.toString(), '1990-06-15');
  });
});
