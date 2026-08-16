'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────────
type OccFit = { score: number; hpiYears: number; rpi: number; eoi: 'High'|'Mid'|'Low' }
type EoiVal = 'High'|'Mid'|'Low'

// ── Property types ────────────────────────────────────────────────────────────
const PROP_TYPES = [
  { id: '1br',       label: '1 Bedroom',      priceMult: 0.70, rentMult: 0.78 },
  { id: '2br',       label: '2 Bedrooms',      priceMult: 1.00, rentMult: 1.00 },
  { id: '3br',       label: '3 Bedrooms',      priceMult: 1.38, rentMult: 1.35 },
  { id: 'townhouse', label: 'Townhouse',        priceMult: 1.55, rentMult: 1.45 },
  { id: 'detached',  label: 'Detached House',   priceMult: 2.20, rentMult: 1.70 },
]

// ── Scenario-adjusted score ───────────────────────────────────────────────────
function getAdjScore(base: OccFit, priceMult: number, rentMult: number): number {
  const hT = (y:number) => y<6?92:y<8?82:y<10?70:y<12?58:y<16?45:y<22?28:y<30?16:8
  const rT = (r:number) => r<25?90:r<30?82:r<35?72:r<40?60:r<45?48:r<60?30:r<80?16:8
  const adjH = base.hpiYears * priceMult
  const adjR = base.rpi * rentMult
  const housingDelta = (hT(adjH) - hT(base.hpiYears)) * 0.55 + (rT(adjR) - rT(base.rpi)) * 0.45
  return Math.max(10, Math.min(99, base.score + Math.round(housingDelta * 0.52)))
}

// ── City data ─────────────────────────────────────────────────────────────────
const CITY_BASE: Record<string, {
  name: string; short: string; province: string
  eoi: number; tai: number; hai: number; eqi: number; tci: number; psi: number; edi: number
  medianRent: number; basePrice: number; taiNote: string
}> = {
  vancouver:       { name:'Vancouver',       short:'YVR', province:'BC',            eoi:80, tai:72, hai:88, eqi:90, tci:82, psi:72, edi:80, medianRent:2950,  basePrice:1050000, taiNote:'GST 5% + PST 7%' },
  toronto:         { name:'Toronto',         short:'YYZ', province:'ON',            eoi:92, tai:68, hai:90, eqi:75, tci:78, psi:68, edi:82, medianRent:2750,  basePrice:980000,  taiNote:'HST 13%' },
  calgary:         { name:'Calgary',         short:'YYC', province:'AB',            eoi:65, tai:90, hai:78, eqi:82, tci:48, psi:78, edi:72, medianRent:1950,  basePrice:550000,  taiNote:'GST 5% only (no PST)' },
  montreal:        { name:'Montréal',        short:'YUL', province:'QC',            eoi:72, tai:42, hai:75, eqi:78, tci:72, psi:70, edi:80, medianRent:1850,  basePrice:580000,  taiNote:'GST+QST ≈15%' },
  ottawa:          { name:'Ottawa',          short:'YOW', province:'ON',            eoi:75, tai:68, hai:82, eqi:80, tci:55, psi:82, edi:85, medianRent:2100,  basePrice:650000,  taiNote:'HST 13%' },
  seattle:         { name:'Seattle',         short:'SEA', province:'Washington',    eoi:88, tai:95, hai:72, eqi:78, tci:65, psi:72, edi:82, medianRent:2700,  basePrice:800000,  taiNote:'No state income tax' },
  'san-francisco': { name:'San Francisco',   short:'SFO', province:'California',    eoi:95, tai:35, hai:75, eqi:70, tci:75, psi:55, edi:90, medianRent:3500,  basePrice:1250000, taiNote:'CA top rate 13.3%' },
  'new-york':      { name:'New York City',   short:'NYC', province:'New York',      eoi:92, tai:30, hai:78, eqi:62, tci:88, psi:58, edi:92, medianRent:3700,  basePrice:1100000, taiNote:'NY+NYC tax up to 14.8%' },
  boston:          { name:'Boston',          short:'BOS', province:'Massachusetts', eoi:85, tai:60, hai:80, eqi:75, tci:72, psi:68, edi:88, medianRent:3100,  basePrice:850000,  taiNote:'MA flat 5% state tax' },
}

