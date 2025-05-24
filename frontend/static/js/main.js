// Global variables
let currentUser = null;
let searchTimeout = null;
let books = [];

// DOM Elements
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
const authButtons = document.getElementById('auth-buttons');
const userMenu = document.getElementById('user-menu');
const usernameDisplay = document.getElementById('username-display');
const booksContainer = document.getElementById('books-container');
const searchInput = document.getElementById('search-input');
const noResultsMessage = document.getElementById('no-results-message');

// Event Listeners
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('register-form').addEventListener('submit', handleRegister);
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadBooks();
    
    // Add event listener for category filter
    document.getElementById('category-filter').addEventListener('change', filterBooks);
    
    // Add real-time search functionality
    searchInput.addEventListener('input', (e) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        noResultsMessage.classList.add('d-none');
        searchTimeout = setTimeout(() => {
            filterBooks();
        }, 300);
    });
});

// Functions
function showLoginModal() {
    loginModal.show();
}

function showRegisterModal() {
    registerModal.show();
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Set current user
            currentUser = {
                username: data.username,
                isAdmin: data.is_admin
            };
            
            // Get all necessary elements
            const authButtons = document.getElementById('auth-buttons');
            const userMenu = document.getElementById('user-menu');
            const usernameDisplay = document.getElementById('username-display');
            const adminDashboardLink = document.getElementById('admin-dashboard-link');
            
            // Hide auth buttons - using multiple approaches to ensure it works
            if (authButtons) {
                authButtons.style.display = 'none';
                authButtons.classList.add('d-none');
                authButtons.setAttribute('hidden', '');
            }
            
            // Show user menu
            if (userMenu) {
                userMenu.style.display = 'flex';
                userMenu.classList.remove('d-none');
                userMenu.removeAttribute('hidden');
            }
            
            // Update username
            if (usernameDisplay) {
                usernameDisplay.textContent = currentUser.username;
            }
            
            // Show admin dashboard link if user is admin
            if (adminDashboardLink) {
                adminDashboardLink.style.display = currentUser.isAdmin ? 'block' : 'none';
            }
            
            // Close modal and reload books
            loginModal.hide();
            loadBooks();
            
            // Force a small delay and check again
            setTimeout(() => {
                if (authButtons) {
                    authButtons.style.display = 'none';
                    authButtons.classList.add('d-none');
                }
                if (userMenu) {
                    userMenu.style.display = 'flex';
                    userMenu.classList.remove('d-none');
                }
            }, 100);
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            registerModal.hide();
            showLoginModal();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
    }
}

async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            currentUser = null;
            updateUIForLoggedOutUser();
            // Force a page reload to clear any cached state
            window.location.href = '/';
        } else {
            console.error('Logout failed');
            // Still redirect to home page even if logout fails
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Redirect to home page even if there's an error
        window.location.href = '/';
    }
}

function updateUIForLoggedInUser() {
    // Hide auth buttons and show user menu
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) {
        userMenu.classList.remove('d-none');
        userMenu.style.display = 'flex';
    }
    
    // Update username display
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.username;
    }
    
    // Show/hide admin dashboard link
    const adminDashboardLink = document.getElementById('admin-dashboard-link');
    if (adminDashboardLink) {
        adminDashboardLink.style.display = currentUser.isAdmin ? 'block' : 'none';
    }
    
    // Show initialize data button for admin users
    const initDataBtn = document.getElementById('init-data-btn');
    if (initDataBtn) {
        initDataBtn.style.display = currentUser.isAdmin ? 'inline-block' : 'none';
    }
}

function updateUIForLoggedOutUser() {
    // Show auth buttons and hide user menu
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) {
        userMenu.classList.add('d-none');
        userMenu.style.display = 'none';
    }
    
    // Clear username display
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = '';
    }
    
    // Hide admin dashboard link
    const adminDashboardLink = document.getElementById('admin-dashboard-link');
    if (adminDashboardLink) {
        adminDashboardLink.style.display = 'none';
    }
    
    // Hide initialize data button
    const initDataBtn = document.getElementById('init-data-btn');
    if (initDataBtn) {
        initDataBtn.style.display = 'none';
    }
}

async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        books = await response.json();
        
        // Populate categories dropdown
        const categories = [...new Set(books.map(book => book.category).filter(Boolean))];
        const categoryFilter = document.getElementById('category-filter');
        
        // Clear existing options except the first one
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Add new category options
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        displayBooks(books);
    } catch (error) {
        console.error('Error loading books:', error);
        showError('Failed to load books');
    }
}

