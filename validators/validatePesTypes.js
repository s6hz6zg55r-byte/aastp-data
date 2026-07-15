const fs = require("fs");
const path = require("path");

const pesTypes = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../data/pes_types.json"),
        "utf8"
    )
);
const seenIds = new Set();
const structures = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../data/structures.json"),
        "utf8"
    )
);

const structureMap = new Map();

for (const structure of structures.structures) {
    structureMap.set(structure.id, structure);
}

const errors = [];

for (const pes of pesTypes.pes_types) {

    const structure = structureMap.get(pes.structure);

    // Validate that the structure exists
    if (!structure) {
        errors.push(
            `${pes.id}: Unknown structure ${pes.structure}`
        );
        continue;
    }

    // Identify any duplicate PES IDs
    if (seenIds.has(pes.id)) {
        errors.push(
            `${pes.id}: Duplicate PES id`
        );
    }

seenIds.add(pes.id);

    const supportsConstruction =
        structure.supportedProperties !== false;

    // Validate for structures that do not support construction,
    // the construction property must be null
    if (!supportsConstruction &&
        pes.construction !== null) {

        errors.push(
            `${pes.id}: construction must be null for ${structure.id}`
        );
    }

    // Validate that all populated construction properties
    // are supported by the structure
    if (supportsConstruction && pes.construction) {

        for (const [property, value] of Object.entries(
            pes.construction
        )) {

            if (!isValueDefined(value)) {
                continue;
            }

            if (!structure.supportedProperties[property]) {

                errors.push(
                    `${pes.id}: ${property} is populated but not supported by ${structure.id}`
                );
            }
        }
    }
}

function isValueDefined(value) {
    return value !== null && value !== undefined;
}

if (errors.length > 0) {

    console.log("✗ PES Type validation failed");

    errors.forEach(error => {
        console.log(` - ${error}`);
    });

    process.exit(1);

} else {

    console.log("✓ PES Type validation passed");
}