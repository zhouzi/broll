export const renderPNG = (() => {
  if (typeof window === "undefined") {
    return;
  }

  const worker = new Worker(new URL("./resvg-worker.ts", import.meta.url));

  const pending = new Map();
  worker.onmessage = (e) => {
    const { _id, url } = e.data;
    const resolve = pending.get(_id);
    if (resolve) {
      resolve(url);
      pending.delete(_id);
    }
  };

  return async (msg: object) => {
    const _id = Math.random();
    worker.postMessage({
      ...msg,
      _id,
    });
    return new Promise((resolve) => {
      pending.set(_id, resolve);
    });
  };
})();
