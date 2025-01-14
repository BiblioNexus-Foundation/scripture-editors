import type { MarkerObject, MarkerContent, Usj } from "@biblionexus-foundation/scripture-utilities";
import {
  USJ_TYPE,
  USJ_VERSION,
  USX_TYPE,
  USX_VERSION,
} from "@biblionexus-foundation/scripture-utilities";
import * as Y from "yjs";

type ExtendedMarkerObject = MarkerObject & {
  [attributeName: string]: string | undefined;
};

/**
 * Represents a YJS-based Scripture document using USX and USJ structure
 */
export class ScriptureDocument {
  private readonly _doc: Y.Doc;
  private readonly root: Y.XmlElement;

  /**
   * Get the underlying YJS document for sync
   */
  get doc(): Y.Doc {
    return this._doc;
  }

  constructor() {
    this._doc = new Y.Doc();
    this.root = this._doc.get("content", Y.XmlElement);

    // Initialize root if new document
    if (this.root.length === 0) {
      this.root.setAttribute("type", USX_TYPE);
      this.root.setAttribute("version", USX_VERSION);
    }
  }

  /**
   * Initialize the document from USJ format
   */
  initFromUsj(usj: Usj) {
    // Clear existing content
    this.root.delete(0, this.root.length);

    // Convert and add each content item
    usj.content.forEach((content) => {
      this.addUsjContent(content, this.root);
    });
  }

  /**
   * Initialize the document from USX format
   */
  initFromUsx(usxString: string) {
    // Clear existing content
    this.root.delete(0, this.root.length);

    // Parse USX XML and convert to YJS XML structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(usxString, "text/xml");
    const usxRoot = doc.documentElement;

    this.convertDomToYXml(usxRoot, this.root);
  }

  /**
   * Convert back to USJ format
   */
  toUsj(): Usj {
    return {
      type: USJ_TYPE,
      version: USJ_VERSION,
      content: this.convertYXmlToUsj(this.root),
    };
  }

  /**
   * Convert to USX format
   */
  toUsx(): string {
    const xmlDoc = document.implementation.createDocument(null, USX_TYPE, null);
    const root = xmlDoc.documentElement;
    root.setAttribute("version", USX_VERSION);

    this.convertYXmlToDom(this.root, root, xmlDoc);

    return new XMLSerializer().serializeToString(xmlDoc);
  }

  /**
   * Get an element at a specific path
   */
  getElementAt(path: number[]): Y.XmlElement | undefined {
    let current: Y.XmlElement = this.root;

    for (const index of path) {
      const items = current.toArray();
      if (index >= items.length) return;

      const item = items[index];
      if (!(item instanceof Y.XmlElement)) return;

      current = item;
    }

    return current;
  }

  /**
   * Get text content at a specific path
   */
  getTextAt(path: number[]): Y.XmlText | undefined {
    let current: Y.XmlElement = this.root;

    for (let i = 0; i < path.length - 1; i++) {
      const items = current.toArray();
      if (path[i] >= items.length) return;

      const item = items[path[i]];
      if (!(item instanceof Y.XmlElement)) return;

      current = item;
    }

    const items = current.toArray();
    const lastItem = items[path[path.length - 1]];
    return lastItem instanceof Y.XmlText ? lastItem : undefined;
  }

  /**
   * Insert MarkerContent at a specific path in the document
   * @param path - Array of indexes specifying the insertion location
   * @param contents - Array of MarkerContent to insert
   * @returns boolean indicating if insertion was successful
   */
  insertAtElement(path: number[], contents: MarkerContent[]): boolean {
    // Get the parent element at the path
    const parentPath = path.slice(0, -1);
    const insertIndex = path[path.length - 1];
    const parent = this.getElementAt(parentPath);
    if (!parent) return false;

    // Convert all contents to YXml elements/text
    const elements = contents.map((content) => {
      if (typeof content === "string") return new Y.XmlText(content);

      const element = this.createElementFromMarker(content);

      // Add child content recursively
      if (content.content) {
        content.content.forEach((child) => {
          this.addUsjContent(child, element);
        });
      }

      return element;
    });

    parent.insert(insertIndex, elements);
    return true;
  }