// ── Fit matrix ────────────────────────────────────────────────────────────────
const FIT_MATRIX: Record<string, Record<string, OccFit>> = {
  vancouver: {
    electrician:   { score:72, hpiYears:13.0, rpi:42, eoi:'High' },
    software_eng:  { score:84, hpiYears:9.5,  rpi:36, eoi:'High' },
    nurse:         { score:68, hpiYears:12.8, rpi:43, eoi:'Mid'  },
    doctor:        { score:82, hpiYears:5.5,  rpi:18, eoi:'High' },
    pharmacist:    { score:74, hpiYears:10.5, rpi:35, eoi:'Mid'  },
    data_analyst:  { score:72, hpiYears:11.5, rpi:38, eoi:'Mid'  },
    it_support:    { score:58, hpiYears:17.0, rpi:57, eoi:'Mid'  },
    engineer:      { score:70, hpiYears:11.4, rpi:38, eoi:'Mid'  },
    plumber:       { score:65, hpiYears:13.5, rpi:45, eoi:'Mid'  },
    carpenter:     { score:55, hpiYears:15.5, rpi:52, eoi:'Mid'  },
    teacher:       { score:62, hpiYears:14.0, rpi:46, eoi:'Mid'  },
    accountant:    { score:65, hpiYears:15.2, rpi:49, eoi:'Mid'  },
    lawyer:        { score:78, hpiYears:8.1,  rpi:27, eoi:'Mid'  },
    police:        { score:70, hpiYears:12.5, rpi:41, eoi:'High' },
    firefighter:   { score:68, hpiYears:12.4, rpi:41, eoi:'High' },
    social_worker: { score:42, hpiYears:18.2, rpi:61, eoi:'Mid'  },
    truck_driver:  { score:52, hpiYears:16.5, rpi:54, eoi:'Mid'  },
    mechanic:      { score:55, hpiYears:15.5, rpi:52, eoi:'Mid'  },
    chef:          { score:38, hpiYears:20.0, rpi:68, eoi:'Mid'  },
    retail:        { score:32, hpiYears:26.0, rpi:68, eoi:'Mid'  },
    self_employed: { score:48, hpiYears:16.2, rpi:54, eoi:'Low'  },
    freelancer:    { score:38, hpiYears:20.2, rpi:68, eoi:'Low'  },
    unemployed:    { score:22, hpiYears:42.0, rpi:142, eoi:'Low' },
    retired:       { score:40, hpiYears:25.0, rpi:84, eoi:'Low'  },
  },
  toronto: {
    electrician:   { score:70, hpiYears:12.5, rpi:40, eoi:'High' },
    software_eng:  { score:88, hpiYears:9.2,  rpi:34, eoi:'High' },
    nurse:         { score:72, hpiYears:12.0, rpi:41, eoi:'High' },
    doctor:        { score:86, hpiYears:4.5,  rpi:15, eoi:'High' },
    pharmacist:    { score:76, hpiYears:9.4,  rpi:32, eoi:'High' },
    data_analyst:  { score:75, hpiYears:11.5, rpi:39, eoi:'High' },
    it_support:    { score:60, hpiYears:15.8, rpi:53, eoi:'High' },
    engineer:      { score:72, hpiYears:10.7, rpi:36, eoi:'High' },
    plumber:       { score:65, hpiYears:12.6, rpi:43, eoi:'High' },
    carpenter:     { score:56, hpiYears:14.5, rpi:49, eoi:'Mid'  },
    teacher:       { score:65, hpiYears:13.2, rpi:44, eoi:'High' },
    accountant:    { score:72, hpiYears:13.8, rpi:46, eoi:'High' },
    lawyer:        { score:82, hpiYears:7.6,  rpi:25, eoi:'High' },
    police:        { score:68, hpiYears:11.8, rpi:40, eoi:'High' },
    firefighter:   { score:68, hpiYears:11.5, rpi:39, eoi:'High' },
    social_worker: { score:44, hpiYears:16.9, rpi:57, eoi:'High' },
    truck_driver:  { score:55, hpiYears:15.8, rpi:52, eoi:'Mid'  },
    mechanic:      { score:56, hpiYears:14.4, rpi:49, eoi:'Mid'  },
    chef:          { score:36, hpiYears:18.8, rpi:63, eoi:'Mid'  },
    retail:        { score:30, hpiYears:24.5, rpi:65, eoi:'Mid'  },
    self_employed: { score:50, hpiYears:15.1, rpi:51, eoi:'Low'  },
    freelancer:    { score:40, hpiYears:18.8, rpi:63, eoi:'Low'  },
    unemployed:    { score:24, hpiYears:39.2, rpi:132, eoi:'Low' },
    retired:       { score:42, hpiYears:23.3, rpi:79, eoi:'Low'  },
  },
  calgary: {
    electrician:   { score:91, hpiYears:3.9,  rpi:24, eoi:'High' },
    software_eng:  { score:78, hpiYears:5.2,  rpi:28, eoi:'Mid'  },
    nurse:         { score:86, hpiYears:4.5,  rpi:25, eoi:'High' },
    doctor:        { score:92, hpiYears:2.5,  rpi:11, eoi:'High' },
    pharmacist:    { score:84, hpiYears:5.2,  rpi:22, eoi:'Mid'  },
    data_analyst:  { score:76, hpiYears:6.5,  rpi:27, eoi:'Mid'  },
    it_support:    { score:68, hpiYears:8.9,  rpi:38, eoi:'Mid'  },
    engineer:      { score:82, hpiYears:6.0,  rpi:25, eoi:'High' },
    plumber:       { score:80, hpiYears:7.1,  rpi:30, eoi:'High' },
    carpenter:     { score:72, hpiYears:8.1,  rpi:34, eoi:'Mid'  },
    teacher:       { score:80, hpiYears:5.8,  rpi:28, eoi:'Mid'  },
    accountant:    { score:78, hpiYears:6.2,  rpi:30, eoi:'Mid'  },
    lawyer:        { score:86, hpiYears:4.2,  rpi:18, eoi:'Mid'  },
    police:        { score:84, hpiYears:4.8,  rpi:25, eoi:'High' },
    firefighter:   { score:82, hpiYears:4.6,  rpi:24, eoi:'High' },
    social_worker: { score:64, hpiYears:9.5,  rpi:40, eoi:'Mid'  },
    truck_driver:  { score:82, hpiYears:5.5,  rpi:26, eoi:'High' },
    mechanic:      { score:74, hpiYears:8.1,  rpi:34, eoi:'High' },
    chef:          { score:55, hpiYears:10.6, rpi:45, eoi:'Mid'  },
    retail:        { score:52, hpiYears:13.2, rpi:42, eoi:'Mid'  },
    self_employed: { score:72, hpiYears:8.5,  rpi:36, eoi:'Low'  },
    freelancer:    { score:62, hpiYears:10.6, rpi:45, eoi:'Low'  },
    unemployed:    { score:35, hpiYears:22.0, rpi:94, eoi:'Low'  },
    retired:       { score:58, hpiYears:13.1, rpi:56, eoi:'Low'  },
  },
  montreal: {
    electrician:   { score:68, hpiYears:5.5,  rpi:30, eoi:'Mid' },
    software_eng:  { score:70, hpiYears:5.2,  rpi:28, eoi:'Mid' },
    nurse:         { score:65, hpiYears:6.0,  rpi:32, eoi:'Mid' },
    doctor:        { score:78, hpiYears:2.6,  rpi:10, eoi:'Mid' },
    pharmacist:    { score:68, hpiYears:5.5,  rpi:22, eoi:'Mid' },
    data_analyst:  { score:64, hpiYears:6.8,  rpi:26, eoi:'Mid' },
    it_support:    { score:55, hpiYears:9.4,  rpi:36, eoi:'Low' },
    engineer:      { score:66, hpiYears:6.3,  rpi:25, eoi:'Mid' },
    plumber:       { score:62, hpiYears:7.5,  rpi:29, eoi:'Mid' },
    carpenter:     { score:55, hpiYears:8.5,  rpi:33, eoi:'Mid' },
    teacher:       { score:68, hpiYears:5.8,  rpi:30, eoi:'Mid' },
    accountant:    { score:62, hpiYears:6.8,  rpi:34, eoi:'Mid' },
    lawyer:        { score:72, hpiYears:4.5,  rpi:17, eoi:'Mid' },
    police:        { score:65, hpiYears:6.5,  rpi:32, eoi:'Mid' },
    firefighter:   { score:64, hpiYears:6.3,  rpi:31, eoi:'Mid' },
    social_worker: { score:48, hpiYears:10.0, rpi:38, eoi:'Mid' },
    truck_driver:  { score:60, hpiYears:7.2,  rpi:36, eoi:'Mid' },
    mechanic:      { score:56, hpiYears:8.5,  rpi:33, eoi:'Mid' },
    chef:          { score:44, hpiYears:11.2, rpi:43, eoi:'Low' },
    retail:        { score:45, hpiYears:13.5, rpi:44, eoi:'Low' },
    self_employed: { score:65, hpiYears:8.9,  rpi:34, eoi:'Low' },
    freelancer:    { score:60, hpiYears:11.2, rpi:43, eoi:'Low' },
    unemployed:    { score:34, hpiYears:23.2, rpi:89, eoi:'Low' },
    retired:       { score:55, hpiYears:13.8, rpi:53, eoi:'Low' },
  },
  ottawa: {
    electrician:   { score:74, hpiYears:6.8,  rpi:28, eoi:'Mid'  },
    software_eng:  { score:80, hpiYears:6.2,  rpi:26, eoi:'High' },
    nurse:         { score:82, hpiYears:6.5,  rpi:27, eoi:'High' },
    doctor:        { score:88, hpiYears:3.0,  rpi:11, eoi:'High' },
    pharmacist:    { score:78, hpiYears:6.2,  rpi:24, eoi:'Mid'  },
    data_analyst:  { score:74, hpiYears:7.6,  rpi:30, eoi:'Mid'  },
    it_support:    { score:64, hpiYears:10.5, rpi:41, eoi:'Mid'  },
    engineer:      { score:76, hpiYears:7.1,  rpi:28, eoi:'Mid'  },
    plumber:       { score:70, hpiYears:8.3,  rpi:33, eoi:'Mid'  },
    carpenter:     { score:62, hpiYears:9.6,  rpi:38, eoi:'Mid'  },
    teacher:       { score:80, hpiYears:7.0,  rpi:28, eoi:'High' },
    accountant:    { score:74, hpiYears:7.8,  rpi:30, eoi:'Mid'  },
    lawyer:        { score:84, hpiYears:5.0,  rpi:19, eoi:'High' },
    police:        { score:80, hpiYears:6.8,  rpi:28, eoi:'High' },
    firefighter:   { score:78, hpiYears:6.5,  rpi:27, eoi:'High' },
    social_worker: { score:56, hpiYears:11.2, rpi:43, eoi:'Mid'  },
    truck_driver:  { score:65, hpiYears:8.5,  rpi:34, eoi:'Mid'  },
    mechanic:      { score:62, hpiYears:9.6,  rpi:38, eoi:'Mid'  },
    chef:          { score:46, hpiYears:12.5, rpi:48, eoi:'Low'  },
    retail:        { score:44, hpiYears:16.0, rpi:50, eoi:'Low'  },
    self_employed: { score:65, hpiYears:10.0, rpi:39, eoi:'Low'  },
    freelancer:    { score:58, hpiYears:12.5, rpi:48, eoi:'Low'  },
    unemployed:    { score:32, hpiYears:26.0, rpi:101, eoi:'Low' },
    retired:       { score:52, hpiYears:15.5, rpi:60, eoi:'Low'  },
  },
  seattle: {
    electrician:   { score:78, hpiYears:8.8,  rpi:32, eoi:'High' },
    software_eng:  { score:90, hpiYears:5.8,  rpi:22, eoi:'High' },
    nurse:         { score:76, hpiYears:9.2,  rpi:34, eoi:'High' },
    doctor:        { score:86, hpiYears:4.5,  rpi:15, eoi:'High' },
    pharmacist:    { score:78, hpiYears:7.8,  rpi:28, eoi:'High' },
    data_analyst:  { score:82, hpiYears:7.2,  rpi:26, eoi:'High' },
    it_support:    { score:68, hpiYears:10.5, rpi:38, eoi:'High' },
    engineer:      { score:78, hpiYears:8.2,  rpi:30, eoi:'High' },
    plumber:       { score:72, hpiYears:9.5,  rpi:36, eoi:'Mid'  },
    carpenter:     { score:64, hpiYears:11.0, rpi:42, eoi:'Mid'  },
    teacher:       { score:68, hpiYears:10.5, rpi:38, eoi:'Mid'  },
    accountant:    { score:72, hpiYears:9.8,  rpi:36, eoi:'Mid'  },
    lawyer:        { score:80, hpiYears:7.0,  rpi:26, eoi:'High' },
    police:        { score:72, hpiYears:9.0,  rpi:34, eoi:'Mid'  },
    firefighter:   { score:70, hpiYears:9.2,  rpi:35, eoi:'Mid'  },
    social_worker: { score:52, hpiYears:13.5, rpi:50, eoi:'Mid'  },
    truck_driver:  { score:65, hpiYears:10.8, rpi:40, eoi:'Mid'  },
    mechanic:      { score:60, hpiYears:11.5, rpi:44, eoi:'Mid'  },
    chef:          { score:42, hpiYears:15.0, rpi:58, eoi:'Mid'  },
    retail:        { score:35, hpiYears:20.0, rpi:60, eoi:'Mid'  },
    self_employed: { score:62, hpiYears:12.0, rpi:46, eoi:'Low'  },
    freelancer:    { score:55, hpiYears:15.0, rpi:58, eoi:'Low'  },
    unemployed:    { score:30, hpiYears:32.0, rpi:110,eoi:'Low'  },
    retired:       { score:48, hpiYears:18.0, rpi:68, eoi:'Low'  },
  },
  'san-francisco': {
    electrician:   { score:58, hpiYears:14.5, rpi:52, eoi:'High' },
    software_eng:  { score:82, hpiYears:8.2,  rpi:32, eoi:'High' },
    nurse:         { score:65, hpiYears:13.0, rpi:48, eoi:'High' },
    doctor:        { score:78, hpiYears:6.8,  rpi:24, eoi:'High' },
    pharmacist:    { score:65, hpiYears:12.5, rpi:46, eoi:'High' },
    data_analyst:  { score:75, hpiYears:10.5, rpi:40, eoi:'High' },
    it_support:    { score:55, hpiYears:16.0, rpi:58, eoi:'High' },
    engineer:      { score:65, hpiYears:12.0, rpi:44, eoi:'High' },
    plumber:       { score:50, hpiYears:16.5, rpi:60, eoi:'Mid'  },
    carpenter:     { score:44, hpiYears:19.0, rpi:70, eoi:'Mid'  },
    teacher:       { score:48, hpiYears:17.5, rpi:65, eoi:'Mid'  },
    accountant:    { score:55, hpiYears:15.5, rpi:58, eoi:'Mid'  },
    lawyer:        { score:72, hpiYears:9.5,  rpi:36, eoi:'High' },
    police:        { score:52, hpiYears:16.0, rpi:60, eoi:'Mid'  },
    firefighter:   { score:50, hpiYears:16.5, rpi:62, eoi:'Mid'  },
    social_worker: { score:35, hpiYears:22.0, rpi:82, eoi:'Mid'  },
    truck_driver:  { score:42, hpiYears:18.0, rpi:68, eoi:'Mid'  },
    mechanic:      { score:40, hpiYears:19.5, rpi:72, eoi:'Mid'  },
    chef:          { score:30, hpiYears:26.0, rpi:92, eoi:'Mid'  },
    retail:        { score:22, hpiYears:34.0, rpi:95, eoi:'Low'  },
    self_employed: { score:48, hpiYears:18.5, rpi:72, eoi:'Low'  },
    freelancer:    { score:40, hpiYears:22.0, rpi:85, eoi:'Low'  },
    unemployed:    { score:18, hpiYears:52.0, rpi:145,eoi:'Low'  },
    retired:       { score:35, hpiYears:28.0, rpi:100,eoi:'Low'  },
  },
  'new-york': {
    electrician:   { score:55, hpiYears:13.5, rpi:48, eoi:'High' },
    software_eng:  { score:80, hpiYears:8.0,  rpi:30, eoi:'High' },
    nurse:         { score:62, hpiYears:12.5, rpi:46, eoi:'High' },
    doctor:        { score:76, hpiYears:6.5,  rpi:22, eoi:'High' },
    pharmacist:    { score:63, hpiYears:12.0, rpi:44, eoi:'High' },
    data_analyst:  { score:74, hpiYears:10.0, rpi:38, eoi:'High' },
    it_support:    { score:54, hpiYears:15.5, rpi:56, eoi:'High' },
    engineer:      { score:64, hpiYears:11.5, rpi:42, eoi:'High' },
    plumber:       { score:55, hpiYears:14.5, rpi:52, eoi:'Mid'  },
    carpenter:     { score:46, hpiYears:17.0, rpi:62, eoi:'Mid'  },
    teacher:       { score:52, hpiYears:15.5, rpi:58, eoi:'Mid'  },
    accountant:    { score:60, hpiYears:14.0, rpi:52, eoi:'High' },
    lawyer:        { score:75, hpiYears:8.5,  rpi:32, eoi:'High' },
    police:        { score:58, hpiYears:14.0, rpi:52, eoi:'Mid'  },
    firefighter:   { score:56, hpiYears:14.5, rpi:54, eoi:'Mid'  },
    social_worker: { score:38, hpiYears:20.0, rpi:74, eoi:'Mid'  },
    truck_driver:  { score:48, hpiYears:16.5, rpi:62, eoi:'Mid'  },
    mechanic:      { score:44, hpiYears:18.0, rpi:68, eoi:'Mid'  },
    chef:          { score:35, hpiYears:23.5, rpi:82, eoi:'Mid'  },
    retail:        { score:25, hpiYears:30.0, rpi:88, eoi:'Low'  },
    self_employed: { score:45, hpiYears:17.5, rpi:68, eoi:'Low'  },
    freelancer:    { score:38, hpiYears:20.5, rpi:78, eoi:'Low'  },
    unemployed:    { score:20, hpiYears:46.0, rpi:138,eoi:'Low'  },
    retired:       { score:36, hpiYears:26.0, rpi:96, eoi:'Low'  },
  },
  boston: {
    electrician:   { score:68, hpiYears:10.5, rpi:40, eoi:'High' },
    software_eng:  { score:82, hpiYears:7.0,  rpi:28, eoi:'High' },
    nurse:         { score:74, hpiYears:10.0, rpi:38, eoi:'High' },
    doctor:        { score:84, hpiYears:5.5,  rpi:20, eoi:'High' },
    pharmacist:    { score:74, hpiYears:9.5,  rpi:35, eoi:'High' },
    data_analyst:  { score:76, hpiYears:8.5,  rpi:32, eoi:'High' },
    it_support:    { score:62, hpiYears:12.5, rpi:46, eoi:'High' },
    engineer:      { score:72, hpiYears:9.8,  rpi:36, eoi:'High' },
    plumber:       { score:65, hpiYears:11.5, rpi:44, eoi:'Mid'  },
    carpenter:     { score:57, hpiYears:13.5, rpi:51, eoi:'Mid'  },
    teacher:       { score:65, hpiYears:12.0, rpi:45, eoi:'Mid'  },
    accountant:    { score:68, hpiYears:11.0, rpi:42, eoi:'Mid'  },
    lawyer:        { score:78, hpiYears:7.5,  rpi:28, eoi:'High' },
    police:        { score:68, hpiYears:10.5, rpi:40, eoi:'Mid'  },
    firefighter:   { score:66, hpiYears:11.0, rpi:42, eoi:'Mid'  },
    social_worker: { score:48, hpiYears:15.0, rpi:56, eoi:'Mid'  },
    truck_driver:  { score:58, hpiYears:12.5, rpi:48, eoi:'Mid'  },
    mechanic:      { score:55, hpiYears:13.5, rpi:52, eoi:'Mid'  },
    chef:          { score:40, hpiYears:17.5, rpi:65, eoi:'Low'  },
    retail:        { score:32, hpiYears:22.5, rpi:68, eoi:'Low'  },
    self_employed: { score:58, hpiYears:14.0, rpi:54, eoi:'Low'  },
    freelancer:    { score:50, hpiYears:17.5, rpi:65, eoi:'Low'  },
    unemployed:    { score:26, hpiYears:35.0, rpi:118,eoi:'Low'  },
    retired:       { score:44, hpiYears:20.5, rpi:76, eoi:'Low'  },
  },
}

