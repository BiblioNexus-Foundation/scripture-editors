// //TODO: import { Validator, PipelineHandler } from "proskomma-json-tools";
// import PerfDocument from "../plugins/PerfOperations/Types/Document";
// import { usfm2perf } from "../converters/perf/usfmToPerf";

// function isUSFM(source: string) {
//   return source.startsWith("\\"); // This is a very simple check, but it's good enough for now
// }

// class PerfObject {
//   constructor(source: string | PerfDocument, documentData) {
//     if (!isUSFM(source) && !source.startsWith("{"))
//       throw new Error(
//         "Invalid source. The source must be either a USFM string (starting with '\\') or a JSON string (starting with '{').",
//       );

//     if (isUSFM(source)) {
//       this.contents = usfm2perf(source, documentData);
//     }

//     if (source.startsWith("{")) {
//       const jsonSource = JSON.parse(source);
//       if ("type" in jsonSource && isPerf(jsonSource)) {
//         this.contents = jsonSource;
//       }
//     }
//   }
//   merge(other: PerfObject) {
//     // Merge the two perf objects
//     // This is a placeholder implementation
//     return new PerfObject(this.contents, {});
//   }
// }
