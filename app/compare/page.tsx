'use client'
import { useState, useEffect, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type OccFit = { score: number; hpiYears: number; rpi: number; eoi: '强'|'中'|'弱' }
type EoiVal = '强'|'中'|'弱'

// ── Property types ────────────────────────────────────────────────────────────
const PROP_TYPES = [
  { id: '1br',       label: '1居室',   priceMult: 0.70, rentMult: 0.78 },
  { id: '2br',       label: '2居室',   priceMult: 1.00, rentMult: 1.00 },
  { id: '3br',       label: '3居室',   priceMult: 1.38, rentMult: 1.35 },
  { id: 'townhouse', label: '联排别墅', priceMult: 1.55, rentMult: 1.45 },
  { id: 'detached',  label: '独立屋',  priceMult: 2.20, rentMult: 1.70 },
]

// ── Scenario-adjusted score ───────────────────────────────────────────────────
function getAdjScore(base: OccFit, priceMult: number, rentMult: number): number {
  const adjH = base.hpiYears * priceMult
  const adjR = base.rpi * rentMult
  let delta = 0
  if (adjH > 10 && base.hpiYears <= 10) delta -= 5
  if (adjH > 14 && base.hpiYears <= 14) delta -= 5
  if (adjR > 38 && base.rpi <= 38)      delta -= 4
  if (adjR > 45 && base.rpi <= 45)      delta -= 4
  if (adjH < 6  && base.hpiYears >= 6)  delta += 5
  if (adjH < 10 && base.hpiYears >= 10) delta += 5
  if (adjR < 30 && base.rpi >= 30)      delta += 4
  if (adjR < 38 && base.rpi >= 38)      delta += 4
  return Math.max(10, Math.min(99, base.score + delta))
}

// ── City data ─────────────────────────────────────────────────────────────────
const CITY_BASE: Record<string, {
  name: string; short: string; province: string
  eoi: number; tai: number; hai: number; eqi: number; tci: number; psi: number; edi: number
  medianRent: number; basePrice: number; taiNote: string
}> = {
  vancouver: { name:'温哥华', short:'YVR', province:'BC', eoi:80, tai:72, hai:88, eqi:90, tci:82, psi:72, edi:80, medianRent:2950, basePrice:1050000, taiNote:'GST 5% + PST 7%' },
  toronto:   { name:'多伦多', short:'YYZ', province:'ON', eoi:92, tai:68, hai:90, eqi:75, tci:78, psi:68, edi:82, medianRent:2750, basePrice:980000,  taiNote:'HST 13%' },
  calgary:   { name:'卡尔加里', short:'YYC', province:'AB', eoi:65, tai:90, hai:78, eqi:82, tci:48, psi:78, edi:72, medianRent:1950, basePrice:550000,  taiNote:'无PST，仅GST 5%' },
  montreal:  { name:'蒙特利尔', short:'YUL', province:'QC', eoi:72, tai:42, hai:75, eqi:78, tci:72, psi:70, edi:80, medianRent:1850, basePrice:580000,  taiNote:'GST+QST≈15%' },
  ottawa:    { name:'渥太华', short:'YOW', province:'ON', eoi:75, tai:68, hai:82, eqi:80, tci:55, psi:82, edi:85, medianRent:2100, basePrice:650000,  taiNote:'HST 13%' },
}

// ── Fit matrix ────────────────────────────────────────────────────────────────
const FIT_MATRIX: Record<string, Record<string, OccFit>> = {
  vancouver: {
    electrician:   { score:72, hpiYears:13.0, rpi:42, eoi:'强' },
    software_eng:  { score:84, hpiYears:9.5,  rpi:36, eoi:'强' },
    nurse:         { score:68, hpiYears:12.8, rpi:43, eoi:'中' },
    doctor:        { score:82, hpiYears:5.5,  rpi:18, eoi:'强' },
    pharmacist:    { score:74, hpiYears:10.5, rpi:35, eoi:'中' },
    data_analyst:  { score:72, hpiYears:11.5, rpi:38, eoi:'中' },
    it_support:    { score:58, hpiYears:17.0, rpi:57, eoi:'中' },
    engineer:      { score:70, hpiYears:11.4, rpi:38, eoi:'中' },
    plumber:       { score:65, hpiYears:13.5, rpi:45, eoi:'中' },
    carpenter:     { score:55, hpiYears:15.5, rpi:52, eoi:'中' },
    teacher:       { score:62, hpiYears:14.0, rpi:46, eoi:'中' },
    accountant:    { score:65, hpiYears:15.2, rpi:49, eoi:'中' },
    lawyer:        { score:78, hpiYears:8.1,  rpi:27, eoi:'中' },
    police:        { score:70, hpiYears:12.5, rpi:41, eoi:'强' },
    firefighter:   { score:68, hpiYears:12.4, rpi:41, eoi:'强' },
    social_worker: { score:42, hpiYears:18.2, rpi:61, eoi:'中' },
    truck_driver:  { score:52, hpiYears:16.5, rpi:54, eoi:'中' },
    mechanic:      { score:55, hpiYears:15.5, rpi:52, eoi:'中' },
    chef:          { score:38, hpiYears:20.0, rpi:68, eoi:'中' },
    retail:        { score:32, hpiYears:26.0, rpi:68, eoi:'中' },
    self_employed: { score:48, hpiYears:16.2, rpi:54, eoi:'弱' },
    freelancer:    { score:38, hpiYears:20.2, rpi:68, eoi:'弱' },
    unemployed:    { score:22, hpiYears:42.0, rpi:142, eoi:'弱' },
    retired:       { score:40, hpiYears:25.0, rpi:84, eoi:'弱' },
  },
  toronto: {
    electrician:   { score:70, hpiYears:12.5, rpi:40, eoi:'强' },
    software_eng:  { score:88, hpiYears:9.2,  rpi:34, eoi:'强' },
    nurse:         { score:72, hpiYears:12.0, rpi:41, eoi:'强' },
    doctor:        { score:86, hpiYears:4.5,  rpi:15, eoi:'强' },
    pharmacist:    { score:76, hpiYears:9.4,  rpi:32, eoi:'强' },
    data_analyst:  { score:75, hpiYears:11.5, rpi:39, eoi:'强' },
    it_support:    { score:60, hpiYears:15.8, rpi:53, eoi:'强' },
    engineer:      { score:72, hpiYears:10.7, rpi:36, eoi:'强' },
    plumber:       { score:65, hpiYears:12.6, rpi:43, eoi:'强' },
    carpenter:     { score:56, hpiYears:14.5, rpi:49, eoi:'中' },
    teacher:       { score:65, hpiYears:13.2, rpi:44, eoi:'强' },
    accountant:    { score:72, hpiYears:13.8, rpi:46, eoi:'强' },
    lawyer:        { score:82, hpiYears:7.6,  rpi:25, eoi:'强' },
    police:        { score:68, hpiYears:11.8, rpi:40, eoi:'强' },
    firefighter:   { score:68, hpiYears:11.5, rpi:39, eoi:'强' },
    social_worker: { score:44, hpiYears:16.9, rpi:57, eoi:'强' },
    truck_driver:  { score:55, hpiYears:15.8, rpi:52, eoi:'中' },
    mechanic:      { score:56, hpiYears:14.4, rpi:49, eoi:'中' },
    chef:          { score:36, hpiYears:18.8, rpi:63, eoi:'中' },
    retail:        { score:30, hpiYears:24.5, rpi:65, eoi:'中' },
    self_employed: { score:50, hpiYears:15.1, rpi:51, eoi:'弱' },
    freelancer:    { score:40, hpiYears:18.8, rpi:63, eoi:'弱' },
    unemployed:    { score:24, hpiYears:39.2, rpi:132, eoi:'弱' },
    retired:       { score:42, hpiYears:23.3, rpi:79, eoi:'弱' },
  },
  calgary: {
    electrician:   { score:91, hpiYears:3.9,  rpi:24, eoi:'强' },
    software_eng:  { score:78, hpiYears:5.2,  rpi:28, eoi:'中' },
    nurse:         { score:86, hpiYears:4.5,  rpi:25, eoi:'强' },
    doctor:        { score:92, hpiYears:2.5,  rpi:11, eoi:'强' },
    pharmacist:    { score:84, hpiYears:5.2,  rpi:22, eoi:'中' },
    data_analyst:  { score:76, hpiYears:6.5,  rpi:27, eoi:'中' },
    it_support:    { score:68, hpiYears:8.9,  rpi:38, eoi:'中' },
    engineer:      { score:82, hpiYears:6.0,  rpi:25, eoi:'强' },
    plumber:       { score:80, hpiYears:7.1,  rpi:30, eoi:'强' },
    carpenter:     { score:72, hpiYears:8.1,  rpi:34, eoi:'中' },
    teacher:       { score:80, hpiYears:5.8,  rpi:28, eoi:'中' },
    accountant:    { score:78, hpiYears:6.2,  rpi:30, eoi:'中' },
    lawyer:        { score:86, hpiYears:4.2,  rpi:18, eoi:'中' },
    police:        { score:84, hpiYears:4.8,  rpi:25, eoi:'强' },
    firefighter:   { score:82, hpiYears:4.6,  rpi:24, eoi:'强' },
    social_worker: { score:64, hpiYears:9.5,  rpi:40, eoi:'中' },
    truck_driver:  { score:82, hpiYears:5.5,  rpi:26, eoi:'强' },
    mechanic:      { score:74, hpiYears:8.1,  rpi:34, eoi:'强' },
    chef:          { score:55, hpiYears:10.6, rpi:45, eoi:'中' },
    retail:        { score:52, hpiYears:13.2, rpi:42, eoi:'中' },
    self_employed: { score:72, hpiYears:8.5,  rpi:36, eoi:'弱' },
    freelancer:    { score:62, hpiYears:10.6, rpi:45, eoi:'弱' },
    unemployed:    { score:35, hpiYears:22.0, rpi:94, eoi:'弱' },
    retired:       { score:58, hpiYears:13.1, rpi:56, eoi:'弱' },
  },
  montreal: {
    electrician:   { score:68, hpiYears:5.5,  rpi:30, eoi:'中' },
    software_eng:  { score:70, hpiYears:5.2,  rpi:28, eoi:'中' },
    nurse:         { score:65, hpiYears:6.0,  rpi:32, eoi:'中' },
    doctor:        { score:78, hpiYears:2.6,  rpi:10, eoi:'中' },
    pharmacist:    { score:68, hpiYears:5.5,  rpi:22, eoi:'中' },
    data_analyst:  { score:64, hpiYears:6.8,  rpi:26, eoi:'中' },
    it_support:    { score:55, hpiYears:9.4,  rpi:36, eoi:'弱' },
    engineer:      { score:66, hpiYears:6.3,  rpi:25, eoi:'中' },
    plumber:       { score:62, hpiYears:7.5,  rpi:29, eoi:'中' },
    carpenter:     { score:55, hpiYears:8.5,  rpi:33, eoi:'中' },
    teacher:       { score:68, hpiYears:5.8,  rpi:30, eoi:'中' },
    accountant:    { score:62, hpiYears:6.8,  rpi:34, eoi:'中' },
    lawyer:        { score:72, hpiYears:4.5,  rpi:17, eoi:'中' },
    police:        { score:65, hpiYears:6.5,  rpi:32, eoi:'中' },
    firefighter:   { score:64, hpiYears:6.3,  rpi:31, eoi:'中' },
    social_worker: { score:48, hpiYears:10.0, rpi:38, eoi:'中' },
    truck_driver:  { score:60, hpiYears:7.2,  rpi:36, eoi:'中' },
    mechanic:      { score:56, hpiYears:8.5,  rpi:33, eoi:'中' },
    chef:          { score:44, hpiYears:11.2, rpi:43, eoi:'弱' },
    retail:        { score:45, hpiYears:13.5, rpi:44, eoi:'弱' },
    self_employed: { score:65, hpiYears:8.9,  rpi:34, eoi:'弱' },
    freelancer:    { score:60, hpiYears:11.2, rpi:43, eoi:'弱' },
    unemployed:    { score:34, hpiYears:23.2, rpi:89, eoi:'弱' },
    retired:       { score:55, hpiYears:13.8, rpi:53, eoi:'弱' },
  },
  ottawa: {
    electrician:   { score:74, hpiYears:6.8,  rpi:28, eoi:'中' },
    software_eng:  { score:80, hpiYears:6.2,  rpi:26, eoi:'强' },
    nurse:         { score:82, hpiYears:6.5,  rpi:27, eoi:'强' },
    doctor:        { score:88, hpiYears:3.0,  rpi:11, eoi:'强' },
    pharmacist:    { score:78, hpiYears:6.2,  rpi:24, eoi:'中' },
    data_analyst:  { score:74, hpiYears:7.6,  rpi:30, eoi:'中' },
    it_support:    { score:64, hpiYears:10.5, rpi:41, eoi:'中' },
    engineer:      { score:76, hpiYears:7.1,  rpi:28, eoi:'中' },
    plumber:       { score:70, hpiYears:8.3,  rpi:33, eoi:'中' },
    carpenter:     { score:62, hpiYears:9.6,  rpi:38, eoi:'中' },
    teacher:       { score:80, hpiYears:7.0,  rpi:28, eoi:'强' },
    accountant:    { score:74, hpiYears:7.8,  rpi:30, eoi:'中' },
    lawyer:        { score:84, hpiYears:5.0,  rpi:19, eoi:'强' },
    police:        { score:80, hpiYears:6.8,  rpi:28, eoi:'强' },
    firefighter:   { score:78, hpiYears:6.5,  rpi:27, eoi:'强' },
    social_worker: { score:56, hpiYears:11.2, rpi:43, eoi:'中' },
    truck_driver:  { score:65, hpiYears:8.5,  rpi:34, eoi:'中' },
    mechanic:      { score:62, hpiYears:9.6,  rpi:38, eoi:'中' },
    chef:          { score:46, hpiYears:12.5, rpi:48, eoi:'弱' },
    retail:        { score:44, hpiYears:16.0, rpi:50, eoi:'弱' },
    self_employed: { score:65, hpiYears:10.0, rpi:39, eoi:'弱' },
    freelancer:    { score:58, hpiYears:12.5, rpi:48, eoi:'弱' },
    unemployed:    { score:32, hpiYears:26.0, rpi:101, eoi:'弱' },
    retired:       { score:52, hpiYears:15.5, rpi:60, eoi:'弱' },
  },
}

const ALL_CITY_IDS = ['vancouver', 'toronto', 'calgary', 'montreal', 'ottawa']

const OCCUPATIONS = [
  // 医疗
  { id:'nurse',         name:'注册护士'   },
  { id:'doctor',        name:'家庭医生'   },
  { id:'pharmacist',    name:'药剂师'     },
  // 科技
  { id:'software_eng',  name:'软件工程师' },
  { id:'data_analyst',  name:'数据分析师' },
  { id:'it_support',    name:'IT技术支持' },
  // 工程建筑
  { id:'electrician',   name:'电工'       },
  { id:'engineer',      name:'土木工程师' },
  { id:'plumber',       name:'水管工'     },
  { id:'carpenter',     name:'木工'       },
  // 教育
  { id:'teacher',       name:'中学教师'   },
  // 法律金融
  { id:'accountant',    name:'会计师'     },
  { id:'lawyer',        name:'律师'       },
  // 公共服务
  { id:'police',        name:'警察'       },
  { id:'firefighter',   name:'消防员'     },
  { id:'social_worker', name:'社会工作者' },
  // 运输物流
  { id:'truck_driver',  name:'卡车司机'   },
  { id:'mechanic',      name:'汽车技师'   },
  // 服务业
  { id:'chef',          name:'厨师'       },
  { id:'retail',        name:'零售店员'   },
  // 其他身份
  { id:'self_employed', name:'自雇 / 个体经营' },
  { id:'freelancer',    name:'自由职业者'      },
  { id:'unemployed',    name:'暂未就业'        },
  { id:'retired',       name:'退休 / 财富自由' },
]
const OCC_NAME: Record<string,string> = Object.fromEntries(OCCUPATIONS.map(o=>[o.id,o.name]))

// ── Dimension config ──────────────────────────────────────────────────────────
type Dim = { key: string; label: string; unit: string; lowerBetter: boolean; tooltip: string }
const DIMS: Dim[] = [
  { key:'score',    label:'综合适配分',   unit:'',   lowerBetter:false, tooltip:'综合考虑住房负担、租金压力、就业机会、税收环境和城市生活质量，并根据职业与住房需求进行调整。' },
  { key:'hpiYears', label:'房价/年收入',  unit:'年收入',  lowerBetter:true,  tooltip:'房价与职业年收入之比，例如"13年收入"表示买房需要13年的税前收入。数值越低，住房负担越轻。数据参考CMHC。' },
  { key:'rpi',      label:'租金压力',     unit:'%',  lowerBetter:true,  tooltip:'租金占月收入的比例。30% 以内为国际通行可接受水平，超过 40% 为高压区间。数据参考CMHC。' },
  { key:'tai',      label:'税收指数 TAI', unit:'',   lowerBetter:false, tooltip:'城市（省）级整体税收友好程度，综合省级所得税与消费税结构。分值越高，税后可支配收入越多。' },
  { key:'eoi',      label:'就业机会 EOI', unit:'',   lowerBetter:false, tooltip:'职业在该城市的就业市场活跃程度与岗位供给密度。括号内为本职业的市场强度评级。数据参考Job Bank。' },
  { key:'hai',      label:'医疗可及 HAI', unit:'',   lowerBetter:false, tooltip:'公共医疗体系覆盖完善程度，包括家庭医生可及性与基础医疗设施密度。数据参考CIHI。' },
  { key:'eqi',      label:'环境质量 EQI', unit:'',   lowerBetter:false, tooltip:'城市自然环境与生活环境质量，包括空气质量、绿地可及性。数据参考ECCC。' },
  { key:'tci',      label:'公共交通 TCI', unit:'',   lowerBetter:false, tooltip:'公共交通网络覆盖广度与日常通勤可行性。分值越高，无车生活越可行。' },
  { key:'psi',      label:'公共安全 PSI', unit:'',   lowerBetter:false, tooltip:'城市整体社区安全水平。数据参考Statistics Canada犯罪严重程度指数（CSI）。' },
  { key:'edi',      label:'教育资源 EDI', unit:'',   lowerBetter:false, tooltip:'高等教育与基础教育资源丰富程度。对有子女或计划在本地进修的家庭参考价值较高。' },
]

const DIM_GROUPS = [
  { label:'钱与住房',     sub:'住房压力、税收与租金',        keys:['score','hpiYears','rpi','tai'] },
  { label:'工作与收入',   sub:'职业机会与就业市场强度',      keys:['eoi'] },
  { label:'城市生活质量', sub:'医疗、环境、交通、安全、教育', keys:['hai','eqi','tci','psi','edi'] },
]

// ── Color helpers ─────────────────────────────────────────────────────────────
const sc = (s:number) => s>=80?'#14B8A6':s>=70?'#F59E0B':s>=55?'#F59E0B':s>=40?'#E86C2F':'#EF4444'
const hc = (y:number) => y<6?'#14B8A6':y<10?'#F59E0B':y<14?'#E86C2F':'#EF4444'
const rc = (r:number) => r<30?'#14B8A6':r<38?'#F59E0B':r<45?'#E86C2F':'#EF4444'
const dc = (v:number) => v>=80?'#14B8A6':v>=65?'#60A5FA':'#F59E0B'
const eoiN = (e:EoiVal) => e==='强'?3:e==='中'?2:1
const ec = (cityEoi:number) => cityEoi>=75?'#14B8A6':cityEoi>=55?'#F59E0B':'#E86C2F'
const rkc = (r:number) => r===1?'#14B8A6':r===2?'#60A5FA':r===3?'#F59E0B':'rgba(255,255,255,0.35)'
const hl = (y:number) => y<6?'可负担':y<10?'可承受':y<14?'沉重':'严峻'
const rl = (r:number) => r<30?'健康':r<38?'偏高':r<45?'高压':'危险'

function eoiBlend(cityEoi:number, fitEoi:EoiVal):string {
  if (cityEoi >= 75) return fitEoi
  if (cityEoi >= 55) { if (fitEoi==='强') return '中强'; if (fitEoi==='中') return '中'; return '弱' }
  if (fitEoi==='强') return '中'; if (fitEoi==='中') return '中弱'; return '弱'
}

// ── Dim value / display (propType-aware) ──────────────────────────────────────
function getDimValue(slug:string, occ:string, key:string, priceMult=1, rentMult=1):number {
  const fit = FIT_MATRIX[slug]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'中' as EoiVal }
  const city = CITY_BASE[slug]
  if (!city) return 0
  switch(key) {
    case 'score':    return getAdjScore(fit, priceMult, rentMult)
    case 'hpiYears': return parseFloat((fit.hpiYears * priceMult).toFixed(1))
    case 'rpi':      return Math.round(fit.rpi * rentMult)
    case 'eoi': return city.eoi
    case 'tai': return city.tai
    case 'hai': return city.hai
    case 'eqi': return city.eqi
    case 'tci': return city.tci
    case 'psi': return city.psi
    case 'edi': return city.edi
    default:    return 0
  }
}

