'use strict';
const colors=require('colors');
const semver=require('semver');

const lowestVersion='13.0.0';
class command{
    // TODO
    constructor(argv) {
        console.log('Command constructor!',argv)
        if(!argv){
            throw new Error('参数不能为空！')
        }
        this._argv=argv;
        let runner=new Promise((resolve,reject)=>{
            let chain=Promise.resolve()
            chain=chain.then();
            chain.catch(err=>{
                console.log(err.message)
            })
        })
    }
    checkNodeVersion(){
        // 获取当前 node 版本号
        const currentVersion=process.version;
        if(!semver.gte(currentVersion,lowestVersion)){
            throw new Error(colors.red(`cxvh-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`));
        }
        // 比对最低版本号
    }
    init(){
        //
    }
    exec(){
        //
    }
}
module.exports = command;





