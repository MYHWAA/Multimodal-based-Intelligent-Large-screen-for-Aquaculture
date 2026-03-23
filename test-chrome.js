const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m"
};

function log(message, type = 'info') {
    if (type === 'success') console.log(`${colors.green}✓ ${message}${colors.reset}`);
    else if (type === 'error') console.error(`${colors.red}✗ ${message}${colors.reset}`);
    else if (type === 'warn') console.warn(`${colors.yellow}! ${message}${colors.reset}`);
    else console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
}

function checkFileExists(filePath) {
    if (fs.existsSync(filePath)) {
        log(`File exists: ${filePath}`, 'success');
        return true;
    } else {
        log(`File missing: ${filePath}`, 'error');
        return false;
    }
}

function checkContent(filePath, regex, description) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (regex.test(content)) {
        log(`${description} found`, 'success');
        return true;
    } else {
        log(`${description} missing`, 'error');
        return false;
    }
}

log("Starting Chrome Compatibility Check...");

// 1. Check File Structure
const indexHtmlPath = path.join(__dirname, 'index.html');
const styleCssPath = path.join(__dirname, 'css', 'main.css');
const postcssConfigPath = path.join(__dirname, 'postcss.config.js');

let allPassed = true;

if (!checkFileExists(indexHtmlPath)) allPassed = false;
if (!checkFileExists(styleCssPath)) allPassed = false;
if (!checkFileExists(postcssConfigPath)) allPassed = false;

// 2. Check HTML Compatibility
if (checkFileExists(indexHtmlPath)) {
    log("Checking index.html for Chrome compatibility tags...");
    if (!checkContent(indexHtmlPath, /<meta\s+name=["']viewport["']\s+content=["'][^"']*width=device-width[^"']*["']\s*\/?>/i, "Viewport meta tag")) allPassed = false;
    if (!checkContent(indexHtmlPath, /loading=["']lazy["']/i, "Image lazy loading")) allPassed = false;
}

// 3. Check CSS Compatibility
if (checkFileExists(styleCssPath)) {
    log("Checking style.css for Chrome compatibility rules...");
    if (!checkContent(styleCssPath, /-webkit-text-size-adjust/, "-webkit-text-size-adjust")) allPassed = false;
    if (!checkContent(styleCssPath, /-webkit-font-smoothing/, "-webkit-font-smoothing")) allPassed = false;
    if (!checkContent(styleCssPath, /@import\s+['"]normalize\.css['"]/, "normalize.css import")) allPassed = false;
    if (!checkContent(styleCssPath, /rem\s*[;}]/, "rem units usage")) allPassed = false;
    if (!checkContent(styleCssPath, /@media/, "Media queries")) allPassed = false;
}

// 4. Check PostCSS Config
if (checkFileExists(postcssConfigPath)) {
    log("Checking postcss.config.js...");
    if (!checkContent(postcssConfigPath, /postcss-preset-env/, "postcss-preset-env plugin")) allPassed = false;
}

if (allPassed) {
    console.log(`\n${colors.green}All Chrome compatibility checks passed!${colors.reset}`);
    process.exit(0);
} else {
    console.error(`\n${colors.red}Some Chrome compatibility checks failed.${colors.reset}`);
    process.exit(1);
}
