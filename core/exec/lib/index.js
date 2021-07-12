'use strict';

const cp=require('child_process')
const path = require('path')
const Package = require('@cxvh-cli/package')
const log = require('@cxvh-cli/log')
const SETTINGS = {
    init: '@imooc-cli/init'
}, CACHE_DIR = 'dependencies';

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH, storeDir, pkg;
    const homePath = process.env.CLI_HOME_PATH;
    log.verbose('targetPath', process.env.CLI_TARGET_PATH)
    log.verbose('homePath', process.env.CLI_HOME_PATH)

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = "latest";

    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR);// 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules');
        log.verbose('targetPath', targetPath)
        log.verbose('storeDir', storeDir)

        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        });
        if (await pkg.exists()) {
            // 更新 package
            await pkg.update();
            // console.log('更新 package')
        } else {
            // 安装 package
            await pkg.install()
        }
        // log.verbose(pkg.getRootFilePath())
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        });
    }
    const rootFile = pkg.getRootFilePath()
    if(rootFile){
        // 在当前进程中调用
        // rootFile&&require(rootFile).apply(null,arguments); // 数组转参数
       // 在 node 子进程中调用
        try {
            // require(rootFile).apply(null,arguments); // 数组转参数
            // cp.fork()
            // const code='console.log(Date.now())';
            const args=Array.from(arguments);
            const cmd=args[args.length-1];
            const o=Object.create(null);
            Object.keys(cmd).forEach(key=>{
                if(cmd.hasOwnProperty(key) && !key.startsWith('_') && key!=='parent'){
                    o[key]=cmd[key];
                }
            });
            args[args.length-1]=o;
            const code=`require('${rootFile}').call(null,${JSON.stringify(args)})`
            // cp.spawn('node',['/c','-e',code],{}) or shell:'C:\\Windows\\System32\\cmd.exe' // win
            // const child=cp.spawn('node',['-e',code],{
            const child=spawn('node',['-e',code],{
                cwd:process.cwd(),
                // stdio:'pipe'
                stdio:'inherit'
            });
            // child.stdout.on('data',(chunk => {
            //     console.log(chunk)
            // }))
            // child.stderr.on('data',(chunk => {
            //     console.log(chunk)
            // }))
            child.on('error',e=>{
                log.error(e.message)
                process.exit()
            })
            child.on('exit',e=>{
                log.verbose('命令执行成功：'+e)
                process.exit(e)
            })
        }catch (e){
            log.error(e.message,'1')
        }
    }
}

// windows 兼容
function spawn(command,args,options){
    const win32=process.platform==='win32';
    const cmd=win32?'cmd':command;
    const cmdArgs=win32?['/c'].concat(command,args):args;
    return cp.spawn(cmd,cmdArgs,options||{});
}

module.exports = exec;