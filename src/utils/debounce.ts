// A simple debounce function
export function debounce<T extends (...a: unknown[]) => unknown>(fn: T, ms = 300) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t)
    t = window.setTimeout(() => fn(...args), ms)
  }
}
