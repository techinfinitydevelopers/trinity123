'use client';
import {useEffect,useRef} from 'react';
import './tw.css';
import type {WorldOpts} from './engine';

/**
 * Trinity study-abroad world: particle intro → globe → pick country → flight → universities → student journey.
 * Client-only (WebGL). Drop it inside any page; it renders as a normal block-level section stack.
 */

/* The engine survives navigation.
 *
 * The home page is a client route like any other: going to About unmounts this component and
 * coming back mounts a new one. Rebuilt from scratch that cost a new WebGL context, the four
 * globe textures and the aircraft decoded again, and the entrance replayed — measured at 3.5s
 * before the canvas even reappeared.
 *
 * So the engine does not live in a React-owned node. React renders a host, and the engine gets
 * a div of its own that this module keeps a reference to. On unmount the div is detached and
 * the engine suspended; on the next mount the same div is put back and resumed. React never
 * sees the inside of it, which is also why the engine can keep its closure over `root`.
 *
 * Module scope is per document, and only one globe can be on screen, so a single slot is right.
 */
/* `mountWorld` returns its destroy function with the lifecycle hooks hung off it. */
type Api = { (): void; suspend?: () => void; resume?: () => void; isSuspended?: () => boolean };
type Live = { el: HTMLDivElement; api: Api; key: string };
let live: Live | null = null;
/* A build in flight. React runs the effect twice in development, and the second run must not
   start a parallel engine — but it must not simply stand down either: by then the first run's
   cleanup has already fired, so whatever that run builds gets parked and nothing is left on
   screen. The second run waits on the same promise and adopts the result. */
let pending: { key: string; promise: Promise<Live> } | null = null;

/* What makes a cached engine stale. Anything the engine reads once at construction belongs
 * here: the asset base, the dashboard's image overrides, and the content the host publishes on
 * `globalThis.__TW_CONTENT__` before this mounts. If the owner edits any of it, the cached
 * instance is wrong and is thrown away rather than resumed. */
const cacheKey=(p:WorldOpts)=>{
  let content='';
  try{content=JSON.stringify((globalThis as any).__TW_CONTENT__??null)}catch{content='?'}
  return JSON.stringify({a:p.assetBase??'/tw',i:p.images??null,c:content.length+':'+content.slice(0,200)});
};

export default function TrinityWorld(props:WorldOpts){
  const host=useRef<HTMLDivElement>(null);
  const p=useRef(props);p.current=props;
  useEffect(()=>{
    const h=host.current;if(!h)return;
    const key=cacheKey(p.current);
    let gone=false;
    /* The instance this run owns. `park()` has to act on it and not on the module slot: an
       earlier version suspended whichever instance happened to be in `live` at the time, which
       under React's development double-invoke meant one run parked the other run's engine and
       left its own element in the document — measured, two canvases after a round trip. */
    let mine:Live|null=null;
    const park=()=>{if(mine){mine.api.suspend?.();mine.el.remove()}};

    /* A cached engine that still matches: element back, engine woken. Synchronous — the globe
       is on screen in the same frame, with no import, no rebuild and no entrance. */
    if(live&&live.key===key&&live.api.resume){
      const cached=live;
      mine=cached;
      h.appendChild(cached.el);
      cached.api.resume!();
      return()=>{gone=true;park()};
    }

    /* Someone is already building exactly this one. Wait for it and take it over. */
    if(pending&&pending.key===key){
      pending.promise.then(inst=>{
        if(gone)return;
        mine=inst;
        if(!inst.el.isConnected)h.appendChild(inst.el);
        inst.api.resume?.();
      }).catch(()=>{});
      return()=>{gone=true;park()};
    }

    /* Built against different content, so it cannot be reused. Destroyed rather than left
       holding a WebGL context nothing will ever show again. */
    if(live){try{live.api()}catch{} live.el.remove();live=null}

    const opts=()=>({...p.current,
      onLead:p.current.onLead&&((x:any)=>p.current.onLead!(x)),
      onDark:p.current.onDark&&((d:boolean)=>p.current.onDark!(d)),
      onPick:p.current.onPick&&((k:string)=>p.current.onPick!(k)),
      onReady:p.current.onReady&&(()=>p.current.onReady!())});

    const el=document.createElement('div');
    h.appendChild(el);
    const build=import('./engine').then(m=>{
      /* Recorded whether or not we are still on the page. The cleanup routinely runs before
         this resolves, and an earlier version bailed out here — so the instance was never
         recorded and every return rebuilt from scratch. Build it, record it, then park it if
         we have already left. */
      const inst:Live={el,api:m.mountWorld(el,opts()) as Api,key};
      mine=inst;live=inst;pending=null;
      if(gone)park();
      return inst;
    });
    build.catch(()=>{pending=null;el.remove()});
    pending={key,promise:build};

    return()=>{gone=true;park()};
  },[]);

  /* `display:contents` so the host adds no box of its own — the engine's div is the `.tw` root
     and must lay out exactly where this component sits. */
  /* `tw-host` is in the server HTML; `.tw` is not any more, because the engine creates its own
     div on the client. tw-chrome.css keys the home-page chrome off this marker, so the top bar
     is hidden and the pill is dark from the first paint rather than after hydration.
     `display:contents` keeps the element out of layout but it still matches `:has()`. */
  return <div ref={host} className="tw-host" style={{display:'contents'}} suppressHydrationWarning />;
}
