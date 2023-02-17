"use strict";
//
//Following code adapted from work by Jan Brockmeyer & Valerii Gerkin:
//https://github.bus.zalan.do/paint/image-prewarmer
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileDatabase = void 0;
// == Package Import ==
const node_json_db_1 = require("node-json-db");
const JsonDBConfig_1 = require("node-json-db/dist/lib/JsonDBConfig");
class fileDatabase {
    constructor(filePath) {
        const dbConfig = new JsonDBConfig_1.Config(filePath, true, true, "/");
        this.database = new node_json_db_1.JsonDB(dbConfig);
    }
    async push(data) {
        //This function is basically just an async wrapper for the json DB push function
        try {
            // add item to queue
            return Promise.resolve(this.database.push("/queue[]", data));
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    async get() {
        try {
            const db = this.database;
            if (db.exists("/queue[-1]")) {
                return db.getObject("/queue[-1]");
            }
            else {
                return null;
            }
        }
        catch (err) {
            return null;
        }
    }
    async getById(elementId) {
        try {
            const db = this.database;
            const index = db.getIndex("/queue", elementId, "elementId");
            if (index == -1) {
                //-1 means no match found
                return Promise.reject(`No match found for given ID: ${elementId}`);
            }
            else {
                return Promise.resolve(db.getObject("/queue[" + index + "]"));
            }
        }
        catch (err) {
            console.error(err);
            return Promise.reject(new Error("Failed to connect to database"));
        }
    }
    async getAll() {
        try {
            const db = this.database;
            return Promise.resolve(db.getData("/queue"));
        }
        catch (err) {
            return Promise.reject("Unable to get DB elements");
        }
    }
    async deleteById(elementId) {
        try {
            const db = this.database;
            const index = db.getIndex("/queue", elementId, "elementId");
            const indexStr = "/queue[" + index + "]";
            if (db.exists(indexStr)) {
                db.delete(indexStr);
            }
            else {
                return Promise.reject(`No match found for given ID: ${elementId}`);
            }
        }
        catch (err) {
            console.error(err);
            return Promise.reject(new Error("Failed to connect to database"));
        }
    }
}
exports.fileDatabase = fileDatabase;
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
