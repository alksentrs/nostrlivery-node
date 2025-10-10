const WebSocket = require('ws');

console.log('🔍 Testing Driver App Subscription Format');
console.log('==========================================');
console.log('Press Ctrl+C to stop');
console.log('');

const ws = new WebSocket('ws://192.168.1.199:7000');

ws.on('open', () => {
    console.log('✅ Connected to relay successfully!');
    
    // Test the exact subscription format that nostr-tools uses
    const subscription = [
        "REQ",
        "driver-app-test",
        {
            "kinds": [20000],
            "limit": 50
        }
    ];
    
    console.log('📡 Sending subscription (nostr-tools format):');
    console.log(JSON.stringify(subscription, null, 2));
    console.log('');
    
    ws.send(JSON.stringify(subscription));
    console.log('Now send an association request from the company app...');
    console.log('The driver app should receive and display it.');
    console.log('');
});

ws.on('message', (data) => {
    try {
        const message = JSON.parse(data);
        
        if (message[0] === 'EVENT') {
            const event = message[2];
            console.log('📨 Driver app should receive this event:');
            console.log(`   ID: ${event.id}`);
            console.log(`   Kind: ${event.kind}`);
            console.log(`   Pubkey: ${event.pubkey}`);
            console.log(`   Created: ${new Date(event.created_at * 1000).toISOString()}`);
            console.log(`   Content: ${event.content}`);
            console.log('---');
        } else if (message[0] === 'EOSE') {
            console.log('📋 End of stored events - now listening for new events...');
        } else if (message[0] === 'NOTICE') {
            console.log('ℹ️  Notice:', message[1]);
        } else {
            console.log('📨 Received message:', message);
        }
    } catch (error) {
        console.error('Error parsing message:', error);
        console.log('Raw data:', data.toString());
    }
});

ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
});

ws.on('close', () => {
    console.log('🔌 Connection closed');
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n👋 Closing connection...');
    ws.close();
    process.exit(0);
});
