const fs = require("fs");
const path = require("path");
const Ajv2020 = require("ajv/dist/2020");

const interactionRules = require("../data/interaction_rules.json");

const interactionRulesSchema = require("../schemas/interaction_rules.schema.json");

const commonSchema = require("../schemas/defs/common.schema.json");

const ajv = new Ajv2020({
    allErrors: true,
    strict: false
});
ajv.addSchema(
    commonSchema,
    "https://aastp.org/schemas/defs/common.schema.json"
);
const addFormats = require("ajv-formats");
addFormats(ajv);
const validate = ajv.compile(interactionRulesSchema);
const valid = validate(interactionRules);

if (!valid) {

    console.error(
        "\nInteraction Rules Schema Errors:\n"
    );

    for (const error of validate.errors) {

        console.error(
            `${error.instancePath || "/"} ${error.message}`
        );
    }

    process.exit(1);
}

console.log(
    "✓ Interaction Rules schema validation passed"
);
