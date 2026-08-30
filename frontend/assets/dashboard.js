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

    // Check if file is already uploaded
    const updateUploadUI = (fileUrl) => {
        const title = document.getElementById('uploadStatusTitle');
        const desc = document.getElementById('uploadStatusDesc');
        const box = document.getElementById('uploadStatusBox');
        
        if (fileUrl) {
            title.textContent = 'Project documentation uploaded successfully!';
            title.style.color = '#4ade80'; // Green
            desc.innerHTML = `<a href="https://tsinghua-1.onrender.com${fileUrl}" target="_blank" style="color:#3b82f6; text-decoration:underline;">View Uploaded PDF</a>`;
            box.style.borderColor = '#4ade80';
        }
    };
    
    updateUploadUI(participant.projectFileUrl);

    // 3. Handle File Upload
    const triggerUploadBtn = document.getElementById('triggerUploadBtn');
    const projectFileInput = document.getElementById('projectFileInput');

    if (triggerUploadBtn && projectFileInput) {
        triggerUploadBtn.addEventListener('click', () => {
            projectFileInput.click();
        });

        projectFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Optional: validate it's a PDF
            if (file.type !== 'application/pdf') {
                alert('Please upload a valid PDF file.');
                return;
            }

            const formData = new FormData();
            formData.append('projectFile', file);
            formData.append('unionId', participant.unionId);

            try {
                // Change button text while uploading
                const originalText = triggerUploadBtn.textContent;
                triggerUploadBtn.textContent = 'Uploading...';
                triggerUploadBtn.disabled = true;

                const response = await fetch('https://tsinghua-1.onrender.com/api/upload-project', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Update localStorage with new data
                    localStorage.setItem('participantData', JSON.stringify(data.participant));
                    
                    // Update UI
                    updateUploadUI(data.participant.projectFileUrl);
                    alert('Project PDF uploaded successfully!');
                } else {
                    alert('Upload failed. Please try again.');
                }
            } catch (error) {
                console.error('Upload Error:', error);
                alert('An error occurred during upload.');
            } finally {
                triggerUploadBtn.textContent = 'Upload PDF';
                triggerUploadBtn.disabled = false;
            }
        });
    }

    // 4. Handle Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('participantData');
            window.location.href = 'index.html';
        });
    }

    // 5. Fetch and Render Notifications
    const notificationList = document.getElementById('notificationList');
    
    const fetchNotifications = async () => {
        try {
            const response = await fetch('https://tsinghua-1.onrender.com/api/notifications/' + participant.unionId);
            if (response.ok) {
                const notifications = await response.json();
                renderNotifications(notifications);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };
    
    const renderNotifications = (notifications) => {
        if (!notificationList) return;
        notificationList.innerHTML = '';
        
        if (notifications.length === 0) {
            notificationList.innerHTML = '<li><div class="feed-text"><p>No new notifications.</p></div></li>';
            return;
        }
        
        // Sort by date descending
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        notifications.forEach(n => {
            const li = document.createElement('li');
            const dateObj = new Date(n.date);
            const dateStr = dateObj.toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            li.innerHTML = `
                <div class="feed-avatar"><img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Admin"></div>
                <div class="feed-text">
                    <strong>Admin Message</strong>
                    <p>${n.message}</p>
                </div>
                <div class="feed-date">${dateStr}<br>${timeStr}</div>
            `;
            notificationList.appendChild(li);
        });
    };
    
    fetchNotifications();

});