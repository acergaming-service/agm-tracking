// ═══════════════════════════════════════════════════════════════
//  firebase.js — AGM 追貨平台 Firebase 共用層
//
//  使用前：請將下方 FIREBASE_CONFIG 換成你自己的設定
//  取得方式：Firebase Console → 專案設定 → 你的應用程式 → firebaseConfig
// ═══════════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ─── Firebase SDK (compat v9 CDN) ────────────────────────────────────────────
// 已在每個 HTML 的 <head> 載入，這裡直接使用全域 firebase 物件

let _db = null;   // Firebase Database 實例
let _cache = {};  // 本地快取，減少重複讀取

// ─── 初始化 ──────────────────────────────────────────────────────────────────
export function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  _db = firebase.database();
  return _db;
}

// ─── 基礎讀寫 ─────────────────────────────────────────────────────────────────

/** 一次性讀取某路徑的值 */
export async function fbGet(path) {
  const snap = await _db.ref(path).once('value');
  return snap.val();
}

/** 寫入（覆蓋）某路徑 */
export async function fbSet(path, value) {
  await _db.ref(path).set(value);
}

/** 合併更新（只更新指定欄位） */
export async function fbUpdate(path, updates) {
  await _db.ref(path).update(updates);
}

/** 刪除某路徑 */
export async function fbRemove(path) {
  await _db.ref(path).remove();
}

/** 訂閱即時更新（傳回 unsubscribe function） */
export function fbListen(path, callback) {
  const ref = _db.ref(path);
  ref.on('value', snap => callback(snap.val()));
  return () => ref.off('value');
}

// ─── 業務封裝 ─────────────────────────────────────────────────────────────────

/**
 * 讀取整個 DB（商品主檔 + 通路設定 + 收單視窗）
 * products / dealers / window 是靜態設定，只讀一次後快取
 */
export async function loadStaticConfig() {
  const [products, dealers, win] = await Promise.all([
    fbGet('products'),
    fbGet('dealers'),
    fbGet('window'),
  ]);
  _cache.products = products || DEFAULT_PRODUCTS;
  _cache.dealers  = dealers  || DEFAULT_DEALERS;
  _cache.window   = win      || DEFAULT_WINDOW;
  return { products: _cache.products, dealers: _cache.dealers, window: _cache.window };
}

/** 讀取全部訂單（後勤 / 業務用） */
export async function loadAllOrders() {
  const orders = await fbGet('orders');
  return orders || {};
}

/** 讀取某通路的所有訂單 */
export async function loadDealerOrders(dealerId) {
  const orders = await fbGet(`orders/${dealerId}`);
  return orders || {};
}

/** 寫入單筆訂單 */
export async function setOrder(dealerId, productId, qty, note = '', submitted = false) {
  const payload = { qty, note, submitted, updatedAt: new Date().toISOString() };
  await fbSet(`orders/${dealerId}/${productId}`, payload);
}

/** 批次寫入某通路所有訂單（覆蓋該通路） */
export async function setDealerOrders(dealerId, ordersMap) {
  await fbSet(`orders/${dealerId}`, ordersMap);
}

/** 讀取 PM 回填資料（MOQ、到貨日等） */
export async function loadPMData() {
  const d = await fbGet('pmData');
  return d || {};
}

/** 寫入單筆 PM 資料 */
export async function setPMField(productId, field, value) {
  await fbUpdate(`pmData/${productId}`, { [field]: value });
}

/** 控制收單視窗 */
export async function setWindow(updates) {
  await fbUpdate('window', updates);
}

/** 即時監聽收單視窗狀態 */
export function listenWindow(callback) {
  return fbListen('window', callback);
}

/** 即時監聽全部訂單（後勤儀表板用） */
export function listenOrders(callback) {
  return fbListen('orders', callback);
}

/** 即時監聽某通路訂單（經銷商填單頁用） */
export function listenDealerOrders(dealerId, callback) {
  return fbListen(`orders/${dealerId}`, callback);
}

// 新增 / 更新商品
export async function saveProduct(vendor, product) {
  await fbSet(`products/${vendor}/${product.id}`, product);
}
export async function deleteProduct(vendor, productId) {
  await fbRemove(`products/${vendor}/${productId}`);
}

// products 存成物件（id 為 key），轉成陣列方便 UI 用
export function productsObjToArray(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return Object.values(obj);
}

// ─── 預設資料（首次部署時寫入 Firebase） ──────────────────────────────────────

export const DEFAULT_WINDOW = {
  open: true,
  week: (() => {
    const d = new Date();
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - jan1) / 86400000) + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
  })()
};

