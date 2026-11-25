export function hermite(keys,t){
 if(!keys?.length)return 1;if(t<=keys[0].time)return keys[0].value;
 for(let i=1;i<keys.length;i++){const b=keys[i],a=keys[i-1];if(t>b.time)continue;const d=b.time-a.time;if(d<=0)return b.value;const u=(t-a.time)/d;return (2*u*u*u-3*u*u+1)*a.value+(u*u*u-2*u*u+u)*d*a.outSlope+(-2*u*u*u+3*u*u)*b.value+(u*u*u-u*u)*d*b.inSlope;}
 return keys.at(-1).value;
}

export function makeRandom(seed=0x44a801){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
