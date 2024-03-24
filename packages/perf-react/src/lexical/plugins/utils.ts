export function groupCommonAncestorKeys(arrayOfKeys: Array<{ pathArray: Array<string | number> }>) {
  // Group the keys by the first key
  const groupedKeys: {
    [key: string]: Array<{ pathArray: Array<string | number> }>;
  } = arrayOfKeys.reduce(
    (groups: { [key: string]: Array<{ pathArray: Array<string | number> }> }, keys) => {
      const firstKey = keys.pathArray[0];
      if (!groups[firstKey]) {
        groups[firstKey] = [];
      }
      groups[firstKey].push(keys);
      return groups;
    },
    {},
  );

  // Find the common ancestor keys for each group and the original arrays that share them
  const commonAncestorKeysByGroup: {
    [key: string]: {
      commonAncestorKeys: Array<string | number>;
      originalArrays: Array<{ pathArray: Array<string | number> }>;
    };
  } = {};
  for (const firstKey in groupedKeys) {
    const commonAncestorKeys = findCommonAncestorKeys(
      groupedKeys[firstKey].map((keys) => keys.pathArray),
    );
    const originalArrays = groupedKeys[firstKey].filter(
      (keys) =>
        keys.pathArray.slice(0, commonAncestorKeys.length).join(",") ===
        commonAncestorKeys.join(","),
    );
    commonAncestorKeysByGroup[firstKey] = {
      commonAncestorKeys,
      originalArrays,
    };
  }

  return commonAncestorKeysByGroup;
}
// Function to find the common ancestor keys from an array of keys
function findCommonAncestorKeys(
  arrayOfKeys: Array<Array<string | number>>,
): Array<string | number> {
  let commonAncestorKeys = [...arrayOfKeys[0]]; // Initialize with the first array of keys
  for (let i = 1; i < arrayOfKeys.length; i++) {
    const currentArray = arrayOfKeys[i];
    let commonLength = 0;
    // Find the common length of keys between the current array and the common ancestor keys
    while (
      commonLength < commonAncestorKeys.length &&
      commonAncestorKeys[commonLength] === currentArray[commonLength]
    ) {
      commonLength++;
    }
    commonAncestorKeys = commonAncestorKeys.slice(0, commonLength); // Update the common ancestor keys
  }
  return commonAncestorKeys;
}
/**
 * Generates ranges from an array of numbers.
 *
 * @param array - The array of numbers.
 * @returns An array of strings representing the ranges.
 *
 * @remarks
 * This function takes an array of numbers and generates ranges from it. A range is defined as a sequence of consecutive numbers.
 * For example, given the input array [1, 2, 3, 6, 7, 8, 10], the function will return ["1-3", "6-8", "10"].
 */

export function generateRanges(array: number[]): string[] {
  //TODO: NEEDS FIXING
  // Sort the array in ascending order
  array.sort((a, b) => a - b);

  const ranges: string[] = [];
  let start = array[0];
  let end = array[0];

  for (const num of array.slice(1)) {
    // If the current number is not consecutive to the previous one,
    // push the range to the result and start a new range
    if (num !== end + 1) {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = num;
    }
    end = num;
  }

  // Push the last range to the result
  ranges.push(start === end ? `${start}` : `${start}-${end}`);

  return ranges;
}
type KeyGroup = {
  commonAncestorKeys: Array<string | number>;
  originalArrays: Array<{ pathArray: Array<string | number> }>;
};

export function getNumbersFromObject(obj: KeyGroup): Array<number> {
  const numbers: Set<number> = new Set();

  // Get the position from the length of commonAncestorKeys
  const position = obj.commonAncestorKeys.length;

  // Iterate over each object in originalArrays
  for (const originalArray of obj.originalArrays) {
    // Get the number at the position in pathArray and add it to the numbers set
    const number = originalArray.pathArray[position];
    if (typeof number === "number") {
      numbers.add(number);
    }
  }

  // Convert the set to an array
  const numbersArray: Array<number> = Array.from(numbers);

  return numbersArray;
}
