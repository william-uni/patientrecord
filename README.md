# Patient Record System
This project is a browser-based application for managing patient information. It is built with HTML, CSS, and JavaScript, and uses [Chart.js](https://github.com/chartjs/Chart.js) for basic data visualisation charts.

## Features

### Add and Edit Patients Tab

* Enter first name, last name, date of birth, height, weight, sex, phone number, and/or notes.
* Real-time inline validation for all form inputs.
* Patients can be updated or deleted as needed within the search card.

### Search and Manage Tab
* Live search allows to find patients by name.
* Search also allows filtering by gender
* Each patient card displays:
  * Age (calculated automatically)
  * BMI and BMI category (with colour coding)
  * Sex
  * Height and weight
  * Email and mobile number
  * Notes
* Each card includes Edit and Delete controls.

### Statistics Tab

A set of charts and summary statistics generated from patient data, including:

* BMI distribution chart
* Sex distribution chart
* Age group distribution chart (by decade)
* Summary panels for average BMI, category totals, and total patients

### LocalStorage Implementation

All patient data is saved automatically using the browser’s LocalStorage, allowing data to persist between sessions without any database.


## Getting Started
### Option A: GitHub Pages
1. Navigate to [PatientRecord](https://william-uni.github.io/patientrecord/)
### Option B: Locally
1. Clone or download the repository.
2. Open `index.html` in a modern web browser.
3. No backend or server setup is required.


## Technologies Used

* HTML5
* CSS3
* JavaScript
* [Charts Repository](https://github.com/chartjs/Chart.js)
* LocalStorage

---

## File Structure

```
/
├── index.html          # Redirect Page
├── patientrecord.html  # Main Page
├── style.css           # Styles and themes
├── main.js             # Main code logic
├── logo.png            # Website logo
├── charts.js           # Chart formatting logic
├── chart.umd.js        # Chart.js library
└── README.md
```


## Purpose

This project was created as part of a university web development module to demonstrate:

* DOM manipulation
* Form validation and inline validation
* Data visualisation and styling
* Modular JavaScript code and structuring
* Local persistence using LocalStorage