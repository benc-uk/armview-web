const shell = require("shelljs")

shell.mkdir("-p", "dist/ext")
shell.mkdir("-p", "dist/public")

shell.cp("-R", "src/public/*", "dist/public/")
shell.cp("-R", "armview-vscode/assets/*", "dist/ext/")

// package.json only used for showing the version on the homepage
shell.cp("package.json", "dist/")
shell.cp("armview-vscode/package.json", "dist/ext-package.json")
