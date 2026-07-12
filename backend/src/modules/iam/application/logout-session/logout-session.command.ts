import type { LogoutSessionRequest } from './logout-session.request.js';

export class LogoutSessionCommand {
  constructor(readonly request: LogoutSessionRequest) {}
}
