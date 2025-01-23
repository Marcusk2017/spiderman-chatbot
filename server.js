const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const app = express();

// Load environment variables
dotenv.config();

// Serve static files
app.use(express.static('./'));

// Add environment variables to window object
app.get('/config.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        window.OPENAI_API_KEY = "${process.env.OPENAI_API_KEY.trim()}";
        window.ELEVENLABS_API_KEY = "${process.env.ELEVENLABS_API_KEY.trim()}";
    `);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    // Debug log (keys will be masked in console)
    console.log('OpenAI Key length:', process.env.OPENAI_API_KEY?.length);
    console.log('ElevenLabs Key length:', process.env.ELEVENLABS_API_KEY?.length);
}); 