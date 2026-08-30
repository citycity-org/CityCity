/**
 * Canonical list of tracked price items.
 * CA items keep their original IDs (backward-compatible with existing Supabase data).
 * US items use us_ prefix.
 */

export type ItemCountry = 'CA' | 'US'

export interface PriceItem {
  id:       string
  label:    string
  category: 'grocery' | 'gas' | 'restaurant' | 'transit'
  unit:     string      // display string e.g. "per jug"
  std_qty:  number      // divisor for unit_price (price / std_qty)
  std_unit: string      // e.g. "L", "kg", "egg"
  min:      number      // valid price floor (in local currency)
  max:      number      // valid price ceiling (in local currency)
  country:  ItemCountry
  currency: 'CAD' | 'USD'
}

export const PRICE_ITEMS: PriceItem[] = [
  // ── Canada (CAD) ──────────────────────────────────────────────────────────
  { id: 'milk_4l',        label: 'Milk (4L jug)',           category: 'grocery',    unit: 'per jug',    std_qty: 4,     std_unit: 'L',     min: 3,   max: 14,  country: 'CA', currency: 'CAD' },
  { id: 'eggs_12',        label: 'Eggs (12 large)',          category: 'grocery',    unit: 'per dozen',  std_qty: 12,    std_unit: 'egg',   min: 3,   max: 20,  country: 'CA', currency: 'CAD' },
  { id: 'chicken_kg',     label: 'Chicken breast (per kg)',  category: 'grocery',    unit: 'per kg',     std_qty: 1,     std_unit: 'kg',    min: 5,   max: 40,  country: 'CA', currency: 'CAD' },
  { id: 'bread_loaf',     label: 'Bread (loaf, ~675g)',      category: 'grocery',    unit: 'per loaf',   std_qty: 1,     std_unit: 'loaf',  min: 2,   max: 12,  country: 'CA', currency: 'CAD' },
  { id: 'butter_454g',    label: 'Butter (454g)',            category: 'grocery',    unit: 'per block',  std_qty: 1,     std_unit: 'block', min: 4,   max: 18,  country: 'CA', currency: 'CAD' },
  { id: 'gas_litre',      label: 'Gasoline (per litre)',     category: 'gas',        unit: 'per litre',  std_qty: 1,     std_unit: 'L',     min: 1,   max: 3,   country: 'CA', currency: 'CAD' },
  { id: 'coffee_large',   label: 'Coffee (large)',           category: 'restaurant', unit: 'per cup',    std_qty: 1,     std_unit: 'cup',   min: 2,   max: 12,  country: 'CA', currency: 'CAD' },
  { id: 'fastfood_combo', label: 'Fast food combo meal',     category: 'restaurant', unit: 'per meal',   std_qty: 1,     std_unit: 'meal',  min: 8,   max: 32,  country: 'CA', currency: 'CAD' },
  { id: 'lunch_casual',   label: 'Casual restaurant lunch',  category: 'restaurant', unit: 'per person', std_qty: 1,     std_unit: 'person',min: 12,  max: 70,  country: 'CA', currency: 'CAD' },
  { id: 'transit_pass',   label: 'Monthly transit pass',     category: 'transit',    unit: 'per month',  std_qty: 1,     std_unit: 'month', min: 50,  max: 250, country: 'CA', currency: 'CAD' },

  // ── United States (USD) ───────────────────────────────────────────────────
  { id: 'us_milk_gallon',    label: 'Milk (1 gallon)',          category: 'grocery',    unit: 'per gallon', std_qty: 3.785, std_unit: 'L',     min: 3,   max: 8,   country: 'US', currency: 'USD' },
  { id: 'us_eggs_12',        label: 'Eggs (12 large)',          category: 'grocery',    unit: 'per dozen',  std_qty: 12,    std_unit: 'egg',   min: 2,   max: 10,  country: 'US', currency: 'USD' },
  { id: 'us_chicken_lb',     label: 'Chicken breast (per lb)',  category: 'grocery',    unit: 'per lb',     std_qty: 0.454, std_unit: 'kg',    min: 3,   max: 15,  country: 'US', currency: 'USD' },
  { id: 'us_bread_loaf',     label: 'Bread (loaf, ~24oz)',      category: 'grocery',    unit: 'per loaf',   std_qty: 1,     std_unit: 'loaf',  min: 2,   max: 8,   country: 'US', currency: 'USD' },
  { id: 'us_butter_lb',      label: 'Butter (1 lb)',            category: 'grocery',    unit: 'per lb',     std_qty: 1,     std_unit: 'lb',    min: 3,   max: 8,   country: 'US', currency: 'USD' },
  { id: 'us_gas_gallon',     label: 'Gasoline (per gallon)',    category: 'gas',        unit: 'per gallon', std_qty: 1,     std_unit: 'gal',   min: 3,   max: 7,   country: 'US', currency: 'USD' },
  { id: 'us_coffee_large',   label: 'Coffee (large)',           category: 'restaurant', unit: 'per cup',    std_qty: 1,     std_unit: 'cup',   min: 3,   max: 10,  country: 'US', currency: 'USD' },
  { id: 'us_fastfood_combo', label: 'Fast food combo meal',     category: 'restaurant', unit: 'per meal',   std_qty: 1,     std_unit: 'meal',  min: 8,   max: 22,  country: 'US', currency: 'USD' },
  { id: 'us_lunch_casual',   label: 'Casual restaurant lunch',  category: 'restaurant', unit: 'per person', std_qty: 1,     std_unit: 'person',min: 12,  max: 45,  country: 'US', currency: 'USD' },
  { id: 'us_transit_pass',   label: 'Monthly transit pass',     category: 'transit',    unit: 'per month',  std_qty: 1,     std_unit: 'month', min: 50,  max: 200, country: 'US', currency: 'USD' },
]

/** Keyed by id for O(1) lookup in the API route */
export const PRICE_ITEMS_MAP = Object.fromEntries(PRICE_ITEMS.map(i => [i.id, i]))
