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

const formulasSchema = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../schemas/formulas.schema.json"),
    "utf8"
  )
);

// Register common schema
ajv.addSchema(commonSchema);

// Load data
const formulas = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/formulas.json"),
    "utf8"
  )
);

// Validate
const validate = ajv.compile(formulasSchema);

const valid = validate(formulas);

if (valid) {
  console.log("✓ Formula schema validation passed");
} else {
  console.log("✗ Formula schema validation failed");
  console.log(validate.errors);
}