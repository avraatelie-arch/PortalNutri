import type { AnamnesisRepository } from '../../domain/repositories/anamnesis-repository.js';
import type { AnamnesisCompletionPolicy } from '../../domain/policies/anamnesis-completion-policy.js';
import type { Clock } from '../ports/clock.port.js';
import { AnamnesisIncompleteDomainError } from '../../domain/errors/anamnesis-incomplete.domain-error.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedAnamnesis } from '../load-tenant-scoped-anamnesis.js';
import { persistAndDispatchAnamnesisEvents } from '../persist-and-dispatch-anamnesis-events.js';
import { toAnamnesisResult } from '../anamnesis-result.js';
import { AnamnesisIncompleteError } from '../errors/anamnesis-incomplete.error.js';
import { CompleteAnamnesisCommand } from './complete-anamnesis.command.js';

export class CompleteAnamnesisHandler {
  constructor(
    private readonly anamnesisRepository: AnamnesisRepository,
    private readonly completionPolicy: AnamnesisCompletionPolicy,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CompleteAnamnesisCommand) {
    return executeClinicalUseCase(async () => {
      const { tenantId, anamnesisId } = command.request;

      const anamnesis = await loadTenantScopedAnamnesis(
        this.anamnesisRepository,
        tenantId,
        anamnesisId,
      );

      let changed: boolean;

      try {
        changed = anamnesis.complete(this.clock.now(), this.completionPolicy);
      } catch (error) {
        if (error instanceof AnamnesisIncompleteDomainError) {
          throw new AnamnesisIncompleteError(tenantId, anamnesisId);
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
