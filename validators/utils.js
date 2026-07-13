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

    if (ref.Part === undefined) {
        addError(errors, `${context}: missing source.reference.Part`);
    }

    if (ref.Section === undefined) {
        addError(errors, `${context}: missing source.reference.Section`);
    }

    if (ref.Table === undefined) {
        addError(errors, `${context}: missing source.reference.Table`);
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

module.exports = {
    addError,
    addWarning,
    validateId,
    validateRange,
    validateSource,
    validateHazardSource,
    isNonEmptyString
};