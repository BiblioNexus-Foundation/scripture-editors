import { $isImmutableNoteCallerNode } from "../../nodes/usj/ImmutableNoteCallerNode";
import { $getNoteByKeyOrIndex, $getNoteIndex } from "../../nodes/usj/note.utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { NodeKey } from "lexical";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { EXTERNAL_USJ_MUTATION_TAG, NoteNode } from "shared";

/** PT9's selected-caller style: a thin top-and-bottom border on the note caller in the text. */
export const NOTE_CALLER_HIGHLIGHT_CLASS = "caller_highlight";

/** Forward reference for the note caller highlight. */
export interface NoteCallerHighlightHandle {
  /**
   * Highlights the caller of the given note (by key or document-order index); `undefined` clears
   * the highlight. Only one note is highlighted at a time.
   *
   * Silently does nothing for a note BUILT expanded under `markerMode: "editable"`, whose caller
   * is a plain TextNode rather than the ImmutableNoteCallerNode this class attaches to — a note
   * built collapsed keeps that node through an expand toggle. The note is resolved here and
   * never retried, so a call made before the document has loaded, or with a stale key or an
   * out-of-range index, is discarded and clears any highlight already showing.
   */
  setHighlightedNote(noteKeyOrIndex: string | number | undefined): void;
}

/**
 * Keeps `caller_highlight` on exactly one note's caller element. Lexical recreates a note's DOM
 * on collapse toggles, so the class is re-applied after every commit rather than set once; and it
 * is added imperatively, never through node state, so a highlight cannot dirty the document.
 *
 * The highlighted note is tracked by key. A commit that destroys that note keeps the highlight
 * only when the note was replaced IN PLACE — `EditorRef.replaceEmbedUpdate` re-keys the note it
 * rewrites — recognized as a note created in the same commit at the destroyed note's
 * document-order index (the coordinate a host's notes pane addresses). A note that simply left
 * the document drops the highlight rather than sliding it onto whichever note shifted into its
 * place, and so does a wholesale document load, whose fresh notes are a different chapter's.
 */
export const NoteCallerHighlightPlugin = forwardRef<NoteCallerHighlightHandle>(
  function NoteCallerHighlightPlugin(_props, ref) {
    const [editor] = useLexicalComposerContext();
    const highlightedKeyRef = useRef<NodeKey | undefined>(undefined);
    const highlightedElementRef = useRef<HTMLElement | undefined>(undefined);

    const applyHighlight = useCallback(() => {
      const noteKey = highlightedKeyRef.current;
      const callerKey =
        noteKey === undefined
          ? undefined
          : editor.getEditorState().read(() => {
              // The caller is not the note's first child: in editable marker mode the note opens
              // with its marker glyph.
              const caller = $getNoteByKeyOrIndex(noteKey)
                ?.getChildren()
                .find($isImmutableNoteCallerNode);
              return caller?.getKey();
            });
      const element = callerKey ? (editor.getElementByKey(callerKey) ?? undefined) : undefined;
      if (highlightedElementRef.current && highlightedElementRef.current !== element)
        highlightedElementRef.current.classList.remove(NOTE_CALLER_HIGHLIGHT_CLASS);
      element?.classList.add(NOTE_CALLER_HIGHLIGHT_CLASS);
      highlightedElementRef.current = element;
    }, [editor]);

    useImperativeHandle(
      ref,
      () => ({
        setHighlightedNote(noteKeyOrIndex) {
          highlightedKeyRef.current =
            noteKeyOrIndex === undefined
              ? undefined
              : editor.getEditorState().read(() => $getNoteByKeyOrIndex(noteKeyOrIndex)?.getKey());
          applyHighlight();
        },
      }),
      [editor, applyHighlight],
    );

    useEffect(
      () =>
        mergeRegister(
          // Runs before the update listener below, so the key it re-points to is the one the
          // re-application then resolves the caller element from.
          editor.registerMutationListener(
            NoteNode,
            (mutations, { prevEditorState, updateTags }) => {
              const noteKey = highlightedKeyRef.current;
              if (noteKey === undefined || mutations.get(noteKey) !== "destroyed") return;

              // A load replaces the whole document and regenerates every key, so no note in the
              // new document is this one, whatever sits at its index. The host re-addresses the
              // highlight against the reloaded notes.
              const noteIndex = updateTags.has(EXTERNAL_USJ_MUTATION_TAG)
                ? undefined
                : prevEditorState.read(() => $getNoteIndex(noteKey));
              const replacementKey =
                noteIndex === undefined
                  ? undefined
                  : editor.getEditorState().read(() => $getNoteByKeyOrIndex(noteIndex)?.getKey());
              highlightedKeyRef.current =
                replacementKey !== undefined && mutations.get(replacementKey) === "created"
                  ? replacementKey
                  : undefined;
            },
            { skipInitialization: true },
          ),
          editor.registerUpdateListener(() => applyHighlight()),
        ),
      [editor, applyHighlight],
    );

    useEffect(
      () => () => highlightedElementRef.current?.classList.remove(NOTE_CALLER_HIGHLIGHT_CLASS),
      [],
    );

    return null;
  },
);
