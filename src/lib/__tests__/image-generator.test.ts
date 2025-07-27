import { generateItemImageUrl } from '../image-generator';

describe('generateItemImageUrl', () => {
  it('should generate URL with valid title and category', () => {
    const result = generateItemImageUrl('item123', 'Electric Drill', 'werkzeuge');
    expect(result).toContain('electric');
    expect(result).toContain('tools');
  });

  it('should handle undefined title gracefully', () => {
    const result = generateItemImageUrl('item123', undefined as any, 'werkzeuge');
    expect(result).toContain('item');
    expect(result).toContain('tools');
  });

  it('should handle null title gracefully', () => {
    const result = generateItemImageUrl('item123', null as any, 'werkzeuge');
    expect(result).toContain('item');
    expect(result).toContain('tools');
  });

  it('should handle empty title', () => {
    const result = generateItemImageUrl('item123', '', 'werkzeuge');
    expect(result).toContain('item');
    expect(result).toContain('tools');
  });

  it('should handle short title words', () => {
    const result = generateItemImageUrl('item123', 'A B C', 'werkzeuge');
    expect(result).toContain('item');
    expect(result).toContain('tools');
  });

  it('should use first long word from title', () => {
    const result = generateItemImageUrl('item123', 'Big Electric Hammer', 'werkzeuge');
    expect(result).toContain('electric');
    expect(result).toContain('tools');
  });

  it('should handle different categories', () => {
    const garden = generateItemImageUrl('item123', 'Lawn Mower', 'garten');
    expect(garden).toContain('garden');

    const home = generateItemImageUrl('item123', 'Vacuum Cleaner', 'haushalt');
    expect(home).toContain('household');

    const sport = generateItemImageUrl('item123', 'Tennis Racket', 'sport');
    expect(sport).toContain('sport');
  });

  it('should return fallback for unknown category', () => {
    const result = generateItemImageUrl('item123', 'Test Item', 'Unknown');
    expect(result).toContain('test');
    expect(result).toContain('rental');
  });
});