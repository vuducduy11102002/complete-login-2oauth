export function generateOTP(length = 6): string {
  return Math.random().toString().slice(-length);
}