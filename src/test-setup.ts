//Importing custom structures
import { v4 as uuidv4 } from "uuid";
import { fileDatabase,queueElement } from "./types"

//Test data for buffer database (which holds data entered asynchronously - when the script is not running)
//The code below could be an example of code which runs ad hoc- when asynchronous requests come in- and results in storing
//these requests in a single database.
//The rest of the code should pull from this buffer and add them to a running list of input requests from other sources - which after
//completion are stored in another db to await approval.
let exampleEmailRequest: queueElement = {
    elementId: uuidv4(),
    identifier: {
      type: "email",
      value: "test1@test.de"
    },
    inputDate: new Date(),
    inputType: "email-request"
  };

let exampleUnsubscription: queueElement = {
    elementId: uuidv4(),
    identifier: {
      type: "email",
      value: "test2@test.de"
    },
    inputDate: new Date(),
    inputType: "questionpro-unsubscription"
  };

//LOCAL test setup - pushing example cases to 
let inputBuffer = new fileDatabase("./fileDatabases/inputBufferDB")
inputBuffer.push([exampleEmailRequest,exampleUnsubscription])

