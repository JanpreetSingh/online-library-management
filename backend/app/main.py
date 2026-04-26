from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, books

app = FastAPI(
    title="Online Library Management API",
    version="1.0.0",
    description="Backend API for the Online Library Management System",
)

# CORS — allow local dev + Vercel deploy
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add your Vercel URL here once deployed, e.g.:
    # "https://online-library-xyz.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(books.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "online-library-api"}
