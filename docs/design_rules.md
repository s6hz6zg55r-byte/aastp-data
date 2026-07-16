AASTP JSON Design Rules

- All datasets use schemaVersion.
- All datasets contain metadata.
- Cross-dataset references use IDs.
- Source metadata describes dataset origin.
- Traceability identifies the exact AASTP location.
- Formula references use FORMxxx identifiers.
- IDs are immutable.

code to run the schema validators is: npm run validate:es-types-schema
code to run a validator is: node ./validator/validateEffects.js

A Useful Repository Principle
As the project grows, you'll save yourself a lot of maintenance effort if you follow this rule:
If AJV can validate it,
AJV should validate it.
Only write custom validator code when:
AJV cannot know the answer.
Examples:
Check	                Schema	            Validator
Field exists	            ✓	
Field type	                ✓	
Regex pattern	            ✓	
Enum values	                ✓	
Required metadata	        ✓	
Cross-file references		                    ✓
Duplicate IDs		                            ✓
Overlapping rules		                        ✓
Missing hazard effect mapping		            ✓


Looking at where your repository is heading, I would actually consider creating a single reusable definition in common.schema.json for:
"$defs": {
  "metadata": { ... },
  "source": { ... }
}
and then gradually remove metadata checks from all business validators:
validateEsTypes.js
validatePesTypes.js
validateHazardCategories.js
validateEffects.js
validateInteractions.js
That keeps the validators focused on domain logic rather than repeating structural checks already enforced by AJV. It also means that when you change metadata again in the future, you only update one schema definition instead of five or six validators.

The next thre validatiors I'm working on are the 
 - validateInteractionCoverage.js
 - validateRepositoryUsage.js
 - validateRepositoryCompleteness.js