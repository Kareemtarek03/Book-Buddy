// Global variables
let currentUser = null;
let currentBookId = null;

// Get book ID from URL
const bookId = window.location.pathname.split('/').pop();

// DOM Elements
const bookImage = document.getElementById('bookImage');
const bookTitle = document.getElementById('bookTitle');
const bookAuthor = document.getElementById('bookAuthor');
const bookCategory = document.getElementById('bookCategory');
const bookPublishedDate = document.getElementById('bookPublishedDate');
const bookPublisher = document.getElementById('bookPublisher');
const bookPages = document.getElementById('bookPages');
const bookLanguage = document.getElementById('bookLanguage');
const bookIsbn = document.getElementById('bookIsbn');
const bookDescription = document.getElementById('bookDescription');
const reviewsList = document.getElementById('reviewsList');
const reviewForm = document.getElementById('reviewForm');
const loginRequired = document.getElementById('loginRequired');
const addReviewForm = document.getElementById('addReviewForm');
const mainContainer = document.querySelector('.container');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!bookId) {
        showError('No book ID provided');
        return;
    }
    
    // Initialize the page
    initializePage();
    
    // Add event listeners
    setupEventListeners();
});

function initializePage() {
    checkAuthStatus();
    loadBookDetails();
    loadReviews();
}

function setupEventListeners() {
    // Review form submission
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleReviewSubmit(event);
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Star rating interaction
    setupStarRating();
}

function setupStarRating() {
    const ratingContainer = document.querySelector('.rating');
    if (ratingContainer) {
        const labels = ratingContainer.querySelectorAll('label');
        const inputs = ratingContainer.querySelectorAll('input');
        
        labels.forEach((label, index) => {
            // Mouse enter
            label.addEventListener('mouseenter', () => {
                const rating = 5 - index;
                updateStarDisplay(rating);
            });
            
            // Mouse leave
            label.addEventListener('mouseleave', () => {
                const checkedInput = ratingContainer.querySelector('input:checked');
                if (checkedInput) {
                    updateStarDisplay(checkedInput.value);
                } else {
                    updateStarDisplay(0);
                }
            });
            
            // Click
            label.addEventListener('click', () => {
                const rating = 5 - index;
                updateStarDisplay(rating);
            });
        });
    }
}

