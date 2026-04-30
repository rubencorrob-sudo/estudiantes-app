from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine, SessionLocal
import random

otp_store = {}

app = FastAPI()

# 🔥 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 CREAR TABLAS SOLO UNA VEZ
models.Base.metadata.create_all(bind=engine)

# 🔥 DEPENDENCIA DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================
# 🔐 AUTH
# ============================

@app.post("/auth/send-otp")
def send_otp(email: str):
    otp = str(random.randint(100000, 999999))

    otp_store[email] = otp  # 🔥 guardar en memoria

    print("OTP generado:", otp)

    return {
        "message": "OTP generado",
        "otp": otp
    }


@app.post("/auth/verify-otp")
def verify_otp(email: str, otp: str):

    print("====== DEBUG OTP ======")
    print("EMAIL:", email)
    print("OTP GUARDADO:", otp_store.get(email))
    print("OTP RECIBIDO:", otp)
    print("=======================")

    if email not in otp_store:
        raise HTTPException(status_code=400, detail="No se ha generado OTP")

    if otp_store[email] != otp:
        raise HTTPException(status_code=400, detail="OTP incorrecto")

    return {"message": "Login exitoso"}

# ============================
# 📚 STUDENTS
# ============================

@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    return db.query(models.Student).all()


@app.post("/students")
def create_student(nombre: str, edad: int, nota: int, db: Session = Depends(get_db)):
    student = models.Student(nombre=nombre, edad=edad, nota=nota)
    db.add(student)
    db.commit()
    return student


@app.put("/students/{id}")
def update_student(id: int, nombre: str, edad: int, nota: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).get(id)

    if not student:
        raise HTTPException(status_code=404)

    student.nombre = nombre
    student.edad = edad
    student.nota = nota
    db.commit()

    return student


@app.delete("/students/{id}")
def delete_student(id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).get(id)

    if not student:
        raise HTTPException(status_code=404)

    db.delete(student)
    db.commit()

    return {"message": "Eliminado"}