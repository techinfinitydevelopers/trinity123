/* TISA, the study-abroad assistant: the illustrated character (public/tw/tisa.webp, cropped to
   head and shoulders on a soft blue backdrop). Used as the chat launcher and the chat header
   avatar. The file name is versioned in the query string so a replaced image is never served
   from a browser cache. */
export default function AgentAvatar() {
  return (
    <span className="tc-av" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/tw/tisa.webp?v=1" alt="" width={128} height={128} decoding="async" draggable={false} />
    </span>
  );
}
