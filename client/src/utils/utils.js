/**
 * A simple CSV parser.
 * @param {string} csvText The raw string content of a CSV file.
 * @returns {Array<Object>} An array of objects, where each object represents a row.
 */
export const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') {
    return [];
  }

  // Split the text into lines, trimming any leading/trailing whitespace.
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    // Not enough data to parse (needs at least a header and one data row)
    return [];
  }

  // Extract headers from the first line and trim any extra spaces.
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];

  // Loop through the data rows (starting from the second line).
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    
    // Skip if the number of values doesn't match the number of headers
    if (values.length !== headers.length) {
      continue;
    }

    const rowObject = {};
    headers.forEach((header, index) => {
      const value = values[index];
      // Try to convert to a number if it looks like one, otherwise keep as a string.
      rowObject[header] = !isNaN(value) && value.trim() !== '' ? Number(value) : value;
    });
    data.push(rowObject);
  }

  return data;
};