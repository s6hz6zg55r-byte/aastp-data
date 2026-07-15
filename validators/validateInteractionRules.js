const fs = require("fs");

function loadJson(path) {
    return JSON.parse(
        fs.readFileSync(path, "utf8")
    );
}

function buildIdSet(items) {
    return new Set(items.map(item => item.id));
}

const errors = [];
    
const interactions = loadJson("./data/interaction_rules.json");

const pesTypes = loadJson("./data/pes_types.json");

const esTypes = loadJson("./data/es_types.json");

const effects = loadJson("./data/effects.json");

const hazards = loadJson("./data/hazard_categories.json");

const distanceRules = loadJson("./data/distance_rules.json");

const protectionLevels = loadJson("./data/protection_levels.json");

const constraints = loadJson("./data/constraints.json");

const hazardMap = new Map(hazards.hazardDivisions.map(h => [h.id,h])); 

const pesIds = buildIdSet(pesTypes.pes_types);
const esIds = buildIdSet(esTypes.es_types);
const effectIds = buildIdSet(effects.effects);
const hazardIds = buildIdSet(hazards.hazardDivisions);
const distRuleIds = buildIdSet(distanceRules.distanceRules);
const protLevelIds = buildIdSet(protectionLevels.protection_levels);
const constraintIds = buildIdSet(constraints.constraints);

const validStatuses = new Set(["N_A", "NO_QD"]);

//console.log(`PES: ${pesIds.size}`);
//console.log(`ES: ${esIds.size}`);
//console.log(`Effects: ${effectIds.size}`);
//console.log(`Hazards: ${hazardIds.size}`);
//console.log(`Dist Rules: ${distRuleIds.size}`);
//console.log(`Prot Levels: ${protLevelIds.size}`);
//console.log(`Constraints: ${constraintIds.size}`);

for (const [ruleKey, rule] of Object.entries(interactions.interactionRules)) {

    // Check 1 - Confirm that the Key matches the ID
    if (ruleKey !== rule.id) {
        errors.push(
            `${ruleKey}: key does not match rule id ${rule.id}`
        );
    }

    // Check 2 - Confirm that the PES for the interaction exists
    if (!pesIds.has(rule.conditions.pesType)) {
        errors.push(
            `${rule.id}: unknown PES ${rule.conditions.pesType}`
        );
    }

    // Check 3 - Confrim that the ES for the interaction exists
    if (!esIds.has(rule.conditions.esType)) {
        errors.push(
            `${rule.id}: unknown ES ${rule.conditions.esType}`
        );
    }

    // Loop through the effects attributed to the interaction
    for (const [effectId, entries] of Object.entries(rule.effects)) {
        
        // Check 4 - Confirm that the effects attributed to the interaction exists
        if (!effectIds.has(effectId)) {
            errors.push(
                `${rule.id}: Unknown effect ${effectId}`
            );
        }

        for (const entry of entries) {

            // Check 5 - Confirm that the hazards linked to the effect exists
            if (!hazardIds.has(entry.hazard)) {
                errors.push(
                    `${rule.id}: Unknown hazard ${entry.hazard}`
                );
            }
            // Check 6 - Confirm that, where applicable, the distance rule exists
            if (entry.protectionLevel && !protLevelIds.has(entry.protectionLevel)) {
                errors.push(
                    `${rule.id}: Unknown protection level ${entry.protectionLevel}`
                );
            }
            // Check 7 - Confirm that, where applicable, the protection level exists
            if (entry.distanceRule && !distRuleIds.has(entry.distanceRule)) {
                if (!protLevelIds.has(entry.protectionLevel)) {
                    errors.push(
                        `${rule.id}: Unknown protection level ${entry.protectionLevel}`
                    );
                }
            }
            // Check 8 - Confirm that the constraints exists for this interaction
            if (entry.constraints) {
                for (const constraintId of entry.constraints) {
                    if (!constraintIds.has(constraintId)) {
                        errors.push(
                            `${rule.id}: Unknown constraint ${constraintId}`
                        );
                    }
                }
            }
            // Check 9 - Confirm that the hazard and effect are actually related
            const hazard = hazardMap.get(entry.hazard);
            if (hazard) {
                if (!hazard.effects.includes(effectId)) {
                    errors.push(
                        `${rule.id}: ${entry.hazard} does not support ${effectId}`
                    );
                }
            }
            // Check 10 - Confirm that a quantity statis (NEQ or MCE) is supported by a hazard category
            if (entry.inputBasis && !hazard.supportedQuantityBasis.includes(entry.inputBasis)) {
                errors.push(
                    `${rule.id}: ${entry.hazard} does not support quantity basis ${entry.inputBasis}`
                );
            }
            // Check 11 - Confirm that no QD parameters exist if a status (No QD or N/A) has been set
            if (entry.status) {
                if (entry.distanceRule) {
                    errors.push(
                        `${rule.id}: ${entry.hazard} contains both status and distanceRule`
                    );
                }
                if (entry.inputBasis) {
                    errors.push(
                        `${rule.id}: ${entry.hazard} contains both status and inputBasis`
                    );
                }
                if (entry.protectionLevel) {
                    errors.push(
                        `${rule.id}: ${entry.hazard} contains both status and protectionLevel`
                    );
                }
                if (entry.constraints && entry.constraints.length > 0) {
                    errors.push(
                        `${rule.id}: ${entry.hazard} contains both status and constraints`
                    );
                }
            }
            // Check 12 - Confirm that if no status has been set, all QD calculation paramters are in place
            if (!entry.status) {
                if (!entry.distanceRule) {
                    errors.push(
                        `${rule.id}: ${entry.hazard} missing distanceRule`
                    );
                }
                if (!entry.inputBasis) {
                    errors.push(
                        `${rule.id}: ${entry.hazard} missing inputBasis`
                    );
                }
                if (!entry.protectionLevel) {
                    errors.push(
                        `${rule.id}: ${entry.hazard} missing protectionLevel`
                    );
                }
            }
            // Check 13 - Confirm that if a statis is set that it is valid
            if (entry.status && !validStatuses.has(entry.status)) {
                errors.push(
                    `${rule.id}: Invalid status ${entry.status}`
                );
            }

        }
    }



}

if (errors.length > 0) {

    console.error(
        "\nInteraction Rules Validation Errors:\n"
    );

    errors.forEach(error =>
        console.error(`- ${error}`)
    );

    process.exit(1);
} else {

    console.log("✓ Interaction Rules validation passed");
}
