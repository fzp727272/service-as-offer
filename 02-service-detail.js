const D={"file": "02-service-detail.html", "num": "02", "title": "服务详情", "mode": "了解服务", "sub": "先确认适用范围、包含内容和服务方式，再决定是否购买。", "cta": "购买", "next": "05-order-checkout.html", "sections": [{"type": "hero", "image": "服务主图", "ratio": "4/3", "title": "自行车标准保养套餐", "facts": [["适用装备", "自行车"], ["服务方式", "到店服务"], ["包含内容", "见下方服务清单"], ["额外项目", "先确认方案与费用，再处理"]]}, {"type": "steps", "title": "服务流程说明", "items": [{"image": "服务步骤", "title": "基础清洁", "detail": "按确认的范围清洁装备"}, {"image": "服务步骤", "title": "安全检查", "detail": "检查主要部件与安全状态"}, {"image": "服务步骤", "title": "基础调试", "detail": "按检查结果进行基础调试"}]}, {"type": "rows", "title": "到店与时间说明", "items": [["服务时长", "以服务项目与门店安排为准"], ["到店准备", "请携带需要服务的装备"]]}]};
const stepDescriptions=["按确认的范围清洁装备。","检查主要部件与安全状态。","按检查结果进行基础调试。"];
const serviceOptions=[
 {id:"inspection",title:"安全检查",legacyTitles:["安全检查","自行车安全检查"],price:69.9,blurb:"日常安全状态检查",summary:"适用于自行车日常状态检查。",comparison:"主要部件、安全紧固件与刹车状态检查",steps:[{title:"主要部件检查",detail:"示例检查项；具体检查范围以正式 Offer 和门店确认为准。"},{title:"紧固件检查",detail:"检查项仅为示意，实际执行内容以门店确认为准。"},{title:"链条润滑",detail:"示例保养项；具体材料与作业范围以门店确认为准。"}]},
 {id:"basic",title:"标准保养套餐",legacyTitles:["基础保养","标准保养套餐"],price:199.9,blurb:"检查、清洁与基础调试",summary:"检查、清洁与基础调试，具体范围以门店确认为准。",comparison:"含安全检查、基础清洁、传动润滑与必要调试",steps:[{title:"基础清洁",detail:"示例清洁环节；实际清洁部位与方式以门店确认为准。"},{title:"安全检查",detail:"示例检查环节；具体检查项目以门店确认为准。"},{title:"基础调试",detail:"示例调试环节；实际调整项目与范围以门店确认为准。"}]},
 {id:"full",title:"全面保养套餐",legacyTitles:["全面保养","全面保养套餐"],price:299.9,blurb:"标准保养并增加轮组养护",summary:"在标准保养基础上增加轮组检查和部件调节，具体范围以正式服务清单为准。",comparison:"含标准保养，并增加轮组检查、校正与更多部件调节",steps:[{title:"整车检查",detail:"示例检查环节；具体部件与检查项目以门店确认为准。"},{title:"部件调节",detail:"示例调节环节；实际调整范围以正式 Offer 和门店确认为准。"},{title:"轮组与轴承养护",detail:"示例保养环节；是否包含相关作业以正式 Offer 为准。"}]},
 {id:"deep",title:"深度保养套餐",legacyTitles:["深度保养","深度保养套餐"],price:499.9,blurb:"全面保养并增加深度清洁",summary:"在全面保养基础上增加整车清洁与关键部位深度养护，具体范围以正式服务清单为准。",comparison:"含全面保养，并增加整车清洁和关键部位深度养护",steps:[{title:"整车深度清洁",detail:"示意深度清洁环节；清洁范围及耗材以门店确认为准。"},{title:"核心部件养护",detail:"示意养护环节；实际拆装与维护范围以正式 Offer 为准。"},{title:"全面检查与调试",detail:"示意检查调试环节；最终项目以服务清单和门店确认为准。"}]}
];
const comparisonGroups=[
 {title:"服务内容",items:[
  ["适合场景",["日常安全状态确认","常规周期保养","想做更全面检查与调试","长时间未保养，想做深度养护"]],
  ["检查范围",["主要部件、紧固件与刹车","含安全检查及基础保养项目","含标准保养并增加轮组检查","含全面保养与关键部位检查"]],
  ["清洁服务",["—","基础清洁","基础清洁","整车深度清洁（示例）"]],
  ["调试服务",["—","基础调试","增加部件调节","全面检查与调试"]],
  ["轮组养护",["—","—","轮组检查与校正","关键部位养护（示例）"]]
 ]},
 {title:"参考信息",items:[
  ["服务时长（示例）",["约 20 分钟","约 60 分钟","约 90 分钟","约 120 分钟"]],
  ["价格",serviceOptions.map(service=>`¥${formatServicePrice(service.price)}`)]
 ]}
];
const query=new URLSearchParams(location.search);
const isBenefitContext=query.get("context")==="benefit";
const benefitReturnParams=new URLSearchParams({benefit:query.get("benefit")||"inspection",variant:query.get("variant")||"A",state:query.get("state")||"available"});
["equipment","order"].forEach(key=>{if(query.has(key))benefitReturnParams.set(key,query.get(key))});
const benefitReturnUrl=`03-benefit-detail.html?${benefitReturnParams.toString()}`;
const categoryLabels={bike:"自行车",badminton:"羽毛球/网球",ski:"滑雪"};
const catalogCategory=query.get("category")||"bike";
const catalogName=query.get("name");
const catalogDescription=query.get("description")||"";
const catalogPrice=Number(query.get("price"));
const isCatalogService=Boolean(catalogName);
const categoryLabel=Object.hasOwn(categoryLabels,catalogCategory)?categoryLabels[catalogCategory]:"运动装备";
const catalogGroup=serviceCatalog.find(group=>group.category===catalogCategory&&(group.id===query.get("group")||group.title===catalogName));
const selectableServices=catalogGroup?catalogGroup.options.map(option=>{
 const bikeService=catalogCategory==="bike"?serviceOptions.find(service=>service.id===option.id):null;
 return {
  ...bikeService, ...option, blurb:option.detail, summary:option.detail,
  steps:bikeService?.steps||[
   {title:"服务前确认",detail:"确认装备状态、服务范围与门店承接情况。"},
   {title:"专业服务",detail:option.detail},
   {title:"完成验收",detail:"服务完成后与门店确认结果及后续建议。"}
  ]
 };
}):serviceOptions;
// Match the four-option Figma layout without changing the catalog or comparison order.
const displayServices=catalogCategory==="bike"&&selectableServices.length===4
 ? ["inspection","full","deep","basic"].map(id=>selectableServices.find(service=>service.id===id)).filter(Boolean)
 : selectableServices;