const ALL_CITY_IDS = ['vancouver', 'toronto', 'calgary', 'montreal', 'ottawa', 'seattle', 'san-francisco', 'new-york', 'boston']

const OCCUPATIONS = [
  // Healthcare
  { id:'nurse',         name:'Registered Nurse'    },
  { id:'doctor',        name:'Family Physician'    },
  { id:'pharmacist',    name:'Pharmacist'          },
  // Tech
  { id:'software_eng',  name:'Software Engineer'   },
  { id:'data_analyst',  name:'Data Analyst'        },
  { id:'it_support',    name:'IT Support'          },
  // Trades & Engineering
  { id:'electrician',   name:'Electrician'         },
  { id:'engineer',      name:'Civil Engineer'      },
  { id:'plumber',       name:'Plumber'             },
  { id:'carpenter',     name:'Carpenter'           },
  // Education
  { id:'teacher',       name:'Secondary Teacher'   },
  // Finance & Law
  { id:'accountant',    name:'Accountant'          },
  { id:'lawyer',        name:'Lawyer'              },
  // Public Services
  { id:'police',        name:'Police Officer'      },
  { id:'firefighter',   name:'Firefighter'         },
  { id:'social_worker', name:'Social Worker'       },
  // Transport
  { id:'truck_driver',  name:'Truck Driver'        },
  { id:'mechanic',      name:'Auto Mechanic'       },
  // Service Industry
  { id:'chef',          name:'Chef'                },
  { id:'retail',        name:'Retail Associate'    },
  // Other
  { id:'self_employed', name:'Self-Employed'       },
  { id:'freelancer',    name:'Freelancer'          },
  { id:'unemployed',    name:'Not Currently Employed' },
  { id:'retired',       name:'Retired / Financially Independent' },
]
const OCC_NAME: Record<string,string> = Object.fromEntries(OCCUPATIONS.map(o=>[o.id,o.name]))