function getDimDisplay(slug:string, occ:string, key:string, priceMult=1, rentMult=1):string {
  const fit = FIT_MATRIX[slug]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'中' as EoiVal }
  const city = CITY_BASE[slug]
  if (!city) return '-'
  switch(key) {
    case 'score':    return String(getAdjScore(fit, priceMult, rentMult))
    case 'hpiYears': return `${(fit.hpiYears * priceMult).toFixed(1)}年收入`
    case 'rpi':      return `${Math.round(fit.rpi * rentMult)}%`
    case 'eoi':      return `${city.eoi} ${eoiBlend(city.eoi, fit.eoi)}`
    case 'tai':      return String(city.tai)
    case 'hai':      return String(city.hai)
    case 'eqi':      return String(city.eqi)
    case 'tci':      return String(city.tci)
    case 'psi':      return String(city.psi)
    case 'edi':      return String(city.edi)
    default:         return '-'
  }
}

// ── Verdict logic (propType-aware) ────────────────────────────────────────────
function getVerdictLayers(winSlug:string, loseSlug:string, occ:string, wFit:OccFit, lFit:OccFit) {
  const wCity   = CITY_BASE[winSlug]
  const lCity   = CITY_BASE[loseSlug]
  const occName = OCC_NAME[occ] ?? occ

  const hpiAdv  = lFit.hpiYears - wFit.hpiYears
  const rpiAdv  = lFit.rpi - wFit.rpi
  const taiAdv  = wCity.tai - lCity.tai
  const eoiAdv  = eoiN(wFit.eoi) - eoiN(lFit.eoi)

  let winType = '综合'
  if (hpiAdv > 4 && rpiAdv > 8)         winType = '资产积累型'
  else if (hpiAdv > 4 && taiAdv > 12)   winType = '税收效率型'
  else if (eoiAdv > 0 && hpiAdv > 2)    winType = '职业发展型'
  else if (wCity.eqi > lCity.eqi + 8)   winType = '生活质量型'
  else if (hpiAdv > 2)                  winType = '住房友好型'

  const loserPillars: string[] = []
  if (lCity.eoi > wCity.eoi + 6)        loserPillars.push('就业密度')
  if (lCity.eqi > wCity.eqi + 6)        loserPillars.push('自然环境')
  if (lCity.hai > wCity.hai + 6)        loserPillars.push('医疗资源')
  if (lCity.tci > wCity.tci + 12)       loserPillars.push('公共交通')
  if (lCity.edi > wCity.edi + 6)        loserPillars.push('教育资源')
  if (eoiN(lFit.eoi) >= eoiN(wFit.eoi)) loserPillars.push(`${occName}就业机会`)
  if (loserPillars.length === 0)        loserPillars.push('综合城市配套')

  let choiceQ = '你更看重经济效率，还是城市配套？'
  if (hpiAdv > 4 && lCity.eoi > wCity.eoi + 6)
    choiceQ = `你更看重买房压力（${wCity.name} ${wFit.hpiYears}年收入 vs ${lFit.hpiYears}年收入），还是职业机会密度？`
  else if (taiAdv > 15)
    choiceQ = `你更看重税后可支配收入（${wCity.taiNote}），还是城市成熟度？`
  else if (lCity.eqi > wCity.eqi + 8)
    choiceQ = `你更看重经济效率，还是自然环境与气候？`
  else if (lCity.tci > wCity.tci + 12)
    choiceQ = `你更看重住房成本，还是无车生活的可行性？`

  return {
    primary:   `${wCity.name}更适合${winType}${occName}`,
    secondary: `${lCity.name}更适合重视${loserPillars.slice(0,3).join('、')}的人`,
    choiceQ,
  }
}

