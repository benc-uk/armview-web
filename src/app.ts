import * as express from "express";
import { Request, Response } from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
import * as fs from "fs";
import ARMParser from "../armview-vscode/src/lib/arm-parser";

// Create Express server
const app = express();

// Consts
const THEME_NAME = "original";
const EXTENSION_BASE_DIR = "./armview-vscode";

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// We force the body into plain text, no point in JSON parsing it multiple times
app.use(bodyParser.text({ type: ['application/json', 'text/plain'] })); 
app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

//
// Routes
//
app.post("/api/parse", async (req: Request, res: Response) => {
  try {
    if(!req.body) throw "No body, supplied";
    
    let start = Date.now();
    let parser = new ARMParser(`${EXTENSION_BASE_DIR}/assets/img/azure/${THEME_NAME}`, "main")
    let result = await parser.parse(req.body);			
    console.log(`### ArmView: Parsing took ${Date.now() - start} ms`);
    res.type('application/json');
    res.status(200).send(result)
  } catch(err) {
    console.log(`### ArmView: Error! ${err}`);
    res.send({ error: err.toString() })
  }
});

export default app;
