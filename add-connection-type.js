const fs = require('fs');
const path = require('path');

// 读取文件
const filePath = path.join(__dirname, 'frontend-web01/src/pages/admin/images/ImageEditorPage.vue');
let content = fs.readFileSync(filePath, 'utf8');

// 使用正则表达式批量替换
// 在每个 found: false, 后面添加 connectionType: 'horizontal',
const regex = /(found: false,)/g;
content = content.replace(regex, '$1\n        connectionType: \'horizontal\',');

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('已成功为所有警示点添加 connectionType 字段');
