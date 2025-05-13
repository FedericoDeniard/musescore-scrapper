import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { downloadSheet } from "./scrapping";
import { removeImages } from "./utils";
import { unlink } from "fs";

const app = express();

app.use(cors());
app.use(express.json());

// app.use(express.static("../javascript"));


app.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.body.url;
    console.log(url)
    const { images, pdf } = await downloadSheet(url);
    console.log(images, "./" + pdf)
    const files = ["./" + pdf, ...images]
    console.log("llego aca")
    res.setHeader('Content-Disposition', `attachment; filename="${pdf.split("sheets/")[1]}"`);
    res.sendFile(pdf, { root: "./" }, async (err) => {
        console.log("callback")
        if (err) {
            console.log(err)
            next()
        } else {
            for (const image of files) {
                unlink(image, (err) => {
                    if (err) {
                        console.log(err)
                    }
                })
            }
        }
    })
});


app.use(errorHandler);

app.listen(8000, () => {
    console.log("Escuchando en el puerto " + 8000);
});
