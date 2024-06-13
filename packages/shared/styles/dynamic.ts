export class StyleHelper {
  private styleElement: HTMLStyleElement;

  constructor(style: string) {
    if (!this.isValidCSS(style)) {
      throw new Error("Invalid CSS");
    }
    this.styleElement = document.createElement("style");
    this.styleElement.innerHTML = style;
  }

  load() {
    document.head.appendChild(this.styleElement);
  }

  unload() {
    if (document.head.contains(this.styleElement)) {
      document.head.removeChild(this.styleElement);
    }
  }

  toggle() {
    if (document.head.contains(this.styleElement)) {
      this.unload();
    } else {
      this.load();
    }
  }

  private isValidCSS(style: string): boolean {
    const cssRulePattern = /([a-z0-9\s,.\-#]+)\{([a-z0-9\s:;.\-#]+)\}/gi;
    return cssRulePattern.test(style);
  }
}

export const verseBlockStyle = new StyleHelper(`
  span[perf-subtype="verses"] {
    display: block;
    margin-top: 1em;
    padding-top: 1em;
    border-top: dashed 1px #ffffff91;
  }
`);
