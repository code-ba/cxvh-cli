'use strict';

module.exports = core;
/**
 * require支持：.js .json .node （不是这三个结尾的时候会当成 js 进行解析）
 * .js ---> module.exports 或者 exports
 * .json ---> JSON.parse 进行解析并输出对象
 * .node ---> process.dlopen 打开一个 c++ 插件
 */
const path=require("path");
const colors=require('colors');
const semver=require('semver')
const userHome = require('user-home');
const commander=require('commander');

const program=new commander.Command();
const log=require('@cxvh-cli/log');
const init=require('@cxvh-cli/init');
const exec=require('@cxvh-cli/exec');
const pkg=require('../package.json');
const constant=require('./const');
const pathExists = require('path-exists');
// let args;

async function core() {
    try{
        await prepare();
        // 命令注册
        registerCommand()
/*
*/
    }catch(e){
        log.error(e.message);
    }
}

function registerCommand(){
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        // 开启debug模式
        .option('-d,--debug','是否开启调试模式',false)
        .option('-tp,--targetPath <targetPath>','指定本地调试文件路径','');
    // 命令注册
    program
        .command('init [projectName]')
        .option('-f,--force','强制初始化项目')
        // .action(init);
        .action(exec);
        // .action((projectName,cmdObj)=>{
        //     console.log('init',projectName,cmdObj.force)
        // });

    // 开启debug模式
    program.on('option:debug',function(){
        if(program.debug){
            process.env.LOG_LEVEL="verbose"
        }else{
            process.env.LOG_LEVEL="info"
        }
        log.level=process.env.LOG_LEVEL
        log.verbose('verbose,开启debug模式',program.opts().debug);
    })
    // 指定targetPath
    program.on('option:targetPath',function (){
        process.env.CLI_TARGET_PATH=program.targetPath||program._optionValues.targetPath;
    })
    // 对未知命令进行监听
    program.on('command:*',function(obj){
        const availableCommands=program.commands.map(cmd=>cmd.name())
        console.log(colors.red("未知命令："+obj[0]));
        if(availableCommands.length>0){
            console.log(colors.red("可用命令："+availableCommands.join(",")));
        }
    })
    // 解析参数
    program.parse(process.argv)
    if(program.args&&program.args.length<1){
        program.outputHelp()
    }
}
async function prepare(){
    // 第一步检查版本号
    checkPkgVersion();
    // 第二步检查node版本号
    checkNodeVersion();
    // 第三步root账号启动检查和自动降级功能
    checkRoot();
    // 第四步用户主目录检查功能
    checkUserHome();
    // 第五步入参检查和debug模式开发
    // checkInputArgs() // 命令注册的地方加入了 debug 功能

    // log.verbose('debug','debug模式启动了')
    // 第六步环境变量检查功能
    checkEnv()
    // 第七步通用npm API模块封装
    await checkGlobalUpdate()
}
async function checkGlobalUpdate(){
    // 1. 获取当前版本号和模块名
    const currentVersion=pkg.version;
    const npmName=pkg.name;
    // 2. 调用 npm API，获取所有版本号
    const {getNpmSemverVersions}=require('@cxvh-cli/get-npm-info')
    const lastVersion=await getNpmSemverVersions(currentVersion,npmName)
    if(lastVersion&&semver.gt(lastVersion,currentVersion)){
        log.warn('更新提示',colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
    更新命令：npm install -g ${npmName}`))
    }
    // 3. 提取所有版本号，比对哪些版本号是大于当前版本号
    // 4. 获取最新的版本号，提示用户更新到该版本
}

function checkEnv(){
    const dotenvPath=path.resolve(userHome,'.env')
    // cxvh-cli --debug
    if(pathExists(dotenvPath)){
        let config=require('dotenv').config({
            path:dotenvPath
        })
        // config=createDefaultConfig()
    }
    // console.log(process.env.CLI_HOME)
    createDefaultConfig()
    log.verbose("环境变量",process.env.CLI_HOME_PATH)
}
function createDefaultConfig(){
    const cliConfig={
        home:userHome
    }
    if(process.env.CLI_HOME){
        cliConfig['cliHome']=path.join(userHome,process.env.CLI_HOME)
    }else{
        cliConfig['cliHome']=path.join(userHome,constant.DEFAULT_CLI_HOME)
    }
    // return cliConfig;
    process.env.CLI_HOME_PATH=cliConfig.cliHome;
}

function checkInputArgs(){
    args = require('minimist')(process.argv.slice(2));
    checkArgs();
}
function checkArgs(){
    if(args.debug){
        process.env.LOG_LEVEL="verbpse"
    }else{
        process.env.LOG_LEVEL="info"
    }
    log.level=process.env.LOG_LEVEL
}
function checkUserHome(){
    const pathExists = require('path-exists').sync;
    if(!userHome || !pathExists(userHome)){
        throw new Error(colors.red('当前主目录不存在！'));
    }
}
function checkRoot(){
    const rootCheck = require('root-check');
    // console.log(process.geteuid)
    rootCheck()
}
function checkNodeVersion(){
    // 获取当前 node 版本号
    const currentVersion=process.version;
    const lowestVersion=constant.LOWEST_NODE_VERSION;
    if(!semver.gte(currentVersion,lowestVersion)){
        throw new Error(colors.red(`cxvh-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`));
    }
    // 比对最低版本号
}
function checkPkgVersion(){
    log.notice("版本号",pkg.version);
}
