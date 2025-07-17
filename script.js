// Simulated backend data using localStorage
const ADMIN_PASSWORD = 'admin123'; // Hardcoded for demo, use secure backend validation in production

// Initialize localStorage data
function initializeStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('news')) {
        localStorage.setItem('news', JSON.stringify([]));
    }
    if (!localStorage.getItem('isAdminLoggedIn')) {
        localStorage.setItem('isAdminLoggedIn', 'false');
    }
}

// Get data from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function getNews() {
    return JSON.parse(localStorage.getItem('news')) || [];
}

// Save data to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveNews(news) {
    localStorage.setItem('news', JSON.stringify(news));
}

// Admin login
function loginAdmin() {
    const password = document.getElementById('adminPassword')?.value;
    const loginError = document.getElementById('loginError');
    if (!password || !loginError) return; // Skip if elements not found
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        loginError.textContent = 'Invalid password!';
        loginError.style.display = 'block';
    }
}

// Admin logout
function logoutAdmin() {
    localStorage.setItem('isAdminLoggedIn', 'false');
    window.location.href = 'index.html';
}

// Fetch and display news
function fetchNews() {
    const newsList = document.getElementById('newsList');
    if (!newsList) return; // Skip if not on index.html
    newsList.innerHTML = '';
    const news = getNews();
    if (news.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No news updates available.';
        newsList.appendChild(li);
    } else {
        news.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.date_posted} - ${item.content}`;
            newsList.appendChild(li);
        });
    }
}

// Fetch and display users
function fetchUsers() {
    const userTable = document.getElementById('userTable')?.querySelector('tbody');
    const totalUsers = document.getElementById('totalUsers');
    if (!userTable || !totalUsers) return; // Skip if not on admin.html
    userTable.innerHTML = '';
    const users = getUsers();
    totalUsers.textContent = users.length;
    if (users.length === 0) {
        const row = userTable.insertRow();
        row.innerHTML = `<td colspan="6" style="text-align: center;">No students registered.</td>`;
    } else {
        users.forEach(user => {
            const row = userTable.insertRow();
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.address}</td>
                <td>${user.registration_date}</td>
                <td><a href="#" onclick="deleteUser(${user.id})">Delete</a></td>
            `;
        });
    }
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this student?')) {
        let users = getUsers();
        users = users.filter(user => user.id !== userId);
        saveUsers(users);
        fetchUsers();
    }
}

// Search Functionality
function searchResources() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return; // Skip if not on index.html
    const searchValue = searchInput.value.toLowerCase();
    const sections = document.querySelectorAll('section');
    let found = false;

    sections.forEach(section => {
        if (section.id !== 'contact' && section.id !== 'admin-login') {
            const text = section.textContent.toLowerCase();
            section.style.display = text.includes(searchValue) ? 'block' : 'none';
            if (text.includes(searchValue)) found = true;
        }
    });

    if (!found) {
        alert('No results found for "' + searchValue + '".');
    }
    document.querySelector('#home').style.display = 'block';
}

// Handle contact form submission
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const users = getUsers();
            const user = {
                id: users.length + 1,
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                registration_date: new Date().toISOString().split('T')[0]
            };
            users.push(user);
            saveUsers(users);
            this.reset();
            alert('Registration successful!');
        });
    }
}

