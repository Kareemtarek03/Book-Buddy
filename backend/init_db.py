from app import app, db, User, Book
from werkzeug.security import generate_password_hash

def init_db():
    with app.app_context():
        # Drop all tables and recreate them
        db.drop_all()
        print("Dropped all existing tables")
        
        db.create_all()
        print("Created database tables (MySQL)")
        
        # Create admin user
        admin = User(
            username='admin',
            email='admin@example.com',
            password_hash=generate_password_hash('admin123'),
            is_admin=True
        )
        db.session.add(admin)
        print("Created admin user")
        
        # Add sample books
        sample_books = [
            {
                'title': 'The Great Gatsby',
                'author': 'F. Scott Fitzgerald',
                'description': 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
                'category': 'Fiction',
                'image_url': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
                'published_date': '1925-04-10',
                'publisher': 'Scribner',
                'page_count': 180,
                'language': 'en',
                'isbn': '9780743273565',
                'average_rating': 4.5,
                'ratings_count': 1000
            },
            {
                'title': 'To Kill a Mockingbird',
                'author': 'Harper Lee',
                'description': 'The story of racial injustice and the loss of innocence in the American South.',
                'category': 'Fiction',
                'image_url': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
                'published_date': '1960-07-11',
                'publisher': 'Grand Central Publishing',
                'page_count': 281,
                'language': 'en',
                'isbn': '9780446310789',
                'average_rating': 4.8,
                'ratings_count': 2000
            },
            {
                'title': 'The Art of Programming',
                'author': 'Donald Knuth',
                'description': 'A comprehensive guide to computer programming.',
                'category': 'Technology',
                'image_url': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
                'published_date': '1968-01-01',
                'publisher': 'Addison-Wesley',
                'page_count': 672,
                'language': 'en',
                'isbn': '9780201896831',
                'average_rating': 4.9,
                'ratings_count': 500
            },
            {
                'title': 'A Brief History of Time',
                'author': 'Stephen Hawking',
                'description': 'A landmark volume in science writing by one of the great minds of our time.',
                'category': 'Science',
                'image_url': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
                'published_date': '1988-04-01',
                'publisher': 'Bantam',
                'page_count': 256,
                'language': 'en',
                'isbn': '9780553380163',
                'average_rating': 4.7,
                'ratings_count': 1500
            }
        ]
        
        for book_data in sample_books:
            book = Book(**book_data)
            db.session.add(book)
            print(f"Added book: {book.title}")
        
        try:
            db.session.commit()
            print("\nDatabase initialized successfully!")
            print("\nAdmin credentials:")
            print("Username: admin")
            print("Password: admin123")
        except Exception as e:
            db.session.rollback()
            print(f"Error initializing database: {str(e)}")

if __name__ == '__main__':
    init_db() 