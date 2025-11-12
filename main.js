// ====== PATIENT RECORD SYSTEM ======

// --- Storage helpers ---
function loadPatients() {
  return JSON.parse(localStorage.getItem('patients') || '[]');
}

function savePatients(list) {
  localStorage.setItem('patients', JSON.stringify(list));
  updateAllDisplays();
}

// --- Utility functions ---
function calculateAge(birthdate) {
  const dob = new Date(birthdate);
  const ageDif = Date.now() - dob.getTime();
  return Math.floor(ageDif / (365.25 * 24 * 60 * 60 * 1000));
}

function calculateBMI(height, weight) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function getBMICategory(bmi) {
  const b = parseFloat(bmi);
  if (isNaN(b)) return "—";
  if (b < 18.5) return "Underweight";
  if (b < 25) return "Normal";
  if (b < 30) return "Overweight";
  return "Obese";
}

// --- Core CRUD ---
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

// === Validation ===
const validators = {
  'first-name': val => /^[A-Za-z]{2,12}$/.test(val) || 'First name must be 2–12 letters.',
  'last-name': val => /^[A-Za-z][A-Za-z\'\-]{1,19}$/.test(val) || 'Last name must be 2–20 letters, may include - or \'.',
  'birthdate': val => {
    if (!val) return 'Please enter a valid date.';
    const age = calculateAge(val);
    return (age >= 0 && age <= 120) || 'Age must be between 0 and 120 years.';
  },
  'height': val => {
    const n = parseFloat(val);
    return (n >= 30 && n <= 200) || 'Height must be between 30–200 cm.';
  },
  'weight': val => {
    const n = parseFloat(val);
    return (n >= 1 && n <= 200) || 'Weight must be between 1–200 kg.';
  },
  'sex': val => !!val || 'Please select a sex.',
  'mobile': val => /^07\d{9}$/.test(val) || 'Mobile must start with 07 and be 11 digits.',
  'email': val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format.'
};

// Apply inline validation
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

// --- Global Edit State ---
let editMode = false;
let editId = null;

// --- Add/Edit Patient Form Submission ---
document.getElementById('patient-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  let allValid = true;

  // Validate all fields
  Object.keys(validators).forEach(id => {
    const input = document.getElementById(id);
    const result = validators[id](input.value.trim());
    if (result !== true) {
      input.classList.add('invalid');
      document.getElementById(`${id}-error`).textContent = result;
      document.getElementById(`${id}-error`).style.display = 'block';
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
  } else {
    addPatient(data);
  }

  // Reset form and clear validation
  form.reset();
  document.querySelectorAll('.error-msg').forEach(e => (e.style.display = 'none'));
  document.querySelectorAll('.invalid').forEach(i => i.classList.remove('invalid'));

  updateAllDisplays();
});

// --- Search Logic ---
document.getElementById('search-query').addEventListener('input', () => {
  const q = document.getElementById('search-query').value.trim().toLowerCase();
  const list = loadPatients();
  const results = list.filter(p =>
    p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q)
  );
  displaySearchResults(results);
});

// --- Display Search Results ---
function displaySearchResults(results) {
  const container = document.getElementById('search-results');
  container.innerHTML = '';

  if (!results.length) {
    container.innerHTML = '<li class="muted">No matching patients.</li>';
    return;
  }

  results.forEach(p => {
    const age = calculateAge(p.birthdate);
    const bmi = calculateBMI(p.height, p.weight);
    const bmiCat = getBMICategory(bmi);

    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${p.firstName} ${p.lastName}</strong><br>
      Age: ${age} | Sex: ${p.sex}<br>
      BMI: ${bmi} (${bmiCat})<br>
      Height: ${p.height}cm | Weight: ${p.weight}kg<br>
      Mobile: ${p.mobile}<br>
      Email: ${p.email}<br>
      Notes: ${p.healthInfo || '—'}<br>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;

    // Edit button
    li.querySelector('.edit-btn').addEventListener('click', () => {
      editForm(p);
    });

    // Delete button
    li.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm(`Delete record for ${p.firstName} ${p.lastName}?`)) {
        deletePatient(p.id);
      }
    });

    container.appendChild(li);
  });
}

// --- Edit Patient ---
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
}

// --- Statistics ---
function updateStatistics() {
  const list = loadPatients();
  const card = document.getElementById('stats-card');
  if (!list.length) {
    card.innerHTML = '<p class="muted">No data yet. Add patients to view statistics.</p>';
    return;
  }

  const male = list.filter(p => p.sex === 'Male');
  const female = list.filter(p => p.sex === 'Female');

  const avg = arr =>
    arr.length ? (arr.reduce((s, p) => s + parseFloat(calculateBMI(p.height, p.weight)), 0) / arr.length).toFixed(1) : '—';

  const counts = {
    under: list.filter(p => getBMICategory(calculateBMI(p.height, p.weight)) === 'Underweight').length,
    normal: list.filter(p => getBMICategory(calculateBMI(p.height, p.weight)) === 'Normal').length,
    over: list.filter(p => getBMICategory(calculateBMI(p.height, p.weight)) === 'Overweight').length,
    obese: list.filter(p => getBMICategory(calculateBMI(p.height, p.weight)) === 'Obese').length
  };

  const totalFem50 = female.filter(p => calculateAge(p.birthdate) >= 50).length;

  card.innerHTML = `
    <p><span class="stat-title">Average BMI (Male):</span> ${avg(male)}</p>
    <p><span class="stat-title">Average BMI (Female):</span> ${avg(female)}</p>
    <p><span class="stat-title">Patients by BMI:</span> 
      Underweight: ${counts.under}, Normal: ${counts.normal}, Overweight: ${counts.over}, Obese: ${counts.obese}
    </p>
    <p><span class="stat-title">Total Patients:</span> ${list.length}</p>
    <p><span class="stat-title">Females aged ≥50:</span> ${totalFem50}</p>
  `;
}

// --- Update All Displays ---
function updateAllDisplays() {
  displaySearchResults(loadPatients());
  updateStatistics();
}

// --- Initialise ---
updateAllDisplays();