function getWhyWins(winSlug:string, loseSlug:string, occ:string, wFit:OccFit, lFit:OccFit):string[] {
  const wCity = CITY_BASE[winSlug], lCity = CITY_BASE[loseSlug]
  const reasons: string[] = []
  if (wFit.hpiYears < lFit.hpiYears - 1)
    reasons.push(`房价/年收入 ${wFit.hpiYears} vs ${lFit.hpiYears}年收入，相差 ${(lFit.hpiYears - wFit.hpiYears).toFixed(1)}年`)
  if (wFit.rpi < lFit.rpi - 3)
    reasons.push(`租金占收入 ${wFit.rpi}% vs ${lFit.rpi}%，每月可支配收入更宽裕`)
  if (eoiN(wFit.eoi) > eoiN(lFit.eoi))
    reasons.push(`${OCC_NAME[occ]}就业机会更强（${wFit.eoi} vs ${lFit.eoi}）`)
  if (wCity.tai > lCity.tai + 10)
    reasons.push(`税收负担更轻（${wCity.taiNote} vs ${lCity.taiNote}）`)
  if (wCity.psi > lCity.psi + 5)
    reasons.push(`公共安全评分更高（${wCity.psi} vs ${lCity.psi}）`)
  if (wCity.tci > lCity.tci + 10)
    reasons.push(`公共交通更发达（指数 ${wCity.tci} vs ${lCity.tci}）`)
  if (reasons.length === 0)
    reasons.push(`${OCC_NAME[occ]}综合适配分领先 ${wFit.score - lFit.score} 分`)
  return reasons.slice(0,4)
}

