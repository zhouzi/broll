import * as resvg from "@resvg/resvg-wasm";

const wasmPath = new URL("@resvg/resvg-wasm/index_bg.wasm", import.meta.url);
void fetch(wasmPath).then((res) => resvg.initWasm(res));

// TODO: this type is duplicated from ./render-png.tsx
//       but we need to be careful with the imports to not bundle this worker
interface Message {
  _id: number;
  svg: string;
  width: number;
}

self.addEventListener("message", (event: MessageEvent<Message>) => {
  const { _id, svg, width } = event.data;

  const renderer = new resvg.Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width,
    },
  });
  const image = renderer.render();
  const pngBuffer = image.asPng();
  const blob = new Blob([pngBuffer], { type: "image/png" });

  self.postMessage({ _id, blob });
});
