import type { AnamnesisRepository } from '../../domain/repositories/anamnesis-repository.js';
import type { Clock } from '../ports/clock.port.js';
import { DomainError } from '../../domain/errors/domain-error.js';
import { AnamnesisAlreadyCompletedDomainError } from '../../domain/errors/anamnesis-incomplete.domain-error.js';
import {
  AnamnesisSection,
  maxLengthForSection,
} from '../../domain/value-objects/anamnesis-section.js';
import { ClinicalTextSection } from '../../domain/value-objects/clinical-text-section.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedAnamnesis } from '../load-tenant-scoped-anamnesis.js';
import { persistAndDispatchAnamnesisEvents } from '../persist-and-dispatch-anamnesis-events.js';
import { toAnamnesisResult } from '../anamnesis-result.js';
import { InvalidAnamnesisSectionError } from '../errors/invalid-anamnesis-section.error.js';
import { AnamnesisAlreadyCompletedError } from '../errors/anamnesis-already-completed.error.js';
import { UpdateAnamnesisSectionCommand } from './update-anamnesis-section.command.js';

export class UpdateAnamnesisSectionHandler {
  constructor(
    private readonly anamnesisRepository: AnamnesisRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: UpdateAnamnesisSectionCommand) {
    return executeClinicalUseCase(async () => {
      const { tenantId, anamnesisId, section: rawSection, content } =
        command.request;

      let section: AnamnesisSection;

      try {
        section = AnamnesisSection.parse(rawSection);
      } catch (error) {
        if (error instanceof DomainError) {
          throw new InvalidAnamnesisSectionError(rawSection);
        }

        throw error;
      }

      const anamnesis = await loadTenantScopedAnamnesis(
        this.anamnesisRepository,
        tenantId,
        anamnesisId,
      );

      const textSection = ClinicalTextSection.create(
        content,
        maxLengthForSection(section),
      );

      let changed: boolean;

      try {
        changed = anamnesis.updateSection(
          section,
          textSection,
          this.clock.now(),
        );
      } catch (error) {
        if (error instanceof AnamnesisAlreadyCompletedDomainError) {
          throw new AnamnesisAlreadyCompletedError(tenantId, anamnesisId);
        }

        throw error;
      }

      if (changed) {
        await persistAndDispatchAnamnesisEvents(
          this.anamnesisRepository,
          this.eventDispatcher,
          anamnesis,
        );
      }

      return toAnamnesisResult(anamnesis);
    });
  }
}
