import { mkdirSync, existsSync, rmSync } from 'fs';
import { copyFile, writeFile, readFile, readdir } from 'fs/promises';
import { minify as minifyJS } from 'terser';
import { minify as minifyHTML } from 'html-minifier';
import CleanCSS from 'clean-css';

const outputDir = './build';

/** @type { import('terser').MinifyOptions } */
const jsMinifySettings = {
    module: true,
    ecma: 2020,
    compress: {
        comparisons: false,
        passes: 3,
        unsafe: true
    },
    format: {
        comments: false
    }
};

/** @type { import('html-minifier').Options } */
const htmlMinifySettings = {
    collapseWhitespace: true,
    minifyCSS: true
};

const extensionsToMinifiers = { '.js':  k => minifyJS(k, jsMinifySettings).then(k => k.code),
                                '.css': k => new CleanCSS().minify(k).styles,
                                '.html' : k => minifyHTML(k, htmlMinifySettings) };

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir);

minifyFolder('src', '.');


/**
 * @param { string } inputFolder
 * @param { string } outputFolder
 */
async function minifyFolder(inputFolder, outputFolder) {
    const [ files, folders ] = partitionBy((await readdir(inputFolder)), k => k === 'CNAME' || k.includes('.'));
    const folderPath = `${outputDir}/${outputFolder}`;

    if((files.length + folders.length) > 0) {
        if(!existsSync(folderPath)) {
            mkdirSync(folderPath);
        }

        files.forEach(k => minifyFile(k, inputFolder, outputFolder));
    }

    folders.forEach(k => minifyFolder(`${inputFolder}/${k}`, `${outputFolder}/${k}`));
}

/**
 * @param { string } sourceFile
 * @param { string } inputFolder
 * @param { string } outputFolder
 */
async function minifyFile(sourceFile, inputFolder, outputFolder = '') {
    const extension = sourceFile.substring(sourceFile.lastIndexOf('.'));
    const minifierFunction = extensionsToMinifiers[extension];
    const originalFilePath = `${inputFolder}/${sourceFile}`;

    if(minifierFunction) {
        const originalFileContent = (await readFile(originalFilePath)).toString();
        const minifiedFileContent = await minifierFunction(originalFileContent);

        writeFile(`${outputDir}/${outputFolder}/${sourceFile}`, minifiedFileContent);
    }else{
        copyFile(originalFilePath, `${outputDir}/${outputFolder}/${sourceFile}`);
    }
}

/**
 * @template T
 * @param { T[] } array
 * @param { (k: T) => boolean } predicate
 * @returns {[ T[], T[] ]}
 */
function partitionBy(array, predicate) {
    return array.reduce((result, element) => {
        result[predicate(element) ? 0 : 1].push(element);
        return result;
    }, [[],[]]);
}
