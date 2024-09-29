import { BookStore } from "shared/contentManager";
import { HistoryState } from "shared/plugins/History/HistoryManager";
import PerfDocument from "shared/plugins/PerfOperations/Types/Document";

export const downloadUsfm = (
  bookHandler: BookStore | null,
  historyState: HistoryState,
  bookCode: string,
) => {
  async function getUsfmFromPerf() {
    if (!bookHandler || !historyState?.current?.perfDocument) return;
    await bookHandler.sideload(bookCode, historyState.current.perfDocument as PerfDocument);
    const newUsfm: string = await bookHandler.readUsfm(bookCode);

    const downloadUsfm = (usfm: string, filename: string) => {
      const element = document.createElement("a");
      const file = new Blob([usfm], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };
    const timestamp = new Date().getTime();
    downloadUsfm(newUsfm, `usfm_${bookCode}_${timestamp}.txt`);
  }
  getUsfmFromPerf();
};
