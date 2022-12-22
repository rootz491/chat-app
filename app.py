import os
import psycopg2
import psycopg2.pool
import re
import argon2
from flask import Flask, request, session, redirect, url_for, render_template
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv


# Import flask login
from flask_login import LoginManager, UserMixin

# Load the configuration file
load_dotenv('config.env')

# Set up the app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

# Set up the connection pool
pool = psycopg2.pool.SimpleConnectionPool(
    minconn=5,
    maxconn=10,
    host=os.getenv('POSTGRES_HOST'),
    port=os.getenv('POSTGRES_PORT'),
    dbname=os.getenv('POSTGRES_DB'),
    user=os.getenv('POSTGRES_USER'),
    password=os.getenv('POSTGRES_PASSWORD')
)

# Use environment variables to store secret key and database URL
app.secret_key = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://{user}:{password}@{host}:{port}/{dbname}'.format(
    host=os.getenv('POSTGRES_HOST'),
    port=os.getenv('POSTGRES_PORT'),
    dbname=os.getenv('POSTGRES_DB'),
    user=os.getenv('POSTGRES_USER'),
    password=os.getenv('POSTGRES_PASSWORD')
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Create a db object and initialize it
db = SQLAlchemy()
db.init_app(app)

# Define the User and Message models
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

    def set_password(self, password):
    # Hash the password using argon2
        self.password = argon2.hash(password)

    def verify_password(self, password):
        # Verify the password using argon2
        return argon2.verify(self.password, password)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('messages', lazy=True))
    message = db.Column(db.String(80), nullable=False)


with app.app_context():
    # Create the tables in the database
    db.create_all()


# Initialize the login manager
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    # Get a connection from the pool
    with pool.getconn() as conn:
        # Query the database for the user
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        if row is not None:
            # Create a user object
            user = User(row[0], row[1], row[2])
            return user
        else:
            # User not found
            return None

    # Return the connection to the pool
    pool.putconn(conn)


# Include favicon
@app.route('/favicon.ico')
def favicon():
    return favicon('static/favicon.ico')


# Create the routes
@app.route('/')
def index():
    return render_template('landing.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Get the form data
        username = request.form['username']
        password = request.form['password']

        # Validate the username
        if not username:
            return render_template('register.html', error='Username is required')
        if len(username) > 100:
            return render_template('register.html', error='Username cannot be more than 100 characters')
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return render_template('register.html', error='Username can only contain letters, numbers, and underscores')

        # Validate the password
        if not password:
            return render_template('register.html', error='Password is required')
        if len(password) < 8:
            return render_template('register.html', error='Password must be at least 8 characters')

        # Check if the username is already taken
        with pool.getconn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
            row = cursor.fetchone()
            if row is not None:
                return render_template('register.html', error='Username already taken')

            # Insert the new user into the database
            cursor.execute("INSERT INTO user (username, password) VALUES (%s, %s)", (username, password))
            conn.commit()

        # Return the connection to the pool
        pool.putconn(conn)

        # Redirect to the login page
        return redirect(url_for('login'))
    else:
        # Render the register template
        return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Get the form data
        username = request.form['username']
        password = request.form['password']

        # Validate the login
        with pool.getconn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
            row = cursor.fetchone()
            if row is None:
                return render_template('login.html', error='Invalid username or password')
            if row[2] != password:
                return render_template('login.html', error='Invalid username or password')

            # Create a user object
            user = User(row[0], row[1], row[2])

        # Return the connection to the pool
        pool.putconn(conn)

        # Log the user in
        login_user(user)

        # Redirect to the messages page
        return redirect(url_for('messages'))
    else:
        # Render the login template
        return render_template('login.html')

@app.route('/messages', methods=['GET', 'POST'])
def messages():
    if request.method == 'POST':
        # Get the form data
        message = request.form['message']

        # Validate the message
        if not message:
            return render_template('messages.html', error='Message is required')
        if len(message) > 80:
            return render_template('messages.html', error='Message cannot be more than 80 characters')

        # Insert the new message into the database
        with pool.getconn() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO messages (user_id, message) VALUES (%s, %s)", (current_user.id, message))
            conn.commit()

        # Return the connection to the pool
        pool.putconn(conn)

        # Redirect to the same page to refresh the list of messages
        return redirect(url_for('messages'))
    else:
        # Query the database for the list of messages
        with pool.getconn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT user.username, messages.message FROM messages INNER JOIN user ON messages.user_id = user.id ORDER BY messages.id DESC")
            rows = cursor.fetchall()

        # Return the connection to the pool
        pool.putconn(conn)

        # Render the messages template
        return render_template('messages.html', messages=rows)

@app.route('/logout')
def logout():
    # Logout the user
    session.pop('user_id', None)

    # Redirect the user to the index page
    return redirect(url_for('index'))

# Start the app
if __name__ == '__main__':
    app.run()