'use client';
import {useEffect,useRef} from 'react';
import './tw.css';
/* After tw.css, deliberately: chrome.css undoes the fixed-pill `#change` that tw.css sets for
   the chrome-less embed, and relies on source order to do it. See the note in that file. */
import './chrome.css';
import type {WorldOpts} from './engine';

/**
 * Trinity study-abroad world: particle intro → globe → pick country → flight → universities → student journey.
 * Client-only (WebGL). Drop it inside any page; it renders as a normal block-level section stack.
 */
export default function TrinityWorld(props:WorldOpts){
  const ref=useRef<HTMLDivElement>(null);
  const p=useRef(props);p.current=props;
  useEffect(()=>{
    let destroy:(()=>void)|undefined,dead=false;
    import('./engine').then(m=>{
      if(dead||!ref.current)return;
      const o={...p.current,onLead:p.current.onLead&&((x:any)=>p.current.onLead!(x)),onDark:p.current.onDark&&((d:boolean)=>p.current.onDark!(d))};
      destroy=m.mountWorld(ref.current,o);
    });
    return()=>{dead=true;destroy?.()};
  },[]);
  /* `tw-chrome` says the drop-in is rendering its own nav and footer, so the site's header
     is not above it and the clearance rules in tw-site.css must stand down. It is set here,
     during render, rather than by the engine, because those rules apply from the server HTML
     and the engine does not load until after hydration. */
  return <div ref={ref} className={props.chrome?'tw tw-chrome':'tw'} suppressHydrationWarning />;
}
