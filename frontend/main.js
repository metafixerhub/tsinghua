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

    const menuToggle = document.querySelector('.menu-toggle');
    const navSection = document.querySelector('.nav-section');

    // --- Mobile Menu Logic ---
    if (menuToggle && navSection) {
        menuToggle.addEventListener('click', () => {
            navSection.classList.toggle('active');
        });
    }

    // --- Navigation Logic ---
    openRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerSection').scrollIntoView({ behavior: 'smooth' });
        // Close mobile nav if open
        if (navSection.classList.contains('active')) {
            navSection.classList.remove('active');
        }
    });

    // --- Admin Modal Logic ---
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
            // Send data to the new live Render backend URL
            const response = await fetch('https://tsinghua-1.onrender.com/api/register', {
                method: 'POST',
                body: formData 
            });

            if (response.ok) {
                const data = await response.json();
                const unionId = data.participant.unionId;
                
                registrationForm.reset();
                
                // Show Success Popup
                document.getElementById('displayUnionId').textContent = unionId;
                document.getElementById('displayPassword').textContent = unionId;
                document.getElementById('successModal').style.display = 'flex';
                
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
            const response = await fetch('https://tsinghua-1.onrender.com/api/participants');
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

            // Create Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteParticipant(p._id || p.id);

            tr.innerHTML = `
                <td>${logoHtml}</td>
                <td style="font-weight:bold; color:#f28500;">${p.unionId || 'N/A'}</td>
                <td>${p.name || ''}</td>
                <td>${p.age || ''}</td>
                <td>${p.classGrade || ''}</td>
                <td>${p.school || ''}</td>
                <td>${p.address || ''}</td>
                <td>${p.cityState || ''}</td>
                <td>${p.phone || ''}</td>
                <td>${p.email || ''}</td>
                <td>${p.country || ''}</td>
                <td>${p.fieldOfInterest || ''}</td>
                <td class="action-cell"></td>
            `;
            // Append the button properly to avoid innerHTML breaking listeners
            tr.querySelector('.action-cell').appendChild(deleteBtn);
            
            participantsTableBody.appendChild(tr);
        });
    };

    const deleteParticipant = async (id) => {
        if (!confirm('Are you sure you want to delete this participant?')) return;
        
        try {
            const response = await fetch('https://tsinghua-1.onrender.com/api/participants/' + id, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Participant deleted!');
                fetchParticipants(); // Reload table
            } else {
                alert('Failed to delete participant.');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            alert('An error occurred while deleting.');
        }
    };

    refreshAdminBtn.addEventListener('click', fetchParticipants);
    
    // --- Success Modal Close Logic ---
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const goToDashboardBtn = document.getElementById('goToDashboardBtn');
    
    closeSuccessBtn.addEventListener('click', () => {
        document.getElementById('successModal').style.display = 'none';
    });
    
    goToDashboardBtn.addEventListener('click', () => {
        alert("The Student Dashboard is coming soon!");
        document.getElementById('successModal').style.display = 'none';
    });
});