// Handle news form submission
function handleNewsForm() {
    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const newsContent = formData.get('news_content').trim();
            
            // Validate news content
            if (!newsContent) {
                alert('Please enter news content!');
                return;
            }

            const news = getNews();
            const newsItem = {
                id: news.length + 1,
                content: newsContent,
                date_posted: new Date().toLocaleDateString('en-IN', { 
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })
            };
            
            news.push(newsItem);
            saveNews(news);
            this.reset();
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.textContent = 'News added successfully!';
            successMsg.style.position = 'fixed';
            successMsg.style.bottom = '20px';
            successMsg.style.right = '20px';
            successMsg.style.padding = '10px 20px';
            successMsg.style.backgroundColor = '#10b981';
            successMsg.style.color = 'white';
            successMsg.style.borderRadius = '5px';
            successMsg.style.zIndex = '1000';
            successMsg.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            document.body.appendChild(successMsg);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                successMsg.style.opacity = '0';
                setTimeout(() => document.body.removeChild(successMsg), 500);
            }, 3000);

            // Refresh news display
            fetchNews();
            
            // Restart animation if it was stopped
            const ticker = document.querySelector('.news-ticker');
            if (ticker && news.length > 0) {
                const contentWidth = document.getElementById('newsList').scrollWidth;
                const containerWidth = document.querySelector('.news-ticker-container').offsetWidth;
                const duration = Math.max(30, contentWidth / 50);
                
                ticker.style.animation = 'none';
                // Trigger reflow
                void ticker.offsetWidth;
                ticker.style.animation = `ticker ${duration}s linear infinite`;
            }
        });
    }
}
// Add data export/import functionality
function exportData() {
    const data = {
        users: getUsers(),
        news: getNews(),
        attendance: JSON.parse(localStorage.getItem('attendance')) || {}
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-data-${new Date().toISOString()}.json`;
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        localStorage.setItem('users', JSON.stringify(data.users));
        localStorage.setItem('news', JSON.stringify(data.news));
        localStorage.setItem('attendance', JSON.stringify(data.attendance));
        alert('Data imported successfully!');
        window.location.reload();
    };
    reader.readAsText(file);
}
// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
    fetchNews();
    fetchUsers();
    handleContactForm();
    handleNewsForm();

    // Check if admin is logged in for admin.html
    if (window.location.pathname.includes('admin.html') && localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'index.html';
    }

    // Show admin login section when Admin Panel link is clicked
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('section').forEach(section => {
                section.style.display = section.id === 'admin-login' ? 'block' : 'none';
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    // Add to initializeStorage()
if (!localStorage.getItem('attendance')) {
    localStorage.setItem('attendance', JSON.stringify({}));
}

// New attendance functions
function loadAttendance() {
    const date = document.getElementById('attendanceDate').value || new Date().toISOString().split('T')[0];
    const attendanceTable = document.getElementById('attendanceTable')?.querySelector('tbody');
    if (!attendanceTable) return;
    
    attendanceTable.innerHTML = '';
    const users = getUsers();
    const allAttendance = JSON.parse(localStorage.getItem('attendance'));
    const dateAttendance = allAttendance[date] || {};
    
    users.forEach(user => {
        const row = attendanceTable.insertRow();
        const userAttendance = dateAttendance[user.id] || { present: false, timeIn: '', timeOut: '' };
        
        row.innerHTML = `
            <td>${user.name}</td>
            <td><input type="checkbox" ${userAttendance.present ? 'checked' : ''} 
                 onchange="updateAttendance(${user.id}, 'present', this.checked, '${date}')"></td>
            <td><input type="time" value="${userAttendance.timeIn || ''}" 
                 onchange="updateAttendance(${user.id}, 'timeIn', this.value, '${date}')"></td>
            <td><input type="time" value="${userAttendance.timeOut || ''}" 
                 onchange="updateAttendance(${user.id}, 'timeOut', this.value, '${date}')"></td>
        `;
    });
}

function updateAttendance(userId, field, value, date) {
    date = date || document.getElementById('attendanceDate').value || new Date().toISOString().split('T')[0];
    const allAttendance = JSON.parse(localStorage.getItem('attendance'));
    
    if (!allAttendance[date]) {
        allAttendance[date] = {};
    }
    
    if (!allAttendance[date][userId]) {
        allAttendance[date][userId] = { present: false, timeIn: '', timeOut: '' };
    }
    
    allAttendance[date][userId][field] = value;
    localStorage.setItem('attendance', JSON.stringify(allAttendance));
}

function markAllPresent() {
    const date = document.getElementById('attendanceDate').value || new Date().toISOString().split('T')[0];
    const users = getUsers();
    const allAttendance = JSON.parse(localStorage.getItem('attendance'));
    
    if (!allAttendance[date]) {
        allAttendance[date] = {};
    }
    
    users.forEach(user => {
        if (!allAttendance[date][user.id]) {
            allAttendance[date][user.id] = { present: true, timeIn: '09:00', timeOut: '17:00' };
        } else {
            allAttendance[date][user.id].present = true;
        }
    });
    
    localStorage.setItem('attendance', JSON.stringify(allAttendance));
    loadAttendance();
}

// Add to DOMContentLoaded
document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];

    // Smooth scrolling for navigation links (only for index.html)
    document.querySelectorAll('nav ul li a:not(.logout)').forEach(anchor => {
        if (anchor.getAttribute('href').startsWith('#')) {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
});
// Add these functions to your existing script.js

function loadAttendance() {
    const dateInput = document.getElementById('attendanceDate');
    const date = dateInput.value;
    const attendanceTable = document.getElementById('attendanceTable').querySelector('tbody');
    
    // Clear existing rows
    attendanceTable.innerHTML = '';
    
    // Get all registered users
    const users = getUsers();
    
    // Get attendance data for selected date
    const allAttendance = JSON.parse(localStorage.getItem('attendance')) || {};
    const dateAttendance = allAttendance[date] || {};
    
    // Create a row for each user
    users.forEach(user => {
        const row = attendanceTable.insertRow();
        
        // Get this user's attendance for the selected date
        const userAttendance = dateAttendance[user.id] || {
            present: false,
            timeIn: '09:00',
            timeOut: '17:00'
        };
        
        // Insert cells with attendance controls
        row.innerHTML = `
            <td>${user.name}</td>
            <td>
                <input type="checkbox" 
                       ${userAttendance.present ? 'checked' : ''}
                       onchange="updateUserAttendance(${user.id}, 'present', this.checked)">
            </td>
            <td>
                <input type="time" 
                       value="${userAttendance.timeIn}"
                       onchange="updateUserAttendance(${user.id}, 'timeIn', this.value)">
            </td>
            <td>
                <input type="time" 
                       value="${userAttendance.timeOut}"
                       onchange="updateUserAttendance(${user.id}, 'timeOut', this.value)">
            </td>
        `;
    });
}

function updateUserAttendance(userId, field, value) {
    const date = document.getElementById('attendanceDate').value;
    let allAttendance = JSON.parse(localStorage.getItem('attendance')) || {};
    
    // Initialize date if not exists
    if (!allAttendance[date]) {
        allAttendance[date] = {};
    }
    
    // Initialize user attendance if not exists
    if (!allAttendance[date][userId]) {
        allAttendance[date][userId] = {
            present: false,
            timeIn: '09:00',
            timeOut: '17:00'
        };
    }
    
    // Update the specific field
    allAttendance[date][userId][field] = value;
    
    // Save back to localStorage
    localStorage.setItem('attendance', JSON.stringify(allAttendance));
}

function markAllPresent() {
    const date = document.getElementById('attendanceDate').value;
    const users = getUsers();
    let allAttendance = JSON.parse(localStorage.getItem('attendance')) || {};
    
    // Initialize date if not exists
    if (!allAttendance[date]) {
        allAttendance[date] = {};
    }
    
    // Mark all users as present
    users.forEach(user => {
        if (!allAttendance[date][user.id]) {
            allAttendance[date][user.id] = {
                present: true,
                timeIn: '09:00',
                timeOut: '17:00'
            };
        } else {
            allAttendance[date][user.id].present = true;
        }
    });
    
    // Save and refresh
    localStorage.setItem('attendance', JSON.stringify(allAttendance));
    loadAttendance();
}

// Initialize the attendance system when page loads
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Set default date to today if not already set
    if (!document.getElementById('attendanceDate').value) {
        const today = new Date();
        document.getElementById('attendanceDate').value = today.toISOString().split('T')[0];
    }
    
    // Load initial attendance data
    loadAttendance();
});
// Add these functions to your existing script.js

// Format date as DD-MMM-YYYY (e.g., 17-Jul-2025)
function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Load attendance for selected date
function loadAttendance() {
    const dateInput = document.getElementById('attendanceDate');
    let selectedDate = dateInput.value;
    
    // If no date selected, use today's date
    if (!selectedDate) {
        const today = new Date();
        selectedDate = today.toISOString().split('T')[0];
        dateInput.value = selectedDate;
    }
    
    // Update displayed date
    document.getElementById('currentDateDisplay').textContent = formatDisplayDate(selectedDate);
    
    const attendanceTable = document.getElementById('attendanceTable').querySelector('tbody');
    attendanceTable.innerHTML = '';
    
    const users = getUsers();
    const allAttendance = JSON.parse(localStorage.getItem('attendance')) || {};
    const dateAttendance = allAttendance[selectedDate] || {};
    
    users.forEach(user => {
        const row = attendanceTable.insertRow();
        const userAttendance = dateAttendance[user.id] || {
            present: false,
            timeIn: '09:00',
            timeOut: '18:00'
        };
        
        // Convert 24h time to 12h format for display
        const timeIn12h = convertTo12Hour(userAttendance.timeIn);
        const timeOut12h = convertTo12Hour(userAttendance.timeOut);
        
        row.innerHTML = `
            <td>${user.name}</td>
            <td>
                <input type="checkbox" class="present-checkbox"
                       ${userAttendance.present ? 'checked' : ''}
                       data-user-id="${user.id}">
            </td>
            <td>
                <input type="time" class="time-in" 
                       value="${userAttendance.timeIn}"
                       data-user-id="${user.id}">
                <span class="time-display">${timeIn12h}</span>
            </td>
            <td>
                <input type="time" class="time-out" 
                       value="${userAttendance.timeOut}"
                       data-user-id="${user.id}">
                <span class="time-display">${timeOut12h}</span>
            </td>
        `;
    });
    
    // Add event listeners to time inputs
    document.querySelectorAll('.time-in, .time-out').forEach(input => {
        input.addEventListener('change', function() {
            const userId = this.getAttribute('data-user-id');
            const field = this.classList.contains('time-in') ? 'timeIn' : 'timeOut';
            const timeDisplay = this.nextElementSibling;
            timeDisplay.textContent = convertTo12Hour(this.value);
        });
    });
}

// Convert 24h time to 12h format (09:00 → 09:00 AM)
function convertTo12Hour(time24h) {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
}

// Mark all students as present
function markAllPresent() {
    const checkboxes = document.querySelectorAll('.present-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

// Save attendance data
function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    if (!date) {
        alert('Please select a date first');
        return;
    }
    
    const allAttendance = JSON.parse(localStorage.getItem('attendance')) || {};
    allAttendance[date] = allAttendance[date] || {};
    
    // Get all user rows
    const rows = document.querySelectorAll('#attendanceTable tbody tr');
    rows.forEach(row => {
        const userId = row.querySelector('.present-checkbox').getAttribute('data-user-id');
        const present = row.querySelector('.present-checkbox').checked;
        const timeIn = row.querySelector('.time-in').value;
        const timeOut = row.querySelector('.time-out').value;
        
        allAttendance[date][userId] = {
            present,
            timeIn,
            timeOut
        };
    });
    
    localStorage.setItem('attendance', JSON.stringify(allAttendance));
    alert('Attendance saved successfully!');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...
    
    // Set default date to today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = todayStr;
    document.getElementById('currentDateDisplay').textContent = formatDisplayDate(todayStr);
    
    // Load today's attendance
    loadAttendance();
});