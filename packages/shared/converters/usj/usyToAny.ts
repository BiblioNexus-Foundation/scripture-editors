// /**
//  * Universal Structured JSON (USJ) Converter
//  * A type-safe, extensible converter with streaming and worker support
//  */

// import { UsjNode } from "./core/usj";

// // ================ Type Definitions ================

// /**
//  * Core conversion types
//  */
// export type ConversionResult<T> = {
//   value: T;
//   metadata: NodeMetadata;
//   performance: PerformanceMetrics;
// };

// export interface NodeMetadata {
//   path: number[];
//   depth: number;
//   nodeType: string;
//   parent?: UsjNode;
//   siblings: {
//     previous?: UsjNode | string;
//     next?: UsjNode | string;
//   };
//   index: number;
//   isFirstChild: boolean;
//   isLastChild: boolean;
// }

// export interface WorkspaceState {
//   [key: string]: unknown;
// }

// export interface ConversionOptions {
//   preserveWhitespace?: boolean;
//   skipEmpty?: boolean;
//   batchSize?: number;
//   useWorkers?: boolean;
//   maxConcurrency?: number;
//   plugins?: ConverterPlugin<any>[];
//   customOptions?: Record<string, unknown>;
// }

// /**
//  * Context system
//  */
// export interface NodeContext {
//   readonly node: UsjNode | string;
//   readonly metadata: NodeMetadata;
//   readonly path: number[];

//   findAncestor(predicate: (node: UsjNode) => boolean): UsjNode | undefined;
//   findSiblings(): { previous?: UsjNode | string; next?: UsjNode | string };
//   getChildren(): (UsjNode | string)[];
// }

// export interface WorkspaceContext<T = unknown> {
//   state: WorkspaceState;
//   history: Array<{
//     action: string;
//     timestamp: number;
//     data: unknown;
//   }>;

//   setState<K extends keyof T>(key: K, value: T[K]): void;
//   getState<K extends keyof T>(key: K): T[K] | undefined;
//   watch<K extends keyof T>(key: K, callback: (newValue: T[K], oldValue: T[K]) => void): () => void;
//   transaction<R>(action: string, callback: () => R): R;
//   rollback(to: number): void;
// }

// export interface OutputContext<T> {
//   current: T;
//   parent?: OutputContext<T>;
//   root: T;

//   append(node: T): void;
//   prepend(node: T): void;
//   replace(node: T): void;
//   remove(): void;

//   beginTransaction(): void;
//   commitTransaction(): void;
//   rollbackTransaction(): void;
// }

// export interface ConversionContext<T, W = unknown> {
//   readonly node: NodeContext;
//   readonly workspace: WorkspaceContext<W>;
//   readonly output: OutputContext<T>;

//   updateNodeContext(updates: Partial<NodeMetadata>): ConversionContext<T, W>;
//   updateWorkspace<K extends keyof W>(key: K, value: W[K]): ConversionContext<T, W>;
//   updateOutput(updates: Partial<OutputContext<T>>): ConversionContext<T, W>;
// }

// /**
//  * Plugin System
//  */
// export interface ConverterPlugin<T, W = unknown> {
//   name: string;
//   version: string;

//   initialize?(converter: UsjConverter<T, W>): Promise<void>;
//   beforeConversion?(context: ConversionContext<T, W>): Promise<void>;
//   afterConversion?(context: ConversionContext<T, W>): Promise<void>;
//   beforeNodeConversion?(node: UsjNode | string, context: ConversionContext<T, W>): Promise<void>;
//   afterNodeConversion?(
//     node: UsjNode | string,
//     result: T,
//     context: ConversionContext<T, W>,
//   ): Promise<T>;

//   handleError?(error: Error, context: ConversionContext<T, W>): Promise<void>;
// }

