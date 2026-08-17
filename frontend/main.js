document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const registerModal = document.getElementById('registerModal');
    const adminModal = document.getElementById('adminModal');
    
    const openRegisterBtn = document.getElementById('openRegisterBtn');
    const openAdminBtn = document.getElementById('openAdminBtn');
    
    const closeRegisterBtn = document.getElementById('closeRegisterBtn');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    
    const registrationForm = document.getElementById('registrationForm');
    const registerSuccessMsg = document.getElementById('registerSuccessMsg');
    
    const participantsTableBody = document.querySelector('#participantsTable tbody');
    const refreshAdminBtn = document.getElementById('refreshAdminBtn');

    // --- Modal Logic ---
    openRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'flex';
    });

    openAdminBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const password = prompt('Please enter the Admin Password:');
        if (password === 'nur138nur') {
            adminModal.style.display = 'flex';
            fetchParticipants(); // Load data when opening
        } else if (password !== null) {
            alert('Incorrect password! Access denied.');
        }
    });

    closeRegisterBtn.addEventListener('click', () => {
        registerModal.style.display = 'none';
        registerSuccessMsg.style.display = 'none'; // reset
    });

    closeAdminBtn.addEventListener('click', () => {
        adminModal.style.display = 'none';
    });

    // Close on clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
            registerSuccessMsg.style.display = 'none';
        }
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    // --- Form Submission Logic ---
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // We use FormData to handle the file upload
        const formData = new FormData(registrationForm);
        
        try {
            // The backend is running on the same domain or localhost:3000
            // Since the backend serves the frontend, we can just use /api/register
            const response = await fetch('/api/register', {
                method: 'POST',
                body: formData // Note: fetch automatically sets the correct Content-Type for FormData
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Success:', data);
                registrationForm.reset();
                registerSuccessMsg.style.display = 'block';
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    registerSuccessMsg.style.display = 'none';
                    registerModal.style.display = 'none';
                }, 3000);
            } else {
                alert('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            alert('An error occurred. Make sure the backend server is running.');
        }
    });

    // --- Admin Fetch Logic ---
    const fetchParticipants = async () => {
        try {
            const response = await fetch('/api/participants');
            if (response.ok) {
                const participants = await response.json();
                renderParticipants(participants);
            } else {
                console.error('Failed to fetch participants');
            }
        } catch (error) {
            console.error('Error fetching participants:', error);
            participantsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Could not load data. Ensure backend is running.</td></tr>';
        }
    };

    const renderParticipants = (participants) => {
        participantsTableBody.innerHTML = ''; // Clear table
        
        if (participants.length === 0) {
            participantsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No participants registered yet.</td></tr>';
            return;
        }

        participants.forEach(p => {
            const tr = document.createElement('tr');
            
            // Handle logo image
            const logoHtml = p.logoUrl 
                ? `<img src="${p.logoUrl}" alt="Logo">` 
                : '<span style="color:rgba(255,255,255,0.5)">No Logo</span>';

            tr.innerHTML = `
                <td>${p.name}</td>
                <td>${p.phone}</td>
                <td>${p.university}</td>
                <td>${p.location}</td>
                <td>${p.percentage}%</td>
                <td>${logoHtml}</td>
            `;
            participantsTableBody.appendChild(tr);
        });
    };

    refreshAdminBtn.addEventListener('click', fetchParticipants);
});
