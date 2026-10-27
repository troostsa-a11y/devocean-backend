/**
 * Only an explicit opt-out may disable implicit TLS. Missing, blank, or
 * unrecognized values must never silently downgrade a mailbox connection.
 */
export function isImapTlsEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() !== 'false';
}
