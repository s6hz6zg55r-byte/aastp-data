const fs = require("fs");
const path = require("path");

const esTypes = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../data/es_types.json"),
        "utf8"
    )
);

const structures = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/structures.json"),"utf8")
);

const structureMap = new Map();

for (const structure of structures.structures) {structureMap.set(structure.id, structure);}

const errors = [];

for (const es of esTypes.es_types) {
    const structure = structureMap.get(es.structure);
    
    // Validate that the structure exists
    if (!structure) {
        errors.push(`${es.id}: Unknown structure ${es.structure}`);
        continue;
    }

    const supportsConstruction = structure.supportedProperties !== false;
    const supportsExposure = structure.supportedExposure !== false;


    // Validate for structures that do not support construction, the construction property must be null
    if (!supportsConstruction && es.construction !== null) {
        errors.push(`${es.id}: construction must be null for ${structure.id}`);
    }
    

    // Validate for structures that do not support exposure, the exposure property must be null
    if (!supportsExposure && es.exposure !== null) {
        errors.push(`${es.id}: exposure must be null for ${structure.id}`);
    }

    // Validate that all properties in construction are supported by the structure
    if (supportsConstruction && es.construction) {
        for (const [property, value] of Object.entries(es.construction)) {
            if (!isValueDefined(value)) {
                continue;
            }
            if (!structure.supportedProperties[property]) {
                errors.push(`${es.id}: ${property} is populated but not supported by ${structure.id}`);
            }
        }
    }

    if (supportsExposure && es.exposure) {
        for (const [property, value] of Object.entries(es.exposure)) {
            if (!isValueDefined(value)) {
                continue;
            }
            if (!structure.supportedExposure[property]) {
                errors.push(`${es.id}: exposure.${property} is populated but not supported by ${structure.id}`);
            }
        }


        
    }

    // Additional validation rules here
}
    

function isValueDefined(value) {
    return value !== null && value !== undefined;
}

if (errors.length > 0) {
    console.log("✗ ES Type validation failed");
    errors.forEach(error => {
        console.log(` - ${error}`);
    });
    process.exit(1);
} else {
    console.log("✓ ES Type validation passed");
}