// /**
//  * Performance Monitoring
//  */
// export interface PerformanceMetrics {
//   startTime: number;
//   endTime: number;
//   duration: number;
//   nodeCount: number;
//   nodeTypes: Map<string, number>;
//   memoryUsage: {
//     heapUsed: number;
//     heapTotal: number;
//     external: number;
//   };
//   marks: Map<string, PerformanceMark>;
//   measures: Map<string, PerformanceMeasure>;
// }

// /**
//  * Streaming Types
//  */
// export interface StreamingOptions {
//   chunkSize: number;
//   highWaterMark?: number;
//   signal?: AbortSignal;
// }

// export interface StreamingContext<T, W = unknown> extends ConversionContext<T, W> {
//   buffer: T[];
//   chunkSize: number;
//   bytesProcessed: number;

//   flush(): Promise<void>;
//   onChunk(callback: (chunk: T[]) => Promise<void>): void;
//   onComplete(callback: () => Promise<void>): void;
//   abort(reason?: string): void;
// }

// class PerformanceMonitor {
//   private metrics: PerformanceMetrics = {
//     startTime: 0,
//     endTime: 0,
//     duration: 0,
//     nodeCount: 0,
//     nodeTypes: new Map(),
//     memoryUsage: {
//       heapUsed: 0,
//       heapTotal: 0,
//       external: 0,
//     },
//     marks: new Map(),
//     measures: new Map(),
//   };

//   start(): void {
//     this.metrics.startTime = performance.now();
//   }

//   end(): void {
//     this.metrics.endTime = performance.now();
//     this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
//     this.metrics.memoryUsage = process.memoryUsage?.() || {};
//   }

//   markNode(node: UsjNode | string): void {
//     const type = typeof node === "string" ? "text" : node.type;
//     this.metrics.nodeCount++;
//     this.metrics.nodeTypes.set(type, (this.metrics.nodeTypes.get(type) || 0) + 1);
//   }

//   measureNode(node: UsjNode | string): void {
//     // Optional: Add specific node timing measurements
//   }

//   getMetrics(): PerformanceMetrics {
//     return this.metrics;
//   }
// }

// interface ConversionHelpers<T> {
//   convertChildren: (children: (UsjNode | string)[]) => Promise<T[]>;
//   convertChild: (child: UsjNode | string, index: number) => Promise<T>;
//   getMetadata: () => NodeMetadata;
//   getPath: () => number[];
//   findAncestor: (predicate: (node: UsjNode) => boolean) => UsjNode | undefined;
//   getWorkspace: () => WorkspaceContext;
//   getOutput: () => OutputContext<T>;
// }

// type ConversionMap<T> = {
//   [nodeType: string]: (
//     node: UsjNode | string,
//     context: ConversionContext<T>,
//     helpers: ConversionHelpers<T>,
//   ) => T | Promise<T>;
// };

// /**
//  * Core Implementation
//  */

// // ================ Base Converter ================

// export class UsjConverter<T, W = unknown> {
//   private plugins: ConverterPlugin<T, W>[] = [];
//   private performanceMonitor: PerformanceMonitor;
//   private nodeContextManager: NodeContextManager;
//   private workspaceManager: WorkspaceManager<W>;
//   private outputManager: OutputManager<T>;
//   private cache = new WeakMap<object, Promise<T>>();

//   constructor(
//     private readonly conversionMap: ConversionMap<T>,
//     private readonly options: ConversionOptions = {},
//   ) {
//     this.performanceMonitor = new PerformanceMonitor();
//     this.nodeContextManager = new NodeContextManager();
//     this.workspaceManager = new WorkspaceManager<W>();
//     this.outputManager = new OutputManager<T>();

//     // Initialize plugins
//     this.initializePlugins();
//   }

//   private async initializePlugins(): Promise<void> {
//     for (const plugin of this.plugins) {
//       if (plugin.initialize) {
//         await plugin.initialize(this);
//       }
//     }
//   }

//   private createInitialContext(node: UsjNode | string): ConversionContext<T, W> {
//     return {
//       node: this.nodeContextManager.createContext(node, []),
//       workspace: this.workspaceManager.createContext(),
//       output: this.outputManager.createContext(null as T),

