/* ==========================================================
   ZOOM FUNCTIONALITY
========================================================== */
// Static Zoom Meeting Integration
const meetingJoinURL = "https://us04web.zoom.us/j/4515539111?pwd=R0JLTXRud3Foc1V0K2FMc3NlSXl5dz09";
const hostKey = "362208";
const joinConsultationButton = document.getElementById("joinConsultationButton");
const endConsultationButton = document.getElementById("endConsultationButton");
const videoContainer = document.getElementById("zoom-video-container");

let currentMeetingActive = false;

// Handle Join Consultation
joinConsultationButton.addEventListener("click", () => {
    if (!currentMeetingActive) {
        videoContainer.innerHTML = `
            <iframe src="${meetingJoinURL}" width="100%" height="500px" allow="camera; microphone; fullscreen"></iframe>
        `;
        currentMeetingActive = true;
        console.log("Joining consultation...");
        endConsultationButton.disabled = false; // Enable "End Consultation" button
    } else {
        console.log("Consultation already in progress");
    }
});

// Handle End Consultation
endConsultationButton.addEventListener("click", () => {
    if (currentMeetingActive) {
        videoContainer.innerHTML = "<p>Consultation has ended</p>";
        currentMeetingActive = false;
        console.log("Ending consultation...");
        endConsultationButton.disabled = true; // Disable "End Consultation" button
    } else {
        console.log("No active consultation to end");
    }
});