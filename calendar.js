/* ==========================================================
   CALENDAR FUNCTIONALITY
========================================================== */
document.addEventListener("DOMContentLoaded", function () {
    const calendar = {
        currentDate: new Date(),
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const renderCalendar = () => {
        const datesContainer = document.getElementById("dates");
        const currentMonthDisplay = document.getElementById("current-month");
        const {
            currentMonth,
            currentYear
        } = calendar;

        if (!datesContainer || !currentMonthDisplay) {
            console.error("Calendar container or month display not found.");
            return;
        }

        currentMonthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        datesContainer.innerHTML = ""; // Clear previous dates

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
        const currentDay = isCurrentMonth ? today.getDate() : null;

        for (let i = 0; i < firstDay; i++) {
            const blankSpace = document.createElement("div");
            datesContainer.appendChild(blankSpace);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateElement = document.createElement("div");
            dateElement.classList.add("date");
            dateElement.textContent = day;

            if (day === currentDay) {
                dateElement.classList.add("today");
            }

            dateElement.addEventListener("click", function () {
                document.querySelectorAll(".date").forEach((el) => el.classList.remove("selected"));
                this.classList.add("selected");
            });

            datesContainer.appendChild(dateElement);
        }
    };

    document.getElementById("prev-month")?.addEventListener("click", () => {
        calendar.currentMonth = calendar.currentMonth === 0 ? 11 : calendar.currentMonth - 1;
        calendar.currentYear -= calendar.currentMonth === 11 ? 1 : 0;
        renderCalendar();
    });

    document.getElementById("next-month")?.addEventListener("click", () => {
        calendar.currentMonth = calendar.currentMonth === 11 ? 0 : calendar.currentMonth + 1;
        calendar.currentYear += calendar.currentMonth === 0 ? 1 : 0;
        renderCalendar();
    });

    renderCalendar(); // Initial render
});

/* ==========================================================
   UTILITY FUNCTIONS
========================================================== */
function resetPage() {
    window.location.reload();
}

/* ================================
   DARK MODE - SCHEDULING PAGE
   ================================ */
document.addEventListener("DOMContentLoaded", function () {
    const isDarkMode = localStorage.getItem("theme") === "dark";
    const toggleSwitch = document.getElementById("themeToggle");

    // Apply initial theme
    document.documentElement.classList.toggle("dark-mode", isDarkMode);
    document.body.classList.toggle("dark-mode", isDarkMode);

    if (toggleSwitch) {
        toggleSwitch.checked = isDarkMode;

        // Toggle theme on user interaction
        toggleSwitch.addEventListener("change", function () {
            if (this.checked) {
                document.documentElement.classList.add("dark-mode");
                document.body.classList.add("dark-mode");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.classList.remove("dark-mode");
                document.body.classList.remove("dark-mode");
                localStorage.setItem("theme", "light");
            }
        });
    }
});

/* ==========================================================
   CONSULTATION FORM AND MODAL FUNCTIONALITY
========================================================== */
let consultationDetails = null; // Store global details for .ics generation
let uploadedFile = null; // Track the uploaded file

// Utility: Format date/time for .ics (UTC format)
function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
        console.error("Invalid date format:", dateTime);
        return "";
    }
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; // Correct UTC format
}

// Utility: Generate unique UID for the event
function generateUID() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@consultcareconnect.com`;
}

// Utility: Escape special characters for .ics fields
function escapeText(text) {
    return (text || "")
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
}

// Function to generate .ics file content
function generateICSFile({
    title,
    startDateTime,
    endDateTime,
    description,
    location,
    url
}) {
    const formattedStart = formatDateTime(startDateTime);
    const formattedEnd = formatDateTime(endDateTime);
    const timestamp = formatDateTime(new Date()); // Current UTC timestamp

    if (!formattedStart || !formattedEnd) {
        console.error("Invalid start or end date format.");
        return null;
    }

    // Format time output (e.g., "8:00 AM to 8:30 AM")
    const formatTimeHumanReadable = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert to 12-hour format
        return `${hours}:${minutes} ${ampm}`;
    };

    const startReadableTime = formatTimeHumanReadable(startDateTime);
    const endReadableTime = formatTimeHumanReadable(endDateTime);

    // Include formatted times in the description
    const fullDescription = `${description}\nAppointment Time: ${startReadableTime} to ${endReadableTime}`;

    return `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${generateUID()}