// ── Dimension config ──────────────────────────────────────────────────────────
type Dim = { key: string; label: string; unit: string; lowerBetter: boolean; tooltip: string }
const DIMS: Dim[] = [
  { key:'score',    label:'Overall Fit Score',  unit:'',           lowerBetter:false, tooltip:'Composite score accounting for housing burden, rent pressure, employment, taxes, and quality of life — adjusted for occupation and housing type.' },
  { key:'hpiYears', label:'Price / Income',     unit:' yrs income', lowerBetter:true,  tooltip:'Benchmark home price divided by pre-tax annual income. E.g. "13 yrs income" means buying takes 13 years of gross earnings. Lower = less burden. Source: CMHC.' },
  { key:'rpi',      label:'Rent Pressure',      unit:'%',          lowerBetter:true,  tooltip:'Rent as a percentage of monthly income. Under 30% is the internationally accepted standard; above 40% is high-pressure territory. Source: CMHC.' },
  { key:'tai',      label:'Tax Index (TAI)',     unit:'',           lowerBetter:false, tooltip:'Overall tax-friendliness at the provincial level, combining income tax and consumption tax structure. Higher = more after-tax disposable income.' },
  { key:'eoi',      label:'Employment (EOI)',    unit:'',           lowerBetter:false, tooltip:'Job market activity and vacancy density for this occupation in this city. The bracket shows the market-strength rating for your specific role. Source: Job Bank.' },
  { key:'hai',      label:'Healthcare (HAI)',    unit:'',           lowerBetter:false, tooltip:'Public healthcare coverage quality — includes GP accessibility and basic care facility density. Source: CIHI.' },
  { key:'eqi',      label:'Environment (EQI)',   unit:'',           lowerBetter:false, tooltip:'Urban natural and living environment quality — air, green space, water access. Source: ECCC.' },
  { key:'tci',      label:'Transit (TCI)',        unit:'',           lowerBetter:false, tooltip:'Transit network coverage and daily commute viability. Higher = more feasible to live without a car.' },
  { key:'psi',      label:'Safety (PSI)',         unit:'',           lowerBetter:false, tooltip:'Community safety index. Source: Statistics Canada Crime Severity Index (CSI).' },
  { key:'edi',      label:'Education (EDI)',      unit:'',           lowerBetter:false, tooltip:'Higher education and K-12 resource density. Most relevant to families with children or those planning local studies.' },
]

const DIM_GROUPS = [
  { label:'Money & Housing',      sub:'Housing pressure, taxes & rent',             keys:['score','hpiYears','rpi','tai'] },
  { label:'Work & Income',        sub:'Job opportunities & employment market',      keys:['eoi'] },
  { label:'Quality of Life',      sub:'Healthcare, environment, transit, safety, education', keys:['hai','eqi','tci','psi','edi'] },
]

// ── Color helpers ─────────────────────────────────────────────────────────────
const sc = (s:number) => s>=80?'#14B8A6':s>=70?'#4F8EF7':s>=55?'#F59E0B':s>=40?'#E86C2F':'#EF4444'
const hc = (y:number) => y<=5?'#14B8A6':y<=8?'#10B981':y<=12?'#F59E0B':y<=18?'#E86C2F':'#EF4444'
const rc = (r:number) => r<=25?'#14B8A6':r<=30?'#10B981':r<=38?'#F59E0B':r<=50?'#E86C2F':'#EF4444'
const dc = (v:number) => v>=80?'#14B8A6':v>=65?'#60A5FA':'#F59E0B'
const eoiN = (e:EoiVal) => e==='High'?3:e==='Mid'?2:1
const ec = (cityEoi:number) => cityEoi>=75?'#14B8A6':cityEoi>=55?'#F59E0B':'#E86C2F'
const rkc = (r:number) => r===1?'#14B8A6':r===2?'#60A5FA':r===3?'#F59E0B':'rgba(255,255,255,0.35)'
const hl = (y:number) => y<=5?'L1 Lower Pressure':y<=8?'L2 Manageable':y<=12?'L3 Under Pressure':y<=18?'L4 Difficult':'L5 Severe Pressure'
const rl = (r:number) => r<=25?'L1 Lower Pressure':r<=30?'L2 Manageable':r<=38?'L3 Under Pressure':r<=50?'L4 Difficult':'L5 Severe Pressure'

function eoiBlend(cityEoi:number, fitEoi:EoiVal):string {
  if (cityEoi >= 75) return fitEoi
  if (cityEoi >= 55) { if (fitEoi==='High') return 'Mid-High'; if (fitEoi==='Mid') return 'Mid'; return 'Low' }
  if (fitEoi==='High') return 'Mid'; if (fitEoi==='Mid') return 'Mid-Low'; return 'Low'
}

// ── Dim value / display (propType-aware) ──────────────────────────────────────
function getDimValue(fm: typeof FIT_MATRIX, cb: typeof CITY_BASE, slug:string, occ:string, key:string, priceMult=1, rentMult=1):number {
  const fit = fm[slug]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'Mid' as EoiVal }
  const city = cb[slug]
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

