import { LexicalEditor, PASTE_COMMAND } from "lexical";

export const pasteSelection = (editor: LexicalEditor) => {
  navigator.clipboard.read().then(async () => {
    const data = new DataTransfer();

    const items = await navigator.clipboard.read();
    const item = items[0];

    const permission = await navigator.permissions.query({
      // @ts-expect-error These types are incorrect.
      name: "clipboard-read",
    });
    if (permission.state === "denied") {
      alert("Not allowed to paste from clipboard.");
      return;
    }

    for (const type of item.types) {
      const dataString = await (await item.getType(type)).text();
      data.setData(type, dataString);
    }

    const event = new ClipboardEvent("paste", {
      clipboardData: data,
    });

    editor.dispatchCommand(PASTE_COMMAND, event);
  });
};

export const pasteSelectionAsPlainText = (editor: LexicalEditor) => {
  navigator.clipboard.read().then(async () => {
    const permission = await navigator.permissions.query({
      // @ts-expect-error These types are incorrect.
      name: "clipboard-read",
    });

    if (permission.state === "denied") {
      alert("Not allowed to paste from clipboard.");
      return;
    }

    const data = new DataTransfer();
    const items = await navigator.clipboard.readText();
    data.setData("text/plain", items);

    const event = new ClipboardEvent("paste", {
      clipboardData: data,
    });
    editor.dispatchCommand(PASTE_COMMAND, event);
  });
};
