(() => {
  "use strict";
  const nf = new Intl.NumberFormat("zh-TW");
  const fmt = v => v == null ? "—" : nf.format(v);
  const loadImage = src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("V8 表格材質載入失敗"));
    img.src = src;
  });
  const roundRect = (ctx,x,y,w,h,r) => {
    const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
  };
  const drawText = (ctx,text,x,y,o={}) => {
    ctx.save();ctx.font=o.font||'600 24px -apple-system,"PingFang TC",sans-serif';ctx.fillStyle=o.color||"#222735";ctx.textAlign=o.align||"left";ctx.textBaseline="middle";ctx.fillText(String(text),x,y);ctx.restore();
  };
  function derive(levels){
    return levels.map((level,index)=>{
      const next=levels[index+1]||null,prev=levels[index-1]||null;
      const coin=Number(level.upgradeCostAmount0||0)*Number(level.slotCount||0),unlock=[];
      if(index===0){unlock.push(`${level.slotCount} 個欄位`);unlock.push(`${level.presetCount} 組預設`)}
      else{
        if(Number(level.slotCount)>Number(prev.slotCount)) unlock.push(`第 ${level.slotCount} 個欄位`);
        if(Number(level.presetCount)>Number(prev.presetCount)) unlock.push(`第 ${level.presetCount} 組預設`);
      }
      if(!next) unlock.push("滿等");
      return {...level,expToNext:next?Number(next.needPoint)-Number(level.needPoint):null,expPerPray:Number(level.gainPoint||0)+Number(level.gainPointPerCoin||0)*coin,unlockText:unlock.length?(index===0?`初始：${unlock.join("・")}`:`開放 ${unlock.join("・")}`):"—",hasUnlock:unlock.length>0};
    });
  }
  async function buildCanvas(data,rows){
    const width=1440,margin=70,headerH=205,colHeadH=64,rowH=66,footerH=105;
    const height=margin+headerH+colHeadH+rows.length*rowH+footerH+margin;
    const c=document.createElement("canvas");c.width=width;c.height=height;const ctx=c.getContext("2d");
    const bg=ctx.createLinearGradient(0,0,width,height);bg.addColorStop(0,"#edf7fb");bg.addColorStop(.5,"#eef3f9");bg.addColorStop(1,"#f8eef5");ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);

    ctx.save();roundRect(ctx,margin,margin,width-margin*2,headerH,34);ctx.fillStyle="rgba(255,255,255,.30)";ctx.fill();ctx.strokeStyle="rgba(255,255,255,.88)";ctx.lineWidth=2;ctx.stroke();ctx.restore();
    drawText(ctx,"楓之谷M 也許有用的工具",margin+38,margin+40,{font:'700 22px -apple-system,"PingFang TC",sans-serif',color:"#697080"});
    drawText(ctx,data.title||"光之聖所祈禱經驗表",margin+38,margin+96,{font:'800 48px -apple-system,"PingFang TC",sans-serif',color:"#202532"});
    drawText(ctx,`Lv.1～Lv.${rows.at(-1)?.level||15} · 升級 EXP / 累積 EXP / 每次祈禱 EXP / 解鎖內容`,margin+38,margin+145,{font:'600 21px -apple-system,"PingFang TC",sans-serif',color:"#727887"});

    const tableX=margin,tableW=width-margin*2,tableY=margin+headerH+20,tableH=colHeadH+rows.length*rowH;
    ctx.save();roundRect(ctx,tableX,tableY,tableW,tableH,30);ctx.clip();
    ctx.fillStyle="rgba(255,255,255,.22)";ctx.fillRect(tableX,tableY,tableW,tableH);
    try{const optical=await loadImage(`table-glass-v8.svg?v=20260927-v8`);ctx.globalAlpha=.82;ctx.drawImage(optical,tableX,tableY,tableW,tableH);ctx.globalAlpha=1}catch(_){ }
    const spec=ctx.createLinearGradient(tableX,tableY,tableX+tableW,tableY+tableH*.38);spec.addColorStop(0,"rgba(255,255,255,.56)");spec.addColorStop(.18,"rgba(255,255,255,.12)");spec.addColorStop(.52,"rgba(255,255,255,0)");spec.addColorStop(1,"rgba(255,255,255,.10)");ctx.fillStyle=spec;ctx.fillRect(tableX,tableY,tableW,tableH);
    ctx.restore();
    ctx.save();roundRect(ctx,tableX,tableY,tableW,tableH,30);ctx.strokeStyle="rgba(255,255,255,.90)";ctx.lineWidth=2;ctx.stroke();ctx.restore();

    const cols=[{t:"等級",w:120},{t:"升下一級 EXP",w:260},{t:"累積 EXP",w:240},{t:"每次祈禱 EXP",w:240},{t:"解鎖內容",w:tableW-860}];
    let cx=tableX,y=tableY;
    cols.forEach(col=>{drawText(ctx,col.t,cx+col.w/2,y+colHeadH/2,{font:'800 17px -apple-system,"PingFang TC",sans-serif',color:"#303744",align:"center"});cx+=col.w});
    ctx.strokeStyle="rgba(75,90,120,.11)";ctx.beginPath();ctx.moveTo(tableX+16,y+colHeadH);ctx.lineTo(tableX+tableW-16,y+colHeadH);ctx.stroke();
    y+=colHeadH;
    rows.forEach((r,idx)=>{
      if(idx){ctx.strokeStyle="rgba(75,90,120,.10)";ctx.beginPath();ctx.moveTo(tableX+16,y);ctx.lineTo(tableX+tableW-16,y);ctx.stroke()}
      const vals=[`Lv.${r.level}`,fmt(r.expToNext),fmt(r.needPoint),fmt(r.expPerPray),r.unlockText];cx=tableX;
      cols.forEach((col,i)=>{
        if(i===4&&r.hasUnlock){const dotX=cx+20,dotY=y+rowH/2;const g=ctx.createRadialGradient(dotX,dotY,0,dotX,dotY,18);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.20,"rgba(111,230,255,.92)");g.addColorStop(.53,"rgba(144,133,255,.48)");g.addColorStop(1,"rgba(255,139,217,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(dotX,dotY,18,0,Math.PI*2);ctx.fill();ctx.fillStyle="#8d89ff";ctx.beginPath();ctx.arc(dotX,dotY,4,0,Math.PI*2);ctx.fill()}
        drawText(ctx,vals[i],cx+col.w/2,y+rowH/2,{font:`${i===0?750:i===4?560:620} ${i===4?14:18}px -apple-system,"PingFang TC",sans-serif`,color:i===4?"#697180":i===0?"#252a36":"#303642",align:"center"});cx+=col.w;
      });
      y+=rowH;
    });
    drawText(ctx,`資料來源：${data.source?.path||"light-sanctum-pray/runtime/sanctuary-gameplay-data.js"}`,margin,y+48,{font:'600 15px -apple-system,"PingFang TC",sans-serif',color:"#7a8090"});
    drawText(ctx,`資料版本：${data.updatedAt||""} · 由「也許有用的資訊」產生`,width-margin,y+48,{font:'600 15px -apple-system,"PingFang TC",sans-serif',color:"#7a8090",align:"right"});
    return c;
  }
  const toBlob=c=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error("無法建立 PNG")),"image/png"));
  async function exportV8(button){
    button.disabled=true;
    try{
      const r=await fetch("data/light-sanctum-pray-exp.json",{cache:"no-store"});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);const data=await r.json(),rows=derive(data.levels||[]),canvas=await buildCanvas(data,rows),blob=await toBlob(canvas),name=`光之聖所祈禱經驗表_${data.updatedAt||"MapleStoryM"}.png`,file=new File([blob],name,{type:"image/png"});
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"光之聖所祈禱經驗表"});return}
      const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);
    } finally { button.disabled=false; }
  }
  document.addEventListener("click",e=>{
    const button=e.target.closest?.("#save-table-image");if(!button)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();exportV8(button).catch(err=>console.error("V8 export failed",err));
  },true);
})();
