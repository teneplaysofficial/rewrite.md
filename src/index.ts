export * from './markdown';
export * from './markdown.types';
export * from './rewriteMdComment';
export * from './rewriteMdComment.types';

import * as markdownModule from './markdown';
import * as rewriteCommentModule from './rewriteMdComment';

/**
 * Aggregated namespace-style API for `rewrite.md`.
 */
export const rewriteMd = {
  ...markdownModule,
  ...rewriteCommentModule,
} as const;

export default rewriteMd;
