import { useRef } from "react";

//WIP
export function UsfmForm({ onLoad }: { onLoad: (usfm: string) => void }) {
  const usfmRef = useRef<HTMLInputElement>(null);
  const onSubmit = async (usfmUrl: string | undefined) => {
    if (!usfmUrl) return;

    const usfm = await fetch(usfmUrl);
    const usfmContent = await usfm.text();
    onLoad(usfmContent);
  };
  return (
    <>
      <input type="text" id="usfm-url" ref={usfmRef} />
      <button onClick={() => onSubmit(usfmRef?.current?.value)}>load</button>
    </>
  );
}
