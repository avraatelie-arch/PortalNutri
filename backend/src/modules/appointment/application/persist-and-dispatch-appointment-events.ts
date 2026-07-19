import type { Appointment } from '../domain/aggregates/appointment.aggregate.js';
import type { AppointmentRepository } from '../domain/repositories/appointment-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';

export async function persistAndDispatchAppointmentEvents(
  repository: AppointmentRepository,
  eventDispatcher: EventDispatcher,
  appointment: Appointment,
): Promise<void> {
  const events = appointment.pullDomainEvents();

  if (events.length === 0) {
    return;
  }

  await repository.save(appointment);
  await eventDispatcher.dispatch(events);
}
