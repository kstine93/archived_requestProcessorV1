import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'
import { requestElement, approvalElement } from '../types';


//Defining Schemas to be supplied by API request:

//New requests POSTed to our API:
const newRequestSchema: JTDSchemaType<requestElement> = {
  properties: {
    identifier: {
      properties:{
        type: {enum: [
            'email',
            'customer-hash'
          ]},
        value: {type: "string"}
      }
    },
    inputType: {enum: [
      "email-request",
      "testingtime-unsubscription",
      "questionpro-unsubscription",
      "questionpro-deletion",
      "customercare-request"
    ]}
  }
}

//Approval requests PUT to our API:
const approvalRequestSchema: JTDSchemaType<approvalElement> = {
  properties: {
    elementId: {type: "string"},
    approved: {type: "boolean"}
  },
  optionalProperties: {
    note: {type: "string"}
  }
}

//Validating new POST requests:
function matchesAjvSchema (request: object,schema: JTDSchemaType<any>): boolean {
  //Generic function for returning result of schema validation using AJV node module
  /**
   * INTERNAL NOTE: Not making this function async because any validation has to be completed before additional
   * processing can take place (i.e., there's no scenario where we would not await results of validation before proceeding)
   */
  const ajv = new Ajv()
  const validator = ajv.compile(schema)
  
  if(validator(request)){
    return true
  }
  else{
    throw validator.errors
  }
}

//-----------------------

export function validateNewRequest(request: object): boolean {
  //Wrapper function for any and all validation requests related to new POST requests
  return matchesAjvSchema(request,newRequestSchema)
}

//-----------------------------

//Next: Validate PUT requests
//Tip for validating arrys of inputs: https://stackoverflow.com/questions/53537952/validate-array-of-objects-in-express-validator
export function validateApprovalRequest(request: object): boolean {
  //Wrapper function for any and all validation requests related to new POST requests
  return matchesAjvSchema(request,approvalRequestSchema)
}