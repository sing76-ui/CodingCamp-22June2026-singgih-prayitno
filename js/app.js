/**
 * app.js — Expense & Budget Visualizer
 *
 * Single JavaScript module for all application logic.
 * More functions (validation, storage, rendering, event handlers, init)
 * will be added in subsequent tasks.
 */

// ---------------------------------------------------------------------------
// In-memory state
// ---------------------------------------------------------------------------

/** @type {Array<{id: string, name: string, amount: number, category: string}>} */
let transactions = [];

/** @type {import('chart.js').Chart|null} */
let chartInstance = null;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Key used to read/write transaction data in localStorage. */
const TRANSACTIONS_STORAGE_KEY = "expense_visualizer_transactions";

/** Ordered list of valid expense categories. */
const CATEGORIES = ["Food", "Transport", "Fun"];

/**
 * Fixed color assigned to each category in the pie chart.
 * Colors are stable across all add/delete operations (Requirement 5.6).
 */
const CATEGORY_COLORS = {
  Food:      "#FF6384",
  Transport: "#36A2EB",
  Fun:       "#FFCE56"
};

// ---------------------------------------------------------------------------
// Warning stub (implemented in task 5)
// ---------------------------------------------------------------------------

// Forward declaration so loadTransactions can reference it before task 5 adds the real impl.
function showAppWarning(message) { /* implemented in task 5 */ }

// ---------------------------------------------------------------------------
// Storage Module
// ---------------------------------------------------------------------------

/**
 * Feature-detects whether localStorage is available and usable.
 * Returns false if the API is absent, disabled, or throws a SecurityError.
 *
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    localStorage.setItem("__test__", "1");
    localStorage.removeItem("__test__");
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Serializes the given transactions array and writes it to localStorage.
 * Does NOT swallow errors — if setItem throws (e.g. QuotaExceededError)
 * the error propagates to the caller.
 *
 * @param {Array<{id: string, name: string, amount: number, category: string}>} txns
 * Requirements: 3.1, 3.2
 */
function saveTransactions(txns) {
  const serialized = JSON.stringify(txns);
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, serialized);
}

/**
 * Reads and validates the transactions array from localStorage.
 *
 * - Absent key           → returns []  (no error, no warning)
 * - Malformed JSON       → returns [] + showAppWarning
 * - Schema-invalid items → returns [] + showAppWarning
 * - All items valid      → returns the validated array
 *
 * @returns {Array<{id: string, name: string, amount: number, category: string}>}
 * Requirements: 3.3, 3.4, 3.5, 3.6
 */
function loadTransactions() {
  const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

  // Absent key — normal first-run case
  if (raw === null) {
    return [];
  }

  // Attempt to parse the stored JSON
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    showAppWarning("Previous data could not be loaded.");
    return [];
  }

  // Must be an array
  if (!Array.isArray(parsed)) {
    showAppWarning("Previous data could not be loaded.");
    return [];
  }

  // Validate every item against the Transaction schema
  for (const item of parsed) {
    if (!isValidTransaction(item)) {
      showAppWarning("Previous data could not be loaded.");
      return [];
    }
  }

  return parsed;
}

/**
 * Validates a single object against the Transaction schema.
 *
 * @param {*} item
 * @returns {boolean}
 */
function isValidTransaction(item) {
  if (item === null || typeof item !== "object") return false;

  // id: non-empty string
  if (typeof item.id !== "string" || item.id.length === 0) return false;

  // name: non-empty string, trimmed length 1–100
  if (typeof item.name !== "string") return false;
  const trimmedName = item.name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 100) return false;

  // amount: finite positive number in range 0.01–999,999,999.99
  if (typeof item.amount !== "number") return false;
  if (!isFinite(item.amount)) return false;
  if (item.amount < 0.01 || item.amount > 999999999.99) return false;

  // category: one of CATEGORIES
  if (!CATEGORIES.includes(item.category)) return false;

  return true;
}

// ---------------------------------------------------------------------------
// Validation Module
// ---------------------------------------------------------------------------

/**
 * Validates form input values before creating a Transaction.
 *
 * Rules:
 * - name: trimmed length must be 1–100 characters
 * - amountRaw: must parse to a finite number in range 0.01–999,999,999.99
 * - category: must be one of CATEGORIES
 *
 * @param {string} name        - raw value from Item_Name input
 * @param {string} amountRaw   - raw string value from Amount input
 * @param {string} category    - selected value from Category select
 * @returns {{ valid: boolean, errors: { name?: string, amount?: string, category?: string } }}
 * Requirements: 1.4, 1.5
 */
function validateForm(name, amountRaw, category) {
  const errors = {};

  // Validate name: trimmed length must be 1–100 characters
  const trimmedName = (typeof name === "string" ? name : "").trim();
  if (trimmedName.length < 1 || trimmedName.length > 100) {
    errors.name = "Item name is required and must be 1–100 characters";
  }

  // Validate amount: must parse to a finite number in range 0.01–999,999,999.99
  const parsedAmount = parseFloat(amountRaw);
  if (!isFinite(parsedAmount) || parsedAmount < 0.01 || parsedAmount > 999999999.99) {
    errors.amount = "Amount must be a number between 0.01 and 999,999,999.99";
  }

  // Validate category: must be one of CATEGORIES
  if (!CATEGORIES.includes(category)) {
    errors.category = "Please select a valid category";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// ---------------------------------------------------------------------------
// Exports (for unit / property-based testing)
// ---------------------------------------------------------------------------

export {
  transactions,
  chartInstance,
  TRANSACTIONS_STORAGE_KEY,
  CATEGORIES,
  CATEGORY_COLORS,
  isLocalStorageAvailable,
  saveTransactions,
  loadTransactions,
  validateForm
};

// ---------------------------------------------------------------------------
// DOMContentLoaded guard — init() will be defined and wired up in a later task
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // init() will be called here once it is implemented in a subsequent task.
});
