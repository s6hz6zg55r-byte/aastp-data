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

const distanceRulesSchema = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../schemas/distance_rules.schema.json"),
    "utf8"
  )
);

// Register common schema
ajv.addSchema(commonSchema);

// Load data
const distanceRules = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../data/distance_rules.json"),
    "utf8"
  )
);

// Validate
const validate = ajv.compile(distanceRulesSchema);

const valid = validate(distanceRules);

if (valid) {
  console.log("✓ Distance rules schema validation passed");
} else {
  console.log("✗ Distance rules schema validation failed");
  console.log(validate.errors);
}