# AASTP Data Repository – Schema Conventions

## Purpose

This document defines the conventions used throughout the AASTP Data Repository.

The objective is to ensure that all datasets:

* Follow a consistent structure.
* Remain traceable to source publications.
* Can be validated automatically.
* Support future expansion without breaking existing implementations.
* Can be consumed by multiple applications through a common service layer.

These conventions apply to all JSON datasets within the repository.

---

# 1. Design Principles

## 1.1 Data First

JSON files represent authoritative data.

The data layer shall not contain executable logic.

Calculations, rule evaluation, and application-specific behaviour belong within the service layer.

---

## 1.2 Traceability

All information derived from a source publication shall be traceable back to its origin.

Traceability information shall be retained at the lowest practical level within the dataset.

---

## 1.3 Stable References

Identifiers shall be treated as permanent references.

Once published, identifiers should not be changed unless absolutely necessary.

Applications should reference records by identifier rather than by name.

---

## 1.4 Extensibility

Datasets shall be designed to allow:

* Additional records
* Additional fields
* Additional standards
* National variations

without requiring structural redesign.

---

## 1.5 Separation of Responsibilities

Validation is performed at multiple layers.

| Layer             | Responsibility                                   |
| ----------------- | ------------------------------------------------ |
| JSON Schema       | Structure, required fields, types                |
| Dataset Validator | Domain rules, overlap detection, coverage checks |
| Service Layer     | Rule evaluation and calculations                 |
| Applications      | Presentation and user interaction                |

---

# 2. Standard Dataset Structure

All datasets shall follow the same top-level structure.

```json
{
  "schemaVersion": "1.0.0",
  "metadata": {},
  "<dataset>": []
}
```

Example:

```json
{
  "schemaVersion": "1.0.0",
  "metadata": {},
  "distanceRules": []
}
```

---

# 3. Schema Versioning

Each dataset shall include a schema version.

```json
{
  "schemaVersion": "1.0.0"
}
```

The schema version identifies the structure of the dataset.

It does not represent the version of the source publication.

Semantic versioning shall be adopted such that:
1.0.X (Patch) - Used for bug fixes, documentation corrections, performance improvements. Changes do no alter behaviour or break compatibility
1.X.0 (Minor) - Used for new functionality whilst maintaining backward compatability. Examples include: new hazard classificaiton, new ES or PES tyeps, new optional fields to a schema
X.0.0 (Major) - Introduces breaking changes. Examples include: renaming fields, changing JSON structure, removing properties, altering API response in incompatabile ways

---

# 4. Metadata

Every dataset shall include a metadata object.

## Structure

```json
{
  "metadata": {
    "standard": "AASTP-1",
    "edition": "Edition D Version 1",
    "chapter": "Chapter 1",
    "dataset": "distance_rules",
    "version": "1.0.0",
    "lastUpdated": "2026-07-13"
  }
}
```

## Field Definitions

| Field       | Purpose                     |
| ----------- | --------------------------- |
| standard    | Source publication          |
| edition     | Publication edition         |
| chapter     | Relevant chapter or section |
| dataset     | Dataset identifier          |
| version     | Dataset version             |
| lastUpdated | Last modification date      |

---

# 5. Identifiers

## Format

Identifiers should be concise and stable.

Examples:

```text
FORM001
BD01
ES001
PES001
HC001
EFF001
```

## Requirements

Identifiers:

* Must be unique within a dataset.
* Must not be reused.
* Must remain stable once published.
* Should not contain spaces.
* Should not contain special characters.

---

# 6. Traceability

## Purpose

Traceability provides a direct link between a record and its originating source.

## Structure

```json
{
  "traceability": {
    "Part": "1",
    "Section": "II",
    "Table": "5",
    "Row": "BD1"
  }
}
```

## Field Definitions

| Field   | Description                   |
| ------- | ----------------------------- |
| Part    | Publication part              |
| Section | Publication section           |
| Table   | Table or figure reference     |
| Row     | Row, note, or entry reference |

## Guidance

Traceability should identify the most specific source available.

Where a row reference does not exist, the field may be left blank.

Example:

```json
{
  "traceability": {
    "Part": "1",
    "Section": "II",
    "Table": "4",
    "Row": ""
  }
}
```

---

# 7. Dataset Collections

Collections shall be represented as arrays.

Preferred:

```json
{
  "distanceRules": [
    {
      "id": "BD01"
    }
  ]
}
```

Not preferred:

```json
{
  "BD01": {}
}
```

Array-based collections:

* Support schema validation more easily.
* Support ordering.
* Simplify iteration.
* Improve interoperability.

---

# 8. Cross-File References

Relationships between datasets shall be expressed using identifiers.

Example:

```json
{
  "formula": "FORM001"
}
```

Applications shall resolve references using the corresponding dataset.

Direct duplication of referenced data should be avoided.

---

# 9. Validation Requirements

## JSON Schema Validation

JSON Schema shall validate:

* Required fields
* Data types
* Structural consistency
* Pattern matching

## Custom Validator Validation

Custom validators shall validate:

* Duplicate identifiers
* Overlapping ranges
* Coverage gaps
* Invalid references
* Domain-specific rules

Example:

* Formula identifier exists.
* NEQ ranges do not overlap.
* Rule branches provide complete coverage.

---

# 10. Repository Structure

Recommended structure:

```text
repository/
│
├── data/
│   ├── formulas.json
│   ├── distance_rules.json
│   ├── hazard_classes.json
│   ├── es_types.json
│   └── pes_types.json
│
├── schemas/
│   ├── defs/
│   │   └── common.schema.json
│   ├── formulas.schema.json
│   └── distance_rules.schema.json
│
├── validators/
│   ├── utils.js
│   ├── validateFormulas.js
│   └── validateDistanceRules.js
│
└── docs/
    └── schema-conventions.md
```

---

# 11. Future Compatibility

New datasets should adopt these conventions wherever practical.

Shared structures such as:

* metadata
* traceability
* applicability
* identifiers

should be defined once and reused through shared schema definitions.

This approach reduces duplication, improves consistency, and simplifies maintenance as the repository expands.
