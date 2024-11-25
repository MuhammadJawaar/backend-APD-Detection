const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Google Cloud Storage configuration
const bucketName = "your-bucket-name"; // Ganti dengan nama bucket Anda
const storage = new Storage();
const bucket = storage.bucket(bucketName);

// Konfigurasi multer untuk penyimpanan sementara sebelum upload ke GCS
const upload = multer({
    storage: multer.memoryStorage(),
});

// Endpoint untuk upload file
app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Nama file unik
        const fileName = `${Date.now()}-${file.originalname}`;
        const blob = bucket.file(fileName);

        // Upload file ke GCS
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on("error", (err) => {
            console.error(err);
            res.status(500).json({ error: "Failed to upload to Google Cloud Storage" });
        });

        blobStream.on("finish", async () => {
            // Dapatkan URL publik file (jika bucket publik)
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

            // Tambahkan logika prediksi ML di sini jika diperlukan
            // Contoh respons dummy
            res.status(200).json({
                message: "File uploaded successfully",
                fileName: fileName,
                publicUrl: publicUrl,
            });
        });

        blobStream.end(file.buffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
