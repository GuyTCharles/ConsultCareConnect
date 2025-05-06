/* ==========================================================
   CHATBOT FUNCTIONALITY
========================================================== */
document.addEventListener("DOMContentLoaded", function () {
    const chatButton = document.getElementById("chatbotButton");
    const chatContainer = document.getElementById("chatContainer");
    const closeChat = document.getElementById("closeChat");
    const sendMessage = document.getElementById("sendMessage");
    const userInput = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");
    const toggleSwitch = document.getElementById("themeToggle");

    // ✅ Apply Dark Mode to Chat Container on Page Load
    function applyDarkMode(isDark) {
        document.documentElement.classList.toggle("dark-mode", isDark);
        document.body.classList.toggle("dark-mode", isDark);
        
        // Apply dark mode styling to chat
        if (chatContainer) {
            chatContainer.classList.toggle("dark-mode", isDark);
        }
    }

    // Ensure dark mode is applied correctly when the page loads
    const isDarkMode = localStorage.getItem("theme") === "dark";
    applyDarkMode(isDarkMode);

    if (toggleSwitch) {
        toggleSwitch.checked = isDarkMode;

        // ✅ Toggle Dark Mode when user interacts with the switch
        toggleSwitch.addEventListener("change", function () {
            const newMode = this.checked;
            localStorage.setItem("theme", newMode ? "dark" : "light");
            applyDarkMode(newMode);
        });
    }

    // Load chat history on page load
    loadChatHistory();

    // Ensure greeting message is stored properly
    const greetingMessage = `Hello, welcome to ConsultCareConnect!<br> 
    I am <strong>Nexa</strong>, your virtual assistant. I'm here to answer common questions about the platform's services. Please select a topic:<br>
    <strong>
    <a href="#" class="chat-link" data-question="Services offered">Services offered</a> <br> 
    <a href="#" class="chat-link" data-question="Home page">Home page</a> <br>
    <a href="#" class="chat-link" data-question="Consultation page">Consultation page</a> <br>
    <a href="#" class="chat-link" data-question="Consultation portal">Consultation portal</a> <br>
    <a href="#" class="chat-link" data-question="Types of consultations">Types of consultations</a> <br>
    <a href="#" class="chat-link" data-question="Schedule a consultation">Schedule a consultation</a> <br>
    <a href="#" class="chat-link" data-question="Symptom checker">Symptom checker</a> <br>
    <a href="#" class="chat-link" data-question="Medical records">Medical records</a> <br>
    <a href="#" class="chat-link" data-question="Contact us">Contact us</a>
    </strong>`;

    // Ensure greeting message is stored properly
    try {
        // Update greeting message in localStorage only if it has changed
        if (!localStorage.getItem("greetingMessage") || localStorage.getItem("greetingMessage") !== greetingMessage) {
            localStorage.setItem("greetingMessage", greetingMessage);
        }
    } catch (e) {
        console.warn("localStorage not accessible. Using sessionStorage as fallback.");
        if (!sessionStorage.getItem("greetingMessage") || sessionStorage.getItem("greetingMessage") !== greetingMessage) {
            sessionStorage.setItem("greetingMessage", greetingMessage);
        }
    }

    // Open Chat
    chatButton.addEventListener("click", function () {
        chatContainer.style.display = "flex";
        chatContainer.style.visibility = "visible";
        chatContainer.style.opacity = "1";
        userInput.focus();
        chatBox.scrollTop = chatBox.scrollHeight; // Instant scroll
    });

    // Close Chat
    closeChat.addEventListener("click", function () {
        chatContainer.style.display = "none";
    });

    // Function to Send Message
    function sendMessageHandler() {
        let userText = userInput.value.trim();
        if (userText !== "") {
            addMessage("User", userText, false);
            setTimeout(() => botResponse(userText), 1000);
            userInput.value = "";
        }
    }

    // Click Event for Send Button
    sendMessage.addEventListener("click", sendMessageHandler);

    // Pressing "Enter" Sends Message
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessageHandler();
        }
    });

    // Clickable Chat Links - Automatically triggers bot response when clicked
    chatBox.addEventListener("click", function (event) {
        if (event.target.classList.contains("chat-link")) {
            event.preventDefault();
            let question = event.target.dataset.question;

            // Ensure all chat links trigger a response
            addMessage("User", question, false);
            setTimeout(() => botResponse(question), 1000);
        }
    });

    // Function to Add Message to Chat Box and Save History
    function addMessage(sender, text, isHTML = false) {
        let messageDiv = document.createElement("div");
        messageDiv.classList.add("chat-message");

        // Change "Bot" to "Nexa" for all bot responses
        if (sender === "Bot") sender = "Nexa";

        if (sender === "User") {
            messageDiv.classList.add("user");
        } else {
            messageDiv.classList.add("bot");
        }

        if (isHTML) {
            messageDiv.innerHTML = sender ? `<strong>${sender}:</strong> ${text}` : text;
        } else {
            messageDiv.innerHTML = sender ? `<strong>${sender}:</strong> ${text.replace(/\n/g, "<br>")}` : text.replace(/\n/g, "<br>");
        }

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        saveChatHistory(sender, text, isHTML);
    }

    // Function to Save Chat History in sessionStorage (clears when browser closes)
    function saveChatHistory(sender, text, isHTML) {
        let chatHistory = JSON.parse(sessionStorage.getItem("chatHistory")) || [];

        // Prevent duplicate messages (avoid saving the same message again)
        if (!chatHistory.some(entry => entry.text === text)) {
            chatHistory.push({
                sender,
                text,
                isHTML
            });
            sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        }
    }

    // Function to Load Chat History from sessionStorage
    function loadChatHistory() {
        let chatHistory = JSON.parse(sessionStorage.getItem("chatHistory")) || [];
        chatBox.innerHTML = ""; // Clear chat before loading

        let greeting = localStorage.getItem("greetingMessage") || greetingMessage;

        // Ensure the greeting is always the first message but do not add it again if it's already in history
        if (!chatHistory.length || chatHistory[0].text !== greeting) {
            chatHistory.unshift({
                sender: "",
                text: greeting,
                isHTML: true
            });
            sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory)); // Save updated history
        }

        // Load chat history without re-adding greeting message
        chatHistory.forEach(({
            sender,
            text,
            isHTML
        }) => {
            addMessage(sender, text, isHTML);
        });

        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to last message
    }

    // Bot Response Logic
    function botResponse(userText) {
        let response;
        const lowerText = userText.toLowerCase().replace(/[^\w\s]/gi, ''); // Remove punctuation

        // List of keyword sets with corresponding responses
        const responses = [
            {
                keywords: ["hello", "hi", "how are you", "hey", "greetings"],
                reply: "Hello! I'm Nexa. I am here to help! Feel free to ask me any questions you may have regarding ConsultCareConnect services."
        },
            {
                keywords: ["services", "services offered", "services do you offer", "what does this site offer", "site services", "available services"],
                reply: "We offer virtual health consultations, symptom assessments, medical record management, and appointment scheduling."
        },
            {
                keywords: ["home", "home page", "homepage", "main page", "landing page"],
                reply: "The <strong>Home page</strong> provides an overview of our services and quick access to key features like consultation scheduling, symptom checker, and medical records."
        },
            {
                keywords: ["consultation page", "consultation section", "consultation services"],
                reply: "The <strong>Consultation</strong> page consists of two sections:<br> 🔹 <strong>Schedule a Consultation</strong> page where you can book appointments for virtual consultations.<br> 🔹 <strong>Consultation</strong> page to access your scheduled virtual consultations."
        },
            {
                keywords: ["types of consultations", "type of consultation", "consultation types", "consultation type", "consultation categories", "available consultations"],
                reply: "We offer a range of virtual consultations:<br> <strong>🔹 General Consultation</strong> <br> <strong>🔹 Pediatric Consultation</strong><br> <strong>🔹 Specialist Consultation</strong><br> <strong>🔹 Telemedicine Follow-up</strong><br> <strong>🔹 Mental-Health Consultation</strong><br> Each consultation type is designed to meet different healthcare needs."
        },
            {
                keywords: ["schedule", "scheduling", "book", "booking", "schedule a consultation", "schedule consultation", "book an appointment", "book appointment"],
                reply: "The <strong>Schedule a Consultation</strong> page allows you to book virtual appointments with healthcare professionals."
        },
            {
                keywords: ["portal", "virtual", "online", "consultation portal", "online consultation"],
                reply: "The <strong>Consultation Portal</strong> is a secure space where users can connect with healthcare professionals, access their virtual consultations, and chat in real-time with health specialists."
        },
            {
                keywords: ["symptom", "symptoms", "checker", "diagnose", "diagnosis", "analysis", "check symptoms"],
                reply: "The <strong>Symptoms Checker</strong> feature helps you assess your symptoms and find relevant health information."
        },
            {
                keywords: ["medical", "record", "records", "history", "data"],
                reply: "On the <strong>Medical Records</strong> page, you can add, view, and manage your medical history securely."
        },
            {
                keywords: ["contact", "contact us", "customer", "support", "help", "assistance"],
                reply: "You can speak with a support specialist by using our Call button for immediate assistance.<br> Our support hours are 8:00 AM to 8:00 PM.<br> If you prefer email support, you can <a href='#' onclick='openModal(\"helpModal\")'>click here</a> to open our Help Center portal and send us a message."
        }
    ];

        // Sort responses by keyword length to prioritize longer phrases first
        responses.sort((a, b) => {
            const longestA = Math.max(...a.keywords.map(k => k.length));
            const longestB = Math.max(...b.keywords.map(k => k.length));
            return longestB - longestA;
        });

        // Find a matching response using RegExp (Better keyword detection)
        const foundResponse = responses.find(res =>
            res.keywords.some(keyword => new RegExp(`\\b${keyword}\\b`, "i").test(lowerText))
        );

        // Set response if a match is found, otherwise default
        response = foundResponse ? foundResponse.reply : "I'm here to help! Please ask another question.";

        setTimeout(() => addMessage("Nexa", response, true), 1000);
    }
});