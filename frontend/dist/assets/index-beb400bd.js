import{r as e,j as o,h as n}from"./index-341d7fc4.js";import r from"./control-panel-0a258ff5.js";import s from"./container-1b75ff05.js";import t from"./toolbar-9d75224d.js";import{R as a,C as i}from"./row-73963857.js";import"./cover_3-3d11acab.js";import"./motion-container-1fbb24f8.js";import"./bounce-60412db4.js";import"./transition-8bc41415.js";import"./index-85185b56.js";import"./fade-6abf311c.js";import"./ReloadOutlined-e93f373b.js";function p(){const p=e.useMemo((()=>({selectedVariant:"kenburnsTop"})),[]),[l,m]=e.useState(p.selectedVariant);return o.jsxs(n,{children:[o.jsx(a,{children:o.jsx(i,{xs:24,md:18,children:o.jsx(t,{onRefresh:()=>{m(p.selectedVariant)}})})}),o.jsxs(a,{justify:"space-between",children:[o.jsx(i,{xs:24,md:18,children:o.jsx(s,{variant:l})}),o.jsx(i,{xs:24,md:5,children:o.jsx(r,{variantKey:c,selectedVariant:l,onChangeVarient:e=>m(e)})})]})]})}const c=[{type:"kenburns",values:["kenburnsTop","kenburnsBottom","kenburnsLeft","kenburnsRight"]},{type:"pan",values:["panTop","panBottom","panLeft","panRight"]},{type:"color change",values:["color2x","color3x","color4x","color5x"]}];export{p as default};