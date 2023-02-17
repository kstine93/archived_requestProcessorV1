"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jtd_1 = __importDefault(require("ajv/dist/jtd"));
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
const test = {
    "identifier": {
        "type": "emailsss",
        "value": "test@test.de"
    },
    "inputType": "email-request"
};
const ajv = new jtd_1.default();
const validate = ajv.compile(newRequestSchema);
console.log(validate(test));
