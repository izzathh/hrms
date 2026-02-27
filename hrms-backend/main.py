from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime
import os
from dotenv import load_dotenv
import re

load_dotenv()

app = FastAPI(title="HRMS Lite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "hrms_lite")

client = None
db = None

@app.on_event("startup")
async def startup_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    await db.employees.create_index("employee_id", unique=True)
    await db.employees.create_index("email", unique=True)

@app.on_event("shutdown")
async def shutdown_db():
    client.close()

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id(cls, v):
        if not v.strip():
            raise ValueError("Employee ID cannot be empty")
        return v.strip()

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v.strip().lower()

    @field_validator("department")
    @classmethod
    def validate_department(cls, v):
        if not v.strip():
            raise ValueError("Department cannot be empty")
        return v.strip()

class AttendanceCreate(BaseModel):
    employee_id: str
    date: str
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in ["Present", "Absent"]:
            raise ValueError("Status must be 'Present' or 'Absent'")
        return v

    @field_validator("date")
    @classmethod
    def validate_date(cls, v):
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v

def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@app.get("/api/employees", response_model=List[dict])
async def get_employees():
    employees = []
    async for emp in db.employees.find():
        employees.append(serialize_doc(emp))
    return employees

@app.post("/api/employees", status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    existing = await db.employees.find_one({"employee_id": employee.employee_id})
    if existing:
        raise HTTPException(status_code=400, detail=f"Employee ID '{employee.employee_id}' already exists")

    existing_email = await db.employees.find_one({"email": employee.email})
    if existing_email:
        raise HTTPException(status_code=400, detail=f"Email '{employee.email}' already registered")

    doc = employee.model_dump()
    doc["created_at"] = datetime.utcnow().isoformat()
    result = await db.employees.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@app.delete("/api/employees/{employee_id}")
async def delete_employee(employee_id: str):
    result = await db.employees.delete_one({"employee_id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    await db.attendance.delete_many({"employee_id": employee_id})
    return {"message": "Employee and attendance records deleted successfully"}

@app.get("/api/attendance/{employee_id}")
async def get_attendance(employee_id: str):
    emp = await db.employees.find_one({"employee_id": employee_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    records = []
    async for record in db.attendance.find({"employee_id": employee_id}).sort("date", -1):
        records.append(serialize_doc(record))

    total_present = sum(1 for r in records if r["status"] == "Present")
    return {
        "employee": serialize_doc(emp),
        "records": records,
        "total_present": total_present,
        "total_records": len(records)
    }

@app.post("/api/attendance", status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    emp = await db.employees.find_one({"employee_id": attendance.employee_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = await db.attendance.find_one({
        "employee_id": attendance.employee_id,
        "date": attendance.date
    })

    if existing:
        await db.attendance.update_one(
            {"employee_id": attendance.employee_id, "date": attendance.date},
            {"$set": {"status": attendance.status}}
        )
        updated = await db.attendance.find_one({
            "employee_id": attendance.employee_id,
            "date": attendance.date
        })
        return serialize_doc(updated)

    doc = attendance.model_dump()
    doc["marked_at"] = datetime.utcnow().isoformat()
    result = await db.attendance.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@app.get("/api/attendance")
async def get_all_attendance(date: Optional[str] = None):
    query = {}
    if date:
        query["date"] = date
    records = []
    async for record in db.attendance.find(query).sort("date", -1):
        records.append(serialize_doc(record))
    return records

@app.get("/api/dashboard")
async def get_dashboard():
    total_employees = await db.employees.count_documents({})
    today = datetime.utcnow().strftime("%Y-%m-%d")
    present_today = await db.attendance.count_documents({"date": today, "status": "Present"})
    absent_today = await db.attendance.count_documents({"date": today, "status": "Absent"})

    departments = []
    pipeline = [{"$group": {"_id": "$department", "count": {"$sum": 1}}}]
    async for doc in db.employees.aggregate(pipeline):
        departments.append({"department": doc["_id"], "count": doc["count"]})

    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "not_marked": total_employees - present_today - absent_today,
        "departments": departments
    }

@app.get("/")
async def root():
    return {"message": "HRMS Lite API is running", "version": "1.0.0"}