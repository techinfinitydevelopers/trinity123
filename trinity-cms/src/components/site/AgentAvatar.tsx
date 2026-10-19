/* Support-assistant avatar used as the chat launcher and the chat header avatar. A vector
   illustration (gradient backdrop, shaded skin, side-swept hair, headset) — crisp at any size and
   it follows the Theme editor's colours. Blink and head bob live in chat.css `.tc-av*`. */
export default function AgentAvatar() {
  return (
    <span className="tc-av" aria-hidden="true">
      <svg viewBox="10 6 44 44" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <defs>
          <linearGradient id="tcAvBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className="tc-av__s1" />
            <stop offset="1" className="tc-av__s2" />
          </linearGradient>
          <linearGradient id="tcAvSkin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FAD7B5" />
            <stop offset="1" stopColor="#EDB88F" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#tcAvBg)" />
        <circle cx="50" cy="12" r="14" className="tc-av__glow" />
        <g className="tc-av__body">
          {/* long hair behind the shoulders */}
          <path d="M17.5 30C15.5 14 23.5 7.5 32 7.5S48.5 14 46.5 30c-.2 9 2 17 4.5 22H13c2.5-5 4.7-13 4.5-22z" className="tc-av__hair" />
          {/* blazer, shirt and neck */}
          <path d="M7 66c1-11 10-16.5 20-17.6h10C47 49.500 56 55 57 66z" className="tc-av__blazer" />
          <rect x="28" y="38" width="8" height="12" rx="3.2" fill="#E3A87F" />
          <path d="M26.500 48.200 32 57l5.500-8.800-2.400-.9L32 52l-3.100-4.700z" className="tc-av__shirt" />
          <path d="M26.500 48.200 32 57l5.500-8.800" className="tc-av__lapel" />
          <g className="tc-av__head">
            {/* face */}
            <ellipse cx="32" cy="29.500" rx="10.300" ry="11.800" fill="url(#tcAvSkin)" />
            <ellipse cx="21.800" cy="30.500" rx="1.700" ry="2.600" fill="#EDB88F" />
            <ellipse cx="42.200" cy="30.500" rx="1.700" ry="2.600" fill="#EDB88F" />
            {/* side-swept fringe */}
            <path d="M21.300 29C20.400 17.500 26 12.500 33 12.500c6.800 0 10.700 4.800 9.700 16.500-1.300-6.400-4.700-10-10.200-10.200-4.900 3-8.900 5.800-11.200 10.200z" className="tc-av__hair" />
            <path d="M25 17.500c3-2.600 8.500-3.600 13 .2" className="tc-av__shine" />
            {/* eyes and brows */}
            <g className="tc-av__eyes">
              <ellipse cx="28" cy="30.500" rx="1.350" ry="1.750" className="tc-av__eye" />
              <ellipse cx="36" cy="30.500" rx="1.350" ry="1.750" className="tc-av__eye" />
              <circle cx="28.500" cy="29.800" r=".5" fill="#fff" />
              <circle cx="36.500" cy="29.800" r=".5" fill="#fff" />
            </g>
            <path d="M25.200 27.300q2.800-1.700 5.400-.1M33.400 27.200q2.600-1.600 5.400.1" className="tc-av__brow" />
            <path d="M32 32.500c-.9 2.300-1 3 .6 3.300" className="tc-av__nose" />
            <ellipse cx="25.300" cy="35" rx="2.400" ry="1.500" className="tc-av__cheek" />
            <ellipse cx="38.700" cy="35" rx="2.400" ry="1.500" className="tc-av__cheek" />
            <path d="M28.300 37.500q3.700 3.500 7.400 0" className="tc-av__smile" />
            {/* headset */}
            <path d="M20.700 29C20.200 14.500 26.500 9 32 9s11.800 5.500 11.300 20" className="tc-av__band" />
            <rect x="18.400" y="27" width="4.200" height="8.600" rx="2.100" className="tc-av__cup" />
            <rect x="41.400" y="27" width="4.200" height="8.600" rx="2.100" className="tc-av__cup" />
            <path d="M20.500 34.500c-.2 6.500 5 8 9.200 6.200" className="tc-av__mic" />
            <circle cx="30.200" cy="40.800" r="1.700" className="tc-av__cup" />
          </g>
        </g>
      </svg>
    </span>
  );
}
