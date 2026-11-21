var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=/* @__PURE__ */ new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:m}=Object,h=globalThis,g=h.trustedTypes,ee=g?g.emptyScript:``,te=h.reactiveElementPolyfillSupport,_=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?ee:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},ne=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:ne};Symbol.metadata??=Symbol(`metadata`),h.litPropertyMetadata??=/* @__PURE__ */ new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(_(`elementProperties`)))return;let e=m(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=/* @__PURE__ */ new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=/* @__PURE__ */ new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=/* @__PURE__ */ new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=/* @__PURE__ */ new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?v:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?v:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??ne)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=/* @__PURE__ */ new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=/* @__PURE__ */ new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=/* @__PURE__ */ new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:`open`},b[_(`elementProperties`)]=/* @__PURE__ */ new Map,b[_(`finalized`)]=/* @__PURE__ */ new Map,te?.({ReactiveElement:b}),(h.reactiveElementVersions??=[]).push(`2.1.2`);var x=globalThis,S=e=>e,C=x.trustedTypes,re=C?C.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ie=`$lit$`,w=`lit$${Math.random().toFixed(9).slice(2)}$`,ae=`?`+w,oe=`<${ae}>`,T=document,E=()=>T.createComment(``),D=e=>e===null||typeof e!=`object`&&typeof e!=`function`,O=Array.isArray,se=e=>O(e)||typeof e?.[Symbol.iterator]==`function`,k=`[ 	
\f\r]`,A=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ce=/-->/g,le=/>/g,j=RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ue=/'/g,de=/"/g,fe=/^(?:script|style|textarea|title)$/i,pe=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),M=pe(1),N=pe(2),P=Symbol.for(`lit-noChange`),F=Symbol.for(`lit-nothing`),me=/* @__PURE__ */ new WeakMap,I=T.createTreeWalker(T,129);function he(e,t){if(!O(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return re===void 0?t:re.createHTML(t)}var ge=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=A;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===A?c[1]===`!--`?o=ce:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=j):(fe.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=j):o=le:o===j?c[0]===`>`?(o=i??A,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?j:c[3]===`"`?de:ue):o===de||o===ue?o=j:o===ce||o===le?o=A:(o=j,i=void 0);let d=o===j&&e[t+1].startsWith(`/>`)?` `:``;a+=o===A?n+oe:l>=0?(r.push(s),n.slice(0,l)+ie+n.slice(l)+w+d):n+w+(l===-2?t:d)}return[he(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},L=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=ge(t,n);if(this.el=e.createElement(l,r),I.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=I.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ie)){let t=u[o++],n=i.getAttribute(e).split(w),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?ve:r[1]===`?`?ye:r[1]===`@`?be:B}),i.removeAttribute(e)}else e.startsWith(w)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(fe.test(i.tagName)){let e=i.textContent.split(w),t=e.length-1;if(t>0){i.textContent=C?C.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],E()),I.nextNode(),c.push({type:2,index:++a});i.append(e[t],E())}}}else if(i.nodeType===8){if(i.data===ae)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(w,e+1))!==-1;)c.push({type:7,index:a}),e+=w.length-1}}a++}}static createElement(e,t){let n=T.createElement(`template`);return n.innerHTML=e,n}};function R(e,t,n=e,r){if(t===P)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=D(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=R(e,i._$AS(e,t.values),i,r)),t}var _e=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??T).importNode(t,!0);I.currentNode=r;let i=I.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new z(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new xe(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=I.nextNode(),a++)}return I.currentNode=T,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},z=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=F,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=R(this,e,t),D(e)?e===F||e==null||e===``?(this._$AH!==F&&this._$AR(),this._$AH=F):e!==this._$AH&&e!==P&&this._(e):e._$litType$===void 0?e.nodeType===void 0?se(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==F&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(T.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=L.createElement(he(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new _e(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=me.get(e.strings);return t===void 0&&me.set(e.strings,t=new L(e)),t}k(t){O(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(E()),this.O(E()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=S(e).nextSibling;S(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},B=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=F,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(/* @__PURE__ */ new String),this.strings=n):this._$AH=F}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=R(this,e,t,0),a=!D(e)||e!==this._$AH&&e!==P,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=R(this,r[n+o],t,o),s===P&&(s=this._$AH[o]),a||=!D(s)||s!==this._$AH[o],s===F?e=F:e!==F&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===F?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},ve=class extends B{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===F?void 0:e}},ye=class extends B{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==F)}},be=class extends B{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=R(this,e,t,0)??F)===P)return;let n=this._$AH,r=e===F&&n!==F||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==F&&(n===F||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},xe=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){R(this,e)}},Se=x.litHtmlPolyfillSupport;Se?.(L,z),(x.litHtmlVersions??=[]).push(`3.3.3`);var Ce=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new z(t.insertBefore(E(),e),e,void 0,n??{})}return i._$AI(e),i},V=globalThis,H=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ce(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return P}};H._$litElement$=!0,H.finalized=!0,V.litElementHydrateSupport?.({LitElement:H});var we=V.litElementPolyfillSupport;we?.({LitElement:H}),(V.litElementVersions??=[]).push(`4.2.2`);var Te=e=>e.callWS({type:`waermeregie/config`}),U=(e,t,n=180)=>e.callWS(t===null?{type:`waermeregie/override`,scene:null}:{type:`waermeregie/override`,scene:t,minutes:n}),W=(e,t)=>e.callWS({type:`waermeregie/pause`,minutes:t}),G=(e,t,n)=>e.callWS({type:`waermeregie/boost`,delta:t,minutes:n}),Ee=(e,t)=>e.callWS({type:`waermeregie/warmup`,...t}),De=(e,t,n)=>e.callWS({type:`waermeregie/feedback`,kind:t,...n?{room:n}:{}}),Oe=(e,t,n,r)=>e.callWS({type:`waermeregie/suggestion`,suggestion:t,action:n,...r===void 0?{}:{value:r}}),ke=(e,t=24)=>e.callWS({type:`waermeregie/history`,hours:t}).then(e=>Array.isArray(e?.points)?e.points:[]);function Ae(e,t,n){let r=null,i=!1;return e.connection.subscribeMessage(t,{type:`waermeregie/subscribe`}).then(e=>{i?e():r=e}).catch(e=>n?.(e)),()=>{if(i=!0,r)try{Promise.resolve(r()).catch(()=>void 0)}catch{}r=null}}async function je(e,t){let n=t?.overrides,r=!n,i=null;return(r||n?.scene||t?.scene?.source===`override`)&&(i=await U(e,null)),(r||n?.pause_until)&&(i=await W(e,0)),(r||n?.boost)&&(i=await G(e,0,0)),i}var Me=1440,Ne=/^([01]\d|2[0-3]):([0-5]\d)$/,Pe={opening:!0,opening_check:!0,sensor:!0,pellets:!0,stove_error:!0,overheat:!0,too_warm:!0,activity:!1,suggestion:!0,opening_delay_min:10,repeat_min:60,ventilate_max_min:30,quiet_start:`22:00`,quiet_end:`07:00`,quiet_hold:!0};function Fe(e){let t=Ne.exec(String(e??``).trim());return t?Number(t[1])*60+Number(t[2]):null}function Ie(e){let t=e.trim().replace(/[.,h ]/g,`:`),n,r,i=/^(\d{1,2}):(\d{1,2})$/.exec(t),a=/^(\d{1,4})$/.exec(t);if(i)n=Number(i[1]),r=Number(i[2]);else if(a){let e=a[1];n=Number(e.length<=2?e:e.slice(0,e.length-2)),r=e.length<=2?0:Number(e.slice(-2))}else return e;return n>23||r>59?e:`${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}function Le(e){let t=(Math.floor(e)%Me+Me)%Me;return`${String(Math.floor(t/60)).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function Re(e){return e.startsWith(`de`)?`,`:`.`}function K(e,t,n=1){if(e==null||!Number.isFinite(e))return`–`;let r=e.toFixed(n);return Re(t)===`,`?r.replace(`.`,`,`):r}function ze(e,t){let n=K(e,t,1);return n===`–`?n:`${n} °C`}var q=/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;function J(e){if(!e)return`–`;let t=q.exec(e);if(t)return`${t[4]}:${t[5]}`;let n=Fe(e);return n===null?`–`:Le(n)}function Be(e,t){let n=e?q.exec(e):null;return n?t.startsWith(`de`)?`${n[3]}.${n[2]}.`:`${n[2]}/${n[3]}`:``}function Ve(e){let t=e?q.exec(e):null;return t?`${t[1]}-${t[2]}-${t[3]}`:null}function He(e){let t=e?q.exec(e):null;return t?Number(t[4])*60+Number(t[5]):null}function Y(e,t,n){let r=J(e);if(r===`–`)return r;let i=Ve(e);if(i&&t&&i===Ve(t))return r;let a=Be(e,n);return a?`${a} ${r}`:r}function Ue(e){let t=String(e??`de`).toLowerCase();return t.startsWith(`de`)||t===``?`de`:`en`}function We(e){let t=e??{};return{...t,stove:{...t.stove??{},climate:t.stove?.climate??null,power:t.stove?.power??null,chrono_switch:t.stove?.chrono_switch??null,eco_switch:t.stove?.eco_switch??null,error_sensor:t.stove?.error_sensor??null,water_sensor:t.stove?.water_sensor??null,ignitions_sensor:t.stove?.ignitions_sensor??null},weather:t.weather??null,outdoor_sensor:t.outdoor_sensor??null,workday:t.workday??null,persons:t.persons??[],pet:t.pet??null,ai_task:t.ai_task??null,notify:t.notify??[],notifications:{...Pe,...t.notifications??{}},rules:t.rules??[],rooms:(t.rooms??[]).map(e=>({...e,importance:e.importance??2,radiators:e.radiators??[],temperature_sensors:(e.temperature_sensors??[]).map(e=>({...e,weight:e.weight??1,offset:e.offset??0})),openings:e.openings??[],presence:e.presence??[],humidity_sensors:e.humidity_sensors??[],ventilate_humidity:e.ventilate_humidity??65,ventilate_rise:e.ventilate_rise??6,paused:e.paused??[],targets:e.targets??{}})),scenes:t.scenes??[],day_types:(t.day_types??[]).map(e=>({...e,slots:e.slots??[]})),week:t.week??{},warmup_scene:t.warmup_scene??null,parameters:t.parameters??{},mode:t.mode??`shadow`}}function X(e){if(!e)return``;if(typeof e==`string`)return e;if(typeof e==`object`){let t=e;if(typeof t.message==`string`&&t.message)return t.message;if(t.error&&typeof t.error.message==`string`)return t.error.message;if(typeof t.code==`string`)return t.code}return String(e)}var Z=e=>typeof e==`number`&&Number.isFinite(e);function Ge(e){if(!e.length)return[18,22];let t=Math.floor(Math.min(...e)-.3),n=Math.ceil(Math.max(...e)+.3);if(n-t<2){let e=(n+t)/2;t=Math.floor(e-1),n=t+2}return[t,n]}function Ke(e){let t=[],n=-1;return e.forEach((e,r)=>{e.burning&&n<0&&(n=r),!e.burning&&n>=0&&(t.push([n,r]),n=-1)}),n>=0&&t.push([n,e.length]),t}function qe(e,t){let n=(e??[]).filter(e=>e&&typeof e.t==`string`&&!Number.isNaN(Date.parse(e.t)));if(n.sort((e,t)=>Date.parse(e.t)-Date.parse(t.t)),n.filter(e=>Z(e.house_c)).length<2)return null;let r=t.padLeft??28,i=t.width-(t.padRight??8),a=t.padTop??8,o=t.height-(t.padBottom??18),s=Date.parse(n[0].t),c=Date.parse(n[n.length-1].t),l=Math.max(1,c-s),u=e=>r+(Date.parse(e)-s)/l*(i-r),[d,f]=Ge(n.flatMap(e=>[e.house_c,e.target_c]).filter(Z)),p=e=>o-(e-d)/(f-d)*(o-a),m=e=>Math.round(e*10)/10,h=``,g=!1,ee=null;for(let e of n)Z(e.house_c)?(h+=`${g?`L`:`M`}${m(u(e.t))},${m(p(e.house_c))}`,g=!0,ee={x:m(u(e.t)),y:m(p(e.house_c)),value:e.house_c}):g=!1;let te=``,_=null;for(let e of n){if(!Z(e.target_c)){_=null;continue}let t=m(u(e.t)),n=m(p(e.target_c));te+=_===null?`M${t},${n}`:`H${t}${n===_?``:`V${n}`}`,_=n}let v=n.length>1?(i-r)/(n.length-1):0,ne=Ke(n).map(([e,t])=>{let r=u(n[e].t),a=t<n.length?u(n[t].t):Math.min(i,u(n[t-1].t)+v);return{x:m(r),w:m(Math.max(1,a-r))}}),y=[],b=Math.max(2,Math.floor((o-a)/24)),x=Math.max(1,Math.ceil((f-d)/b));for(let e=d;e<=f;e+=x)y.push({y:m(p(e)),value:e});let S=[],C=/* @__PURE__ */ new Set;for(let e of n){let t=He(e.t);if(t===null)continue;let n=Math.floor(t/60),r=`${e.t.slice(0,10)} ${n}`;n%6==0&&!C.has(r)&&(C.add(r),S.push({x:m(u(e.t)),label:Le(n*60)}))}return{width:t.width,height:t.height,left:r,right:i,top:a,bottom:o,yMin:d,yMax:f,house:h,target:te,bands:ne,yTicks:y,xTicks:S,last:ee}}function Je(e,t){if(!e)return null;if(Z(e.fill_pct))return Math.max(0,Math.min(100,Math.round(e.fill_pct)));let n=Z(e.capacity_kg)?e.capacity_kg:t;return!Z(e.stock_kg)||!Z(n)||n<=0?null:Math.max(0,Math.min(100,Math.round(e.stock_kg/n*100)))}function Ye(e,t=/* @__PURE__ */ new Date){let n=He(e);return n===null&&(n=t.getHours()*60+t.getMinutes()),Le(Math.ceil((n+60)/15)*15%1440)}function Xe(e){let t=e?.house;if(t&&(Z(t.temperature_c)||Z(t.target_c)))return{temp:Z(t.temperature_c)?t.temperature_c:null,target:Z(t.target_c)?t.target_c:null};let n=e?.rooms??[],r=e=>e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length*10)/10:null;return{temp:r(n.map(e=>e.temperature).filter(Z)),target:r(n.map(e=>e.target).filter(Z))}}function Ze(e){let t=e?.stove;if(!t)return{key:`idle`};if(t.error)return{key:`error`};if(t.phase===`prepare`)return{key:`prepare`,time:J(t.start_at)};if(t.self_off)return{key:`self_off`};if(t.burning)return{key:`burning`,time:J(t.block_start)};if(t.phase===`block`)return{key:`block`,time:J(t.block_start)};if(!t.available)return{key:`unavailable`};let n=e?.warmup;if(n&&!n.active&&n.start_at)return{key:`warmup_planned`,time:J(n.start_at)};let r=e?.overrides?.pause_until;if(r)return{key:`paused`,time:J(r)};if(t.phase===`pause`&&t.pause_until)return{key:`pause`,time:J(t.pause_until)};let i=e?.house?.deficit_k;return Z(i)&&i<0?{key:`idle_warm`}:{key:`idle`}}function Qe(e,t){let n=e?.warmup;return!n||!n.until?null:n.active&&n.cold?t(`cold.active_until`,{time:J(n.until)}):n.active?t(`warmup.active_until`,{time:J(n.until)}):n.arrive?t(`warmup.planned_arrive`,{time:J(n.start_at),arrive:J(n.arrive)}):t(`warmup.planned`,{time:J(n.start_at)})}var $e={title:`Wärmeregie`,"tab.overview":`Übersicht`,"tab.rooms":`Räume`,"tab.schedule":`Tagesablauf`,"tab.scenes":`Szenen`,"tab.rules":`Regeln`,"rules.hint":`Regeln verschieben das Grundverhalten in engen Grenzen. Die Schutzregeln unten gewinnen immer. Änderungen wirken nach dem Speichern.`,"rules.why":`Warum gerade so?`,"rules.yours":`Deine Regeln`,"rules.none":`Noch keine Regel. Füge unten eine aus einer Vorlage hinzu.`,"rules.add":`+ {name}`,"rules.protected":`Schutzregeln`,"rules.protected_hint":`Regeln mit Schloss sind fest. Die anderen kannst du ändern, aber nur mit Warnung und in sicheren Grenzen.`,"rule.name.nobody_home":`Niemand zu Hause`,"rule.name.cold_outside":`Kalt draußen`,"rule.name.wind":`Viel Wind`,"rule.name.forecast_drop":`Kälteeinbruch laut Vorhersage`,"rule.name.custom":`Eigene Regel`,"rule.learns":`lernt`,"rule.learn_off":`lernen lassen`,"rule.learn_hint":`Lernwert: stellt sich innerhalb deiner Grenzen selbst nach, höchstens einen Schritt am Tag.`,"rule.learn_between":`zwischen`,"rule.learn_min":`kleinster Wert`,"rule.learn_max":`größter Wert`,"rule.learn_now":`jetzt {value}`,"rule.learn_limit":`steht an deiner Grenze`,"rule.c.name":`Name der Regel`,"rule.c.if":`Wenn (alles muss gelten)`,"rule.c.then":`dann`,"rule.c.none":`Noch keine Bedingung. Ohne Bedingung greift die Regel nie.`,"rule.c.add":`+ Bedingung …`,"rule.c.remove":`Bedingung entfernen`,"rule.c.op":`Vergleich`,"rule.c.below":`unter`,"rule.c.above":`über`,"rule.c.value":`Wert`,"rule.c.from":`von`,"rule.c.to":`bis`,"rule.c.until":`bis`,"rule.c.room":`Raum`,"rule.c.all_away":`alle sind weg`,"rule.c.someone_home":`jemand ist zu Hause`,"rule.c.locked":`ist abgesperrt`,"rule.c.unlocked":`ist aufgesperrt`,"rule.c.no_scene":`keine Szene wechseln`,"rule.c.scene":`Szene „{name}“`,"rule.c.targets_by":`Ziele ändern um`,"rule.c.type.persons":`Personen`,"rule.c.type.lock":`Türschloss`,"rule.c.type.outdoor":`Außentemperatur`,"rule.c.type.wind":`Wind`,"rule.c.type.room_temp":`Raumtemperatur`,"rule.c.type.water":`Kesselwasser`,"rule.c.type.time":`Uhrzeit`,"rule.c.type.day_type":`Tagesart`,"rule.on":`ein`,"rule.off":`aus`,"rule.s.nobody_if":`Wenn alle Personen weg sind`,"rule.s.and_locked":`und die Tür abgesperrt ist`,"rule.s.since":`seit`,"rule.s.then_scene":`dann Szene`,"rule.s.nobody_back":`Kommt jemand zurück oder wird aufgesperrt: zurück zum Zeitplan.`,"rule.s.cold_if":`Wenn es draußen kälter als`,"rule.s.wind_if":`Wenn der Wind stärker als`,"rule.s.is_then":`ist, dann`,"rule.s.fc_if":`Wenn es laut Vorhersage in`,"rule.s.fc_by":`um mindestens`,"rule.s.fc_then":`kälter wird, dann`,"rule.s.targets":`Ziele`,"rule.s.higher_and":`höher und`,"rule.s.earlier":`früher mit dem nächsten wärmeren Abschnitt beginnen.`,"rule.p.after_min":`Wartezeit`,"rule.p.below_c":`Außentemperatur`,"rule.p.above_kmh":`Windstärke`,"rule.p.target_delta_k":`Ziel höher um`,"rule.p.lead_min":`früher beginnen um`,"rule.p.drop_k":`Temperatursturz`,"rule.p.hours":`Zeitraum`,"rule.p.scene":`Szene`,"rule.p.lock":`Türschloss`,"rule.p.lock_hint":`Schloss oder Sensor, der „abgesperrt“ meldet.`,"rule.no_persons":`Es sind noch keine Personen eingetragen (Ofen & Haus). Ohne sie greift die Regel nie.`,"rule.no_weather":`Es ist kein Wetter eingetragen (Ofen & Haus). Ohne das greift die Regel nie.`,"rule.state.unsaved":`noch nicht gespeichert`,"rule.state.off":`aus`,"rule.state.active":`wirkt gerade`,"rule.state.waiting":`wartet`,"rule.state.unknown":`kann nicht prüfen`,"rule.state.trial":`Probelauf`,"rule.state.trial_done":`Probelauf beendet`,"rule.hits":`hätte in 48 Stunden {n}-mal gegriffen`,"rule.last":`zuletzt {time}`,"rule.trial_until":`bis {time}`,"rule.trial_day":`Einen Tag Probelauf`,"rule.arm":`Scharf schalten`,"rule.remove":`Entfernen`,"rule.fixed":`fest`,"rule.change":`Ändern …`,"rule.warn_title":`Achtung, Schutzregel.`,"rule.warn_no":`Lieber nicht`,"rule.warn_yes":`Ich habe das verstanden, ändern`,"rule.new_value":`Neuer Wert ({min} bis {max} {unit})`,"tab.house":`Ofen & Haus`,"tab.log":`Protokoll`,menu:`Menü`,loading:`Wird geladen …`,load_error:`Die Daten von Wärmeregie konnten nicht geladen werden.`,retry:`Erneut versuchen`,not_admin:`Nur Administratoren können das ändern.`,error:`Fehler`,close:`Schließen`,cancel:`Abbrechen`,delete:`Löschen`,add:`Hinzufügen`,remove:`Entfernen`,none:`–`,id:`Kennung`,"mode.shadow_banner":`Schattenbetrieb: es wird nichts geschaltet`,"mode.shadow_banner_hint":`Wärmeregie rechnet nur mit und zeigt, was es tun würde. Ofen und Heizkörper bleiben unberührt.`,"mode.label":`Betriebsart`,"mode.shadow":`Schatten`,"mode.active":`Aktiv`,"mode.confirm_active":`Auf „Aktiv“ umschalten? Dann schaltet Wärmeregie den Ofen und stellt die Heizkörper selbst.`,"mode.confirm_shadow":`Auf „Schatten“ umschalten? Dann wird nichts mehr geschaltet, Wärmeregie rechnet nur noch mit.`,"mode.confirm_yes_active":`Ja, aktiv schalten`,"mode.confirm_yes_shadow":`Ja, nur noch mitrechnen`,"scene.title":`Szene`,"scene.auto":`Automatisch`,"scene.auto_hint":`nach Tagesablauf`,"scene.override_until":`von Hand bis {time}`,"scene.next_change":`nächster Wechsel {time}`,"scene.override_hint":`Eine Szene gilt nach dem Antippen für 3 Stunden.`,"day_type.today":`Heute: {name}`,"stove.title":`Ofen`,"stove.phase.idle":`Bereit`,"stove.phase.block":`Heizblock läuft`,"stove.phase.pause":`Pause`,"stove.phase.blocked":`Gesperrt`,"stove.action.start":`möchte starten`,"stove.action.stop":`möchte ausschalten`,"stove.action.keep":`keine Änderung`,"stove.burning":`brennt`,"stove.not_burning":`brennt nicht`,"stove.unavailable":`Ofen nicht erreichbar`,"stove.starts_today":`Starts heute`,"stove.reignitions_today":`Selbstzündungen heute`,"stove.pause_until":`Pause bis`,"stove.block_since":`Heizblock seit`,"stove.reason":`Grund`,"stove.chrono_warning":`Das Zeitprogramm (Chrono) des Ofens ist an. Im aktiven Betrieb schaltet Wärmeregie es aus; im Schattenbetrieb bitte selbst darauf achten.`,"stove.eco_warning":`Eco ist am Ofen eingeschaltet. Im aktiven Betrieb schaltet Wärmeregie es aus.`,"stove.error":`Der Ofen meldet eine Störung. Solange startet Wärmeregie ihn nicht.`,"stove.error_short":`Störung`,"stove.power_level":`Leistungsstufe`,"stove.water":`Wasser`,"stove.ignitions":`Zündungen`,"stove.no_status":`Noch kein Ofenstatus.`,"house.outdoor":`Außen`,"house.deficit":`Wärmebedarf`,"rooms.title":`Räume`,"room.current":`Ist`,"room.target":`Ziel`,"room.radiator":`Heizkörper`,"room.open":`offen`,"room.open_for":`offen seit {time}`,"room.occupied":`belegt`,"room.empty":`leer`,"room.sensors_missing":`{n} Fühler fehlen`,"room.sensor_missing":`1 Fühler fehlt`,"room.too_cold":`zu kalt`,"rooms.none":`Noch keine Räume eingerichtet.`,"alerts.title":`Hinweise`,"alerts.none":`Alles in Ordnung.`,"actions.title":`Schnellaktionen`,"actions.boost":`+1 °C für 1 Stunde`,"actions.boost_short":`+1 °C`,"actions.pause":`Ofen 2 Stunden pausieren`,"actions.pause_short":`Pause 2 h`,"actions.clear":`Aufheben`,"actions.clear_hint":`Hebt Szene von Hand, Pause und +1 °C auf.`,"actions.boost_active":`+{delta} °C aktiv`,"actions.pause_active":`Ofen pausiert bis {time}`,"actions.done":`Erledigt.`,"editor.unsaved":`Ungespeicherte Änderungen`,"editor.saved":`Alles gespeichert`,"editor.save":`Speichern`,"editor.saving":`Speichert …`,"editor.discard":`Verwerfen`,"editor.save_error":`Speichern fehlgeschlagen: {message}`,"editor.save_ok":`Gespeichert.`,"editor.fix_errors":`Bitte zuerst die rot markierten Angaben korrigieren.`,"editor.leave_warning":`Es gibt ungespeicherte Änderungen.`,"rooms.add_placeholder":`Name des neuen Raums, z. B. Wohnzimmer`,"rooms.add":`Raum hinzufügen`,"rooms.select":`Raum auswählen`,"room.name":`Name`,"room.importance":`Wichtigkeit`,"room.importance_hint":`Wichtige Räume zählen stärker, wenn entschieden wird, ob der Ofen startet.`,"importance.1":`niedrig`,"importance.2":`mittel`,"importance.3":`hoch`,"room.radiators":`Heizkörperthermostate`,"room.radiators_hint":`Thermostate in diesem Raum (z. B. Tado).`,"room.sensors":`Temperaturfühler`,"room.sensors_hint":`Wird kein Fühler gewählt, gilt die Temperatur der Thermostate. Das erste Feld ist das Gewicht (wie stark ein Fühler zählt), das zweite eine Korrektur in K.`,"room.weight":`Gewicht`,"room.openings":`Fenster und Türen`,"room.openings_hint":`Ist etwas offen, wird hier nicht geheizt.`,"room.presence":`Anwesenheit`,"room.presence_hint":`Bewegungs- oder Anwesenheitsmelder. Optional.`,"room.humidity":`Luftfeuchte`,"room.humidity_hint":`Optional. Ist das Fenster bei hoher Feuchte offen (z. B. nach dem Duschen), ist das gewolltes Lüften: keine Meldung, bis die Feuchte wieder unten ist.`,"room.ventilate":`Lüften wegen Feuchte`,"room.ventilate_hint":`Feucht ist der Raum, wenn die Feuchte über der Schwelle liegt ODER um den Anstieg über dem Tiefstwert der letzten 90 Minuten. 0 schaltet den jeweiligen Wert ab.`,"room.ventilate_humidity":`Schwelle`,"room.ventilate_rise":`Anstieg über Grundwert`,"room.ventilating":`Lüften wegen Feuchte ({value} %)`,"room.targets":`Zieltemperaturen je Szene`,"room.targets_hint":`Leer lassen = Standardwert der Szene.`,"room.devices":`Geräte`,"room.devices_hint":`Pausierte Geräte bleiben eingetragen, werden aber nicht verwendet, z. B. wenn ein Melder offline ist.`,"room.recovering":`lüftet nach bis {time}`,"dev.pause":`Pausieren`,"dev.resume":`Wieder verwenden`,"dev.paused":`pausiert`,"dev.unavailable":`nicht verfügbar`,"dev.add":`Gerät hinzufügen`,"dev.open":`offen`,"dev.closed":`zu`,"dev.occupied":`belegt`,"dev.empty":`leer`,"dev.none":`keine`,"dev.unavail_count":`{n} Geräte nicht verfügbar`,"dev.unavail_one":`1 Gerät nicht verfügbar`,"dev.pause_unavail":`Nicht verfügbare pausieren`,"dev.held":`kurz weg, letzter Wert gilt`,"dev.drops":`{n}× weg (24 h)`,"param.opening_check_min":`Fenster prüfen nach`,"param.opening_check_min_hint":`Meldet ein Fenster so lange offen und der Raum kühlt nicht ab, kommt ein Hinweis aufs Handy: Sensor prüfen. Der Raum bleibt trotzdem auf Frostschutz. 0 = aus.`,"param.sensor_hold_min":`Aussetzer überbrücken bis`,"param.sensor_hold_min_hint":`Ist ein Sensor kurz nicht erreichbar, gilt so lange sein letzter Wert. Ein offenes Fenster bleibt also offen. Danach zählt ein Fenster als zu und ein Fühler wird weggelassen. 0 = aus.`,"param.sensor_alert_min":`Ausfall melden nach`,"param.sensor_alert_min_hint":`Ist ein Sensor so lange nicht erreichbar, kommt eine Nachricht aufs Handy, höchstens einmal am Tag je Sensor. 0 = keine Nachricht.`,"param.opening_recovery_min":`Nach dem Lüften warten`,"param.opening_recovery_min_hint":`So lange zählt ein gelüfteter Raum nach dem Schließen nicht für den Ofenstart. Die Luft wird von selbst schnell wieder warm. 0 = aus.`,"room.delete":`Raum löschen`,"room.delete_confirm":`Raum „{name}“ wirklich löschen? Das lässt sich nach dem Speichern nicht rückgängig machen.`,"schedule.day_types":`Tagesarten`,"schedule.day_types_hint":`Eine Tagesart legt fest, ab wann welche Szene gilt. Vor dem ersten Zeitpunkt gilt die letzte Szene des Vortags.`,"schedule.add_placeholder":`Name der neuen Tagesart, z. B. Homeoffice`,"schedule.add":`Tagesart hinzufügen`,"schedule.slot_from":`ab`,"schedule.add_slot":`Zeitpunkt hinzufügen`,"schedule.week":`Woche`,"schedule.week_hint":`Welche Tagesart gilt an welchem Tag?`,"schedule.delete_day_type":`Tagesart löschen`,"schedule.delete_confirm":`Tagesart „{name}“ wirklich löschen?`,"schedule.in_use":`Wird in der Woche verwendet ({days}). Bitte dort zuerst eine andere Tagesart wählen.`,"schedule.no_scenes":`Bitte zuerst unter „Szenen“ eine Szene anlegen.`,"slot.time_format":`Uhrzeit bitte als HH:MM angeben.`,"slot.not_ascending":`Die Zeiten müssen aufsteigend sein.`,"slot.scene_missing":`Bitte eine Szene wählen.`,"slot.scene_unknown":`Diese Szene gibt es nicht mehr.`,"slot.empty":`Mindestens ein Zeitpunkt ist nötig.`,"week.mon":`Montag`,"week.tue":`Dienstag`,"week.wed":`Mittwoch`,"week.thu":`Donnerstag`,"week.fri":`Freitag`,"week.sat":`Samstag`,"week.sun":`Sonntag`,"week.holiday":`Feiertag`,"week.unset":`– bitte wählen –`,"scenes.title":`Szenen`,"scenes.hint":`Eine Szene ist ein Wärmewunsch, z. B. Komfort oder Sparen.`,"scenes.add_placeholder":`Name der neuen Szene, z. B. Komfort`,"scenes.add":`Szene hinzufügen`,"scene.name":`Name`,"scene.icon":`Symbol`,"scene.icon_hint":`z. B. mdi:sofa`,"scene.stove":`Ofen`,"scene.stove.allow":`darf heizen`,"scene.stove.frost_only":`nur gegen Kälte (Frost/Nacht)`,"scene.stove.deny":`bleibt aus`,"scene.default_target":`Standardziel`,"scene.delete":`Szene löschen`,"scene.delete_confirm":`Szene „{name}“ wirklich löschen? Eigene Zieltemperaturen der Räume für diese Szene werden entfernt.`,"scene.in_use":`Wird im Tagesablauf verwendet ({names}). Bitte dort zuerst ersetzen.`,"scenes.matrix":`Zieltemperaturen Raum × Szene`,"scenes.matrix_hint":`Leere Felder verwenden das Standardziel der Szene.`,"scenes.none":`Noch keine Szenen.`,"house.stove":`Ofen`,"house.stove_climate":`Ofen-Thermostat`,"house.stove_climate_hint":`Pflicht. Die Thermostat-Entität des Pelletofens.`,"house.stove_climate_active_hint":`Ohne Ofen-Thermostat kann Wärmeregie nur im Schattenbetrieb laufen.`,"house.power":`Leistungsstufe`,"house.power_hint":`Optional. Auswahl- oder Zahl-Entität für die Stufe 1 bis 5.`,"house.stove_functions":`Ofen-Funktionen`,"house.stove_functions_hint":`Im aktiven Betrieb schaltet Wärmeregie das Zeitprogramm (Chrono) und Eco des Ofens aus und wählt die Leistungsstufe selbst. Im Schattenbetrieb gibt es nur Hinweise.`,"house.chrono_switch":`Zeitprogramm (Chrono)`,"house.chrono_switch_hint":`Optional. Schalter für das eigene Zeitprogramm des Ofens.`,"house.eco_switch":`Eco`,"house.eco_switch_hint":`Optional. Schalter für den Eco-Modus des Ofens.`,"house.error_sensor":`Störung`,"house.error_sensor_hint":`Optional. Meldet der Ofen eine Störung, wird er nicht gestartet.`,"house.water_sensor":`Wassertemperatur`,"house.water_sensor_hint":`Optional. Nur zur Anzeige.`,"house.ignitions_sensor":`Zündzähler`,"house.ignitions_sensor_hint":`Optional. Nur zur Anzeige.`,"house.environment":`Wetter und Kalender`,"house.weather":`Wetter`,"house.weather_hint":`Optional. Für die Vorhersage.`,"house.outdoor_sensor":`Außenfühler`,"house.outdoor_sensor_hint":`Optional. Genauer als die Wettervorhersage.`,"house.workday":`Arbeitstag`,"house.workday_hint":`Optional. Erkennt Feiertage (Integration „Arbeitstag“).`,"house.people":`Bewohner`,"house.persons":`Personen`,"house.persons_hint":`Ist niemand zu Hause, wird gespart.`,"house.pet":`Haustier`,"house.pet_hint":`Optional. Ist ein Tier zu Hause, wird nicht unter die Frostgrenze abgesenkt.`,"house.notify":`Benachrichtigungen`,"house.notify_hint":`Wohin sollen Hinweise geschickt werden?`,"house.notify_none":`Keine Benachrichtigungsdienste gefunden.`,"house.notify_unknown":`nicht mehr vorhanden`,"house.messages":`Meldungen`,"house.messages_hint":`Was soll aufs Handy kommen, wie oft und wann nicht?`,"house.msg_kinds":`Diese Meldungen schicken`,"msg.opening":`Fenster oder Tür länger offen`,"msg.opening_check":`Fenster meldet offen, Raum kühlt nicht ab`,"msg.sensor":`Geräte nicht erreichbar`,"msg.pellets":`Pellets nachfüllen`,"msg.stove_error":`Störung des Ofens (auch in der Ruhezeit)`,"msg.overheat":`Kesselschutz: Wasser zu heiß (auch in der Ruhezeit)`,"msg.too_warm":`Ofen ausgeschaltet, weil das Haus zu warm ist`,"msg.activity":`Was die Heizung gerade tut (Ofen startet, Ofen ist aus, mit Grund)`,"msg.opening_delay_min":`Fenster erst melden nach`,"msg.opening_delay_min_hint":`Kurzes Lüften bleibt still. Die Heizung reagiert trotzdem sofort.`,"msg.repeat_min":`Gleiche Meldung frühestens wieder nach`,"msg.repeat_min_hint":`Verhindert, dass ein Fenster, das auf und zu geht, jedes Mal meldet. 0 = keine Sperre.`,"msg.ventilate_max_min":`Lüften wegen Feuchte höchstens`,"msg.ventilate_max_min_hint":`Steht das Fenster nach dem Duschen länger offen, kommt danach doch eine Meldung.`,"msg.quiet":`Ruhezeit`,"msg.quiet_hint":`In dieser Zeit kommt nur die Ofen-Störung. Beide Felder leer = keine Ruhezeit.`,"msg.quiet_start":`von`,"msg.quiet_end":`bis`,"msg.quiet_invalid":`Beginn und Ende angeben (HH:MM) und nicht gleich.`,"msg.quiet_hold":`Danach gesammelt in einer Nachricht schicken (sonst verwerfen)`,"house.parameters":`Regelwerte`,"house.parameters_hint":`Die Voreinstellungen passen für die meisten Häuser. Nur ändern, wenn nötig.`,"house.out_of_range":`Erlaubt: {min} bis {max}`,"pgroup.stove":`Ofen starten und stoppen`,"pgroup.openings":`Fenster und Türen`,"pgroup.sensors":`Ausfall von Sensoren`,"pgroup.radiators":`Heizkörper`,"pgroup.limits":`Untergrenzen`,"pgroup.presence":`Anwesenheit`,"pgroup.buffer":`Heizkörper als Puffer`,"pgroup.buffer_hint":`Ohne Pufferspeicher nehmen die Heizkörper die Wärme aus dem Kessel auf`,"param.dump_start_c":`Wärmeabfuhr: Mitte bei`,"param.dump_start_c_hint":`Statt bei einer Temperatur schlagartig alles aufzudrehen, öffnet die Wärmeregie die Heizkörper umso weiter, je heißer der Kessel ist. Um diese Temperatur herum öffnen sie sich spürbar. Das Lernen kann diesen Wert nur senken.`,"param.dump_end_c":`Wärmeabfuhr endet unter`,"param.dump_end_c_hint":`Darunter gelten wieder die normalen Sollwerte. Muss unter der Mitte liegen.`,"param.dump_extra_k":`Heizkörper höchstens wärmer um`,"param.dump_extra_k_hint":`So viel über Ziel bzw. Raumtemperatur stellt die Wärmeregie die Heizkörper bei sehr heißem Kessel. Schon warme Räume bekommen bis zur Hälfte weniger, nahe am Kesselschutz alle den vollen Wert.`,"param.dump_ramp_low_k":`Beginnt so weit darunter`,"param.dump_ramp_low_k_hint":`Ab Mitte minus diesem Wert öffnet die Wärmeregie die Heizkörper ein wenig.`,"param.dump_ramp_high_k":`Ganz offen so weit darüber`,"param.dump_ramp_high_k_hint":`Ab Mitte plus diesem Wert gilt der volle Zusatz.`,"house.buffer_explain":`Ein Pelletofen ohne Pufferspeicher kann seine Wärme nur über die Heizkörper loswerden. Sind sie zu, kocht das Wasser hoch (Nachwärme nach dem Abschalten). Die Wärmeregie öffnet sie deshalb unscharf: je heißer der Kessel, desto weiter. Ab 90 °C greift zusätzlich der Kesselschutz.`,"house.has_buffer":`Pufferspeicher vorhanden`,"house.has_buffer_hint":`Nur einschalten, wenn wirklich ein Puffer da ist. Dann gibt es keine Wärmeabfuhr über die Heizkörper.`,"house.dump_learn":`Aus dem Betrieb lernen`,"house.dump_learn_hint":`Misst Nachwärme und Abschalttemperatur des Ofens und öffnet die Heizkörper bei Bedarf früher. Nie später als eingestellt.`,"learn.title":`Gelernt`,"learn.hint":`Gleitende Mittelwerte aus dem laufenden Betrieb. Sie wirken erst nach einigen Messungen.`,"learn.selfoff_c":`Ofen schaltet selbst ab bei`,"learn.afterheat_k":`Nachwärme nach dem Abschalten`,"learn.cool_k_min":`Abkühlen bei offenen Heizkörpern`,"learn.dump_start_c":`Wirksame Mitte der Wärmeabfuhr`,"learn.samples":`Messungen`,"learn.min_samples":`wirkt ab {n} Messungen`,"learn.none":`Noch keine Daten.`,"learn.reset":`Gelerntes zurücksetzen`,"learn.reset_confirm":`Gelernte Werte wirklich vergessen?`,"pgroup.pellets":`Pellets`,"param.pellet_bag_kg":`Gewicht eines Sacks`,"param.pellet_bag_kg_hint":`So viel zählt der Knopf „Sack Pellets nachgefüllt“ dazu.`,"param.pellet_capacity_kg":`Fassungsvermögen des Behälters`,"param.pellet_capacity_kg_hint":`Mehr passt nicht hinein; der Vorrat wird darauf begrenzt.`,"param.pellet_rate_kg_h":`Verbrauch pro Brennstunde (Startwert)`,"param.pellet_rate_kg_h_hint":`Gilt, bis die Wärmeregie aus einem leeren Behälter den echten Wert gelernt hat.`,"param.pellet_reminder_kg":`Erinnern ab Vorrat`,"param.pellet_reminder_kg_hint":`Fällt die Schätzung darunter, kommt eine Nachricht.`,"stove.pellets":`Pellets`,"stove.pellets_empty":`leer`,"pgroup.power":`Leistungsstufe`,"pgroup.other":`Weitere`,"param.start_below_k":`Start, wenn so viel unter Ziel`,"param.start_below_k_hint":`Der Ofen startet erst, wenn die Wohnräume so viel kälter als gewünscht sind.`,"param.stop_above_k":`Stopp, wenn so viel über Ziel`,"param.stop_above_k_hint":`Der Heizblock endet, wenn es so viel wärmer als gewünscht ist.`,"param.hard_stop_above_k":`Sofort aus, wenn so viel über Ziel`,"param.hard_stop_above_k_hint":`Ist das Haus so viel zu warm, endet jeder Heizblock nach frühestens 30 Minuten, auch vor der Mindestbrenndauer. Ein von Hand eingeschalteter Ofen wird dann gleich wieder ausgeschaltet. 0 = aus.`,"param.min_burn_min":`Kürzeste Brenndauer`,"param.min_burn_min_hint":`Ein Heizblock läuft mindestens so lange. Schont den Ofen.`,"param.max_burn_min":`Längste Brenndauer`,"param.max_burn_min_hint":`Danach wird ein Heizblock immer beendet.`,"param.min_pause_min":`Kürzeste Pause`,"param.min_pause_min_hint":`So lange bleibt der Ofen nach einem Heizblock mindestens aus.`,"param.max_starts_per_day":`Starts pro Tag höchstens`,"param.max_starts_per_day_hint":`Wenige lange Heizblöcke sind besser als häufiges An und Aus.`,"param.opening_grace_min":`Kurz lüften erlaubt`,"param.opening_grace_min_hint":`So lange darf ein Fenster offen sein, ohne dass etwas passiert.`,"param.opening_stop_min":`Ofen stoppt bei offenem Fenster nach`,"param.opening_stop_min_hint":`Bleibt ein Fenster länger offen, wird der Heizblock beendet.`,"param.opening_empty_room_min":`Leerer Raum: Heizkörper zu nach`,"param.opening_empty_room_min_hint":`In einem leeren Raum mit offenem Fenster wird der Heizkörper schon so früh abgedreht.`,"param.radiator_boost_k":`Heizkörper-Vorlauf`,"param.radiator_boost_k_hint":`Während der Ofen brennt, werden die Heizkörper so viel höher gestellt.`,"param.frost_c":`Frostgrenze`,"param.frost_c_hint":`Kälter darf es nie werden. Gilt auch bei Szenen, in denen der Ofen sonst aus bleibt.`,"param.night_floor_c":`Nachtuntergrenze`,"param.night_floor_c_hint":`Nachts wird mindestens auf diese Temperatur geheizt.`,"param.stove_block_setpoint_c":`Ofen-Sollwert im Heizblock`,"param.stove_block_setpoint_c_hint":`Auf diesen Wert wird das Ofen-Thermostat gestellt, damit er sicher durchbrennt.`,"param.presence_empty_min":`Raum gilt als leer nach`,"param.presence_empty_min_hint":`So lange ohne Bewegung, dann gilt ein Raum als leer.`,"param.power_min":`Kleinste Leistungsstufe`,"param.power_min_hint":`Mit dieser Stufe läuft ein Heizblock bei mildem Wetter (1 bis 5).`,"param.power_max":`Größte Leistungsstufe`,"param.power_max_hint":`Höchste Stufe, die Wärmeregie wählt (1 bis 5).`,"param.power_cold_c":`Volle Leistung unter`,"param.power_cold_c_hint":`Ist es draußen kälter, wird die größte Leistungsstufe gewählt.`,"log.title":`Protokoll`,"log.empty":`Noch keine Einträge.`,"log.shadow":`Schatten`,"log.shadow_hint":`Nur berechnet, nicht geschaltet`,"picker.search":`Suchen …`,"picker.no_results":`Keine passenden Entitäten.`,"picker.show_all":`auch andere Arten anzeigen`,"picker.missing":`nicht gefunden`,"picker.more":`Weitere Treffer – bitte genauer suchen.`,"hero.inside":`Drinnen`,"hero.target":`Ziel {temp}`,"hero.error":`Der Ofen meldet eine Störung.`,"hero.prepare":`Heizkörper öffnen, Ofen zündet um {time}`,"hero.self_off":`Ofen hat selbst abgeschaltet (Wasser heiß), wartet auf Neustart`,"stove.overheat":`Kesselschutz: Wasser zu heiß, Ofen aus, alle Heizkörper offen`,"hero.burning":`Ofen brennt seit {time}`,"hero.block":`Heizblock seit {time}`,"hero.warmup_planned":`Aufheizen beginnt um {time}`,"hero.paused":`Ofen pausiert bis {time}`,"hero.pause":`Ofen aus, Pause bis {time}`,"hero.idle_warm":`Ofen aus, es ist warm genug`,"hero.idle":`Ofen aus`,"warmup.button":`Aufheizen`,"warmup.title":`Haus aufheizen`,"warmup.intro":`Der Ofen startet auch, wenn es noch warm genug ist, und alle Heizkörper gehen auf. Danach geht es wieder nach Tagesablauf.`,"warmup.now":`Jetzt aufheizen`,"warmup.for":`für {time}`,"warmup.arrive":`Ich komme um`,"warmup.plan":`Planen`,"warmup.arrive_hint":`Wärmeregie beginnt etwa {lead} min vorher und hält das Haus danach noch eine Stunde warm.`,"warmup.cancel":`Aufheizen abbrechen`,"warmup.active_until":`Aufheizen bis {time}`,"cold.active_until":`Mir ist kalt: wärmer bis {time}`,"cold.title":`Mir ist kalt`,"cold.button":`Jetzt wärmer`,"cold.hint":`Die Wärmeregie entscheidet selbst: Ist im Kessel noch Wärme, öffnet sie nur die Heizkörper. Sonst startet sie den Ofen.`,"param.cold_min":`Mir ist kalt: Dauer`,"param.cold_min_hint":`So lange gelten nach „Mir ist kalt“ die höheren Ziele.`,"param.cold_residual_c":`Mir ist kalt: Restwärme nutzen ab`,"param.cold_residual_c_hint":`Ist das Kesselwasser mindestens so warm, öffnet Wärmeregie zuerst nur die Heizkörper. Wird das Haus in 15 Minuten nicht wärmer, startet der Ofen. 0 = immer gleich den Ofen starten.`,"warmup.planned":`Aufheizen ab {time}`,"warmup.planned_arrive":`Aufheizen ab {time} (Ankunft {arrive})`,"pause.button":`Pause`,"pause.title":`Ofen pausieren`,"pause.intro":`Solange startet Wärmeregie den Ofen nicht. Ein laufender Heizblock wird beendet.`,"pause.for":`{h} h`,"pause.cancel":`Pause aufheben`,"more.title":`Mehr`,"actions.clear_all":`Alles von Hand aufheben`,"feedback.title":`Wie ist es gerade?`,"feedback.house":`Ganzes Haus`,"feedback.cold":`Zu kalt`,"feedback.ok":`Passt`,"feedback.warm":`Zu warm`,"feedback.done_house_cold":`Gemerkt. Die Wärmeregie macht es jetzt wärmer (wie „Mir ist kalt“).`,"feedback.done_house_ok":`Gemerkt, danke.`,"feedback.done_house_warm":`Gemerkt. Alle Ziele sind für eine Stunde 1 K niedriger.`,"feedback.done_room_cold":`Gemerkt. Das Ziel in diesem Raum ist für eine Stunde 1 K höher.`,"feedback.done_room_ok":`Gemerkt, danke.`,"feedback.done_room_warm":`Gemerkt. Das Ziel in diesem Raum ist für eine Stunde 1 K niedriger.`,"feedback.suggestion":`Vorschlag`,"feedback.accept":`Annehmen`,"feedback.adjust":`Anpassen`,"feedback.dismiss":`Nein danke`,"feedback.apply":`Übernehmen`,"feedback.adjust_time":`Beginn (HH:MM)`,"feedback.adjust_temp":`Ziel in °C`,"feedback.accepted":`Übernommen. Du findest die Änderung im Zeitplan bzw. bei den Szenen.`,"feedback.dismissed":`In Ordnung, der Vorschlag kommt vorerst nicht wieder.`,"feedback.admin_only":`Annehmen oder ablehnen kann nur ein Verwalter.`,"ai.title":`KI-Berater`,"ai.hint":`Die KI schaut sich deine Rückmeldungen und Einstellungen an und macht Vorschläge. Geändert wird nur, was du annimmst. Schutzregeln kann sie nicht anfassen.`,"ai.ask":`KI um Vorschläge fragen`,"ai.asking":`Die KI denkt nach …`,"ai.preview":`Zeigen, was geschickt wird`,"ai.preview_hide":`Vorschau schließen`,"ai.missing":`Es ist noch keine KI eingetragen. Wähle sie unter „Ofen & Haus“ im Abschnitt Umgebung (KI-Berater).`,"ai.last":`Letzte Anfrage: {time}`,"ai.none":`Keine offenen Vorschläge.`,"ai.dropped":`Von der KI verworfen, weil nicht erlaubt: {n}`,"house.ai_task":`KI-Berater`,"house.ai_task_hint":`Optional. Eine KI-Aufgabe aus Home Assistant (z. B. OpenAI). Sie bekommt nur anonyme Daten, und nur wenn du sie fragst.`,"feedback.suggestion_ai":`Vorschlag der KI`,"feedback.accepted_ai":`Übernommen.`,"feedback.adjust_value":`Wert ({min} bis {max})`,"feedback.locked":`Speichere oder verwirf zuerst deine offenen Änderungen, dann kannst du Vorschläge annehmen.`,"msg.suggestion":`Neuer Vorschlag aus deinen Rückmeldungen`,"chart.title":`Verlauf 24 Stunden`,"history.title":`Räume und Kessel, letzte 24 Stunden`,"history.rooms":`Raumtemperaturen`,"history.rooms_aria":`Verlauf der Raumtemperaturen, des Mittelwerts und des Ziels`,"history.house":`Mittel aller Räume`,"history.water":`Kesselwasser`,"history.water_short":`Kessel`,"history.water_aria":`Verlauf der Kesseltemperatur`,"history.empty":`Für diese Auswahl gibt es noch keine Werte.`,"history.no_water":`Für den Kessel gibt es in diesem Zeitraum noch keine Werte.`,"history.show":`Linien ein- und ausblenden`,"history.all_hidden":`Alle Linien sind ausgeblendet. Tippe oben auf einen Namen, um ihn wieder einzublenden.`,"history.more_rooms":`{n} weitere Räume sind nicht einzeln gezeichnet, zählen aber im Mittel mit.`,"chart.aria":`Temperaturverlauf drinnen, {from} bis {to} Grad`,"chart.house":`Drinnen`,"chart.target":`Ziel`,"chart.burning":`Ofen brennt`,"pellets.title":`Pellets`,"pellets.until":`reicht bis {time}`,"pellets.low":`Bald nachfüllen`,"pellets.estimate":`Verbrauch noch geschätzt`,"pellets.refill":`Sack nachgefüllt`,"pellets.refill_done":`Ein Sack wurde dazugezählt.`,"pellets.aria":`Pelletbehälter {pct} Prozent voll`,"details.title":`Details`,"details.day_type":`Tagesart`,"stove.phase.prepare":`Sanfter Start`,"house.mode_hint":`Im Schattenbetrieb rechnet Wärmeregie nur mit. Im aktiven Betrieb schaltet sie Ofen und Heizkörper.`,"house.sect_stove_hint":`Thermostat, Leistungsstufe und Funktionen des Ofens`,"house.sect_env_hint":`Wetter, Außenfühler, Feiertage`,"house.sect_people_hint":`Personen, Haustier, Benachrichtigungen`,"house.warmup_scene":`Ziele beim Aufheizen`,"house.warmup_scene_hint":`Diese Szene bestimmt die Zieltemperaturen beim Aufheizen.`,"house.warmup_scene_auto":`automatisch (erste Szene mit Ofen erlaubt)`,"pgroup.stove_hint":`Wann der Ofen startet und wie lange er brennt`,"pgroup.softstart":`Sanfter Start`,"pgroup.softstart_hint":`Heizkörper vor dem Zünden öffnen, Verhalten bei heißem Wasser`,"pgroup.warmup":`Aufheizen`,"pgroup.warmup_hint":`„Haus aufheizen“ und „Ich komme um …“`,"pgroup.openings_hint":`Lüften, offene Türen, Prüfung der Melder`,"pgroup.sensors_hint":`Was passiert, wenn ein Fühler weg ist`,"pgroup.power_hint":`Nur mit einer Entität für die Leistungsstufe`,"pgroup.radiators_hint":`Wie weit die Heizkörper im Heizblock aufgehen`,"pgroup.limits_hint":`Frostschutz und Nacht`,"pgroup.presence_hint":`Leere Räume etwas kühler`,"pgroup.pellets_hint":`Sackgewicht, Behälter, Verbrauch`,"pgroup.other_hint":`Weitere Werte`,"param.soft_start_min":`Heizkörper vorher öffnen`,"param.soft_start_min_hint":`So lange vor dem Zünden gehen die Heizkörper auf, damit das Wasser im Ofen nicht zu schnell heiß wird. 0 = aus.`,"param.self_off_wait_min":`Warten nach Selbstabschaltung`,"param.self_off_wait_min_hint":`Schaltet der Ofen im Heizblock selbst ab, weil das Wasser heiß ist, wartet Wärmeregie so lange auf den Neustart. 0 = Block endet sofort.`,"param.warmup_extra_k":`Aufheizen: wärmer als Ziel`,"param.warmup_extra_k_hint":`So viel über den Zielen der Aufheiz-Szene.`,"param.warmup_lead_min":`Vorlauf vor der Ankunft`,"param.warmup_lead_min_hint":`So lange vor „Ich komme um …“ beginnt das Aufheizen.`,"room.offset":`Korrektur`,"room.offset_hint":`Korrektur in K, wird zum Messwert addiert (z. B. -0,5, wenn der Fühler zu warm misst).`,"card.chart":`Verlauf`,"card.name":`Wärmeregie`,"card.description":`Ofen, Szene und Räume auf einen Blick.`,"card.no_rooms":`Keine Räume ausgewählt.`,"card.open_panel":`Wärmeregie öffnen`},et={title:`Wärmeregie`,"tab.overview":`Overview`,"tab.rooms":`Rooms`,"tab.schedule":`Schedule`,"tab.scenes":`Scenes`,"tab.rules":`Rules`,"rules.hint":`Rules shift the basic behaviour within narrow limits. The protection rules below always win. Changes take effect after saving.`,"rules.why":`Why like this right now?`,"rules.yours":`Your rules`,"rules.none":`No rule yet. Add one from a template below.`,"rules.add":`+ {name}`,"rules.protected":`Protection rules`,"rules.protected_hint":`Rules with a lock are fixed. The others can be changed, but only with a warning and within safe limits.`,"rule.name.nobody_home":`Nobody home`,"rule.name.cold_outside":`Cold outside`,"rule.name.wind":`Strong wind`,"rule.name.forecast_drop":`Cold snap in the forecast`,"rule.name.custom":`Custom rule`,"rule.learns":`learning`,"rule.learn_off":`let it learn`,"rule.learn_hint":`Learning value: adjusts itself within your limits, one step a day at most.`,"rule.learn_between":`between`,"rule.learn_min":`lowest value`,"rule.learn_max":`highest value`,"rule.learn_now":`now {value}`,"rule.learn_limit":`at your limit`,"rule.c.name":`Rule name`,"rule.c.if":`If (all must apply)`,"rule.c.then":`then`,"rule.c.none":`No condition yet. Without a condition the rule never applies.`,"rule.c.add":`+ Condition …`,"rule.c.remove":`Remove condition`,"rule.c.op":`Comparison`,"rule.c.below":`below`,"rule.c.above":`above`,"rule.c.value":`Value`,"rule.c.from":`from`,"rule.c.to":`to`,"rule.c.until":`to`,"rule.c.room":`Room`,"rule.c.all_away":`everyone is away`,"rule.c.someone_home":`someone is home`,"rule.c.locked":`is locked`,"rule.c.unlocked":`is unlocked`,"rule.c.no_scene":`do not change the scene`,"rule.c.scene":`scene "{name}"`,"rule.c.targets_by":`change targets by`,"rule.c.type.persons":`Persons`,"rule.c.type.lock":`Door lock`,"rule.c.type.outdoor":`Outdoor temperature`,"rule.c.type.wind":`Wind`,"rule.c.type.room_temp":`Room temperature`,"rule.c.type.water":`Boiler water`,"rule.c.type.time":`Time of day`,"rule.c.type.day_type":`Day type`,"rule.on":`on`,"rule.off":`off`,"rule.s.nobody_if":`If everyone is away`,"rule.s.and_locked":`and the door is locked`,"rule.s.since":`for`,"rule.s.then_scene":`then scene`,"rule.s.nobody_back":`When someone returns or the door is unlocked: back to the schedule.`,"rule.s.cold_if":`If it is colder outside than`,"rule.s.wind_if":`If the wind is stronger than`,"rule.s.is_then":`, then`,"rule.s.fc_if":`If the forecast says that within`,"rule.s.fc_by":`it gets at least`,"rule.s.fc_then":`colder, then`,"rule.s.targets":`targets`,"rule.s.higher_and":`higher and start`,"rule.s.earlier":`earlier with the next warmer slot.`,"rule.p.after_min":`Waiting time`,"rule.p.below_c":`Outdoor temperature`,"rule.p.above_kmh":`Wind speed`,"rule.p.target_delta_k":`Raise target by`,"rule.p.lead_min":`Start earlier by`,"rule.p.drop_k":`Temperature drop`,"rule.p.hours":`Period`,"rule.p.scene":`Scene`,"rule.p.lock":`Door lock`,"rule.p.lock_hint":`Lock or sensor that reports locked.`,"rule.no_persons":`No persons are set up yet (Stove & house). Without them the rule never applies.`,"rule.no_weather":`No weather entity is set up (Stove & house). Without it the rule never applies.`,"rule.state.unsaved":`not saved yet`,"rule.state.off":`off`,"rule.state.active":`active now`,"rule.state.waiting":`waiting`,"rule.state.unknown":`cannot check`,"rule.state.trial":`trial run`,"rule.state.trial_done":`trial run finished`,"rule.hits":`would have applied {n} times in 48 hours`,"rule.last":`last {time}`,"rule.trial_until":`until {time}`,"rule.trial_day":`Trial run for a day`,"rule.arm":`Arm`,"rule.remove":`Remove`,"rule.fixed":`fixed`,"rule.change":`Change …`,"rule.warn_title":`Careful, protection rule.`,"rule.warn_no":`Better not`,"rule.warn_yes":`I understand, change it`,"rule.new_value":`New value ({min} to {max} {unit})`,"tab.house":`Stove & house`,"tab.log":`Log`,menu:`Menu`,loading:`Loading …`,load_error:`Could not load Wärmeregie data.`,retry:`Try again`,not_admin:`Only administrators can change this.`,error:`Error`,close:`Close`,cancel:`Cancel`,delete:`Delete`,add:`Add`,remove:`Remove`,none:`–`,id:`ID`,"mode.shadow_banner":`Shadow mode: nothing is being switched`,"mode.shadow_banner_hint":`Wärmeregie only calculates and shows what it would do. Stove and radiators are left alone.`,"mode.label":`Mode`,"mode.shadow":`Shadow`,"mode.active":`Active`,"mode.confirm_active":`Switch to “Active”? Wärmeregie will then control the stove and set the radiators.`,"mode.confirm_shadow":`Switch to “Shadow”? Nothing will be switched any more, Wärmeregie only calculates.`,"mode.confirm_yes_active":`Yes, go active`,"mode.confirm_yes_shadow":`Yes, only calculate`,"scene.title":`Scene`,"scene.auto":`Automatic`,"scene.auto_hint":`by schedule`,"scene.override_until":`manual until {time}`,"scene.next_change":`next change {time}`,"scene.override_hint":`A tapped scene applies for 3 hours.`,"day_type.today":`Today: {name}`,"stove.title":`Stove`,"stove.phase.idle":`Ready`,"stove.phase.block":`Heating block running`,"stove.phase.pause":`Pause`,"stove.phase.blocked":`Blocked`,"stove.action.start":`wants to start`,"stove.action.stop":`wants to stop`,"stove.action.keep":`no change`,"stove.burning":`burning`,"stove.not_burning":`not burning`,"stove.unavailable":`Stove not reachable`,"stove.starts_today":`Starts today`,"stove.reignitions_today":`Self-ignitions today`,"stove.pause_until":`Pause until`,"stove.block_since":`Block since`,"stove.reason":`Reason`,"stove.chrono_warning":`The stove's own timer (chrono) is on. In active mode Wärmeregie switches it off; in shadow mode please keep an eye on it yourself.`,"stove.eco_warning":`Eco is switched on at the stove. In active mode Wärmeregie switches it off.`,"stove.error":`The stove reports a fault. Wärmeregie will not start it until it is cleared.`,"stove.error_short":`Fault`,"stove.power_level":`Power level`,"stove.water":`Water`,"stove.ignitions":`Ignitions`,"stove.no_status":`No stove status yet.`,"house.outdoor":`Outdoor`,"house.deficit":`Heat demand`,"rooms.title":`Rooms`,"room.current":`Now`,"room.target":`Target`,"room.radiator":`Radiator`,"room.open":`open`,"room.open_for":`open for {time}`,"room.occupied":`occupied`,"room.empty":`empty`,"room.sensors_missing":`{n} sensors missing`,"room.sensor_missing":`1 sensor missing`,"room.too_cold":`too cold`,"rooms.none":`No rooms set up yet.`,"alerts.title":`Notices`,"alerts.none":`All fine.`,"actions.title":`Quick actions`,"actions.boost":`+1 °C for 1 hour`,"actions.boost_short":`+1 °C`,"actions.pause":`Pause stove for 2 hours`,"actions.pause_short":`Pause 2 h`,"actions.clear":`Cancel`,"actions.clear_hint":`Cancels manual scene, pause and +1 °C.`,"actions.boost_active":`+{delta} °C active`,"actions.pause_active":`Stove paused until {time}`,"actions.done":`Done.`,"editor.unsaved":`Unsaved changes`,"editor.saved":`All saved`,"editor.save":`Save`,"editor.saving":`Saving …`,"editor.discard":`Discard`,"editor.save_error":`Saving failed: {message}`,"editor.save_ok":`Saved.`,"editor.fix_errors":`Please fix the entries marked in red first.`,"editor.leave_warning":`There are unsaved changes.`,"rooms.add_placeholder":`Name of the new room, e.g. Living room`,"rooms.add":`Add room`,"rooms.select":`Select room`,"room.name":`Name`,"room.importance":`Importance`,"room.importance_hint":`Important rooms count more when deciding whether the stove starts.`,"importance.1":`low`,"importance.2":`medium`,"importance.3":`high`,"room.radiators":`Radiator thermostats`,"room.radiators_hint":`Thermostats in this room (e.g. Tado).`,"room.sensors":`Temperature sensors`,"room.sensors_hint":`Without a sensor the thermostat temperature is used. The first field is the weight (how much a sensor counts), the second a correction in K.`,"room.weight":`Weight`,"room.openings":`Windows and doors`,"room.openings_hint":`While something is open, this room is not heated.`,"room.presence":`Presence`,"room.presence_hint":`Motion or presence sensors. Optional.`,"room.humidity":`Humidity`,"room.humidity_hint":`Optional. A window opened while humidity is high (e.g. after a shower) is intentional airing: no notice until humidity is back down.`,"room.ventilate":`Airing because of humidity`,"room.ventilate_hint":`The room counts as humid above the threshold OR when humidity has risen this much above the lowest value of the last 90 minutes. 0 turns a value off.`,"room.ventilate_humidity":`Threshold`,"room.ventilate_rise":`Rise above baseline`,"room.ventilating":`Airing because of humidity ({value} %)`,"room.targets":`Target temperature per scene`,"room.targets_hint":`Leave empty = scene default.`,"room.devices":`Devices`,"room.devices_hint":`Paused devices stay configured but are not used, e.g. while a sensor is offline.`,"room.recovering":`recovering from airing until {time}`,"dev.pause":`Pause`,"dev.resume":`Use again`,"dev.paused":`paused`,"dev.unavailable":`unavailable`,"dev.add":`Add device`,"dev.open":`open`,"dev.closed":`closed`,"dev.occupied":`occupied`,"dev.empty":`empty`,"dev.none":`none`,"dev.unavail_count":`{n} devices unavailable`,"dev.unavail_one":`1 device unavailable`,"dev.pause_unavail":`Pause unavailable ones`,"dev.held":`briefly gone, last value used`,"dev.drops":`{n}× gone (24 h)`,"param.opening_check_min":`Check windows after`,"param.opening_check_min_hint":`If a window reports open this long and the room does not cool down, a notice is sent to the phone: check the sensor. The room still stays on frost protection. 0 = off.`,"param.sensor_hold_min":`Bridge dropouts for up to`,"param.sensor_hold_min_hint":`If a sensor is briefly unreachable, its last value is used this long. An open window stays open. After that a window counts as closed and a temperature sensor is left out. 0 = off.`,"param.sensor_alert_min":`Report outage after`,"param.sensor_alert_min_hint":`If a sensor is unreachable this long, a message is sent to the phone, at most once a day per sensor. 0 = no message.`,"param.opening_recovery_min":`Wait after airing`,"param.opening_recovery_min_hint":`For this long after closing, an aired room does not count for starting the stove. The air warms up again quickly by itself. 0 = off.`,"room.delete":`Delete room`,"room.delete_confirm":`Really delete room “{name}”? This cannot be undone after saving.`,"schedule.day_types":`Day types`,"schedule.day_types_hint":`A day type sets from when which scene applies. Before the first time, the last scene of the previous day applies.`,"schedule.add_placeholder":`Name of the new day type, e.g. Home office`,"schedule.add":`Add day type`,"schedule.slot_from":`from`,"schedule.add_slot":`Add time`,"schedule.week":`Week`,"schedule.week_hint":`Which day type applies on which day?`,"schedule.delete_day_type":`Delete day type`,"schedule.delete_confirm":`Really delete day type “{name}”?`,"schedule.in_use":`Used in the week ({days}). Please choose another day type there first.`,"schedule.no_scenes":`Please create a scene under “Scenes” first.`,"slot.time_format":`Please enter the time as HH:MM.`,"slot.not_ascending":`Times must be in ascending order.`,"slot.scene_missing":`Please choose a scene.`,"slot.scene_unknown":`This scene no longer exists.`,"slot.empty":`At least one time is required.`,"week.mon":`Monday`,"week.tue":`Tuesday`,"week.wed":`Wednesday`,"week.thu":`Thursday`,"week.fri":`Friday`,"week.sat":`Saturday`,"week.sun":`Sunday`,"week.holiday":`Holiday`,"week.unset":`– please choose –`,"scenes.title":`Scenes`,"scenes.hint":`A scene is a heat wish, e.g. comfort or eco.`,"scenes.add_placeholder":`Name of the new scene, e.g. Comfort`,"scenes.add":`Add scene`,"scene.name":`Name`,"scene.icon":`Icon`,"scene.icon_hint":`e.g. mdi:sofa`,"scene.stove":`Stove`,"scene.stove.allow":`may heat`,"scene.stove.frost_only":`only against cold (frost/night)`,"scene.stove.deny":`stays off`,"scene.default_target":`Default target`,"scene.delete":`Delete scene`,"scene.delete_confirm":`Really delete scene “{name}”? Room targets for this scene will be removed.`,"scene.in_use":`Used in the schedule ({names}). Please replace it there first.`,"scenes.matrix":`Target temperatures room × scene`,"scenes.matrix_hint":`Empty fields use the scene default.`,"scenes.none":`No scenes yet.`,"house.stove":`Stove`,"house.stove_climate":`Stove thermostat`,"house.stove_climate_hint":`Required. The thermostat entity of the pellet stove.`,"house.stove_climate_active_hint":`Without a stove thermostat Wärmeregie can only run in shadow mode.`,"house.power":`Power level`,"house.power_hint":`Optional. Select or number entity for level 1 to 5.`,"house.stove_functions":`Stove functions`,"house.stove_functions_hint":`In active mode Wärmeregie switches off the stove's own timer (chrono) and eco mode and chooses the power level itself. In shadow mode there are only notices.`,"house.chrono_switch":`Timer (chrono)`,"house.chrono_switch_hint":`Optional. Switch for the stove's own timer.`,"house.eco_switch":`Eco`,"house.eco_switch_hint":`Optional. Switch for the stove's eco mode.`,"house.error_sensor":`Fault`,"house.error_sensor_hint":`Optional. While the stove reports a fault, it is not started.`,"house.water_sensor":`Water temperature`,"house.water_sensor_hint":`Optional. Display only.`,"house.ignitions_sensor":`Ignition counter`,"house.ignitions_sensor_hint":`Optional. Display only.`,"house.environment":`Weather and calendar`,"house.weather":`Weather`,"house.weather_hint":`Optional. Used for the forecast.`,"house.outdoor_sensor":`Outdoor sensor`,"house.outdoor_sensor_hint":`Optional. More precise than the weather forecast.`,"house.workday":`Workday`,"house.workday_hint":`Optional. Detects holidays (“Workday” integration).`,"house.people":`Residents`,"house.persons":`Persons`,"house.persons_hint":`If nobody is home, energy is saved.`,"house.pet":`Pet`,"house.pet_hint":`Optional. If a pet is home, temperature is never lowered below the frost limit.`,"house.notify":`Notifications`,"house.notify_hint":`Where should notices be sent?`,"house.notify_none":`No notification services found.`,"house.notify_unknown":`no longer available`,"house.messages":`Notices`,"house.messages_hint":`What should reach the phone, how often and when not?`,"house.msg_kinds":`Send these notices`,"msg.opening":`Window or door open for a while`,"msg.opening_check":`Window reports open but the room does not cool`,"msg.sensor":`Devices unreachable`,"msg.pellets":`Refill pellets`,"msg.stove_error":`Stove error (also during quiet hours)`,"msg.overheat":`Boiler protection: water too hot (also during quiet hours)`,"msg.too_warm":`Stove switched off because the house is too warm`,"msg.activity":`What the heating is doing (stove starts, stove is off, with the reason)`,"msg.opening_delay_min":`Report an open window after`,"msg.opening_delay_min_hint":`Short airing stays silent. Heating still reacts immediately.`,"msg.repeat_min":`Same notice again at the earliest after`,"msg.repeat_min_hint":`Stops a window that opens and closes from reporting every time. 0 = no block.`,"msg.ventilate_max_min":`Airing because of humidity at most`,"msg.ventilate_max_min_hint":`If the window stays open longer after a shower, a notice is sent after all.`,"msg.quiet":`Quiet hours`,"msg.quiet_hint":`Only stove errors are sent during this time. Both fields empty = no quiet hours.`,"msg.quiet_start":`from`,"msg.quiet_end":`to`,"msg.quiet_invalid":`Enter start and end (HH:MM), not the same.`,"msg.quiet_hold":`Send them afterwards in one message (otherwise drop)`,"house.parameters":`Control values`,"house.parameters_hint":`The defaults suit most houses. Only change them if needed.`,"house.out_of_range":`Allowed: {min} to {max}`,"pgroup.stove":`Starting and stopping the stove`,"pgroup.openings":`Windows and doors`,"pgroup.sensors":`Sensor outages`,"pgroup.radiators":`Radiators`,"pgroup.limits":`Lower limits`,"pgroup.presence":`Presence`,"pgroup.buffer":`Radiators as buffer`,"pgroup.buffer_hint":`Without a buffer tank the radiators take the heat out of the boiler`,"param.dump_start_c":`Heat release: centre at`,"param.dump_start_c_hint":`Instead of opening everything at once at one temperature, Wärmeregie opens the radiators the further the hotter the boiler is. Learning can only lower this value.`,"param.dump_end_c":`Heat release ends below`,"param.dump_end_c_hint":`Below this the normal setpoints apply again. Must be below the centre.`,"param.dump_extra_k":`Radiators at most warmer by`,"param.dump_extra_k_hint":`How far above target or room temperature radiators are set when the boiler is very hot. Already warm rooms get up to half less; close to boiler protection all get the full value.`,"param.dump_ramp_low_k":`Starts this far below`,"param.dump_ramp_low_k_hint":`From centre minus this value the radiators open a little.`,"param.dump_ramp_high_k":`Fully open this far above`,"param.dump_ramp_high_k_hint":`From centre plus this value the full extra applies.`,"house.buffer_explain":`A pellet stove without a buffer tank can only lose its heat through the radiators. If they are closed the water boils up (after-heat once switched off). Wärmeregie therefore opens them gradually: the hotter the boiler, the further. From 90 °C boiler protection also applies.`,"house.has_buffer":`Buffer tank installed`,"house.has_buffer_hint":`Only switch on if there really is a buffer. Then there is no heat release via the radiators.`,"house.dump_learn":`Learn from operation`,"house.dump_learn_hint":`Measures after-heat and the stove's switch-off temperature and opens radiators earlier if needed. Never later than set.`,"learn.title":`Learned`,"learn.hint":`Moving averages from operation. They take effect after a few measurements.`,"learn.selfoff_c":`Stove switches itself off at`,"learn.afterheat_k":`After-heat after switching off`,"learn.cool_k_min":`Cooling with radiators open`,"learn.dump_start_c":`Effective centre of heat release`,"learn.samples":`measurements`,"learn.min_samples":`active from {n} measurements`,"learn.none":`No data yet.`,"learn.reset":`Reset learned values`,"learn.reset_confirm":`Really forget the learned values?`,"pgroup.pellets":`Pellets`,"param.pellet_bag_kg":`Weight of one bag`,"param.pellet_bag_kg_hint":`The button “Pellet bag refilled” adds this much.`,"param.pellet_capacity_kg":`Hopper capacity`,"param.pellet_capacity_kg_hint":`No more fits in; the stock is capped at this.`,"param.pellet_rate_kg_h":`Consumption per burn hour (start value)`,"param.pellet_rate_kg_h_hint":`Used until the real value is learned from an empty hopper.`,"param.pellet_reminder_kg":`Remind below`,"param.pellet_reminder_kg_hint":`When the estimate drops below this, a message is sent.`,"stove.pellets":`Pellets`,"stove.pellets_empty":`empty`,"pgroup.power":`Power level`,"pgroup.other":`Other`,"param.start_below_k":`Start when this far below target`,"param.start_below_k_hint":`The stove only starts when the living rooms are this much colder than wanted.`,"param.stop_above_k":`Stop when this far above target`,"param.stop_above_k_hint":`The heating block ends when it is this much warmer than wanted.`,"param.hard_stop_above_k":`Switch off at once when this far above target`,"param.hard_stop_above_k_hint":`If the house is this much too warm, every heating block ends after 30 minutes at the earliest, even before the minimum burn time. A stove switched on by hand is switched off again at once. 0 = off.`,"param.min_burn_min":`Shortest burn time`,"param.min_burn_min_hint":`A heating block runs at least this long. Easier on the stove.`,"param.max_burn_min":`Longest burn time`,"param.max_burn_min_hint":`After this a heating block always ends.`,"param.min_pause_min":`Shortest pause`,"param.min_pause_min_hint":`The stove stays off at least this long after a heating block.`,"param.max_starts_per_day":`Max starts per day`,"param.max_starts_per_day_hint":`A few long heating blocks are better than frequent on and off.`,"param.opening_grace_min":`Short airing allowed`,"param.opening_grace_min_hint":`A window may be open this long without anything happening.`,"param.opening_stop_min":`Stove stops with open window after`,"param.opening_stop_min_hint":`If a window stays open longer, the heating block ends.`,"param.opening_empty_room_min":`Empty room: radiator off after`,"param.opening_empty_room_min_hint":`In an empty room with an open window the radiator is turned down this early.`,"param.radiator_boost_k":`Radiator lead`,"param.radiator_boost_k_hint":`While the stove burns, radiators are set this much higher.`,"param.frost_c":`Frost limit`,"param.frost_c_hint":`It never gets colder than this, even in scenes where the stove otherwise stays off.`,"param.night_floor_c":`Night minimum`,"param.night_floor_c_hint":`At night it is heated to at least this temperature.`,"param.stove_block_setpoint_c":`Stove setpoint during block`,"param.stove_block_setpoint_c_hint":`The stove thermostat is set to this value so it keeps burning.`,"param.presence_empty_min":`Room counts as empty after`,"param.presence_empty_min_hint":`After this long without motion a room counts as empty.`,"param.power_min":`Lowest power level`,"param.power_min_hint":`A heating block runs at this level in mild weather (1 to 5).`,"param.power_max":`Highest power level`,"param.power_max_hint":`Highest level Wärmeregie will choose (1 to 5).`,"param.power_cold_c":`Full power below`,"param.power_cold_c_hint":`If it is colder outside, the highest power level is chosen.`,"log.title":`Log`,"log.empty":`No entries yet.`,"log.shadow":`Shadow`,"log.shadow_hint":`Only calculated, not switched`,"picker.search":`Search …`,"picker.no_results":`No matching entities.`,"picker.show_all":`also show other kinds`,"picker.missing":`not found`,"picker.more":`More results – please refine your search.`,"hero.inside":`Inside`,"hero.target":`Target {temp}`,"hero.error":`The stove reports a fault.`,"hero.prepare":`Opening radiators, stove ignites at {time}`,"hero.self_off":`Stove switched itself off (water hot), waiting for restart`,"stove.overheat":`Boiler protection: water too hot, stove off, all radiators open`,"hero.burning":`Stove burning since {time}`,"hero.block":`Heating block since {time}`,"hero.warmup_planned":`Warm-up starts at {time}`,"hero.paused":`Stove paused until {time}`,"hero.pause":`Stove off, pause until {time}`,"hero.idle_warm":`Stove off, warm enough`,"hero.idle":`Stove off`,"warmup.button":`Warm up`,"warmup.title":`Warm up the house`,"warmup.intro":`The stove starts even if it is still warm enough, and all radiators open. Afterwards the daily schedule applies again.`,"warmup.now":`Warm up now`,"warmup.for":`for {time}`,"warmup.arrive":`I'll be home at`,"warmup.plan":`Plan`,"warmup.arrive_hint":`Wärmeregie starts about {lead} min earlier and keeps the house warm for another hour.`,"warmup.cancel":`Cancel warm-up`,"warmup.active_until":`Warm-up until {time}`,"cold.active_until":`I am cold: warmer until {time}`,"cold.title":`I am cold`,"cold.button":`Warmer now`,"cold.hint":`Wärmeregie decides: if the boiler still holds heat it only opens the radiators. Otherwise it starts the stove.`,"param.cold_min":`I am cold: duration`,"param.cold_min_hint":`The higher targets apply this long after "I am cold".`,"param.cold_residual_c":`I am cold: use residual heat from`,"param.cold_residual_c_hint":`If the boiler water is at least this warm, Wärmeregie first only opens the radiators. If the house does not get warmer within 15 minutes, the stove starts. 0 = always start the stove at once.`,"warmup.planned":`Warm-up from {time}`,"warmup.planned_arrive":`Warm-up from {time} (arrival {arrive})`,"pause.button":`Pause`,"pause.title":`Pause stove`,"pause.intro":`Wärmeregie will not start the stove meanwhile. A running heating block ends.`,"pause.for":`{h} h`,"pause.cancel":`End pause`,"more.title":`More`,"actions.clear_all":`Cancel all manual changes`,"feedback.title":`How is it right now?`,"feedback.house":`Whole house`,"feedback.cold":`Too cold`,"feedback.ok":`Fine`,"feedback.warm":`Too warm`,"feedback.done_house_cold":`Noted. Wärmeregie is making it warmer now.`,"feedback.done_house_ok":`Noted, thanks.`,"feedback.done_house_warm":`Noted. All targets are 1 K lower for an hour.`,"feedback.done_room_cold":`Noted. The target in this room is 1 K higher for an hour.`,"feedback.done_room_ok":`Noted, thanks.`,"feedback.done_room_warm":`Noted. The target in this room is 1 K lower for an hour.`,"feedback.suggestion":`Suggestion`,"feedback.accept":`Accept`,"feedback.adjust":`Adjust`,"feedback.dismiss":`No thanks`,"feedback.apply":`Apply`,"feedback.adjust_time":`Start (HH:MM)`,"feedback.adjust_temp":`Target in °C`,"feedback.accepted":`Applied. You will find the change in the schedule or the scenes.`,"feedback.dismissed":`All right, this suggestion will not come back for now.`,"feedback.admin_only":`Only an administrator can accept or decline.`,"ai.title":`AI adviser`,"ai.hint":`The AI looks at your feedback and settings and makes suggestions. Only what you accept is changed. It cannot touch protection rules.`,"ai.ask":`Ask the AI for suggestions`,"ai.asking":`The AI is thinking …`,"ai.preview":`Show what is sent`,"ai.preview_hide":`Close preview`,"ai.missing":`No AI is set up yet. Choose one under “Stove & house”, section Environment (AI adviser).`,"ai.last":`Last request: {time}`,"ai.none":`No open suggestions.`,"ai.dropped":`Discarded AI suggestions (not allowed): {n}`,"house.ai_task":`AI adviser`,"house.ai_task_hint":`Optional. An AI task entity from Home Assistant (e.g. OpenAI). It only receives anonymous data, and only when you ask it.`,"feedback.suggestion_ai":`Suggestion from the AI`,"feedback.accepted_ai":`Applied.`,"feedback.adjust_value":`Value ({min} to {max})`,"feedback.locked":`Save or discard your open changes first, then you can accept suggestions.`,"msg.suggestion":`New suggestion from your feedback`,"chart.title":`Last 24 hours`,"history.title":`Rooms and boiler, last 24 hours`,"history.rooms":`Room temperatures`,"history.rooms_aria":`Room temperatures, their average and the target over time`,"history.house":`Average of all rooms`,"history.water":`Boiler water`,"history.water_short":`Boiler`,"history.water_aria":`Boiler temperature over time`,"history.empty":`There are no values for this selection yet.`,"history.no_water":`There are no boiler values for this period yet.`,"history.show":`Show and hide lines`,"history.all_hidden":`All lines are hidden. Tap a name above to show it again.`,"history.more_rooms":`{n} more rooms are not drawn individually but count towards the average.`,"chart.aria":`Indoor temperature, {from} to {to} degrees`,"chart.house":`Inside`,"chart.target":`Target`,"chart.burning":`Stove burning`,"pellets.title":`Pellets`,"pellets.until":`lasts until {time}`,"pellets.low":`Refill soon`,"pellets.estimate":`Consumption still estimated`,"pellets.refill":`Bag refilled`,"pellets.refill_done":`One bag was added.`,"pellets.aria":`Pellet hopper {pct} percent full`,"details.title":`Details`,"details.day_type":`Day type`,"stove.phase.prepare":`Soft start`,"house.mode_hint":`In shadow mode Wärmeregie only calculates. In active mode it switches the stove and radiators.`,"house.sect_stove_hint":`Thermostat, power level and functions of the stove`,"house.sect_env_hint":`Weather, outdoor sensor, holidays`,"house.sect_people_hint":`Persons, pet, notifications`,"house.warmup_scene":`Targets when warming up`,"house.warmup_scene_hint":`This scene sets the target temperatures during warm-up.`,"house.warmup_scene_auto":`automatic (first scene with stove allowed)`,"pgroup.stove_hint":`When the stove starts and how long it burns`,"pgroup.softstart":`Soft start`,"pgroup.softstart_hint":`Open radiators before ignition, behaviour with hot water`,"pgroup.warmup":`Warm-up`,"pgroup.warmup_hint":`“Warm up the house” and “I'll be home at …”`,"pgroup.openings_hint":`Airing, open doors, sensor checks`,"pgroup.sensors_hint":`What happens when a sensor is gone`,"pgroup.power_hint":`Only with an entity for the power level`,"pgroup.radiators_hint":`How far radiators open during a heating block`,"pgroup.limits_hint":`Frost protection and night`,"pgroup.presence_hint":`Empty rooms a bit cooler`,"pgroup.pellets_hint":`Bag weight, hopper, consumption`,"pgroup.other_hint":`Other values`,"param.soft_start_min":`Open radiators first`,"param.soft_start_min_hint":`Radiators open this long before ignition so the water in the stove does not heat up too fast. 0 = off.`,"param.self_off_wait_min":`Wait after self switch-off`,"param.self_off_wait_min_hint":`If the stove switches itself off during a block because the water is hot, Wärmeregie waits this long for the restart. 0 = block ends at once.`,"param.warmup_extra_k":`Warm-up: above target`,"param.warmup_extra_k_hint":`This much above the targets of the warm-up scene.`,"param.warmup_lead_min":`Lead time before arrival`,"param.warmup_lead_min_hint":`Warm-up starts this long before “I'll be home at …”.`,"room.offset":`Correction`,"room.offset_hint":`Correction in K, added to the reading (e.g. -0.5 if the sensor reads too warm).`,"card.chart":`History`,"card.name":`Wärmeregie`,"card.description":`Stove, scene and rooms at a glance.`,"card.no_rooms":`No rooms selected.`,"card.open_panel":`Open Wärmeregie`};function tt(e,t,n){let r=(e===`en`?et[t]:void 0)??$e[t]??t;if(n)for(let[e,t]of Object.entries(n))r=r.split(`{${e}}`).join(String(t));return r}function Q(e){return(t,n)=>tt(e,t,n)}var $=o`
  :host {
    --wr-heat: var(--state-climate-heat-color, #e8590c);
    --wr-cold: var(--state-climate-cool-color, #1c7ed6);
    --wr-ok: var(--success-color, #2f9e44);
    --wr-warn: var(--warning-color, #f08c00);
    --wr-err: var(--error-color, #e03131);
    --wr-primary: var(--primary-color, #03a9f4);
    --wr-text: var(--primary-text-color, #212121);
    --wr-text2: var(--secondary-text-color, #727272);
    --wr-card: var(--card-background-color, var(--ha-card-background, #fff));
    --wr-bg: var(--primary-background-color, #fafafa);
    --wr-div: var(--divider-color, rgba(0, 0, 0, 0.12));
    --wr-radius: var(--ha-card-border-radius, 12px);
    --wr-input-bg: var(--input-fill-color, var(--secondary-background-color, rgba(127, 127, 127, 0.08)));
    color: var(--wr-text);
    font-family: var(--paper-font-body1_-_font-family, var(--ha-font-family-body, Roboto, system-ui, sans-serif));
    font-size: 14px;
    line-height: 1.45;
  }
  * {
    box-sizing: border-box;
  }
  h2,
  h3,
  h4 {
    margin: 0 0 8px;
    font-weight: 500;
  }
  h2 {
    font-size: 18px;
  }
  h3 {
    font-size: 16px;
  }
  h4 {
    font-size: 14px;
  }
  .card {
    background: var(--wr-card);
    border-radius: var(--wr-radius);
    border: 1px solid var(--wr-div);
    box-shadow: var(--ha-card-box-shadow, none);
    padding: 16px;
    min-width: 0;
  }
  .muted,
  .hint {
    color: var(--wr-text2);
  }
  .hint {
    font-size: 12px;
    margin: 2px 0 6px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .spacer {
    flex: 1;
  }
  .grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  }
  button {
    font: inherit;
    cursor: pointer;
    border-radius: 18px;
    border: 1px solid var(--wr-div);
    background: transparent;
    color: var(--wr-text);
    padding: 6px 14px;
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  button:hover:not([disabled]) {
    background: rgba(127, 127, 127, 0.12);
  }
  button[disabled] {
    cursor: default;
    opacity: 0.5;
  }
  button.primary {
    background: var(--wr-primary);
    border-color: var(--wr-primary);
    color: var(--text-primary-color, #fff);
  }
  button.primary:hover:not([disabled]) {
    filter: brightness(1.08);
    background: var(--wr-primary);
  }
  button.danger {
    color: var(--wr-err);
    border-color: var(--wr-err);
  }
  button.danger.solid {
    background: var(--wr-err);
    color: #fff;
  }
  button.icon {
    padding: 4px;
    min-width: 36px;
    justify-content: center;
    border-color: transparent;
  }
  button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--wr-primary);
    outline-offset: 1px;
  }
  ha-icon {
    --mdc-icon-size: 20px;
    flex: none;
  }
  input,
  select {
    font: inherit;
    color: var(--wr-text);
    background: var(--wr-input-bg);
    border: 1px solid var(--wr-div);
    border-radius: 8px;
    padding: 7px 10px;
    min-height: 38px;
    width: 100%;
    min-width: 0;
  }
  select option {
    background: var(--wr-card);
    color: var(--wr-text);
  }
  input[type="number"] {
    max-width: 120px;
  }
  input.invalid,
  select.invalid {
    border-color: var(--wr-err);
  }
  label.field {
    display: block;
    margin-bottom: 12px;
  }
  label.field > span.lbl,
  .lbl {
    display: block;
    font-weight: 500;
    margin-bottom: 4px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    border-radius: 18px;
    border: 1px solid var(--wr-div);
    padding: 6px 12px;
    background: transparent;
  }
  .chip.selected {
    background: var(--wr-heat);
    border-color: var(--wr-heat);
    color: #fff;
  }
  .chip.auto.selected {
    background: var(--wr-primary);
    border-color: var(--wr-primary);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    border-radius: 10px;
    padding: 1px 8px;
    background: rgba(127, 127, 127, 0.15);
    white-space: nowrap;
  }
  .badge.heat {
    background: var(--wr-heat);
    color: #fff;
  }
  .badge.cold {
    background: var(--wr-cold);
    color: #fff;
  }
  .badge.warn {
    background: var(--wr-warn);
    color: #fff;
  }
  .badge.err {
    background: var(--wr-err);
    color: #fff;
  }
  .alert.stove_error ha-icon,
  .alert.error ha-icon {
    color: var(--wr-err);
  }
  .badge.ok {
    background: var(--wr-ok);
    color: #fff;
  }
  .banner {
    border-radius: var(--wr-radius);
    padding: 12px 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    border: 1px solid;
  }
  .banner.shadow {
    border-color: var(--wr-warn);
    background: color-mix(in srgb, var(--wr-warn) 14%, transparent);
  }
  .banner.error {
    border-color: var(--wr-err);
    background: color-mix(in srgb, var(--wr-err) 12%, transparent);
  }
  .banner.info {
    border-color: var(--wr-primary);
    background: color-mix(in srgb, var(--wr-primary) 10%, transparent);
  }
  .banner strong {
    display: block;
  }
  .error-text {
    color: var(--wr-err);
    font-size: 12px;
  }
  .confirm {
    border: 1px solid var(--wr-err);
    border-radius: 10px;
    padding: 12px;
    margin-top: 8px;
    background: color-mix(in srgb, var(--wr-err) 8%, transparent);
  }
  .confirm .row {
    margin-top: 8px;
  }
  .stove .phase {
    font-size: 18px;
    font-weight: 500;
  }
  .stove.burning .flame {
    color: var(--wr-heat);
  }
  .kv {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 12px;
    margin-top: 8px;
  }
  .kv dt {
    color: var(--wr-text2);
  }
  .kv dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .room {
    border-left: 4px solid var(--wr-div);
  }
  .room.cold {
    border-left-color: var(--wr-cold);
  }
  .room.warm {
    border-left-color: var(--wr-heat);
  }
  .room.ok {
    border-left-color: var(--wr-ok);
  }
  .room .temp {
    font-size: 24px;
    font-weight: 500;
  }
  .room .name {
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  .alert {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 6px 0;
    border-bottom: 1px solid var(--wr-div);
  }
  .alert:last-child {
    border-bottom: 0;
  }
  .alert.opening ha-icon {
    color: var(--wr-cold);
  }
  .alert ha-icon {
    color: var(--wr-warn);
  }
  /* Tageszeitleiste */
  .timeline {
    position: relative;
    height: 22px;
    border-radius: 6px;
    overflow: hidden;
    background: rgba(127, 127, 127, 0.15);
  }
  .timeline .seg {
    position: absolute;
    top: 0;
    bottom: 0;
    border-right: 1px solid var(--wr-card);
  }
  .timeline .seg span {
    color: #fff;
    font-size: 11px;
    padding: 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    line-height: 22px;
  }
  .timeline .now {
    position: absolute;
    top: -2px;
    bottom: -2px;
    width: 2px;
    background: var(--wr-text);
  }
  .timeline-scale {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--wr-text2);
    margin-top: 2px;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 12px;
    margin-top: 6px;
  }
  .legend i {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    margin-right: 4px;
    vertical-align: -1px;
  }
`;function nt(e,t=!1){return e.status?.mode===`shadow`?M`<div class="banner shadow" role="status">
    <ha-icon icon="mdi:eye-outline"></ha-icon>
    <div>
      <strong>${e.t(`mode.shadow_banner`)}</strong>
      ${t?F:M`<span class="muted">${e.t(`mode.shadow_banner_hint`)}</span>`}
    </div>
  </div>`:F}function rt(e,t){let n=[...e?.alerts??[]],r=e?.stove,i=(...e)=>n.some(t=>e.includes(t.kind));return r?.error&&!i(`error`,`stove_error`)&&n.unshift({kind:`stove_error`,message:t(`stove.error`)}),r?.overheat&&!i(`overheat`)&&n.unshift({kind:`overheat`,message:t(`stove.overheat`)}),r?.chrono_warning&&!i(`chrono`,`chrono_warning`)&&n.push({kind:`chrono`,message:t(`stove.chrono_warning`)}),r?.eco_warning&&!i(`eco`,`eco_warning`)&&n.push({kind:`eco`,message:t(`stove.eco_warning`)}),n}function it(e){let t=e?.overrides;return t&&!!(t.scene||t.pause_until||t.boost)||e?.scene?.source===`override`}function at(e){let t=e?.overrides?.boost;return t?typeof t==`number`?t:typeof t==`object`&&t&&typeof t.delta==`number`?t.delta:1:null}var ot,st=[60,90,120,180],ct=[60,120,240],lt=class extends H{constructor(){super(),this.status=null,this.config=null,this.lang=`de`,this.compact=!1,this._dialog=null,this._arrive=``,this._busy=!1,this._error=null}get _t(){return Q(this.lang)}get _isAdmin(){return this.hass?.user?.is_admin!==!1}updated(e){if(e.has(`_dialog`)){let e=this.renderRoot.querySelector(`dialog`);if(e&&this._dialog&&!e.open)try{e.showModal()}catch{e.setAttribute(`open`,``)}}}_open(e){this._error=null,e===`warmup`&&(this._arrive=Ye(this.status?.now)),this._dialog=e}_close(){let e=this.renderRoot.querySelector(`dialog`);e?.open&&e.close(),this._dialog=null}async _run(e,t=!0){this._busy=!0,this._error=null;try{let n=await e();n&&typeof n==`object`&&`mode`in n&&this.dispatchEvent(new CustomEvent(`wr-status`,{detail:n,bubbles:!0,composed:!0})),t&&this._close()}catch(e){this._error=X(e)||this._t(`error`)}finally{this._busy=!1}}_warmup(e){return this._run(()=>Ee(this.hass,e))}render(){let e=this._t,t=this.status,n=!this._isAdmin||this._busy||!t,r=this._isAdmin?``:e(`not_admin`),i=t?.scene,a=this.config?.scenes.find(e=>e.id===i?.id),o=Qe(t,e),s=t?.overrides?.pause_until??null,c=at(t),l=i?.source===`override`;return M`
      <div class="main ${this.compact?`compact`:``}">
        <button class="big heat ${o?`on`:``}" ?disabled=${n} title=${r} @click=${()=>this._open(`warmup`)}>
          <ha-icon icon="mdi:home-thermometer-outline"></ha-icon><span>${e(`warmup.button`)}</span>
        </button>
        <button class="big" ?disabled=${n} title=${r} @click=${()=>this._open(`scene`)}>
          <ha-icon icon=${l?a?.icon||`mdi:palette-outline`:`mdi:calendar-clock`}></ha-icon>
          <span class="two"
            ><span>${i?.name??e(`scene.title`)}</span><small>${l&&i?.until?e(`scene.override_until`,{time:J(i.until)}):e(`scene.auto`)}</small></span
          >
        </button>
        <button class="big ${s?`on`:``}" ?disabled=${n} title=${r} @click=${()=>this._open(`pause`)}>
          <ha-icon icon=${s?`mdi:pause-circle`:`mdi:pause`}></ha-icon><span>${e(`pause.button`)}</span>
        </button>
      </div>
      ${o||s||c?M`<div class="active">
            ${o?M`<span class="pill heat"
                  ><ha-icon icon="mdi:home-thermometer"></ha-icon>${o}<button
                    class="x"
                    ?disabled=${n}
                    aria-label=${e(`warmup.cancel`)}
                    title=${e(`warmup.cancel`)}
                    @click=${()=>this._warmup({cancel:!0})}
                  ><ha-icon icon="mdi:close"></ha-icon></button
                ></span>`:F}
            ${s?M`<span class="pill"
                  ><ha-icon icon="mdi:pause"></ha-icon>${e(`actions.pause_active`,{time:Y(s,t?.now,this.lang)})}<button
                    class="x"
                    ?disabled=${n}
                    aria-label=${e(`pause.cancel`)}
                    title=${e(`pause.cancel`)}
                    @click=${()=>this._run(()=>W(this.hass,0),!1)}
                  ><ha-icon icon="mdi:close"></ha-icon></button
                ></span>`:F}
            ${c?M`<span class="pill heat"
                  >${e(`actions.boost_active`,{delta:String(c).replace(`.`,this.lang===`de`?`,`:`.`)})}<button
                    class="x"
                    ?disabled=${n}
                    aria-label=${e(`actions.clear`)}
                    title=${e(`actions.clear`)}
                    @click=${()=>this._run(()=>G(this.hass,0,0),!1)}
                  ><ha-icon icon="mdi:close"></ha-icon></button
                ></span>`:F}
          </div>`:F}
      ${this._error&&!this._dialog?M`<div class="error-text" role="alert">${this._error}</div>`:F}
      ${this._dialog?this._renderDialog():F}
    `}_renderDialog(){let e=this._t,t={warmup:e(`warmup.title`),pause:e(`pause.title`),scene:e(`scene.title`)},n=this._dialog;return M`<dialog
      aria-label=${t[n]}
      @close=${()=>this._dialog=null}
      @click=${e=>{e.target===e.currentTarget&&this._close()}}
    >
      <div class="sheet">
        <div class="head">
          <h3>${t[n]}</h3>
          <button class="icon" aria-label=${e(`close`)} @click=${this._close}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        ${n===`warmup`?this._renderWarmup():n===`pause`?this._renderPause():this._renderScene()}
        ${this._error?M`<div class="error-text" role="alert">${this._error}</div>`:F}
      </div>
    </dialog>`}_renderWarmup(){let e=this._t,t=this.config?.parameters?.warmup_lead_min??60,n=Fe(this._arrive)!==null,r=Qe(this.status,e);return M`
      <p class="muted">${e(`warmup.intro`)}</p>
      ${r?M`<div class="now">
            <span>${r}</span>
            <button class="danger" ?disabled=${this._busy} @click=${()=>this._warmup({cancel:!0})}>${e(`warmup.cancel`)}</button>
          </div>`:F}
      <h4>${e(`cold.title`)}</h4>
      <div class="opts">
        <button class="opt" ?disabled=${this._busy} @click=${()=>this._warmup({cold:!0})}>${e(`cold.button`)}</button>
      </div>
      <div class="hint">${e(`cold.hint`)}</div>
      <h4>${e(`warmup.now`)}</h4>
      <div class="opts">
        ${st.map(t=>M`<button class="opt" ?disabled=${this._busy} @click=${()=>this._warmup({minutes:t})}>${e(`warmup.for`,{time:t%60?`${t} min`:`${t/60} h`})}</button>`)}
      </div>
      <h4>${e(`warmup.arrive`)}</h4>
      <form
        class="arrive"
        @submit=${e=>{e.preventDefault(),n&&this._warmup({arrive:this._arrive})}}
      >
        <input
          inputmode="numeric"
          maxlength="5"
          placeholder="18:30"
          aria-label=${e(`warmup.arrive`)}
          class=${n?``:`invalid`}
          .value=${this._arrive}
          @input=${e=>this._arrive=e.target.value}
          @change=${e=>this._arrive=Ie(e.target.value)}
        />
        <button class="primary" type="submit" ?disabled=${this._busy||!n}>${e(`warmup.plan`)}</button>
      </form>
      <div class="hint">${e(`warmup.arrive_hint`,{lead:String(t)})}</div>
    `}_renderPause(){let e=this._t,t=this.status?.overrides?.pause_until;return M`
      <p class="muted">${e(`pause.intro`)}</p>
      ${t?M`<div class="now">
            <span>${e(`actions.pause_active`,{time:Y(t,this.status?.now,this.lang)})}</span>
            <button class="danger" ?disabled=${this._busy} @click=${()=>this._run(()=>W(this.hass,0))}>${e(`pause.cancel`)}</button>
          </div>`:F}
      <div class="opts">
        ${ct.map(t=>M`<button class="opt" ?disabled=${this._busy} @click=${()=>this._run(()=>W(this.hass,t))}>${e(`pause.for`,{h:String(t/60)})}</button>`)}
      </div>
    `}_renderScene(){let e=this._t,t=this.status,n=t?.scene,r=n?.source===`override`,i=this.config?.scenes??[];return M`
      <p class="muted">${e(`scene.override_hint`)}</p>
      <div class="list">
        <button class="item ${r?``:`sel`}" ?disabled=${this._busy} @click=${()=>this._run(()=>U(this.hass,null))}>
          <ha-icon icon="mdi:calendar-clock"></ha-icon><span>${e(`scene.auto`)}<small>${e(`scene.auto_hint`)}</small></span>
        </button>
        ${i.map(e=>M`<button
            class="item ${r&&n?.id===e.id?`sel`:``}"
            ?disabled=${this._busy}
            @click=${()=>this._run(()=>U(this.hass,e.id,180))}
          >
            <ha-icon icon=${e.icon||`mdi:palette-outline`}></ha-icon><span>${e.name}</span>
          </button>`)}
      </div>
      <h4>${e(`more.title`)}</h4>
      <div class="opts">
        <button class="opt" ?disabled=${this._busy} @click=${()=>this._run(()=>G(this.hass,1,60))}>
          <ha-icon icon="mdi:thermometer-plus"></ha-icon>${e(`actions.boost`)}
        </button>
        ${it(t)?M`<button class="opt" ?disabled=${this._busy} title=${e(`actions.clear_hint`)} @click=${()=>this._run(()=>je(this.hass,t))}>
              <ha-icon icon="mdi:undo-variant"></ha-icon>${e(`actions.clear_all`)}
            </button>`:F}
      </div>
    `}};ot=lt,ot.properties={hass:{attribute:!1},status:{attribute:!1},config:{attribute:!1},lang:{type:String},compact:{type:Boolean},_dialog:{state:!0},_arrive:{state:!0},_busy:{state:!0},_error:{state:!0}},ot.styles=[$,o`
      :host {
        display: block;
      }
      .main {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      button.big {
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        min-height: 64px;
        border-radius: 14px;
        padding: 8px 6px;
        text-align: center;
        background: var(--wr-input-bg);
        border-color: transparent;
        font-weight: 500;
        line-height: 1.2;
      }
      button.big ha-icon {
        --mdc-icon-size: 24px;
      }
      button.big.heat {
        color: var(--wr-heat);
      }
      button.big.on {
        background: color-mix(in srgb, var(--wr-heat) 16%, transparent);
        border-color: var(--wr-heat);
      }
      .compact button.big {
        min-height: 52px;
        font-size: 13px;
      }
      .compact button.big ha-icon {
        --mdc-icon-size: 20px;
      }
      .two {
        display: flex;
        flex-direction: column;
        min-width: 0;
        max-width: 100%;
      }
      .two span,
      .two small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .two small {
        font-weight: 400;
        color: var(--wr-text2);
        font-size: 11px;
      }
      .active {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        border-radius: 16px;
        padding: 2px 2px 2px 10px;
        background: rgba(127, 127, 127, 0.15);
      }
      .pill.heat {
        background: color-mix(in srgb, var(--wr-heat) 18%, transparent);
      }
      .pill ha-icon {
        --mdc-icon-size: 16px;
      }
      .pill button.x {
        min-height: 26px;
        min-width: 26px;
        padding: 0;
        justify-content: center;
        border: 0;
        border-radius: 50%;
      }
      dialog {
        border: 0;
        padding: 0;
        background: transparent;
        max-width: min(440px, calc(100vw - 24px));
        width: 100%;
        color: var(--wr-text);
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.45);
      }
      .sheet {
        background: var(--wr-card);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      .sheet .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .sheet .head h3 {
        margin: 0;
        font-size: 18px;
      }
      .sheet p {
        margin: 0 0 8px;
      }
      .sheet h4 {
        margin: 14px 0 8px;
      }
      .opts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      button.opt {
        min-height: 44px;
        padding: 6px 16px;
      }
      .arrive {
        display: flex;
        gap: 8px;
      }
      .arrive input {
        max-width: 110px;
        font-size: 18px;
        text-align: center;
      }
      .now {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        padding: 8px 10px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--wr-heat) 12%, transparent);
        margin-bottom: 4px;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .list .item {
        justify-content: flex-start;
        border-radius: 10px;
        border-color: transparent;
        min-height: 44px;
        text-align: left;
      }
      .list .item span {
        display: flex;
        flex-direction: column;
      }
      .list .item small {
        color: var(--wr-text2);
        font-size: 12px;
      }
      .list .item.sel {
        background: color-mix(in srgb, var(--wr-heat) 16%, transparent);
        border-color: var(--wr-heat);
      }
      .error-text {
        margin-top: 8px;
        font-size: 13px;
      }
    `];function ut(){let e=window.customElements;e.get(`wr-controls`)||e.define(`wr-controls`,lt)}var dt;function ft(e,t){if(e.type===`ai_rule`)return null;if(e.type===`ai_change`&&typeof e.to==`number`){let n=Number(t.replace(`,`,`.`).trim());return t.trim()!==``&&Number.isFinite(n)&&n>=(e.min??-1/0)&&n<=(e.max??1/0)?n:null}if(e.type===`slot_earlier`||e.type===`ai_change`){let e=Ie(t);return Fe(e)===null?null:e}let n=Number(t.replace(`,`,`.`).trim());return t.trim()!==``&&Number.isFinite(n)&&n>=5&&n<=28?Math.round(n*2)/2:null}var pt=class extends H{constructor(){super(),this.status=null,this.lang=`de`,this.only=null,this.locked=!1,this._scope=``,this._busy=!1,this._note=null,this._error=null,this._edit=null,this._editValue=``}get _t(){return Q(this.lang)}get _isAdmin(){return this.hass?.user?.is_admin!==!1}async _run(e,t,n=!1){this._busy=!0,this._error=null,this._note=null;try{let r=await e();this._note=t,this._edit=null,this.dispatchEvent(new CustomEvent(`wr-status`,{detail:r,bubbles:!0,composed:!0})),n&&this.dispatchEvent(new CustomEvent(`wr-reload`,{bubbles:!0,composed:!0}))}catch(e){this._error=X(e)}finally{this._busy=!1}}_give(e){let t=this._t,n=this._scope||null,r=n?`feedback.done_room_${e}`:`feedback.done_house_${e}`;this._run(()=>De(this.hass,e,n),t(r))}_startEdit(e){this._edit=e.id,this._editValue=typeof e.to==`number`?K(e.to,this.lang,1):String(e.to??``)}_renderSuggestion(e){let t=this._t,n=this._edit===e.id,r=n?ft(e,this._editValue):null,i=e.type===`ai_change`||e.type===`ai_rule`,a=e.type===`slot_earlier`||e.type===`ai_change`&&typeof e.to==`string`,o=t(i?`feedback.accepted_ai`:`feedback.accepted`);return M`<div class="sugg" role="group" aria-label=${t(`feedback.suggestion`)}>
      <ha-icon icon=${i?`mdi:creation-outline`:`mdi:lightbulb-on-outline`}></ha-icon>
      <div class="stext">
        <div class="slabel">${t(i?`feedback.suggestion_ai`:`feedback.suggestion`)}</div>
        <div>${e.text}</div>
        ${this._isAdmin?n?M`<form
                class="row"
                @submit=${t=>{t.preventDefault(),r!==null&&this._run(()=>Oe(this.hass,e.id,`accept`,r),o,!0)}}
              >
                <label>
                  ${a?t(`feedback.adjust_time`):i?t(`feedback.adjust_value`,{min:K(e.min??0,this.lang,1),max:K(e.max??0,this.lang,1)}):t(`feedback.adjust_temp`)}
                  <input
                    type="text"
                    inputmode=${a?`numeric`:`decimal`}
                    .value=${this._editValue}
                    class=${r===null?`bad`:``}
                    @input=${e=>this._editValue=e.target.value}
                  />
                </label>
                <button class="primary" type="submit" ?disabled=${this._busy||r===null}>${t(`feedback.apply`)}</button>
                <button type="button" ?disabled=${this._busy} @click=${()=>this._edit=null}>${t(`cancel`)}</button>
              </form>`:M`<div class="row">
                <button class="primary" ?disabled=${this._busy||this.locked} @click=${()=>this._run(()=>Oe(this.hass,e.id,`accept`),o,!0)}>
                  ${t(`feedback.accept`)}
                </button>
                ${e.type===`ai_rule`?F:M`<button ?disabled=${this._busy||this.locked} @click=${()=>this._startEdit(e)}>${t(`feedback.adjust`)}</button>`}
                <button ?disabled=${this._busy} @click=${()=>this._run(()=>Oe(this.hass,e.id,`dismiss`),t(`feedback.dismissed`))}>
                  ${t(`feedback.dismiss`)}
                </button>
              </div>`:M`<div class="hint">${t(`feedback.admin_only`)}</div>`}
      </div>
    </div>`}render(){let e=this._t,t=this.status?.rooms??[],n=this.status?.feedback?.suggestions??[],r=this.only===`ai`?n.filter(e=>e.type.startsWith(`ai_`)):n;return this.only===`ai`?M`${r.map(e=>this._renderSuggestion(e))}
        ${this.locked&&r.length?M`<div class="hint">${e(`feedback.locked`)}</div>`:F}
        ${this._note?M`<div class="hint" role="status">${this._note}</div>`:F}
        ${this._error?M`<div class="hint err" role="alert">${this._error}</div>`:F}`:M`
      ${r.map(e=>this._renderSuggestion(e))}
      <div class="bar">
        <label class="scope">
          <span>${e(`feedback.title`)}</span>
          <select .value=${this._scope} @change=${e=>this._scope=e.target.value}>
            <option value="">${e(`feedback.house`)}</option>
            ${t.map(e=>M`<option value=${e.id} ?selected=${this._scope===e.id}>${e.name}</option>`)}
          </select>
        </label>
        <div class="btns">
          <button class="fb cold" ?disabled=${this._busy} @click=${()=>this._give(`cold`)}>
            <ha-icon icon="mdi:snowflake"></ha-icon><span>${e(`feedback.cold`)}</span>
          </button>
          <button class="fb ok" ?disabled=${this._busy} @click=${()=>this._give(`ok`)}>
            <ha-icon icon="mdi:check"></ha-icon><span>${e(`feedback.ok`)}</span>
          </button>
          <button class="fb warm" ?disabled=${this._busy} @click=${()=>this._give(`warm`)}>
            <ha-icon icon="mdi:white-balance-sunny"></ha-icon><span>${e(`feedback.warm`)}</span>
          </button>
        </div>
      </div>
      ${this._note?M`<div class="hint" role="status">${this._note}</div>`:F}
      ${this._error?M`<div class="hint err" role="alert">${this._error}</div>`:F}
    `}};dt=pt,dt.properties={hass:{attribute:!1},status:{attribute:!1},lang:{type:String},only:{type:String},locked:{type:Boolean},_scope:{state:!0},_busy:{state:!0},_note:{state:!0},_error:{state:!0},_edit:{state:!0},_editValue:{state:!0}},dt.styles=[$,o`
      :host {
        display: block;
      }
      .bar {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 10px 14px;
      }
      .scope {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
        color: var(--wr-text2);
        flex: 1 1 150px;
      }
      .btns {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        flex: 3 1 270px;
      }
      .fb {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 40px;
        flex: 1 1 0;
        min-width: 0;
        padding-left: 6px;
        padding-right: 6px;
        justify-content: center;
        white-space: nowrap;
      }
      .fb ha-icon {
        --mdc-icon-size: 18px;
      }
      .fb.cold ha-icon {
        color: var(--wr-cold);
      }
      .fb.ok ha-icon {
        color: var(--wr-ok);
      }
      .fb.warm ha-icon {
        color: var(--wr-heat);
      }
      .hint {
        margin-top: 8px;
        font-size: 13px;
        color: var(--wr-text2);
      }
      .hint.err {
        color: var(--wr-err);
      }
      .sugg {
        display: flex;
        gap: 10px;
        padding: 12px;
        margin-bottom: 12px;
        border: 1px solid var(--wr-primary);
        border-radius: var(--wr-radius);
        background: color-mix(in srgb, var(--wr-primary) 8%, transparent);
      }
      .sugg > ha-icon {
        color: var(--wr-primary);
        flex: none;
      }
      .stext {
        flex: 1;
        min-width: 0;
      }
      .slabel {
        font-size: 12px;
        color: var(--wr-text2);
        margin-bottom: 2px;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 8px;
        margin-top: 10px;
      }
      .row label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
        color: var(--wr-text2);
      }
      .row input {
        width: 90px;
      }
      input.bad {
        border-color: var(--wr-err);
      }
    `];function mt(){let e=window.customElements;e.get(`wr-feedback`)||e.define(`wr-feedback`,pt)}function ht(e){let t=e.size??88;return M`<svg
    class="house-art ${e.burning?`burning`:``} ${e.warm?`warm`:``}"
    width=${t}
    height=${t}
    viewBox="0 0 100 100"
    aria-hidden="true"
  >
    <path class="glow" d="M50 18 L88 50 V88 H12 V50 Z" />
    <path class="walls" d="M14 50 V88 H86 V50" />
    <path class="roof" d="M6 54 L50 16 L94 54" />
    <rect class="chimney" x="66" y="24" width="9" height="16" rx="1.5" />
    <rect class="stove" x="34" y="56" width="32" height="32" rx="4" />
    <rect class="window" x="40" y="62" width="20" height="14" rx="2" />
    <g class="flame">
      <path class="f1" d="M50 75 C44 71 45 66 48.5 63 C48 66 50 67 51 65.5 C52.5 63.5 51 61 52 59 C56 62.5 57 70 50 75 Z" />
      <path class="f2" d="M50 75 C47.5 73 47.5 70.5 49.5 68.5 C49.5 70 50.5 70.5 51 69.5 C53 71.5 52.5 74 50 75 Z" />
    </g>
    <g class="smoke">
      <circle cx="71" cy="17" r="3" />
      <circle cx="74" cy="10" r="2.2" />
    </g>
  </svg>`}var gt=o`
  .house-art {
    flex: none;
    color: var(--wr-text2);
  }
  .house-art .walls,
  .house-art .roof {
    fill: none;
    stroke: currentColor;
    stroke-width: 4;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .house-art .glow {
    fill: transparent;
    transition: fill 0.6s;
  }
  .house-art.warm .glow {
    fill: color-mix(in srgb, var(--wr-heat) 10%, transparent);
  }
  .house-art.burning .glow {
    fill: color-mix(in srgb, var(--wr-heat) 20%, transparent);
  }
  .house-art .chimney {
    fill: currentColor;
  }
  .house-art .stove {
    fill: color-mix(in srgb, currentColor 25%, transparent);
    stroke: currentColor;
    stroke-width: 2.5;
  }
  .house-art .window {
    fill: color-mix(in srgb, var(--wr-text) 70%, transparent);
  }
  .house-art .flame {
    opacity: 0;
    transition: opacity 0.4s;
    transform-origin: 50px 75px;
  }
  .house-art .f1 {
    fill: var(--wr-heat);
  }
  .house-art .f2 {
    fill: #ffd43b;
  }
  .house-art .smoke {
    fill: color-mix(in srgb, currentColor 45%, transparent);
    opacity: 0;
  }
  .house-art.burning {
    color: var(--wr-heat);
  }
  .house-art.burning .window {
    fill: #3b1d0e;
  }
  .house-art.burning .flame,
  .house-art.burning .smoke {
    opacity: 1;
  }
  @media (prefers-reduced-motion: no-preference) {
    .house-art.burning .flame {
      animation: wr-flicker 1.3s ease-in-out infinite alternate;
    }
    .house-art.burning .smoke {
      animation: wr-smoke 3s ease-in infinite;
    }
  }
  @keyframes wr-flicker {
    0% {
      transform: scale(1, 1);
    }
    50% {
      transform: scale(0.92, 1.08);
    }
    100% {
      transform: scale(1.05, 0.95);
    }
  }
  @keyframes wr-smoke {
    0% {
      opacity: 0;
      transform: translateY(4px);
    }
    40% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
`;function _t(e,t,n,r={}){let i=r.height??160,a=r.axis!==!1,o=qe(e,{width:600,height:i,padLeft:4,padRight:4,padTop:8,padBottom:a?20:4});if(!o)return F;let s=t(`chart.aria`,{from:K(o.yMin,n,0),to:K(o.yMax,n,0)});return M`<figure class="trend"><div class="plot ${a?`axis`:``}">
    <svg viewBox="0 0 ${600} ${i}" preserveAspectRatio="none" role="img" aria-label=${s} style="height:${i}px">
      ${o.bands.map(e=>N`<rect class="band" x=${e.x} y=${o.top} width=${e.w} height=${o.bottom-o.top}></rect>`)}
      ${a?o.yTicks.map(e=>N`<line class="grid" x1=${o.left} x2=${o.right} y1=${e.y} y2=${e.y}></line>`):F}
      ${o.target?N`<path class="target" d=${o.target}></path>`:F}
      <path class="house" d=${o.house}></path>
    </svg>
    ${o.last?M`<span class="dot" style="left:calc(var(--pl) + (100% - var(--pl)) * ${o.last.x/600});top:${o.last.y/i*100}%"></span>`:F}
    ${a?M`<div class="ylabels" aria-hidden="true">
            ${o.yTicks.map(e=>M`<span style="top:${e.y/i*100}%">${e.value}°</span>`)}
          </div>
          <div class="xlabels" aria-hidden="true">
            ${o.xTicks.map(e=>M`<span style="left:calc(var(--pl) + (100% - var(--pl)) * ${e.x/600})">${e.label}</span>`)}
          </div>`:F}
    </div>
    ${a&&r.legend!==!1?M`<figcaption class="legend">
          <span><i class="lg house"></i>${t(`chart.house`)}</span>
          <span><i class="lg target"></i>${t(`chart.target`)}</span>
          <span><i class="lg band"></i>${t(`chart.burning`)}</span>
        </figcaption>`:F}
  </figure>`}var vt=o`
  .trend {
    margin: 0;
  }
  .trend .plot {
    position: relative;
    --pl: 0px;
  }
  .trend .plot.axis {
    --pl: 30px;
    padding-left: var(--pl);
  }
  .trend svg {
    display: block;
    width: 100%;
    overflow: visible;
  }
  .trend .band {
    fill: color-mix(in srgb, var(--wr-heat) 18%, transparent);
  }
  .trend .grid {
    stroke: var(--wr-div);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }
  .trend .house {
    fill: none;
    stroke: var(--wr-heat);
    stroke-width: 2.5;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  .trend .target {
    fill: none;
    stroke: var(--wr-text2);
    stroke-width: 1.5;
    stroke-dasharray: 5 4;
    vector-effect: non-scaling-stroke;
  }
  .trend .dot {
    position: absolute;
    width: 10px;
    height: 10px;
    margin: -5px 0 0 -5px;
    border-radius: 50%;
    background: var(--wr-heat);
    border: 2px solid var(--wr-card);
    pointer-events: none;
  }
  .trend .ylabels span,
  .trend .xlabels span {
    position: absolute;
    font-size: 11px;
    color: var(--wr-text2);
    line-height: 1;
    pointer-events: none;
  }
  .trend .ylabels span {
    left: 0;
    transform: translateY(-50%);
  }
  .trend .xlabels span {
    bottom: 3px;
    transform: translateX(-50%);
  }
  .trend .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    font-size: 12px;
    color: var(--wr-text2);
    margin-top: 4px;
  }
  .trend .lg {
    display: inline-block;
    width: 14px;
    height: 10px;
    margin-right: 5px;
    vertical-align: -1px;
    border-radius: 2px;
  }
  .trend .lg.house {
    height: 3px;
    vertical-align: 3px;
    background: var(--wr-heat);
  }
  .trend .lg.target {
    height: 0;
    border-top: 2px dashed var(--wr-text2);
    vertical-align: 3px;
  }
  .trend .lg.band {
    background: color-mix(in srgb, var(--wr-heat) 25%, transparent);
  }
`;function yt(e,t={}){let n=t.size??64,r=e===null?0:Math.max(0,Math.min(100,e)),i=78*r/100;return M`<svg class="tank ${t.low?`low`:``}" width=${n*.75} height=${n} viewBox="0 0 75 100" aria-hidden="true">
    <defs>
      <clipPath id="wr-tank-clip"><rect x="10" y=${14} width="55" height=${78} rx="6" /></clipPath>
    </defs>
    <rect class="lid" x="6" y="4" width="63" height="8" rx="3" />
    <rect class="body" x="8" y="12" width="59" height="82" rx="8" />
    <g clip-path="url(#wr-tank-clip)">
      <rect class="fill" x="10" y=${92-i} width="55" height=${i} />
      ${r>6?N`<g class="grains">
            ${[18,30,42,54].map((e,t)=>N`<ellipse cx=${e+t%2*3} cy=${92-i+4} rx="4" ry="2.2"></ellipse>`)}
          </g>`:F}
    </g>
    ${e===null?F:N`<text x="37.5" y="60" text-anchor="middle">${Math.round(r)}%</text>`}
  </svg>`}var bt=o`
  .tank {
    flex: none;
  }
  .tank .lid {
    fill: var(--wr-text2);
  }
  .tank .body {
    fill: var(--wr-input-bg);
    stroke: var(--wr-text2);
    stroke-width: 3;
  }
  .tank .fill {
    fill: #b07d3c;
    transition: all 0.6s;
  }
  .tank.low .fill {
    fill: var(--wr-warn);
  }
  .tank .grains ellipse {
    fill: #8a5a24;
  }
  .tank text {
    font-size: 17px;
    font-weight: 600;
    fill: var(--wr-text);
    paint-order: stroke;
    stroke: var(--wr-card);
    stroke-width: 4px;
  }
`;function xt(e,t){let n=Ze(e);switch(n.key){case`error`:return t(`hero.error`);case`unavailable`:return t(`stove.unavailable`);case`prepare`:return t(`hero.prepare`,{time:n.time});case`self_off`:return t(`hero.self_off`);case`burning`:return t(`hero.burning`,{time:n.time});case`block`:return t(`hero.block`,{time:n.time});case`warmup_planned`:return t(`hero.warmup_planned`,{time:n.time});case`paused`:return t(`hero.paused`,{time:n.time});case`pause`:return t(`hero.pause`,{time:n.time});case`idle_warm`:return t(`hero.idle_warm`);default:return t(`hero.idle`)}}function St(e,t={}){let{t:n,lang:r,status:i}=e,{temp:a,target:o}=Xe(i),s=!!i?.stove?.burning,c=Ze(i);return M`<div class="hero-head">
    ${ht({burning:s,warm:s||c.key===`prepare`||c.key===`block`,size:t.size})}
    <div class="hero-text">
      <div class="hero-label">${n(`hero.inside`)}</div>
      <div class="hero-temp">${ze(a,r)}</div>
      <div class="hero-target">${o===null?F:n(`hero.target`,{temp:ze(o,r)})}${i?.scene?M` · ${i.scene.name}`:F}</div>
      <div class="hero-status ${i?.stove?.error?`err`:s?`heat`:``}">${xt(i,n)}</div>
    </div>
  </div>`}function Ct(e){let t=rt(e.status,e.t);return t.length?M`<div class="alert-strip" role="status">
    ${t.map(e=>M`<div class="as ${e.kind}">
        <ha-icon icon=${e.kind===`opening`?`mdi:window-open-variant`:e.kind.includes(`error`)?`mdi:alert-octagon`:`mdi:alert-circle-outline`}></ha-icon>
        <span>${e.message}</span>
      </div>`)}
  </div>`:F}function wt(e,t,n={}){let{t:r,lang:i,status:a,config:o}=e,s=a?.pellets;if(!s||s.stock_kg===null||s.stock_kg===void 0)return F;let c=Je(s,o?.parameters?.pellet_capacity_kg),l=o?.parameters?.pellet_reminder_kg??5,u=s.stock_kg<=l,d=K(s.stock_kg,i,1),f=s.empty_at?Et(s.empty_at,a?.now,i):null;return n.compact?M`<div class="pellet-mini ${u?`low`:``}">
      <ha-icon icon="mdi:grain"></ha-icon>
      <div class="bar" role="img" aria-label=${r(`pellets.aria`,{pct:String(c??0)})}><i style="width:${c??0}%"></i></div>
      <span>${d} kg${f?M` · ${r(`pellets.until`,{time:f})}`:F}</span>
    </div>`:M`<div class="card pellets ${u?`low`:``}">
    <h3>${r(`pellets.title`)}</h3>
    <div class="prow">
      ${yt(c,{low:u,size:84})}
      <div class="ptext">
        <div class="pkg">${d} kg</div>
        ${f?M`<div>${r(`pellets.until`,{time:f})}</div>`:F}
        ${u?M`<div class="warn-text">${r(`pellets.low`)}</div>`:F}
        ${s.rate_learned?F:M`<div class="hint">${r(`pellets.estimate`)}</div>`}
      </div>
    </div>
    ${t?M`<button ?disabled=${!e.isAdmin||e.busy} title=${e.isAdmin?``:r(`not_admin`)} @click=${t}>
          <ha-icon icon="mdi:sack"></ha-icon>${r(`pellets.refill`)}
        </button>`:F}
  </div>`}var Tt={de:[`So`,`Mo`,`Di`,`Mi`,`Do`,`Fr`,`Sa`],en:[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`]};function Et(e,t,n){let r=/^(\d{4})-(\d{2})-(\d{2})/.exec(e),i=t?/^(\d{4})-(\d{2})-(\d{2})/.exec(t):null;if(!r)return Y(e,t,n);let a=Date.UTC(+r[1],r[2]-1,+r[3]),o=i?Date.UTC(+i[1],i[2]-1,+i[3]):null,s=o===null?null:Math.round((a-o)/864e5);return s===0?J(e):s!==null&&s>0&&s<7?`${Tt[n.startsWith(`de`)?`de`:`en`][new Date(a).getUTCDay()]} ${J(e)}`:Y(e,t,n)}function Dt(e){if(e.temperature===null||e.temperature===void 0||e.target===null||e.target===void 0)return``;let t=e.target-e.temperature;return t>.3?`cold`:t<-.5?`warm`:`ok`}function Ot(e,t){let{t:n,lang:r}=e,i=e.status?.rooms??[];return t?.length&&(i=t.map(e=>i.find(t=>t.id===e)).filter(e=>!!e)),i.length?M`<div class="tiles">
    ${i.map(e=>{let t=e.sensors_missing??0;return M`<div class="tile ${Dt(e)}">
        <div class="tname">${e.name}</div>
        <div class="ttemp">${ze(e.temperature,r)}</div>
        <div class="tsub">
          <span>${n(`room.target`)} ${K(e.target,r,1)}°</span>
          <span class="ticons">
            ${e.open?M`<ha-icon class="cold" icon="mdi:window-open-variant" title=${e.open_minutes?n(`room.open_for`,{time:`${e.open_minutes} min`}):n(`room.open`)}></ha-icon>`:F}
            ${e.ventilating?M`<ha-icon icon="mdi:water-percent" title=${n(`room.ventilating`,{value:K(e.humidity??null,r,0)})}></ha-icon>`:F}
            ${e.recover_until&&!e.open?M`<ha-icon icon="mdi:weather-windy" title=${n(`room.recovering`,{time:J(e.recover_until)})}></ha-icon>`:F}
            ${e.occupied===!0?M`<ha-icon icon="mdi:account" title=${n(`room.occupied`)}></ha-icon>`:F}
            ${t>0?M`<ha-icon class="warn" icon="mdi:access-point-network-off" title=${t===1?n(`room.sensor_missing`):n(`room.sensors_missing`,{n:t})}></ha-icon>`:F}
          </span>
        </div>
      </div>`})}
  </div>`:M`<div class="muted">${t?.length?n(`card.no_rooms`):n(`rooms.none`)}</div>`}var kt=o`
  .hero-head {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .hero-text {
    min-width: 0;
  }
  .hero-label {
    color: var(--wr-text2);
    font-size: 13px;
  }
  .hero-temp {
    font-size: 44px;
    font-weight: 500;
    line-height: 1.05;
    font-variant-numeric: tabular-nums;
  }
  .hero-target {
    color: var(--wr-text2);
  }
  .hero-status {
    margin-top: 6px;
    font-weight: 500;
  }
  .hero-status.heat {
    color: var(--wr-heat);
  }
  .hero-status.err {
    color: var(--wr-err);
  }
  .alert-strip {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .alert-strip .as {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 8px 12px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--wr-warn) 14%, transparent);
    font-size: 13px;
  }
  .alert-strip .as ha-icon {
    color: var(--wr-warn);
    --mdc-icon-size: 18px;
  }
  .alert-strip .as.opening {
    background: color-mix(in srgb, var(--wr-cold) 14%, transparent);
  }
  .alert-strip .as.opening ha-icon {
    color: var(--wr-cold);
  }
  .alert-strip .as.stove_error,
  .alert-strip .as.error {
    background: color-mix(in srgb, var(--wr-err) 14%, transparent);
  }
  .alert-strip .as.stove_error ha-icon,
  .alert-strip .as.error ha-icon {
    color: var(--wr-err);
  }
  .pellets .prow {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 10px;
  }
  .pellets .pkg {
    font-size: 26px;
    font-weight: 500;
  }
  .warn-text {
    color: var(--wr-warn);
    font-weight: 500;
  }
  .pellet-mini {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--wr-text2);
  }
  .pellet-mini .bar {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: var(--wr-input-bg);
    overflow: hidden;
    min-width: 40px;
  }
  .pellet-mini .bar i {
    display: block;
    height: 100%;
    background: #b07d3c;
  }
  .pellet-mini.low .bar i {
    background: var(--wr-warn);
  }
  details.more {
    margin-top: 8px;
  }
  details.more summary {
    cursor: pointer;
    color: var(--wr-primary);
    font-weight: 500;
    padding: 4px 0;
  }
  .tiles {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 140px), 1fr));
  }
  .tile {
    background: var(--wr-card);
    border: 1px solid var(--wr-div);
    border-left: 4px solid var(--wr-div);
    border-radius: 10px;
    padding: 8px 10px;
    min-width: 0;
  }
  .tile.cold {
    border-left-color: var(--wr-cold);
  }
  .tile.warm {
    border-left-color: var(--wr-heat);
  }
  .tile.ok {
    border-left-color: var(--wr-ok);
  }
  .tname {
    font-size: 13px;
    color: var(--wr-text2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ttemp {
    font-size: 22px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .tsub {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    font-size: 12px;
    color: var(--wr-text2);
    min-height: 18px;
  }
  .ticons {
    display: inline-flex;
    gap: 2px;
  }
  .ticons ha-icon {
    --mdc-icon-size: 16px;
  }
  .ticons .cold {
    color: var(--wr-cold);
  }
  .ticons .warn {
    color: var(--wr-warn);
  }
  @media (max-width: 480px) {
    .hero-temp {
      font-size: 38px;
    }
  }
`,At,jt=class extends H{constructor(){super(),this._unsub=null,this._connection=null,this._configLoading=!1,this._config={type:`custom:waermeregie-card`},this._status=null,this._wrConfig=null,this._error=null,this._busy=!1,this._history=null}static getStubConfig(){return{}}setConfig(e){if(!e||typeof e!=`object`)throw Error(`Invalid configuration`);if(e.rooms!==void 0&&!Array.isArray(e.rooms))throw Error(`rooms: list of room ids expected`);this._config={...e}}getCardSize(){let e=this._config?.show_rooms===!1?0:this._config?.rooms?.length??this._status?.rooms?.length??2;return 5+(this._config?.chart===!1?0:2)+Math.ceil(e/2)}get _lang(){return Ue(this.hass?.locale?.language??this.hass?.language)}connectedCallback(){super.connectedCallback(),this.hass&&this._ensure(),this._historyTimer=window.setInterval(()=>void this._loadHistory(),6e5)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._historyTimer),this._unsub?.(),this._unsub=null,this._connection=null}willUpdate(e){e.has(`hass`)&&this.hass&&this._ensure()}_ensure(){this.isConnected&&this.hass?.connection&&(this._connection!==this.hass.connection&&(this._unsub?.(),this._connection=this.hass.connection,this._unsub=Ae(this.hass,e=>{this._status=e,this._error=null},e=>this._error=X(e)),this._loadHistory()),!this._wrConfig&&!this._configLoading&&(this._configLoading=!0,Te(this.hass).then(e=>this._wrConfig=We(e.config)).catch(e=>this._error=X(e)).finally(()=>this._configLoading=!1)))}async _loadHistory(){if(this._config?.chart!==!1&&this.hass?.connection)try{this._history=await ke(this.hass,24)}catch{this._history=null}}render(){let e=Q(this._lang),t={t:e,lang:this._lang,status:this._status,config:this._wrConfig,isAdmin:this.hass?.user?.is_admin!==!1,busy:this._busy},n=this._config;return M`<ha-card>
      <div class="wrap">
        ${n.title?M`<div class="head">${n.title}</div>`:F}
        ${this._error?M`<div class="banner error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div>${this._error}</div></div>`:F}
        ${this._status?M`
              ${nt(t,!0)}
              ${St(t,{size:64})}
              ${Ct(t)}
              ${n.show_actions===!1?F:M`<wr-controls
                    compact
                    .hass=${this.hass}
                    .status=${this._status}
                    .config=${this._wrConfig}
                    .lang=${this._lang}
                    @wr-status=${e=>this._status=e.detail}
                  ></wr-controls>`}
              ${n.show_feedback===!1?F:M`<wr-feedback
                    style="margin-top:12px"
                    .hass=${this.hass}
                    .status=${this._status}
                    .lang=${this._lang}
                    @wr-status=${e=>this._status=e.detail}
                  ></wr-feedback>`}
              ${n.chart!==!1&&this._history?.length?_t(this._history,e,this._lang,{height:90,legend:!1}):F}
              ${n.show_pellets===!1?F:wt(t,null,{compact:!0})}
              ${n.show_rooms===!1?F:Ot(t,n.rooms)}
            `:this._error?F:M`<div class="muted">${e(`loading`)}</div>`}
      </div>
    </ha-card>`}};At=jt,At.properties={hass:{attribute:!1},_config:{state:!0},_status:{state:!0},_wrConfig:{state:!0},_error:{state:!0},_busy:{state:!0},_history:{state:!0}},At.styles=[$,gt,vt,bt,kt,o`
      :host {
        display: block;
      }
      ha-card {
        display: block;
        overflow: hidden;
      }
      .wrap {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .head {
        font-size: 18px;
        font-weight: 500;
      }
      .hero-temp {
        font-size: 34px;
      }
      .tiles {
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 110px), 1fr));
      }
      .tile {
        padding: 6px 8px;
      }
      .ttemp {
        font-size: 18px;
      }
      .banner {
        padding: 8px 12px;
      }
    `];function Mt(){ut(),mt();let e=window.customElements;e.get(`waermeregie-card`)||e.define(`waermeregie-card`,jt)}if(window.customElements.get(`home-assistant`)?Mt():window.customElements.whenDefined(`home-assistant`).then(Mt,Mt),window.customCards=window.customCards||[],!window.customCards.some(e=>e.type===`waermeregie-card`)){let e=Q(Ue(typeof navigator<`u`?navigator.language:`de`));window.customCards.push({type:`waermeregie-card`,name:e(`card.name`),description:e(`card.description`),preview:!1})}export{jt as WaermeregieCard};