
// Drag and drop implementation
let isAdjustingPositions = false;
const toggleButton = document.getElementById('toggle-button');
const sensorItems = document.querySelectorAll('.sensor-item');
const resetButton = document.getElementById('reset-button');
const toggleAdjustPositions = () => {
  isAdjustingPositions = !isAdjustingPositions;
  if (isAdjustingPositions) {
    toggleButton.textContent = 'Lock Sensor Positions';
    initDraggable();
  } else {
    toggleButton.textContent = 'Adjust Sensor Positions';
    disableDragging();
    savePositions();
  }
};

toggleButton.addEventListener('click', toggleAdjustPositions);

const disableDragging = () => {
  sensorItems.forEach(el => {
    el.style.cursor = 'default'; // Change cursor to default
    el.removeEventListener('mousedown', onMouseDown);
  });
};

const savePositions = () => {
  const positions = {};
  sensorItems.forEach(el => {
    positions[el.id] = {
      top: el.offsetTop,
      left: el.offsetLeft
    };
  });

  fetch('/save-positions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(positions)
  })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
};

const onMouseDown = (event) => {
  const el = event.target;
  const initialX = event.clientX - el.offsetLeft;
  const initialY = event.clientY - el.offsetTop;

  const onMouseMove = (moveEvent) => {
    el.style.left = `${moveEvent.clientX - initialX}px`;
    el.style.top = `${moveEvent.clientY - initialY}px`;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    const positions = {};
    positions[el.id] = {
      top: el.offsetTop,
      left: el.offsetLeft
    };

    fetch('/save-positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(positions)
    })
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

// Initialize draggable functionality
const initDraggable = () => {
  sensorItems.forEach(el => {
    el.style.cursor = 'grab'; // Change cursor to grab
    el.addEventListener('mousedown', onMouseDown);
  });
};

// Load positions
window.onload = async function () {
  try {
    const response = await fetch('/positions.json');
    const text = await response.text();
    try {
      
      const positions = JSON.parse(text);
      Object.keys(positions).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          const { top, left } = positions[key];
          element.style.top = top + 'px';
          element.style.left = left + 'px';
        }
      });
      const imgs = document.getElementsByClassName('thermal-box-img'); // No dot before the class name

      for (let i = 0; i < imgs.length; i++) {
        imgs[i].style.marginLeft = '88px';
      }
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      console.log('Response text:', text);
    }
  } catch (fetchError) {
    console.error('Failed to fetch positions:', fetchError);
  }
};

document.getElementById('reset-button').addEventListener('click', function () {
  if (confirm('Are you sure you want to reset the sensor positions?')) {
    resetSensorPositions();
  } else {
    console.log('Reset canceled');
  }
});

function resetSensorPositions() {
  const sensorContainer = document.getElementById('sensors');
  sensorItems.forEach((el, index) => {
    el.style.position = 'absolute';
    el.style.top = `${index * 16}px`;
    el.style.left = 'auto';
    sensorContainer.appendChild(el);
  });
  savePositions();
};