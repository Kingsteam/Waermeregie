var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=/* @__PURE__ */ new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},oe=(e,t)=>!l(e,t),se={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:oe};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=/* @__PURE__ */ new WeakMap;var h=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=se){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??se}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=/* @__PURE__ */ new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=/* @__PURE__ */ new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=/* @__PURE__ */ new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=/* @__PURE__ */ new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?m:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?m:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??oe)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=/* @__PURE__ */ new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=/* @__PURE__ */ new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=/* @__PURE__ */ new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};h.elementStyles=[],h.shadowRootOptions={mode:`open`},h[p(`elementProperties`)]=/* @__PURE__ */ new Map,h[p(`finalized`)]=/* @__PURE__ */ new Map,ae?.({ReactiveElement:h}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var g=globalThis,ce=e=>e,_=g.trustedTypes,v=_?_.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,y=`$lit$`,b=`lit$${Math.random().toFixed(9).slice(2)}$`,le=`?`+b,ue=`<${le}>`,x=document,S=()=>x.createComment(``),C=e=>e===null||typeof e!=`object`&&typeof e!=`function`,w=Array.isArray,de=e=>w(e)||typeof e?.[Symbol.iterator]==`function`,T=`[ 	
\f\r]`,E=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fe=/-->/g,pe=/>/g,D=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),O=/'/g,me=/"/g,he=/^(?:script|style|textarea|title)$/i,k=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),A=Symbol.for(`lit-noChange`),j=Symbol.for(`lit-nothing`),ge=/* @__PURE__ */ new WeakMap,M=x.createTreeWalker(x,129);function _e(e,t){if(!w(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return v===void 0?t:v.createHTML(t)}var ve=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=E;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===E?c[1]===`!--`?o=fe:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=D):(he.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=D):o=pe:o===D?c[0]===`>`?(o=i??E,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?D:c[3]===`"`?me:O):o===me||o===O?o=D:o===fe||o===pe?o=E:(o=D,i=void 0);let d=o===D&&e[t+1].startsWith(`/>`)?` `:``;a+=o===E?n+ue:l>=0?(r.push(s),n.slice(0,l)+y+n.slice(l)+b+d):n+b+(l===-2?t:d)}return[_e(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},N=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=ve(t,n);if(this.el=e.createElement(l,r),M.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=M.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(y)){let t=u[o++],n=i.getAttribute(e).split(b),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?be:r[1]===`?`?xe:r[1]===`@`?Se:I}),i.removeAttribute(e)}else e.startsWith(b)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(he.test(i.tagName)){let e=i.textContent.split(b),t=e.length-1;if(t>0){i.textContent=_?_.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],S()),M.nextNode(),c.push({type:2,index:++a});i.append(e[t],S())}}}else if(i.nodeType===8){if(i.data===le)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(b,e+1))!==-1;)c.push({type:7,index:a}),e+=b.length-1}}a++}}static createElement(e,t){let n=x.createElement(`template`);return n.innerHTML=e,n}};function P(e,t,n=e,r){if(t===A)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=C(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=P(e,i._$AS(e,t.values),i,r)),t}var ye=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??x).importNode(t,!0);M.currentNode=r;let i=M.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new F(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Ce(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=M.nextNode(),a++)}return M.currentNode=x,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},F=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),C(e)?e===j||e==null||e===``?(this._$AH!==j&&this._$AR(),this._$AH=j):e!==this._$AH&&e!==A&&this._(e):e._$litType$===void 0?e.nodeType===void 0?de(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==j&&C(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=N.createElement(_e(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new ye(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=ge.get(e.strings);return t===void 0&&ge.set(e.strings,t=new N(e)),t}k(t){w(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(S()),this.O(S()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ce(e).nextSibling;ce(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},I=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=j,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(/* @__PURE__ */ new String),this.strings=n):this._$AH=j}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=P(this,e,t,0),a=!C(e)||e!==this._$AH&&e!==A,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=P(this,r[n+o],t,o),s===A&&(s=this._$AH[o]),a||=!C(s)||s!==this._$AH[o],s===j?e=j:e!==j&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},be=class extends I{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===j?void 0:e}},xe=class extends I{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==j)}},Se=class extends I{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??j)===A)return;let n=this._$AH,r=e===j&&n!==j||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==j&&(n===j||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ce=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}},we=g.litHtmlPolyfillSupport;we?.(N,F),(g.litHtmlVersions??=[]).push(`3.3.3`);var Te=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new F(t.insertBefore(S(),e),e,void 0,n??{})}return i._$AI(e),i},L=globalThis,R=class extends h{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Te(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};R._$litElement$=!0,R.finalized=!0,L.litElementHydrateSupport?.({LitElement:R});var Ee=L.litElementPolyfillSupport;Ee?.({LitElement:R}),(L.litElementVersions??=[]).push(`4.2.2`);var De=e=>e.callWS({type:`waermeregie/config`}),z=(e,t,n=180)=>e.callWS(t===null?{type:`waermeregie/override`,scene:null}:{type:`waermeregie/override`,scene:t,minutes:n}),B=(e,t)=>e.callWS({type:`waermeregie/pause`,minutes:t}),Oe=(e,t,n)=>e.callWS({type:`waermeregie/boost`,delta:t,minutes:n});function ke(e,t,n){let r=null,i=!1;return e.connection.subscribeMessage(t,{type:`waermeregie/subscribe`}).then(e=>{i?e():r=e}).catch(e=>n?.(e)),()=>{if(i=!0,r)try{Promise.resolve(r()).catch(()=>void 0)}catch{}r=null}}async function Ae(e,t){let n=t?.overrides,r=!n,i=null;return(r||n?.scene||t?.scene?.source===`override`)&&(i=await z(e,null)),(r||n?.pause_until)&&(i=await B(e,0)),(r||n?.boost)&&(i=await Oe(e,0,0)),i}var je={title:`Wärmeregie`,"tab.overview":`Übersicht`,"tab.rooms":`Räume`,"tab.schedule":`Tagesablauf`,"tab.scenes":`Szenen`,"tab.house":`Ofen & Haus`,"tab.log":`Protokoll`,menu:`Menü`,loading:`Wird geladen …`,load_error:`Die Daten von Wärmeregie konnten nicht geladen werden.`,retry:`Erneut versuchen`,not_admin:`Nur Administratoren können das ändern.`,error:`Fehler`,close:`Schließen`,cancel:`Abbrechen`,delete:`Löschen`,add:`Hinzufügen`,remove:`Entfernen`,none:`–`,id:`Kennung`,"mode.shadow_banner":`Schattenbetrieb: es wird nichts geschaltet`,"mode.shadow_banner_hint":`Wärmeregie rechnet nur mit und zeigt, was es tun würde. Ofen und Heizkörper bleiben unberührt.`,"mode.label":`Betriebsart`,"mode.shadow":`Schatten`,"mode.active":`Aktiv`,"mode.confirm_active":`Auf „Aktiv“ umschalten? Dann schaltet Wärmeregie den Ofen und stellt die Heizkörper selbst.`,"mode.confirm_shadow":`Auf „Schatten“ umschalten? Dann wird nichts mehr geschaltet, Wärmeregie rechnet nur noch mit.`,"mode.confirm_yes_active":`Ja, aktiv schalten`,"mode.confirm_yes_shadow":`Ja, nur noch mitrechnen`,"scene.title":`Szene`,"scene.auto":`Automatisch`,"scene.auto_hint":`nach Tagesablauf`,"scene.override_until":`von Hand bis {time}`,"scene.next_change":`nächster Wechsel {time}`,"scene.override_hint":`Eine Szene gilt nach dem Antippen für 3 Stunden.`,"day_type.today":`Heute: {name}`,"stove.title":`Ofen`,"stove.phase.idle":`Bereit`,"stove.phase.block":`Heizblock läuft`,"stove.phase.pause":`Pause`,"stove.phase.blocked":`Gesperrt`,"stove.action.start":`möchte starten`,"stove.action.stop":`möchte ausschalten`,"stove.action.keep":`keine Änderung`,"stove.burning":`brennt`,"stove.not_burning":`brennt nicht`,"stove.unavailable":`Ofen nicht erreichbar`,"stove.starts_today":`Starts heute`,"stove.pause_until":`Pause bis`,"stove.block_since":`Heizblock seit`,"stove.reason":`Grund`,"stove.chrono_warning":`Das Zeitprogramm (Chrono) des Ofens ist an. Im aktiven Betrieb schaltet Wärmeregie es aus; im Schattenbetrieb bitte selbst darauf achten.`,"stove.eco_warning":`Eco ist am Ofen eingeschaltet. Im aktiven Betrieb schaltet Wärmeregie es aus.`,"stove.error":`Der Ofen meldet eine Störung. Solange startet Wärmeregie ihn nicht.`,"stove.error_short":`Störung`,"stove.power_level":`Leistungsstufe`,"stove.water":`Wasser`,"stove.ignitions":`Zündungen`,"stove.no_status":`Noch kein Ofenstatus.`,"house.outdoor":`Außen`,"house.deficit":`Wärmebedarf`,"rooms.title":`Räume`,"room.current":`Ist`,"room.target":`Ziel`,"room.radiator":`Heizkörper`,"room.open":`offen`,"room.open_for":`offen seit {time}`,"room.occupied":`belegt`,"room.empty":`leer`,"room.sensors_missing":`{n} Fühler fehlen`,"room.sensor_missing":`1 Fühler fehlt`,"room.too_cold":`zu kalt`,"rooms.none":`Noch keine Räume eingerichtet.`,"alerts.title":`Hinweise`,"alerts.none":`Alles in Ordnung.`,"actions.title":`Schnellaktionen`,"actions.boost":`+1 °C für 1 Stunde`,"actions.boost_short":`+1 °C`,"actions.pause":`Ofen 2 Stunden pausieren`,"actions.pause_short":`Pause 2 h`,"actions.clear":`Aufheben`,"actions.clear_hint":`Hebt Szene von Hand, Pause und +1 °C auf.`,"actions.boost_active":`+{delta} °C aktiv`,"actions.pause_active":`Ofen pausiert bis {time}`,"actions.done":`Erledigt.`,"editor.unsaved":`Ungespeicherte Änderungen`,"editor.saved":`Alles gespeichert`,"editor.save":`Speichern`,"editor.saving":`Speichert …`,"editor.discard":`Verwerfen`,"editor.save_error":`Speichern fehlgeschlagen: {message}`,"editor.save_ok":`Gespeichert.`,"editor.fix_errors":`Bitte zuerst die rot markierten Angaben korrigieren.`,"editor.leave_warning":`Es gibt ungespeicherte Änderungen.`,"rooms.add_placeholder":`Name des neuen Raums, z. B. Wohnzimmer`,"rooms.add":`Raum hinzufügen`,"rooms.select":`Raum auswählen`,"room.name":`Name`,"room.importance":`Wichtigkeit`,"room.importance_hint":`Wichtige Räume zählen stärker, wenn entschieden wird, ob der Ofen startet.`,"importance.1":`niedrig`,"importance.2":`mittel`,"importance.3":`hoch`,"room.radiators":`Heizkörperthermostate`,"room.radiators_hint":`Thermostate in diesem Raum (z. B. Tado).`,"room.sensors":`Temperaturfühler`,"room.sensors_hint":`Wird kein Fühler gewählt, gilt die Temperatur der Thermostate. Das Gewicht bestimmt, wie stark ein Fühler zählt.`,"room.weight":`Gewicht`,"room.openings":`Fenster und Türen`,"room.openings_hint":`Ist etwas offen, wird hier nicht geheizt.`,"room.presence":`Anwesenheit`,"room.presence_hint":`Bewegungs- oder Anwesenheitsmelder. Optional.`,"room.targets":`Zieltemperaturen je Szene`,"room.targets_hint":`Leer lassen = Standardwert der Szene.`,"room.devices":`Geräte`,"room.devices_hint":`Pausierte Geräte bleiben eingetragen, werden aber nicht verwendet, z. B. wenn ein Melder offline ist.`,"room.recovering":`lüftet nach bis {time}`,"dev.pause":`Pausieren`,"dev.resume":`Wieder verwenden`,"dev.paused":`pausiert`,"dev.unavailable":`nicht verfügbar`,"dev.add":`Gerät hinzufügen`,"dev.open":`offen`,"dev.closed":`zu`,"dev.occupied":`belegt`,"dev.empty":`leer`,"dev.none":`keine`,"dev.unavail_count":`{n} Geräte nicht verfügbar`,"dev.unavail_one":`1 Gerät nicht verfügbar`,"dev.pause_unavail":`Nicht verfügbare pausieren`,"param.opening_recovery_min":`Nach dem Lüften warten`,"param.opening_recovery_min_hint":`So lange zählt ein gelüfteter Raum nach dem Schließen nicht für den Ofenstart. Die Luft wird von selbst schnell wieder warm. 0 = aus.`,"room.delete":`Raum löschen`,"room.delete_confirm":`Raum „{name}“ wirklich löschen? Das lässt sich nach dem Speichern nicht rückgängig machen.`,"schedule.day_types":`Tagesarten`,"schedule.day_types_hint":`Eine Tagesart legt fest, ab wann welche Szene gilt. Vor dem ersten Zeitpunkt gilt die letzte Szene des Vortags.`,"schedule.add_placeholder":`Name der neuen Tagesart, z. B. Homeoffice`,"schedule.add":`Tagesart hinzufügen`,"schedule.slot_from":`ab`,"schedule.add_slot":`Zeitpunkt hinzufügen`,"schedule.week":`Woche`,"schedule.week_hint":`Welche Tagesart gilt an welchem Tag?`,"schedule.delete_day_type":`Tagesart löschen`,"schedule.delete_confirm":`Tagesart „{name}“ wirklich löschen?`,"schedule.in_use":`Wird in der Woche verwendet ({days}). Bitte dort zuerst eine andere Tagesart wählen.`,"schedule.no_scenes":`Bitte zuerst unter „Szenen“ eine Szene anlegen.`,"slot.time_format":`Uhrzeit bitte als HH:MM angeben.`,"slot.not_ascending":`Die Zeiten müssen aufsteigend sein.`,"slot.scene_missing":`Bitte eine Szene wählen.`,"slot.scene_unknown":`Diese Szene gibt es nicht mehr.`,"slot.empty":`Mindestens ein Zeitpunkt ist nötig.`,"week.mon":`Montag`,"week.tue":`Dienstag`,"week.wed":`Mittwoch`,"week.thu":`Donnerstag`,"week.fri":`Freitag`,"week.sat":`Samstag`,"week.sun":`Sonntag`,"week.holiday":`Feiertag`,"week.unset":`– bitte wählen –`,"scenes.title":`Szenen`,"scenes.hint":`Eine Szene ist ein Wärmewunsch, z. B. Komfort oder Sparen.`,"scenes.add_placeholder":`Name der neuen Szene, z. B. Komfort`,"scenes.add":`Szene hinzufügen`,"scene.name":`Name`,"scene.icon":`Symbol`,"scene.icon_hint":`z. B. mdi:sofa`,"scene.stove":`Ofen`,"scene.stove.allow":`darf heizen`,"scene.stove.frost_only":`nur gegen Kälte (Frost/Nacht)`,"scene.stove.deny":`bleibt aus`,"scene.default_target":`Standardziel`,"scene.delete":`Szene löschen`,"scene.delete_confirm":`Szene „{name}“ wirklich löschen? Eigene Zieltemperaturen der Räume für diese Szene werden entfernt.`,"scene.in_use":`Wird im Tagesablauf verwendet ({names}). Bitte dort zuerst ersetzen.`,"scenes.matrix":`Zieltemperaturen Raum × Szene`,"scenes.matrix_hint":`Leere Felder verwenden das Standardziel der Szene.`,"scenes.none":`Noch keine Szenen.`,"house.stove":`Ofen`,"house.stove_climate":`Ofen-Thermostat`,"house.stove_climate_hint":`Pflicht. Die Thermostat-Entität des Pelletofens.`,"house.stove_climate_active_hint":`Ohne Ofen-Thermostat kann Wärmeregie nur im Schattenbetrieb laufen.`,"house.power":`Leistungsstufe`,"house.power_hint":`Optional. Auswahl- oder Zahl-Entität für die Stufe 1 bis 5.`,"house.stove_functions":`Ofen-Funktionen`,"house.stove_functions_hint":`Im aktiven Betrieb schaltet Wärmeregie das Zeitprogramm (Chrono) und Eco des Ofens aus und wählt die Leistungsstufe selbst. Im Schattenbetrieb gibt es nur Hinweise.`,"house.chrono_switch":`Zeitprogramm (Chrono)`,"house.chrono_switch_hint":`Optional. Schalter für das eigene Zeitprogramm des Ofens.`,"house.eco_switch":`Eco`,"house.eco_switch_hint":`Optional. Schalter für den Eco-Modus des Ofens.`,"house.error_sensor":`Störung`,"house.error_sensor_hint":`Optional. Meldet der Ofen eine Störung, wird er nicht gestartet.`,"house.water_sensor":`Wassertemperatur`,"house.water_sensor_hint":`Optional. Nur zur Anzeige.`,"house.ignitions_sensor":`Zündzähler`,"house.ignitions_sensor_hint":`Optional. Nur zur Anzeige.`,"house.environment":`Wetter und Kalender`,"house.weather":`Wetter`,"house.weather_hint":`Optional. Für die Vorhersage.`,"house.outdoor_sensor":`Außenfühler`,"house.outdoor_sensor_hint":`Optional. Genauer als die Wettervorhersage.`,"house.workday":`Arbeitstag`,"house.workday_hint":`Optional. Erkennt Feiertage (Integration „Arbeitstag“).`,"house.people":`Bewohner`,"house.persons":`Personen`,"house.persons_hint":`Ist niemand zu Hause, wird gespart.`,"house.pet":`Haustier`,"house.pet_hint":`Optional. Ist ein Tier zu Hause, wird nicht unter die Frostgrenze abgesenkt.`,"house.notify":`Benachrichtigungen`,"house.notify_hint":`Wohin sollen Hinweise geschickt werden?`,"house.notify_none":`Keine Benachrichtigungsdienste gefunden.`,"house.notify_unknown":`nicht mehr vorhanden`,"house.parameters":`Regelwerte`,"house.parameters_hint":`Die Voreinstellungen passen für die meisten Häuser. Nur ändern, wenn nötig.`,"house.out_of_range":`Erlaubt: {min} bis {max}`,"pgroup.stove":`Ofen starten und stoppen`,"pgroup.openings":`Fenster und Türen`,"pgroup.radiators":`Heizkörper`,"pgroup.limits":`Untergrenzen`,"pgroup.presence":`Anwesenheit`,"pgroup.pellets":`Pellets`,"param.pellet_bag_kg":`Gewicht eines Sacks`,"param.pellet_bag_kg_hint":`So viel zählt der Knopf „Sack Pellets nachgefüllt“ dazu.`,"param.pellet_capacity_kg":`Fassungsvermögen des Behälters`,"param.pellet_capacity_kg_hint":`Mehr passt nicht hinein; der Vorrat wird darauf begrenzt.`,"param.pellet_rate_kg_h":`Verbrauch pro Brennstunde (Startwert)`,"param.pellet_rate_kg_h_hint":`Gilt, bis die Wärmeregie aus einem leeren Behälter den echten Wert gelernt hat.`,"param.pellet_reminder_kg":`Erinnern ab Vorrat`,"param.pellet_reminder_kg_hint":`Fällt die Schätzung darunter, kommt eine Nachricht.`,"stove.pellets":`Pellets`,"stove.pellets_empty":`leer`,"pgroup.power":`Leistungsstufe`,"pgroup.other":`Weitere`,"param.start_below_k":`Start, wenn so viel unter Ziel`,"param.start_below_k_hint":`Der Ofen startet erst, wenn die Wohnräume so viel kälter als gewünscht sind.`,"param.stop_above_k":`Stopp, wenn so viel über Ziel`,"param.stop_above_k_hint":`Der Heizblock endet, wenn es so viel wärmer als gewünscht ist.`,"param.min_burn_min":`Kürzeste Brenndauer`,"param.min_burn_min_hint":`Ein Heizblock läuft mindestens so lange. Schont den Ofen.`,"param.max_burn_min":`Längste Brenndauer`,"param.max_burn_min_hint":`Danach wird ein Heizblock immer beendet.`,"param.min_pause_min":`Kürzeste Pause`,"param.min_pause_min_hint":`So lange bleibt der Ofen nach einem Heizblock mindestens aus.`,"param.max_starts_per_day":`Starts pro Tag höchstens`,"param.max_starts_per_day_hint":`Wenige lange Heizblöcke sind besser als häufiges An und Aus.`,"param.opening_grace_min":`Kurz lüften erlaubt`,"param.opening_grace_min_hint":`So lange darf ein Fenster offen sein, ohne dass etwas passiert.`,"param.opening_stop_min":`Ofen stoppt bei offenem Fenster nach`,"param.opening_stop_min_hint":`Bleibt ein Fenster länger offen, wird der Heizblock beendet.`,"param.opening_empty_room_min":`Leerer Raum: Heizkörper zu nach`,"param.opening_empty_room_min_hint":`In einem leeren Raum mit offenem Fenster wird der Heizkörper schon so früh abgedreht.`,"param.radiator_boost_k":`Heizkörper-Vorlauf`,"param.radiator_boost_k_hint":`Während der Ofen brennt, werden die Heizkörper so viel höher gestellt.`,"param.frost_c":`Frostgrenze`,"param.frost_c_hint":`Kälter darf es nie werden. Gilt auch bei Szenen, in denen der Ofen sonst aus bleibt.`,"param.night_floor_c":`Nachtuntergrenze`,"param.night_floor_c_hint":`Nachts wird mindestens auf diese Temperatur geheizt.`,"param.stove_block_setpoint_c":`Ofen-Sollwert im Heizblock`,"param.stove_block_setpoint_c_hint":`Auf diesen Wert wird das Ofen-Thermostat gestellt, damit er sicher durchbrennt.`,"param.presence_empty_min":`Raum gilt als leer nach`,"param.presence_empty_min_hint":`So lange ohne Bewegung, dann gilt ein Raum als leer.`,"param.power_min":`Kleinste Leistungsstufe`,"param.power_min_hint":`Mit dieser Stufe läuft ein Heizblock bei mildem Wetter (1 bis 5).`,"param.power_max":`Größte Leistungsstufe`,"param.power_max_hint":`Höchste Stufe, die Wärmeregie wählt (1 bis 5).`,"param.power_cold_c":`Volle Leistung unter`,"param.power_cold_c_hint":`Ist es draußen kälter, wird die größte Leistungsstufe gewählt.`,"log.title":`Protokoll`,"log.empty":`Noch keine Einträge.`,"log.shadow":`Schatten`,"log.shadow_hint":`Nur berechnet, nicht geschaltet`,"picker.search":`Suchen …`,"picker.no_results":`Keine passenden Entitäten.`,"picker.show_all":`auch andere Arten anzeigen`,"picker.missing":`nicht gefunden`,"picker.more":`Weitere Treffer – bitte genauer suchen.`,"card.name":`Wärmeregie`,"card.description":`Ofen, Szene und Räume auf einen Blick.`,"card.no_rooms":`Keine Räume ausgewählt.`,"card.open_panel":`Wärmeregie öffnen`},Me={title:`Wärmeregie`,"tab.overview":`Overview`,"tab.rooms":`Rooms`,"tab.schedule":`Schedule`,"tab.scenes":`Scenes`,"tab.house":`Stove & house`,"tab.log":`Log`,menu:`Menu`,loading:`Loading …`,load_error:`Could not load Wärmeregie data.`,retry:`Try again`,not_admin:`Only administrators can change this.`,error:`Error`,close:`Close`,cancel:`Cancel`,delete:`Delete`,add:`Add`,remove:`Remove`,none:`–`,id:`ID`,"mode.shadow_banner":`Shadow mode: nothing is being switched`,"mode.shadow_banner_hint":`Wärmeregie only calculates and shows what it would do. Stove and radiators are left alone.`,"mode.label":`Mode`,"mode.shadow":`Shadow`,"mode.active":`Active`,"mode.confirm_active":`Switch to “Active”? Wärmeregie will then control the stove and set the radiators.`,"mode.confirm_shadow":`Switch to “Shadow”? Nothing will be switched any more, Wärmeregie only calculates.`,"mode.confirm_yes_active":`Yes, go active`,"mode.confirm_yes_shadow":`Yes, only calculate`,"scene.title":`Scene`,"scene.auto":`Automatic`,"scene.auto_hint":`by schedule`,"scene.override_until":`manual until {time}`,"scene.next_change":`next change {time}`,"scene.override_hint":`A tapped scene applies for 3 hours.`,"day_type.today":`Today: {name}`,"stove.title":`Stove`,"stove.phase.idle":`Ready`,"stove.phase.block":`Heating block running`,"stove.phase.pause":`Pause`,"stove.phase.blocked":`Blocked`,"stove.action.start":`wants to start`,"stove.action.stop":`wants to stop`,"stove.action.keep":`no change`,"stove.burning":`burning`,"stove.not_burning":`not burning`,"stove.unavailable":`Stove not reachable`,"stove.starts_today":`Starts today`,"stove.pause_until":`Pause until`,"stove.block_since":`Block since`,"stove.reason":`Reason`,"stove.chrono_warning":`The stove's own timer (chrono) is on. In active mode Wärmeregie switches it off; in shadow mode please keep an eye on it yourself.`,"stove.eco_warning":`Eco is switched on at the stove. In active mode Wärmeregie switches it off.`,"stove.error":`The stove reports a fault. Wärmeregie will not start it until it is cleared.`,"stove.error_short":`Fault`,"stove.power_level":`Power level`,"stove.water":`Water`,"stove.ignitions":`Ignitions`,"stove.no_status":`No stove status yet.`,"house.outdoor":`Outdoor`,"house.deficit":`Heat demand`,"rooms.title":`Rooms`,"room.current":`Now`,"room.target":`Target`,"room.radiator":`Radiator`,"room.open":`open`,"room.open_for":`open for {time}`,"room.occupied":`occupied`,"room.empty":`empty`,"room.sensors_missing":`{n} sensors missing`,"room.sensor_missing":`1 sensor missing`,"room.too_cold":`too cold`,"rooms.none":`No rooms set up yet.`,"alerts.title":`Notices`,"alerts.none":`All fine.`,"actions.title":`Quick actions`,"actions.boost":`+1 °C for 1 hour`,"actions.boost_short":`+1 °C`,"actions.pause":`Pause stove for 2 hours`,"actions.pause_short":`Pause 2 h`,"actions.clear":`Cancel`,"actions.clear_hint":`Cancels manual scene, pause and +1 °C.`,"actions.boost_active":`+{delta} °C active`,"actions.pause_active":`Stove paused until {time}`,"actions.done":`Done.`,"editor.unsaved":`Unsaved changes`,"editor.saved":`All saved`,"editor.save":`Save`,"editor.saving":`Saving …`,"editor.discard":`Discard`,"editor.save_error":`Saving failed: {message}`,"editor.save_ok":`Saved.`,"editor.fix_errors":`Please fix the entries marked in red first.`,"editor.leave_warning":`There are unsaved changes.`,"rooms.add_placeholder":`Name of the new room, e.g. Living room`,"rooms.add":`Add room`,"rooms.select":`Select room`,"room.name":`Name`,"room.importance":`Importance`,"room.importance_hint":`Important rooms count more when deciding whether the stove starts.`,"importance.1":`low`,"importance.2":`medium`,"importance.3":`high`,"room.radiators":`Radiator thermostats`,"room.radiators_hint":`Thermostats in this room (e.g. Tado).`,"room.sensors":`Temperature sensors`,"room.sensors_hint":`Without a sensor the thermostat temperature is used. The weight sets how much a sensor counts.`,"room.weight":`Weight`,"room.openings":`Windows and doors`,"room.openings_hint":`While something is open, this room is not heated.`,"room.presence":`Presence`,"room.presence_hint":`Motion or presence sensors. Optional.`,"room.targets":`Target temperature per scene`,"room.targets_hint":`Leave empty = scene default.`,"room.devices":`Devices`,"room.devices_hint":`Paused devices stay configured but are not used, e.g. while a sensor is offline.`,"room.recovering":`recovering from airing until {time}`,"dev.pause":`Pause`,"dev.resume":`Use again`,"dev.paused":`paused`,"dev.unavailable":`unavailable`,"dev.add":`Add device`,"dev.open":`open`,"dev.closed":`closed`,"dev.occupied":`occupied`,"dev.empty":`empty`,"dev.none":`none`,"dev.unavail_count":`{n} devices unavailable`,"dev.unavail_one":`1 device unavailable`,"dev.pause_unavail":`Pause unavailable ones`,"param.opening_recovery_min":`Wait after airing`,"param.opening_recovery_min_hint":`For this long after closing, an aired room does not count for starting the stove. The air warms up again quickly by itself. 0 = off.`,"room.delete":`Delete room`,"room.delete_confirm":`Really delete room “{name}”? This cannot be undone after saving.`,"schedule.day_types":`Day types`,"schedule.day_types_hint":`A day type sets from when which scene applies. Before the first time, the last scene of the previous day applies.`,"schedule.add_placeholder":`Name of the new day type, e.g. Home office`,"schedule.add":`Add day type`,"schedule.slot_from":`from`,"schedule.add_slot":`Add time`,"schedule.week":`Week`,"schedule.week_hint":`Which day type applies on which day?`,"schedule.delete_day_type":`Delete day type`,"schedule.delete_confirm":`Really delete day type “{name}”?`,"schedule.in_use":`Used in the week ({days}). Please choose another day type there first.`,"schedule.no_scenes":`Please create a scene under “Scenes” first.`,"slot.time_format":`Please enter the time as HH:MM.`,"slot.not_ascending":`Times must be in ascending order.`,"slot.scene_missing":`Please choose a scene.`,"slot.scene_unknown":`This scene no longer exists.`,"slot.empty":`At least one time is required.`,"week.mon":`Monday`,"week.tue":`Tuesday`,"week.wed":`Wednesday`,"week.thu":`Thursday`,"week.fri":`Friday`,"week.sat":`Saturday`,"week.sun":`Sunday`,"week.holiday":`Holiday`,"week.unset":`– please choose –`,"scenes.title":`Scenes`,"scenes.hint":`A scene is a heat wish, e.g. comfort or eco.`,"scenes.add_placeholder":`Name of the new scene, e.g. Comfort`,"scenes.add":`Add scene`,"scene.name":`Name`,"scene.icon":`Icon`,"scene.icon_hint":`e.g. mdi:sofa`,"scene.stove":`Stove`,"scene.stove.allow":`may heat`,"scene.stove.frost_only":`only against cold (frost/night)`,"scene.stove.deny":`stays off`,"scene.default_target":`Default target`,"scene.delete":`Delete scene`,"scene.delete_confirm":`Really delete scene “{name}”? Room targets for this scene will be removed.`,"scene.in_use":`Used in the schedule ({names}). Please replace it there first.`,"scenes.matrix":`Target temperatures room × scene`,"scenes.matrix_hint":`Empty fields use the scene default.`,"scenes.none":`No scenes yet.`,"house.stove":`Stove`,"house.stove_climate":`Stove thermostat`,"house.stove_climate_hint":`Required. The thermostat entity of the pellet stove.`,"house.stove_climate_active_hint":`Without a stove thermostat Wärmeregie can only run in shadow mode.`,"house.power":`Power level`,"house.power_hint":`Optional. Select or number entity for level 1 to 5.`,"house.stove_functions":`Stove functions`,"house.stove_functions_hint":`In active mode Wärmeregie switches off the stove's own timer (chrono) and eco mode and chooses the power level itself. In shadow mode there are only notices.`,"house.chrono_switch":`Timer (chrono)`,"house.chrono_switch_hint":`Optional. Switch for the stove's own timer.`,"house.eco_switch":`Eco`,"house.eco_switch_hint":`Optional. Switch for the stove's eco mode.`,"house.error_sensor":`Fault`,"house.error_sensor_hint":`Optional. While the stove reports a fault, it is not started.`,"house.water_sensor":`Water temperature`,"house.water_sensor_hint":`Optional. Display only.`,"house.ignitions_sensor":`Ignition counter`,"house.ignitions_sensor_hint":`Optional. Display only.`,"house.environment":`Weather and calendar`,"house.weather":`Weather`,"house.weather_hint":`Optional. Used for the forecast.`,"house.outdoor_sensor":`Outdoor sensor`,"house.outdoor_sensor_hint":`Optional. More precise than the weather forecast.`,"house.workday":`Workday`,"house.workday_hint":`Optional. Detects holidays (“Workday” integration).`,"house.people":`Residents`,"house.persons":`Persons`,"house.persons_hint":`If nobody is home, energy is saved.`,"house.pet":`Pet`,"house.pet_hint":`Optional. If a pet is home, temperature is never lowered below the frost limit.`,"house.notify":`Notifications`,"house.notify_hint":`Where should notices be sent?`,"house.notify_none":`No notification services found.`,"house.notify_unknown":`no longer available`,"house.parameters":`Control values`,"house.parameters_hint":`The defaults suit most houses. Only change them if needed.`,"house.out_of_range":`Allowed: {min} to {max}`,"pgroup.stove":`Starting and stopping the stove`,"pgroup.openings":`Windows and doors`,"pgroup.radiators":`Radiators`,"pgroup.limits":`Lower limits`,"pgroup.presence":`Presence`,"pgroup.pellets":`Pellets`,"param.pellet_bag_kg":`Weight of one bag`,"param.pellet_bag_kg_hint":`The button “Pellet bag refilled” adds this much.`,"param.pellet_capacity_kg":`Hopper capacity`,"param.pellet_capacity_kg_hint":`No more fits in; the stock is capped at this.`,"param.pellet_rate_kg_h":`Consumption per burn hour (start value)`,"param.pellet_rate_kg_h_hint":`Used until the real value is learned from an empty hopper.`,"param.pellet_reminder_kg":`Remind below`,"param.pellet_reminder_kg_hint":`When the estimate drops below this, a message is sent.`,"stove.pellets":`Pellets`,"stove.pellets_empty":`empty`,"pgroup.power":`Power level`,"pgroup.other":`Other`,"param.start_below_k":`Start when this far below target`,"param.start_below_k_hint":`The stove only starts when the living rooms are this much colder than wanted.`,"param.stop_above_k":`Stop when this far above target`,"param.stop_above_k_hint":`The heating block ends when it is this much warmer than wanted.`,"param.min_burn_min":`Shortest burn time`,"param.min_burn_min_hint":`A heating block runs at least this long. Easier on the stove.`,"param.max_burn_min":`Longest burn time`,"param.max_burn_min_hint":`After this a heating block always ends.`,"param.min_pause_min":`Shortest pause`,"param.min_pause_min_hint":`The stove stays off at least this long after a heating block.`,"param.max_starts_per_day":`Max starts per day`,"param.max_starts_per_day_hint":`A few long heating blocks are better than frequent on and off.`,"param.opening_grace_min":`Short airing allowed`,"param.opening_grace_min_hint":`A window may be open this long without anything happening.`,"param.opening_stop_min":`Stove stops with open window after`,"param.opening_stop_min_hint":`If a window stays open longer, the heating block ends.`,"param.opening_empty_room_min":`Empty room: radiator off after`,"param.opening_empty_room_min_hint":`In an empty room with an open window the radiator is turned down this early.`,"param.radiator_boost_k":`Radiator lead`,"param.radiator_boost_k_hint":`While the stove burns, radiators are set this much higher.`,"param.frost_c":`Frost limit`,"param.frost_c_hint":`It never gets colder than this, even in scenes where the stove otherwise stays off.`,"param.night_floor_c":`Night minimum`,"param.night_floor_c_hint":`At night it is heated to at least this temperature.`,"param.stove_block_setpoint_c":`Stove setpoint during block`,"param.stove_block_setpoint_c_hint":`The stove thermostat is set to this value so it keeps burning.`,"param.presence_empty_min":`Room counts as empty after`,"param.presence_empty_min_hint":`After this long without motion a room counts as empty.`,"param.power_min":`Lowest power level`,"param.power_min_hint":`A heating block runs at this level in mild weather (1 to 5).`,"param.power_max":`Highest power level`,"param.power_max_hint":`Highest level Wärmeregie will choose (1 to 5).`,"param.power_cold_c":`Full power below`,"param.power_cold_c_hint":`If it is colder outside, the highest power level is chosen.`,"log.title":`Log`,"log.empty":`No entries yet.`,"log.shadow":`Shadow`,"log.shadow_hint":`Only calculated, not switched`,"picker.search":`Search …`,"picker.no_results":`No matching entities.`,"picker.show_all":`also show other kinds`,"picker.missing":`not found`,"picker.more":`More results – please refine your search.`,"card.name":`Wärmeregie`,"card.description":`Stove, scene and rooms at a glance.`,"card.no_rooms":`No rooms selected.`,"card.open_panel":`Open Wärmeregie`};function Ne(e,t,n){let r=(e===`en`?Me[t]:void 0)??je[t]??t;if(n)for(let[e,t]of Object.entries(n))r=r.split(`{${e}}`).join(String(t));return r}function Pe(e){return(t,n)=>Ne(e,t,n)}var Fe=o`
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
`,V=1440,Ie=/^([01]\d|2[0-3]):([0-5]\d)$/;function H(e){let t=Ie.exec(String(e??``).trim());return t?Number(t[1])*60+Number(t[2]):null}function U(e){let t=(Math.floor(e)%V+V)%V;return`${String(Math.floor(t/60)).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function W(e){return(e??[]).map(e=>({start:H(e.start),scene:e.scene})).filter(e=>e.start!==null&&!!e.scene).sort((e,t)=>e.start-t.start)}function Le(e,t,n){let r=typeof t==`number`?t:H(t);if(r===null)return null;let i=W(e),a=null;for(let e of i)if(e.start<=r)a=e.scene;else break;if(a!==null)return a;let o=W(n??e);return o.length?o[o.length-1].scene:null}function Re(e,t){let n=W(e);if(!n.length)return[];let r=[];if(n[0].start>0){let i=Le(e,0,t);i&&r.push({from:0,to:n[0].start,scene:i})}return n.forEach((e,t)=>{let i=t+1<n.length?n[t+1].start:V;i>e.start&&r.push({from:e.start,to:i,scene:e.scene})}),r.reduce((e,t)=>{let n=e[e.length-1];return n&&n.scene===t.scene&&n.to===t.from?n.to=t.to:e.push({...t}),e},[])}function ze(e){return e.startsWith(`de`)?`,`:`.`}function Be(e,t,n=1){if(e==null||!Number.isFinite(e))return`–`;let r=e.toFixed(n);return ze(t)===`,`?r.replace(`.`,`,`):r}function G(e,t){let n=Be(e,t,1);return n===`–`?n:`${n} °C`}function Ve(e,t,n=!1){let r=Be(e,t,1);return r===`–`?r:`${n&&e>0?`+`:``}${r} K`}function He(e){if(e==null||!Number.isFinite(e))return`–`;let t=Math.max(0,Math.round(e));if(t<60)return`${t} min`;let n=Math.floor(t/60),r=t%60;return r?`${n} h ${r} min`:`${n} h`}var K=/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;function q(e){if(!e)return`–`;let t=K.exec(e);if(t)return`${t[4]}:${t[5]}`;let n=H(e);return n===null?`–`:U(n)}function Ue(e,t){let n=e?K.exec(e):null;return n?t.startsWith(`de`)?`${n[3]}.${n[2]}.`:`${n[2]}/${n[3]}`:``}function J(e){let t=e?K.exec(e):null;return t?`${t[1]}-${t[2]}-${t[3]}`:null}function We(e){let t=e?K.exec(e):null;return t?Number(t[4])*60+Number(t[5]):null}function Y(e,t,n){let r=q(e);if(r===`–`)return r;let i=J(e);if(i&&t&&i===J(t))return r;let a=Ue(e,n);return a?`${a} ${r}`:r}function Ge(e){let t=String(e??`de`).toLowerCase();return t.startsWith(`de`)||t===``?`de`:`en`}var Ke=[`#e8590c`,`#1c7ed6`,`#2f9e44`,`#7048e8`,`#0c8599`,`#f08c00`,`#c2255c`,`#5c940d`,`#868e96`];function qe(e,t){let n=t.indexOf(e);return n<0?`#868e96`:Ke[n%Ke.length]}function Je(e){let t=e??{};return{...t,stove:{...t.stove??{},climate:t.stove?.climate??null,power:t.stove?.power??null,chrono_switch:t.stove?.chrono_switch??null,eco_switch:t.stove?.eco_switch??null,error_sensor:t.stove?.error_sensor??null,water_sensor:t.stove?.water_sensor??null,ignitions_sensor:t.stove?.ignitions_sensor??null},weather:t.weather??null,outdoor_sensor:t.outdoor_sensor??null,workday:t.workday??null,persons:t.persons??[],pet:t.pet??null,notify:t.notify??[],rooms:(t.rooms??[]).map(e=>({...e,importance:e.importance??2,radiators:e.radiators??[],temperature_sensors:e.temperature_sensors??[],openings:e.openings??[],presence:e.presence??[],paused:e.paused??[],targets:e.targets??{}})),scenes:t.scenes??[],day_types:(t.day_types??[]).map(e=>({...e,slots:e.slots??[]})),week:t.week??{},parameters:t.parameters??{},mode:t.mode??`shadow`}}function X(e){if(!e)return``;if(typeof e==`string`)return e;if(typeof e==`object`){let t=e;if(typeof t.message==`string`&&t.message)return t.message;if(t.error&&typeof t.error.message==`string`)return t.error.message;if(typeof t.code==`string`)return t.code}return String(e)}function Ye(e,t,n={}){let r=t.map(e=>e.id),i=e=>t.find(t=>t.id===e)?.name??e,a=Re(e),o=[...new Set(a.map(e=>e.scene))],s=e=>`${e/V*100}%`;return k`
    <div class="timeline" role="img" aria-label=${a.map(e=>`${U(e.from)} ${i(e.scene)}`).join(`, `)}>
      ${a.map(e=>k`<div
          class="seg"
          style="left:${s(e.from)};width:${s(e.to-e.from)};background:${qe(e.scene,r)}"
          title="${U(e.from)}–${e.to>=1440?`24:00`:U(e.to)} ${i(e.scene)}"
        >
          ${n.labels!==!1&&e.to-e.from>=150?k`<span>${i(e.scene)}</span>`:j}
        </div>`)}
      ${n.nowMinutes!==null&&n.nowMinutes!==void 0?k`<div class="now" style="left:calc(${s(n.nowMinutes)} - 1px)"></div>`:j}
    </div>
    <div class="timeline-scale" aria-hidden="true"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
    ${n.legend?k`<div class="legend">
          ${o.map(e=>k`<span><i style="background:${qe(e,r)}"></i>${i(e)}</span>`)}
        </div>`:j}
  `}function Xe(e,t=!1){return e.status?.mode===`shadow`?k`<div class="banner shadow" role="status">
    <ha-icon icon="mdi:eye-outline"></ha-icon>
    <div>
      <strong>${e.t(`mode.shadow_banner`)}</strong>
      ${t?j:k`<span class="muted">${e.t(`mode.shadow_banner_hint`)}</span>`}
    </div>
  </div>`:j}function Ze(e,t){let{t:n,status:r,config:i}=e,a=i?.scenes??[],o=r?.scene,s=o?.source===`override`,c=!e.isAdmin||e.busy,l=e.isAdmin?``:n(`not_admin`);return k`
    <div class="chips" role="group" aria-label=${n(`scene.title`)}>
      <button
        class="chip auto ${s?``:`selected`}"
        aria-pressed=${!s}
        ?disabled=${c}
        title=${l||n(`scene.auto_hint`)}
        @click=${()=>s&&t(null)}
      >
        <ha-icon icon="mdi:calendar-clock"></ha-icon>${n(`scene.auto`)}
      </button>
      ${a.map(e=>{let n=o?.id===e.id;return k`<button
          class="chip ${n?`selected`:``}"
          aria-pressed=${n}
          ?disabled=${c}
          title=${l}
          @click=${()=>!(n&&s)&&t(e.id)}
        >
          ${e.icon?k`<ha-icon icon=${e.icon}></ha-icon>`:j}${e.name}
        </button>`})}
    </div>
    ${o?k`<div class="hint">
          ${o.name}
          ${s&&o.until?k` · ${n(`scene.override_until`,{time:q(o.until)})}`:j}
          ${s?j:k` · ${n(`scene.auto_hint`)}`}
          ${o.next_change&&!s?k` · ${n(`scene.next_change`,{time:q(o.next_change)})}`:j}
          ${r?.day_type?k` · ${n(`day_type.today`,{name:r.day_type.name})}`:j}
        </div>`:j}
  `}function Qe(e,t={}){let{t:n,status:r,lang:i}=e,a=r?.stove;if(!a)return k`<div class="card stove"><h3>${n(`stove.title`)}</h3><div class="muted">${n(`stove.no_status`)}</div></div>`;let o=a.phase===`block`?`mdi:fire`:a.phase===`pause`?`mdi:pause-circle-outline`:a.phase===`blocked`?`mdi:fire-off`:`mdi:fireplace-off`,s=r?.day_type?e.config?.day_types.find(e=>e.id===r.day_type?.id):void 0;return k`<div class="card stove ${a.burning?`burning`:``}">
    <div class="row">
      <ha-icon class="flame" icon=${a.burning?`mdi:fire`:o}></ha-icon>
      <h3 style="margin:0">${n(`stove.title`)}</h3>
      <span class="spacer"></span>
      ${a.available?j:k`<span class="badge warn">${n(`stove.unavailable`)}</span>`}
      ${a.error?k`<span class="badge err">${n(`stove.error_short`)}</span>`:j}
      <span class="badge ${a.burning?`heat`:``}">${a.burning?n(`stove.burning`):n(`stove.not_burning`)}</span>
    </div>
    <div class="phase" style="margin-top:6px">
      ${n(`stove.phase.${a.phase}`)}
      <span class="muted" style="font-size:14px"> · ${n(`stove.action.${a.action}`)}</span>
    </div>
    ${a.reason?k`<div class="muted">${a.reason}</div>`:j}
    <dl class="kv">
      <dt>${n(`stove.starts_today`)}</dt>
      <dd>${a.starts_today??0} / ${a.max_starts_per_day??`–`}</dd>
      ${a.block_start?k`<dt>${n(`stove.block_since`)}</dt><dd>${q(a.block_start)}</dd>`:j}
      ${a.power_level!==null&&a.power_level!==void 0?k`<dt>${n(`stove.power_level`)}</dt><dd>${a.power_level} / 5</dd>`:j}
      ${a.water_c!==null&&a.water_c!==void 0?k`<dt>${n(`stove.water`)}</dt><dd>${G(a.water_c,i)}</dd>`:j}
      ${!t.compact&&a.ignitions!==null&&a.ignitions!==void 0?k`<dt>${n(`stove.ignitions`)}</dt><dd>${a.ignitions.toLocaleString(i.startsWith(`de`)?`de-DE`:`en-US`)}</dd>`:j}
      ${a.pause_until?k`<dt>${n(`stove.pause_until`)}</dt><dd>${Y(a.pause_until,r?.now,i)}</dd>`:j}
      ${r?.pellets&&r.pellets.stock_kg!==null&&r.pellets.stock_kg!==void 0?k`<dt>${n(`stove.pellets`)}</dt><dd>${r.pellets.stock_kg.toLocaleString(i.startsWith(`de`)?`de-DE`:`en-US`,{maximumFractionDigits:1})} kg${r.pellets.empty_at?k` · ${n(`stove.pellets_empty`)} ${Y(r.pellets.empty_at,r.now,i)}`:j}</dd>`:j}
      ${!t.compact&&r?.house?.outdoor_c!==null&&r?.house?.outdoor_c!==void 0?k`<dt>${n(`house.outdoor`)}</dt><dd>${G(r.house.outdoor_c,i)}</dd>`:j}
      ${!t.compact&&r?.house?.deficit_k!==null&&r?.house?.deficit_k!==void 0?k`<dt>${n(`house.deficit`)}</dt><dd>${Ve(r.house.deficit_k,i)}</dd>`:j}
    </dl>
    ${t.timeline&&s&&e.config?k`<div style="margin-top:10px">
          <div class="hint">${s.name}</div>
          ${Ye(s.slots,e.config.scenes,{nowMinutes:We(r?.now),labels:!1,legend:!0})}
        </div>`:j}
  </div>`}function $e(e){if(e.temperature===null||e.temperature===void 0||e.target===null||e.target===void 0)return``;let t=e.target-e.temperature;return t>.3?`cold`:t<-.5?`warm`:`ok`}function et(e,t){let{t:n,lang:r}=e,i=$e(t),a=t.sensors_missing??0;return k`<div class="card room ${i}">
    <div class="row">
      <span class="name">${t.name}</span>
      <span class="spacer"></span>
      ${t.occupied===!0?k`<ha-icon icon="mdi:account" title=${n(`room.occupied`)}></ha-icon>`:j}
    </div>
    <div class="row" style="align-items:baseline">
      <span class="temp">${G(t.temperature,r)}</span>
      <span class="muted">${n(`room.target`)} ${G(t.target,r)}</span>
    </div>
    <div class="row" style="margin-top:4px">
      ${t.radiator_setpoint!==null&&t.radiator_setpoint!==void 0?k`<span class="badge" title=${n(`room.radiator`)}><ha-icon icon="mdi:radiator" style="--mdc-icon-size:14px"></ha-icon>${G(t.radiator_setpoint,r)}</span>`:j}
      ${t.open?k`<span class="badge cold"><ha-icon icon="mdi:window-open-variant" style="--mdc-icon-size:14px"></ha-icon>${t.open_minutes?n(`room.open_for`,{time:He(t.open_minutes)}):n(`room.open`)}</span>`:j}
      ${t.recover_until&&!t.open?k`<span class="badge"><ha-icon icon="mdi:weather-windy" style="--mdc-icon-size:14px"></ha-icon>${n(`room.recovering`,{time:q(t.recover_until)})}</span>`:j}
      ${t.occupied===!0?k`<span class="badge">${n(`room.occupied`)}</span>`:j}
      ${i===`cold`?k`<span class="badge cold">${n(`room.too_cold`)}</span>`:j}
      ${a>0?k`<span class="badge warn">${a===1?n(`room.sensor_missing`):n(`room.sensors_missing`,{n:a})}</span>`:j}
    </div>
  </div>`}function tt(e,t){let n=e.status?.rooms??[];return t?.length&&(n=t.map(e=>n.find(t=>t.id===e)).filter(e=>!!e)),n.length?k`<div class="grid">${n.map(t=>et(e,t))}</div>`:k`<div class="muted">${t?.length?e.t(`card.no_rooms`):e.t(`rooms.none`)}</div>`}function nt(e){switch(e.kind){case`opening`:return`mdi:window-open-variant`;case`sensor`:case`sensors_missing`:return`mdi:thermometer-off`;case`stove`:return`mdi:fireplace-off`;case`chrono`:case`chrono_warning`:return`mdi:timer-alert-outline`;case`eco`:case`eco_warning`:return`mdi:leaf`;case`error`:case`stove_error`:return`mdi:alert-octagon`;default:return`mdi:alert-circle-outline`}}function rt(e,t){let n=[...e?.alerts??[]],r=e?.stove,i=(...e)=>n.some(t=>e.includes(t.kind));return r?.error&&!i(`error`,`stove_error`)&&n.unshift({kind:`stove_error`,message:t(`stove.error`)}),r?.chrono_warning&&!i(`chrono`,`chrono_warning`)&&n.push({kind:`chrono`,message:t(`stove.chrono_warning`)}),r?.eco_warning&&!i(`eco`,`eco_warning`)&&n.push({kind:`eco`,message:t(`stove.eco_warning`)}),n}function it(e,t={}){let n=rt(e.status,e.t);return n.length?k`<div role="list">
    ${n.map(e=>k`<div class="alert ${e.kind}" role="listitem"><ha-icon icon=${nt(e)}></ha-icon><span>${e.message}</span></div>`)}
  </div>`:t.showEmpty?k`<div class="muted">${e.t(`alerts.none`)}</div>`:j}function at(e){let t=e?.overrides;return t&&!!(t.scene||t.pause_until||t.boost)||e?.scene?.source===`override`}function ot(e){let t=e?.overrides?.boost;return t?typeof t==`number`?t:typeof t==`object`&&t&&typeof t.delta==`number`?t.delta:1:null}function st(e,t,n=!1){let{t:r,status:i,lang:a}=e,o=!e.isAdmin||e.busy,s=e.isAdmin?``:r(`not_admin`),c=ot(i),l=i?.overrides?.pause_until??null;return k`
    <div class="row">
      <button ?disabled=${o} title=${s} @click=${t.boost}>
        <ha-icon icon="mdi:thermometer-plus"></ha-icon>${r(n?`actions.boost_short`:`actions.boost`)}
      </button>
      <button ?disabled=${o} title=${s} @click=${t.pause}>
        <ha-icon icon="mdi:pause"></ha-icon>${r(n?`actions.pause_short`:`actions.pause`)}
      </button>
      ${at(i)?k`<button ?disabled=${o} title=${s||r(`actions.clear_hint`)} @click=${t.clear}>
            <ha-icon icon="mdi:undo-variant"></ha-icon>${r(`actions.clear`)}
          </button>`:j}
    </div>
    ${c||l?k`<div class="row" style="margin-top:6px">
          ${c?k`<span class="badge heat">${r(`actions.boost_active`,{delta:String(c).replace(`.`,a.startsWith(`de`)?`,`:`.`)})}</span>`:j}
          ${l?k`<span class="badge">${r(`actions.pause_active`,{time:Y(l,i?.now,a)})}</span>`:j}
        </div>`:j}
  `}var Z,Q=class extends R{constructor(){super(),this._unsub=null,this._connection=null,this._configLoading=!1,this._config={type:`custom:waermeregie-card`},this._status=null,this._wrConfig=null,this._error=null,this._busy=!1}static getStubConfig(){return{}}setConfig(e){if(!e||typeof e!=`object`)throw Error(`Invalid configuration`);if(e.rooms!==void 0&&!Array.isArray(e.rooms))throw Error(`rooms: list of room ids expected`);this._config={...e}}getCardSize(){let e=this._config?.rooms?.length??this._status?.rooms?.length??2;return 4+Math.ceil(e/2)}get _lang(){return Ge(this.hass?.locale?.language??this.hass?.language)}connectedCallback(){super.connectedCallback(),this.hass&&this._ensure()}disconnectedCallback(){super.disconnectedCallback(),this._unsub?.(),this._unsub=null,this._connection=null}willUpdate(e){e.has(`hass`)&&this.hass&&this._ensure()}_ensure(){this.isConnected&&this.hass?.connection&&(this._connection!==this.hass.connection&&(this._unsub?.(),this._connection=this.hass.connection,this._unsub=ke(this.hass,e=>{this._status=e,this._error=null},e=>this._error=X(e))),!this._wrConfig&&!this._configLoading&&(this._configLoading=!0,De(this.hass).then(e=>this._wrConfig=Je(e.config)).catch(e=>this._error=X(e)).finally(()=>this._configLoading=!1)))}async _action(e){this._busy=!0;try{let t=await e();t&&typeof t==`object`&&`mode`in t&&(this._status=t),this._error=null}catch(e){this._error=X(e)}finally{this._busy=!1}}render(){let e=Pe(this._lang),t={t:e,lang:this._lang,status:this._status,config:this._wrConfig,isAdmin:this.hass?.user?.is_admin!==!1,busy:this._busy};return k`<ha-card>
      <div class="wrap">
        <div class="row head">
          <ha-icon icon="mdi:fireplace" style="color:var(--wr-heat)"></ha-icon>
          <span class="title">${this._config.title??e(`card.name`)}</span>
        </div>
        ${this._error?k`<div class="banner error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div>${this._error}</div></div>`:j}
        ${this._status?k`
              ${Xe(t,!0)}
              ${this._wrConfig?Ze(t,e=>this._action(()=>z(this.hass,e,180))):j}
              ${it(t)}
              ${Qe(t,{timeline:!0,compact:!0})}
              ${tt(t,this._config.rooms)}
              ${this._config.show_actions===!1?j:st(t,{boost:()=>this._action(()=>Oe(this.hass,1,60)),pause:()=>this._action(()=>B(this.hass,120)),clear:()=>this._action(()=>Ae(this.hass,this._status))},!0)}
            `:this._error?j:k`<div class="muted">${e(`loading`)}</div>`}
      </div>
    </ha-card>`}};Z=Q,Z.properties={hass:{attribute:!1},_config:{state:!0},_status:{state:!0},_wrConfig:{state:!0},_error:{state:!0},_busy:{state:!0}},Z.styles=[Fe,o`
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
      .head .title {
        font-size: 18px;
        font-weight: 500;
      }
      .card {
        padding: 12px;
      }
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
        gap: 8px;
      }
      .room .temp {
        font-size: 20px;
      }
      .stove .phase {
        font-size: 16px;
      }
      .banner {
        padding: 8px 12px;
      }
    `];function $(){let e=window.customElements;e.get(`waermeregie-card`)||e.define(`waermeregie-card`,Q)}if(window.customElements.get(`home-assistant`)?$():window.customElements.whenDefined(`home-assistant`).then($,$),window.customCards=window.customCards||[],!window.customCards.some(e=>e.type===`waermeregie-card`)){let e=Pe(Ge(typeof navigator<`u`?navigator.language:`de`));window.customCards.push({type:`waermeregie-card`,name:e(`card.name`),description:e(`card.description`),preview:!1})}export{Q as WaermeregieCard};