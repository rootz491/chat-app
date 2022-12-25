import os
import ssl
from typing import Callable
import argon2
import requests
import asyncio
import uvicorn
import tortoise
import psycopg2
import psycopg2.pool
import psycopg2.extras
from fastapi import FastAPI, Depends, HTTPException, Request, Response, Security, templating
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.templating import Jinja2Templates
from fastapi_login import LoginManager
from fastapi_limiter import FastAPILimiter
from flask import url_for
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from flask_login import UserMixin
from flask_dance.consumer import oauth_authorized
from flask_dance.contrib.google import make_google_blueprint
from flask_limiter.util import get_remote_address
from httplib2 import Credentials
from pydantic import BaseModel, EmailStr
from tortoise import Tortoise
from tortoise.models import Model
from tortoise.fields import Field
from google_auth_oauthlib.flow import Flow
from dotenv import load_dotenv
from tortoise.models import Model
from fastapi.security.api_key import APIKey
import redis.asyncio as redis

# Load ENV FILE
load_dotenv('config.env')

# Environment variables to store secret key and database URL

database_uri = 'postgresql://{user}:{password}@{host}:{port}/{dbname}'.format(
host=os.getenv('POSTGRES_HOST'),
port=os.getenv('POSTGRES_PORT'),
dbname=os.getenv('POSTGRES_DB'),
user=os.getenv('POSTGRES_USER'),
password=os.getenv('POSTGRES_PASSWORD')
)


# Client & Secret ID

CLIENT_ID = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')


# Create application

app = FastAPI()
limiter = FastAPILimiter()
security = OAuth2PasswordBearer(tokenUrl="/login")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Limiter
@app.on_event("startup")
async def startup():
    redis = redis.from_url("redis://localhost", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis)

# Login Algorithm
algorithm = os.getenv('ALGORITHM_SETTING')

# Set up FastAPI Login

login = LoginManager(secret="breadforever", token_url="/login")
templates = Jinja2Templates(directory="templates")

# Tortoise Async Function
async def main():
    # Initialize Tortoise-ORM
    await tortoise.init(db_url=database_uri, modules={'models': ['app.models']})
    await Tortoise.generate_schemas()
    await asyncio.sleep(0)

asyncio.create_task(main())

# Define a function to extract the credentials from the request
def get_credentials(token: str = Security(OAuth2PasswordBearer)):
    # Check if the token is valid and retrieve the associated credentials
    # You can implement this check by calling your OAuth provider's API and verifying the token
    # If the token is invalid, you can raise an HTTPException
    return Credentials.from_authorized_user_info(info=token)
    

# Define login and logout routes
@app.get("/login", dependencies=[Depends(RateLimiter(times=2, seconds=5))])
async def login_route(request: Request, authorization: str = Security(oauth2_scheme)):
    redirect_uri = request.url_for("auth")
    return RedirectResponse(redirect_uri)

@app.get("/logout", dependencies=[Depends(RateLimiter(times=2, seconds=5))])
async def logout_route(request: Request, user=Security(login.get_current_user, scopes=["logged_in"])):
    login.logout_user(request)
    return RedirectResponse(url="/")


# Define the authorization route
@app.get("/auth", dependencies=[Depends(RateLimiter(times=2, seconds=5))])
async def auth_route(request: Request, credentials: OAuth2PasswordBearer = Depends(get_credentials)):
    # Get the user's profile using the access token provided in the request
    userinfo = requests.get("https://www.googleapis.com/oauth2/v1/userinfo", auth=credentials).json()

    # Get or create the user
    user = await User.get_or_create(email=userinfo["email"])
    user.name = userinfo["name"]
    await user.save()

    # Log in the user
    login.log_user_in(request, user)

    # Redirect the user to the main page
    return RedirectResponse(url="/")


# Set up connection pool
pool = psycopg2.pool.SimpleConnectionPool(
minconn=10,
maxconn=20,
host=os.getenv('POSTGRES_HOST'),
port=os.getenv('POSTGRES_PORT'),
dbname=os.getenv('POSTGRES_DB'),
user=os.getenv('POSTGRES_USER'),
password=os.getenv('POSTGRES_PASSWORD'),
cursor_factory=psycopg2.extras.DictCursor
)

# Use a with statement to automatically close the cursor and connection when the block of code finishes execution
with pool.getconn() as conn:
    cursor = conn.cursor()
# Execute your database queries here
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()

# Process the results of the query here
# Do more here later

#Return the connection to the pool
pool.putconn(conn)




# Use the Column attribute to define a model field
class Base(BaseModel):
    id = Field(int, primary_key=True)


