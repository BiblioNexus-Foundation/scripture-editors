import BookChapterControl from "@/components/advanced/book-chapter-control/book-chapter-control.component";
import DataTable from "@/components/advanced/data-table/data-table.component";
import {
  VerticalTabs,
  VerticalTabsContent,
  VerticalTabsList,
  VerticalTabsTrigger,
} from "@/components/basics/tabs-vertical";
import { HasDirection } from "@/preview/preview-components/direction-toggle.component";
import { ScriptureReference, ScrollGroupId } from "platform-bible-utils";
import { useState } from "react";
import NavigationContentSearch from "@/components/advanced/navigation-content-search.component";
import ScrollGroupSelector from "@/components/advanced/scroll-group-selector.component";
import MarketplaceButtonExamples from "./advanced/marketplace-buttons.example.component";
import ScriptureResultsViewerExample from "./advanced/scripture-results-viewer.examples.component";
import { columns, data } from "./data-sources/data-table-content";
import MarketplaceExamples from "./advanced/marketplace.example.component";
import InventoryExample from "./advanced/inventory-example.component";
import SettingsListExamples from "./advanced/settings-list.examples.component";
import BookSelectorExample from "./advanced/book-selector-example.component";

const defaultScrRef: ScriptureReference = {
  bookNum: 1,
  chapterNum: 1,
  verseNum: 1,
};

function Compositions({ direction }: HasDirection) {
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const [scrollGroupId, setScrollGroupId] = useState<ScrollGroupId | undefined>(0);
  const [searchValue, setSearchValue] = useState<string>("");

  const tabList = [
    {
      key: "tab1",
      value: "tab1",
      content: (
        <div>
          <h1>TAB 1 CONTENT</h1>
        </div>
      ),
    },
    {
      key: "tab2",
      value: "tab2",
      content: (
        <div>
          <h3>TAB 2 CONTENT</h3>
        </div>
      ),
    },
    {
      key: "tab3",
      value: "tab3",
      content: (
        <div>
          <h2>TAB 3 CONTENT</h2>
        </div>
      ),
    },
  ];

  const handleSearchChange = (newSearchValue: string) => {
    setSearchValue(newSearchValue);
  };

  return (
    <div>
      <p className="tw-mb-2 tw-text-muted-foreground">
        A place for components that are composed from basic components
      </p>
      <VerticalTabs defaultValue="Book Chapter Control" dir={direction}>
        <VerticalTabsList>
          <VerticalTabsTrigger value="Book Chapter Control">
            Book Chapter Control
          </VerticalTabsTrigger>
          <VerticalTabsTrigger value="Book Selector">Book Selector</VerticalTabsTrigger>
          <VerticalTabsTrigger value="Data Table">Data Table</VerticalTabsTrigger>
          <VerticalTabsTrigger value="Inventory">Inventory</VerticalTabsTrigger>
          <VerticalTabsTrigger value="Marketplace">Marketplace</VerticalTabsTrigger>
          <VerticalTabsTrigger value="Navigation Content Search">
            Navigation Content Search
          </VerticalTabsTrigger>
          <VerticalTabsTrigger value="Result List">Result List</VerticalTabsTrigger>
          <VerticalTabsTrigger value="Settings List">Settings Components</VerticalTabsTrigger>
          <VerticalTabsTrigger value="Scroll Group Selector">
            Scroll Group Selector
          </VerticalTabsTrigger>
        </VerticalTabsList>

        <VerticalTabsContent value="Book Chapter Control">
          <BookChapterControl scrRef={scrRef} handleSubmit={setScrRef} />
          <div>{JSON.stringify(scrRef)}</div>
        </VerticalTabsContent>

        <VerticalTabsContent value="Book Selector">
          <BookSelectorExample />
        </VerticalTabsContent>

        <VerticalTabsContent value="Scroll Group Selector">
          <ScrollGroupSelector
            availableScrollGroupIds={[undefined, ...Array(5).keys()]}
            scrollGroupId={scrollGroupId}
            onChangeScrollGroupId={setScrollGroupId}
          />
          <div>Scroll Group Id: {`${scrollGroupId}`}</div>
        </VerticalTabsContent>

        <VerticalTabsContent value="Data Table">
          <DataTable enablePagination showPaginationControls columns={columns} data={data} />
        </VerticalTabsContent>

        <VerticalTabsContent value="Marketplace">
          <VerticalTabs dir={direction}>
            <VerticalTabsList>
              <VerticalTabsTrigger value="Marketplace Buttons">
                Marketplace Buttons
              </VerticalTabsTrigger>
              <VerticalTabsTrigger value="Marketplace Components">
                Marketplace Components
              </VerticalTabsTrigger>
            </VerticalTabsList>

            <VerticalTabsContent value="Marketplace Buttons">
              <MarketplaceButtonExamples />
            </VerticalTabsContent>

            <VerticalTabsContent value="Marketplace Components">
              <MarketplaceExamples />
            </VerticalTabsContent>
          </VerticalTabs>
        </VerticalTabsContent>

        <VerticalTabsContent value="Result List">
          <ScriptureResultsViewerExample direction={direction} />
        </VerticalTabsContent>

        <VerticalTabsContent value="Inventory">
          <InventoryExample />
        </VerticalTabsContent>

        <VerticalTabsContent value="Navigation Content Search">
          <NavigationContentSearch
            headerTitle={`Testing the NavigationContentSearch, current search value: ${searchValue}`}
            tabList={tabList}
            onSearch={handleSearchChange}
            searchPlaceholder="Search..."
            isSearchBarFullWidth
            direction={direction}
          />
        </VerticalTabsContent>

        <VerticalTabsContent value="Settings List">
          <SettingsListExamples />
        </VerticalTabsContent>
      </VerticalTabs>
    </div>
  );
}

export default Compositions;
