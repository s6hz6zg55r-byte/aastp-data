const fs = require("fs");

const {
    validateId,
    validateSource,
    validateUniqueIds,
    validateUniqueProperty,
    isNonEmptyString
} = require("./utils");

const VALID_CATEGORIES = [
    "blast_effect",
    "fragment_effect",
    "thermal_effect",
    "fire_effect",
    "local_effect"
];

function loadJson(path) {

    return JSON.parse(
        fs.readFileSync(path, "utf8")
    );
}

function validateEffects() {

    const errors = [];

    const data =
        loadJson(
            "./data/effects.json"
        );

    validateDatasetStructure(
        data,
        errors
    );

    if (
        Array.isArray(
            data.effects
        )
    ) {

        validateUniqueIds(
            data.effects,
            errors
        );

        for (
            const effect of
            data.effects
        ) {

            validateEffect(
                effect,
                errors
            );
        }
    }

    return {
        valid:
            errors.length === 0,
        errors
    };
}

function validateDataset(
    data,
    errors
) {

    if (!data.schemaVersion) {
        errors.push(
            "Missing schemaVersion"
        );
    }

    if (!data.metadata) {
        errors.push(
            "Missing metadata"
        );
    }

    if (!Array.isArray(data.effects)) {
        errors.push(
            "effects must be an array"
        );
        return;
    }

    if (data.effects.length === 0) {
        errors.push(
            "effects array cannot be empty"
        );
    }
}

function validateEffect(
    effect,
    errors
) {

    if (!effect.id) {
        errors.push(
            "Effect: missing id"
        );
    }

    if (
        !isNonEmptyString(
            effect.code
        )
    ) {

        errors.push(
            `${effect.id}: missing code`
        );
    }

    if (
        !isNonEmptyString(
            effect.name
        )
    ) {

        errors.push(
            `${effect.id}: missing name`
        );
    }

    if (
        !isNonEmptyString(
            effect.description
        )
    ) {

        errors.push(
            `${effect.id}: missing description`
        );
    }

    if (
        !VALID_CATEGORIES.includes(
            effect.category
        )
    ) {

        errors.push(
            `${effect.id}: invalid category '${effect.category}'`
        );
    }

    if (
        typeof effect.requiresQD !==
        "boolean"
    ) {

        errors.push(
            `${effect.id}: requiresQD must be boolean`
        );
    }

    if (
        typeof effect.active !==
        "boolean"
    ) {

        errors.push(
            `${effect.id}: active must be boolean`
        );
    }

    validateSource(
        effect.source,
        effect.id,
        errors
    );
}

function validateDatasetStructure(data, errors) {

    if (!data.schemaVersion) {
        errors.push(
            "Missing schemaVersion"
        );
    }

    if (!data.metadata) {
        errors.push(
            "Missing metadata"
        );
    }

    if (!Array.isArray(data.effects)) {
        errors.push(
            "effects must be an array"
        );
    }
}

const result =
    validateEffects();

if (result.valid) {

    console.log(
        "✓ Effects validation passed"
    );

} else {

    console.error(
        "Effects Validation Errors:"
    );

    result.errors.forEach(
        error =>
            console.error(
                `  - ${error}`
            )
    );

    process.exit(1);
}