DTSTAMP:${timestamp}
DTSTART:${formattedStart}
DTEND:${formattedEnd}
SUMMARY:${escapeText(title)}
DESCRIPTION:${escapeText(fullDescription)}
LOCATION:${escapeText(location)}
URL:${escapeText(url)}
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR
    `.trim();
}

// Function to trigger the download of the .ics file
function downloadICSFile(eventDetails) {
    const icsContent = generateICSFile(eventDetails);

    if (!icsContent) {
        return;
    }

    console.log("Generated .ics Content:", icsContent); // Debugging log

    const blob = new Blob([icsContent], {
        type: "text/calendar"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Consultation.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Handle file upload and store in localStorage for Medical Records Page
document.getElementById("medical-records").addEventListener("change", (event) => {
    const file = event.target.files[0];
    const fileDisplay = document.getElementById("uploaded-document-link");

    if (file) {
        uploadedFile = file;
        const fileURL = URL.createObjectURL(file); // Create local file URL
        fileDisplay.textContent = file.name;
        fileDisplay.style.textDecoration = "underline";
        fileDisplay.style.cursor = "pointer";

        // Save uploaded file in localStorage for Medical Records Page
        let records = JSON.parse(localStorage.getItem("medicalRecords")) || [];
        const newRecord = {
            title: file.name,
            date: new Date().toISOString().split("T")[0], // Format YYYY-MM-DD
            file: fileURL
        };
        records.push(newRecord);
        localStorage.setItem("medicalRecords", JSON.stringify(records));

        // Make the file downloadable
        fileDisplay.addEventListener("click", () => {
            const link = document.createElement("a");
            link.href = fileURL;
            link.download = file.name;
            link.click();
            URL.revokeObjectURL(fileURL);
        });
    } else {
        uploadedFile = null;
        fileDisplay.textContent = "[No file uploaded]";
        fileDisplay.style.textDecoration = "none";
        fileDisplay.style.cursor = "default";
    }
});

// Event Listener for Submit Button
document.querySelector(".primary-button.submit-button").addEventListener("click", () => {
    console.log("Submit button clicked");

    const selectedDateElement = document.querySelector(".date.selected");
    const selectedDate = selectedDateElement?.textContent;
    const selectedType = document.getElementById("consultation-type")?.value;
    const selectedTime = document.getElementById("consultation-time")?.value;

    if (!selectedDate) {
        alert("Please select a date.");
        return;
    }

    if (selectedType === "-" || !selectedType) {
        alert("Please select a consultation type.");
        return;
    }

    if (selectedTime === "-" || !selectedTime) {
        alert("Please select a consultation time.");
        return;
    }

    const currentMonth = document.getElementById("current-month").textContent.split(" ")[0];
    const currentYear = new Date().getFullYear();
    const day = parseInt(selectedDate, 10);

    // Extract time and convert to 24-hour format
    const [hour, minute] = selectedTime.split(":").map((t) => parseInt(t, 10));
    const isPM = selectedTime.toLowerCase().includes("pm");
    const hour24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;

    // Validate time selection
    const startDateTime = new Date(currentYear, new Date(`${currentMonth} 1`).getMonth(), day, hour24, minute || 0);
    const now = new Date();

    if (startDateTime < now) {
        alert("Please select a recent or future date to book your appointment.");
        return;
    }

    // Calculate end time (30 minutes later)
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

    const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert to 12-hour format
        return `${hours}:${minutes} ${ampm}`;
    };

    const startFormattedTime = formatTime(startDateTime);
    const endFormattedTime = formatTime(endDateTime);

    consultationDetails = {
        title: selectedType,
        startDateTime,
        endDateTime,
        description: "Your scheduled consultation with ConsultCareConnect.",
        location: "ConsultCareConnect",
        url: "https://www.consultcareconnect.com",
    };

    console.log("Consultation Details:", consultationDetails);

    document.getElementById("confirmation-date").textContent = `${currentMonth} ${selectedDate}, ${currentYear}`;
    document.getElementById("confirmation-time").textContent = `${startFormattedTime} to ${endFormattedTime}`;
    document.getElementById("confirmation-type").textContent = selectedType;

    if (uploadedFile) {
        const fileDisplay = document.getElementById("uploaded-document-link");
        fileDisplay.textContent = uploadedFile.name;
        fileDisplay.style.textDecoration = "underline";
        fileDisplay.style.cursor = "pointer";
    }

    document.getElementById("consultationModal").style.display = "flex";
});

// Event Listener for "Download Appointment" Button
document.getElementById("downloadAppointmentButton").addEventListener("click", () => {
    if (!consultationDetails) {
        return;
    }

    downloadICSFile(consultationDetails);
});


// Close Modal and Reset Selections
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        console.log(`Modal with ID '${modalId}' closed.`);
    } else {
        console.error(`Modal with ID '${modalId}' not found.`);
        return; // Stop if modal not found
    }

    // Reset selected date
    const selectedDate = document.querySelector(".date.selected");
    if (selectedDate) {
        selectedDate.classList.remove("selected");
        console.log("Selected date reset.");
    } else {
        console.log("No selected date to reset.");
    }

    // Reset consultation type dropdown
    const consultationTypeDropdown = document.getElementById("consultation-type");
    if (consultationTypeDropdown) {
        consultationTypeDropdown.value = "-";
        console.log("Consultation type reset.");
    } else {
        console.error("Consultation type dropdown not found.");
    }

    // Reset consultation time dropdown
    const consultationTimeDropdown = document.getElementById("consultation-time");
    if (consultationTimeDropdown) {
        consultationTimeDropdown.value = "-";
        console.log("Consultation time reset.");
    } else {
        console.error("Consultation time dropdown not found.");
    }

    // Reset uploaded file display
    const fileDisplay = document.getElementById("uploaded-document-link");
    if (fileDisplay) {
        fileDisplay.textContent = "[No file uploaded]";
        fileDisplay.style.textDecoration = "none";
        fileDisplay.style.cursor = "default";
        console.log("Uploaded file display reset.");
    } else {
        console.error("Uploaded file display element not found.");
    }

    // Clear global details
    consultationDetails = null;
    uploadedFile = null;
    console.log("Global details reset.");
}

// Handle Join Consultation
document.getElementById("joinConsultationButton").addEventListener("click", handleJoinConsultation);

function handleJoinConsultation() {
    if (!consultationDetails) {
        logAction("No consultation details found. Redirecting to consultation page...");
    } else {
        const now = new Date();
        if (now < consultationDetails.startDateTime) {
            logAction("User joined consultation before the scheduled time.");
        } else {
            logAction("User joined consultation on time.");
        }
    }

    redirectToConsultationPage();
}

function logAction(message) {
    console.log(message);
}

function redirectToConsultationPage() {
    logAction("Redirecting to consultation page...");
    window.location.href = "consultation.html";
}

// Attach reschedule button logic
document.getElementById("rescheduleButton").addEventListener("click", () => {
    closeModal("consultationModal");
    window.location.href = "#calendar-container";
});


/* ==========================================================
   MODAL MANAGEMENT
========================================================== */

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}

function handleReschedule() {
    closeModal("consultationModal");
    window.location.href = "#calendar-container";
}

// Attach reschedule button logic
document.getElementById("rescheduleButton").addEventListener("click", handleReschedule);


/* ==========================================================
   FILE UPLOAD MANAGEMENT FOR MEDICAL RECORDS PAGE
========================================================== */
// Handle file upload and store in localStorage for Medical Records Page
document.getElementById("medical-records").addEventListener("change", (event) => {
    const file = event.target.files[0];
    const fileDisplay = document.getElementById("uploaded-document-link");

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const base64File = e.target.result; // Convert file to Base64

            let records = JSON.parse(localStorage.getItem("medicalRecords")) || [];

            // Prevent duplicate files by checking existing records
            const fileExists = records.some(record => record.title === file.name && record.file === base64File);

            if (!fileExists) {
                const newRecord = {
                    title: file.name,
                    date: new Date().toISOString().split("T")[0], // Format YYYY-MM-DD
                    file: base64File // Store Base64 encoded file
                };

                records.push(newRecord);
                localStorage.setItem("medicalRecords", JSON.stringify(records));
            }

            // Update UI
            fileDisplay.textContent = file.name;
            fileDisplay.style.textDecoration = "underline";
            fileDisplay.style.cursor = "pointer";

            // Make the file clickable for download/view
            fileDisplay.addEventListener("click", () => {
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head><title>${file.name}</title></head>
                            <body>
                                <iframe src="${base64File}" width="100%" height="100%" style="border:none;"></iframe>
                            </body>
                        </html>
                    `);
                }
            });

            // Refresh UI on Medical Records Page
            loadRecords();
        };

        reader.readAsDataURL(file); // Convert file to Base64
    } else {
        fileDisplay.textContent = "[No file uploaded]";
        fileDisplay.style.textDecoration = "none";
        fileDisplay.style.cursor = "default";
    }
});