const matchedService=serviceOptions.find(service=>service.legacyTitles.includes(catalogName)||service.id==="basic"&&catalogName==="标准保养");
let selectedServiceId=catalogGroup?selectableServices.reduce((lowest,service)=>service.price<lowest.price?service:lowest).id:matchedService?.id||(isCatalogService?"":"basic");
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const activeService=()=>{
 if(catalogGroup)return selectableServices.find(service=>service.id===selectedServiceId);
 const selected=serviceOptions.find(service=>service.id===selectedServiceId);
 if(catalogCategory==="bike"&&selected&&(!isCatalogService||matchedService||selectedServiceId))return matchedService?.id===selected.id&&catalogDescription?{...selected,title:catalogName,summary:catalogDescription}:selected;
 if(!isCatalogService)return selected;
 return {
  title:catalogName,
  summary:catalogDescription||"服务范围、适用条件与门店承接情况以正式服务说明为准。",
  steps:[
   {title:"服务前确认",detail:"确认装备状态、服务范围与门店承接情况。"},
   {title:"专业服务",detail:"具体项目与操作方式以正式服务说明和门店确认为准。"},
   {title:"完成验收",detail:"服务完成后与门店确认结果及后续建议。"}
  ]
 };
};
const checkoutUrl=()=>{const offer=activeService();const checkoutParams=new URLSearchParams({category:catalogCategory,name:offer.title,description:offer.summary});["equipment","order"].forEach(key=>{if(query.has(key))checkoutParams.set(key,query.get(key))});const checkoutPrice=offer.price??catalogPrice;if(Number.isFinite(checkoutPrice)&&checkoutPrice>0)checkoutParams.set("price",checkoutPrice.toFixed(2));const cityKey=selectedCityKey();checkoutParams.set("city",cityKey);checkoutParams.set("store",selectedStore().name);checkoutParams.set("storeId",selectedStoreId);if(selectedPreviewDate&&selectedPreviewTime){const match=selectedPreviewDate.match(/(\d{1,2})月(\d{1,2})日/);checkoutParams.set("bookingMode","now");if(match)checkoutParams.set("date",`2026-${String(Number(match[1])).padStart(2,"0")}-${String(Number(match[2])).padStart(2,"0")}`);checkoutParams.set("time",selectedPreviewTime);}else checkoutParams.set("bookingMode","later");return `05-order-checkout.html?${checkoutParams.toString()}`};
const $=s=>document.querySelector(s);
const itemImage=(label,small=true,ratio='')=>`<div class="placeholder ${small?'small':''} ${ratio==='4/3'?'r43':''}" aria-label="${label}">${label}</div>`;
function maintenanceGuideMarkup(){
 const reasons=[
  ["calendar-check.svg","骑行约 6–12 个月","经过一段时间骑行后，建议对常用部件进行周期检查和调整。"],
  ["attention.svg","骑行状态开始变差","变速不够顺畅、刹车手感下降，或开始出现轻微异响。"],
  ["maintain-repair.svg","长时间没有保养","长期使用或存放后，建议重新检查车辆整体状态。"]
 ];
 const systems=[
  ["service-system.svg","刹车系统",["检查刹车整体安全与刹车片磨损情况","调整线管行程与刹车把手舒适手感","排除卡滞，保障关键安全指标"]],
  ["service-system.svg","变速系统",["检查前后变速定位拨动与张力弹簧","精细调整微调螺丝，确保变速精准顺畅","清理并检查链条、飞轮与牙盘状态"]],
  ["maintain-repair.svg","轮组与轮胎",["检查外胎开裂、老化、胎面杂物磨损","补充胎压至合理区间，检查轮毂松动","确认快拆及桶轴紧固锁定无异常"]],
  ["insurance.svg","整车常规安全",["检查把立、坐管、脚踏等部件扭矩紧固","传动部件基础加注高品质润滑油","全车松动检查与关键结构安全确证"]]
 ];
 const outcomes=["刹车和变速精准完成检查与必要精细调整","关键安全紧固部件完成标准扭矩工具检查","链条、传动等日常核心部件完成基础润滑保养","专业技师反馈深入评估与后期维护建议报告"];
 return `<section class="maintenance-guide" aria-label="自行车保养服务说明">
  <details class="service-disclosure"><summary>什么时候适合做保养？</summary><div class="maintenance-reasons">${reasons.map(([icon,title,text])=>`<article class="maintenance-reason"><span class="maintenance-icon"><img src="assets/figma/${icon}" alt=""></span><div class="maintenance-reason-copy"><strong>${title}</strong><p>${text}</p></div></article>`).join('')}</div></details>
  ${selectedServiceId==="basic"?`<details class="service-disclosure"><summary>标准保养项目参考</summary><div class="maintenance-card"><p class="subtle">以下为示例项目，具体范围以正式服务清单和门店确认为准。</p>${systems.map(([icon,title,items],index)=>`${index?'<div class="maintenance-divider"></div>':''}<section class="maintenance-system"><div class="maintenance-system-head"><img src="assets/figma/${icon}" alt=""><strong>${title}</strong></div><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul></section>`).join('')}</div></details><details class="service-disclosure"><summary>保养完成后可确认什么？</summary><div class="maintenance-outcome-list">${outcomes.map(item=>`<div class="maintenance-outcome"><img src="assets/figma/success.svg" alt=""><span>${item}</span></div>`).join('')}</div></details>`:''}
  <aside class="maintenance-notice"><div class="maintenance-notice-title"><img src="assets/figma/info.svg" alt=""><span>额外项目，先确认再处理</span></div><p>如需更换配件、故障维修或超出套餐范围的保养，技师会先与你确认方案和费用。</p></aside>
 </section>`;
}
function render(s){
 const t=s.title?`<h2 class="section-title">${s.title}</h2>`:'';
 if(s.type==='intro') return `<section class="section intro">${s.title?`<h2>${s.title}</h2>`:''}<p class="subtle">${s.text}</p></section>`;
 if(s.type==='hero'){
  const cover=catalogCategory==="bike"?"assets/figma/service-detail-bike-hero.png":catalogCategory==="ski"?"assets/service-ski.svg":catalogCategory==="badminton"?"assets/service-badminton.svg":null;
  const title=catalogGroup?.title||activeService().title;
  return `<section class="section hero">${cover?`<div class="service-cover ${catalogCategory==="bike"?'':'is-illustration'}"><img src="${cover}" alt="${escapeHtml(categoryLabel)}服务场景示意"><span>服务场景示意</span></div>`:''}<div class="hero-copy"><h1>${catalogGroup||title.startsWith(categoryLabel)?'':escapeHtml(categoryLabel)}${escapeHtml(title)}</h1><p class="service-summary">${escapeHtml(activeService().summary)}</p><div class="service-attributes"><span><img src="assets/figma/maintain-repair.svg" alt="">到店服务</span><span><img src="assets/figma/insurance.svg" alt="">额外费用先确认</span></div></div></section>`;
 }
 if(s.type==='items') return `<section class="section">${t}${s.items.map(x=>`<div class="item">${itemImage(x.image,true)}<div class="item-copy"><strong>${x.title}</strong><p>${x.detail||''}</p>${x.meta?`<p>${x.meta}</p>`:''}</div>${x.price?`<span class="item-price">${x.price}</span>`:''}<span class="chev">›</span></div>`).join('')}</section>`;
 if(s.type==='rows') return `<section class="section arrival-notes">${t}${s.items.map(x=>`<div class="row"><span>${x[0]}</span><span>${x[0]==='到店准备'&&isCatalogService?`请携带需服务的${escapeHtml(categoryLabel)}装备（示例）`:x[1]}</span></div>`).join('')}</section>`;
 if(s.type==='steps') return `<section class="section process-section" data-process-section><div class="section-heading"><h2 class="section-title">服务内容与流程</h2><p>${escapeHtml(activeService().title)} · 以下为示例，实际范围以门店确认为准。</p></div>${activeService().comparison?`<p class="service-content-summary">${escapeHtml(activeService().comparison)}</p>`:''}<ol class="service-step-list">${activeService().steps.map(step=>`<li><strong>${escapeHtml(step.title)}</strong><p>${escapeHtml(step.detail)}</p></li>`).join('')}</ol></section>${catalogCategory==="bike"?maintenanceGuideMarkup():''}`;
 if(s.type==='serviceSwitcher') return `<section class="service-switcher" aria-labelledby="service-switcher-title"><header class="service-switcher-head"><h2 id="service-switcher-title">选择服务套餐</h2><span>共 ${selectableServices.length} 种可选</span></header><div class="service-options${selectableServices.length===1?' service-options--single':selectableServices.length===3?' service-options--triple':''}" role="group" aria-label="选择${escapeHtml(catalogGroup?.title||categoryLabel)}服务套餐">${displayServices.map(service=>`<button type="button" class="service-option" data-service-id="${service.id}" aria-pressed="${service.id===selectedServiceId}"><span class="service-option-name">${escapeHtml(service.title)}</span><span class="service-option-price"><small>¥</small>${formatServicePrice(service.price)}</span><span class="service-option-blurb">${escapeHtml(service.blurb)}</span></button>`).join('')}</div>${catalogCategory==="bike"?'<button type="button" class="compare-toggle" data-toggle-compare aria-haspopup="dialog" aria-expanded="false"><span>不确定怎么选？对比套餐内容</span><img class="compare-chevron" src="assets/figma/chevron.svg" alt=""></button>':''}</section>`;
 if(s.type==='chips') return `<section class="section">${t}<div class="chip-list">${s.items.map((x,i)=>`<button class="chip ${i===(s.selected??0)?'selected':''}" aria-pressed="${i===(s.selected??0)}">${x}</button>`).join('')}</div></section>`;
 if(s.type==='form') return `<section class="section">${t}${s.fields.map(f=>`<div class="field"><label>${f.label}</label>${f.area?`<textarea placeholder="${f.placeholder}"></textarea>`:`<input placeholder="${f.placeholder}" readonly></div>`}</div>`).join('')}</section>`;
 if(s.type==='upload') return `<section class="section">${t}<div class="upload"><button aria-label="添加照片">＋</button><span>${s.text}</span></div></section>`;
 if(s.type==='location') return `<section class="section location"><span>⌖　${s.title}</span><span class="chev">切换　›</span></section>`;
 if(s.type==='stores') return `<section class="section">${t}${s.items.map((x,i)=>`<div class="store"><div class="radio ${i===(s.selected??0)?'selected':''}" role="radio" aria-checked="${i===0}" tabindex="0"></div>${itemImage(x.image,true,'4/3')}<div class="store-info"><strong>${x.name}</strong><p>${x.address}</p><div class="store-foot"><span>${x.hours}</span><span>${x.distance}</span></div></div></div>`).join('')}</section>`;
 if(s.type==='dates') return `<section class="section">${t}<div class="dates">${s.items.map((x,i)=>`<button class="date ${i===(s.selected??0)?'selected':''}" aria-pressed="${i===(s.selected??0)}"><span>${x[0]}</span><strong>${x[1]}</strong><span>${x[2]}</span></button>`).join('')}</div></section>`;
 if(s.type==='slots') return `<section class="section">${t}<div class="slots">${s.items.map((x,i)=>`<button class="slot ${typeof x==='object'&&x.status?'full ':''}${i===(s.selected??0)?'selected':''}" ${typeof x==='object'&&x.status?'disabled':''} aria-pressed="${i===(s.selected??0)}">${typeof x==='string'?x:x.label}${typeof x==='object'&&x.status?' · '+x.status:''}</button>`).join('')}</div></section>`;
 if(s.type==='status') return `<section class="section status-panel"><strong>${s.title}</strong><p>${s.text}</p></section>`;
 if(s.type==='notice') return `<section class="section"><h2 class="section-title">${s.title}</h2><p class="subtle">${s.text}</p></section>`;
 if(s.type==='total') return `<section class="section total"><span>${s.title}</span><strong>${s.amount}</strong></section>`;
 if(s.type==='timeline') return `<section class="section">${t}<div class="timeline">${s.items.map((x,i)=>`<div class="timeline-item ${i===3?'active':''}"><strong>${x[0]} <span class="subtle">· ${x[2]}</span></strong><p>${x[1]}</p></div>`).join('')}</div></section>`;
 if(s.type==='queue') return `<section class="section queue"><h2 class="section-title">${s.title}</h2><div class="number">${s.number}</div><p>${s.text}</p></section>`;
 if(s.type==='actions') return `<section class="section"><h2 class="section-title">${s.title}</h2><div class="actions">${s.items.map(x=>x.action?`<button class="text-action" data-action="${x.action}">${x.label}</button>`:`<a class="text-action" href="${x.href}" style="display:grid;place-items:center;text-decoration:none">${x.label}</a>`).join('')}</div></section>`;
 if(s.type==='messages') return `<section class="section">${t}${s.items.map((x,i)=>`<a class="message" href="10-service-order-detail.html" style="text-decoration:none;color:inherit"><div class="message-icon">${i===0?'<span class="inline-check-icon" aria-hidden="true"></span>':i===1?'•':'↗'}</div><div class="message-copy"><strong>${x.title}</strong><p>${x.text}</p><small>${x.time}</small></div><span class="chev">›</span></a>`).join('')}</section>`;
 return '';
}
const app=$('.app');
let storeTimePickerPromise;
const ensureStoreTimePicker=()=>storeTimePickerPromise ||= window.StoreTimePicker
 ? Promise.resolve(window.StoreTimePicker)
 : new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='store-time-picker.js?v=20261104-one-css';script.onload=()=>resolve(window.StoreTimePicker);script.onerror=reject;document.head.append(script)});
