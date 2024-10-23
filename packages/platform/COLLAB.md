# Real-Time Collaborative Editing

> [!NOTE]
> Currently, it's only working for rich-text (not structured Scripture) documents.

## Manual Testing

### Get Started

1. If you haven't already, follow the [Developer Quick Start](/README.md#developer-quick-start) steps except the last step.

2. From the repo root in **one** terminal, run:

   ```sh
   nx dev:collab platform
   ```

   This runs up the dev environment and concurrently runs the collaboration server.

3. Open the first editor in a browser at http://localhost:5173/.

4. From the repo root in a **second** terminal, run:

   ```sh
   nx dev platform
   ```

   This runs up the dev environment without the collaboration server since you only need one running.

5. Open the second editor in a browser at http://localhost:5174/.

> [!WARNING]
> Running `tsc watch` for the Collab Host (npm script `collab:host:watch`) doesn't quit cleanly using _ctrl + c_ on Windows. Also using `nx collab:host platform` doesn't quit cleanly on Windows. (So probably need to revise the above instructions to run `collab:persist` and `collab:host` in their own terminal.)

### Features

- Use the **Disconnect** button to simulate being offline.
- The document is persisted to a file-based DB (in the `./yjs-wss-db/` folder). So this means you can shutdown an editor and when you reopen it, it will load the document again.
- You can see user presence (name and cursor).

> [!NOTE]
> You can switch from collaborative editing back to normal editing by setting `projectId` to an empty string or undefined in `App.tsx`.