# Define USER Model
class User(Model):
    id = Field(int, pk=True)
    email = Field(str, index=True)
    name = Field(str)
    password = Field(str)
    salt = Field(str)
    api_key = Field(str)
    tokens = Field(str)


# Define the model for the user login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Define the model for user creation
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


#Define the model for the user update
class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    password: str


#Define the model for the user update password
class UserUpdatePassword(BaseModel):
    old_password: str
    new_password: str


#Define the route for user login
@app.post("/login", dependencies=[Depends(RateLimiter(times=2, seconds=5))])
async def login_route(request: Request, email: EmailStr, password: str):
    # Get the user
    user = await User.get(email=email)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Check the password
    if not argon2.argon2_verify(user.password, password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # Log in the user
    login.log_user_in(request, user)

    # Redirect the user to the main page
    return RedirectResponse(url="/")



# Define the user API key route
@app.post("/api_key")
async def api_key_route(request: Request, user=Security(login.get_current_user, scopes=["logged_in"])):
    # Create a new API key
    api_key = APIKey(user_id=user.id)
    await api_key.save()

    # Redirect the user to the main page
    return RedirectResponse(url="/")



#Set up the route for the home page
@app.get("/")
async def main_route(request: Request, user=Security(login.get_current_user, scopes=["logged_in"])):
    # Render the main template
    return templates.TemplateResponse("index.html", {
        "request": request,
        "user": user,
    })



#Define the route for user creation
@app.post("/users")
async def create_user(user_data: UserCreate):
# Check if the user already exists
    user = User.query.filter_by(email=user_data.email).first()
    if user is not None:
        raise HTTPException(status_code=409, detail="Email already exists")
        # Hash the password
    hashed_password = argon2.hash(user_data.password)
    # Create the user
    user = User(email=user_data.email, password=hashed_password, name=user_data.name)
    await Tortoise.get_orm().add(user)
    await Tortoise.get_orm().commit()
    return {"id": user.id, "email": user.email}



#Define the route for getting the current user
@app.get("/user")
def read_user(
    user: User = Security(login.get_current_user, scopes=["logged_in"]),):
    return {"id": user.id, "email": user.email, "name": user.name}



#Define the route for updating the current user
@app.put("/user")
async def update_user(
    user_data: UserUpdate,
    user: User = Security(login.get_current_user, scopes=["logged_in"]),):



# Update the user's name
    if user_data.name is not None:
        user.name = user_data.name
        await Tortoise.get_orm().commit()
    return {"id": user.id, "email": user.email, "name": user.name}



#Define the route for updating the current user's password
@app.put("/user/password")
async def update_user_password(
    password_data: UserUpdatePassword,
    user: User = Security(login.get_current_user, scopes=["logged_in"]),):



# Check the old password
    if not argon2.verify(password_data.old_password, user.password):
        return Response(status_code=401, detail="Incorrect old password")



# Hash the new password
    hashed_password = argon2.hash(password_data.new_password)



# Update the user's password
    user.password = hashed_password
    await Tortoise.get_orm().commit()



#Define the route for deleting the current user
@app.delete("/user")
async def delete_user(user: User = Security(login.get_current_user, scopes=["logged_in"]),):
    await Tortoise.get_orm().delete(user)
    await Tortoise.get_orm().commit()
    return {"message": "Success"}



#Define the route for getting the user list
@app.get("/users")
def read_users(skip: int = 0, limit: int = 100):
    users = User.query.offset(skip).limit(limit).all()
    return [{"id": user.id, "email": user.email, "name": user.name} for user in users]



#Define the route for getting a single user
@app.get("/users/{user_id}")
def read_user(user_id: int):
    user = User.query.filter_by(id=user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email, "name": user.name}



#Set up the route for logging out
@app.get("/logout")
def logout():
    login.logout_user()
    return {"message": "Success"}



#Set up the route for the home page
@app.get("/")
@templating.template("home.html")
def home(request: Request):
    if login.is_logged_in():
        return {"user_email": login.current_user.email}
    else:
        return {}



#Set up the error handler for 401 Unauthorized
@app.exception_handler(401)
def unauthorized(request: Request, exc: Exception):
    return RedirectResponse(url_for("google.login"))

#Set up the error handler for 404 Not Found
@app.exception_handler(404)
def not_found(request: Request, exc: Exception):
    return {"error": "Not found"}

#Set up the error handler for 422 Unprocessable Entity
@app.exception_handler(422)
def unprocessable_entity(request: Request, exc: Exception):
    return {"error": str(exc)}

#Set up the error handler for 500 Internal Server Error
@app.exception_handler(500)
def internal_server_error(request: Request, exc: Exception):
    return {"error": "Internal server error"}

# Start the ASGI Server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")