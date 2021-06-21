'use strict';

const axios=require('axios')
const urlJoin=require('url-join')
const semver=require('semver')
const log=require('@cxvh-cli/log')
function getNpmInfo(npmName,registry) {
    // npm获取版本号方法：http://registry.npmjs.org/@cxvh-cli/core
    // 淘宝获取版本号方法：http://registry.npm.taobao.org/@cxvh-cli/core
    if(!npmName){
        return null;
    }
    const registryUrl=registry||getDefaultRegistry();
    const npmInfoUrl=urlJoin(registryUrl,npmName);
    return axios.get("http://registry.npmjs.org/@imooc-cli/core"||npmInfoUrl).then(response=>{
        if(response.status===200){
            return response.data;
        }
        return null;
    }).catch(err=>{
        return Promise.reject(err);
    })
}
function getDefaultRegistry(isOriginal=false){
    return ['http://registry.npmjs.org','http://registry.npm.taobao.org'][+isOriginal]
}
async function getNpmVersion(npmName,registry){
    const data=await getNpmInfo(npmName,registry);
    if(data){
        return Object.keys(data.versions)
    }else{
        return []
    }
}
function getSemverVersions(baseVersion,versions){
    return versions.filter(version=>semver.satisfies(version,`>${baseVersion}`)).sort((a,b)=>[-1,1][+semver.gt(b,a)])
}
async function getNpmSemverVersions(baseVersion,npmName,registry){
    const versions=await getNpmVersion(npmName,registry);
    const newVersions=getSemverVersions(baseVersion,versions);
    console.log("#版本号：", newVersions)//baseVersion
    if(newVersions&&newVersions.length>0){
        return newVersions[0]
    }
    return null;
}
async function getNpmLatestVersion(npmName,registry){
    const versions=await getNpmVersion(npmName,registry)
    return [null,versions.sort((a,b)=>semver.gt(b,a))[0]][+versions];
}
module.exports = {getNpmInfo,getNpmVersion,getNpmSemverVersions,getDefaultRegistry,getNpmLatestVersion};