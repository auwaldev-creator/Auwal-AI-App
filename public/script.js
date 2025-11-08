document.addEventListener('DOMContentLoaded', () => {

    // === Sashin Loading Screen ===
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');

    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        appContainer.style.display = 'flex';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 4000);

    // === Abubuwan da zamu yi amfani dasu ===
    const chatMessages = document.getElementById('chat-messages');
    const promptInput = document.getElementById('prompt-input');
    const sendBtn = document.getElementById('send-btn');
    const modeSelect = document.getElementById('mode-select');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const chatHistoryContainer = document.getElementById('chat-history');
    const newChatBtn = document.getElementById('new-chat-btn');

    let currentChatHistory = []; 

    // === Yanayin Haske/Duhu (Light/Dark Mode) ===
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.textContent = 'dark_mode';
            themeText.textContent = 'Yanayin Duhu';
        } else {
            themeIcon.textContent = 'light_mode';
            themeText.textContent = 'Yanayin Haske';
        }
    });

    // === Aikin Tura Sako (Send Button) ===
    sendBtn.addEventListener('click', handleSendRequest);
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendRequest();
        }
    });

    async function handleSendRequest() {
        const prompt = promptInput.value.trim();
        const mode = modeSelect.value;
        if (!prompt) return;

        appendMessage('user', prompt);
        promptInput.value = '';
        promptInput.disabled = true;
        sendBtn.disabled = true;

        const loadingMessage = appendMessage('loading', 'Ana aiki...');

        try {
            if (mode === 'chat') {
                await sendChatRequest(prompt);
            } else {
                loadingMessage.querySelector('.text').textContent = 'Ana zana hoto... (Wannan zai ɗauki ɗan lokaci)';
                await sendImageRequest(prompt);
            }
        } catch (error) {
            appendMessage('error', `An samu kuskure: ${error.message}`);
            console.error('Kuskure ya faru:', error);
        } finally {
            promptInput.disabled = false;
            sendBtn.disabled = false;
            promptInput.focus();
            chatMessages.removeChild(loadingMessage);
        }
    }

    // === Aikin Aika Tambayar Chat (Gemini) ===
    async function sendChatRequest(prompt) {
        console.log('Aikawa zuwa /api/chat:', prompt);
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt, history: currentChatHistory }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Gemini API request failed');
        }

        const data = await response.json();
        appendMessage('ai', data.text);
        currentChatHistory.push({ role: "user", parts: [{ text: prompt }] });
        currentChatHistory.push({ role: "model", parts: [{ text: data.text }] });
    }

    // === Aikin Aika Tambayar Hoto (DeepAI) ===
    async function sendImageRequest(prompt) {
        console.log('Aikawa zuwa /api/image:', prompt);

        const response = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'DeepAI API request failed');
        }

        const data = await response.json();
        const imageUrl = data.imageUrl;
        appendMessage('ai', `<img src="${imageUrl}" alt="Generated Image: ${prompt}" class="generated-image">`);
    }

    // === Aikin Ƙara Sako a Shafin Hira ===
    function appendMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        // *** GYARA ANAN: Sabbin links na hotuna ***
        let avatarSrc = (sender === 'user') ? 
            'https://i.imgur.com/sQfLhGj.png' : // Sabon hoton User
            'https://i.imgur.com/g0b2TjV.png';  // Sabon hoton AI

        messageDiv.innerHTML = `
            <img src="${avatarSrc}" alt="${sender}" class="avatar">
            <div class="text">${content}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // === Aikin Sabon Hira (New Chat) ===
    newChatBtn.addEventListener('click', () => {
        chatMessages.innerHTML = `
            <div class="message welcome-message">
                <img src="https://i.imgur.com/g0b2TjV.png" alt="AI" class="avatar">
                <div class="text">
                    Sannu! An fara sabon hira. Me kake so mu tattauna?
                </div>
            </div>
        `;
        currentChatHistory = [];
        console.log('An fara sabon hira.');
    });

});
