import type { ValidateAccessTokenRequest } from './validate-access-token.request.js';

export class ValidateAccessTokenQuery {
  constructor(readonly request: ValidateAccessTokenRequest) {}
}
