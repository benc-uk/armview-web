import * as express from 'express';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import axios from 'axios';
import * as cache from 'memory-cache';
// import * as fileUpload from 'express-fileupload'
import ARMParser from '../armview-vscode/src/lib/arm-parser';

// Create Express server
const app = express();

// Consts
const THEME_NAME = 'original';
const ICON_PATH = `${__dirname}/../ext/img/azure/${THEME_NAME}`;
const ICON_PATH_URL = `/ext/img/azure/${THEME_NAME}`;
const QUICKSTART_URL = 'https://github.com/Azure/azure-quickstart-templates';

var showHome = false;  // Show the home button in the rendered view

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

// Allow file uploads
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// ============================================================================
// Routes
// ============================================================================

//
// For template provided as POST data
//
app.post('/view', async (req: any, res: Response) => {
  try {  
    if(!req.body) throw new Error('No URL, supplied');

    // Get template from raw/text body or form parameter named 'template'
    let template = ''
    showHome = false;
    if(req.is('application/x-www-form-urlencoded')) {
      template = req.body.template;
    } else {
      template = req.body;
    }

    // Get template from file upload
    if(req.is('multipart/form-data')) {
      template = req.files.templateFile.data.toString();
      showHome = true;
    }

    parseAndRender(template, res);
  } catch(err) {
    res.status(500).send(err)
  }
});

//
// For template provided as GET data
// either: /view/{encoded-url} or /view?url={non-encoded-url}
//
app.get(['/view/:url', '/view'], async (req: Request, res: Response) => {
  try {    
    let url = undefined;
    if(req.params.url) url = req.params.url;
    if(req.query.url) url = req.query.url;
    if(!url) throw new Error('No URL, supplied');

    // Get template from raw/text body or form parameter named 'template'
    let result = await axios({ url: url, responseType: 'text' });
    let template = JSON.stringify(result.data);
    
    showHome = true;
    parseAndRender(template, res);
  } catch(err) {
    res.render('error', { errorMsg: err.message });
  }
});

//
// Simple web frontend for humans
//
app.get(['/', '/home'], async (req: Request, res: Response) => {
  let githubHtml = cache.get('githubHtml');

  let gitHubLinks: string[] = [];
  if(!githubHtml) {
    let result = await axios({ url: QUICKSTART_URL, responseType: 'text' });
    
    // Cache resulting HTML for 1 hour
    cache.put('githubHtml', result.data.toString(), 3600 * 1000);
    gitHubLinks = processGithubHtml(result.data.toString(), res);
  } else {
    gitHubLinks = processGithubHtml(githubHtml, res);
  }

  res.render('index', { gitHubLinks: gitHubLinks });
})

//
// Parse using ARMParser and render the 'view' view
//
async function parseAndRender(template: string, res: Response) {
  try {
    let start = Date.now();
    let parser = new ARMParser(ICON_PATH, 'main');
    let result = await parser.parse(template);			
    console.log(`### ArmView: Parsing took ${Date.now() - start} ms`);

    res.render('view', { 
      data: JSON.stringify(result), 
      iconPath: ICON_PATH_URL,
      showHome: showHome
    });

  } catch(err) {
    console.log(`### ArmView: Error! ${err}`);
    res.render('error', { errorMsg: err.message });
  }
}

// Crazy regex voodoo to get a list of folder links from the Github page
function processGithubHtml(html, res): string[] {
  let re: RegExp = /href=".*?\/Azure\/azure-quickstart-templates\/tree\/master\/(.*?)"/g;
  let links: string[] = [];
  let match: RegExpExecArray
  do {
    match = re.exec(html);
    if(match) {
      links.push(match[1])
    }
  } while (match);

  // Skip the first four as they are rubbish
  links.splice(0, 4);
  return links;
}


export default app;
