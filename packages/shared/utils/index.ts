export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  delay: number,
) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};
