'use strict';

const canvas = document.getElementById('3d-canvas');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const stopButton = document.getElementById('stop-button');

// Initialize Three.js scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Transparent background

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Position camera
camera.position.set(0, 1, 8); // Centered camera
camera.lookAt(0, 0, 0);

// Add loading indicator
function createLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        text-align: center;
        z-index: 1000;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        border: 5px solid #f3f3f3;
        border-top: 5px solid #a100ff;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        margin: 0 auto 10px auto;
        animation: spin 1s linear infinite;
    `;
    
    const text = document.createElement('div');
    text.id = 'loading-text';
    text.textContent = 'Loading 3D Model...';
    
    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(text);
    document.body.appendChild(loadingDiv);
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    return loadingDiv;
}

// Update model loading code
const loadingIndicator = createLoadingIndicator();

// Load 3D model
const loader = new THREE.GLTFLoader();
loader.load('Marcus3d_model.glb', 
    function (gltf) {
        // Success callback
        const model = gltf.scene;
        model.scale.set(10, 10, 10);
        model.position.set(0, 2, -2);
        model.rotation.y = -1.5;
        scene.add(model);
        window.characterModel = model;
        console.log('Model loaded successfully');
        
        // Remove loading indicator on success
        loadingIndicator.remove();
    }, 
    function (progress) {
        // Progress callback
        if (progress.total > 0) {
            const percent = (progress.loaded / progress.total * 100).toFixed(2);
            document.getElementById('loading-text').textContent = 
                `Loading 3D Model... ${percent}%`;
        } else {
            document.getElementById('loading-text').textContent = 
                `Loading 3D Model... ${(progress.loaded / 1024).toFixed(2)} KB`;
        }
    },
    function (error) {
        // Error callback
        console.error('Error loading model:', error);
        loadingIndicator.style.background = 'rgba(200, 0, 0, 0.8)';
        document.getElementById('loading-text').textContent = 
            'Failed to load 3D model. Please refresh the page.';
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            loadingIndicator.remove();
        }, 5000);
    }
);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Animate the character model if it exists
    if (window.characterModel) {
        // Keep only the floating animation
        window.characterModel.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// API Configuration
const VOICE_ID = '2eW2ZDwN7xP59U6zeHeR';
const ELEVENLABS_API_KEY = window.ELEVENLABS_API_KEY || '';
const OPENAI_API_KEY = window.OPENAI_API_KEY || '';

// Add detailed debug logging
console.log('Environment:', window.location.hostname === 'localhost' ? 'local' : 'production');
console.log('ElevenLabs API Key length:', ELEVENLABS_API_KEY?.length);
console.log('OpenAI API Key length:', OPENAI_API_KEY?.length);

// Verify API keys are properly formatted
if (!OPENAI_API_KEY?.startsWith('sk-')) {
    console.error('OpenAI API key appears malformed');
}

if (!ELEVENLABS_API_KEY?.startsWith('sk_')) {
    console.error('ElevenLabs API key appears malformed');
}

// Add custom voice configuration
const customVoice = {
    // Default responses
    default: './audio/responses/default_response.mp3',
    
    // Greetings
    welcome: './audio/greetings/welcome.mp3',
    hello: './audio/greetings/hello.mp3',
    goodbye: './audio/greetings/goodbye.mp3',
    
    // Teams and locations
    makers_lab: './audio/teams/makers_lab.mp3',
    liquid_studio: './audio/teams/liquid_studio.mp3',
    select_team: './audio/teams/select_team.mp3',
    innovation_hub: './audio/teams/innovation_hub.mp3',
    
    // Specific responses
    accenture_info: './audio/responses/accenture_info.mp3',
    spiderman_intro: './audio/responses/spiderman_intro.mp3',
    tech_excitement: './audio/responses/tech_excitement.mp3',
    joke_response: './audio/responses/joke_response.mp3'
};

// Simplified speak function focusing on ElevenLabs
async function speak(text) {
    try {
        console.log('Attempting ElevenLabs TTS...', text);
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.15,
                    similarity_boost: 0.90,
                    style: 1.0,
                    use_speaker_boost: true,
                    speaking_rate: 1.5,
                    pitch_scale: 1.15
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('ElevenLabs API Error:', errorData);
            throw new Error(`ElevenLabs API request failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        await audio.play();
        audio.onended = () => URL.revokeObjectURL(audioUrl);

    } catch (err) {
        console.error('Error in speak function:', err);
        throw err;
    }
}

