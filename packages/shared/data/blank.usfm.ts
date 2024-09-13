/**
 * Minimun valid usfm for proskomma:
 * one "\mt#" is the only required tag,
 * though it makes sense to start with \c \p and \v tags too.
 */
export default String.raw`\mt Tito
\c 1
\p
\v 1 `;
