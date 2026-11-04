const bookingWeek = ["11月3日 周二","11月4日 周三","11月5日 周四","11月6日 周五","11月7日 周六","11月8日 周日","11月9日 周一"];
const bookingSchedule = (weekdaySlots, weekendSlots) => bookingWeek.map((date, index) => ({
  date,
  slots: index === 4 || index === 5 ? weekendSlots : weekdaySlots
}));
const bookingPreviewFixtures = {
  shanghai: {
    "sh-yangpu": bookingSchedule(["10:00","14:00","19:00"],["10:30","15:00","19:30"]),
    "sh-xuhui": bookingSchedule(["09:30","13:30","18:30"],["10:30","16:00","19:30"]),
    "sh-pudong": bookingSchedule(["10:00","14:30","19:00"],["11:30","15:30","20:00"])
  },
  beijing: {
    "bj-datun": bookingSchedule(["10:00","13:30","18:00"],["11:00","15:00","19:30"]),
    "bj-shuangjing": bookingSchedule(["10:30","14:30","19:00"],["09:30","13:00","18:30"]),
    "bj-wukesong": bookingSchedule(["10:00","14:00","18:00"],["11:00","15:00","20:00"])
  },
  hangzhou: {
    "hz-binjiang": bookingSchedule(["09:30","13:30","18:30"],["10:30","14:30","19:00"]),
    "hz-west": bookingSchedule(["10:00","14:00","18:30"],["11:30","15:30","20:00"]),
    "hz-xiasha": bookingSchedule(["10:00","13:30","19:00"],["11:00","16:00","20:30"])
  }
};
const storeCities = [
  {name:"上海市",key:"shanghai",stores:[
    {id:"sh-yangpu",name:"迪卡侬上海五角场店",address:"上海市杨浦区淞沪路161号",hours:"周一到周四 10:00–22:00；周五到周六 09:00-21:00 周日 09:00-22:00",distance:2.3,phone:"021-5555-0186"},
    {id:"sh-xuhui",name:"迪卡侬上海徐汇店",address:"上海市徐汇区漕溪北路",hours:"周一到周五 09:30–21:30；周六到周日 09:00–22:00",distance:4.8,phone:null},
    {id:"sh-pudong",name:"迪卡侬上海浦东店",address:"上海市浦东新区陆家嘴",hours:"周一到周日 10:00–22:00",distance:7.6,phone:null}
  ]},
  {name:"北京市",key:"beijing",stores:[
    {id:"bj-datun",name:"迪卡侬北京大屯路店",address:"北京市朝阳区大屯路",hours:"周一到周五 10:00–21:00；周六到周日 09:30–21:30",distance:3.1,phone:null},
    {id:"bj-shuangjing",name:"迪卡侬北京双井店",address:"北京市朝阳区广渠路",hours:"周一到周日 09:00–22:00",distance:5.4,phone:null},
    {id:"bj-wukesong",name:"迪卡侬北京五棵松店",address:"北京市海淀区复兴路",hours:"周一到周四 10:00–20:30；周五到周日 09:00–21:30",distance:8.2,phone:null}
  ]},
  {name:"杭州市",key:"hangzhou",stores:[
    {id:"hz-binjiang",name:"迪卡侬杭州滨江店",address:"杭州市滨江区江南大道",hours:"周一到周日 09:00–21:30",distance:1.8,phone:null},
    {id:"hz-west",name:"迪卡侬杭州城西店",address:"杭州市西湖区古墩路",hours:"周一到周五 10:00–21:00；周六到周日 09:00–22:00",distance:4.2,phone:null},
    {id:"hz-xiasha",name:"迪卡侬杭州下沙店",address:"杭州市钱塘区金沙大道",hours:"周一到周四 09:30–21:00；周五到周日 09:00–21:30",distance:9.1,phone:null}
  ]}
];