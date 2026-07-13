import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTestJwtConfig } from '../../../../test-support/jwt-test.config.js';
import { JoseTokenService } from './jose-token.service.js';

describe('JoseTokenService', () => {
  it('issues and verifies an access token', async () => {
    const service = new JoseTokenService(createTestJwtConfig());
    const issued = await service.issueAccessToken({
      personId: '550e8400-e29b-41d4-a716-446655440000',
      sessionId: '660e8400-e29b-41d4-a716-446655440001',
      tenantId: null,
    });

    const claims = await service.verifyAccessToken(issued.accessToken);

    assert.equal(claims.personId, '550e8400-e29b-41d4-a716-446655440000');
    assert.equal(claims.sessionId, '660e8400-e29b-41d4-a716-446655440001');
    assert.equal(claims.tenantId, null);
    assert.match(claims.jti, /^[0-9a-f-]{36}$/i);
    assert.ok(issued.accessTokenExpiresAt instanceof Date);
    assert.ok(issued.accessTokenExpiresAt.getTime() > Date.now());
  });

  it('formats, parses, and hashes refresh tokens', () => {
    const service = new JoseTokenService(createTestJwtConfig());
    const secret = service.generateRefreshTokenSecret();
    const formatted = service.formatRefreshToken(
      '660e8400-e29b-41d4-a716-446655440001',
      secret,
    );

    const parsed = service.parseRefreshToken(formatted);

    assert.equal(parsed.sessionId, '660e8400-e29b-41d4-a716-446655440001');
    assert.equal(parsed.secret, secret);
    assert.match(service.hashRefreshToken(secret), /^[a-f0-9]{64}$/);
  });
});
