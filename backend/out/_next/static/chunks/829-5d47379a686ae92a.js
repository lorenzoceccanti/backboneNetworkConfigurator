(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[829],{7455:function(e){e.exports={style:{fontFamily:"'__geistMono_c3aa02', '__geistMono_Fallback_c3aa02'"},className:"__className_c3aa02",variable:"__variable_c3aa02"}},2122:function(e,t,r){"use strict";r.d(t,{aU:function(){return eP},x8:function(){return eT},dk:function(){return eR},zt:function(){return eg},fC:function(){return eb},Dx:function(){return eC},l_:function(){return ex}});var n,i=r(2265),o=r(4887),l=r(6741),a=r(8575),s=r(3966),u=r(7437),d=i.forwardRef((e,t)=>{let{children:r,...n}=e,o=i.Children.toArray(r),l=o.find(p);if(l){let e=l.props.children,r=o.map(t=>t!==l?t:i.Children.count(e)>1?i.Children.only(null):i.isValidElement(e)?e.props.children:null);return(0,u.jsx)(c,{...n,ref:t,children:i.isValidElement(e)?i.cloneElement(e,void 0,r):null})}return(0,u.jsx)(c,{...n,ref:t,children:r})});d.displayName="Slot";var c=i.forwardRef((e,t)=>{let{children:r,...n}=e;if(i.isValidElement(r)){let e,o;let l=(e=Object.getOwnPropertyDescriptor(r.props,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?r.ref:(e=Object.getOwnPropertyDescriptor(r,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?r.props.ref:r.props.ref||r.ref,s=function(e,t){let r={...t};for(let n in t){let i=e[n],o=t[n];/^on[A-Z]/.test(n)?i&&o?r[n]=(...e)=>{o(...e),i(...e)}:i&&(r[n]=i):"style"===n?r[n]={...i,...o}:"className"===n&&(r[n]=[i,o].filter(Boolean).join(" "))}return{...e,...r}}(n,r.props);return r.type!==i.Fragment&&(s.ref=t?(0,a.F)(t,l):l),i.cloneElement(r,s)}return i.Children.count(r)>1?i.Children.only(null):null});c.displayName="SlotClone";var f=({children:e})=>(0,u.jsx)(u.Fragment,{children:e});function p(e){return i.isValidElement(e)&&e.type===f}var v=i.forwardRef((e,t)=>{let{children:r,...n}=e,o=i.Children.toArray(r),l=o.find(y);if(l){let e=l.props.children,r=o.map(t=>t!==l?t:i.Children.count(e)>1?i.Children.only(null):i.isValidElement(e)?e.props.children:null);return(0,u.jsx)(m,{...n,ref:t,children:i.isValidElement(e)?i.cloneElement(e,void 0,r):null})}return(0,u.jsx)(m,{...n,ref:t,children:r})});v.displayName="Slot";var m=i.forwardRef((e,t)=>{let{children:r,...n}=e;if(i.isValidElement(r)){let e,o;let l=(e=Object.getOwnPropertyDescriptor(r.props,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?r.ref:(e=Object.getOwnPropertyDescriptor(r,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?r.props.ref:r.props.ref||r.ref,s=function(e,t){let r={...t};for(let n in t){let i=e[n],o=t[n];/^on[A-Z]/.test(n)?i&&o?r[n]=(...e)=>{o(...e),i(...e)}:i&&(r[n]=i):"style"===n?r[n]={...i,...o}:"className"===n&&(r[n]=[i,o].filter(Boolean).join(" "))}return{...e,...r}}(n,r.props);return r.type!==i.Fragment&&(s.ref=t?(0,a.F)(t,l):l),i.cloneElement(r,s)}return i.Children.count(r)>1?i.Children.only(null):null});m.displayName="SlotClone";var w=({children:e})=>(0,u.jsx)(u.Fragment,{children:e});function y(e){return i.isValidElement(e)&&e.type===w}var E=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,t)=>{let r=i.forwardRef((e,r)=>{let{asChild:n,...i}=e,o=n?v:t;return"undefined"!=typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,u.jsx)(o,{...i,ref:r})});return r.displayName=`Primitive.${t}`,{...e,[t]:r}},{}),h=r(6606),g="dismissableLayer.update",x=i.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),b=i.forwardRef((e,t)=>{var r,o;let{disableOutsidePointerEvents:s=!1,onEscapeKeyDown:d,onPointerDownOutside:c,onFocusOutside:f,onInteractOutside:p,onDismiss:v,...m}=e,w=i.useContext(x),[y,b]=i.useState(null),C=null!==(o=null==y?void 0:y.ownerDocument)&&void 0!==o?o:null===(r=globalThis)||void 0===r?void 0:r.document,[,T]=i.useState({}),j=(0,a.e)(t,e=>b(e)),N=Array.from(w.layers),[D]=[...w.layersWithOutsidePointerEventsDisabled].slice(-1),S=N.indexOf(D),L=y?N.indexOf(y):-1,F=w.layersWithOutsidePointerEventsDisabled.size>0,M=L>=S,O=function(e){var t;let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,n=(0,h.W)(e),o=i.useRef(!1),l=i.useRef(()=>{});return i.useEffect(()=>{let e=e=>{if(e.target&&!o.current){let t=function(){P("dismissableLayer.pointerDownOutside",n,i,{discrete:!0})},i={originalEvent:e};"touch"===e.pointerType?(r.removeEventListener("click",l.current),l.current=t,r.addEventListener("click",l.current,{once:!0})):t()}else r.removeEventListener("click",l.current);o.current=!1},t=window.setTimeout(()=>{r.addEventListener("pointerdown",e)},0);return()=>{window.clearTimeout(t),r.removeEventListener("pointerdown",e),r.removeEventListener("click",l.current)}},[r,n]),{onPointerDownCapture:()=>o.current=!0}}(e=>{let t=e.target,r=[...w.branches].some(e=>e.contains(t));!M||r||(null==c||c(e),null==p||p(e),e.defaultPrevented||null==v||v())},C),W=function(e){var t;let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,n=(0,h.W)(e),o=i.useRef(!1);return i.useEffect(()=>{let e=e=>{e.target&&!o.current&&P("dismissableLayer.focusOutside",n,{originalEvent:e},{discrete:!1})};return r.addEventListener("focusin",e),()=>r.removeEventListener("focusin",e)},[r,n]),{onFocusCapture:()=>o.current=!0,onBlurCapture:()=>o.current=!1}}(e=>{let t=e.target;[...w.branches].some(e=>e.contains(t))||(null==f||f(e),null==p||p(e),e.defaultPrevented||null==v||v())},C);return!function(e,t=globalThis?.document){let r=(0,h.W)(e);i.useEffect(()=>{let e=e=>{"Escape"===e.key&&r(e)};return t.addEventListener("keydown",e,{capture:!0}),()=>t.removeEventListener("keydown",e,{capture:!0})},[r,t])}(e=>{L!==w.layers.size-1||(null==d||d(e),!e.defaultPrevented&&v&&(e.preventDefault(),v()))},C),i.useEffect(()=>{if(y)return s&&(0===w.layersWithOutsidePointerEventsDisabled.size&&(n=C.body.style.pointerEvents,C.body.style.pointerEvents="none"),w.layersWithOutsidePointerEventsDisabled.add(y)),w.layers.add(y),R(),()=>{s&&1===w.layersWithOutsidePointerEventsDisabled.size&&(C.body.style.pointerEvents=n)}},[y,C,s,w]),i.useEffect(()=>()=>{y&&(w.layers.delete(y),w.layersWithOutsidePointerEventsDisabled.delete(y),R())},[y,w]),i.useEffect(()=>{let e=()=>T({});return document.addEventListener(g,e),()=>document.removeEventListener(g,e)},[]),(0,u.jsx)(E.div,{...m,ref:j,style:{pointerEvents:F?M?"auto":"none":void 0,...e.style},onFocusCapture:(0,l.M)(e.onFocusCapture,W.onFocusCapture),onBlurCapture:(0,l.M)(e.onBlurCapture,W.onBlurCapture),onPointerDownCapture:(0,l.M)(e.onPointerDownCapture,O.onPointerDownCapture)})});b.displayName="DismissableLayer";var C=i.forwardRef((e,t)=>{let r=i.useContext(x),n=i.useRef(null),o=(0,a.e)(t,n);return i.useEffect(()=>{let e=n.current;if(e)return r.branches.add(e),()=>{r.branches.delete(e)}},[r.branches]),(0,u.jsx)(E.div,{...e,ref:o})});function R(){let e=new CustomEvent(g);document.dispatchEvent(e)}function P(e,t,r,n){let{discrete:i}=n,l=r.originalEvent.target,a=new CustomEvent(e,{bubbles:!1,cancelable:!0,detail:r});(t&&l.addEventListener(e,t,{once:!0}),i)?l&&o.flushSync(()=>l.dispatchEvent(a)):l.dispatchEvent(a)}C.displayName="DismissableLayerBranch";var T=i.forwardRef((e,t)=>{let{children:r,...n}=e,o=i.Children.toArray(r),l=o.find(D);if(l){let e=l.props.children,r=o.map(t=>t!==l?t:i.Children.count(e)>1?i.Children.only(null):i.isValidElement(e)?e.props.children:null);return(0,u.jsx)(j,{...n,ref:t,children:i.isValidElement(e)?i.cloneElement(e,void 0,r):null})}return(0,u.jsx)(j,{...n,ref:t,children:r})});T.displayName="Slot";var j=i.forwardRef((e,t)=>{let{children:r,...n}=e;if(i.isValidElement(r)){let e,o;let l=(e=Object.getOwnPropertyDescriptor(r.props,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?r.ref:(e=Object.getOwnPropertyDescriptor(r,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?r.props.ref:r.props.ref||r.ref,s=function(e,t){let r={...t};for(let n in t){let i=e[n],o=t[n];/^on[A-Z]/.test(n)?i&&o?r[n]=(...e)=>{o(...e),i(...e)}:i&&(r[n]=i):"style"===n?r[n]={...i,...o}:"className"===n&&(r[n]=[i,o].filter(Boolean).join(" "))}return{...e,...r}}(n,r.props);return r.type!==i.Fragment&&(s.ref=t?(0,a.F)(t,l):l),i.cloneElement(r,s)}return i.Children.count(r)>1?i.Children.only(null):null});j.displayName="SlotClone";var N=({children:e})=>(0,u.jsx)(u.Fragment,{children:e});function D(e){return i.isValidElement(e)&&e.type===N}var S=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,t)=>{let r=i.forwardRef((e,r)=>{let{asChild:n,...i}=e,o=n?T:t;return"undefined"!=typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,u.jsx)(o,{...i,ref:r})});return r.displayName=`Primitive.${t}`,{...e,[t]:r}},{}),L=r(1188),F=i.forwardRef((e,t)=>{var r,n;let{container:l,...a}=e,[s,d]=i.useState(!1);(0,L.b)(()=>d(!0),[]);let c=l||s&&(null===(n=globalThis)||void 0===n?void 0:null===(r=n.document)||void 0===r?void 0:r.body);return c?o.createPortal((0,u.jsx)(S.div,{...a,ref:t}),c):null});F.displayName="Portal";var M=r(1599),O=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,t)=>{let r=i.forwardRef((e,r)=>{let{asChild:n,...i}=e,o=n?d:t;return"undefined"!=typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,u.jsx)(o,{...i,ref:r})});return r.displayName=`Primitive.${t}`,{...e,[t]:r}},{}),W=r(886),k=i.forwardRef((e,t)=>{let{children:r,...n}=e,o=i.Children.toArray(r),l=o.find(V);if(l){let e=l.props.children,r=o.map(t=>t!==l?t:i.Children.count(e)>1?i.Children.only(null):i.isValidElement(e)?e.props.children:null);return(0,u.jsx)(A,{...n,ref:t,children:i.isValidElement(e)?i.cloneElement(e,void 0,r):null})}return(0,u.jsx)(A,{...n,ref:t,children:r})});k.displayName="Slot";var A=i.forwardRef((e,t)=>{let{children:r,...n}=e;if(i.isValidElement(r)){let e,o;let l=(e=Object.getOwnPropertyDescriptor(r.props,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?r.ref:(e=Object.getOwnPropertyDescriptor(r,"ref")?.get)&&"isReactWarning"in e&&e.isReactWarning?r.props.ref:r.props.ref||r.ref,s=function(e,t){let r={...t};for(let n in t){let i=e[n],o=t[n];/^on[A-Z]/.test(n)?i&&o?r[n]=(...e)=>{o(...e),i(...e)}:i&&(r[n]=i):"style"===n?r[n]={...i,...o}:"className"===n&&(r[n]=[i,o].filter(Boolean).join(" "))}return{...e,...r}}(n,r.props);return r.type!==i.Fragment&&(s.ref=t?(0,a.F)(t,l):l),i.cloneElement(r,s)}return i.Children.count(r)>1?i.Children.only(null):null});A.displayName="SlotClone";var _=({children:e})=>(0,u.jsx)(u.Fragment,{children:e});function V(e){return i.isValidElement(e)&&e.type===_}var I=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,t)=>{let r=i.forwardRef((e,r)=>{let{asChild:n,...i}=e,o=n?k:t;return"undefined"!=typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,u.jsx)(o,{...i,ref:r})});return r.displayName=`Primitive.${t}`,{...e,[t]:r}},{}),K=i.forwardRef((e,t)=>(0,u.jsx)(I.span,{...e,ref:t,style:{position:"absolute",border:0,width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",wordWrap:"normal",...e.style}}));K.displayName="VisuallyHidden";var B="ToastProvider",[z,U,Z]=function(e){let t=e+"CollectionProvider",[r,n]=(0,s.b)(t),[o,l]=r(t,{collectionRef:{current:null},itemMap:new Map}),c=e=>{let{scope:t,children:r}=e,n=i.useRef(null),l=i.useRef(new Map).current;return(0,u.jsx)(o,{scope:t,itemMap:l,collectionRef:n,children:r})};c.displayName=t;let f=e+"CollectionSlot",p=i.forwardRef((e,t)=>{let{scope:r,children:n}=e,i=l(f,r),o=(0,a.e)(t,i.collectionRef);return(0,u.jsx)(d,{ref:o,children:n})});p.displayName=f;let v=e+"CollectionItemSlot",m="data-radix-collection-item",w=i.forwardRef((e,t)=>{let{scope:r,children:n,...o}=e,s=i.useRef(null),c=(0,a.e)(t,s),f=l(v,r);return i.useEffect(()=>(f.itemMap.set(s,{ref:s,...o}),()=>void f.itemMap.delete(s))),(0,u.jsx)(d,{[m]:"",ref:c,children:n})});return w.displayName=v,[{Provider:c,Slot:p,ItemSlot:w},function(t){let r=l(e+"CollectionConsumer",t);return i.useCallback(()=>{let e=r.collectionRef.current;if(!e)return[];let t=Array.from(e.querySelectorAll("[".concat(m,"]")));return Array.from(r.itemMap.values()).sort((e,r)=>t.indexOf(e.ref.current)-t.indexOf(r.ref.current))},[r.collectionRef,r.itemMap])},n]}("Toast"),[$,q]=(0,s.b)("Toast",[Z]),[H,X]=$(B),Y=e=>{let{__scopeToast:t,label:r="Notification",duration:n=5e3,swipeDirection:o="right",swipeThreshold:l=50,children:a}=e,[s,d]=i.useState(null),[c,f]=i.useState(0),p=i.useRef(!1),v=i.useRef(!1);return r.trim()||console.error("Invalid prop `label` supplied to `".concat(B,"`. Expected non-empty `string`.")),(0,u.jsx)(z.Provider,{scope:t,children:(0,u.jsx)(H,{scope:t,label:r,duration:n,swipeDirection:o,swipeThreshold:l,toastCount:c,viewport:s,onViewportChange:d,onToastAdd:i.useCallback(()=>f(e=>e+1),[]),onToastRemove:i.useCallback(()=>f(e=>e-1),[]),isFocusedToastEscapeKeyDownRef:p,isClosePausedRef:v,children:a})})};Y.displayName=B;var G="ToastViewport",J=["F8"],Q="toast.viewportPause",ee="toast.viewportResume",et=i.forwardRef((e,t)=>{let{__scopeToast:r,hotkey:n=J,label:o="Notifications ({hotkey})",...l}=e,s=X(G,r),d=U(r),c=i.useRef(null),f=i.useRef(null),p=i.useRef(null),v=i.useRef(null),m=(0,a.e)(t,v,s.onViewportChange),w=n.join("+").replace(/Key/g,"").replace(/Digit/g,""),y=s.toastCount>0;i.useEffect(()=>{let e=e=>{var t;0!==n.length&&n.every(t=>e[t]||e.code===t)&&(null===(t=v.current)||void 0===t||t.focus())};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[n]),i.useEffect(()=>{let e=c.current,t=v.current;if(y&&e&&t){let r=()=>{if(!s.isClosePausedRef.current){let e=new CustomEvent(Q);t.dispatchEvent(e),s.isClosePausedRef.current=!0}},n=()=>{if(s.isClosePausedRef.current){let e=new CustomEvent(ee);t.dispatchEvent(e),s.isClosePausedRef.current=!1}},i=t=>{e.contains(t.relatedTarget)||n()},o=()=>{e.contains(document.activeElement)||n()};return e.addEventListener("focusin",r),e.addEventListener("focusout",i),e.addEventListener("pointermove",r),e.addEventListener("pointerleave",o),window.addEventListener("blur",r),window.addEventListener("focus",n),()=>{e.removeEventListener("focusin",r),e.removeEventListener("focusout",i),e.removeEventListener("pointermove",r),e.removeEventListener("pointerleave",o),window.removeEventListener("blur",r),window.removeEventListener("focus",n)}}},[y,s.isClosePausedRef]);let E=i.useCallback(e=>{let{tabbingDirection:t}=e,r=d().map(e=>{let r=e.ref.current,n=[r,...function(e){let t=[],r=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:e=>{let t="INPUT"===e.tagName&&"hidden"===e.type;return e.disabled||e.hidden||t?NodeFilter.FILTER_SKIP:e.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});for(;r.nextNode();)t.push(r.currentNode);return t}(r)];return"forwards"===t?n:n.reverse()});return("forwards"===t?r.reverse():r).flat()},[d]);return i.useEffect(()=>{let e=v.current;if(e){let t=t=>{let r=t.altKey||t.ctrlKey||t.metaKey;if("Tab"===t.key&&!r){var n,i,o;let r=document.activeElement,l=t.shiftKey;if(t.target===e&&l){null===(n=f.current)||void 0===n||n.focus();return}let a=E({tabbingDirection:l?"backwards":"forwards"}),s=a.findIndex(e=>e===r);eh(a.slice(s+1))?t.preventDefault():l?null===(i=f.current)||void 0===i||i.focus():null===(o=p.current)||void 0===o||o.focus()}};return e.addEventListener("keydown",t),()=>e.removeEventListener("keydown",t)}},[d,E]),(0,u.jsxs)(C,{ref:c,role:"region","aria-label":o.replace("{hotkey}",w),tabIndex:-1,style:{pointerEvents:y?void 0:"none"},children:[y&&(0,u.jsx)(en,{ref:f,onFocusFromOutsideViewport:()=>{eh(E({tabbingDirection:"forwards"}))}}),(0,u.jsx)(z.Slot,{scope:r,children:(0,u.jsx)(O.ol,{tabIndex:-1,...l,ref:m})}),y&&(0,u.jsx)(en,{ref:p,onFocusFromOutsideViewport:()=>{eh(E({tabbingDirection:"backwards"}))}})]})});et.displayName=G;var er="ToastFocusProxy",en=i.forwardRef((e,t)=>{let{__scopeToast:r,onFocusFromOutsideViewport:n,...i}=e,o=X(er,r);return(0,u.jsx)(K,{"aria-hidden":!0,tabIndex:0,...i,ref:t,style:{position:"fixed"},onFocus:e=>{var t;let r=e.relatedTarget;(null===(t=o.viewport)||void 0===t?void 0:t.contains(r))||n()}})});en.displayName=er;var ei="Toast",eo=i.forwardRef((e,t)=>{let{forceMount:r,open:n,defaultOpen:i,onOpenChange:o,...a}=e,[s=!0,d]=(0,W.T)({prop:n,defaultProp:i,onChange:o});return(0,u.jsx)(M.z,{present:r||s,children:(0,u.jsx)(es,{open:s,...a,ref:t,onClose:()=>d(!1),onPause:(0,h.W)(e.onPause),onResume:(0,h.W)(e.onResume),onSwipeStart:(0,l.M)(e.onSwipeStart,e=>{e.currentTarget.setAttribute("data-swipe","start")}),onSwipeMove:(0,l.M)(e.onSwipeMove,e=>{let{x:t,y:r}=e.detail.delta;e.currentTarget.setAttribute("data-swipe","move"),e.currentTarget.style.setProperty("--radix-toast-swipe-move-x","".concat(t,"px")),e.currentTarget.style.setProperty("--radix-toast-swipe-move-y","".concat(r,"px"))}),onSwipeCancel:(0,l.M)(e.onSwipeCancel,e=>{e.currentTarget.setAttribute("data-swipe","cancel"),e.currentTarget.style.removeProperty("--radix-toast-swipe-move-x"),e.currentTarget.style.removeProperty("--radix-toast-swipe-move-y"),e.currentTarget.style.removeProperty("--radix-toast-swipe-end-x"),e.currentTarget.style.removeProperty("--radix-toast-swipe-end-y")}),onSwipeEnd:(0,l.M)(e.onSwipeEnd,e=>{let{x:t,y:r}=e.detail.delta;e.currentTarget.setAttribute("data-swipe","end"),e.currentTarget.style.removeProperty("--radix-toast-swipe-move-x"),e.currentTarget.style.removeProperty("--radix-toast-swipe-move-y"),e.currentTarget.style.setProperty("--radix-toast-swipe-end-x","".concat(t,"px")),e.currentTarget.style.setProperty("--radix-toast-swipe-end-y","".concat(r,"px")),d(!1)})})})});eo.displayName=ei;var[el,ea]=$(ei,{onClose(){}}),es=i.forwardRef((e,t)=>{let{__scopeToast:r,type:n="foreground",duration:s,open:d,onClose:c,onEscapeKeyDown:f,onPause:p,onResume:v,onSwipeStart:m,onSwipeMove:w,onSwipeCancel:y,onSwipeEnd:E,...g}=e,x=X(ei,r),[C,R]=i.useState(null),P=(0,a.e)(t,e=>R(e)),T=i.useRef(null),j=i.useRef(null),N=s||x.duration,D=i.useRef(0),S=i.useRef(N),L=i.useRef(0),{onToastAdd:F,onToastRemove:M}=x,W=(0,h.W)(()=>{var e;(null==C?void 0:C.contains(document.activeElement))&&(null===(e=x.viewport)||void 0===e||e.focus()),c()}),k=i.useCallback(e=>{e&&e!==1/0&&(window.clearTimeout(L.current),D.current=new Date().getTime(),L.current=window.setTimeout(W,e))},[W]);i.useEffect(()=>{let e=x.viewport;if(e){let t=()=>{k(S.current),null==v||v()},r=()=>{let e=new Date().getTime()-D.current;S.current=S.current-e,window.clearTimeout(L.current),null==p||p()};return e.addEventListener(Q,r),e.addEventListener(ee,t),()=>{e.removeEventListener(Q,r),e.removeEventListener(ee,t)}}},[x.viewport,N,p,v,k]),i.useEffect(()=>{d&&!x.isClosePausedRef.current&&k(N)},[d,N,x.isClosePausedRef,k]),i.useEffect(()=>(F(),()=>M()),[F,M]);let A=i.useMemo(()=>C?function e(t){let r=[];return Array.from(t.childNodes).forEach(t=>{if(t.nodeType===t.TEXT_NODE&&t.textContent&&r.push(t.textContent),t.nodeType===t.ELEMENT_NODE){let n=t.ariaHidden||t.hidden||"none"===t.style.display,i=""===t.dataset.radixToastAnnounceExclude;if(!n){if(i){let e=t.dataset.radixToastAnnounceAlt;e&&r.push(e)}else r.push(...e(t))}}}),r}(C):null,[C]);return x.viewport?(0,u.jsxs)(u.Fragment,{children:[A&&(0,u.jsx)(eu,{__scopeToast:r,role:"status","aria-live":"foreground"===n?"assertive":"polite","aria-atomic":!0,children:A}),(0,u.jsx)(el,{scope:r,onClose:W,children:o.createPortal((0,u.jsx)(z.ItemSlot,{scope:r,children:(0,u.jsx)(b,{asChild:!0,onEscapeKeyDown:(0,l.M)(f,()=>{x.isFocusedToastEscapeKeyDownRef.current||W(),x.isFocusedToastEscapeKeyDownRef.current=!1}),children:(0,u.jsx)(O.li,{role:"status","aria-live":"off","aria-atomic":!0,tabIndex:0,"data-state":d?"open":"closed","data-swipe-direction":x.swipeDirection,...g,ref:P,style:{userSelect:"none",touchAction:"none",...e.style},onKeyDown:(0,l.M)(e.onKeyDown,e=>{"Escape"!==e.key||(null==f||f(e.nativeEvent),e.nativeEvent.defaultPrevented||(x.isFocusedToastEscapeKeyDownRef.current=!0,W()))}),onPointerDown:(0,l.M)(e.onPointerDown,e=>{0===e.button&&(T.current={x:e.clientX,y:e.clientY})}),onPointerMove:(0,l.M)(e.onPointerMove,e=>{if(!T.current)return;let t=e.clientX-T.current.x,r=e.clientY-T.current.y,n=!!j.current,i=["left","right"].includes(x.swipeDirection),o=["left","up"].includes(x.swipeDirection)?Math.min:Math.max,l=i?o(0,t):0,a=i?0:o(0,r),s="touch"===e.pointerType?10:2,u={x:l,y:a},d={originalEvent:e,delta:u};n?(j.current=u,ey("toast.swipeMove",w,d,{discrete:!1})):eE(u,x.swipeDirection,s)?(j.current=u,ey("toast.swipeStart",m,d,{discrete:!1}),e.target.setPointerCapture(e.pointerId)):(Math.abs(t)>s||Math.abs(r)>s)&&(T.current=null)}),onPointerUp:(0,l.M)(e.onPointerUp,e=>{let t=j.current,r=e.target;if(r.hasPointerCapture(e.pointerId)&&r.releasePointerCapture(e.pointerId),j.current=null,T.current=null,t){let r=e.currentTarget,n={originalEvent:e,delta:t};eE(t,x.swipeDirection,x.swipeThreshold)?ey("toast.swipeEnd",E,n,{discrete:!0}):ey("toast.swipeCancel",y,n,{discrete:!0}),r.addEventListener("click",e=>e.preventDefault(),{once:!0})}})})})}),x.viewport)})]}):null}),eu=e=>{let{__scopeToast:t,children:r,...n}=e,o=X(ei,t),[l,a]=i.useState(!1),[s,d]=i.useState(!1);return function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:()=>{},t=(0,h.W)(e);(0,L.b)(()=>{let e=0,r=0;return e=window.requestAnimationFrame(()=>r=window.requestAnimationFrame(t)),()=>{window.cancelAnimationFrame(e),window.cancelAnimationFrame(r)}},[t])}(()=>a(!0)),i.useEffect(()=>{let e=window.setTimeout(()=>d(!0),1e3);return()=>window.clearTimeout(e)},[]),s?null:(0,u.jsx)(F,{asChild:!0,children:(0,u.jsx)(K,{...n,children:l&&(0,u.jsxs)(u.Fragment,{children:[o.label," ",r]})})})},ed=i.forwardRef((e,t)=>{let{__scopeToast:r,...n}=e;return(0,u.jsx)(O.div,{...n,ref:t})});ed.displayName="ToastTitle";var ec=i.forwardRef((e,t)=>{let{__scopeToast:r,...n}=e;return(0,u.jsx)(O.div,{...n,ref:t})});ec.displayName="ToastDescription";var ef="ToastAction",ep=i.forwardRef((e,t)=>{let{altText:r,...n}=e;return r.trim()?(0,u.jsx)(ew,{altText:r,asChild:!0,children:(0,u.jsx)(em,{...n,ref:t})}):(console.error("Invalid prop `altText` supplied to `".concat(ef,"`. Expected non-empty `string`.")),null)});ep.displayName=ef;var ev="ToastClose",em=i.forwardRef((e,t)=>{let{__scopeToast:r,...n}=e,i=ea(ev,r);return(0,u.jsx)(ew,{asChild:!0,children:(0,u.jsx)(O.button,{type:"button",...n,ref:t,onClick:(0,l.M)(e.onClick,i.onClose)})})});em.displayName=ev;var ew=i.forwardRef((e,t)=>{let{__scopeToast:r,altText:n,...i}=e;return(0,u.jsx)(O.div,{"data-radix-toast-announce-exclude":"","data-radix-toast-announce-alt":n||void 0,...i,ref:t})});function ey(e,t,r,n){let{discrete:i}=n,l=r.originalEvent.currentTarget,a=new CustomEvent(e,{bubbles:!0,cancelable:!0,detail:r});(t&&l.addEventListener(e,t,{once:!0}),i)?l&&o.flushSync(()=>l.dispatchEvent(a)):l.dispatchEvent(a)}var eE=function(e,t){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,n=Math.abs(e.x),i=Math.abs(e.y),o=n>i;return"left"===t||"right"===t?o&&n>r:!o&&i>r};function eh(e){let t=document.activeElement;return e.some(e=>e===t||(e.focus(),document.activeElement!==t))}var eg=Y,ex=et,eb=eo,eC=ed,eR=ec,eP=ep,eT=em}}]);