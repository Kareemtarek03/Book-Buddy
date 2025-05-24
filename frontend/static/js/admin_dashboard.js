// Global variables
let currentUser = null;
let currentSearchParams = {
    query: '',
    category: '',
    language: '',
    sort: 'relevance',
    printType: 'all',
    startIndex: 0
};

// DOM Elements
const addBookModal = new bootstrap.Modal(document.getElementById('addBookModal'));
const editBookModal = new bootstrap.Modal(document.getElementById('editBookModal'));
const searchBookModal = new bootstrap.Modal(document.getElementById('searchBookModal'));

// Event Listeners
document.getElementById('add-book-form').addEventListener('submit', handleAddBook);
document.getElementById('edit-book-form').addEventListener('submit', handleEditBook);

// Add event listeners for search filters
document.getElementById('search-category').addEventListener('change', () => {
    currentSearchParams.category = document.getElementById('search-category').value;
    currentSearchParams.startIndex = 0;
    searchExternalBooks();
});

document.getElementById('search-language').addEventListener('change', () => {
    currentSearchParams.language = document.getElementById('search-language').value;
    currentSearchParams.startIndex = 0;
    searchExternalBooks();
});

document.getElementById('search-sort').addEventListener('change', () => {
    currentSearchParams.sort = document.getElementById('search-sort').value;
    currentSearchParams.startIndex = 0;
    searchExternalBooks();
});

document.getElementById('search-print-type').addEventListener('change', () => {
    currentSearchParams.printType = document.getElementById('search-print-type').value;
    currentSearchParams.startIndex = 0;
    searchExternalBooks();
});

// Check admin status and load data
async function checkAdminStatus() {
    try {
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();
        
        if (!data.is_admin) {
            window.location.href = '/';
            return;
        }
        
        currentUser = data;
        document.getElementById('username-display').textContent = data.username;
        loadAllData();
    } catch (error) {
        console.error('Error checking admin status:', error);
        window.location.href = '/';
    }
}

// Load all data
async function loadAllData() {
    await Promise.all([
        loadBooks(),
        loadUsers(),
        loadReviews()
    ]);
}

