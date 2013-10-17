#vs-nodesense
_Node.js meets Visual Studio_

This project extends Visual Studio's Javascript engine to provide full IntelliSense for Node.js code, including 3rd-party modules.

##Usage
NodeSense requires Visual Studio 2012 or later; the Javascript engine in earlier versions does not execute user code and cannot support this.

First, [install Node.js and npm](http://nodejs.org).  NodeSense will generate IntelliSense for the built-in modules from the version of Node.js used to run it.

Next, install NodeSense system-wide from an administrative command prompt:

```
npm install -g vs-nodesense
```

Finally, open a command prompt in your project folder and run NodeSense to generate IntelliSense files:

```
vs-nodesense
```

This will generate files in `node_modules/.vs-nodesense`, including a copy of Node.js' built-in modules, links to every JS file in your project, and glue code to make it all work together in Visual Studio's IntelliSense engine.
Make sure this folder is in your `.gitignore` file, even if the rest of `node_modules` isn't.

The generator will also create a `Scripts/_references.js` in the current directory with a reference to the generated files; this will tell Visual Studio to run the IntelliSense in every file.

##Writing client-side code
NodeSense will remove all non-Node.js entries from the IntelliSense globals, including the entire DOM API.  If your project also contains browser-side code, NodeSense can be configured to provide dual-environment IntelliSense (for systems like [browserify](http://browserify.org/), which have both DOM globals and Node.js globals), or to fully restore a pure-browser environment.

To restore browser globals (for dual-environment scripts), call `intellisense.restoreGlobals()`.  
To remove Node.js globals, call `intellisense.removeNodeGlobals()` (before calling `restoreGlobals`).

These calls should be placed in a separate file that is only referenced using a `/// <reference path="..." />` directive, so that they will be processed by Visual Studio but not Node.js.

##How it works
Files in the `templates/` directory will be copied directly to `node_modules/.vs-nodesense/setup`, and will only be executed by Visual Studio.  These files simulate the core Node.js environment.

The generator will create a reference file for every `require()`d file in the target project. 

For `.js` (including Node.js built-in modules) files, this file will have a reference tag to the actual JS file, and a call to `intellisense.enterModuleDefinition()` for the _next_ file.  This is the only way to run my code before running the actual user file; referenced files are always run before any code in the referencing file.  Using a reference to the actual JS file allows Go-to-definition to work as expected.
It will also emit any aliases (directory or package names) for the next file.

For `.json` files, it will paste the JSON content directly into the generated file and assign it to `module.exports`.

`.node` files are ignored.

It will then create an entry-point file (`node_modules/.vs-nodesense/node.js`) with reference tags for the setup files and all of the reference files in order.