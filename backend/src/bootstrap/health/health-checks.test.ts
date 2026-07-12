import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { APP_NAME, APP_VERSION } from '../../config/app-metadata.js';
import {
  buildHealthResponse,
  buildLiveResponse,
  buildReadinessFailureResponse,
  buildReadinessSuccessResponse,
  runReadinessCheck,
  type ReadinessProbe,
} from './health-checks.js';

function createProbe(result: 'success' | 'failure', pingCount = { value: 0 }): ReadinessProbe {
  return {
    async ping() {
      pingCount.value += 1;

      if (result === 'failure') {
        throw new Error('database unavailable');
      }
    },
  };
}

describe('runReadinessCheck', () => {
  it('marks database and prisma as up after a successful probe', async () => {
    const pingCount = { value: 0 };
    const result = await runReadinessCheck(createProbe('success', pingCount));

    assert.equal(result.ready, true);
    assert.equal(pingCount.value, 1);
    assert.deepEqual(buildReadinessSuccessResponse(), {
      status: 'ready',
      checks: {
        database: 'up',
        prisma: 'up',
      },
    });
  });

  it('marks database and prisma as down after a failed probe', async () => {
    const pingCount = { value: 0 };
    const result = await runReadinessCheck(createProbe('failure', pingCount));

    assert.equal(result.ready, false);
    assert.equal(pingCount.value, 1);
    assert.deepEqual(buildReadinessFailureResponse(), {
      status: 'not_ready',
      checks: {
        database: 'down',
        prisma: 'down',
      },
    });
  });
});

describe('health response builders', () => {
  it('builds the health response with application metadata', () => {
    const response = buildHealthResponse();

    assert.equal(response.status, 'ok');
    assert.equal(response.application, APP_NAME);
    assert.equal(response.version, APP_VERSION);
    assert.equal(typeof response.timestamp, 'string');
    assert.ok(Number.isFinite(response.uptime));
  });

  it('builds the live response', () => {
    assert.deepEqual(buildLiveResponse(), { status: 'alive' });
  });
});
