import{r as e,A as s,t,u as a,bZ as o,j as r,aM as n,c1 as i,aF as c,c2 as l,v as d,i as m}from"./index-f7ab5e13.js";import{u as h,d as x,o as p,P as u,T as j}from"./entity-5338cde5.js";import{u as f,a as k,b as w,c as y,C as T,E as g,B as S,S as C,d as v}from"./accountStore-d0ec45c3.js";import{S as I}from"./ShareModal-f5cba2b8.js";import{AccountModal as N}from"./AccountModal-35511e0d.js";import{ShareInfoModal as V}from"./ShareInfoModal-ad0b356e.js";import{F as O}from"./index-49b42c3a.js";import{T as z,E as L}from"./index-8e537eef.js";import{D as M}from"./DeleteOutlined-81f211ef.js";import{u as b}from"./shareService-42d4394b.js";import{R as E,C as F}from"./row-5814c07b.js";import{R}from"./ReloadOutlined-265d71c8.js";import"./Pagination-73d267c3.js";import"./index-46accfe0.js";import"./CheckOutlined-cb1ec32b.js";import"./index-f2019e83.js";import"./useChart-b025ed96.js";const A={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M926 164H94c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V196c0-17.7-14.3-32-32-32zm-40 632H134V236h752v560zm-658.9-82.3c3.1 3.1 8.2 3.1 11.3 0l172.5-172.5 114.4 114.5c3.1 3.1 8.2 3.1 11.3 0l297-297.2c3.1-3.1 3.1-8.2 0-11.3l-36.8-36.8a8.03 8.03 0 00-11.3 0L531 565 416.6 450.5a8.03 8.03 0 00-11.3 0l-214.9 215a8.03 8.03 0 000 11.3l36.7 36.9z"}}]},name:"fund",theme:"outlined"};var W=function(a,o){return e.createElement(s,t({},a,{ref:o,icon:A}))};
/**![fund](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkyNiAxNjRIOTRjLTE3LjcgMC0zMiAxNC4zLTMyIDMydjY0MGMwIDE3LjcgMTQuMyAzMiAzMiAzMmg4MzJjMTcuNyAwIDMyLTE0LjMgMzItMzJWMTk2YzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgNjMySDEzNFYyMzZoNzUydjU2MHptLTY1OC45LTgyLjNjMy4xIDMuMSA4LjIgMy4xIDExLjMgMGwxNzIuNS0xNzIuNSAxMTQuNCAxMTQuNWMzLjEgMy4xIDguMiAzLjEgMTEuMyAwbDI5Ny0yOTcuMmMzLjEtMy4xIDMuMS04LjIgMC0xMS4zbC0zNi44LTM2LjhhOC4wMyA4LjAzIDAgMDAtMTEuMyAwTDUzMSA1NjUgNDE2LjYgNDUwLjVhOC4wMyA4LjAzIDAgMDAtMTEuMyAwbC0yMTQuOSAyMTVhOC4wMyA4LjAzIDAgMDAwIDExLjNsMzYuNyAzNi45eiIgLz48L3N2Zz4=) */const _=e.forwardRef(W);function G(){const[s]=O.useForm(),{t:t}=a(),A=f(),W=k(),G=w(),H=y(),K=h(),q=o(),[B,D]=e.useState(-1),[P,Y]=e.useState(-1),Z=O.useWatch("email",s),$={email:"",accountType:"chatgpt",password:"",refreshToken:""},[J,Q]=e.useState({formValue:{...$},title:"New",show:!1,onOk:(e,s)=>{e.id?W.mutate(e,{onSuccess:()=>{Q((e=>({...e,show:!1})))},onSettled:()=>s(!1)}):A.mutate(e,{onSuccess:()=>{Q((e=>({...e,show:!1})))},onSettled:()=>s(!1)})},onCancel:()=>{Q((e=>({...e,show:!1,formValue:{...$}})))}}),[U,X]=e.useState({formValue:{...x,shareType:"chatgpt"},title:"New",show:!1,onOk:(e,s)=>{s(!0),K.mutate(e,{onSuccess:()=>{X((e=>({...e,show:!1})))},onSettled:()=>{s(!1)}})},onCancel:()=>{X((e=>({...e,show:!1})))}}),[ee,se]=e.useState({accountId:-1,show:!1,onOk:()=>{se((e=>({...e,show:!1})))}}),te=[{title:t("token.email"),dataIndex:"email",ellipsis:!0,align:"center",render:e=>r.jsx(z.Text,{style:{maxWidth:200},ellipsis:!0,children:e})},{title:t("token.password"),dataIndex:"password",align:"center",ellipsis:!0,render:e=>r.jsx(z.Text,{style:{maxWidth:200},ellipsis:!0,children:e})},{title:"Refresh Token",dataIndex:"refreshToken",align:"center",width:150,render:(e,s)=>s.refreshToken?r.jsx(n,{value:s.refreshToken,onClick:e=>p(s.refreshToken,t,e),readOnly:!0}):r.jsx(i,{color:"error",children:"Empty"})},{title:"Access Token",dataIndex:"accessToken",align:"center",width:100,render:(e,s)=>s.accessToken?r.jsx(n,{value:s.accessToken,onClick:e=>p(s.accessToken,t,e),readOnly:!0}):r.jsx(i,{color:"error",children:"Empty"})},{title:t("token.shareStatus"),dataIndex:"shared",align:"center",width:100,render:(e,s)=>1==s.shared?r.jsx(T,{twoToneColor:"#52c41a"}):r.jsx(g,{twoToneColor:"#fa8c16"})},{title:t("token.updateTime"),dataIndex:"updateTime",align:"center",width:200},{title:t("token.share"),key:"share",align:"center",render:(e,s)=>r.jsxs(c.Group,{children:[r.jsx(S,{count:s.shareList?.length,style:{zIndex:9},children:r.jsx(c,{icon:r.jsx(C,{}),onClick:()=>q({pathname:"/token/share/chatgpt",search:`?email=${s.email}`}),children:t("token.shareList")})}),r.jsx(c,{icon:r.jsx(l,{}),onClick:()=>oe(s)}),r.jsx(c,{icon:r.jsx(_,{}),onClick:()=>re(s)})]})},{title:t("token.action"),key:"operation",align:"center",render:(e,s)=>r.jsxs(c.Group,{children:[r.jsx(u,{title:t("common.refreshConfirm"),okText:"Yes",cancelText:"No",placement:"left",onConfirm:()=>{Y(s.id),H.mutate(s.id,{onSettled:()=>Y(void 0)})},children:r.jsx(c,{icon:r.jsx(R,{}),type:"primary",loading:P===s.id,children:t("common.refresh")},s.id)}),r.jsx(c,{onClick:()=>ne(s),icon:r.jsx(L,{}),type:"primary"}),r.jsx(u,{title:t("common.deleteConfirm"),okText:"Yes",cancelText:"No",placement:"left",onConfirm:()=>{D(s.id),G.mutate(s.id,{onSuccess:()=>D(void 0)})},children:r.jsx(c,{icon:r.jsx(M,{}),type:"primary",loading:B===s.id,danger:!0})})]})}],{data:ae}=b({queryKey:["accounts","chatgpt",Z],queryFn:()=>v.searchAccountList(Z,"chatgpt")}),oe=e=>{X((s=>({...s,show:!0,title:t("token.share"),formValue:{...x,accountId:e.id,shareType:"chatgpt"}})))},re=e=>{se((s=>({...s,show:!0,accountId:e.id,shareType:"chatgpt"})))},ne=e=>{Q((s=>({...s,show:!0,title:t("token.edit"),formValue:{...s.formValue,id:e.id,email:e.email,password:e.password,shared:e.shared,refreshToken:e.refreshToken,accessToken:e.accessToken}})))};return r.jsxs(d,{direction:"vertical",size:"large",className:"w-full",children:[r.jsx(m,{children:r.jsx(O,{form:s,children:r.jsxs(E,{gutter:[16,16],children:[r.jsx(F,{span:6,lg:6,children:r.jsx(O.Item,{label:t("token.email"),name:"email",className:"!mb-0",children:r.jsx(n,{})})}),r.jsx(F,{span:18,lg:18,children:r.jsxs("div",{className:"flex justify-end",children:[r.jsx(c,{onClick:()=>{s.resetFields()},children:t("token.reset")}),r.jsx(c,{type:"primary",className:"ml-4",children:t("token.search")})]})})]})})}),r.jsx(m,{title:t("token.accountList"),extra:r.jsx(d,{children:r.jsx(c,{type:"primary",onClick:()=>{Q((e=>({...e,show:!0,title:t("token.createNew"),formValue:{id:void 0,email:"",password:"",sessionKey:"",accountType:"chatgpt",shared:0,custom_type:"refresh_token",custom_token:""}})))},children:t("token.createNew")})}),children:r.jsx(j,{rowKey:"id",size:"small",scroll:{x:"max-content"},pagination:{pageSize:10},columns:te,dataSource:ae})}),r.jsx(N,{...J}),r.jsx(I,{...U}),r.jsx(V,{...ee})]})}export{G as default};