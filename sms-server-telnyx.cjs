require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const telnyx = require('telnyx');
const telnyxClient = telnyx.Telnyx(process.env.TELNYX_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (for admin dashboard)
app.use(express.static('.'));

// Telnyx configuration
const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const TELNYX_PHONE_NUMBER = process.env.TELNYX_PHONE_NUMBER;

// Demo mode configuration
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !TELNYX_API_KEY;
const DEMO_FROM_NUMBER = '+15037645097'; // Your personal number

let telnyxConfigured = false;

// Initialize Telnyx client
try {
    if (TELNYX_API_KEY && TELNYX_API_KEY.startsWith('KEY')) {
        telnyxConfigured = true;
        console.log('✅ Telnyx client initialized successfully');
    } else {
        console.log('⚠️ Telnyx API key not properly configured');
    }
} catch (error) {
    console.log('❌ Error initializing Telnyx client:', error.message);
}

// Initialize SQLite database
const db = new sqlite3.Database('./leads.db');

// Create leads table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE,
        state TEXT,
        preference TEXT,
        tobacco TEXT,
        oxygen TEXT,
        hospitalized TEXT,
        controlled_conditions TEXT,
        serious_conditions TEXT,
        step INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active',
        agent_takeover BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Helper function to send SMS via Telnyx or Demo mode
async function sendSMS(to, message) {
    if (DEMO_MODE) {
        // For your phone number, send actual iMessage
        if (to === '+15037645097' || to === '15037645097' || to === ' 15037645097') {
            console.log(`📱 [DEMO MODE] Sending iMessage to your phone: ${to}`);
            try {
                return await sendIMessage(to, message);
            } catch (error) {
                console.log(`❌ iMessage failed, falling back to demo logging`);
                return await sendDemoSMS(to, message);
            }
        } else {
            // For other numbers, just log
            console.log(`📱 [DEMO MODE] Would send real SMS to ${to}:`);
            console.log(`   From: +15037645097 (Your personal number)`);
            console.log(`   To: ${to}`);
            console.log(`   Message: ${message}`);
            console.log(`   ⚠️ NOTE: Client replies won't trigger webhooks in demo mode`);
            console.log(`   ---`);
            
            return { id: 'demo_' + Date.now(), status: 'demo_logged' };
        }
    }

    if (!telnyxConfigured) {
        console.log(`📱 [DEMO] SMS to ${to}: ${message}`);
        return { id: 'demo_message_id', status: 'demo' };
    }

    try {
        const response = await telnyxClient.messages.create({
            'from': TELNYX_PHONE_NUMBER,
            'to': to,
            'text': message
        });
        console.log(`✅ SMS sent to ${to}: ${response.id}`);
        return response;
    } catch (error) {
        console.error(`❌ Failed to send SMS to ${to}:`, error);
        throw error;
    }
}

// Demo mode SMS sending (using your personal phone)
async function sendDemoSMS(to, message) {
    console.log(`📱 [DEMO MODE] Would send to ${to}:`);
    console.log(`   From: +15037645097 (Your personal number)`);
    console.log(`   To: ${to}`);
    console.log(`   Message: ${message}`);
    console.log(`   ---`);
    
    return { id: 'demo_' + Date.now(), status: 'demo_logged' };
}

// iMessage integration for demo mode (macOS only)
async function sendIMessage(to, message) {
    const { exec } = require('child_process');
    
    // Convert phone number to iCloud email if it's your number
    let recipient = to;
    if (to === '+15037645097') {
        recipient = 'malfieri05@icloud.com';
    }
    
    console.log(`📱 [iMESSAGE] Sending to ${recipient}:`);
    console.log(`   Message: ${message}`);
    
    // Use AppleScript to send iMessage
    const appleScript = `
        tell application "Messages"
            send "${message.replace(/"/g, '\\"')}" to buddy "${recipient}" of (service 1 whose service type is iMessage)
        end tell
    `;
    
    return new Promise((resolve, reject) => {
        exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ iMessage failed: ${error.message}`);
                console.log(`   Falling back to manual sending...`);
                resolve({ id: 'imessage_failed', status: 'manual_required' });
            } else {
                console.log(`✅ iMessage sent successfully!`);
                resolve({ id: 'imessage_' + Date.now(), status: 'sent' });
            }
        });
    });
}

// Helper function to normalize phone number
function normalizePhoneNumber(phoneNumber) {
    let normalized = phoneNumber.trim();
    
    // Remove any spaces
    normalized = normalized.replace(/\s/g, '');
    
    // Add +1 if it's a 10-digit number
    if (normalized.length === 10) {
        normalized = '+1' + normalized;
    }
    // Add + if it's an 11-digit number starting with 1
    else if (normalized.length === 11 && normalized.startsWith('1')) {
        normalized = '+' + normalized;
    }
    // Add + if it doesn't have one
    else if (!normalized.startsWith('+')) {
        normalized = '+' + normalized;
    }
    
    return normalized;
}

// Helper function to get or create lead
function getOrCreateLead(phoneNumber) {
    return new Promise((resolve, reject) => {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        console.log(`🔍 Looking up lead for phone: "${phoneNumber}" (normalized: "${normalizedPhone}")`);
        
        // First, let's see ALL leads for this phone number in different formats
        const possibleFormats = [
            phoneNumber,                    // Original format
            normalizedPhone,                // Normalized format
            phoneNumber.replace(/\s/g, ''), // Without spaces
            phoneNumber.replace('+', ''),   // Without +
            ' ' + phoneNumber.replace(/\s/g, ''), // With space prefix
            '+' + phoneNumber.replace(/\s/g, '').replace('+', '') // With + prefix
        ];
        
        console.log(`🔍 Checking all possible formats:`, possibleFormats);
        
        // Try to find existing lead with any of the possible formats
        const placeholders = possibleFormats.map(() => '?').join(',');
        const query = `SELECT * FROM leads WHERE phone_number IN (${placeholders}) ORDER BY created_at DESC LIMIT 1`;
        
        db.get(query, possibleFormats, (err, row) => {
            if (err) {
                console.error(`❌ Database error looking up lead:`, err);
                reject(err);
                return;
            }
            
            if (row) {
                console.log(`✅ Found existing lead: ID ${row.id}, Step ${row.step}, Phone: "${row.phone_number}"`);
                console.log(`   📊 Lead details: State="${row.state}", Preference="${row.preference}", Status="${row.status}"`);
                resolve(row);
            } else {
                console.log(`🆕 No existing lead found, creating new lead for phone: "${normalizedPhone}"`);
                // Create new lead with normalized phone number
                db.run('INSERT INTO leads (phone_number) VALUES (?)', [normalizedPhone], function(err) {
                    if (err) {
                        console.error(`❌ Database error creating lead:`, err);
                        reject(err);
                        return;
                    }
                    
                    console.log(`✅ Created new lead with ID: ${this.lastID}`);
                    db.get('SELECT * FROM leads WHERE id = ?', [this.lastID], (err, newRow) => {
                        if (err) {
                            console.error(`❌ Database error fetching new lead:`, err);
                            reject(err);
                            return;
                        }
                        console.log(`✅ New lead data:`, newRow);
                        resolve(newRow);
                    });
                });
            }
        });
    });
}

// Helper function to update lead
function updateLead(phoneNumber, updates) {
    return new Promise((resolve, reject) => {
        const normalizedPhone = normalizePhoneNumber(phoneNumber);
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(normalizedPhone);
        
        const query = `UPDATE leads SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE phone_number = ?`;
        
        console.log(`📝 Updating lead for "${normalizedPhone}":`, updates);
        
        db.run(query, values, function(err) {
            if (err) {
                console.error(`❌ Database error updating lead:`, err);
                reject(err);
                return;
            }
            console.log(`✅ Lead updated successfully. Changes: ${this.changes}`);
            resolve(this.changes);
        });
    });
}

// Main SMS webhook endpoint
app.post('/sms', async (req, res) => {
    try {
        const { From, Body } = req.body;
        const phoneNumber = From.trim();
        const messageBody = Body.trim().toLowerCase();
        
        console.log(`\n📱 SMS RECEIVED:`);
        console.log(`   From: ${phoneNumber}`);
        console.log(`   Message: "${messageBody}"`);
        console.log(`   Raw body:`, req.body);
        
        // Get or create lead
        const lead = await getOrCreateLead(phoneNumber);
        console.log(`📊 LEAD DATA:`);
        console.log(`   ID: ${lead.id}`);
        console.log(`   Current Step: ${lead.step}`);
        console.log(`   Status: ${lead.status}`);
        console.log(`   State: ${lead.state || 'not set'}`);
        console.log(`   Preference: ${lead.preference || 'not set'}`);
        
        // Check if agent has taken over
        if (lead.agent_takeover) {
            console.log(`🤖 AGENT TAKEOVER: Lead ${lead.id} has agent takeover active`);
            await sendSMS(phoneNumber, "An agent will contact you shortly. Thank you for your patience.");
            res.status(200).send('OK');
            return;
        }
        
        let responseMessage = '';
        let nextStep = lead.step;
        
        console.log(`🔄 PROCESSING STEP ${lead.step}:`);
        console.log(`   📝 Current lead state: State="${lead.state}", Burial_Cremation="${lead.burial_cremation}", Q1="${lead.q1}", Q2="${lead.q2}", Q3="${lead.q3}", Q4="${lead.q4}", Q5="${lead.q5}"`);
        
        // Conversation flow
        switch (lead.step) {
            case 1:
                console.log(`   📍 STEP 1: State validation`);
                console.log(`   📨 Received message: "${messageBody}"`);
                
                if (messageBody === '[admin_started]') {
                    console.log(`   ✅ Admin started conversation`);
                    responseMessage = "Welcome to Final Expense Insurance! First, what state are you located in? Please reply with your state name (e.g., 'California', 'Texas', etc.)";
                } else {
                    const states = ['alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming'];
                    
                    console.log(`   🔍 Checking if "${messageBody}" is in valid states list`);
                    console.log(`   📋 Valid states: ${states.join(', ')}`);
                    
                    if (states.includes(messageBody)) {
                        console.log(`   ✅ Valid state "${messageBody}" - updating lead and moving to step 2`);
                        console.log(`   📝 Updating: state="${messageBody}", step=2`);
                        await updateLead(phoneNumber, { state: messageBody, step: 2 });
                        responseMessage = "Thanks! Do you prefer burial or cremation?\nReply:\n1 for Burial\n2 for Cremation";
                        nextStep = 2;
                        console.log(`   ➡️ Moving to step 2 with message: "${responseMessage}"`);
                    } else {
                        console.log(`   ❌ Invalid state "${messageBody}" - asking for valid state`);
                        responseMessage = "Please reply with a valid US state name (e.g., 'California', 'Texas', etc.)";
                        console.log(`   ⚠️ Staying at step 1 with message: "${responseMessage}"`);
                    }
                }
                break;
                
            case 2:
                console.log(`   📍 STEP 2: Burial/Cremation preference`);
                console.log(`   📨 Received message: "${messageBody}"`);
                console.log(`   🔍 Expected: "1" for Burial or "2" for Cremation`);
                
                if (messageBody === '1') {
                    console.log(`   ✅ Burial selected - moving to step 3`);
                    console.log(`   📝 Updating: burial_cremation="burial", step=3`);
                    await updateLead(phoneNumber, { burial_cremation: 'burial', step: 3 });
                    responseMessage = "Health Question 1 of 5:\nHave you used tobacco in the past 12 months?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 3;
                    console.log(`   ➡️ Moving to step 3 with message: "${responseMessage}"`);
                } else if (messageBody === '2') {
                    console.log(`   ✅ Cremation selected - moving to step 3`);
                    console.log(`   📝 Updating: burial_cremation="cremation", step=3`);
                    await updateLead(phoneNumber, { burial_cremation: 'cremation', step: 3 });
                    responseMessage = "Health Question 1 of 5:\nHave you used tobacco in the past 12 months?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 3;
                    console.log(`   ➡️ Moving to step 3 with message: "${responseMessage}"`);
                } else {
                    console.log(`   ❌ Invalid option "${messageBody}" - asking for valid option`);
                    responseMessage = "Please reply with a valid option:\n1 for Burial\n2 for Cremation";
                    console.log(`   ⚠️ Staying at step 2 with message: "${responseMessage}"`);
                }
                break;
                
            case 3:
                console.log(`   📍 STEP 3: Tobacco use`);
                console.log(`   📨 Received message: "${messageBody}"`);
                console.log(`   🔍 Expected: "1" for Yes or "2" for No`);
                
                if (messageBody === '1') {
                    console.log(`   ✅ Tobacco use: Yes - moving to step 4`);
                    console.log(`   📝 Updating: q1="yes", step=4`);
                    await updateLead(phoneNumber, { q1: 'yes', step: 4 });
                    responseMessage = "Health Question 2 of 5:\nDo you currently use oxygen, a wheelchair, or reside in a nursing home?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 4;
                    console.log(`   ➡️ Moving to step 4 with message: "${responseMessage}"`);
                } else if (messageBody === '2') {
                    console.log(`   ✅ Tobacco use: No - moving to step 4`);
                    console.log(`   📝 Updating: q1="no", step=4`);
                    await updateLead(phoneNumber, { q1: 'no', step: 4 });
                    responseMessage = "Health Question 2 of 5:\nDo you currently use oxygen, a wheelchair, or reside in a nursing home?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 4;
                    console.log(`   ➡️ Moving to step 4 with message: "${responseMessage}"`);
                } else {
                    console.log(`   ❌ Invalid option "${messageBody}" - asking for valid option`);
                    responseMessage = "Please reply with a valid option:\nHealth Question 1 of 5:\nHave you used tobacco in the past 12 months?\nReply:\n1 for Yes\n2 for No";
                    console.log(`   ⚠️ Staying at step 3 with message: "${responseMessage}"`);
                }
                break;
                
            case 4:
                console.log(`   📍 STEP 4: Oxygen/wheelchair`);
                console.log(`   📨 Received message: "${messageBody}"`);
                console.log(`   🔍 Expected: "1" for Yes or "2" for No`);
                
                if (messageBody === '1') {
                    console.log(`   ✅ Oxygen/wheelchair: Yes - moving to step 5`);
                    console.log(`   📝 Updating: q2="yes", step=5`);
                    await updateLead(phoneNumber, { q2: 'yes', step: 5 });
                    responseMessage = "Health Question 3 of 5:\nIn the past 2 years, have you been hospitalized overnight for any reason?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 5;
                    console.log(`   ➡️ Moving to step 5 with message: "${responseMessage}"`);
                } else if (messageBody === '2') {
                    console.log(`   ✅ Oxygen/wheelchair: No - moving to step 5`);
                    console.log(`   📝 Updating: q2="no", step=5`);
                    await updateLead(phoneNumber, { q2: 'no', step: 5 });
                    responseMessage = "Health Question 3 of 5:\nIn the past 2 years, have you been hospitalized overnight for any reason?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 5;
                    console.log(`   ➡️ Moving to step 5 with message: "${responseMessage}"`);
                } else {
                    console.log(`   ❌ Invalid option "${messageBody}" - asking for valid option`);
                    responseMessage = "Please reply with a valid option:\nHealth Question 2 of 5:\nDo you currently use oxygen, a wheelchair, or reside in a nursing home?\nReply:\n1 for Yes\n2 for No";
                    console.log(`   ⚠️ Staying at step 4 with message: "${responseMessage}"`);
                }
                break;
                
            case 5:
                console.log(`   📍 STEP 5: Hospitalization`);
                console.log(`   📨 Received message: "${messageBody}"`);
                console.log(`   🔍 Expected: "1" for Yes or "2" for No`);
                
                if (messageBody === '1') {
                    console.log(`   ✅ Hospitalization: Yes - moving to step 6`);
                    console.log(`   📝 Updating: q3="yes", step=6`);
                    await updateLead(phoneNumber, { q3: 'yes', step: 6 });
                    responseMessage = "Health Question 4 of 5:\nDo you have any well-controlled conditions (high blood pressure, high cholesterol, type 2 diabetes with medication)?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 6;
                    console.log(`   ➡️ Moving to step 6 with message: "${responseMessage}"`);
                } else if (messageBody === '2') {
                    console.log(`   ✅ Hospitalization: No - moving to step 6`);
                    console.log(`   📝 Updating: q3="no", step=6`);
                    await updateLead(phoneNumber, { q3: 'no', step: 6 });
                    responseMessage = "Health Question 4 of 5:\nDo you have any well-controlled conditions (high blood pressure, high cholesterol, type 2 diabetes with medication)?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 6;
                    console.log(`   ➡️ Moving to step 6 with message: "${responseMessage}"`);
                } else {
                    console.log(`   ❌ Invalid option "${messageBody}" - asking for valid option`);
                    responseMessage = "Please reply with a valid option:\nHealth Question 3 of 5:\nIn the past 2 years, have you been hospitalized overnight for any reason?\nReply:\n1 for Yes\n2 for No";
                    console.log(`   ⚠️ Staying at step 5 with message: "${responseMessage}"`);
                }
                break;
                
            case 6:
                console.log(`   📍 STEP 6: Controlled conditions`);
                console.log(`   📨 Received message: "${messageBody}"`);
                console.log(`   🔍 Expected: "1" for Yes or "2" for No`);
                
                if (messageBody === '1') {
                    console.log(`   ✅ Controlled conditions: Yes - moving to step 7`);
                    console.log(`   📝 Updating: q4="yes", step=7`);
                    await updateLead(phoneNumber, { q4: 'yes', step: 7 });
                    responseMessage = "Health Question 5 of 5:\nIn the past 2 years, have you been diagnosed with cancer, heart attack, stroke, COPD, kidney failure, or HIV/AIDS?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 7;
                    console.log(`   ➡️ Moving to step 7 with message: "${responseMessage}"`);
                } else if (messageBody === '2') {
                    console.log(`   ✅ Controlled conditions: No - moving to step 7`);
                    console.log(`   📝 Updating: q4="no", step=7`);
                    await updateLead(phoneNumber, { q4: 'no', step: 7 });
                    responseMessage = "Health Question 5 of 5:\nIn the past 2 years, have you been diagnosed with cancer, heart attack, stroke, COPD, kidney failure, or HIV/AIDS?\nReply:\n1 for Yes\n2 for No";
                    nextStep = 7;
                    console.log(`   ➡️ Moving to step 7 with message: "${responseMessage}"`);
                } else {
                    console.log(`   ❌ Invalid option "${messageBody}" - asking for valid option`);
                    responseMessage = "Please reply with a valid option:\nHealth Question 4 of 5:\nDo you have any well-controlled conditions (high blood pressure, high cholesterol, type 2 diabetes with medication)?\nReply:\n1 for Yes\n2 for No";
                    console.log(`   ⚠️ Staying at step 6 with message: "${responseMessage}"`);
                }
                break;
                
            case 7:
                console.log(`   📍 STEP 7: Serious conditions`);
                console.log(`   📨 Received message: "${messageBody}"`);
                console.log(`   🔍 Expected: "1" for Yes or "2" for No`);
                
                if (messageBody === '1') {
                    console.log(`   ✅ Serious conditions: Yes - moving to step 8`);
                    console.log(`   📝 Updating: q5="yes", step=8`);
                    await updateLead(phoneNumber, { q5: 'yes', step: 8 });
                    responseMessage = "Based on your health profile, you may qualify for our Guaranteed Issue plan. Here are your coverage options:\n$10,000 coverage: ~$68/month\n$15,000 coverage: ~$102/month\n$25,000 coverage: ~$170/month\n\nReady to secure your rate?\n1 - Call me now: (503) 764-5097\n2 - Schedule consultation\n3 - Text me more questions";
                    nextStep = 8;
                    console.log(`   ➡️ Moving to step 8 with message: "${responseMessage}"`);
                } else if (messageBody === '2') {
                    console.log(`   ✅ Serious conditions: No - moving to step 8`);
                    console.log(`   📝 Updating: q5="no", step=8`);
                    await updateLead(phoneNumber, { q5: 'no', step: 8 });
                    responseMessage = "Great! Based on your health profile, you may qualify for our Preferred tier coverage with excellent rates. Here are your coverage options:\n$10,000 coverage: ~$45/month\n$15,000 coverage: ~$68/month\n$25,000 coverage: ~$113/month\n\nReady to secure your rate?\n1 - Call me now: (503) 764-5097\n2 - Schedule consultation\n3 - Text me more questions";
                    nextStep = 8;
                    console.log(`   ➡️ Moving to step 8 with message: "${responseMessage}"`);
                } else {
                    console.log(`   ❌ Invalid option "${messageBody}" - asking for valid option`);
                    responseMessage = "Please reply with a valid option:\nHealth Question 5 of 5:\nIn the past 2 years, have you been diagnosed with cancer, heart attack, stroke, COPD, kidney failure, or HIV/AIDS?\nReply:\n1 for Yes\n2 for No";
                    console.log(`   ⚠️ Staying at step 7 with message: "${responseMessage}"`);
                }
                break;
                
            case 8:
                console.log(`   📍 STEP 8: Final CTA`);
                if (messageBody === '1') {
                    console.log(`   ✅ Call requested - updating status`);
                    await updateLead(phoneNumber, { step: 9, status: 'calling_now' });
                    responseMessage = "Perfect! I'll have an agent call you right away at " + phoneNumber + ". Please answer any calls from (503) 764-5097.";
                    nextStep = 9;
                } else if (messageBody === '2') {
                    console.log(`   ✅ Consultation scheduled - updating status`);
                    await updateLead(phoneNumber, { step: 9, status: 'consultation_scheduled' });
                    responseMessage = "Great! I'll schedule a consultation for you. An agent will contact you within 2 hours to set up a convenient time.";
                    nextStep = 9;
                } else if (messageBody === '3') {
                    console.log(`   ✅ Questions requested - updating status`);
                    await updateLead(phoneNumber, { step: 9, status: 'questions' });
                    responseMessage = "Of course! What questions do you have about Final Expense Insurance? I'm here to help.";
                    nextStep = 9;
                } else {
                    console.log(`   ❌ Invalid option "${messageBody}" - asking for valid option`);
                    responseMessage = "Please choose an option:\n1 - Call me now: (503) 764-5097\n2 - Schedule consultation\n3 - Text me more questions";
                }
                break;
                
            default:
                console.log(`   📍 DEFAULT: Thank you message`);
                responseMessage = "Thank you for your interest! An agent will contact you shortly.";
                break;
        }
        
        // Send response
        console.log(`📤 RESPONSE:`);
        console.log(`   Next Step: ${nextStep}`);
        console.log(`   Response Message: "${responseMessage}"`);
        
        if (responseMessage) {
            console.log(`   📱 Sending SMS response...`);
            try {
                const smsResult = await sendSMS(phoneNumber, responseMessage);
                console.log(`   ✅ SMS sent successfully:`, smsResult);
            } catch (smsError) {
                console.error(`   ❌ Failed to send SMS:`, smsError);
            }
        } else {
            console.log(`   ⚠️ No response message to send`);
        }
        
        console.log(`✅ SMS processing completed for ${phoneNumber}\n`);
        res.status(200).send('OK');
        
    } catch (error) {
        console.error(`\n❌ ERROR PROCESSING SMS:`);
        console.error(`   Phone: ${req.body.From}`);
        console.error(`   Message: ${req.body.Body}`);
        console.error(`   Error:`, error);
        console.error(`   Stack:`, error.stack);
        
        // Try to send error message
        try {
            console.log(`   📱 Sending error message to user...`);
            await sendSMS(req.body.From, "Sorry, there was an error processing your message. Please try again or call (503) 764-5097 for assistance.");
            console.log(`   ✅ Error message sent successfully`);
        } catch (smsError) {
            console.error(`   ❌ Failed to send error SMS:`, smsError);
        }
        
        res.status(500).send('Error');
    }
});

// Landing page opt-in endpoint
app.post('/start-conversation', async (req, res) => {
    try {
        const { phone_number, source } = req.body;
        
        if (!phone_number) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        console.log(`📱 Landing page opt-in from ${phone_number} (source: ${source})`);

        // Get or create lead
        const lead = await getOrCreateLead(phone_number);
        
        // Send welcome message to start the conversation
        const welcomeMessage = "Welcome to Final Expense Insurance! First, what state are you located in? Please reply with your state name (e.g., 'California', 'Texas', etc.)";
        
        await sendSMS(phone_number, welcomeMessage);
        
        res.json({ 
            success: true, 
            message: 'Conversation started successfully',
            lead_id: lead.id 
        });
        
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
});

// Admin endpoints
app.get('/admin/leads', (req, res) => {
    res.sendFile(__dirname + '/admin-dashboard.html');
});

// API endpoint to get leads data for the dashboard
app.get('/api/leads', (req, res) => {
    db.all("SELECT * FROM leads ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/admin/send-sms', async (req, res) => {
    try {
        const { to, message } = req.body;
        const result = await sendSMS(to, message);
        res.json({ success: true, messageId: result.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/admin/takeover', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        await updateLead(phoneNumber, { agent_takeover: 1 });
        await sendSMS(phoneNumber, "An agent has taken over this conversation. They will contact you shortly.");
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        telnyx_configured: telnyxConfigured,
        mode: telnyxConfigured ? 'production' : 'demo'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ SMS server running on port ${PORT}`);
    console.log(`Mode: ${DEMO_MODE ? 'DEMO' : 'TELNYX'}`);
    if (DEMO_MODE) {
        console.log(`📱 Demo mode: Messages will be logged for manual sending`);
        console.log(`📱 From number: ${DEMO_FROM_NUMBER}`);
    } else {
        console.log(`📱 Telnyx mode: Messages will be sent via Telnyx`);
    }
    console.log(`Webhook URL: http://localhost:${PORT}/sms`);
    console.log(`Admin panel: http://localhost:${PORT}/admin/leads`);
});
