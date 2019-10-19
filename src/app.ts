import * as express from 'express';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import ARMParser from '../armview-vscode/src/lib/arm-parser';

// Create Express server
const app = express();

// Consts
const THEME_NAME = 'original';
const ICON_PATH = `${__dirname}/../ext/img/azure/${THEME_NAME}`;
const ICON_PATH_URL = `/ext/img/azure/${THEME_NAME}`;

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'ejs');

// We force the body into plain text, no point in JSON parsing it multiple times
app.use(bodyParser.text({ type: ['application/json', 'text/plain'] })); 
// Also support form posted data
app.use(bodyParser.urlencoded({ extended: true })); 

// TWO static directories 
// - ext contains the `assets` dir from `armview-vscode`, i.e. the extension
// - public contains the `public` dir from `src`, i.e. this web wrapper project
app.use( '/public', express.static(path.join(__dirname, '..', 'public')) );
app.use( '/ext',  express.static(path.join(__dirname, '..', 'ext')) );

//
// Routes
//
app.post('/view', async (req: Request, res: Response) => {
  try {  
    if(!req.body) throw 'No body, supplied';

    // Get template from raw/text body or form parameter named 'template'
    let template = ''
    if(req.is('application/x-www-form-urlencoded')) {
      template = req.body.template;
    } else {
      template = req.body;
    }
    
    let start = Date.now();
    let parser = new ARMParser(ICON_PATH, 'main');
    let result = await parser.parse(template);			
    console.log(`### ArmView: Parsing took ${Date.now() - start} ms`);
    res.render('main', { data: JSON.stringify(result), errorMsg: null, iconPath: 'ext/img/azure/original' });
  } catch(err) {
    console.log(`### ArmView: Error! ${err}`);
    res.render('main', { data: null, errorMsg: err.message, iconPath: 'ext/img/azure/original' });
  }
});

export default app;
