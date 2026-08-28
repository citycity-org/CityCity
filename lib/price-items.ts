/**
 * Canonical list of tracked price items.
 * Used by both the submit form (client) and the API route (server) for validation.
 * Add new items here — the form and validation update automatically.
 */

export interface PriceItem {
  id:       string
  label:    string
  category: 'grocery' | 'gas' | 'restaurant' | 'transit'
  unit:     string     // display string e.g. "per jug"
  std_qty:  number     // divisor for unit_price (price / std_qty)
  std_unit: string     // e.g. "L", "kg", "egg" — unit of the unit_price
  min:      number     // CAD — valid price floor
  max:      number     // CAD — valid price ceiling
}

export const PRICE_ITEMS: PriceItem[] = [
  // Grocery
  { id: 'milk_4l',        label: 'Milk (4L jug)',           category: 'grocery',    unit: 'per jug',    std_qty: 4,  std_unit: 'L',     min: 3,   max: 14  },
  { id: 'eggs_12',        label: 'Eggs (12 large)',          category: 'grocery',    unit: 'per dozen',  std_qty: 12, std_unit: 'egg',   min: 3,   max: 20  },
  { id: 'chicken_kg',     label: 'Chicken breast (per kg)',  category: 'grocery',    unit: 'per kg',     std_qty: 1,  std_unit: 'kg',    min: 5,   max: 40  },
  { id: 'bread_loaf',     label: 'Bread (loaf, ~675g)',      category: 'grocery',    unit: 'per loaf',   std_qty: 1,  std_unit: 'loaf',  min: 2,   max: 12  },
  { id: 'butter_454g',    label: 'Butter (454g)',            category: 'grocery',    unit: 'per block',  std_qty: 1,  std_unit: 'block', min: 4,   max: 18  },
  // Gas
  { id: 'gas_litre',      label: 'Gasoline (per litre)',     category: 'gas',        unit: 'per litre',  std_qty: 1,  std_unit: 'L',     min: 1,   max: 3   },
  // Restaurant
  { id: 'coffee_large',   label: 'Coffee (large)',           category: 'restaurant', unit: 'per cup',    std_qty: 1,  std_unit: 'cup',   min: 2,   max: 12  },
  { id: 'fastfood_combo', label: 'Fast food combo meal',     category: 'restaurant', unit: 'per meal',   std_qty: 1,  std_unit: 'meal',  min: 8,   max: 32  },
  { id: 'lunch_casual',   label: 'Casual restaurant lunch',  category: 'restaurant', unit: 'per person', std_qty: 1,  std_unit: 'person',min: 12,  max: 70  },
  // Transit
  { id: 'transit_pass',   label: 'Monthly transit pass',     category: 'transit',    unit: 'per month',  std_qty: 1,  std_unit: 'month', min: 50,  max: 250 },
]

/** Keyed by id for O(1) lookup in the API route */
export const PRICE_ITEMS_MAP = Object.fromEntries(PRICE_ITEMS.map(i => [i.id, i]))
