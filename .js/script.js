document.addEventListener("DOMContentLoaded", () => {
    
    // 1. CONFIGURATION
    const GEMINI_API_KEY = "AIzaSyA8KvXdDElnD0ZXhA0o2BzCG5UVwJSxhow"; // WARNING: Don't share this publicly on GitHub if possible!
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;

    // 2. VARIABLES
    const chatLog = document.getElementById("chat-log");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    let chatHistory = []; // Memory
    let idleTimer;

    // 3. EVENT LISTENERS
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); 
            sendMessage();
        }
    });
    userInput.addEventListener("input", resetIdleTimer);

    // 4. FUNCTIONS
    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        appendMessage(userMessage, "user");
        userInput.value = ""; 
        userInput.disabled = true;
        sendBtn.disabled = true;

        // Add user message to history
        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

        const botMessage = await getGeminiResponse();
        appendMessage(botMessage, "bot");

        // Add bot response to history
        chatHistory.push({ role: "model", parts: [{ text: botMessage }] });

        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
        resetIdleTimer();
    }

    function appendMessage(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.className = sender === "user" ? "user-msg" : "bot-msg";
        messageElement.textContent = "C:\\> " + message; 
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    async function getGeminiResponse() {
        const payload = {
            contents: chatHistory,
            // THEMATIC LIMITATION: Explicitly forbid helpfulness
            systemInstruction: {
                parts: [{ text: "You are DIVA_BOT.EXE. You are sarcastic, rude, and have an 'Unfiltered Savage' attitude. LIMITATION: You MUST REFUSE to write essays, code, or long explanations. If asked for help, insult the user's intelligence. Keep answers under 30 words." }]
            },
            // TECHNICAL LIMITATION: Force short responses (max 60 tokens)
            generationConfig: {
                maxOutputTokens: 60, 
                temperature: 1.2 
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return `Error: ${errorData.error?.message || "Check console."}`;
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

        } catch (error) {
            console.error("Network Error:", error);
            return "Fatal Error: Connection failed.";
        }
    }

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            appendMessage("Session timed out. I'm ignoring you now.", "bot");
            userInput.disabled = true;
            sendBtn.disabled = true;
        }, 120000); 
    }

    resetIdleTimer();
});
