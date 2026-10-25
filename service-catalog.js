const serviceCatalog = [
  {
    id: "bike-inspection", category: "bike", title: "安全检查",
    detail: "检查主要部件、紧固件并润滑链条", tags: ["基础检查", "链条润滑"],
    options: [
      { id: "inspection", title: "安全检查", detail: "检查主要部件、紧固件并润滑链条", price: 69.9 }
    ]
  },
  {
    id: "bike-maintenance", category: "bike", title: "自行车保养",
    detail: "从日常调节到深度清洁，按骑行需求选择保养方案", tags: ["标准", "全面", "深度"],
    options: [
      { id: "basic", title: "标准保养", detail: "安全检查基础上，增加部件调节与线管润滑", price: 199.9 },
      { id: "full", title: "全面保养", detail: "标准保养基础上，增加轮组矫正与轴承养护", price: 299.9 },
      { id: "deep", title: "深度保养", detail: "增加传动、轮组、车架及避震转点清洁；限指定门店", price: 499.9 }
    ]
  },
  {
    id: "badminton-stringing", category: "badminton", title: "羽毛球穿线",
    detail: "按取拍时效及球拍、球线购买渠道选择穿线方案", tags: ["2 小时快取", "48 小时取"],
    options: [
      { id: "badminton-express", title: "羽毛球 · 2 小时快速穿线", detail: "不区分球拍及球线的购买渠道", price: 60 },
      { id: "badminton-own", title: "羽毛球 · 48 小时取 · 自带球拍球线", detail: "非迪卡侬球拍 + 非迪卡侬球线", price: 40 },
      { id: "badminton-mixed", title: "羽毛球 · 48 小时取 · 单项购于迪卡侬", detail: "球拍或球线购于迪卡侬，二者满足其一", price: 30 },
      { id: "badminton-decathlon", title: "羽毛球 · 48 小时取 · 球拍球线均购于迪卡侬", detail: "迪卡侬球拍 + 迪卡侬球线", price: 20 }
    ]
  },
  {
    id: "tennis-stringing", category: "badminton", title: "网球穿线",
    detail: "按取拍时效及球线购买渠道选择穿线方案", tags: ["2 小时快取", "48 小时取"],
    options: [
      { id: "tennis-express", title: "网球 · 2 小时快速穿线", detail: "不区分球拍及球线的购买渠道", price: 80 },
      { id: "tennis-own", title: "网球 · 48 小时取 · 自带球线", detail: "非迪卡侬球线；球拍购买渠道不限", price: 60 },
      { id: "tennis-decathlon", title: "网球 · 48 小时取 · 迪卡侬球线", detail: "迪卡侬球线；球拍购买渠道不限", price: 40 }
    ]
  },
  {
    id: "ski-waxing", category: "ski", title: "滑雪打蜡",
    detail: "按上雪前养护或雪季后存放选择打蜡方案", tags: ["常规打蜡", "季末打蜡"],
    options: [
      { id: "ski-regular", title: "手工打蜡（单层）", detail: "检查板底与板刃，完成打蜡及抛光", price: 149.9 },
      { id: "ski-season", title: "手工季末打蜡", detail: "雪季后长期存放保护，不刮蜡；开季配套服务待确认", price: 149.9 }
    ]
  },
  {
    id: "ski-maintenance", category: "ski", title: "滑雪保养",
    detail: "手工磨刃与打蜡，按单板或双板选择保养方案", tags: ["单板", "双板"],
    options: [
      { id: "ski-snowboard", title: "单板手工保养", detail: "单板手工磨刃 + 手工打蜡", price: 199.9 },
      { id: "ski-skis", title: "双板手工保养", detail: "双板手工磨刃 + 手工打蜡", price: 249.9 }
    ]
  }
];
