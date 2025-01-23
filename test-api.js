// Test configuration
const ELEVENLABS_API_KEY = ''; // Remove actual key
const OPENAI_API_KEY = ''; // Remove actual key
const VOICE_ID = '2eW2ZDwN7xP59U6zeHeR';

// Test OpenAI connection
async function testOpenAI() {
    console.log('Testing OpenAI connection...');
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: 'Say hello!' }
                ]
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('✅ OpenAI connection successful!');
            console.log('Response:', data.choices[0].message.content);
        } else {
            console.log('❌ OpenAI Error:', data);
        }
    } catch (error) {
        console.log('❌ OpenAI Error:', error);
    }
}

// Test ElevenLabs connection
async function testElevenLabs() {
    console.log('Testing ElevenLabs connection...');
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: 'Testing the connection!',
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.15,
                    similarity_boost: 0.90
                }
            })
        });

        if (response.ok) {
            console.log('✅ ElevenLabs connection successful!');
        } else {
            const error = await response.json();
            console.log('❌ ElevenLabs Error:', error);
        }
    } catch (error) {
        console.log('❌ ElevenLabs Error:', error);
    }
}

// Run tests
async function runTests() {
    console.log('Starting API tests...\n');
    await testOpenAI();
    console.log('\n-------------------\n');
    await testElevenLabs();
}

runTests(); 