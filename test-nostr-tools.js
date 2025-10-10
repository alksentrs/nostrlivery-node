const { Relay } = require('nostr-tools');

console.log('🔍 Testing nostr-tools library directly');
console.log('=====================================');
console.log('Press Ctrl+C to stop');
console.log('');

async function testNostrTools() {
    try {
        console.log('Connecting to relay...');
        const relay = new Relay('ws://192.168.1.199:7000');
        await relay.connect();
        console.log('✅ Connected to relay successfully!');
        
        console.log('Creating subscription...');
        const subscription = relay.subscribe([
            {
                kinds: [20000],
                limit: 50
            }
        ], {
            onevent: (event) => {
                console.log('📨 Received event:', {
                    id: event.id,
                    kind: event.kind,
                    pubkey: event.pubkey,
                    content: event.content
                });
            },
            oneose: () => {
                console.log('📋 End of stored events - now listening for new events...');
            }
        });
        
        console.log('✅ Subscription created successfully!');
        console.log('Now send an association request from the company app...');
        console.log('');
        
        // Keep the connection alive
        process.on('SIGINT', () => {
            console.log('\n👋 Closing connection...');
            subscription.close();
            relay.close();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testNostrTools();
