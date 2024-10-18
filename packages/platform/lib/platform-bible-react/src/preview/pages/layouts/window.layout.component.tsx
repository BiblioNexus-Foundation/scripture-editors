import BookChapterControl from "@/components/advanced/book-chapter-control/book-chapter-control.component";
import { Button } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { HasDirection } from "@/preview/preview-components/direction-toggle.component";
import { ScriptureReference } from "platform-bible-utils";
import { useState } from "react";

export default function WindowOrTabExample({ direction }: HasDirection) {
  const defaultScrRef: ScriptureReference = {
    bookNum: 1,
    chapterNum: 1,
    verseNum: 1,
  };
  const [scrRef, setScrRef] = useState(defaultScrRef);
  return (
    <div className="tw-rounded-md tw-border">
      <div className="tw-flex tw-flex-row tw-rounded-se-md tw-bg-muted/50">
        <div className="tw-m-2">
          <BookChapterControl scrRef={scrRef} handleSubmit={setScrRef} />
        </div>
        <div className="tw-grow" />
        <div className="tw-m-2 tw-flex">
          <Tabs defaultValue="a" dir={direction}>
            <TabsList>
              <TabsTrigger value="a">A</TabsTrigger>
              <TabsTrigger value="b">B</TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu dir={direction}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">&#x22ee;</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Tab Options</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="tw-flex tw-justify-between tw-gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <span>Zoom</span>
                  <span className="tw-flex tw-gap-2">
                    <span>50%</span>
                    <span>-----o-----</span>
                    <span>200%</span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="tw-flex tw-justify-between tw-gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <span>View</span>
                  <span>[Publish v]</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="tw-flex tw-justify-between tw-gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <span>Scroll with</span>
                  <Tabs defaultValue="a" dir={direction}>
                    <TabsList className="tw-h-7">
                      <TabsTrigger className="tw-h-6 tw-w-0" value="a">
                        A
                      </TabsTrigger>
                      <TabsTrigger className="tw-h-6 tw-w-0" value="b">
                        B
                      </TabsTrigger>
                      <TabsTrigger className="tw-h-6 tw-w-0" value="c">
                        C
                      </TabsTrigger>
                      <TabsTrigger className="tw-h-6 tw-w-0" value="d">
                        D
                      </TabsTrigger>
                      <TabsTrigger className="tw-h-6 tw-w-0" value="-">
                        -
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="tw-flex tw-justify-between tw-gap-2">
                  <span>1 item in a group</span>
                  <DropdownMenuShortcut>CTRL⇧F</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="tw-flex tw-justify-between tw-gap-2">
                <span>Item without group</span>
                <DropdownMenuShortcut>CTRL⇧F</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost">X</Button>
        </div>
        <Button
          className="tw-h-14 tw-w-14 tw-rounded-ee-none tw-rounded-ss-none"
          variant="secondary"
        >
          <p className="tw-text-2xl">+</p>
        </Button>
      </div>
      <div className="tw-p-4">
        <p>
          Imagine here the text of <code>{JSON.stringify(scrRef)}</code>
        </p>
        <br />
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
        <br />
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
        <br />
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
      </div>
    </div>
  );
}
