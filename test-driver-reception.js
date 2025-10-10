#!/usr/bin/env node

const WebSocket = require('ws');

const RELAY_URL = 'ws://192.168.1.199:7000';

console.log('🔍 Testing Driver App Event Reception');
console.log('=====================================');
console.log('');

const ws = new WebSocket(RELAY_URL);

ws.on('open', function open() {
    console.log('✅ Connected to relay successfully!');
    console.log('');
    
    // Subscribe to ephemeral events (kind 20000) to see what the driver app should receive
    const subscription = [
        "REQ",
        "driver-test",
        {
            "kinds": [20000],
            "limit": 10
        }
    ];
    
    console.log('📡 Subscribing to ephemeral events (kind 20000)...');
    console.log('Sending subscription:', JSON.stringify(subscription));
    ws.send(JSON.stringify(subscription));
    console.log('');
    console.log('Now send an association request from the company app...');
    console.log('The driver app should receive and display it in the Association Requests section.');
    console.log('');
});

ws.on('message', function message(data) {
    try {
        const parsed = JSON.parse(data);
        
        if (parsed[0] === 'EVENT') {
            const event = parsed[2];
            console.log('📨 Driver app should receive this event:');
            console.log('   ID:', event.id);
            console.log('   Kind:', event.kind);
            console.log('   Pubkey:', event.pubkey);
            console.log('   Created:', new Date(event.created_at * 1000).toISOString());
            console.log('   Content:', event.content);
            console.log('');
            
            // Parse the content to show what the driver app will see
            try {
                const content = JSON.parse(event.content);
                if (content.type === 'DRIVER_ASSOCIATION_REQUEST') {
                    console.log('✅ This is a DRIVER_ASSOCIATION_REQUEST!');
                    console.log('   Company wants to associate with driver:', content.driverNpub);
                    console.log('   The driver app should show this in the Association Requests modal.');
                }
            } catch (e) {
                console.log('   (Content is not JSON)');
            }
            console.log('---');
        } else if (parsed[0] === 'EOSE') {
            console.log('📋 End of stored events - now listening for new events...');
        } else if (parsed[0] === 'NOTICE') {
            console.log('ℹ️  Notice:', parsed[1]);
        } else if (parsed[0] === 'OK') {
            console.log('✅ Event accepted by relay');
        } else if (parsed[0] === 'CLOSED') {
            console.log('❌ Subscription closed:', parsed[2]);
        } else {
            console.log('📨 Unknown message type:', parsed[0]);
        }
    } catch (e) {
        console.log('❌ Error parsing message:', e.message);
        console.log('Raw data:', data.toString());
    }
});

ws.on('error', function error(err) {
    console.log('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
    console.log('🔌 Connection closed');
});

console.log('Press Ctrl+C to stop');