//       updateNodeContext: (updates) => this.createInitialContext(node),
//       updateWorkspace: (key, value) => this.createInitialContext(node),
//       updateOutput: (updates) => this.createInitialContext(node),
//     };
//   }

//   async convert(node: UsjNode): Promise<ConversionResult<T>> {
//     try {
//       this.performanceMonitor.start();
//       await this.runPluginHook("beforeConversion", this.createInitialContext(node));

//       const result = await this.convertNode(node, this.createInitialContext(node));

//       await this.runPluginHook("afterConversion", this.createInitialContext(node));
//       this.performanceMonitor.end();

//       return {
//         value: result,
//         metadata: this.nodeContextManager.getMetadata(node),
//         performance: this.performanceMonitor.getMetrics(),
//       };
//     } catch (error) {
//       await this.handleError(error as Error, node);
//       throw error;
//     }
//   }

//   // Plugin System
//   use(plugin: ConverterPlugin<T, W>): this {
//     this.plugins.push(plugin);
//     return this;
//   }

//   // Streaming Support
//   createStream(options: StreamingOptions): ConversionStream<T, W> {
//     return new ConversionStream<T, W>(this, options);
//   }

//   // Worker Support
//   createWorker(): ConversionWorker<T, W> {
//     return isNode() ? new NodeConversionWorker<T, W>(this) : new WebConversionWorker<T, W>(this);
//   }

//   private async convertNode(node: UsjNode | string, context: ConversionContext<T, W>): Promise<T> {
//     // Check cache for object nodes
//     if (typeof node === "object" && this.cache.has(node)) {
//       return this.cache.get(node)!;
//     }

//     try {
//       await this.runPluginHook("beforeNodeConversion", node, context);

//       const result = await this.processNode(node, context);

//       const processedResult = await this.runPluginHook(
//         "afterNodeConversion",
//         node,
//         result,
//         context,
//       );

//       // Cache object nodes
//       if (typeof node === "object") {
//         this.cache.set(node, Promise.resolve(processedResult));
//       }

//       return processedResult;
//     } catch (error) {
//       await this.handleError(error as Error, node);
//       throw error;
//     }
//   }

//   private async processNode(node: UsjNode | string, context: ConversionContext<T, W>): Promise<T> {
//     const handler = this.getHandler(typeof node === "string" ? "text" : node.type);
//     const helpers = this.createHelpers(node, context);

//     this.performanceMonitor.markNode(node);
//     const result = await handler(node, context, helpers);
//     this.performanceMonitor.measureNode(node);

//     return result;
//   }

//   private createHelpers(
//     node: UsjNode | string,
//     context: ConversionContext<T, W>,
//   ): ConversionHelpers<T, W> {
//     return {
//       convertChildren: async (children) => {
//         const results: T[] = [];
//         for (let i = 0; i < children.length; i++) {
//           const childContext = this.createChildContext(context, i);
//           const result = await this.convertNode(children[i], childContext);
//           if (result !== null || !this.options.skipEmpty) {
//             results.push(result);
//           }
//         }
//         return results;
//       },

//       convertChild: (child, index) => {
//         const childContext = this.createChildContext(context, index);
//         return this.convertNode(child, childContext);
//       },

//       getMetadata: () => context.node.metadata,
//       getPath: () => context.node.path,

//       findAncestor: (predicate) => context.node.findAncestor(predicate),

//       getWorkspace: () => context.workspace,
//       getOutput: () => context.output,
//     };
//   }

//   private async runPluginHook<K extends keyof ConverterPlugin<T, W>>(
//     hook: K,
//     ...args: Parameters<NonNullable<ConverterPlugin<T, W>[K]>>
//   ): Promise<ReturnType<NonNullable<ConverterPlugin<T, W>[K]>>> {
//     let result = args[args.length - 1];

//     for (const plugin of this.plugins) {
//       if (plugin[hook]) {
//         result = await (plugin[hook] as Function)(...args);
//       }
//     }

