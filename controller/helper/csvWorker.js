const { Worker,parentPort } = require('worker_threads');
const fs = require('fs');
const csv = require('csv-parser')

function processCSV(csvFilePath) {
    const processedData = [];
  
    const readStream = fs.createReadStream(csvFilePath);
  
    return new Promise((resolve, reject) => {
      readStream
        .pipe(csv())
        .on('data', (row) => {
          //  console.log(row)
          // Process each row of the CSV data
          processedData.push(row);
        })
        .on('error', (error) => {
          reject(error);
        })
        .on('end', () => {
          resolve(processedData); // Resolve the promise with the processed data
        });
    });
  }

  parentPort.on('message',async (message) => {
    const { csvFilePath } = message;
    const processedData = await processCSV(csvFilePath);
    //console.log(processedData,'processedData')
    parentPort.postMessage(processedData); // Send processed data back to the main thread
  });

