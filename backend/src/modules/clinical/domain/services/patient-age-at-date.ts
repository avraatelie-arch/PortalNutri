export function calculatePatientAgeAtDate(
  birthDate: Date,
  atDate: Date,
): number {
  const birthYear = birthDate.getUTCFullYear();
  const birthMonth = birthDate.getUTCMonth();
  const birthDay = birthDate.getUTCDate();

  const atYear = atDate.getUTCFullYear();
  const atMonth = atDate.getUTCMonth();
  const atDay = atDate.getUTCDate();

  let age = atYear - birthYear;

  const birthdayNotReached =
    atMonth < birthMonth || (atMonth === birthMonth && atDay < birthDay);

  if (birthdayNotReached) {
    age -= 1;
  }

  return age;
}
