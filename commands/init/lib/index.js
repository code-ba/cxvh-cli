'use strict';
const log = require('@cxvh-cli/log');
function init(projectName,cmdObj) {
    log.info('init',projectName,cmdObj.force,process.env.CLI_TARGET_PATH)
    console.log(1111111111)
}

module.exports = init;

// const Command=require('@cxvh-cli/command');
// class InitCommand extends Command{
//     //
// }
// function init(projectName,cmdObj){
//     return new InitCommand();
// }
// module.exports=init;
// module.exports.InitCommand=InitCommand;