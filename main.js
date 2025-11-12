function loadPatients() {
  return JSON.parse(localStorage.getItem('patients') || '[]');
}

function savePatients(list) {
  localStorage.setItem('patients', JSON.stringify(list));
  renderPatients();
  renderStats();
}
