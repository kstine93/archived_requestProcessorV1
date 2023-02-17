"use strict";
/*
PURPOSE: to collect from all input sources

1. input possible input tasks (From input-defs.json)
2. For each, execute subfunctions to process them (based on inputType) and collect results (or errors)
EDGE CASE: de-duplicate results - also merging excluded outputs list (i.e., only keeping excluded outputs if in ALL inputs)
3. Once all input types processed, send final list to QUEUE

- use JSON DB package for local testing (research)
- ToadScheduler (research)
-
- Implement
    -input into queue
    -take from queue
    -process item


Steps of main function:
==NON-RUNTIME BUFFER==
For most input sources, the code controls the time and manner of input (i.e., the code is querying for requests at runtime).
For some other input sources:
        1. QuestionPro account deletions
        2. QuestionPro unsubscriptions
        3. Emails to ZV team
) requests can come in at any time - these need to be stored in a raw 'buffer' until the main code is run (i.e., like mail which is dropped in a buffer mailbox, before being retrieved at runtime
and read)
--------
++ PREP ++
1. Read in possible input sources (input-defs.json)
2. Set up Queue structure (should really just be array in version 1.0, might not need much initialization beyond that)

++ READ ++
1. For each input source, execute function noted in JSON, passing extra parameters to that function
2. The input functions should do all pre-processing - after they are done the request should be ready for approval.
3. Read output of that function, which should be then put into queueElement format
    3a. Need to call constructor for defined type?
    3b. Where should transformation from raw data to queueElement format happen? Should be standardized in 1 place - in input functions?
    or in the main function after each call? (I'm leaning toward the latter - fewer embedded function calls).

++ PASS ++
1. Input requests passed directly to long-term database system (I am predicting long pauses (e.g., days) in between input and approval + output
phases. I want the UI to query the long-term storage, rather than interacting with the input system - in this way, the input system does not
need to be running during UI interactions).

<< APPROVE >>
1. During approval phase, the database is queried for requests. Unapproved requests are able to be approved (which changes the database - WRITE)
    optionally: approved requests are able to be seen and then a button pressed to process them immediately (Q: is there any benefit to this?)

== PREP ==
1. Set up Queue structure
2. Approved requests are read in from database to queue
3. Output options read in from output-defs.json

== READ ==
1. For each request, pass its data to each output function (excepting any excluded outputs mentioned in inputType JSON).
2. Each output function gives a particular status code out: "success", "failure", "waiting". This status code is attached to the
    output type and stored in the queue object "OutputResults" ('failure' or 'waiting' have explanations attached to them).
    The code continues to run regardless of these status codes.
3. At the end, we have a transformed queue of requests - now each queueElement has not only request information, but also an object
    which shows which types of outputs were attempted on this request and what their results were.

~~ CLEANUP ~~
1. The main code is now complete, but depending on the input types and on the results of output, there might be required
    cleanup steps to be performed on the output data.
    1a. If there were any failed steps, warnings are raised and sent to human maintainer(s) of the system.
    1b. If any succeedful output steps require confirmations to be sent, these are sent out
    1c. Requests with all 'success' outputs are stripped of any identifying information and logged in a permanent record-keeping database.
    1d. For any output steps with 'waiting' or 'failure' - the entire request (including all output results) is re-written to another
        'purgatory' database where they stay until (a) in the case of failure they are removed manually by the maintainer or (b) in
        the case of 'waiting' success confirmations are received from all 'waiting' steps
    
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.input_fromBuffer = exports.input_handler = void 0;
const types_1 = require("../types");
const uuid_1 = require("uuid");
//IMPLEMENT ASYNCHRONOUS FUNCTIONS HERE
async function input_handler() {
    /**
     * NOTES:
     * 1. How to prevent duplicate entries? If I run the inputs 2x will I get double inputs?
     * 2. Individual input functions should be in charge of their own pre-processing. Each should provide an output ready for pushing to approval list
     * 		This is so that
     */
    //Wrapper function to contain all input functions below and to pull from buffer DB.
    const inputBuffer = new types_1.fileDatabase("./fileDatabases/inputBufferDB");
    const approvalList = new types_1.fileDatabase("./fileDatabases/approvalListDB");
    input_fromSources(approvalList);
    input_fromBuffer(approvalList, inputBuffer);
}
exports.input_handler = input_handler;
async function input_fromBuffer(approvalList, inputBuffer) {
    let nextInput = await inputBuffer.get();
    let processedInput = null;
    while (nextInput != null) {
        processedInput = await preProcess_input(nextInput);
        approvalList.push(processedInput);
        inputBuffer.deleteById(processedInput.elementId);
        nextInput = await inputBuffer.get();
    }
}
exports.input_fromBuffer = input_fromBuffer;
async function input_fromSources(approvalList) {
    /**
     * Creating array of promised array elements. Only need to be fulfilled once each one is processed
     */
    input_customerCare().then(inputArray => {
        inputArray.forEach(elem => {
            if (elem != undefined) {
                approvalList.push(preProcess_input(elem));
            }
        });
    });
    input_testingTime_unsubscriptions().then(inputArray => {
        inputArray.forEach(elem => {
            if (elem != undefined) {
                approvalList.push(preProcess_input(elem));
            }
        });
    });
}
function preProcess_input(input) {
    /**
     * INTERNAL NOTE: Not async because there is no scenario in which we would be able to continue processing
     * without first waiting for this function to finish.
     */
    //If there is any pre-processing which needs to be done in the future, it can be done here. For now, it's just directly pushing to list
    return input;
}
async function input_customerCare() {
    /**
     * Function deals with inputs directed to Zalando's customer care. These requests are stored in a Data Lake table with email address
     * and customer hash as potential identifiers.
     */
    /**
     * Steps:
     * 1. Read in request emails (and associated metadata) from Data Lake
     * 2. Query QuestionPro panel (via API) to acquire list of emails in our panel
     * 3. Compare lists
     * 4. For each request email:
     * 	4a. If a match is found- the email request is removed from the original list and added to a new 'toDelete' list
     *  4b. If NO MATCH is found- the email request is edited to show that no match was found
     * 5. NO MATCH email requests are batched and sent to Nakadi with "NoCustomerDataFound" tag
     * 6. Email requests which did have a match are returned from this function to be processed further.
     */
    //Function to be written
    //TEST CASE:
    let match1 = {
        elementId: (0, uuid_1.v4)(),
        identifier: {
            type: "email",
            value: "cucaRequest1@test.de"
        },
        inputDate: new Date(),
        inputType: "customercare-request"
    };
    let match2 = {
        elementId: (0, uuid_1.v4)(),
        identifier: {
            type: "email",
            value: "cucaRequest2@test.de"
        },
        inputDate: new Date(),
        inputType: "customercare-request"
    };
    //Returns list of matched requests
    return [match1, match2];
}
async function input_testingTime_unsubscriptions() {
    /**
     * This is going to be a tricky routine, depending on if Legal still requires us to message ZV members
     * after unsubscription --> THEY DO :(
     * If Legal does require we still delete these unsubscriptions, but allows us to not email members anymore,
     * then this code will need to pull unsubscription emails directly from the Google groups (not from kevin's email)
     * If (hopefully) Legal says we don't have to consider these unsubscriptions deletion requests, then we can
     * take this routine out entirely
     */
    //TEST CASE:
    let match = {
        elementId: (0, uuid_1.v4)(),
        identifier: {
            type: "email",
            value: "TT-unsubscribeRequest2@test.de"
        },
        inputDate: new Date(),
        inputType: "testingtime-unsubscription"
    };
    return [match];
}
