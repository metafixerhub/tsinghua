
// --- Direct Login Link Interception ---
const urlPath = window.location.pathname;
const urlSearch = window.location.search;
let directLoginId = null;

if (urlPath.includes('/my-id/login/')) {
    const match = urlSearch.match(/\?admin-(\d+)/);
    if (match) directLoginId = match[1];
}

const loginMatch = urlPath.match(/\/login\/(\d+)/);
if (loginMatch) {
    directLoginId = loginMatch[1];
}

if (directLoginId) {
    localStorage.removeItem('participantData'); // Clear session to allow new login
}
\ndocument.addEventListener('DOMContentLoaded', () => {
    // --- Auto Redirect if already logged in ---
    if (localStorage.getItem('participantData') && !directLoginId) {
        window.location.href = '/dashboard';
        return; // Stop execution
    }
    // --- Elements ---

    const globalLoader = document.getElementById('global-loader');
    const showLoader = () => { if(globalLoader) globalLoader.classList.add('active'); };
    const hideLoader = () => { if(globalLoader) globalLoader.classList.remove('active'); };

    const adminModal = document.getElementById('adminModal');
    const loginModal = document.getElementById('loginModal');
    
    const openRegisterBtn = document.getElementById('openRegisterBtn');
    const openAdminBtn = document.getElementById('openAdminBtn');
    const openLoginBtn = document.getElementById('openLoginBtn');
    
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    
    const registrationForm = document.getElementById('registrationForm');
    const loginForm = document.getElementById('loginForm');
    
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
    

    // --- Login Modal Logic ---
    

    

    

    // Close on clicking outside
    

    // --- Login Form Submission Logic ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const unionId = document.getElementById('loginUnionId').value;
        showLoader();
        
        try {
            const response = await fetch('https://tsinghua-1.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unionId })
            });

            if (response.ok) {
                const data = await response.json();
                // Save participant data in localStorage so the dashboard can read it
                localStorage.setItem('participantData', JSON.stringify(data.participant));
                // Redirect to dashboard page
                window.location.href = '/dashboard';
            } else {
                alert('Invalid Union ID. Please check and try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred. Make sure the server is running.');
        } finally {
            hideLoader();
        }
    });

    // --- Form Submission Logic ---
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();
        const submitBtn = registrationForm.querySelector('button[type="submit"]');
        if(submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Registering...'; }
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
                // Auto save to local storage
                localStorage.setItem('participantData', JSON.stringify(data.participant));
                
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
        } finally {
            hideLoader();
            const submitBtn = registrationForm.querySelector('button[type="submit"]');
            if(submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Application'; }
        }
    });

    // --- Admin Fetch Logic ---
    
    if (window.location.pathname.includes('/admin')) {
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        const adminPasswordInput = document.getElementById('adminPasswordInput');
        const adminAuthError = document.getElementById('adminAuthError');
        const adminAuthArea = document.getElementById('adminAuthArea');
        const adminDataArea = document.getElementById('adminDataArea');

        if (adminLoginBtn && adminPasswordInput) {
            adminLoginBtn.addEventListener('click', () => {
                if (adminPasswordInput.value === 'nur1438nur') {
                    adminAuthArea.style.display = 'none';
                    adminDataArea.style.display = 'block';
                    adminAuthError.style.display = 'none';
                    fetchParticipants();
                } else {
                    adminAuthError.style.display = 'block';
                }
            });
            
            // Allow pressing Enter in password field
            adminPasswordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    adminLoginBtn.click();
                }
            });
        }
    }

    const fetchParticipants = async () => {
        try {
            const response = await fetch('https://tsinghua-1.onrender.com/api/participants', { cache: 'no-store' });
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

            // Handle project file
            const projectLink = p.projectFileUrl 
                ? `<a href="https://tsinghua-1.onrender.com${p.projectFileUrl}" target="_blank" style="color:#4ade80; text-decoration:underline;">View PDF</a>` 
                : '<span style="color:rgba(255,255,255,0.5)">No File</span>';

            // Create Delete Button
            const actionContainer = document.createElement('div');
            actionContainer.style.display = 'flex';
            actionContainer.style.gap = '5px';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteParticipant(p._id || p.id);
            
            const msgBtn = document.createElement('button');
            msgBtn.textContent = 'Message';
            msgBtn.style.background = '#3b82f6';
            msgBtn.style.color = '#fff';
            msgBtn.style.border = 'none';
            msgBtn.style.padding = '5px 10px';
            msgBtn.style.borderRadius = '5px';
            msgBtn.style.cursor = 'pointer';
            msgBtn.onclick = () => sendAdminMessage(p.unionId, p.name);

            actionContainer.appendChild(msgBtn);
            actionContainer.appendChild(deleteBtn);
            
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
                <td>${projectLink}</td>
                <td class="action-cell"></td>
            `;
            tr.querySelector('.action-cell').appendChild(actionContainer);
            
            participantsTableBody.appendChild(tr);
        });
    };

    
    const sendAdminMessage = async (unionId, name) => {
        const msg = prompt('Enter message for ' + name + ' (Union ID: ' + unionId + '):');
        if (!msg) return;
        
        showLoader();
        try {
            const response = await fetch('https://tsinghua-1.onrender.com/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unionId, message: msg })
            });
            if (response.ok) {
                alert('Message sent successfully!');
            } else {
                alert('Failed to send message.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message.');
        } finally {
            hideLoader();
        }
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
        window.location.href = '/dashboard';
    });

    // --- Forgot ID Logic ---
    const showForgotIdBtn = document.getElementById('showForgotIdBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const forgotIdForm = document.getElementById('forgotIdForm');
    const forgotIdResult = document.getElementById('forgotIdResult');
    
    if (showForgotIdBtn && showLoginBtn && forgotIdForm && loginForm) {
        showForgotIdBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            forgotIdForm.style.display = 'block';
            forgotIdResult.textContent = '';
        });
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            forgotIdForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
        
        forgotIdForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('forgotName').value;
            const email = document.getElementById('forgotEmail').value;
            showLoader();
            try {
                const res = await fetch('https://tsinghua-1.onrender.com/api/find-id', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email })
                });
                if (res.ok) {
                    const data = await res.json();
                    forgotIdResult.textContent = 'Your Union ID is: ' + data.unionId;
                    forgotIdResult.style.color = '#22c55e';
                } else {
                    forgotIdResult.textContent = 'Participant not found. Check details.';
                    forgotIdResult.style.color = '#ef4444';
                }
            } catch (err) {
                forgotIdResult.textContent = 'Error connecting to server.';
                forgotIdResult.style.color = '#ef4444';
            } finally {
                hideLoader();
            }
        });
    }

});