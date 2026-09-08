/**
 * ─── MESS PLANS CONFIGURATION ────────────────────────────────────────────────
 * Central source of truth for all plan definitions, pricing, and metadata.
 * To add/modify a plan, update this file only — no other business logic changes needed.
 *
 * pricePerTiffin: Price charged per individual tiffin delivery
 * dailyTiffins:   Number of tiffins per day (lunch + dinner = 2)
 * dailyCharge:    pricePerTiffin × dailyTiffins (convenience field)
 * monthlyEstimate: dailyCharge × 30 (approx, actual bills are delivery-based)
 */

const MESS_PLANS = {
  plan_1: {
    id: 'plan_1',
    name: 'Basic Plan',
    shortName: 'Plan 1',
    description: 'Simple, wholesome daily tiffin with chapati and bhaji.',
    items: [
      { name: 'Chapati', emoji: '🫓', qty: '4 pcs' },
      { name: 'Bhaji',   emoji: '🥘', qty: '1 bowl' },
    ],
    pricePerTiffin:  60,          // ₹ per tiffin
    dailyTiffins:     2,          // lunch + dinner
    dailyCharge:     120,         // 60 × 2
    monthlyEstimate: 3600,        // 120 × 30
    badge: 'Popular',
    badgeColor: '#FF6B35',
    gradient: ['#FF6B35', '#FF9F1C'],
  },

  plan_2: {
    id: 'plan_2',
    name: 'Full Meal Plan',
    shortName: 'Plan 2',
    description: 'Complete nutritious meal with chapati, bhaji, dal, and rice.',
    items: [
      { name: 'Chapati', emoji: '🫓', qty: '4 pcs' },
      { name: 'Bhaji',   emoji: '🥘', qty: '1 bowl' },
      { name: 'Varan',   emoji: '🍲', qty: '1 bowl' },
      { name: 'Bhat',    emoji: '🍚', qty: '1 bowl' },
    ],
    pricePerTiffin:  80,          // ₹ per tiffin
    dailyTiffins:     2,          // lunch + dinner
    dailyCharge:     160,         // 80 × 2
    monthlyEstimate: 4800,        // 160 × 30
    badge: 'Complete',
    badgeColor: '#00B894',
    gradient: ['#00B894', '#0096C7'],
  },
};

/**
 * Meal slot configuration
 * morning = Lunch (7:00 AM – 2:00 PM)
 * night   = Dinner (7:00 PM – 10:00 PM)
 */
const MEAL_SLOTS = {
  morning: {
    id: 'morning',
    label: 'Morning (Lunch)',
    mealType: 'lunch',
    emoji: '☀️',
    timeRange: '7:00 AM – 2:00 PM',
    startHour: 7,
    endHour: 14,
  },
  night: {
    id: 'night',
    label: 'Night (Dinner)',
    mealType: 'dinner',
    emoji: '🌙',
    timeRange: '7:00 PM – 10:00 PM',
    startHour: 19,
    endHour: 22,
  },
};

/**
 * Meal types served by this mess service
 * (breakfast excluded — only lunch and dinner)
 */
const ACTIVE_MEAL_TYPES = ['lunch', 'dinner'];

/**
 * Helper: Get plan by ID
 * @param {string} planId
 * @returns {object} plan config or null
 */
const getPlan = (planId) => MESS_PLANS[planId] || null;

/**
 * Helper: Get all plans as an array (useful for API responses)
 */
const getAllPlans = () => Object.values(MESS_PLANS);

/**
 * Helper: Validate plan ID
 */
const isValidPlanId = (planId) => Object.keys(MESS_PLANS).includes(planId);

module.exports = {
  MESS_PLANS,
  MEAL_SLOTS,
  ACTIVE_MEAL_TYPES,
  getPlan,
  getAllPlans,
  isValidPlanId,
};
