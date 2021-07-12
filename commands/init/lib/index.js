'use strict';
// const log = require('@cxvh-cli/log');
// function init(projectName,cmdObj) {
//     log.info('init',projectName,cmdObj.force,process.env.CLI_TARGET_PATH)
// }
// module.exports = init;
const fs=require('fs')
const fse=require('fs-extra')
const inquirer=require('inquirer')
const semver=require('semver');
const Command=require('@cxvh-cli/command');
const log=require('@cxvh-cli/log');

const TYPE_PROJECT='project';
const TYPE_COMPONENT='component'

class InitCommand extends Command{
    init(){
        console.log('-----------------------------------------------------------------------')
        this.projectName=this._argv[0]||'';
        this.force=!!this._cmd.force;
        log.verbose('projectName',this.projectName)
        log.verbose('force',this.force)
    }
    async exec() {
        console.log('########################################################################')
        console.log('exec 业务逻辑')
        try{
            // 1. 准备阶段
            const ret = await this.prepare();
            if(ret){
                // 2. 下载模板
                // 3. 安装模板
                console.log('end!!!!!!!!!!!!!!!!!!!')
            }
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
            // 2. 是否启动强制更新
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
                    fse.emptyDirSync(localPath);
                    console.log('清空当前目录',localPath)
                }
            }
        }
        // 3. 选择创建项目或组件
        // 4. 获取项目的基本信息
        // return 项目的基本信息 (object)
        return this.getProjectInfo();
    }

    async getProjectInfo(){
        const projectInfo={};
        // 1. 选择创建项目或组件
        const {type}=await inquirer.prompt({
            type:'list',
            name:'type',
            message:'请选择初始化类型',
            default:TYPE_PROJECT,
            choices:[{
                name:'项目',
                value:TYPE_PROJECT
            },{
                name:'组件',
                value: TYPE_COMPONENT
            }]
        })
        const o=await inquirer.prompt([{
            type:'input',
            name:'projectName',
            message:'请输入项目名称',
            default:'',
            validate:function (v){
                var done = this.async();
                setTimeout(function() {
                    if (!/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)) {
                        done('请输入正确的项目名称：1.首字符必须为英文字符、2.尾字符必须为英文或数字，不能为字符、字符仅允许"-_"');
                        return;
                    }
                    done(null, true);
                }, 0);
                // 1. 首字符必须为英文字符
                // 2. 尾字符必须为英文或数字，不能为字符
                // 3. 字符仅允许"-_"
                // true：a、a-b、a_b、a-b-c、a_b_c、a-b1-c1、a_b1_c1、a1、a1-b1-c1、a1_b1_c1
                // false：1、a_、a-、a-1
                // return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
            },
            filter:function (v){
                return v;
            }
        },{
            type:'input',
            name:'projectVersion',
            message:'请输入项目版本号',
            default:'1.0.0',
            validate:function (v){
                var done = this.async();
                setTimeout(function() {
                    if (!semver.valid(v)) {
                        done('请输入正确的版本号');
                        return;
                    }
                    done(null, true);
                }, 0);
            },
            filter:function (v){
                if(!!semver.valid(v)){
                    return semver.valid(v)
                }
                return v;
            }
        }])
        console.log(o,111111)
        log.verbose('type',type)
        // 2. 获取项目的基本信息
        if(type===TYPE_PROJECT){
            //
        }else if(type===TYPE_COMPONENT){
            //
        }
        // return 项目的基本信息 (object)
        return projectInfo
    }

    isCwdEmpty(localPath){
        let fileList=fs.readdirSync(localPath)
        console.log(fileList)
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