import express from "express";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import path from "path";
import ARMParser from "../armview-vscode/src/lib/arm-parser";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.use(bodyParser.json());

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.get("/", (req: Request, res: Response) => {
  const parser = new ARMParser("ddd", "main");
  res.render("index", {});
});

export default app;