  /**
   * Subscribe to changes in the document
   */
  observe(
    callback: (events: Y.YEvent<Y.XmlElement | Y.XmlText>[], transaction: Y.Transaction) => void,
  ): void {
    this.root.observeDeep(callback);
  }

  /**
   * Convert DOM elements to YJS XML structure
   */
  private convertDomToYXml(domElement: Element, parent: Y.XmlElement) {
    // Convert attributes
    const attrs: { [key: string]: string } = {};
    domElement.getAttributeNames().forEach((name) => {
      attrs[name] = domElement.getAttribute(name) ?? "";
    });

    // Create YXmlElement with same tag name and attributes
    const element = new Y.XmlElement(domElement.tagName.toLowerCase());
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    // Convert child nodes
    domElement.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        this.convertDomToYXml(child as Element, element);
      } else if (child.nodeType === Node.TEXT_NODE) {
        element.push([new Y.XmlText(child.textContent ?? "")]);
      }
    });

    parent.push([element]);
  }

  /**
   * Create a YXmlElement from a MarkerObject and set its attributes
   */
  private createElementFromMarker(content: MarkerObject): Y.XmlElement {
    const element = new Y.XmlElement(content.type);

    // Set style attribute from marker
    if (content.marker) element.setAttribute("style", content.marker);

    // Set all other attributes
    Object.entries(content).forEach(([key, value]) => {
      if (key !== "type" && key !== "marker" && key !== "content" && value !== undefined) {
        element.setAttribute(key, String(value));
      }
    });

    return element;
  }

  /**
   * Add content from USJ format to YJS XML structure
   */
  private addUsjContent(content: MarkerContent, parent: Y.XmlElement) {
    if (typeof content === "string") {
      parent.push([new Y.XmlText(content)]);
    } else {
      const element = this.createElementFromMarker(content);

      // Add child content recursively
      if (content.content) {
        content.content.forEach((child) => {
          this.addUsjContent(child, element);
        });
      }

      parent.push([element]);
    }
  }

  /**
   * Convert YJS XML structure to USJ format
   */
  private convertYXmlToUsj(parent: Y.XmlElement): MarkerContent[] {
    const content: MarkerContent[] = [];

    parent.toArray().forEach((item) => {
      if (item instanceof Y.XmlText) {
        content.push(item.toString());
      } else if (item instanceof Y.XmlElement) {
        const marker: ExtendedMarkerObject = {
          // Use nodeName as type
          type: item.nodeName,
          // Use style attribute as marker
          marker: item.getAttribute("style") ?? (undefined as unknown as string),
        };

        // Convert attributes
        const attrs = item.getAttributes();
        Object.entries(attrs || {}).forEach(([key, value]) => {
          if (key !== "style" && value !== undefined) {
            marker[key] = value;
          }
        });

        // Convert children recursively
        const children = this.convertYXmlToUsj(item);
        if (children.length > 0) {
          marker.content = children;
        }

        content.push(marker);
      }
    });

    return content;
  }

  /**
   * Convert YJS XML structure to DOM
   */
  private convertYXmlToDom(yElement: Y.XmlElement, domParent: Element, doc: Document) {
    yElement.toArray().forEach((item) => {
      if (item instanceof Y.XmlText) {
        domParent.appendChild(doc.createTextNode(item.toString()));
      } else if (item instanceof Y.XmlElement) {
        const element = doc.createElement(item.nodeName);

        // Convert attributes
        const attrs = item.getAttributes();
        Object.entries(attrs || {}).forEach(([key, value]) => {
          if (value !== undefined) {
            element.setAttribute(key, value);
          }
        });

        // Convert children recursively
        this.convertYXmlToDom(item, element, doc);

        domParent.appendChild(element);
      }
    });
  }
}
