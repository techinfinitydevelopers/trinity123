/* Animated support-agent avatar (headset, blinking, head bob, occasional wave) used as the chat
   launcher and the chat header avatar. Pure SVG + CSS (see chat.css `.tc-av*`) — no image files,
   so it scales crisply and follows the Theme editor's colours. */
export default function AgentAvatar() {
  return (
    <span className="tc-av" aria-hidden="true">
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <rect width="64" height="64" className="tc-av__bg" />
        {/* waving arm (behind the body so it reads as raised from the shoulder) */}
        <g className="tc-av__hand">
          <path d="M47 66 C50 58 52 52 53 47" className="tc-av__sleeve" />
          <circle cx="53.4" cy="45.2" r="3.7" className="tc-av__skin" />
        </g>
        {/* shoulders / blazer */}
        <path d="M9 66c2-13 12-17 23-17s21 4 23 17z" className="tc-av__blazer" />
        <path d="M27 49.5l5 7 5-7" className="tc-av__collar" />
        <g className="tc-av__head">
          <rect x="28.2" y="39" width="7.6" height="11" rx="3" className="tc-av__skin" />
          {/* hair behind the face */}
          <path d="M17 31c-1.5-12 6-19 15-19s16.5 7 15 19c-.6 7-2.4 12-5 15 .4-6-2-10-10-10s-10.4 4-10 10c-2.6-3-4.4-8-5-15z" className="tc-av__hair" />
          <ellipse cx="32" cy="30.5" rx="11.6" ry="13.2" className="tc-av__skin" />
          {/* fringe */}
          <path d="M20.2 28.5C20.6 19 26 15.5 32.4 15.5c6 0 11 3.6 11.4 13-2.8-4.6-7.4-6.6-12-6.6-4.8 0-8.8 2-11.6 6.6z" className="tc-av__hair" />
          <ellipse cx="27.4" cy="31.6" rx="1.7" ry="2.1" className="tc-av__eye" />
          <ellipse cx="36.6" cy="31.6" rx="1.7" ry="2.1" className="tc-av__eye" />
          <circle cx="24.3" cy="36" r="2.3" className="tc-av__cheek" />
          <circle cx="39.7" cy="36" r="2.3" className="tc-av__cheek" />
          <path d="M28.2 37.3q3.8 3.6 7.6 0" className="tc-av__smile" />
          {/* headset */}
          <path d="M18.6 30.5a13.4 13.4 0 0 1 26.8 0" className="tc-av__band" />
          <rect x="16.2" y="29" width="4.4" height="8.6" rx="2.2" className="tc-av__cup" />
          <rect x="43.4" y="29" width="4.4" height="8.6" rx="2.2" className="tc-av__cup" />
          <path d="M19.2 37.2q0 6.2 8.2 6.2" className="tc-av__mic" />
          <circle cx="28.2" cy="43.4" r="1.7" className="tc-av__cup" />
        </g>
      </svg>
    </span>
  );
}
