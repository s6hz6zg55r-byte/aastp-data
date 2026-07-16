Level 1 - Schema Validation
---------------------------
validateStructuresSchema.js (done)
validateEffectsSchema.js 
validateHazardsSchema.js
validatePesTypesSchema.js (done)
validateEsTypesSchema.js (done)

Purpose:
"Is the JSON structurally valid?"

Level 2 - Dataset Validation
----------------------------
validateStructures.js (done)
validateEffects.js (done)
validateHazardClasses.js (done)
validateInteractionRules.js (done)

Purpose:
"Does this individual dataset make sense?"

Level 3 - Repository Validation
-------------------------------
validateReferences.js - Does every referenced ID exist?
validateRepositoryUsage.js - Are there dataasets that exist but are never used?
validateRepositoryCompleteness.js - If something shoud exist, does it exist?

Purpose:
"Do all datasets make sense together?"

Level 4 - Coverage Validation
-----------------------------
validateInteractionCoverage.js - For every valid PES/ES/orientation combination, can teh engine fine a rule?

