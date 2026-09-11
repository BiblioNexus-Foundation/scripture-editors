/**
 * Keyboard and scroll behavior of the editor context menu — the plugin's first tests.
 *
 * The menu's key handling sits on a CAPTURE-phase `keydown` listener on `document`, while Lexical
 * routes keys from a BUBBLE-phase listener on the root element, so the menu sees a press first and
 * decides whether Lexical ever sees it. Every assertion here drives a real DOM `keydown`
 * (`pressKeyThroughDom`) rather than dispatching `KEY_ENTER_COMMAND` directly: what these pin is
 * propagation BETWEEN those two listeners, which a direct command dispatch cannot see.
 */

import { ContextMenuPlugin } from "./ContextMenuPlugin";
import { baseTestEnvironment, pressKeyThroughDom } from "./react-test.utils";
import { act } from "@testing-library/react";
import { $createTextNode, $getRoot, COMMAND_PRIORITY_NORMAL, KEY_ENTER_COMMAND } from "lexical";
import { $createParaNode } from "shared";

/** Opens the context menu the way a right-click does: a `contextmenu` event on a DESCENDANT of the
 * root element. The plugin deliberately ignores the root element itself, so targeting the root
 * would never open the menu. */
async function rightClick(rootElement: HTMLElement) {
  const target = rootElement.firstElementChild ?? rootElement;
  await act(async () => {
    target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
  });
}

/** Dispatches a real `keydown` on `document` — what the menu's own capture listener hears. Arrow
 * keys go through the document (not the editor root) because the menu, not the editor, is what is
 * being navigated. */
async function pressKeyOnDocument(key: string) {
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });
}

function menuList() {
  return document.querySelector(".typeahead-popover ul");
}

function menuItemTitles() {
  return Array.from(document.querySelectorAll(".typeahead-popover li .text")).map(
    (el) => el.textContent ?? "",
  );
}

function selectedMenuItemTitle() {
  return document.querySelector(".typeahead-popover li.selected .text")?.textContent;
}

async function openMenuWithEndNoteHighlighted(onSelect: () => void) {
  const { editor } = await baseTestEnvironment(
    () => {
      $getRoot().append($createParaNode().append($createTextNode("In the beginning")));
    },
    <ContextMenuPlugin options={[{ title: "Insert end note", onSelect }]} />,
  );
  const rootElement = editor.getRootElement();
  if (!rootElement) throw new Error("editor has no root element");
  await rightClick(rootElement);
  const indexOfEndNote = menuItemTitles().indexOf("Insert end note");
  expect(indexOfEndNote).toBeGreaterThanOrEqual(0);
  // Walk the highlight down onto the extra option, the way the user does.
  for (let i = 0; i <= indexOfEndNote; i++) await pressKeyOnDocument("ArrowDown");
  expect(selectedMenuItemTitle()).toBe("Insert end note");
  return { editor, rootElement };
}

describe("ContextMenuPlugin keyboard selection", () => {
  it("routes Enter to the highlighted menu item instead of letting Lexical claim the keystroke", async () => {
    const onSelect = vi.fn();
    /** Stands in for anything of Lexical's that acts on Enter (rich text's paragraph split, the
     * marker menu's `KEY_ENTER_COMMAND` claim). While the menu is open none of it may run. */
    const lexicalSawEnter = vi.fn();

    const { editor } = await openMenuWithEndNoteHighlighted(onSelect);
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      () => {
        lexicalSawEnter();
        return true;
      },
      COMMAND_PRIORITY_NORMAL,
    );

    await pressKeyThroughDom(editor, "Enter");

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(lexicalSawEnter).not.toHaveBeenCalled();
  });

  it("lets Lexical have Enter once the menu has closed", async () => {
    const lexicalSawEnter = vi.fn();
    const { editor } = await openMenuWithEndNoteHighlighted(vi.fn());
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      () => {
        lexicalSawEnter();
        return true;
      },
      COMMAND_PRIORITY_NORMAL,
    );

    await pressKeyOnDocument("Escape");
    expect(menuList()).toBeNull();
    await pressKeyThroughDom(editor, "Enter");

    // The control for the test above: the harness DOES route Enter to Lexical when the menu is not
    // the one holding the keyboard, so "Lexical never saw Enter" there means the menu claimed it.
    expect(lexicalSawEnter).toHaveBeenCalled();
  });
});

describe("ContextMenuPlugin scrolling", () => {
  it("stays open when the scroll happens INSIDE the menu", async () => {
    await openMenuWithEndNoteHighlighted(vi.fn());
    const list = menuList();
    if (!list) throw new Error("menu list did not render");

    // A real scroll event on an element does not bubble, but the plugin's close-on-scroll listener
    // is registered on `window` in CAPTURE phase, which fires for a descendant's non-bubbling
    // event all the same — so scrolling the menu's own list used to close the menu, leaving the
    // items below the fold unreachable by mouse.
    await act(async () => {
      list.dispatchEvent(new Event("scroll", { bubbles: false }));
    });

    expect(menuList()).not.toBeNull();
  });

  it("closes when the scroll happens outside the menu", async () => {
    const { rootElement } = await openMenuWithEndNoteHighlighted(vi.fn());

    // The case the close-on-scroll listener exists for: the page moves under a menu that is
    // positioned in fixed viewport coordinates, so the menu no longer points at anything.
    await act(async () => {
      rootElement.dispatchEvent(new Event("scroll", { bubbles: false }));
    });

    expect(menuList()).toBeNull();
  });
});
