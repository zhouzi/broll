"use client";

import { useEffect, useRef } from "react";

export interface Fonts {
  robotoRegular: ArrayBuffer;
  robotoMedium: ArrayBuffer;
}

export function useFontsRef() {
  const fontsRef = useRef<Fonts | undefined>(undefined);

  useEffect(() => {
    const abortContoller = new AbortController();

    Promise.all([
      fetch("/fonts/Roboto-Regular.ttf", {
        signal: abortContoller.signal,
      }).then((res) => res.arrayBuffer()),
      fetch("/fonts/Roboto-Medium.ttf", { signal: abortContoller.signal }).then(
        (res) => res.arrayBuffer()
      ),
    ]).then(([robotoRegular, robotoMedium]) => {
      if (abortContoller.signal.aborted) {
        return;
      }

      fontsRef.current = { robotoRegular, robotoMedium };
    });

    return () => abortContoller.abort();
  }, []);

  return fontsRef;
}
