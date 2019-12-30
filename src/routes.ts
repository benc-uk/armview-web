import app from "./app";

import { Request, Response } from 'express';
import * as cache from 'memory-cache';
import 'isomorphic-fetch';

import ARMParser from '../armview-vscode/src/lib/arm-parser';

// Global static config
const THEME_NAME = 'original';
const ICON_PATH = `${__dirname}/../ext/img/azure/${THEME_NAME}`;
const ICON_PATH_URL = `/ext/img/azure/${THEME_NAME}`;
const QUICKSTART_URL = 'https://github.com/Azure/azure-quickstart-templates';

var showHome = false;  // Show the home button in the rendered view

//
// For template provided as POST data, used by Azure portal integration 
//
app.post('/view', async (req: any, res: Response) => {
  try {      
    if(!req.body) throw new Error('No URL, supplied');

    // When receiving normal form data (form-urlencoded)
    // - form fields are named 'template' and 'parameters'
    // - 'parameters' field is optional
    let template = ''
    let parameters = ''
    showHome = false;
    if(req.is('application/x-www-form-urlencoded')) {
      template = req.body.template;
      if(req.body.parameters)
        parameters = req.body.parameters;
    } else {
      // Get template & parameters from raw/text body
      // This is never used
      template = req.body;
    }

    // Get template from file upload
    // This is never used
    if(req.is('multipart/form-data')) {
      template = req.files.templateFile.data.toString();
      showHome = true;
    }
    
    // Note we pass forceStart = true here
    parseAndRender(template, res, parameters);
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
    const response = await fetch(url);
    let template = await response.text();
    
    showHome = true;
    // trustedAuthority is passed when in an iframe in the Azure portal, so hide the home button
    if(req.query.trustedAuthority) showHome = false;

    parseAndRender(template, res);
  } catch(err) {
    res.render('error', { errorMsg: err.message });
  }
});

//
// For use in Azure portal - empty 'holding page' but with hidden form 
// On receiving the correct postMessage the form is submitted to POST /view (see above)
// See also azure-portal.js and the message event listener
//
app.get(['/viewPortal'], async (req: Request, res: Response) => {
  try {    
    res.render('viewPortal', {});
  } catch(err) {
    res.render('error', { errorMsg: err.message });
  }
});

//
// Simple web frontend for humans
//
app.get(['/', '/home'], async (req: Request, res: Response) => {
  let cachedHtml = cache.get('githubHtml');

  let gitHubLinks: string[] = [];
  if(!cachedHtml) {
    const response = await fetch(QUICKSTART_URL);
    let result = await response.text();

    // Cache resulting HTML for 1 hour
    cache.put('githubHtml', result, 3600 * 1000);
    gitHubLinks = _processGithubHtml(result);
  } else {
    gitHubLinks = _processGithubHtml(cachedHtml);
  }
  let ver = require('../../package.json').version;

  res.render('index', { gitHubLinks: gitHubLinks, version: ver });
})


//
// TEST HARNESS FOR PORTAL WORK - TO BE REMOVED
//
app.get('/portaltest', (req: Request, res: Response) => {
  res.render('portaltest')
});


//
// Parse using ARMParser and render the 'view' view
//
async function parseAndRender(template: string, res: Response, parameters: string = '') {
  try {
    let start = Date.now();

    // Parse the template!
    let parser = new ARMParser(ICON_PATH, 'main');
    let result = await parser.parse(template, parameters);		

    console.log(`### ArmView: Parsing took ${Date.now() - start} ms`);

    // Render the view page with the parsed results passed in the 'data' property
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

//
// Internal util 'private' function
// Crazy regex voodoo to get a list of folder links from the Github page
//
function _processGithubHtml(html: string): string[] {
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
