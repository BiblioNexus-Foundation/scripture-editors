import { markerTypes, markerCategories } from "./utils";

export const scriptureMarkers = {
  id: {
    type: markerTypes.book,
    categories: [markerCategories.bookIdentification],
    content: ["text"],
  },
  ide: {
    type: markerTypes.paragraph,
    categories: [markerCategories.bookHeaders],
    content: ["text"],
  },
};
