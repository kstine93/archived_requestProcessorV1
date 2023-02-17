//
//Following code adapted from work by Jan Brockmeyer & Valerii Gerkin:
//https://github.bus.zalan.do/paint/image-prewarmer


// == Package Import ==
import jsonDB, { JsonDB } from "node-json-db"
import { Config } from "node-json-db/dist/lib/JsonDBConfig";

// == Type Definitions ==

export interface approvalElement {
  elementId: string;
  approved: boolean;
  note?: string;
}

export interface requestElement {
  identifier: {
    type: identifierType
    value: string
  }
  inputType: inputType
}

//Individual elements of a queue - with relevant metadata
export interface queueElement extends requestElement {
  elementId: string;
  inputDate: Date;
  outputResults?: Array<requestOutput>;
}

//Shows the results of output processing.
interface requestOutput {
  outputType: outputType;
  date: Date;
  note?: string;
  finished: boolean;
}

export type inputType =
  | "email-request" //ad hoc (human user input)
  | "testingtime-unsubscription" //ad hoc (human user input - currently at least)
  | "questionpro-unsubscription" //ad hoc (webhook)
  | "questionpro-deletion" //ad hoc (webhook)
  | "customercare-request" //automatic

export type identifierType = 
  | "email"
  | "customer-hash"

export type outputType = 
  | "qualtrics-directory-deletion"
  | "qualtrics-survey-deletion"
  | "quesitonpro-panel-deletion"
  | "qualitative-data-deletion"
  | "N/A - request rejected"

export interface database {
  push(data: queueElement): Promise<void>;
  get(): Promise<queueElement | null>;
  getById(id:string): Promise<queueElement | null>;
}

export class fileDatabase implements database {
  constructor(filePath: string) {
    const dbConfig = new Config(filePath, true, true, "/");
    this.database = new JsonDB(dbConfig);
  }
  database: JsonDB;

  async push(data: queueElement | queueElement[]): Promise<void> {
    //This function is basically just an async wrapper for the json DB push function
    try {
      // add item to queue
      return Promise.resolve(this.database.push("/queue[]", data))
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async get(): Promise<queueElement | null> {
    try {
      const db = this.database;
      if (db.exists("/queue[-1]")) {
        return db.getObject<queueElement>("/queue[-1]");
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  }

  async getById(elementId:string): Promise<queueElement> {
    try {
      const db = this.database;
      const index = db.getIndex("/queue",elementId,"elementId")
      if(index == -1){
        //-1 means no match found
        return Promise.reject(`No match found for given ID: ${elementId}`)
      }
      else{
        return Promise.resolve(db.getObject<queueElement>("/queue[" + index + "]"));
      } 
    } catch (err) {
      console.error(err);
      return Promise.reject(new Error("Failed to connect to database"))
    }
  }

  async getAll(): Promise<Array<queueElement>>{
    try{
      const db = this.database;
      return Promise.resolve(db.getData("/queue"))
    } catch (err){
      return Promise.reject("Unable to get DB elements")
    }
  }

  async deleteById(elementId:string): Promise<void> {
    try {
      const db = this.database;
      const index = db.getIndex("/queue",elementId,"elementId")
      const indexStr = "/queue[" + index + "]"
      if (db.exists(indexStr)){
        db.delete(indexStr)
      }
      else{
        return Promise.reject(`No match found for given ID: ${elementId}`)
      }
    } catch (err) {
      console.error(err)
      return Promise.reject(new Error("Failed to connect to database"))
    }
  }
}


/**
 * Note: (Apr. 26): Jan says that K8s has its own Postgres instances that can be used as a service from EC2 containers.
 * I should be able to asks f
 * https://github.bus.zalan.do/jigsaw/geppetto/tree/master/deploy/lhci-server/apply
 * 
 * https://database-as-a-service.docs.zalando.net/
 * Jan: You can also try to develop locally, but use the remote database on staging cluster still 
 * 
 * To do for next time:
 * 1. Use Schema validator (try this one: https://ajv.js.org/guide/typescript.html) to validate API requests rather than using my custom validation functions
 * 2. Set up Postgres database in dx-ie-test cluster and (as far as possible) change code to interact with it (can try even local development to change remote db)
 */