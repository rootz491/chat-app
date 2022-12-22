import os
import psycopg2
import psycopg2.pool
import re
import argon2
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask import Flask

# Import flask login
from flask_login import LoginManager, UserMixin, login_required, current_user

# Load the configuration file
load_dotenv('config.env')

# Set up the app
app = Flask(__name__)

# Create a db object and initialize it
db = SQLAlchemy()
db.init_app(app)

# Define the User and Message models
class User(db.Model, UserMixin):
    __tablename__ = 'users'  # DB table if doesnt exist
    __table_args__ = {'extend_existing': True}  # This will create the table if it doesn't exist

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
    __tablename__ = 'messages'  # DB TABLE
    __table_args__ = {'extend_existing': True}  # This will create the table if it doesn't exist

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('messages', lazy=True))
    message = db.Column(db.String(80), nullable=False)

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

    # Create the tables in the database, if they don't already exist
with app.app_context():
        db.create_all()