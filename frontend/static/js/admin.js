// Global variables
let currentUser = null;

// DOM Elements
const usersTableBody = document.getElementById('usersTableBody');
const reviewsTableBody = document.getElementById('reviewsTableBody');
const booksTableBody = document.getElementById('booksTableBody');
const usernameDisplay = document.getElementById('username-display');
const addBookModal = new bootstrap.Modal(document.getElementById('addBookModal'));

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadUsers();
    loadReviews();
    loadBooks();
});

document.getElementById('add-book-form').addEventListener('submit', handleAddBook);

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated && data.is_admin) {
            currentUser = {
                username: data.username,
                isAdmin: data.is_admin
            };
            usernameDisplay.textContent = currentUser.username;
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        window.location.href = '/';
    }
}

// Load Users
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        
        usersTableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" 
                               ${user.is_admin ? 'checked' : ''}
                               onchange="toggleAdminStatus(${user.id}, this.checked)">
                    </div>
                </td>
                <td>${user.reviews}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users');
    }
}

// Load Reviews
async function loadReviews() {
    try {
        const response = await fetch('/api/admin/reviews');
        const reviews = await response.json();
        
        reviewsTableBody.innerHTML = reviews.map(review => `
            <tr>
                <td>${review.user.username}</td>
                <td>${review.book.title}</td>
                <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
                <td>${review.content}</td>
                <td>${new Date(review.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteReview(${review.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
        showError('Failed to load reviews');
    }
}

// Load Books
async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        
        booksTableBody.innerHTML = books.map(book => `
            <tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>${book.average_rating ? '★'.repeat(Math.round(book.average_rating)) + '☆'.repeat(5 - Math.round(book.average_rating)) : 'No ratings'}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-2" onclick="editBook(${book.id})">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading books:', error);
        showError('Failed to load books');
    }
}

// Toggle Admin Status
async function toggleAdminStatus(userId, makeAdmin) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ make_admin: makeAdmin })
        });
        
        if (response.ok) {
            showSuccess('User status updated successfully');
            loadUsers();
        } else {
            const data = await response.json();
            showError(data.error || 'Failed to update user status');
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        showError('Failed to update user status');
    }
}

// Delete User
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('User deleted successfully');
            loadUsers();
        } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Failed to delete user');
    }
}

// Delete Review
async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
        const response = await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Review deleted successfully');
            loadReviews();
        } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete review');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        showError('Failed to delete review');
    }
}

// Delete Book
async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Book deleted successfully');
            loadBooks();
        } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        showError('Failed to delete book');
    }
}

// Logout
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Clear any stored user data
            currentUser = null;
            // Redirect to home page
            window.location.href = '/';
        } else {
            console.error('Logout failed');
            // Still redirect to home page even if logout fails
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error logging out:', error);
        // Redirect to home page even if there's an error
        window.location.href = '/';
    }
}

// Show error message
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.tab-content'));
}

// Show success message
function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.tab-content'));
}

// Show add book modal
function showAddBookModal() {
    document.getElementById('add-book-form').reset();
    addBookModal.show();
}

// Fetch book by ISBN
async function fetchBookByISBN() {
    const isbn = document.getElementById('book-isbn').value.trim();
    if (!isbn) {
        showError('Please enter an ISBN');
        return;
    }

    try {
        const response = await fetch(`/api/books/fetch-by-isbn/${isbn}`);
        const data = await response.json();

        if (response.ok) {
            // Fill the form with the fetched book data
            document.getElementById('book-title').value = data.title || '';
            document.getElementById('book-author').value = data.author || '';
            document.getElementById('book-description').value = data.description || '';
            document.getElementById('book-image').value = data.image_url || '';
            
            // Set category if it matches one of our options
            const categorySelect = document.getElementById('book-category');
            const category = data.category?.toLowerCase() || '';
            if (category.includes('fiction')) {
                categorySelect.value = 'fiction';
            } else if (category.includes('non-fiction')) {
                categorySelect.value = 'non-fiction';
            } else if (category.includes('science')) {
                categorySelect.value = 'science';
            } else if (category.includes('technology')) {
                categorySelect.value = 'technology';
            }

            showSuccess('Book details fetched successfully');
        } else {
            showError(data.error || 'Failed to fetch book details');
        }
    } catch (error) {
        console.error('Error fetching book:', error);
        showError('An error occurred while fetching book details');
    }
}

// Handle add book
async function handleAddBook(event) {
    event.preventDefault();
    
    const bookData = {
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        category: document.getElementById('book-category').value,
        description: document.getElementById('book-description').value,
        image_url: document.getElementById('book-image').value,
        isbn: document.getElementById('book-isbn').value.trim() || null
    };
    
    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });
        
        if (response.ok) {
            addBookModal.hide();
            event.target.reset();
            loadBooks();
            showSuccess('Book added successfully');
        } else {
            const data = await response.json();
            showError(data.error || 'Failed to add book');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        showError('An error occurred while adding the book');
    }
} 