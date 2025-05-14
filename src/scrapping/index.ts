import puppeteer, { Browser, ProtocolError, TimeoutError } from "puppeteer";
import { AvailableExtensions, convertImageToPdf, downloadImages, getExtensionFromUrl } from "../utils/index";
import { randomUUID } from "crypto";

export const downloadSheet = async (url: string): Promise<{ images: string[], pdf: string }> => {
    const browser: Browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-features=site-per-process", "--single-process"], headless: true, ignoreDefaultArgs: ['--disable-extensions'], protocolTimeout: 3 * 60 * 1000
    });
    const page = await browser.newPage();
    try {
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5 * 60 * 1000 });

        //Obtain the title
        let title = 'musescore'
        const asideContainerUnique = await page.$('#aside-container-unique')
        if (asideContainerUnique) {
            const titleElement = await page.$('.nFRPI')
            if (titleElement !== null) {
                title = await page.evaluate(element => {
                    return element.querySelector('span')?.textContent || 'musescore';
                }, titleElement);
            }
        }
        console.log("Se obtuvo el titulo: " + title)
        console.log(`Memoria usada: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);
        //Obtain the sheets
        const jmuseScrollerComponent = await page.$('#jmuse-scroller-component')
        if (jmuseScrollerComponent) {
            await jmuseScrollerComponent.evaluate((element) => {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            })
            const sheets = await page.$$('.EEnGW')
            if (sheets.length === 0) {
                throw new Error("No se encontraron hojas en la página. Posiblemente la clase '.EEnGW' cambió o no es una partitura válida.")
            }
            let imgExtension: AvailableExtensions | undefined = undefined;
            const srcPaths: string[] = []
            const imagesPaths: string[] = []
            for (let i = 0; i < sheets.length; i++) {
                const element = sheets[i];
                if (!element) {
                    console.warn(`⚠️ El elemento sheet #${i} está vacío`);
                    continue;
                }
                await element.evaluate((element) => {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                })
                await page.waitForFunction(
                    (el) => {
                        const img = el.querySelector('img');
                        return img && img.complete && img.naturalHeight !== 0;
                    },
                    { timeout: 5 * 60 * 1000 },
                    element
                );
                const imgElement = await element.$('img')
                if (!imgElement) {
                    continue
                }
                const imgSrc = await imgElement.evaluate(img => img.src)
                srcPaths.push(imgSrc)
                console.log("Se obtuvo la imagen numero " + i + ": " + imgSrc)
                console.log(`Memoria usada: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

            }
            console.log("La pagina sigue abierta? " + page.isClosed())
            if (page.isClosed()) await page.close()
            // await browser.close()
            console.log("Se cerraron los navegadores")
            console.log(`Memoria usada: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

            imgExtension = getExtensionFromUrl(srcPaths[0] || "")
            const imageTempNames: string[] = []
            for (const src of srcPaths) {
                const random = randomUUID();
                const imgName = `./sheets/img-${random}${imgExtension}`
                imageTempNames.push(imgName)

            }
            imagesPaths.push(...await downloadImages(srcPaths, imageTempNames))
            console.log("Se descargaron las imagenes: " + imagesPaths.join(", "))
            console.log(`Memoria usada: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

            const doc = await convertImageToPdf(imagesPaths, "./sheets", imgExtension, title)
            console.log("Se descargó el pdf: " + doc)
            console.log(`Memoria usada: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

            return { images: imagesPaths, pdf: doc }
        }
        else {
            throw new Error("We couldn't find any sheet, please check the url and try again")
        }
    } catch (e) {
        console.log(`Memoria usada durante el crasheo de scrapping: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);
        console.log(e)

        if (e instanceof TimeoutError) {
            throw new Error("Timeout error, please try again \n" + e)
        }

        if (e instanceof ProtocolError) {
            throw new Error(e.originalMessage)
        }
        if (e instanceof Error) {
            throw new Error(e.message)
        }

        else {
            throw new Error("Error downloading sheet, please try again \n")
        }
    } finally {
        console.log("Instancia de browser: ", browser)
        try {
            if (!page.isClosed()) {
                await page.close();
            }
        } catch (error) {
            console.log(error)
        }
        try {
            if (browser) {
                await browser.close();
            }
        } catch (error) {
            console.log(error)
        }

    }

}