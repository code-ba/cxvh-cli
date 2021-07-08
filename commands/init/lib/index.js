'use strict';
// const log = require('@cxvh-cli/log');
// function init(projectName,cmdObj) {
//     log.info('init',projectName,cmdObj.force,process.env.CLI_TARGET_PATH)
// }
// module.exports = init;
const fs=require('fs')
const fse=require('fs-extra')
const inquirer=require('inquirer')
const Command=require('@cxvh-cli/command');
const log=require('@cxvh-cli/log');
class InitCommand extends Command{
    init(){
        this.projectName=this._argv[0]||'';
        this.force=!!this._cmd.force;
        log.verbose('projectName',this.projectName)
        log.verbose('force',this.force)
    }
    exec() {
        console.log('exec 业务逻辑')
        try{
            // 1. 准备阶段
            this.prepare()
            // 2. 下载模板
            // 3. 安装模板
        }catch (e){
            log.error(e.message,3)
        }
    }
    async prepare(){
        // throw new Error('准备阶段出错了')
        // 1. 判断当前目录是否为空
        const localPath=process.cwd()
        if(!this.isCwdEmpty(localPath)){
            // 询问是否继续创建
            let ifContinue=false;
            if(!this.force){
                ifContinue=(await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'ifContinue',
                        default:false,
                        message: '当前文件夹不为空，是否继续创建项目？'
                    }
                ])).ifContinue;
                if(!ifContinue){
                    return
                }
            }
            if(ifContinue || this.force){
                // 给用户做二次确认
                const {comfirmDelete}=await inquirer.prompt({
                    type:'comfirm',
                    name:'comfirmDelete',
                    default:false,
                    message:'是否确认清空当前目录下的文件？'
                })
                if(comfirmDelete){
                    // 清空当前目录
                    // fse.removeSync() // 删除文件夹还要清空，下面用清空文件夹
                    // fse.emptyDirSync(localPath);
                    console.log('清空当前目录',localPath)
                }
            }
        }
        // 2. 是否启动强制更新
        // 3. 选择创建项目或组件
        // 4. 获取项目的基本信息
    }
    isCwdEmpty(localPath){
        let fileList=fs.readdirSync(localPath)
        // 文件过滤的逻辑
        fileList=fileList.filter(file=>(
            !file.startsWith('.')&&['node_modules'].indexOf(file)<0
        ))
        return !fileList || fileList.length <= 0
    }
}
function init(argv){
    // argv
    // return new InitCommand([]); //argv
    return new InitCommand(argv);
}
module.exports=init;
module.exports.InitCommand=InitCommand;