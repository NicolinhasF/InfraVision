const { databaseTools } = require('./database.tool');

const toolsRegistry = { ...databaseTools };
const toolDefinitions = Object.values(toolsRegistry).map((tool) => tool.definition);

module.exports = { toolsRegistry, toolDefinitions };
