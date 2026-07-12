const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(__dirname, "..", "data");

// ============================================================================
// Load Data
// ============================================================================

function loadJson(filename){
    return JSON.parse(
        fs.readFileSync(
            path.join(DATA_DIR, filename),
            "utf8"
        )
    );
}

const interactionData = loadJson("interaction_rules.json");

// ============================================================================
// Validation State
// ============================================================================

const errors = [];
const warnings = [];

function error(message) {
  errors.push(message);
}

function warning(message) {
  warnings.push(message);
}

// ============================================================================
// Helpers
// ============================================================================

function isObject(value) {
  return value !== null &&
         typeof value === "object" &&
         !Array.isArray(value);
}

function validateStatusEntry(entry, location) {

  const forbiddenFields = [
    "distanceRule",
    "inputBasis",
    "protectionLevel",
    "constraints"
  ];

  forbiddenFields.forEach(field => {
    if (field in entry) {
      error(
        `${location}: status entry cannot contain '${field}'`
      );
    }
  });
}

function validateDistanceEntry(entry, location) {

  const requiredFields = [
    "distanceRule",
    "inputBasis",
    "protectionLevel",
    "constraints"
  ];

  requiredFields.forEach(field => {
    if (!(field in entry)) {
      error(
        `${location}: missing '${field}'`
      );
    }
  });

  if (
    "constraints" in entry &&
    !Array.isArray(entry.constraints)
  ) {
    error(
      `${location}: constraints must be an array`
    );
  }
}

// ============================================================================
// Interaction Rule Validation
// ============================================================================

function validateInteraction(ruleKey, rule) {

  // --------------------------------------------------------------------------
  // Required Top-Level Fields
  // --------------------------------------------------------------------------

  const requiredFields = [
    "id",
    "source",
    "conditions",
    "effects"
  ];

  requiredFields.forEach(field => {
    if (!(field in rule)) {
      error(
        `${ruleKey}: missing required field '${field}'`
      );
    }
  });

  if (!rule.conditions) return;

  // --------------------------------------------------------------------------
  // Conditions
  // --------------------------------------------------------------------------

  const conditions = rule.conditions;

  if (!conditions.pesType) {
    error(`${ruleKey}: missing conditions.pesType`);
  }

  if (!conditions.esType) {
    error(`${ruleKey}: missing conditions.esType`);
  }

  if (!conditions.orientation) {
    error(`${ruleKey}: missing conditions.orientation`);
  } else {

    if (!conditions.orientation.pes) {
      error(
        `${ruleKey}: missing conditions.orientation.pes`
      );
    }

    if (!conditions.orientation.es) {
      error(
        `${ruleKey}: missing conditions.orientation.es`
      );
    }
  }

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  if (!isObject(rule.effects)) {
    error(`${ruleKey}: effects must be an object`);
    return;
  }

  Object.entries(rule.effects).forEach(
    ([effectId, effectEntries]) => {

      if (!Array.isArray(effectEntries)) {
        error(
          `${ruleKey}.${effectId}: must be an array`
        );
        return;
      }

      const seenEntries = new Set();

      effectEntries.forEach((entry, index) => {

        const location =
          `${ruleKey}.${effectId}[${index}]`;

        // -------------------------------------------------------------------
        // Hazard Required
        // -------------------------------------------------------------------

        if (!entry.hazard) {
          error(`${location}: missing hazard`);
        }

        // -------------------------------------------------------------------
        // Status XOR Distance Rule
        // -------------------------------------------------------------------

        const hasStatus =
          Object.prototype.hasOwnProperty.call(
            entry,
            "status"
          );

        const hasDistanceRule =
          Object.prototype.hasOwnProperty.call(
            entry,
            "distanceRule"
          );

        if (hasStatus && hasDistanceRule) {
          error(
            `${location}: cannot contain both status and distanceRule`
          );
        }

        if (!hasStatus && !hasDistanceRule) {
          error(
            `${location}: must contain either status or distanceRule`
          );
        }

        // -------------------------------------------------------------------
        // Validate Entry Type
        // -------------------------------------------------------------------

        if (hasStatus) {
          validateStatusEntry(
            entry,
            location
          );
        }

        if (hasDistanceRule) {
          validateDistanceEntry(
            entry,
            location
          );
        }

        // -------------------------------------------------------------------
        // Duplicate Entry Detection
        // -------------------------------------------------------------------

        const signature = JSON.stringify(entry);

        if (seenEntries.has(signature)) {
          warning(
            `${location}: duplicate effect entry`
          );
        }

        seenEntries.add(signature);
      });
    }
  );
}

// ============================================================================
// Duplicate Condition Validation
// ============================================================================

function validateDuplicateConditions(interactionRules) {

  const conditionMap = new Map();

  Object.entries(interactionRules).forEach(
    ([ruleKey, rule]) => {

      if (!rule.conditions) return;

      const c = rule.conditions;

      const signature = [
        c.pesType,
        c.esType,
        c.orientation?.pes,
        c.orientation?.es
      ].join("|");

      if (conditionMap.has(signature)) {

        error(
          `${ruleKey}: duplicate interaction conditions with ${conditionMap.get(signature)}`
        );

      } else {

        conditionMap.set(
          signature,
          ruleKey
        );
      }
    }
  );
}

// ============================================================================
// Duplicate Rule ID Validation
// ============================================================================

function validateDuplicateIds(interactionRules) {

  const ids = new Set();

  Object.entries(interactionRules).forEach(
    ([ruleKey, rule]) => {

      if (!rule.id) return;

      if (ids.has(rule.id)) {

        error(
          `${ruleKey}: duplicate interaction id '${rule.id}'`
        );

      } else {

        ids.add(rule.id);
      }
    }
  );
}

// ============================================================================
// Main
// ============================================================================

const interactionRules =
  interactionData.interactionRules;

Object.entries(interactionRules).forEach(
  ([ruleKey, rule]) =>
    validateInteraction(ruleKey, rule)
);

validateDuplicateIds(interactionRules);
validateDuplicateConditions(interactionRules);

// ============================================================================
// Results
// ============================================================================

console.log("\n=== Interaction Rules Validation ===\n");

if (errors.length === 0) {
  console.log("✓ No validation errors found");
} else {
  console.log(`✗ ${errors.length} error(s)\n`);
  errors.forEach(error => console.log(error));
}

if (warnings.length > 0) {

  console.log(
    `\n⚠ ${warnings.length} warning(s)\n`
  );

  warnings.forEach(
    warning => console.log(warning)
  );
}

console.log("\nValidation complete.\n");

process.exit(errors.length > 0 ? 1 : 0);