// Load books
async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        
        const tbody = document.getElementById('books-table-body');
        tbody.innerHTML = '';
        
        books.forEach(book => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>${book.reviews ? book.reviews.length : 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" onclick="editBook(${book.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.is_admin ? 'Admin' : 'User'}</td>
                <td>${user.reviews ? user.reviews.length : 0}</td>
                <td>
                    <button class="btn btn-sm btn-${user.is_admin ? 'warning' : 'success'} me-2" 
                            onclick="toggleAdminStatus(${user.id}, ${!user.is_admin})">
                        ${user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load reviews
async function loadReviews() {
    try {
        const response = await fetch('/api/admin/reviews');
        const reviews = await response.json();
        
        const tbody = document.getElementById('reviews-table-body');
        tbody.innerHTML = '';
        
        reviews.forEach(review => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${review.book.title}</td>
                <td>${review.user.username}</td>
                <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
                <td>${review.content}</td>
                <td>${new Date(review.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteReview(${review.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Add book
async function handleAddBook(event) {
    event.preventDefault();
    
    const bookData = {
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        category: document.getElementById('book-category').value,
        description: document.getElementById('book-description').value,
        image_url: document.getElementById('book-image').value
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
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to add book');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        alert('An error occurred while adding the book');
    }
}

// Edit book
async function editBook(bookId) {
    try {
        const response = await fetch(`/api/books/${bookId}`);
        const book = await response.json();
        
        document.getElementById('edit-book-id').value = book.id;
        document.getElementById('edit-book-title').value = book.title;
        document.getElementById('edit-book-author').value = book.author;
        document.getElementById('edit-book-category').value = book.category;
        document.getElementById('edit-book-description').value = book.description;
        document.getElementById('edit-book-image').value = book.image_url || '';
        
        editBookModal.show();
    } catch (error) {
        console.error('Error loading book details:', error);
    }
}

// Handle edit book
async function handleEditBook(event) {
    event.preventDefault();
    
    const bookId = document.getElementById('edit-book-id').value;
    const bookData = {
        title: document.getElementById('edit-book-title').value,
        author: document.getElementById('edit-book-author').value,
        category: document.getElementById('edit-book-category').value,
        description: document.getElementById('edit-book-description').value,
        image_url: document.getElementById('edit-book-image').value
    };
    
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });
        
        if (response.ok) {
            editBookModal.hide();
            loadBooks();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to update book');
        }
    } catch (error) {
        console.error('Error updating book:', error);
        alert('An error occurred while updating the book');
    }
}

// Delete book
async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadBooks();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('An error occurred while deleting the book');
    }
}

// Toggle admin status
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
            loadUsers();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to update user status');
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        alert('An error occurred while updating user status');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadUsers();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user');
    }
}

// Delete review
async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadReviews();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete review');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('An error occurred while deleting the review');
    }
}

// Show add book modal
function showAddBookModal() {
    document.getElementById('add-book-form').reset();
    addBookModal.show();
}

// Logout
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Show search book modal
function showSearchBookModal() {
    document.getElementById('search-query').value = '';
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-results-count').textContent = '';
    currentSearchParams = {
        query: '',
        category: '',
        language: '',
        sort: 'relevance',
        printType: 'all',
        startIndex: 0
    };
    searchBookModal.show();
}

// Search external books
async function searchExternalBooks() {
    const query = document.getElementById('search-query').value.trim();
    if (!query) return;

    currentSearchParams.query = query;
    
    const resultsContainer = document.getElementById('search-results');
    const loadingSpinner = document.getElementById('search-loading');
    
    if (currentSearchParams.startIndex === 0) {
        resultsContainer.innerHTML = '';
    }
    
    loadingSpinner.classList.remove('d-none');

    try {
        const queryParams = new URLSearchParams({
            q: query,
            category: currentSearchParams.category,
            language: currentSearchParams.language,
            sort: currentSearchParams.sort,
            printType: currentSearchParams.printType,
            startIndex: currentSearchParams.startIndex
        });

        const response = await fetch(`/api/books/search?${queryParams}`);
        const data = await response.json();

        if (currentSearchParams.startIndex === 0) {
            resultsContainer.innerHTML = '';
        }
        
        if (data.books.length === 0 && currentSearchParams.startIndex === 0) {
            resultsContainer.innerHTML = '<div class="col-12 text-center">No books found</div>';
            document.getElementById('search-results-count').textContent = '';
            return;
        }

        data.books.forEach(book => {
            const bookCard = createBookCard(book);
            resultsContainer.appendChild(bookCard);
        });

        // Update results count
        const totalResults = data.totalItems || 0;
        const start = currentSearchParams.startIndex + 1;
        const end = Math.min(currentSearchParams.startIndex + data.books.length, totalResults);
        document.getElementById('search-results-count').textContent = 
            `Showing ${start}-${end} of ${totalResults} results`;

        // Show/hide load more button
        const loadMoreBtn = document.querySelector('button[onclick="loadMoreResults()"]');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = end >= totalResults ? 'none' : 'block';
        }

    } catch (error) {
        console.error('Error searching books:', error);
        if (currentSearchParams.startIndex === 0) {
            resultsContainer.innerHTML = '<div class="col-12 text-center text-danger">Error searching books</div>';
        }
    } finally {
        loadingSpinner.classList.add('d-none');
    }
}

// Load more results
function loadMoreResults() {
    currentSearchParams.startIndex += 10;
    searchExternalBooks();
}

// Create book card for search results
function createBookCard(book) {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${book.image_url || 'https://via.placeholder.com/150x200'}" 
                         class="img-fluid rounded-start h-100 object-fit-cover" 
                         alt="${book.title}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${book.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
                        <p class="card-text small">${book.description || 'No description available'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="badge bg-primary me-1">${book.category || 'Uncategorized'}</span>
                                ${book.language ? `<span class="badge bg-secondary">${book.language}</span>` : ''}
                            </div>
                            <button class="btn btn-sm btn-primary" onclick="importBook(${JSON.stringify(book).replace(/"/g, '&quot;')})">
                                Import Book
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Import book from search results
async function importBook(bookData) {
    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });
        
        if (response.ok) {
            searchBookModal.hide();
            loadBooks();
            alert('Book imported successfully!');
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to import book');
        }
    } catch (error) {
        console.error('Error importing book:', error);
        alert('An error occurred while importing the book');
    }
}

// Initialize
checkAdminStatus(); 