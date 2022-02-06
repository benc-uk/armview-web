# ARM Template Viewer - Web Version
This is a standalone web version of the <a class="font-weight-bold" href="https://marketplace.visualstudio.com/items?itemName=bencoleman.armview">ARM Template Viewer</a> extension for VS Code. This web app displays a graphical preview of Azure Resource Manager (ARM) templates. Once a template is loaded, the view will show all resources with the official Azure icons and also linkage between the resources.  

Not all features from the extension are supported, for the full experience please use the extension

The main repo for the extension is here: https://github.com/benc-uk/armview-vscode

# Notes & Project Structure
The application is written in TypeScript and is a standard Node.js + Express web application.

This app is effectively a wrapper around the VS Code extension, as such it is structured a little strangely. Effort has been made to use the code from the VS Code extension ***without any modification***, and it is pulled into this repo via a Git submodule and resides in the `armview-vscode/` directory

Source for this app is held in `src` and `views` folders

## Build Process & Assets
When the app is built, it is TypeScript transpiled, along with the dependencies from `armview-vscode` and output is placed in `dist` directory

***NOTE!***
An important part of the build is `copyStaticAssets.js` which takes static assets from both the `src/public/` and `armview-vscode/assets/` and copies them to dist. As follows

```
copy "src/public/*" -> "dist/public/"
copy "armview-vscode/assets/*" -> "dist/ext/"
```

# Running Locally
```
npm install
npm run build
npm run serve
```

# Running In Docker
A `Dockerfile` is provided. Either build locally with `docker build` or pull from GitHub container registry:
```
docker run -p 3000:3000 ghcr.io/benc-uk/armview-web:latest
```

# Routes
The following routes are supported:
- `GET /` Show the simple home/index page
- `GET /viewPortal` Integration page with fake form, for embedding in Azure portal
- `GET /view?url=<template-url>` Render a template from the given URL (plain or URI encoded)
- `GET /view/<template-url>` Render a template from the given URL, must be encoded
- `POST /view` HTTP POST raw template as text or JSON
- `POST /view` HTTP POST template as `multipart/form-data` file upload, file content field should be called `templateFile`
- `POST /view` HTTP POST template as via `application/x-www-form-urlencoded` form, template content field should be named `template`
