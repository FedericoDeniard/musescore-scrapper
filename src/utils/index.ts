import readline from 'readline'
import * as path from 'path';
import * as https from 'https';
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from 'fs';
import sharp from 'sharp';
import SVGtoPDF from 'svg-to-pdfkit';
import PDFDocument from 'pdfkit';

export type AvailableExtensions = '.jpg' | '.png' | '.svg'

interface SVGDimensions {
    width: number;
    height: number;
}

export const getInput = (message: string) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise<string>((resolve) => {
        rl.question(message, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

export function getExtensionFromUrl(url: string): AvailableExtensions {

    // const extension = path.extname(url).split('?')[0];
    // if (extension) {
    //     return extension;
    // }

    if (url.includes('image/jpeg') || url.includes('.jpg')) return '.jpg';
    if (url.includes('image/png') || url.includes('.png')) return '.png';
    if (url.includes('image/svg+xml') || url.includes('.svg')) return '.svg';

    throw new Error('Extension not found');

}

export async function downloadImage(url: string, filepath: string): Promise<void> {
    if (!existsSync(path.dirname(filepath))) {
        mkdirSync(path.dirname(filepath), { recursive: true });
    }
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const fileStream = createWriteStream(filepath);
                res.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });

                fileStream.on('error', (err) => {
                    reject(err);
                });
            } else {
                res.resume();
                reject(new Error(`Request Failed: ${res.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

export const getImageSize = async (imagePath: string): Promise<{ width: number, height: number }> => {
    try {
        const metadata = await sharp(imagePath).metadata();
        if (!metadata) throw new Error('Metadata not found');
        return { width: metadata.width || 0, height: metadata.height || 0 };

    } catch (error) {
        throw new Error(`Error getting image size: ${error}`);
    }

}

function getDimensions(svgContent: string): SVGDimensions {
    const heightRegex = /height\s*=\s*["']([\d.]+)["']/;
    const widthRegex = /width\s*=\s*["']([\d.]+)["']/;

    const matchHeight = svgContent.match(heightRegex);
    const matchWidth = svgContent.match(widthRegex);

    if (!matchHeight || !matchWidth) {
        return { width: 0, height: 0 };
    }

    const height = parseFloat(matchHeight[1]);
    const width = parseFloat(matchWidth[1]);

    return { width, height };

}

export async function convertImageToPdf(imagePath: string, pdfPath: string, extension: AvailableExtensions, pdfTitle: string) {
    const files = readdirSync(imagePath).filter(file => !file.toLocaleLowerCase().endsWith('.pdf'))
    const doc = new PDFDocument({ autoFirstPage: false })
    if (!existsSync(pdfPath)) {
        mkdirSync(pdfPath, { recursive: true });
    }
    let savePath = path.join('sheets', pdfTitle + '.pdf')
    doc.pipe(createWriteStream(savePath))
    let dimensions: SVGDimensions = { width: 0, height: 0 }
    for (let i = 0; i < files.length; i++) {
        if (extension === '.svg') {
            const svgContent = readFileSync(path.join(imagePath, files[i]), 'utf-8');
            dimensions = getDimensions(svgContent);
            doc.addPage({ size: [dimensions.width, dimensions.height] })
            SVGtoPDF(doc, svgContent, 0, 0, {})
        } else {
            doc.addPage()
            doc.image(path.join(imagePath, files[i]), {
                fit: [doc.page.width, doc.page.height],
                align: 'center',
                valign: 'center'
            })
        }
    }
    doc.save().end()
}

export async function removeImages(imagePath: string) {
    const files = readdirSync(imagePath).filter(file => !file.toLocaleLowerCase().endsWith('.pdf'))
    for (const file of files) {
            unlinkSync(path.join(imagePath, file));
        }
    }