function updateStarDisplay(rating) {
    const labels = document.querySelectorAll('.rating label');
    labels.forEach((label, index) => {
        if (index < rating) {
            label.style.color = '#ffd700';
        } else {
            label.style.color = '#666';
        }
    });
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
        const reviewForm = document.getElementById('reviewForm');
        const loginRequired = document.getElementById('loginRequired');
        
        if (data.authenticated) {
            currentUser = {
                username: data.username,
                isAdmin: data.is_admin
            };
            
            // Hide auth buttons if they exist
            if (authButtons) {
                authButtons.style.display = 'none';
                authButtons.classList.add('d-none');
            }
            
            // Show user menu if it exists
            if (userMenu) {
                userMenu.style.display = 'flex';
                userMenu.classList.remove('d-none');
            }
            
            // Update username if it exists
            if (usernameDisplay) {
                usernameDisplay.textContent = currentUser.username;
            }
            
            // Show review form and hide login required message if they exist
            if (reviewForm) {
                reviewForm.style.display = 'block';
            }
            if (loginRequired) {
                loginRequired.style.display = 'none';
            }
        } else {
            currentUser = null;
            
            // Show auth buttons if they exist
            if (authButtons) {
                authButtons.style.display = 'flex';
                authButtons.classList.remove('d-none');
            }
            
            // Hide user menu if it exists
            if (userMenu) {
                userMenu.style.display = 'none';
                userMenu.classList.add('d-none');
            }
            
            // Clear username if it exists
            if (usernameDisplay) {
                usernameDisplay.textContent = '';
            }
            
            // Hide review form and show login required message if they exist
            if (reviewForm) {
                reviewForm.style.display = 'none';
            }
            if (loginRequired) {
                loginRequired.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        currentUser = null;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

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
            // Close the modal
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            
            // Update UI and reload reviews
            await checkAuthStatus();
            loadReviews();
            
            // Clear form
            document.getElementById('loginForm').reset();
            document.getElementById('loginError').classList.add('d-none');
            
            // Show success message
            showSuccess('Successfully logged in!');
        } else {
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred during login');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

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
            // Close register modal and show login modal
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            registerModal.hide();
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            
            // Clear form
            document.getElementById('registerForm').reset();
            document.getElementById('registerError').classList.add('d-none');
            
            // Show success message
            showSuccess('Registration successful! Please log in.');
        } else {
            const errorDiv = document.getElementById('registerError');
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('An error occurred during registration');
    }
}

async function handleReviewSubmit(event) {
    if (!currentUser) {
        showError('Please log in to submit a review');
        return;
    }
    
    const rating = document.getElementById('ratingSelect').value;
    const content = document.getElementById('reviewContent').value.trim();
    
    if (!rating) {
        showError('Please select a rating');
        return;
    }
    
    if (!content) {
        showError('Please write your review');
        return;
    }
    
    try {
        const response = await fetch(`/api/books/${bookId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                rating: parseInt(rating), 
                content: content 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Clear form and reload reviews
            addReviewForm.reset();
            await loadReviews();
            showSuccess('Review submitted successfully!');
            
            // Reset star rating display
            updateStarDisplay(0);
        } else {
            showError(data.error || 'Failed to submit review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showError('Failed to submit review. Please try again later.');
    }
}

async function loadBookDetails() {
    try {
        const response = await fetch(`/api/books/${bookId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }
        const book = await response.json();
        
        if (!book) {
            throw new Error('Book not found');
        }
        
        // Update book details with fallback values
        bookImage.src = book.image_url || '/static/images/no-cover.jpg';
        bookImage.alt = book.title || 'Book cover';
        bookTitle.textContent = book.title || 'Untitled';
        bookAuthor.textContent = book.author || 'Unknown Author';
        bookCategory.textContent = book.category || 'Uncategorized';
        bookPublishedDate.textContent = book.published_date || 'N/A';
        bookPublisher.textContent = book.publisher || 'N/A';
        bookPages.textContent = book.page_count ? `${book.page_count} pages` : 'N/A';
        bookLanguage.textContent = book.language || 'N/A';
        bookIsbn.textContent = book.isbn || 'N/A';
        bookDescription.textContent = book.description || 'No description available';
        
        // Update page title
        document.title = `${book.title} - BookBuddy`;
        
        // Add loading animation
        showLoading();
    } catch (error) {
        console.error('Error loading book details:', error);
        showError('Failed to load book details. Please try again later.');
    } finally {
        hideLoading();
    }
}

async function loadReviews() {
    try {
        showLoading();
        const response = await fetch(`/api/books/${bookId}/reviews`);
        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }
        const reviews = await response.json();
        displayReviews(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
        showError('Failed to load reviews. Please try again later.');
    } finally {
        hideLoading();
    }
}

function displayReviews(reviews) {
    reviewsList.innerHTML = '';
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review this book!</p>';
        return;
    }
    
    // Sort reviews by date (newest first)
    reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'card mb-3 review-card';
        reviewElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="card-title mb-0">${review.user}</h5>
                    <div class="rating-display">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                </div>
                <p class="card-text">${review.content}</p>
                <small class="text-muted">Posted on ${new Date(review.created_at).toLocaleDateString()}</small>
            </div>
        `;
        reviewsList.appendChild(reviewElement);
    });
}

async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            currentUser = null;
            await checkAuthStatus();
            await loadReviews();
            showSuccess('Successfully logged out!');
        }
    } catch (error) {
        console.error('Error logging out:', error);
        showError('Failed to log out. Please try again.');
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Find the first row in the container
    const firstRow = mainContainer.querySelector('.row');
    if (firstRow) {
        mainContainer.insertBefore(errorDiv, firstRow);
    } else {
        mainContainer.appendChild(errorDiv);
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show';
    successDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Find the first row in the container
    const firstRow = mainContainer.querySelector('.row');
    if (firstRow) {
        mainContainer.insertBefore(successDiv, firstRow);
    } else {
        mainContainer.appendChild(successDiv);
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
    mainContainer.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
} 