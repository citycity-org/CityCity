'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────
type EoiVal = 'High'|'Mid'|'Low'
type OccFit = { score: number; hpiYears: number; rpi: number; eoi: EoiVal }

// ── Occupation list ───────────────────────────────────────────────────────────
const OCCUPATIONS = [
  // Healthcare
  { id:'nurse',         name:'Registered Nurse'             },
  { id:'doctor',        name:'Family Doctor'                },
  { id:'pharmacist',    name:'Pharmacist'                   },
  // Tech
  { id:'software_eng',  name:'Software Engineer'            },
  { id:'data_analyst',  name:'Data Analyst'                 },
  { id:'it_support',    name:'IT Support'                   },
  // Trades & Engineering
  { id:'electrician',   name:'Electrician'                  },
  { id:'engineer',      name:'Civil Engineer'               },
  { id:'plumber',       name:'Plumber'                      },
  { id:'carpenter',     name:'Carpenter'                    },
  // Education
  { id:'teacher',       name:'Secondary School Teacher'     },
  // Finance & Law
  { id:'accountant',    name:'Accountant'                   },
  { id:'lawyer',        name:'Lawyer'                       },
  // Public Services
  { id:'police',        name:'Police Officer'               },
  { id:'firefighter',   name:'Firefighter'                  },
  { id:'social_worker', name:'Social Worker'                },
  // Transport
  { id:'truck_driver',  name:'Truck Driver'                 },
  { id:'mechanic',      name:'Auto Mechanic'                },
  // Service
  { id:'chef',          name:'Chef'                         },
  { id:'retail',        name:'Retail Associate'             },
  // Other
  { id:'self_employed', name:'Self-Employed / Business Owner' },
  { id:'freelancer',    name:'Freelancer'                   },
  { id:'unemployed',    name:'Not Currently Employed'       },
  { id:'retired',       name:'Retired / Financially Independent' },
]

// ── Region list ───────────────────────────────────────────────────────────────
const REGIONS = [
  { id:'canada', label:'Canada',    subLabel:'All cities',         cities:['vancouver','toronto','calgary','montreal','ottawa'] },
  { id:'bc',     label:'BC',        subLabel:'British Columbia',   cities:['vancouver'] },
  { id:'ab',     label:'AB',        subLabel:'Alberta',            cities:['calgary'] },
  { id:'on',     label:'ON',        subLabel:'Ontario',            cities:['toronto','ottawa'] },
  { id:'qc',     label:'QC',        subLabel:'Québec',             cities:['montreal'] },
  { id:'usa',    label:'USA',       subLabel:'United States',      cities:['seattle','san-francisco','new-york','boston'] },
]

// ── Property types ────────────────────────────────────────────────────────────
const PROP_TYPES = [
  { id: '1br',       label: '1 Bedroom',      priceMult: 0.70, rentMult: 0.78 },
  { id: '2br',       label: '2 Bedrooms',     priceMult: 1.00, rentMult: 1.00 },
  { id: '3br',       label: '3 Bedrooms',     priceMult: 1.38, rentMult: 1.35 },
  { id: 'townhouse', label: 'Townhouse',       priceMult: 1.55, rentMult: 1.45 },
  { id: 'detached',  label: 'Detached House',  priceMult: 2.20, rentMult: 1.70 },
]

// ── Sort dimensions ───────────────────────────────────────────────────────────
const SORT_DIMS = [
  { id:'score',    label:'City Fit Score',  lowerBetter:false },
  { id:'hpiYears', label:'Years to Buy',    lowerBetter:true  },
  { id:'rpi',      label:'Rent Pressure',   lowerBetter:true  },
  { id:'tai',      label:'Tax Index',       lowerBetter:false },
  { id:'eoi',      label:'Employment',      lowerBetter:false },
  { id:'hai',      label:'Healthcare',      lowerBetter:false },
  { id:'eqi',      label:'Environment',     lowerBetter:false },
  { id:'tci',      label:'Transit',         lowerBetter:false },
  { id:'psi',      label:'Safety',          lowerBetter:false },
  { id:'edi',      label:'Education',       lowerBetter:false },
]

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
    unemployed:    { score:22, hpiYears:42.0, rpi:142,eoi:'Low'  },
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
    unemployed:    { score:24, hpiYears:39.2, rpi:132,eoi:'Low'  },
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
    unemployed:    { score:32, hpiYears:26.0, rpi:101,eoi:'Low'  },
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

// ── City base ─────────────────────────────────────────────────────────────────
const CITY_BASE: Record<string, {
  name:string; province:string; short:string
  eoi:number; tai:number; hai:number; eqi:number; tci:number; psi:number; edi:number
  taiNote:string
}> = {
  vancouver:       { name:'Vancouver',     province:'BC',            short:'YVR', eoi:80, tai:72, hai:88, eqi:90, tci:82, psi:72, edi:80, taiNote:'GST 5% + PST 7%' },
  toronto:         { name:'Toronto',       province:'ON',            short:'YYZ', eoi:92, tai:68, hai:90, eqi:75, tci:78, psi:68, edi:82, taiNote:'HST 13%' },
  calgary:         { name:'Calgary',       province:'AB',            short:'YYC', eoi:65, tai:90, hai:78, eqi:82, tci:48, psi:78, edi:72, taiNote:'GST 5% only' },
  montreal:        { name:'Montréal',      province:'QC',            short:'YUL', eoi:72, tai:42, hai:75, eqi:78, tci:72, psi:70, edi:80, taiNote:'GST + QST ≈ 15%' },
  ottawa:          { name:'Ottawa',        province:'ON',            short:'YOW', eoi:75, tai:68, hai:82, eqi:80, tci:55, psi:82, edi:85, taiNote:'HST 13%' },
  seattle:         { name:'Seattle',       province:'Washington',    short:'SEA', eoi:88, tai:95, hai:72, eqi:78, tci:65, psi:72, edi:82, taiNote:'No state income tax' },
  'san-francisco': { name:'San Francisco', province:'California',    short:'SFO', eoi:95, tai:35, hai:75, eqi:70, tci:75, psi:55, edi:90, taiNote:'CA top rate 13.3%' },
  'new-york':      { name:'New York City', province:'New York',      short:'NYC', eoi:92, tai:30, hai:78, eqi:62, tci:88, psi:58, edi:92, taiNote:'NY+NYC tax up to 14.8%' },
  boston:          { name:'Boston',        province:'Massachusetts', short:'BOS', eoi:85, tai:60, hai:80, eqi:75, tci:72, psi:68, edi:88, taiNote:'MA flat 5% state tax' },
}

