const fs = require("fs");

const {
    validateId,
    validateSource,
    validateHazardSource,
    isNonEmptyString
} = require("./utils");

const VALID_TYPES = [
    "hazard_division",
    "storage_subdivision"
];

const VALID_QUANTITY_BASIS = [
    "NEQ",
    "MCE"
];

function validateHazardClasses(filePath) {
    const data = JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

    const errors = [];
    const warnings = [];

    if (!data.schemaVersion) {
        errors.push("Missing schemaVersion");
    }

    validateMetadata(
        data.metadata,
        errors
    );

    if (!Array.isArray(data.hazardDivisions)) {
        errors.push(
            "hazardDivisions must be an array"
        );
        return {
            valid: false,
            errors,
            warnings
        };
    }

    validateUniqueIds(
        data.hazardDivisions,
        errors
    );

    for (const hazard of data.hazardDivisions) {

        validateHazardDivision(
            hazard,
            errors,
            warnings
        );
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

function validateMetadata(metadata, errors) {

    if (!metadata) {
        errors.push("Missing metadata block");
        return;
    }

    const required = [
        "standard",
        "edition",
        "chapter",
        "dataType",
        "version"
    ];

    for (const field of required) {

        if (!metadata[field]) {
            errors.push(
                `Metadata missing '${field}'`
            );
        }
    }
}

function validateUniqueIds(
    hazardDivisions,
    errors
) {
    const ids = new Set();

    for (const hazard of hazardDivisions) {

        if (ids.has(hazard.id)) {
            errors.push(
                `Duplicate id '${hazard.id}'`
            );
        }

        ids.add(hazard.id);
    }
}

function validateHazardDivision(
    hazard,
    errors,
    warnings
) {

    validateId(
        hazard.id,
        hazard.id,
        `Hazard ${hazard.id}`,
        errors
    );

    if (!isNonEmptyString(hazard.code)) {
        errors.push(
            `${hazard.id}: missing code`
        );
    }

    if (!isNonEmptyString(hazard.name)) {
        errors.push(
            `${hazard.id}: missing name`
        );
    }

    if (!isNonEmptyString(hazard.description)) {
        errors.push(
            `${hazard.id}: missing description`
        );
    }

    if (
        !VALID_TYPES.includes(hazard.type)
    ) {
        errors.push(
            `${hazard.id}: invalid type '${hazard.type}'`
        );
    }

    validateHazardSource(
        hazard.source,
        `Hazard ${hazard.id}`,
        errors
    );



    validateQuantityBasis(
        hazard,
        errors
    );

    validateEffectsArray(
        hazard,
        errors
    );

    validateParentDivision(
        hazard,
        warnings
    );
}

function validateQuantityBasis(
    hazard,
    errors
) {

    if (
        !Array.isArray(
            hazard.supportedQuantityBasis
        )
    ) {
        errors.push(
            `${hazard.id}: supportedQuantityBasis must be an array`
        );
        return;
    }

    for (const basis of hazard.supportedQuantityBasis) {

        if (
            !VALID_QUANTITY_BASIS.includes(
                basis
            )
        ) {
            errors.push(
                `${hazard.id}: invalid quantity basis '${basis}'`
            );
        }
    }
}

function validateEffectsArray(
    hazard,
    errors
) {

    if (!Array.isArray(hazard.effects)) {
        errors.push(
            `${hazard.id}: effects must be an array`
        );
        return;
    }

    if (hazard.effects.length === 0) {
        errors.push(
            `${hazard.id}: effects array cannot be empty`
        );
    }
}

function validateParentDivision(
    hazard,
    errors
) {

    const expected =
        expectedParent(hazard.code);

    if (
        hazard.type === "hazard_division" &&
        expected !== null
    ) {

        errors.push(
            `${hazard.id}: hazard_division should not have subdivision code '${hazard.code}'`
        );
    }

    if (
        hazard.type === "storage_subdivision" &&
        expected === null
    ) {

        errors.push(
            `${hazard.id}: storage_subdivision must have a parent division`
        );
    }

    if (
        hazard.parentDivision !== expected
    ) {

        errors.push(
            `${hazard.id}: expected parentDivision '${expected}' but found '${hazard.parentDivision}'`
        );
    }
}

function expectedParent(code) {

    const parts = code.split(".");

    // Top-level divisions
    if (parts.length === 2) {
        return null;
    }

    // Storage subdivisions
    return `${parts[0]}.${parts[1]}`;
}

const filePath =
    process.argv[2] ??
    "./data/hazard_categories.json";

const result =
    validateHazardClasses(filePath);

if (result.valid) {
    console.log(
        "✓ Hazard category validation passed"
    );
}

if (result.warnings.length) {

    console.log("\nWarnings:");

    result.warnings.forEach(w =>
        console.log(`  - ${w}`)
    );
}

if (result.errors.length) {

    console.log("\nErrors:");

    result.errors.forEach(e =>
        console.log(`  - ${e}`)
    );

    process.exit(1);
}