export const DEFAULT_DEALERS = {
  wangqi:   { name:'王碁',    sales:'Edward',  code:'WQ' },
  pulei:    { name:'普雷伊',  sales:'Edward',  code:'PL' },
  xingyun:  { name:'馨運',    sales:'Edward',  code:'XY' },
  yishidai: { name:'壹世代',  sales:'Edward',  code:'YS' },
  chengyi:  { name:'誠翼',    sales:'Edward',  code:'CY' },
  books:    { name:'Books',   sales:'Edward',  code:'BK' },
  bahamu:   { name:'巴哈姆特',sales:'Edward',  code:'BH' },
  moli:     { name:'摩力科',  sales:'Hsinhui', code:'ML' },
  pipi:     { name:'PIPI',    sales:'Hsinhui', code:'PP' },
  xinglong: { name:'星龍',    sales:'Hsinhui', code:'XL' },
  ge:       { name:'GE',      sales:'Hsinhui', code:'GE' },
  lucky:    { name:'幸運草',  sales:'Hsinhui', code:'LC' },
  yuesheng: { name:'玥勝',    sales:'Hsinhui', code:'YSH'},
  kaifa:    { name:'凱發',    sales:'Hsinhui', code:'KF' },
  dinosaur: { name:'恐龍',    sales:'Hsinhui', code:'KL' },
  weixin:   { name:'偉昕',    sales:'AKI',     code:'WX' },
  gamer:    { name:'遊戲達人',sales:'AKI',     code:'GD' },
  kb:       { name:'KB',      sales:'AKI',     code:'KB' },
  waruji:   { name:'丸紀',    sales:'AKI',     code:'MR' },
  ksns:     { name:'高雄NS',  sales:'AKI',     code:'KS' },
  sunding:  { name:'順發',    sales:'AKI',     code:'SF' },
  ada:      { name:'艾達',    sales:'AKI',     code:'AD' },
  drz:      { name:'DRZ',     sales:'AKI',     code:'DZ' },
  pchome:   { name:'PCHOME',  sales:'Mickey',  code:'PC' },
  momo:     { name:'MOMO',    sales:'Mickey',  code:'MM' },
  yahoo:    { name:'YAHOO',   sales:'Wythe',   code:'YH' },
  samsui:   { name:'三井',    sales:'Tom',     code:'SM' },
  shennao:  { name:'神腦',    sales:'Tom',     code:'SN' },
};

