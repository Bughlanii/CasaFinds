/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DISCLOSURE_EN = 'As an Amazon Associate I earn from qualifying purchases. #ad';
export const DISCLOSURE_ES = 'Como Asociado de Amazon, gano por las compras que califican. #ad';

export interface PinRecordInput {
  title: string;
  description: string;
  hashtags?: string[];
  image_url?: string;
  image_file?: string;
  image_width?: number;
  image_height?: number;
  product_url: string;
  board_id?: string;
  board?: string;
  language: 'EN' | 'ES';
  alt_text?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  processedLink?: string;
}

/**
 * Validates that description ends with the exact disclosure line (EN or ES).
 */
export function validateDisclosure(description: string): { valid: boolean; language?: 'EN' | 'ES'; error?: string } {
  if (!description) {
    return { valid: false, error: 'Description is required' };
  }

  const trimmed = description.trim();
  if (trimmed.endsWith(DISCLOSURE_EN)) {
    return { valid: true, language: 'EN' };
  }
  if (trimmed.endsWith(DISCLOSURE_ES)) {
    return { valid: true, language: 'ES' };
  }

  return {
    valid: false,
    error: `Description must end with exact disclosure: "${DISCLOSURE_EN}" or "${DISCLOSURE_ES}"`,
  };
}

/**
 * Validates and processes Amazon product URL according to FR-04 & Patch 1:
 * - Must be either amazon.com/dp/<ASIN> or amzn.to/<ID>
 * - If amzn.to short link: use AS-IS, NEVER append tag
 * - If amazon.com/dp/ URL: if no tag, append exact storeId; if tag present, ensure correct
 * - Reject non-Amazon URLs
 */
export function processProductUrl(rawUrl: string, storeId: string): { valid: boolean; affiliateLink: string; error?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, affiliateLink: '', error: 'Product URL is required' };
  }

  const trimmed = rawUrl.trim();

  // amzn.to short link: use AS-IS (never append tag to short link)
  if (/^https?:\/\/amzn\.to\/[A-Za-z0-9_-]+/i.test(trimmed)) {
    return { valid: true, affiliateLink: trimmed };
  }

  // amazon.com product URL check
  const isAmazonDomain = /^https?:\/\/(www\.)?amazon\.(com|es|co\.uk|ca|de|fr|it|co\.jp|in)\//i.test(trimmed);
  const isDpOrGp = /\/(dp|gp\/product)\/([A-Z0-9]{10})/i.test(trimmed);

  if (!isAmazonDomain || !isDpOrGp) {
    return {
      valid: false,
      affiliateLink: '',
      error: 'Product URL must be an amazon.com/dp/<ASIN> link or an amzn.to/... short link',
    };
  }

  try {
    const urlObj = new URL(trimmed);
    const existingTag = urlObj.searchParams.get('tag');

    if (!existingTag) {
      urlObj.searchParams.set('tag', storeId);
    } else if (existingTag !== storeId) {
      // Overwrite if different tag to ensure owner's tag is used
      urlObj.searchParams.set('tag', storeId);
    }

    return { valid: true, affiliateLink: urlObj.toString() };
  } catch {
    return { valid: false, affiliateLink: '', error: 'Invalid URL syntax' };
  }
}

/**
 * Validates image dimensions and aspect ratio (2:3 aspect ratio, min 1000x1500)
 */
export function validateImageDimensions(width: number, height: number): { valid: boolean; error?: string } {
  if (!width || !height || width <= 0 || height <= 0) {
    return { valid: false, error: 'Valid image dimensions (width and height) are required' };
  }

  if (width < 1000 || height < 1500) {
    return {
      valid: false,
      error: `Image resolution ${width}x${height} is below minimum requirement of 1000x1500 px`,
    };
  }

  const ratio = width / height;
  const expectedRatio = 2 / 3; // ~0.6667
  const tolerance = 0.05; // 5% tolerance for aspect ratio

  if (Math.abs(ratio - expectedRatio) > tolerance) {
    return {
      valid: false,
      error: `Image aspect ratio is ${(ratio).toFixed(2)}, but Pinterest requires 2:3 ratio (~0.67)`,
    };
  }

  return { valid: true };
}

