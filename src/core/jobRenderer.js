"use strict";
exports.__esModule = true;
var template_1 = require("./template");
var topological_sort_1 = require("topological-sort");
function render(jobContent) {
    var sortedGraph = new topological_sort_1["default"](new Map());
    jobContent.blocks.forEach(function (block) {
        sortedGraph.addNode(block.id, block);
    });
    jobContent.links.forEach(function (link) {
        sortedGraph.addEdge(link.originId, link.targetId);
    });
    var sortedBlocks = sortedGraph.sort();
    //
    // load all templates
    //
    var requireContext = require('require-context');
    var requireComponent = requireContext(
    // The relative path of the components folder
    '../../src/blocks', 
    // Whether or not to look in subfolders
    true, 
    // The regular expression used to match base component filenames
    /.*\.template/);
    var templates = {};
    requireComponent.keys().forEach(function (filename) {
        // Get component config
        var blockType = filename.split("/")[0];
        templates[blockType] = new template_1.Template(filename);
    });
    //
    // render the job
    //
    var jobCommands = [];
    sortedBlocks.forEach(function (block) {
        // find the inputs to this block
        var incomingLinks = jobContent.links.filter(function (link) { return link.targetId == block.node["id"]; });
        var inputs = {};
        incomingLinks.forEach(function (link) {
            inputs[link.targetSlot] = "output_id" + link.originId + "_socket" + link.originSlot;
        });
        jobCommands.push(templates[block.node["type"]].render({
            props: block.node["properties"],
            inputs: inputs
        }));
    });
    return jobCommands;
}
exports.render = render;
