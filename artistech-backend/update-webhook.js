const axios = require('axios');
require('dotenv').config();

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const NGROK_API_URL = 'http://127.0.0.1:4040/api/tunnels';
const WEBHOOK_ENDPOINT = '/api/webhooks/paymongo';
const EXPECTED_EVENTS = ['link.payment.paid']; // The event we care about

// PayMongo API is authenticated via HTTP Basic Auth with the secret key as the username
const paymongoApi = axios.create({
  baseURL: 'https://api.paymongo.com/v1',
  auth: {
    username: PAYMONGO_SECRET_KEY,
    password: '' 
  }
});

// A small delay function to give ngrok time to start up
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getNgrokUrl() {
  try {
    // Retry a few times in case ngrok is slow to start
    for (let i = 0; i < 5; i++) {
      try {
        const response = await axios.get(NGROK_API_URL);
        const httpsTunnel = response.data.tunnels.find(tunnel => tunnel.proto === 'https');
        if (httpsTunnel) {
          console.log('✅ Fetched Ngrok URL:', httpsTunnel.public_url);
          return httpsTunnel.public_url;
        }
      } catch (error) {
        console.log(`⏳ Ngrok not ready, retrying... (${i + 1}/5)`);
        await sleep(2000); // Wait 2 seconds before retrying
      }
    }
    throw new Error('Could not get Ngrok URL after several attempts.');
  } catch (error) {
    console.error('❌ Error getting Ngrok URL:', error.message);
    process.exit(1);
  }
}

async function getDevelopmentWebhook() {
  try {
    const { data } = await paymongoApi.get('/webhooks');
    // Find a webhook that is already pointing to a known local tunnel service.
    // This is a more reliable way to identify the webhook used for development.
    const devWebhook = data.data.find(wh => 
        wh.attributes.url.includes('ngrok') || wh.attributes.url.includes('loca.lt')
    );
    
    if (devWebhook) {
      console.log(`✅ Found existing development webhook with ID: ${devWebhook.id}`);
      return devWebhook;
    }
    console.log('ℹ️ No existing development webhook found. A new one will be created.');
    return null;
  } catch (error) {
    console.error('❌ Error fetching webhooks:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

async function updateWebhookUrl(webhookId, newUrl) {
    try {
        await paymongoApi.put(`/webhooks/${webhookId}`, {
            data: {
                attributes: {
                    url: newUrl,
                    events: EXPECTED_EVENTS
                }
            }
        });
        console.log(`✅ Successfully updated webhook ${webhookId} to new URL: ${newUrl}`);
    } catch (error) {
        console.error('❌ Error updating webhook:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

async function createWebhook(newUrl) {
    try {
        const { data } = await paymongoApi.post('/webhooks', {
            data: {
                attributes: {
                    url: newUrl,
                    events: EXPECTED_EVENTS
                }
            }
        });
        console.log(`✅ Successfully created new webhook with ID: ${data.data.id}`);
    } catch (error) {
        console.error('❌ Error creating webhook:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}


async function main() {
  if (!PAYMONGO_SECRET_KEY) {
    console.error('❌ PAYMONGO_SECRET_KEY is not set in your .env file. Please add it.');
    process.exit(1);
  }

  const ngrokUrl = await getNgrokUrl();
  const webhookUrl = ngrokUrl + WEBHOOK_ENDPOINT;

  const existingWebhook = await getDevelopmentWebhook();

  if (existingWebhook) {
    // Only update if the URL is different
    if(existingWebhook.attributes.url !== webhookUrl) {
      await updateWebhookUrl(existingWebhook.id, webhookUrl);
    } else {
      console.log('ℹ️ Webhook URL is already up-to-date. No changes needed.');
    }
  } else {
    // If no suitable webhook exists, create one.
    await createWebhook(webhookUrl);
  }
}

main(); 