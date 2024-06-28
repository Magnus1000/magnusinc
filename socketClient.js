// Wait for the Socket.IO library to load
window.addEventListener('load', function() {
    const socket = io('https://magnusinc-magnus1000team.vercel.app', {
        path: '/api/socket'
    });

    socket.on('connect', function() {
        console.log('Connected to server');
    });

    socket.on('newEvent', function(data) {
        console.log('New event:', data);
        // Update your Webflow site with the new data
    });

    socket.on('connect_error', function(error) {
        console.error('Connection error:', error);
    });
});