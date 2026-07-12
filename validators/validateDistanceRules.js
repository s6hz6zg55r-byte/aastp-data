// validators/validateDistanceRules.js

import fs from "fs";
const stats = {
    rules: 0,
    branches: 0,
    errors: 0,
    warnings: 0
};

const VALID_FORMULAS = [
    "cube_root",
    "cube_root_squared",
    "square_root"
];

const VALID_TRANSFORMATIONS = [
    "round_up_metre"
];

function validateDistanceRules(filePath) {
    const errors = [];
    const warnings = [];

    const data = JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

    const rules = data.distanceRules;

    if (!rules) {
        errors.push("Missing distanceRules object");
        return { errors, warnings };
    }

    for (const [key, rule] of Object.entries(rules)) {
        stats.rules++;

        const branchCount =
            rule.calculation?.branches?.length ?? 0;

        stats.branches += branchCount;

        validateRuleKey(key, rule, errors);

        validateRequiredFields(rule, errors);

        validateApplicability(rule, errors);

        validateCalculation(rule, errors);

        validateTransformations(rule, errors);

        validateBranches(rule, errors);
    }

    return {
        errors,
        warnings,
        stats
    };
}
function validateRuleKey(key, rule, errors) {

    if (key !== rule.id) {
        errors.push(
            `${key}: key does not match rule.id (${rule.id})`
        );
    }
}
function validateRequiredFields(rule, errors) {

    const required = [
        "id",
        "name",
        "applicability",
        "source",
        "calculation"
    ];
    for (const field of required) {

        if (!(field in rule)) {
            errors.push(
                `${rule.id}: missing '${field}'`
            );
        }
    }
}
function validateApplicability(rule, errors) {
    const app = rule.applicability;
    if (!app) return;

    if (app.minNEQ == null) {
        errors.push(
            `${rule.id}: missing applicability.minNEQ`
        );
    }

    if (app.maxNEQ == null) {
        errors.push(
            `${rule.id}: missing applicability.maxNEQ`
        );
    }

    if (
        app.minNEQ != null &&
        app.maxNEQ != null &&
        app.minNEQ >= app.maxNEQ
    ) {
        errors.push(
            `${rule.id}: minNEQ must be less than maxNEQ`
        );
    }
}
function validateCalculation(rule, errors) {
    const calc = rule.calculation;
    if (!calc) return;
    if (calc.type !== "conditional") {
        errors.push(
            `${rule.id}: unsupported calculation type '${calc.type}'`
        );
    }
    if (!Array.isArray(calc.branches)) {
        errors.push(
            `${rule.id}: branches must be an array`
        );
    }
}
function validateTransformations(rule, errors) {

    if (!rule.transformations) return;

    for (const transformation of rule.transformations) {

        if (
            !VALID_TRANSFORMATIONS.includes(
                transformation
            )
        ) {
            errors.push(
                `${rule.id}: invalid transformation '${transformation}'`
            );
        }
    }
}
function validateBranches(rule, errors) {

    const branches =
        rule.calculation?.branches ?? [];

    const sequences = [];

    for (const branch of branches) {

        sequences.push(branch.sequence);

        validateBranchFormula(
            rule.id,
            branch,
            errors
        );

        validateBranchCoefficient(
            rule.id,
            branch,
            errors
        );
    }

    validateBranchSequence(
        rule.id,
        sequences,
        errors
    );

    validateBranchCoverage(
        rule,
        errors
    )

    validateBranchRanges(
        rule,
        errors
    );
}
function validateBranchFormula(
    ruleId,
    branch,
    errors
) {

    if (
        !VALID_FORMULAS.includes(
            branch.formula
        )
    ) {
        errors.push(
            `${ruleId}/${branch.id}: invalid formula '${branch.formula}'`
        );
    }
}
function validateBranchCoefficient(
    ruleId,
    branch,
    errors
) {

    const coeff =
        branch.parameters?.coefficient;

    if (typeof coeff !== "number") {

        errors.push(
            `${ruleId}/${branch.id}: coefficient must be numeric`
        );

        return;
    }

    if (coeff <= 0) {

        errors.push(
            `${ruleId}/${branch.id}: coefficient must be > 0`
        );
    }
}
function validateBranchSequence(
    ruleId,
    sequences,
    errors
) {

    sequences.sort((a, b) => a - b);

    for (let i = 0; i < sequences.length; i++) {

        const expected = i + 1;

        if (sequences[i] !== expected) {

            errors.push(
                `${ruleId}: expected sequence ${expected}, found ${sequences[i]}`
            );
        }
    }
}
function validateBranchRanges(rule, errors) {

    const branches =
        rule.calculation.branches;

    const ranges = branches.map(branch => {

        const neq = branch.when?.neq;

        return {
            id: branch.id,
            gte: neq?.gte,
            lte: neq?.lte,
            lt: neq?.lt
        };
    });

    for (let i = 0; i < ranges.length - 1; i++) {

        const current = ranges[i];
        const next = ranges[i + 1];

        const currentMax =
            current.lte ?? current.lt;

        const nextMin =
            next.gte;

        if (
            current.lte !== undefined &&
            nextMin === currentMax
        ) {

            errors.push(
                `${rule.id}: overlap detected between ${current.id} and ${next.id}`
            );
        }
    }
}
function validateBranchCoverage(rule, errors){
    const ranges = [];
    const branches = rule.calculation?.branches ?? [];
    // Return if there is only one branch
    if (branches.length === 0) {
        return;
    }
    for (const branch of rule.calculation.branches) {

        const neq = branch.when?.neq;

        ranges.push({
            id: branch.id,
            min: neq.gte,
            max:
                neq.lte ??
                neq.lt,
            maxInclusive:
                neq.lte !== undefined
        });
    }
    for (let i = 0; i < ranges.length - 1; i++) {

        const current = ranges[i];
        const next = ranges[i + 1];

        const currentEnd =
            current.maxInclusive
                ? current.max + 1
                : current.max;

        if (currentEnd < next.min) {

            errors.push(
                `${rule.id}: gap between ${current.id} and ${next.id}`
            );
        }
    }
    ranges.sort((a, b) => a.min - b.min);
    const appMin = rule.applicability.minNEQ;
    const appMax = rule.applicability.maxNEQ;
    if (ranges[0].min !== appMin) {
        errors.push(
            `${rule.id}: first branch begins at ${ranges[0].min} but applicability starts at ${appMin}`
        );
    }
    const last = ranges[ranges.length - 1];
    if (last.max !== appMax) {
        errors.push(
            `${rule.id}: last branch ends at ${last.max} but applicability ends at ${appMax}`
        );
    }
    for (let i = 0; i < ranges.length - 1; i++) {

        const current = ranges[i];
        const next = ranges[i + 1];

        if (current.max > next.min) {

            errors.push(
                `${rule.id}: overlap between ${current.id} and ${next.id}`
            );

            continue;
        }

        if (
            current.max === next.min &&
            current.maxInclusive
        ) {

            errors.push(
                `${rule.id}: overlap between ${current.id} and ${next.id} at ${current.max}`
            );
        }
    }
    for (const range of ranges) {
        if (range.min < appMin) {
            errors.push(
                `${rule.id}: ${range.id} starts below applicability`
            );
        }
        if (range.max > appMax) {
            errors.push(
                `${rule.id}: ${range.id} exceeds applicability`
            );
        }
    }
}


const filePath =
    process.argv[2] ??
    "./distance_rules.json";

const result = validateDistanceRules(
    "./distance_rules.json"
);

console.log("\nDistance Rules Validation\n");

console.log(`Rules Checked:    ${result.stats.rules}`);
console.log(`Branches Checked: ${result.stats.branches}`);
console.log(`Errors:           ${result.errors.length}`);
console.log(`Warnings:         ${result.warnings.length}`);
console.log("");

if (result.errors.length === 0) {

    console.log("PASS");

} else {

    console.log("FAIL\n");

    result.errors.forEach(error =>
        console.log(`ERROR: ${error}`)
    );
}