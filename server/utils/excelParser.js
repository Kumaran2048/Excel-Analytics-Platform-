const XLSX = require('xlsx');
const csv = require('csv-parser');
const { Readable } = require('stream');

const parseExcel = async (buffer, filename) => {
  try {
    const fileExtension = filename ? filename.toLowerCase().substring(filename.lastIndexOf('.')) : '';
    
    if (fileExtension === '.csv') {
     
      return await parseCSV(buffer);
    } else {
      
      return parseXLSX(buffer);
    }
  } catch (error) {
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};

const parseXLSX = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (!jsonData.length) {
      throw new Error('Excel file is empty or contains no data');
    }
    
    
    const headers = Object.keys(jsonData[0]);
    
    const columns = headers.map((header) => {
      const sampleValues = jsonData.slice(0, 5).map(row => row[header]);
      let type = 'string';
      
      
      for (const value of sampleValues) {
        if (value === null || value === undefined || value === '') continue;
        
        if (typeof value === 'number') {
          type = 'number';
          break;
        } else if (!isNaN(Date.parse(value))) {
          type = 'date';
          break;
        } else if (typeof value === 'boolean') {
          type = 'boolean';
          break;
        }
      }
      
      return { name: header, type };
    });
    
    return {
      columns,
      data: jsonData,
      rowCount: jsonData.length,
      columnCount: headers.length
    };
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};


const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    try {
      const stream = Readable.from(buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          if (!results.length) {
            reject(new Error('CSV file is empty or contains no data'));
            return;
          }
          
          
          const headers = Object.keys(results[0]);
          
          
          const columns = headers.map((header) => {
            const sampleValues = results.slice(0, 5).map(row => row[header]);
            let type = 'string';
            
          
            for (const value of sampleValues) {
              if (value === null || value === undefined || value === '') continue;
              
              if (!isNaN(value) && value !== '') {
                type = 'number';
                break;
              } else if (!isNaN(Date.parse(value))) {
                type = 'date';
                break;
              } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                type = 'boolean';
                break;
              }
            }
            
            return { name: header, type };
          });
          
          resolve({
            columns,
            data: results,
            rowCount: results.length,
            columnCount: headers.length
          });
        })
        .on('error', (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        });
    } catch (error) {
      reject(new Error(`Failed to process CSV: ${error.message}`));
    }
  });
};

module.exports = { parseExcel };