const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const app = express();

// Load environment variables
dotenv.config();

// Serve static files with proper MIME types
app.use(express.static('./', {
    setHeaders: (res, path) => {
        if (path.endsWith('.glb')) {
            res.set('Content-Type', 'model/gltf-binary');
        }
    }
}));

// Add environment variables to window object
app.get('/config.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        window.OPENAI_API_KEY = "${process.env.OPENAI_API_KEY?.trim() || ''}";
        window.ELEVENLABS_API_KEY = "${process.env.ELEVENLABS_API_KEY?.trim() || ''}";
        console.log('Config loaded with keys:', {
            openai: !!window.OPENAI_API_KEY,
            elevenlabs: !!window.ELEVENLABS_API_KEY
        });
    `);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Place your 3D model file in the root directory as "Marcus3d_model.glb"');
    // Verify keys are loaded
    console.log('API Keys present:', {
        openai: !!process.env.OPENAI_API_KEY,
        elevenlabs: !!process.env.ELEVENLABS_API_KEY
    });
}); 