document.addEventListener('DOMContentLoaded', () => {
    // 1. Check for logged-in user data
    const participantDataStr = localStorage.getItem('participantData');
    
    if (!participantDataStr) {
        // Not logged in, redirect to home page
        window.location.href = 'index.html';
        return;
    }

    const participant = JSON.parse(participantDataStr);

    // 2. Populate DOM elements with participant data
    
    // Header
    const firstName = participant.name ? participant.name.split(' ')[0] : 'Student';
    document.getElementById('headerName').textContent = participant.name || 'Student';
    document.getElementById('topNavName').textContent = participant.name || 'Student';
    document.getElementById('topNavGrade').textContent = participant.classGrade || 'Grade Not Set';
    
    // Stats Row
    document.getElementById('statTopic').textContent = participant.fieldOfInterest || 'Not Selected';

    // Student Info Card
    document.getElementById('infoName').textContent = participant.name || 'N/A';
    document.getElementById('infoGrade').textContent = participant.classGrade || 'N/A';
    document.getElementById('infoSchool').textContent = participant.school || 'N/A';
    document.getElementById('infoLocation').textContent = participant.cityState || 'N/A';
    document.getElementById('infoPhone').textContent = participant.phone || 'N/A';
    document.getElementById('infoEmail').textContent = participant.email || 'N/A';
    document.getElementById('infoUnionId').textContent = participant.unionId || 'N/A';

    // Project Status Tracker
    document.getElementById('cardTopic').textContent = participant.fieldOfInterest || 'Not Selected';

    // 3. Handle Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('participantData');
            window.location.href = 'index.html';
        });
    }
});