function displayBooks(booksToDisplay) {
    booksContainer.innerHTML = '';
    noResultsMessage.classList.add('d-none');
    
    if (booksToDisplay.length === 0) {
        showNoResults();
        return;
    }
    
    booksToDisplay.forEach(book => {
        const bookCard = createBookCard(book);
        booksContainer.appendChild(bookCard);
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'col-md-4 col-lg-3 mb-4';
    
    // Format the rating display
    const ratingDisplay = book.average_rating 
        ? `<div class="text-warning mb-2">
             ${'★'.repeat(Math.round(book.average_rating))}${'☆'.repeat(5 - Math.round(book.average_rating))}
             <small class="text-muted">(${book.ratings_count || 0} ratings)</small>
           </div>`
        : '';
    
    card.innerHTML = `
        <div class="card h-100">
            <div class="position-relative">
                <img src="${book.image_url || '/static/images/no-cover.jpg'}" 
                     class="card-img-top" 
                     alt="${book.title}"
                     style="height: 300px; object-fit: cover;">
                <span class="badge bg-primary position-absolute top-0 end-0 m-2">${book.category || 'Uncategorized'}</span>
            </div>
            <div class="card-body">
                <h5 class="card-title text-truncate">${book.title}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
                ${ratingDisplay}
                <p class="card-text small text-truncate">${book.description || 'No description available'}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <small class="text-muted">${book.published_date || 'N/A'}</small>
                    <a href="/books/${book.id}" class="btn btn-primary btn-sm">View Details</a>
                </div>
            </div>
        </div>
    `;
    return card;
}

function filterBooks() {
    const category = document.getElementById('category-filter').value;
    const searchQuery = document.getElementById('search-input').value.trim().toLowerCase();
    
    let filteredBooks = books;
    
    // Apply category filter
    if (category) {
        filteredBooks = filteredBooks.filter(book => book.category === category);
    }
    
    // Apply search filter
    if (searchQuery) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchQuery) ||
            book.author.toLowerCase().includes(searchQuery) ||
            (book.description && book.description.toLowerCase().includes(searchQuery))
        );
    }
    
    displayBooks(filteredBooks);
}

function viewBookDetails(bookId) {
    window.location.href = `/books/${bookId}`;
}

async function initSampleData() {
    try {
        const initDataBtn = document.getElementById('init-data-btn');
        const originalText = initDataBtn.textContent;
        
        // Show loading state
        initDataBtn.disabled = true;
        initDataBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Fetching Books...';
        
        // Show loading message
        const loadingAlert = document.createElement('div');
        loadingAlert.className = 'alert alert-info alert-dismissible fade show';
        loadingAlert.innerHTML = `
            <strong>Loading Books...</strong> Please wait while we fetch 20 books from Google Books API.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        booksContainer.parentElement.insertBefore(loadingAlert, booksContainer);
        
        const response = await fetch('/api/init-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        // Remove loading alert
        loadingAlert.remove();
        
        if (response.ok) {
            // Show success message
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success alert-dismissible fade show';
            successAlert.innerHTML = `
                <strong>Success!</strong> ${data.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            booksContainer.parentElement.insertBefore(successAlert, booksContainer);
            
            // Reload books after adding new ones
            await loadBooks();
        } else {
            showError(data.error || 'Failed to initialize data');
        }
    } catch (error) {
        showError('Error initializing data: ' + error.message);
    } finally {
        // Reset button state
        initDataBtn.disabled = false;
        initDataBtn.textContent = originalText;
    }
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        // Get all necessary elements
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const usernameDisplay = document.getElementById('username-display');
        const adminDashboardLink = document.getElementById('admin-dashboard-link');
        
        if (data.authenticated) {
            currentUser = {
                username: data.username,
                isAdmin: data.is_admin
            };
            
            // Hide auth buttons
            if (authButtons) {
                authButtons.style.display = 'none';
                authButtons.classList.add('d-none');
            }
            
            // Show user menu
            if (userMenu) {
                userMenu.style.display = 'flex';
                userMenu.classList.remove('d-none');
            }
            
            // Update username
            if (usernameDisplay) {
                usernameDisplay.textContent = currentUser.username;
            }
            
            // Show admin dashboard link if user is admin
            if (adminDashboardLink) {
                adminDashboardLink.style.display = currentUser.isAdmin ? 'block' : 'none';
            }
        } else {
            currentUser = null;
            
            // Show auth buttons
            if (authButtons) {
                authButtons.style.display = 'flex';
                authButtons.classList.remove('d-none');
            }
            
            // Hide user menu
            if (userMenu) {
                userMenu.style.display = 'none';
                userMenu.classList.add('d-none');
            }
            
            // Clear username
            if (usernameDisplay) {
                usernameDisplay.textContent = '';
            }
            
            // Hide admin dashboard link
            if (adminDashboardLink) {
                adminDashboardLink.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        currentUser = null;
        
        // Show auth buttons and hide user menu on error
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (authButtons) {
            authButtons.style.display = 'flex';
            authButtons.classList.remove('d-none');
        }
        
        if (userMenu) {
            userMenu.style.display = 'none';
            userMenu.classList.add('d-none');
        }
    }
}

// Show no results message
function showNoResults() {
    booksContainer.innerHTML = '';
    noResultsMessage.classList.remove('d-none');
}

// Show error message
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    booksContainer.parentElement.insertBefore(alertDiv, booksContainer);
}

// Initial load
loadBooks(); 