/**
 * Validates complete pin record against all FR-04 rules
 */
export function validatePinRecord(pin: PinRecordInput, storeId: string = 'casafinds090-20'): ValidationResult {
  const errors: string[] = [];

  // Title <= 100 chars
  if (!pin.title || pin.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (pin.title.length > 100) {
    errors.push(`Title exceeds 100 characters (${pin.title.length}/100)`);
  }

  // Description <= 500 chars
  if (!pin.description || pin.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (pin.description.length > 500) {
    errors.push(`Description exceeds 500 characters (${pin.description.length}/500)`);
  }

  // Disclosure check
  if (pin.description) {
    const disclosureRes = validateDisclosure(pin.description);
    if (!disclosureRes.valid) {
      errors.push(disclosureRes.error || 'Missing required disclosure');
    }
  }

  // Image check
  if (!pin.image_url && !pin.image_file) {
    errors.push('Pin image is required');
  } else if (pin.image_width && pin.image_height) {
    const imgRes = validateImageDimensions(pin.image_width, pin.image_height);
    if (!imgRes.valid) {
      errors.push(imgRes.error || 'Invalid image dimensions');
    }
  }

  // Product URL check
  let processedLink: string | undefined;
  if (!pin.product_url) {
    errors.push('Product URL is required');
  } else {
    const urlRes = processProductUrl(pin.product_url, storeId);
    if (!urlRes.valid) {
      errors.push(urlRes.error || 'Invalid product URL');
    } else {
      processedLink = urlRes.affiliateLink;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    processedLink,
  };
}

/**
 * Pacing & Ramp calculation:
 * Week 1: 8-10 pins/day
 * Scales gradually toward configured cap (up to 25-50/day)
 */
export function calculateAllowedDailyCap(accountAgeDays: number, configuredCap: number): number {
  if (accountAgeDays <= 7) {
    return Math.min(10, configuredCap);
  }
  if (accountAgeDays <= 14) {
    return Math.min(18, configuredCap);
  }
  if (accountAgeDays <= 21) {
    return Math.min(28, configuredCap);
  }
  return configuredCap;
}

/**
 * Alternates EN and ES pins to avoid near-duplicate or mono-language bursts
 */
export function alternateLanguages<T extends { language: 'EN' | 'ES'; title: string }>(pins: T[]): T[] {
  const enPins = pins.filter((p) => p.language === 'EN');
  const esPins = pins.filter((p) => p.language === 'ES');
  const result: T[] = [];

  let enIndex = 0;
  let esIndex = 0;
  let toggle = enPins.length >= esPins.length ? true : false;

  while (enIndex < enPins.length || esIndex < esPins.length) {
    if (toggle && enIndex < enPins.length) {
      result.push(enPins[enIndex++]);
      if (esIndex < esPins.length) toggle = false;
    } else if (!toggle && esIndex < esPins.length) {
      result.push(esPins[esIndex++]);
      if (enIndex < enPins.length) toggle = true;
    } else if (enIndex < enPins.length) {
      result.push(enPins[enIndex++]);
    } else if (esIndex < esPins.length) {
      result.push(esPins[esIndex++]);
    }
  }

  return result;
}

/**
 * Checks if current hour (or specified time) is within posting window (e.g. 20:00 - 23:00 ET)
 */
export function isWithinPostingWindow(
  currentHour: number,
  currentMinute: number,
  windowStart: string = '20:00',
  windowEnd: string = '23:00'
): boolean {
  const [startH, startM] = windowStart.split(':').map(Number);
  const [endH, endM] = windowEnd.split(':').map(Number);

  const currentMinutes = currentHour * 60 + currentMinute;
  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight window (e.g., 22:00 to 02:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}
