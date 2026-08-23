const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'Components');
const newRoot = path.join(__dirname, 'components');
const appRoot = path.join(__dirname, 'app');

// 1. Move and rename directories/files
function safeRename(oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        fs.mkdirSync(path.dirname(newPath), { recursive: true });
        fs.renameSync(oldPath, newPath);
        console.log(`Moved: ${oldPath} -> ${newPath}`);
    }
}

// Ensure target directories exist
['layout', 'ui', 'animations', 'sections', 'sections/home', 'sections/products', 'sections/cart', 'sections/profile'].forEach(dir => {
    fs.mkdirSync(path.join(newRoot, dir), { recursive: true });
});
fs.mkdirSync(path.join(__dirname, 'lib'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'hooks'), { recursive: true });

// Move Animations -> animations
if (fs.existsSync(path.join(root, 'Animations'))) {
    fs.readdirSync(path.join(root, 'Animations')).forEach(file => {
        safeRename(path.join(root, 'Animations', file), path.join(newRoot, 'animations', file));
    });
}
// Move Common -> layout
if (fs.existsSync(path.join(root, 'Common'))) {
    fs.readdirSync(path.join(root, 'Common')).forEach(file => {
        safeRename(path.join(root, 'Common', file), path.join(newRoot, 'layout', file));
    });
}
// Move Components -> sections
safeRename(path.join(root, 'Components', 'MarqueeHero.js'), path.join(newRoot, 'sections', 'home', 'MarqueeHero.js'));
safeRename(path.join(root, 'Components', 'AllProducts.jsx'), path.join(newRoot, 'sections', 'products', 'AllProducts.js'));

// Move Sections
const sectionsMapping = { 'Home': 'home', 'Products': 'products', 'Cart': 'cart', 'Profile': 'profile' };
Object.keys(sectionsMapping).forEach(oldDir => {
    const oldPath = path.join(root, 'Sections', oldDir);
    if (fs.existsSync(oldPath)) {
        fs.readdirSync(oldPath).forEach(file => {
            safeRename(path.join(oldPath, file), path.join(newRoot, 'sections', sectionsMapping[oldDir], file));
        });
    }
});

// Move UI
if (fs.existsSync(path.join(root, 'UI'))) {
    fs.readdirSync(path.join(root, 'UI')).forEach(file => {
        safeRename(path.join(root, 'UI', file), path.join(newRoot, 'ui', file));
    });
}

function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const allFiles = [...getFiles(appRoot), ...getFiles(newRoot)];

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Replace import paths
    content = content.replace(/(import\s+.*?from\s+['"])(.*?)(['"])/g, (match, p1, p2, p3) => {
        let newPath = p2;
        
        // Exact mappings for weird relative ones
        newPath = newPath.replace(/\.\.\/\.\.\/Components\/MarqueeHero/, './MarqueeHero');
        newPath = newPath.replace(/\.\.\/\.\.\/Components\/AllProducts/, '../products/AllProducts');
        
        // Root paths (@/Components/...)
        if (newPath.startsWith('@/Components')) {
            newPath = newPath.replace('@/Components/Common', '@/components/layout');
            newPath = newPath.replace('@/Components/Animations', '@/components/animations');
            newPath = newPath.replace('@/Components/UI', '@/components/ui');
            newPath = newPath.replace('@/Components/Sections/Home', '@/components/sections/home');
            newPath = newPath.replace('@/Components/Sections/Products', '@/components/sections/products');
            newPath = newPath.replace('@/Components/Sections/Cart', '@/components/sections/cart');
            newPath = newPath.replace('@/Components/Sections/Profile', '@/components/sections/profile');
            newPath = newPath.replace('@/Components', '@/components');
        }

        // Relative generic folder mappings
        newPath = newPath.replace(/\bCommon\//g, 'layout/');
        newPath = newPath.replace(/\bAnimations\//g, 'animations/');
        newPath = newPath.replace(/\bUI\//g, 'ui/');
        newPath = newPath.replace(/\bSections\/Home\//g, 'sections/home/');
        newPath = newPath.replace(/\bSections\/Products\//g, 'sections/products/');
        newPath = newPath.replace(/\bSections\/Cart\//g, 'sections/cart/');
        newPath = newPath.replace(/\bSections\/Profile\//g, 'sections/profile/');
        newPath = newPath.replace(/([@\.\/]+)Components\//g, '$1components/');

        if (newPath !== p2) {
            console.log(`Updated import in ${path.basename(file)}: ${p2} -> ${newPath}`);
            changed = true;
        }
        return p1 + newPath + p3;
    });

    if (changed) {
        fs.writeFileSync(file, content);
    }
});

// Clean up old directory
try {
    if (fs.existsSync(root)) {
        fs.rmSync(root, { recursive: true, force: true });
        console.log('Removed old Components directory');
    }
} catch (e) {
    console.error('Failed to remove old Components folder', e);
}