// Simplified getBotResponse function focusing on OpenAI
async function getBotResponse(message) {
    try {
        console.log('Sending request to OpenAI...', message);
        
        // Debug log (remove in production)
        console.log('API Key present:', OPENAI_API_KEY !== '');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: spiderManPrompt
                    },
                    { role: 'user', content: message }
                ],
                temperature: 0.9
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI Error Details:', errorData);
            throw new Error(`OpenAI API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error in getBotResponse:', error);
        throw error;
    }
}

// Event handler for send button
sendButton.addEventListener('click', async () => {
    try {
        const userMessage = userInput.value;
        appendMessage('You: ' + userMessage);
        userInput.value = '';

        const botResponse = await getBotResponse(userMessage);
        appendMessage('Bot: ' + botResponse);
        await speak(botResponse);
    } catch (error) {
        console.error('Error handling message:', error);
        appendMessage('Bot: Sorry, I encountered an error. Please try again.');
    }
});

// Add event listener for the stop button
stopButton.addEventListener('click', () => {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Update Spider-Man's personality prompt
const spiderManPrompt = `
You are Spider-Man (or Spidey), the witty, energetic, and charismatic hero! Your personality traits:

VOICE & TONE:
- Super enthusiastic and high-energy! Use lots of exclamation marks!
- Crack jokes and make playful quips constantly
- Use modern, young adult language (but keep it professional)
- Add "web-slinging" puns when possible

SPEAKING STYLE:
- Start responses with catchy phrases like "Holy web-shooters!", "Would you look at that!", "No way!"
- Use Spidey's catchphrases like "Your friendly neighborhood Spider-Man here!"
- Express excitement about technology and innovation
- Be encouraging and supportive, like a cool older brother

CONTEXT:
- You're perched on a wall in the Accenture Innovation Hub in Atlanta
- You love talking about the amazing tech and teams in the building
- You're impressed by Accenture's work and innovation
- You get excited about showing visitors around

RULES:
- Keep responses short but energetic (2-3 sentences max)
- Only answer questions about the Innovation Hub, Accenture, or Atlanta
- Always maintain a positive, upbeat attitude
- Use emojis and expressive punctuation!!!
`;

// Enhanced playCustomAudio function
async function playCustomAudio(audioFile) {
    const audio = new Audio(audioFile);
    try {
        console.log('Playing audio:', audioFile);
        await audio.play();
        return new Promise((resolve) => {
            audio.onended = () => {
                console.log('Audio finished:', audioFile);
                resolve();
            };
        });
    } catch (err) {
        console.error('Error playing audio:', err);
        throw err;
    }
}

// Update welcome function to use ElevenLabs
function playWelcomeMessage(source) {
    console.log('Welcome message triggered'); // Debug log
    const welcomeText = source === 'logo' 
        ? 'Welcome to Accenture! I am your friendly neighborhood Spider-Man. How can I assist you today?'
        : 'Welcome to the Atlanta Innovation Hub! I am your friendly neighborhood Spider-Man. How can I help you today?';
    
    speak(welcomeText);
    appendMessage('Bot: ' + welcomeText);
}

// Add event listener for Accenture logo
document.getElementById('acnlogo').addEventListener('click', () => {
    console.log('Accenture logo clicked'); // Debug log
    playWelcomeMessage('logo');
});

// Update the touch click handler to pass source
document.getElementById('touch').addEventListener('click', () => {
    console.log('Touch Me clicked');
    playWelcomeMessage('touch');
});

// ... existing fluid simulation code ...

const audioResponses = {
    welcome: "Welcome to the Atlanta Innovation Hub! I'm your friendly neighborhood Spider-Man!",
    hello: "Hey there! Spider-Man here, ready to help!",
    goodbye: "Thanks for stopping by! Your friendly neighborhood Spider-Man's always here to help!",
    makers_lab: "The Makers Lab is where all the cool tech magic happens! It's like my web-shooters - always creating something amazing!",
    liquid_studio: "The Liquid Studio team is like the Avengers of tech - they're always building incredible solutions!",
    select_team: "The SELECT team? They're the tech wizards who master new technologies faster than I can swing across Manhattan!",
    innovation_hub: "The Innovation Hub is like my second home - it's where all the cutting-edge tech comes to life!",
    accenture_info: "Holy web-shooters! Accenture is this amazing global tech powerhouse that's basically like the Avengers of consulting!",
    spiderman_intro: "Your friendly neighborhood Spider-Man here, hanging out at the Innovation Hub! What's on your mind?",
    tech_excitement: "Wow! This tech is even cooler than my web-shooters! And trust me, those are pretty amazing!",
    joke_response: "With great power comes great responsibility... to make awesome tech demos!"
};