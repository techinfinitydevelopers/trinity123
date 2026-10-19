/* Face of the support assistant, used as the chat launcher and the chat header avatar. A real
   photograph reads as a person to talk to; the circle crop and ring come from chat.css `.tc-av`. */
export default function AgentAvatar() {
  return (
    <span className="tc-av" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- a 200px avatar, no optimisation needed */}
      <img src="/assets/img/chat/agent.jpg" alt="" width={200} height={200} draggable={false} />
    </span>
  );
}
