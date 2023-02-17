"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApprovalRequest = exports.validateNewRequest = void 0;
const jtd_1 = __importDefault(require("ajv/dist/jtd"));
//Defining Schemas to be supplied by API request:
//New requests POSTed to our API:
const newRequestSchema = {
    properties: {
        identifier: {
            properties: {
                type: { enum: [
                        'email',
                        'customer-hash'
                    ] },
                value: { type: "string" }
            }
        },
        inputType: { enum: [
                "email-request",
                "testingtime-unsubscription",
                "questionpro-unsubscription",
                "questionpro-deletion",
                "customercare-request"
            ] }
    }
};
//Approval requests PUT to our API:
const approvalRequestSchema = {
    properties: {
        elementId: { type: "string" },
        approved: { type: "boolean" }
    },
    optionalProperties: {
        note: { type: "string" }
    }
};
//Validating new POST requests:
function matchesAjvSchema(request, schema) {
    //Generic function for returning result of schema validation using AJV node module
    /**
     * INTERNAL NOTE: Not making this function async because any validation has to be completed before additional
     * processing can take place (i.e., there's no scenario where we would not await results of validation before proceeding)
     */
    const ajv = new jtd_1.default();
    const validator = ajv.compile(schema);
    if (validator(request)) {
        return true;
    }
    else {
        throw validator.errors;
    }
}
//-----------------------
function validateNewRequest(request) {
    //Wrapper function for any and all validation requests related to new POST requests
    return matchesAjvSchema(request, newRequestSchema);
}
exports.validateNewRequest = validateNewRequest;
//-----------------------------
//Next: Validate PUT requests
//Tip for validating arrys of inputs: https://stackoverflow.com/questions/53537952/validate-array-of-objects-in-express-validator
function validateApprovalRequest(request) {
    //Wrapper function for any and all validation requests related to new POST requests
    return matchesAjvSchema(request, approvalRequestSchema);
}
exports.validateApprovalRequest = validateApprovalRequest;
