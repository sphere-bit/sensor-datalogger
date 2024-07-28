
// SAVE SENSOR DATA TO sensorData.json Implementation
let isSavingData = false;
let fileHandle = null;
const toggleSaveButton = document.getElementById('toggle-save-button');
const fileNameInput = document.getElementById('file-name');
let sensorData = [];

const saveSensorData = async () => {
  if (!fileHandle) {
    // console.error('No file handle available. Cannot save data.');
    return;
  }
  try {
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(sensorData.join('\n'));
    await writableStream.close();
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

const collectSensorData = (data) => {
  // Example function to collect sensor data
  sensorData.push(data);
};

const startSavingData = async () => {
  const fileName = fileNameInput.value.trim() || `sensordata_${new Date().toISOString().replace(/[:.-]/g, '_')}.txt`;
  try {
    fileHandle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{
        description: 'Text files',
        accept: {
          'text/plain': ['.txt'],
        },
      }],
    });
    isSavingData = true;
    toggleSaveButton.textContent = 'Pause Logging to File';
    sensorData = []; // Clear previous data
    socket.on('serial-data', collectSensorData);
  } catch (error) {
    console.error('Error selecting file:', error);
  }
};

const stopSavingData = () => {
  isSavingData = false;
  toggleSaveButton.textContent = 'Start Logging to File';
  socket.off('serial-data', collectSensorData);
  saveSensorData();
};

toggleSaveButton.addEventListener('click', () => {
  if (isSavingData) {
    stopSavingData();
  } else {
    startSavingData();
  }
});