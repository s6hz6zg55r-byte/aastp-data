// validators/utils.js

function addError(errors, message) {
    errors.push(message);
}

function addWarning(warnings, message) {
    warnings.push(message);
}

function validateId(expectedId, actualId, context, errors) {
    if (expectedId !== actualId) {
        addError(
            errors,
            `${context}: key '${expectedId}' does not match id '${actualId}'`
        );
    }
}

function validateRange(min, max, context, errors) {
    if (
        typeof min !== "number" ||
        typeof max !== "number"
    ) {
        addError(
            errors,
            `${context}: range values must be numeric`
        );
        return;
    }

    if (min > max) {
        addError(
            errors,
            `${context}: min value ${min} exceeds max value ${max}`
        );
    }
}

function validateSource(source, context, errors) {
    if (!source) {
        addError(errors, `${context}: missing source block`);
        return;
    }

    if (!source.document) {
        addError(errors, `${context}: missing source.document`);
    }

    if (!source.version) {
        addError(errors, `${context}: missing source.version`);
    }

    if (!source.reference) {
        addError(errors, `${context}: missing source.reference`);
        return;
    }

    const ref = source.reference;

    if (typeof ref !== "object") {
        addError(errors,`${context}: source.reference must be an object`);
    return;
    }
    if (ref.Part !== undefined && typeof ref.Part !== "string") {
        addError(errors,`${context}: source.reference.Part must be a string`);
    }

    if (ref.Section !== undefined && typeof ref.Section !== "string") {
        addError(errors,`${context}: source.reference.Section must be a string`);
    }

    if (ref.Table !== undefined && typeof ref.Table !== "string") {
        addError(errors,`${context}: source.reference.Table must be a string`);
    }
}

//
function validateTraceability(
    traceability,
    context,
    errors
) {

    if (!traceability) {
        addError(errors,`${context}: missing traceability`);
        return;
    }

    const required = [
        "Part",
        "Section",
        "Table",
        "Row"
    ];

    for (const field of required) {

        if (typeof traceability[field] !== "string") {
            addError(errors,`${context}: traceability.${field} must be a string`);
        }
    }
}

// Validate that the hazard source has the required fields
function validateHazardSource(source, context, errors) {

    if (!source) {
        errors.push(
            `${context}: missing source block`
        );
        return;
    }

    if (
        typeof source.document !== "string" ||
        source.document.trim() === ""
    ) {
        errors.push(
            `${context}: missing source.document`
        );
    }

    if (
        typeof source.paragraph !== "string" ||
        source.paragraph.trim() === ""
    ) {
        errors.push(
            `${context}: missing source.paragraph`
        );
    }
}




function isNonEmptyString(value) {
    return (
        typeof value === "string" &&
        value.trim().length > 0
    );
}

// Build a set of IDs from a collection of objects or an object with keys
function buildIdSet(collection) {
    if (Array.isArray(collection)) {
        return new Set(
            collection.map(item => item.id)
        );
    }
    return new Set(
        Object.keys(collection)
    );
}

function validateUniqueIds(collection, entityName, errors) {
    const seen = new Set();
    for (const item of collection) {
        if (seen.has(item.id)) {
            errors.push(
                `${entityName}: duplicate id '${item.id}'`
            );
        } else {
            seen.add(item.id);
        }
    }
}

function validateUniqueProperty(collection, property, entityName, errors) {

    const seen = new Map();
    for (const item of collection) {
        const value = item[property];
        if (value === undefined || value === null) {
            continue;
        }
        if (seen.has(value)) {
            errors.push(
                `${entityName}: duplicate ${property} '${value}' in '${seen.get(value)}' and '${item.id}'`
            );
        } else {
            seen.set(
                value,
                item.id
            );
        }
    }
}

module.exports = {
    addError,
    addWarning,
    validateId,
    validateRange,
    validateSource,
    validateTraceability,
    validateHazardSource,
    isNonEmptyString,
    buildIdSet,
    validateUniqueIds,
    validateUniqueProperty
};