const fs = require('fs');
const path = require('path');
const nextDirs = [
    'd:/Client_Projects/Naivora/client/.next/dev/server/chunks/ssr',
    'd:/Client_Projects/Naivora/client/.next/dev/static/chunks'
];

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
                
                // Match anything inside Naivora/client/Components
                let isTarget = false;
                let targetPath = '';
                
                const srcPaths = sourcesStr.split(',');
                for (let src of srcPaths) {
                    if (src.includes('Naivora/client/Components/')) {
                        isTarget = true;
                        // extract exact path
                        targetPath = src.replace(/"/g, '').replace(/file:\/\/\//g, '').replace(/D:\/Client_Projects\/Naivora\/client\//i, '');
                        // ensure forward slashes
                        targetPath = targetPath.replace(/\\/g, '/');
                        break;
                    }
                }
                
                if (isTarget) {
                    const scStart = chunk.indexOf('"sourcesContent":[') + 18;
                    let startQuote = chunk.indexOf('"', scStart);
                    if (startQuote !== -1) {
                        let endQuote = -1;
                        for (let j = startQuote + 1; j < chunk.length; j++) {
                            if (chunk[j] === '"' && chunk[j-1] !== '\\') {
                                endQuote = j;
                                break;
                            }
                        }
                        if (endQuote !== -1) {
                            let srcContent = chunk.substring(startQuote, endQuote + 1);
                            try {
                                let parsed = JSON.parse(srcContent);
                                if (parsed.length > 200) {
                                    recovered[targetPath] = parsed;
                                }
                            } catch(e) {}
                        }
                    }
                }
            }
        } catch(e) {}
    }
}

for (const savePath in recovered) {
    let fullSavePath = path.join('d:/Client_Projects/Naivora/client', savePath);
    if (!fs.existsSync(fullSavePath)) {
        fs.mkdirSync(path.dirname(fullSavePath), { recursive: true });
        fs.writeFileSync(fullSavePath, recovered[savePath]);
        console.log('Restored fully from sourcemap:', savePath);
    }
}
