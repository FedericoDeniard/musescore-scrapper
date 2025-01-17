import puppeteer, { Browser } from "puppeteer";
import { AvailableExtensions, convertImageToPdf, downloadImage, getExtensionFromUrl, getInput, removeImages } from "./utils";

const main = async () => {

    const url = await getInput('Enter the url of the musescore: ')
    const browser: Browser = await puppeteer.launch();
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
        let imgExtension: AvailableExtensions | undefined;
        for (let i = 0; i < sheets.length; i++) {
            const element = sheets[i];
            await element.evaluate((element) => {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            })

            try {
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
                    console.log("No img element")
                    continue
                }
                const imgSrc = await imgElement.evaluate(img => img.src)
                if (!imgExtension) {
                    imgExtension = getExtensionFromUrl(imgSrc)
                }
                const imgName = `img-${i}${imgExtension}`
                await downloadImage(imgSrc, "./sheets/" + imgName)
                await convertImageToPdf("./sheets/", "./sheets", imgExtension, title)
                await removeImages("./sheets/")
            } catch (error) {
                console.log(error)
            }
        }
        browser.close()
        console.log("Script finished")
    }
}
main()