const fs = require("fs");
const path = require("path");

const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

addFormats(ajv);

// Load schemas
const commonSchema = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../schemas/defs/common.schema.json"),
    "utf8"
  )
);

const structuresSchema = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../schemas/structures.schema.json"),
    "utf8"
  )
);

// Register common schema
ajv.addSchema(commonSchema);

// Load data
const structures = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/structures.json"),
    "utf8"
  )
);

// Validate
const validate = ajv.compile(structuresSchema);

const valid = validate(structures);

if (!valid) {
  console.error("\n❌ Structures schema validation failed\n");

  for (const error of validate.errors) {
    console.error(
      `${error.instancePath || "/"} ${error.message}`
    );
  }
  process.exit(1);
}

console.log("✓ Structures schema validation passed");