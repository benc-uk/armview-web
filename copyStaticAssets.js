const shell = require("shelljs");

shell.mkdir("-p", "dist/ext");
shell.mkdir("-p", "dist/public");

shell.cp("-R", "src/public/*", "dist/public/");
shell.cp("-R", "armview-vscode/assets/*", "dist/ext/");