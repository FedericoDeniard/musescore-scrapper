import puppeteer, { Browser, ProtocolError, TimeoutError } from "puppeteer";
import { AvailableExtensions, convertImageToPdf, downloadImage, getExtensionFromUrl } from "../utils/index";

export const downloadSheet = async (url: string): Promise<{ images: string[], pdf: string }> => {
    const browser: Browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();

        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(url);


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
            let imgExtension: AvailableExtensions | undefined = undefined;
            const imagesPaths: string[] = []
            for (let i = 0; i < sheets.length; i++) {
                const element = sheets[i];
                if (!element) {
                    throw new Error("We couldn't find any sheet, please check the url and try again")
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
                    {},
                    element
                );
                const imgElement = await element.$('img')
                if (!imgElement) {
                    continue
                }
                const imgSrc = await imgElement.evaluate(img => img.src)
                if (imgExtension === undefined) {
                    imgExtension = getExtensionFromUrl(imgSrc)
                }
                const imgName = `img-${i}${imgExtension}`
                const image = await downloadImage(imgSrc, "./sheets/" + imgName)
                imagesPaths.push(image)

            }
            const doc = await convertImageToPdf("./sheets/", "./sheets", imgExtension, title)
            return { images: imagesPaths, pdf: doc }
        }
        else {
            throw new Error("We couldn't find any sheet, please check the url and try again")
        }
    } catch (e) {
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
        browser.close()
        console.log("Script finished")
    }

}