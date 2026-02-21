/* ==========================================================
   MEDICAL RECORDS FUNCTIONALITY
========================================================== */
// Get UI Elements
const recordsContainer = document.getElementById("recordsContainer");
const uploadForm = document.getElementById("uploadForm");

// Function to Apply Theme (Step 2)
function applyTheme(enableDarkMode) {
    document.documentElement.classList.toggle("dark-mode", enableDarkMode);
    document.body.classList.toggle("dark-mode", enableDarkMode);

    // Apply dark mode to medical records dynamically
    const recordItems = document.querySelectorAll(".record-item");
    recordItems.forEach(record => {
        if (enableDarkMode) {
            record.classList.add("dark-mode-record");
        } else {
            record.classList.remove("dark-mode-record");
        }
    });

    console.log(`Dark Mode ${enableDarkMode ? "Enabled" : "Disabled"}`);
}

// Load records dynamically from localStorage
function loadRecords() {
    let records = JSON.parse(localStorage.getItem("medicalRecords")) || [];
    const isDarkMode = document.documentElement.classList.contains("dark-mode"); // Check if dark mode is active

    // Remove duplicate and invalid records before displaying
    const uniqueRecords = records.reduce((acc, current) => {
        const isDuplicate = acc.some(record => record.title === current.title && record.file === current.file);
        const isValidFile = current.file.startsWith("data:"); // Ensure valid Base64 format

        if (!isDuplicate && isValidFile) acc.push(current);
        return acc;
    }, []);

    recordsContainer.innerHTML = ""; // Clear container

    if (uniqueRecords.length === 0) {
        recordsContainer.innerHTML = "<p>No records available. Upload a new document to see records.</p>";
        return;
    }

    uniqueRecords.forEach((record, index) => {
        const recordDiv = document.createElement("div");
        recordDiv.className = "record-item";

        // Apply dark mode class if active
        if (isDarkMode) {
            recordDiv.classList.add("dark-mode-record");
        }

        recordDiv.innerHTML = `
            <p><strong>Title:</strong> ${record.title}</p>
            <p><strong>Date:</strong> ${record.date}</p>
            <div class="record-buttons">
                <button class="view-button" data-index="${index}">View</button>
                <a href="${record.file}" class="download-button" download="${record.title}">Download</a>
                <button class="delete-button" data-index="${index}">Delete</button>
            </div>
        `;
        recordsContainer.appendChild(recordDiv);
    });

    // Attach event listeners properly to prevent duplicate events
    document.querySelectorAll(".view-button").forEach((button) => {
        button.onclick = function () {
            const index = this.getAttribute("data-index");
            viewRecord(index);
        };
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
        button.onclick = function () {
            const index = this.getAttribute("data-index");
            deleteRecord(index);
        };
    });

    // Save only valid & unique records in localStorage
    localStorage.setItem("medicalRecords", JSON.stringify(uniqueRecords));
}

// Dark Mode Toggle (Ensures it applies when switching themes)
document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.getElementById("themeToggle");

    // Ensure the toggle switch reflects the current theme immediately
    const isDarkMode = localStorage.getItem("theme") === "dark";
    applyTheme(isDarkMode); // Apply theme globally

    if (toggleSwitch) {
        toggleSwitch.checked = isDarkMode;

        // Toggle theme on user interaction
        toggleSwitch.addEventListener("change", function () {
            applyTheme(this.checked);
            localStorage.setItem("theme", this.checked ? "dark" : "light");
        });
    }

    loadRecords(); // Ensure records load with the correct theme
});

// Initialize records on page load
document.addEventListener("DOMContentLoaded", loadRecords);

let deleteIndex = null; // Track the record to delete

// Function to delete a record
function deleteRecord(index) {
    deleteIndex = index; // Save the index of the record to delete
    document.getElementById("deleteConfirmModal").style.display = "flex"; // Show modal
}

// Confirm delete button
document.getElementById("confirmDeleteButton").addEventListener("click", () => {
    if (deleteIndex !== null) {
        let records = JSON.parse(localStorage.getItem("medicalRecords")) || [];
        records.splice(deleteIndex, 1); // Remove the record
        localStorage.setItem("medicalRecords", JSON.stringify(records)); // Update localStorage
        loadRecords(); // Refresh UI
        deleteIndex = null; // Reset delete index
        document.getElementById("deleteConfirmModal").style.display = "none"; // Hide modal
    }
});

// Cancel delete button
document.getElementById("cancelDeleteButton").addEventListener("click", () => {
    deleteIndex = null; // Reset delete index
    document.getElementById("deleteConfirmModal").style.display = "none"; // Hide modal
});

