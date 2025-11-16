import { db } from './db';
import type { ContactInfo, ContactResolutionResult } from './types';

/**
 * Resolves contact information from a list of people names/emails.
 * 
 * - If a string contains "@", it's treated as an email directly
 * - Otherwise, searches the Contact table by displayName or aliases
 * 
 * @param people - Array of person names or email addresses
 * @returns Object with resolved contacts and unknown names
 */
export async function resolveContacts(
  people: string[]
): Promise<ContactResolutionResult> {
  const resolved: ContactInfo[] = [];
  const unknown: string[] = [];

  for (const person of people) {
    // If string contains "@", treat as email directly
    if (person.includes('@')) {
      // Extract name from email if possible (e.g., "Alice <alice@example.com>" or just "alice@example.com")
      const emailMatch = person.match(/(?:<)?([^<>\s@]+@[^<>\s@]+)(?:>)?/);
      const nameMatch = person.match(/([^<>\s]+)\s*(?:<|$)/);
      
      if (emailMatch) {
        const email = emailMatch[1];
        const name = nameMatch?.[1] || email.split('@')[0];
        resolved.push({ name, email });
      } else {
        unknown.push(person);
      }
      continue;
    }

    // Search Contact table for displayName or aliases
    // Note: SQLite doesn't support case-insensitive mode, so we do case-sensitive search
    const contact = await db.contact.findFirst({
      where: {
        OR: [
          { displayName: { contains: person } },
          { aliases: { contains: person } },
        ],
      },
    });

    if (contact) {
      resolved.push({
        name: contact.displayName,
        email: contact.email,
      });
    } else {
      unknown.push(person);
    }
  }

  return { resolved, unknown };
}

