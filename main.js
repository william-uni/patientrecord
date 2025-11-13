// ====== PATIENT RECORD SYSTEM ======

// --- Storage helpers ---
function loadPatients() {
  return JSON.parse(localStorage.getItem("patients") || "[]");
}

function savePatients(list) {
  localStorage.setItem("patients", JSON.stringify(list));
  updateAllDisplays();
}

// --- Utility functions ---
function formatDateUK(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
}

function calculateAge(birthdate) {
  const dob = new Date(birthdate);
  return Math.floor(
    (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

function calculateBMI(height, weight) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function getBMICategory(bmi) {
  const b = parseFloat(bmi);
  if (b < 18.5) return "Underweight";
  if (b < 25) return "Normal";
  if (b < 30) return "Overweight";
  return "Obese";
}

// --- Core patient operations ---
function addPatient(p) {
  const list = loadPatients();
  list.push(p);
  savePatients(list);
}

function deletePatient(id) {
  const list = loadPatients().filter((p) => p.id !== id);
  savePatients(list);
}

function editPatient(updated) {
  const list = loadPatients().map((p) => (p.id === updated.id ? updated : p));
  savePatients(list);
}

// --- Validation rules ---
const validators = {
  "first-name": (v) =>
    /^[A-Za-z]{2,12}$/.test(v) || "First name must be 2–12 letters.",
  "last-name": (v) =>
    /^[A-Za-z][A-Za-z'\\-]{1,19}$/.test(v) ||
    "Last name must be 2–20 letters.",
  birthdate: (v) => (v ? true : "Enter a valid date."),
  height: (v) =>
    (parseFloat(v) >= 30 && parseFloat(v) <= 200) || "Height 30–200 cm.",
  weight: (v) =>
    (parseFloat(v) >= 1 && parseFloat(v) <= 200) || "Weight 1–200 kg.",
  sex: (v) => !!v || "Select sex.",
  mobile: (v) =>
    /^07\d{9}$/.test(v) || "Must start 07 & be 11 digits.",
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Invalid email.",
};

// Inline validation on input/blur
Object.keys(validators).forEach((id) => {
  const input = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  if (!input || !error) return;

  function check() {
    const val = input.value.trim();
    const result = validators[id](val);
    if (result === true) {
      input.classList.remove("invalid");
      error.style.display = "none";
      return true;
    } else {
      input.classList.add("invalid");
      error.textContent = result;
      error.style.display = "block";
      return false;
    }
  }

  input.addEventListener("input", check);
  input.addEventListener("blur", check);
});

// --- Global edit state ---
let editMode = false;
let editId = null;

// --- Confirmation message ---
function showConfirmation(msg) {
  let note = document.getElementById("save-confirm");
  if (!note) {
    note = document.createElement("p");
    note.id = "save-confirm";
    document.getElementById("patient-form").appendChild(note);
  }
  note.textContent = msg;
  note.style.color = "#4ade80"; // green success text
  note.style.opacity = "1";
  setTimeout(() => (note.style.opacity = "0"), 1800);
}

// --- Form submit handler ---
document.getElementById("patient-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;

  // Final validation pass on submit
  let allValid = true;
  Object.keys(validators).forEach((id) => {
    const input = document.getElementById(id);
    const result = validators[id](input.value.trim());
    const error = document.getElementById(`${id}-error`);
    if (result !== true) {
      input.classList.add("invalid");
      error.textContent = result;
      error.style.display = "block";
      allValid = false;
    }
  });

  if (!allValid) return;

  const patients = loadPatients();
  const data = {
    id: editMode
      ? editId
      : patients.length
      ? Math.max(...patients.map((p) => p.id)) + 1
      : 1,
    firstName: form["first-name"].value.trim(),
    lastName: form["last-name"].value.trim(),
    birthdate: form["birthdate"].value,
    height: parseFloat(form["height"].value),
    weight: parseFloat(form["weight"].value),
    sex: form["sex"].value,
    mobile: form["mobile"].value.trim(),
    email: form["email"].value.trim(),
    healthInfo: form["health-info"].value.trim(),
  };

  if (editMode) {
    editPatient(data);
    editMode = false;
    editId = null;
    form.querySelector("button").textContent = "Save Patient";
    showConfirmation("Patient updated!");
  } else {
    addPatient(data);
    showConfirmation("Patient added!");
  }

  form.reset();
  document
    .querySelectorAll(".error-msg")
    .forEach((el) => (el.style.display = "none"));
  document.querySelectorAll(".invalid").forEach((el) => {
    el.classList.remove("invalid");
  });

  updateAllDisplays();
});

// --- Central search + filter function ---
function applySearchAndFilters() {
  const queryInput = document.getElementById("search-query");
  const sexSelect = document.getElementById("filter-sex");
  const ageSelect = document.getElementById("filter-age");
  const bmiSelect = document.getElementById("filter-bmi");

  const q = queryInput ? queryInput.value.trim().toLowerCase() : "";
  const sexFilter = sexSelect ? sexSelect.value : "";
  const ageFilter = ageSelect ? ageSelect.value : "";
  const bmiFilter = bmiSelect ? bmiSelect.value : "";

  const list = loadPatients();

  const results = list.filter((p) => {
    // Text search on first + last name
    const matchesName =
      !q ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q);

    // Sex filter
    const matchesSex = !sexFilter || p.sex === sexFilter;

    // Age filter (decades / 90+)
    const age = calculateAge(p.birthdate);
    let matchesAge = true;
    if (ageFilter) {
      if (ageFilter.endsWith("+")) {
        const min = parseInt(ageFilter, 10); // "90+"
        matchesAge = age >= min;
      } else if (ageFilter.includes(" to ")) {
        const [minStr, maxStr] = ageFilter.split(" to ");
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        matchesAge = age >= min && age <= max;
      }
    }

    // BMI category filter
    const bmiVal = calculateBMI(p.height, p.weight);
    const bmiCat = getBMICategory(bmiVal);
    const matchesBmi = !bmiFilter || bmiCat === bmiFilter;

    return matchesName && matchesSex && matchesAge && matchesBmi;
  });

  displaySearchResults(results);
}

// Hook filters + search input
const searchInputEl = document.getElementById("search-query");
if (searchInputEl) {
  searchInputEl.addEventListener("input", applySearchAndFilters);
}

const sexFilterEl = document.getElementById("filter-sex");
if (sexFilterEl) {
  sexFilterEl.addEventListener("change", applySearchAndFilters);
}

const ageFilterEl = document.getElementById("filter-age");
if (ageFilterEl) {
  ageFilterEl.addEventListener("change", applySearchAndFilters);
}

const bmiFilterEl = document.getElementById("filter-bmi");
if (bmiFilterEl) {
  bmiFilterEl.addEventListener("change", applySearchAndFilters);
}

const clearFiltersBtn = document.getElementById("clear-filters");
if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
    if (searchInputEl) searchInputEl.value = "";
    if (sexFilterEl) sexFilterEl.value = "";
    if (ageFilterEl) ageFilterEl.value = "";
    if (bmiFilterEl) bmiFilterEl.value = "";
    applySearchAndFilters();
  });
}

