(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{5954:function(e,r,t){Promise.resolve().then(t.bind(t,7618))},7618:function(e,r,t){"use strict";t.d(r,{default:function(){return U}});var a=t(7437),s=t(2265),n=t(4508);let o=s.forwardRef((e,r)=>{let{className:t,type:s,...o}=e;return(0,a.jsx)("input",{type:s,className:(0,n.cn)("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",t),ref:r,...o})});o.displayName="Input";var i=t(7053),l=t(535);let c=(0,l.j)("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground shadow hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",outline:"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2",sm:"h-8 rounded-md px-3 text-xs",lg:"h-10 rounded-md px-8",icon:"h-9 w-9"}},defaultVariants:{variant:"default",size:"default"}}),d=s.forwardRef((e,r)=>{let{className:t,variant:s,size:o,asChild:l=!1,...d}=e,u=l?i.g7:"button";return(0,a.jsx)(u,{className:(0,n.cn)(c({variant:s,size:o,className:t})),ref:r,...d})});d.displayName="Button";var u=t(5153),m=t(9501),f=t(6394);let h=(0,l.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),p=s.forwardRef((e,r)=>{let{className:t,...s}=e;return(0,a.jsx)(f.f,{ref:r,className:(0,n.cn)(h(),t),...s})});p.displayName=f.f.displayName;let b=m.RV,g=s.createContext({}),x=e=>{let{...r}=e;return(0,a.jsx)(g.Provider,{value:{name:r.name},children:(0,a.jsx)(m.Qr,{...r})})},v=()=>{let e=s.useContext(g),r=s.useContext(N),{getFieldState:t,formState:a}=(0,m.Gc)(),n=t(e.name,a);if(!e)throw Error("useFormField should be used within <FormField>");let{id:o}=r;return{id:o,name:e.name,formItemId:"".concat(o,"-form-item"),formDescriptionId:"".concat(o,"-form-item-description"),formMessageId:"".concat(o,"-form-item-message"),...n}},N=s.createContext({}),j=s.forwardRef((e,r)=>{let{className:t,...o}=e,i=s.useId();return(0,a.jsx)(N.Provider,{value:{id:i},children:(0,a.jsx)("div",{ref:r,className:(0,n.cn)("space-y-2",t),...o})})});j.displayName="FormItem";let y=s.forwardRef((e,r)=>{let{className:t,...s}=e,{error:o,formItemId:i}=v();return(0,a.jsx)(p,{ref:r,className:(0,n.cn)(o&&"text-destructive",t),htmlFor:i,...s})});y.displayName="FormLabel";let w=s.forwardRef((e,r)=>{let{...t}=e,{error:s,formItemId:n,formDescriptionId:o,formMessageId:l}=v();return(0,a.jsx)(i.g7,{ref:r,id:n,"aria-describedby":s?"".concat(o," ").concat(l):"".concat(o),"aria-invalid":!!s,...t})});w.displayName="FormControl",s.forwardRef((e,r)=>{let{className:t,...s}=e,{formDescriptionId:o}=v();return(0,a.jsx)("p",{ref:r,id:o,className:(0,n.cn)("text-[0.8rem] text-muted-foreground",t),...s})}).displayName="FormDescription";let S=s.forwardRef((e,r)=>{let{className:t,children:s,...o}=e,{error:i,formMessageId:l}=v(),c=i?String(null==i?void 0:i.message):s;return c?(0,a.jsx)("p",{ref:r,id:l,className:(0,n.cn)("text-[0.8rem] font-medium text-destructive",t),...o,children:c}):null});S.displayName="FormMessage";var k=t(3764),C=t(3289);let I=k.fC,T=s.forwardRef((e,r)=>{let{className:t,...s}=e;return(0,a.jsx)(k.ck,{ref:r,className:(0,n.cn)("border-b",t),...s})});T.displayName="AccordionItem";let _=s.forwardRef((e,r)=>{let{className:t,children:s,...o}=e;return(0,a.jsx)(k.h4,{className:"flex",children:(0,a.jsxs)(k.xz,{ref:r,className:(0,n.cn)("flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",t),...o,children:[s,(0,a.jsx)(C.Z,{className:"h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"})]})})});_.displayName=k.xz.displayName;let A=s.forwardRef((e,r)=>{let{className:t,children:s,...o}=e;return(0,a.jsx)(k.VY,{ref:r,className:"overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",...o,children:(0,a.jsx)("div",{className:(0,n.cn)("pb-4 pt-0",t),children:s})})});A.displayName=k.VY.displayName;var E=t(3590),R=t(1229),O=t(5756);let P=s.forwardRef((e,r)=>{let{className:t,...s}=e;return(0,a.jsx)(O.fC,{className:(0,n.cn)("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",t),...s,ref:r,children:(0,a.jsx)(O.bU,{className:(0,n.cn)("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0")})})});P.displayName=O.fC.displayName;var D=t(4986);let z=R.z.string().regex(/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\/([0-9]|[12][0-9]|3[0-2])$/,"Invalid IP format (must be CIDR e.g., 192.168.1.1/24)"),F=R.z.string().regex(/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/,"Invalid IP format (e.g., 192.168.1.1)");function M(e){var r,t,n;let{initialValues:i,onChange:l}=e,[c,u]=(0,s.useState)(i),[m,f]=(0,s.useState)([]),[h,p]=(0,s.useState)([]),[b,g]=(0,s.useState)(null),[x,v]=(0,s.useState)(null),[N,j]=(0,s.useState)(null);(0,s.useEffect)(()=>{u(i)},[i]);let y=(e,r)=>{let t={...c,[e]:r};u(t),l(t)},w=(e,r,t)=>{switch(e){case"iface":try{z.parse(r),f(e=>{let r=[...e];return r[t]=!1,r})}catch(e){e instanceof R.jm&&f(e=>{let r=[...e];return r[t]=!0,r})}break;case"neighbor":try{F.parse(r),p(e=>{let r=[...e];return r[t]=!1,r})}catch(e){e instanceof R.jm&&p(e=>{let r=[...e];return r[t]=!0,r})}break;case"subnet":try{z.parse(r),g(!1)}catch(e){e instanceof R.jm&&g(!0)}break;case"dhcpStart":try{F.parse(r),v(!1)}catch(e){e instanceof R.jm&&v(!0)}break;case"dhcpEnd":try{F.parse(r),j(!1)}catch(e){e instanceof R.jm&&j(!0)}}},S=e=>{y("interfaces",c.interfaces.filter((r,t)=>t!==e))},k=e=>{y("neighbors",c.neighbors.filter((r,t)=>t!==e))};return(0,a.jsxs)("div",{className:"space-y-4 p-4 border rounded-lg",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium",children:"Router Name"}),(0,a.jsx)(o,{type:"text",value:c.routerName,className:"border ".concat(c.routerName?"border-green-500":""),onChange:e=>y("routerName",e.target.value)})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium",children:"AS Number"}),(0,a.jsx)(o,{type:"number",min:1,max:65534,value:c.asNumber,className:"border ".concat(c.asNumber?"border-green-500":""),onChange:e=>y("asNumber",Number(e.target.value))})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium",children:"Interfaces"}),c.interfaces.map((e,r)=>(0,a.jsxs)("div",{className:"flex space-x-2 my-2",children:[(0,a.jsx)(o,{placeholder:"Name",className:"border ".concat(e.name?"border-green-500":""),disabled:0===r,value:e.name,onChange:t=>{let a=[...c.interfaces];a[r]={...e,name:t.target.value},y("interfaces",a)}}),(0,a.jsx)(o,{className:"border ".concat(void 0!==m[r]?m[r]?"border-red-500":"border-green-500":""),placeholder:"IP Address (eg. 192.168.10.1/24)",value:e.ip,onChange:t=>{let a=[...c.interfaces];a[r]={...e,ip:t.target.value},y("interfaces",a),w("iface",t.target.value,r)}}),(0,a.jsx)(o,{placeholder:"Peer Name",disabled:0===r,value:e.peer.name,className:"border ".concat(e.peer.name?"border-green-500":""),onChange:t=>{let a=[...c.interfaces];a[r]={...e,peer:{...e.peer,name:t.target.value}},y("interfaces",a)}}),(0,a.jsx)(o,{placeholder:"Peer Interface",disabled:0===r,value:e.peer.interface,className:"border ".concat(e.peer.interface?"border-green-500":""),onChange:t=>{let a=[...c.interfaces];a[r]={...e,peer:{...e.peer,interface:t.target.value}},y("interfaces",a)}}),(0,a.jsx)("button",{disabled:0===r,onClick:()=>S(r),className:"text-red-500 hover:text-red-700",children:(0,a.jsx)(D.Z,{size:20})})]},r)),(0,a.jsx)(d,{className:"mt-2",onClick:()=>y("interfaces",[...c.interfaces,{name:"",ip:"",peer:{name:"",interface:""}}]),children:"Add Interface"})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium",children:"BGP Neighbors"}),c.neighbors.map((e,r)=>(0,a.jsxs)("div",{className:"flex space-x-2 my-2",children:[(0,a.jsx)(o,{className:"border ".concat(void 0!==h[r]?h[r]?"border-red-500":"border-green-500":""),placeholder:"Neighbor IP (eg. 192.168.10.2)",value:e.ip,onChange:t=>{let a=[...c.neighbors];a[r]={...e,ip:t.target.value},y("neighbors",a),w("neighbor",t.target.value,r)}}),(0,a.jsx)(o,{placeholder:"AS Number",type:"number",min:1,max:65534,className:"border ".concat(e.asNumber?"border-green-500":""),value:e.asNumber,onChange:t=>{let a=[...c.neighbors];a[r]={...e,asNumber:Number(t.target.value)},y("neighbors",a)}}),(0,a.jsx)("button",{onClick:()=>k(r),className:"text-red-500 hover:text-red-700",children:(0,a.jsx)(D.Z,{size:20})})]},r)),(0,a.jsx)(d,{className:"mt-2",onClick:()=>y("neighbors",[...c.neighbors,{ip:"",asNumber:0}]),children:"Add Neighbor"})]}),(0,a.jsxs)("div",{className:"border-t pt-4",children:[(0,a.jsxs)("div",{className:"flex space-x-4",children:[(0,a.jsx)("label",{className:"block text-sm font-medium",children:"Enable DHCP"}),(0,a.jsx)(P,{checked:null!==(n=null===(r=c.dhcp)||void 0===r?void 0:r.enabled)&&void 0!==n&&n,onCheckedChange:e=>y("dhcp",e?{enabled:!0,subnet:"",range:["",""]}:void 0)})]}),(null===(t=c.dhcp)||void 0===t?void 0:t.enabled)&&(0,a.jsxs)("div",{className:"mt-4 space-y-2",children:[(0,a.jsx)("label",{className:"block text-sm font-medium",children:"Subnet"}),(0,a.jsx)(o,{className:"border ".concat(null!==b?b?"border-red-500":"border-green-500":""),placeholder:"192.168.100.0/24",value:c.dhcp.subnet,onChange:e=>{y("dhcp",{...c.dhcp,subnet:e.target.value}),w("subnet",e.target.value,0)}}),(0,a.jsx)("label",{className:"block text-sm font-medium",children:"DHCP Range"}),(0,a.jsxs)("div",{className:"flex space-x-2",children:[(0,a.jsx)(o,{className:"border ".concat(null!==x?x?"border-red-500":"border-green-500":""),placeholder:"Start IP (eg. 192.168.10.1)",value:c.dhcp.range[0],onChange:e=>{y("dhcp",{...c.dhcp,range:[e.target.value,c.dhcp.range[1]]}),w("dhcpStart",e.target.value,0)}}),(0,a.jsx)(o,{className:"border ".concat(null!==N?N?"border-red-500":"border-green-500":""),placeholder:"End IP (eg. 192.168.10.99)",value:c.dhcp.range[1],onChange:e=>{y("dhcp",{...c.dhcp,range:[c.dhcp.range[0],e.target.value]}),w("dhcpEnd",e.target.value,0)}})]})]})]})]})}let V=R.z.object({number_of_routers:R.z.preprocess(e=>parseInt(R.z.string().parse(e),10),R.z.number().gte(1).lte(10))});function U(){let[e,r]=(0,s.useState)([]),[t,n]=(0,s.useState)(void 0),{toast:i}=(0,u.pm)(),l=(t,a)=>{let s=[...e];s[t]=a,r(s)},c=(0,m.cI)({resolver:(0,E.F)(V),defaultValues:{number_of_routers:0}}),f=async e=>{let r={routers:e.map(e=>({name:e.routerName,asn:e.asNumber,interfaces:e.interfaces.map(e=>({name:e.name,ip:e.ip,peer:{name:e.peer.name,interface:e.peer.interface}})),neighbors:e.neighbors.map(e=>({ip:e.ip,asn:e.asNumber})),...e.dhcp&&{dhcp:e.dhcp}}))};console.log(JSON.stringify(r));try{let e=await fetch("http://192.168.1.16:5000/configure",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});if(!e.ok)throw i({variant:"destructive",title:"Uh oh! Something went wrong.",description:"There was a problem with your request: "+e.statusText}),Error("Error on request: ".concat(e.statusText));i({variant:"default",title:"Configuration generated!",description:"The configuration has been generated successfully."})}catch(e){i({variant:"destructive",title:"Uh oh! Something went wrong.",description:"There was a problem with your request: "+e})}};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(b,{...c,children:(0,a.jsxs)("form",{onSubmit:c.handleSubmit(function(e){r(Array(e.number_of_routers).fill({routerName:"",asNumber:0,interfaces:[{name:"Loopback0",ip:"",peer:{name:"",interface:""}}],neighbors:[]}))}),className:"space-y-8 w-fit mx-auto flex space-x-2",children:[(0,a.jsx)(x,{control:c.control,name:"number_of_routers",render:e=>{let{field:r}=e;return(0,a.jsxs)(j,{children:[(0,a.jsx)(y,{children:"How many routers?"}),(0,a.jsx)(w,{children:(0,a.jsx)(o,{type:"number",min:1,max:10,className:"w-full",...r})}),(0,a.jsx)(S,{})]})}}),(0,a.jsx)(d,{type:"submit",children:"Submit"})]})}),(0,a.jsxs)("div",{className:"space-y-4 max-w-5xl mx-auto my-10",children:[(0,a.jsx)(I,{type:"single",collapsible:!0,value:t,onValueChange:n,children:e.map((e,r)=>(0,a.jsxs)(T,{value:"item-".concat(r+1),children:[(0,a.jsxs)(_,{children:["Router ",r+1]}),(0,a.jsx)(A,{children:(0,a.jsx)(M,{initialValues:e,onChange:e=>l(r,e)})})]},r))}),e.length>0&&e.every(e=>e.routerName&&e.asNumber&&e.interfaces.length>0&&e.neighbors.length>0&&e.interfaces.every(e=>e.name&&e.ip&&e.peer)&&e.neighbors.every(e=>e.ip&&e.asNumber))&&(0,a.jsx)(d,{className:"w-fit my-4",onClick:()=>f(e),children:"Generate Configuration"})]})]})}},5153:function(e,r,t){"use strict";t.d(r,{pm:function(){return m}});var a=t(2265);let s=0,n=new Map,o=e=>{if(n.has(e))return;let r=setTimeout(()=>{n.delete(e),d({type:"REMOVE_TOAST",toastId:e})},1e6);n.set(e,r)},i=(e,r)=>{switch(r.type){case"ADD_TOAST":return{...e,toasts:[r.toast,...e.toasts].slice(0,1)};case"UPDATE_TOAST":return{...e,toasts:e.toasts.map(e=>e.id===r.toast.id?{...e,...r.toast}:e)};case"DISMISS_TOAST":{let{toastId:t}=r;return t?o(t):e.toasts.forEach(e=>{o(e.id)}),{...e,toasts:e.toasts.map(e=>e.id===t||void 0===t?{...e,open:!1}:e)}}case"REMOVE_TOAST":if(void 0===r.toastId)return{...e,toasts:[]};return{...e,toasts:e.toasts.filter(e=>e.id!==r.toastId)}}},l=[],c={toasts:[]};function d(e){c=i(c,e),l.forEach(e=>{e(c)})}function u(e){let{...r}=e,t=(s=(s+1)%Number.MAX_SAFE_INTEGER).toString(),a=()=>d({type:"DISMISS_TOAST",toastId:t});return d({type:"ADD_TOAST",toast:{...r,id:t,open:!0,onOpenChange:e=>{e||a()}}}),{id:t,dismiss:a,update:e=>d({type:"UPDATE_TOAST",toast:{...e,id:t}})}}function m(){let[e,r]=a.useState(c);return a.useEffect(()=>(l.push(r),()=>{let e=l.indexOf(r);e>-1&&l.splice(e,1)}),[e]),{...e,toast:u,dismiss:e=>d({type:"DISMISS_TOAST",toastId:e})}}},4508:function(e,r,t){"use strict";t.d(r,{cn:function(){return n}});var a=t(1994),s=t(3335);function n(){for(var e=arguments.length,r=Array(e),t=0;t<e;t++)r[t]=arguments[t];return(0,s.m6)((0,a.W)(r))}}},function(e){e.O(0,[695,770,971,117,744],function(){return e(e.s=5954)}),_N_E=e.O()}]);