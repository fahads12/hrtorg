
// Get the score from the URL parameter
const urlParams = new URLSearchParams(window.location.search);
const score = parseInt(urlParams.get('score'));

// Define the text ranges
const textRanges = [
  { min: 0, max: 9, className: 'text-unlikely' },
  { min: 10, max: 22, className: 'text-possible' },
  { min: 23, max: 39, className: 'text-likely' },
  { min: 40, max: 100, className: 'text-verylikely' }
];

// Function to show the appropriate text based on the score
function showText(score) {
  const textElements = document.querySelectorAll('.text-unlikely, .text-possible, .text-likely, .text-verylikely');
  textElements.forEach(el => el.style.display = 'none');

  const matchingRange = textRanges.find(range => score >= range.min && score <= range.max);
  if (matchingRange) {
    const textElement = document.querySelector(`.${matchingRange.className}`);
    if (textElement) {
      textElement.style.display = 'block';
    }
  }
}

// Define the meter ranges
const meterRanges = [
  { min: 1, max: 10, color: 'green' },
  { min: 11, max: 40, color: 'yellow' },
  { min: 41, max: 100, color: 'red' }
];

// Create the gauge
const gauge = new Gauge(document.getElementById('meter')).setOptions({
  angle: 0,
  lineWidth: 0.44,
  radiusScale: 1,
  pointer: {
    length: 0,
    strokeWidth: 0,
    color: '#000000'
  },
  limitMax: false,
  limitMin: false,
  colorStart: '#ddd',
  colorStop: '#ddd',
  strokeColor: '#ddd',
  generateGradient: true,
  highDpiSupport: true,
  staticZones: [
    ...meterRanges
      .filter(range => range.min <= score)
      .map((range, index, filteredRanges) => ({
        min: range.min,
        max: index === filteredRanges.length - 1 ? Math.min(range.max, score) : filteredRanges[index + 1].min - 1,
        strokeStyle: range.color
      })),
    {
      min: score,
      max: 100,
      strokeStyle: '#dddddd'
    }
  ],
  staticLabels: {
    font: "10px sans-serif",
    labels: [],
    color: "#000000",
    fractionDigits: 0
  }
});

// Set the gauge value
gauge.maxValue = 100;
gauge.setMinValue(0);
gauge.animationSpeed = 32;
gauge.set(score);

// Display the score text inside the semi-circle
const scoreText = document.querySelector('.score-text');
scoreText.textContent = score;

// Call the showText function with the score from the URL parameter
showText(score);
