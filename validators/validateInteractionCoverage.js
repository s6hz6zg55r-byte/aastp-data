const fs = require("fs");

function loadJson(path) {
    return JSON.parse(
        fs.readFileSync(path, "utf8")
    );
}

// -------------------------
// Load datasets
// -------------------------

const pesTypes =
    loadJson("./data/pes_types.json");

const esTypes =
    loadJson("./data/es_types.json");

const interactions =
    loadJson("./data/interaction_rules.json");

const structures =
    loadJson("./data/structures.json");

const dimensions =
    loadJson("./data/interaction_dimensions.json");

// -------------------------
// Lookup maps
// -------------------------

const structureMap = new Map(
    structures.structures.map(s => [
        s.id,
        s
    ])
);

const orientationTypeMap =
    dimensions.orientationTypes;

// -------------------------
// Helper functions
// -------------------------

function getOrientations(structureId) {

    const structure =
        structureMap.get(structureId);

    if (!structure) {
        return [];
    }

    const orientationType =
        orientationTypeMap[
            structure.orientationType
        ];

    if (!orientationType) {
        return [];
    }

    return orientationType.values;
}

// -------------------------
// Validation state
// -------------------------

const errors = [];

const actualSignatures =
    new Set();

const expectedSignatures =
    new Set();

const duplicateCheck =
    new Map();

// -------------------------
// Build expected signatures
// -------------------------

for (const pes of pesTypes.pes_types) {

    const pesOrientations =
        getOrientations(
            pes.structure
        );

    for (const es of esTypes.es_types) {

        const esOrientations =
            getOrientations(
                es.structure
            );

        for (
            const pesOrientation
            of pesOrientations
        ) {

            for (
                const esOrientation
                of esOrientations
            ) {

                const signature = [
                    pes.id,
                    es.id,
                    pesOrientation,
                    esOrientation
                ].join("|");

                expectedSignatures.add(
                    signature
                );
            }
        }
    }
}

// -------------------------
// Build actual signatures
// -------------------------

for (
    const [ruleKey, rule]
    of Object.entries(
        interactions.interactionRules
    )
) {

    const signature = [
        rule.conditions.pesType,
        rule.conditions.esType,
        rule.conditions.orientation.pes,
        rule.conditions.orientation.es
    ].join("|");

    actualSignatures.add(
        signature
    );

    // Duplicate detection

    if (
        duplicateCheck.has(
            signature
        )
    ) {

        errors.push(
            `Duplicate interaction signature:\n` +
            `  ${signature}\n` +
            `  Existing: ${duplicateCheck.get(signature)}\n` +
            `  Duplicate: ${rule.id}`
        );

    } else {

        duplicateCheck.set(
            signature,
            rule.id
        );
    }
}

// -------------------------
// Missing signatures
// -------------------------

const missing = [];

for (
    const signature
    of expectedSignatures
) {

    if (
        !actualSignatures.has(
            signature
        )
    ) {

        missing.push(
            signature
        );
    }
}

// -------------------------
// Unexpected signatures
// -------------------------

const unexpected = [];

for (
    const signature
    of actualSignatures
) {

    if (
        !expectedSignatures.has(
            signature
        )
    ) {

        unexpected.push(
            signature
        );
    }
}

// -------------------------
// Output
// -------------------------

if (errors.length > 0) {

    console.error(
        "\nDuplicate interaction errors:\n"
    );

    errors.forEach(error =>
        console.error(error + "\n")
    );

    process.exit(1);
}

if (missing.length > 0) {

    console.error(
        "\nMissing interaction definitions:\n"
    );

    missing.forEach(signature =>
        console.error(signature)
    );

    process.exit(1);
}

if (unexpected.length > 0) {

    console.error(
        "\nUnexpected interaction definitions:\n"
    );

    unexpected.forEach(signature =>
        console.error(signature)
    );

    process.exit(1);
}

console.log(
    `Expected signatures: ${expectedSignatures.size}`
);

console.log(
    `Actual signatures: ${actualSignatures.size}`
);

console.log(
    `✓ Coverage validation passed`
);

console.log(
    `${duplicateCheck.size} unique interaction signatures found`
);