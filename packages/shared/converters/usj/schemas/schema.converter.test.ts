import { convertRNCtoJSONSchema } from "./converter";

describe("RNC to JSON Schema converter", () => {
  it("should convert RNC content to JSON Schema", () => {
    const rncContent = `
      usfm:terminal [name="EMAIL" value="/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/"
          a:documentation ["Matches a basic email address pattern"]]

      UserProfile =
          element profile {
              attribute style { "user" },
              element email {
                  text
              },
              element username {
                  attribute type { "regular" | "admin" },
                  text
              }
          }
    `;

    const expectedSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      definitions: {
        terminals: {
          EMAIL: {
            type: "string",
            pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
            description: "Matches a basic email address pattern",
          },
        },
        UserProfile: {
          type: "object",
          required: ["type", "style"],
          properties: {
            type: { const: "profile" },
            marker: { enum: ["user"] },
            contents: {
              type: "array",
              items: {
                anyOf: [{ $ref: "#/definitions/email" }, { $ref: "#/definitions/username" }],
              },
            },
          },
        },
      },
      anyOf: [{ $ref: "#/definitions/UserProfile" }],
    };

    expect(convertRNCtoJSONSchema(rncContent)).toEqual(expectedSchema);
  });
});
