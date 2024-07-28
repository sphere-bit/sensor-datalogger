const socket = io();
let sensorTemps = {}; // to store dict {sensor1: temp, ...}
const selectedSensors = new Set();

// Highcharts configuration
Highcharts.setOptions({
  time: {
    timezoneOffset: -10 * 60
  }
});

const chartT = new Highcharts.Chart({
  chart: {
    renderTo: 'chart-temperature'
  },
  series: [],
  title: {
    text: undefined
  },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: { second: '%H:%M:%S' }
  },
  yAxis: {
    title: {
      text: 'Temperature Celsius Degrees'
    }
  },
  credits: {
    enabled: false
  }
});

// Function to parse sensor data
const parseSensorData = (dataString) => {
  const [date, time, ...temps] = dataString.split(',');
  const sensorData = {};
  temps.forEach((temp, index) => {
    const cleanedTemp = temp.trim().replace('°C', '');
    const temperature = parseFloat(cleanedTemp);
    sensorData[`sensor${index + 1}`] = temperature;
  });
  return sensorData;
};

// Function to update sensor elements
const updateSensorElements = () => {
  const sensorContainer = document.getElementById('sensors');
  sensorContainer.innerHTML = ''; // Clear existing elements

  for (let i = 1; i <= 43; i++) {
    const sensorItem = document.createElement('div');
    sensorItem.className = 'sensor-item';
    sensorItem.id = `b${i}`;
    sensorItem.textContent = `%TEMP%`;
    sensorContainer.appendChild(sensorItem);
    addSensorClickListener(sensorItem);
  }
};

// Function to add click event listeners to sensor elements
const addSensorClickListener = (sensorElement) => {
  sensorElement.addEventListener('click', () => {
    const sensorKey = sensorElement.id;

    if (selectedSensors.has(sensorKey)) {
      selectedSensors.delete(sensorKey);
      sensorElement.classList.remove('selected'); // Remove visual indication of selection
    } else {
      selectedSensors.add(sensorKey);
      sensorElement.classList.add('selected'); // Add visual indication of selection
    }

    plotTemperature(); // Update the chart based on selected sensors
  });
};

// Function to plot temperatures based on selected sensors
const plotTemperature = () => {
  selectedSensors.forEach((sensorKey) => {
    const sensorName = sensorKey.replace('b', 'sensor');
    const existingSeries = chartT.series.find((series) => series.name === sensorName);

    if (existingSeries) {
      // Series already exists, update its data
      existingSeries.addPoint([new Date().getTime(), sensorTemps[sensorName]], true, existingSeries.data.length >= 100);
    } else {
      // Series does not exist, add a new series
      chartT.addSeries({
        name: sensorName,
        data: [[new Date().getTime(), sensorTemps[sensorName]]],
        type: 'line',
        color: '#FF0000', // CHANGE COLOUR
        marker: {
          symbol: 'circle',
          radius: 0,
          fillColor: '#00ff00'
        }
      });
    }
  });

  chartT.redraw();
};


// Socket.io event listener for serial-data
socket.on('serial-data', (data) => {
  sensorTemps = parseSensorData(data);
  saveSensorData(data);
  // console.log(sensorTemps);
  Object.keys(sensorTemps).forEach((sensorKey, index) => {
    const sensorElement = document.getElementById(`b${index + 1}`);
    if (sensorElement) {
      sensorElement.textContent = sensorTemps[sensorKey] + '°C';
    }
  });
  plotTemperature();
});

// Initial setup: create sensor elements
updateSensorElements();


const navigateTo = (section) => {
  const contentSections = document.querySelectorAll('.content-section');
  contentSections.forEach(section => section.classList.remove('active'));
  document.getElementById(`${section}-content`).classList.add('active');
};