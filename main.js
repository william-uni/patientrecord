// ====== Storage and Core Data Operations ======
function loadPatients() {
  return JSON.parse(localStorage.getItem('patients') || '[]');
}

function savePatients(list) {
  localStorage.setItem('patients', JSON.stringify(list));
  updateAllDisplays();
}

function addPatient(p) {
  const list = loadPatients();
  list.push(p);
  savePatients(list);
}

function deletePatient(id) {
  const list = loadPatients().filter(p => p.id !== id);
  savePatients(list);
}

function editPatient(updated) {
  const list = loadPatients().map(p => (p.id === updated.id ? updated : p));
  savePatients(list);
}


// ====== Utility Functions (Formatting, BMI, Age) ======
function formatDateUK(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
}

function calculateAge(birthdate) {
  const dob = new Date(birthdate);
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
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


// ====== Validation ======
const validators = {
  'first-name': v => /^[A-Za-z]{2,12}$/.test(v) || 'First name must be 2–12 letters.',
  'last-name': v => /^[A-Za-z][A-Za-z\'\-]{1,19}$/.test(v) || 'Last name must be 2–20 letters.',
  'birthdate': v => {
  if (!v) return 'Enter a valid date.';
  const age = calculateAge(v);
  return (age >= 0 && age <= 120) || 'Age must be between 0 and 120.';
},
  'height': v => parseFloat(v) >= 30 && parseFloat(v) <= 200 || 'Height 30–200 cm.',
  'weight': v => parseFloat(v) >= 1 && parseFloat(v) <= 200 || 'Weight 1–200 kg.',
  'sex': v => !!v || 'Select sex.',
  'mobile': v => /^07\d{9}$/.test(v) || 'Must start 07 & be 11 digits.',
  'email': v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email.'
};

Object.keys(validators).forEach(id => {
  const input = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  if (!input) return;

  function check() {
    const val = input.value.trim();
    const result = validators[id](val);
    if (result === true) {
      input.classList.remove('invalid');
      error.style.display = 'none';
      return true;
    } else {
      input.classList.add('invalid');
      error.textContent = result;
      error.style.display = 'block';
      return false;
    }
  }

  input.addEventListener('input', check);
  input.addEventListener('blur', check);
});


// ====== Edit State ======
let editMode = false;
let editId = null;


// ====== UI Feedback ======
function showConfirmation(msg) {
  let note = document.getElementById("save-confirm");
  if (!note) {
    note = document.createElement("p");
    note.id = "save-confirm";
    document.getElementById("patient-form").appendChild(note);
  }
  note.textContent = msg;
  note.style.color = "#4ade80";
  note.style.opacity = "1";
  setTimeout(() => (note.style.opacity = "0"), 1800);
}


// ====== Form Submission ======
document.getElementById('patient-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;

  let allValid = true;
  Object.keys(validators).forEach(id => {
    const input = document.getElementById(id);
    const result = validators[id](input.value.trim());
    if (result !== true) {
      input.classList.add('invalid');
      const err = document.getElementById(`${id}-error`);
      err.textContent = result;
      err.style.display = 'block';
      allValid = false;
    }
  });
  if (!allValid) return;

  const patients = loadPatients();
  const data = {
    id: editMode ? editId : (patients.length ? Math.max(...patients.map(p => p.id)) + 1 : 1),
    firstName: form['first-name'].value.trim(),
    lastName: form['last-name'].value.trim(),
    birthdate: form['birthdate'].value,
    height: parseFloat(form['height'].value),
    weight: parseFloat(form['weight'].value),
    sex: form['sex'].value,
    mobile: form['mobile'].value.trim(),
    email: form['email'].value.trim(),
    healthInfo: form['health-info'].value.trim()
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
  document.querySelectorAll('.error-msg').forEach(e => e.style.display = 'none');
  document.querySelectorAll('.invalid').forEach(i => i.classList.remove('invalid'));
  updateAllDisplays();
});


// ====== Combined Search + Filter Handling ======
function applySearchAndFilters() {
  const q = document.getElementById("search-query").value.trim().toLowerCase();
  const sexFilter = document.getElementById("filter-sex")?.value || "";
  const ageFilter = document.getElementById("filter-age")?.value || "";
  const bmiFilter = document.getElementById("filter-bmi")?.value || "";

  const list = loadPatients();

  const results = list.filter(p => {
    const matchesName =
      !q ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q);

    const matchesSex = !sexFilter || p.sex === sexFilter;

    const age = calculateAge(p.birthdate);
    const matchesAge = !ageFilter ||
      (ageFilter.includes("to") &&
        age >= parseInt(ageFilter.split(" to ")[0]) &&
        age <= parseInt(ageFilter.split(" to ")[1])) ||
      (ageFilter === "90+" && age >= 90);

    const bmi = calculateBMI(p.height, p.weight);
    const matchesBMI = !bmiFilter || getBMICategory(bmi) === bmiFilter;

    return matchesName && matchesSex && matchesAge && matchesBMI;
  });

  displaySearchResults(results);
}

document.getElementById("search-query").addEventListener("input", applySearchAndFilters);
document.getElementById("filter-sex").addEventListener("change", applySearchAndFilters);
document.getElementById("filter-age").addEventListener("change", applySearchAndFilters);
document.getElementById("filter-bmi").addEventListener("change", applySearchAndFilters);

document.getElementById("clear-filters").addEventListener("click", () => {
  document.getElementById("filter-sex").value = "";
  document.getElementById("filter-age").value = "";
  document.getElementById("filter-bmi").value = "";
  document.getElementById("search-query").value = "";
  applySearchAndFilters();
});


// ====== Rendering Patient Cards Functionallity ======
function displaySearchResults(results) {
  const container = document.getElementById("search-results");
  container.innerHTML = results.length
    ? ""
    : '<li class="muted">No matching patients.</li>';

  results.forEach(p => {
    const bmi = calculateBMI(p.height, p.weight);
    const cat = getBMICategory(bmi);
    const color =
      cat === "Normal" ? "#4ade80" :
      cat === "Overweight" ? "#facc15" :
      "#ef4444";

    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${p.firstName} ${p.lastName}</strong>
      Age: ${calculateAge(p.birthdate)} | ${formatDateUK(p.birthdate)}<br>
      Sex: ${p.sex}<br>
      BMI: <span style="color:${color}">${bmi} (${cat})</span>
      Height: ${p.height}cm<br>
      Weight: ${p.weight}kg<br>
      Mobile: ${p.mobile}<br>
      Email: ${p.email}<br>
      Notes: ${p.healthInfo || '—'}<br>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;

    li.querySelector('.edit-btn').onclick = () => editForm(p);
    li.querySelector('.delete-btn').onclick = () => {
      if (confirm(`Delete ${p.firstName} ${p.lastName}?`)) deletePatient(p.id);
    };

    container.appendChild(li);
  });
}


// ====== Editing Workflow ======
function editForm(patient) {
  const form = document.getElementById('patient-form');
  form['first-name'].value = patient.firstName;
  form['last-name'].value = patient.lastName;
  form['birthdate'].value = patient.birthdate;
  form['height'].value = patient.height;
  form['weight'].value = patient.weight;
  form['sex'].value = patient.sex;
  form['mobile'].value = patient.mobile;
  form['email'].value = patient.email;
  form['health-info'].value = patient.healthInfo;

  editMode = true;
  editId = patient.id;
  form.querySelector("button").textContent = "Update Patient";
}


// ====== Statistics and Charts ======
function updateStatistics() {
  const list = loadPatients();

  const stats = {
    male: list.filter(p => p.sex === 'Male'),
    female: list.filter(p => p.sex === 'Female'),
  };

  const avg = arr =>
    arr.length
      ? (arr.reduce((s, p) => s + parseFloat(calculateBMI(p.height, p.weight)), 0) / arr.length).toFixed(1)
      : '—';

  const bmiData = {
    under: list.filter(p => getBMICategory(calculateBMI(p.height, p.weight)) === 'Underweight').length,
    normal: list.filter(p => getBMICategory(calculateBMI(p.height, p.weight)) === 'Normal').length,
    over: list.filter(p => getBMICategory(calculateBMI(p.height, p.weight)) === 'Overweight').length,
    obese: list.filter(p => getBMICategory(calculateBMI(p.height, p.weight)) === 'Obese').length
  };

  const totalFem50 = stats.female.filter(p => calculateAge(p.birthdate) >= 50).length;

  document.getElementById('avg-bmi').innerHTML =
    `<p><b>Avg BMI (M):</b> <span>${avg(stats.male)}</span><br><b>Avg BMI (F):</b> <span>${avg(stats.female)}</span></p>`;

  document.getElementById('bmi-categories').innerHTML =
    `<p><b>BMI Categories:</b><br>Underweight: ${bmiData.under}, Normal: ${bmiData.normal}, Overweight: ${bmiData.over}, Obese: ${bmiData.obese}</p>`;

  document.getElementById('totals').innerHTML =
    `<p><b>Total Patients:</b> ${list.length}<br><b>Females ≥50:</b> ${totalFem50}</p>`;

  updateCharts(bmiData, stats);
}


// ====== Master UI Update ======
function updateAllDisplays() {
  displaySearchResults(loadPatients());
  applySearchAndFilters();
  updateStatistics();
}

updateAllDisplays();