function getDimDisplay(fm: typeof FIT_MATRIX, cb: typeof CITY_BASE, slug:string, occ:string, key:string, priceMult=1, rentMult=1):string {
  const fit = fm[slug]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'Mid' as EoiVal }
  const city = cb[slug]
  if (!city) return '-'
  switch(key) {
    case 'score':    return String(getAdjScore(fit, priceMult, rentMult))
    case 'hpiYears': return `${(fit.hpiYears * priceMult).toFixed(1)} yrs income`
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
function getVerdictLayers(winSlug:string, loseSlug:string, occ:string, wFit:OccFit, lFit:OccFit, wCity: typeof CITY_BASE[string], lCity: typeof CITY_BASE[string]) {
  const occName = OCC_NAME[occ] ?? occ

  const hpiAdv  = lFit.hpiYears - wFit.hpiYears
  const rpiAdv  = lFit.rpi - wFit.rpi
  const taiAdv  = wCity.tai - lCity.tai
  const eoiAdv  = eoiN(wFit.eoi) - eoiN(lFit.eoi)

  let winType = 'overall'
  if (hpiAdv > 4 && rpiAdv > 8)         winType = 'asset-building'
  else if (hpiAdv > 4 && taiAdv > 12)   winType = 'tax-efficient'
  else if (eoiAdv > 0 && hpiAdv > 2)    winType = 'career-growth'
  else if (wCity.eqi > lCity.eqi + 8)   winType = 'lifestyle-quality'
  else if (hpiAdv > 2)                  winType = 'housing-friendly'

  const winTypeLabel: Record<string,string> = {
    'overall': `${occName}s looking for an overall edge`,
    'asset-building': `${occName}s focused on building long-term assets`,
    'tax-efficient': `${occName}s who want to maximize after-tax income`,
    'career-growth': `${occName}s prioritizing career opportunities`,
    'lifestyle-quality': `${occName}s who prioritize nature and quality of life`,
    'housing-friendly': `${occName}s looking for a more accessible housing market`,
  }

  const loserPillars: string[] = []
  if (lCity.eoi > wCity.eoi + 6)        loserPillars.push('employment density')
  if (lCity.eqi > wCity.eqi + 6)        loserPillars.push('natural environment')
  if (lCity.hai > wCity.hai + 6)        loserPillars.push('healthcare access')
  if (lCity.tci > wCity.tci + 12)       loserPillars.push('public transit')
  if (lCity.edi > wCity.edi + 6)        loserPillars.push('education resources')
  if (eoiN(lFit.eoi) >= eoiN(wFit.eoi)) loserPillars.push(`${occName} job opportunities`)
  if (loserPillars.length === 0)        loserPillars.push('overall city amenities')

  let choiceQ = 'Do you prioritize economic efficiency or city amenities?'
  if (hpiAdv > 4 && lCity.eoi > wCity.eoi + 6)
    choiceQ = `Which matters more: lower housing burden (${wCity.name} ${wFit.hpiYears} vs ${lFit.hpiYears} yrs income) or job market density?`
  else if (taiAdv > 15)
    choiceQ = `Would you rather have more after-tax income (${wCity.name} TAI ${wCity.tai} vs ${lCity.tai}) or a more established city?`
  else if (lCity.eqi > wCity.eqi + 8)
    choiceQ = `Do you prioritize economic efficiency or natural environment and climate?`
  else if (lCity.tci > wCity.tci + 12)
    choiceQ = `Which matters more: lower housing cost or the ability to live without a car?`

  return {
    primary:   `${wCity.name} is the better fit for ${winTypeLabel[winType] ?? occName + 's'}`,
    secondary: `${lCity.name} suits those who value ${loserPillars.slice(0,3).join(', ')}`,
    choiceQ,
  }
}

function getWhyWins(winSlug:string, loseSlug:string, occ:string, wFit:OccFit, lFit:OccFit, wCity: typeof CITY_BASE[string], lCity: typeof CITY_BASE[string]):string[] {
  const reasons: string[] = []
  if (wFit.hpiYears < lFit.hpiYears - 1)
    reasons.push(`Price/income ${wFit.hpiYears} vs ${lFit.hpiYears} yrs — ${(lFit.hpiYears - wFit.hpiYears).toFixed(1)} years less to buy`)
  if (wFit.rpi < lFit.rpi - 3)
    reasons.push(`Rent takes ${wFit.rpi}% vs ${lFit.rpi}% of income — more monthly disposable`)
  if (eoiN(wFit.eoi) > eoiN(lFit.eoi))
    reasons.push(`${OCC_NAME[occ]} job market is stronger (${wFit.eoi} vs ${lFit.eoi})`)
  if (wCity.tai > lCity.tai + 10)
    reasons.push(`Lower tax burden (${wCity.taiNote} vs ${lCity.taiNote})`)
  if (wCity.psi > lCity.psi + 5)
    reasons.push(`Higher public safety score (${wCity.psi} vs ${lCity.psi})`)
  if (wCity.tci > lCity.tci + 10)
    reasons.push(`Better public transit coverage (index ${wCity.tci} vs ${lCity.tci})`)
  if (reasons.length === 0)
    reasons.push(`${OCC_NAME[occ]} overall fit score leads by ${wFit.score - lFit.score} points`)
  return reasons.slice(0,4)
}

// ── "Why" one-liner ───────────────────────────────────────────────────────────
function getWhySentence(winAdj:OccFit, loseAdj:OccFit, winCity:typeof CITY_BASE[string], loseCity:typeof CITY_BASE[string]):string {
  const hpiAdv = loseAdj.hpiYears - winAdj.hpiYears
  const rpiAdv = loseAdj.rpi - winAdj.rpi
  const taiAdv = winCity.tai - loseCity.tai
  if (hpiAdv > 3 && rpiAdv > 8) {
    const pct = Math.round(winAdj.hpiYears / loseAdj.hpiYears * 100)
    return `Because ${winCity.name}'s price/income ratio is only ${pct}% of ${loseCity.name}'s, and rent pressure is ${rpiAdv} percentage points lower.`
  }
  if (hpiAdv > 3)
    return `Because ${winCity.name} requires only ${winAdj.hpiYears} yrs income to buy — significantly less than ${loseCity.name}'s ${loseAdj.hpiYears} yrs, a difference of ${hpiAdv.toFixed(1)} years.`
  if (rpiAdv > 8)
    return `Because ${winCity.name} rent takes only ${winAdj.rpi}% of income vs ${loseCity.name}'s ${loseAdj.rpi}% — ${rpiAdv} points less, leaving more monthly disposable income.`
  if (taiAdv > 15)
    return `Because ${winCity.name} has a lower overall tax burden (TAI ${winCity.tai} vs ${loseCity.tai}), delivering a clear after-tax income advantage.`
  return `Across housing burden, rent pressure, and employment, ${winCity.name} has the overall edge in this scenario.`
}

// ── Score drivers breakdown ───────────────────────────────────────────────────
function getScoreDrivers(winAdj:OccFit, loseAdj:OccFit, winCity:typeof CITY_BASE[string], loseCity:typeof CITY_BASE[string], occ:string, totalDiff:number) {
  const hpiC = loseAdj.hpiYears > winAdj.hpiYears ? Math.min(9, Math.round((loseAdj.hpiYears - winAdj.hpiYears) * 0.55)) : 0
  const rpiC = loseAdj.rpi > winAdj.rpi           ? Math.min(6, Math.round((loseAdj.rpi - winAdj.rpi) * 0.16))           : 0
  const taiC = winCity.tai > loseCity.tai          ? Math.min(5, Math.round((winCity.tai - loseCity.tai) * 0.07))         : 0
  const eoiC = eoiN(winAdj.eoi) > eoiN(loseAdj.eoi)                                                                       ? 2 : 0
  const psiC = winCity.psi > loseCity.psi + 5                                                                              ? 1 : 0
  return [
    hpiC > 0 && { label:'Lower housing pressure', contrib:hpiC, detail:`${winAdj.hpiYears} vs ${loseAdj.hpiYears} yrs income` },
    rpiC > 0 && { label:'Lower rent pressure',    contrib:rpiC, detail:`${winAdj.rpi}% vs ${loseAdj.rpi}%` },
    taiC > 0 && { label:'More tax-friendly',       contrib:taiC, detail:`TAI ${winCity.tai} vs ${loseCity.tai}` },
    eoiC > 0 && { label:`Stronger ${OCC_NAME[occ]} market`, contrib:eoiC, detail:`${winAdj.eoi} vs ${loseAdj.eoi}` },
    psiC > 0 && { label:'Safety score lead',       contrib:psiC, detail:`${winCity.psi} vs ${loseCity.psi}` },
  ].filter(Boolean).sort((a:any,b:any) => b.contrib - a.contrib).slice(0,4) as { label:string; contrib:number; detail:string }[]
}

function getWhyStill(loseSlug:string, winSlug:string, occ:string, lFit:OccFit, wFit:OccFit, lCity: typeof CITY_BASE[string], wCity: typeof CITY_BASE[string]):string[] {
  const reasons: string[] = []
  if (lCity.eoi > wCity.eoi + 5)
    reasons.push(`Larger job market overall (city EOI ${lCity.eoi} vs ${wCity.eoi})`)
  if (lCity.eqi > wCity.eqi + 5)
    reasons.push(`Better natural environment and air quality (EQI ${lCity.eqi} vs ${wCity.eqi})`)
  if (lCity.hai > wCity.hai + 5)
    reasons.push(`More robust healthcare system (HAI ${lCity.hai} vs ${wCity.hai})`)
  if (lCity.tci > wCity.tci + 10)
    reasons.push(`Better transit — more viable to live car-free`)
  if (lCity.edi > wCity.edi + 5)
    reasons.push(`Richer education resources (EDI ${lCity.edi} vs ${wCity.edi})`)
  if (eoiN(lFit.eoi) >= eoiN(wFit.eoi))
    reasons.push(`${OCC_NAME[occ]} job opportunities remain competitive here`)
  reasons.push('Greater multicultural diversity and lifestyle variety')
  return reasons.slice(0,3)
}

function getSuitableFor(winSlug:string, loseSlug:string, occ:string, wFit:OccFit, lFit:OccFit, wCity: typeof CITY_BASE[string], lCity: typeof CITY_BASE[string]) {
  const occName = OCC_NAME[occ] ?? occ
  const hpiDiff = +(lFit.hpiYears - wFit.hpiYears).toFixed(1)
  const rpiDiff = lFit.rpi - wFit.rpi

  const winReasons: string[] = []
  if (hpiDiff > 2)
    winReasons.push(`You want to escape housing pressure faster (${wCity.name} ${wFit.hpiYears} vs ${lCity.name} ${lFit.hpiYears} yrs income)`)
  if (rpiDiff > 5)
    winReasons.push(`You want lower rent pressure (${wCity.name} ${wFit.rpi}% vs ${lCity.name} ${lFit.rpi}%)`)
  if (wCity.tai > lCity.tai + 10)
    winReasons.push(`You want more after-tax disposable income (${wCity.taiNote} vs ${lCity.taiNote})`)
  if (eoiN(wFit.eoi) > eoiN(lFit.eoi))
    winReasons.push(`You're a ${occName} and job market access is your top priority`)
  if (wCity.psi > lCity.psi + 5)
    winReasons.push(`Community safety is important to you (safety index ${wCity.psi} vs ${lCity.psi})`)
  if (wCity.eqi > lCity.eqi + 8)
    winReasons.push(`You prioritize natural environment and air quality (EQI ${wCity.eqi} vs ${lCity.eqi})`)
  if (winReasons.length < 3)
    winReasons.push(`${occName} overall fit score leads here (${wFit.score} vs ${lFit.score})`)

  const loseReasons: string[] = []
  if (lCity.eoi > wCity.eoi + 5)
    loseReasons.push(`You need a larger job market (city employment index ${lCity.eoi} vs ${wCity.eoi})`)
  if (lCity.eqi > wCity.eqi + 5)
    loseReasons.push(`You prioritize natural environment and climate`)
  if (lCity.hai > wCity.hai + 5)
    loseReasons.push(`You value a more complete healthcare system (HAI ${lCity.hai} vs ${wCity.hai})`)
  if (lCity.tci > wCity.tci + 10)
    loseReasons.push(`You rely on public transit and don't plan to own a car (transit index ${lCity.tci} vs ${wCity.tci})`)
  if (lCity.edi > wCity.edi + 5)
    loseReasons.push(`You have children or plan to study locally (education index ${lCity.edi} vs ${wCity.edi})`)
  loseReasons.push(`You're willing to pay a higher cost of living for a more established city`)
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
function ComparePageInner() {
  const searchParams = useSearchParams()
  const cities = searchParams.get('cities')?.split(',') ?? []
  const occParam = searchParams.get('occupation') ?? ''
  const housingParam = searchParams.get('housing') ?? '2br'

  // Dynamic data from Supabase (falls back to hardcoded constants)
  const [fitMatrix, setFitMatrix] = useState<typeof FIT_MATRIX>(FIT_MATRIX)
  const [cityBase,  setCityBase ] = useState<typeof CITY_BASE>(CITY_BASE)

  useEffect(() => {
    fetch('/api/city-scores')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        if (d.fitMatrix)   setFitMatrix(d.fitMatrix)
        if (d.cityIndices) setCityBase(d.cityIndices as typeof CITY_BASE)
      })
      .catch(() => { /* silently use hardcoded fallback */ })
  }, [])

  const [slugA,    setSlugA   ] = useState(() => cities[0] && CITY_BASE[cities[0]] ? cities[0] : '') // init from static; re-validates when cityBase loads
  const [slugB,    setSlugB   ] = useState(() => cities[1] && CITY_BASE[cities[1]] ? cities[1] : '')
  const [occ,      setOcc     ] = useState(() => occParam && OCCUPATIONS.find(x=>x.id===occParam) ? occParam : '')
  const [propType, setPropType] = useState(() => PROP_TYPES.find(p=>p.id===housingParam) ? housingParam : '2br')
  const [dropA,    setDropA   ] = useState(false)
  const [dropB,    setDropB   ] = useState(false)
  const [dropO,    setDropO   ] = useState(false)
  const [copied,   setCopied  ] = useState(false)

  const pt      = PROP_TYPES.find(p => p.id === propType) ?? PROP_TYPES[1]
  const occName = OCC_NAME[occ] ?? ''
  const ready   = !!slugA && !!slugB && !!occ

  const cityA   = cityBase[slugA]  ?? cityBase['vancouver']
  const cityB   = cityBase[slugB]  ?? cityBase['calgary']
  const fitA    = fitMatrix[slugA]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'Mid' as EoiVal }
  const fitB    = fitMatrix[slugB]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'Mid' as EoiVal }

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
  const rankList    = occ ? ALL_CITY_IDS.filter(id => fitMatrix[id]?.[occ]).map(id => ({ id, score: getAdjScore(fitMatrix[id][occ], pt.priceMult, pt.rentMult) })).sort((a,b) => b.score - a.score) : []
  const rankA       = rankList.findIndex(c => c.id === slugA) + 1
  const rankB       = rankList.findIndex(c => c.id === slugB) + 1
  const totalCities = rankList.length

  const US_IDS = new Set(['seattle', 'san-francisco', 'new-york', 'boston'])
  const isCrossCountry = ready && (US_IDS.has(slugA) !== US_IDS.has(slugB))

  const aWins    = adjA.score >= adjB.score
  const winSlug  = aWins ? slugA : slugB
  const loseSlug = aWins ? slugB : slugA
  const winner   = aWins ? cityA : cityB
  const loser    = aWins ? cityB : cityA
  const winAdj   = aWins ? adjA : adjB
  const loseAdj  = aWins ? adjB : adjA
  const scoreDiff = Math.abs(adjA.score - adjB.score)

  const verdict    = ready ? getVerdictLayers(winSlug, loseSlug, occ, winAdj, loseAdj, winner, loser) : { primary:'', secondary:'', choiceQ:'' }
  const suitable   = ready ? getSuitableFor(winSlug, loseSlug, occ, winAdj, loseAdj, winner, loser)   : { winReasons:[] as string[], loseReasons:[] as string[] }
  const whyWins    = ready ? getWhyWins(winSlug, loseSlug, occ, winAdj, loseAdj, winner, loser)        : []
  const whyStill   = ready ? getWhyStill(loseSlug, winSlug, occ, loseAdj, winAdj, loser, winner)       : []

  const dimRows = DIMS.map(d => {
    const vA   = getDimValue(fitMatrix, cityBase, slugA, occ, d.key, pt.priceMult, pt.rentMult)
    const vB   = getDimValue(fitMatrix, cityBase, slugB, occ, d.key, pt.priceMult, pt.rentMult)
    const aW   = d.lowerBetter ? vA < vB : vA > vB
    const tie  = vA === vB
    return { ...d, vA, vB, dispA: getDimDisplay(fitMatrix, cityBase, slugA, occ, d.key, pt.priceMult, pt.rentMult), dispB: getDimDisplay(fitMatrix, cityBase, slugB, occ, d.key, pt.priceMult, pt.rentMult), aWins: tie ? null : aW }
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

        /* ── 移动端适配 ── */
        @media (max-width:640px) {
          .cmp-hero { padding:24px 16px 28px !important; }

          /* 城市选择器改为竖排 */
          .cmp-selectors  { flex-direction:column !important; align-items:stretch !important; gap:10px !important; }
          /* 竖排后 flex-basis 会变成"高度"，必须复位，否则卡片下方出现大片空白 */
          .cmp-selectors > * { flex:0 0 auto !important; }
          .cmp-vs         { text-align:center; }
          .cmp-dot        { display:none !important; }
          .cmp-occ        { flex-shrink:1 !important; }
          .cmp-occ button { width:100%; justify-content:center; }

          /* Housing Scenario 改为竖排，按钮组等分铺满 */
          .cmp-housing       { flex-direction:column !important; align-items:stretch !important; gap:10px !important; }
          .cmp-housing-btns  { margin-left:0 !important; }
          .cmp-prop-row1     { display:grid !important; grid-template-columns:repeat(3,1fr) !important; }
          .cmp-prop-row2     { display:grid !important; grid-template-columns:repeat(2,1fr) !important; }
          .cmp-housing-btns button { padding:8px 4px !important; font-size:12px !important; }
          .cmp-housing-note  { white-space:normal !important; }
        }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="cmp-hero" style={{ background:'linear-gradient(160deg,#0d1117 0%,#151827 70%,#1a2035 100%)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'32px 32px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:28 }}>
            <a href="/" style={{ color:'rgba(255,255,255,0.50)', fontSize:12, textDecoration:'none' }}>Home</a>
            <span style={{ color:'rgba(255,255,255,0.38)', fontSize:12 }}>/</span>
            <span style={{ color:'rgba(255,255,255,0.42)', fontSize:12 }}>City Compare</span>
          </div>

          {/* ── Selectors row ── */}
          <div className="cmp-selectors" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>

            {/* City A */}
            <div style={{ position:'relative', flex:'1 1 160px' }}>
              <button onClick={() => { setDropA(!dropA); setDropB(false); setDropO(false) }}
                style={{ width:'100%', padding:'12px 16px', borderRadius:14, background:'rgba(79,142,247,0.10)', border:`1.5px solid ${slugA ? 'rgba(79,142,247,0.30)' : 'rgba(79,142,247,0.50)'}`, cursor:'pointer', textAlign:'left' }}>
                {slugA ? <>
                  <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11 }}>{cityA.province}</div>
                  <div style={{ color:'white', fontSize:17, fontWeight:800 }}>{cityA.name}</div>
                  <div style={{ color: rkc(rankA), fontSize:11, fontWeight:700, marginTop:2 }}>{ready ? `Rank #${rankA}/${totalCities} for ${occName}s · ${pt.label}` : pt.label}</div>
                </> : <>
                  <div style={{ color:'rgba(79,142,247,0.50)', fontSize:11 }}>City A</div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:17, fontWeight:800 }}>Select City ▾</div>
                  <div style={{ color:'rgba(255,255,255,0.20)', fontSize:11, marginTop:2 }}>Click to choose</div>
                </>}
              </button>
              {dropA && (
                <div className="drop-menu">
                  <div className="drop-menu-inner">
                    {Object.entries(cityBase).filter(([k])=>k!==slugB).map(([k,c]) => {
                      const fit = occ ? fitMatrix[k]?.[occ] : undefined
                      const s   = fit ? getAdjScore(fit, pt.priceMult, pt.rentMult) : null
                      return (
                        <button key={k} className="drop-item" onClick={() => { setSlugA(k); closeDrops() }}
                          style={{ width:'100%', padding:'11px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:k===slugA?'rgba(79,142,247,0.08)':'transparent', border:'none' }}>
                          <span style={{ color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:k===slugA?700:400 }}>{c.name}</span>
                          {s !== null
                            ? <span style={{ color:sc(s), fontSize:13, fontWeight:700, fontFamily:'monospace' }}>{s}</span>
                            : <span style={{ color:'rgba(255,255,255,0.20)', fontSize:13, fontFamily:'monospace' }}>--</span>
                          }
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="cmp-vs" style={{ color:'rgba(255,255,255,0.50)', fontSize:18, fontWeight:300, flexShrink:0 }}>vs</div>

            {/* City B */}
            <div style={{ position:'relative', flex:'1 1 160px' }}>
              <button onClick={() => { setDropB(!dropB); setDropA(false); setDropO(false) }}
                style={{ width:'100%', padding:'12px 16px', borderRadius:14, background:'rgba(20,184,166,0.08)', border:`1.5px solid ${slugB ? 'rgba(20,184,166,0.22)' : 'rgba(20,184,166,0.50)'}`, cursor:'pointer', textAlign:'left' }}>
                {slugB ? <>
                  <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11 }}>{cityB.province}</div>
                  <div style={{ color:'white', fontSize:17, fontWeight:800 }}>{cityB.name}</div>
                  <div style={{ color: rkc(rankB), fontSize:11, fontWeight:700, marginTop:2 }}>{ready ? `Rank #${rankB}/${totalCities} for ${occName}s · ${pt.label}` : pt.label}</div>
                </> : <>
                  <div style={{ color:'rgba(20,184,166,0.50)', fontSize:11 }}>City B</div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:17, fontWeight:800 }}>Select City ▾</div>
                  <div style={{ color:'rgba(255,255,255,0.20)', fontSize:11, marginTop:2 }}>Click to choose</div>
                </>}
              </button>
              {dropB && (
                <div className="drop-menu">
                  <div className="drop-menu-inner">
                    {Object.entries(cityBase).filter(([k])=>k!==slugA).map(([k,c]) => {
                      const fit = occ ? fitMatrix[k]?.[occ] : undefined
                      const s   = fit ? getAdjScore(fit, pt.priceMult, pt.rentMult) : null
                      return (
                        <button key={k} className="drop-item" onClick={() => { setSlugB(k); closeDrops() }}
                          style={{ width:'100%', padding:'11px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:k===slugB?'rgba(20,184,166,0.08)':'transparent', border:'none' }}>
                          <span style={{ color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:k===slugB?700:400 }}>{c.name}</span>
                          {s !== null
                            ? <span style={{ color:sc(s), fontSize:13, fontWeight:700, fontFamily:'monospace' }}>{s}</span>
                            : <span style={{ color:'rgba(255,255,255,0.20)', fontSize:13, fontFamily:'monospace' }}>--</span>
                          }
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="cmp-dot" style={{ color:'rgba(255,255,255,0.38)', fontSize:13, flexShrink:0 }}>·</div>

            {/* Occupation */}
            <div className="cmp-occ" style={{ position:'relative', flexShrink:0 }}>
              <button onClick={() => { setDropO(!dropO); setDropA(false); setDropB(false) }}
                style={{ padding:'12px 16px', borderRadius:14, background:'rgba(255,255,255,0.05)', border:`1px solid ${occ ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.28)'}`, cursor:'pointer', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' }}>
                <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>Occupation</span>
                <span style={{ color: occ ? 'white' : 'rgba(255,255,255,0.30)', fontSize:15, fontWeight:700 }}>{occ ? occName : 'Select'}</span>
                <span style={{ color:'rgba(255,255,255,0.50)', fontSize:11 }}>▾</span>
              </button>
              {dropO && (
                <div className="drop-menu" style={{ right:'auto', minWidth:200 }}>
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
          <div className="cmp-housing" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28, padding:'12px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14 }}>
            <div>
              <div style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.06em' }}>Housing Scenario</div>
              <div style={{ color:'rgba(255,255,255,0.42)', fontSize:11, marginTop:2 }}>Affects fit score, rent & housing pressure</div>
            </div>
            <div className="cmp-housing-btns" style={{ display:'flex', flexDirection:'column', gap:3, marginLeft:'auto' }}>
              <div className="cmp-prop-row1" style={{ display:'flex', gap:3, background:'rgba(255,255,255,0.05)', borderRadius:10, padding:3 }}>
                {PROP_TYPES.slice(0,3).map(p => (
                  <button key={p.id} onClick={() => setPropType(p.id)}
                    style={{ padding:'6px 14px', borderRadius:7, fontSize:13, fontWeight:p.id===propType?700:500, cursor:'pointer', border:'none', background:p.id===propType?'rgba(255,255,255,0.11)':'transparent', color:p.id===propType?'white':'rgba(255,255,255,0.32)', transition:'all 0.15s', whiteSpace:'nowrap' }}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="cmp-prop-row2" style={{ display:'flex', gap:3 }}>
                {PROP_TYPES.slice(3).map(p => (
                  <button key={p.id} onClick={() => setPropType(p.id)}
                    style={{ flex:1, padding:'5px 10px', borderRadius:7, fontSize:12, fontWeight:p.id===propType?700:500, cursor:'pointer', border:`1px solid ${p.id===propType?'rgba(255,255,255,0.20)':'rgba(255,255,255,0.08)'}`, background:p.id===propType?'rgba(255,255,255,0.10)':'rgba(255,255,255,0.02)', color:p.id===propType?'white':'rgba(255,255,255,0.32)', transition:'all 0.15s', whiteSpace:'nowrap' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="cmp-housing-note" style={{ color:'rgba(255,255,255,0.48)', fontSize:11, whiteSpace:'nowrap' }}>
              Current: {pt.label} · {
                propType==='1br'?'Solo / Couple':
                propType==='2br'?'Small Family':
                propType==='3br'?'Larger Family (Condo)':
                propType==='townhouse'?'Row / Townhouse':'Detached'
              }
            </div>
          </div>

          {/* ── NOT READY: prompt ── */}
          {!ready && (
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'48px 32px', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:16 }}>🏙️</div>
              <h2 style={{ color:'white', fontSize:20, fontWeight:800, margin:'0 0 10px' }}>Select two cities and your occupation</h2>
              <p style={{ color:'rgba(255,255,255,0.42)', fontSize:14, margin:'0 0 24px', lineHeight:1.6 }}>
                Once selected, a full multi-dimension comparison<br/>report will be generated automatically
              </p>
              <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
                {!slugA && <div style={{ padding:'8px 16px', borderRadius:10, border:'1px dashed rgba(79,142,247,0.40)', color:'rgba(79,142,247,0.70)', fontSize:13 }}>① Select City A</div>}
                {!slugB && <div style={{ padding:'8px 16px', borderRadius:10, border:'1px dashed rgba(20,184,166,0.40)', color:'rgba(20,184,166,0.70)', fontSize:13 }}>② Select City B</div>}
                {!occ   && <div style={{ padding:'8px 16px', borderRadius:10, border:'1px dashed rgba(255,255,255,0.20)', color:'rgba(255,255,255,0.40)', fontSize:13 }}>③ Select Occupation</div>}
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
                        Why {winner.name} leads
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
                          <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>total lead</span>
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

      {/* ── CROSS-COUNTRY DISCLAIMER ─────────────────────────────────────── */}
      {isCrossCountry && (
        <div style={{ maxWidth:1100, margin:'16px auto 0', padding:'0 32px' }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'12px 16px', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.20)', borderRadius:12 }}>
            <span style={{ fontSize:15, flexShrink:0, lineHeight:'20px', marginTop:1 }}>⚠️</span>
            <p style={{ color:'rgba(255,255,255,0.50)', fontSize:12, lineHeight:1.7, margin:0 }}>
              <strong style={{ color:'rgba(255,255,255,0.75)', fontWeight:700 }}>Cross-country comparison note: </strong>
              This comparison assumes each person earns local wages in local currency — a {US_IDS.has(slugA) ? cityA.name : cityB.name} worker earning USD vs a {US_IDS.has(slugA) ? cityB.name : cityA.name} worker earning CAD.
              {' '}Housing pressure (years to buy) and rent pressure (% of income) are currency-neutral ratios and are valid to compare across countries.
              {' '}If you earn in one currency and plan to live in a city priced in another, use the Calculate page with your actual income instead.
            </p>
          </div>
        </div>
      )}

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

        {/* ── WHO FITS WHERE ── */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:22, borderRadius:2, background:'#4F8EF7' }} />
            <div>
              <h2 style={{ color:'#FFFFFF', fontSize:22, fontWeight:800, margin:0 }}>Who Fits Where</h2>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:13 }}>Based on your priorities, not a single right answer</span>
            </div>
          </div>
          <div className="col2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'20px 22px' }}>
              <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11, marginBottom:14, fontWeight:600 }}>{winner.name} suits you if…</div>
              {suitable.winReasons.map((r,i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                  <div style={{ color:'#14B8A6', fontSize:14, marginTop:1, flexShrink:0 }}>✓</div>
                  <span style={{ color:'rgba(255,255,255,0.72)', fontSize:13, lineHeight:1.65 }}>{r}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'20px 22px' }}>
              <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11, marginBottom:14, fontWeight:600 }}>{loser.name} suits you if…</div>
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
            <h2 style={{ color:'#FFFFFF', fontSize:22, fontWeight:800, margin:0 }}>Quick Comparison</h2>
          </div>
          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'10px 20px', background:'rgba(255,255,255,0.02)' }}>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, letterSpacing:'0.06em' }}>Dimension</span>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, textAlign:'center' }}>{cityA.name}</span>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:700, textAlign:'center' }}>{cityB.name}</span>
            </div>
            {[
              { label:'Overall Fit',     key:'score' },
              { label:'Housing Burden',  key:'hpiYears' },
              { label:'Rent Pressure',   key:'rpi' },
              { label:'Tax Index',       key:'tai' },
              { label:'Employment',      key:'eoi' },
              { label:'Healthcare',      key:'hai' },
              { label:'Transit',         key:'tci' },
              { label:'Safety',          key:'psi' },
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
              <h2 style={{ color:'#FFFFFF', fontSize:22, fontWeight:800, margin:0 }}>Dimension Breakdown</h2>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:13 }}>Housing metrics adjusted for {pt.label}</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr 1fr', gap:8, padding:'8px 20px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:4 }}>
            <span style={{ color:'rgba(255,255,255,0.62)', fontSize:14, fontWeight:700 }}>Dimension</span>
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
              <h2 style={{ color:'#FFFFFF', fontSize:22, fontWeight:800, margin:0 }}>Housing Snapshot</h2>
              <span style={{ color:'rgba(255,255,255,0.38)', fontSize:13 }}>{occName} × {pt.label} scenario</span>
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
                  { label:`${pt.label} reference price`, value:`$${adjPrice.toLocaleString()}`, color:'rgba(255,255,255,0.82)' },
                  { label:'Price / income',               value:`${adjFit.hpiYears} yrs income`,  color:hc(adjFit.hpiYears), sub: hl(adjFit.hpiYears) },
                  { label:`${pt.label} median rent`,      value:`$${adjRent.toLocaleString()}/mo`, color:'rgba(255,255,255,0.82)' },
                  { label:'Rent as % of income',          value:`${adjFit.rpi}%`,               color:rc(adjFit.rpi), sub: rl(adjFit.rpi) },
                  { label:'Tax structure',                 value:city.taiNote,                    color:'rgba(255,255,255,0.45)' },
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
            <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11, marginBottom:4 }}>Enter your real numbers for a personalized result</div>
            <div style={{ color:'white', fontWeight:800, fontSize:15 }}>Calculate with My Details →</div>
          </a>
          <a href={`/city/${winSlug}?occupation=${occ}&housing=${propType}`}
            style={{ display:'block', padding:'18px 22px', borderRadius:14, textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)' }}>
            <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11, marginBottom:4 }}>Deep dive</div>
            <div style={{ color:'rgba(255,255,255,0.80)', fontWeight:700, fontSize:14 }}>Explore {winner.name} in Detail →</div>
          </a>
          <a href={`/ranking?occupation=${occ}&housing=${propType}`}
            style={{ display:'block', padding:'18px 22px', borderRadius:14, textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)' }}>
            <div style={{ color:'rgba(255,255,255,0.32)', fontSize:11, marginBottom:4 }}>Wider reference</div>
            <div style={{ color:'rgba(255,255,255,0.80)', fontWeight:700, fontSize:14 }}>{occName} · {pt.label} City Rankings →</div>
          </a>
        </div>

        {/* ── SHARE INSIGHT ── */}
        {(() => {
          const hpiDiff = Math.abs(adjA.hpiYears - adjB.hpiYears).toFixed(1)
          const winCityName = aWins ? cityA.name : cityB.name
          const loseCityName = aWins ? cityB.name : cityA.name
          const winHpi = aWins ? adjA.hpiYears : adjB.hpiYears
          const loseHpi = aWins ? adjB.hpiYears : adjA.hpiYears
          const winScore = aWins ? adjA.score : adjB.score
          const loseScore = aWins ? adjB.score : adjA.score
          const shareText = [
            `🏠 As a ${occName}, which Canadian city is more accessible to buy in?`,
            ``,
            `📍 ${winCityName}: ${winHpi} yrs income (score ${winScore})`,
            `📍 ${loseCityName}: ${loseHpi} yrs income (score ${loseScore})`,
            ``,
            `${winCityName} requires ${hpiDiff} fewer years of income to buy`,
            `Powered by lakive.com | Occupation × City Fit Engine`,
          ].join('\n')
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
          const redditTitle = `${occName} ${winCityName} vs ${loseCityName} — buy with ${winHpi} vs ${loseHpi} yrs income (Lakive data)`
          const redditUrl  = `https://reddit.com/submit?url=${encodeURIComponent('https://lakive.com/compare?cities='+slugA+','+slugB+'&occupation='+occ)}&title=${encodeURIComponent(redditTitle)}`
          const waUrl      = `https://wa.me/?text=${encodeURIComponent(shareText)}`
          return (
            <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'18px 20px' }}>
              <div style={{ color:'rgba(255,255,255,0.40)', fontSize:11, fontWeight:700, letterSpacing:'0.07em', marginBottom:12 }}>SHARE THIS COMPARISON</div>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 16px', marginBottom:14, fontFamily:'monospace', fontSize:12 }}>
                <div style={{ color:'rgba(255,255,255,0.75)', lineHeight:1.8 }}>
                  🏠 <span style={{ fontWeight:700 }}>{occName}</span> {winCityName} vs {loseCityName}<br/>
                  📍 {winCityName}: {winHpi} yrs income · {winScore} pts<br/>
                  📍 {loseCityName}: {loseHpi} yrs income · {loseScore} pts<br/>
                  <span style={{ color:'#14B8A6' }}>{winCityName} needs {hpiDiff} fewer years to buy</span>
                  <span style={{ color:'rgba(255,255,255,0.35)', display:'block', fontSize:11, marginTop:4 }}>lakive.com</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>

                {/* Copy */}
                <button onClick={() => { navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                  title="Copy text"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:copied?'rgba(20,184,166,0.18)':'rgba(255,255,255,0.07)', border:`1px solid ${copied?'rgba(20,184,166,0.45)':'rgba(255,255,255,0.12)'}`, cursor:'pointer', transition:'all 0.15s' }}>
                  {copied
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8"/></svg>
                  }
                </button>

                {/* X / Twitter */}
                <a href={twitterUrl} target="_blank" rel="noopener" title="Share on X / Twitter"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', textDecoration:'none' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>

                {/* Facebook */}
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://lakive.com/compare?cities='+slugA+','+slugB)}&quote=${encodeURIComponent(shareText)}`}
                  target="_blank" rel="noopener" title="Share on Facebook"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(24,119,242,0.12)', border:'1px solid rgba(24,119,242,0.30)', textDecoration:'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.885v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                </a>

                {/* Instagram */}
                <button onClick={() => { navigator.clipboard.writeText(shareText); window.open('https://www.instagram.com/', '_blank') }}
                  title="Copy content and open Instagram"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(225,48,108,0.10)', border:'1px solid rgba(225,48,108,0.28)', cursor:'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig2)" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="url(#ig2)" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig2)"/><defs><linearGradient id="ig2" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse"><stop stopColor="#f09433"/><stop offset="0.25" stopColor="#e6683c"/><stop offset="0.5" stopColor="#dc2743"/><stop offset="0.75" stopColor="#cc2366"/><stop offset="1" stopColor="#bc1888"/></linearGradient></defs></svg>
                </button>

                {/* Xiaohongshu */}
                <button onClick={() => { navigator.clipboard.writeText(shareText); window.open('https://www.xiaohongshu.com/', '_blank') }}
                  title="Copy content and open Xiaohongshu"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,45,45,0.10)', border:'1px solid rgba(255,45,45,0.28)', cursor:'pointer' }}>
                  <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" rx="10" fill="#FF2442"/>
                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="sans-serif">书</text>
                  </svg>
                </button>

                {/* WhatsApp */}
                <a href={waUrl} target="_blank" rel="noopener" title="Share on WhatsApp"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(37,211,102,0.10)', border:'1px solid rgba(37,211,102,0.28)', textDecoration:'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>

                {/* Reddit */}
                <a href={redditUrl} target="_blank" rel="noopener" title="Share on Reddit"
                  style={{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,87,0,0.10)', border:'1px solid rgba(255,87,0,0.28)', textDecoration:'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                </a>
              </div>
              <div style={{ color:'rgba(255,255,255,0.22)', fontSize:11, marginTop:10 }}>
                Instagram / Xiaohongshu: click to copy content, then paste into your post.
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
                📬 Subscribe to {winner.name}{occName ? ` × ${occName}` : ''} Report
              </div>
              <div style={{ color:'rgba(255,255,255,0.40)', fontSize:12 }}>Monthly brief + quarterly intelligence · Free · Unsubscribe anytime</div>
            </div>
            <span style={{ color:'#93C5FD', fontSize:16, marginLeft:12, flexShrink:0 }}>→</span>
          </a>
        )}

        {/* ── FOOTER ── */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:20 }}>
          <p style={{ color:'rgba(255,255,255,0.50)', fontSize:12, lineHeight:1.7, margin:0 }}>
            <span style={{ color:'rgba(255,255,255,0.35)', fontWeight:600 }}>Data sources: </span>
            CMHC (housing prices & rent) · Statistics Canada (income, crime) · Job Bank (job supply) · CRA & provincial tax authorities (taxes) · CIHI (healthcare) · ECCC (environment)
          </p>
          <p style={{ color:'rgba(255,255,255,0.40)', fontSize:11, marginTop:8 }}>
            Housing metrics (price/income, rent pressure) adjusted for {pt.label} scenario. Fit score calculated dynamically using housing pressure thresholds — not an official ranking. City comparisons are for reference only and do not constitute financial or immigration advice. Q1 2026.
          </p>
        </div>
      </div>}

      {(dropA||dropB||dropO) && <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={closeDrops} />}
    </main>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageInner />
    </Suspense>
  )
}
