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
    if (!localStorage.getItem('attendance')) {
        localStorage.setItem('attendance', JSON.stringify({}));
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
    if (!password || !loginError) return;
    
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
    if (!newsList) return;
    
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
        
        // Calculate ticker animation duration based on content length
        const contentWidth = newsList.scrollWidth;
        const containerWidth = document.querySelector('.news-ticker-container').offsetWidth;
        const duration = Math.max(30, contentWidth / 50);
        
        const ticker = document.querySelector('.news-ticker');
        ticker.style.animation = `ticker ${duration}s linear infinite`;
    }
}

// Fetch and display users
function fetchUsers() {
    const userTable = document.getElementById('userTable')?.querySelector('tbody');
    const totalUsers = document.getElementById('totalUsers');
    if (!userTable || !totalUsers) return;
    
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
    if (!searchInput) return;
    
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
            
            setTimeout(() => {
                successMsg.style.opacity = '0';
                setTimeout(() => document.body.removeChild(successMsg), 500);
            }, 3000);

            fetchNews();
        });
    }
}

// Format date as DD-MMM-YYYY (e.g., 17-Jul-2025)
function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Convert 24h time to 12h format (09:00 → 09:00 AM)
function convertTo12Hour(time24h) {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
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

    // Set default date to today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (document.getElementById('attendanceDate')) {
        document.getElementById('attendanceDate').value = todayStr;
        document.getElementById('currentDateDisplay').textContent = formatDisplayDate(todayStr);
        loadAttendance();
    }

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // Smooth scrolling for navigation links
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
                if (navMenu.classList.contains('show')) {
                    navMenu.classList.remove('show');
                }
            });
        }
    });
});
// Add to initializeStorage()
if (!localStorage.getItem('fees')) {
    localStorage.setItem('fees', JSON.stringify([]));
}

// Add to get/save functions
function getFees() {
    return JSON.parse(localStorage.getItem('fees')) || [];
}

function saveFees(fees) {
    localStorage.setItem('fees', JSON.stringify(fees));
}

// Add deleteNews function
function deleteNews(newsId) {
    if (confirm('Are you sure you want to delete this news item?')) {
        let news = getNews();
        news = news.filter(item => item.id !== newsId);
        saveNews(news);
        fetchNews();
        fetchAdminNews(); // Refresh admin news table
    }
}

// Add fetchAdminNews function
function fetchAdminNews() {
    const newsTable = document.getElementById('newsTable')?.querySelector('tbody');
    if (!newsTable) return;
    
    newsTable.innerHTML = '';
    const news = getNews();
    
    if (news.length === 0) {
        const row = newsTable.insertRow();
        row.innerHTML = `<td colspan="3" style="text-align: center;">No news updates available.</td>`;
    } else {
        news.forEach(item => {
            const row = newsTable.insertRow();
            row.innerHTML = `
                <td>${item.date_posted}</td>
                <td>${item.content}</td>
                <td><a href="#" onclick="deleteNews(${item.id})">Delete</a></td>
            `;
        });
    }
}