// ── City Insights ─────────────────────────────────────────────────────────────
const INSIGHTS: Record<string, Record<string, string>> = {
  calgary: {
    electrician:  'Years-to-buy is low (3.9 yrs), after-tax advantage is strong (TAI 90), and trades demand is solid — a city worth comparing first for electricians.',
    nurse:        'No provincial PST means strong take-home pay; lower housing pressure (4.5 yrs) and stable healthcare employment make this one of the most cost-effective cities for nurses.',
    truck_driver: 'Logistics demand is concentrated, no provincial PST, lower living costs; ongoing urban expansion creates steady job supply.',
    software_eng: 'Strong after-tax advantage and lower housing pressure (5.2 yrs) suit engineers prioritizing financial growth; tech ecosystem is smaller than Vancouver or Toronto.',
    default:      'No provincial PST gives a clear after-tax edge; lower years-to-buy makes Calgary worth prioritizing for both technical and trades careers.',
  },
  toronto: {
    software_eng: 'Employment opportunity index is among the highest (EOI 92) and tech salaries are competitive, but housing burden is significant (12.5 yrs) — better suited for career-first candidates.',
    nurse:        'Strong healthcare employment and competitive salaries, but rent-to-income ratio is high (~41%) — assess carefully against your financial situation.',
    electrician:  'Employment is relatively strong, but buying a home takes 12.5 years — significantly higher pressure compared to Calgary (3.9 yrs).',
    default:      'Employment opportunity index is high nationally (EOI 92), but housing pressure is severe — better for those who prioritize career over housing costs.',
  },
  vancouver: {
    software_eng: 'Strong tech scene and attractive salaries, but price-to-income ratio is high — better suited for those who already own property or can accept high rent.',
    electrician:  'High housing costs hit trades workers hard: buying takes 13 years — compare with Calgary (3.9 yrs) before deciding.',
    nurse:        'Healthcare demand is stable, but buying a home takes 12.8 years and rent consumes ~42% of income — requires careful long-term financial planning.',
    default:      'Climate and environment rank among the best in major cities, but housing costs are among the highest — a real trade-off between livability and affordability.',
  },
  montreal: {
    teacher:      'Strong educational resources; bilingual (French/English) background is a competitive advantage; relatively low housing pressure (5.5 yrs).',
    electrician:  'Low years-to-buy (5.5 yrs) and moderate employment make this a viable option for trades workers seeking housing affordability.',
    default:      'Relatively manageable housing costs and lower living expenses, but QC provincial income tax is high and will reduce take-home pay.',
  },
  ottawa: {
    software_eng: 'Federal government tech sector jobs are concentrated and stable; salaries lag Toronto, but quality of life and living costs are more manageable.',
    nurse:        'Federal and provincial healthcare employment is stable; strong environmental quality and lower rent pressure than Vancouver or Toronto.',
    default:      'Dense federal government employment, strong environmental quality — suited for those who value job stability alongside quality of life.',
  },
  seattle: {
    software_eng: 'No state income tax (TAI 95) and Amazon/Microsoft/Boeing headquarters create massive tech demand — the strongest after-tax tech city on the list (score 90).',
    nurse:        'Strong healthcare employment, no state income tax boosts take-home pay — buying takes 9.2 years, which is manageable for the US market.',
    data_analyst: 'Tech density is among the highest in North America; no state income tax makes after-tax earnings highly competitive (TAI 95).',
    default:      'No state income tax delivers a major after-tax advantage; housing is expensive but more accessible than San Francisco or New York — a strong option for tech and healthcare professionals.',
  },
  'san-francisco': {
    software_eng: 'Highest employment opportunity index (EOI 95) — concentration of FAANG employers, AI/startup density is unmatched; CA income tax (13.3%) significantly reduces take-home pay.',
    data_analyst: 'Unrivaled tech ecosystem and data science demand (EOI 95); high salaries partially offset by CA tax burden and extreme housing costs (8.2 yrs to buy).',
    default:      'The highest job market density in tech and healthcare, but CA state tax (up to 13.3%) and severe housing costs limit financial upside — best suited for career-first candidates at peak earning years.',
  },
  'new-york': {
    software_eng: 'Strong fintech/media/tech employment hub (EOI 92); combined NY+NYC tax rate up to 14.8% is among the highest — weigh career access against tax drag.',
    lawyer:       'Legal sector is the densest in North America (EOI 92, score 75); combined NY+NYC tax is punishing at top rates — compare total after-tax compensation carefully.',
    accountant:   'Financial services sector is extremely active (EOI 92); tax burden is severe and housing costs are high — suited for top earners who prioritize career access.',
    default:      'Unmatched transit (TCI 88) and industry density across finance, media, and healthcare; NY+NYC tax burden up to 14.8% is the highest of all cities on this list — compare carefully against Seattle.',
  },
  boston: {
    software_eng: 'Strong tech and biotech ecosystem; MA flat 5% state tax is the most favorable on the East Coast — buying takes 7 years (better than NYC or SF).',
    nurse:        'One of the top healthcare hubs in North America (Mass General, MGH system); strong employment (EOI 85) with manageable tax burden.',
    doctor:       'Exceptional medical employment density (EOI 85, score 84); Boston is home to top-ranked hospitals — the strongest East Coast city for medical professionals.',
    default:      'Best balance of tech/healthcare employment and tax environment on the US East Coast; lower housing pressure than NYC or SF — a practical alternative for East Coast career-seekers.',
  },
}

