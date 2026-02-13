import { RewriteMdCommentOptions } from './rewriteMdComment.types';

/**
 * Rewrites Markdown comment blocks.
 *
 * @remark
 * - A block must follow this format:
 *   ```md
 *   <!-- key:start -->
 *   old content
 *   <!-- key:end -->
 *   ```
 * - The content between `start` and `end` markers will be replaced by the corresponding value from the `data` object.
 *
 *
 * @throws If start marker exists without matching end marker.
 *
 * @throws If a data key conflicts with marker names.
 *
 * @returns Rewritten Markdown as string or Buffer (based on options)
 *
 * @example Basic usage
 * ```ts
 * import { rewriteMdComment } from 'rewrite.md';
 *
 * const md = `
 * <!-- version:start -->
 * 0.0.0
 * <!-- version:end -->
 * `;
 *
 * const result = rewriteMdComment(md, {
 *   version: '1.2.3'
 * });
 *
 * console.log(result);
 * ```
 *
 * @example Multiple blocks
 * ```ts
 * const md = `
 * <!-- version:start -->0<!-- version:end -->
 * <!-- author:start -->unknown<!-- author:end -->
 * `;
 *
 * const result = rewriteMdComment(md, {
 *   version: '2.0.0',
 *   author: 'TenE'
 * });
 * ```
 *
 * @example Custom markers
 * ```ts
 * const md = `
 * <!-- stats:begin -->
 * old value
 * <!-- stats:finish -->
 * `;
 *
 * const result = rewriteMdComment(
 *   md,
 *   { stats: 'new value' },
 *   {
 *     startMarker: 'begin',
 *     endMarker: 'finish'
 *   }
 * );
 * ```
 *
 * @example Using Buffer and preserving type
 * ```ts
 * const buffer = Buffer.from(`
 * <!-- build:start -->
 * pending
 * <!-- build:end -->
 * `);
 *
 * const result = rewriteMdComment(
 *   buffer,
 *   { build: 'success' },
 *   { preserveType: true }
 * );
 *
 * console.log(Buffer.isBuffer(result)); // true
 * ```
 *
 * @example Handling missing end marker (throws)
 * ```ts
 * const md = `
 * <!-- version:start -->
 * broken content
 * `;
 *
 * // Throws Error: No matching end marker
 * rewriteMdComment(md, { version: '1.0.0' });
 * ```
 *
 * @example Safe mode
 * ```ts
 * rewriteMdComment(md, {
 *   content: '<details>Hidden</details>'
 * });
 * // Output will contain: &lt;details&gt;Hidden&lt;/details&gt;
 * ```
 *
 * @example Raw mode
 * ```ts
 * rewriteMdComment(
 *   md,
 *   { content: '<details>Hidden</details>' },
 *   { allowRaw: true }
 * );
 * // Output will contain: <details>Hidden</details>
 * ```
 *
 * @see {@link RewriteMdCommentOptions}
 */
export function rewriteMdComment(
  /** Markdown content as {@link String} or {@link Buffer} */
  input: string | Buffer,
  /** Key-value pairs used to replace block content */
  data: Record<string, unknown>,
  /** Configuration options */
  {
    preserveType = false,
    startMarker = 'start',
    endMarker = 'end',
    allowRaw = false,
  }: RewriteMdCommentOptions = {},
): string | Buffer {
  const isBuffer = Buffer.isBuffer(input);

  const toString = (ctx: string | Buffer): string =>
    Buffer.isBuffer(ctx) ? ctx.toString('utf-8') : ctx;

  const returnThis = (ctx: string | Buffer) => {
    return preserveType && isBuffer ? Buffer.from(ctx) : ctx;
  };

  let content = toString(input);

  if (!content || Object.prototype.toString.call(data) !== '[object Object]') {
    return returnThis(content);
  }

  if (!startMarker || !endMarker) {
    throw new Error('[rewrite.md] startMarker and endMarker must be defined.');
  }

  for (const key in data) {
    if (!Object.hasOwn(data, key)) continue;

    if (key === startMarker || key === endMarker) {
      throw new Error(`[rewrite.md] Data key \`${key}\` conflicts with marker name.`);
    }
    const value = data[key];
    if (value == null) continue;

    const escReg = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapeHtml = (u: string) =>
      u
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const startReg = new RegExp(`<!--\\s*${escReg(key)}:${escReg(startMarker)}\\s*-->`, 'g');
    const endReg = new RegExp(`<!--\\s*${escReg(key)}:${escReg(endMarker)}\\s*-->`, 'g');
    const blockReg = new RegExp(
      `<!--\\s*${escReg(key)}:${escReg(startMarker)}\\s*-->[\\s\\S]*?<!--\\s*${escReg(key)}:${escReg(endMarker)}\\s*-->`,
      'g',
    );
    const startCount = [...content.matchAll(startReg)].length;
    const endCount = [...content.matchAll(endReg)].length;

    if (startCount !== endCount) {
      throw new Error(
        `[rewrite.md] Unmatched markers for key ${key}: start=${startCount}, end=${endCount}`,
      );
    }

    content = content.replaceAll(blockReg, (match) => {
      const startMatch = match.match(startReg);
      const endMatch = match.match(endReg);

      return `${startMatch![0]}\n${
        allowRaw ? String(value) : escapeHtml(String(value))
      }\n${endMatch![0]}`;
    });
  }

  return returnThis(content);
}
