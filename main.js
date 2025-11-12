// ====== PATIENT RECORD SYSTEM ======

// Load from localStorage
function loadPatients() {
  return JSON.parse(localStorage.getItem('patients') || '[]');
}

// Save to localStorage
function savePatients(list) {
  localStorage.setItem('patients', JSON.stringify(list));
  displayPatients();
}

// Add a new patient
function addPatient(p) {
  const list = loadPatients();
  list.push(p);
  savePatients(list);
}

// Display all patients
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
    li.innerHTML = 
    `
      <strong>${p.firstName} ${p.lastName}</strong><br>
      Date Of Birth: ${p.birthdate}<br>
      Height: ${p.height}cm | Weight: ${p.weight}kg<br>
      Sex: ${p.sex}<br>
      Mobile: ${p.mobile}<br>
      Email: ${p.email}<br>
      Notes: ${p.healthInfo || '—'}
    `
    ul.appendChild(li);
  });
}

// Handle form submission
document.getElementById('patient-form').addEventListener('submit', e => {
  e.preventDefault();

  const form = e.target;
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
});

// error handing display load
displayPatients();
