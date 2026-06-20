const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

let client = null;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

exports.triggerWhatsAppDuesAlert = async (memberNumber, memberName, invoiceNo, pendingDues, deadline) => {
    if (!client) {
        console.log("Twilio not configured. Skipping WhatsApp alert.");
        return null;
    }
    try {
        const response = await client.messages.create({
            body: `Assalam-o-Alaikum ${memberName},\n\nBicepsApp (Wreck & Build Gym) reminder: Invoice S.No: ${invoiceNo} pending. Outstanding dues: Rs. ${pendingDues}. Renewal date: ${deadline}. Please visit the gym counter. Shukriya!`,
            from: "whatsapp:+14155238886",
            to: `whatsapp:${memberNumber}`
        });
        console.log(`WhatsApp Alert sent. SID: ${response.sid}`);
        return response;
    } catch (error) {
        console.error(`WhatsApp failed: ${error.message}`);
        return null;
    }
};

exports.triggerExpiryReminder = async (memberNumber, memberName, renewalDate) => {
    if (!client) {
        console.log("Twilio not configured. Skipping expiry reminder.");
        return null;
    }
    try {
        const response = await client.messages.create({
            body: `Assalam-o-Alaikum ${memberName},\n\nBicepsApp (Wreck & Build Gym): Your membership expires on ${renewalDate}. Kindly renew at the gym counter to avoid interruption. Shukriya!`,
            from: "whatsapp:+14155238886",
            to: `whatsapp:${memberNumber}`
        });
        console.log(`Expiry Reminder sent. SID: ${response.sid}`);
        return response;
    } catch (error) {
        console.error(`WhatsApp failed: ${error.message}`);
        return null;
    }
};