function getInsight(cityId:string, occ:string):string {
  const m = INSIGHTS[cityId]
  return m?.[occ] ?? m?.default ?? ''
}

// ── Unemployed-specific insights ──────────────────────────────────────────────
const UNEMPLOYED_INSIGHTS: Record<string, string> = {
  toronto:         'Highest employment opportunity index nationally (EOI 92) with the most job density; best odds of finding work, but housing costs are high — secure employment before committing to housing.',
  ottawa:          'Federal government jobs are concentrated with strong stability (EOI 75); living costs are lower than Vancouver and Toronto — a solid transition city.',
  vancouver:       'Strong employment opportunity index (EOI 80) with active tech and service sectors; housing is expensive, so budget carefully for the job search period.',
  montreal:        'Lowest cost of living nationally — great for controlling expenses during a job search; bilingual background expands your options; moderate employment (EOI 72).',
  calgary:         'No provincial PST means strong take-home pay once employed; employment is concentrated in energy, construction, and trades (EOI 65) — best for candidates with relevant backgrounds.',
  seattle:         'No state income tax maximizes take-home pay once hired (TAI 95); strong tech and healthcare demand (EOI 88) — a solid landing city for tech job seekers.',
  'san-francisco': 'Highest tech and startup employment density in North America (EOI 95); high living costs require a quick path to employment — best for experienced tech candidates only.',
  'new-york':      'Exceptional employment density across finance, media, and healthcare (EOI 92); high cost of living demands rapid job placement — have savings to cover 3–6 months.',
  boston:          'Strong healthcare and biotech employment (EOI 85); more manageable living costs than NYC or SF on the East Coast — a practical choice for healthcare and tech job seekers.',
}

// ── US city IDs (no /city/ page — use guide instead) ─────────────────────────
const US_CITY_IDS = new Set(['seattle', 'san-francisco', 'new-york', 'boston'])
const cityDetailLink = (id: string, occ: string) =>
  US_CITY_IDS.has(id) ? `/guide/software-engineer/${id}` : `/city/${id}?occupation=${occ}`

// ── Auto-generate ranking title ───────────────────────────────────────────────
function getRankingTitle(regionLabel:string, occName:string, sortId:string):string {
  if (sortId === 'score')    return `Best cities in ${regionLabel} for ${occName}`
  if (sortId === 'hpiYears') return `Least housing pressure for ${occName} in ${regionLabel}`
  if (sortId === 'rpi')      return `Lowest rent pressure for ${occName} in ${regionLabel}`
  if (sortId === 'tai')      return `Highest tax advantage in ${regionLabel}`
  if (sortId === 'eoi')      return `Most ${occName} employment in ${regionLabel}`
  const sortLabel = SORT_DIMS.find(d=>d.id===sortId)?.label ?? ''
  return `${regionLabel} — ${occName} ranked by ${sortLabel}`
}

// ── Color helpers ─────────────────────────────────────────────────────────────
const sc = (s:number) => s>=80?'#14B8A6':s>=70?'#4F8EF7':s>=55?'#F59E0B':s>=40?'#E86C2F':'#EF4444'
const hc = (y:number) => y<6?'#14B8A6':y<10?'#F59E0B':y<14?'#E86C2F':'#EF4444'
const rc = (r:number) => r<30?'#14B8A6':r<38?'#F59E0B':r<45?'#E86C2F':'#EF4444'
const dc = (v:number) => v>=80?'#14B8A6':v>=65?'#60A5FA':'#F59E0B'

const rankStyle = (r:number) => {
  if (r===1) return { color:'#14B8A6', bg:'rgba(20,184,166,0.15)', border:'rgba(20,184,166,0.35)' }
  if (r===2) return { color:'#60A5FA', bg:'rgba(96,165,250,0.12)', border:'rgba(96,165,250,0.28)' }
  if (r===3) return { color:'#F59E0B', bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.28)' }
  return           { color:'rgba(255,255,255,0.28)', bg:'rgba(255,255,255,0.06)', border:'rgba(255,255,255,0.12)' }
}

// ── v4.0 composite score ──────────────────────────────────────────────────────
function computeScore(hpiYears:number, rpi:number, tai:number, eoi:number, hai:number, eqi:number, tci:number, psi:number):number {
  const hpiScore = hpiYears<6?92:hpiYears<8?82:hpiYears<10?70:hpiYears<12?58:hpiYears<16?45:hpiYears<22?28:hpiYears<30?16:8
  const rpiScore = rpi<25?90:rpi<30?82:rpi<35?72:rpi<40?60:rpi<45?48:rpi<60?30:rpi<80?16:8
  const housingScore = hpiScore * 0.55 + rpiScore * 0.45
  const cityScore    = eoi*0.22 + tai*0.20 + hai*0.20 + eqi*0.14 + tci*0.12 + psi*0.12
  return Math.max(10, Math.min(99, Math.round(housingScore * 0.52 + cityScore * 0.48)))
}

// ── City-only composite index (no housing) ────────────────────────────────────
function cityIndexScore(tai:number, eoi:number, hai:number, eqi:number, tci:number, psi:number):number {
  return Math.round(eoi*0.22 + tai*0.20 + hai*0.20 + eqi*0.14 + tci*0.12 + psi*0.12)
}

