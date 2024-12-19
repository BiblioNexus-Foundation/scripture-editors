import { generateFiles, Tree } from "@nx/devkit";
import * as path from "path";
import { MarkersDataGeneratorSchema } from "./schema";

import axios from "axios";
import { createMarkersDictionaryFromUsfmSty } from "./utils/generateMarkersDictionary";
import { simplifyMarkersDictionary } from "./utils/simplifyMarkersDictionary";
import { CategoryType } from "./utils/categoriesMap";

export async function markersDataGenerator(tree: Tree, options: MarkersDataGeneratorSchema) {
  const projectRoot = options.outputPath;

  // Fetch the USFM style file
  const response = await axios.get(options.usfmStyleUrl);
  const usfmStyleContent = response.data;

  // Generate the markers dictionary
  const markersDictionary = createMarkersDictionaryFromUsfmSty(usfmStyleContent);
  const simplifiedDictionary = simplifyMarkersDictionary(markersDictionary, [
    //Unsupported categories
    CategoryType.Uncategorized,
    CategoryType.CenterTables,
    CategoryType.SpecialFeatures,
    CategoryType.Tables,
    CategoryType.RightTables,
    CategoryType.PeripheralMaterials,
    CategoryType.PeripheralReferences,
  ]);

  /** Function to capitalize the first letter of a string */
  function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Convert the simplified dictionary to a string representation with proper enum handling
  const simplifiedDictionaryString = Object.entries(simplifiedDictionary)
    .map(([key, value]) => {
      return `  "${key}": {
    category: CategoryType.${value.category ? capitalizeFirstLetter(value.category) : CategoryType.Uncategorized},
    type: MarkerType.${value.type ? capitalizeFirstLetter(value.type) : "Unknown"},
    description: "${value.description ? value.description.replaceAll(`"`, `'`) : ""}",
    hasEndMarker: ${value.hasEndMarker},
    children: ${JSON.stringify(value.children, null, 4)}
  }`;
    })
    .join(",\n");

  // Generate the files
  generateFiles(tree, path.join(__dirname, "files"), projectRoot, {
    ...options,
    simplifiedDictionaryString: String.raw`${simplifiedDictionaryString}`,
  });
}

export default markersDataGenerator;
