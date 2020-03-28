"use strict";
exports.__esModule = true;
var jobRenderer_1 = require("./jobRenderer");
var demoJob_1 = require("../pages/demoJob");
var commands = jobRenderer_1.render(demoJob_1["default"]);
console.log(commands.join("\n"));
