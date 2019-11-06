const parse = require('./parse');
const fs = require('fs');
const path = require('path');

function markdown2html(markdown) {
    let html;

    // TODO: 这里是你的代码
    html = parse(markdown);

    return html;
}

const markdown = fs.readFileSync(
    path.resolve('test.md'),
    { encoding: 'utf8' }
);

fs.writeFileSync(
    path.resolve('test.html'),
    markdown2html(markdown),
    { encoding: 'utf8' }
);

console.log('ok');