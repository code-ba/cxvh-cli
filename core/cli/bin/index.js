#! /usr/bin/env node

console.log('hello cxvh-cli');
const importLocal=require('import-local')
if(importLocal(__filename)){
  require('npmlog').info('cli','正在使用 cxvh-cli 本地版本')
}else{
  require('../lib')(process.argv.slice(2))
}