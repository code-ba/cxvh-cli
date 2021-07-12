'use strict';
const colors=require('colors');
const semver=require('semver');
const log = require('@cxvh-cli/log')
const {isObject}=require('@cxvh-cli/utils')

const lowestVersion='13.0.0';
class command{
    // TODO
    constructor(argv) {
        // log.verbose('Command constructor!',argv)
        if(!argv){
            throw new Error('参数不能为空！')
        }
        // if(!isObject(argv)){
        //     throw new Error('参数必须为对象！')
        // }
        if(!Array.isArray(argv)){
            throw new Error('参数必须为数组！')
        }
        if(argv.length<1){
            throw new Error('参数列表为空！')
        }
        this._argv=argv;
        let _self=this;
        let runner=new Promise((resolve,reject)=>{
            let chain=Promise.resolve()
            chain=chain.then(()=>this.checkNodeVersion());
            chain=chain.then(()=>this.initArgs());
            chain=chain.then(()=>this.init());
            chain=chain.then(()=>this.exec());
            chain.catch(err=>{
                log.error(err.message,4)
            })
        })
    }
    initArgs(){
        this._cmd=this._argv[this._argv.length-1]
        this._argv=this._argv.slice(0,this._argv.length-1)
        // console.log(this._cmd,this._argv);
    }
    checkNodeVersion(){
        // 获取当前 node 版本号
        const currentVersion=process.version;
        if(!semver.gte(currentVersion,lowestVersion)){
            throw new Error(colors.red(`cxvh-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`));
        }
        // 比对最低版本号
    }
    init1(){
        //
        console.log('init')
        return 123
    }
    exec1(){
        //
        console.log('exec')
    }
}
module.exports = command;