const mainContent=()=>`${isBenefitContext?'<p class="subtle" style="padding:12px 20px;margin:0;background:var(--container-commercial-light)">使用装备权益，无需再次支付。</p>':''}${D.sections.map((section,index)=>`${render(section)}${index===0&&(catalogCategory==="bike"||catalogGroup)?(isBenefitContext||selectableServices.length===0?'':render({type:'serviceSwitcher'}))+storeSummaryMarkup():''}`).join('')}${isBenefitContext?'':`<section class="service-help"><a class="text-action" href="04-repair-request.html"><span class="service-help-label"><span class="service-help-icon" aria-hidden="true"></span>不确定维修项目？描述维修需求</span><span aria-hidden="true">›</span></a></section>`}`;
const main=()=>`<div class="body-scroll">${mainContent()}</div>`;
let selectedCity=storeCities[0];
const sortedStores=(city=selectedCity)=>[...city.stores].sort((a,b)=>a.distance-b.distance);
let selectedStoreId=sortedStores()[0].id;
let selectedPreviewDate="";
let selectedPreviewTime="";
const selectedStore=()=>selectedCity.stores.find(store=>store.id===selectedStoreId)||sortedStores()[0];
const selectedCityKey=()=>selectedCity.name.includes("上海")?"shanghai":selectedCity.name.includes("北京")?"beijing":"hangzhou";
const previewFor=(cityKey,storeId,date,time)=>{const rows=bookingPreviewFixtures[cityKey]?.[storeId]||[];if(!rows.length)return{rows:[],date:"",slots:[],time:""};const activeDate=rows.some(row=>row.date===date)?date:rows[0].date;const slots=rows.find(row=>row.date===activeDate)?.slots||[];const activeTime=slots.includes(time)?time:"";return{rows,date:activeDate,slots,time:activeTime};};
const currentBookingPreview=()=>{const preview=previewFor(selectedCityKey(),selectedStoreId,selectedPreviewDate,selectedPreviewTime);selectedPreviewDate=preview.date;selectedPreviewTime=preview.time;return preview;};
const resetBookingPreview=()=>{selectedPreviewDate="";selectedPreviewTime="";currentBookingPreview();};
function bookingSummaryText(){const preview=currentBookingPreview();return selectedPreviewDate&&selectedPreviewTime?`已选：${preview.date} ${selectedPreviewTime}`:"可约时间"}
function storeMapUrl(store){return `https://map.qq.com/?q=${encodeURIComponent(`${store.name} ${store.address}`)}`}
function storeContactMarkup(store){return `<div class="store-icon-actions" role="group" aria-label="${escapeHtml(store.name)}门店操作"><a class="store-icon-button is-navigation" href="${storeMapUrl(store)}" target="_blank" rel="noopener noreferrer" aria-label="导航到${escapeHtml(store.name)}" title="导航到门店"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m21 3-7 18-3-8-8-3L21 3Z"/></svg></a><button type="button" class="store-contact-button store-icon-button is-message" data-store-wechat="${store.id}" data-store-name="${escapeHtml(store.name)}" data-store-phone="${escapeHtml(store.phone||"")}" aria-label="联系${escapeHtml(store.name)}" title="联系门店" aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 3v-11a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/></svg></button></div>`}
function storePhoneMarkup(store){return store.phone?`<a class="wechat-phone-link" href="tel:${escapeHtml(store.phone.replace(/[^0-9+]/g,""))}"><small>拨打电话</small><strong>${escapeHtml(store.phone)}</strong></a>`:'<p class="wechat-phone-unavailable">门店电话暂未接入，当前无法拨打。</p>'}
function storeSummaryMarkup(){
 const store=selectedStore();
 const preview=currentBookingPreview();
 const dateCards=preview.rows.map(row=>{
  const [,month='--',day='--',week='周?']=row.date.match(/(\d{1,2})月(\d{1,2})日\s*(周.)?/ )||[];
  const available=row.slots.length>0;
  const selected=row.date===preview.date;
  const status=!available?'已满':selected&&selectedPreviewTime?`已选 ${selectedPreviewTime}`:'';
  return `<button type="button" class="store-date-card${selected&&available?' is-selected':''}" ${available?`data-open-store-sheet data-summary-date="${escapeHtml(row.date)}"`: 'disabled'} aria-label="${escapeHtml(row.date)}${available?(status?`，${escapeHtml(status)}`:'，查看可约时段'):'，已满'}"><span>${escapeHtml(week)}</span><strong>${available?`${escapeHtml(month)}/${escapeHtml(day)}`:'已满'}</strong>${status&&available?`<small>${escapeHtml(status)}</small>`:''}</button>`;
 }).join('');
 return `<section class="store-selection" aria-label="门店与预约时间"><div class="store-summary-card store-summary-surface"><div class="store-summary-title"><strong class="store-summary-name">${escapeHtml(store.name)}</strong><button type="button" class="store-nearby-link" data-open-store-sheet aria-label="查看附近${selectedCity.stores.length}个门店">附近 ${selectedCity.stores.length} 个门店 <img src="assets/figma/chevron.svg" alt="" aria-hidden="true"></button></div><div class="store-summary-hours-row"><div class="store-summary-copy"><p class="store-summary-address">${store.distance.toFixed(1)} km｜${escapeHtml(store.address)}</p><p class="store-summary-hours">营业时间 ${escapeHtml(store.hours)}</p></div>${storeContactMarkup(store)}</div><div class="store-date-section"><div class="store-date-heading"><span>${escapeHtml(bookingSummaryText())}</span><button type="button" data-open-store-sheet aria-label="查看更多可约日期和时段">更多可约 <img src="assets/figma/chevron.svg" alt="" aria-hidden="true"></button></div><div class="store-date-rail" role="group" aria-label="门店可约日期">${dateCards||'<p class="store-summary-foot-text">该门店暂无可预约日期</p>'}</div></div></div></section>`;
}
function bookingPreviewMarkup(){const store=selectedStore();const preview=currentBookingPreview();const hasSelection=Boolean(selectedPreviewDate&&selectedPreviewTime);return `<section class="store-selection" data-booking-preview aria-labelledby="detail-booking-title"><header class="store-summary-heading"><h2 id="detail-booking-title">可预约日期与时段</h2><span class="subtle">先看档期，再决定是否购买</span></header><p class="subtle" style="margin:0 0 10px">门店：${escapeHtml(store.name)}（示例资源，提交后仍需确认）</p><div class="chip-list" role="group" aria-label="可预约日期">${preview.rows.map(row=>`<button type="button" class="chip ${row.date===preview.date?'selected':''}" data-preview-date="${escapeHtml(row.date)}" aria-pressed="${row.date===preview.date}">${escapeHtml(row.date)}</button>`).join('')}</div><div class="slots" style="margin-top:10px">${preview.slots.map(slot=>`<button type="button" class="slot ${slot===selectedPreviewTime?'selected':''}" data-preview-slot="${slot}" aria-pressed="${slot===selectedPreviewTime}">${slot}${slot===selectedPreviewTime?'<span class="inline-check-icon" aria-hidden="true"></span>':''}</button>`).join('')}</div><p class="subtle" style="margin:10px 0 0">${hasSelection?`已选意向：${escapeHtml(preview.date)} ${escapeHtml(selectedPreviewTime)}。进入结算后可改为“暂不预约”。`:'可先选一个意向时段带入结算，或直接在结算中再选。'}</p></section>`}
function wechatDialogMarkup(){return `<dialog class="wechat-dialog" data-wechat-dialog aria-labelledby="wechat-dialog-title"><h2 id="wechat-dialog-title">联系门店</h2><p class="wechat-dialog-store" data-wechat-store-name></p><div data-wechat-phone>${storePhoneMarkup(selectedStore())}</div><div class="wechat-qr-placeholder" role="img" aria-label="企业微信二维码待门店提供">企业微信二维码<br>待门店提供</div><p class="wechat-dialog-note">点击长按添加门店服务人员微信</p><button type="button" class="wechat-dialog-close" data-close-wechat>关闭</button></dialog>`}
function comparisonSheetMarkup(){
 const options=catalogGroup&&catalogCategory==="bike"?selectableServices:serviceOptions;
 return `<div class="compare-sheet-backdrop" data-compare-backdrop aria-hidden="true"><section class="compare-sheet" role="dialog" aria-modal="true" aria-labelledby="compare-sheet-title"><div class="sheet-handle" aria-hidden="true"></div><header class="compare-sheet-head"><div><h2 class="compare-sheet-title" id="compare-sheet-title">套餐详情对比</h2></div><button type="button" class="sheet-close" aria-label="关闭套餐对比" data-close-compare-sheet>×</button></header><p class="compare-sheet-hint">左右滑动查看更多套餐</p><div class="compare-scroll" role="region" aria-label="套餐参数对比表，可横向滑动" tabindex="0"><table class="compare-table"><thead><tr><th scope="col">对比项目</th>${options.map(service=>`<th class="compare-package" scope="col" data-package-id="${service.id}" data-current="${service.id===selectedServiceId}"><span class="compare-package-name">${escapeHtml(service.title)}</span><span class="compare-package-price">¥${formatServicePrice(service.price)}</span><span class="compare-current-label">当前选择</span></th>`).join('')}</tr></thead><tbody>${comparisonGroups.map(group=>`<tr class="compare-group"><th scope="colgroup" colspan="${options.length+1}">${escapeHtml(group.title)}</th></tr>${group.items.map(([label,values])=>`<tr><th scope="row">${escapeHtml(label)}</th>${options.map(service=>`<td data-package-id="${service.id}" data-current="${service.id===selectedServiceId}">${escapeHtml(values[serviceOptions.findIndex(option=>option.id===service.id)])}</td>`).join('')}</tr>`).join('')}`).join('')}</tbody></table></div></section></div>`;
}
function setSheetOpen(isOpen){
 const backdrop=$('[data-compare-backdrop]');
 const trigger=$('[data-toggle-compare]');
 backdrop.classList.toggle('open',isOpen);
 backdrop.setAttribute('aria-hidden',String(!isOpen));
 trigger?.setAttribute('aria-expanded',String(isOpen));
 document.querySelectorAll('.body-scroll,.footer,.nav').forEach(element=>{element.inert=isOpen});
 if(isOpen){
  $('[data-close-compare-sheet]').focus({preventScroll:true});
  const packages=[...document.querySelectorAll('.compare-package')];
  const currentIndex=packages.findIndex(cell=>cell.dataset.packageId===selectedServiceId);
  const left=packages.slice(0,Math.max(0,currentIndex)).reduce((width,cell)=>width+cell.offsetWidth,0);
  $('.compare-scroll').scrollTo({top:0,left,behavior:'instant'});
 }else trigger?.focus({preventScroll:true});
}
function setCompareSheetOpen(isOpen){setSheetOpen(isOpen)}
function updateCompareSelection(){document.querySelectorAll('[data-package-id]').forEach(cell=>{cell.dataset.current=String(cell.dataset.packageId===selectedServiceId)})}
const priceLabel=()=>{const price=activeService().price;if(Number.isFinite(price)&&price>0)return `¥${formatServicePrice(price)}`;if(Number.isFinite(catalogPrice)&&catalogPrice>0)return `¥${formatServicePrice(catalogPrice)}`;return "价格待确认"};
const footer=`<footer class="footer${isBenefitContext?' benefit-footer':''}"><div class="purchase-summary" aria-live="polite" aria-atomic="true"><small id="purchase-service">${isBenefitContext?'服务价格':escapeHtml(activeService().title)}</small><strong id="purchase-price">${priceLabel()}</strong></div><button class="primary ${isBenefitContext?'benefit-purchase':''}" type="button" data-purchase>${isBenefitContext?'<span>返回权益详情 · 使用权益兑换</span>':'<span>购买服务</span>'}</button></footer>`;
app.className='app layout-a';
app.innerHTML=`<div class="statusbar"><span>9:41</span><span class="status-icons">● ▮ ▰</span></div><header class="nav" aria-label="小程序导航"><button type="button" aria-label="返回" onclick="history.length>1?history.back():location.href='01-service-entry.html'">‹</button><div class="nav-title" aria-hidden="true">${D.nav||D.title}</div><button class="nav-more" type="button" aria-label="小程序菜单">···<i aria-hidden="true"></i><span class="nav-target" aria-hidden="true"></span></button></header>${main()}${footer}<div class="toast" role="status"></div><div class="modal-backdrop"><div class="modal"><h2>确认取消预约？</h2><p>取消预约后，已选时段将释放。服务单仍保留。</p><div class="modal-actions"><button data-close>暂不取消</button><button class="confirm" data-confirm>确认取消</button></div></div></div>${wechatDialogMarkup()}${comparisonSheetMarkup()}`;
document.addEventListener('click',e=>{
 const serviceChoice=e.target.closest('[data-service-id]');if(serviceChoice){const scrollTop=$('.body-scroll').scrollTop;selectedServiceId=serviceChoice.dataset.serviceId;$('.body-scroll').innerHTML=mainContent();$('#purchase-price').textContent=priceLabel();$('#purchase-service').textContent=activeService().title;updateCompareSelection();document.querySelector(`[data-service-id="${selectedServiceId}"]`).focus({preventScroll:true});$('.body-scroll').scrollTo({top:scrollTop,behavior:'instant'});return}
 if(e.target.closest('[data-toggle-compare]')){setCompareSheetOpen(true);return}
 if(e.target.closest('[data-close-compare-sheet]')||e.target.matches('[data-compare-backdrop]')){setCompareSheetOpen(false);return}
 if(e.target.closest('[data-scroll-to-process]')){$('[data-process-section]')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 const openStoreSheet=e.target.closest('[data-open-store-sheet]');
 if(openStoreSheet){
  const date=openStoreSheet.dataset.summaryDate||selectedPreviewDate;
  ensureStoreTimePicker().then(picker=>picker.open({root:app,mode:'preview',initialView:openStoreSheet.matches('.store-nearby-link')?'list':'booking',trigger:openStoreSheet,value:{city:selectedCityKey(),storeId:selectedStoreId,date,time:date===selectedPreviewDate?selectedPreviewTime:''}})).then(selection=>{
   if(!selection)return;
   selectedCity=storeCities.find(city=>city.key===selection.city);
   selectedStoreId=selection.storeId;
    selectedPreviewDate=bookingPreviewFixtures[selection.city][selection.storeId].find(row=>window.StoreTimePicker.isoDate(row.date)===selection.date)?.date||'';
   selectedPreviewTime=selection.time;
   const scroll=$('.body-scroll').scrollTop;
   $('.body-scroll').innerHTML=mainContent();
   $('.body-scroll').scrollTop=scroll;
   $('[data-open-store-sheet]')?.focus({preventScroll:true});
  });
  return;
 }
 const wechatChoice=e.target.closest('[data-store-wechat]');if(wechatChoice){$('[data-wechat-store-name]').textContent=wechatChoice.dataset.storeName;$('[data-wechat-phone]').innerHTML=storePhoneMarkup({phone:wechatChoice.dataset.storePhone});$('[data-wechat-dialog]').showModal();return}
 if(e.target.closest('[data-close-wechat]')){$('[data-wechat-dialog]').close();return}
 const choice=e.target.closest('.chip,.date,.slot');if(choice&&!choice.disabled){const siblings=choice.parentElement.querySelectorAll('.chip,.date,.slot');siblings.forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});choice.classList.add('selected');choice.setAttribute('aria-pressed','true')}
 const radio=e.target.closest('.radio');if(radio){document.querySelectorAll('.radio').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-checked','false')});radio.classList.add('selected');radio.setAttribute('aria-checked','true')}
 if(e.target.closest('[data-action="cancel"]'))$('.modal-backdrop').classList.add('open');
 if(e.target.closest('[data-close]'))$('.modal-backdrop').classList.remove('open');
 if(e.target.closest('[data-confirm]')){$('.modal-backdrop').classList.remove('open');const t=$('.toast');t.textContent='预约已取消';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
 if(e.target.closest('[data-action="online-buy"]')){const t=$('.toast');t.textContent='商品信息暂不可用，请到店咨询。';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
 if(e.target.closest('[data-purchase]'))window.location.href=isBenefitContext?benefitReturnUrl:checkoutUrl();
});
$('.wechat-dialog').addEventListener('click',e=>{if(e.target.matches('[data-wechat-dialog]'))e.target.close()});
document.addEventListener('keydown',e=>{
 if($('[data-wechat-dialog]').open){
  if(e.key==='Escape'){e.preventDefault();$('[data-wechat-dialog]').close()}
  return;
 }
 const backdrop=$('[data-compare-backdrop].open');
 if(!backdrop)return;
 if(e.key==='Escape'){e.preventDefault();setSheetOpen(false);return}
 if(e.key==='Tab'){
  const focusable=[...backdrop.querySelectorAll('button,a[href],[tabindex="0"]')].filter(element=>!element.disabled&&element.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus({preventScroll:true})}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus({preventScroll:true})}
 }
});
const menu=$('.nav-more');menu.addEventListener('click',()=>{const t=$('.toast');t.textContent='更多服务';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1400)});