// ── "Why" one-liner ───────────────────────────────────────────────────────────
function getWhySentence(winAdj:OccFit, loseAdj:OccFit, winCity:typeof CITY_BASE[string], loseCity:typeof CITY_BASE[string]):string {
  const hpiAdv = loseAdj.hpiYears - winAdj.hpiYears
  const rpiAdv = loseAdj.rpi - winAdj.rpi
  const taiAdv = winCity.tai - loseCity.tai
  if (hpiAdv > 3 && rpiAdv > 8) {
    const pct = Math.round(winAdj.hpiYears / loseAdj.hpiYears * 100)
    return `因为${winCity.name}房价/收入比仅为${loseCity.name}的 ${pct}%，且租金压力低 ${rpiAdv} 个百分点。`
  }
  if (hpiAdv > 3)
    return `因为${winCity.name}买房仅需 ${winAdj.hpiYears}年收入，显著低于${loseCity.name}的 ${loseAdj.hpiYears}年收入，相差 ${hpiAdv.toFixed(1)} 年。`
  if (rpiAdv > 8)
    return `因为${winCity.name}租金占月收入仅 ${winAdj.rpi}%，比${loseCity.name}（${loseAdj.rpi}%）低 ${rpiAdv} 个百分点，每月可支配收入更宽裕。`
  if (taiAdv > 15)
    return `因为${winCity.name}综合税负更低（TAI ${winCity.tai} vs ${loseCity.tai}），税后可支配收入优势明显。`
  return `综合住房负担、租金压力与就业机会各项指标，${winCity.name}在当前情景下更具整体优势。`
}

// ── Score drivers breakdown ───────────────────────────────────────────────────
function getScoreDrivers(winAdj:OccFit, loseAdj:OccFit, winCity:typeof CITY_BASE[string], loseCity:typeof CITY_BASE[string], occ:string, totalDiff:number) {
  const hpiC = loseAdj.hpiYears > winAdj.hpiYears ? Math.min(9, Math.round((loseAdj.hpiYears - winAdj.hpiYears) * 0.55)) : 0
  const rpiC = loseAdj.rpi > winAdj.rpi           ? Math.min(6, Math.round((loseAdj.rpi - winAdj.rpi) * 0.16))           : 0
  const taiC = winCity.tai > loseCity.tai          ? Math.min(5, Math.round((winCity.tai - loseCity.tai) * 0.07))         : 0
  const eoiC = eoiN(winAdj.eoi) > eoiN(loseAdj.eoi)                                                                       ? 2 : 0
  const psiC = winCity.psi > loseCity.psi + 5                                                                              ? 1 : 0
  return [
    hpiC > 0 && { label:'住房压力更低', contrib:hpiC, detail:`${winAdj.hpiYears} vs ${loseAdj.hpiYears}年收入` },
    rpiC > 0 && { label:'租金压力更小', contrib:rpiC, detail:`${winAdj.rpi}% vs ${loseAdj.rpi}%` },
    taiC > 0 && { label:'税收更友好',   contrib:taiC, detail:`TAI ${winCity.tai} vs ${loseCity.tai}` },
    eoiC > 0 && { label:`${OCC_NAME[occ]}机会更强`, contrib:eoiC, detail:`${winAdj.eoi} vs ${loseAdj.eoi}` },
    psiC > 0 && { label:'安全评分领先', contrib:psiC, detail:`${winCity.psi} vs ${loseCity.psi}` },
  ].filter(Boolean).sort((a:any,b:any) => b.contrib - a.contrib).slice(0,4) as { label:string; contrib:number; detail:string }[]
}

function getWhyStill(loseSlug:string, winSlug:string, occ:string, lFit:OccFit, wFit:OccFit):string[] {
  const lCity = CITY_BASE[loseSlug], wCity = CITY_BASE[winSlug]
  const reasons: string[] = []
  if (lCity.eoi > wCity.eoi + 5)
    reasons.push(`就业市场体量更大（城市 EOI ${lCity.eoi} vs ${wCity.eoi}）`)
  if (lCity.eqi > wCity.eqi + 5)
    reasons.push(`自然环境与空气质量更好（EQI ${lCity.eqi} vs ${wCity.eqi}）`)
  if (lCity.hai > wCity.hai + 5)
    reasons.push(`医疗体系更完善（HAI ${lCity.hai} vs ${wCity.hai}）`)
  if (lCity.tci > wCity.tci + 10)
    reasons.push(`公共交通更成熟，无车生活可行性更高`)
  if (lCity.edi > wCity.edi + 5)
    reasons.push(`教育资源密度更高（EDI ${lCity.edi} vs ${wCity.edi}）`)
  if (eoiN(lFit.eoi) >= eoiN(wFit.eoi))
    reasons.push(`${OCC_NAME[occ]}就业机会不弱，仍具竞争力`)
  reasons.push('多元文化氛围与生活方式的多样性更丰富')
  return reasons.slice(0,3)
}

