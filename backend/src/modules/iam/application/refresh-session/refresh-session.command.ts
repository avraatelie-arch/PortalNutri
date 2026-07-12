import type { RefreshSessionRequest } from './refresh-session.request.js';

export class RefreshSessionCommand {
  constructor(readonly request: RefreshSessionRequest) {}
}
