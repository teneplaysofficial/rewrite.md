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

  /**
   * Controls how replacement values are inserted into the Markdown block.
   *
   * @remarks
   * - When `false` (default), values are HTML-escaped before insertion. This prevents accidental HTML injection and ensures safe, deterministic output.
   * - When `true`, values are inserted as-is, allowing raw Markdown or HTML content.
   *
   * @default false
   */
  allowRaw?: boolean;
}
