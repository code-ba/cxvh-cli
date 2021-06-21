'use strict';
const path = require('path')
const Package = require('@cxvh-cli/package')
const log = require('@cxvh-cli/log')
const SETTINGS = {
    init: '@cxvh-cli/init'
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
    // 在当前进程中调用
    rootFile&&require(rootFile).apply(null,arguments); // 数组转参数
    // 在 node 子进程中调用
    rootFile&&require(rootFile).apply(null,arguments); // 数组转参数
}

module.exports = exec;