import express, { Application } from "express"
import { queueElement, fileDatabase, approvalElement } from "../types"
import { v4 as uuidv4 } from "uuid";
import { input_fromBuffer } from "../input/input";
import { body, validationResult } from 'express-validator';
import { validateNewRequest, validateApprovalRequest } from "./validators"


//Loading connections to database
const inputBuffer = new fileDatabase("./fileDatabases/inputBufferDB.json")
const approvalList = new fileDatabase("./fileDatabases/approvalListDB.json")
const outputBuffer = new fileDatabase("./fileDatabases/outputBufferDB.json")
const historicalLog = new fileDatabase("./fileDatabases/historicalLogDB.json");

// Support Functions:
export function startApiListening(port: number = 3000): void{
  /**
   * Holds protocols for responding to various api calls (PUT, POST, etc.) to various endpoings
   */

  //Initial setup of Express:
  const app = express();
  app.use(express.json());


  //Starting server:
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })

  //-------------
  //--Endpoints--
  //-------------

  app.post('/customer-deletions',
  body().isArray(),
  body("*").custom(validateNewRequest),
  function (req, res) {
    /**
     * for POSTing a new deletion request to the system
     */

    //If any errors occur from request validation, they are handled here:
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let messageJSON = {
        "status":400,
        "errors":errors.array()
      }
      return res.status(messageJSON.status).send(JSON.stringify(messageJSON,null,2));
    }

    //Enriching request data
    let enrichedRequest: queueElement = {
      "elementId": uuidv4(),
      "inputDate": new Date(),
      ...req.body["0"]
    };

    //pushing to database
    inputBuffer.push(enrichedRequest);
    let messageJSON = {
      "status":202,
      "message": "Data accepted and awaiting further processing"
    }
    res.status(messageJSON.status).send(JSON.stringify(messageJSON,null,2));
    
    //Now that input has been successfully captured, it will be processed immediately
    //(in case user wants to already approve this input):

    input_fromBuffer(approvalList, inputBuffer);

  })

  app.put('/customer-deletions',
  body().isArray(),
  body("*").custom(validateApprovalRequest), //Note: * makes this work for arrays
  async function(req, res) {
    /*
     *  Allows users to change the status of deletion requests (approve or reject them)
     * The effect of this is that the request is moved to another database (i.e., presence
     * in one of these other databases signifies whether the request was approved or not)
     */

    //If any errors occur from request validation, they are handled here:
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let messageJSON = {
        "status":400,
        "errors":errors.array()
      }
      return res.status(messageJSON.status).send(JSON.stringify(messageJSON,null,2));
    }


    //Loading requests into an array
    let approvals:Array<approvalElement> = req.body

    
    /**
     * //Idea: Implement buffer system which can queue requests and instantly send confirmation
     *  res.status(202).send("well done!")
     * //Then I could implement another endpoint to check the status of the request - if there was any problem with later processing
     * //Endpoint suggestion: /results/{optional id of request}
     * 
     * //Jan: There are also possibilities to have asynchronous messaging of users (once request is complete, e.g.)
     * //https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern
     */
    
    
    //Collecting promises to move data to appropriate output / historical log DBs
    //If any parts of the process fail (e.g., getting data or moving to new DB) the request is rejected.

    let errorLog:Array<object> = []

    const promises = approvals.map(async (request):Promise<void> => {
      try{
        let data = await approvalList.getById(request.elementId) //Returns rejected promise if Id not found
        if(request.approved){
          //If approved, data is transferred from approval DB to output buffer DB
          outputBuffer.push(data)
          approvalList.deleteById(data.elementId)
        }
        else{
          //If NOT approved, data is transferred from approval DB to historical log - with any user-given note attached.
          data.outputResults = [{
            "outputType":"N/A - request rejected",
            "date": new Date(),
            "finished": false,
            "note": request.note
          }]
          await historicalLog.push(data)
          await approvalList.deleteById(data.elementId)
        }
      }catch(err){
        console.error(err)
        errorLog.push({"error":err,"ID":request.elementId})
        //throw new Error
        //handle error here - don't throw it to be rejected and picked up by promise.all()
        //Idea: add ID of request to outer array that can be returend as error log?
        //Idea: Have user-accessible table of results that can be changed via code (e.g. DOM manipulation)
      }
    })

    console.log(errorLog)

    /*
     
    //Then, once all of the promises are resolved, finishing the task:
    
    //Promise.all(promises).then(results => {
      //If all data successfully processed, sending confirmation to user:
      const numApproved = approvals.filter(elem => elem.approved).length
      const numRejected = approvals.filter(elem => !elem.approved).length

      let messageJSON = {
        "status":200,
        "message":`${numApproved} approvals and ${numRejected} rejections processed`
      }
      res.status(messageJSON.status).send(JSON.stringify(messageJSON,null,2));
    }).catch(err => {
      //If ANY request fails, all requests are rejected and user must correct request & try again:
      console.log(err)
      let messageJSON = {
        "status":400,
        "message":"Some requests not processed. Please check error log and your request body",
        "errors": err
      }
      res.status(messageJSON.status).send(JSON.stringify(messageJSON,null,2))
    })

    */
  })

  //Testing with HTTP responses:
  app.get('/customer-deletions', function(req, res) {
    /**
     * To get ALL current requests in need of approval / rejection
     */
    approvalList.getAll().then(requests => {
      let messageJSON = {
        "status":200,
        "data":requests
      }
      res.status(200).send(JSON.stringify(messageJSON,null,2));
    }).catch(err => {
      let messageJSON = {
        "status":500,
        "message":"Current requests unable to be returned"
      }
      res.status(messageJSON.status).send(JSON.stringify(messageJSON,null,2));
    })
  })

  app.get('/healthcheck', (req, res) => {
    res.status(200).send('OK')
  })
}