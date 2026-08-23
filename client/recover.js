const fs = require('fs');
const path = require('path');
const transcripts = [
    'C:/Users/spotl/.gemini/antigravity-ide/brain/7db02a8c-15fd-4529-a665-97b0a1b55a3e/.system_generated/logs/transcript_full.jsonl'
];

let filesToRestore = {};

for (const file of transcripts) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.includes('File Path: `file:///d:/Client_Projects/Naivora/client/Components/')) {
            try {
                const obj = JSON.parse(line);
                function findText(o) {
                    if (typeof o === 'string' && o.includes('File Path: `file:///d:/Client_Projects/Naivora/client/Components/')) return o;
                    if (typeof o === 'object' && o !== null) {
                        for (let k in o) {
                            let res = findText(o[k]);
                            if (res) return res;
                        }
                    }
                    return null;
                }
                const text = findText(obj);
                if (text) {
                    // Extract path
                    const marker = 'File Path: `file:///d:/Client_Projects/Naivora/client/Components/';
                    const startIndex = text.indexOf(marker) + marker.length - 'd:/Client_Projects/Naivora/client/Components/'.length;
                    const endIndex = text.indexOf('`', startIndex);
                    let fp = text.substring(startIndex, endIndex);
                    
                    let parts = text.split('\n');
                    let source = [];
                    for (const p of parts) {
                        if (p.match(/^\d+: /)) {
                            source.push(p.replace(/^\d+: /, ''));
                        }
                    }
                    if (source.length > 0) {
                        filesToRestore[fp.toLowerCase()] = { fp, source: source.join('\n') };
                    }
                }
            } catch(e) {}
        }
    }
}

for (const k in filesToRestore) {
    const { fp, source } = filesToRestore[k];
    let newPath = fp.replace(/\\/g, '/'); // d:/Client_Projects/Naivora/client/Components/...
    fs.mkdirSync(path.dirname(newPath), { recursive: true });
    fs.writeFileSync(newPath, source);
    console.log('Restored', newPath);
}

// ALSO copy AllProducts from jaihind!
const allProductsSrc = 'd:/Client_Projects/jaihind/client/src/Pages/AllProducts.jsx';
if (fs.existsSync(allProductsSrc)) {
    const dest = 'd:/Client_Projects/Naivora/client/Components/Components/AllProducts.jsx';
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(allProductsSrc, dest);
    console.log('Restored', dest);
}
