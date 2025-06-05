import KEYS from "./constants/KEYS";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { downloadSheet } from "./scrapping";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { removeImages } from "./utils";
import { validateJWT } from "./middleware/auth";

console.log(KEYS)

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticFiles = path.join(__dirname, "../frontend/dist");
app.use(express.static(staticFiles, {
    maxAge: '30d',
    etag: false,
    immutable: true
}));

app.use(validateJWT);

app.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.body.url;
    console.log("Se inicio la petición de la partitura: " + url)
    const { images, pdf } = await downloadSheet(url);
    console.log("Se termino la petición de la partitura: " + pdf)
    console.log(`Memoria usada: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);
    const files = ["./" + pdf, ...images]
    res.setHeader('Content-Disposition', `attachment; filename="${pdf.split("sheets/")[1]}"`);
    res.sendFile(pdf, { root: "./" }, async (err) => {
        if (err) {
            console.log(err)
            try {
                removeImages(files)
            } catch (error) {
                console.log(error)
            }
            next(err)
        } else {
            removeImages(files)
        }
    })
});


app.use(errorHandler);

app.listen(8000, '0.0.0.0', () => {
    console.log("Escuchando en el puerto " + 8000);
});
