'use client';
import {useEffect,useRef} from 'react';
import './tw.css';
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
  return <div ref={ref} className="tw" suppressHydrationWarning />;
}