function getSuitableFor(winSlug:string, loseSlug:string, occ:string, wFit:OccFit, lFit:OccFit) {
  const wCity = CITY_BASE[winSlug], lCity = CITY_BASE[loseSlug]
  const occName = OCC_NAME[occ] ?? occ
  const hpiDiff = +(lFit.hpiYears - wFit.hpiYears).toFixed(1)
  const rpiDiff = lFit.rpi - wFit.rpi

  const winReasons: string[] = []
  if (hpiDiff > 2)
    winReasons.push(`你想更快脱离房价压力（${wCity.name} ${wFit.hpiYears} vs ${lCity.name} ${lFit.hpiYears}年收入）`)
  if (rpiDiff > 5)
    winReasons.push(`你希望租金压力更小（${wCity.name} ${wFit.rpi}% vs ${lCity.name} ${lFit.rpi}%）`)
  if (wCity.tai > lCity.tai + 10)
    winReasons.push(`你希望税后可支配收入更高（${wCity.taiNote} vs ${lCity.taiNote}）`)
  if (eoiN(wFit.eoi) > eoiN(lFit.eoi))
    winReasons.push(`你从事${occName}且优先考虑就业机会的充裕程度`)
  if (wCity.psi > lCity.psi + 5)
    winReasons.push(`你更看重社区安全感（安全指数 ${wCity.psi} vs ${lCity.psi}）`)
  if (wCity.eqi > lCity.eqi + 8)
    winReasons.push(`你更看重自然环境与空气质量（环境指数 ${wCity.eqi} vs ${lCity.eqi}）`)
  if (winReasons.length < 3)
    winReasons.push(`${occName}在${wCity.name}的综合适配分领先（${wFit.score} vs ${lFit.score}）`)

  const loseReasons: string[] = []
  if (lCity.eoi > wCity.eoi + 5)
    loseReasons.push(`你需要更大的就业市场体量（城市就业指数 ${lCity.eoi} vs ${wCity.eoi}）`)
  if (lCity.eqi > wCity.eqi + 5)
    loseReasons.push(`你更看重自然环境与气候`)
  if (lCity.hai > wCity.hai + 5)
    loseReasons.push(`你更看重医疗体系的完善程度（HAI ${lCity.hai} vs ${wCity.hai}）`)
  if (lCity.tci > wCity.tci + 10)
    loseReasons.push(`你依赖公共交通，不打算买车（交通指数 ${lCity.tci} vs ${wCity.tci}）`)
  if (lCity.edi > wCity.edi + 5)
    loseReasons.push(`你有孩子，或计划在本地进修（教育指数 ${lCity.edi} vs ${wCity.edi}）`)
  loseReasons.push(`你愿意为更成熟的城市配套支付更高的生活成本`)
  return { winReasons: winReasons.slice(0,5), loseReasons: loseReasons.slice(0,4) }
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
      <button onClick={() => setOpen(!open)} style={{ width:15, height:15, borderRadius:'50%', background:'rgba(255,255,255,0.10)', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.38)', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>?</button>
      {open && (
        <div style={{ position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)', width:260, background:'#1e2a3a', border:'1px solid rgba(255,255,255,0.14)', borderRadius:10, padding:'11px 13px', zIndex:100, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
          <p style={{ color:'rgba(255,255,255,0.68)', fontSize:12, lineHeight:1.65, margin:0 }}>{text}</p>
          <div style={{ position:'absolute', bottom:-5, left:'50%', transform:'translateX(-50%)', width:8, height:8, background:'#1e2a3a', border:'1px solid rgba(255,255,255,0.14)', borderTop:'none', borderLeft:'none', rotate:'45deg' }} />
        </div>
      )}
    </div>
  )
}

// ── Score bubble with rank ─────────────────────────────────────────────────────
function ScoreBubble({ slug, city, adjScore, rank, totalCities, isWinner, propTypeLabel }: {
  slug: string; city: typeof CITY_BASE[string]
  adjScore: number; rank: number; totalCities: number
  isWinner: boolean; propTypeLabel: string
}) {
  const rColor = rkc(rank)
  return (
    <div style={{ textAlign:'center', padding:'16px 18px', background:'rgba(255,255,255,0.04)', border:`1px solid ${isWinner ? 'rgba(20,184,166,0.30)' : 'rgba(255,255,255,0.08)'}`, borderRadius:16, minWidth:96 }}>
      <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11, marginBottom:4 }}>{city.name}</div>
      <div style={{ color:sc(adjScore), fontSize:38, fontWeight:900, fontFamily:'monospace', lineHeight:1, letterSpacing:'-2px' }}>{adjScore}</div>
      <div style={{ color:'rgba(255,255,255,0.42)', fontSize:11, marginBottom:6 }}>/100 · {propTypeLabel}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'4px 8px', borderRadius:20, background: rColor + '18', border:`1px solid ${rColor}30` }}>
        <span style={{ color:rColor, fontWeight:900, fontSize:13 }}>#{rank}</span>
        <span style={{ color:'rgba(255,255,255,0.45)', fontSize:11 }}>/ {totalCities}</span>
      </div>
      {isWinner && <div style={{ marginTop:6, color:'#14B8A6', fontSize:10, fontWeight:700, letterSpacing:'0.06em' }}>WINNER</div>}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ComparePage() {
  const [slugA,    setSlugA   ] = useState('')
  const [slugB,    setSlugB   ] = useState('')
  const [occ,      setOcc     ] = useState('')
  const [propType, setPropType] = useState('2br')
  const [dropA,    setDropA   ] = useState(false)
  const [dropB,    setDropB   ] = useState(false)
  const [dropO,    setDropO   ] = useState(false)
  const [copied,   setCopied  ] = useState(false)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const cities = p.get('cities')?.split(',') ?? []
    if (cities[0] && CITY_BASE[cities[0]]) setSlugA(cities[0])
    if (cities[1] && CITY_BASE[cities[1]]) setSlugB(cities[1])
    const occP = p.get('occupation')
    if (occP && OCCUPATIONS.find(x=>x.id===occP)) setOcc(occP)
    const housP = p.get('housing')
    if (housP && PROP_TYPES.find(p=>p.id===housP)) setPropType(housP)
  }, [])

  const pt      = PROP_TYPES.find(p => p.id === propType) ?? PROP_TYPES[1]
  const occName = OCC_NAME[occ] ?? ''
  const ready   = !!slugA && !!slugB && !!occ

  const cityA   = CITY_BASE[slugA] ?? CITY_BASE['vancouver']
  const cityB   = CITY_BASE[slugB] ?? CITY_BASE['calgary']
  const fitA    = FIT_MATRIX[slugA]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'中' as EoiVal }
  const fitB    = FIT_MATRIX[slugB]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'中' as EoiVal }

  // Adjusted fit values
  const adjA = {
    ...fitA,
    score:    getAdjScore(fitA, pt.priceMult, pt.rentMult),
    hpiYears: parseFloat((fitA.hpiYears * pt.priceMult).toFixed(1)),
    rpi:      Math.round(fitA.rpi * pt.rentMult),
  }
  const adjB = {
    ...fitB,
    score:    getAdjScore(fitB, pt.priceMult, pt.rentMult),
    hpiYears: parseFloat((fitB.hpiYears * pt.priceMult).toFixed(1)),
    rpi:      Math.round(fitB.rpi * pt.rentMult),
  }
  const adjPriceA = Math.round(cityA.basePrice * pt.priceMult)
  const adjPriceB = Math.round(cityB.basePrice * pt.priceMult)
  const adjRentA  = Math.round(cityA.medianRent * pt.rentMult)
  const adjRentB  = Math.round(cityB.medianRent * pt.rentMult)

  // Rank both cities across all 5
  const rankList    = occ ? ALL_CITY_IDS.filter(id => FIT_MATRIX[id]?.[occ]).map(id => ({ id, score: getAdjScore(FIT_MATRIX[id][occ], pt.priceMult, pt.rentMult) })).sort((a,b) => b.score - a.score) : []
  const rankA       = rankList.findIndex(c => c.id === slugA) + 1
  const rankB       = rankList.findIndex(c => c.id === slugB) + 1
  const totalCities = rankList.length

  const aWins    = adjA.score >= adjB.score
  const winSlug  = aWins ? slugA : slugB
  const loseSlug = aWins ? slugB : slugA
  const winner   = aWins ? cityA : cityB
  const loser    = aWins ? cityB : cityA
  const winAdj   = aWins ? adjA : adjB
  const loseAdj  = aWins ? adjB : adjA
  const scoreDiff = Math.abs(adjA.score - adjB.score)

  const verdict    = ready ? getVerdictLayers(winSlug, loseSlug, occ, winAdj, loseAdj) : { primary:'', secondary:'', choiceQ:'' }
  const suitable   = ready ? getSuitableFor(winSlug, loseSlug, occ, winAdj, loseAdj)   : { winReasons:[] as string[], loseReasons:[] as string[] }
  const whyWins    = ready ? getWhyWins(winSlug, loseSlug, occ, winAdj, loseAdj)        : []
  const whyStill   = ready ? getWhyStill(loseSlug, winSlug, occ, loseAdj, winAdj)       : []

  const dimRows = DIMS.map(d => {
    const vA   = getDimValue(slugA, occ, d.key, pt.priceMult, pt.rentMult)
    const vB   = getDimValue(slugB, occ, d.key, pt.priceMult, pt.rentMult)
    const aW   = d.lowerBetter ? vA < vB : vA > vB
    const tie  = vA === vB
    return { ...d, vA, vB, dispA: getDimDisplay(slugA, occ, d.key, pt.priceMult, pt.rentMult), dispB: getDimDisplay(slugB, occ, d.key, pt.priceMult, pt.rentMult), aWins: tie ? null : aW }
  })

  const closeDrops = () => { setDropA(false); setDropB(false); setDropO(false) }

  return (
    <main style={{ minHeight:'100vh', background:'#0d1117' }}>
      <style>{`
        .drop-menu { position:absolute; top:calc(100% + 8px); left:0; right:0; background:#1a2035; border:1px solid rgba(255,255,255,0.12); border-radius:14px; overflow:hidden; z-index:50; }
        .drop-menu-inner { max-height:300px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.18) transparent; }
        .drop-menu-inner::-webkit-scrollbar { width:4px; }
        .drop-menu-inner::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.18); border-radius:2px; }
        .drop-item:hover { background:rgba(255,255,255,0.06); }
        .dim-row:hover { background:rgba(255,255,255,0.04) !important; }
        @media (max-width:700px) { .col2 { grid-template-columns:1fr !important; } }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(160deg,#0d1117 0%,#151827 70%,#1a2035 100%)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'32px 32px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:28 }}>
            <a href="/" style={{ color:'rgba(255,255,255,0.50)', fontSize:12, textDecoration:'none' }}>首页</a>
            <span style={{ color:'rgba(255,255,255,0.38)', fontSize:12 }}>/</span>
            <span style={{ color:'rgba(255,255,255,0.42)', fontSize:12 }}>城市对比</span>
          </div>

          {/* ── Selectors row ── */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>

            {/* City A */}
            <div style={{ position:'relative', flex:'1 1 160px' }}>
              <button onClick={() => { setDropA(!dropA); setDropB(false); setDropO(false) }}
                style={{ width:'100%', padding:'12px 16px', borderRadius:14, background:'rgba(79,142,247,0.10)', border:`1.5px solid ${slugA ? 'rgba(79,142,247,0.30)' : 'rgba(79,142,247,0.50)'}`, cursor:'pointer', textAlign:'left' }}>
                {slugA ? <>
                  <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11 }}>{cityA.province}</div>
                  <div style={{ color:'white', fontSize:17, fontWeight:800 }}>{cityA.name}</div>
                  <div style={{ color: rkc(rankA), fontSize:11, fontWeight:700, marginTop:2 }}>{ready ? `全国榜 #${rankA}/${totalCities} · ${pt.label}` : pt.label}</div>
                </> : <>
                  <div style={{ color:'rgba(79,142,247,0.50)', fontSize:11 }}>城市 A</div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:17, fontWeight:800 }}>选择城市 ▾</div>
                  <div style={{ color:'rgba(255,255,255,0.20)', fontSize:11, marginTop:2 }}>点击选择</div>
                </>}
              </button>
              {dropA && (
                <div className="drop-menu">
                  <div className="drop-menu-inner">
                    {Object.entries(CITY_BASE).filter(([k])=>k!==slugB).map(([k,c]) => {
                      const s = getAdjScore(FIT_MATRIX[k]?.[occ] ?? {score:50,hpiYears:10,rpi:40,eoi:'中'}, pt.priceMult, pt.rentMult)
                      return (
                        <button key={k} className="drop-item" onClick={() => { setSlugA(k); closeDrops() }}
                          style={{ width:'100%', padding:'11px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:k===slugA?'rgba(79,142,247,0.08)':'transparent', border:'none' }}>
                          <span style={{ color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:k===slugA?700:400 }}>{c.name}</span>
                          <span style={{ color:sc(s), fontSize:13, fontWeight:700, fontFamily:'monospace' }}>{s}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ color:'rgba(255,255,255,0.50)', fontSize:18, fontWeight:300, flexShrink:0 }}>vs</div>

            {/* City B */}
            <div style={{ position:'relative', flex:'1 1 160px' }}>
              <button onClick={() => { setDropB(!dropB); setDropA(false); setDropO(false) }}
                style={{ width:'100%', padding:'12px 16px', borderRadius:14, background:'rgba(20,184,166,0.08)', border:`1.5px solid ${slugB ? 'rgba(20,184,166,0.22)' : 'rgba(20,184,166,0.50)'}`, cursor:'pointer', textAlign:'left' }}>
                {slugB ? <>
                  <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11 }}>{cityB.province}</div>
                  <div style={{ color:'white', fontSize:17, fontWeight:800 }}>{cityB.name}</div>
                  <div style={{ color: rkc(rankB), fontSize:11, fontWeight:700, marginTop:2 }}>{ready ? `全国榜 #${rankB}/${totalCities} · ${pt.label}` : pt.label}</div>
                </> : <>
                  <div style={{ color:'rgba(20,184,166,0.50)', fontSize:11 }}>城市 B</div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:17, fontWeight:800 }}>选择城市 ▾</div>
                  <div style={{ color:'rgba(255,255,255,0.20)', fontSize:11, marginTop:2 }}>点击选择</div>
                </>}
              </button>
              {dropB && (
                <div className="drop-menu">
                  <div className="drop-menu-inner">
                    {Object.entries(CITY_BASE).filter(([k])=>k!==slugA).map(([k,c]) => {
                      const s = getAdjScore(FIT_MATRIX[k]?.[occ] ?? {score:50,hpiYears:10,rpi:40,eoi:'中'}, pt.priceMult, pt.rentMult)
                      return (
                        <button key={k} className="drop-item" onClick={() => { setSlugB(k); closeDrops() }}
                          style={{ width:'100%', padding:'11px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:k===slugB?'rgba(20,184,166,0.08)':'transparent', border:'none' }}>
                          <span style={{ color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:k===slugB?700:400 }}>{c.name}</span>
                          <span style={{ color:sc(s), fontSize:13, fontWeight:700, fontFamily:'monospace' }}>{s}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ color:'rgba(255,255,255,0.38)', fontSize:13, flexShrink:0 }}>·</div>

            {/* Occupation */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button onClick={() => { setDropO(!dropO); setDropA(false); setDropB(false) }}
                style={{ padding:'12px 16px', borderRadius:14, background:'rgba(255,255,255,0.05)', border:`1px solid ${occ ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.28)'}`, cursor:'pointer', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' }}>
                <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>职业</span>
                <span style={{ color: occ ? 'white' : 'rgba(255,255,255,0.30)', fontSize:15, fontWeight:700 }}>{occ ? occName : '选择职业'}</span>
                <span style={{ color:'rgba(255,255,255,0.50)', fontSize:11 }}>▾</span>
              </button>
              {dropO && (
                <div className="drop-menu" style={{ right:'auto', minWidth:180 }}>
                  <div className="drop-menu-inner">
                    {OCCUPATIONS.map(o => (
                      <button key={o.id} className="drop-item" onClick={() => { setOcc(o.id); closeDrops() }}
                        style={{ width:'100%', padding:'10px 16px', cursor:'pointer', background:o.id===occ?'rgba(255,255,255,0.06)':'transparent', border:'none', textAlign:'left' }}>
                        <span style={{ color:'rgba(255,255,255,0.8)', fontSize:13, fontWeight:o.id===occ?700:400 }}>{o.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Housing type toggle ── */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28, padding:'12px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14 }}>
            <div>
              <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.06em' }}>住房需求假设</div>
              <div style={{ color:'rgba(255,255,255,0.42)', fontSize:11, marginTop:2 }}>影响适配分、租金与买房压力</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:3, marginLeft:'auto' }}>
              <div style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.05)', borderRadius:10, padding:3 }}>
                {PROP_TYPES.slice(0,3).map(p => (
                  <button key={p.id} onClick={() => setPropType(p.id)}
                    style={{ padding:'6px 14px', borderRadius:7, fontSize:13, fontWeight:p.id===propType?700:500, cursor:'pointer', border:'none', background:p.id===propType?'rgba(255,255,255,0.11)':'transparent', color:p.id===propType?'white':'rgba(255,255,255,0.32)', transition:'all 0.15s', whiteSpace:'nowrap' }}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', gap:3 }}>
                {PROP_TYPES.slice(3).map(p => (
                  <button key={p.id} onClick={() => setPropType(p.id)}
                    style={{ flex:1, padding:'5px 10px', borderRadius:7, fontSize:12, fontWeight:p.id===propType?700:500, cursor:'pointer', border:`1px solid ${p.id===propType?'rgba(255,255,255,0.20)':'rgba(255,255,255,0.08)'}`, background:p.id===propType?'rgba(255,255,255,0.10)':'rgba(255,255,255,0.02)', color:p.id===propType?'white':'rgba(255,255,255,0.32)', transition:'all 0.15s', whiteSpace:'nowrap' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ color:'rgba(255,255,255,0.48)', fontSize:11, whiteSpace:'nowrap' }}>
              当前：{pt.label} · {
                propType==='1br'?'单身/情侣':
                propType==='2br'?'小家庭':
                propType==='3br'?'大家庭公寓':
                propType==='townhouse'?'联排别墅':'独立屋'
              }
            </div>
          </div>

          {/* ── NOT READY: prompt ── */}
          {!ready && (
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'48px 32px', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:16 }}>🏙️</div>
              <h2 style={{ color:'white', fontSize:20, fontWeight:800, margin:'0 0 10px' }}>选择两座城市和你的职业</h2>
              <p style={{ color:'rgba(255,255,255,0.42)', fontSize:14, margin:'0 0 24px', lineHeight:1.6 }}>
                完成上方选择后，系统将自动生成<br/>两城市的全维度对比报告
              </p>
              <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
                {!slugA && <div style={{ padding:'8px 16px', borderRadius:10, border:'1px dashed rgba(79,142,247,0.40)', color:'rgba(79,142,247,0.70)', fontSize:13 }}>① 选择城市 A</div>}
                {!slugB && <div style={{ padding:'8px 16px', borderRadius:10, border:'1px dashed rgba(20,184,166,0.40)', color:'rgba(20,184,166,0.70)', fontSize:13 }}>② 选择城市 B</div>}
                {!occ   && <div style={{ padding:'8px 16px', borderRadius:10, border:'1px dashed rgba(255,255,255,0.20)', color:'rgba(255,255,255,0.40)', fontSize:13 }}>③ 选择职业</div>}
              </div>
            </div>
          )}

          {/* ── VERDICT ── */}
          {ready && <div style={{ background:'rgba(20,184,166,0.06)', border:'1px solid rgba(20,184,166,0.20)', borderRadius:20, padding:'28px 32px' }}>
            <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', marginBottom:12 }}>
              VERDICT · {occName} · {pt.label}
            </div>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:280 }}>
                <h1 style={{ color:'#FFFFFF', fontSize:24, fontWeight:900, lineHeight:1.2, margin:0, marginBottom:6 }}>{verdict.primary}</h1>
                <p style={{ color:'rgba(255,255,255,0.42)', fontSize:14, margin:'0 0 10px', lineHeight:1.5 }}>{verdict.secondary}</p>
                <p style={{ color:'rgba(20,184,166,0.75)', fontSize:13, margin:'0 0 16px', lineHeight:1.5, fontStyle:'italic' }}>
                  {getWhySentence(winAdj, loseAdj, winner, loser)}
                </p>

                {/* Score drivers */}
                {scoreDiff > 0 && (() => {
                  const drivers = getScoreDrivers(winAdj, loseAdj, winner, loser, occ, scoreDiff)
                  if (drivers.length === 0) return null
                  return (
                    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', marginBottom:16 }}>
                      <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', marginBottom:10 }}>
                        {winner.name}领先原因
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {drivers.map((d,i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(20,184,166,0.07)', border:'1px solid rgba(20,184,166,0.18)', borderRadius:8, padding:'5px 10px' }}>
                            <span style={{ color:'#14B8A6', fontWeight:800, fontSize:13, fontFamily:'monospace' }}>+{d.contrib}</span>
                            <span style={{ color:'rgba(255,255,255,0.58)', fontSize:12 }}>{d.label}</span>
                            <span style={{ color:'rgba(255,255,255,0.48)', fontSize:11 }}>({d.detail})</span>
                          </div>
                        ))}
                        <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:8, padding:'5px 10px' }}>
                          <span style={{ color:'rgba(255,255,255,0.45)', fontWeight:800, fontSize:13, fontFamily:'monospace' }}>+{scoreDiff}</span>
                          <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>总领先</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                <div style={{ display:'inline-block', background:'rgba(232,108,47,0.10)', border:'1px solid rgba(232,108,47,0.28)', borderRadius:8, padding:'8px 14px' }}>
                  <span style={{ color:'#E86C2F', fontSize:13, fontWeight:600 }}>{verdict.choiceQ}</span>
                </div>
              </div>

              {/* Score pair with ranks */}
              <div style={{ display:'flex', gap:10, flexShrink:0 }}>
                <ScoreBubble slug={slugA} city={cityA} adjScore={adjA.score} rank={rankA} totalCities={totalCities} isWinner={aWins && scoreDiff > 0} propTypeLabel={pt.label} />
                <ScoreBubble slug={slugB} city={cityB} adjScore={adjB.score} rank={rankB} totalCities={totalCities} isWinner={!aWins && scoreDiff > 0} propTypeLabel={pt.label} />
              </div>
            </div>
          </div>}
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      {ready && <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 32px', display:'flex', flexDirection:'column', gap:28 }}>

        {/* ── WHY WINS / STILL MATTERS ── */}
        <div className="col2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div style={{ background:'rgba(20,184,166,0.06)', border:'1px solid rgba(20,184,166,0.18)', borderRadius:18, padding:'22px 24px' }}>
            <div style={{ color:'#14B8A6', fontSize:11, fontWeight:800, letterSpacing:'0.08em', marginBottom:14 }}>WHY {winner.name.toUpperCase()} LEADS</div>
            {whyWins.map((r,i) => (
              <div key={i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                <div style={{ width:4, height:4, borderRadius:'50%', background:'#14B8A6', marginTop:8, flexShrink:0 }} />
                <span style={{ color:'rgba(255,255,255,0.68)', fontSize:13, lineHeight:1.65 }}>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.16)', borderRadius:18, padding:'22px 24px' }}>
            <div style={{ color:'#F59E0B', fontSize:11, fontWeight:800, letterSpacing:'0.08em', marginBottom:14 }}>WHY {loser.name.toUpperCase()} STILL MATTERS</div>
            {whyStill.map((r,i) => (
              <div key={i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                <div style={{ width:4, height:4, borderRadius:'50%', background:'#F59E0B', marginTop:8, flexShrink:0 }} />
                <span style={{ color:'rgba(255,255,255,0.68)', fontSize:13, lineHeight:1.65 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 谁更适合 ── */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:22, borderRadius:2, background:'#4F8EF7' }} />
            <div>
              <h2 style={{ color:'#FFFFFF', fontSize:22, fontWeight:800, margin:0 }}>谁更适合哪里</h2>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:13 }}>根据你的优先级，不是一个绝对答案</span>
            </div>
          </div>
          <div className="col2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'20px 22px' }}>
              <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11, marginBottom:14, fontWeight:600 }}>{winner.name}更适合你，如果…</div>
              {suitable.winReasons.map((r,i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                  <div style={{ color:'#14B8A6', fontSize:14, marginTop:1, flexShrink:0 }}>✓</div>
                  <span style={{ color:'rgba(255,255,255,0.72)', fontSize:13, lineHeight:1.65 }}>{r}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'20px 22px' }}>
              <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11, marginBottom:14, fontWeight:600 }}>{loser.name}更适合你，如果…</div>
              {suitable.loseReasons.map((r,i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                  <div style={{ color:'#F59E0B', fontSize:14, marginTop:1, flexShrink:0 }}>✓</div>
                  <span style={{ color:'rgba(255,255,255,0.72)', fontSize:13, lineHeight:1.65 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── QUICK COMPARISON ── */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:22, borderRadius:2, background:'#4F8EF7' }} />
            <h2 style={{ color:'#FFFFFF', fontSize:22, fontWeight:800, margin:0 }}>快速对比</h2>
          </div>
          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'10px 20px', background:'rgba(255,255,255,0.02)' }}>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.06em' }}>维度</span>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, textAlign:'center' }}>{cityA.name}</span>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, textAlign:'center' }}>{cityB.name}</span>
            </div>
            {[
              { label:'综合适配', key:'score' },
              { label:'买房压力', key:'hpiYears' },
              { label:'租金压力', key:'rpi' },
              { label:'税收指数', key:'tai' },
              { label:'就业机会', key:'eoi' },
              { label:'医疗资源', key:'hai' },
              { label:'公共交通', key:'tci' },
              { label:'公共安全', key:'psi' },
            ].map((item, i) => {
              const row = dimRows.find(d => d.key === item.key)
              if (!row) return null
              const aW = row.aWins === true
              const bW = row.aWins === false
              return (
                <div key={item.key} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'10px 20px', background:i%2===0?'rgba(255,255,255,0.018)':'transparent', borderBottom:i<7?'1px solid rgba(255,255,255,0.04)':'none', alignItems:'center' }}>
                  <span style={{ color:'rgba(255,255,255,0.52)', fontSize:13 }}>{item.label}</span>
                  <div style={{ textAlign:'center' }}>
                    <span style={{ color:aW?'#14B8A6':bW?'rgba(255,255,255,0.40)':'rgba(255,255,255,0.55)', fontSize:13, fontWeight:aW?800:500 }}>{row.dispA}</span>
                    {aW && <span style={{ marginLeft:5, color:'#14B8A6', fontSize:10, fontWeight:700 }}>✓</span>}
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <span style={{ color:bW?'#14B8A6':aW?'rgba(255,255,255,0.40)':'rgba(255,255,255,0.55)', fontSize:13, fontWeight:bW?800:500 }}>{row.dispB}</span>
                    {bW && <span style={{ marginLeft:5, color:'#14B8A6', fontSize:10, fontWeight:700 }}>✓</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── DIMENSION TABLE ── */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:22, borderRadius:2, background:'#4F8EF7' }} />
            <div>
              <h2 style={{ color:'#FFFFFF', fontSize:22, fontWeight:800, margin:0 }}>逐维对比</h2>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:13 }}>住房指标已按 {pt.label} 调整</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr 1fr', gap:8, padding:'8px 20px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:4 }}>
            <span style={{ color:'rgba(255,255,255,0.62)', fontSize:14, fontWeight:700 }}>维度</span>
            <span style={{ color:'rgba(255,255,255,0.62)', fontSize:14, fontWeight:700, textAlign:'center' }}>{cityA.name}</span>
            <span style={{ color:'rgba(255,255,255,0.62)', fontSize:14, fontWeight:700, textAlign:'center' }}>{cityB.name}</span>
          </div>
          {DIM_GROUPS.map(group => {
            const groupRows = dimRows.filter(d => group.keys.includes(d.key))
            return (
              <div key={group.label} style={{ marginBottom:8 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr 1fr', gap:8, padding:'10px 20px 8px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase' }}>{group.label}</span>
                    <span style={{ color:'rgba(255,255,255,0.32)', fontSize:11, marginLeft:8 }}>· {group.sub}</span>
                  </div>
                </div>
                {groupRows.map((d,i) => {
                  const aW = d.aWins === true, bW = d.aWins === false
                  return (
                    <div key={d.key} className="dim-row"
                      style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr 1fr', gap:8, padding:'12px 20px', borderRadius:8, background:i%2===0?'rgba(255,255,255,0.022)':'transparent', alignItems:'center', transition:'background 0.15s' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ color:'rgba(255,255,255,0.52)', fontSize:13 }}>{d.label}</span>
                        <Tooltip text={d.tooltip} />
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                        <span style={{ fontFamily:['score','hpiYears','rpi'].includes(d.key)?'monospace':'inherit', color:d.key==='score'?sc(d.vA):d.key==='hpiYears'?hc(d.vA):d.key==='rpi'?rc(d.vA):d.key==='eoi'?ec(d.vA):dc(d.vA), fontSize:14, fontWeight:800 }}>{d.dispA}</span>
                        {aW  && <span style={{ fontSize:10, fontWeight:700, color:'#14B8A6', letterSpacing:'0.05em' }}>WIN</span>}
                        {!aW && !bW && <span style={{ fontSize:10, color:'rgba(255,255,255,0.38)' }}>—</span>}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                        <span style={{ fontFamily:['score','hpiYears','rpi'].includes(d.key)?'monospace':'inherit', color:d.key==='score'?sc(d.vB):d.key==='hpiYears'?hc(d.vB):d.key==='rpi'?rc(d.vB):d.key==='eoi'?ec(d.vB):dc(d.vB), fontSize:14, fontWeight:800 }}>{d.dispB}</span>
                        {bW  && <span style={{ fontSize:10, fontWeight:700, color:'#14B8A6', letterSpacing:'0.05em' }}>WIN</span>}
                        {!aW && !bW && <span style={{ fontSize:10, color:'rgba(255,255,255,0.38)' }}>—</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* ── HOUSING SNAPSHOT ── */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:22, borderRadius:2, background:'#4F8EF7' }} />
            <div>
              <h2 style={{ color:'#FFFFFF', fontSize:22, fontWeight:800, margin:0 }}>住房快照</h2>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:13 }}>{occName} × {pt.label}情景</span>
            </div>
          </div>
          <div className="col2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              { slug:slugA, city:cityA, adjFit:adjA, adjPrice:adjPriceA, adjRent:adjRentA, rank:rankA },
              { slug:slugB, city:cityB, adjFit:adjB, adjPrice:adjPriceB, adjRent:adjRentB, rank:rankB },
            ].map(({slug,city,adjFit,adjPrice,adjRent,rank}) => (
              <div key={slug} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>{city.name} · {city.province}</span>
                  <span style={{ color: rkc(rank), fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, background: rkc(rank) + '15', border: `1px solid ${rkc(rank)}30` }}>#{rank} / {totalCities}</span>
                </div>
                {[
                  { label:`${pt.label}参考房价`, value:`$${adjPrice.toLocaleString()}`, color:'rgba(255,255,255,0.82)' },
                  { label:'房价/年收入',          value:`${adjFit.hpiYears}年收入`,           color:hc(adjFit.hpiYears), sub: hl(adjFit.hpiYears) },
                  { label:`${pt.label}中位租金`,  value:`$${adjRent.toLocaleString()}/月`, color:'rgba(255,255,255,0.82)' },
                  { label:'租金占月收入',          value:`${adjFit.rpi}%`,               color:rc(adjFit.rpi), sub: rl(adjFit.rpi) },
                  { label:'税收结构',              value:city.taiNote,                    color:'rgba(255,255,255,0.45)' },
                ].map(item => (
                  <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>{item.label}</span>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ color:item.color, fontSize:13, fontWeight:700, fontFamily:'monospace' }}>{item.value}</span>
                      {'sub' in item && item.sub && <span style={{ color:item.color, fontSize:10, marginLeft:5, opacity:0.7 }}>{item.sub}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:12 }}>
          <a href={`/calculate?city=${winSlug}&occupation=${occ}&housing=${propType}`}
            style={{ display:'block', padding:'18px 22px', borderRadius:14, textDecoration:'none', background:'linear-gradient(135deg,#4F8EF7,#5B5CF0)' }}>
            <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11, marginBottom:4 }}>输入你的真实情况，获得个性化结果</div>
            <div style={{ color:'white', fontWeight:800, fontSize:15 }}>用我的情况重新计算 →</div>
          </a>
          <a href={`/city/${winSlug}?occupation=${occ}&housing=${propType}`}
            style={{ display:'block', padding:'18px 22px', borderRadius:14, textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)' }}>
            <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11, marginBottom:4 }}>深入了解</div>
            <div style={{ color:'rgba(255,255,255,0.80)', fontWeight:700, fontSize:14 }}>查看{winner.name}城市详情 →</div>
          </a>
          <a href={`/ranking?occupation=${occ}&housing=${propType}`}
            style={{ display:'block', padding:'18px 22px', borderRadius:14, textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)' }}>
            <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11, marginBottom:4 }}>更大范围参考</div>
            <div style={{ color:'rgba(255,255,255,0.80)', fontWeight:700, fontSize:14 }}>{occName} · {pt.label}城市排行 →</div>
          </a>
        </div>

        {/* ── SHARE INSIGHT ── */}
        {(() => {
          const hpiDiff = Math.abs(adjA.hpiYears - adjB.hpiYears).toFixed(1)
          const winCity = aWins ? cityA.name : cityB.name
          const loseCity = aWins ? cityB.name : cityA.name
          const winHpi = aWins ? adjA.hpiYears : adjB.hpiYears
          const loseHpi = aWins ? adjB.hpiYears : adjA.hpiYears
          const winScore = aWins ? adjA.score : adjB.score
          const loseScore = aWins ? adjB.score : adjA.score
          const shareText = [
            `🏠 ${occName} 在加拿大哪个城市买房更容易？`,
            ``,
            `📍 ${winCity}：${winHpi}年收入 (${winScore}分)`,
            `📍 ${loseCity}：${loseHpi}年收入 (${loseScore}分)`,
            ``,
            `${winCity}比${loseCity}少需要 ${hpiDiff}年 就能买房`,
            `由 lakive.com 生成 | 职业×城市适配引擎`,
          ].join('\n')
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
          const redditTitle = `${occName} ${winCity} vs ${loseCity} — 买房只需 ${winHpi}年收入 vs ${loseHpi}年收入 (Lakive数据)`
          const redditUrl  = `https://reddit.com/submit?url=${encodeURIComponent('https://lakive.com/compare?cities='+slugA+','+slugB+'&occupation='+occ)}&title=${encodeURIComponent(redditTitle)}`
          const waUrl      = `https://wa.me/?text=${encodeURIComponent(shareText)}`
          return (
            <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'18px 20px' }}>
              <div style={{ color:'rgba(255,255,255,0.40)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', marginBottom:12 }}>分享这个对比洞察</div>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 16px', marginBottom:14, fontFamily:'monospace', fontSize:12 }}>
                <div style={{ color:'rgba(255,255,255,0.75)', lineHeight:1.8 }}>
                  🏠 <span style={{ fontWeight:700 }}>{occName}</span> {winCity} vs {loseCity}<br/>
                  📍 {winCity}：{winHpi}年收入 · {winScore}分<br/>
                  📍 {loseCity}：{loseHpi}年收入 · {loseScore}分<br/>
                  <span style={{ color:'#14B8A6' }}>{winCity}少{hpiDiff}年买到房</span>
                  <span style={{ color:'rgba(255,255,255,0.35)', display:'block', fontSize:11, marginTop:4 }}>lakive.com</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>

                {/* Copy */}
                <button onClick={() => { navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                  title="复制文本"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:copied?'rgba(20,184,166,0.18)':'rgba(255,255,255,0.07)', border:`1px solid ${copied?'rgba(20,184,166,0.45)':'rgba(255,255,255,0.12)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                  {copied
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8"/></svg>
                  }
                </button>

                {/* X / Twitter */}
                <a href={twitterUrl} target="_blank" rel="noopener" title="分享到 X / Twitter"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', textDecoration:'none' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>

                {/* Facebook */}
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://lakive.com/compare?cities='+slugA+','+slugB)}&quote=${encodeURIComponent(shareText)}`}
                  target="_blank" rel="noopener" title="分享到 Facebook"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(24,119,242,0.12)', border:'1px solid rgba(24,119,242,0.30)', textDecoration:'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.885v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                </a>

                {/* Instagram */}
                <button onClick={() => { navigator.clipboard.writeText(shareText); window.open('https://www.instagram.com/', '_blank') }}
                  title="复制内容并打开 Instagram"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(225,48,108,0.10)', border:'1px solid rgba(225,48,108,0.28)', cursor:'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig2)" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="url(#ig2)" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig2)"/><defs><linearGradient id="ig2" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse"><stop stopColor="#f09433"/><stop offset="0.25" stopColor="#e6683c"/><stop offset="0.5" stopColor="#dc2743"/><stop offset="0.75" stopColor="#cc2366"/><stop offset="1" stopColor="#bc1888"/></linearGradient></defs></svg>
                </button>

                {/* 小红书 */}
                <button onClick={() => { navigator.clipboard.writeText(shareText); window.open('https://www.xiaohongshu.com/', '_blank') }}
                  title="复制内容并打开小红书"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,45,45,0.10)', border:'1px solid rgba(255,45,45,0.28)', cursor:'pointer' }}>
                  <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="10" fill="#FF2442"/>
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="sans-serif">书</text>
                  </svg>
                </button>

                {/* WhatsApp */}
                <a href={waUrl} target="_blank" rel="noopener" title="分享到 WhatsApp"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(37,211,102,0.10)', border:'1px solid rgba(37,211,102,0.28)', textDecoration:'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>

                {/* Reddit */}
                <a href={redditUrl} target="_blank" rel="noopener" title="分享到 Reddit"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,87,0,0.10)', border:'1px solid rgba(255,87,0,0.28)', textDecoration:'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                </a>
              </div>
              <div style={{ color:'rgba(255,255,255,0.22)', fontSize:11, marginTop:10 }}>
                Instagram / 小红书：点击后自动复制内容，粘贴到发帖框即可
              </div>
            </div>
          )
        })()}

        {/* ── Subscribe CTA ── */}
        {ready && (
          <a href={`/subscribe?city=${winSlug}&occ=${occ}&pt=${propType}&from=compare`}
            style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,rgba(79,142,247,0.10),rgba(91,92,240,0.08))', border:'1px solid rgba(79,142,247,0.25)', borderRadius:14, padding:'16px 20px', textDecoration:'none', marginBottom:20 }}>
            <div>
              <div style={{ color:'#93C5FD', fontSize:14, fontWeight:700, marginBottom:3 }}>
                📬 订阅 {winner.name}{occName ? ` × ${occName}` : ''} 报告
              </div>
              <div style={{ color:'rgba(255,255,255,0.40)', fontSize:12 }}>月度简报 + 季度情报 · 免费 · 随时退订</div>
            </div>
            <span style={{ color:'#93C5FD', fontSize:16, marginLeft:12, flexShrink:0 }}>→</span>
          </a>
        )}

        {/* ── FOOTER ── */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:20 }}>
          <p style={{ color:'rgba(255,255,255,0.50)', fontSize:12, lineHeight:1.7, margin:0 }}>
            <span style={{ color:'rgba(255,255,255,0.35)', fontWeight:600 }}>数据来源：</span>
            CMHC（住房价格与租金）· Statistics Canada（收入、犯罪）· Job Bank（职位供给）· CRA & 省级税务局（税收）· CIHI（医疗）· ECCC（环境）
          </p>
          <p style={{ color:'rgba(255,255,255,0.40)', fontSize:11, marginTop:8 }}>
            住房指标（房价/年收入、租金压力）已根据 {pt.label} 房型假设调整。适配分根据住房压力阈值动态计算，不代表官方排名。城市对比仅供参考，不构成财务或移民建议。2026年Q1。
          </p>
        </div>
      </div>}

      {(dropA||dropB||dropO) && <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={closeDrops} />}
    </main>
  )
}
