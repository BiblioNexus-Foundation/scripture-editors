# Collab Host server

## Issues

- [ ] When loading Scripture (book has no YJS doc in the DB), for WEB RUT, get the following errors:
  ```sh
  [Collab Host] docId: projectId/RUT_1-end/scripture
  Unexpected para marker 'ide'!
  [Collab Host] editor is created.
  Error: Unexpected content type
      at typeMapSet (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\AbstractType.js:861:17)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:163:9)
      at transact (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\utils\Transaction.js:425:14)
      at YXmlElement.setAttribute (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:162:7)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:69:12)
      at Map.forEach (<anonymous>)
      at YXmlElement._integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:68:60)
      at ContentType.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\ContentType.js:99:15)
      at Item.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\Item.js:519:20)
      at insertText (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YText.js:270:9)
  Error: Unexpected content type
      at typeMapSet (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\AbstractType.js:861:17)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:163:9)
      at transact (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\utils\Transaction.js:425:14)
      at YXmlElement.setAttribute (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:162:7)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:69:12)
      at Map.forEach (<anonymous>)
      at YXmlElement._integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:68:60)
      at ContentType.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\ContentType.js:99:15)
      at Item.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\Item.js:519:20)
      at insertText (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YText.js:270:9)
  Error: Unexpected content type
      at typeMapSet (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\AbstractType.js:861:17)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:163:9)
      at transact (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\utils\Transaction.js:425:14)
      at YXmlElement.setAttribute (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:162:7)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:69:12)
      at Map.forEach (<anonymous>)
      at YXmlElement._integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:68:60)
      at ContentType.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\ContentType.js:99:15)
      at Item.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\Item.js:519:20)
      at insertText (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YText.js:270:9)
  Error: Unexpected content type
      at typeMapSet (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\AbstractType.js:861:17)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:163:9)
      at transact (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\utils\Transaction.js:425:14)
      at YXmlElement.setAttribute (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:162:7)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:69:12)
      at Map.forEach (<anonymous>)
      at YXmlElement._integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:68:60)
      at ContentType.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\ContentType.js:99:15)
      at Item.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\Item.js:519:20)
      at insertText (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YText.js:270:9)
  Error: Unexpected content type
      at typeMapSet (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\AbstractType.js:861:17)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:163:9)
      at transact (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\utils\Transaction.js:425:14)
      at YXmlElement.setAttribute (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:162:7)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:69:12)
      at Map.forEach (<anonymous>)
      at YXmlElement._integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:68:60)
      at ContentType.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\ContentType.js:99:15)
      at Item.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\Item.js:519:20)
      at insertText (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YText.js:270:9)
  Error: Unexpected content type
      at typeMapSet (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\AbstractType.js:861:17)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:163:9)
      at transact (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\utils\Transaction.js:425:14)
      at YXmlElement.setAttribute (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:162:7)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:69:12)
      at Map.forEach (<anonymous>)
      at YXmlElement._integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:68:60)
      at ContentType.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\ContentType.js:99:15)
      at Item.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\Item.js:519:20)
      at insertText (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YText.js:270:9)
  Error: Unexpected content type
      at typeMapSet (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\AbstractType.js:861:17)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:163:9)
      at transact (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\utils\Transaction.js:425:14)
      at YXmlElement.setAttribute (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:162:7)
      at <anonymous> (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:69:12)
      at Map.forEach (<anonymous>)
      at YXmlElement._integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YXmlElement.js:68:60)
      at ContentType.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\ContentType.js:99:15)
      at Item.integrate (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\structs\Item.js:519:20)
      at insertText (C:\Users\Ira\src\scripture-editors\node_modules\.pnpm\yjs@13.6.19\node_modules\yjs\src\types\YText.js:270:9)
  ```
- [ ] what else?