// ── Adjusted score — same as Compare page (starts from FIT_MATRIX base) ───────
function getAdjScore(base: OccFit, priceMult: number, rentMult: number): number {
  const hT = (y:number) => y<6?92:y<8?82:y<10?70:y<12?58:y<16?45:y<22?28:y<30?16:8
  const rT = (r:number) => r<25?90:r<30?82:r<35?72:r<40?60:r<45?48:r<60?30:r<80?16:8
  const adjH = base.hpiYears * priceMult
  const adjR = base.rpi * rentMult
  const housingDelta = (hT(adjH) - hT(base.hpiYears)) * 0.55 + (rT(adjR) - rT(base.rpi)) * 0.45
  return Math.max(10, Math.min(99, base.score + Math.round(housingDelta * 0.52)))
}

function getSortValue(
  fitMatrix: typeof FIT_MATRIX, cityBase: typeof CITY_BASE,
  cityId:string, occ:string, dimId:string
):number {
  const fit  = fitMatrix[cityId]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'Mid' as EoiVal }
  const city = cityBase[cityId]
  switch(dimId) {
    case 'score':    return fit.score
    case 'hpiYears': return fit.hpiYears
    case 'rpi':      return fit.rpi
    case 'tai':      return city?.tai ?? 0
    case 'eoi':      return city?.eoi ?? 0
    case 'hai':      return city?.hai ?? 0
    case 'eqi':      return city?.eqi ?? 0
    case 'tci':      return city?.tci ?? 0
    case 'psi':      return city?.psi ?? 0
    case 'edi':      return city?.edi ?? 0
    default:         return 0
  }
}

