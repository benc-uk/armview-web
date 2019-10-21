import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import 'isomorphic-fetch';
import * as fileUpload from 'express-fileupload';

// Create Express server
const app = express();

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
app.use(fileUpload());

export default app;
