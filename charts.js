let bmiChart, sexChart, ageChart;

function updateCharts(bmiData, stats) {
  const ctx1 = document.getElementById('bmiChart');
  const ctx2 = document.getElementById('sexChart');
  const ctx3 = document.getElementById('ageChart');
  const list = loadPatients();

  // Destroy old charts before redrawing
  [bmiChart, sexChart, ageChart].forEach(c => c && c.destroy());

  // === BMI CHART ===
  bmiChart = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: ['Underweight', 'Normal', 'Overweight', 'Obese'],
      datasets: [{
        label: 'BMI Distribution',
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

  // === SEX CHART ===
  sexChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: ['Male', 'Female'],
      datasets: [{
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

  // === AGE CHART (Horizontal Rounded Bar) ===
  const ageData = list
    .map(p => calculateAge(p.birthdate))
    .filter(a => !isNaN(a))
    .sort((a, b) => a - b);

  const bins = {};
  ageData.forEach(age => {
    const range = Math.floor(age / 10) * 10; // group by decade
    bins[`${range}-${range + 9}`] = (bins[`${range}-${range + 9}`] || 0) + 1;
  });

  const gradientColors = Object.keys(bins).map((_, i) => {
    const hue = 200 - i * 20;
    return `hsl(${hue}, 80%, 60%)`;
  });

  ageChart = new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: Object.keys(bins),
      datasets: [{
        label: 'Patients by Age Group',
        data: Object.values(bins),
        backgroundColor: gradientColors,
        borderRadius: 10,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        title: {
          display: true,
          text: 'Age Distribution (by decade)',
          color: '#e5e5e5',
          font: { size: 14, weight: 'bold' }
        },
        legend: { display: false }
      },
      scales: {
        x: {
          title: { display: true, text: 'Number of Patients', color: '#aaa' },
          ticks: { color: '#aaa' },
          grid: { color: '#2c2c2c' }
        },
        y: {
          title: { display: true, text: 'Age Range', color: '#aaa' },
          ticks: { color: '#aaa' },
          grid: { color: '#2c2c2c' }
        }
      }
    }
  });
}

// Ensure charts appear immediately
document.addEventListener('DOMContentLoaded', () => {
  updateAllDisplays();
});