// ── Dropdown component ────────────────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange }: {
  label: string
  value: string
  options: { id:string; name:string; sub?:string }[]
  onChange: (id:string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find(o=>o.id===value)
  return (
    <div style={{ position:'relative' }}>
      <button onClick={()=>setOpen(!open)}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', whiteSpace:'nowrap' }}>
        <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>{label}</span>
        <span style={{ color: current?.id ? 'white' : 'rgba(255,255,255,0.35)', fontSize:14, fontWeight:700 }}>{current?.name ?? 'Select'}</span>
        <span style={{ color:'rgba(255,255,255,0.50)', fontSize:11 }}>▾</span>
      </button>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, minWidth:200, background:'#1a2035', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, overflow:'hidden', zIndex:50, boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
          <div style={{ maxHeight:280, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.18) transparent' }}>
            {options.map(o=>(
              <button key={o.id}
                onClick={()=>{ onChange(o.id); setOpen(false) }}
                style={{ width:'100%', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background:o.id===value?'rgba(79,142,247,0.10)':'transparent', border:'none', textAlign:'left' }}>
                <span style={{ color:'rgba(255,255,255,0.82)', fontSize:13, fontWeight:o.id===value?700:400 }}>{o.name}</span>
                {o.sub && <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11 }}>{o.sub}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      {open && <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={()=>setOpen(false)} />}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RankingPage() {
  const [region,      setRegion     ] = useState('canada')
  const [occ,         setOcc        ] = useState('')
  const [sortDim,     setSortDim    ] = useState('score')
  const [propType,    setPropType   ] = useState('')
  const [expanded,    setExpanded   ] = useState<string|null>(null)
  const [liveHpi,     setLiveHpi    ] = useState<Record<string,number>>({})
  const [currentCity, setCurrentCity] = useState<string|null>(null)

  // Dynamic data from Supabase (falls back to hardcoded constants)
  const [fitMatrix, setFitMatrix] = useState<typeof FIT_MATRIX>(FIT_MATRIX)
  const [cityBase,  setCityBase ] = useState<typeof CITY_BASE>(CITY_BASE)
  const [copied,    setCopied   ] = useState(false)

  useEffect(() => {
    fetch('/api/city-scores')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        if (d.fitMatrix)   setFitMatrix(d.fitMatrix)
        if (d.cityIndices) setCityBase(d.cityIndices)
      })
      .catch(() => { /* silently use hardcoded fallback */ })
  }, [])

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const o = p.get('occupation')
    if (o && OCCUPATIONS.find(x=>x.id===o)) setOcc(o)
    const r = p.get('region')
    if (r && REGIONS.find(x=>x.id===r)) setRegion(r)
    const c = p.get('current')
    if (c && cityBase[c]) setCurrentCity(c)
    const h = p.get('housing')
    if (h && PROP_TYPES.find(pt=>pt.id===h)) setPropType(h)
  }, [cityBase])

  useEffect(() => {
    async function fetchHpi() {
      const { data } = await supabase
        .from('housing_years').select('city_id, years_current')
        .eq('occupation_id', occ).eq('property_type', '2br_condo')
      if (data?.length) {
        const m: Record<string,number> = {}
        data.forEach((r:{city_id:string;years_current:number}) => {
          m[r.city_id] = parseFloat(String(r.years_current))
        })
        setLiveHpi(m)
      }
    }
    fetchHpi()
  }, [occ])

  const occName   = OCCUPATIONS.find(o=>o.id===occ)?.name ?? 'All Occupations'
  const regionObj = REGIONS.find(r=>r.id===region)!
  const dim       = SORT_DIMS.find(d=>d.id===sortDim)!
  const title     = getRankingTitle(regionObj.label, occName, sortDim)

  const isUnemployed = occ === 'unemployed'

  const mode = !occ ? 'index' : (!propType && !isUnemployed) ? 'prompt' : 'full'
  const prop = PROP_TYPES.find(pt=>pt.id===propType) ?? PROP_TYPES[1]

  const allCities = regionObj.cities
    .filter(id => cityBase[id])
    .map(id => {
      const city = cityBase[id]
      if (mode === 'index') {
        const score = cityIndexScore(city.tai, city.eoi, city.hai, city.eqi, city.tci, city.psi)
        const fit: OccFit = { score, hpiYears: 0, rpi: 0, eoi: 'Mid' as EoiVal }
        return { id, city, fit, insight: '' }
      }
      const fitBase  = fitMatrix[id]?.[occ] ?? { score:50, hpiYears:10, rpi:40, eoi:'Mid' as EoiVal }
      const baseHpi  = liveHpi[id] ?? fitBase.hpiYears
      const hpiYears = parseFloat((baseHpi * prop.priceMult).toFixed(1))
      const rpi      = Math.round(fitBase.rpi * prop.rentMult)
      const score = isUnemployed
        ? cityIndexScore(city.tai, city.eoi, city.hai, city.eqi, city.tci, city.psi)
        : getAdjScore(fitBase, prop.priceMult, prop.rentMult)
      const insight = isUnemployed ? (UNEMPLOYED_INSIGHTS[id] ?? '') : getInsight(id, occ)
      return { id, city, fit:{ ...fitBase, hpiYears, rpi, score }, insight }
    })
    .sort((a,b) => {
      if (mode === 'index') return b.fit.score - a.fit.score
      if (isUnemployed) {
        const eoiA = getSortValue(fitMatrix, cityBase, a.id, occ, 'eoi')
        const eoiB = getSortValue(fitMatrix, cityBase, b.id, occ, 'eoi')
        if (eoiA !== eoiB) return eoiB - eoiA
        return b.fit.score - a.fit.score
      }
      const vA = sortDim === 'score' ? a.fit.score : getSortValue(fitMatrix, cityBase, a.id, occ, sortDim)
      const vB = sortDim === 'score' ? b.fit.score : getSortValue(fitMatrix, cityBase, b.id, occ, sortDim)
      return dim.lowerBetter ? vA-vB : vB-vA
    })

  const currentRank = currentCity ? allCities.findIndex(c=>c.id===currentCity)+1 : null

  return (
    <main style={{ minHeight:'100vh', background:'#0d1117' }}>
      <style>{`
        .city-card { transition: border-color 0.15s; }
        .city-card:hover { border-color: rgba(255,255,255,0.18) !important; }
        .card-main-row { cursor: pointer; }
        .quick-link { opacity:0.7; transition:opacity 0.15s; }
        .quick-link:hover { opacity:1; }
        @media (max-width:700px) {
          .metrics-row  { grid-template-columns:repeat(2,1fr) !important; }
          .dim-grid     { grid-template-columns:1fr !important; }
          .cta-grid     { grid-template-columns:1fr !important; }
          .page-cta     { flex-direction:column !important; }
        }
      `}</style>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(160deg,#0d1117 0%,#151827 60%,#1a2035 100%)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'28px 32px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>

          <div style={{ color:'rgba(255,255,255,0.50)', fontSize:12, marginBottom:16 }}>Lakive · City Rankings</div>

          <div style={{ marginBottom:20 }}>
            <h1 style={{ color:'white', fontSize:28, fontWeight:900, margin:'0 0 6px', letterSpacing:'-0.5px' }}>City Rankings</h1>
            <p style={{ color:'rgba(255,255,255,0.32)', fontSize:13, margin:0 }}>
              Not a "best city" ranking — a fit score for your occupation across cities in Canada and the US.
            </p>
          </div>

          {/* ── Filter bar ── */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <FilterDropdown
              label="Region"
              value={region}
              options={REGIONS.map(r=>({ id:r.id, name:r.label, sub:r.subLabel }))}
              onChange={v=>{ setRegion(v); setExpanded(null) }}
            />
            <FilterDropdown
              label="Occupation"
              value={occ}
              options={[{ id:'', name:'Select occupation' }, ...OCCUPATIONS.map(o=>({ id:o.id, name:o.name }))]}
              onChange={v=>{ setOcc(v); setExpanded(null); if (v === 'unemployed') setSortDim('eoi') }}
            />
            <FilterDropdown
              label="Sort by"
              value={sortDim}
              options={SORT_DIMS.map(d=>({ id:d.id, name:d.label }))}
              onChange={v=>{ setSortDim(v); setExpanded(null) }}
            />
            <FilterDropdown
              label="Property"
              value={propType}
              options={[{ id:'', name:'Select property type' }, ...PROP_TYPES.map(pt=>({ id:pt.id, name:pt.label }))]}
              onChange={v=>{ setPropType(v); setExpanded(null) }}
            />
          </div>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 32px' }}>

        {/* ── Current city position banner ── */}
        {currentCity && currentRank && (
          <div style={{ marginBottom:16, padding:'10px 16px', background:'rgba(79,142,247,0.08)', border:'1px solid rgba(79,142,247,0.20)', borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ color:'#60A5FA', fontSize:13 }}>📍</span>
            <span style={{ color:'rgba(255,255,255,0.65)', fontSize:13 }}>
              <strong style={{ color:'white' }}>{cityBase[currentCity]?.name}</strong>
              {' '}ranks <strong style={{ color:rankStyle(currentRank).color }}>#{currentRank}</strong>
              {' '}out of {allCities.length} cities for {occName} in {regionObj.label}
            </span>
          </div>
        )}

        {/* ── Ranking title ── */}
        <div style={{ marginBottom: mode==='prompt' ? 12 : 20, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div>
            <h2 style={{ color:'#FFFFFF', fontSize:26, fontWeight:800, margin:'0 0 4px' }}>
              {mode==='index' ? `${regionObj.label} — City Index Rankings`
                : isUnemployed ? `${regionObj.label} — Most Accessible Cities for Job Seekers`
                : title}
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, fontWeight:500, margin:'0 0 6px' }}>
              {mode==='index'
                ? `${allCities.length} cities · Ranked by composite index (TAI · EOI · HAI · EQI · TCI · PSI)`
                : isUnemployed
                ? `${allCities.length} cities · Sorted by: Employment → Cost of Living → City Fit`
                : `${allCities.length} cities · Based on ${occName} · ${PROP_TYPES.find(p=>p.id===propType)?.label ?? ''}`
              }
            </p>
            <p style={{ color:'rgba(255,255,255,0.50)', fontSize:12, margin:0 }}>
              {mode==='index'
                ? 'Select an occupation and property type to see a personalized ranking.'
                : isUnemployed
                ? 'Years-to-buy and rent pressure require income to calculate. Select an occupation once employed for full results.'
                : 'Rankings are based on occupation and public city data. They exclude household income, down payment, children, commute, and lifestyle preferences.'
              }
            </p>
          </div>
          <div style={{ display:'flex', gap:8, alignSelf:'flex-start', marginTop:4 }}>
            <a href={`/calculate?occupation=${occ}`}
              style={{ padding:'9px 16px', borderRadius:10, background:'rgba(79,142,247,0.12)', border:'1px solid rgba(79,142,247,0.28)', color:'#60A5FA', fontSize:13, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}>
              Calculate with my numbers →
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false), 2000) }}
              style={{ padding:'9px 14px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', color: copied ? '#34D399' : 'rgba(255,255,255,0.45)', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
              {copied ? '✓ Copied!' : '🔗 Share'}
            </button>
          </div>
        </div>

        {/* ── Prompt banner: occ selected but no propType ── */}
        {mode==='prompt' && (
          <div style={{ marginBottom:20, padding:'14px 20px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.28)', borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:18 }}>🏠</span>
            <div>
              <p style={{ color:'#FCD34D', fontSize:14, fontWeight:700, margin:'0 0 2px' }}>Select a property type</p>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, margin:0 }}>Once you select a property type, the ranking will recalculate based on your occupation and housing needs.</p>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:6, flexWrap:'wrap' }}>
              {PROP_TYPES.map(pt=>(
                <button key={pt.id} onClick={()=>setPropType(pt.id)}
                  style={{ padding:'6px 12px', borderRadius:8, border:'1px solid rgba(245,158,11,0.40)', background:'rgba(245,158,11,0.10)', color:'#FCD34D', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Unemployed mode banner ── */}
        {isUnemployed && (
          <div style={{ marginBottom:20, padding:'18px 22px', background:'rgba(20,184,166,0.06)', border:'1px solid rgba(20,184,166,0.18)', borderRadius:14 }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <span style={{ fontSize:20 }}>💼</span>
              <div>
                <p style={{ color:'#14B8A6', fontSize:14, fontWeight:700, margin:'0 0 6px' }}>Job Seeker Mode</p>
                <p style={{ color:'rgba(255,255,255,0.50)', fontSize:13, margin:'0 0 4px', lineHeight:1.65 }}>
                  Sorted by: <strong style={{ color:'rgba(255,255,255,0.70)' }}>Employment Opportunity (EOI)</strong> first, then overall score.
                </p>
                <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, margin:'0 0 10px' }}>
                  Current scores weight employment opportunity, cost of living, and city environment. Housing metrics will be included once you enter income.
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                  {allCities.map(({ id, city }) => {
                    const eoiColor = city.eoi >= 80 ? '#14B8A6' : city.eoi >= 70 ? '#F59E0B' : '#E86C2F'
                    const dot = city.eoi >= 80 ? '🟢' : city.eoi >= 70 ? '🟡' : '🔴'
                    return (
                      <div key={id} style={{ textAlign:'center', padding:'8px 6px', background:'rgba(255,255,255,0.04)', borderRadius:10, border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize:11, marginBottom:2 }}>{dot}</div>
                        <div style={{ color:'white', fontSize:12, fontWeight:700 }}>{city.name}</div>
                        <div style={{ color:eoiColor, fontSize:11, fontWeight:700, fontFamily:'monospace' }}>EOI {city.eoi}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── City cards ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
          {allCities.map(({ id, city, fit, insight }, index) => {
            const rank      = index + 1
            const rs        = rankStyle(rank)
            const isOpen    = expanded === id
            const isCurrent = id === currentCity
            const compareTo = allCities.find(c=>c.id!==id)?.id ?? 'calgary'

            return (
              <div key={id} className="city-card"
                style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${isCurrent?'rgba(79,142,247,0.35)':'rgba(255,255,255,0.08)'}`, borderRadius:18, overflow:'hidden' }}>

                {/* Main row */}
                <div className="card-main-row"
                  style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'52px 1fr auto', gap:16, alignItems:'center' }}
                  onClick={()=>setExpanded(isOpen?null:id)}>

                  {/* Rank badge */}
                  <div style={{ width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:rs.bg, border:`1px solid ${rs.border}`, flexShrink:0 }}>
                    <span style={{ color:rs.color, fontSize:20, fontWeight:900, fontFamily:'monospace' }}>{rank}</span>
                  </div>

                  {/* City name + metrics */}
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                      <a href={`/city/${id}`} onClick={e => e.stopPropagation()}
                        style={{ color:'white', fontSize:18, fontWeight:800, textDecoration:'none' }}
                        onMouseEnter={e=>(e.currentTarget.style.color='#93C5FD')}
                        onMouseLeave={e=>(e.currentTarget.style.color='white')}>
                        {city.name}
                      </a>
                      <span style={{ color:'rgba(255,255,255,0.50)', fontSize:12 }}>{city.province}</span>
                      {isCurrent && (
                        <span style={{ padding:'2px 7px', borderRadius:6, background:'rgba(79,142,247,0.15)', border:'1px solid rgba(79,142,247,0.30)', color:'#60A5FA', fontSize:10, fontWeight:700 }}>Your City</span>
                      )}
                    </div>
                    <div className="metrics-row" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                      {(mode==='full' ? (isUnemployed ? [
                        { label:'Employment',   val:String(city.eoi),  color:dc(city.eoi),                mono:true  },
                        { label:'Tax Index',    val:String(city.tai),  color:dc(city.tai),                mono:true  },
                        { label:'Yrs to Buy',   val:'N/A',             color:'rgba(255,255,255,0.25)',    mono:false, tip:'Enter income to calculate' },
                        { label:'Rent Pressure',val:'N/A',             color:'rgba(255,255,255,0.25)',    mono:false, tip:'Enter income to calculate' },
                      ] : [
                        { label:'Yrs to Buy',     val:`${fit.hpiYears} yrs`, color:hc(fit.hpiYears), mono:true  },
                        { label:'Rent Pressure',  val:`${fit.rpi}%`,         color:rc(fit.rpi),      mono:true  },
                        { label:'Tax Index',      val:String(city.tai),      color:dc(city.tai),     mono:true  },
                        { label:'Employment',     val:fit.eoi,               color:fit.eoi==='High'?'#14B8A6':fit.eoi==='Mid'?'#F59E0B':'#E86C2F', mono:false },
                      ]) : [
                        { label:'Tax Index',    val:String(city.tai), color:dc(city.tai), mono:true },
                        { label:'Employment',   val:String(city.eoi), color:dc(city.eoi), mono:true },
                        { label:'Healthcare',   val:String(city.hai), color:dc(city.hai), mono:true },
                        { label:'Environment',  val:String(city.eqi), color:dc(city.eqi), mono:true },
                      ]).map((m: { label:string; val:string; color:string; mono:boolean; tip?:string })=>(
                        <div key={m.label} title={m.tip ?? ''}>
                          <div style={{ color:'rgba(255,255,255,0.42)', fontSize:11, marginBottom:2 }}>{m.label}</div>
                          <div style={{ color:m.color, fontSize:15, fontWeight:800, fontFamily:m.mono?'monospace':'inherit', cursor:m.tip?'help':undefined }}>
                            {m.val}
                            {m.tip && <span style={{ fontSize:9, marginLeft:3, color:'rgba(255,255,255,0.18)' }}>?</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score + chevron */}
                  <div style={{ textAlign:'center', flexShrink:0 }}>
                    <div style={{ color:sc(fit.score), fontSize:44, fontWeight:900, fontFamily:'monospace', lineHeight:1, letterSpacing:'-2px' }}>{fit.score}</div>
                    <div style={{ color:'rgba(255,255,255,0.42)', fontSize:11, marginBottom:8 }}>/ 100</div>
                    <div style={{ color:'rgba(255,255,255,0.50)', fontSize:12, transform:isOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}>▾</div>
                  </div>
                </div>

                {/* Insight + quick actions */}
                {insight && (
                  <div style={{ margin:'0 24px 16px', padding:'10px 14px', background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.16)', borderRadius:10 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:8 }}>
                      <span style={{ color:'#F59E0B', fontSize:13, flexShrink:0, lineHeight:'20px' }}>💡</span>
                      <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, lineHeight:1.65, margin:0 }}>{insight}</p>
                    </div>
                    <div style={{ display:'flex', gap:14, paddingTop:6, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                      <a href={cityDetailLink(id, occ)}
                        onClick={e=>e.stopPropagation()}
                        className="quick-link"
                        style={{ color:'#60A5FA', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                        View City Details →
                      </a>
                      <a href={`/compare?cities=${id},${compareTo}&occupation=${occ}`}
                        onClick={e=>e.stopPropagation()}
                        className="quick-link"
                        style={{ color:'rgba(255,255,255,0.40)', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                        Compare with {cityBase[compareTo]?.name ?? 'another city'} →
                      </a>
                    </div>
                  </div>
                )}

                {/* ── Expanded ── */}
                {isOpen && (
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px 24px' }}>

                    <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', marginBottom:12 }}>ALL DIMENSIONS</div>

                    <div className="dim-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:20 }}>
                      {[
                        { label:'City Fit Score',   val:String(fit.score),    color:sc(fit.score),    mono:true  },
                        { label:'Yrs to Buy',        val: isUnemployed ? 'N/A' : `${fit.hpiYears} yrs income`, color: isUnemployed ? 'rgba(255,255,255,0.25)' : hc(fit.hpiYears), mono:true  },
                        { label:'Rent Pressure',     val: isUnemployed ? 'N/A' : `${fit.rpi}%`,  color: isUnemployed ? 'rgba(255,255,255,0.25)' : rc(fit.rpi), mono:true  },
                        { label:'Employment (EOI)',  val:`${city.eoi} (${fit.eoi})`,             color:city.eoi>=75?'#14B8A6':city.eoi>=55?'#F59E0B':'#E86C2F', mono:true },
                        { label:'Tax Index (TAI)',   val:String(city.tai),                       color:dc(city.tai),     mono:false },
                        { label:'Healthcare (HAI)',  val:String(city.hai),                       color:dc(city.hai),     mono:false },
                        { label:'Environment (EQI)', val:String(city.eqi),                       color:dc(city.eqi),     mono:false },
                        { label:'Transit (TCI)',     val:String(city.tci),                       color:dc(city.tci),     mono:false },
                        { label:'Safety (PSI)',      val:String(city.psi),                       color:dc(city.psi),     mono:false },
                        { label:'Education (EDI)',   val:String(city.edi),                       color:dc(city.edi),     mono:false },
                      ].map(m=>(
                        <div key={m.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', background:'rgba(255,255,255,0.025)', borderRadius:8 }}>
                          <span style={{ color:'rgba(255,255,255,0.40)', fontSize:12 }}>{m.label}</span>
                          <span style={{ color:m.color, fontSize:14, fontWeight:800, fontFamily:m.mono?'monospace':'inherit' }}>{m.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Per-card CTAs */}
                    <div className="cta-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                      <a href={`/calculate?city=${id}&occupation=${occ}`}
                        onClick={e=>e.stopPropagation()}
                        style={{ display:'block', padding:'12px 14px', borderRadius:12, textDecoration:'none', background:'linear-gradient(135deg,#4F8EF7,#5B5CF0)', textAlign:'center' }}>
                        <div style={{ color:'rgba(255,255,255,0.55)', fontSize:10, marginBottom:2 }}>Personalized</div>
                        <div style={{ color:'white', fontWeight:700, fontSize:12 }}>Calculate for {city.name} →</div>
                      </a>
                      <a href={cityDetailLink(id, occ)}
                        onClick={e=>e.stopPropagation()}
                        style={{ display:'block', padding:'12px 14px', borderRadius:12, textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', textAlign:'center' }}>
                        <div style={{ color:'rgba(255,255,255,0.50)', fontSize:11, marginBottom:2 }}>Deep dive</div>
                        <div style={{ color:'rgba(255,255,255,0.75)', fontWeight:700, fontSize:12 }}>City Details →</div>
                      </a>
                      <a href={`/compare?cities=${id},${compareTo}&occupation=${occ}`}
                        onClick={e=>e.stopPropagation()}
                        style={{ display:'block', padding:'12px 14px', borderRadius:12, textDecoration:'none', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', textAlign:'center' }}>
                        <div style={{ color:'rgba(255,255,255,0.50)', fontSize:11, marginBottom:2 }}>Side by side</div>
                        <div style={{ color:'rgba(255,255,255,0.75)', fontWeight:700, fontSize:12 }}>Compare Cities →</div>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── More cities CTA ── */}
        <div style={{ textAlign:'center', marginBottom:28, padding:'20px 24px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 }}>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, margin:'0 0 12px' }}>
            Showing {allCities.length} Canadian cities · Compare any two cities side-by-side
          </p>
          <a href="/compare"
            style={{ display:'inline-block', padding:'10px 20px', borderRadius:10, background:'rgba(79,142,247,0.12)', border:'1px solid rgba(79,142,247,0.25)', color:'#93C5FD', fontSize:13, fontWeight:700, textDecoration:'none' }}>
            Compare Cities →
          </a>
        </div>

        {/* ── Page-level CTA to Calculate ── */}
        <div className="page-cta" style={{ background:'rgba(79,142,247,0.07)', border:'1px solid rgba(79,142,247,0.20)', borderRadius:18, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap', marginBottom:28 }}>
          <div>
            <div style={{ color:'white', fontSize:16, fontWeight:800, marginBottom:4 }}>
              Want to know if these cities actually fit you?
            </div>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, margin:0 }}>
              Rankings show the full market picture. Enter your income, family situation, and housing budget to get your personal City Fit results.
            </p>
          </div>
          <a href={`/calculate?occupation=${occ}`}
            style={{ padding:'13px 22px', borderRadius:12, background:'linear-gradient(135deg,#4F8EF7,#5B5CF0)', color:'white', fontSize:14, fontWeight:700, textDecoration:'none', flexShrink:0, whiteSpace:'nowrap' }}>
            Get My Personal Results →
          </a>
        </div>

        {/* ── Subscribe CTA ── */}
        {occ && allCities.length > 0 && (
          <a href={`/subscribe?city=${allCities[0].id}&occ=${occ}&pt=${propType||'2br'}&from=ranking`}
            style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,rgba(79,142,247,0.10),rgba(91,92,240,0.08))', border:'1px solid rgba(79,142,247,0.25)', borderRadius:14, padding:'16px 20px', textDecoration:'none', marginBottom:20 }}>
            <div>
              <div style={{ color:'#93C5FD', fontSize:14, fontWeight:700, marginBottom:3 }}>
                {isUnemployed
                  ? `Top city for job seekers: ${allCities[0].city.name} (score: ${allCities[0].fit.score})`
                  : `📬 Subscribe to ${allCities[0].city.name} × ${occName} Report`}
              </div>
              <div style={{ color:'rgba(255,255,255,0.40)', fontSize:12 }}>
                {isUnemployed
                  ? 'Results vary by income, occupation, and housing needs'
                  : 'Monthly brief + quarterly report · Free · Unsubscribe anytime'}
              </div>
            </div>
            <span style={{ color:'#93C5FD', fontSize:16, marginLeft:12, flexShrink:0 }}>→</span>
          </a>
        )}

        {/* ── Submit Price CTA ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, padding:'16px 20px', background:'rgba(20,184,166,0.04)', border:'1px solid rgba(20,184,166,0.15)', borderRadius:14, marginBottom:20 }}>
          <div>
            <div style={{ color:'white', fontSize:14, fontWeight:600, marginBottom:3 }}>Know what things cost in these cities?</div>
            <div style={{ color:'rgba(255,255,255,0.45)', fontSize:13 }}>Help us track real prices — groceries, gas, transit and more.</div>
          </div>
          <a href="/prices/submit" style={{ display:'inline-block', padding:'10px 20px', background:'#14B8A6', color:'white', borderRadius:8, fontWeight:700, fontSize:14, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0 }}>
            Submit a price →
          </a>
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:20 }}>
          <p style={{ color:'rgba(255,255,255,0.50)', fontSize:12, margin:0 }}>
            <span style={{ color:'rgba(255,255,255,0.35)', fontWeight:600 }}>Data sources: </span>
            StatCan · CMHC · Job Bank · CRA & Provincial Tax Authorities · CIHI · ECCC
          </p>
          <p style={{ color:'rgba(255,255,255,0.40)', fontSize:11, marginTop:6 }}>
            All metrics are normalized through the Lakive model and do not represent official rankings. Results are for reference only and do not constitute financial or immigration advice. Salary data: Jul 2026 · Housing prices: Jul 2026 · CPI &amp; unemployment: auto-updated.
          </p>
        </div>
      </div>
    </main>
  )
}
