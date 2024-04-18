import * as resvg from "@resvg/resvg-wasm";

const wasmPath = new URL("@resvg/resvg-wasm/index_bg.wasm", import.meta.url);
fetch(wasmPath).then((res) => resvg.initWasm(res));

self.onmessage = (e) => {
  const { svg, width, _id } = e.data;

  const renderer = new resvg.Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width,
    },
  });
  const image = renderer.render();
  const pngBuffer = image.asPng();
  const blob = new Blob([pngBuffer], { type: "image/png" });
  const url = URL.createObjectURL(blob);

  self.postMessage({ _id, blob, url });
};
