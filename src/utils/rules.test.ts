/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCLOSURE_EN,
  DISCLOSURE_ES,
  validateDisclosure,
  processProductUrl,
  validateImageDimensions,
  validatePinRecord,
  calculateAllowedDailyCap,
  alternateLanguages,
  isWithinPostingWindow,
} from './rules.ts';

test('validateDisclosure accepts valid English disclosure', () => {
  const desc = `Awesome kitchen herb scissors with 5 sharp blades. Perfect for rapid meal prep. ${DISCLOSURE_EN}`;
  const res = validateDisclosure(desc);
  assert.equal(res.valid, true);
  assert.equal(res.language, 'EN');
});

test('validateDisclosure accepts valid Spanish disclosure', () => {
  const desc = `Tijeras para hierbas aromáticas de acero inoxidable con 5 hojas. ${DISCLOSURE_ES}`;
  const res = validateDisclosure(desc);
  assert.equal(res.valid, true);
  assert.equal(res.language, 'ES');
});

test('validateDisclosure rejects description missing disclosure', () => {
  const desc = 'Cute garlic chopper roller for easy dinner prep #kitchen #gadgets';
  const res = validateDisclosure(desc);
  assert.equal(res.valid, false);
  assert.match(res.error || '', /Description must end with exact disclosure/);
});

test('processProductUrl appends storeId tag to untagged amazon.com/dp/ URLs', () => {
  const url = 'https://www.amazon.com/dp/B08N5WRWNW';
  const res = processProductUrl(url, 'casafinds090-20');
  assert.equal(res.valid, true);
  assert.equal(res.affiliateLink, 'https://www.amazon.com/dp/B08N5WRWNW?tag=casafinds090-20');
});

test('processProductUrl leaves amzn.to short links AS-IS without altering or appending tags', () => {
  const url = 'https://amzn.to/3Yq8KlM';
  const res = processProductUrl(url, 'casafinds090-20');
  assert.equal(res.valid, true);
  assert.equal(res.affiliateLink, 'https://amzn.to/3Yq8KlM');
});

test('processProductUrl rejects invalid non-Amazon links', () => {
  const url = 'https://example.com/fake-product';
  const res = processProductUrl(url, 'casafinds090-20');
  assert.equal(res.valid, false);
});

test('validateImageDimensions enforces 2:3 aspect ratio and min 1000x1500 resolution', () => {
  assert.equal(validateImageDimensions(1000, 1500).valid, true);
  assert.equal(validateImageDimensions(1200, 1800).valid, true);
  assert.equal(validateImageDimensions(800, 1200).valid, false); // below min
  assert.equal(validateImageDimensions(1000, 1000).valid, false); // 1:1 ratio
});

test('validatePinRecord verifies a full valid pin', () => {
  const validPin = {
    title: 'Herb Scissors 5 Blade',
    description: `Multi-blade kitchen shears for quick slicing and chopping. ${DISCLOSURE_EN}`,
    product_url: 'https://www.amazon.com/dp/B08N5WRWNW',
    image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f',
    image_width: 1000,
    image_height: 1500,
    language: 'EN' as const,
  };
  const res = validatePinRecord(validPin, 'casafinds090-20');
  assert.equal(res.valid, true);
  assert.equal(res.errors.length, 0);
  assert.equal(res.processedLink, 'https://www.amazon.com/dp/B08N5WRWNW?tag=casafinds090-20');
});

test('validatePinRecord catches oversized title and missing disclosure', () => {
  const invalidPin = {
    title: 'A'.repeat(105), // exceeds 100
    description: 'No disclosure here!',
    product_url: 'https://example.com/bad',
    image_url: 'https://images.unsplash.com/photo-1',
    language: 'EN' as const,
  };
  const res = validatePinRecord(invalidPin, 'casafinds090-20');
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.includes('exceeds 100')));
  assert.ok(res.errors.some((e) => e.includes('exact disclosure')));
  assert.ok(res.errors.some((e) => e.includes('amazon.com/dp')));
});

test('calculateAllowedDailyCap implements week 1 ramp and gradual scaling', () => {
  assert.equal(calculateAllowedDailyCap(3, 40), 10);
  assert.equal(calculateAllowedDailyCap(7, 40), 10);
  assert.equal(calculateAllowedDailyCap(10, 40), 18);
  assert.equal(calculateAllowedDailyCap(20, 40), 28);
  assert.equal(calculateAllowedDailyCap(30, 40), 40);
});

test('alternateLanguages alternates EN and ES pins cleanly', () => {
  const pins = [
    { title: 'En 1', language: 'EN' as const },
    { title: 'En 2', language: 'EN' as const },
    { title: 'Es 1', language: 'ES' as const },
    { title: 'Es 2', language: 'ES' as const },
  ];
  const alternated = alternateLanguages(pins);
  assert.equal(alternated.map((p) => p.language).join(','), 'EN,ES,EN,ES');
});

test('isWithinPostingWindow correctly evaluates time window', () => {
  assert.equal(isWithinPostingWindow(20, 30, '20:00', '23:00'), true);
  assert.equal(isWithinPostingWindow(22, 59, '20:00', '23:00'), true);
  assert.equal(isWithinPostingWindow(14, 0, '20:00', '23:00'), false);
  assert.equal(isWithinPostingWindow(23, 15, '20:00', '23:00'), false);
});
