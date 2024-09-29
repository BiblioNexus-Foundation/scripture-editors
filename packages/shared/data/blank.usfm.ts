/**
 * Minimun valid usfm for proskomma:
 * one "\mt#" is the only required tag,
 * though it makes sense to start with \c \p and \v tags too.
 */
export default String.raw`\id REV
\h REV
\mt REV
\c 1
\p
\v 1 lorem \wj ipsum dolor\wj* sit amet lorem ipsum \sup \sup* dolor sit amet lorem ipsum dolor sit amet \add this is an \+nd embeded \+nd*\+nd text\+nd* example \add*
\v 2 \bd lorem\bd* ipsum dolor sit amet lorem ipsum dolor sit amet \x 1 \xo 1.2: \xt lorem ipsum dolor sit amet \x*
\p
\v 3 amet dolor \add this is an \+nd embeded text\+nd* example \add*
`;