//     return result;
//   }

//   private async handleError(error: Error, node: UsjNode | string): Promise<void> {
//     for (const plugin of this.plugins) {
//       if (plugin.handleError) {
//         await plugin.handleError(error, this.createInitialContext(node));
//       }
//     }
//   }

//   // ... Context creation methods and other utility methods ...
// }

// // ================ Managers ================

// class NodeContextManager {
//   createContext(node: UsjNode | string, path: number[]): NodeContext {
//     return {
//       node,
//       metadata: {
//         path,
//         depth: path.length,
//         nodeType: typeof node === "string" ? "text" : node.type,
//         relativePath: path,
//       },
//       path,
//       findAncestor: (predicate) => this.findAncestor(node, predicate),
//       findSiblings: () => this.findSiblings(node, path),
//       getChildren: () => this.getChildren(node),
//     };
//   }

//   private findAncestor(
//     node: UsjNode | string,
//     predicate: (node: UsjNode) => boolean,
//   ): UsjNode | undefined {
//     // Implementation
//     return undefined;
//   }

//   private findSiblings(
//     node: UsjNode | string,
//     path: number[],
//   ): { previous?: UsjNode | string; next?: UsjNode | string } {
//     // Implementation
//     return {};
//   }

//   private getChildren(node: UsjNode | string): (UsjNode | string)[] {
//     if (typeof node === "string") return [];
//     return node.content || [];
//   }
// }

// class WorkspaceManager<W> {
//   private state: WorkspaceState = {};
//   private history: WorkspaceContext<W>["history"] = [];
//   private watchers = new Map<keyof W, Array<(newValue: any, oldValue: any) => void>>();

//   createContext(): WorkspaceContext<W> {
//     return {
//       state: this.state,
//       history: this.history,
//       setState: <K extends keyof W>(key: K, value: W[K]) => {
//         const oldValue = this.state[key as string];
//         this.state[key as string] = value;
//         this.notifyWatchers(key, value, oldValue);
//       },
//       getState: <K extends keyof W>(key: K) => this.state[key as string] as W[K] | undefined,
//       watch: <K extends keyof W>(
//         key: K,
//         callback: (newValue: W[K], oldValue: W[K]) => void,
//       ) => {
//         const watchers = this.watchers.get(key) || [];
//         watchers.push(callback);
//         this.watchers.set(key, watchers);
//         return () => {
//           const index = watchers.indexOf(callback);
//           if (index !== -1) {
//             watchers.splice(index, 1);
//           }
//         };
//       },
//       transaction: <R>(action: string, callback: () => R) => {
//         const timestamp = Date.now();
//         const snapshot = { ...this.state };
//         try {
//           const result = callback();
//           this.history.push({ action, timestamp, data: snapshot });
//           return result;
//         } catch (error) {
//           this.state = snapshot;
//           throw error;
//         }
//       },
//       rollback: (to: number) => {
//         const index = this.history.findIndex((entry) => entry.timestamp === to);
//         if (index !== -1) {
//           const snapshot = this.history[index].data as WorkspaceState;
//           this.state = { ...snapshot };
//           this.history = this.history.slice(0, index + 1);
//         }
//       },
//     };
//   }

//   private notifyWatchers<K extends keyof W>(key: K, newValue: W[K], oldValue: W[K]): void {
//     const watchers = this.watchers.get(key) || [];
//     for (const watcher of watchers) {
//       watcher(newValue, oldValue);
//     }
//   }
// }

// class OutputManager<T> {
//   private transactionStack: T[][] = [];

