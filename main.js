// ====== PATIENT RECORD SYSTEM ======

// --- Storage helpers ---
function loadPatients() {
  return JSON.parse(localStorage.getItem('patients') || '[]');
}

function savePatients(list) {
  localStorage.setItem('patients', JSON.stringify(list));
  displayPatients();
}

// --- Core Logic ---
function addPatient(p) {
  const list = loadPatients();
  list.push(p);
  savePatients(list);
}

function displayPatients() {
  const list = loadPatients();
  const ul = document.getElementById('patients-list');
  ul.innerHTML = '';

  if (!list.length) {
    ul.innerHTML = '<li class="muted">No patients found.</li>';
    return;
  }

  list.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${p.firstName} ${p.lastName}</strong><br>
      Date of Birth: ${new Date(p.birthdate).toLocaleDateString('en-GB')}<br>
      Height: ${p.height}cm | Weight: ${p.weight}kg<br>
      Sex: ${p.sex}<br>
      Mobile: ${p.mobile}<br>
      Email: ${p.email}<br>
      Notes: ${p.healthInfo || '—'}
    `;
    ul.appendChild(li);
  });
}

// === Validation ===
const validators = {
  'first-name': val => /^[A-Za-z]{2,12}$/.test(val) || 'First name must be 2–12 letters.',
  'last-name': val => /^[A-Za-z][A-Za-z'\-]{1,19}$/.test(val) || 'Last name must be 2–20 letters, may include - or \'.',
  'birthdate': val => {
    if (!val) return 'Please enter a valid date.';
    const birth = new Date(val);
    const age = (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 0 || age > 120) return 'Age must be between 0 and 120 years.';
    return true;
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

// Apply validation inline
Object.keys(validators).forEach(id => {
  const input = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);

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

// --- Form submission ---
document.getElementById('patient-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;

  // Run all validations
  let allValid = true;
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
  const newId = patients.length + 1;

  const patient = {
    id: newId,
    firstName: form['first-name'].value.trim(),
    lastName: form['last-name'].value.trim(),
    birthdate: form['birthdate'].value,
    height: form['height'].value,
    weight: form['weight'].value,
    sex: form['sex'].value,
    mobile: form['mobile'].value.trim(),
    email: form['email'].value.trim(),
    healthInfo: form['health-info'].value.trim()
  };

  addPatient(patient);
  form.reset();

  // clear visuals
  document.querySelectorAll('.error-msg').forEach(e => (e.style.display = 'none'));
  document.querySelectorAll('.invalid').forEach(i => i.classList.remove('invalid'));
});

// --- Initialize ---
displayPatients();
