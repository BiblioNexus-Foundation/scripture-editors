import { Canon } from "@sillsdev/scripture";
import { PropsWithChildren, KeyboardEvent, forwardRef } from "react";
import { DropdownMenuItem as ShadDropdownMenuItem } from "@/components/shadcn-ui/dropdown-menu";
import { cn } from "@/utils/shadcn-ui.util";

export type BookType = "OT" | "NT" | "DC";

type BookMenuItemProps = PropsWithChildren<{
  /** String id of book */
  bookId: string;
  /** Callback to run when a book menu item is selected */
  handleSelectBook: () => void;
  /** Indicates if this menu item is currently selected */
  isSelected: boolean;
  /** Function that is called upon highlighting a book in the dropdown menu */
  handleHighlightBook: () => void;
  /**
   * Function that is called on pressing a key
   *
   * @param event Event that contains information about the key stroke
   */
  handleKeyDown: (event: KeyboardEvent) => void;
  /**
   * Type of book associated with this menu item, coordinates color labels ? Mock up has the labels
   * coordinated to genre
   */
  bookType: BookType;
}>;

const BookMenuItem = forwardRef<HTMLDivElement, BookMenuItemProps>(
  (
    {
      bookId,
      handleSelectBook,
      isSelected,
      handleHighlightBook,
      handleKeyDown,
      bookType,
      children,
    }: BookMenuItemProps,
    ref,
  ) => {
    return (
      <ShadDropdownMenuItem
        ref={ref}
        key={bookId}
        textValue={bookId}
        className={cn("tw-mx-1 tw-px-1 tw-font-normal tw-text-foreground/80", {
          // Overriding `data-[highlighted]` changes the default gray background that is normally shown on hover
          "tw-bg-amber-50 tw-text-yellow-900 data-[highlighted]:tw-bg-amber-100": isSelected,
        })}
        onSelect={(event: Event) => {
          // preventDefault() here prevents the entire dropdown menu from closing when selecting this item
          event.preventDefault();
          handleSelectBook();
        }}
        onKeyDown={(event: KeyboardEvent) => {
          handleKeyDown(event);
        }}
        onFocus={handleHighlightBook}
        onMouseMove={handleHighlightBook}
      >
        <span
          className={cn(
            "tw-border-b-0 tw-border-l-2 tw-border-r-0 tw-border-t-0 tw-border-solid tw-px-2",
            {
              "tw-font-bold": isSelected,
              "tw-border-l-red-200": bookType.toLowerCase() === "ot",
              "tw-border-l-purple-200": bookType.toLowerCase() === "nt",
              "tw-border-l-indigo-200": bookType.toLowerCase() === "dc",
            },
          )}
        >
          {Canon.bookIdToEnglishName(bookId)}
        </span>
        {isSelected && <div>{children}</div>}
      </ShadDropdownMenuItem>
    );
  },
);

export default BookMenuItem;