// --- Render search results ---
function displaySearchResults(results) {
  const container = document.getElementById("search-results");
  if (!container) return;

  container.innerHTML = results.length
    ? ""
    : '<li class="muted">No matching patients.</li>';

  results.forEach((p) => {
    const bmi = calculateBMI(p.height, p.weight);
    const cat = getBMICategory(bmi);
    const color =
      cat === "Normal"
        ? "#4ade80"
        : cat === "Overweight"
        ? "#facc15"
        : "#ef4444";

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.firstName} ${p.lastName}</strong>
      Age: ${calculateAge(p.birthdate)} | ${formatDateUK(p.birthdate)}<br>
      Sex: ${p.sex}<br>
      BMI: <span style="color:${color}">${bmi} (${cat})</span>
      Height: ${p.height}cm<br>
      Weight: ${p.weight}kg<br>
      Mobile: ${p.mobile}<br>
      Email: ${p.email}<br>
      Notes: ${p.healthInfo || "—"}<br>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;

    li.querySelector(".edit-btn").onclick = () => editForm(p);
    li.querySelector(".delete-btn").onclick = () => {
      if (confirm(`Delete ${p.firstName} ${p.lastName}?`)) {
        deletePatient(p.id);
      }
    };

    container.appendChild(li);
  });
}

// --- Edit form helper ---
function editForm(patient) {
  const form = document.getElementById("patient-form");
  form["first-name"].value = patient.firstName;
  form["last-name"].value = patient.lastName;
  form["birthdate"].value = patient.birthdate;
  form["height"].value = patient.height;
  form["weight"].value = patient.weight;
  form["sex"].value = patient.sex;
  form["mobile"].value = patient.mobile;
  form["email"].value = patient.email;
  form["health-info"].value = patient.healthInfo;
  editMode = true;
  editId = patient.id;
  form.querySelector("button").textContent = "Update Patient";
}

// --- Statistics and charts ---
function updateStatistics() {
  const list = loadPatients();

  const males = list.filter((p) => p.sex === "Male");
  const females = list.filter((p) => p.sex === "Female");

  const avg = (arr) =>
    arr.length
      ? (
          arr.reduce(
            (total, p) =>
              total + parseFloat(calculateBMI(p.height, p.weight)),
            0
          ) / arr.length
        ).toFixed(1)
      : "—";

  const bmiData = {
    under: list.filter(
      (p) =>
        getBMICategory(calculateBMI(p.height, p.weight)) === "Underweight"
    ).length,
    normal: list.filter(
      (p) => getBMICategory(calculateBMI(p.height, p.weight)) === "Normal"
    ).length,
    over: list.filter(
      (p) =>
        getBMICategory(calculateBMI(p.height, p.weight)) === "Overweight"
    ).length,
    obese: list.filter(
      (p) => getBMICategory(calculateBMI(p.height, p.weight)) === "Obese"
    ).length,
  };

  const totalFem50 = females.filter(
    (p) => calculateAge(p.birthdate) >= 50
  ).length;

  // Summary cards
  document.getElementById(
    "avg-bmi"
  ).innerHTML = `<p><b>Avg BMI (Male):</b> <span>${avg(
    males
  )}</span><br><b>Avg BMI (Female):</b> <span>${avg(females)}</span></p>`;

  document.getElementById(
    "bmi-categories"
  ).innerHTML = `<p><b>BMI Categories:</b><br>
    Underweight: ${bmiData.under}<br>
    Normal: ${bmiData.normal}<br>
    Overweight: ${bmiData.over}<br>
    Obese: ${bmiData.obese}</p>`;

  document.getElementById(
    "totals"
  ).innerHTML = `<p><b>Total Patients:</b> ${list.length}<br>
    <b>Females ≥50:</b> ${totalFem50}</p>`;

  // Charts are drawn in charts.js
  updateCharts(bmiData, { male: males, female: females });
}

// --- Master refresh function ---
function updateAllDisplays() {
  applySearchAndFilters(); // list view follows current filters
  updateStatistics();      // stats always based on full dataset
}

// Initial render
updateAllDisplays();
