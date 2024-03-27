import Epitelete from "epitelete";
import { transformPerfToLexicalState } from "../converters/perfToLexical";
import { usfm2perf } from "../converters/usfmToPerf";

export const getLexicalState = (usfmText) => {
  //Lots of hardcoded data here.
  const perf = usfm2perf(usfmText, {
    serverName: "door43",
    organizationId: "unfoldingWord",
    languageCode: "en",
    versionId: "ult",
  });
  const bibleStore = new BibleStore();
  const bibleHandler = bibleStore.create({
    docSetId: perf.metadata.translation.id,
    options: { historySize: 100 },
  });

  const readOptions = { readPipeline: "stripAlignmentPipeline" };

  return bibleHandler.sideloadPerf("RUT", perf, { ...readOptions }).then((perf) => {
    console.log({ perf });
    const _lexicalState = transformPerfToLexicalState(perf, perf.main_sequence_id);
    // console.log("Perf to Lexical", { perf, lexicalState: _lexicalState });
    return JSON.stringify(_lexicalState);
  });
};

// export const lexicalState = getTestLexicalState();

/**
 * A class with useful methods for managing
 * multiple intances of epitelete, each epitelete instance
 * can hold one Bible version (docSet), so this store allows
 * managing multiple Bible versions. Each Bible Version
 * is identified by a docSetId
 */
class BibleStore {
  constructor() {
    this.store = new Map();
  }

  /** creates a new Epitelete instance given a docsetId
   * and params for Epitelete's constructor
   */
  create(epiteleteParams) {
    const epitelete = new Epitelete(epiteleteParams);
    this.store.set(epiteleteParams.docSetId, epitelete);
    return epitelete;
  }

  /** adds an Epitelete instance to the store
   * @param { Epitelete } epiteleteInstance
   */
  add(epiteleteInstance) {
    const docSetId = epiteleteInstance?.docSetId;
    if (docSetId) this.store.set(docSetId, epiteleteInstance);
  }

  /** removes a Epitelete instance from the store
   * @param {string} docSetId
   */
  remove(docSetId) {
    this.store.delete(docSetId);
  }

  /** gets an Epitelete instance given a docsetId
   * @param {string} docSetId
   */
  get(docSetId) {
    this.store.get(docSetId);
  }
}

export default BibleStore;
