# Musescore Scrapper App

This is a simple web application that allows you to generate a PDF from a sheet music score published on Musescore. It uses web scraping techniques to retrieve the images of the score and compile them into a single downloadable file. The PDF is automatically downloaded by the browser, since the backend sends it directly using `res.file`.

## ✨ Access the App

You can access the application through the following link:

👉 [https://musescore-scrapper-production.up.railway.app/](https://musescore-scrapper-production.up.railway.app/)

## 🔧 How It Works

1. When you visit the app, you'll see a very simple interface.
2. There is a text input where you can paste the URL of a Musescore sheet music score.
3. Click the submit button.
4. The app sends a POST request to the API. The URL you entered is included in the body under the `url` key.
5. The backend scrapes the given page, retrieves all the sheet images, and compiles them into a single PDF file.
6. The backend sends the resulting PDF using `res.file`, which causes the browser to automatically start downloading the file.

## ✍️ Example Usage

1. Copy a Musescore URL (e.g., `https://musescore.com/user/12345678/scores/87654321`).
2. Paste it into the input field.
3. Click the button.
4. Wait a few seconds while the PDF is generated.
5. Done! The PDF will automatically start downloading to your device.

---

> This tool was created for educational and personal use. Make sure to respect copyright laws when using content from Musescore.
> This app is hosted on [Railway](https://www.railway.app/).
