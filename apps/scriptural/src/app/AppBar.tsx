import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";

export default function ButtonAppBar() {
  return (
    <div className="w-full">
      <header className="bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <h1 className="text-xl font-bold">QuickDraft</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                playground for{" "}
                <a
                  href="https://www.npmjs.com/package/@scriptural/react"
                  target="_blank"
                  className="underline hover:text-blue-300"
                >
                  @scriptural/react
                </a>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/10 hover:bg-white/20 border-white/20"
                asChild
              >
                <a
                  href="https://github.com/BiblioNexus-Foundation/scripture-editors/issues/new?labels=@scriptural/react"
                  target="_blank"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Report a bug
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
