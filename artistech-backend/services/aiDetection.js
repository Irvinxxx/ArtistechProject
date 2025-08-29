const axios = require('axios');
const fs = require('fs').promises;

const AI_DETECTION_THRESHOLD = 0.90;

const detectAiArt = async (filePath, userId, artworkId = null) => {
  const db = require('../config/db').getDB();
  const hiveApiKey = process.env.HIVE_API_KEY;

  if (!hiveApiKey || hiveApiKey === 'REPLACE_WITH_YOUR_HIVE_API_KEY') {
    console.warn('Hive API key not configured. Skipping AI detection.');
    return { isAiArt: false, score: 0, rawResponse: null };
  }

  let isAiArt = false;
  let score = 0;
  let rawResponse = null;

  try {
    const imageBuffer = await fs.readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    const payload = {
      model: "hive/vision-language-model",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Is this image AI-generated? Please respond with JSON containing a single key 'ai_generated_score' with a value from 0.0 to 1.0.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 100,
    };

    const response = await axios.post(
      'https://api.thehive.ai/api/v3/chat/completions',
      payload,
      {
        headers: {
          'authorization': `Bearer ${hiveApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const cleanedContent = content.replace(/```json\n|\n```/g, '');
    const result = JSON.parse(cleanedContent);
    
    rawResponse = JSON.stringify(response.data, null, 2);
    
    if (result && typeof result.ai_generated_score === 'number') {
      score = result.ai_generated_score;
      isAiArt = score >= AI_DETECTION_THRESHOLD;
    }

  } catch (error) {
    console.error('Error calling Hive VLM API:', error.response ? error.response.data : error.message);
    rawResponse = JSON.stringify(error.response ? error.response.data : { error: error.message }, null, 2);
  }

  try {
    await db.execute(
      'INSERT INTO ai_detection_logs (user_id, artwork_id, detection_service, is_ai_generated, detection_result) VALUES (?, ?, ?, ?, ?)',
      [userId, artworkId, 'hive.ai-vlm', isAiArt, rawResponse]
    );
  } catch (dbError) {
    console.error('Failed to log AI detection result to database:', dbError);
  }

  return { isAiArt, score };
};

module.exports = { detectAiArt };