//   createContext(initial: T): OutputContext<T> {
//     const context: OutputContext<T> = {
//       current: initial,
//       root: initial,
//       append: (node: T) => {
//         if (Array.isArray(context.current)) {
//           (context.current as T[]).push(node);
//         }
//       },
//       prepend: (node: T) => {
//         if (Array.isArray(context.current)) {
//           (context.current as T[]).unshift(node);
//         }
//       },
//       replace: (node: T) => {
//         context.current = node;
//       },
//       remove: () => {
//         if (context.parent) {
//           const parent = context.parent.current;
//           if (Array.isArray(parent)) {
//             const index = parent.indexOf(context.current);
//             if (index !== -1) {
//               parent.splice(index, 1);
//             }
//           }
//         }
//       },
//       beginTransaction: () => {
//         this.transactionStack.push([]);
//       },
//       commitTransaction: () => {
//         const transaction = this.transactionStack.pop();
//         if (transaction && context.parent) {
//           if (Array.isArray(context.parent.current)) {
//             (context.parent.current as T[]).push(...transaction);
//           }
//         }
//       },
//       rollbackTransaction: () => {
//         this.transactionStack.pop();
//       },
//     };
//     return context;
//   }
// }

// // ================ Streaming Support ================

// class ConversionStream<T, W> implements AsyncIterable<T[]> {
//   private buffer: T[] = [];
//   private isProcessing = false;

//   constructor(
//     private converter: UsjConverter<T, W>,
//     private options: StreamingOptions,
//   ) {}

//   // ... implementation ...
// }

// // ================ Worker Support ================

// class NodeConversionWorker<T, W> {
//   // Node.js worker implementation
// }

// class WebConversionWorker<T, W> {
//   // Web Worker implementation
// }
// // ================ Worker Implementations ================

// /**
//  * Node.js Worker Implementation
//  */
// class NodeConversionWorker<T, W> {
//   private worker: Worker;
//   private taskQueue = new Map<
//     number,
//     {
//       resolve: (value: T) => void;
//       reject: (error: Error) => void;
//     }
//   >();
//   private taskId = 0;

//   constructor(private converter: UsjConverter<T, W>) {
//     this.worker = new Worker(`
//       const { parentPort } = require('worker_threads');

//       parentPort.on('message', async ({ taskId, node, options }) => {
//         try {
//           const result = await converter.convert(node);
//           parentPort.postMessage({ taskId, result });
//         } catch (error) {
//           parentPort.postMessage({ taskId, error: error.message });
//         }
//       });
//     `);

//     this.worker.on("message", this.handleMessage.bind(this));
//   }

//   async convert(node: UsjNode): Promise<T> {
//     const taskId = this.taskId++;

//     return new Promise((resolve, reject) => {
//       this.taskQueue.set(taskId, { resolve, reject });
//       this.worker.postMessage({ taskId, node, options: this.converter.options });
//     });
//   }

//   private handleMessage({ taskId, result, error }: any) {
//     const task = this.taskQueue.get(taskId);
//     if (!task) return;

//     if (error) {
//       task.reject(new Error(error));
//     } else {
//       task.resolve(result);
//     }

//     this.taskQueue.delete(taskId);
//   }

//   terminate() {
//     this.worker.terminate();
//   }
// }

// /**
//  * Web Worker Implementation
//  */
// class WebConversionWorker<T, W> {
//   private worker: Worker;
//   private taskQueue = new Map<
//     number,
//     {
//       resolve: (value: T) => void;
//       reject: (error: Error) => void;
//     }
//   >();
//   private taskId = 0;

//   constructor(private converter: UsjConverter<T, W>) {
//     this.worker = new Worker(
//       URL.createObjectURL(
//         new Blob(
//           [
//             `
//         self.onmessage = async ({ data: { taskId, node, options } }) => {
//           try {
//             const result = await converter.convert(node);
//             self.postMessage({ taskId, result });
//           } catch (error) {
//             self.postMessage({ taskId, error: error.message });
//           }
//         };
//       `,
//           ],
//           { type: "application/javascript" },
//         ),
//       ),
//     );

//     this.worker.onmessage = this.handleMessage.bind(this);
//   }

//   // ... Similar methods to NodeConversionWorker ...
// }

// // ================ Streaming Implementation ================

