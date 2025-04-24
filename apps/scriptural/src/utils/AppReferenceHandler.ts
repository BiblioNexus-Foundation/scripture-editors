import {
  ScriptureReferenceHandler,
  ReferenceChangeSource,
  ReferenceChangeEvent,
} from "@scriptural/react";
import { ScriptureReference } from "@scriptural/react/internal-packages/shared-react/plugins/ScriptureReferencePlugin";

export class AppReferenceHandler implements ScriptureReferenceHandler {
  private reference: ScriptureReference | null;
  private subscribers: ((event: ReferenceChangeEvent) => void)[] = [];
  private updateInProgress = false;
  private source: string = "app";

  constructor(initialReference: ScriptureReference | null) {
    this.reference = initialReference;
  }

  getReference(): ScriptureReference | null {
    return this.reference;
  }

  setReference(
    ref: ScriptureReference | null,
    source: ReferenceChangeSource = "user_navigation",
    metadata?: Record<string, unknown>,
  ): void {
    // Skip if reference hasn't changed to prevent loops
    if (this.areReferencesEqual(this.reference, ref)) {
      return;
    }

    // Update reference
    this.reference = ref;

    // Prevent recursive updates
    if (!this.updateInProgress) {
      this.updateInProgress = true;
      try {
        // Can add any app-specific logic here to sync with other systems

        // Notify all subscribers
        this.notifySubscribers({
          reference: ref,
          source: source,
          metadata: {
            ...metadata,
            origin: this.source,
          },
        });
      } finally {
        this.updateInProgress = false;
      }
    }
  }

  subscribe(callback: (event: ReferenceChangeEvent) => void): () => void {
    this.subscribers.push(callback);

    // Immediately notify with current value
    callback({
      reference: this.reference,
      source: "initial_load",
      metadata: {
        origin: this.source,
      },
    });

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  setSource(source: string): void {
    this.source = source;
  }

  private notifySubscribers(event: ReferenceChangeEvent): void {
    this.subscribers.forEach((callback) => callback(event));
  }

  private areReferencesEqual(a: ScriptureReference | null, b: ScriptureReference | null): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    return a.book === b.book && a.chapter === b.chapter && a.verse === b.verse;
  }
}
