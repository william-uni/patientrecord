let bmiChart, sexChart, ageChart;

function updateCharts(bmiData, stats) {
  const ctx1 = document.getElementById('bmiChart');
  const ctx2 = document.getElementById('sexChart');
  const ctx3 = document.getElementById('ageChart');
  const list = loadPatients();

  // Clean up old charts
  [bmiChart, sexChart, ageChart].forEach(c => c && c.destroy());

  // === BMI Doughnut Chart ===
  bmiChart = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: ['Underweight', 'Normal', 'Overweight', 'Obese'],
      datasets: [{
        label: 'BMI Categories',
        data: [bmiData.under, bmiData.normal, bmiData.over, bmiData.obese],
        backgroundColor: ['#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'],
        borderColor: '#1e1e1e',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'BMI Category Distribution',
          color: '#e5e5e5',
          font: { size: 14, weight: 'bold' }
        },
        legend: {
          position: 'bottom',
          labels: { color: '#ccc', usePointStyle: true }
        }
      }
    }
  });

  // === Sex Pie Chart ===
  sexChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: ['Male', 'Female'],
      datasets: [{
        label: 'Sex Ratio',
        data: [stats.male.length, stats.female.length],
        backgroundColor: ['#3b82f6', '#ec4899'],
        borderColor: '#1e1e1e',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Patient Sex Distribution',
          color: '#e5e5e5',
          font: { size: 14, weight: 'bold' }
        },
        legend: {
          position: 'bottom',
          labels: { color: '#ccc', usePointStyle: true }
        }
      }
    }
  });

  // === Age Line Chart ===
  const ageData = list
    .map(p => calculateAge(p.birthdate))
    .filter(a => !isNaN(a))
    .sort((a, b) => a - b);

  ageChart = new Chart(ctx3, {
    type: 'line',
    data: {
      labels: ageData.map((_, i) => `#${i + 1}`),
      datasets: [{
        label: 'Patient Age Trend',
        data: ageData,
        fill: false,
        borderColor: '#3a7afe',
        backgroundColor: '#3a7afe',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3a7afe'
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Patient Age Distribution (Line)',
          color: '#e5e5e5',
          font: { size: 14, weight: 'bold' }
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Patients (sorted by age)',
            color: '#aaa'
          },
          ticks: { color: '#aaa' },
          grid: { color: '#2c2c2c' }
        },
        y: {
          title: {
            display: true,
            text: 'Age (years)',
            color: '#aaa'
          },
          ticks: { color: '#aaa' },
          grid: { color: '#2c2c2c' }
        }
      }
    }
  });
}