// class ConversionStream<T, W> implements AsyncIterable<T[]> {
//   private buffer: T[] = [];
//   private isProcessing = false;
//   private isClosed = false;
//   private error: Error | null = null;
//   private resolveFlush: (() => void) | null = null;

//   constructor(
//     private converter: UsjConverter<T, W>,
//     private options: StreamingOptions,
//   ) {}

//   async *[Symbol.asyncIterator](): AsyncIterator<T[]> {
//     while (!this.isClosed || this.buffer.length > 0) {
//       if (this.error) throw this.error;

//       if (this.buffer.length >= this.options.chunkSize) {
//         yield this.flush();
//       } else {
//         await new Promise((resolve) => {
//           this.resolveFlush = resolve;
//         });
//       }
//     }
//   }

//   async write(node: UsjNode): Promise<void> {
//     try {
//       const result = await this.converter.convert(node);
//       this.buffer.push(result.value);

//       if (this.buffer.length >= this.options.chunkSize) {
//         this.resolveFlush?.();
//       }
//     } catch (error) {
//       this.error = error as Error;
//       this.resolveFlush?.();
//     }
//   }

//   private flush(): T[] {
//     const chunk = this.buffer.slice(0, this.options.chunkSize);
//     this.buffer = this.buffer.slice(this.options.chunkSize);
//     return chunk;
//   }

//   close(): void {
//     this.isClosed = true;
//     this.resolveFlush?.();
//   }
// }

// // ================ Plugin System Examples ================

// /**
//  * Performance Monitoring Plugin
//  */
// class PerformancePlugin<T, W> implements ConverterPlugin<T, W> {
//   name = "performance";
//   version = "1.0.0";
//   private startTime: number = 0;
//   private metrics: Map<string, number> = new Map();

//   async beforeConversion(context: ConversionContext<T, W>): Promise<void> {
//     this.startTime = performance.now();
//     this.metrics.clear();
//   }

//   async beforeNodeConversion(
//     node: UsjNode | string,
//     context: ConversionContext<T, W>,
//   ): Promise<void> {
//     const type = typeof node === "string" ? "text" : node.type;
//     this.metrics.set(type, (this.metrics.get(type) || 0) + 1);
//   }

//   async afterConversion(context: ConversionContext<T, W>): Promise<void> {
//     const duration = performance.now() - this.startTime;
//     console.log("Conversion metrics:", {
//       duration,
//       nodeTypes: Object.fromEntries(this.metrics),
//       memoryUsage: process.memoryUsage?.() || performance.memory,
//     });
//   }
// }

// /**
//  * Validation Plugin
//  */
// class ValidationPlugin<T, W> implements ConverterPlugin<T, W> {
//   name = "validation";
//   version = "1.0.0";

//   async beforeNodeConversion(
//     node: UsjNode | string,
//     context: ConversionContext<T, W>,
//   ): Promise<void> {
//     if (typeof node !== "string") {
//       this.validateNode(node);
//     }
//   }

//   private validateNode(node: UsjNode): void {
//     if (!node.type) {
//       throw new Error("Node must have a type");
//     }

//     if ("content" in node && node.content && !Array.isArray(node.content)) {
//       throw new Error("Node content must be an array");
//     }
//   }
// }

// // ================ Usage Examples ================

// // Example 1: Basic Usage
// const converter = new UsjConverter<string>({
//   // Conversion map implementation
//   paragraph: async (node, context, helpers) => {
//     const children = await helpers.convertChildren(node.content || []);
//     return `<p>${children.join("")}</p>`;
//   },
//   text: (node) => (typeof node === "string" ? node : node.value || ""),
// });

// // Example 2: With Plugins
// converter.use(new PerformancePlugin()).use(new ValidationPlugin());

// // Example 3: Streaming Usage
// async function streamExample() {
//   const stream = converter.createStream({ chunkSize: 100 });

//   // Producer
//   (async () => {
//     for (const node of largeDocument.content) {
//       await stream.write(node);
//     }
//     stream.close();
//   })();

