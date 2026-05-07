// ─── 共用資料庫 (localStorage 持久化) ────────────────────────────────────────

const DB_KEY = 'agm_tracking_v1';

const DEFAULT_DATA = {
  // 收單視窗設定
  window: {
    open: true,
    opens: 'TUE',   // 週二開放
    closes: 'MON',  // 週一結算
    lockHours: 6,   // 結算鎖定小時數
    week: getCurrentWeekLabel()
  },

  // 商品主檔：代理商 → 品項
  products: {
    BNE: [
      { id:'BNE001', pn:'ZL.A00TZ.1FO', platform:'NS', name:'NS 關於我轉生變成史萊姆這檔事 坦派斯特開拓譚', srp:1490, price:933, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'BNE002', pn:'ZL.A00TZ.17S', platform:'NS', name:'NS 鋼彈創壞者4 標準版', srp:1790, price:1210, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'BNE003', pn:'ZL.A00TZ.1FN', platform:'NS', name:'NS ONE PIECE 時光旅詩豪華版', srp:1490, price:980, moq:30, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'BNE004', pn:'ZL.A00TZ.1JM', platform:'NS', name:'NS 超級機器人大戰 Y', srp:1990, price:1611, moq:100, maxOrder:200, arrival:'已到貨', status:'available' },
      { id:'BNE005', pn:'ZL.A00TZ.1LL', platform:'PS5', name:'PS5 數碼寶貝物語 時空異客', srp:1790, price:1500, moq:60, maxOrder:null, arrival:'延遲到貨 12月第1周', status:'delayed' },
      { id:'BNE006', pn:'ZL.A00TZ.1C7', platform:'NS', name:'NS 太鼓之達人 咚咚雷音祭', srp:1090, price:914, moq:100, maxOrder:null, arrival:'即將到貨', status:'incoming' },
      { id:'BNE007', pn:'ZL.A00TZ.1BF', platform:'NS', name:'NS 王牌釣手 歡釣水族館', srp:1090, price:882, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'BNE008', pn:'ZL.A00TZ.1BQ', platform:'NS', name:'NS 小小夢靨 2', srp:990, price:773, moq:60, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'BNE009', pn:'ZL.A00TZ.1BS', platform:'NS', name:'NS 火影忍者疾風傳 終極風暴4 慕留人傳', srp:1190, price:929, moq:60, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'BNE010', pn:'ZL.A00TZ.1OX', platform:'NS', name:'NS 七龍珠電光炸裂！ZERO', srp:1790, price:1400, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'BNE011', pn:'ZL.A00TZ.1FX', platform:'PS5', name:'PS5 光與影：33號遠征隊', srp:1490, price:1107, moq:100, maxOrder:200, arrival:'12月中到貨', status:'preorder' },
      { id:'BNE012', pn:'ZL.A00TZ.1LI', platform:'NS', name:'NS 小小夢魘3', srp:1190, price:950, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
    ],
    GS: [
      { id:'GS001', pn:'ZL.A00TZ.11S', platform:'NS', name:'NS 胡鬧搬家2 亞洲版', srp:890, price:720, moq:100, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'GS002', pn:'ZL.A00TZ.12C', platform:'NS', name:'NS 胡鬧廚房 全都好吃 亞洲版', srp:990, price:801, moq:100, maxOrder:null, arrival:'請用現庫', status:'available' },
      { id:'GS003', pn:'ZL.A00TZ.11K', platform:'NS', name:'NS JACKJEANNE 繁體中文版', srp:1690, price:1368, moq:100, maxOrder:100, arrival:'現貨', status:'available' },
      { id:'GS004', pn:'ZL.A00TZ.15N', platform:'NS', name:'NS 9 R.I.P. 普通版', srp:1790, price:1449, moq:30, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'GS005', pn:'ZL.A00TZ.11N', platform:'NS', name:'NS 共生邱比特 繁體中文版', srp:1550, price:1255, moq:20, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'GS006', pn:'ZL.A00TZ.11U', platform:'PS5', name:'PS5 胡鬧搬家2 亞洲版', srp:890, price:720, moq:30, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'GS007', pn:'ZL.A00TZ.12B', platform:'PS5', name:'PS5 胡鬧廚房 全都好吃 亞洲版', srp:990, price:801, moq:30, maxOrder:null, arrival:'現貨', status:'available' },
    ],
    SONY: [
      { id:'PS001', pn:'ZL.A00TZ.078', platform:'PS5', name:'PS5 戰神：諸神黃昏 普通版', srp:1990, price:1692, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'PS002', pn:'ZL.A00TZ.1HE', platform:'PS5', name:'PS5 羊蹄山戰鬼 普通版', srp:1990, price:1611, moq:100, maxOrder:300, arrival:'現貨', status:'available' },
      { id:'PS003', pn:'ZL.A00TZ.0LW', platform:'PS5', name:'PS5 漫威蜘蛛人2 普通版', srp:1990, price:1692, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'PS004', pn:'ZL.A00TZ.01D', platform:'PS5', name:'PS5 對馬戰鬼 導演剪輯版', srp:1990, price:1692, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'PS005', pn:'ZL.A00TZ.19F', platform:'PS5', name:'PS5 地平線：期待黎明 重製版', srp:1490, price:1267, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'PS006', pn:'ZL.A00TZ.01J', platform:'PS5', name:'PS5 死亡擱淺導演剪輯版', srp:1490, price:1267, moq:50, maxOrder:null, arrival:'現貨', status:'available' },
      { id:'PS007', pn:'ZL.A00TZ.1HN', platform:'PS5', name:'PS5 機甲戰魔 神話之裔', srp:1790, price:1449, moq:20, maxOrder:null, arrival:'現貨', status:'available' },
    ]
  },

  // 通路主檔
  dealers: {
    wangqi:    { name:'王碁',    sales:'Edward',  code:'WQ' },
    pulei:     { name:'普雷伊',  sales:'Edward',  code:'PL' },
    xingyun:   { name:'馨運',    sales:'Edward',  code:'XY' },
    yishidai:  { name:'壹世代',  sales:'Edward',  code:'YS' },
    chengyi:   { name:'誠翼',    sales:'Edward',  code:'CY' },
    books:     { name:'Books',   sales:'Edward',  code:'BK' },
    bahamu:    { name:'巴哈姆特',sales:'Edward',  code:'BH' },
    moli:      { name:'摩力科',  sales:'Hsinhui', code:'ML' },
    pipi:      { name:'PIPI',    sales:'Hsinhui', code:'PP' },
    xinglong:  { name:'星龍',    sales:'Hsinhui', code:'XL' },
    ge:        { name:'GE',      sales:'Hsinhui', code:'GE' },
    lucky:     { name:'幸運草',  sales:'Hsinhui', code:'LC' },
    yuesheng:  { name:'玥勝',    sales:'Hsinhui', code:'YSH' },
    kaifa:     { name:'凱發',    sales:'Hsinhui', code:'KF' },
    dinosaur:  { name:'恐龍',    sales:'Hsinhui', code:'KL' },
    weixin:    { name:'偉昕',    sales:'AKI',     code:'WX' },
    gamer:     { name:'遊戲達人',sales:'AKI',     code:'GD' },
    kb:        { name:'KB',      sales:'AKI',     code:'KB' },
    waruji:    { name:'丸紀',    sales:'AKI',     code:'MR' },
    ksns:      { name:'高雄NS',  sales:'AKI',     code:'KS' },
    sunding:   { name:'順發',    sales:'AKI',     code:'SF' },
    ada:       { name:'艾達',    sales:'AKI',     code:'AD' },
    drz:       { name:'DRZ',     sales:'AKI',     code:'DZ' },
    pchome:    { name:'PCHOME',  sales:'Mickey',  code:'PC' },
    momo:      { name:'MOMO',    sales:'Mickey',  code:'MM' },
    yahoo:     { name:'YAHOO',   sales:'Wythe',   code:'YH' },
    samsui:    { name:'三井',    sales:'Tom',     code:'SM' },
    shennao:   { name:'神腦',    sales:'Tom',     code:'SN' },
  },

  // 訂單資料: { dealerId_productId: { qty, updatedAt, note } }
  orders: {},

  // PM 設定的已下單量 & 剩餘
  pmData: {},

  // 週通知記錄
  notifications: []
};

function getCurrentWeekLabel() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`;
}

export function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // merge with defaults to handle schema updates
      return { ...DEFAULT_DATA, ...saved,
        products: saved.products || DEFAULT_DATA.products,
        dealers: saved.dealers || DEFAULT_DATA.dealers,
        window: { ...DEFAULT_DATA.window, ...(saved.window || {}) }
      };
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

export function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getDB() {
  if (!window._db) window._db = loadDB();
  return window._db;
}

export function commitDB() {
  saveDB(window._db);
}

// 計算某商品已登記總量
export function getTotalOrders(db, productId) {
  let total = 0;
  for (const [key, order] of Object.entries(db.orders)) {
    if (key.endsWith('_' + productId) && order.qty > 0) total += order.qty;
  }
  return total;
}

// 取某通路對某商品的訂單
export function getDealerOrder(db, dealerId, productId) {
  return db.orders[`${dealerId}_${productId}`] || { qty: 0, note: '' };
}

// 更新訂單
export function setDealerOrder(db, dealerId, productId, qty, note) {
  db.orders[`${dealerId}_${productId}`] = { qty, note, updatedAt: new Date().toISOString() };
  commitDB();
}

// 取某業務的所有通路
export function getSalesDealers(db, salesName) {
  return Object.entries(db.dealers)
    .filter(([, d]) => d.sales.toLowerCase() === salesName.toLowerCase())
    .map(([id, d]) => ({ id, ...d }));
}

// 取所有商品列表 (flat)
export function getAllProducts(db) {
  const list = [];
  for (const [vendor, prods] of Object.entries(db.products)) {
    prods.forEach(p => list.push({ vendor, ...p }));
  }
  return list;
}

// MOQ 狀態
export function getMOQStatus(db, product) {
  const total = getTotalOrders(db, product.id);
  const pm = db.pmData[product.id] || {};
  const ordered = pm.vendorOrdered || 0;
  const remaining = ordered > 0 ? Math.max(0, ordered - total) : null;
  let status = 'normal';
  if (total === 0) status = 'empty';
  else if (total < product.moq) status = 'below_moq';
  else if (product.maxOrder && total > product.maxOrder) status = 'over_max';
  else status = 'ok';
  return { total, ordered, remaining, status };
}

window.DB = { getDB, commitDB, loadDB, saveDB, getTotalOrders, getDealerOrder, setDealerOrder, getSalesDealers, getAllProducts, getMOQStatus };
