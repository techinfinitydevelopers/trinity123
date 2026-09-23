import { FLAG, Stars } from "./ui";
import type { Chip } from "@/lib/blocks";

/**
 * Rotating country-flag orbit with floating stat chips, originally the home hero's right-side
 * visual. Pulled out of Hero.tsx per the 2026-09 redesign (replaced there by a student photo +
 * honeycomb stats) but kept intact here for reuse elsewhere with a different flag set.
 */
export function OrbitFlags({
  flags = ["us", "gb", "ca", "au", "de", "ie"],
  centerImg = "/assets/img/home/home-page.png",
  centerLabel = "Think Global",
  chipA = { icon: "fas fa-university", strong: "1100+", small: "Partner Universities" },
  chipB = { icon: "fas fa-passport", strong: "Visa Success", small: "End-to-end support" },
  chipCText = "Trusted by students",
}: {
  flags?: string[];
  centerImg?: string;
  centerLabel?: string;
  chipA?: Chip;
  chipB?: Chip;
  chipCText?: string;
}) {
  const n = flags.length;
  return (
    <div className="orbit" aria-hidden="true">
      <span className="orbit__ring orbit__ring--dash" /><span className="orbit__ring orbit__ring--inner" /><span className="orbit__ring orbit__ring--sweep" />
      <div className="orbit__flags">
        {flags.map((f, i) => {
          const deg = Math.round((360 / n) * i);
          return (
            <span key={f} className="orbit__slot" style={{ transform: `rotate(${deg}deg)` }}>
              <span className="orbit__flag" style={{ transform: `translate(-50%,-50%) rotate(${-deg}deg)` }}><img src={FLAG(f)} alt="" /></span>
            </span>
          );
        })}
      </div>
      <div className="orbit__center"><img src={centerImg} alt="" /><span>{centerLabel}</span></div>
      <div className="chip chip--a"><span className="chip__ico"><i className={chipA.icon} /></span><span><strong>{chipA.strong}</strong><small>{chipA.small}</small></span></div>
      <div className="chip chip--b chip--gold"><i className={chipB.icon} /><span><strong>{chipB.strong}</strong><small>{chipB.small}</small></span></div>
      <div className="chip chip--c chip--glass">
        <span className="avatars"><img src="/assets/img/home/client-1.png" alt="" /><img src="/assets/img/home/client-2.png" alt="" /></span>
        <span><Stars /><small>{chipCText}</small></span>
      </div>
    </div>
  );
}
