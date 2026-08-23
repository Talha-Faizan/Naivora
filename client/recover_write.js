const fs = require('fs');
const path = require('path');
const transcripts = [
    'C:/Users/spotl/.gemini/antigravity-ide/brain/7db02a8c-15fd-4529-a665-97b0a1b55a3e/.system_generated/logs/transcript_full.jsonl'
];

let filesWritten = {};

for (const file of transcripts) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.includes('write_to_file')) {
            try {
                const obj = JSON.parse(line);
                function findCalls(o) {
                    let calls = [];
                    if (Array.isArray(o)) {
                        for(let i=0; i<o.length; i++) calls = calls.concat(findCalls(o[i]));
                    } else if (typeof o === 'object' && o !== null) {
                        if (o.name && (o.name === 'write_to_file' || o.name === 'default_api:write_to_file') && o.args) {
                            calls.push(o.args);
                        } else {
                            for (let k in o) calls = calls.concat(findCalls(o[k]));
                        }
                    }
                    return calls;
                }
                const calls = findCalls(obj);
                for (const args of calls) {
                    if (args.TargetFile && args.TargetFile.toLowerCase().includes('components')) {
                        filesWritten[args.TargetFile.toLowerCase()] = args;
                    }
                }
            } catch(e) {}
        }
    }
}

for (const k in filesWritten) {
    const args = filesWritten[k];
    let newPath = args.TargetFile; 
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(path.dirname(newPath), { recursive: true });
        fs.writeFileSync(newPath, args.CodeContent);
        console.log('Restored from write_to_file:', newPath);
    }
}
