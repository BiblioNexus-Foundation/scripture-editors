# Real-Time Collaborative Editing

> [!NOTE]
> Currently, it's only working for rich-text (not structured Scripture) documents.

## Manual Testing

### Get Started

1. If you haven't already, follow the [Developer Quick Start](/README.md#developer-quick-start) steps except the last step.

2. From the `packages\platform` folder in **one** terminal, run:

   ```sh
   pnpm collab:persist
   ```

   This runs up the collaboration server.

3. From the repo root in a **second** terminal, run:

   ```sh
   nx dev platform
   ```

   This runs up the dev environment.

4. Open the first editor in a browser at http://localhost:5173/.

5. From the repo root in a **third** terminal, run:

   ```sh
   nx dev platform
   ```

   This runs up another dev environment.

6. Open the second editor in a browser at http://localhost:5174/.

> [!WARNING]
> Running `tsc watch` for the Collab Host (npm script `collab:host:watch`) doesn't quit cleanly using _ctrl + c_ on Windows. Also using `nx collab:host platform` doesn't quit cleanly on Windows. (So probably need to revise the above instructions to run `collab:host` in its own terminal from the `packages\platform` folder.)

If you want to pre-populate the YJS server with some Scripture data, shutdown the 2 frontends and in the `packages\platform` folder in a fourth terminal run:

```sh
pnpm collab:host
```

Close the host with _ctrl + c_ and then run up the frontends again.

### Features

- Use the **Disconnect** button to simulate being offline.
- The document is persisted to a file-based DB (in the `./yjs-wss-db/` folder). So this means you can shutdown an editor and when you reopen it, it will load the document again.
- You can see user presence (name and cursor).

> [!NOTE]
> You can switch from collaborative editing back to normal editing by setting `projectId` to an empty string or undefined in `App.tsx`.
