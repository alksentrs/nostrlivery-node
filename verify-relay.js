#!/usr/bin/env node

const WebSocket = require('ws');

const RELAY_URL = 'ws://192.168.1.199:7000';

console.log('🔍 Nostr Relay Event Verifier');
console.log('============================');
console.log(`Connecting to relay: ${RELAY_URL}`);
console.log('');

const ws = new WebSocket(RELAY_URL);

ws.on('open', function open() {
    console.log('✅ Connected to relay successfully!');
    console.log('');
    
    // Subscribe to ephemeral events (kind 20000)
    const subscription = {
        "REQ": "ephemeral-events",
        "kinds": [20000],
        "limit": 10
    };
    
    console.log('📡 Subscribing to ephemeral events (kind 20000)...');
    ws.send(JSON.stringify(subscription));
});

ws.on('message', function message(data) {
    try {
        const message = JSON.parse(data);
        
        if (message[0] === 'EVENT') {
            const event = message[2];
            console.log('📨 Received ephemeral event:');
            console.log(`   ID: ${event.id}`);
            console.log(`   Kind: ${event.kind}`);
            console.log(`   Pubkey: ${event.pubkey}`);
            console.log(`   Created: ${new Date(event.created_at * 1000).toISOString()}`);
            console.log(`   Content: ${event.content}`);
            console.log('');
        } else if (message[0] === 'EOSE') {
            console.log('📋 End of stored events');
            console.log('');
        } else if (message[0] === 'NOTICE') {
            console.log(`ℹ️  Notice: ${message[1]}`);
        } else if (message[0] === 'OK') {
            console.log(`✅ Event accepted: ${message[1]}`);
        } else if (message[0] === 'CLOSED') {
            console.log(`❌ Subscription closed: ${message[1]}`);
        }
    } catch (error) {
        console.log('❌ Error parsing message:', error.message);
    }
});

ws.on('error', function error(err) {
    console.log('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
    console.log('🔌 Connection closed');
});

// Keep the script running
process.on('SIGINT', () => {
    console.log('\n👋 Disconnecting...');
    ws.close();
    process.exit(0);
});

console.log('Press Ctrl+C to stop');
