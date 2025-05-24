# BookBuddy - Interactive Online Bookstore

BookBuddy is a dynamic, multi-role online bookstore that allows users to browse, filter, and review books, while enabling admins to manage the bookstore's content.

## Features

### User Features
- User registration and authentication
- Browse and search books
- Filter books by categories/genres
- View detailed book information
- Submit and view book reviews

### Admin Features
- Admin authentication
- Add, edit, and delete books
- Manage user reviews
- Monitor user activities

## Technology Stack

### Frontend
- HTML5/CSS3
- JavaScript
- AJAX for dynamic content loading

### Backend
- Python
- Flask (RESTful API)
- MySQL Database

### Data Transfer
- JSON/XML for client-server communication
- Integration with Google Books API/Open Library API

## Project Structure
```
BookBuddy/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models/
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── templates/
├── requirements.txt
└── README.md
```

## Setup Instructions

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   - Create a `.env` file
   - Add necessary configuration variables

5. Initialize the database:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

6. Run the application:
   ```bash
   flask run
   ```

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

### Book Endpoints
- GET /api/books - Get all books
- GET /api/books/<id> - Get book details
- POST /api/books - Add new book (admin only)
- PUT /api/books/<id> - Update book (admin only)
- DELETE /api/books/<id> - Delete book (admin only)

### Review Endpoints
- GET /api/books/<id>/reviews - Get book reviews
- POST /api/books/<id>/reviews - Add review
- DELETE /api/reviews/<id> - Delete review

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 