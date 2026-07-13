const fs = require("fs");

const {buildIdSet} = require("./utils");

function loadJson(path) {
    return JSON.parse(
        fs.readFileSync(path, "utf8")
    );
}

function validateReferences() {

    const errors = [];
    
    const interactions = loadJson("./data/interaction_rules.json");

    const hazards = loadJson("./data/hazard_categories.json");

    const effects = loadJson("./data/effects.json");

    const distanceRules = loadJson("./data/distance_rules.json");

    const formulas = loadJson("./data/formulas.json");

    const pesTypes = loadJson("./data/pes_types.json");

    const esTypes = loadJson("./data/es_types.json");

    validateHazardEffects(
        hazards,
        effects,
        errors
    );

    validateDistanceRuleFormulas(
        distanceRules,
        formulas,
        errors
    );

    validateInteractionReferences(
        interactions,
        hazards,
        effects,
        distanceRules,
        pesTypes,
        esTypes,
        errors
    );

    return {
        valid: errors.length === 0,
        errors
    };
}

function validateHazardEffects(
    hazards,
    effects,
    errors
) {

    const validEffectIds =
        new Set(
            effects.effects.map(
                effect => effect.id
            )
        );

    for (
        const hazard of
        hazards.hazardDivisions
    ) {

        if (!hazard.effects) {
            continue;
        }

        for (
            const effectId of
            hazard.effects
        ) {

            if (
                !validEffectIds.has(
                    effectId
                )
            ) {

                errors.push(
                    `${hazard.id}: references unknown effect '${effectId}'`
                );
            }
        }
    }
}

function validateDistanceRuleFormulas(
    distanceRules,
    formulas,
    errors
) {

    const validFormulaIds = buildIdSet(formulas.formulas);

    for (const rule of Object.values(distanceRules.distanceRules)) {

    const branches =
        rule.calculation?.branches ?? [];

    for (
        const branch of branches
    ) {
        const formula =
            branch.formula;
        if (
            !validFormulaIds.has(formula)
        ) {
            errors.push(
                `${rule.id}/${branch.id}: references unknown formula '${formula}'`
            );
        }
    }
}
}

function validateInteractionReferences(
    interactions,
    hazards,
    effects,
    distanceRules,
    pesTypes,
    esTypes,
    errors
) 
{
    const validEffects = buildIdSet(effects.effects);
    const validHazards = buildIdSet(hazards.hazardDivisions);
    const validDistanceRules = new Set(Object.keys(distanceRules.distanceRules));
    const validPesTypes = buildIdSet(pesTypes.pes_types);
    const validEsTypes = buildIdSet(esTypes.es_types);

    for (const [interactionId, interaction] of Object.entries(interactions.interactionRules)) {
        
        const conditions = interaction.conditions ?? {};
        // Validate PES type
        if (!validPesTypes.has(conditions.pesType)) {
            errors.push(`${interactionId}: unknown PES type '${conditions.pesType}'`);
        }

        // Validate ES type
        if (!validEsTypes.has(conditions.esType)) {
            errors.push(`${interactionId}: unknown ES type '${conditions.esType}'`);
        }

        const effectsBlock = interaction.effects ?? {};
        for (const [effectId, effectRules] of Object.entries(effectsBlock)) {

            // Validate effect reference
            if (!validEffects.has(effectId)) {
                errors.push(`${interactionId}: unknown effect '${effectId}'`);
            }

            // Validate hazard references
            for (const effectRule of effectRules) {
                if (!validHazards.has(effectRule.hazard)) {
                    errors.push(
                `${interactionId}: unknown hazard '${effectRule.hazard}'`
                    );
                }

            // Validate distance rule reference
                if (effectRule.distanceRule && !validDistanceRules.has(effectRule.distanceRule)) {
                    errors.push(`${interactionId}: unknown distance rule '${effectRule.distanceRule}'`);
    
                }
            }
        }
        
    }
}


const result =
    validateReferences();

if (result.valid) {

    console.log(
        "✓ Reference validation passed"
    );

} else {

    console.log(
        "\nReference Validation Errors:"
    );

    result.errors.forEach(
        error => console.log(
            `  - ${error}`
        )
    );

    process.exit(1);
}