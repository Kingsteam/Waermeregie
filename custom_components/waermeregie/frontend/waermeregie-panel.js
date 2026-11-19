var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=/* @__PURE__ */ new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,f=globalThis,re=f.trustedTypes,ie=re?re.emptyScript:``,ae=f.reactiveElementPolyfillSupport,p=(e,t)=>e,oe={toAttribute(e,t){switch(t){case Boolean:e=e?ie:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},se=(e,t)=>!l(e,t),ce={attribute:!0,type:String,converter:oe,reflect:!1,useDefault:!1,hasChanged:se};Symbol.metadata??=Symbol(`metadata`),f.litPropertyMetadata??=/* @__PURE__ */ new WeakMap;var m=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ce){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ce}static _$Ei(){if(this.hasOwnProperty(p(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(p(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(p(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=/* @__PURE__ */ new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=/* @__PURE__ */ new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=/* @__PURE__ */ new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=/* @__PURE__ */ new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?oe:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?oe:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??se)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=/* @__PURE__ */ new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=/* @__PURE__ */ new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=/* @__PURE__ */ new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};m.elementStyles=[],m.shadowRootOptions={mode:`open`},m[p(`elementProperties`)]=/* @__PURE__ */ new Map,m[p(`finalized`)]=/* @__PURE__ */ new Map,ae?.({ReactiveElement:m}),(f.reactiveElementVersions??=[]).push(`2.1.2`);var h=globalThis,le=e=>e,g=h.trustedTypes,ue=g?g.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,de=`$lit$`,_=`lit$${Math.random().toFixed(9).slice(2)}$`,fe=`?`+_,pe=`<${fe}>`,v=document,y=()=>v.createComment(``),b=e=>e===null||typeof e!=`object`&&typeof e!=`function`,me=Array.isArray,he=e=>me(e)||typeof e?.[Symbol.iterator]==`function`,ge=`[ 	
\f\r]`,x=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_e=/-->/g,ve=/>/g,S=RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),ye=/'/g,be=/"/g,xe=/^(?:script|style|textarea|title)$/i,C=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),w=Symbol.for(`lit-noChange`),T=Symbol.for(`lit-nothing`),Se=/* @__PURE__ */ new WeakMap,E=v.createTreeWalker(v,129);function Ce(e,t){if(!me(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return ue===void 0?t:ue.createHTML(t)}var we=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=x;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===x?c[1]===`!--`?o=_e:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=S):(xe.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=S):o=ve:o===S?c[0]===`>`?(o=i??x,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?S:c[3]===`"`?be:ye):o===be||o===ye?o=S:o===_e||o===ve?o=x:(o=S,i=void 0);let d=o===S&&e[t+1].startsWith(`/>`)?` `:``;a+=o===x?n+pe:l>=0?(r.push(s),n.slice(0,l)+de+n.slice(l)+_+d):n+_+(l===-2?t:d)}return[Ce(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},D=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=we(t,n);if(this.el=e.createElement(l,r),E.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=E.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(de)){let t=u[o++],n=i.getAttribute(e).split(_),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ee:r[1]===`?`?De:r[1]===`@`?Oe:A}),i.removeAttribute(e)}else e.startsWith(_)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(xe.test(i.tagName)){let e=i.textContent.split(_),t=e.length-1;if(t>0){i.textContent=g?g.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],y()),E.nextNode(),c.push({type:2,index:++a});i.append(e[t],y())}}}else if(i.nodeType===8){if(i.data===fe)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(_,e+1))!==-1;)c.push({type:7,index:a}),e+=_.length-1}}a++}}static createElement(e,t){let n=v.createElement(`template`);return n.innerHTML=e,n}};function O(e,t,n=e,r){if(t===w)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=b(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=O(e,i._$AS(e,t.values),i,r)),t}var Te=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??v).importNode(t,!0);E.currentNode=r;let i=E.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new k(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new ke(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=E.nextNode(),a++)}return E.currentNode=v,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},k=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=O(this,e,t),b(e)?e===T||e==null||e===``?(this._$AH!==T&&this._$AR(),this._$AH=T):e!==this._$AH&&e!==w&&this._(e):e._$litType$===void 0?e.nodeType===void 0?he(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==T&&b(this._$AH)?this._$AA.nextSibling.data=e:this.T(v.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=D.createElement(Ce(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Te(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Se.get(e.strings);return t===void 0&&Se.set(e.strings,t=new D(e)),t}k(t){me(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(y()),this.O(y()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=le(e).nextSibling;le(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},A=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=T,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(/* @__PURE__ */ new String),this.strings=n):this._$AH=T}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=O(this,e,t,0),a=!b(e)||e!==this._$AH&&e!==w,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=O(this,r[n+o],t,o),s===w&&(s=this._$AH[o]),a||=!b(s)||s!==this._$AH[o],s===T?e=T:e!==T&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ee=class extends A{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===T?void 0:e}},De=class extends A{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==T)}},Oe=class extends A{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=O(this,e,t,0)??T)===w)return;let n=this._$AH,r=e===T&&n!==T||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==T&&(n===T||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ke=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}},Ae=h.litHtmlPolyfillSupport;Ae?.(D,k),(h.litHtmlVersions??=[]).push(`3.3.3`);var je=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new k(t.insertBefore(y(),e),e,void 0,n??{})}return i._$AI(e),i},j=globalThis,M=class extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=je(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return w}};M._$litElement$=!0,M.finalized=!0,j.litElementHydrateSupport?.({LitElement:M});var Me=j.litElementPolyfillSupport;Me?.({LitElement:M}),(j.litElementVersions??=[]).push(`4.2.2`);var Ne=e=>e.callWS({type:`waermeregie/config`}),Pe=(e,t)=>e.callWS({type:`waermeregie/config/save`,config:t}),Fe=(e,t,n=180)=>e.callWS(t===null?{type:`waermeregie/override`,scene:null}:{type:`waermeregie/override`,scene:t,minutes:n}),Ie=(e,t)=>e.callWS({type:`waermeregie/pause`,minutes:t}),Le=(e,t,n)=>e.callWS({type:`waermeregie/boost`,delta:t,minutes:n}),Re=(e,t)=>e.callWS({type:`waermeregie/mode`,mode:t});function ze(e,t,n){let r=null,i=!1;return e.connection.subscribeMessage(t,{type:`waermeregie/subscribe`}).then(e=>{i?e():r=e}).catch(e=>n?.(e)),()=>{if(i=!0,r)try{Promise.resolve(r()).catch(()=>void 0)}catch{}r=null}}async function Be(e,t){let n=t?.overrides,r=!n,i=null;return(r||n?.scene||t?.scene?.source===`override`)&&(i=await Fe(e,null)),(r||n?.pause_until)&&(i=await Ie(e,0)),(r||n?.boost)&&(i=await Le(e,0,0)),i}var Ve={title:`Wärmeregie`,"tab.overview":`Übersicht`,"tab.rooms":`Räume`,"tab.schedule":`Tagesablauf`,"tab.scenes":`Szenen`,"tab.house":`Ofen & Haus`,"tab.log":`Protokoll`,menu:`Menü`,loading:`Wird geladen …`,load_error:`Die Daten von Wärmeregie konnten nicht geladen werden.`,retry:`Erneut versuchen`,not_admin:`Nur Administratoren können das ändern.`,error:`Fehler`,close:`Schließen`,cancel:`Abbrechen`,delete:`Löschen`,add:`Hinzufügen`,remove:`Entfernen`,none:`–`,id:`Kennung`,"mode.shadow_banner":`Schattenbetrieb: es wird nichts geschaltet`,"mode.shadow_banner_hint":`Wärmeregie rechnet nur mit und zeigt, was es tun würde. Ofen und Heizkörper bleiben unberührt.`,"mode.label":`Betriebsart`,"mode.shadow":`Schatten`,"mode.active":`Aktiv`,"mode.confirm_active":`Auf „Aktiv“ umschalten? Dann schaltet Wärmeregie den Ofen und stellt die Heizkörper selbst.`,"mode.confirm_shadow":`Auf „Schatten“ umschalten? Dann wird nichts mehr geschaltet, Wärmeregie rechnet nur noch mit.`,"mode.confirm_yes_active":`Ja, aktiv schalten`,"mode.confirm_yes_shadow":`Ja, nur noch mitrechnen`,"scene.title":`Szene`,"scene.auto":`Automatisch`,"scene.auto_hint":`nach Tagesablauf`,"scene.override_until":`von Hand bis {time}`,"scene.next_change":`nächster Wechsel {time}`,"scene.override_hint":`Eine Szene gilt nach dem Antippen für 3 Stunden.`,"day_type.today":`Heute: {name}`,"stove.title":`Ofen`,"stove.phase.idle":`Bereit`,"stove.phase.block":`Heizblock läuft`,"stove.phase.pause":`Pause`,"stove.phase.blocked":`Gesperrt`,"stove.action.start":`möchte starten`,"stove.action.stop":`möchte ausschalten`,"stove.action.keep":`keine Änderung`,"stove.burning":`brennt`,"stove.not_burning":`brennt nicht`,"stove.unavailable":`Ofen nicht erreichbar`,"stove.starts_today":`Starts heute`,"stove.pause_until":`Pause bis`,"stove.block_since":`Heizblock seit`,"stove.reason":`Grund`,"stove.chrono_warning":`Das Zeitprogramm (Chrono) des Ofens ist an. Im aktiven Betrieb schaltet Wärmeregie es aus; im Schattenbetrieb bitte selbst darauf achten.`,"stove.eco_warning":`Eco ist am Ofen eingeschaltet. Im aktiven Betrieb schaltet Wärmeregie es aus.`,"stove.error":`Der Ofen meldet eine Störung. Solange startet Wärmeregie ihn nicht.`,"stove.error_short":`Störung`,"stove.power_level":`Leistungsstufe`,"stove.water":`Wasser`,"stove.ignitions":`Zündungen`,"stove.no_status":`Noch kein Ofenstatus.`,"house.outdoor":`Außen`,"house.deficit":`Wärmebedarf`,"rooms.title":`Räume`,"room.current":`Ist`,"room.target":`Ziel`,"room.radiator":`Heizkörper`,"room.open":`offen`,"room.open_for":`offen seit {time}`,"room.occupied":`belegt`,"room.empty":`leer`,"room.sensors_missing":`{n} Fühler fehlen`,"room.sensor_missing":`1 Fühler fehlt`,"room.too_cold":`zu kalt`,"rooms.none":`Noch keine Räume eingerichtet.`,"alerts.title":`Hinweise`,"alerts.none":`Alles in Ordnung.`,"actions.title":`Schnellaktionen`,"actions.boost":`+1 °C für 1 Stunde`,"actions.boost_short":`+1 °C`,"actions.pause":`Ofen 2 Stunden pausieren`,"actions.pause_short":`Pause 2 h`,"actions.clear":`Aufheben`,"actions.clear_hint":`Hebt Szene von Hand, Pause und +1 °C auf.`,"actions.boost_active":`+{delta} °C aktiv`,"actions.pause_active":`Ofen pausiert bis {time}`,"actions.done":`Erledigt.`,"editor.unsaved":`Ungespeicherte Änderungen`,"editor.saved":`Alles gespeichert`,"editor.save":`Speichern`,"editor.saving":`Speichert …`,"editor.discard":`Verwerfen`,"editor.save_error":`Speichern fehlgeschlagen: {message}`,"editor.save_ok":`Gespeichert.`,"editor.fix_errors":`Bitte zuerst die rot markierten Angaben korrigieren.`,"editor.leave_warning":`Es gibt ungespeicherte Änderungen.`,"rooms.add_placeholder":`Name des neuen Raums, z. B. Wohnzimmer`,"rooms.add":`Raum hinzufügen`,"rooms.select":`Raum auswählen`,"room.name":`Name`,"room.importance":`Wichtigkeit`,"room.importance_hint":`Wichtige Räume zählen stärker, wenn entschieden wird, ob der Ofen startet.`,"importance.1":`niedrig`,"importance.2":`mittel`,"importance.3":`hoch`,"room.radiators":`Heizkörperthermostate`,"room.radiators_hint":`Thermostate in diesem Raum (z. B. Tado).`,"room.sensors":`Temperaturfühler`,"room.sensors_hint":`Wird kein Fühler gewählt, gilt die Temperatur der Thermostate. Das Gewicht bestimmt, wie stark ein Fühler zählt.`,"room.weight":`Gewicht`,"room.openings":`Fenster und Türen`,"room.openings_hint":`Ist etwas offen, wird hier nicht geheizt.`,"room.presence":`Anwesenheit`,"room.presence_hint":`Bewegungs- oder Anwesenheitsmelder. Optional.`,"room.targets":`Zieltemperaturen je Szene`,"room.targets_hint":`Leer lassen = Standardwert der Szene.`,"room.devices":`Geräte`,"room.devices_hint":`Pausierte Geräte bleiben eingetragen, werden aber nicht verwendet, z. B. wenn ein Melder offline ist.`,"room.recovering":`lüftet nach bis {time}`,"dev.pause":`Pausieren`,"dev.resume":`Wieder verwenden`,"dev.paused":`pausiert`,"dev.unavailable":`nicht verfügbar`,"dev.add":`Gerät hinzufügen`,"dev.open":`offen`,"dev.closed":`zu`,"dev.occupied":`belegt`,"dev.empty":`leer`,"dev.none":`keine`,"dev.unavail_count":`{n} Geräte nicht verfügbar`,"dev.unavail_one":`1 Gerät nicht verfügbar`,"dev.pause_unavail":`Nicht verfügbare pausieren`,"param.opening_recovery_min":`Nach dem Lüften warten`,"param.opening_recovery_min_hint":`So lange zählt ein gelüfteter Raum nach dem Schließen nicht für den Ofenstart. Die Luft wird von selbst schnell wieder warm. 0 = aus.`,"room.delete":`Raum löschen`,"room.delete_confirm":`Raum „{name}“ wirklich löschen? Das lässt sich nach dem Speichern nicht rückgängig machen.`,"schedule.day_types":`Tagesarten`,"schedule.day_types_hint":`Eine Tagesart legt fest, ab wann welche Szene gilt. Vor dem ersten Zeitpunkt gilt die letzte Szene des Vortags.`,"schedule.add_placeholder":`Name der neuen Tagesart, z. B. Homeoffice`,"schedule.add":`Tagesart hinzufügen`,"schedule.slot_from":`ab`,"schedule.add_slot":`Zeitpunkt hinzufügen`,"schedule.week":`Woche`,"schedule.week_hint":`Welche Tagesart gilt an welchem Tag?`,"schedule.delete_day_type":`Tagesart löschen`,"schedule.delete_confirm":`Tagesart „{name}“ wirklich löschen?`,"schedule.in_use":`Wird in der Woche verwendet ({days}). Bitte dort zuerst eine andere Tagesart wählen.`,"schedule.no_scenes":`Bitte zuerst unter „Szenen“ eine Szene anlegen.`,"slot.time_format":`Uhrzeit bitte als HH:MM angeben.`,"slot.not_ascending":`Die Zeiten müssen aufsteigend sein.`,"slot.scene_missing":`Bitte eine Szene wählen.`,"slot.scene_unknown":`Diese Szene gibt es nicht mehr.`,"slot.empty":`Mindestens ein Zeitpunkt ist nötig.`,"week.mon":`Montag`,"week.tue":`Dienstag`,"week.wed":`Mittwoch`,"week.thu":`Donnerstag`,"week.fri":`Freitag`,"week.sat":`Samstag`,"week.sun":`Sonntag`,"week.holiday":`Feiertag`,"week.unset":`– bitte wählen –`,"scenes.title":`Szenen`,"scenes.hint":`Eine Szene ist ein Wärmewunsch, z. B. Komfort oder Sparen.`,"scenes.add_placeholder":`Name der neuen Szene, z. B. Komfort`,"scenes.add":`Szene hinzufügen`,"scene.name":`Name`,"scene.icon":`Symbol`,"scene.icon_hint":`z. B. mdi:sofa`,"scene.stove":`Ofen`,"scene.stove.allow":`darf heizen`,"scene.stove.frost_only":`nur gegen Kälte (Frost/Nacht)`,"scene.stove.deny":`bleibt aus`,"scene.default_target":`Standardziel`,"scene.delete":`Szene löschen`,"scene.delete_confirm":`Szene „{name}“ wirklich löschen? Eigene Zieltemperaturen der Räume für diese Szene werden entfernt.`,"scene.in_use":`Wird im Tagesablauf verwendet ({names}). Bitte dort zuerst ersetzen.`,"scenes.matrix":`Zieltemperaturen Raum × Szene`,"scenes.matrix_hint":`Leere Felder verwenden das Standardziel der Szene.`,"scenes.none":`Noch keine Szenen.`,"house.stove":`Ofen`,"house.stove_climate":`Ofen-Thermostat`,"house.stove_climate_hint":`Pflicht. Die Thermostat-Entität des Pelletofens.`,"house.stove_climate_active_hint":`Ohne Ofen-Thermostat kann Wärmeregie nur im Schattenbetrieb laufen.`,"house.power":`Leistungsstufe`,"house.power_hint":`Optional. Auswahl- oder Zahl-Entität für die Stufe 1 bis 5.`,"house.stove_functions":`Ofen-Funktionen`,"house.stove_functions_hint":`Im aktiven Betrieb schaltet Wärmeregie das Zeitprogramm (Chrono) und Eco des Ofens aus und wählt die Leistungsstufe selbst. Im Schattenbetrieb gibt es nur Hinweise.`,"house.chrono_switch":`Zeitprogramm (Chrono)`,"house.chrono_switch_hint":`Optional. Schalter für das eigene Zeitprogramm des Ofens.`,"house.eco_switch":`Eco`,"house.eco_switch_hint":`Optional. Schalter für den Eco-Modus des Ofens.`,"house.error_sensor":`Störung`,"house.error_sensor_hint":`Optional. Meldet der Ofen eine Störung, wird er nicht gestartet.`,"house.water_sensor":`Wassertemperatur`,"house.water_sensor_hint":`Optional. Nur zur Anzeige.`,"house.ignitions_sensor":`Zündzähler`,"house.ignitions_sensor_hint":`Optional. Nur zur Anzeige.`,"house.environment":`Wetter und Kalender`,"house.weather":`Wetter`,"house.weather_hint":`Optional. Für die Vorhersage.`,"house.outdoor_sensor":`Außenfühler`,"house.outdoor_sensor_hint":`Optional. Genauer als die Wettervorhersage.`,"house.workday":`Arbeitstag`,"house.workday_hint":`Optional. Erkennt Feiertage (Integration „Arbeitstag“).`,"house.people":`Bewohner`,"house.persons":`Personen`,"house.persons_hint":`Ist niemand zu Hause, wird gespart.`,"house.pet":`Haustier`,"house.pet_hint":`Optional. Ist ein Tier zu Hause, wird nicht unter die Frostgrenze abgesenkt.`,"house.notify":`Benachrichtigungen`,"house.notify_hint":`Wohin sollen Hinweise geschickt werden?`,"house.notify_none":`Keine Benachrichtigungsdienste gefunden.`,"house.notify_unknown":`nicht mehr vorhanden`,"house.parameters":`Regelwerte`,"house.parameters_hint":`Die Voreinstellungen passen für die meisten Häuser. Nur ändern, wenn nötig.`,"house.out_of_range":`Erlaubt: {min} bis {max}`,"pgroup.stove":`Ofen starten und stoppen`,"pgroup.openings":`Fenster und Türen`,"pgroup.radiators":`Heizkörper`,"pgroup.limits":`Untergrenzen`,"pgroup.presence":`Anwesenheit`,"pgroup.pellets":`Pellets`,"param.pellet_bag_kg":`Gewicht eines Sacks`,"param.pellet_bag_kg_hint":`So viel zählt der Knopf „Sack Pellets nachgefüllt“ dazu.`,"param.pellet_capacity_kg":`Fassungsvermögen des Behälters`,"param.pellet_capacity_kg_hint":`Mehr passt nicht hinein; der Vorrat wird darauf begrenzt.`,"param.pellet_rate_kg_h":`Verbrauch pro Brennstunde (Startwert)`,"param.pellet_rate_kg_h_hint":`Gilt, bis die Wärmeregie aus einem leeren Behälter den echten Wert gelernt hat.`,"param.pellet_reminder_kg":`Erinnern ab Vorrat`,"param.pellet_reminder_kg_hint":`Fällt die Schätzung darunter, kommt eine Nachricht.`,"stove.pellets":`Pellets`,"stove.pellets_empty":`leer`,"pgroup.power":`Leistungsstufe`,"pgroup.other":`Weitere`,"param.start_below_k":`Start, wenn so viel unter Ziel`,"param.start_below_k_hint":`Der Ofen startet erst, wenn die Wohnräume so viel kälter als gewünscht sind.`,"param.stop_above_k":`Stopp, wenn so viel über Ziel`,"param.stop_above_k_hint":`Der Heizblock endet, wenn es so viel wärmer als gewünscht ist.`,"param.min_burn_min":`Kürzeste Brenndauer`,"param.min_burn_min_hint":`Ein Heizblock läuft mindestens so lange. Schont den Ofen.`,"param.max_burn_min":`Längste Brenndauer`,"param.max_burn_min_hint":`Danach wird ein Heizblock immer beendet.`,"param.min_pause_min":`Kürzeste Pause`,"param.min_pause_min_hint":`So lange bleibt der Ofen nach einem Heizblock mindestens aus.`,"param.max_starts_per_day":`Starts pro Tag höchstens`,"param.max_starts_per_day_hint":`Wenige lange Heizblöcke sind besser als häufiges An und Aus.`,"param.opening_grace_min":`Kurz lüften erlaubt`,"param.opening_grace_min_hint":`So lange darf ein Fenster offen sein, ohne dass etwas passiert.`,"param.opening_stop_min":`Ofen stoppt bei offenem Fenster nach`,"param.opening_stop_min_hint":`Bleibt ein Fenster länger offen, wird der Heizblock beendet.`,"param.opening_empty_room_min":`Leerer Raum: Heizkörper zu nach`,"param.opening_empty_room_min_hint":`In einem leeren Raum mit offenem Fenster wird der Heizkörper schon so früh abgedreht.`,"param.radiator_boost_k":`Heizkörper-Vorlauf`,"param.radiator_boost_k_hint":`Während der Ofen brennt, werden die Heizkörper so viel höher gestellt.`,"param.frost_c":`Frostgrenze`,"param.frost_c_hint":`Kälter darf es nie werden. Gilt auch bei Szenen, in denen der Ofen sonst aus bleibt.`,"param.night_floor_c":`Nachtuntergrenze`,"param.night_floor_c_hint":`Nachts wird mindestens auf diese Temperatur geheizt.`,"param.stove_block_setpoint_c":`Ofen-Sollwert im Heizblock`,"param.stove_block_setpoint_c_hint":`Auf diesen Wert wird das Ofen-Thermostat gestellt, damit er sicher durchbrennt.`,"param.presence_empty_min":`Raum gilt als leer nach`,"param.presence_empty_min_hint":`So lange ohne Bewegung, dann gilt ein Raum als leer.`,"param.power_min":`Kleinste Leistungsstufe`,"param.power_min_hint":`Mit dieser Stufe läuft ein Heizblock bei mildem Wetter (1 bis 5).`,"param.power_max":`Größte Leistungsstufe`,"param.power_max_hint":`Höchste Stufe, die Wärmeregie wählt (1 bis 5).`,"param.power_cold_c":`Volle Leistung unter`,"param.power_cold_c_hint":`Ist es draußen kälter, wird die größte Leistungsstufe gewählt.`,"log.title":`Protokoll`,"log.empty":`Noch keine Einträge.`,"log.shadow":`Schatten`,"log.shadow_hint":`Nur berechnet, nicht geschaltet`,"picker.search":`Suchen …`,"picker.no_results":`Keine passenden Entitäten.`,"picker.show_all":`auch andere Arten anzeigen`,"picker.missing":`nicht gefunden`,"picker.more":`Weitere Treffer – bitte genauer suchen.`,"card.name":`Wärmeregie`,"card.description":`Ofen, Szene und Räume auf einen Blick.`,"card.no_rooms":`Keine Räume ausgewählt.`,"card.open_panel":`Wärmeregie öffnen`},He={title:`Wärmeregie`,"tab.overview":`Overview`,"tab.rooms":`Rooms`,"tab.schedule":`Schedule`,"tab.scenes":`Scenes`,"tab.house":`Stove & house`,"tab.log":`Log`,menu:`Menu`,loading:`Loading …`,load_error:`Could not load Wärmeregie data.`,retry:`Try again`,not_admin:`Only administrators can change this.`,error:`Error`,close:`Close`,cancel:`Cancel`,delete:`Delete`,add:`Add`,remove:`Remove`,none:`–`,id:`ID`,"mode.shadow_banner":`Shadow mode: nothing is being switched`,"mode.shadow_banner_hint":`Wärmeregie only calculates and shows what it would do. Stove and radiators are left alone.`,"mode.label":`Mode`,"mode.shadow":`Shadow`,"mode.active":`Active`,"mode.confirm_active":`Switch to “Active”? Wärmeregie will then control the stove and set the radiators.`,"mode.confirm_shadow":`Switch to “Shadow”? Nothing will be switched any more, Wärmeregie only calculates.`,"mode.confirm_yes_active":`Yes, go active`,"mode.confirm_yes_shadow":`Yes, only calculate`,"scene.title":`Scene`,"scene.auto":`Automatic`,"scene.auto_hint":`by schedule`,"scene.override_until":`manual until {time}`,"scene.next_change":`next change {time}`,"scene.override_hint":`A tapped scene applies for 3 hours.`,"day_type.today":`Today: {name}`,"stove.title":`Stove`,"stove.phase.idle":`Ready`,"stove.phase.block":`Heating block running`,"stove.phase.pause":`Pause`,"stove.phase.blocked":`Blocked`,"stove.action.start":`wants to start`,"stove.action.stop":`wants to stop`,"stove.action.keep":`no change`,"stove.burning":`burning`,"stove.not_burning":`not burning`,"stove.unavailable":`Stove not reachable`,"stove.starts_today":`Starts today`,"stove.pause_until":`Pause until`,"stove.block_since":`Block since`,"stove.reason":`Reason`,"stove.chrono_warning":`The stove's own timer (chrono) is on. In active mode Wärmeregie switches it off; in shadow mode please keep an eye on it yourself.`,"stove.eco_warning":`Eco is switched on at the stove. In active mode Wärmeregie switches it off.`,"stove.error":`The stove reports a fault. Wärmeregie will not start it until it is cleared.`,"stove.error_short":`Fault`,"stove.power_level":`Power level`,"stove.water":`Water`,"stove.ignitions":`Ignitions`,"stove.no_status":`No stove status yet.`,"house.outdoor":`Outdoor`,"house.deficit":`Heat demand`,"rooms.title":`Rooms`,"room.current":`Now`,"room.target":`Target`,"room.radiator":`Radiator`,"room.open":`open`,"room.open_for":`open for {time}`,"room.occupied":`occupied`,"room.empty":`empty`,"room.sensors_missing":`{n} sensors missing`,"room.sensor_missing":`1 sensor missing`,"room.too_cold":`too cold`,"rooms.none":`No rooms set up yet.`,"alerts.title":`Notices`,"alerts.none":`All fine.`,"actions.title":`Quick actions`,"actions.boost":`+1 °C for 1 hour`,"actions.boost_short":`+1 °C`,"actions.pause":`Pause stove for 2 hours`,"actions.pause_short":`Pause 2 h`,"actions.clear":`Cancel`,"actions.clear_hint":`Cancels manual scene, pause and +1 °C.`,"actions.boost_active":`+{delta} °C active`,"actions.pause_active":`Stove paused until {time}`,"actions.done":`Done.`,"editor.unsaved":`Unsaved changes`,"editor.saved":`All saved`,"editor.save":`Save`,"editor.saving":`Saving …`,"editor.discard":`Discard`,"editor.save_error":`Saving failed: {message}`,"editor.save_ok":`Saved.`,"editor.fix_errors":`Please fix the entries marked in red first.`,"editor.leave_warning":`There are unsaved changes.`,"rooms.add_placeholder":`Name of the new room, e.g. Living room`,"rooms.add":`Add room`,"rooms.select":`Select room`,"room.name":`Name`,"room.importance":`Importance`,"room.importance_hint":`Important rooms count more when deciding whether the stove starts.`,"importance.1":`low`,"importance.2":`medium`,"importance.3":`high`,"room.radiators":`Radiator thermostats`,"room.radiators_hint":`Thermostats in this room (e.g. Tado).`,"room.sensors":`Temperature sensors`,"room.sensors_hint":`Without a sensor the thermostat temperature is used. The weight sets how much a sensor counts.`,"room.weight":`Weight`,"room.openings":`Windows and doors`,"room.openings_hint":`While something is open, this room is not heated.`,"room.presence":`Presence`,"room.presence_hint":`Motion or presence sensors. Optional.`,"room.targets":`Target temperature per scene`,"room.targets_hint":`Leave empty = scene default.`,"room.devices":`Devices`,"room.devices_hint":`Paused devices stay configured but are not used, e.g. while a sensor is offline.`,"room.recovering":`recovering from airing until {time}`,"dev.pause":`Pause`,"dev.resume":`Use again`,"dev.paused":`paused`,"dev.unavailable":`unavailable`,"dev.add":`Add device`,"dev.open":`open`,"dev.closed":`closed`,"dev.occupied":`occupied`,"dev.empty":`empty`,"dev.none":`none`,"dev.unavail_count":`{n} devices unavailable`,"dev.unavail_one":`1 device unavailable`,"dev.pause_unavail":`Pause unavailable ones`,"param.opening_recovery_min":`Wait after airing`,"param.opening_recovery_min_hint":`For this long after closing, an aired room does not count for starting the stove. The air warms up again quickly by itself. 0 = off.`,"room.delete":`Delete room`,"room.delete_confirm":`Really delete room “{name}”? This cannot be undone after saving.`,"schedule.day_types":`Day types`,"schedule.day_types_hint":`A day type sets from when which scene applies. Before the first time, the last scene of the previous day applies.`,"schedule.add_placeholder":`Name of the new day type, e.g. Home office`,"schedule.add":`Add day type`,"schedule.slot_from":`from`,"schedule.add_slot":`Add time`,"schedule.week":`Week`,"schedule.week_hint":`Which day type applies on which day?`,"schedule.delete_day_type":`Delete day type`,"schedule.delete_confirm":`Really delete day type “{name}”?`,"schedule.in_use":`Used in the week ({days}). Please choose another day type there first.`,"schedule.no_scenes":`Please create a scene under “Scenes” first.`,"slot.time_format":`Please enter the time as HH:MM.`,"slot.not_ascending":`Times must be in ascending order.`,"slot.scene_missing":`Please choose a scene.`,"slot.scene_unknown":`This scene no longer exists.`,"slot.empty":`At least one time is required.`,"week.mon":`Monday`,"week.tue":`Tuesday`,"week.wed":`Wednesday`,"week.thu":`Thursday`,"week.fri":`Friday`,"week.sat":`Saturday`,"week.sun":`Sunday`,"week.holiday":`Holiday`,"week.unset":`– please choose –`,"scenes.title":`Scenes`,"scenes.hint":`A scene is a heat wish, e.g. comfort or eco.`,"scenes.add_placeholder":`Name of the new scene, e.g. Comfort`,"scenes.add":`Add scene`,"scene.name":`Name`,"scene.icon":`Icon`,"scene.icon_hint":`e.g. mdi:sofa`,"scene.stove":`Stove`,"scene.stove.allow":`may heat`,"scene.stove.frost_only":`only against cold (frost/night)`,"scene.stove.deny":`stays off`,"scene.default_target":`Default target`,"scene.delete":`Delete scene`,"scene.delete_confirm":`Really delete scene “{name}”? Room targets for this scene will be removed.`,"scene.in_use":`Used in the schedule ({names}). Please replace it there first.`,"scenes.matrix":`Target temperatures room × scene`,"scenes.matrix_hint":`Empty fields use the scene default.`,"scenes.none":`No scenes yet.`,"house.stove":`Stove`,"house.stove_climate":`Stove thermostat`,"house.stove_climate_hint":`Required. The thermostat entity of the pellet stove.`,"house.stove_climate_active_hint":`Without a stove thermostat Wärmeregie can only run in shadow mode.`,"house.power":`Power level`,"house.power_hint":`Optional. Select or number entity for level 1 to 5.`,"house.stove_functions":`Stove functions`,"house.stove_functions_hint":`In active mode Wärmeregie switches off the stove's own timer (chrono) and eco mode and chooses the power level itself. In shadow mode there are only notices.`,"house.chrono_switch":`Timer (chrono)`,"house.chrono_switch_hint":`Optional. Switch for the stove's own timer.`,"house.eco_switch":`Eco`,"house.eco_switch_hint":`Optional. Switch for the stove's eco mode.`,"house.error_sensor":`Fault`,"house.error_sensor_hint":`Optional. While the stove reports a fault, it is not started.`,"house.water_sensor":`Water temperature`,"house.water_sensor_hint":`Optional. Display only.`,"house.ignitions_sensor":`Ignition counter`,"house.ignitions_sensor_hint":`Optional. Display only.`,"house.environment":`Weather and calendar`,"house.weather":`Weather`,"house.weather_hint":`Optional. Used for the forecast.`,"house.outdoor_sensor":`Outdoor sensor`,"house.outdoor_sensor_hint":`Optional. More precise than the weather forecast.`,"house.workday":`Workday`,"house.workday_hint":`Optional. Detects holidays (“Workday” integration).`,"house.people":`Residents`,"house.persons":`Persons`,"house.persons_hint":`If nobody is home, energy is saved.`,"house.pet":`Pet`,"house.pet_hint":`Optional. If a pet is home, temperature is never lowered below the frost limit.`,"house.notify":`Notifications`,"house.notify_hint":`Where should notices be sent?`,"house.notify_none":`No notification services found.`,"house.notify_unknown":`no longer available`,"house.parameters":`Control values`,"house.parameters_hint":`The defaults suit most houses. Only change them if needed.`,"house.out_of_range":`Allowed: {min} to {max}`,"pgroup.stove":`Starting and stopping the stove`,"pgroup.openings":`Windows and doors`,"pgroup.radiators":`Radiators`,"pgroup.limits":`Lower limits`,"pgroup.presence":`Presence`,"pgroup.pellets":`Pellets`,"param.pellet_bag_kg":`Weight of one bag`,"param.pellet_bag_kg_hint":`The button “Pellet bag refilled” adds this much.`,"param.pellet_capacity_kg":`Hopper capacity`,"param.pellet_capacity_kg_hint":`No more fits in; the stock is capped at this.`,"param.pellet_rate_kg_h":`Consumption per burn hour (start value)`,"param.pellet_rate_kg_h_hint":`Used until the real value is learned from an empty hopper.`,"param.pellet_reminder_kg":`Remind below`,"param.pellet_reminder_kg_hint":`When the estimate drops below this, a message is sent.`,"stove.pellets":`Pellets`,"stove.pellets_empty":`empty`,"pgroup.power":`Power level`,"pgroup.other":`Other`,"param.start_below_k":`Start when this far below target`,"param.start_below_k_hint":`The stove only starts when the living rooms are this much colder than wanted.`,"param.stop_above_k":`Stop when this far above target`,"param.stop_above_k_hint":`The heating block ends when it is this much warmer than wanted.`,"param.min_burn_min":`Shortest burn time`,"param.min_burn_min_hint":`A heating block runs at least this long. Easier on the stove.`,"param.max_burn_min":`Longest burn time`,"param.max_burn_min_hint":`After this a heating block always ends.`,"param.min_pause_min":`Shortest pause`,"param.min_pause_min_hint":`The stove stays off at least this long after a heating block.`,"param.max_starts_per_day":`Max starts per day`,"param.max_starts_per_day_hint":`A few long heating blocks are better than frequent on and off.`,"param.opening_grace_min":`Short airing allowed`,"param.opening_grace_min_hint":`A window may be open this long without anything happening.`,"param.opening_stop_min":`Stove stops with open window after`,"param.opening_stop_min_hint":`If a window stays open longer, the heating block ends.`,"param.opening_empty_room_min":`Empty room: radiator off after`,"param.opening_empty_room_min_hint":`In an empty room with an open window the radiator is turned down this early.`,"param.radiator_boost_k":`Radiator lead`,"param.radiator_boost_k_hint":`While the stove burns, radiators are set this much higher.`,"param.frost_c":`Frost limit`,"param.frost_c_hint":`It never gets colder than this, even in scenes where the stove otherwise stays off.`,"param.night_floor_c":`Night minimum`,"param.night_floor_c_hint":`At night it is heated to at least this temperature.`,"param.stove_block_setpoint_c":`Stove setpoint during block`,"param.stove_block_setpoint_c_hint":`The stove thermostat is set to this value so it keeps burning.`,"param.presence_empty_min":`Room counts as empty after`,"param.presence_empty_min_hint":`After this long without motion a room counts as empty.`,"param.power_min":`Lowest power level`,"param.power_min_hint":`A heating block runs at this level in mild weather (1 to 5).`,"param.power_max":`Highest power level`,"param.power_max_hint":`Highest level Wärmeregie will choose (1 to 5).`,"param.power_cold_c":`Full power below`,"param.power_cold_c_hint":`If it is colder outside, the highest power level is chosen.`,"log.title":`Log`,"log.empty":`No entries yet.`,"log.shadow":`Shadow`,"log.shadow_hint":`Only calculated, not switched`,"picker.search":`Search …`,"picker.no_results":`No matching entities.`,"picker.show_all":`also show other kinds`,"picker.missing":`not found`,"picker.more":`More results – please refine your search.`,"card.name":`Wärmeregie`,"card.description":`Stove, scene and rooms at a glance.`,"card.no_rooms":`No rooms selected.`,"card.open_panel":`Open Wärmeregie`};function Ue(e,t,n){let r=(e===`en`?He[t]:void 0)??Ve[t]??t;if(n)for(let[e,t]of Object.entries(n))r=r.split(`{${e}}`).join(String(t));return r}function N(e){return(t,n)=>Ue(e,t,n)}var P=o`
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
`;function F(e){return e.split(`.`,1)[0]}function I(e,t){let n=e?.[t]?.attributes?.friendly_name;return typeof n==`string`&&n?n:t}function We(e){return e.toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``)}function Ge(e,t){let n=We(t.query??``).split(/\s+/).filter(Boolean),r=new Set(t.exclude??[]),i=[];for(let a of Object.values(e??{})){let o=a.entity_id;if(r.has(o)||t.domains.length&&!t.domains.includes(F(o)))continue;let s=typeof a.attributes?.device_class==`string`?a.attributes.device_class:void 0;if(t.deviceClasses?.length&&(F(o)===`sensor`||F(o)===`binary_sensor`)&&(!s||!t.deviceClasses.includes(s)))continue;let c=I(e,o);if(n.length){let e=We(`${c} ${o}`);if(!n.every(t=>e.includes(t)))continue}i.push({entity_id:o,name:c,device_class:s})}return i.sort((e,t)=>e.name.localeCompare(t.name)||e.entity_id.localeCompare(t.entity_id)),t.limit?i.slice(0,t.limit):i}function Ke(e){return Object.keys(e?.notify??{}).map(e=>`notify.${e}`).sort()}var L,qe=50,Je=class extends M{constructor(){super(),this._uid=`wrp${Math.random().toString(36).slice(2,8)}`,this.multiple=!1,this.domains=[],this.label=``,this.helper=``,this.lang=`de`,this.disabled=!1,this.invalid=!1,this._query=``,this._open=!1,this._active=0,this._showAll=!1}get _selected(){let e=this.value;return Array.isArray(e)?e:e?[e]:[]}_results(){let e=Ge(this.hass?.states,{domains:this.domains,deviceClasses:this._showAll?void 0:this.deviceClasses,query:this._query,exclude:[...this._selected,...this.exclude??[]],limit:51});return{list:e.slice(0,qe),more:e.length>qe}}_emit(e){this.value=e,this.dispatchEvent(new CustomEvent(`value-changed`,{detail:{value:e},bubbles:!0,composed:!0}))}_pick(e){this.multiple?(this._emit([...this._selected,e]),this._query=``,this._active=0,this.renderRoot.querySelector(`input.search`)?.focus()):(this._emit(e),this._query=``,this._open=!1)}_remove(e){this.multiple?this._emit(this._selected.filter(t=>t!==e)):this._emit(null)}_onKey(e,t){e.key===`ArrowDown`?(e.preventDefault(),this._open=!0,this._active=Math.min(this._active+1,Math.max(t.length-1,0))):e.key===`ArrowUp`?(e.preventDefault(),this._active=Math.max(this._active-1,0)):e.key===`Enter`?this._open&&t[this._active]&&(e.preventDefault(),this._pick(t[this._active].entity_id)):e.key===`Escape`&&(this._open=!1)}updated(e){e.has(`_active`)&&this._open&&this.renderRoot.querySelector(`#${this._uid}-${this._active}`)?.scrollIntoView({block:`nearest`})}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this._closeTimer)}render(){let e=N(this.lang),t=this._selected,n=this.multiple||t.length===0||this._open,{list:r,more:i}=this._open?this._results():{list:[],more:!1},a=Math.min(this._active,Math.max(r.length-1,0));return C`
      ${this.label?C`<span class="lbl" id="${this._uid}-l">${this.label}</span>`:T}
      ${this.helper?C`<div class="hint">${this.helper}</div>`:T}
      ${t.length?C`<div class="sel">
            ${t.map(t=>{let n=!this.hass?.states?.[t];return C`<span class="pchip ${n?`missing`:``}">
                <span class="txt">
                  <span class="n">${I(this.hass?.states,t)}</span>
                  <span class="id">${t}${n?C` · ${e(`picker.missing`)}`:T}</span>
                </span>
                ${this.disabled?T:C`<button class="icon x" title=${e(`remove`)} aria-label="${e(`remove`)}: ${t}" @click=${()=>this._remove(t)}>
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>`}
                ${!this.multiple&&!this.disabled?C`<button class="icon x" title=${e(`picker.search`)} aria-label=${e(`picker.search`)} @click=${()=>this._focusSearch()}>
                      <ha-icon icon="mdi:pencil"></ha-icon>
                    </button>`:T}
              </span>`})}
          </div>`:T}
      ${n&&!this.disabled?C`<div class="combo">
            <input
              class="search ${this.invalid?`invalid`:``}"
              type="search"
              role="combobox"
              autocomplete="off"
              aria-labelledby=${this.label?`${this._uid}-l`:T}
              aria-expanded=${this._open}
              aria-controls="${this._uid}-list"
              aria-activedescendant=${this._open&&r.length?`${this._uid}-${a}`:T}
              placeholder=${e(`picker.search`)}
              .value=${this._query}
              @input=${e=>{this._query=e.target.value,this._open=!0,this._active=0}}
              @focus=${()=>{window.clearTimeout(this._closeTimer),this._open=!0}}
              @blur=${()=>{this._closeTimer=window.setTimeout(()=>this._open=!1,180)}}
              @keydown=${e=>this._onKey(e,r)}
            />
            ${this._open?C`<div class="pop" @mousedown=${e=>e.preventDefault()}>
                  ${this.deviceClasses?.length?C`<label class="all"
                        ><input
                          type="checkbox"
                          .checked=${this._showAll}
                          @change=${e=>this._showAll=e.target.checked}
                        />${e(`picker.show_all`)}</label
                      >`:T}
                  <ul id="${this._uid}-list" role="listbox">
                    ${r.length?r.map((e,t)=>C`<li
                            id="${this._uid}-${t}"
                            role="option"
                            aria-selected=${t===a}
                            class=${t===a?`active`:``}
                            @click=${()=>this._pick(e.entity_id)}
                            @mouseenter=${()=>this._active=t}
                          >
                            <span class="n">${e.name}</span><span class="id">${e.entity_id}</span>
                          </li>`):C`<li class="empty">${e(`picker.no_results`)}</li>`}
                    ${i?C`<li class="empty">${e(`picker.more`)}</li>`:T}
                  </ul>
                </div>`:T}
          </div>`:T}
    `}async _focusSearch(){this._open=!0,await this.updateComplete,this.renderRoot.querySelector(`input.search`)?.focus()}};L=Je,L.properties={hass:{attribute:!1},value:{attribute:!1},multiple:{type:Boolean},domains:{attribute:!1},deviceClasses:{attribute:!1},exclude:{attribute:!1},label:{type:String},helper:{type:String},lang:{type:String},disabled:{type:Boolean},invalid:{type:Boolean},_query:{state:!0},_open:{state:!0},_active:{state:!0},_showAll:{state:!0}},L.styles=[P,o`
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
    `],customElements.get(`wr-entity-picker`)||customElements.define(`wr-entity-picker`,Je);var R=1440,Ye=[`mon`,`tue`,`wed`,`thu`,`fri`,`sat`,`sun`,`holiday`],Xe=/^([01]\d|2[0-3]):([0-5]\d)$/;function z(e){let t=Xe.exec(String(e??``).trim());return t?Number(t[1])*60+Number(t[2]):null}function Ze(e){let t=e.trim().replace(/[.,h ]/g,`:`),n,r,i=/^(\d{1,2}):(\d{1,2})$/.exec(t),a=/^(\d{1,4})$/.exec(t);if(i)n=Number(i[1]),r=Number(i[2]);else if(a){let e=a[1];n=Number(e.length<=2?e:e.slice(0,e.length-2)),r=e.length<=2?0:Number(e.slice(-2))}else return e;return n>23||r>59?e:`${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}function B(e){let t=(Math.floor(e)%R+R)%R;return`${String(Math.floor(t/60)).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function Qe(e){return(e??[]).map(e=>({start:z(e.start),scene:e.scene})).filter(e=>e.start!==null&&!!e.scene).sort((e,t)=>e.start-t.start)}function $e(e,t,n){let r=typeof t==`number`?t:z(t);if(r===null)return null;let i=Qe(e),a=null;for(let e of i)if(e.start<=r)a=e.scene;else break;if(a!==null)return a;let o=Qe(n??e);return o.length?o[o.length-1].scene:null}function et(e,t){let n=Qe(e);if(!n.length)return[];let r=[];if(n[0].start>0){let i=$e(e,0,t);i&&r.push({from:0,to:n[0].start,scene:i})}return n.forEach((e,t)=>{let i=t+1<n.length?n[t+1].start:R;i>e.start&&r.push({from:e.start,to:i,scene:e.scene})}),r.reduce((e,t)=>{let n=e[e.length-1];return n&&n.scene===t.scene&&n.to===t.from?n.to=t.to:e.push({...t}),e},[])}function tt(e,t){let n=[];if(!e||e.length===0)return[{index:-1,code:`empty`}];let r=null;return e.forEach((e,i)=>{let a=z(e.start);a===null?n.push({index:i,code:`time_format`}):(r!==null&&a<=r&&n.push({index:i,code:`not_ascending`}),r=a),e.scene?t&&!t.includes(e.scene)&&n.push({index:i,code:`scene_unknown`}):n.push({index:i,code:`scene_missing`})}),n}var nt={ä:`ae`,ö:`oe`,ü:`ue`,ß:`ss`};function V(e,t=[],n=`eintrag`){let r=String(e??``).toLowerCase().replace(/[äöüß]/g,e=>nt[e]??e).normalize(`NFD`).replace(/[̀-ͯ]/g,``).replace(/[^a-z0-9]+/g,`_`).replace(/^_+|_+$/g,``);r||=n;let i=new Set(t);if(!i.has(r))return r;let a=2;for(;i.has(`${r}_${a}`);)a++;return`${r}_${a}`}function rt(e){return e.startsWith(`de`)?`,`:`.`}function H(e,t,n=1){if(e==null||!Number.isFinite(e))return`–`;let r=e.toFixed(n);return rt(t)===`,`?r.replace(`.`,`,`):r}function U(e,t){let n=H(e,t,1);return n===`–`?n:`${n} °C`}function it(e,t,n=!1){let r=H(e,t,1);return r===`–`?r:`${n&&e>0?`+`:``}${r} K`}function at(e){if(e==null||!Number.isFinite(e))return`–`;let t=Math.max(0,Math.round(e));if(t<60)return`${t} min`;let n=Math.floor(t/60),r=t%60;return r?`${n} h ${r} min`:`${n} h`}var W=/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;function G(e){if(!e)return`–`;let t=W.exec(e);if(t)return`${t[4]}:${t[5]}`;let n=z(e);return n===null?`–`:B(n)}function ot(e,t){let n=e?W.exec(e):null;return n?t.startsWith(`de`)?`${n[3]}.${n[2]}.`:`${n[2]}/${n[3]}`:``}function st(e){let t=e?W.exec(e):null;return t?`${t[1]}-${t[2]}-${t[3]}`:null}function ct(e){let t=e?W.exec(e):null;return t?Number(t[4])*60+Number(t[5]):null}function K(e,t,n){let r=G(e);if(r===`–`)return r;let i=st(e);if(i&&t&&i===st(t))return r;let a=ot(e,n);return a?`${a} ${r}`:r}function lt(e){return(e??[]).map((e,t)=>({e,i:t,t:Date.parse(e.time)})).sort((e,t)=>{let n=Number.isNaN(e.t)?-1/0:e.t;return(Number.isNaN(t.t)?-1/0:t.t)-n||t.i-e.i}).map(e=>e.e)}function ut(e){if(!e)return{};if(Array.isArray(e)){let[t,n]=e;return{min:Number.isFinite(t)?t:void 0,max:Number.isFinite(n)?n:void 0}}let t={};return typeof e.min==`number`&&(t.min=e.min),typeof e.max==`number`&&(t.max=e.max),typeof e.step==`number`&&(t.step=e.step),t}function dt(e){return Array.isArray(e)?e.length>=2&&e.every(e=>typeof e==`number`):!!e&&typeof e==`object`&&(`min`in e||`max`in e)}function ft(e){let t=e?.limits;if(!t||typeof t!=`object`)return{};let n={};for(let[e,r]of Object.entries(t))dt(r)&&(n[e]=r);let r=t.parameters;if(r&&typeof r==`object`&&!dt(r))for(let[e,t]of Object.entries(r))dt(t)&&(n[e]=t);return n}function pt(e,t){return!(!Number.isFinite(e)||t.min!==void 0&&e<t.min||t.max!==void 0&&e>t.max)}function mt(e){let t=String(e??`de`).toLowerCase();return t.startsWith(`de`)||t===``?`de`:`en`}function q(e){return e===void 0?e:JSON.parse(JSON.stringify(e))}function ht(e,t){return J(e)===J(t)}function J(e){if(typeof e!=`object`||!e)return JSON.stringify(e)??`null`;if(Array.isArray(e))return`[${e.map(J).join(`,`)}]`;let t=e;return`{${Object.keys(t).filter(e=>t[e]!==void 0).sort().map(e=>`${JSON.stringify(e)}:${J(t[e])}`).join(`,`)}}`}var gt=[`#e8590c`,`#1c7ed6`,`#2f9e44`,`#7048e8`,`#0c8599`,`#f08c00`,`#c2255c`,`#5c940d`,`#868e96`];function _t(e,t){let n=t.indexOf(e);return n<0?`#868e96`:gt[n%gt.length]}function vt(e){let t=e??{};return{...t,stove:{...t.stove??{},climate:t.stove?.climate??null,power:t.stove?.power??null,chrono_switch:t.stove?.chrono_switch??null,eco_switch:t.stove?.eco_switch??null,error_sensor:t.stove?.error_sensor??null,water_sensor:t.stove?.water_sensor??null,ignitions_sensor:t.stove?.ignitions_sensor??null},weather:t.weather??null,outdoor_sensor:t.outdoor_sensor??null,workday:t.workday??null,persons:t.persons??[],pet:t.pet??null,notify:t.notify??[],rooms:(t.rooms??[]).map(e=>({...e,importance:e.importance??2,radiators:e.radiators??[],temperature_sensors:e.temperature_sensors??[],openings:e.openings??[],presence:e.presence??[],paused:e.paused??[],targets:e.targets??{}})),scenes:t.scenes??[],day_types:(t.day_types??[]).map(e=>({...e,slots:e.slots??[]})),week:t.week??{},parameters:t.parameters??{},mode:t.mode??`shadow`}}function Y(e){if(!e)return``;if(typeof e==`string`)return e;if(typeof e==`object`){let t=e;if(typeof t.message==`string`&&t.message)return t.message;if(t.error&&typeof t.error.message==`string`)return t.error.message;if(typeof t.code==`string`)return t.code}return String(e)}var yt=[{kind:`radiators`,icon:`mdi:radiator`,label:`room.radiators`,hint:`room.radiators_hint`,domains:[`climate`]},{kind:`temperature_sensors`,icon:`mdi:thermometer`,label:`room.sensors`,hint:`room.sensors_hint`,domains:[`sensor`],classes:[`temperature`]},{kind:`openings`,icon:`mdi:window-closed-variant`,label:`room.openings`,hint:`room.openings_hint`,domains:[`binary_sensor`],classes:[`door`,`window`,`opening`,`garage_door`]},{kind:`presence`,icon:`mdi:motion-sensor`,label:`room.presence`,hint:`room.presence_hint`,domains:[`binary_sensor`],classes:[`occupancy`,`motion`,`presence`]}],bt=/* @__PURE__ */ new Set([`unavailable`,`unknown`]);function xt(e,t){return t===`temperature_sensors`?e.temperature_sensors.map(e=>e.entity):e[t]}function St(e){return yt.flatMap(t=>xt(e,t.kind))}function Ct(e){return!!e&&!bt.has(e.state)}function wt(e,t,n,r){if(!Ct(e))return n(`dev.unavailable`);let i=e;switch(t){case`radiators`:{let e=Number(i.attributes?.current_temperature),t=Number(i.attributes?.temperature),n=[];return Number.isFinite(e)&&n.push(U(e,r)),Number.isFinite(t)&&n.push(`→ ${U(t,r)}`),n.join(` `)||i.state}case`temperature_sensors`:{let e=i.entity_id.startsWith(`climate.`)?Number(i.attributes?.current_temperature):Number(i.state);return Number.isFinite(e)?U(e,r):i.state}case`openings`:return i.state===`on`?n(`dev.open`):n(`dev.closed`);case`presence`:return i.state===`on`?n(`dev.occupied`):n(`dev.empty`)}}function Tt(e,t){let n=new Set(e.paused??[]);return St(e).filter(e=>!n.has(e)&&!Ct(t?.[e]))}function Et(e,t,n){t===`temperature_sensors`?e.temperature_sensors=e.temperature_sensors.filter(e=>e.entity!==n):e[t]=e[t].filter(e=>e!==n),e.paused=(e.paused??[]).filter(e=>e!==n)}function Dt(e,t,n){xt(e,t).includes(n)||(t===`temperature_sensors`?e.temperature_sensors.push({entity:n,weight:1}):e[t].push(n))}function Ot(e,t){let n=new Set(e.paused??[]);n.has(t)?n.delete(t):n.add(t),e.paused=St(e).filter(e=>n.has(e))}var kt,X=class extends M{constructor(){super(),this.lang=`de`,this.readonly=!1}get t(){return N(this.lang)}change(e){let t=q(this.config);e(t),this.dispatchEvent(new CustomEvent(`config-changed`,{detail:{config:t},bubbles:!0,composed:!0}))}};kt=X,kt.properties={hass:{attribute:!1},config:{attribute:!1},defaults:{attribute:!1},lang:{type:String},readonly:{type:Boolean}};function Z(e){let t=e.target.value.trim().replace(`,`,`.`);if(t===``)return null;let n=Number(t);return Number.isFinite(n)?n:null}var Q=e=>e.target.value,At,jt=class extends X{constructor(){super(),this._selected=null,this._newName=``,this._confirmDelete=!1,this._adding=null}get _room(){let e=this.config.rooms;return e.find(e=>e.id===this._selected)??e[0]}_updateRoom(e,t){this.change(n=>{let r=n.rooms.find(t=>t.id===e);r&&t(r)})}_add(){let e=this._newName.trim();if(!e)return;let t=V(e,this.config.rooms.map(e=>e.id),`raum`);this.change(n=>{n.rooms.push({id:t,name:e,importance:2,radiators:[],temperature_sensors:[],openings:[],presence:[],paused:[],targets:{}})}),this._selected=t,this._newName=``,this._confirmDelete=!1}_delete(e){let t=this.config.rooms.findIndex(t=>t.id===e);this.change(t=>{t.rooms=t.rooms.filter(t=>t.id!==e)});let n=this.config.rooms.filter(t=>t.id!==e);this._selected=n[Math.max(0,t-1)]?.id??null,this._confirmDelete=!1}render(){let e=this.t,t=this._room;return C`
      <div class="layout">
        <div class="card list">
          <h3>${e(`rooms.title`)}</h3>
          ${this.config.rooms.length?C`<div class="items" role="tablist" aria-label=${e(`rooms.select`)}>
                ${this.config.rooms.map(n=>C`<button
                    role="tab"
                    aria-selected=${t?.id===n.id}
                    class="item ${t?.id===n.id?`sel`:``}"
                    @click=${()=>{this._selected=n.id,this._confirmDelete=!1}}
                  >
                    <ha-icon icon="mdi:door"></ha-icon><span>${n.name}</span>
                    ${Tt(n,this.hass.states).length?C`<ha-icon class="warnicon" icon="mdi:alert-circle-outline" title=${e(`dev.unavailable`)}></ha-icon>`:T}
                  </button>`)}
              </div>`:C`<div class="muted">${e(`rooms.none`)}</div>`}
          ${this.readonly?T:C`<form
                class="add"
                @submit=${e=>{e.preventDefault(),this._add()}}
              >
                <input
                  .value=${this._newName}
                  placeholder=${e(`rooms.add_placeholder`)}
                  aria-label=${e(`rooms.add_placeholder`)}
                  @input=${e=>this._newName=Q(e)}
                />
                <button type="submit" ?disabled=${!this._newName.trim()}><ha-icon icon="mdi:plus"></ha-icon>${e(`rooms.add`)}</button>
              </form>`}
        </div>
        ${t?this._renderRoom(t):T}
      </div>
    `}_renderRoom(e){let t=this.t,n=this.readonly,r=Tt(e,this.hass.states);return C`<div class="card editor">
      <div class="head">
        <label class="field grow">
          <span class="lbl">${t(`room.name`)}</span>
          <input
            .value=${e.name}
            ?disabled=${n}
            class=${e.name.trim()?``:`invalid`}
            @change=${t=>this._updateRoom(e.id,e=>e.name=Q(t).trim())}
          />
        </label>
        <label class="field" title=${t(`room.importance_hint`)}>
          <span class="lbl">${t(`room.importance`)}</span>
          <select
            ?disabled=${n}
            @change=${t=>this._updateRoom(e.id,e=>e.importance=Number(Q(t)))}
          >
            ${[1,2,3].map(n=>C`<option value=${n} ?selected=${e.importance===n}>${n} – ${t(`importance.${n}`)}</option>`)}
          </select>
        </label>
        <span class="muted rid">${t(`id`)}: ${e.id}</span>
      </div>

      <div class="row sect">
        <span class="lbl" style="margin:0">${t(`room.devices`)}</span>
        <span class="spacer"></span>
        ${r.length?C`<span class="badge warn">${r.length===1?t(`dev.unavail_one`):t(`dev.unavail_count`,{n:r.length})}</span>
              ${n?T:C`<button class="small" @click=${()=>this._updateRoom(e.id,e=>{for(let t of r)(e.paused??[]).includes(t)||Ot(e,t)})}>
                    <ha-icon icon="mdi:pause"></ha-icon>${t(`dev.pause_unavail`)}
                  </button>`}`:T}
      </div>
      <div class="hint">${t(`room.devices_hint`)}</div>
      <div class="groups">${yt.map(t=>this._renderGroup(e,t))}</div>

      <span class="lbl" style="margin-top:14px">${t(`room.targets`)}</span>
      <div class="hint">${t(`room.targets_hint`)}</div>
      ${this.config.scenes.length?C`<div class="targets">
            ${this.config.scenes.map(t=>C`<label class="target">
                <span>${t.icon?C`<ha-icon icon=${t.icon}></ha-icon>`:T}${t.name}</span>
                <span class="row" style="flex-wrap:nowrap;gap:4px">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="30"
                    ?disabled=${n}
                    placeholder=${String(t.default_target??``)}
                    .value=${e.targets[t.id]===void 0?``:String(e.targets[t.id])}
                    @change=${n=>this._updateRoom(e.id,e=>{let r=Z(n);r===null?delete e.targets[t.id]:e.targets[t.id]=r})}
                  /><span class="muted">°C</span>
                </span>
              </label>`)}
          </div>`:C`<div class="muted">${t(`scenes.none`)}</div>`}

      ${n?T:C`<div style="margin-top:16px">
            ${this._confirmDelete?C`<div class="confirm" role="alertdialog" aria-label=${t(`room.delete`)}>
                  ${t(`room.delete_confirm`,{name:e.name})}
                  <div class="row">
                    <button class="danger solid" @click=${()=>this._delete(e.id)}><ha-icon icon="mdi:delete"></ha-icon>${t(`delete`)}</button>
                    <button @click=${()=>this._confirmDelete=!1}>${t(`cancel`)}</button>
                  </div>
                </div>`:C`<button class="danger" @click=${()=>this._confirmDelete=!0}><ha-icon icon="mdi:delete-outline"></ha-icon>${t(`room.delete`)}</button>`}
          </div>`}
    </div>`}_renderGroup(e,t){let n=this.t,r=this.readonly,i=xt(e,t.kind),a=new Set(e.paused??[]),o=this._adding===`${e.id}:${t.kind}`;return C`<div class="group">
      <div class="ghead" title=${n(t.hint)}>
        <ha-icon icon=${t.icon}></ha-icon>
        <span class="gname">${n(t.label)}</span>
        <span class="muted">${i.length||n(`dev.none`)}</span>
        <span class="spacer"></span>
        ${r?T:C`<button
              class="icon"
              title=${n(`dev.add`)}
              aria-label="${n(`dev.add`)}: ${n(t.label)}"
              @click=${()=>this._adding=o?null:`${e.id}:${t.kind}`}
            >
              <ha-icon icon=${o?`mdi:close`:`mdi:plus`}></ha-icon>
            </button>`}
      </div>
      ${i.map(i=>{let o=this.hass.states[i],s=Ct(o),c=a.has(i),l=t.kind===`temperature_sensors`?e.temperature_sensors.find(e=>e.entity===i)?.weight:void 0;return C`<div class="dev ${c?`paused`:``} ${s?``:`unavail`}">
          <span class="dot" aria-hidden="true"></span>
          <span class="dname">
            <span>${I(this.hass.states,i)}</span>
            <span class="did">${i}</span>
          </span>
          <span class="dval">${c?n(`dev.paused`):wt(o,t.kind,n,this.lang)}</span>
          ${l===void 0?T:C`<input
                class="w"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                title=${n(`room.weight`)}
                aria-label="${n(`room.weight`)}: ${i}"
                ?disabled=${r}
                .value=${String(l)}
                @change=${t=>this._updateRoom(e.id,e=>{let n=e.temperature_sensors.find(e=>e.entity===i),r=Z(t);n&&(n.weight=r===null||r<=0?1:r)})}
              />`}
          ${r?T:C`<button
                  class="icon"
                  title=${n(c?`dev.resume`:`dev.pause`)}
                  aria-label="${n(c?`dev.resume`:`dev.pause`)}: ${i}"
                  @click=${()=>this._updateRoom(e.id,e=>Ot(e,i))}
                >
                  <ha-icon icon=${c?`mdi:play`:`mdi:pause`}></ha-icon>
                </button>
                <button
                  class="icon"
                  title=${n(`remove`)}
                  aria-label="${n(`remove`)}: ${i}"
                  @click=${()=>this._updateRoom(e.id,e=>Et(e,t.kind,i))}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`}
        </div>`})}
      ${o?C`<wr-entity-picker
            class="adder"
            .hass=${this.hass}
            .lang=${this.lang}
            multiple
            .domains=${t.domains}
            .deviceClasses=${t.classes}
            .value=${[]}
            .exclude=${i}
            @value-changed=${n=>{let r=n.detail.value.filter(e=>!i.includes(e));this._updateRoom(e.id,e=>r.forEach(n=>Dt(e,t.kind,n)))}}
          ></wr-entity-picker>`:T}
    </div>`}};At=jt,At.properties={...X.properties,_selected:{state:!0},_newName:{state:!0},_confirmDelete:{state:!0},_adding:{state:!0}},At.styles=[P,o`
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
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
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
      }
      .target input {
        width: 80px;
      }
    `],customElements.get(`wr-rooms-editor`)||customElements.define(`wr-rooms-editor`,jt);function Mt(e,t,n={}){let r=t.map(e=>e.id),i=e=>t.find(t=>t.id===e)?.name??e,a=et(e),o=[...new Set(a.map(e=>e.scene))],s=e=>`${e/R*100}%`;return C`
    <div class="timeline" role="img" aria-label=${a.map(e=>`${B(e.from)} ${i(e.scene)}`).join(`, `)}>
      ${a.map(e=>C`<div
          class="seg"
          style="left:${s(e.from)};width:${s(e.to-e.from)};background:${_t(e.scene,r)}"
          title="${B(e.from)}–${e.to>=1440?`24:00`:B(e.to)} ${i(e.scene)}"
        >
          ${n.labels!==!1&&e.to-e.from>=150?C`<span>${i(e.scene)}</span>`:T}
        </div>`)}
      ${n.nowMinutes!==null&&n.nowMinutes!==void 0?C`<div class="now" style="left:calc(${s(n.nowMinutes)} - 1px)"></div>`:T}
    </div>
    <div class="timeline-scale" aria-hidden="true"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
    ${n.legend?C`<div class="legend">
          ${o.map(e=>C`<span><i style="background:${_t(e,r)}"></i>${i(e)}</span>`)}
        </div>`:T}
  `}function Nt(e,t=!1){return e.status?.mode===`shadow`?C`<div class="banner shadow" role="status">
    <ha-icon icon="mdi:eye-outline"></ha-icon>
    <div>
      <strong>${e.t(`mode.shadow_banner`)}</strong>
      ${t?T:C`<span class="muted">${e.t(`mode.shadow_banner_hint`)}</span>`}
    </div>
  </div>`:T}function Pt(e,t){let{t:n,status:r,config:i}=e,a=i?.scenes??[],o=r?.scene,s=o?.source===`override`,c=!e.isAdmin||e.busy,l=e.isAdmin?``:n(`not_admin`);return C`
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
      ${a.map(e=>{let n=o?.id===e.id;return C`<button
          class="chip ${n?`selected`:``}"
          aria-pressed=${n}
          ?disabled=${c}
          title=${l}
          @click=${()=>!(n&&s)&&t(e.id)}
        >
          ${e.icon?C`<ha-icon icon=${e.icon}></ha-icon>`:T}${e.name}
        </button>`})}
    </div>
    ${o?C`<div class="hint">
          ${o.name}
          ${s&&o.until?C` · ${n(`scene.override_until`,{time:G(o.until)})}`:T}
          ${s?T:C` · ${n(`scene.auto_hint`)}`}
          ${o.next_change&&!s?C` · ${n(`scene.next_change`,{time:G(o.next_change)})}`:T}
          ${r?.day_type?C` · ${n(`day_type.today`,{name:r.day_type.name})}`:T}
        </div>`:T}
  `}function Ft(e,t={}){let{t:n,status:r,lang:i}=e,a=r?.stove;if(!a)return C`<div class="card stove"><h3>${n(`stove.title`)}</h3><div class="muted">${n(`stove.no_status`)}</div></div>`;let o=a.phase===`block`?`mdi:fire`:a.phase===`pause`?`mdi:pause-circle-outline`:a.phase===`blocked`?`mdi:fire-off`:`mdi:fireplace-off`,s=r?.day_type?e.config?.day_types.find(e=>e.id===r.day_type?.id):void 0;return C`<div class="card stove ${a.burning?`burning`:``}">
    <div class="row">
      <ha-icon class="flame" icon=${a.burning?`mdi:fire`:o}></ha-icon>
      <h3 style="margin:0">${n(`stove.title`)}</h3>
      <span class="spacer"></span>
      ${a.available?T:C`<span class="badge warn">${n(`stove.unavailable`)}</span>`}
      ${a.error?C`<span class="badge err">${n(`stove.error_short`)}</span>`:T}
      <span class="badge ${a.burning?`heat`:``}">${a.burning?n(`stove.burning`):n(`stove.not_burning`)}</span>
    </div>
    <div class="phase" style="margin-top:6px">
      ${n(`stove.phase.${a.phase}`)}
      <span class="muted" style="font-size:14px"> · ${n(`stove.action.${a.action}`)}</span>
    </div>
    ${a.reason?C`<div class="muted">${a.reason}</div>`:T}
    <dl class="kv">
      <dt>${n(`stove.starts_today`)}</dt>
      <dd>${a.starts_today??0} / ${a.max_starts_per_day??`–`}</dd>
      ${a.block_start?C`<dt>${n(`stove.block_since`)}</dt><dd>${G(a.block_start)}</dd>`:T}
      ${a.power_level!==null&&a.power_level!==void 0?C`<dt>${n(`stove.power_level`)}</dt><dd>${a.power_level} / 5</dd>`:T}
      ${a.water_c!==null&&a.water_c!==void 0?C`<dt>${n(`stove.water`)}</dt><dd>${U(a.water_c,i)}</dd>`:T}
      ${!t.compact&&a.ignitions!==null&&a.ignitions!==void 0?C`<dt>${n(`stove.ignitions`)}</dt><dd>${a.ignitions.toLocaleString(i.startsWith(`de`)?`de-DE`:`en-US`)}</dd>`:T}
      ${a.pause_until?C`<dt>${n(`stove.pause_until`)}</dt><dd>${K(a.pause_until,r?.now,i)}</dd>`:T}
      ${r?.pellets&&r.pellets.stock_kg!==null&&r.pellets.stock_kg!==void 0?C`<dt>${n(`stove.pellets`)}</dt><dd>${r.pellets.stock_kg.toLocaleString(i.startsWith(`de`)?`de-DE`:`en-US`,{maximumFractionDigits:1})} kg${r.pellets.empty_at?C` · ${n(`stove.pellets_empty`)} ${K(r.pellets.empty_at,r.now,i)}`:T}</dd>`:T}
      ${!t.compact&&r?.house?.outdoor_c!==null&&r?.house?.outdoor_c!==void 0?C`<dt>${n(`house.outdoor`)}</dt><dd>${U(r.house.outdoor_c,i)}</dd>`:T}
      ${!t.compact&&r?.house?.deficit_k!==null&&r?.house?.deficit_k!==void 0?C`<dt>${n(`house.deficit`)}</dt><dd>${it(r.house.deficit_k,i)}</dd>`:T}
    </dl>
    ${t.timeline&&s&&e.config?C`<div style="margin-top:10px">
          <div class="hint">${s.name}</div>
          ${Mt(s.slots,e.config.scenes,{nowMinutes:ct(r?.now),labels:!1,legend:!0})}
        </div>`:T}
  </div>`}function It(e){if(e.temperature===null||e.temperature===void 0||e.target===null||e.target===void 0)return``;let t=e.target-e.temperature;return t>.3?`cold`:t<-.5?`warm`:`ok`}function Lt(e,t){let{t:n,lang:r}=e,i=It(t),a=t.sensors_missing??0;return C`<div class="card room ${i}">
    <div class="row">
      <span class="name">${t.name}</span>
      <span class="spacer"></span>
      ${t.occupied===!0?C`<ha-icon icon="mdi:account" title=${n(`room.occupied`)}></ha-icon>`:T}
    </div>
    <div class="row" style="align-items:baseline">
      <span class="temp">${U(t.temperature,r)}</span>
      <span class="muted">${n(`room.target`)} ${U(t.target,r)}</span>
    </div>
    <div class="row" style="margin-top:4px">
      ${t.radiator_setpoint!==null&&t.radiator_setpoint!==void 0?C`<span class="badge" title=${n(`room.radiator`)}><ha-icon icon="mdi:radiator" style="--mdc-icon-size:14px"></ha-icon>${U(t.radiator_setpoint,r)}</span>`:T}
      ${t.open?C`<span class="badge cold"><ha-icon icon="mdi:window-open-variant" style="--mdc-icon-size:14px"></ha-icon>${t.open_minutes?n(`room.open_for`,{time:at(t.open_minutes)}):n(`room.open`)}</span>`:T}
      ${t.recover_until&&!t.open?C`<span class="badge"><ha-icon icon="mdi:weather-windy" style="--mdc-icon-size:14px"></ha-icon>${n(`room.recovering`,{time:G(t.recover_until)})}</span>`:T}
      ${t.occupied===!0?C`<span class="badge">${n(`room.occupied`)}</span>`:T}
      ${i===`cold`?C`<span class="badge cold">${n(`room.too_cold`)}</span>`:T}
      ${a>0?C`<span class="badge warn">${a===1?n(`room.sensor_missing`):n(`room.sensors_missing`,{n:a})}</span>`:T}
    </div>
  </div>`}function Rt(e,t){let n=e.status?.rooms??[];return t?.length&&(n=t.map(e=>n.find(t=>t.id===e)).filter(e=>!!e)),n.length?C`<div class="grid">${n.map(t=>Lt(e,t))}</div>`:C`<div class="muted">${t?.length?e.t(`card.no_rooms`):e.t(`rooms.none`)}</div>`}function zt(e){switch(e.kind){case`opening`:return`mdi:window-open-variant`;case`sensor`:case`sensors_missing`:return`mdi:thermometer-off`;case`stove`:return`mdi:fireplace-off`;case`chrono`:case`chrono_warning`:return`mdi:timer-alert-outline`;case`eco`:case`eco_warning`:return`mdi:leaf`;case`error`:case`stove_error`:return`mdi:alert-octagon`;default:return`mdi:alert-circle-outline`}}function Bt(e,t){let n=[...e?.alerts??[]],r=e?.stove,i=(...e)=>n.some(t=>e.includes(t.kind));return r?.error&&!i(`error`,`stove_error`)&&n.unshift({kind:`stove_error`,message:t(`stove.error`)}),r?.chrono_warning&&!i(`chrono`,`chrono_warning`)&&n.push({kind:`chrono`,message:t(`stove.chrono_warning`)}),r?.eco_warning&&!i(`eco`,`eco_warning`)&&n.push({kind:`eco`,message:t(`stove.eco_warning`)}),n}function Vt(e,t={}){let n=Bt(e.status,e.t);return n.length?C`<div role="list">
    ${n.map(e=>C`<div class="alert ${e.kind}" role="listitem"><ha-icon icon=${zt(e)}></ha-icon><span>${e.message}</span></div>`)}
  </div>`:t.showEmpty?C`<div class="muted">${e.t(`alerts.none`)}</div>`:T}function Ht(e){let t=e?.overrides;return t&&!!(t.scene||t.pause_until||t.boost)||e?.scene?.source===`override`}function Ut(e){let t=e?.overrides?.boost;return t?typeof t==`number`?t:typeof t==`object`&&t&&typeof t.delta==`number`?t.delta:1:null}function Wt(e,t,n=!1){let{t:r,status:i,lang:a}=e,o=!e.isAdmin||e.busy,s=e.isAdmin?``:r(`not_admin`),c=Ut(i),l=i?.overrides?.pause_until??null;return C`
    <div class="row">
      <button ?disabled=${o} title=${s} @click=${t.boost}>
        <ha-icon icon="mdi:thermometer-plus"></ha-icon>${r(n?`actions.boost_short`:`actions.boost`)}
      </button>
      <button ?disabled=${o} title=${s} @click=${t.pause}>
        <ha-icon icon="mdi:pause"></ha-icon>${r(n?`actions.pause_short`:`actions.pause`)}
      </button>
      ${Ht(i)?C`<button ?disabled=${o} title=${s||r(`actions.clear_hint`)} @click=${t.clear}>
            <ha-icon icon="mdi:undo-variant"></ha-icon>${r(`actions.clear`)}
          </button>`:T}
    </div>
    ${c||l?C`<div class="row" style="margin-top:6px">
          ${c?C`<span class="badge heat">${r(`actions.boost_active`,{delta:String(c).replace(`.`,a.startsWith(`de`)?`,`:`.`)})}</span>`:T}
          ${l?C`<span class="badge">${r(`actions.pause_active`,{time:K(l,i?.now,a)})}</span>`:T}
        </div>`:T}
  `}var Gt,Kt=class extends X{constructor(){super(),this._newName=``,this._confirmDelete=null}_updateDay(e,t){this.change(n=>{let r=n.day_types.find(t=>t.id===e);r&&t(r)})}_add(){let e=this._newName.trim();if(!e)return;let t=V(e,this.config.day_types.map(e=>e.id),`tagesart`),n=this.config.scenes[0]?.id??``;this.change(r=>{r.day_types.push({id:t,name:e,slots:[{start:`06:00`,scene:n}]})}),this._newName=``}_weekUsage(e){return Ye.filter(t=>this.config.week[t]===e)}_addSlot(e){this._updateDay(e.id,e=>{let t=e.slots.length?z(e.slots[e.slots.length-1].start):null,n=t===null?`06:00`:B(Math.min(t+60,1439));e.slots.push({start:n,scene:this.config.scenes[0]?.id??``})})}render(){let e=this.t,t=this.readonly;return C`
      <div class="card">
        <h3>${e(`schedule.week`)}</h3>
        <div class="hint">${e(`schedule.week_hint`)}</div>
        <div class="week">
          ${Ye.map(n=>{let r=this.config.week[n]??``,i=!!r&&!this.config.day_types.some(e=>e.id===r);return C`<label class="field">
              <span class="lbl">${e(`week.${n}`)}</span>
              <select
                ?disabled=${t}
                class=${!r||i?`invalid`:``}
                @change=${e=>this.change(t=>{t.week[n]=Q(e)})}
              >
                ${!r||i?C`<option value="" selected>${e(`week.unset`)}</option>`:T}
                ${this.config.day_types.map(e=>C`<option value=${e.id} ?selected=${e.id===r}>${e.name}</option>`)}
              </select>
            </label>`})}
        </div>
      </div>

      <h3 style="margin-top:16px">${e(`schedule.day_types`)}</h3>
      <div class="hint">${e(`schedule.day_types_hint`)}</div>
      ${this.config.scenes.length?T:C`<div class="banner info">${e(`schedule.no_scenes`)}</div>`}
      <div class="days">${this.config.day_types.map(e=>this._renderDay(e))}</div>

      ${t?T:C`<form
            class="card add"
            @submit=${e=>{e.preventDefault(),this._add()}}
          >
            <input
              .value=${this._newName}
              placeholder=${e(`schedule.add_placeholder`)}
              aria-label=${e(`schedule.add_placeholder`)}
              @input=${e=>this._newName=Q(e)}
            />
            <button type="submit" ?disabled=${!this._newName.trim()}><ha-icon icon="mdi:plus"></ha-icon>${e(`schedule.add`)}</button>
          </form>`}
    `}_renderDay(e){let t=this.t,n=this.readonly,r=this.config.scenes.map(e=>e.id),i=tt(e.slots,r),a=e=>i.filter(t=>t.index===e),o=this._weekUsage(e.id);return C`<div class="card day">
      <div class="row">
        <input
          class="dname ${e.name.trim()?``:`invalid`}"
          .value=${e.name}
          ?disabled=${n}
          aria-label=${t(`room.name`)}
          @change=${t=>this._updateDay(e.id,e=>e.name=Q(t).trim())}
        />
        <span class="muted" style="font-size:12px">${t(`id`)}: ${e.id}</span>
      </div>
      <div style="margin:10px 0">${Mt(e.slots,this.config.scenes,{legend:!0})}</div>
      <div class="slots">
        ${e.slots.map((i,o)=>{let s=a(o),c=s.some(e=>e.code===`time_format`||e.code===`not_ascending`),l=s.some(e=>e.code===`scene_missing`||e.code===`scene_unknown`);return C`<div class="slot">
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
              @change=${t=>this._updateDay(e.id,e=>e.slots[o].start=Ze(Q(t)))}
            />
            <select
              class=${l?`invalid`:``}
              ?disabled=${n}
              @change=${t=>this._updateDay(e.id,e=>e.slots[o].scene=Q(t))}
            >
              ${!i.scene||!r.includes(i.scene)?C`<option value="" selected>${t(`week.unset`)}</option>`:T}
              ${this.config.scenes.map(e=>C`<option value=${e.id} ?selected=${e.id===i.scene}>${e.name}</option>`)}
            </select>
            ${n?T:C`<button
                  class="icon"
                  title=${t(`remove`)}
                  aria-label=${t(`remove`)}
                  @click=${()=>this._updateDay(e.id,e=>e.slots.splice(o,1))}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`}
            ${s.length?C`<div class="error-text full">${s.map(e=>t(`slot.${e.code}`)).join(` `)}</div>`:T}
          </div>`})}
        ${a(-1).length?C`<div class="error-text">${t(`slot.empty`)}</div>`:T}
      </div>
      ${n?T:C`<div class="row" style="margin-top:8px">
            <button ?disabled=${!this.config.scenes.length} @click=${()=>this._addSlot(e)}>
              <ha-icon icon="mdi:clock-plus-outline"></ha-icon>${t(`schedule.add_slot`)}
            </button>
            <span class="spacer"></span>
            <button class="danger" @click=${()=>this._confirmDelete=e.id}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>${t(`schedule.delete_day_type`)}
            </button>
          </div>
          ${this._confirmDelete===e.id?C`<div class="confirm" role="alertdialog">
                ${o.length?C`${t(`schedule.in_use`,{days:o.map(e=>t(`week.${e}`)).join(`, `)})}
                      <div class="row"><button @click=${()=>this._confirmDelete=null}>${t(`close`)}</button></div>`:C`${t(`schedule.delete_confirm`,{name:e.name})}
                      <div class="row">
                        <button
                          class="danger solid"
                          @click=${()=>{this.change(t=>t.day_types=t.day_types.filter(t=>t.id!==e.id)),this._confirmDelete=null}}
                        >
                          <ha-icon icon="mdi:delete"></ha-icon>${t(`delete`)}
                        </button>
                        <button @click=${()=>this._confirmDelete=null}>${t(`cancel`)}</button>
                      </div>`}
              </div>`:T}`}
    </div>`}};Gt=Kt,Gt.properties={...X.properties,_newName:{state:!0},_confirmDelete:{state:!0}},Gt.styles=[P,o`
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
    `],customElements.get(`wr-schedule-editor`)||customElements.define(`wr-schedule-editor`,Kt);var qt,Jt=[`allow`,`frost_only`,`deny`],Yt=class extends X{constructor(){super(),this._newName=``,this._confirmDelete=null}_updateScene(e,t){this.change(n=>{let r=n.scenes.find(t=>t.id===e);r&&t(r)})}_add(){let e=this._newName.trim();if(!e)return;let t=V(e,this.config.scenes.map(e=>e.id),`szene`);this.change(n=>n.scenes.push({id:t,name:e,icon:`mdi:thermometer`,stove:`allow`,default_target:20})),this._newName=``}_usedIn(e){return this.config.day_types.filter(t=>t.slots.some(t=>t.scene===e)).map(e=>e.name)}_delete(e){this.change(t=>{t.scenes=t.scenes.filter(t=>t.id!==e);for(let n of t.rooms)delete n.targets[e]}),this._confirmDelete=null}render(){let e=this.t,t=this.readonly,n=this.config.scenes.map(e=>e.id);return C`
      <div class="hint">${e(`scenes.hint`)}</div>
      <div class="scenes">
        ${this.config.scenes.map(r=>{let i=this._usedIn(r.id);return C`<div class="card scene" style="border-top:4px solid ${_t(r.id,n)}">
            <div class="row">
              ${r.icon?C`<ha-icon icon=${r.icon}></ha-icon>`:T}
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
                  @change=${e=>this._updateScene(r.id,t=>t.name=Q(e).trim())}
                />
              </label>
              <label class="field">
                <span class="lbl">${e(`scene.icon`)}</span>
                <input
                  .value=${r.icon??``}
                  ?disabled=${t}
                  placeholder=${e(`scene.icon_hint`)}
                  @change=${e=>this._updateScene(r.id,t=>t.icon=Q(e).trim())}
                />
              </label>
              <label class="field">
                <span class="lbl">${e(`scene.stove`)}</span>
                <select ?disabled=${t} @change=${e=>this._updateScene(r.id,t=>t.stove=Q(e))}>
                  ${Jt.map(t=>C`<option value=${t} ?selected=${r.stove===t}>${e(`scene.stove.${t}`)}</option>`)}
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
                    @change=${e=>{let t=Z(e);t!==null&&this._updateScene(r.id,e=>e.default_target=t)}}
                  /><span class="muted">°C</span>
                </span>
              </label>
            </div>
            ${t?T:this._confirmDelete===r.id?C`<div class="confirm" role="alertdialog">
                    ${i.length?C`${e(`scene.in_use`,{names:i.join(`, `)})}
                          <div class="row"><button @click=${()=>this._confirmDelete=null}>${e(`close`)}</button></div>`:C`${e(`scene.delete_confirm`,{name:r.name})}
                          <div class="row">
                            <button class="danger solid" @click=${()=>this._delete(r.id)}><ha-icon icon="mdi:delete"></ha-icon>${e(`delete`)}</button>
                            <button @click=${()=>this._confirmDelete=null}>${e(`cancel`)}</button>
                          </div>`}
                  </div>`:C`<button class="danger" @click=${()=>this._confirmDelete=r.id}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>${e(`scene.delete`)}
                  </button>`}
          </div>`})}
      </div>
      ${this.config.scenes.length?T:C`<div class="muted">${e(`scenes.none`)}</div>`}
      ${t?T:C`<form
            class="card add"
            @submit=${e=>{e.preventDefault(),this._add()}}
          >
            <input
              .value=${this._newName}
              placeholder=${e(`scenes.add_placeholder`)}
              aria-label=${e(`scenes.add_placeholder`)}
              @input=${e=>this._newName=Q(e)}
            />
            <button type="submit" ?disabled=${!this._newName.trim()}><ha-icon icon="mdi:plus"></ha-icon>${e(`scenes.add`)}</button>
          </form>`}
      ${this.config.rooms.length&&this.config.scenes.length?this._renderMatrix():T}
    `}_renderMatrix(){let e=this.t,t=this.readonly;return C`<div class="card" style="margin-top:16px">
      <h3>${e(`scenes.matrix`)}</h3>
      <div class="hint">${e(`scenes.matrix_hint`)}</div>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th></th>
              ${this.config.scenes.map(e=>C`<th scope="col">${e.name}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${this.config.rooms.map(e=>C`<tr>
                <th scope="row">${e.name}</th>
                ${this.config.scenes.map(n=>C`<td>
                    <input
                      type="number"
                      step="0.5"
                      min="5"
                      max="30"
                      ?disabled=${t}
                      aria-label="${e.name} – ${n.name}"
                      placeholder=${String(n.default_target??``)}
                      .value=${e.targets[n.id]===void 0?``:String(e.targets[n.id])}
                      @change=${t=>this.change(r=>{let i=r.rooms.find(t=>t.id===e.id);if(!i)return;let a=Z(t);a===null?delete i.targets[n.id]:i.targets[n.id]=a})}
                    />
                  </td>`)}
              </tr>`)}
          </tbody>
        </table>
      </div>
    </div>`}};qt=Yt,qt.properties={...X.properties,_newName:{state:!0},_confirmDelete:{state:!0}},qt.styles=[P,o`
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
    `],customElements.get(`wr-scenes-editor`)||customElements.define(`wr-scenes-editor`,Yt);var Xt,Zt=[{group:`pgroup.stove`,params:[{key:`start_below_k`,unit:`K`,step:.1},{key:`stop_above_k`,unit:`K`,step:.1},{key:`min_burn_min`,unit:`min`,step:5},{key:`max_burn_min`,unit:`min`,step:5},{key:`min_pause_min`,unit:`min`,step:5},{key:`max_starts_per_day`,unit:``,step:1},{key:`stove_block_setpoint_c`,unit:`°C`,step:.5}]},{group:`pgroup.openings`,params:[{key:`opening_grace_min`,unit:`min`,step:1},{key:`opening_stop_min`,unit:`min`,step:1},{key:`opening_empty_room_min`,unit:`min`,step:1},{key:`opening_recovery_min`,unit:`min`,step:1}]},{group:`pgroup.power`,params:[{key:`power_min`,unit:``,step:1},{key:`power_max`,unit:``,step:1},{key:`power_cold_c`,unit:`°C`,step:.5}]},{group:`pgroup.radiators`,params:[{key:`radiator_boost_k`,unit:`K`,step:.1}]},{group:`pgroup.limits`,params:[{key:`frost_c`,unit:`°C`,step:.5},{key:`night_floor_c`,unit:`°C`,step:.5}]},{group:`pgroup.presence`,params:[{key:`presence_empty_min`,unit:`min`,step:5}]},{group:`pgroup.pellets`,params:[{key:`pellet_bag_kg`,unit:`kg`,step:.5},{key:`pellet_capacity_kg`,unit:`kg`,step:1},{key:`pellet_rate_kg_h`,unit:`kg/h`,step:.05},{key:`pellet_reminder_kg`,unit:`kg`,step:.5}]}],Qt=new Set(Zt.flatMap(e=>e.params.map(e=>e.key)));function $t(e){return e.endsWith(`_k`)?`K`:e.endsWith(`_c`)?`°C`:e.endsWith(`_min`)?`min`:``}function en(e,t){let n=ft(t),r=e.parameters??{},i=Object.entries(r).filter(([e,t])=>!pt(t,ut(n[e]))).map(([e])=>e);return typeof r.power_min==`number`&&typeof r.power_max==`number`&&r.power_min>r.power_max&&!i.includes(`power_min`)&&i.push(`power_min`),i}var tn=class extends X{_set(e){this.change(e)}_picker(e){return C`<wr-entity-picker
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
    ></wr-entity-picker>`}render(){let e=this.t,t=this.config;return C`
      <div class="cols">
        <div class="card">
          <h3>${e(`house.stove`)}</h3>
          ${this._picker({label:`house.stove_climate`,hint:`house.stove_climate_hint`,domains:[`climate`],value:t.stove.climate,required:t.mode===`active`,onChange:(e,t)=>e.stove.climate=t})}
          ${t.stove.climate?T:C`<div class="hint" style="margin-top:-8px">${e(`house.stove_climate_active_hint`)}</div>`}
          ${this._picker({label:`house.power`,hint:`house.power_hint`,domains:[`select`,`input_select`,`number`,`input_number`],value:t.stove.power,onChange:(e,t)=>e.stove.power=t})}
        </div>
        <div class="card">
          <h3>${e(`house.stove_functions`)}</h3>
          <div class="banner info" style="margin-bottom:12px;font-size:13px">${e(`house.stove_functions_hint`)}</div>
          ${this._picker({label:`house.chrono_switch`,hint:`house.chrono_switch_hint`,domains:[`switch`],value:t.stove.chrono_switch,onChange:(e,t)=>e.stove.chrono_switch=t})}
          ${this._picker({label:`house.eco_switch`,hint:`house.eco_switch_hint`,domains:[`switch`],value:t.stove.eco_switch,onChange:(e,t)=>e.stove.eco_switch=t})}
          ${this._picker({label:`house.error_sensor`,hint:`house.error_sensor_hint`,domains:[`binary_sensor`],deviceClasses:[`problem`],value:t.stove.error_sensor,onChange:(e,t)=>e.stove.error_sensor=t})}
          ${this._picker({label:`house.water_sensor`,hint:`house.water_sensor_hint`,domains:[`sensor`],deviceClasses:[`temperature`],value:t.stove.water_sensor,onChange:(e,t)=>e.stove.water_sensor=t})}
          ${this._picker({label:`house.ignitions_sensor`,hint:`house.ignitions_sensor_hint`,domains:[`sensor`],value:t.stove.ignitions_sensor,onChange:(e,t)=>e.stove.ignitions_sensor=t})}
        </div>
        <div class="card">
          <h3>${e(`house.environment`)}</h3>
          ${this._picker({label:`house.weather`,hint:`house.weather_hint`,domains:[`weather`],value:t.weather,onChange:(e,t)=>e.weather=t})}
          ${this._picker({label:`house.outdoor_sensor`,hint:`house.outdoor_sensor_hint`,domains:[`sensor`],deviceClasses:[`temperature`],value:t.outdoor_sensor,onChange:(e,t)=>e.outdoor_sensor=t})}
          ${this._picker({label:`house.workday`,hint:`house.workday_hint`,domains:[`binary_sensor`],value:t.workday,onChange:(e,t)=>e.workday=t})}
        </div>
        <div class="card">
          <h3>${e(`house.people`)}</h3>
          ${this._picker({label:`house.persons`,hint:`house.persons_hint`,domains:[`person`],value:t.persons,multiple:!0,onChange:(e,t)=>e.persons=t})}
          ${this._picker({label:`house.pet`,hint:`house.pet_hint`,domains:[`binary_sensor`,`device_tracker`,`person`],value:t.pet,onChange:(e,t)=>e.pet=t})}
          ${this._renderNotify()}
        </div>
      </div>
      ${this._renderParameters()}
    `}_renderNotify(){let e=this.t,t=Ke(this.hass?.services),n=this.config.notify??[],r=[...t,...n.filter(e=>!t.includes(e))];return C`<div class="lbl">${e(`house.notify`)}</div>
      <div class="hint">${e(`house.notify_hint`)}</div>
      ${r.length?C`<div class="notify">
            ${r.map(r=>{let i=!t.includes(r);return C`<label class="check">
                <input
                  type="checkbox"
                  ?disabled=${this.readonly}
                  .checked=${n.includes(r)}
                  @change=${e=>{let t=e.target.checked;this._set(e=>{let n=(e.notify??[]).filter(e=>e!==r);e.notify=t?[...n,r]:n})}}
                />
                <span>${r}${i?C` <span class="badge warn">${e(`house.notify_unknown`)}</span>`:T}</span>
              </label>`})}
          </div>`:C`<div class="muted">${e(`house.notify_none`)}</div>`}`}_renderParameters(){let e=this.t,t=this.config.parameters??{},n=Object.keys(t).filter(e=>!Qt.has(e)),r=[...Zt];return n.length&&r.push({group:`pgroup.other`,params:n.map(e=>({key:e,unit:$t(e),step:.1}))}),C`<div class="card" style="margin-top:16px">
      <h3>${e(`house.parameters`)}</h3>
      <div class="hint">${e(`house.parameters_hint`)}</div>
      ${r.map(n=>{let r=n.params.filter(e=>e.key in t||this.defaults?.parameters?.[e.key]!==void 0);return r.length?C`<h4 style="margin-top:14px">${e(n.group)}</h4>
          <div class="params">${r.map(e=>this._renderParam(e))}</div>`:T})}
    </div>`}_renderParam(e){let t=this.t,n=this.config.parameters?.[e.key],r=this.defaults?.parameters?.[e.key],i=ut(ft(this.defaults)[e.key]),a=en(this.config,this.defaults).includes(e.key),o=`param.${e.key}`,s=`param.${e.key}_hint`,c=t(o)===o?e.key:t(o),l=t(s)===s?``:t(s),u=+(e.step<1);return C`<label class="param">
      <span class="ptext">
        <span class="lbl">${c}</span>
        ${l?C`<span class="hint">${l}</span>`:T}
        ${a||i.min!==void 0||i.max!==void 0?C`<span class=${a?`error-text`:`hint`}
              >${t(`house.out_of_range`,{min:i.min===void 0?`–`:H(i.min,this.lang,u),max:i.max===void 0?`–`:H(i.max,this.lang,u)})}${e.unit?` ${e.unit}`:``}</span
            >`:T}
      </span>
      <span class="pinput">
        <input
          type="number"
          class=${a?`invalid`:``}
          ?disabled=${this.readonly}
          step=${i.step??e.step}
          min=${i.min??T}
          max=${i.max??T}
          placeholder=${r===void 0?``:String(r)}
          .value=${n==null?``:String(n)}
          @change=${t=>{let n=Z(t);this._set(t=>{t.parameters=t.parameters??{},n===null?r===void 0?delete t.parameters[e.key]:t.parameters[e.key]=r:t.parameters[e.key]=n})}}
        />
        <span class="unit">${e.unit}</span>
      </span>
    </label>`}};Xt=tn,Xt.styles=[P,o`
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
    `],customElements.get(`wr-house-editor`)||customElements.define(`wr-house-editor`,tn);var nn,rn=[{id:`overview`,icon:`mdi:view-dashboard-outline`},{id:`rooms`,icon:`mdi:floor-plan`},{id:`schedule`,icon:`mdi:calendar-clock`},{id:`scenes`,icon:`mdi:palette-outline`},{id:`house`,icon:`mdi:fireplace`},{id:`log`,icon:`mdi:format-list-bulleted`}],an=[`rooms`,`schedule`,`scenes`,`house`],on={rooms:[`rooms`],schedule:[`day_types`,`week`],scenes:[`scenes`],house:`rest`},sn=/* @__PURE__ */ new Set([`rooms`,`day_types`,`week`,`scenes`,`mode`]);function cn(e,t){let n=0,r=e.scenes.map(e=>e.id),i=e.day_types.map(e=>e.id);for(let t of e.day_types)n+=tt(t.slots,r).length,t.name.trim()||n++;for(let t of e.rooms)t.name.trim()||n++;for(let t of e.scenes)t.name.trim()||n++;for(let t of Ye)e.week[t]&&i.includes(e.week[t])||n++;return n+=en(e,t).length,n}var $=class extends M{constructor(){super(),this._unsub=null,this._connection=null,this._loading=!1,this._beforeUnload=e=>{this._dirty&&(e.preventDefault(),e.returnValue=``)},this.narrow=!1,this._tab=`overview`,this._saved=null,this._draft=null,this._defaults=null,this._status=null,this._loadError=null,this._saving=!1,this._saveMsg=null,this._busy=!1,this._actionError=null,this._modeConfirm=null}get _lang(){return mt(this.hass?.locale?.language??this.hass?.language)}get _t(){return N(this._lang)}get _isAdmin(){return this.hass?.user?.is_admin!==!1}get _dirty(){return!!this._draft&&!!this._saved&&!ht(this._draft,this._saved)}_tabDirty(e){if(!this._dirty||!this._draft||!this._saved)return!1;let t=on[e];if(!t)return!1;let n=e=>Object.fromEntries(t===`rest`?Object.entries(e).filter(([e])=>!sn.has(e)):t.map(t=>[t,e[t]]));return!ht(n(this._draft),n(this._saved))}connectedCallback(){super.connectedCallback(),window.addEventListener(`beforeunload`,this._beforeUnload),this.hass&&this._ensureData()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`beforeunload`,this._beforeUnload),this._unsub?.(),this._unsub=null,this._connection=null}willUpdate(e){if(e.has(`route`)&&this.route?.path){let e=this.route.path.replace(/^\//,``).split(`/`)[0];rn.some(t=>t.id===e)&&e!==this._tab&&(this._tab=e)}e.has(`hass`)&&this.hass&&this._ensureData()}_ensureData(){this.isConnected&&this.hass?.connection&&(this._connection!==this.hass.connection&&(this._unsub?.(),this._connection=this.hass.connection,this._unsub=ze(this.hass,e=>this._status=e,e=>this._loadError=Y(e))),this._saved||this._loading||this._loadError||this._load())}async _load(){this._loading=!0;try{let e=await Ne(this.hass);this._saved=vt(e.config),this._draft=q(this._saved),this._defaults=e.defaults??{},this._loadError=null}catch(e){this._loadError=Y(e)||this._t(`load_error`)}finally{this._loading=!1}}_retry(){this._loadError=null,this._connection=null,this._unsub?.(),this._unsub=null,this._ensureData()}_selectTab(e){this._tab=e,this._saveMsg=this._saveMsg?.ok?null:this._saveMsg;let t=this.route?.prefix;if(t)try{history.replaceState(history.state,``,`${t}/${e}`)}catch{}}async _action(e){this._busy=!0,this._actionError=null;try{let t=await e();t&&typeof t==`object`&&`mode`in t&&(this._status=t)}catch(e){this._actionError=Y(e)}finally{this._busy=!1}}async _changeMode(e){this._modeConfirm=null,await this._action(async()=>{let t=await Re(this.hass,e);return this._saved&&={...this._saved,mode:e},this._draft&&={...this._draft,mode:e},t})}async _save(){if(!this._draft)return;this._saving=!0,this._saveMsg=null;let e=this._t;try{let t={...q(this._draft),mode:this._status?.mode??this._draft.mode},n=await Pe(this.hass,t);this._saved=vt(n?.config??t),this._draft=q(this._saved),this._saveMsg={ok:!0,text:e(`editor.save_ok`)}}catch(t){this._saveMsg={ok:!1,text:e(`editor.save_error`,{message:Y(t)})}}finally{this._saving=!1}}_discard(){this._saved&&(this._draft=q(this._saved)),this._saveMsg=null}_menu(){this.dispatchEvent(new CustomEvent(`hass-toggle-menu`,{bubbles:!0,composed:!0}))}render(){let e=this._t;return C`
      <div class="toolbar">
        ${this.narrow?C`<button class="icon menu" title=${e(`menu`)} aria-label=${e(`menu`)} @click=${this._menu}>
              <ha-icon icon="mdi:menu"></ha-icon>
            </button>`:T}
        <ha-icon icon="mdi:fireplace" class="logo"></ha-icon>
        <span class="title">${e(`title`)}</span>
        <span class="spacer"></span>
        ${this._status?C`<span class="badge ${this._status.mode===`active`?`ok`:`warn`}">
              ${this._status.mode===`active`?e(`mode.active`):e(`mode.shadow`)}
            </span>`:T}
        ${this._dirty?C`<span class="badge warn" title=${e(`editor.unsaved`)}>●</span>`:T}
      </div>
      <nav class="tabs" role="tablist">
        ${rn.map(t=>C`<button
            role="tab"
            aria-selected=${this._tab===t.id}
            class="tab ${this._tab===t.id?`active`:``}"
            @click=${()=>this._selectTab(t.id)}
          >
            <ha-icon icon=${t.icon}></ha-icon><span>${e(`tab.${t.id}`)}</span>
            ${an.includes(t.id)&&this._tabDirty(t.id)?C`<i class="dot" aria-hidden="true"></i>`:T}
          </button>`)}
      </nav>
      <main>${this._renderBody()}</main>
      ${an.includes(this._tab)&&this._draft?this._renderSaveBar():T}
    `}_renderBody(){let e=this._t;if(this._loadError&&!this._saved)return C`<div class="banner error">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <div>
          <strong>${e(`load_error`)}</strong>
          <span class="muted">${this._loadError}</span>
          <div style="margin-top:8px"><button @click=${this._retry}>${e(`retry`)}</button></div>
        </div>
      </div>`;if(!this._draft)return C`<div class="muted">${e(`loading`)}</div>`;let t=!this._isAdmin,n={hass:this.hass,config:this._draft,defaults:this._defaults??{},lang:this._lang,readonly:t},r=e=>{this._draft=e.detail.config,this._saveMsg?.ok&&(this._saveMsg=null)},i=t?C`<div class="banner info" style="margin-bottom:12px">${e(`not_admin`)}</div>`:T;switch(this._tab){case`overview`:return this._renderOverview();case`rooms`:return C`${i}<wr-rooms-editor
            .hass=${n.hass}
            .config=${n.config}
            .defaults=${n.defaults}
            .lang=${n.lang}
            ?readonly=${t}
            @config-changed=${r}
          ></wr-rooms-editor>`;case`schedule`:return C`${i}<wr-schedule-editor
            .hass=${n.hass}
            .config=${n.config}
            .defaults=${n.defaults}
            .lang=${n.lang}
            ?readonly=${t}
            @config-changed=${r}
          ></wr-schedule-editor>`;case`scenes`:return C`${i}<wr-scenes-editor
            .hass=${n.hass}
            .config=${n.config}
            .defaults=${n.defaults}
            .lang=${n.lang}
            ?readonly=${t}
            @config-changed=${r}
          ></wr-scenes-editor>`;case`house`:return C`${i}<wr-house-editor
            .hass=${n.hass}
            .config=${n.config}
            .defaults=${n.defaults}
            .lang=${n.lang}
            ?readonly=${t}
            @config-changed=${r}
          ></wr-house-editor>`;case`log`:return this._renderLog()}}_ctx(){return{t:this._t,lang:this._lang,status:this._status,config:this._saved,isAdmin:this._isAdmin,busy:this._busy}}_renderOverview(){let e=this._t,t=this._ctx();return this._status?C`
      <div class="stack">
        ${Nt(t)}
        ${this._actionError?C`<div class="banner error" role="alert">
              <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
              <div style="flex:1">${this._actionError}</div>
              <button class="icon" aria-label=${e(`close`)} @click=${()=>this._actionError=null}><ha-icon icon="mdi:close"></ha-icon></button>
            </div>`:T}
        <div class="top">
          <div class="card">
            <h3>${e(`scene.title`)}</h3>
            ${Pt(t,e=>this._action(()=>Fe(this.hass,e,180)))}
            <div class="hint">${e(`scene.override_hint`)}</div>
          </div>
          ${this._renderModeSwitch()}
        </div>
        <div class="mid">
          ${Ft(t,{timeline:!0})}
          <div class="card">
            <h3>${e(`actions.title`)}</h3>
            ${Wt(t,{boost:()=>this._action(()=>Le(this.hass,1,60)),pause:()=>this._action(()=>Ie(this.hass,120)),clear:()=>this._action(()=>Be(this.hass,this._status))})}
          </div>
          <div class="card">
            <h3>${e(`alerts.title`)}</h3>
            ${Vt(t,{showEmpty:!0})}
          </div>
        </div>
        <h3 style="margin:8px 0 0">${e(`rooms.title`)}</h3>
        ${Rt(t)}
      </div>
    `:this._loadError?C`<div class="banner error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <div><strong>${e(`load_error`)}</strong> <span class="muted">${this._loadError}</span>
              <div style="margin-top:8px"><button @click=${this._retry}>${e(`retry`)}</button></div></div>
          </div>`:C`<div class="muted">${e(`loading`)}</div>`}_renderModeSwitch(){let e=this._t,t=this._status?.mode??`shadow`,n=!this._isAdmin||this._busy,r=e=>{e!==t&&(this._modeConfirm=e)};return C`<div class="card mode">
      <h3>${e(`mode.label`)}</h3>
      <div class="seg" role="radiogroup" aria-label=${e(`mode.label`)}>
        ${[`shadow`,`active`].map(i=>C`<button
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
      ${this._modeConfirm?C`<div class="confirm" role="alertdialog">
            ${this._modeConfirm===`active`?e(`mode.confirm_active`):e(`mode.confirm_shadow`)}
            <div class="row">
              <button class="primary" ?disabled=${this._busy} @click=${()=>this._changeMode(this._modeConfirm)}>
                ${this._modeConfirm===`active`?e(`mode.confirm_yes_active`):e(`mode.confirm_yes_shadow`)}
              </button>
              <button @click=${()=>this._modeConfirm=null}>${e(`cancel`)}</button>
            </div>
          </div>`:T}
    </div>`}_renderLog(){let e=this._t,t=lt(this._status?.log);return t.length?C`<div class="card">
      <h3>${e(`log.title`)}</h3>
      <ol class="log">
        ${t.map(t=>C`<li class=${t.shadow?`shadow`:``}>
            <span class="time">${K(t.time,this._status?.now,this._lang)}</span>
            <span class="text">${t.text}</span>
            ${t.shadow?C`<span class="badge warn" title=${e(`log.shadow_hint`)}>${e(`log.shadow`)}</span>`:T}
          </li>`)}
      </ol>
    </div>`:C`<div class="card muted">${e(`log.empty`)}</div>`}_renderSaveBar(){let e=this._t,t=this._dirty,n=this._draft?cn(this._draft,this._defaults):0;return C`<div class="savebar ${t?`dirty`:``}" role="region" aria-live="polite">
      <div class="msg">
        ${this._saveMsg?.ok?C`<span class="ok">${this._saveMsg.text}</span>`:t?C`<strong>${e(`editor.unsaved`)}</strong>${n?C`<span class="error-text">${e(`editor.fix_errors`)}</span>`:T}${this._saveMsg&&!this._saveMsg.ok?C`<span class="error-text" role="alert">${this._saveMsg.text}</span>`:T}`:C`<span class="muted">${e(`editor.saved`)}</span>`}
      </div>
      <div class="row">
        <button ?disabled=${!t||this._saving} @click=${this._discard}><ha-icon icon="mdi:undo"></ha-icon>${e(`editor.discard`)}</button>
        <button class="primary" ?disabled=${!t||this._saving||n>0||!this._isAdmin} @click=${this._save}>
          <ha-icon icon="mdi:content-save"></ha-icon>${this._saving?e(`editor.saving`):e(`editor.save`)}
        </button>
      </div>
    </div>`}};nn=$,nn.properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},_tab:{state:!0},_saved:{state:!0},_draft:{state:!0},_defaults:{state:!0},_status:{state:!0},_loadError:{state:!0},_saving:{state:!0},_saveMsg:{state:!0},_busy:{state:!0},_actionError:{state:!0},_modeConfirm:{state:!0}},nn.styles=[P,o`
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
      .top {
        display: grid;
        gap: 16px;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      }
      .mid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
        align-items: start;
      }
      @media (max-width: 760px) {
        .top {
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
    `],customElements.get(`waermeregie-panel`)||customElements.define(`waermeregie-panel`,$);export{$ as WaermeregiePanel,cn as draftProblems};