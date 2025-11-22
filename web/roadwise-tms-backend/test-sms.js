const { sendSMS, sendTrafficCommand, sendEmergencyAlert } = require('./config/infobip');

async function testSMSFunctionality() {
    console.log('🧪 Testing SMS Functionality...\n');

    // Test 1: Send basic SMS
    console.log('1. Testing basic SMS...');
    try {
        const result = await sendSMS('256781642869', 'Test SMS from RoadWise TMS');
        console.log('✅ Basic SMS sent:', result);
    } catch (error) {
        console.log('❌ Basic SMS failed:', error.message);
    }

    // Test 2: Send traffic command
    console.log('\n2. Testing traffic command...');
    try {
        const result = await sendTrafficCommand('256781642869', 'N', 'RED');
        console.log('✅ Traffic command sent:', result);
    } catch (error) {
        console.log('❌ Traffic command failed:', error.message);
    }

    // Test 3: Send emergency alert
    console.log('\n3. Testing emergency alert...');
    try {
        const result = await sendEmergencyAlert(['256781642869'], '🚨 Emergency test alert from RoadWise TMS');
        console.log('✅ Emergency alert sent:', result);
    } catch (error) {
        console.log('❌ Emergency alert failed:', error.message);
    }

    console.log('\n📱 SMS Testing Complete!');
}

// Run the test
testSMSFunctionality().catch(console.error); 