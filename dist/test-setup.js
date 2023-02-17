"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Importing custom structures
const uuid_1 = require("uuid");
const types_1 = require("./types");
//Test data for buffer database (which holds data entered asynchronously - when the script is not running)
//The code below could be an example of code which runs ad hoc- when asynchronous requests come in- and results in storing
//these requests in a single database.
//The rest of the code should pull from this buffer and add them to a running list of input requests from other sources - which after
//completion are stored in another db to await approval.
let exampleEmailRequest = {
    elementId: (0, uuid_1.v4)(),
    identifier: {
        type: "email",
        value: "test1@test.de"
    },
    inputDate: new Date(),
    inputType: "email-request"
};
let exampleUnsubscription = {
    elementId: (0, uuid_1.v4)(),
    identifier: {
        type: "email",
        value: "test2@test.de"
    },
    inputDate: new Date(),
    inputType: "questionpro-unsubscription"
};
//LOCAL test setup - pushing example cases to 
let inputBuffer = new types_1.fileDatabase("./fileDatabases/inputBufferDB");
inputBuffer.push([exampleEmailRequest, exampleUnsubscription]);
