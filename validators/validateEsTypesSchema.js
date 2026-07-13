const fs = require("fs");
const path = require("path");

const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");

const ajv = new Ajv2020({
  allErrors: true
});

addFormats(ajv);

// Load schemas
const commonSchema = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../schemas/defs/common.schema.json"),
    "utf8"
  )
);

const esTypesSchema = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../schemas/es_types.schema.json"),
    "utf8"
  )
);

// Register common schema
ajv.addSchema(commonSchema);

// Load data
const esTypes = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/es_types.json"),
    "utf8"
  )
);

// Validate
const validate = ajv.compile(esTypesSchema);

const valid = validate(esTypes);

if (valid) {
  console.log("✓ ES Types schema validation passed");
} else {
  console.log("✗ ES Types schema validation failed");
  console.log(validate.errors);
}