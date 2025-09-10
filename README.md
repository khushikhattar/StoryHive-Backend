# 📖 StoryHive

![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-003545?logo=security&logoColor=white)
![cookie-parser](https://img.shields.io/badge/Cookie--Parser-FFCA28?logo=cookie&logoColor=black)
![CORS](https://img.shields.io/badge/CORS-29B6F6?logo=security&logoColor=white)
![morgan](https://img.shields.io/badge/Morgan-000000?logo=npm&logoColor=white)

StoryHive is a **Blogging Platform** built with **Node.js, Express, MongoDB, and JWT Authentication**.  
It provides **secure user authentication, role-based access control, and full blog CRUD operations** with filtering, pagination, and token-based session management.

---

## 🚀 Features

- 🔐 **Authentication & Authorization**

  - Register, Login, Logout
  - JWT-based **Access & Refresh Tokens**
  - Role-based access (`user`, `admin`)
  - Token rotation with refresh tokens
  - Secure cookies (`httpOnly`, `sameSite`)

- 📝 **Blog Management**

  - Create, Update, Delete blogs
  - Pagination & Filtering (by keyword, tags, category, date)
  - Ownership check (only blog author can edit/delete)

- 👥 **User Management**

  - Admins can fetch all users & delete users
  - Password update & reset functionality

- 📊 **Logging**

  - Custom request logging with user ID tracking

- ⚙️ **Configurable**
  - Environment-based configs (`.env` file)
  - CORS enabled for frontend integration

---

## 📂 Project Structure

```
StoryHive/
│── config/ # CORS config
│── db/ # Database connection
│── middlewares/ # Auth, logging, role-based access
│── models/ # User & Blog models
│── routes/ # Auth, Blog, User routes
│── utils/ # Token generation helpers
│── app.js # Main Express app
│── .env # Environment variables
```

---

## 🔧 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (Access + Refresh Tokens)
- **Security**: bcrypt, cookie-parser, CORS
- **Logging**: morgan

---

## ⚙️ Installation & Setup

### 1. Clone Repo

```bash
git clone https://github.com/your-username/storyhive.git
cd storyhive
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create .env File

```bash
PORT=
URI=
APP_NAME=StoryHive
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=
```

### 4. Run Server

```bash
npm run dev   # if using nodemon
# OR
node app.js
```

- Server runs on 👉 http://localhost:3200

---

## 🔑 API Endpoints

- ## Auth Routes (/api/v1/auth)

| Method | Endpoint          | Description                    |
| ------ | ----------------- | ------------------------------ |
| POST   | `/register`       | Register new user              |
| POST   | `/login`          | Login & receive tokens         |
| POST   | `/logout`         | Logout & clear tokens          |
| POST   | `/refresh`        | Refresh access token           |
| PATCH  | `/forgetpassword` | Reset password (direct change) |
| PATCH  | `/updatepassword` | Update password                |

- ## User Routes (/api/v1/users)

| Method | Endpoint   | Description                    |
| ------ | ---------- | ------------------------------ |
| GET    | `/`        | Get all users (**admin only**) |
| DELETE | `/:id`     | Delete user (**admin only**)   |
| GET    | `/profile` | Get logged-in user profile     |

- ## Blog Routes (/api/v1/blogs)

| Method | Endpoint                        | Description                 |
| ------ | ------------------------------- | --------------------------- |
| POST   | `/`                             | Create blog (auth required) |
| GET    | `/`                             | Get all blogs (paginated)   |
| GET    | `/:id`                          | Get blog by ID              |
| PATCH  | `/:id`                          | Update blog (only owner)    |
| DELETE | `/:id`                          | Delete blog (only owner)    |
| GET    | `/filter?term=xyz`              | Search blogs                |
| GET    | `/filterbydate?date=YYYY-MM-DD` | Filter blogs by date        |

## 🔒 Security

- JWT Access Token expiry: 15m
- JWT Refresh Token expiry: 1d
- Tokens stored in HTTP-only cookies
- Passwords hashed with bcrypt

## 🧪 Testing

- Use Postman or Thunder Client:
- Register → Login → Copy cookies
- Test protected routes (/blogs, /users)
- Try refreshing token after expiry
- Logout to clear tokens

## 📌 Future Enhancements

- Email verification & password reset via email
- Rich text editor for blogs
- Image uploads (Cloudinary / S3)
- Docker containerization

## 👩‍💻 Author

Khushi Khattar
