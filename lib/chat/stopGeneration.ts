let controller: AbortController | null = null;

export function setController(c: AbortController) {
  controller = c;
}

export function stopGeneration() {
  controller?.abort();
}
