export class AuthenticationSucceeded {
  readonly eventName = 'AuthenticationSucceeded';
  readonly occurredAt: Date;
  readonly personId: string;
  readonly sessionId: string;

  constructor(
    personId: string,
    sessionId: string,
    occurredAt: Date = new Date(),
  ) {
    this.personId = personId;
    this.sessionId = sessionId;
    this.occurredAt = occurredAt;
  }
}
