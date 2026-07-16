const fs = require("fs");
const path = require("path");

const structures = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/structures.json"),
    "utf8"
  )
);

const interactionDimensions = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/interaction_dimensions.json"),
    "utf8"
  )
);

let hasErrors = false;

/* --------------------------------------------------
 * Helper
 * -------------------------------------------------- */

function error(message) {
  console.error(`❌ ${message}`);
  hasErrors = true;
}

/* --------------------------------------------------
 * Build lookup tables
 * -------------------------------------------------- */

const orientationTypes = new Set(
  Object.keys(interactionDimensions.orientationTypes)
);

/* --------------------------------------------------
 * Duplicate Detection
 * -------------------------------------------------- */

const ids = new Set();
const codes = new Set();

for (const structure of structures.structures) {

  if (ids.has(structure.id)) {
    error(`Duplicate structure id: ${structure.id}`);
  }

  ids.add(structure.id);

  if (codes.has(structure.code)) {
    error(`Duplicate structure code: ${structure.code}`);
  }

  codes.add(structure.code);
}

/* --------------------------------------------------
 * Orientation References
 * -------------------------------------------------- */

for (const structure of structures.structures) {

  if (!orientationTypes.has(structure.orientationType)) {
    error(
      `Structure ${structure.id} references unknown orientation type ${structure.orientationType}`
    );
  }
}

/* --------------------------------------------------
 * supportedProperties Validation
 * -------------------------------------------------- */

const expectedProperties = [
  "protectionLevel",
  "headwall",
  "barricaded",
  "roofType",
  "aperture"
];

for (const structure of structures.structures) {

  const props = structure.supportedProperties;

  if (props === false) {
    continue;
  }

  for (const key of expectedProperties) {

    if (!(key in props)) {
      error(
        `${structure.id} missing supportedProperties.${key}`
      );
    }
  }
}

/* --------------------------------------------------
 * supportedExposure Validation
 * -------------------------------------------------- */

for (const structure of structures.structures) {

  const exposure = structure.supportedExposure;

  if (exposure === false) {
    continue;
  }

  if (!("category" in exposure)) {
    error(
      `${structure.id} missing supportedExposure.category`
    );
  }

  if (!("level" in exposure)) {
    error(
      `${structure.id} missing supportedExposure.level`
    );
  }
}

/* --------------------------------------------------
 * Category Validation
 * -------------------------------------------------- */

const validCategories = [
  "explosives_facility",
  "personnel_facility",
  "transport_route",
  "vulnerable_structure",
  "utility",
  "infrastructure"
];

for (const structure of structures.structures) {

  if (!validCategories.includes(structure.category)) {

    error(
      `${structure.id} contains unknown category '${structure.category}'`
    );
  }
}

/* --------------------------------------------------
 * Result
 * -------------------------------------------------- */

if (hasErrors) {

  console.error(
    "\n❌ Structure validation failed"
  );

  process.exit(1);
}

console.log(
  "✓ Structure validation passed"
);