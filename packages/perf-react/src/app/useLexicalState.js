import { useEffect, useState } from "react";
import { getBookHandler } from "shared/contentManager";
import { fetchUsfm } from "shared/contentManager/mockup/fetchUsfm";

export function useBibleBook({ serverName, organizationId, languageCode, versionId, bookCode }) {
  const [bookHandler, setBookHandler] = useState(null);

  useEffect(() => {
    async function updateBookHandler() {
      const usfm = await fetchUsfm({
        serverName,
        organizationId,
        languageCode,
        versionId,
        bookCode,
      });
      setBookHandler(
        await getBookHandler({
          usfm,
          serverName,
          organizationId,
          languageCode,
          versionId,
          bookCode,
        }),
      );
    }
    updateBookHandler();
  }, [serverName, organizationId, languageCode, versionId, bookCode]);

  return bookHandler;
}
