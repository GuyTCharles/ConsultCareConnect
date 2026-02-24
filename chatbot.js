/* =====================
   CHATBOT FUNCTIONALITY
   ===================== */
document.addEventListener("DOMContentLoaded", function () {
    const chatButton = document.getElementById("chatbotButton");
    const chatContainer = document.getElementById("chatContainer");
    const closeChat = document.getElementById("closeChat");
    const sendMessage = document.getElementById("sendMessage");
    const userInput = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");
    const toggleSwitch = document.getElementById("themeToggle");

    const TOPICS = [
        "Services offered",
        "Home page",
        "Consultation page",
        "Consultation portal",
        "Types of consultations",
        "Schedule a consultation",
        "Symptom checker",
        "Medical records",
        "Contact us"
    ];

    function normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function topicLinks(topics) {
        return topics
            .map((topic) => `<a href="#" class="chat-link" data-question="${topic}">${topic}</a>`)
            .join(" <br>");
    }

    function topicPrompt(label, topics) {
        return `${label}<br><strong>${topicLinks(topics)}</strong>`;
    }

    const greetingMessage = topicPrompt(
        `Hello, welcome to ConsultCareConnect!<br>
I am Nexa, your virtual assistant. I can help with common questions about our platform. Please choose a topic:`,
        TOPICS
    );

    const intents = [
        {
            id: "greeting",
            patterns: ["hello", "hi", "hey", "greetings", "how are you"],
            reply: "Hello, I'm Nexa. How can I help you today?",
            suggestions: ["Services offered", "Schedule a consultation", "Symptom checker"]
        },
        {
            id: "services",
            patterns: ["services", "services offered", "available services", "what does this site offer"],
            reply: "We offer virtual consultations, symptom checking, medical records management, and appointment scheduling.",
            suggestions: ["Consultation page", "Symptom checker", "Medical records"]
        },
        {
            id: "home",
            patterns: ["home", "home page", "homepage", "main page", "landing page"],
            reply: "The Home page gives quick access to scheduling, symptom checker, and medical records.",
            suggestions: ["Schedule a consultation", "Symptom checker", "Medical records"]
        },
        {
            id: "consultation_page",
            patterns: ["consultation page", "consultation section", "consultation services"],
            reply: "The Consultation area includes:<br>1) Schedule a Consultation to book appointments.<br>2) Consultation Portal to join scheduled visits.",
            suggestions: ["Schedule a consultation", "Consultation portal", "Types of consultations"]
        },
        {
            id: "consultation_types",
            patterns: ["types of consultations", "consultation types", "available consultations", "consultation categories"],
            reply: "Available consultation types include General, Pediatric, Specialist, Telemedicine follow-up, and Mental-health consultations.",
            suggestions: ["Schedule a consultation", "Consultation portal", "Contact us"]
        },
        {
            id: "schedule",
            patterns: ["schedule", "scheduling", "book", "booking", "book appointment", "schedule a consultation"],
            reply: "The Schedule a Consultation page lets you book virtual appointments with healthcare professionals.",
            suggestions: ["Consultation page", "Types of consultations", "Consultation portal"]
        },
        {
            id: "portal",
            patterns: ["portal", "consultation portal", "online consultation", "virtual consultation", "join consultation"],
            reply: "The Consultation Portal is where users join scheduled virtual consultations and communicate with specialists.",
            suggestions: ["Schedule a consultation", "Types of consultations", "Contact us"]
        },
        {
            id: "symptoms",
            patterns: ["symptom", "symptoms", "checker", "check symptoms", "diagnosis", "diagnose"],
            reply: "The Symptoms Checker helps you find trusted health references. It is informational support and does not replace medical diagnosis.",
            suggestions: ["Symptom checker", "Schedule a consultation", "Contact us"]
        },
        {
            id: "records",
            patterns: ["medical", "records", "medical records", "history", "health data"],
            reply: "On the Medical Records page, you can add, view, and manage your health records securely.",
            suggestions: ["Medical records", "Consultation page", "Contact us"]
        },
        {
            id: "contact",
            patterns: ["contact", "contact us", "support", "help", "customer support", "assistance"],
            reply: "For immediate support, use the Call button. Support hours are 8:00 AM to 8:00 PM. You can also use the Help Center link in the footer.",
            suggestions: ["Services offered", "Schedule a consultation", "Consultation portal"]
        }
    ];

    function scoreIntent(input, intent) {
        let best = 0;
        const inputTokens = input.split(" ").filter(Boolean);

        intent.patterns.forEach((patternRaw) => {
            const pattern = normalizeText(patternRaw);
            let score = 0;

            if (input === pattern) score += 5;
            if (input.includes(pattern)) score += 3;

            const patternTokens = pattern.split(" ").filter(Boolean);
            const tokenHits = patternTokens.filter((token) => inputTokens.includes(token)).length;
            score += Math.min(tokenHits, 3);

            if (score > best) best = score;
        });

        return best;
    }

    function findBestIntent(input) {
        let bestIntent = null;
        let bestScore = 0;

        intents.forEach((intent) => {
            const score = scoreIntent(input, intent);
            if (score > bestScore) {
                bestScore = score;
                bestIntent = intent;
            }
        });

        return {
            intent: bestIntent,
            score: bestScore
        };
    }

    // Load history only after greeting is available
    loadChatHistory();

    function applyDarkMode(isDark) {
        document.documentElement.classList.toggle("dark-mode", isDark);
        document.body.classList.toggle("dark-mode", isDark);

        if (chatContainer) {
            chatContainer.classList.toggle("dark-mode", isDark);
        }
    }

    const isDarkMode = localStorage.getItem("theme") === "dark";
    applyDarkMode(isDarkMode);

    if (toggleSwitch) {
        toggleSwitch.checked = isDarkMode;
        toggleSwitch.addEventListener("change", function () {
            const newMode = this.checked;
            localStorage.setItem("theme", newMode ? "dark" : "light");
            applyDarkMode(newMode);
        });
    }

    try {
        if (!localStorage.getItem("greetingMessage") || localStorage.getItem("greetingMessage") !== greetingMessage) {
            localStorage.setItem("greetingMessage", greetingMessage);
        }
    } catch (e) {
        if (!sessionStorage.getItem("greetingMessage") || sessionStorage.getItem("greetingMessage") !== greetingMessage) {
            sessionStorage.setItem("greetingMessage", greetingMessage);
        }
    }

    chatButton.addEventListener("click", function () {
        chatContainer.style.display = "flex";
        chatContainer.style.visibility = "visible";
        chatContainer.style.opacity = "1";
        userInput.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    closeChat.addEventListener("click", function () {
        chatContainer.style.display = "none";
    });

    function sendMessageHandler() {
        const userText = userInput.value.trim();
        if (!userText) return;

        addMessage("User", userText, false, true);
        userInput.value = "";
        botResponse(userText);
    }

    sendMessage.addEventListener("click", sendMessageHandler);

    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessageHandler();
        }
    });

    chatBox.addEventListener("click", function (event) {
        if (event.target.classList.contains("chat-link")) {
            event.preventDefault();
            const question = event.target.dataset.question;
            addMessage("User", question, false, true);
            botResponse(question);
        }
    });

    function addMessage(sender, text, isHTML = false, persist = true) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("chat-message");

        let label = sender;
        if (label === "Bot") label = "Nexa";

        if (label === "User") {
            messageDiv.classList.add("user");
        } else {
            messageDiv.classList.add("bot");
        }

        if (isHTML) {
            messageDiv.innerHTML = label ? `<strong>${label}:</strong> ${text}` : text;
        } else {
            const safeText = escapeHtml(text).replace(/\n/g, "<br>");
            messageDiv.innerHTML = label ? `<strong>${label}:</strong> ${safeText}` : safeText;
        }

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        if (persist) {
            saveChatHistory(label, text, isHTML);
        }
    }

    function saveChatHistory(sender, text, isHTML) {
        const chatHistory = JSON.parse(sessionStorage.getItem("chatHistory")) || [];
        chatHistory.push({
            sender,
            text,
            isHTML
        });
        sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }

    function loadChatHistory() {
        const chatHistory = JSON.parse(sessionStorage.getItem("chatHistory")) || [];
        chatBox.innerHTML = "";

        const greeting = localStorage.getItem("greetingMessage") || greetingMessage;

        if (!chatHistory.length || chatHistory[0].text !== greeting) {
            chatHistory.unshift({
                sender: "",
                text: greeting,
                isHTML: true
            });
            sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        }

        chatHistory.forEach(({ sender, text, isHTML }) => {
            addMessage(sender, text, isHTML, false);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function botResponse(userText) {
        const normalized = normalizeText(userText);
        const { intent, score } = findBestIntent(normalized);

        let response;
        if (intent && score >= 2) {
            const suggestions = intent.suggestions && intent.suggestions.length
                ? topicPrompt("Helpful next options:", intent.suggestions)
                : "";
            response = `${intent.reply}${suggestions ? `<br><br>${suggestions}` : ""}`;
        } else {
            response = topicPrompt(
                "I can help with navigation and platform questions. Try one of these:",
                ["Services offered", "Schedule a consultation", "Consultation portal", "Symptom checker", "Medical records", "Contact us"]
            );
        }

        setTimeout(() => addMessage("Nexa", response, true, true), 700);
    }

    document.addEventListener("click", function (event) {
        if (
            chatContainer.style.display === "flex" &&
            !chatContainer.contains(event.target) &&
            !chatButton.contains(event.target)
        ) {
            chatContainer.style.display = "none";
        }
    });
});
