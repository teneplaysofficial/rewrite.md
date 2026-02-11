export interface RewriteMdCommentOptions {
  /**
   * Whether to preserve the original input type.
   *
   * @remark
   * If `true` and the input was a {@link Buffer}, the output will also be a {@link Buffer}. Otherwise, the result will always be a string.
   *
   * @default false
   */
  preserveType?: boolean;

  /**
   * Marker used to denote the start of a rewrite block.
   *
   * @example
   * `<!-- key:startMarker -->`
   *
   * @default "start"
   */
  startMarker?: string;

  /**
   * Marker used to denote the end of a rewrite block.
   *
   * @example
   * `<!-- key:endMarker -->`
   *
   * @default "end"
   */
  endMarker?: string;
}

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
 */
export function rewriteMdComment(
  /** Markdown content as {@link String} or {@link Buffer} */
  input: string | Buffer,
  /** Key-value pairs used to replace block content */
  data: Record<string, unknown>,
  /** Configuration options */
  { preserveType = false, startMarker = 'start', endMarker = 'end' }: RewriteMdCommentOptions = {},
): string | Buffer<ArrayBufferLike> {
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
    if (key === startMarker || key === endMarker) {
      throw new Error(`[rewrite.md] Data key \`${key}\` conflicts with marker name.`);
    }
    const value = data[key];
    if (value == null) continue;

    const escReg = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const startReg = new RegExp(`<!--\\s*${escReg(key)}:${escReg(startMarker)}\\s*-->`);
    const endReg = new RegExp(`<!--\\s*${escReg(key)}:${escReg(endMarker)}\\s*-->`);
    const blockReg = new RegExp(
      `<!--\\s*${escReg(key)}:${escReg(startMarker)}\\s*-->[\\s\\S]*?<!--\\s*${escReg(key)}:${escReg(endMarker)}\\s*-->`,
      'g',
    );

    if (startReg.test(content) && !endReg.test(content)) {
      throw new Error(`[rewrite.md] No matching end marker for key: ${key}`);
    }

    content = content.replaceAll(blockReg, (match) => {
      const startMatch = match.match(startReg);
      const endMatch = match.match(endReg);

      return `${startMatch![0]}\n${value}\n${endMatch![0]}`;
    });
  }

  return returnThis(content);
}

export const rewriteMd = {
  rewriteMdComment,
};

export default rewriteMd;
