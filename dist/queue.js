"use strict";
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
    async pushToQueue(data) {
        //This function is basically just an async wrapper for the json DB push function
        try {
            // add item to queue
            this.database.push("/queue[]", data);
        }
        catch (err) {
            console.log(err);
        }
    }
    async getFromQueue() {
        try {
            const db = this.database;
            if (db.exists("/queue[-1]")) {
                const elem = db.getObject("/queue[-1]");
                db.delete("/queue[-1]");
                return elem;
            }
            else {
                return null;
            }
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }
}
exports.fileDatabase = fileDatabase;
