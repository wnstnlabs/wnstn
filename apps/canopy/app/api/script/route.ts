import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Serves the bundled tracker at /p.js (and /api/script) for the snippet users paste.
// In production, Next.js rewrites /p.js -> /api/script via next.config.mjs.
// If the dist hasn't been built, we return a tiny inline fallback so local dev still works.

export const runtime = 'nodejs';

export async function GET() {
  // Try to serve the prebuilt minified script from @wnstn/canopy dist
  try {
    // workspace dist — pnpm builds packages/canopy -> dist/script.js
    const distPath = path.join(process.cwd(), '..', '..', 'packages', 'canopy', 'dist', 'script.js');
    const content = await readFile(distPath, 'utf8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'X-Canopy-Source': 'dist',
      },
    });
  } catch {
    // Fallback: minimal inline (ensures /p.js never 404s before pnpm build)
    const fallback = `!function(){var s=document.currentScript;var id=(s&&s.getAttribute("data-site-id"))||"";if(!id)return;var ep=(s&&s.getAttribute("data-endpoint"))||"/api/canopy/event";function send(n,p){var u=location.href,r=document.referrer,body=JSON.stringify({s:id,n:n,u:u,r:r,p:location.pathname+location.search,t:document.title,w:innerWidth,props:p,sid:Math.random().toString(36).slice(2),v:"fallback"});try{if(navigator.sendBeacon){var b=new Blob([body],{type:"application/json"});if(navigator.sendBeacon(ep,b))return}fetch(ep,{method:"POST",body:body,headers:{"Content-Type":"application/json"},keepalive:true,credentials:"omit"}).catch(()=>{})}catch{}}if(!window.__canopy_init){window.__canopy_init=!0;window.canopy=function(n,p){send(n,p)};window.canopy.track=send;var e=function(){send("pageview")};document.readyState==="complete"?e():window.addEventListener("load",e,{once:!0});setTimeout(function(){if(document.readyState!=="complete")send("pageview")},300)};}();`;
    return new NextResponse(fallback, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
        'X-Canopy-Source': 'fallback',
      },
    });
  }
}
