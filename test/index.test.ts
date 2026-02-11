import { describe, expect, test } from 'bun:test';
import rewriteMd from '../src';

const { rewriteMdComment } = rewriteMd;

describe('rewriteMdComment', () => {
  test('returns original input for invalid or empty input', () => {
    // @ts-expect-error missing data
    expect(rewriteMdComment('')).toBe('');
    // @ts-expect-error missing data
    expect(rewriteMdComment(Buffer.from('## API'))).toBe('## API');
    // @ts-expect-error null input
    expect(rewriteMdComment(null)).toBe(null);
    // @ts-expect-error undefined input
    expect(rewriteMdComment(undefined)).toBe(undefined);
    expect(rewriteMdComment('', {})).toBe('');
    expect(rewriteMdComment('', { title: 'Updated' })).toBe('');
    // @ts-expect-error invalid data
    expect(rewriteMdComment('test', null)).toBe('test');
    // @ts-expect-error invalid data
    expect(rewriteMdComment('test', undefined)).toBe('test');
  });
});

test('rewrites single block', () => {
  const input = `
<!-- version:start -->
0.0.0
<!-- version:end -->
`;

  const result = rewriteMdComment(input, { version: '1.0.0' });

  expect(result).toContain('1.0.0');
  expect(result).not.toContain('0.0.0');
});

test('rewrites multiple keys', () => {
  const input = `
<!-- version:start -->0<!-- version:end -->
<!-- author:start -->none<!-- author:end -->
`;

  const result = rewriteMdComment(input, {
    version: '2.0.0',
    author: 'TenE',
  });

  expect(result).toContain('2.0.0');
  expect(result).toContain('TenE');
});

test('rewrites multiple occurrences of same block', () => {
  const input = `
<!-- version:start -->0<!-- version:end -->
Text
<!-- version:start -->1<!-- version:end -->
`;

  const result = rewriteMdComment(input, { version: '9' });

  expect((result as string).match(/9/g)?.length).toBe(2);
});

test('ignores null or undefined values', () => {
  const input = `
<!-- version:start -->0<!-- version:end -->
`;

  const result = rewriteMdComment(input, { version: null });

  expect(result).toContain('0');
});

test('supports custom markers', () => {
  const input = `
<!-- stats:begin -->
old
<!-- stats:finish -->
`;

  const result = rewriteMdComment(
    input,
    { stats: 'new' },
    { startMarker: 'begin', endMarker: 'finish' },
  );

  expect(result).toContain('new');
  expect(result).not.toContain('old');
});

test('throws if marker names are empty', () => {
  expect(() => rewriteMdComment('abc', {}, { startMarker: '', endMarker: 'end' })).toThrow();

  expect(() => rewriteMdComment('abc', {}, { startMarker: 'start', endMarker: '' })).toThrow();
});

test('returns string by default for Buffer input', () => {
  const input = Buffer.from(`
<!-- build:start -->
old
<!-- build:end -->
`);

  const result = rewriteMdComment(input, { build: 'new' });

  expect(typeof result).toBe('string');
  expect(result).toContain('new');
});

test('preserves Buffer when preserveType is true', () => {
  const input = Buffer.from(`
<!-- build:start -->
old
<!-- build:end -->
`);

  const result = rewriteMdComment(input, { build: 'success' }, { preserveType: true });

  expect(Buffer.isBuffer(result)).toBe(true);
  expect(result.toString()).toContain('success');
});

test('throws when start marker has no matching end marker', () => {
  const input = `
<!-- version:start -->
broken
`;

  expect(() => rewriteMdComment(input, { version: '1.0.0' })).toThrow(/No matching end marker/);
});

test('throws when data key conflicts with marker names', () => {
  expect(() => rewriteMdComment('Hi', { start: 'bad' })).toThrow();
  expect(() => rewriteMdComment('Hi', { end: 'bad' })).toThrow();
});

test('handles keys with regex special characters', () => {
  const input = `
<!-- ver.sion:start -->
0
<!-- ver.sion:end -->
`;

  const result = rewriteMdComment(input, {
    'ver.sion': 'safe',
  });

  expect(result).toContain('safe');
});

test('does not modify content without markers', () => {
  const input = `No markers here`;

  const result = rewriteMdComment(input, {
    version: '1.0.0',
  });

  expect(result).toBe(input);
});
