import { rewriteMdComment } from './rewriteMdComment';

export * from './rewriteMdComment';
export * from './rewriteMdComment.types';

/**
 * Namespace-style export for `rewrite.md`.
 *
 * @remarks
 * Provides a grouped object API for consumers who prefer a single entry point instead of named imports.
 *
 * @see {@link rewriteMdComment}
 */
export const rewriteMd = {
  rewriteMdComment,
};

export default rewriteMd;
