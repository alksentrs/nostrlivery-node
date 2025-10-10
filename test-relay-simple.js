#!/usr/bin/env node

const WebSocket = require('ws');

const RELAY_URL = 'ws://192.168.1.199:7000';

console.log('🔍 Simple Relay Test');
console.log('==================');
console.log(`Connecting to relay: ${RELAY_URL}`);
console.log('');

const ws = new WebSocket(RELAY_URL);

ws.on('open', function open() {
    console.log('✅ Connected to relay successfully!');
    console.log('');
    
    // Test with a simple subscription to all events first
    const subscription = [
        "REQ",
        "test-subscription",
        {}
    ];
    
    console.log('📡 Subscribing to all events...');
    console.log('Sending:', JSON.stringify(subscription));
    ws.send(JSON.stringify(subscription));
});

ws.on('message', function message(data) {
    try {
        const message = JSON.parse(data);
        console.log('📨 Received message:', JSON.stringify(message, null, 2));
    } catch (error) {
        console.log('❌ Error parsing message:', error.message);
        console.log('Raw data:', data.toString());
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
