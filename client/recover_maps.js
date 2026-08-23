const fs = require('fs');
const path = require('path');
const nextDirs = [
    'd:/Client_Projects/Naivora/client/.next/dev/server/chunks/ssr',
    'd:/Client_Projects/Naivora/client/.next/dev/static/chunks'
];

const targetFiles = ['MarqueeHero.js', 'Navbar.js', 'Collections.js', 'SmoothScroll.js'];
let recovered = {};

for (const dir of nextDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (!file.endsWith('.map')) continue;
        const fullPath = path.join(dir, file);
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const chunks = content.split('"sources":[');
            for (let i = 1; i < chunks.length; i++) {
                const chunk = chunks[i];
                if (!chunk.includes('"sourcesContent":[')) continue;
                
                const sourcesEnd = chunk.indexOf(']');
                const sourcesStr = chunk.substring(0, sourcesEnd);
                
                let isTarget = false;
                let targetName = '';
                for (const t of targetFiles) {
                    if (sourcesStr.includes(t)) {
                        isTarget = true;
                        targetName = t;
                        break;
                    }
                }
                
                if (isTarget) {
                    const scStart = chunk.indexOf('"sourcesContent":[') + 18;
                    let startQuote = chunk.indexOf('"', scStart);
                    if (startQuote !== -1) {
                        let endQuote = -1;
                        for (let j = startQuote + 1; j < chunk.length; j++) {
                            // Check for unescaped quote
                            if (chunk[j] === '"' && chunk[j-1] !== '\\') {
                                endQuote = j;
                                break;
                            }
                        }
                        if (endQuote !== -1) {
                            let srcContent = chunk.substring(startQuote, endQuote + 1);
                            try {
                                let parsed = JSON.parse(srcContent);
                                if (parsed.length > 500) {
                                    recovered[targetName] = parsed;
                                    console.log('Restored', targetName);
                                }
                            } catch(e) {}
                        }
                    }
                }
            }
        } catch(e) {}
    }
}

for (const target in recovered) {
    let savePath = '';
    if (target === 'MarqueeHero.js') savePath = 'Components/Components/MarqueeHero.js';
    if (target === 'Navbar.js') savePath = 'Components/Common/Navbar.js';
    if (target === 'Collections.js') savePath = 'Components/Sections/Home/Collections.js';
    if (target === 'SmoothScroll.js') savePath = 'Components/Common/SmoothScroll.js';
    
    if (savePath) {
        let fullSavePath = path.join('d:/Client_Projects/Naivora/client', savePath);
        fs.mkdirSync(path.dirname(fullSavePath), { recursive: true });
        fs.writeFileSync(fullSavePath, recovered[target]);
    }
}
