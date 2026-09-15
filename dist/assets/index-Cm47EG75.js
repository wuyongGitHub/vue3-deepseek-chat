import{a as ve,i as ie,j as He,k as Ue,l as Oe,n as Fe,o as pe,E as Ne,q as Pe,c as Ve,r as qe,t as We,u as Je,e as Ge}from"./element-plus-CedcyqMf.js";import{M as Q,d as le,al as Ke,ah as be,V as c,W as p,a0 as N,Z as o,L as V,a9 as I,a7 as M,r as U,k as O,w as Xe,E as Ye,at as W,a8 as xe,n as G,X as Y,aa as R,a4 as P,u as H,c_ as Ze,am as Qe,aS as et,ar as tt,c$ as nt}from"./vue--9bSsdSz.js";import{M as ot,a as at,b as st,c as it,H as oe}from"./markdown-BTIeDbe3.js";import{_ as ee,u as ye,a as rt,s as ae}from"./index-CfRU-nuW.js";import{u as lt,i as me,a as ct,b as dt,c as ut,d as ht,e as ft,f as pt,g as mt,h as gt,j as vt,k as bt,l as xt,m as yt,n as wt,o as kt,p as $t,q as _t,r as St,s as Ct,t as Tt,v as jt,w as Et,x as At,y as zt,z as Bt}from"./echarts-CCs3udbT.js";function Rt(e){return new Promise((a,s)=>{try{const l=document.createElement("textarea");l.setAttribute("readonly","readonly"),l.value=e,document.body.appendChild(l),l.select(),document.execCommand("copy")&&document.execCommand("copy"),document.body.removeChild(l),a(e)}catch(l){s(l)}})}const Lt={key:0},Mt={key:0,class:"reasoning-wrap mb-2"},It={class:"reasoning-status"},Dt={key:0,class:"thinking-dots"},Ht={key:2,class:"waiting-tip-text"},Ut=["innerHTML"],Ot=["innerHTML"],Ft=["textContent"],Nt=["textContent"],Pt=Q({__name:"Text",props:{inversion:{type:Boolean},error:{type:Boolean},text:{},reasoning:{},loading:{type:Boolean},asRawText:{type:Boolean},backend:{}},setup(e,{expose:a}){const s=e,l=U(!0);function m(){l.value=!l.value}const x=["美好的答案，值得片刻的等待。","正在为你编织灵感，请给它一点时间。","好饭不怕晚，我正在努力思考中...","正在穿越数据的星海，马上为你带回答案。","慢一点，是为了给你更准确的拥抱。","大脑正在高速运转，CPU都快冒烟啦，稍等！","正在疯狂翻书找答案，别催别催，马上就好~","正在把散落的思绪拼凑起来，请稍安勿躁。","正在努力理解你的深意，给我几秒钟冷静一下。","正在和服务器进行一场激烈的谈判...","正在深度分析您的请求，以确保回复的准确性。","正在检索海量信息，为您筛选最优解。","复杂问题需要更多思考时间，请稍候。","正在生成专业报告，质量优先，请耐心等待。","思考中...","灵感加载中...","正在生成...","稍候片刻"],D=U(x[Math.floor(Math.random()*x.length)]),F=O(()=>!s.loading||s.text?!1:s.backend==="agent"?!0:!s.reasoning),A=new ot({html:!1,linkify:!0,highlight(d,r){if(!!(r&&oe.getLanguage(r))){const y=r??"";return w(oe.highlight(d,{language:y}).value,y)}return w(oe.highlightAuto(d).value,"")}});A.use(at,{attrs:{target:"_blank",rel:"noopener"}}).use(st).use(it);const f=O(()=>{const d=["text-wrap","min-w-20px","rounded-2xl","px-4 py-2.5","text-[15px]","leading-relaxed"];return s.inversion?[...d,"bubble-user","bubble-shine",{"text-red-300":s.error}]:[...d,"bubble-ai",s.error?"bubble-error":"bubble-shine"]}),g=O(()=>{const d=s.text??"";if(!s.asRawText){const r=E(z(d));return A.render(r)}return d}),S=O(()=>{const d=s.reasoning??"";if(!s.asRawText){const r=E(z(d));return A.render(r)}return d});function w(d,r){return`<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${r}</span><span class="code-block-header__copy">复制代码</span></div><code class="hljs code-block-body ${r}">${d}</code></pre>`}function E(d){const r=/(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;return d.replace(r,(v,y,T,q)=>y||(T?`$$${T}$$`:q?`$${q}$`:v))}function z(d){let r="";for(let v=0;v<d.length;v+=1){let y=d[v];const T=d[v+1]||" ";y==="$"&&T>="0"&&T<="9"&&(y="\\$"),r+=y}return r}const L=U();a({getRenderedTextHtml:()=>g.value});function t(){L.value&&L.value.querySelectorAll(".code-block-header__copy").forEach(r=>{r.addEventListener("click",()=>{var y,T;const v=(T=(y=r.parentElement)==null?void 0:y.nextElementSibling)==null?void 0:T.textContent;v&&Rt(v).then(()=>{r.textContent="复制成功",setTimeout(()=>{r.textContent="复制代码"},1e3)})})})}function _(){L.value&&L.value.querySelectorAll(".code-block-header__copy").forEach(r=>{r.removeEventListener("click",()=>{})})}return le(()=>{t()}),Ke(()=>{t()}),be(()=>{_()}),(d,r)=>(c(),p("div",{class:N(f.value)},[o("div",{ref_key:"textRef",ref:L,class:"leading-relaxed break-words"},[e.inversion?(c(),p("div",{key:1,class:"whitespace-pre-wrap",textContent:I(g.value)},null,8,Nt)):(c(),p("div",Lt,[e.asRawText?(c(),p("div",{key:1,class:"whitespace-pre-wrap",textContent:I(g.value)},null,8,Ft)):(c(),p(V,{key:0},[e.reasoning||e.loading?(c(),p("div",Mt,[o("button",{class:"reasoning-toggle",onClick:m},[o("span",{class:N(["toggle-icon",{"is-open":l.value}])},[...r[0]||(r[0]=[o("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none"},[o("path",{d:"m9 6 6 6-6 6",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"})],-1)])],2),r[3]||(r[3]=o("span",{class:"reasoning-label"},"深度思考",-1)),o("span",It,[e.loading?(c(),p("span",Dt,[...r[1]||(r[1]=[o("i",null,null,-1),o("i",null,null,-1),o("i",null,null,-1)])])):(c(),p("svg",{key:1,class:N([{"is-open":l.value},"reasoning-chevron"]),width:"12",height:"12",viewBox:"0 0 24 24",fill:"none"},[...r[2]||(r[2]=[o("path",{d:"m6 9 6 6 6-6",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},null,-1)])],2)),F.value?(c(),p("span",Ht,I(D.value),1)):M("",!0)])]),l.value&&e.reasoning?(c(),p("div",{key:0,class:"reasoning-body markdown-body",innerHTML:S.value},null,8,Ut)):M("",!0)])):M("",!0),g.value?(c(),p("div",{key:1,class:N(["markdown-body",{"markdown-body-generate":e.loading}]),innerHTML:g.value},null,10,Ot)):M("",!0)],64))]))],512)],2))}}),Vt=ee(Pt,[["__scopeId","data-v-3edb4787"]]),se="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif";function re(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)}function we(e){try{return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}catch{return JSON.parse(JSON.stringify(e))}}function X(e,a){for(const s of Object.keys(a)){const l=a[s];l!==void 0&&(!(s in e)||e[s]===null||e[s]===void 0?e[s]=we(l):re(e[s])&&re(l)&&X(e[s],l))}return e}function ge(e,a){const s=e[a];return s?Array.isArray(s)?s:[s]:[]}function qt(e){ge(e,"xAxis").forEach(a=>{X(a,{axisLine:{show:!0,lineStyle:{color:"#E2E8F0",width:1}},axisTick:{show:!1},axisLabel:{color:"#64748B",fontSize:11,margin:10}})}),ge(e,"yAxis").forEach((a,s)=>{const l=Array.isArray(e.yAxis)&&s===1;X(a,{axisLabel:{color:"#64748B",fontSize:11},axisLine:{show:!1}}),!l&&(a.type==="value"||a.type===void 0)&&X(a,{splitLine:{show:!0,lineStyle:{color:"#EEF2F7",type:"dashed",width:1}}})})}function Wt(e){const a=e.tooltip;a&&(X(a,{backgroundColor:"rgba(255,255,255,0.96)",borderColor:"#E2E8F0",borderWidth:1,padding:[8,12],textStyle:{color:"#0F172A",fontSize:12},extraCssText:"box-shadow:0 6px 18px rgba(15,23,42,.10);border-radius:10px;"}),a.trigger==="axis"&&!a.axisPointer&&(a.axisPointer={type:"line",lineStyle:{color:"rgba(148,163,184,.45)",type:"dashed",width:1}}))}function Z(e){if(!re(e))return e;const a=we(e);return X(a,{backgroundColor:"transparent",animationDuration:500,animationEasing:"cubicOut",textStyle:{fontFamily:se,color:"#1E293B"},title:{textStyle:{fontFamily:se,fontWeight:600,color:"#0F172A"},subtextStyle:{fontFamily:se,color:"#94A3B8"}},tooltip:{backgroundColor:"rgba(255,255,255,0.96)",borderColor:"#E2E8F0",borderWidth:1,textStyle:{color:"#0F172A",fontSize:12},extraCssText:"box-shadow:0 6px 18px rgba(15,23,42,.10);border-radius:10px;"},legend:{icon:"roundRect",itemWidth:9,itemHeight:9,itemGap:14,textStyle:{color:"#64748B",fontSize:11},inactiveColor:"#CBD5E1"}}),Wt(a),qt(a),a}const Jt={key:0,class:"agent-dashboard"},Gt={key:0,class:"dashboard-title"},Kt={key:1,class:"kpi-row"},Xt={class:"kpi-label"},Yt={class:"kpi-value"},Zt={key:0,class:"kpi-unit"},Qt={class:"agent-chart-grid"},en=Q({__name:"Chart",props:{option:{}},setup(e,{expose:a}){lt([ct,dt,ut,ht,ft,pt,mt,gt,vt,bt,xt,yt,wt,kt,$t,_t,St,Ct,Tt,jt,Et,At,zt,Bt]);const s=e,l=O(()=>{var t;return((t=s.option)==null?void 0:t.layout)==="dashboard"}),m=O(()=>{var t;return((t=s.option)==null?void 0:t.charts)||[]});function x(t){return t&&typeof t=="object"&&t.option!=null&&Number(t.span)||12}const D=U(),F=U([]);let A=null,f=[];function g(t,_){F.value[t]=_}function S(t){return t==null?"—":typeof t=="number"?t.toLocaleString("zh-CN",{maximumFractionDigits:2}):String(t)}function w(){A==null||A.dispose(),A=null,f.forEach(t=>t==null?void 0:t.dispose()),f=[]}async function E(){if(await G(),w(),l.value)m.value.forEach((t,_)=>{const d=F.value[_];if(!d)return;const r=me(d),v=t&&typeof t=="object"&&t.option!=null?t.option:t;v&&r.setOption(Z(v),!0),f.push(r)});else{if(!D.value)return;A=me(D.value),A.setOption(Z(s.option),!0)}}function z(){A==null||A.resize(),f.forEach(t=>t==null?void 0:t.resize())}le(()=>{E(),window.addEventListener("resize",z)}),Xe(()=>s.option,E,{deep:!0}),Ye(()=>{window.removeEventListener("resize",z),w()});function L(){var t,_;if(l.value){const d=(((t=s.option)==null?void 0:t.kpis)||[]).map(v=>({label:String((v==null?void 0:v.label)??""),value:S(v==null?void 0:v.value),unit:v!=null&&v.unit?String(v.unit):void 0})),r=m.value.map(v=>{const y=v&&typeof v=="object"&&v.option!=null?v.option:v;return{option:y&&Z(y),span:x(v)}});return{title:(_=s.option)==null?void 0:_.title,kpis:d,charts:r}}return{charts:[{option:Z(s.option),span:12}]}}return a({getExportData:L}),(t,_)=>{var d;return l.value?(c(),p("div",Jt,[e.option.title?(c(),p("div",Gt,I(e.option.title),1)):M("",!0),(d=e.option.kpis)!=null&&d.length?(c(),p("div",Kt,[(c(!0),p(V,null,W(e.option.kpis,r=>(c(),p("div",{key:r.key,class:"kpi-card"},[o("span",Xt,I(r.label),1),o("span",Yt,[xe(I(S(r.value)),1),r.unit?(c(),p("i",Zt,I(r.unit),1)):M("",!0)])]))),128))])):M("",!0),o("div",Qt,[(c(!0),p(V,null,W(m.value,(r,v)=>(c(),p("div",{key:v,ref_for:!0,ref:y=>g(v,y),class:N(["agent-chart-item",{"is-half":x(r)===6}])},null,2))),128))])])):(c(),p("div",{key:1,ref_key:"chartRef",ref:D,class:"agent-chart"},null,512))}}}),tn=ee(en,[["__scopeId","data-v-95928aa0"]]),nn=`
:root {
  --color-fg-default: #24292f;
  --color-fg-muted: #57606a;
  --color-canvas-default: #ffffff;
  --color-canvas-subtle: #f6f8fa;
  --color-border-default: #d0d7de;
  --color-border-muted: hsla(210, 18%, 87%, 1);
  --color-neutral-muted: rgba(175, 184, 193, 0.2);
  --color-accent-fg: #0969da;
  --color-attention-subtle: #fff8c5;
  --color-danger-fg: #cf222e;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 32px 20px 64px;
  background: var(--color-canvas-default);
  color: var(--color-fg-default);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
}
.markdown-body {
  max-width: 900px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.6;
  word-wrap: break-word;
}
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 24px 0 16px;
  font-weight: 600;
  line-height: 1.25;
}
.markdown-body h1 { font-size: 2em; padding-bottom: .3em; border-bottom: 1px solid var(--color-border-muted); }
.markdown-body h2 { font-size: 1.5em; padding-bottom: .3em; border-bottom: 1px solid var(--color-border-muted); }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body h4 { font-size: 1em; }
.markdown-body h5 { font-size: .875em; }
.markdown-body h6 { font-size: .85em; color: var(--color-fg-muted); }
.markdown-body p { margin: 0 0 10px; }
.markdown-body a { color: var(--color-accent-fg); text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body strong { font-weight: 600; }
.markdown-body ul,
.markdown-body ol { padding-left: 2em; margin: 0 0 16px; }
.markdown-body li + li { margin-top: .25em; }
.markdown-body blockquote {
  margin: 0 0 16px;
  padding: 0 1em;
  color: var(--color-fg-muted);
  border-left: .25em solid var(--color-border-default);
}
.markdown-body code,
.markdown-body tt {
  padding: .2em .4em;
  margin: 0;
  font-size: 85%;
  white-space: break-spaces;
  background-color: var(--color-neutral-muted);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}
.markdown-body pre {
  margin: 0 0 16px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: var(--color-canvas-subtle);
  border-radius: 6px;
}
.markdown-body pre code {
  display: block;
  padding: 0;
  margin: 0;
  font-size: 100%;
  background: transparent;
  border: 0;
  overflow: visible;
  white-space: pre;
}
.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  margin-bottom: 16px;
}
.markdown-body table th,
.markdown-body table td { padding: 6px 13px; border: 1px solid var(--color-border-default); }
.markdown-body table th { font-weight: 600; }
.markdown-body table tr { background-color: var(--color-canvas-default); border-top: 1px solid var(--color-border-muted); }
.markdown-body table tr:nth-child(2n) { background-color: var(--color-canvas-subtle); }
.markdown-body img { max-width: 100%; box-sizing: content-box; background-color: var(--color-canvas-default); }
.markdown-body hr {
  height: .25em;
  padding: 0;
  margin: 24px 0;
  background-color: var(--color-border-default);
  border: 0;
}
.markdown-body > *:first-child { margin-top: 0 !important; }
.markdown-body > *:last-child { margin-bottom: 0 !important; }

/* highlight.js 语法高亮（浅色主题） */
.hljs { color: #383a42; background: #fafafa; }
.hljs-comment, .hljs-quote { color: #a0a1a7; font-style: italic; }
.hljs-doctag, .hljs-formula, .hljs-keyword { color: #a626a4; }
.hljs-deletion, .hljs-name, .hljs-section, .hljs-selector-tag, .hljs-subst { color: #e45649; }
.hljs-literal { color: #0184bb; }
.hljs-addition, .hljs-attribute, .hljs-meta .hljs-string, .hljs-regexp, .hljs-string { color: #50a14f; }
.hljs-attr, .hljs-number, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-pseudo, .hljs-template-variable, .hljs-type, .hljs-variable { color: #986801; }
.hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-symbol, .hljs-title { color: #4078f2; }
.hljs-built_in, .hljs-class .hljs-title, .hljs-title.class_ { color: #c18401; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 700; }
.hljs-link { text-decoration: underline; }

/* 图表 / 报表（导出） */
.chart-section-title { font-size: 15px; font-weight: 600; margin: 20px 0 12px; }
.chart-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
.chart-kpi-card { display: flex; flex-direction: column; gap: 6px; padding: 14px 16px; border: 1px solid var(--color-border-default); border-radius: 12px; background: var(--color-canvas-subtle); }
.chart-kpi-label { font-size: 12px; color: var(--color-fg-muted); }
.chart-kpi-value { font-size: 22px; font-weight: 700; color: var(--color-fg-default); font-variant-numeric: tabular-nums; }
.chart-kpi-unit { margin-left: 4px; font-size: 12px; font-weight: 500; font-style: normal; color: var(--color-fg-muted); }
.chart-grid { display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0 16px; }
.chart-item { flex: 0 0 100%; height: 320px; padding: 8px; border: 1px solid var(--color-border-default); border-radius: 12px; background: #fff; }
.chart-item.is-half { flex: 1 1 calc(50% - 6px); min-width: min(100%, 320px); }
@media (max-width: 767px) { .chart-item { height: 240px; } }
`;function on(e){var s,l;if(!e||!((s=e.charts)!=null&&s.length))return"";const a=[];return e.title&&a.push(`<div class="chart-section-title">${K(e.title)}</div>`),(l=e.kpis)!=null&&l.length&&a.push(`<div class="chart-kpi-row">${e.kpis.map(m=>`<div class="chart-kpi-card"><span class="chart-kpi-label">${K(m.label)}</span><span class="chart-kpi-value">${K(m.value)}${m.unit?`<i class="chart-kpi-unit">${K(m.unit)}</i>`:""}</span></div>`).join("")}</div>`),a.push(`<div class="chart-grid">${e.charts.map(m=>`<div class="${m.span===6?"chart-item is-half":"chart-item"}" data-echarts="${K(JSON.stringify(m.option??{}))}"></div>`).join("")}</div>`),a.join("")}const an="https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js",sn=`<script>
(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-echarts]'));
  if (!boxes.length) return;
  function init() {
    if (!window.echarts) return;
    boxes.forEach(function (box) {
      try {
        var inst = window.echarts.init(box);
        inst.setOption(JSON.parse(box.getAttribute('data-echarts')));
        box._ec = inst;
      } catch (e) {}
    });
    window.addEventListener('resize', function () {
      boxes.forEach(function (box) { if (box._ec) box._ec.resize(); });
    });
  }
  if (window.echarts) init();
  else window.addEventListener('load', init);
})();
<\/script>`;function rn(e,a,s=!1){const l=a.replace(/<div class="code-block-header">[\s\S]*?<\/div>/g,""),m=s?`<script src="${an}"><\/script>
${sn}
`:"";return`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${K(e)}</title>
<style>${nn}</style>
</head>
<body>
<article class="markdown-body">
${l}
</article>
${m}</body>
</html>`}function ln(e,a){const s=new Blob([a],{type:"text/html;charset=utf-8"}),l=URL.createObjectURL(s),m=document.createElement("a");m.href=l,m.download=e,document.body.appendChild(m),m.click(),document.body.removeChild(m),URL.revokeObjectURL(l)}function K(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const cn={key:0,class:"avatar-bubble mr-3 mt-4 shrink-0",title:"DeepSeek"},dn={class:"msg-content max-w-[85%] overflow-hidden text-sm"},un={key:0,class:"intent-badge"},hn={key:0,class:"msg-attachments"},fn={key:0,class:"attach-images"},pn={key:1,class:"attach-files"},mn=["title"],gn={class:"attach-file-name"},vn={key:0,class:"attach-file-size"},bn={key:2,class:"msg-actions"},xn={key:1,class:"avatar-bubble avatar-user ml-3 mt-4 shrink-0",title:"我"},yn=Q({__name:"index",props:{dateTime:{},text:{},reasoning:{},inversion:{type:Boolean},error:{type:Boolean},loading:{type:Boolean},intent:{},chart:{},images:{},files:{},backend:{}},setup(e){const a=e,s=U(a.inversion),l=U(),m=U();function x(f){return!f||f<=0?"":f<1024?`${f} B`:f<1024*1024?`${(f/1024).toFixed(1)} KB`:`${(f/1024/1024).toFixed(2)} MB`}const D=O(()=>({qa:"知识问答",data:"数据分析",chat:"闲聊"})[a.intent||""]||a.intent||"");function F(){var L,t,_,d;const f=((t=(L=l.value)==null?void 0:L.getRenderedTextHtml)==null?void 0:t.call(L))||"",g=(d=(_=m.value)==null?void 0:_.getExportData)==null?void 0:d.call(_),S=on(g),w=f+S;if(!w)return;const E=!!(g&&g.charts&&g.charts.length),z=(a.text||"").slice(0,30);ln(`AI回复_${A()}.html`,rn(z,w,E))}function A(){const f=new Date,g=S=>String(S).padStart(2,"0");return`${f.getFullYear()}-${g(f.getMonth()+1)}-${g(f.getDate())}_${g(f.getHours())}-${g(f.getMinutes())}-${g(f.getSeconds())}`}return(f,g)=>{const S=Ue,w=ve;return c(),p("div",{class:N(["flex w-full mb-6 msg-row",[e.inversion?"justify-end":"justify-start"]])},[e.inversion?M("",!0):(c(),p("div",cn,[...g[0]||(g[0]=[o("svg",{class:"brand-mark",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none"},[o("path",{d:"M12 2.5 21 19H3L12 2.5Z",fill:"var(--brand)"}),o("path",{d:"M12 9v7M12 12.5l-3.2 6h6.4L12 12.5Z",fill:"var(--brand-2)",opacity:"0.9"})],-1)])])),o("div",dn,[o("div",{class:N(["text-xs msg-time",[e.inversion?"text-right":"text-left"]])},[xe(I(e.dateTime)+" ",1),e.intent&&!e.inversion?(c(),p("span",un,I(D.value),1)):M("",!0)],2),e.inversion&&(e.images&&e.images.length||e.files&&e.files.length)?(c(),p("div",hn,[e.images&&e.images.length?(c(),p("div",fn,[(c(!0),p(V,null,W(e.images,(E,z)=>(c(),Y(S,{key:z,class:"attach-img",src:E,"preview-src-list":e.images,"initial-index":z,fit:"cover","preview-teleported":""},null,8,["src","preview-src-list","initial-index"]))),128))])):M("",!0),e.files&&e.files.length?(c(),p("div",pn,[(c(!0),p(V,null,W(e.files,(E,z)=>(c(),p("div",{key:z,class:"attach-file",title:E.name},[R(w,{size:14,class:"attach-file-icon"},{default:P(()=>[R(H(ie))]),_:1}),o("span",gn,I(E.name),1),E.size?(c(),p("span",vn,I(x(E.size)),1)):M("",!0)],8,mn))),128))])):M("",!0)])):M("",!0),o("div",{class:N(["flex items-end mt-1.5",[e.inversion?"flex-row-reverse":"flex-row"]])},[R(Vt,{ref_key:"textRef",ref:l,inversion:e.inversion,error:e.error,text:e.text,reasoning:e.reasoning,loading:e.loading,"as-raw-text":s.value,backend:e.backend},null,8,["inversion","error","text","reasoning","loading","as-raw-text","backend"])],2),!e.inversion&&e.chart?(c(),Y(tn,{key:1,ref_key:"chartRef",ref:m,option:e.chart},null,8,["option"])):M("",!0),!e.inversion&&!e.loading&&(e.text||e.chart)?(c(),p("div",bn,[o("button",{class:"msg-action-btn",onClick:F},[R(w,{size:14},{default:P(()=>[R(H(He))]),_:1}),g[1]||(g[1]=o("span",null,"下载所生成的内容",-1))])])):M("",!0)]),e.inversion?(c(),p("div",xn,[...g[2]||(g[2]=[o("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none"},[o("circle",{cx:"12",cy:"8",r:"4",fill:"#fff",opacity:"0.95"}),o("path",{d:"M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5v.5H4V20Z",fill:"#fff",opacity:"0.95"})],-1)])])):M("",!0)],2)}}}),wn=ee(yn,[["__scopeId","data-v-a788c822"]]),ke=Ze.create({baseURL:"/api",timeout:5e4});ke.interceptors.request.use(e=>(e.headers.Authorization!=="no-auth"?e.headers.Authorization="Bearer sk-ihbHQXkf5g8xcDt7Dk5Vw7BS7iAn3lIpbzTrSW4iYabFcNzu":delete e.headers.Authorization,e),e=>Promise.reject(e));ke.interceptors.response.use(e=>{if(e.config.responseType==="blob"||e.status===200)return e;throw new Error(e.status.toString())},async e=>Promise.reject(e));function kn(e,a){const s="/api",l={"Content-Type":"application/json",Authorization:"Bearer sk-ihbHQXkf5g8xcDt7Dk5Vw7BS7iAn3lIpbzTrSW4iYabFcNzu"};return a.headers={...l,...a.headers},fetch(s+e,a)}function $n(e,a){return kn("/v1/chat/completions",{method:"POST",body:JSON.stringify({model:"deepseek-v4-flash",messages:a,stream:!0,stream_options:{include_usage:!0}}),signal:e})}const $e="/agent";function _n(e,a,s){const l=`${$e}/api/chat/stream?q=${encodeURIComponent(e)}&thread_id=${encodeURIComponent(a)}`;return fetch(l,{signal:s})}function Sn(e,a,s,l){const m=new FormData;return m.append("message",e),m.append("thread_id",a),s.images.forEach(x=>m.append("images",x,x.name)),s.files.forEach(x=>m.append("files",x,x.name)),fetch(`${$e}/api/chat/upload`,{method:"POST",body:m,signal:l})}function Cn(){const e=ye();return{addChat:(l,m)=>{e.addChatByUuid(l,m)},updateChat:(l,m,x)=>{e.updateChatByUuid(l,m,x)}}}function Tn(){const e=U(),a=async()=>{var f,g;await G(),e.value&&e.value.setScrollTop(((g=(f=e.value)==null?void 0:f.wrapRef)==null?void 0:g.scrollHeight)||0)},s=async()=>{await G(),e.value&&e.value.setScrollTop(0)};let l=0;const m=()=>{l&&(cancelAnimationFrame(l),l=0)},x=(f,g=450)=>(m(),new Promise(S=>{var v;const w=(v=e.value)==null?void 0:v.wrapRef;if(!w){S();return}const E=w.scrollTop,z=Math.max(0,w.scrollHeight-w.clientHeight),t=Math.min(Math.max(f,0),z)-E;if(Math.abs(t)<1){S();return}const _=performance.now(),d=y=>y<.5?4*y*y*y:1-Math.pow(-2*y+2,3)/2,r=y=>{const T=y-_,q=Math.min(T/g,1);w.scrollTop=E+t*d(q),q<1?l=requestAnimationFrame(r):(l=0,S())};l=requestAnimationFrame(r)}));return{scrollRef:e,scrollToBottom:a,scrollToTop:s,scrollToBottomIfAtBottom:async()=>{var f,g,S,w,E,z;if(await G(),e.value){const L=((g=(f=e.value)==null?void 0:f.wrapRef)==null?void 0:g.scrollHeight)||0;L-((w=(S=e.value)==null?void 0:S.wrapRef)==null?void 0:w.scrollTop)-((z=(E=e.value)==null?void 0:E.wrapRef)==null?void 0:z.clientHeight)<=100&&e.value.setScrollTop(L)}},scrollToTopAnimated:async()=>{await G(),await x(0)},scrollToBottomAnimated:async()=>{var f,g;await G(),await x(((g=(f=e.value)==null?void 0:f.wrapRef)==null?void 0:g.scrollHeight)||0)}}}function jn(){async function e(a,s){const l=a.body.getReader(),m=new TextDecoder;let x=!1,D="";for(;!x;){const{value:F,done:A}=await l.read();if(x=A,D+=m.decode(F,{stream:!0}),!D.includes(`
`))continue;const f=D.split(`
`);for(const g of f){const S=g.replace(/^\s*data: \s*/,"").trim();if(S!=="[DONE]"){if(S==="")continue;try{const w=JSON.parse(S);s(w)}catch(w){console.error("Error parsing JSON:",w)}}else x=!0}D=""}}return{handleStreamResponse:e}}const En={class:"h-full flex flex-col relative"},An={class:"chat-header h-56px shrink-0 flex items-center justify-center"},zn={key:0,class:"chat-title"},Bn={key:1,class:"text-sm text-center text-tertiary"},Rn={class:"overflow-hidden flex-1 min-h-0"},Ln={id:"scroll-box",class:"chat-scroll-box w-full max-w-3xl mx-auto px-6 py-4 lg:max-w-4xl xl:max-w-5xl"},Mn={key:0,class:"flex flex-col items-center text-center pt-20 pb-10"},In={class:"mt-8 flex flex-wrap justify-center gap-2 max-w-xl hero-chips"},Dn=["onClick"],Hn={key:1},Un={class:"shrink-0"},On={class:"composer-wrap max-w-3xl mx-auto px-6 pb-6 lg:max-w-4xl xl:max-w-5xl"},Fn={class:"glass-strong rounded-2xl px-4 py-3 composer"},Nn={key:0,class:"attach-preview-row"},Pn=["src"],Vn={key:1,class:"attach-chip-fileicon"},qn={class:"attach-chip-meta"},Wn=["title"],Jn={class:"attach-chip-size"},Gn=["disabled","onClick"],Kn={class:"flex items-center justify-between pt-2"},Xn={class:"flex items-center gap-2"},Yn={class:"backend-switch"},Zn=["disabled"],Qn=["disabled"],eo={class:"text-xs text-tertiary composer-tip"},to={class:"flex items-center"},no={key:0,class:"scroll-actions"},oo=Q({__name:"index",setup(e){const a=[{category:"问答",text:"气泡和结石怎么区分？判定标准是什么？"},{category:"问答",text:"检测电子玻璃表面划伤用什么光源？"},{category:"数据",text:"最近一个月各厂家的检出率对比"},{category:"数据",text:"晶捷电子玻璃近两周划伤是不是变多了"},{category:"数据",text:"最近30天家电玻璃的Top缺陷类型"}],s=new Set([".jpg",".jpeg",".png",".webp",".bmp",".gif"]),l=new Set([".md",".txt",".pdf",".docx",".pptx",".xlsx"]);let m=new AbortController;const x=ye(),D=rt(),F=nt(),{addChat:A,updateChat:f}=Cn(),{scrollRef:g,scrollToBottom:S,scrollToBottomIfAtBottom:w,scrollToTopAnimated:E,scrollToBottomAnimated:z}=Tn(),{handleStreamResponse:L}=jn(),{uuid:t}=F.params,_=U(""),d=U(!1),r=U([]),v=U(),y=U(),T=O(()=>x.getChatByUuid(+t)),q=O(()=>x.getChatHistoryByCurrentActive),ce=O(()=>x.usingContext),J=O(()=>D.backend);function _e(u){_.value=u.text,te()}async function te(){if(!+t||+t==0){x.addHistory({title:"新建会话",uuid:Date.now(),isEdit:!1,visible:!1}),ae.set("chatSubmitPrompt",_.value);return}de()}const Se=O(()=>d.value?!1:_.value.trim()!==""||r.value.length>0),Ce=O(()=>ce.value?"已开启上下文":"");async function de(){if(d.value)return;const u=_.value.trim(),n=[...r.value];if(!u&&n.length===0)return;m=new AbortController;const b=T.value.filter(h=>h.text).map(h=>({role:h.inversion?"user":"assistant",content:h.text})),k=(await Promise.all(n.filter(h=>h.kind==="image").map(h=>ze(h.file)))).filter(h=>!!h),C=n.filter(h=>h.kind==="file").map(h=>({name:h.name,size:h.size}));A(+t,{dateTime:new Date().toLocaleString(),text:u,images:k.length?k:void 0,files:C.length?C:void 0,inversion:!0,error:!1}),n.forEach(h=>h.thumbUrl&&URL.revokeObjectURL(h.thumbUrl)),r.value=[],_.value="",S(),d.value=!0,A(+t,{dateTime:new Date().toLocaleString(),text:"",reasoning:"",loading:!0,inversion:!1,error:!1}),S(),J.value==="agent"?n.length?await Re(u,n):await Me(u):await Le(u,b)}function Te(u){const n=`.${(u.name.split(".").pop()||"").toLowerCase()}`;return s.has(n)||u.type.startsWith("image/")?"image":l.has(n)?"file":null}function ue(u){for(const n of u){const b=Te(n);if(!b){pe.warning(`暂不支持该格式：${n.name}（图片 jpg/png/webp/bmp/gif；文档 md/txt/pdf/docx/pptx/xlsx）`);continue}const C={uid:`${Date.now()}_${Math.random().toString(36).slice(2,8)}`,kind:b,name:n.name,size:n.size,type:n.type,file:n};b==="image"&&(C.thumbUrl=URL.createObjectURL(n)),r.value.push(C)}}function je(u){const n=u.target,b=Array.from(n.files||[]);n.value="",ue(b)}function Ee(u){const n=u.target,b=Array.from(n.files||[]);n.value="",ue(b)}function Ae(u){const n=r.value.findIndex(b=>b.uid===u);if(n!==-1){const[b]=r.value.splice(n,1);b!=null&&b.thumbUrl&&URL.revokeObjectURL(b.thumbUrl)}}function ze(u,n=1024,b=.82){return new Promise(k=>{const C=new FileReader;C.onerror=()=>k(null),C.onload=()=>{const h=new Image;h.onerror=()=>k(null),h.onload=()=>{const $=Math.min(1,n/Math.max(h.naturalWidth,h.naturalHeight)),i=Math.max(1,Math.round(h.naturalWidth*$)),j=Math.max(1,Math.round(h.naturalHeight*$)),B=document.createElement("canvas");B.width=i,B.height=j;const fe=B.getContext("2d");if(!fe)return k(null);fe.drawImage(h,0,0,i,j);try{k(B.toDataURL("image/jpeg",b))}catch{k(null)}},h.src=String(C.result)},C.readAsDataURL(u)})}function Be(u){return!u||u<=0?"":u<1024?`${u} B`:u<1024*1024?`${(u/1024).toFixed(1)} KB`:`${(u/1024/1024).toFixed(2)} MB`}function he(u){if(u==="deepseek"&&r.value.length){pe.warning("图片/文档附件由「玻璃智能体」处理，请先发送或移除当前附件");return}D.setBackend(u)}async function Re(u,n){var b;try{const k=String(x.active??Date.now()),C=n.filter(B=>B.kind==="image").map(B=>B.file),h=n.filter(B=>B.kind==="file").map(B=>B.file),$=await Sn(u,k,{images:C,files:h},m.signal);if(!$.ok){let B="";try{B=((b=await $.json())==null?void 0:b.detail)||""}catch{}throw new Error(`HTTP ${$.status}${B?`：${B}`:""}`)}const i=await $.json(),j={inversion:!1,error:!1,loading:!1};i!=null&&i.intent&&(j.intent=i.intent),j.text=(i==null?void 0:i.answer)||"",i!=null&&i.chart&&(j.chart=i.chart),f(+t,T.value.length-1,j),d.value=!1}catch(k){ne(k)}}async function Le(u,n){try{const b=[];ce.value&&b.push(...n),b.push({role:"user",content:u});const k=await $n(m.signal,b);await L(k,C=>{var i,j;const h=(j=(i=C.choices[0])==null?void 0:i.delta)==null?void 0:j.content;h&&(f(+t,T.value.length-1,{text:h??"",inversion:!1,error:!1,loading:!0}),w());const $=C.choices[0].delta.reasoning_content;$&&(f(+t,T.value.length-1,{reasoning:$??"",reasoningTime:new Date().toLocaleString(),inversion:!1,error:!1,loading:!0}),w())}),f(+t,T.value.length-1,{inversion:!1,error:!1,loading:!1}),d.value=!1}catch(b){ne(b)}}async function Me(u){try{const n=String(x.active??Date.now()),b=await _n(u,n,m.signal);await L(b,k=>{for(const C of Object.keys(k)){const h=k[C]||{},$={inversion:!1,error:!1,loading:!0};let i=!1;h.intent&&($.intent=h.intent,i=!0),h.final_answer&&($.text=h.final_answer,i=!0),h.chart_config&&($.chart=h.chart_config,i=!0);const j={};for(const B of Object.keys(h))["intent","final_answer","chart_config"].includes(B)||(j[B]=h[B]);Object.keys(j).length>0&&($.reasoning=Ie(C,j),$.reasoningTime=new Date().toLocaleString(),i=!0),i&&(f(+t,T.value.length-1,$),w())}}),f(+t,T.value.length-1,{inversion:!1,error:!1,loading:!1}),d.value=!1}catch(n){ne(n)}}function Ie(u,n){const k={router:"路由识别",data_parse:"参数解析",data_execute:"数据执行",data_analyze:"数据分析",report_generate:"报告生成"}[u]||u,C=[];for(const[h,$]of Object.entries(n))Array.isArray($)?C.push(`${h}: ${$.length} 条`):$!==null&&typeof $=="object"?C.push(`${h}: ${JSON.stringify($)}`):C.push(`${h}: ${$}`);return`· ${k}：${C.join("，")}
`}function ne(u){console.log(u),d.value=!1,u instanceof DOMException&&u.name==="AbortError"?f(+t,T.value.length-1,{text:`

用户手动中断。`,inversion:!1,error:!1,loading:!1}):f(+t,T.value.length-1,{text:`

服务器异常，请稍后再试。`,inversion:!1,error:!0,loading:!1})}function De(){d.value&&(m.abort(),d.value=!1)}return le(()=>{F.params.uuid||(x.active=1002);const u=ae.get("chatSubmitPrompt");u&&(_.value=u,ae.set("chatSubmitPrompt",""),de()),S()}),be(()=>{d.value&&m.abort()}),(u,n)=>{var $;const b=Ne,k=ve,C=Pe,h=Ve;return c(),p("div",En,[o("header",An,[T.value.length?(c(),p("div",zn,I(($=q.value)==null?void 0:$.title),1)):(c(),p("div",Bn,"新建的对话会展示在这里"))]),o("main",Rn,[R(b,{ref_key:"scrollRef",ref:g},{default:P(()=>[o("div",Ln,[T.value.length?(c(),p("div",Hn,[(c(!0),p(V,null,W(T.value,(i,j)=>(c(),Y(wn,{key:j,"date-time":i.dateTime,text:i.text,reasoning:i.reasoning,intent:i.intent,chart:i.chart,images:i.images,files:i.files,inversion:i.inversion,error:i.error,loading:i.loading,backend:J.value},null,8,["date-time","text","reasoning","intent","chart","images","files","inversion","error","loading","backend"]))),128))])):(c(),p("div",Mn,[n[7]||(n[7]=o("div",{class:"empty-orb"},[o("svg",{width:"72",height:"72",viewBox:"0 0 24 24",fill:"none"},[o("circle",{cx:"12",cy:"12",r:"9",stroke:"var(--brand)","stroke-width":"1.4"}),o("circle",{cx:"12",cy:"12",r:"4",fill:"var(--brand)",opacity:"0.55"}),o("circle",{cx:"12",cy:"12",r:"13.5",stroke:"var(--brand)","stroke-width":"0.8",opacity:"0.4","stroke-dasharray":"3 6"})])],-1)),n[8]||(n[8]=o("h2",{class:"mt-6 text-2xl font-bold hero-title"},"我是 聚玻明视-AI助手，很高兴见到你",-1)),n[9]||(n[9]=o("p",{class:"mt-3 text-sm hero-sub"},"我是玻璃检测与数据分析助手，支持质量问答与检测数据查询，请把你的问题交给我吧～",-1)),o("div",In,[(c(),p(V,null,W(a,i=>o("span",{key:i.text,class:"px-4 py-2 text-sm rounded-full cursor-pointer chip-item",onClick:j=>_e(i)},[o("span",{class:N(["chip-tag",i.category==="数据"?"chip-tag-data":"chip-tag-qa"])},I(i.category),3),o("span",null,I(i.text),1)],8,Dn)),64))])]))])]),_:1},512)]),o("footer",Un,[o("div",On,[o("div",Fn,[r.value.length?(c(),p("div",Nn,[R(Qe,{name:"attach"},{default:P(()=>[(c(!0),p(V,null,W(r.value,i=>(c(),p("div",{key:i.uid,class:"attach-chip"},[i.kind==="image"?(c(),p("img",{key:0,src:i.thumbUrl,class:"attach-chip-thumb",alt:""},null,8,Pn)):(c(),p("span",Vn,[R(k,{size:18},{default:P(()=>[R(H(ie))]),_:1})])),o("div",qn,[o("div",{class:"attach-chip-name",title:i.name},I(i.name),9,Wn),o("div",Jn,I(Be(i.size)),1)]),o("button",{class:"attach-chip-remove",type:"button",disabled:d.value,onClick:j=>Ae(i.uid)},[R(k,{size:12},{default:P(()=>[R(H(Ge))]),_:1})],8,Gn)]))),128))]),_:1})])):M("",!0),R(C,{modelValue:_.value,"onUpdate:modelValue":n[0]||(n[0]=i=>_.value=i),class:"composer-input",autosize:{minRows:2,maxRows:5},type:"textarea",resize:"none",placeholder:J.value==="agent"?"描述你的问题，可同时上传多张图片与文档（Shift + Enter 换行）":"发送消息，Shift + Enter 换行",onKeydown:et(tt(te,["exact","prevent"]),["enter"])},null,8,["modelValue","placeholder","onKeydown"]),o("div",Kn,[o("div",Xn,[o("div",Yn,[o("button",{class:N(["backend-chip",{active:J.value==="deepseek"}]),onClick:n[1]||(n[1]=i=>he("deepseek"))},"DeepSeek",2),o("button",{class:N(["backend-chip",{active:J.value==="agent"}]),onClick:n[2]||(n[2]=i=>he("agent"))},"玻璃智能体",2)]),J.value==="agent"?(c(),p(V,{key:0},[o("button",{class:"attach-btn",type:"button",title:"上传图片（可多选）",disabled:d.value,onClick:n[3]||(n[3]=i=>{var j;return(j=v.value)==null?void 0:j.click()})},[R(k,{size:17},{default:P(()=>[R(H(qe))]),_:1})],8,Zn),o("button",{class:"attach-btn",type:"button",title:"上传文档（可多选）",disabled:d.value,onClick:n[4]||(n[4]=i=>{var j;return(j=y.value)==null?void 0:j.click()})},[R(k,{size:17},{default:P(()=>[R(H(ie))]),_:1})],8,Qn)],64)):M("",!0),o("span",eo,I(Ce.value),1)]),o("div",to,[d.value?(c(),Y(h,{key:0,type:"primary",circle:"",class:"lens-btn",icon:H(Oe),onClick:De},null,8,["icon"])):(c(),Y(h,{key:1,type:"primary",circle:"",class:"lens-btn",disabled:!Se.value,icon:H(Fe),onClick:te},null,8,["disabled","icon"]))])])])])]),o("input",{ref_key:"imageInput",ref:v,type:"file",hidden:"",multiple:"",accept:"image/jpeg,image/png,image/webp,image/bmp,image/gif",onChange:je},null,544),o("input",{ref_key:"fileInput",ref:y,type:"file",hidden:"",multiple:"",accept:".md,.txt,.pdf,.docx,.pptx,.xlsx",onChange:Ee},null,544),T.value.length?(c(),p("div",no,[o("button",{class:"scroll-btn",title:"回到顶部",onClick:n[5]||(n[5]=(...i)=>H(E)&&H(E)(...i))},[R(k,{size:18},{default:P(()=>[R(H(We))]),_:1})]),o("button",{class:"scroll-btn",title:"到底部",onClick:n[6]||(n[6]=(...i)=>H(z)&&H(z)(...i))},[R(k,{size:18},{default:P(()=>[R(H(Je))]),_:1})])])):M("",!0)])}}}),co=ee(oo,[["__scopeId","data-v-36129d1f"]]);export{co as default};