// Add fetchFees function
function fetchFees() {
    const feeTable = document.getElementById('feeTable')?.querySelector('tbody');
    const feeForm = document.getElementById('feeForm');
    const studentSelect = feeForm?.querySelector('select[name="student_id"]');
    
    if (!feeTable || !feeForm || !studentSelect) return;
    
    feeTable.innerHTML = '';
    const fees = getFees();
    const users = getUsers();
    
    // Populate student dropdown
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.phone})`;
        studentSelect.appendChild(option);
    });
    
    if (fees.length === 0) {
        const row = feeTable.insertRow();
        row.innerHTML = `<td colspan="4" style="text-align: center;">No fee records available.</td>`;
    } else {
        fees.forEach(fee => {
            const user = users.find(u => u.id === fee.student_id);
            const row = feeTable.insertRow();
            row.innerHTML = `
                <td>${user ? user.name : 'Unknown Student'}</td>
                <td>₹${fee.amount}</td>
                <td>${fee.payment_date}</td>
                <td><a href="#" onclick="deleteFee(${fee.id})">Delete</a></td>
            `;
        });
    }
}

// Add deleteFee function
function deleteFee(feeId) {
    if (confirm('Are you sure you want to delete this fee record?')) {
        let fees = getFees();
        fees = fees.filter(fee => fee.id !== feeId);
        saveFees(fees);
        fetchFees();
    }
}

// Add handleFeeForm function
function handleFeeForm() {
    const feeForm = document.getElementById('feeForm');
    if (feeForm) {
        feeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const fees = getFees();
            const fee = {
                id: fees.length + 1,
                student_id: parseInt(formData.get('student_id')),
                amount: parseInt(formData.get('amount')),
                payment_date: formData.get('payment_date')
            };
            fees.push(fee);
            saveFees(fees);
            this.reset();
            fetchFees();
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.textContent = 'Fee added successfully!';
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
            
            setTimeout(() => {
                successMsg.style.opacity = '0';
                setTimeout(() => document.body.removeChild(successMsg), 500);
            }, 3000);
        });
    }
}

// Update DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
    fetchNews();
    fetchAdminNews(); // Add this line
    fetchUsers();
    fetchFees(); // Add this line
    handleContactForm();
    handleNewsForm();
    handleFeeForm(); // Add this line

    // ... rest of the existing code ...
});
// Add this function for mobile menu toggle
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Close menu when clicking on links
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.classList.remove('active');
    });
});

// Update DOMContentLoaded to include mobile menu
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }
});
// Add these functions to script.js

// Update fetchUsers to include fee status
function fetchUsers() {
    const userTable = document.getElementById('userTable')?.querySelector('tbody');
    const totalUsers = document.getElementById('totalUsers');
    if (!userTable || !totalUsers) return;
    
    userTable.innerHTML = '';
    const users = getUsers();
    const fees = getFees();
    totalUsers.textContent = users.length;
    
    if (users.length === 0) {
        const row = userTable.insertRow();
        row.innerHTML = `<td colspan="7" style="text-align: center;">No students registered.</td>`;
    } else {
        users.forEach(user => {
            const row = userTable.insertRow();
            const userFees = fees.filter(fee => fee.student_id === user.id);
            const hasPaid = userFees.length > 0;
            const totalPaid = userFees.reduce((sum, fee) => sum + fee.amount, 0);
            
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.address}</td>
                <td>${user.registration_date}</td>
                <td class="fee-status ${hasPaid ? 'paid' : 'unpaid'}">
                    ${hasPaid ? `Paid (₹${totalPaid})` : 'Unpaid'}
                </td>
                <td><a href="#" onclick="deleteUser(${user.id})">Delete</a></td>
            `;
        });
    }
}

// Print fee report function
function printFeeReport() {
    const users = getUsers();
    const fees = getFees();
    
    // Create a printable HTML content
    let printContent = `
        <html>
            <head>
                <title>Student Fee Report</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h1 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .paid { color: green; }
                    .unpaid { color: red; }
                    .print-date { text-align: right; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h1>Student Fee Report</h1>
                <div class="print-date">Printed on: ${new Date().toLocaleDateString()}</div>
                <table>
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Total Paid</th>
                            <th>Status</th>
                            <th>Last Payment Date</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    users.forEach(user => {
        const userFees = fees.filter(fee => fee.student_id === user.id);
        const hasPaid = userFees.length > 0;
        const totalPaid = userFees.reduce((sum, fee) => sum + fee.amount, 0);
        const lastPayment = userFees.length > 0 
            ? userFees[userFees.length - 1].payment_date 
            : 'N/A';
        
        printContent += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${hasPaid ? '₹' + totalPaid : '₹0'}</td>
                <td class="${hasPaid ? 'paid' : 'unpaid'}">
                    ${hasPaid ? 'Paid' : 'Unpaid'}
                </td>
                <td>${lastPayment}</td>
            </tr>
        `;
    });
    
    printContent += `
                    </tbody>
                </table>
                <div style="margin-top: 30px; text-align: right;">
                    <p>Signature: _________________________</p>
                </div>
            </body>
        </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// Export fee data to CSV
function exportFeeData() {
    const users = getUsers();
    const fees = getFees();
    
    let csvContent = "Student ID,Name,Phone,Total Paid,Status,Last Payment Date\n";
    
    users.forEach(user => {
        const userFees = fees.filter(fee => fee.student_id === user.id);
        const hasPaid = userFees.length > 0;
        const totalPaid = userFees.reduce((sum, fee) => sum + fee.amount, 0);
        const lastPayment = userFees.length > 0 
            ? userFees[userFees.length - 1].payment_date 
            : 'N/A';
            
        csvContent += `${user.id},"${user.name}",${user.phone},${totalPaid},${hasPaid ? 'Paid' : 'Unpaid'},${lastPayment}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fee_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
