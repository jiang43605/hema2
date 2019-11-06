const grammarMap = [];

module.exports = function parse(md) {
    const blcokg = grammarMap
        .filter(item => item.type === 'block')
        .map(item => item);

    // p 标签内置
    // 最后都匹配不到默认 p 标签
    blcokg.push(pParse);
    const lines = md.split('\n').filter(item => !!item);

    const inlineg = grammarMap
        .filter(item => item.type === 'inline')
        .map(item => item);

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
    grammarMap.push(blockCodeParse);
    grammarMap.push(blockquoteParse);
    grammarMap.push(hParse);
    grammarMap.push(strongParse);
    grammarMap.push(inlineCodeParse);
    grammarMap.push(aParse);
    grammarMap.push(imgParse);
}

// p
function pParse(lines) {
    const REGEX = /^<.*>.*<\/.*>$/;
    for (let i = 0; i < lines.length; i++) {
        if (skipBlockCodeParse(lines, i)) continue;
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
        if (skipBlockCodeParse(lines, i)) continue;
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
        if (skipBlockCodeParse(lines, i)) continue;
        lines[i] = lines[i].replace(REGEX, '<strong>$1</strong>');
    }
}

// inline code 
inlineCodeParse.type = 'inline';
function inlineCodeParse(lines) {
    const REGEX = /`(.+)`/g;
    for (let i = 0; i < lines.length; i++) {
        if (skipBlockCodeParse(lines, i)) continue;
        if (/^<p>```\w{0,5}<\/p>$/.test(lines[i])) continue;
        lines[i] = lines[i].replace(REGEX, '<code>$1</code>');
    }
}

// a
aParse.type = 'inline';
function aParse(lines) {
    const REGEX = /\[(.*)\]\((.*)\)/g;
    for (let i = 0; i < lines.length; i++) {
        if (skipBlockCodeParse(lines, i)) continue;
        lines[i] = lines[i].replace(REGEX, (match, p1, p2, p3) => {
            if (lines[i].includes(`!${match}`)) return match;
            return `<a href="${p2}">${p1}</a>`;
        });
    }
}

// img
imgParse.type = 'inline';
function imgParse(lines) {
    const REGEX = /!\[(.*)\]\((.*)\)/g;
    for (let i = 0; i < lines.length; i++) {
        if (skipBlockCodeParse(lines, i)) continue;
        lines[i] = lines[i].replace(REGEX, '<img href="$2" alt="$1"/>');
    }
}

// 块代码
blockCodeParse.type = 'block';
function blockCodeParse(lines) {
    const temp = [[]];
    for (let i = 0; i < lines.length; i++) {
        if (/```\w{0,5}/.test(lines[i])) {
            if (temp[temp.length - 1].length) {
                temp[temp.length - 1].push(i);
                temp.push([]);
                continue;
            }

            temp[temp.length - 1].push(i);
        }
    }

    temp.forEach(block => {
        if (!block.length) return;
        if (lines[block[1]] !== '```') return;
        lines[block[0]] = '<pre><code>';
        lines[block[1]] = '</code></pre>'
        for (let i = block[0] + 1; i < block[1]; i++) {
            lines[i] = escapeHtml(lines[i]);
        }
    });
}

// blockquote
blockquoteParse.type = 'block';
function blockquoteParse(lines) {
    const temp = [[]];
    for (let i = 0; i < lines.length; i++) {
        if (/^>\s+.*/.test(lines[i])) {
            temp[temp.length - 1].push(i);
        } else if (lines[i] === '>' && temp[temp.length - 1].length) {
            temp[temp.length - 1].push(i);
        } else if (temp[temp.length - 1].length) {
            temp.push([]);
        }
    }

    temp.forEach(block => {
        if (!block.length) return;
        block.forEach(index => lines[index] = lines[index].replace(/^>\s*/, ''));
        lines[block[0]] = `<blockquote><p>${lines[block[0]]}</p>`;
        lines[block[block.length - 1]] = `<p>${lines[block[block.length - 1]]}</p></blockquote>`;
    });
}

function skipBlockCodeParse(lines, index) {
    const temp = [[]];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === '<pre><code>') {
            temp[temp.length - 1].push(i);
            continue;
        }

        if (lines[i] === '</code></pre>') {
            if (temp[temp.length - 1].length) {
                temp[temp.length - 1].push(i);
                temp.push([]);
                continue;
            }
        }
    }

    if (!temp[0].length) return false;

    for (const item of temp) {
        if (index >= item[0] && index <= item[1]) {
            return true;
        }
    }
}

function escapeHtml(text) {
    return text.replace(/>/g, '&gt;')
        .replace(/</g, '&lt;');
}

registerGrammar();