// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function devLog(...args: any[]) {
  if (import.meta.env.MODE === "development") {
    console.log(...args);
  }
}
