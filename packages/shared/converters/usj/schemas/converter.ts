interface RNCTerminal {
  name: string;
  value: string;
  documentation?: string;
}

interface RNCElement {
  name: string;
  attributes: {
    name: string;
    type: string;
    required: boolean;
    enum?: string[];
  }[];
  children: Array<string | RNCElement>;
  allowText?: boolean;
}

interface JSONSchemaElement {
  type: string;
  required: string[];
  properties: {
    type: { const: string };
    contents?: {
      type: string;
      items: { anyOf: Array<{ type: string } | { $ref: string }> };
    };
    [key: string]: unknown;
  };
}

export function convertRNCtoJSONSchema(rncContent: string) {
  // First pass: Parse terminals
  const terminals: Record<string, RNCTerminal> = parseTerminals(rncContent);

  // Second pass: Parse elements
  const elements: Record<string, RNCElement> = parseElements(rncContent);

  // Convert to JSON Schema
  return generateJSONSchema(terminals, elements);
}

function parseTerminals(rncContent: string): Record<string, RNCTerminal> {
  const terminals: Record<string, RNCTerminal> = {};

  // Match terminal definitions
  const terminalRegex = /usfm:terminal\s*\[\s*name="([^"]+)"\s*value="([^"]+)"([^\]]*)\]/g;
  let match;

  while ((match = terminalRegex.exec(rncContent)) !== null) {
    const [_, name, value, rest] = match;

    // Parse documentation if present
    const docMatch = rest.match(/a:documentation\s*\[\s*"([^"]+)"\s*\]/);

    terminals[name] = {
      name,
      value: value.replace(/^\/|\/$/g, ""), // Remove regex delimiters
      documentation: docMatch ? docMatch[1] : undefined,
    };
  }

  return terminals;
}

function parseElements(rncContent: string): Record<string, RNCElement> {
  const elements: Record<string, RNCElement> = {};

  // Match element definitions
  const elementRegex = /(\w+)\s*=\s*element\s+(\w+)\s*{([^}]+)}/g;
  let match;

  while ((match = elementRegex.exec(rncContent)) !== null) {
    const [_, elementName, elementType, content] = match;

    const attributes = parseAttributes(content);
    const children = parseChildren(content);

    elements[elementName] = {
      name: elementType,
      attributes,
      children,
      allowText: content.includes("text"),
    };
  }

  return elements;
}

function parseAttributes(content: string) {
  const attributes: RNCElement["attributes"] = [];

  // Match attribute definitions
  const attrRegex = /attribute\s+(\w+)\s*{\s*([^}]+)\s*}/g;
  let match;

  while ((match = attrRegex.exec(content)) !== null) {
    const [_, name, type] = match;

    // Check if it's an enum
    const enumValues = type.match(/"([^"]+)"/g)?.map((v) => v.replace(/"/g, ""));

    attributes.push({
      name,
      type: enumValues ? "enum" : type.trim(),
      required: !content.includes(`${name}?`),
      ...(enumValues && { enum: enumValues }),
    });
  }

  return attributes;
}

function parseChildren(content: string) {
  const children: RNCElement["children"] = [];

  // Match references to other elements
  const childRegex = /(\w+)\s*[,|]/g;
  let match;

  while ((match = childRegex.exec(content)) !== null) {
    const [_, childName] = match;
    if (!["attribute", "text"].includes(childName)) {
      children.push(childName);
    }
  }

  return children;
}

function generateJSONSchema(
  terminals: Record<string, RNCTerminal>,
  elements: Record<string, RNCElement>,
) {
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions: {
      terminals: Object.fromEntries(
        Object.entries(terminals).map(([name, terminal]) => [
          name,
          {
            type: "string",
            pattern: terminal.value,
            description: terminal.documentation,
          },
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(elements).map(([name, element]) => [
          name,
          generateElementSchema(element, elements),
        ]),
      ),
    },
    anyOf: Object.keys(elements).map((name) => ({
      $ref: `#/definitions/${name}`,
    })),
  };

  return schema;
}

function generateElementSchema(
  element: RNCElement,
  allElements: Record<string, RNCElement>,
): JSONSchemaElement {
  return {
    type: "object",
    required: ["type", ...element.attributes.filter((a) => a.required).map((a) => a.name)],
    properties: {
      type: { const: element.name },
      ...Object.fromEntries(
        element.attributes.map((attr) => [
          attr.name === "style" ? "marker" : attr.name,
          attr.enum ? { enum: attr.enum } : { type: mapRNCTypeToJSON(attr.type) },
        ]),
      ),
      contents: {
        type: "array",
        items: {
          anyOf: [
            ...(element.allowText ? [{ type: "string" }] : []),
            ...element.children.map((child) =>
              typeof child === "string"
                ? { $ref: `#/definitions/${child}` }
                : generateElementSchema(child, allElements),
            ),
          ],
        },
      },
    },
  };
}

function mapRNCTypeToJSON(rncType: string): string {
  const typeMap: Record<string, string> = {
    "xsd:string": "string",
    "xsd:integer": "integer",
    "xsd:boolean": "boolean",
    "xsd:date": "string", // with date format
    text: "string",
  };

  return typeMap[rncType] || "string";
}