// Function to view a record
function viewRecord(index) {
    let records = JSON.parse(localStorage.getItem("medicalRecords")) || [];
    const record = records[index];

    if (!record || !record.file) return;

    const fileUrl = record.file;
    const fileExtension = getFileExtension(fileUrl);
    const isBase64 = fileUrl.startsWith("data:");

    if (fileExtension === "pdf" && isBase64) {
        // ✅ Open Base64 PDFs in a new tab
        openFileInNewTab(fileUrl, record.title);
    } else if (fileExtension === "pdf") {
        // ✅ Open normal PDF files
        window.open(fileUrl, "_blank");
    } else if (isViewableFile(fileExtension)) {
        // ✅ Open images, text files, and other supported formats
        window.open(fileUrl, "_blank");
    } else {
        // ❌ Show error message for non-viewable files
        showCannotViewMessage(record.title, fileUrl);
    }
}

// 🔹 Function to Open a File in a New Tab
function openFileInNewTab(fileUrl, fileName) {
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(`
            <html>
                <head><title>${fileName}</title></head>
                <body>
                    <iframe src="${fileUrl}" width="100%" height="100%" style="border:none;"></iframe>
                </body>
            </html>
        `);
    }
}

// 🔹 Function to Show a Message for Non-Viewable Files
function showCannotViewMessage(fileName, fileUrl) {
    const newWindow = window.open();
    newWindow.document.write(`
        <html>
            <head>
                <title>File Cannot Be Viewed</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 50px;
                        background-color: #f8f8f8;
                    }
                    .container {
                        max-width: 600px;
                        margin: auto;
                        padding: 20px;
                        background: white;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        border-radius: 10px;
                    }
                    h1 { color: #d9534f; }
                    p { font-size: 16px; color: #333; }
                    a {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    a:hover { background-color: #0056b3; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>File Cannot Be Viewed</h1>
                    <p>The file <strong>${fileName}</strong> cannot be previewed in your browser.</p>
                    <p>Please download it to view its contents.</p>
                    <a href="${fileUrl}" download="${fileName}">Download File</a>
                </div>
            </body>
        </html>
    `);
}

// 🔹 Function to Get File Extension
function getFileExtension(fileUrl) {
    if (fileUrl.startsWith("data:")) {
        return fileUrl.split(";")[0].split("/")[1];
    }
    return fileUrl.split(".").pop().toLowerCase();
}

// 🔹 Function to Check if a File is Viewable
function isViewableFile(extension) {
    return ["jpg", "jpeg", "png", "gif", "txt", "html"].includes(extension);
}

// 🔹 Function to Show a Message for Non-Viewable Files (Supports Dark Mode)
function showCannotViewMessage(fileName, fileUrl) {
    const isDarkMode = document.documentElement.classList.contains("dark-mode"); // Detect dark mode

    const backgroundColor = isDarkMode ? "hsl(220, 20%, 15%)" : "#f8f8f8";  // Dark or Light background
    const containerColor = isDarkMode ? "hsl(220, 20%, 20%)" : "#ffffff";  // Darker box for dark mode
    const textColor = isDarkMode ? "#ffffff" : "#333";  // White text in dark mode
    const headingColor = isDarkMode ? "#ff6b6b" : "#d9534f";  // Bright red in dark mode
    const buttonColor = isDarkMode ? "#007bff" : "#007bff";  // Keep blue button
    const buttonHoverColor = isDarkMode ? "#0056b3" : "#0056b3";  // Keep hover consistent

    const newWindow = window.open();
    newWindow.document.write(`
        <html>
            <head>
                <title>File Cannot Be Viewed</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 50px;
                        background-color: ${backgroundColor};
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }
                    .container {
                        max-width: 600px;
                        margin: auto;
                        padding: 20px;
                        background: ${containerColor};
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        transition: background 0.3s ease;
                    }
                    h1 { 
                        color: ${headingColor}; 
                        transition: color 0.3s ease;
                    }
                    p { 
                        font-size: 16px; 
                        color: ${textColor}; 
                        transition: color 0.3s ease;
                    }
                    a {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: ${buttonColor};
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        transition: background-color 0.3s ease;
                    }
                    a:hover { background-color: ${buttonHoverColor}; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>File Cannot Be Viewed</h1>
                    <p>The file <strong>${fileName}</strong> cannot be previewed in your browser.</p>
                    <p>Please download it to view its contents.</p>
                    <a href="${fileUrl}" download="${fileName}">Download File</a>
                </div>
            </body>
        </html>
    `);
}

// Handle form submission to upload a new record
uploadForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent page reload

    const title = document.getElementById("recordTitle").value;
    const date = document.getElementById("recordDate").value;
    const fileInput = document.getElementById("recordFile");
    const file = fileInput.files[0];

    if (!title || !date || !file) {
        return; // Stop execution if fields are empty
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64File = e.target.result; // Get Base64-encoded file content

        // Retrieve existing records from localStorage
        let records = JSON.parse(localStorage.getItem("medicalRecords")) || [];

        // Add the new record
        records.push({
            title,
            date,
            file: base64File,
        });

        // Save to localStorage
        localStorage.setItem("medicalRecords", JSON.stringify(records));

        // Refresh UI
        loadRecords();

        // Reset form
        uploadForm.reset();
    };
    reader.readAsDataURL(file); // Read file as Base64 Data URL
});

// Initialize records on page load
document.addEventListener("DOMContentLoaded", loadRecords);