/**
 * Cookie Consent Management
 * DSGVO-compliant cookie consent utilities
 */

export type CookieCategory = 'essential' | 'analytics' | 'marketing';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const CONSENT_KEY = 'dorfkiste_cookie_consent';

/**
 * Default consent settings (only essential cookies enabled)
 */
export const defaultConsent: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
  timestamp: new Date().toISOString(),
};

/**
 * Get stored cookie consent from localStorage
 */
export function getStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;

    const consent = JSON.parse(stored) as CookieConsent;
    // Validate consent object structure
    if (
      typeof consent.essential === 'boolean' &&
      typeof consent.analytics === 'boolean' &&
      typeof consent.marketing === 'boolean' &&
      consent.timestamp
    ) {
      return consent;
    }
    return null;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

/**
 * Save cookie consent to localStorage
 */
export function saveConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));

    // Trigger custom event for consent changes
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: consent }));

    // Apply consent (remove non-consented cookies)
    applyCookieConsent(consent);
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
}

/**
 * Check if user has given consent for a specific category
 */
export function hasConsent(category: CookieCategory): boolean {
  const consent = getStoredConsent();
  if (!consent) return category === 'essential';
  return consent[category];
}

/**
 * Apply cookie consent by removing non-consented cookies
 */
function applyCookieConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;

  // Remove analytics cookies if not consented
  if (!consent.analytics) {
    removeCookiesByPrefix('_ga');
    removeCookiesByPrefix('_gid');
    removeCookiesByPrefix('_gat');
    // Add more analytics cookie patterns as needed
  }

  // Remove marketing cookies if not consented
  if (!consent.marketing) {
    removeCookiesByPrefix('_fbp');
    removeCookiesByPrefix('_fbc');
    removeCookiesByPrefix('fr');
    // Add more marketing cookie patterns as needed
  }
}

/**
 * Remove cookies by prefix
 */
function removeCookiesByPrefix(prefix: string): void {
  if (typeof document === 'undefined') return;

  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName.startsWith(prefix)) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    }
  });
}

/**
 * Accept all cookies
 */
export function acceptAll(): CookieConsent {
  const consent: CookieConsent = {
    essential: true,
    analytics: true,
    marketing: true,
    timestamp: new Date().toISOString(),
  };
  saveConsent(consent);
  return consent;
}

/**
 * Reject all non-essential cookies
 */
export function rejectAll(): CookieConsent {
  const consent: CookieConsent = {
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString(),
  };
  saveConsent(consent);
  return consent;
}

/**
 * Update specific cookie category consent
 */
export function updateCategoryConsent(
  category: CookieCategory,
  value: boolean
): CookieConsent {
  const currentConsent = getStoredConsent() || defaultConsent;
  const newConsent: CookieConsent = {
    ...currentConsent,
    [category]: category === 'essential' ? true : value,
    timestamp: new Date().toISOString(),
  };
  saveConsent(newConsent);
  return newConsent;
}

/**
 * Reset cookie consent (for testing or user-initiated reset)
 */
export function resetConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);

  // Remove all tracking cookies
  applyCookieConsent(defaultConsent);
}
