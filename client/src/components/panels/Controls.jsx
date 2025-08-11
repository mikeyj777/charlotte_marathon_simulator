import React, { useState, useRef } from 'react';

const Controls = ({ onFileLoad }) => { // Accept the onFileLoad prop
  const [selectedYear, setSelectedYear] = useState('2024');
  const [startTime, setStartTime] = useState('07:20');
  const [fileName, setFileName] = useState('');

  const fileInputRef = useRef(null);

  const handleSimulate = () => {
    console.log(`Starting simulation with Year: ${selectedYear}, Start Time: ${startTime}, and File: ${fileName}`);
  };

  const handleLoadFileClick = () => {
    fileInputRef.current.click();
  };

  // When a file is selected, call the function from the parent
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileLoad(file); // Pass the entire file object up to the parent
    }
  };

  return (
    <div className="controls-panel">
      {/* Hidden file input, controlled by the button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".csv"
      />

      <div className="controls-panel__group">
        <label className="controls-panel__label">1. Load Weather Data</label>
        <button className="controls-panel__button--secondary" onClick={handleLoadFileClick}>
          Select Wx Data File
        </button>
        {fileName && <p className="controls-panel__file-name">File: {fileName}</p>}
      </div>

      <div className="controls-panel__group">
        <label htmlFor="year-select" className="controls-panel__label">2. Select Year</label>
        <select
          id="year-select"
          className="controls-panel__select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
          <option value="2018">2018</option>
        </select>
      </div>

      <div className="controls-panel__group">
        <label htmlFor="start-time" className="controls-panel__label">3. Set Start Time</label>
        <input
          type="time"
          id="start-time"
          className="controls-panel__input"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <button className="controls-panel__button" onClick={handleSimulate}>
        GO!
      </button>
    </div>
  );
};

export default Controls;