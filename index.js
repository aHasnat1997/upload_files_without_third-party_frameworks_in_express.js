/**
 * Module dependencies.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

/**
 * Create Express app.
 */
const app = express();
const port = 3000;
const uploadDir = './uploads'; // Specify your upload directory

/**
 * POST endpoint for file upload.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.post('/fileUpload', (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  // Create upload directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let boundary = req.headers['content-type'].split('; ')[1].split('=')[1];
  let chunks = [];
  let contentLength = 0;

  // Collect incoming data chunks
  req.on('data', (chunk) => {
    chunks.push(chunk);
    contentLength += chunk.length;
  });

  // Process uploaded file data when all data received
  req.on('end', () => {
    let buffer = Buffer.concat(chunks, contentLength);
    let boundaryIdx = buffer.indexOf(boundary);
    let boundaryLength = boundary.length;

    // Process each part of multipart data
    while (boundaryIdx !== -1) {
      let nextBoundaryIdx = buffer.indexOf(boundary, boundaryIdx + boundaryLength);
      let part = buffer.slice(boundaryIdx + boundaryLength + 2, nextBoundaryIdx - 2); // Adjust offsets for headers
      let headersEndIdx = part.indexOf('\r\n\r\n');
      let headers = part.slice(0, headersEndIdx).toString();
      let body = part.slice(headersEndIdx + 4);

      // Extract filename from headers
      let filenameMatch = /filename="(.*?)"/.exec(headers);
      let filename = filenameMatch ? filenameMatch[1] : `file_${Date.now()}.dat`;

      // Write file to upload directory
      if (filename) {
        fs.writeFile(path.join(uploadDir, filename), body, (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', description: err.message });
            return;
          }
        });
      } else {
        // No filename provided
        res.status(400).json({ status: 'error', description: 'File not provided in form data' });
      }

      boundaryIdx = nextBoundaryIdx;
    }

    // Cleanup existing .dat files in the upload directory
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error("Error reading upload directory:", err);
        // Handle error if needed
        return;
      }
      files.forEach(file => {
        if (file.endsWith('.dat')) {
          fs.unlink(path.join(uploadDir, file), (err) => {
            if (err) {
              console.error("Error deleting file:", err);
              // Handle error if needed
            }
          });
        }
      });
    });

    // Respond with success status
    res.json({ status: 'success' });
  });
});

/**
 * Start server and listen on specified port.
 */
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
