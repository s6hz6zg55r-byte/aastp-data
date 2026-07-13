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