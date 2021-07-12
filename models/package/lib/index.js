'use strict';
const path = require('path')
const fse=require('fs-extra')
const pkgDir = require('pkg-dir').sync;
const pathExists = require('path-exists').sync;
const npminstall = require('npminstall');
const {isObject} = require("@cxvh-cli/utils")
const formatPath = require("@cxvh-cli/format-path")
const {getDefaultRegistry,getNpmLatestVersion} = require("@cxvh-cli/get-npm-info")

/**
 * 1.targetPath -> modulePath
 * 2.modulePath -> Package(npm模块)
 * 3.Package.getRootFile(获取入口文件)
 * 4.Package.update / Package.install
 *
 * 封装 -> 复用
 */
class Package {
    constructor(options) {
        if (!options) {
            throw new Error('Package 类的 options 参数不能为空！');
        }
        if (!isObject(options)) {
            throw new Error('Package 类的 options 参数类型必须为对象！');
        }
        console.log('Package constructor');
        // package 的目标路径
        this.targetPath = options.targetPath;
        // package 的缓存路径
        this.storeDir = options.storeDir;
        // package 的 name
        this.packageName = options.packageName;
        // package 的 version
        this.packageVersion = options.version;
        // package 的缓存目录前缀
        this.cacheFilePathPrefix=this.packageName.replace('/','_');
    }
    async prepare(){
        if(this.storeDir && !pathExists(this.storeDir)){
            fse.mkdirpSync(this.storeDir)
        }
        if(this.packageVersion==='latest'){
            this.packageVersion=await getNpmLatestVersion(this.packageName)
        }
        // _@cxvh-cli_init@1.1.1@@cxvh-cli/
        // @cxvh-cli/init 1.1.2
        // _@cxvh-cli_init@1.1.1@@cxvh-cli/
        console.log(this.packageVersion)
    }

    get cacheFilePath(){
        return path.resolve(this.storeDir,`_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
    }
    getSpecificCacheFilePath(packageVersion){
        return path.resolve(this.storeDir,`_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
    }

    // 判断当前 Package 是否存在
    async exists() {
        // 缓存模式
        if (this.storeDir) {
            await this.prepare();
            return pathExists(this.cacheFilePath)
        } else {
            return pathExists(this.targetPath)
        }
    }

    // 安装 Package
    async install() {
        await this.prepare();
        return npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(true),//'https://registry.npmjs.org',
            pkgs: [
                // {name:'foo',version:'~1.0.0'}
                {
                    name: this.packageName,
                    version: this.packageVersion
                }
            ]
        })
    }

    // 更新 Package
    async update() {
        await this.prepare()
        // 1.获取最新的 npm 模块版本号
        const latestPackageVersion=await getNpmLatestVersion(this.packageName);
        // 2.查询最新版本号对应的路径是否存在
        const latestFilePath=this.getSpecificCacheFilePath(latestPackageVersion)
        // 3.如果不存在，则直接安装最新版本
        if(!pathExists(latestFilePath)){
            await npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(true),//'https://registry.npmjs.org',
                pkgs: [
                    // {name:'foo',version:'~1.0.0'}
                    {
                        name: this.packageName,
                        version: latestPackageVersion
                    }
                ]
            })
            this.packageVersion=latestPackageVersion;
        }
        return latestFilePath;
    }

    // 获取入口文件的路径
    getRootFilePath() {
        /**
         * 1.获取 package.json 所在目录 - pkg-dir
         * 2.读取 package.json - require()
         * 3.寻找 main/lib - path
         * 4.路径的兼容（macOS/windows）
         */

        function _getRootFilePath(targetPath){
            // 1.获取 package.json 所在目录 - pkg-dir
            const dir = pkgDir(targetPath);
            if (!dir) {
                return null;
            }
            // 2.读取 package.json - require()
            const pkgFile = require(path.resolve(dir, 'package.json'))
            // 3.寻找 main/lib - path
            if (!pkgFile || !(pkgFile.main || pkgFile.lib)) {
                return null;
            }
            // 4.路径的兼容（macOS/windows）
            return formatPath(path.resolve(dir, (pkgFile.main || pkgFile.lib)))
        }
        if(this.storeDir){
            return _getRootFilePath(this.cacheFilePath)
        }
        return _getRootFilePath(this.targetPath);
    }
}

module.exports = Package;