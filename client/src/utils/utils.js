/**
 * A simple CSV parser.
 * @param {string} csvText The raw string content of a CSV file.
 * @returns {Array<Object>} An array of objects, where each object represents a row.
 */
export const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') {
    return [];
  }
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    if (values.length !== headers.length) {
      continue;
    }
    const rowObject = {};
    headers.forEach((header, index) => {
      const value = values[index];
      rowObject[header] = !isNaN(value) && value.trim() !== '' ? Number(value) : value;
    });
    data.push(rowObject);
  }
  return data;
};

/**
 * Parses a KML text string into an XML Document.
 * @param {string} kmlText The raw string content of a KML file.
 * @returns {XMLDocument} A parsed XML document.
 */
export const parseKML = (kmlText) => {
  if (!kmlText || typeof kmlText !== 'string') {
    // Return an empty XML document to prevent errors downstream
    kmlText = '<?xml version="1.0" encoding="UTF-8"?>';
  }
  const parser = new DOMParser();
  return parser.parseFromString(kmlText, 'text/xml');
};