//   // Consumer
//   for await (const chunk of stream) {
//     console.log("Processed chunk:", chunk.length);
//   }
// }

// // Example 4: Worker Usage
// async function workerExample() {
//   const worker = converter.createWorker();

//   const results = await Promise.all(largeDocument.content.map((node) => worker.convert(node)));

//   worker.terminate();
//   return results;
// }

// // Example 5: Complex Usage with Custom Workspace
// interface CustomWorkspace {
//   footnotes: Map<string, string>;
//   currentChapter: string;
// }

// const complexConverter = new UsjConverter<string, CustomWorkspace>(
//   {
//     // Conversion handlers
//   },
//   {
//     plugins: [new PerformancePlugin(), new ValidationPlugin()],
//     useWorkers: true,
//     maxConcurrency: 4,
//   },
// );

// // Initialize workspace
// complexConverter.workspace.setState("footnotes", new Map());
// complexConverter.workspace.setState("currentChapter", "1");

// // Watch for changes
// complexConverter.workspace.watch("currentChapter", (newValue, oldValue) => {
//   console.log(`Chapter changed from ${oldValue} to ${newValue}`);
// });

// // Example 6: Error Handling
// class ErrorHandlingPlugin<T, W> implements ConverterPlugin<T, W> {
//   async handleError(error: Error, context: ConversionContext<T, W>): Promise<void> {
//     console.error("Conversion error:", {
//       error: error.message,
//       node: context.node,
//       path: context.node.path,
//     });
//   }
// }

// // Add error handling
// converter.use(new ErrorHandlingPlugin());

// // Example 7: Custom Output Processing
// class OutputProcessor<T, W> implements ConverterPlugin<T, W> {
//   async afterNodeConversion(
//     node: UsjNode | string,
//     result: T,
//     context: ConversionContext<T, W>,
//   ): Promise<T> {
//     if (typeof result === "string") {
//       return result.trim() as unknown as T;
//     }
//     return result;
//   }
// }

// // Add output processing
// converter.use(new OutputProcessor());
//       memoryUsage: process.memoryUsage?.() || {},
//     });
//   }
// }

// /**
//  * Validation Plugin
//  */
// class ValidationPlugin<T, W> implements ConverterPlugin<T, W> {
//   name = "validation";
//   version = "1.0.0";

//   async beforeNodeConversion(
//     node: UsjNode | string,
//     context: ConversionContext<T, W>,
//   ): Promise<void> {
//     if (typeof node !== "string") {
//       this.validateNode(node);
//     }
//   }

//   private validateNode(node: UsjNode): void {
//     if (!node.type) {
//       throw new Error("Node must have a type");
//     }

//     if ("content" in node && node.content && !Array.isArray(node.content)) {
//       throw new Error("Node content must be an array");
//     }
//   }
// }

// // ================ Usage Examples ================

// /**
//  * Example usage:
//  *
//  * ```typescript
//  * // Basic conversion
//  * const converter = new UsjConverter<string>({
//  *   paragraph: async (node, context, helpers) => {
//  *     const children = await helpers.convertChildren(node.content || []);
//  *     return `<p>${children.join("")}</p>`;``
//  *   },
//  *   text: (node) => typeof node === "string" ? node : node.value || "",
//  * });
//  *
//  * // With plugins
//  * converter.use(new PerformancePlugin()).use(new ValidationPlugin());
//  *
//  * // Streaming example
//  * const stream = converter.createStream({ chunkSize: 100 });
//  * for await (const chunk of stream) {
//  *   console.log("Processed chunk:", chunk.length);
//  * }
//  *
//  * // Worker example
//  * const worker = converter.createWorker();
//  * const result = await worker.convert(document);
//  * worker.terminate();
//  * ```
//  */

// // Add isNode helper
// function isNode(): boolean {
//   return (
//     typeof process !== "undefined" && process.versions != null && process.versions.node != null
//   );
// }
