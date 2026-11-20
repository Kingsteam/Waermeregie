var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=/* @__PURE__ */ new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:m}=Object,h=globalThis,g=h.trustedTypes,ee=g?g.emptyScript:``,te=h.reactiveElementPolyfillSupport,_=(e,t)=>e,ne={toAttribute(e,t){switch(t){case Boolean:e=e?ee:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},re=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:ne,reflect:!1,useDefault:!1,hasChanged:re};Symbol.metadata??=Symbol(`metadata`),h.litPropertyMetadata??=/* @__PURE__ */ new WeakMap;var y=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(_(`elementProperties`)))return;let e=m(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=/* @__PURE__ */ new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=/* @__PURE__ */ new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=/* @__PURE__ */ new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=/* @__PURE__ */ new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?ne:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?ne:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??re)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=/* @__PURE__ */ new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=/* @__PURE__ */ new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=/* @__PURE__ */ new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};y.elementStyles=[],y.shadowRootOptions={mode:`open`},y[_(`elementProperties`)]=/* @__PURE__ */ new Map,y[_(`finalized`)]=/* @__PURE__ */ new Map,te?.({ReactiveElement:y}),(h.reactiveElementVersions??=[]).push(`2.1.2`);var b=globalThis,x=e=>e,S=b.trustedTypes,ie=S?S.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ae=`$lit$`,C=`lit$${Math.random().toFixed(9).slice(2)}$`,oe=`?`+C,se=`<${oe}>`,w=document,T=()=>w.createComment(``),E=e=>e===null||typeof e!=`object`&&typeof e!=`function`,ce=Array.isArray,le=e=>ce(e)||typeof e?.[Symbol.iterator]==`function`,ue=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,de=/-->/g,fe=/>/g,O=RegExp(`>|${ue}(?:([^\\s"'>=/]+)(${ue}*=${ue}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),pe=/'/g,me=/"/g,he=/^(?:script|style|textarea|title)$/i,ge=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),k=ge(1),A=ge(2),j=Symbol.for(`lit-noChange`),M=Symbol.for(`lit-nothing`),_e=/* @__PURE__ */ new WeakMap,N=w.createTreeWalker(w,129);function ve(e,t){if(!ce(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return ie===void 0?t:ie.createHTML(t)}var ye=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=D;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===D?c[1]===`!--`?o=de:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=O):(he.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=O):o=fe:o===O?c[0]===`>`?(o=i??D,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?O:c[3]===`"`?me:pe):o===me||o===pe?o=O:o===de||o===fe?o=D:(o=O,i=void 0);let d=o===O&&e[t+1].startsWith(`/>`)?` `:``;a+=o===D?n+se:l>=0?(r.push(s),n.slice(0,l)+ae+n.slice(l)+C+d):n+C+(l===-2?t:d)}return[ve(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},be=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=ye(t,n);if(this.el=e.createElement(l,r),N.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=N.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ae)){let t=u[o++],n=i.getAttribute(e).split(C),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ce:r[1]===`?`?we:r[1]===`@`?Te:F}),i.removeAttribute(e)}else e.startsWith(C)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(he.test(i.tagName)){let e=i.textContent.split(C),t=e.length-1;if(t>0){i.textContent=S?S.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],T()),N.nextNode(),c.push({type:2,index:++a});i.append(e[t],T())}}}else if(i.nodeType===8){if(i.data===oe)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(C,e+1))!==-1;)c.push({type:7,index:a}),e+=C.length-1}}a++}}static createElement(e,t){let n=w.createElement(`template`);return n.innerHTML=e,n}};function P(e,t,n=e,r){if(t===j)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=E(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=P(e,i._$AS(e,t.values),i,r)),t}var xe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??w).importNode(t,!0);N.currentNode=r;let i=N.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Se(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ee(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=N.nextNode(),a++)}return N.currentNode=w,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Se=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=M,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),E(e)?e===M||e==null||e===``?(this._$AH!==M&&this._$AR(),this._$AH=M):e!==this._$AH&&e!==j&&this._(e):e._$litType$===void 0?e.nodeType===void 0?le(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==M&&E(this._$AH)?this._$AA.nextSibling.data=e:this.T(w.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=be.createElement(ve(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new xe(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=_e.get(e.strings);return t===void 0&&_e.set(e.strings,t=new be(e)),t}k(t){ce(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(T()),this.O(T()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=x(e).nextSibling;x(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},F=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=M,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(/* @__PURE__ */ new String),this.strings=n):this._$AH=M}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=P(this,e,t,0),a=!E(e)||e!==this._$AH&&e!==j,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=P(this,r[n+o],t,o),s===j&&(s=this._$AH[o]),a||=!E(s)||s!==this._$AH[o],s===M?e=M:e!==M&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===M?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ce=class extends F{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===M?void 0:e}},we=class extends F{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==M)}},Te=class extends F{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??M)===j)return;let n=this._$AH,r=e===M&&n!==M||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==M&&(n===M||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ee=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}},De=b.litHtmlPolyfillSupport;De?.(be,Se),(b.litHtmlVersions??=[]).push(`3.3.3`);var Oe=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Se(t.insertBefore(T(),e),e,void 0,n??{})}return i._$AI(e),i},ke=globalThis,I=class extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Oe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};I._$litElement$=!0,I.finalized=!0,ke.litElementHydrateSupport?.({LitElement:I});var Ae=ke.litElementPolyfillSupport;Ae?.({LitElement:I}),(ke.litElementVersions??=[]).push(`4.2.2`);var je=e=>e.callWS({type:`waermeregie/config`}),Me=(e,t)=>e.callWS({type:`waermeregie/config/save`,config:t}),Ne=(e,t,n=180)=>e.callWS(t===null?{type:`waermeregie/override`,scene:null}:{type:`waermeregie/override`,scene:t,minutes:n}),Pe=(e,t)=>e.callWS({type:`waermeregie/pause`,minutes:t}),Fe=(e,t,n)=>e.callWS({type:`waermeregie/boost`,delta:t,minutes:n}),Ie=(e,t)=>e.callWS({type:`waermeregie/warmup`,...t}),Le=(e,t=24)=>e.callWS({type:`waermeregie/history`,hours:t}).then(e=>Array.isArray(e?.points)?e.points:[]);async function Re(e){if(!e.callService)throw Error(`callService fehlt`);return await e.callService(`waermeregie`,`pellets_refill`,{}),null}var ze=(e,t)=>e.callWS({type:`waermeregie/mode`,mode:t});function Be(e,t,n){let r=null,i=!1;return e.connection.subscribeMessage(t,{type:`waermeregie/subscribe`}).then(e=>{i?e():r=e}).catch(e=>n?.(e)),()=>{if(i=!0,r)try{Promise.resolve(r()).catch(()=>void 0)}catch{}r=null}}async function Ve(e,t){let n=t?.overrides,r=!n,i=null;return(r||n?.scene||t?.scene?.source===`override`)&&(i=await Ne(e,null)),(r||n?.pause_until)&&(i=await Pe(e,0)),(r||n?.boost)&&(i=await Fe(e,0,0)),i}var L=1440,He=[`mon`,`tue`,`wed`,`thu`,`fri`,`sat`,`sun`,`holiday`],Ue=/^([01]\d|2[0-3]):([0-5]\d)$/,R={opening:!0,opening_check:!0,sensor:!0,pellets:!0,stove_error:!0,overheat:!0,opening_delay_min:10,repeat_min:60,ventilate_max_min:30,quiet_start:`22:00`,quiet_end:`07:00`,quiet_hold:!0};function We(e){let t=e.quiet_start??``,n=e.quiet_end??``;return!t&&!n||z(t)!==null&&z(n)!==null&&t!==n}function z(e){let t=Ue.exec(String(e??``).trim());return t?Number(t[1])*60+Number(t[2]):null}function Ge(e){let t=e.trim().replace(/[.,h ]/g,`:`),n,r,i=/^(\d{1,2}):(\d{1,2})$/.exec(t),a=/^(\d{1,4})$/.exec(t);if(i)n=Number(i[1]),r=Number(i[2]);else if(a){let e=a[1];n=Number(e.length<=2?e:e.slice(0,e.length-2)),r=e.length<=2?0:Number(e.slice(-2))}else return e;return n>23||r>59?e:`${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}function B(e){let t=(Math.floor(e)%L+L)%L;return`${String(Math.floor(t/60)).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function Ke(e){return(e??[]).map(e=>({start:z(e.start),scene:e.scene})).filter(e=>e.start!==null&&!!e.scene).sort((e,t)=>e.start-t.start)}function qe(e,t,n){let r=typeof t==`number`?t:z(t);if(r===null)return null;let i=Ke(e),a=null;for(let e of i)if(e.start<=r)a=e.scene;else break;if(a!==null)return a;let o=Ke(n??e);return o.length?o[o.length-1].scene:null}function Je(e,t){let n=Ke(e);if(!n.length)return[];let r=[];if(n[0].start>0){let i=qe(e,0,t);i&&r.push({from:0,to:n[0].start,scene:i})}return n.forEach((e,t)=>{let i=t+1<n.length?n[t+1].start:L;i>e.start&&r.push({from:e.start,to:i,scene:e.scene})}),r.reduce((e,t)=>{let n=e[e.length-1];return n&&n.scene===t.scene&&n.to===t.from?n.to=t.to:e.push({...t}),e},[])}function Ye(e,t){let n=[];if(!e||e.length===0)return[{index:-1,code:`empty`}];let r=null;return e.forEach((e,i)=>{let a=z(e.start);a===null?n.push({index:i,code:`time_format`}):(r!==null&&a<=r&&n.push({index:i,code:`not_ascending`}),r=a),e.scene?t&&!t.includes(e.scene)&&n.push({index:i,code:`scene_unknown`}):n.push({index:i,code:`scene_missing`})}),n}var Xe={ä:`ae`,ö:`oe`,ü:`ue`,ß:`ss`};function Ze(e,t=[],n=`eintrag`){let r=String(e??``).toLowerCase().replace(/[äöüß]/g,e=>Xe[e]??e).normalize(`NFD`).replace(/[̀-ͯ]/g,``).replace(/[^a-z0-9]+/g,`_`).replace(/^_+|_+$/g,``);r||=n;let i=new Set(t);if(!i.has(r))return r;let a=2;for(;i.has(`${r}_${a}`);)a++;return`${r}_${a}`}function Qe(e){return e.startsWith(`de`)?`,`:`.`}function V(e,t,n=1){if(e==null||!Number.isFinite(e))return`–`;let r=e.toFixed(n);return Qe(t)===`,`?r.replace(`.`,`,`):r}function H(e,t){let n=V(e,t,1);return n===`–`?n:`${n} °C`}function $e(e,t,n=!1){let r=V(e,t,1);return r===`–`?r:`${n&&e>0?`+`:``}${r} K`}var U=/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;function W(e){if(!e)return`–`;let t=U.exec(e);if(t)return`${t[4]}:${t[5]}`;let n=z(e);return n===null?`–`:B(n)}function et(e,t){let n=e?U.exec(e):null;return n?t.startsWith(`de`)?`${n[3]}.${n[2]}.`:`${n[2]}/${n[3]}`:``}function tt(e){let t=e?U.exec(e):null;return t?`${t[1]}-${t[2]}-${t[3]}`:null}function nt(e){let t=e?U.exec(e):null;return t?Number(t[4])*60+Number(t[5]):null}function G(e,t,n){let r=W(e);if(r===`–`)return r;let i=tt(e);if(i&&t&&i===tt(t))return r;let a=et(e,n);return a?`${a} ${r}`:r}function rt(e){return(e??[]).map((e,t)=>({e,i:t,t:Date.parse(e.time)})).sort((e,t)=>{let n=Number.isNaN(e.t)?-1/0:e.t;return(Number.isNaN(t.t)?-1/0:t.t)-n||t.i-e.i}).map(e=>e.e)}function it(e){if(!e)return{};if(Array.isArray(e)){let[t,n]=e;return{min:Number.isFinite(t)?t:void 0,max:Number.isFinite(n)?n:void 0}}let t={};return typeof e.min==`number`&&(t.min=e.min),typeof e.max==`number`&&(t.max=e.max),typeof e.step==`number`&&(t.step=e.step),t}function at(e){return Array.isArray(e)?e.length>=2&&e.every(e=>typeof e==`number`):!!e&&typeof e==`object`&&(`min`in e||`max`in e)}function ot(e){let t=e?.limits;if(!t||typeof t!=`object`)return{};let n={};for(let[e,r]of Object.entries(t))at(r)&&(n[e]=r);let r=t.parameters;if(r&&typeof r==`object`&&!at(r))for(let[e,t]of Object.entries(r))at(t)&&(n[e]=t);return n}function st(e,t){return!(!Number.isFinite(e)||t.min!==void 0&&e<t.min||t.max!==void 0&&e>t.max)}function ct(e){let t=String(e??`de`).toLowerCase();return t.startsWith(`de`)||t===``?`de`:`en`}function K(e){return e===void 0?e:JSON.parse(JSON.stringify(e))}function lt(e,t){return ut(e)===ut(t)}function ut(e){if(typeof e!=`object`||!e)return JSON.stringify(e)??`null`;if(Array.isArray(e))return`[${e.map(ut).join(`,`)}]`;let t=e;return`{${Object.keys(t).filter(e=>t[e]!==void 0).sort().map(e=>`${JSON.stringify(e)}:${ut(t[e])}`).join(`,`)}}`}var dt=[`#e8590c`,`#1c7ed6`,`#2f9e44`,`#7048e8`,`#0c8599`,`#f08c00`,`#c2255c`,`#5c940d`,`#868e96`];function ft(e,t){let n=t.indexOf(e);return n<0?`#868e96`:dt[n%dt.length]}function pt(e){let t=e??{};return{...t,stove:{...t.stove??{},climate:t.stove?.climate??null,power:t.stove?.power??null,chrono_switch:t.stove?.chrono_switch??null,eco_switch:t.stove?.eco_switch??null,error_sensor:t.stove?.error_sensor??null,water_sensor:t.stove?.water_sensor??null,ignitions_sensor:t.stove?.ignitions_sensor??null},weather:t.weather??null,outdoor_sensor:t.outdoor_sensor??null,workday:t.workday??null,persons:t.persons??[],pet:t.pet??null,notify:t.notify??[],notifications:{...R,...t.notifications??{}},rooms:(t.rooms??[]).map(e=>({...e,importance:e.importance??2,radiators:e.radiators??[],temperature_sensors:(e.temperature_sensors??[]).map(e=>({...e,weight:e.weight??1,offset:e.offset??0})),openings:e.openings??[],presence:e.presence??[],humidity_sensors:e.humidity_sensors??[],ventilate_humidity:e.ventilate_humidity??65,ventilate_rise:e.ventilate_rise??6,paused:e.paused??[],targets:e.targets??{}})),scenes:t.scenes??[],day_types:(t.day_types??[]).map(e=>({...e,slots:e.slots??[]})),week:t.week??{},warmup_scene:t.warmup_scene??null,parameters:t.parameters??{},mode:t.mode??`shadow`}}function q(e){if(!e)return``;if(typeof e==`string`)return e;if(typeof e==`object`){let t=e;if(typeof t.message==`string`&&t.message)return t.message;if(t.error&&typeof t.error.message==`string`)return t.error.message;if(typeof t.code==`string`)return t.code}return String(e)}var J=e=>typeof e==`number`&&Number.isFinite(e);function mt(e){if(!e.length)return[18,22];let t=Math.floor(Math.min(...e)-.3),n=Math.ceil(Math.max(...e)+.3);if(n-t<2){let e=(n+t)/2;t=Math.floor(e-1),n=t+2}return[t,n]}function ht(e){let t=[],n=-1;return e.forEach((e,r)=>{e.burning&&n<0&&(n=r),!e.burning&&n>=0&&(t.push([n,r]),n=-1)}),n>=0&&t.push([n,e.length]),t}function gt(e,t){let n=(e??[]).filter(e=>e&&typeof e.t==`string`&&!Number.isNaN(Date.parse(e.t)));if(n.sort((e,t)=>Date.parse(e.t)-Date.parse(t.t)),n.filter(e=>J(e.house_c)).length<2)return null;let r=t.padLeft??28,i=t.width-(t.padRight??8),a=t.padTop??8,o=t.height-(t.padBottom??18),s=Date.parse(n[0].t),c=Date.parse(n[n.length-1].t),l=Math.max(1,c-s),u=e=>r+(Date.parse(e)-s)/l*(i-r),[d,f]=mt(n.flatMap(e=>[e.house_c,e.target_c]).filter(J)),p=e=>o-(e-d)/(f-d)*(o-a),m=e=>Math.round(e*10)/10,h=``,g=!1,ee=null;for(let e of n)J(e.house_c)?(h+=`${g?`L`:`M`}${m(u(e.t))},${m(p(e.house_c))}`,g=!0,ee={x:m(u(e.t)),y:m(p(e.house_c)),value:e.house_c}):g=!1;let te=``,_=null;for(let e of n){if(!J(e.target_c)){_=null;continue}let t=m(u(e.t)),n=m(p(e.target_c));te+=_===null?`M${t},${n}`:`H${t}${n===_?``:`V${n}`}`,_=n}let ne=n.length>1?(i-r)/(n.length-1):0,re=ht(n).map(([e,t])=>{let r=u(n[e].t),a=t<n.length?u(n[t].t):Math.min(i,u(n[t-1].t)+ne);return{x:m(r),w:m(Math.max(1,a-r))}}),v=[],y=Math.max(2,Math.floor((o-a)/24)),b=Math.max(1,Math.ceil((f-d)/y));for(let e=d;e<=f;e+=b)v.push({y:m(p(e)),value:e});let x=[],S=/* @__PURE__ */ new Set;for(let e of n){let t=nt(e.t);if(t===null)continue;let n=Math.floor(t/60),r=`${e.t.slice(0,10)} ${n}`;n%6==0&&!S.has(r)&&(S.add(r),x.push({x:m(u(e.t)),label:B(n*60)}))}return{width:t.width,height:t.height,left:r,right:i,top:a,bottom:o,yMin:d,yMax:f,house:h,target:te,bands:re,yTicks:v,xTicks:x,last:ee}}function _t(e,t){if(!e)return null;if(J(e.fill_pct))return Math.max(0,Math.min(100,Math.round(e.fill_pct)));let n=J(e.capacity_kg)?e.capacity_kg:t;return!J(e.stock_kg)||!J(n)||n<=0?null:Math.max(0,Math.min(100,Math.round(e.stock_kg/n*100)))}function vt(e,t=/* @__PURE__ */ new Date){let n=nt(e);return n===null&&(n=t.getHours()*60+t.getMinutes()),B(Math.ceil((n+60)/15)*15%1440)}function yt(e){let t=e?.house;if(t&&(J(t.temperature_c)||J(t.target_c)))return{temp:J(t.temperature_c)?t.temperature_c:null,target:J(t.target_c)?t.target_c:null};let n=e?.rooms??[],r=e=>e.length?Math.round(e.reduce((e,t)=>e+t,0)/e.length*10)/10:null;return{temp:r(n.map(e=>e.temperature).filter(J)),target:r(n.map(e=>e.target).filter(J))}}function bt(e){let t=e?.stove;if(!t)return{key:`idle`};if(t.error)return{key:`error`};if(t.phase===`prepare`)return{key:`prepare`,time:W(t.start_at)};if(t.self_off)return{key:`self_off`};if(t.burning)return{key:`burning`,time:W(t.block_start)};if(t.phase===`block`)return{key:`block`,time:W(t.block_start)};if(!t.available)return{key:`unavailable`};let n=e?.warmup;if(n&&!n.active&&n.start_at)return{key:`warmup_planned`,time:W(n.start_at)};let r=e?.overrides?.pause_until;if(r)return{key:`paused`,time:W(r)};if(t.phase===`pause`&&t.pause_until)return{key:`pause`,time:W(t.pause_until)};let i=e?.house?.deficit_k;return J(i)&&i<0?{key:`idle_warm`}:{key:`idle`}}function xt(e,t){let n=e?.warmup;return!n||!n.until?null:n.active?t(`warmup.active_until`,{time:W(n.until)}):n.arrive?t(`warmup.planned_arrive`,{time:W(n.start_at),arrive:W(n.arrive)}):t(`warmup.planned`,{time:W(n.start_at)})}var St={title:`Wärmeregie`,"tab.overview":`Übersicht`,"tab.rooms":`Räume`,"tab.schedule":`Tagesablauf`,"tab.scenes":`Szenen`,"tab.house":`Ofen & Haus`,"tab.log":`Protokoll`,menu:`Menü`,loading:`Wird geladen …`,load_error:`Die Daten von Wärmeregie konnten nicht geladen werden.`,retry:`Erneut versuchen`,not_admin:`Nur Administratoren können das ändern.`,error:`Fehler`,close:`Schließen`,cancel:`Abbrechen`,delete:`Löschen`,add:`Hinzufügen`,remove:`Entfernen`,none:`–`,id:`Kennung`,"mode.shadow_banner":`Schattenbetrieb: es wird nichts geschaltet`,"mode.shadow_banner_hint":`Wärmeregie rechnet nur mit und zeigt, was es tun würde. Ofen und Heizkörper bleiben unberührt.`,"mode.label":`Betriebsart`,"mode.shadow":`Schatten`,"mode.active":`Aktiv`,"mode.confirm_active":`Auf „Aktiv“ umschalten? Dann schaltet Wärmeregie den Ofen und stellt die Heizkörper selbst.`,"mode.confirm_shadow":`Auf „Schatten“ umschalten? Dann wird nichts mehr geschaltet, Wärmeregie rechnet nur noch mit.`,"mode.confirm_yes_active":`Ja, aktiv schalten`,"mode.confirm_yes_shadow":`Ja, nur noch mitrechnen`,"scene.title":`Szene`,"scene.auto":`Automatisch`,"scene.auto_hint":`nach Tagesablauf`,"scene.override_until":`von Hand bis {time}`,"scene.next_change":`nächster Wechsel {time}`,"scene.override_hint":`Eine Szene gilt nach dem Antippen für 3 Stunden.`,"day_type.today":`Heute: {name}`,"stove.title":`Ofen`,"stove.phase.idle":`Bereit`,"stove.phase.block":`Heizblock läuft`,"stove.phase.pause":`Pause`,"stove.phase.blocked":`Gesperrt`,"stove.action.start":`möchte starten`,"stove.action.stop":`möchte ausschalten`,"stove.action.keep":`keine Änderung`,"stove.burning":`brennt`,"stove.not_burning":`brennt nicht`,"stove.unavailable":`Ofen nicht erreichbar`,"stove.starts_today":`Starts heute`,"stove.pause_until":`Pause bis`,"stove.block_since":`Heizblock seit`,"stove.reason":`Grund`,"stove.chrono_warning":`Das Zeitprogramm (Chrono) des Ofens ist an. Im aktiven Betrieb schaltet Wärmeregie es aus; im Schattenbetrieb bitte selbst darauf achten.`,"stove.eco_warning":`Eco ist am Ofen eingeschaltet. Im aktiven Betrieb schaltet Wärmeregie es aus.`,"stove.error":`Der Ofen meldet eine Störung. Solange startet Wärmeregie ihn nicht.`,"stove.error_short":`Störung`,"stove.power_level":`Leistungsstufe`,"stove.water":`Wasser`,"stove.ignitions":`Zündungen`,"stove.no_status":`Noch kein Ofenstatus.`,"house.outdoor":`Außen`,"house.deficit":`Wärmebedarf`,"rooms.title":`Räume`,"room.current":`Ist`,"room.target":`Ziel`,"room.radiator":`Heizkörper`,"room.open":`offen`,"room.open_for":`offen seit {time}`,"room.occupied":`belegt`,"room.empty":`leer`,"room.sensors_missing":`{n} Fühler fehlen`,"room.sensor_missing":`1 Fühler fehlt`,"room.too_cold":`zu kalt`,"rooms.none":`Noch keine Räume eingerichtet.`,"alerts.title":`Hinweise`,"alerts.none":`Alles in Ordnung.`,"actions.title":`Schnellaktionen`,"actions.boost":`+1 °C für 1 Stunde`,"actions.boost_short":`+1 °C`,"actions.pause":`Ofen 2 Stunden pausieren`,"actions.pause_short":`Pause 2 h`,"actions.clear":`Aufheben`,"actions.clear_hint":`Hebt Szene von Hand, Pause und +1 °C auf.`,"actions.boost_active":`+{delta} °C aktiv`,"actions.pause_active":`Ofen pausiert bis {time}`,"actions.done":`Erledigt.`,"editor.unsaved":`Ungespeicherte Änderungen`,"editor.saved":`Alles gespeichert`,"editor.save":`Speichern`,"editor.saving":`Speichert …`,"editor.discard":`Verwerfen`,"editor.save_error":`Speichern fehlgeschlagen: {message}`,"editor.save_ok":`Gespeichert.`,"editor.fix_errors":`Bitte zuerst die rot markierten Angaben korrigieren.`,"editor.leave_warning":`Es gibt ungespeicherte Änderungen.`,"rooms.add_placeholder":`Name des neuen Raums, z. B. Wohnzimmer`,"rooms.add":`Raum hinzufügen`,"rooms.select":`Raum auswählen`,"room.name":`Name`,"room.importance":`Wichtigkeit`,"room.importance_hint":`Wichtige Räume zählen stärker, wenn entschieden wird, ob der Ofen startet.`,"importance.1":`niedrig`,"importance.2":`mittel`,"importance.3":`hoch`,"room.radiators":`Heizkörperthermostate`,"room.radiators_hint":`Thermostate in diesem Raum (z. B. Tado).`,"room.sensors":`Temperaturfühler`,"room.sensors_hint":`Wird kein Fühler gewählt, gilt die Temperatur der Thermostate. Das erste Feld ist das Gewicht (wie stark ein Fühler zählt), das zweite eine Korrektur in K.`,"room.weight":`Gewicht`,"room.openings":`Fenster und Türen`,"room.openings_hint":`Ist etwas offen, wird hier nicht geheizt.`,"room.presence":`Anwesenheit`,"room.presence_hint":`Bewegungs- oder Anwesenheitsmelder. Optional.`,"room.humidity":`Luftfeuchte`,"room.humidity_hint":`Optional. Ist das Fenster bei hoher Feuchte offen (z. B. nach dem Duschen), ist das gewolltes Lüften: keine Meldung, bis die Feuchte wieder unten ist.`,"room.ventilate":`Lüften wegen Feuchte`,"room.ventilate_hint":`Feucht ist der Raum, wenn die Feuchte über der Schwelle liegt ODER um den Anstieg über dem Tiefstwert der letzten 90 Minuten. 0 schaltet den jeweiligen Wert ab.`,"room.ventilate_humidity":`Schwelle`,"room.ventilate_rise":`Anstieg über Grundwert`,"room.ventilating":`Lüften wegen Feuchte ({value} %)`,"room.targets":`Zieltemperaturen je Szene`,"room.targets_hint":`Leer lassen = Standardwert der Szene.`,"room.devices":`Geräte`,"room.devices_hint":`Pausierte Geräte bleiben eingetragen, werden aber nicht verwendet, z. B. wenn ein Melder offline ist.`,"room.recovering":`lüftet nach bis {time}`,"dev.pause":`Pausieren`,"dev.resume":`Wieder verwenden`,"dev.paused":`pausiert`,"dev.unavailable":`nicht verfügbar`,"dev.add":`Gerät hinzufügen`,"dev.open":`offen`,"dev.closed":`zu`,"dev.occupied":`belegt`,"dev.empty":`leer`,"dev.none":`keine`,"dev.unavail_count":`{n} Geräte nicht verfügbar`,"dev.unavail_one":`1 Gerät nicht verfügbar`,"dev.pause_unavail":`Nicht verfügbare pausieren`,"dev.held":`kurz weg, letzter Wert gilt`,"dev.drops":`{n}× weg (24 h)`,"param.opening_check_min":`Fenster prüfen nach`,"param.opening_check_min_hint":`Meldet ein Fenster so lange offen und der Raum kühlt nicht ab, kommt ein Hinweis aufs Handy: Sensor prüfen. Der Raum bleibt trotzdem auf Frostschutz. 0 = aus.`,"param.sensor_hold_min":`Aussetzer überbrücken bis`,"param.sensor_hold_min_hint":`Ist ein Sensor kurz nicht erreichbar, gilt so lange sein letzter Wert. Ein offenes Fenster bleibt also offen. Danach zählt ein Fenster als zu und ein Fühler wird weggelassen. 0 = aus.`,"param.sensor_alert_min":`Ausfall melden nach`,"param.sensor_alert_min_hint":`Ist ein Sensor so lange nicht erreichbar, kommt eine Nachricht aufs Handy, höchstens einmal am Tag je Sensor. 0 = keine Nachricht.`,"param.opening_recovery_min":`Nach dem Lüften warten`,"param.opening_recovery_min_hint":`So lange zählt ein gelüfteter Raum nach dem Schließen nicht für den Ofenstart. Die Luft wird von selbst schnell wieder warm. 0 = aus.`,"room.delete":`Raum löschen`,"room.delete_confirm":`Raum „{name}“ wirklich löschen? Das lässt sich nach dem Speichern nicht rückgängig machen.`,"schedule.day_types":`Tagesarten`,"schedule.day_types_hint":`Eine Tagesart legt fest, ab wann welche Szene gilt. Vor dem ersten Zeitpunkt gilt die letzte Szene des Vortags.`,"schedule.add_placeholder":`Name der neuen Tagesart, z. B. Homeoffice`,"schedule.add":`Tagesart hinzufügen`,"schedule.slot_from":`ab`,"schedule.add_slot":`Zeitpunkt hinzufügen`,"schedule.week":`Woche`,"schedule.week_hint":`Welche Tagesart gilt an welchem Tag?`,"schedule.delete_day_type":`Tagesart löschen`,"schedule.delete_confirm":`Tagesart „{name}“ wirklich löschen?`,"schedule.in_use":`Wird in der Woche verwendet ({days}). Bitte dort zuerst eine andere Tagesart wählen.`,"schedule.no_scenes":`Bitte zuerst unter „Szenen“ eine Szene anlegen.`,"slot.time_format":`Uhrzeit bitte als HH:MM angeben.`,"slot.not_ascending":`Die Zeiten müssen aufsteigend sein.`,"slot.scene_missing":`Bitte eine Szene wählen.`,"slot.scene_unknown":`Diese Szene gibt es nicht mehr.`,"slot.empty":`Mindestens ein Zeitpunkt ist nötig.`,"week.mon":`Montag`,"week.tue":`Dienstag`,"week.wed":`Mittwoch`,"week.thu":`Donnerstag`,"week.fri":`Freitag`,"week.sat":`Samstag`,"week.sun":`Sonntag`,"week.holiday":`Feiertag`,"week.unset":`– bitte wählen –`,"scenes.title":`Szenen`,"scenes.hint":`Eine Szene ist ein Wärmewunsch, z. B. Komfort oder Sparen.`,"scenes.add_placeholder":`Name der neuen Szene, z. B. Komfort`,"scenes.add":`Szene hinzufügen`,"scene.name":`Name`,"scene.icon":`Symbol`,"scene.icon_hint":`z. B. mdi:sofa`,"scene.stove":`Ofen`,"scene.stove.allow":`darf heizen`,"scene.stove.frost_only":`nur gegen Kälte (Frost/Nacht)`,"scene.stove.deny":`bleibt aus`,"scene.default_target":`Standardziel`,"scene.delete":`Szene löschen`,"scene.delete_confirm":`Szene „{name}“ wirklich löschen? Eigene Zieltemperaturen der Räume für diese Szene werden entfernt.`,"scene.in_use":`Wird im Tagesablauf verwendet ({names}). Bitte dort zuerst ersetzen.`,"scenes.matrix":`Zieltemperaturen Raum × Szene`,"scenes.matrix_hint":`Leere Felder verwenden das Standardziel der Szene.`,"scenes.none":`Noch keine Szenen.`,"house.stove":`Ofen`,"house.stove_climate":`Ofen-Thermostat`,"house.stove_climate_hint":`Pflicht. Die Thermostat-Entität des Pelletofens.`,"house.stove_climate_active_hint":`Ohne Ofen-Thermostat kann Wärmeregie nur im Schattenbetrieb laufen.`,"house.power":`Leistungsstufe`,"house.power_hint":`Optional. Auswahl- oder Zahl-Entität für die Stufe 1 bis 5.`,"house.stove_functions":`Ofen-Funktionen`,"house.stove_functions_hint":`Im aktiven Betrieb schaltet Wärmeregie das Zeitprogramm (Chrono) und Eco des Ofens aus und wählt die Leistungsstufe selbst. Im Schattenbetrieb gibt es nur Hinweise.`,"house.chrono_switch":`Zeitprogramm (Chrono)`,"house.chrono_switch_hint":`Optional. Schalter für das eigene Zeitprogramm des Ofens.`,"house.eco_switch":`Eco`,"house.eco_switch_hint":`Optional. Schalter für den Eco-Modus des Ofens.`,"house.error_sensor":`Störung`,"house.error_sensor_hint":`Optional. Meldet der Ofen eine Störung, wird er nicht gestartet.`,"house.water_sensor":`Wassertemperatur`,"house.water_sensor_hint":`Optional. Nur zur Anzeige.`,"house.ignitions_sensor":`Zündzähler`,"house.ignitions_sensor_hint":`Optional. Nur zur Anzeige.`,"house.environment":`Wetter und Kalender`,"house.weather":`Wetter`,"house.weather_hint":`Optional. Für die Vorhersage.`,"house.outdoor_sensor":`Außenfühler`,"house.outdoor_sensor_hint":`Optional. Genauer als die Wettervorhersage.`,"house.workday":`Arbeitstag`,"house.workday_hint":`Optional. Erkennt Feiertage (Integration „Arbeitstag“).`,"house.people":`Bewohner`,"house.persons":`Personen`,"house.persons_hint":`Ist niemand zu Hause, wird gespart.`,"house.pet":`Haustier`,"house.pet_hint":`Optional. Ist ein Tier zu Hause, wird nicht unter die Frostgrenze abgesenkt.`,"house.notify":`Benachrichtigungen`,"house.notify_hint":`Wohin sollen Hinweise geschickt werden?`,"house.notify_none":`Keine Benachrichtigungsdienste gefunden.`,"house.notify_unknown":`nicht mehr vorhanden`,"house.messages":`Meldungen`,"house.messages_hint":`Was soll aufs Handy kommen, wie oft und wann nicht?`,"house.msg_kinds":`Diese Meldungen schicken`,"msg.opening":`Fenster oder Tür länger offen`,"msg.opening_check":`Fenster meldet offen, Raum kühlt nicht ab`,"msg.sensor":`Geräte nicht erreichbar`,"msg.pellets":`Pellets nachfüllen`,"msg.stove_error":`Störung des Ofens (auch in der Ruhezeit)`,"msg.overheat":`Kesselschutz: Wasser zu heiß (auch in der Ruhezeit)`,"msg.opening_delay_min":`Fenster erst melden nach`,"msg.opening_delay_min_hint":`Kurzes Lüften bleibt still. Die Heizung reagiert trotzdem sofort.`,"msg.repeat_min":`Gleiche Meldung frühestens wieder nach`,"msg.repeat_min_hint":`Verhindert, dass ein Fenster, das auf und zu geht, jedes Mal meldet. 0 = keine Sperre.`,"msg.ventilate_max_min":`Lüften wegen Feuchte höchstens`,"msg.ventilate_max_min_hint":`Steht das Fenster nach dem Duschen länger offen, kommt danach doch eine Meldung.`,"msg.quiet":`Ruhezeit`,"msg.quiet_hint":`In dieser Zeit kommt nur die Ofen-Störung. Beide Felder leer = keine Ruhezeit.`,"msg.quiet_start":`von`,"msg.quiet_end":`bis`,"msg.quiet_invalid":`Beginn und Ende angeben (HH:MM) und nicht gleich.`,"msg.quiet_hold":`Danach gesammelt in einer Nachricht schicken (sonst verwerfen)`,"house.parameters":`Regelwerte`,"house.parameters_hint":`Die Voreinstellungen passen für die meisten Häuser. Nur ändern, wenn nötig.`,"house.out_of_range":`Erlaubt: {min} bis {max}`,"pgroup.stove":`Ofen starten und stoppen`,"pgroup.openings":`Fenster und Türen`,"pgroup.sensors":`Ausfall von Sensoren`,"pgroup.radiators":`Heizkörper`,"pgroup.limits":`Untergrenzen`,"pgroup.presence":`Anwesenheit`,"pgroup.pellets":`Pellets`,"param.pellet_bag_kg":`Gewicht eines Sacks`,"param.pellet_bag_kg_hint":`So viel zählt der Knopf „Sack Pellets nachgefüllt“ dazu.`,"param.pellet_capacity_kg":`Fassungsvermögen des Behälters`,"param.pellet_capacity_kg_hint":`Mehr passt nicht hinein; der Vorrat wird darauf begrenzt.`,"param.pellet_rate_kg_h":`Verbrauch pro Brennstunde (Startwert)`,"param.pellet_rate_kg_h_hint":`Gilt, bis die Wärmeregie aus einem leeren Behälter den echten Wert gelernt hat.`,"param.pellet_reminder_kg":`Erinnern ab Vorrat`,"param.pellet_reminder_kg_hint":`Fällt die Schätzung darunter, kommt eine Nachricht.`,"stove.pellets":`Pellets`,"stove.pellets_empty":`leer`,"pgroup.power":`Leistungsstufe`,"pgroup.other":`Weitere`,"param.start_below_k":`Start, wenn so viel unter Ziel`,"param.start_below_k_hint":`Der Ofen startet erst, wenn die Wohnräume so viel kälter als gewünscht sind.`,"param.stop_above_k":`Stopp, wenn so viel über Ziel`,"param.stop_above_k_hint":`Der Heizblock endet, wenn es so viel wärmer als gewünscht ist.`,"param.min_burn_min":`Kürzeste Brenndauer`,"param.min_burn_min_hint":`Ein Heizblock läuft mindestens so lange. Schont den Ofen.`,"param.max_burn_min":`Längste Brenndauer`,"param.max_burn_min_hint":`Danach wird ein Heizblock immer beendet.`,"param.min_pause_min":`Kürzeste Pause`,"param.min_pause_min_hint":`So lange bleibt der Ofen nach einem Heizblock mindestens aus.`,"param.max_starts_per_day":`Starts pro Tag höchstens`,"param.max_starts_per_day_hint":`Wenige lange Heizblöcke sind besser als häufiges An und Aus.`,"param.opening_grace_min":`Kurz lüften erlaubt`,"param.opening_grace_min_hint":`So lange darf ein Fenster offen sein, ohne dass etwas passiert.`,"param.opening_stop_min":`Ofen stoppt bei offenem Fenster nach`,"param.opening_stop_min_hint":`Bleibt ein Fenster länger offen, wird der Heizblock beendet.`,"param.opening_empty_room_min":`Leerer Raum: Heizkörper zu nach`,"param.opening_empty_room_min_hint":`In einem leeren Raum mit offenem Fenster wird der Heizkörper schon so früh abgedreht.`,"param.radiator_boost_k":`Heizkörper-Vorlauf`,"param.radiator_boost_k_hint":`Während der Ofen brennt, werden die Heizkörper so viel höher gestellt.`,"param.frost_c":`Frostgrenze`,"param.frost_c_hint":`Kälter darf es nie werden. Gilt auch bei Szenen, in denen der Ofen sonst aus bleibt.`,"param.night_floor_c":`Nachtuntergrenze`,"param.night_floor_c_hint":`Nachts wird mindestens auf diese Temperatur geheizt.`,"param.stove_block_setpoint_c":`Ofen-Sollwert im Heizblock`,"param.stove_block_setpoint_c_hint":`Auf diesen Wert wird das Ofen-Thermostat gestellt, damit er sicher durchbrennt.`,"param.presence_empty_min":`Raum gilt als leer nach`,"param.presence_empty_min_hint":`So lange ohne Bewegung, dann gilt ein Raum als leer.`,"param.power_min":`Kleinste Leistungsstufe`,"param.power_min_hint":`Mit dieser Stufe läuft ein Heizblock bei mildem Wetter (1 bis 5).`,"param.power_max":`Größte Leistungsstufe`,"param.power_max_hint":`Höchste Stufe, die Wärmeregie wählt (1 bis 5).`,"param.power_cold_c":`Volle Leistung unter`,"param.power_cold_c_hint":`Ist es draußen kälter, wird die größte Leistungsstufe gewählt.`,"log.title":`Protokoll`,"log.empty":`Noch keine Einträge.`,"log.shadow":`Schatten`,"log.shadow_hint":`Nur berechnet, nicht geschaltet`,"picker.search":`Suchen …`,"picker.no_results":`Keine passenden Entitäten.`,"picker.show_all":`auch andere Arten anzeigen`,"picker.missing":`nicht gefunden`,"picker.more":`Weitere Treffer – bitte genauer suchen.`,"hero.inside":`Drinnen`,"hero.target":`Ziel {temp}`,"hero.error":`Der Ofen meldet eine Störung.`,"hero.prepare":`Heizkörper öffnen, Ofen zündet um {time}`,"hero.self_off":`Ofen hat selbst abgeschaltet (Wasser heiß), wartet auf Neustart`,"stove.overheat":`Kesselschutz: Wasser zu heiß, Ofen aus, alle Heizkörper offen`,"hero.burning":`Ofen brennt seit {time}`,"hero.block":`Heizblock seit {time}`,"hero.warmup_planned":`Aufheizen beginnt um {time}`,"hero.paused":`Ofen pausiert bis {time}`,"hero.pause":`Ofen aus, Pause bis {time}`,"hero.idle_warm":`Ofen aus, es ist warm genug`,"hero.idle":`Ofen aus`,"warmup.button":`Aufheizen`,"warmup.title":`Haus aufheizen`,"warmup.intro":`Der Ofen startet auch, wenn es noch warm genug ist, und alle Heizkörper gehen auf. Danach geht es wieder nach Tagesablauf.`,"warmup.now":`Jetzt aufheizen`,"warmup.for":`für {time}`,"warmup.arrive":`Ich komme um`,"warmup.plan":`Planen`,"warmup.arrive_hint":`Wärmeregie beginnt etwa {lead} min vorher und hält das Haus danach noch eine Stunde warm.`,"warmup.cancel":`Aufheizen abbrechen`,"warmup.active_until":`Aufheizen bis {time}`,"warmup.planned":`Aufheizen ab {time}`,"warmup.planned_arrive":`Aufheizen ab {time} (Ankunft {arrive})`,"pause.button":`Pause`,"pause.title":`Ofen pausieren`,"pause.intro":`Solange startet Wärmeregie den Ofen nicht. Ein laufender Heizblock wird beendet.`,"pause.for":`{h} h`,"pause.cancel":`Pause aufheben`,"more.title":`Mehr`,"actions.clear_all":`Alles von Hand aufheben`,"chart.title":`Verlauf 24 Stunden`,"chart.aria":`Temperaturverlauf drinnen, {from} bis {to} Grad`,"chart.house":`Drinnen`,"chart.target":`Ziel`,"chart.burning":`Ofen brennt`,"pellets.title":`Pellets`,"pellets.until":`reicht bis {time}`,"pellets.low":`Bald nachfüllen`,"pellets.estimate":`Verbrauch noch geschätzt`,"pellets.refill":`Sack nachgefüllt`,"pellets.refill_done":`Ein Sack wurde dazugezählt.`,"pellets.aria":`Pelletbehälter {pct} Prozent voll`,"details.title":`Details`,"details.day_type":`Tagesart`,"stove.phase.prepare":`Sanfter Start`,"house.mode_hint":`Im Schattenbetrieb rechnet Wärmeregie nur mit. Im aktiven Betrieb schaltet sie Ofen und Heizkörper.`,"house.sect_stove_hint":`Thermostat, Leistungsstufe und Funktionen des Ofens`,"house.sect_env_hint":`Wetter, Außenfühler, Feiertage`,"house.sect_people_hint":`Personen, Haustier, Benachrichtigungen`,"house.warmup_scene":`Ziele beim Aufheizen`,"house.warmup_scene_hint":`Diese Szene bestimmt die Zieltemperaturen beim Aufheizen.`,"house.warmup_scene_auto":`automatisch (erste Szene mit Ofen erlaubt)`,"pgroup.stove_hint":`Wann der Ofen startet und wie lange er brennt`,"pgroup.softstart":`Sanfter Start`,"pgroup.softstart_hint":`Heizkörper vor dem Zünden öffnen, Verhalten bei heißem Wasser`,"pgroup.warmup":`Aufheizen`,"pgroup.warmup_hint":`„Haus aufheizen“ und „Ich komme um …“`,"pgroup.openings_hint":`Lüften, offene Türen, Prüfung der Melder`,"pgroup.sensors_hint":`Was passiert, wenn ein Fühler weg ist`,"pgroup.power_hint":`Nur mit einer Entität für die Leistungsstufe`,"pgroup.radiators_hint":`Wie weit die Heizkörper im Heizblock aufgehen`,"pgroup.limits_hint":`Frostschutz und Nacht`,"pgroup.presence_hint":`Leere Räume etwas kühler`,"pgroup.pellets_hint":`Sackgewicht, Behälter, Verbrauch`,"pgroup.other_hint":`Weitere Werte`,"param.soft_start_min":`Heizkörper vorher öffnen`,"param.soft_start_min_hint":`So lange vor dem Zünden gehen die Heizkörper auf, damit das Wasser im Ofen nicht zu schnell heiß wird. 0 = aus.`,"param.self_off_wait_min":`Warten nach Selbstabschaltung`,"param.self_off_wait_min_hint":`Schaltet der Ofen im Heizblock selbst ab, weil das Wasser heiß ist, wartet Wärmeregie so lange auf den Neustart. 0 = Block endet sofort.`,"param.warmup_extra_k":`Aufheizen: wärmer als Ziel`,"param.warmup_extra_k_hint":`So viel über den Zielen der Aufheiz-Szene.`,"param.warmup_lead_min":`Vorlauf vor der Ankunft`,"param.warmup_lead_min_hint":`So lange vor „Ich komme um …“ beginnt das Aufheizen.`,"room.offset":`Korrektur`,"room.offset_hint":`Korrektur in K, wird zum Messwert addiert (z. B. -0,5, wenn der Fühler zu warm misst).`,"card.chart":`Verlauf`,"card.name":`Wärmeregie`,"card.description":`Ofen, Szene und Räume auf einen Blick.`,"card.no_rooms":`Keine Räume ausgewählt.`,"card.open_panel":`Wärmeregie öffnen`},Ct={title:`Wärmeregie`,"tab.overview":`Overview`,"tab.rooms":`Rooms`,"tab.schedule":`Schedule`,"tab.scenes":`Scenes`,"tab.house":`Stove & house`,"tab.log":`Log`,menu:`Menu`,loading:`Loading …`,load_error:`Could not load Wärmeregie data.`,retry:`Try again`,not_admin:`Only administrators can change this.`,error:`Error`,close:`Close`,cancel:`Cancel`,delete:`Delete`,add:`Add`,remove:`Remove`,none:`–`,id:`ID`,"mode.shadow_banner":`Shadow mode: nothing is being switched`,"mode.shadow_banner_hint":`Wärmeregie only calculates and shows what it would do. Stove and radiators are left alone.`,"mode.label":`Mode`,"mode.shadow":`Shadow`,"mode.active":`Active`,"mode.confirm_active":`Switch to “Active”? Wärmeregie will then control the stove and set the radiators.`,"mode.confirm_shadow":`Switch to “Shadow”? Nothing will be switched any more, Wärmeregie only calculates.`,"mode.confirm_yes_active":`Yes, go active`,"mode.confirm_yes_shadow":`Yes, only calculate`,"scene.title":`Scene`,"scene.auto":`Automatic`,"scene.auto_hint":`by schedule`,"scene.override_until":`manual until {time}`,"scene.next_change":`next change {time}`,"scene.override_hint":`A tapped scene applies for 3 hours.`,"day_type.today":`Today: {name}`,"stove.title":`Stove`,"stove.phase.idle":`Ready`,"stove.phase.block":`Heating block running`,"stove.phase.pause":`Pause`,"stove.phase.blocked":`Blocked`,"stove.action.start":`wants to start`,"stove.action.stop":`wants to stop`,"stove.action.keep":`no change`,"stove.burning":`burning`,"stove.not_burning":`not burning`,"stove.unavailable":`Stove not reachable`,"stove.starts_today":`Starts today`,"stove.pause_until":`Pause until`,"stove.block_since":`Block since`,"stove.reason":`Reason`,"stove.chrono_warning":`The stove's own timer (chrono) is on. In active mode Wärmeregie switches it off; in shadow mode please keep an eye on it yourself.`,"stove.eco_warning":`Eco is switched on at the stove. In active mode Wärmeregie switches it off.`,"stove.error":`The stove reports a fault. Wärmeregie will not start it until it is cleared.`,"stove.error_short":`Fault`,"stove.power_level":`Power level`,"stove.water":`Water`,"stove.ignitions":`Ignitions`,"stove.no_status":`No stove status yet.`,"house.outdoor":`Outdoor`,"house.deficit":`Heat demand`,"rooms.title":`Rooms`,"room.current":`Now`,"room.target":`Target`,"room.radiator":`Radiator`,"room.open":`open`,"room.open_for":`open for {time}`,"room.occupied":`occupied`,"room.empty":`empty`,"room.sensors_missing":`{n} sensors missing`,"room.sensor_missing":`1 sensor missing`,"room.too_cold":`too cold`,"rooms.none":`No rooms set up yet.`,"alerts.title":`Notices`,"alerts.none":`All fine.`,"actions.title":`Quick actions`,"actions.boost":`+1 °C for 1 hour`,"actions.boost_short":`+1 °C`,"actions.pause":`Pause stove for 2 hours`,"actions.pause_short":`Pause 2 h`,"actions.clear":`Cancel`,"actions.clear_hint":`Cancels manual scene, pause and +1 °C.`,"actions.boost_active":`+{delta} °C active`,"actions.pause_active":`Stove paused until {time}`,"actions.done":`Done.`,"editor.unsaved":`Unsaved changes`,"editor.saved":`All saved`,"editor.save":`Save`,"editor.saving":`Saving …`,"editor.discard":`Discard`,"editor.save_error":`Saving failed: {message}`,"editor.save_ok":`Saved.`,"editor.fix_errors":`Please fix the entries marked in red first.`,"editor.leave_warning":`There are unsaved changes.`,"rooms.add_placeholder":`Name of the new room, e.g. Living room`,"rooms.add":`Add room`,"rooms.select":`Select room`,"room.name":`Name`,"room.importance":`Importance`,"room.importance_hint":`Important rooms count more when deciding whether the stove starts.`,"importance.1":`low`,"importance.2":`medium`,"importance.3":`high`,"room.radiators":`Radiator thermostats`,"room.radiators_hint":`Thermostats in this room (e.g. Tado).`,"room.sensors":`Temperature sensors`,"room.sensors_hint":`Without a sensor the thermostat temperature is used. The first field is the weight (how much a sensor counts), the second a correction in K.`,"room.weight":`Weight`,"room.openings":`Windows and doors`,"room.openings_hint":`While something is open, this room is not heated.`,"room.presence":`Presence`,"room.presence_hint":`Motion or presence sensors. Optional.`,"room.humidity":`Humidity`,"room.humidity_hint":`Optional. A window opened while humidity is high (e.g. after a shower) is intentional airing: no notice until humidity is back down.`,"room.ventilate":`Airing because of humidity`,"room.ventilate_hint":`The room counts as humid above the threshold OR when humidity has risen this much above the lowest value of the last 90 minutes. 0 turns a value off.`,"room.ventilate_humidity":`Threshold`,"room.ventilate_rise":`Rise above baseline`,"room.ventilating":`Airing because of humidity ({value} %)`,"room.targets":`Target temperature per scene`,"room.targets_hint":`Leave empty = scene default.`,"room.devices":`Devices`,"room.devices_hint":`Paused devices stay configured but are not used, e.g. while a sensor is offline.`,"room.recovering":`recovering from airing until {time}`,"dev.pause":`Pause`,"dev.resume":`Use again`,"dev.paused":`paused`,"dev.unavailable":`unavailable`,"dev.add":`Add device`,"dev.open":`open`,"dev.closed":`closed`,"dev.occupied":`occupied`,"dev.empty":`empty`,"dev.none":`none`,"dev.unavail_count":`{n} devices unavailable`,"dev.unavail_one":`1 device unavailable`,"dev.pause_unavail":`Pause unavailable ones`,"dev.held":`briefly gone, last value used`,"dev.drops":`{n}× gone (24 h)`,"param.opening_check_min":`Check windows after`,"param.opening_check_min_hint":`If a window reports open this long and the room does not cool down, a notice is sent to the phone: check the sensor. The room still stays on frost protection. 0 = off.`,"param.sensor_hold_min":`Bridge dropouts for up to`,"param.sensor_hold_min_hint":`If a sensor is briefly unreachable, its last value is used this long. An open window stays open. After that a window counts as closed and a temperature sensor is left out. 0 = off.`,"param.sensor_alert_min":`Report outage after`,"param.sensor_alert_min_hint":`If a sensor is unreachable this long, a message is sent to the phone, at most once a day per sensor. 0 = no message.`,"param.opening_recovery_min":`Wait after airing`,"param.opening_recovery_min_hint":`For this long after closing, an aired room does not count for starting the stove. The air warms up again quickly by itself. 0 = off.`,"room.delete":`Delete room`,"room.delete_confirm":`Really delete room “{name}”? This cannot be undone after saving.`,"schedule.day_types":`Day types`,"schedule.day_types_hint":`A day type sets from when which scene applies. Before the first time, the last scene of the previous day applies.`,"schedule.add_placeholder":`Name of the new day type, e.g. Home office`,"schedule.add":`Add day type`,"schedule.slot_from":`from`,"schedule.add_slot":`Add time`,"schedule.week":`Week`,"schedule.week_hint":`Which day type applies on which day?`,"schedule.delete_day_type":`Delete day type`,"schedule.delete_confirm":`Really delete day type “{name}”?`,"schedule.in_use":`Used in the week ({days}). Please choose another day type there first.`,"schedule.no_scenes":`Please create a scene under “Scenes” first.`,"slot.time_format":`Please enter the time as HH:MM.`,"slot.not_ascending":`Times must be in ascending order.`,"slot.scene_missing":`Please choose a scene.`,"slot.scene_unknown":`This scene no longer exists.`,"slot.empty":`At least one time is required.`,"week.mon":`Monday`,"week.tue":`Tuesday`,"week.wed":`Wednesday`,"week.thu":`Thursday`,"week.fri":`Friday`,"week.sat":`Saturday`,"week.sun":`Sunday`,"week.holiday":`Holiday`,"week.unset":`– please choose –`,"scenes.title":`Scenes`,"scenes.hint":`A scene is a heat wish, e.g. comfort or eco.`,"scenes.add_placeholder":`Name of the new scene, e.g. Comfort`,"scenes.add":`Add scene`,"scene.name":`Name`,"scene.icon":`Icon`,"scene.icon_hint":`e.g. mdi:sofa`,"scene.stove":`Stove`,"scene.stove.allow":`may heat`,"scene.stove.frost_only":`only against cold (frost/night)`,"scene.stove.deny":`stays off`,"scene.default_target":`Default target`,"scene.delete":`Delete scene`,"scene.delete_confirm":`Really delete scene “{name}”? Room targets for this scene will be removed.`,"scene.in_use":`Used in the schedule ({names}). Please replace it there first.`,"scenes.matrix":`Target temperatures room × scene`,"scenes.matrix_hint":`Empty fields use the scene default.`,"scenes.none":`No scenes yet.`,"house.stove":`Stove`,"house.stove_climate":`Stove thermostat`,"house.stove_climate_hint":`Required. The thermostat entity of the pellet stove.`,"house.stove_climate_active_hint":`Without a stove thermostat Wärmeregie can only run in shadow mode.`,"house.power":`Power level`,"house.power_hint":`Optional. Select or number entity for level 1 to 5.`,"house.stove_functions":`Stove functions`,"house.stove_functions_hint":`In active mode Wärmeregie switches off the stove's own timer (chrono) and eco mode and chooses the power level itself. In shadow mode there are only notices.`,"house.chrono_switch":`Timer (chrono)`,"house.chrono_switch_hint":`Optional. Switch for the stove's own timer.`,"house.eco_switch":`Eco`,"house.eco_switch_hint":`Optional. Switch for the stove's eco mode.`,"house.error_sensor":`Fault`,"house.error_sensor_hint":`Optional. While the stove reports a fault, it is not started.`,"house.water_sensor":`Water temperature`,"house.water_sensor_hint":`Optional. Display only.`,"house.ignitions_sensor":`Ignition counter`,"house.ignitions_sensor_hint":`Optional. Display only.`,"house.environment":`Weather and calendar`,"house.weather":`Weather`,"house.weather_hint":`Optional. Used for the forecast.`,"house.outdoor_sensor":`Outdoor sensor`,"house.outdoor_sensor_hint":`Optional. More precise than the weather forecast.`,"house.workday":`Workday`,"house.workday_hint":`Optional. Detects holidays (“Workday” integration).`,"house.people":`Residents`,"house.persons":`Persons`,"house.persons_hint":`If nobody is home, energy is saved.`,"house.pet":`Pet`,"house.pet_hint":`Optional. If a pet is home, temperature is never lowered below the frost limit.`,"house.notify":`Notifications`,"house.notify_hint":`Where should notices be sent?`,"house.notify_none":`No notification services found.`,"house.notify_unknown":`no longer available`,"house.messages":`Notices`,"house.messages_hint":`What should reach the phone, how often and when not?`,"house.msg_kinds":`Send these notices`,"msg.opening":`Window or door open for a while`,"msg.opening_check":`Window reports open but the room does not cool`,"msg.sensor":`Devices unreachable`,"msg.pellets":`Refill pellets`,"msg.stove_error":`Stove error (also during quiet hours)`,"msg.overheat":`Boiler protection: water too hot (also during quiet hours)`,"msg.opening_delay_min":`Report an open window after`,"msg.opening_delay_min_hint":`Short airing stays silent. Heating still reacts immediately.`,"msg.repeat_min":`Same notice again at the earliest after`,"msg.repeat_min_hint":`Stops a window that opens and closes from reporting every time. 0 = no block.`,"msg.ventilate_max_min":`Airing because of humidity at most`,"msg.ventilate_max_min_hint":`If the window stays open longer after a shower, a notice is sent after all.`,"msg.quiet":`Quiet hours`,"msg.quiet_hint":`Only stove errors are sent during this time. Both fields empty = no quiet hours.`,"msg.quiet_start":`from`,"msg.quiet_end":`to`,"msg.quiet_invalid":`Enter start and end (HH:MM), not the same.`,"msg.quiet_hold":`Send them afterwards in one message (otherwise drop)`,"house.parameters":`Control values`,"house.parameters_hint":`The defaults suit most houses. Only change them if needed.`,"house.out_of_range":`Allowed: {min} to {max}`,"pgroup.stove":`Starting and stopping the stove`,"pgroup.openings":`Windows and doors`,"pgroup.sensors":`Sensor outages`,"pgroup.radiators":`Radiators`,"pgroup.limits":`Lower limits`,"pgroup.presence":`Presence`,"pgroup.pellets":`Pellets`,"param.pellet_bag_kg":`Weight of one bag`,"param.pellet_bag_kg_hint":`The button “Pellet bag refilled” adds this much.`,"param.pellet_capacity_kg":`Hopper capacity`,"param.pellet_capacity_kg_hint":`No more fits in; the stock is capped at this.`,"param.pellet_rate_kg_h":`Consumption per burn hour (start value)`,"param.pellet_rate_kg_h_hint":`Used until the real value is learned from an empty hopper.`,"param.pellet_reminder_kg":`Remind below`,"param.pellet_reminder_kg_hint":`When the estimate drops below this, a message is sent.`,"stove.pellets":`Pellets`,"stove.pellets_empty":`empty`,"pgroup.power":`Power level`,"pgroup.other":`Other`,"param.start_below_k":`Start when this far below target`,"param.start_below_k_hint":`The stove only starts when the living rooms are this much colder than wanted.`,"param.stop_above_k":`Stop when this far above target`,"param.stop_above_k_hint":`The heating block ends when it is this much warmer than wanted.`,"param.min_burn_min":`Shortest burn time`,"param.min_burn_min_hint":`A heating block runs at least this long. Easier on the stove.`,"param.max_burn_min":`Longest burn time`,"param.max_burn_min_hint":`After this a heating block always ends.`,"param.min_pause_min":`Shortest pause`,"param.min_pause_min_hint":`The stove stays off at least this long after a heating block.`,"param.max_starts_per_day":`Max starts per day`,"param.max_starts_per_day_hint":`A few long heating blocks are better than frequent on and off.`,"param.opening_grace_min":`Short airing allowed`,"param.opening_grace_min_hint":`A window may be open this long without anything happening.`,"param.opening_stop_min":`Stove stops with open window after`,"param.opening_stop_min_hint":`If a window stays open longer, the heating block ends.`,"param.opening_empty_room_min":`Empty room: radiator off after`,"param.opening_empty_room_min_hint":`In an empty room with an open window the radiator is turned down this early.`,"param.radiator_boost_k":`Radiator lead`,"param.radiator_boost_k_hint":`While the stove burns, radiators are set this much higher.`,"param.frost_c":`Frost limit`,"param.frost_c_hint":`It never gets colder than this, even in scenes where the stove otherwise stays off.`,"param.night_floor_c":`Night minimum`,"param.night_floor_c_hint":`At night it is heated to at least this temperature.`,"param.stove_block_setpoint_c":`Stove setpoint during block`,"param.stove_block_setpoint_c_hint":`The stove thermostat is set to this value so it keeps burning.`,"param.presence_empty_min":`Room counts as empty after`,"param.presence_empty_min_hint":`After this long without motion a room counts as empty.`,"param.power_min":`Lowest power level`,"param.power_min_hint":`A heating block runs at this level in mild weather (1 to 5).`,"param.power_max":`Highest power level`,"param.power_max_hint":`Highest level Wärmeregie will choose (1 to 5).`,"param.power_cold_c":`Full power below`,"param.power_cold_c_hint":`If it is colder outside, the highest power level is chosen.`,"log.title":`Log`,"log.empty":`No entries yet.`,"log.shadow":`Shadow`,"log.shadow_hint":`Only calculated, not switched`,"picker.search":`Search …`,"picker.no_results":`No matching entities.`,"picker.show_all":`also show other kinds`,"picker.missing":`not found`,"picker.more":`More results – please refine your search.`,"hero.inside":`Inside`,"hero.target":`Target {temp}`,"hero.error":`The stove reports a fault.`,"hero.prepare":`Opening radiators, stove ignites at {time}`,"hero.self_off":`Stove switched itself off (water hot), waiting for restart`,"stove.overheat":`Boiler protection: water too hot, stove off, all radiators open`,"hero.burning":`Stove burning since {time}`,"hero.block":`Heating block since {time}`,"hero.warmup_planned":`Warm-up starts at {time}`,"hero.paused":`Stove paused until {time}`,"hero.pause":`Stove off, pause until {time}`,"hero.idle_warm":`Stove off, warm enough`,"hero.idle":`Stove off`,"warmup.button":`Warm up`,"warmup.title":`Warm up the house`,"warmup.intro":`The stove starts even if it is still warm enough, and all radiators open. Afterwards the daily schedule applies again.`,"warmup.now":`Warm up now`,"warmup.for":`for {time}`,"warmup.arrive":`I'll be home at`,"warmup.plan":`Plan`,"warmup.arrive_hint":`Wärmeregie starts about {lead} min earlier and keeps the house warm for another hour.`,"warmup.cancel":`Cancel warm-up`,"warmup.active_until":`Warm-up until {time}`,"warmup.planned":`Warm-up from {time}`,"warmup.planned_arrive":`Warm-up from {time} (arrival {arrive})`,"pause.button":`Pause`,"pause.title":`Pause stove`,"pause.intro":`Wärmeregie will not start the stove meanwhile. A running heating block ends.`,"pause.for":`{h} h`,"pause.cancel":`End pause`,"more.title":`More`,"actions.clear_all":`Cancel all manual changes`,"chart.title":`Last 24 hours`,"chart.aria":`Indoor temperature, {from} to {to} degrees`,"chart.house":`Inside`,"chart.target":`Target`,"chart.burning":`Stove burning`,"pellets.title":`Pellets`,"pellets.until":`lasts until {time}`,"pellets.low":`Refill soon`,"pellets.estimate":`Consumption still estimated`,"pellets.refill":`Bag refilled`,"pellets.refill_done":`One bag was added.`,"pellets.aria":`Pellet hopper {pct} percent full`,"details.title":`Details`,"details.day_type":`Day type`,"stove.phase.prepare":`Soft start`,"house.mode_hint":`In shadow mode Wärmeregie only calculates. In active mode it switches the stove and radiators.`,"house.sect_stove_hint":`Thermostat, power level and functions of the stove`,"house.sect_env_hint":`Weather, outdoor sensor, holidays`,"house.sect_people_hint":`Persons, pet, notifications`,"house.warmup_scene":`Targets when warming up`,"house.warmup_scene_hint":`This scene sets the target temperatures during warm-up.`,"house.warmup_scene_auto":`automatic (first scene with stove allowed)`,"pgroup.stove_hint":`When the stove starts and how long it burns`,"pgroup.softstart":`Soft start`,"pgroup.softstart_hint":`Open radiators before ignition, behaviour with hot water`,"pgroup.warmup":`Warm-up`,"pgroup.warmup_hint":`“Warm up the house” and “I'll be home at …”`,"pgroup.openings_hint":`Airing, open doors, sensor checks`,"pgroup.sensors_hint":`What happens when a sensor is gone`,"pgroup.power_hint":`Only with an entity for the power level`,"pgroup.radiators_hint":`How far radiators open during a heating block`,"pgroup.limits_hint":`Frost protection and night`,"pgroup.presence_hint":`Empty rooms a bit cooler`,"pgroup.pellets_hint":`Bag weight, hopper, consumption`,"pgroup.other_hint":`Other values`,"param.soft_start_min":`Open radiators first`,"param.soft_start_min_hint":`Radiators open this long before ignition so the water in the stove does not heat up too fast. 0 = off.`,"param.self_off_wait_min":`Wait after self switch-off`,"param.self_off_wait_min_hint":`If the stove switches itself off during a block because the water is hot, Wärmeregie waits this long for the restart. 0 = block ends at once.`,"param.warmup_extra_k":`Warm-up: above target`,"param.warmup_extra_k_hint":`This much above the targets of the warm-up scene.`,"param.warmup_lead_min":`Lead time before arrival`,"param.warmup_lead_min_hint":`Warm-up starts this long before “I'll be home at …”.`,"room.offset":`Correction`,"room.offset_hint":`Correction in K, added to the reading (e.g. -0.5 if the sensor reads too warm).`,"card.chart":`History`,"card.name":`Wärmeregie`,"card.description":`Stove, scene and rooms at a glance.`,"card.no_rooms":`No rooms selected.`,"card.open_panel":`Open Wärmeregie`};function wt(e,t,n){let r=(e===`en`?Ct[t]:void 0)??St[t]??t;if(n)for(let[e,t]of Object.entries(n))r=r.split(`{${e}}`).join(String(t));return r}function Y(e){return(t,n)=>wt(e,t,n)}var X=o`
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
`;function Tt(e,t,n={}){let r=t.map(e=>e.id),i=e=>t.find(t=>t.id===e)?.name??e,a=Je(e),o=[...new Set(a.map(e=>e.scene))],s=e=>`${e/L*100}%`;return k`
    <div class="timeline" role="img" aria-label=${a.map(e=>`${B(e.from)} ${i(e.scene)}`).join(`, `)}>
      ${a.map(e=>k`<div
          class="seg"
          style="left:${s(e.from)};width:${s(e.to-e.from)};background:${ft(e.scene,r)}"
          title="${B(e.from)}–${e.to>=1440?`24:00`:B(e.to)} ${i(e.scene)}"
        >
          ${n.labels!==!1&&e.to-e.from>=150?k`<span>${i(e.scene)}</span>`:M}
        </div>`)}
      ${n.nowMinutes!==null&&n.nowMinutes!==void 0?k`<div class="now" style="left:calc(${s(n.nowMinutes)} - 1px)"></div>`:M}
    </div>
    <div class="timeline-scale" aria-hidden="true"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
    ${n.legend?k`<div class="legend">
          ${o.map(e=>k`<span><i style="background:${ft(e,r)}"></i>${i(e)}</span>`)}
        </div>`:M}
  `}function Et(e,t=!1){return e.status?.mode===`shadow`?k`<div class="banner shadow" role="status">
    <ha-icon icon="mdi:eye-outline"></ha-icon>
    <div>
      <strong>${e.t(`mode.shadow_banner`)}</strong>
      ${t?M:k`<span class="muted">${e.t(`mode.shadow_banner_hint`)}</span>`}
    </div>
  </div>`:M}function Dt(e,t){let n=[...e?.alerts??[]],r=e?.stove,i=(...e)=>n.some(t=>e.includes(t.kind));return r?.error&&!i(`error`,`stove_error`)&&n.unshift({kind:`stove_error`,message:t(`stove.error`)}),r?.overheat&&!i(`overheat`)&&n.unshift({kind:`overheat`,message:t(`stove.overheat`)}),r?.chrono_warning&&!i(`chrono`,`chrono_warning`)&&n.push({kind:`chrono`,message:t(`stove.chrono_warning`)}),r?.eco_warning&&!i(`eco`,`eco_warning`)&&n.push({kind:`eco`,message:t(`stove.eco_warning`)}),n}function Ot(e){let t=e?.overrides;return t&&!!(t.scene||t.pause_until||t.boost)||e?.scene?.source===`override`}function kt(e){let t=e?.overrides?.boost;return t?typeof t==`number`?t:typeof t==`object`&&t&&typeof t.delta==`number`?t.delta:1:null}var At,jt=[60,90,120,180],Mt=[60,120,240],Nt=class extends I{constructor(){super(),this.status=null,this.config=null,this.lang=`de`,this.compact=!1,this._dialog=null,this._arrive=``,this._busy=!1,this._error=null}get _t(){return Y(this.lang)}get _isAdmin(){return this.hass?.user?.is_admin!==!1}updated(e){if(e.has(`_dialog`)){let e=this.renderRoot.querySelector(`dialog`);if(e&&this._dialog&&!e.open)try{e.showModal()}catch{e.setAttribute(`open`,``)}}}_open(e){this._error=null,e===`warmup`&&(this._arrive=vt(this.status?.now)),this._dialog=e}_close(){let e=this.renderRoot.querySelector(`dialog`);e?.open&&e.close(),this._dialog=null}async _run(e,t=!0){this._busy=!0,this._error=null;try{let n=await e();n&&typeof n==`object`&&`mode`in n&&this.dispatchEvent(new CustomEvent(`wr-status`,{detail:n,bubbles:!0,composed:!0})),t&&this._close()}catch(e){this._error=q(e)||this._t(`error`)}finally{this._busy=!1}}_warmup(e){return this._run(()=>Ie(this.hass,e))}render(){let e=this._t,t=this.status,n=!this._isAdmin||this._busy||!t,r=this._isAdmin?``:e(`not_admin`),i=t?.scene,a=this.config?.scenes.find(e=>e.id===i?.id),o=xt(t,e),s=t?.overrides?.pause_until??null,c=kt(t),l=i?.source===`override`;return k`
      <div class="main ${this.compact?`compact`:``}">
        <button class="big heat ${o?`on`:``}" ?disabled=${n} title=${r} @click=${()=>this._open(`warmup`)}>
          <ha-icon icon="mdi:home-thermometer-outline"></ha-icon><span>${e(`warmup.button`)}</span>
        </button>
        <button class="big" ?disabled=${n} title=${r} @click=${()=>this._open(`scene`)}>
          <ha-icon icon=${l?a?.icon||`mdi:palette-outline`:`mdi:calendar-clock`}></ha-icon>
          <span class="two"
            ><span>${i?.name??e(`scene.title`)}</span><small>${l&&i?.until?e(`scene.override_until`,{time:W(i.until)}):e(`scene.auto`)}</small></span
          >
        </button>
        <button class="big ${s?`on`:``}" ?disabled=${n} title=${r} @click=${()=>this._open(`pause`)}>
          <ha-icon icon=${s?`mdi:pause-circle`:`mdi:pause`}></ha-icon><span>${e(`pause.button`)}</span>
        </button>
      </div>
      ${o||s||c?k`<div class="active">
            ${o?k`<span class="pill heat"
                  ><ha-icon icon="mdi:home-thermometer"></ha-icon>${o}<button
                    class="x"
                    ?disabled=${n}
                    aria-label=${e(`warmup.cancel`)}
                    title=${e(`warmup.cancel`)}
                    @click=${()=>this._warmup({cancel:!0})}
                  ><ha-icon icon="mdi:close"></ha-icon></button
                ></span>`:M}
            ${s?k`<span class="pill"
                  ><ha-icon icon="mdi:pause"></ha-icon>${e(`actions.pause_active`,{time:G(s,t?.now,this.lang)})}<button
                    class="x"
                    ?disabled=${n}
                    aria-label=${e(`pause.cancel`)}
                    title=${e(`pause.cancel`)}
                    @click=${()=>this._run(()=>Pe(this.hass,0),!1)}
                  ><ha-icon icon="mdi:close"></ha-icon></button
                ></span>`:M}
            ${c?k`<span class="pill heat"
                  >${e(`actions.boost_active`,{delta:String(c).replace(`.`,this.lang===`de`?`,`:`.`)})}<button
                    class="x"
                    ?disabled=${n}
                    aria-label=${e(`actions.clear`)}
                    title=${e(`actions.clear`)}
                    @click=${()=>this._run(()=>Fe(this.hass,0,0),!1)}
                  ><ha-icon icon="mdi:close"></ha-icon></button
                ></span>`:M}
          </div>`:M}
      ${this._error&&!this._dialog?k`<div class="error-text" role="alert">${this._error}</div>`:M}
      ${this._dialog?this._renderDialog():M}
    `}_renderDialog(){let e=this._t,t={warmup:e(`warmup.title`),pause:e(`pause.title`),scene:e(`scene.title`)},n=this._dialog;return k`<dialog
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
        ${this._error?k`<div class="error-text" role="alert">${this._error}</div>`:M}
      </div>
    </dialog>`}_renderWarmup(){let e=this._t,t=this.config?.parameters?.warmup_lead_min??60,n=z(this._arrive)!==null,r=xt(this.status,e);return k`
      <p class="muted">${e(`warmup.intro`)}</p>
      ${r?k`<div class="now">
            <span>${r}</span>
            <button class="danger" ?disabled=${this._busy} @click=${()=>this._warmup({cancel:!0})}>${e(`warmup.cancel`)}</button>
          </div>`:M}
      <h4>${e(`warmup.now`)}</h4>
      <div class="opts">
        ${jt.map(t=>k`<button class="opt" ?disabled=${this._busy} @click=${()=>this._warmup({minutes:t})}>${e(`warmup.for`,{time:t%60?`${t} min`:`${t/60} h`})}</button>`)}
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
          @change=${e=>this._arrive=Ge(e.target.value)}
        />
        <button class="primary" type="submit" ?disabled=${this._busy||!n}>${e(`warmup.plan`)}</button>
      </form>
      <div class="hint">${e(`warmup.arrive_hint`,{lead:String(t)})}</div>
    `}_renderPause(){let e=this._t,t=this.status?.overrides?.pause_until;return k`
      <p class="muted">${e(`pause.intro`)}</p>
      ${t?k`<div class="now">
            <span>${e(`actions.pause_active`,{time:G(t,this.status?.now,this.lang)})}</span>
            <button class="danger" ?disabled=${this._busy} @click=${()=>this._run(()=>Pe(this.hass,0))}>${e(`pause.cancel`)}</button>
          </div>`:M}
      <div class="opts">
        ${Mt.map(t=>k`<button class="opt" ?disabled=${this._busy} @click=${()=>this._run(()=>Pe(this.hass,t))}>${e(`pause.for`,{h:String(t/60)})}</button>`)}
      </div>
    `}_renderScene(){let e=this._t,t=this.status,n=t?.scene,r=n?.source===`override`,i=this.config?.scenes??[];return k`
      <p class="muted">${e(`scene.override_hint`)}</p>
      <div class="list">
        <button class="item ${r?``:`sel`}" ?disabled=${this._busy} @click=${()=>this._run(()=>Ne(this.hass,null))}>
          <ha-icon icon="mdi:calendar-clock"></ha-icon><span>${e(`scene.auto`)}<small>${e(`scene.auto_hint`)}</small></span>
        </button>
        ${i.map(e=>k`<button
            class="item ${r&&n?.id===e.id?`sel`:``}"
            ?disabled=${this._busy}
            @click=${()=>this._run(()=>Ne(this.hass,e.id,180))}
          >
            <ha-icon icon=${e.icon||`mdi:palette-outline`}></ha-icon><span>${e.name}</span>
          </button>`)}
      </div>
      <h4>${e(`more.title`)}</h4>
      <div class="opts">
        <button class="opt" ?disabled=${this._busy} @click=${()=>this._run(()=>Fe(this.hass,1,60))}>
          <ha-icon icon="mdi:thermometer-plus"></ha-icon>${e(`actions.boost`)}
        </button>
        ${Ot(t)?k`<button class="opt" ?disabled=${this._busy} title=${e(`actions.clear_hint`)} @click=${()=>this._run(()=>Ve(this.hass,t))}>
              <ha-icon icon="mdi:undo-variant"></ha-icon>${e(`actions.clear_all`)}
            </button>`:M}
      </div>
    `}};At=Nt,At.properties={hass:{attribute:!1},status:{attribute:!1},config:{attribute:!1},lang:{type:String},compact:{type:Boolean},_dialog:{state:!0},_arrive:{state:!0},_busy:{state:!0},_error:{state:!0}},At.styles=[X,o`
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
    `];function Pt(){let e=window.customElements;e.get(`wr-controls`)||e.define(`wr-controls`,Nt)}function Ft(e){let t=e.size??88;return k`<svg
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
  </svg>`}var It=o`
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
`;function Lt(e,t,n,r={}){let i=r.height??160,a=r.axis!==!1,o=gt(e,{width:600,height:i,padLeft:4,padRight:4,padTop:8,padBottom:a?20:4});if(!o)return M;let s=t(`chart.aria`,{from:V(o.yMin,n,0),to:V(o.yMax,n,0)});return k`<figure class="trend"><div class="plot ${a?`axis`:``}">
    <svg viewBox="0 0 ${600} ${i}" preserveAspectRatio="none" role="img" aria-label=${s} style="height:${i}px">
      ${o.bands.map(e=>A`<rect class="band" x=${e.x} y=${o.top} width=${e.w} height=${o.bottom-o.top}></rect>`)}
      ${a?o.yTicks.map(e=>A`<line class="grid" x1=${o.left} x2=${o.right} y1=${e.y} y2=${e.y}></line>`):M}
      ${o.target?A`<path class="target" d=${o.target}></path>`:M}
      <path class="house" d=${o.house}></path>
    </svg>
    ${o.last?k`<span class="dot" style="left:calc(var(--pl) + (100% - var(--pl)) * ${o.last.x/600});top:${o.last.y/i*100}%"></span>`:M}
    ${a?k`<div class="ylabels" aria-hidden="true">
            ${o.yTicks.map(e=>k`<span style="top:${e.y/i*100}%">${e.value}°</span>`)}
          </div>
          <div class="xlabels" aria-hidden="true">
            ${o.xTicks.map(e=>k`<span style="left:calc(var(--pl) + (100% - var(--pl)) * ${e.x/600})">${e.label}</span>`)}
          </div>`:M}
    </div>
    ${a&&r.legend!==!1?k`<figcaption class="legend">
          <span><i class="lg house"></i>${t(`chart.house`)}</span>
          <span><i class="lg target"></i>${t(`chart.target`)}</span>
          <span><i class="lg band"></i>${t(`chart.burning`)}</span>
        </figcaption>`:M}
  </figure>`}var Rt=o`
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
`;function zt(e,t={}){let n=t.size??64,r=e===null?0:Math.max(0,Math.min(100,e)),i=78*r/100;return k`<svg class="tank ${t.low?`low`:``}" width=${n*.75} height=${n} viewBox="0 0 75 100" aria-hidden="true">
    <defs>
      <clipPath id="wr-tank-clip"><rect x="10" y=${14} width="55" height=${78} rx="6" /></clipPath>
    </defs>
    <rect class="lid" x="6" y="4" width="63" height="8" rx="3" />
    <rect class="body" x="8" y="12" width="59" height="82" rx="8" />
    <g clip-path="url(#wr-tank-clip)">
      <rect class="fill" x="10" y=${92-i} width="55" height=${i} />
      ${r>6?A`<g class="grains">
            ${[18,30,42,54].map((e,t)=>A`<ellipse cx=${e+t%2*3} cy=${92-i+4} rx="4" ry="2.2"></ellipse>`)}
          </g>`:M}
    </g>
    ${e===null?M:A`<text x="37.5" y="60" text-anchor="middle">${Math.round(r)}%</text>`}
  </svg>`}var Bt=o`
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
`;function Vt(e,t){let n=bt(e);switch(n.key){case`error`:return t(`hero.error`);case`unavailable`:return t(`stove.unavailable`);case`prepare`:return t(`hero.prepare`,{time:n.time});case`self_off`:return t(`hero.self_off`);case`burning`:return t(`hero.burning`,{time:n.time});case`block`:return t(`hero.block`,{time:n.time});case`warmup_planned`:return t(`hero.warmup_planned`,{time:n.time});case`paused`:return t(`hero.paused`,{time:n.time});case`pause`:return t(`hero.pause`,{time:n.time});case`idle_warm`:return t(`hero.idle_warm`);default:return t(`hero.idle`)}}function Ht(e,t={}){let{t:n,lang:r,status:i}=e,{temp:a,target:o}=yt(i),s=!!i?.stove?.burning,c=bt(i);return k`<div class="hero-head">
    ${Ft({burning:s,warm:s||c.key===`prepare`||c.key===`block`,size:t.size})}
    <div class="hero-text">
      <div class="hero-label">${n(`hero.inside`)}</div>
      <div class="hero-temp">${H(a,r)}</div>
      <div class="hero-target">${o===null?M:n(`hero.target`,{temp:H(o,r)})}${i?.scene?k` · ${i.scene.name}`:M}</div>
      <div class="hero-status ${i?.stove?.error?`err`:s?`heat`:``}">${Vt(i,n)}</div>
    </div>
  </div>`}function Ut(e){let t=Dt(e.status,e.t);return t.length?k`<div class="alert-strip" role="status">
    ${t.map(e=>k`<div class="as ${e.kind}">
        <ha-icon icon=${e.kind===`opening`?`mdi:window-open-variant`:e.kind.includes(`error`)?`mdi:alert-octagon`:`mdi:alert-circle-outline`}></ha-icon>
        <span>${e.message}</span>
      </div>`)}
  </div>`:M}function Wt(e,t,n={}){let{t:r,lang:i,status:a,config:o}=e,s=a?.pellets;if(!s||s.stock_kg===null||s.stock_kg===void 0)return M;let c=_t(s,o?.parameters?.pellet_capacity_kg),l=o?.parameters?.pellet_reminder_kg??5,u=s.stock_kg<=l,d=V(s.stock_kg,i,1),f=s.empty_at?Kt(s.empty_at,a?.now,i):null;return n.compact?k`<div class="pellet-mini ${u?`low`:``}">
      <ha-icon icon="mdi:grain"></ha-icon>
      <div class="bar" role="img" aria-label=${r(`pellets.aria`,{pct:String(c??0)})}><i style="width:${c??0}%"></i></div>
      <span>${d} kg${f?k` · ${r(`pellets.until`,{time:f})}`:M}</span>
    </div>`:k`<div class="card pellets ${u?`low`:``}">
    <h3>${r(`pellets.title`)}</h3>
    <div class="prow">
      ${zt(c,{low:u,size:84})}
      <div class="ptext">
        <div class="pkg">${d} kg</div>
        ${f?k`<div>${r(`pellets.until`,{time:f})}</div>`:M}
        ${u?k`<div class="warn-text">${r(`pellets.low`)}</div>`:M}
        ${s.rate_learned?M:k`<div class="hint">${r(`pellets.estimate`)}</div>`}
      </div>
    </div>
    ${t?k`<button ?disabled=${!e.isAdmin||e.busy} title=${e.isAdmin?``:r(`not_admin`)} @click=${t}>
          <ha-icon icon="mdi:sack"></ha-icon>${r(`pellets.refill`)}
        </button>`:M}
  </div>`}var Gt={de:[`So`,`Mo`,`Di`,`Mi`,`Do`,`Fr`,`Sa`],en:[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`]};function Kt(e,t,n){let r=/^(\d{4})-(\d{2})-(\d{2})/.exec(e),i=t?/^(\d{4})-(\d{2})-(\d{2})/.exec(t):null;if(!r)return G(e,t,n);let a=Date.UTC(+r[1],r[2]-1,+r[3]),o=i?Date.UTC(+i[1],i[2]-1,+i[3]):null,s=o===null?null:Math.round((a-o)/864e5);return s===0?W(e):s!==null&&s>0&&s<7?`${Gt[n.startsWith(`de`)?`de`:`en`][new Date(a).getUTCDay()]} ${W(e)}`:G(e,t,n)}function qt(e){let{t,status:n,lang:r}=e,i=n?.stove;if(!i)return k`<div class="card"><h3>${t(`stove.title`)}</h3><div class="muted">${t(`stove.no_status`)}</div></div>`;let a=n?.day_type?e.config?.day_types.find(e=>e.id===n.day_type?.id):void 0,o=r.startsWith(`de`)?`de-DE`:`en-US`;return k`<div class="card stove ${i.burning?`burning`:``}">
    <div class="row">
      <ha-icon class="flame" icon=${i.burning?`mdi:fire`:`mdi:fireplace-off`}></ha-icon>
      <h3 style="margin:0">${t(`stove.title`)}</h3>
      <span class="spacer"></span>
      ${i.available?M:k`<span class="badge warn">${t(`stove.unavailable`)}</span>`}
      ${i.error?k`<span class="badge err">${t(`stove.error_short`)}</span>`:M}
      <span class="badge ${i.burning?`heat`:``}">${i.burning?t(`stove.burning`):t(`stove.not_burning`)}</span>
    </div>
    <div class="phase" style="margin-top:6px">${t(`stove.phase.${i.phase}`)}</div>
    ${i.reason?k`<div class="muted">${i.reason}</div>`:M}
    <details class="more">
      <summary>${t(`details.title`)}</summary>
      <dl class="kv">
        <dt>${t(`stove.starts_today`)}</dt>
        <dd>${i.starts_today??0} / ${i.max_starts_per_day??`–`}</dd>
        ${i.block_start?k`<dt>${t(`stove.block_since`)}</dt><dd>${W(i.block_start)}</dd>`:M}
        ${i.pause_until?k`<dt>${t(`stove.pause_until`)}</dt><dd>${G(i.pause_until,n?.now,r)}</dd>`:M}
        ${i.power_level!==null&&i.power_level!==void 0?k`<dt>${t(`stove.power_level`)}</dt><dd>${i.power_level} / 5</dd>`:M}
        ${i.water_c!==null&&i.water_c!==void 0?k`<dt>${t(`stove.water`)}</dt><dd>${H(i.water_c,r)}</dd>`:M}
        ${i.ignitions!==null&&i.ignitions!==void 0?k`<dt>${t(`stove.ignitions`)}</dt><dd>${i.ignitions.toLocaleString(o)}</dd>`:M}
        ${n?.house?.outdoor_c!==null&&n?.house?.outdoor_c!==void 0?k`<dt>${t(`house.outdoor`)}</dt><dd>${H(n.house.outdoor_c,r)}</dd>`:M}
        ${n?.house?.deficit_k!==null&&n?.house?.deficit_k!==void 0?k`<dt>${t(`house.deficit`)}</dt><dd>${$e(n.house.deficit_k,r)}</dd>`:M}
        ${n?.day_type?k`<dt>${t(`details.day_type`)}</dt><dd>${n.day_type.name}</dd>`:M}
      </dl>
      ${a&&e.config?k`<div style="margin-top:10px">
            ${Tt(a.slots,e.config.scenes,{nowMinutes:nt(n?.now),labels:!1,legend:!0})}
          </div>`:M}
    </details>
  </div>`}function Jt(e){if(e.temperature===null||e.temperature===void 0||e.target===null||e.target===void 0)return``;let t=e.target-e.temperature;return t>.3?`cold`:t<-.5?`warm`:`ok`}function Yt(e,t){let{t:n,lang:r}=e,i=e.status?.rooms??[];return t?.length&&(i=t.map(e=>i.find(t=>t.id===e)).filter(e=>!!e)),i.length?k`<div class="tiles">
    ${i.map(e=>{let t=e.sensors_missing??0;return k`<div class="tile ${Jt(e)}">
        <div class="tname">${e.name}</div>
        <div class="ttemp">${H(e.temperature,r)}</div>
        <div class="tsub">
          <span>${n(`room.target`)} ${V(e.target,r,1)}°</span>
          <span class="ticons">
            ${e.open?k`<ha-icon class="cold" icon="mdi:window-open-variant" title=${e.open_minutes?n(`room.open_for`,{time:`${e.open_minutes} min`}):n(`room.open`)}></ha-icon>`:M}
            ${e.ventilating?k`<ha-icon icon="mdi:water-percent" title=${n(`room.ventilating`,{value:V(e.humidity??null,r,0)})}></ha-icon>`:M}
            ${e.recover_until&&!e.open?k`<ha-icon icon="mdi:weather-windy" title=${n(`room.recovering`,{time:W(e.recover_until)})}></ha-icon>`:M}
            ${e.occupied===!0?k`<ha-icon icon="mdi:account" title=${n(`room.occupied`)}></ha-icon>`:M}
            ${t>0?k`<ha-icon class="warn" icon="mdi:access-point-network-off" title=${t===1?n(`room.sensor_missing`):n(`room.sensors_missing`,{n:t})}></ha-icon>`:M}
          </span>
        </div>
      </div>`})}
  </div>`:k`<div class="muted">${t?.length?n(`card.no_rooms`):n(`rooms.none`)}</div>`}var Xt=o`
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
`;function Zt(e){return e.split(`.`,1)[0]}function Qt(e,t){let n=e?.[t]?.attributes?.friendly_name;return typeof n==`string`&&n?n:t}function $t(e){return e.toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``)}function en(e,t){let n=$t(t.query??``).split(/\s+/).filter(Boolean),r=new Set(t.exclude??[]),i=[];for(let a of Object.values(e??{})){let o=a.entity_id;if(r.has(o)||t.domains.length&&!t.domains.includes(Zt(o)))continue;let s=typeof a.attributes?.device_class==`string`?a.attributes.device_class:void 0;if(t.deviceClasses?.length&&(Zt(o)===`sensor`||Zt(o)===`binary_sensor`)&&(!s||!t.deviceClasses.includes(s)))continue;let c=Qt(e,o);if(n.length){let e=$t(`${c} ${o}`);if(!n.every(t=>e.includes(t)))continue}i.push({entity_id:o,name:c,device_class:s})}return i.sort((e,t)=>e.name.localeCompare(t.name)||e.entity_id.localeCompare(t.entity_id)),t.limit?i.slice(0,t.limit):i}function tn(e){return Object.keys(e?.notify??{}).map(e=>`notify.${e}`).sort()}var nn,rn=50,an=class extends I{constructor(){super(),this._uid=`wrp${Math.random().toString(36).slice(2,8)}`,this.multiple=!1,this.domains=[],this.label=``,this.helper=``,this.lang=`de`,this.disabled=!1,this.invalid=!1,this._query=``,this._open=!1,this._active=0,this._showAll=!1}get _selected(){let e=this.value;return Array.isArray(e)?e:e?[e]:[]}_results(){let e=en(this.hass?.states,{domains:this.domains,deviceClasses:this._showAll?void 0:this.deviceClasses,query:this._query,exclude:[...this._selected,...this.exclude??[]],limit:51});return{list:e.slice(0,rn),more:e.length>rn}}_emit(e){this.value=e,this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e},bubbles:!0,composed:!0}))}_pick(e){this.multiple?(this._emit([...this._selected,e]),this._query=``,this._active=0,this.renderRoot.querySelector(`input.search`)?.focus()):(this._emit(e),this._query=``,this._open=!1)}_remove(e){this.multiple?this._emit(this._selected.filter(t=>t!==e)):this._emit(null)}_onKey(e,t){e.key===`ArrowDown`?(e.preventDefault(),this._open=!0,this._active=Math.min(this._active+1,Math.max(t.length-1,0))):e.key===`ArrowUp`?(e.preventDefault(),this._active=Math.max(this._active-1,0)):e.key===`Enter`?this._open&&t[this._active]&&(e.preventDefault(),this._pick(t[this._active].entity_id)):e.key===`Escape`&&(this._open=!1)}updated(e){e.has(`_active`)&&this._open&&this.renderRoot.querySelector(`#${this._uid}-${this._active}`)?.scrollIntoView({block:`nearest`})}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this._closeTimer)}render(){let e=Y(this.lang),t=this._selected,n=this.multiple||t.length===0||this._open,{list:r,more:i}=this._open?this._results():{list:[],more:!1},a=Math.min(this._active,Math.max(r.length-1,0));return k`
      ${this.label?k`<span class="lbl" id="${this._uid}-l">${this.label}</span>`:M}
      ${this.helper?k`<div class="hint">${this.helper}</div>`:M}
      ${t.length?k`<div class="sel">
            ${t.map(t=>{let n=!this.hass?.states?.[t];return k`<span class="pchip ${n?`missing`:``}">
                <span class="txt">
                  <span class="n">${Qt(this.hass?.states,t)}</span>
                  <span class="id">${t}${n?k` · ${e(`picker.missing`)}`:M}</span>
                </span>
                ${this.disabled?M:k`<button class="icon x" title=${e(`remove`)} aria-label="${e(`remove`)}: ${t}" @click=${()=>this._remove(t)}>
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>`}
                ${!this.multiple&&!this.disabled?k`<button class="icon x" title=${e(`picker.search`)} aria-label=${e(`picker.search`)} @click=${()=>this._focusSearch()}>
                      <ha-icon icon="mdi:pencil"></ha-icon>
                    </button>`:M}
              </span>`})}
          </div>`:M}
      ${n&&!this.disabled?k`<div class="combo">
            <input
              class="search ${this.invalid?`invalid`:``}"
              type="search"
              role="combobox"
              autocomplete="off"
              aria-labelledby=${this.label?`${this._uid}-l`:M}
              aria-expanded=${this._open}
              aria-controls="${this._uid}-list"
              aria-activedescendant=${this._open&&r.length?`${this._uid}-${a}`:M}
              placeholder=${e(`picker.search`)}
              .value=${this._query}
              @input=${e=>{this._query=e.target.value,this._open=!0,this._active=0}}
              @focus=${()=>{window.clearTimeout(this._closeTimer),this._open=!0}}
              @blur=${()=>{this._closeTimer=window.setTimeout(()=>this._open=!1,180)}}
              @keydown=${e=>this._onKey(e,r)}
            />
            ${this._open?k`<div class="pop" @mousedown=${e=>e.preventDefault()}>
                  ${this.deviceClasses?.length?k`<label class="all"
                        ><input
                          type="checkbox"
                          .checked=${this._showAll}
                          @change=${e=>this._showAll=e.target.checked}
                        />${e(`picker.show_all`)}</label
                      >`:M}
                  <ul id="${this._uid}-list" role="listbox">
                    ${r.length?r.map((e,t)=>k`<li
                            id="${this._uid}-${t}"
                            role="option"
                            aria-selected=${t===a}
                            class=${t===a?`active`:``}
                            @click=${()=>this._pick(e.entity_id)}
                            @mouseenter=${()=>this._active=t}
                          >
                            <span class="n">${e.name}</span><span class="id">${e.entity_id}</span>
                          </li>`):k`<li class="empty">${e(`picker.no_results`)}</li>`}
                    ${i?k`<li class="empty">${e(`picker.more`)}</li>`:M}
                  </ul>
                </div>`:M}
          </div>`:M}
    `}async _focusSearch(){this._open=!0,await this.updateComplete,this.renderRoot.querySelector(`input.search`)?.focus()}};nn=an,nn.properties={hass:{attribute:!1},value:{attribute:!1},multiple:{type:Boolean},domains:{attribute:!1},deviceClasses:{attribute:!1},exclude:{attribute:!1},label:{type:String},helper:{type:String},lang:{type:String},disabled:{type:Boolean},invalid:{type:Boolean},_query:{state:!0},_open:{state:!0},_active:{state:!0},_showAll:{state:!0}},nn.styles=[X,o`
      :host {
        display: block;
        margin-bottom: 12px;
      }
      .sel {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 6px;
      }
      .pchip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        max-width: 100%;
        border: 1px solid var(--wr-div);
        border-radius: 10px;
        padding: 2px 2px 2px 10px;
        background: var(--wr-input-bg);
      }
      .pchip.missing {
        border-color: var(--wr-warn);
      }
      .pchip .txt {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .n {
        overflow-wrap: anywhere;
      }
      .id {
        font-size: 11px;
        color: var(--wr-text2);
        overflow-wrap: anywhere;
      }
      button.x {
        min-height: 30px;
        min-width: 30px;
      }
      button.x ha-icon {
        --mdc-icon-size: 16px;
      }
      .combo {
        position: relative;
      }
      .pop {
        position: absolute;
        z-index: 5;
        left: 0;
        right: 0;
        top: calc(100% + 2px);
        background: var(--wr-card);
        border: 1px solid var(--wr-div);
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        max-height: 280px;
        overflow-y: auto;
      }
      .all {
        display: flex;
        gap: 6px;
        align-items: center;
        font-size: 12px;
        padding: 6px 10px;
        border-bottom: 1px solid var(--wr-div);
        color: var(--wr-text2);
      }
      .all input {
        width: auto;
        min-height: 0;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      li {
        display: flex;
        flex-direction: column;
        padding: 6px 10px;
        cursor: pointer;
      }
      li.active {
        background: color-mix(in srgb, var(--wr-primary) 16%, transparent);
      }
      li.empty {
        cursor: default;
        color: var(--wr-text2);
      }
    `],customElements.get(`wr-entity-picker`)||customElements.define(`wr-entity-picker`,an);var on=[{kind:`radiators`,icon:`mdi:radiator`,label:`room.radiators`,hint:`room.radiators_hint`,domains:[`climate`]},{kind:`temperature_sensors`,icon:`mdi:thermometer`,label:`room.sensors`,hint:`room.sensors_hint`,domains:[`sensor`],classes:[`temperature`]},{kind:`openings`,icon:`mdi:window-closed-variant`,label:`room.openings`,hint:`room.openings_hint`,domains:[`binary_sensor`],classes:[`door`,`window`,`opening`,`garage_door`]},{kind:`presence`,icon:`mdi:motion-sensor`,label:`room.presence`,hint:`room.presence_hint`,domains:[`binary_sensor`],classes:[`occupancy`,`motion`,`presence`]},{kind:`humidity_sensors`,icon:`mdi:water-percent`,label:`room.humidity`,hint:`room.humidity_hint`,domains:[`sensor`],classes:[`humidity`]}],sn=/* @__PURE__ */ new Set([`unavailable`,`unknown`]);function cn(e,t){return t===`temperature_sensors`?e.temperature_sensors.map(e=>e.entity):t===`humidity_sensors`?e.humidity_sensors??[]:e[t]}function ln(e){return on.flatMap(t=>cn(e,t.kind))}function un(e){return!!e&&!sn.has(e.state)}function dn(e,t,n,r){if(!un(e))return n(`dev.unavailable`);let i=e;switch(t){case`radiators`:{let e=Number(i.attributes?.current_temperature),t=Number(i.attributes?.temperature),n=[];return Number.isFinite(e)&&n.push(H(e,r)),Number.isFinite(t)&&n.push(`→ ${H(t,r)}`),n.join(` `)||i.state}case`temperature_sensors`:{let e=i.entity_id.startsWith(`climate.`)?Number(i.attributes?.current_temperature):Number(i.state);return Number.isFinite(e)?H(e,r):i.state}case`openings`:return i.state===`on`?n(`dev.open`):n(`dev.closed`);case`presence`:return i.state===`on`?n(`dev.occupied`):n(`dev.empty`);case`humidity_sensors`:{let e=i.entity_id.startsWith(`climate.`)?Number(i.attributes?.current_humidity):Number(i.state);return Number.isFinite(e)?`${V(e,r,0)} %`:i.state}}}function fn(e,t){return e?e.held?t(`dev.held`):e.drops_24h>0?t(`dev.drops`,{n:e.drops_24h}):null:null}function pn(e,t){let n=new Set(e.paused??[]);return ln(e).filter(e=>!n.has(e)&&!un(t?.[e]))}function mn(e,t,n){t===`temperature_sensors`?e.temperature_sensors=e.temperature_sensors.filter(e=>e.entity!==n):t===`humidity_sensors`?e.humidity_sensors=(e.humidity_sensors??[]).filter(e=>e!==n):e[t]=e[t].filter(e=>e!==n),e.paused=(e.paused??[]).filter(e=>e!==n)}function hn(e,t,n){cn(e,t).includes(n)||(t===`temperature_sensors`?e.temperature_sensors.push({entity:n,weight:1}):t===`humidity_sensors`?e.humidity_sensors=[...e.humidity_sensors??[],n]:e[t].push(n))}function gn(e,t){let n=new Set(e.paused??[]);n.has(t)?n.delete(t):n.add(t),e.paused=ln(e).filter(e=>n.has(e))}var _n,Z=class extends I{constructor(){super(),this.lang=`de`,this.readonly=!1}get t(){return Y(this.lang)}change(e){let t=K(this.config);e(t),this.dispatchEvent(new CustomEvent(`config-changed`,{detail:{config:t},bubbles:!0,composed:!0}))}};_n=Z,_n.properties={hass:{attribute:!1},config:{attribute:!1},defaults:{attribute:!1},lang:{type:String},readonly:{type:Boolean}};function Q(e){let t=e.target.value.trim().replace(`,`,`.`);if(t===``)return null;let n=Number(t);return Number.isFinite(n)?n:null}var $=e=>e.target.value,vn,yn=class extends Z{constructor(){super(),this._selected=null,this._newName=``,this._confirmDelete=!1,this._adding=null,this.devices={}}get _room(){let e=this.config.rooms;return e.find(e=>e.id===this._selected)??e[0]}_updateRoom(e,t){this.change(n=>{let r=n.rooms.find(t=>t.id===e);r&&t(r)})}_add(){let e=this._newName.trim();if(!e)return;let t=Ze(e,this.config.rooms.map(e=>e.id),`raum`);this.change(n=>{n.rooms.push({id:t,name:e,importance:2,radiators:[],temperature_sensors:[],openings:[],presence:[],humidity_sensors:[],paused:[],targets:{}})}),this._selected=t,this._newName=``,this._confirmDelete=!1}_delete(e){let t=this.config.rooms.findIndex(t=>t.id===e);this.change(t=>{t.rooms=t.rooms.filter(t=>t.id!==e)});let n=this.config.rooms.filter(t=>t.id!==e);this._selected=n[Math.max(0,t-1)]?.id??null,this._confirmDelete=!1}render(){let e=this.t,t=this._room;return k`
      <div class="layout">
        <div class="card list">
          <h3>${e(`rooms.title`)}</h3>
          ${this.config.rooms.length?k`<div class="items" role="tablist" aria-label=${e(`rooms.select`)}>
                ${this.config.rooms.map(n=>k`<button
                    role="tab"
                    aria-selected=${t?.id===n.id}
                    class="item ${t?.id===n.id?`sel`:``}"
                    @click=${()=>{this._selected=n.id,this._confirmDelete=!1}}
                  >
                    <ha-icon icon="mdi:door"></ha-icon><span>${n.name}</span>
                    ${pn(n,this.hass.states).length?k`<ha-icon class="warnicon" icon="mdi:alert-circle-outline" title=${e(`dev.unavailable`)}></ha-icon>`:M}
                  </button>`)}
              </div>`:k`<div class="muted">${e(`rooms.none`)}</div>`}
          ${this.readonly?M:k`<form
                class="add"
                @submit=${e=>{e.preventDefault(),this._add()}}
              >
                <input
                  .value=${this._newName}
                  placeholder=${e(`rooms.add_placeholder`)}
                  aria-label=${e(`rooms.add_placeholder`)}
                  @input=${e=>this._newName=$(e)}
                />
                <button type="submit" ?disabled=${!this._newName.trim()}><ha-icon icon="mdi:plus"></ha-icon>${e(`rooms.add`)}</button>
              </form>`}
        </div>
        ${t?this._renderRoom(t):M}
      </div>
    `}_renderRoom(e){let t=this.t,n=this.readonly,r=pn(e,this.hass.states);return k`<div class="card editor">
      <div class="head">
        <label class="field grow">
          <span class="lbl">${t(`room.name`)}</span>
          <input
            .value=${e.name}
            ?disabled=${n}
            class=${e.name.trim()?``:`invalid`}
            @change=${t=>this._updateRoom(e.id,e=>e.name=$(t).trim())}
          />
        </label>
        <label class="field" title=${t(`room.importance_hint`)}>
          <span class="lbl">${t(`room.importance`)}</span>
          <select
            ?disabled=${n}
            @change=${t=>this._updateRoom(e.id,e=>e.importance=Number($(t)))}
          >
            ${[1,2,3].map(n=>k`<option value=${n} ?selected=${e.importance===n}>${n} – ${t(`importance.${n}`)}</option>`)}
          </select>
        </label>
        <span class="muted rid">${t(`id`)}: ${e.id}</span>
      </div>

      <div class="row sect">
        <span class="lbl" style="margin:0">${t(`room.devices`)}</span>
        <span class="spacer"></span>
        ${r.length?k`<span class="badge warn">${r.length===1?t(`dev.unavail_one`):t(`dev.unavail_count`,{n:r.length})}</span>
              ${n?M:k`<button class="small" @click=${()=>this._updateRoom(e.id,e=>{for(let t of r)(e.paused??[]).includes(t)||gn(e,t)})}>
                    <ha-icon icon="mdi:pause"></ha-icon>${t(`dev.pause_unavail`)}
                  </button>`}`:M}
      </div>
      <div class="hint">${t(`room.devices_hint`)}</div>
      <div class="groups">${on.map(t=>this._renderGroup(e,t))}</div>
      ${(e.humidity_sensors??[]).length?this._renderVentilate(e):M}

      <span class="lbl" style="margin-top:14px">${t(`room.targets`)}</span>
      <div class="hint">${t(`room.targets_hint`)}</div>
      ${this.config.scenes.length?k`<div class="targets">
            ${this.config.scenes.map(t=>k`<label class="target">
                <span>${t.icon?k`<ha-icon icon=${t.icon}></ha-icon>`:M}${t.name}</span>
                <span class="row" style="flex-wrap:nowrap;gap:4px">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="30"
                    ?disabled=${n}
                    placeholder=${String(t.default_target??``)}
                    .value=${e.targets[t.id]===void 0?``:String(e.targets[t.id])}
                    @change=${n=>this._updateRoom(e.id,e=>{let r=Q(n);r===null?delete e.targets[t.id]:e.targets[t.id]=r})}
                  /><span class="muted">°C</span>
                </span>
              </label>`)}
          </div>`:k`<div class="muted">${t(`scenes.none`)}</div>`}

      ${n?M:k`<div style="margin-top:16px">
            ${this._confirmDelete?k`<div class="confirm" role="alertdialog" aria-label=${t(`room.delete`)}>
                  ${t(`room.delete_confirm`,{name:e.name})}
                  <div class="row">
                    <button class="danger solid" @click=${()=>this._delete(e.id)}><ha-icon icon="mdi:delete"></ha-icon>${t(`delete`)}</button>
                    <button @click=${()=>this._confirmDelete=!1}>${t(`cancel`)}</button>
                  </div>
                </div>`:k`<button class="danger" @click=${()=>this._confirmDelete=!0}><ha-icon icon="mdi:delete-outline"></ha-icon>${t(`room.delete`)}</button>`}
          </div>`}
    </div>`}_renderVentilate(e){let t=this.t,n=(n,r,i)=>k`<label class="target">
        <span>${t(`room.${n}`)}</span>
        <span class="row" style="flex-wrap:nowrap;gap:4px">
          <input
            type="number"
            step="1"
            min="0"
            max=${i}
            ?disabled=${this.readonly}
            placeholder=${String(r)}
            .value=${e[n]===void 0?``:String(e[n])}
            @change=${t=>this._updateRoom(e.id,e=>{let a=Q(t);e[n]=a===null?r:Math.max(0,Math.min(i,a))})}
          /><span class="muted">%</span>
        </span>
      </label>`;return k`<span class="lbl" style="margin-top:14px">${t(`room.ventilate`)}</span>
      <div class="hint">${t(`room.ventilate_hint`)}</div>
      <div class="targets">${n(`ventilate_humidity`,65,100)}${n(`ventilate_rise`,6,30)}</div>`}_renderGroup(e,t){let n=this.t,r=this.readonly,i=cn(e,t.kind),a=new Set(e.paused??[]),o=this._adding===`${e.id}:${t.kind}`;return k`<div class="group">
      <div class="ghead" title=${n(t.hint)}>
        <ha-icon icon=${t.icon}></ha-icon>
        <span class="gname">${n(t.label)}</span>
        <span class="muted">${i.length||n(`dev.none`)}</span>
        <span class="spacer"></span>
        ${r?M:k`<button
              class="icon"
              title=${n(`dev.add`)}
              aria-label="${n(`dev.add`)}: ${n(t.label)}"
              @click=${()=>this._adding=o?null:`${e.id}:${t.kind}`}
            >
              <ha-icon icon=${o?`mdi:close`:`mdi:plus`}></ha-icon>
            </button>`}
      </div>
      ${i.map(i=>{let o=this.hass.states[i],s=un(o),c=a.has(i),l=c?null:fn(this.devices?.[i],n),u=t.kind===`temperature_sensors`?e.temperature_sensors.find(e=>e.entity===i):void 0,d=u?.weight;return k`<div class="dev ${c?`paused`:``} ${s?``:`unavail`}">
          <span class="dot" aria-hidden="true"></span>
          <span class="dname">
            <span>${Qt(this.hass.states,i)}</span>
            <span class="did">${i}</span>
            ${l?k`<span class="dnote">${l}</span>`:M}
          </span>
          <span class="dval">${c?n(`dev.paused`):dn(o,t.kind,n,this.lang)}</span>
          ${d===void 0?M:k`<input
                class="w"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                title=${n(`room.weight`)}
                aria-label="${n(`room.weight`)}: ${i}"
                ?disabled=${r}
                .value=${String(d)}
                @change=${t=>this._updateRoom(e.id,e=>{let n=e.temperature_sensors.find(e=>e.entity===i),r=Q(t);n&&(n.weight=r===null||r<=0?1:r)})}
              />
              <input
                class="w off"
                type="number"
                min="-5"
                max="5"
                step="0.1"
                placeholder="±0"
                title=${n(`room.offset_hint`)}
                aria-label="${n(`room.offset`)}: ${i}"
                ?disabled=${r}
                .value=${u?.offset?String(u.offset):``}
                @change=${t=>this._updateRoom(e.id,e=>{let n=e.temperature_sensors.find(e=>e.entity===i),r=Q(t);n&&(n.offset=r===null?0:Math.max(-5,Math.min(5,Math.round(r*10)/10)))})}
              />`}
          ${r?M:k`<button
                  class="icon"
                  title=${n(c?`dev.resume`:`dev.pause`)}
                  aria-label="${n(c?`dev.resume`:`dev.pause`)}: ${i}"
                  @click=${()=>this._updateRoom(e.id,e=>gn(e,i))}
                >
                  <ha-icon icon=${c?`mdi:play`:`mdi:pause`}></ha-icon>
                </button>
                <button
                  class="icon"
                  title=${n(`remove`)}
                  aria-label="${n(`remove`)}: ${i}"
                  @click=${()=>this._updateRoom(e.id,e=>mn(e,t.kind,i))}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`}
        </div>`})}
      ${o?k`<wr-entity-picker
            class="adder"
            .hass=${this.hass}
            .lang=${this.lang}
            multiple
            .domains=${t.domains}
            .deviceClasses=${t.classes}
            .value=${[]}
            .exclude=${i}
            @value-changed=${n=>{let r=n.detail.value.filter(e=>!i.includes(e));this._updateRoom(e.id,e=>r.forEach(n=>hn(e,t.kind,n)))}}
          ></wr-entity-picker>`:M}
    </div>`}};vn=yn,vn.properties={...Z.properties,_selected:{state:!0},_newName:{state:!0},_confirmDelete:{state:!0},_adding:{state:!0},devices:{attribute:!1}},vn.styles=[X,o`
      .layout {
        display: grid;
        gap: 16px;
        grid-template-columns: minmax(200px, 280px) minmax(0, 1fr);
        align-items: start;
      }
      @media (max-width: 760px) {
        .layout {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .items {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;
      }
      @media (max-width: 760px) {
        .items {
          flex-direction: row;
          flex-wrap: wrap;
        }
      }
      .item {
        justify-content: flex-start;
        border-color: transparent;
        border-radius: 8px;
        text-align: left;
      }
      .item.sel {
        background: color-mix(in srgb, var(--wr-heat) 16%, transparent);
        border-color: var(--wr-heat);
      }
      .add {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .head {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: flex-end;
      }
      .head .grow {
        flex: 1 1 220px;
      }
      .head .field {
        margin: 0;
      }
      .rid {
        font-size: 12px;
        padding-bottom: 10px;
      }
      .sect {
        margin-top: 16px;
      }
      button.small {
        min-height: 30px;
        padding: 2px 10px;
        font-size: 13px;
      }
      .warnicon {
        color: var(--wr-warn);
        margin-left: auto;
        --mdc-icon-size: 18px;
      }
      .groups {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 8px;
      }
      .group {
        border: 1px solid var(--wr-div);
        border-radius: 10px;
        overflow: hidden;
      }
      .ghead {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 4px 2px 10px;
        background: var(--wr-input-bg);
      }
      .ghead ha-icon {
        --mdc-icon-size: 18px;
        color: var(--wr-text2);
      }
      .gname {
        font-weight: 500;
      }
      .dev {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 4px 2px 10px;
        border-top: 1px solid var(--wr-div);
        min-height: 40px;
      }
      .dnote {
        color: var(--warning-color, #ff9800);
        font-size: 0.8em;
        font-weight: 500;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex: none;
        background: var(--wr-ok);
      }
      .dev.unavail .dot {
        background: var(--wr-warn);
      }
      .dev.paused .dot {
        background: var(--wr-text2);
      }
      .dev.paused .dname,
      .dev.paused .dval {
        opacity: 0.55;
      }
      .dname {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        overflow-wrap: break-word;
        line-height: 1.25;
      }
      .did {
        font-size: 11px;
        color: var(--wr-text2);
      }
      .dval {
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        font-size: 13px;
      }
      .dev.unavail:not(.paused) .dval {
        color: var(--wr-warn);
      }
      input.w {
        width: 58px;
        min-height: 32px;
        padding: 2px 6px;
      }
      .adder {
        display: block;
        padding: 8px 10px 0;
        border-top: 1px solid var(--wr-div);
      }
      @media (max-width: 480px) {
        .did {
          display: none;
        }
      }
      .targets {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 190px), 1fr));
      }
      .target {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        border: 1px solid var(--wr-div);
        border-radius: 8px;
        padding: 6px 8px;
      }
      .target > span:first-child {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        min-width: 0;
        flex: 1 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .target > span:last-child {
        flex: none;
      }
      .target input {
        width: 64px;
        min-width: 0;
        flex: none;
      }
    `],customElements.get(`wr-rooms-editor`)||customElements.define(`wr-rooms-editor`,yn);var bn,xn=class extends Z{constructor(){super(),this._newName=``,this._confirmDelete=null}_updateDay(e,t){this.change(n=>{let r=n.day_types.find(t=>t.id===e);r&&t(r)})}_add(){let e=this._newName.trim();if(!e)return;let t=Ze(e,this.config.day_types.map(e=>e.id),`tagesart`),n=this.config.scenes[0]?.id??``;this.change(r=>{r.day_types.push({id:t,name:e,slots:[{start:`06:00`,scene:n}]})}),this._newName=``}_weekUsage(e){return He.filter(t=>this.config.week[t]===e)}_addSlot(e){this._updateDay(e.id,e=>{let t=e.slots.length?z(e.slots[e.slots.length-1].start):null,n=t===null?`06:00`:B(Math.min(t+60,1439));e.slots.push({start:n,scene:this.config.scenes[0]?.id??``})})}render(){let e=this.t,t=this.readonly;return k`
      <div class="card">
        <h3>${e(`schedule.week`)}</h3>
        <div class="hint">${e(`schedule.week_hint`)}</div>
        <div class="week">
          ${He.map(n=>{let r=this.config.week[n]??``,i=!!r&&!this.config.day_types.some(e=>e.id===r);return k`<label class="field">
              <span class="lbl">${e(`week.${n}`)}</span>
              <select
                ?disabled=${t}
                class=${!r||i?`invalid`:``}
                @change=${e=>this.change(t=>{t.week[n]=$(e)})}
              >
                ${!r||i?k`<option value="" selected>${e(`week.unset`)}</option>`:M}
                ${this.config.day_types.map(e=>k`<option value=${e.id} ?selected=${e.id===r}>${e.name}</option>`)}
              </select>
            </label>`})}
        </div>
      </div>

      <h3 style="margin-top:16px">${e(`schedule.day_types`)}</h3>
      <div class="hint">${e(`schedule.day_types_hint`)}</div>
      ${this.config.scenes.length?M:k`<div class="banner info">${e(`schedule.no_scenes`)}</div>`}
      <div class="days">${this.config.day_types.map(e=>this._renderDay(e))}</div>

      ${t?M:k`<form
            class="card add"
            @submit=${e=>{e.preventDefault(),this._add()}}
          >
            <input
              .value=${this._newName}
              placeholder=${e(`schedule.add_placeholder`)}
              aria-label=${e(`schedule.add_placeholder`)}
              @input=${e=>this._newName=$(e)}
            />
            <button type="submit" ?disabled=${!this._newName.trim()}><ha-icon icon="mdi:plus"></ha-icon>${e(`schedule.add`)}</button>
          </form>`}
    `}_renderDay(e){let t=this.t,n=this.readonly,r=this.config.scenes.map(e=>e.id),i=Ye(e.slots,r),a=e=>i.filter(t=>t.index===e),o=this._weekUsage(e.id);return k`<div class="card day">
      <div class="row">
        <input
          class="dname ${e.name.trim()?``:`invalid`}"
          .value=${e.name}
          ?disabled=${n}
          aria-label=${t(`room.name`)}
          @change=${t=>this._updateDay(e.id,e=>e.name=$(t).trim())}
        />
        <span class="muted" style="font-size:12px">${t(`id`)}: ${e.id}</span>
      </div>
      <div style="margin:10px 0">${Tt(e.slots,this.config.scenes,{legend:!0})}</div>
      <div class="slots">
        ${e.slots.map((i,o)=>{let s=a(o),c=s.some(e=>e.code===`time_format`||e.code===`not_ascending`),l=s.some(e=>e.code===`scene_missing`||e.code===`scene_unknown`);return k`<div class="slot">
            <span class="muted">${t(`schedule.slot_from`)}</span>
            <input
              type="text"
              inputmode="numeric"
              placeholder="HH:MM"
              maxlength="5"
              aria-label=${t(`schedule.slot_from`)}
              class="time ${c?`invalid`:``}"
              ?disabled=${n}
              .value=${i.start}
              @change=${t=>this._updateDay(e.id,e=>e.slots[o].start=Ge($(t)))}
            />
            <select
              class=${l?`invalid`:``}
              ?disabled=${n}
              @change=${t=>this._updateDay(e.id,e=>e.slots[o].scene=$(t))}
            >
              ${!i.scene||!r.includes(i.scene)?k`<option value="" selected>${t(`week.unset`)}</option>`:M}
              ${this.config.scenes.map(e=>k`<option value=${e.id} ?selected=${e.id===i.scene}>${e.name}</option>`)}
            </select>
            ${n?M:k`<button
                  class="icon"
                  title=${t(`remove`)}
                  aria-label=${t(`remove`)}
                  @click=${()=>this._updateDay(e.id,e=>e.slots.splice(o,1))}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`}
            ${s.length?k`<div class="error-text full">${s.map(e=>t(`slot.${e.code}`)).join(` `)}</div>`:M}
          </div>`})}
        ${a(-1).length?k`<div class="error-text">${t(`slot.empty`)}</div>`:M}
      </div>
      ${n?M:k`<div class="row" style="margin-top:8px">
            <button ?disabled=${!this.config.scenes.length} @click=${()=>this._addSlot(e)}>
              <ha-icon icon="mdi:clock-plus-outline"></ha-icon>${t(`schedule.add_slot`)}
            </button>
            <span class="spacer"></span>
            <button class="danger" @click=${()=>this._confirmDelete=e.id}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>${t(`schedule.delete_day_type`)}
            </button>
          </div>
          ${this._confirmDelete===e.id?k`<div class="confirm" role="alertdialog">
                ${o.length?k`${t(`schedule.in_use`,{days:o.map(e=>t(`week.${e}`)).join(`, `)})}
                      <div class="row"><button @click=${()=>this._confirmDelete=null}>${t(`close`)}</button></div>`:k`${t(`schedule.delete_confirm`,{name:e.name})}
                      <div class="row">
                        <button
                          class="danger solid"
                          @click=${()=>{this.change(t=>t.day_types=t.day_types.filter(t=>t.id!==e.id)),this._confirmDelete=null}}
                        >
                          <ha-icon icon="mdi:delete"></ha-icon>${t(`delete`)}
                        </button>
                        <button @click=${()=>this._confirmDelete=null}>${t(`cancel`)}</button>
                      </div>`}
              </div>`:M}`}
    </div>`}};bn=xn,bn.properties={...Z.properties,_newName:{state:!0},_confirmDelete:{state:!0}},bn.styles=[X,o`
      .week {
        display: grid;
        gap: 0 12px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
      }
      .days {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
        margin: 8px 0 16px;
      }
      .dname {
        flex: 1;
        font-weight: 500;
        min-width: 140px;
      }
      .slots {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .slot {
        display: grid;
        grid-template-columns: auto 110px minmax(0, 1fr) auto;
        gap: 6px;
        align-items: center;
      }
      .slot .full {
        grid-column: 1 / -1;
      }
      .add {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .add input {
        flex: 1;
        min-width: 180px;
      }
    `],customElements.get(`wr-schedule-editor`)||customElements.define(`wr-schedule-editor`,xn);var Sn,Cn=[`allow`,`frost_only`,`deny`],wn=class extends Z{constructor(){super(),this._newName=``,this._confirmDelete=null}_updateScene(e,t){this.change(n=>{let r=n.scenes.find(t=>t.id===e);r&&t(r)})}_add(){let e=this._newName.trim();if(!e)return;let t=Ze(e,this.config.scenes.map(e=>e.id),`szene`);this.change(n=>n.scenes.push({id:t,name:e,icon:`mdi:thermometer`,stove:`allow`,default_target:20})),this._newName=``}_usedIn(e){return this.config.day_types.filter(t=>t.slots.some(t=>t.scene===e)).map(e=>e.name)}_delete(e){this.change(t=>{t.scenes=t.scenes.filter(t=>t.id!==e);for(let n of t.rooms)delete n.targets[e]}),this._confirmDelete=null}render(){let e=this.t,t=this.readonly,n=this.config.scenes.map(e=>e.id);return k`
      <div class="hint">${e(`scenes.hint`)}</div>
      <div class="scenes">
        ${this.config.scenes.map(r=>{let i=this._usedIn(r.id);return k`<div class="card scene" style="border-top:4px solid ${ft(r.id,n)}">
            <div class="row">
              ${r.icon?k`<ha-icon icon=${r.icon}></ha-icon>`:M}
              <h3 style="margin:0">${r.name||r.id}</h3>
              <span class="spacer"></span>
              <span class="muted" style="font-size:12px">${e(`id`)}: ${r.id}</span>
            </div>
            <div class="fields">
              <label class="field">
                <span class="lbl">${e(`scene.name`)}</span>
                <input
                  .value=${r.name}
                  ?disabled=${t}
                  class=${r.name.trim()?``:`invalid`}
                  @change=${e=>this._updateScene(r.id,t=>t.name=$(e).trim())}
                />
              </label>
              <label class="field">
                <span class="lbl">${e(`scene.icon`)}</span>
                <input
                  .value=${r.icon??``}
                  ?disabled=${t}
                  placeholder=${e(`scene.icon_hint`)}
                  @change=${e=>this._updateScene(r.id,t=>t.icon=$(e).trim())}
                />
              </label>
              <label class="field">
                <span class="lbl">${e(`scene.stove`)}</span>
                <select ?disabled=${t} @change=${e=>this._updateScene(r.id,t=>t.stove=$(e))}>
                  ${Cn.map(t=>k`<option value=${t} ?selected=${r.stove===t}>${e(`scene.stove.${t}`)}</option>`)}
                </select>
              </label>
              <label class="field">
                <span class="lbl">${e(`scene.default_target`)}</span>
                <span class="row" style="flex-wrap:nowrap">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="30"
                    ?disabled=${t}
                    .value=${r.default_target!==void 0&&r.default_target!==null?String(r.default_target):``}
                    @change=${e=>{let t=Q(e);t!==null&&this._updateScene(r.id,e=>e.default_target=t)}}
                  /><span class="muted">°C</span>
                </span>
              </label>
            </div>
            ${t?M:this._confirmDelete===r.id?k`<div class="confirm" role="alertdialog">
                    ${i.length?k`${e(`scene.in_use`,{names:i.join(`, `)})}
                          <div class="row"><button @click=${()=>this._confirmDelete=null}>${e(`close`)}</button></div>`:k`${e(`scene.delete_confirm`,{name:r.name})}
                          <div class="row">
                            <button class="danger solid" @click=${()=>this._delete(r.id)}><ha-icon icon="mdi:delete"></ha-icon>${e(`delete`)}</button>
                            <button @click=${()=>this._confirmDelete=null}>${e(`cancel`)}</button>
                          </div>`}
                  </div>`:k`<button class="danger" @click=${()=>this._confirmDelete=r.id}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>${e(`scene.delete`)}
                  </button>`}
          </div>`})}
      </div>
      ${this.config.scenes.length?M:k`<div class="muted">${e(`scenes.none`)}</div>`}
      ${t?M:k`<form
            class="card add"
            @submit=${e=>{e.preventDefault(),this._add()}}
          >
            <input
              .value=${this._newName}
              placeholder=${e(`scenes.add_placeholder`)}
              aria-label=${e(`scenes.add_placeholder`)}
              @input=${e=>this._newName=$(e)}
            />
            <button type="submit" ?disabled=${!this._newName.trim()}><ha-icon icon="mdi:plus"></ha-icon>${e(`scenes.add`)}</button>
          </form>`}
      ${this.config.rooms.length&&this.config.scenes.length?this._renderMatrix():M}
    `}_renderMatrix(){let e=this.t,t=this.readonly;return k`<div class="card" style="margin-top:16px">
      <h3>${e(`scenes.matrix`)}</h3>
      <div class="hint">${e(`scenes.matrix_hint`)}</div>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th></th>
              ${this.config.scenes.map(e=>k`<th scope="col">${e.name}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${this.config.rooms.map(e=>k`<tr>
                <th scope="row">${e.name}</th>
                ${this.config.scenes.map(n=>k`<td>
                    <input
                      type="number"
                      step="0.5"
                      min="5"
                      max="30"
                      ?disabled=${t}
                      aria-label="${e.name} – ${n.name}"
                      placeholder=${String(n.default_target??``)}
                      .value=${e.targets[n.id]===void 0?``:String(e.targets[n.id])}
                      @change=${t=>this.change(r=>{let i=r.rooms.find(t=>t.id===e.id);if(!i)return;let a=Q(t);a===null?delete i.targets[n.id]:i.targets[n.id]=a})}
                    />
                  </td>`)}
              </tr>`)}
          </tbody>
        </table>
      </div>
    </div>`}};Sn=wn,Sn.properties={...Z.properties,_newName:{state:!0},_confirmDelete:{state:!0}},Sn.styles=[X,o`
      .scenes {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
        margin: 8px 0 16px;
      }
      .fields {
        margin-top: 12px;
      }
      .add {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .add input {
        flex: 1;
        min-width: 180px;
      }
      .scroll {
        overflow-x: auto;
        max-width: 100%;
      }
      table {
        border-collapse: collapse;
        min-width: 100%;
      }
      th,
      td {
        padding: 4px 6px;
        border-bottom: 1px solid var(--wr-div);
        text-align: left;
        white-space: nowrap;
      }
      th[scope="row"] {
        font-weight: 500;
        position: sticky;
        left: 0;
        background: var(--wr-card);
      }
      td input {
        width: 76px;
      }
    `],customElements.get(`wr-scenes-editor`)||customElements.define(`wr-scenes-editor`,wn);var Tn,En=[{group:`pgroup.stove`,params:[{key:`start_below_k`,unit:`K`,step:.1},{key:`stop_above_k`,unit:`K`,step:.1},{key:`min_burn_min`,unit:`min`,step:5},{key:`max_burn_min`,unit:`min`,step:5},{key:`min_pause_min`,unit:`min`,step:5},{key:`max_starts_per_day`,unit:``,step:1},{key:`stove_block_setpoint_c`,unit:`°C`,step:.5}]},{group:`pgroup.softstart`,params:[{key:`soft_start_min`,unit:`min`,step:1},{key:`self_off_wait_min`,unit:`min`,step:5}]},{group:`pgroup.warmup`,extra:`warmup_scene`,params:[{key:`warmup_extra_k`,unit:`K`,step:.5},{key:`warmup_lead_min`,unit:`min`,step:5}]},{group:`pgroup.openings`,params:[{key:`opening_grace_min`,unit:`min`,step:1},{key:`opening_stop_min`,unit:`min`,step:1},{key:`opening_empty_room_min`,unit:`min`,step:1},{key:`opening_recovery_min`,unit:`min`,step:1},{key:`opening_check_min`,unit:`min`,step:5}]},{group:`pgroup.sensors`,params:[{key:`sensor_hold_min`,unit:`min`,step:5},{key:`sensor_alert_min`,unit:`min`,step:5}]},{group:`pgroup.power`,params:[{key:`power_min`,unit:``,step:1},{key:`power_max`,unit:``,step:1},{key:`power_cold_c`,unit:`°C`,step:.5}]},{group:`pgroup.radiators`,params:[{key:`radiator_boost_k`,unit:`K`,step:.1}]},{group:`pgroup.limits`,params:[{key:`frost_c`,unit:`°C`,step:.5},{key:`night_floor_c`,unit:`°C`,step:.5}]},{group:`pgroup.presence`,params:[{key:`presence_empty_min`,unit:`min`,step:5}]},{group:`pgroup.pellets`,params:[{key:`pellet_bag_kg`,unit:`kg`,step:.5},{key:`pellet_capacity_kg`,unit:`kg`,step:1},{key:`pellet_rate_kg_h`,unit:`kg/h`,step:.05},{key:`pellet_reminder_kg`,unit:`kg`,step:.5}]}],Dn={"pgroup.stove":`mdi:fire`,"pgroup.softstart":`mdi:radiator`,"pgroup.warmup":`mdi:home-thermometer-outline`,"pgroup.openings":`mdi:window-open-variant`,"pgroup.sensors":`mdi:access-point-network-off`,"pgroup.power":`mdi:speedometer`,"pgroup.radiators":`mdi:radiator`,"pgroup.limits":`mdi:snowflake-thermometer`,"pgroup.presence":`mdi:motion-sensor`,"pgroup.pellets":`mdi:grain`},On=new Set(En.flatMap(e=>e.params.map(e=>e.key)));function kn(e){return e.endsWith(`_k`)?`K`:e.endsWith(`_c`)?`°C`:e.endsWith(`_min`)?`min`:``}function An(e,t){let n=ot(t),r=e.parameters??{},i=Object.entries(r).filter(([e,t])=>!st(t,it(n[e]))).map(([e])=>e);return typeof r.power_min==`number`&&typeof r.power_max==`number`&&r.power_min>r.power_max&&!i.includes(`power_min`)&&i.push(`power_min`),i}var jn=class extends Z{_set(e){this.change(e)}_picker(e){return k`<wr-entity-picker
      .hass=${this.hass}
      .lang=${this.lang}
      ?multiple=${!!e.multiple}
      ?disabled=${this.readonly}
      ?invalid=${!!e.required&&!e.value}
      .domains=${e.domains}
      .deviceClasses=${e.deviceClasses}
      .value=${e.value}
      .label=${this.t(e.label)}
      .helper=${this.t(e.hint)}
      @value-changed=${t=>this._set(n=>e.onChange(n,t.detail.value??(e.multiple?[]:null)))}
    ></wr-entity-picker>`}render(){let e=this.t,t=this.config;return k`
      <div class="sections">
        <details class="sect">
          <summary><ha-icon icon="mdi:fireplace"></ha-icon><span><b>${e(`house.stove`)}</b><small>${e(`house.sect_stove_hint`)}</small></span></summary>
          <div class="cols">
        <div>
          ${this._picker({label:`house.stove_climate`,hint:`house.stove_climate_hint`,domains:[`climate`],value:t.stove.climate,required:t.mode===`active`,onChange:(e,t)=>e.stove.climate=t})}
          ${t.stove.climate?M:k`<div class="hint" style="margin-top:-8px">${e(`house.stove_climate_active_hint`)}</div>`}
          ${this._picker({label:`house.power`,hint:`house.power_hint`,domains:[`select`,`input_select`,`number`,`input_number`],value:t.stove.power,onChange:(e,t)=>e.stove.power=t})}
        </div>
        <div>
          <h4>${e(`house.stove_functions`)}</h4>
          <div class="banner info" style="margin-bottom:12px;font-size:13px">${e(`house.stove_functions_hint`)}</div>
          ${this._picker({label:`house.chrono_switch`,hint:`house.chrono_switch_hint`,domains:[`switch`],value:t.stove.chrono_switch,onChange:(e,t)=>e.stove.chrono_switch=t})}
          ${this._picker({label:`house.eco_switch`,hint:`house.eco_switch_hint`,domains:[`switch`],value:t.stove.eco_switch,onChange:(e,t)=>e.stove.eco_switch=t})}
          ${this._picker({label:`house.error_sensor`,hint:`house.error_sensor_hint`,domains:[`binary_sensor`],deviceClasses:[`problem`],value:t.stove.error_sensor,onChange:(e,t)=>e.stove.error_sensor=t})}
          ${this._picker({label:`house.water_sensor`,hint:`house.water_sensor_hint`,domains:[`sensor`],deviceClasses:[`temperature`],value:t.stove.water_sensor,onChange:(e,t)=>e.stove.water_sensor=t})}
          ${this._picker({label:`house.ignitions_sensor`,hint:`house.ignitions_sensor_hint`,domains:[`sensor`],value:t.stove.ignitions_sensor,onChange:(e,t)=>e.stove.ignitions_sensor=t})}
        </div>
          </div>
        </details>
        <details class="sect">
          <summary><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon><span><b>${e(`house.environment`)}</b><small>${e(`house.sect_env_hint`)}</small></span></summary>
        <div>
          ${this._picker({label:`house.weather`,hint:`house.weather_hint`,domains:[`weather`],value:t.weather,onChange:(e,t)=>e.weather=t})}
          ${this._picker({label:`house.outdoor_sensor`,hint:`house.outdoor_sensor_hint`,domains:[`sensor`],deviceClasses:[`temperature`],value:t.outdoor_sensor,onChange:(e,t)=>e.outdoor_sensor=t})}
          ${this._picker({label:`house.workday`,hint:`house.workday_hint`,domains:[`binary_sensor`],value:t.workday,onChange:(e,t)=>e.workday=t})}
        </div>
        </details>
        <details class="sect">
          <summary><ha-icon icon="mdi:account-group-outline"></ha-icon><span><b>${e(`house.people`)}</b><small>${e(`house.sect_people_hint`)}</small></span></summary>
        <div>
          ${this._picker({label:`house.persons`,hint:`house.persons_hint`,domains:[`person`],value:t.persons,multiple:!0,onChange:(e,t)=>e.persons=t})}
          ${this._picker({label:`house.pet`,hint:`house.pet_hint`,domains:[`binary_sensor`,`device_tracker`,`person`],value:t.pet,onChange:(e,t)=>e.pet=t})}
          ${this._renderNotify()}
        </div>
        </details>
        ${this._renderMessages()}
      </div>
      ${this._renderParameters()}
    `}_renderNotify(){let e=this.t,t=tn(this.hass?.services),n=this.config.notify??[],r=[...t,...n.filter(e=>!t.includes(e))];return k`<div class="lbl">${e(`house.notify`)}</div>
      <div class="hint">${e(`house.notify_hint`)}</div>
      ${r.length?k`<div class="notify">
            ${r.map(r=>{let i=!t.includes(r);return k`<label class="check">
                <input
                  type="checkbox"
                  ?disabled=${this.readonly}
                  .checked=${n.includes(r)}
                  @change=${e=>{let t=e.target.checked;this._set(e=>{let n=(e.notify??[]).filter(e=>e!==r);e.notify=t?[...n,r]:n})}}
                />
                <span>${r}${i?k` <span class="badge warn">${e(`house.notify_unknown`)}</span>`:M}</span>
              </label>`})}
          </div>`:k`<div class="muted">${e(`house.notify_none`)}</div>`}`}_msg(){return{...R,...this.config.notifications??{}}}_setMsg(e){this._set(t=>{let n={...R,...t.notifications??{}};e(n),t.notifications=n})}_renderMessages(){let e=this.t,t=this._msg(),n=[`opening`,`opening_check`,`sensor`,`pellets`,`stove_error`,`overheat`],r=We(t),i=(n,r,i,a)=>{let o=`msg.${n}_hint`;return k`<label class="param">
        <span class="ptext">
          <span class="lbl">${e(`msg.${n}`)}</span>
          <span class="hint">${e(o)}</span>
        </span>
        <span class="pinput">
          <input
            type="number"
            ?disabled=${this.readonly}
            min=${r}
            max=${i}
            step=${a}
            placeholder=${String(R[n])}
            .value=${String(t[n])}
            @change=${e=>{let t=Q(e);this._setMsg(e=>e[n]=t===null?R[n]:Math.max(r,Math.min(i,t)))}}
          />
          <span class="unit">min</span>
        </span>
      </label>`},a=n=>k`<label class="field">
      <span class="lbl">${e(`msg.${n}`)}</span>
      <input
        class=${r?``:`invalid`}
        ?disabled=${this.readonly}
        inputmode="numeric"
        placeholder="HH:MM"
        .value=${t[n]}
        @change=${e=>{let t=e.target.value.trim();this._setMsg(e=>e[n]=t?Ge(t):``)}}
      />
    </label>`;return k`<details class="sect" ?open=${!r}>
      <summary><ha-icon icon="mdi:bell-cog-outline"></ha-icon><span><b>${e(`house.messages`)}</b><small>${e(`house.messages_hint`)}</small></span></summary>
      <div class="cols">
        <div>
          <div class="lbl">${e(`house.msg_kinds`)}</div>
          <div class="notify">
            ${n.map(n=>k`<label class="check">
                <input
                  type="checkbox"
                  ?disabled=${this.readonly}
                  .checked=${t[n]}
                  @change=${e=>{let t=e.target.checked;this._setMsg(e=>e[n]=t)}}
                />
                <span>${e(`msg.${n}`)}</span>
              </label>`)}
          </div>
          <div class="lbl" style="margin-top:12px">${e(`msg.quiet`)}</div>
          <div class="hint">${e(`msg.quiet_hint`)}</div>
          <div class="quiet">${a(`quiet_start`)}${a(`quiet_end`)}</div>
          ${r?M:k`<div class="error-text">${e(`msg.quiet_invalid`)}</div>`}
          <label class="check" style="margin-top:8px">
            <input
              type="checkbox"
              ?disabled=${this.readonly}
              .checked=${t.quiet_hold}
              @change=${e=>{let t=e.target.checked;this._setMsg(e=>e.quiet_hold=t)}}
            />
            <span>${e(`msg.quiet_hold`)}</span>
          </label>
        </div>
        <div>
          ${i(`opening_delay_min`,0,240,1)} ${i(`repeat_min`,0,1440,5)} ${i(`ventilate_max_min`,5,240,5)}
        </div>
      </div>
    </details>`}_renderParameters(){let e=this.t,t=this.config.parameters??{},n=Object.keys(t).filter(e=>!On.has(e)),r=[...En];return n.length&&r.push({group:`pgroup.other`,params:n.map(e=>({key:e,unit:kn(e),step:.1}))}),k`<h3 style="margin:20px 0 4px">${e(`house.parameters`)}</h3>
      <div class="hint" style="margin-bottom:8px">${e(`house.parameters_hint`)}</div>
      <div class="sections">
        ${r.map(n=>{let r=n.params.filter(e=>e.key in t||this.defaults?.parameters?.[e.key]!==void 0);if(!r.length&&!n.extra)return M;let i=r.some(e=>An(this.config,this.defaults).includes(e.key)),a=`${n.group}_hint`;return k`<details class="sect" ?open=${i}>
            <summary>
              <ha-icon icon=${Dn[n.group]??`mdi:tune-variant`}></ha-icon>
              <span><b>${e(n.group)}</b>${e(a)===a?M:k`<small>${e(a)}</small>`}</span>
              ${i?k`<ha-icon class="bad" icon="mdi:alert-circle"></ha-icon>`:M}
            </summary>
            ${n.extra===`warmup_scene`?this._renderWarmupScene():M}
            <div class="params">${r.map(e=>this._renderParam(e))}</div>
          </details>`})}
      </div>`}_renderWarmupScene(){let e=this.t,t=this.config.warmup_scene??``;return k`<label class="field" style="max-width:420px;margin-top:8px">
      <span class="lbl">${e(`house.warmup_scene`)}</span>
      <span class="hint">${e(`house.warmup_scene_hint`)}</span>
      <select
        ?disabled=${this.readonly}
        .value=${t}
        @change=${e=>{let t=e.target.value;this._set(e=>e.warmup_scene=t||null)}}
      >
        <option value="" ?selected=${!t}>${e(`house.warmup_scene_auto`)}</option>
        ${this.config.scenes.map(e=>k`<option value=${e.id} ?selected=${e.id===t}>${e.name}</option>`)}
      </select>
    </label>`}_renderParam(e){let t=this.t,n=this.config.parameters?.[e.key],r=this.defaults?.parameters?.[e.key],i=it(ot(this.defaults)[e.key]),a=An(this.config,this.defaults).includes(e.key),o=`param.${e.key}`,s=`param.${e.key}_hint`,c=t(o)===o?e.key:t(o),l=t(s)===s?``:t(s),u=+(e.step<1);return k`<label class="param">
      <span class="ptext">
        <span class="lbl">${c}</span>
        ${l?k`<span class="hint">${l}</span>`:M}
        ${a||i.min!==void 0||i.max!==void 0?k`<span class=${a?`error-text`:`hint`}
              >${t(`house.out_of_range`,{min:i.min===void 0?`–`:V(i.min,this.lang,u),max:i.max===void 0?`–`:V(i.max,this.lang,u)})}${e.unit?` ${e.unit}`:``}</span
            >`:M}
      </span>
      <span class="pinput">
        <input
          type="number"
          class=${a?`invalid`:``}
          ?disabled=${this.readonly}
          step=${i.step??e.step}
          min=${i.min??M}
          max=${i.max??M}
          placeholder=${r===void 0?``:String(r)}
          .value=${n==null?``:String(n)}
          @change=${t=>{let n=Q(t);this._set(t=>{t.parameters=t.parameters??{},n===null?r===void 0?delete t.parameters[e.key]:t.parameters[e.key]=r:t.parameters[e.key]=n})}}
        />
        <span class="unit">${e.unit}</span>
      </span>
    </label>`}};Tn=jn,Tn.styles=[X,o`
      .sections {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      details.sect {
        background: var(--wr-card);
        border: 1px solid var(--wr-div);
        border-radius: var(--wr-radius);
        padding: 0 16px;
      }
      details.sect[open] {
        padding-bottom: 12px;
      }
      details.sect > summary {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        cursor: pointer;
        list-style: none;
      }
      details.sect > summary::-webkit-details-marker {
        display: none;
      }
      details.sect > summary::after {
        content: "";
        margin-left: auto;
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--wr-text2);
        border-bottom: 2px solid var(--wr-text2);
        transform: rotate(45deg);
        transition: transform 0.2s;
        flex: none;
      }
      details.sect[open] > summary::after {
        transform: rotate(-135deg);
      }
      details.sect > summary > ha-icon {
        color: var(--wr-heat);
      }
      details.sect > summary ha-icon.bad {
        color: var(--wr-err);
      }
      details.sect > summary span {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      details.sect > summary small {
        color: var(--wr-text2);
        font-size: 12px;
      }
      .cols {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
        align-items: start;
      }
      .notify {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .check {
        display: flex;
        gap: 8px;
        align-items: center;
        overflow-wrap: anywhere;
      }
      .check input {
        width: auto;
        min-height: 0;
        flex: none;
      }
      .quiet {
        display: flex;
        gap: 12px;
      }
      .quiet .field {
        max-width: 120px;
      }
      .params {
        display: grid;
        gap: 8px 24px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
      }
      .param {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        justify-content: space-between;
        border-bottom: 1px solid var(--wr-div);
        padding: 6px 0 8px;
      }
      .ptext {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .ptext .hint {
        margin: 0;
      }
      .pinput {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: none;
      }
      .pinput input {
        width: 90px;
      }
      .unit {
        width: 28px;
        color: var(--wr-text2);
      }
    `],customElements.get(`wr-house-editor`)||customElements.define(`wr-house-editor`,jn);var Mn,Nn=[{id:`overview`,icon:`mdi:view-dashboard-outline`},{id:`rooms`,icon:`mdi:floor-plan`},{id:`schedule`,icon:`mdi:calendar-clock`},{id:`scenes`,icon:`mdi:palette-outline`},{id:`house`,icon:`mdi:fireplace`},{id:`log`,icon:`mdi:format-list-bulleted`}],Pn=[`rooms`,`schedule`,`scenes`,`house`],Fn={rooms:[`rooms`],schedule:[`day_types`,`week`],scenes:[`scenes`],house:`rest`},In=/* @__PURE__ */ new Set([`rooms`,`day_types`,`week`,`scenes`,`mode`]);function Ln(e,t){let n=0,r=e.scenes.map(e=>e.id),i=e.day_types.map(e=>e.id);for(let t of e.day_types)n+=Ye(t.slots,r).length,t.name.trim()||n++;for(let t of e.rooms)t.name.trim()||n++;for(let t of e.scenes)t.name.trim()||n++;for(let t of He)e.week[t]&&i.includes(e.week[t])||n++;return n+=An(e,t).length,e.notifications&&!We(e.notifications)&&n++,n}var Rn=class extends I{constructor(){super(),this._unsub=null,this._connection=null,this._loading=!1,this._beforeUnload=e=>{this._dirty&&(e.preventDefault(),e.returnValue=``)},this.narrow=!1,this._tab=`overview`,this._saved=null,this._draft=null,this._defaults=null,this._status=null,this._loadError=null,this._saving=!1,this._saveMsg=null,this._busy=!1,this._actionError=null,this._modeConfirm=null,this._history=null}get _lang(){return ct(this.hass?.locale?.language??this.hass?.language)}get _t(){return Y(this._lang)}get _isAdmin(){return this.hass?.user?.is_admin!==!1}get _dirty(){return!!this._draft&&!!this._saved&&!lt(this._draft,this._saved)}_tabDirty(e){if(!this._dirty||!this._draft||!this._saved)return!1;let t=Fn[e];if(!t)return!1;let n=e=>Object.fromEntries(t===`rest`?Object.entries(e).filter(([e])=>!In.has(e)):t.map(t=>[t,e[t]]));return!lt(n(this._draft),n(this._saved))}connectedCallback(){super.connectedCallback(),window.addEventListener(`beforeunload`,this._beforeUnload),this.hass&&this._ensureData(),this._historyTimer=window.setInterval(()=>void this._loadHistory(),6e5)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`beforeunload`,this._beforeUnload),window.clearInterval(this._historyTimer),this._unsub?.(),this._unsub=null,this._connection=null}willUpdate(e){if(e.has(`route`)&&this.route?.path){let e=this.route.path.replace(/^\//,``).split(`/`)[0];Nn.some(t=>t.id===e)&&e!==this._tab&&(this._tab=e)}e.has(`hass`)&&this.hass&&this._ensureData()}_ensureData(){this.isConnected&&this.hass?.connection&&(this._connection!==this.hass.connection&&(this._unsub?.(),this._connection=this.hass.connection,this._unsub=Be(this.hass,e=>this._status=e,e=>this._loadError=q(e)),this._loadHistory()),this._saved||this._loading||this._loadError||this._load())}async _load(){this._loading=!0;try{let e=await je(this.hass);this._saved=pt(e.config),this._draft=K(this._saved),this._defaults=e.defaults??{},this._loadError=null}catch(e){this._loadError=q(e)||this._t(`load_error`)}finally{this._loading=!1}}async _loadHistory(){if(this.hass?.connection)try{this._history=await Le(this.hass,24)}catch{this._history=null}}_retry(){this._loadError=null,this._connection=null,this._unsub?.(),this._unsub=null,this._ensureData()}_selectTab(e){this._tab=e,this._saveMsg=this._saveMsg?.ok?null:this._saveMsg;let t=this.route?.prefix;if(t)try{history.replaceState(history.state,``,`${t}/${e}`)}catch{}}async _action(e){this._busy=!0,this._actionError=null;try{let t=await e();t&&typeof t==`object`&&`mode`in t&&(this._status=t)}catch(e){this._actionError=q(e)}finally{this._busy=!1}}async _changeMode(e){this._modeConfirm=null,await this._action(async()=>{let t=await ze(this.hass,e);return this._saved&&={...this._saved,mode:e},this._draft&&={...this._draft,mode:e},t})}async _save(){if(!this._draft)return;this._saving=!0,this._saveMsg=null;let e=this._t;try{let t={...K(this._draft),mode:this._status?.mode??this._draft.mode},n=await Me(this.hass,t);this._saved=pt(n?.config??t),this._draft=K(this._saved),this._saveMsg={ok:!0,text:e(`editor.save_ok`)}}catch(t){this._saveMsg={ok:!1,text:e(`editor.save_error`,{message:q(t)})}}finally{this._saving=!1}}_discard(){this._saved&&(this._draft=K(this._saved)),this._saveMsg=null}_menu(){this.dispatchEvent(new CustomEvent(`hass-toggle-menu`,{bubbles:!0,composed:!0}))}render(){let e=this._t;return k`
      <div class="toolbar">
        ${this.narrow?k`<button class="icon menu" title=${e(`menu`)} aria-label=${e(`menu`)} @click=${this._menu}>
              <ha-icon icon="mdi:menu"></ha-icon>
            </button>`:M}
        <ha-icon icon="mdi:fireplace" class="logo"></ha-icon>
        <span class="title">${e(`title`)}</span>
        <span class="spacer"></span>
        ${this._status?k`<span class="badge ${this._status.mode===`active`?`ok`:`warn`}">
              ${this._status.mode===`active`?e(`mode.active`):e(`mode.shadow`)}
            </span>`:M}
        ${this._dirty?k`<span class="badge warn" title=${e(`editor.unsaved`)}>●</span>`:M}
      </div>
      <nav class="tabs" role="tablist">
        ${Nn.map(t=>k`<button
            role="tab"
            aria-selected=${this._tab===t.id}
            class="tab ${this._tab===t.id?`active`:``}"
            @click=${()=>this._selectTab(t.id)}
          >
            <ha-icon icon=${t.icon}></ha-icon><span>${e(`tab.${t.id}`)}</span>
            ${Pn.includes(t.id)&&this._tabDirty(t.id)?k`<i class="dot" aria-hidden="true"></i>`:M}
          </button>`)}
      </nav>
      <main>${this._renderBody()}</main>
      ${Pn.includes(this._tab)&&this._draft?this._renderSaveBar():M}
    `}_renderBody(){let e=this._t;if(this._loadError&&!this._saved)return k`<div class="banner error">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <div>
          <strong>${e(`load_error`)}</strong>
          <span class="muted">${this._loadError}</span>
          <div style="margin-top:8px"><button @click=${this._retry}>${e(`retry`)}</button></div>
        </div>
      </div>`;if(!this._draft)return k`<div class="muted">${e(`loading`)}</div>`;let t=!this._isAdmin,n={hass:this.hass,config:this._draft,defaults:this._defaults??{},lang:this._lang,readonly:t},r=e=>{this._draft=e.detail.config,this._saveMsg?.ok&&(this._saveMsg=null)},i=t?k`<div class="banner info" style="margin-bottom:12px">${e(`not_admin`)}</div>`:M;switch(this._tab){case`overview`:return this._renderOverview();case`rooms`:return k`${i}<wr-rooms-editor
            .hass=${n.hass}
            .config=${n.config}
            .defaults=${n.defaults}
            .lang=${n.lang}
            .devices=${this._status?.devices??{}}
            ?readonly=${t}
            @config-changed=${r}
          ></wr-rooms-editor>`;case`schedule`:return k`${i}<wr-schedule-editor
            .hass=${n.hass}
            .config=${n.config}
            .defaults=${n.defaults}
            .lang=${n.lang}
            ?readonly=${t}
            @config-changed=${r}
          ></wr-schedule-editor>`;case`scenes`:return k`${i}<wr-scenes-editor
            .hass=${n.hass}
            .config=${n.config}
            .defaults=${n.defaults}
            .lang=${n.lang}
            ?readonly=${t}
            @config-changed=${r}
          ></wr-scenes-editor>`;case`house`:return k`${i}${this._renderModeSwitch()}<wr-house-editor
            .hass=${n.hass}
            .config=${n.config}
            .defaults=${n.defaults}
            .lang=${n.lang}
            ?readonly=${t}
            @config-changed=${r}
          ></wr-house-editor>`;case`log`:return this._renderLog()}}_ctx(){return{t:this._t,lang:this._lang,status:this._status,config:this._saved,isAdmin:this._isAdmin,busy:this._busy}}_renderOverview(){let e=this._t,t=this._ctx();return this._status?k`
      <div class="stack">
        ${Et(t,!0)}
        ${this._actionError?k`<div class="banner error" role="alert">
              <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
              <div style="flex:1">${this._actionError}</div>
              <button class="icon" aria-label=${e(`close`)} @click=${()=>this._actionError=null}><ha-icon icon="mdi:close"></ha-icon></button>
            </div>`:M}
        ${Ut(t)}
        <div class="card hero">
          <div class="hero-grid ${this._history?.length?``:`solo`}">
            <div class="hero-left">
              ${Ht(t)}
              <wr-controls
                .hass=${this.hass}
                .status=${this._status}
                .config=${this._saved}
                .lang=${this._lang}
                @wr-status=${e=>this._status=e.detail}
              ></wr-controls>
            </div>
            ${this._history?.length?k`<div class="hero-chart">
                  <h4>${e(`chart.title`)}</h4>
                  ${Lt(this._history,e,this._lang,{height:170})}
                </div>`:M}
          </div>
        </div>
        <div class="mid">
          ${Wt(t,()=>this._action(()=>Re(this.hass)))}
          ${qt(t)}
        </div>
        <h3 style="margin:4px 0 -6px">${e(`rooms.title`)}</h3>
        ${Yt(t)}
      </div>
    `:this._loadError?k`<div class="banner error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <div><strong>${e(`load_error`)}</strong> <span class="muted">${this._loadError}</span>
              <div style="margin-top:8px"><button @click=${this._retry}>${e(`retry`)}</button></div></div>
          </div>`:k`<div class="muted">${e(`loading`)}</div>`}_renderModeSwitch(){let e=this._t,t=this._status?.mode??`shadow`,n=!this._isAdmin||this._busy,r=e=>{e!==t&&(this._modeConfirm=e)};return k`<div class="card mode" style="margin-bottom:16px">
      <h3>${e(`mode.label`)}</h3>
      <div class="hint">${e(`house.mode_hint`)}</div>
      <div class="seg" role="radiogroup" aria-label=${e(`mode.label`)}>
        ${[`shadow`,`active`].map(i=>k`<button
            role="radio"
            aria-checked=${t===i}
            class="${t===i?`on ${i}`:``}"
            ?disabled=${n}
            title=${this._isAdmin?``:e(`not_admin`)}
            @click=${()=>r(i)}
          >
            <ha-icon icon=${i===`shadow`?`mdi:eye-outline`:`mdi:play-circle-outline`}></ha-icon>${e(`mode.${i}`)}
          </button>`)}
      </div>
      ${this._modeConfirm?k`<div class="confirm" role="alertdialog">
            ${this._modeConfirm===`active`?e(`mode.confirm_active`):e(`mode.confirm_shadow`)}
            <div class="row">
              <button class="primary" ?disabled=${this._busy} @click=${()=>this._changeMode(this._modeConfirm)}>
                ${this._modeConfirm===`active`?e(`mode.confirm_yes_active`):e(`mode.confirm_yes_shadow`)}
              </button>
              <button @click=${()=>this._modeConfirm=null}>${e(`cancel`)}</button>
            </div>
          </div>`:M}
    </div>`}_renderLog(){let e=this._t,t=rt(this._status?.log);return t.length?k`<div class="card">
      <h3>${e(`log.title`)}</h3>
      <ol class="log">
        ${t.map(t=>k`<li class=${t.shadow?`shadow`:``}>
            <span class="time">${G(t.time,this._status?.now,this._lang)}</span>
            <span class="text">${t.text}</span>
            ${t.shadow?k`<span class="badge warn" title=${e(`log.shadow_hint`)}>${e(`log.shadow`)}</span>`:M}
          </li>`)}
      </ol>
    </div>`:k`<div class="card muted">${e(`log.empty`)}</div>`}_renderSaveBar(){let e=this._t,t=this._dirty,n=this._draft?Ln(this._draft,this._defaults):0;return k`<div class="savebar ${t?`dirty`:``}" role="region" aria-live="polite">
      <div class="msg">
        ${this._saveMsg?.ok?k`<span class="ok">${this._saveMsg.text}</span>`:t?k`<strong>${e(`editor.unsaved`)}</strong>${n?k`<span class="error-text">${e(`editor.fix_errors`)}</span>`:M}${this._saveMsg&&!this._saveMsg.ok?k`<span class="error-text" role="alert">${this._saveMsg.text}</span>`:M}`:k`<span class="muted">${e(`editor.saved`)}</span>`}
      </div>
      <div class="row">
        <button ?disabled=${!t||this._saving} @click=${this._discard}><ha-icon icon="mdi:undo"></ha-icon>${e(`editor.discard`)}</button>
        <button class="primary" ?disabled=${!t||this._saving||n>0||!this._isAdmin} @click=${this._save}>
          <ha-icon icon="mdi:content-save"></ha-icon>${this._saving?e(`editor.saving`):e(`editor.save`)}
        </button>
      </div>
    </div>`}};Mn=Rn,Mn.properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},_tab:{state:!0},_saved:{state:!0},_draft:{state:!0},_defaults:{state:!0},_status:{state:!0},_loadError:{state:!0},_saving:{state:!0},_saveMsg:{state:!0},_busy:{state:!0},_actionError:{state:!0},_modeConfirm:{state:!0},_history:{state:!0}},Mn.styles=[X,It,Rt,Bt,Xt,o`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: var(--wr-bg);
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        height: var(--header-height, 56px);
        padding: 0 16px;
        background: var(--app-header-background-color, var(--wr-card));
        color: var(--app-header-text-color, var(--wr-text));
        border-bottom: 1px solid var(--wr-div);
      }
      .toolbar .title {
        font-size: 20px;
        font-weight: 400;
      }
      .toolbar .logo {
        color: var(--wr-heat);
      }
      .toolbar button.menu {
        color: inherit;
        margin-left: -8px;
      }
      .tabs {
        display: flex;
        gap: 2px;
        padding: 0 8px;
        overflow-x: auto;
        background: var(--wr-card);
        border-bottom: 1px solid var(--wr-div);
        scrollbar-width: thin;
      }
      .tab {
        border: 0;
        border-bottom: 3px solid transparent;
        border-radius: 0;
        padding: 10px 12px;
        white-space: nowrap;
        color: var(--wr-text2);
        position: relative;
      }
      .tab.active {
        color: var(--wr-heat);
        border-bottom-color: var(--wr-heat);
      }
      .tab .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--wr-warn);
        display: inline-block;
      }
      main {
        flex: 1;
        padding: 16px;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      }
      @media (max-width: 480px) {
        main {
          padding: 12px 8px;
        }
        .tab {
          padding: 10px 8px;
        }
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .hero-grid {
        display: grid;
        gap: 16px 24px;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
        align-items: center;
      }
      .hero-grid.solo {
        grid-template-columns: minmax(0, 560px);
      }
      .hero-left {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .hero-chart h4 {
        color: var(--wr-text2);
        font-weight: 500;
        margin-bottom: 4px;
      }
      .mid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
        align-items: start;
      }
      @media (max-width: 860px) {
        .hero-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .seg {
        display: flex;
        border: 1px solid var(--wr-div);
        border-radius: 20px;
        overflow: hidden;
      }
      .seg button {
        flex: 1;
        border: 0;
        border-radius: 0;
        justify-content: center;
      }
      .seg button.on.shadow {
        background: var(--wr-warn);
        color: #fff;
      }
      .seg button.on.active {
        background: var(--wr-ok);
        color: #fff;
      }
      .log {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .log li {
        display: flex;
        gap: 12px;
        align-items: baseline;
        padding: 6px 0;
        border-bottom: 1px solid var(--wr-div);
      }
      .log li:last-child {
        border-bottom: 0;
      }
      .log .time {
        flex: none;
        color: var(--wr-text2);
        font-variant-numeric: tabular-nums;
        min-width: 3.5em;
      }
      .log .text {
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .log li.shadow .text {
        color: var(--wr-text2);
        font-style: italic;
      }
      .savebar {
        position: sticky;
        bottom: 0;
        z-index: 4;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 16px;
        padding: 10px 16px;
        background: var(--wr-card);
        border-top: 1px solid var(--wr-div);
      }
      .savebar.dirty {
        border-top: 3px solid var(--wr-warn);
      }
      .savebar .msg {
        flex: 1;
        min-width: 180px;
        display: flex;
        flex-direction: column;
      }
      .savebar .ok {
        color: var(--wr-ok);
      }
    `],Pt(),customElements.get(`waermeregie-panel`)||customElements.define(`waermeregie-panel`,Rn);export{Rn as WaermeregiePanel,Ln as draftProblems};