export const DEFAULT_PRODUCTS = {
  BNE: {
    BNE001: { id:'BNE001', pn:'ZL.A00TZ.1FO', platform:'NS',  name:'NS 關於我轉生變成史萊姆這檔事 坦派斯特開拓譚', srp:1490, price:933,  moq:50,  maxOrder:null, arrival:'現貨',          status:'available' },
    BNE002: { id:'BNE002', pn:'ZL.A00TZ.17S',  platform:'NS',  name:'NS 鋼彈創壞者4 標準版',                        srp:1790, price:1210, moq:50,  maxOrder:null, arrival:'現貨',          status:'available' },
    BNE003: { id:'BNE003', pn:'ZL.A00TZ.1FN',  platform:'NS',  name:'NS ONE PIECE 時光旅詩豪華版',                  srp:1490, price:980,  moq:30,  maxOrder:null, arrival:'現貨',          status:'available' },
    BNE004: { id:'BNE004', pn:'ZL.A00TZ.1JM',  platform:'NS',  name:'NS 超級機器人大戰 Y',                          srp:1990, price:1611, moq:100, maxOrder:200,  arrival:'已到貨',        status:'available' },
    BNE005: { id:'BNE005', pn:'ZL.A00TZ.1LL',  platform:'PS5', name:'PS5 數碼寶貝物語 時空異客',                    srp:1790, price:1500, moq:60,  maxOrder:null, arrival:'延遲到貨 12月第1周', status:'delayed'  },
    BNE006: { id:'BNE006', pn:'ZL.A00TZ.1C7',  platform:'NS',  name:'NS 太鼓之達人 咚咚雷音祭',                     srp:1090, price:914,  moq:100, maxOrder:null, arrival:'即將到貨',      status:'incoming'  },
    BNE007: { id:'BNE007', pn:'ZL.A00TZ.1BF',  platform:'NS',  name:'NS 王牌釣手 歡釣水族館',                       srp:1090, price:882,  moq:50,  maxOrder:null, arrival:'現貨',          status:'available' },
    BNE008: { id:'BNE008', pn:'ZL.A00TZ.1BQ',  platform:'NS',  name:'NS 小小夢靨 2',                               srp:990,  price:773,  moq:60,  maxOrder:null, arrival:'現貨',          status:'available' },
    BNE009: { id:'BNE009', pn:'ZL.A00TZ.1BS',  platform:'NS',  name:'NS 火影忍者疾風傳 終極風暴4 慕留人傳',          srp:1190, price:929,  moq:60,  maxOrder:null, arrival:'現貨',          status:'available' },
    BNE010: { id:'BNE010', pn:'ZL.A00TZ.1OX',  platform:'NS',  name:'NS 七龍珠電光炸裂！ZERO',                      srp:1790, price:1400, moq:50,  maxOrder:null, arrival:'現貨',          status:'available' },
    BNE011: { id:'BNE011', pn:'ZL.A00TZ.1FX',  platform:'PS5', name:'PS5 光與影：33號遠征隊',                       srp:1490, price:1107, moq:100, maxOrder:200,  arrival:'12月中到貨',    status:'preorder'  },
    BNE012: { id:'BNE012', pn:'ZL.A00TZ.1LI',  platform:'NS',  name:'NS 小小夢魘3',                                srp:1190, price:950,  moq:50,  maxOrder:null, arrival:'現貨',          status:'available' },
  },
  GS: {
    GS001: { id:'GS001', pn:'ZL.A00TZ.11S', platform:'NS',  name:'NS 胡鬧搬家2 亞洲版',         srp:890,  price:720,  moq:100, maxOrder:null, arrival:'現貨',   status:'available' },
    GS002: { id:'GS002', pn:'ZL.A00TZ.12C', platform:'NS',  name:'NS 胡鬧廚房 全都好吃 亞洲版', srp:990,  price:801,  moq:100, maxOrder:null, arrival:'請用現庫', status:'available' },
    GS003: { id:'GS003', pn:'ZL.A00TZ.11K', platform:'NS',  name:'NS JACKJEANNE 繁體中文版',    srp:1690, price:1368, moq:100, maxOrder:100,  arrival:'現貨',   status:'available' },
    GS004: { id:'GS004', pn:'ZL.A00TZ.15N', platform:'NS',  name:'NS 9 R.I.P. 普通版',         srp:1790, price:1449, moq:30,  maxOrder:null, arrival:'現貨',   status:'available' },
    GS005: { id:'GS005', pn:'ZL.A00TZ.11N', platform:'NS',  name:'NS 共生邱比特 繁體中文版',    srp:1550, price:1255, moq:20,  maxOrder:null, arrival:'現貨',   status:'available' },
    GS006: { id:'GS006', pn:'ZL.A00TZ.11U', platform:'PS5', name:'PS5 胡鬧搬家2 亞洲版',        srp:890,  price:720,  moq:30,  maxOrder:null, arrival:'現貨',   status:'available' },
    GS007: { id:'GS007', pn:'ZL.A00TZ.12B', platform:'PS5', name:'PS5 胡鬧廚房 全都好吃 亞洲版',srp:990,  price:801,  moq:30,  maxOrder:null, arrival:'現貨',   status:'available' },
  },
  SONY: {
    PS001: { id:'PS001', pn:'ZL.A00TZ.078', platform:'PS5', name:'PS5 戰神：諸神黃昏 普通版',      srp:1990, price:1692, moq:50,  maxOrder:null, arrival:'現貨', status:'available' },
    PS002: { id:'PS002', pn:'ZL.A00TZ.1HE', platform:'PS5', name:'PS5 羊蹄山戰鬼 普通版',          srp:1990, price:1611, moq:100, maxOrder:300,  arrival:'現貨', status:'available' },
    PS003: { id:'PS003', pn:'ZL.A00TZ.0LW', platform:'PS5', name:'PS5 漫威蜘蛛人2 普通版',          srp:1990, price:1692, moq:50,  maxOrder:null, arrival:'現貨', status:'available' },
    PS004: { id:'PS004', pn:'ZL.A00TZ.01D', platform:'PS5', name:'PS5 對馬戰鬼 導演剪輯版',         srp:1990, price:1692, moq:50,  maxOrder:null, arrival:'現貨', status:'available' },
    PS005: { id:'PS005', pn:'ZL.A00TZ.19F', platform:'PS5', name:'PS5 地平線：期待黎明 重製版',     srp:1490, price:1267, moq:50,  maxOrder:null, arrival:'現貨', status:'available' },
    PS006: { id:'PS006', pn:'ZL.A00TZ.01J', platform:'PS5', name:'PS5 死亡擱淺導演剪輯版',          srp:1490, price:1267, moq:50,  maxOrder:null, arrival:'現貨', status:'available' },
    PS007: { id:'PS007', pn:'ZL.A00TZ.1HN', platform:'PS5', name:'PS5 機甲戰魔 神話之裔',           srp:1790, price:1449, moq:20,  maxOrder:null, arrival:'現貨', status:'available' },
  }
};

/**
 * 首次部署時呼叫：把預設商品 / 通路資料寫入 Firebase
 * 在 PM 管理頁的「初始化資料庫」按鈕觸發
 */
export async function seedDatabase() {
  await Promise.all([
    fbSet('products', DEFAULT_PRODUCTS),
    fbSet('dealers',  DEFAULT_DEALERS),
    fbSet('window',   DEFAULT_WINDOW),
  ]);
}
