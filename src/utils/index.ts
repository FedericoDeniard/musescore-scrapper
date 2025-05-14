import readline from 'readline'
import * as path from 'path';
import * as https from 'https';
import { createWriteStream, constants } from 'fs';
import { mkdir, access, readFile, unlink, writeFile } from 'fs/promises';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import request from "requestretry"

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

    if (url.includes('image/jpeg') || url.includes('.jpg')) return '.jpg';
    if (url.includes('image/png') || url.includes('.png')) return '.png';
    if (url.includes('image/svg+xml') || url.includes('.svg')) return '.svg';

    throw new Error('Extension not supported, please contact the developer');

}

export async function downloadImages(urls: string[], filepath: string[]): Promise<string[]> {
    await Promise.all(filepath.map(async (file) => {
        const dir = path.dirname(file);
        try {
            await access(dir, constants.F_OK);
        } catch {
            await mkdir(dir, { recursive: true });
        }
    }));

    return Promise.all(
        urls.map(async (url, i) => {
            return new Promise<string>((resolve, reject) => {

                request({ url: url, maxAttempts: 5, retryDelay: 1000 }, async (err, response, body) => {
                    if (err) {
                        console.log(`HTTP request error occurred for URL: ${url}.`);
                        reject(err);
                    } else {
                        console.log(`HTTP request successful for URL: ${url}`);
                        const file = filepath[i] || "";

                        try {
                            await writeFile(file, body)
                            resolve(file);
                        } catch (error) {
                            console.log(`Error writing file: ${file}.`);
                            console.log(err)
                            reject(error);
                        }
                    }
                })
            });
        })
    );
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

    const height = parseFloat(matchHeight[1] || "0");
    const width = parseFloat(matchWidth[1] || "0");

    return { width, height };

}

export async function convertImageToPdf(imagePaths: string[], pdfPath: string, extension: AvailableExtensions | undefined, pdfTitle: string) {
    const doc = new PDFDocument({ autoFirstPage: false, font: 'Courier' })
    try {
        await access(pdfPath)
    }
    catch (error) {
        console.log("Error al acceder a la carpeta")
        await mkdir(pdfPath, { recursive: true });
        console.log("Se creó la carpeta")
    }

    pdfTitle = pdfTitle.replaceAll(' ', '_')
    let savePath = path.join(pdfPath, pdfTitle + '.pdf')
    const stream = createWriteStream(savePath)
    doc.pipe(stream)
    let dimensions: SVGDimensions = { width: 0, height: 0 }
    console.log("Las imagenes a convertir son: " + imagePaths.join(", "))
    for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i] || "";
        console.log("Iteracion: " + i + 1 + " de " + imagePaths.length)
        console.log("Se va a convertir la imagen: " + imagePath)
        if (extension === '.svg') {
            const svgContent = await readFile(imagePath, 'utf-8');
            dimensions = getDimensions(svgContent);
            doc.addPage({ size: [dimensions.width - 800, dimensions.height - 800] }) // The dimentions seems to have a 800px margin
            SVGtoPDF(doc, svgContent, 0, 0, {})
        } else {
            doc.addPage()
            doc.image(imagePath, {
                fit: [doc.page.width, doc.page.height],
                align: 'center',
                valign: 'center'
            })
        }
    }
    doc.save().end()


    return new Promise<string>((resolve, reject) => {
        stream.on('finish', () => {
            console.log(`Se guardó el pdf: ${savePath}`);
            resolve(savePath);
        });
        stream.on('error', (err) => {
            console.log("No se pudo guardar el pdf");
            reject(err);
        });
    });
}

export async function removeImages(imagePaths: string[]) {
    for (const path of imagePaths) {
        try {
            await unlink(path);
        } catch (err) {
            console.log(err);
        }
    }
}


