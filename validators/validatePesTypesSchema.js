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

const pesTypesSchema = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../schemas/pes_types.schema.json"),
    "utf8"
  )
);

// Register common schema
ajv.addSchema(commonSchema);

// Load data
const pesTypes = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/pes_types.json"),
    "utf8"
  )
);

// Validate
const validate = ajv.compile(pesTypesSchema);

const valid = validate(pesTypes);

if (valid) {
  console.log("✓ PES Types schema validation passed");
} else {
  console.log("✗ PES Types schema validation failed");
  console.log(validate.errors);
}