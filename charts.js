let bmiChart, sexChart, ageChart;

function updateCharts(bmiData, stats) {
  const ctx1 = document.getElementById("bmiChart");
  const ctx2 = document.getElementById("sexChart");
  const ctx3 = document.getElementById("ageChart");

  const list = loadPatients();

  // Kill any old chart instances before drawing new ones
  [bmiChart, sexChart, ageChart].forEach((c) => c && c.destroy());

  // === BMI CHART (doughnut) ===
  bmiChart = new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: ["Underweight", "Normal", "Overweight", "Obese"],
      datasets: [
        {
          label: "BMI Distribution",
          data: [
            bmiData.under,
            bmiData.normal,
            bmiData.over,
            bmiData.obese,
          ],
          backgroundColor: ["#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"],
          borderColor: "#1e1e1e",
          borderWidth: 2,
        },
      ],
    },
    options: {
      onClick: (evt, elements, chart) => {
        // Clicking on a slice toggles BMI filter
        if (!elements.length) return;
        const idx = elements[0].index;
        const label = chart.data.labels[idx];
        const bmiSelect = document.getElementById("filter-bmi");
        if (!bmiSelect) return;

        // Toggle behaviour: click again to clear
        bmiSelect.value = bmiSelect.value === label ? "" : label;
        applySearchAndFilters();
      },
      plugins: {
        title: {
          display: true,
          text: "BMI Category Distribution",
          color: "#e5e5e5",
          font: { size: 14, weight: "bold" },
        },
        legend: {
          position: "bottom",
          labels: { color: "#ccc", usePointStyle: true },
        },
      },
    },
  });

  // === SEX CHART (pie) ===
  sexChart = new Chart(ctx2, {
    type: "pie",
    data: {
      labels: ["Male", "Female"],
      datasets: [
        {
          data: [stats.male.length, stats.female.length],
          backgroundColor: ["#3b82f6", "#ec4899"],
          borderColor: "#1e1e1e",
          borderWidth: 2,
        },
      ],
    },
    options: {
      onClick: (evt, elements, chart) => {
        // Clicking on a slice toggles sex filter
        if (!elements.length) return;
        const idx = elements[0].index;
        const label = chart.data.labels[idx];
        const sexSelect = document.getElementById("filter-sex");
        if (!sexSelect) return;

        sexSelect.value = sexSelect.value === label ? "" : label;
        applySearchAndFilters();
      },
      plugins: {
        title: {
          display: true,
          text: "Patient Sex Distribution",
          color: "#e5e5e5",
          font: { size: 14, weight: "bold" },
        },
        legend: {
          position: "bottom",
          labels: { color: "#ccc", usePointStyle: true },
        },
      },
    },
  });

  // === AGE CHART (horizontal bar by decade) ===
  const ageData = list
    .map((p) => calculateAge(p.birthdate))
    .filter((a) => !isNaN(a))
    .sort((a, b) => a - b);

  const bins = {};
  ageData.forEach((age) => {
    const range = Math.floor(age / 10) * 10; // 0, 10, 20 ...
    const label =
      range >= 90 ? "90+" : `${range} to ${range + 9}`; // matches dropdown text
    bins[label] = (bins[label] || 0) + 1;
  });

  const labels = Object.keys(bins);
  const values = Object.values(bins);

  const gradientColors = labels.map((_, i) => {
    const hue = 200 - i * 20;
    return `hsl(${hue}, 80%, 60%)`;
  });

  ageChart = new Chart(ctx3, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Patients by Age Group",
          data: values,
          backgroundColor: gradientColors,
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: "y",
      onClick: (evt, elements, chart) => {
        // Clicking on a bar toggles age group filter
        if (!elements.length) return;
        const idx = elements[0].index;
        const label = chart.data.labels[idx];
        const ageSelect = document.getElementById("filter-age");
        if (!ageSelect) return;

        ageSelect.value = ageSelect.value === label ? "" : label;
        applySearchAndFilters();
      },
      plugins: {
        title: {
          display: true,
          text: "Age Distribution (by decade)",
          color: "#e5e5e5",
          font: { size: 14, weight: "bold" },
        },
        legend: { display: false },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Number of Patients",
            color: "#aaa",
          },
          ticks: { color: "#aaa" },
          grid: { color: "#2c2c2c" },
        },
        y: {
          title: { display: true, text: "Age Range", color: "#aaa" },
          ticks: { color: "#aaa" },
          grid: { color: "#2c2c2c" },
        },
      },
    },
  });
}
