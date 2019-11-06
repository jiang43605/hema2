const grammarMap = [];

module.exports = function parse(md) {
    const blcokg = grammarMap
        .filter(item => item[0] === 'block')
        .map(item => item[1]);

    // p 标签内置
    // 最后都匹配不到默认 p 标签
    blcokg.push(pParse);
    const lines = md.split('\n').filter(item => !!item);

    const inlineg = grammarMap
        .filter(item => item[0] === 'inline')
        .map(item => item[1]);

    for (const grammar of blcokg) {
        grammar(lines);
    }

    for (const grammar of inlineg) {
        grammar(lines);
    }

    return lines.join('\n');
}

// 注册语法
// 分为块和 inline 两种
// 可以方便的扩展
function registerGrammar() {
    grammarMap.push([hParse.type, hParse]);
    grammarMap.push([strongParse.type, strongParse]);
    grammarMap.push([inlineCodeParse.type, inlineCodeParse]);
    grammarMap.push([aParse.type, aParse]);
    grammarMap.push([imgParse.type, imgParse]);
}

// p
function pParse(lines) {
    const REGEX = /^<.*>.*<\/.*>$/;
    for (let i = 0; i < lines.length; i++) {
        if (!REGEX.test(lines[i])) {
            lines[i] = `<p>${lines[i]}</p>`
        }
    }
}

// h 
hParse.type = 'block';
function hParse(lines) {
    const REGEX = /^(#+)\s+(.+)/;
    for (let i = 0; i < lines.length; i++) {
        const result = REGEX.exec(lines[i]);
        if (result) {
            const hTag = `h${result[1].length}`;
            lines[i] = `<${hTag}>${result[2]}</${hTag}>`
        }
    }
}

// strong
strongParse.type = 'inline';
function strongParse(lines) {
    const REGEX = /\*\*([^*]+)\*\*/g;
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(REGEX, '<strong>$1</strong>');
    }
}

// inline code 
inlineCodeParse.type = 'inline';
function inlineCodeParse(lines) {
    const REGEX = /`(.+)`/g;
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(REGEX, '<code>$1</code>');
    }
}

// a
aParse.type = 'inline';
function aParse(lines) {
    const REGEX = /\[(.*)\]\((.*)\)/g;
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(REGEX, '<a href="$2">$1</a>');
    }
}

// img
imgParse.type = 'inline';
function imgParse(lines) {
    const REGEX = /!\[(.*)\]\((.*)\)/g;
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(REGEX, '<img href="$2" alt="$1"/>');
    }
}

// 块代码
blockCodeParse.type = 'block';
function blockCodeParse(lines) {
    // 没时间，暂未实现。。。
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === '```') {

        }
    }
}

// blockquote
blockquoteParse.type = 'block';
function blockquoteParse(lines) {
    // 没时间，暂未实现。。。
}

registerGrammar();