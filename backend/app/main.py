from datetime import date, datetime, timedelta, timezone
import calendar
from typing import Optional
import os
import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from pydantic_settings import BaseSettings
from pwdlib import PasswordHash
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, create_engine, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

class Settings(BaseSettings):
    database_url: str = "sqlite:///./his_tribes.db"
    secret_key: str = "dev-secret-change-me"
    cors_origins: str = "http://localhost:5173"
    seed_leader_email: str = ""
    seed_leader_password: str = ""
    seed_leader_name: str = "Leader"
    class Config:
        env_file = ".env"
        extra = "ignore"
settings = Settings()

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
password_hash = PasswordHash.recommended()

class Base(DeclarativeBase): pass
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="youth")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ReadingRecord(Base):
    __tablename__ = "reading_records"
    __table_args__ = (UniqueConstraint("user_id", "reading_date", name="uq_user_reading_day"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    reading_date: Mapped[date] = mapped_column(Date, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class SoapEntry(Base):
    __tablename__ = "soap_entries"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    scripture: Mapped[str] = mapped_column(Text)
    observation: Mapped[str] = mapped_column(Text)
    application: Mapped[str] = mapped_column(Text)
    prayer: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class PrayerRequest(Base):
    __tablename__ = "prayer_requests"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text)
    anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class PrayerReaction(Base):
    __tablename__ = "prayer_reactions"
    __table_args__ = (UniqueConstraint("prayer_id", "user_id", name="uq_prayer_user"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    prayer_id: Mapped[int] = mapped_column(ForeignKey("prayer_requests.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class MonthlyGoal(Base):
    __tablename__ = "monthly_goals"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    target_days: Mapped[int] = mapped_column(Integer)
    deadline: Mapped[date] = mapped_column(Date)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

Base.metadata.create_all(engine)

def db():
    session = SessionLocal()
    try: yield session
    finally: session.close()

def token_for(user: User):
    payload = {"sub": str(user.id), "role": user.role, "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")

def current_user(db: Session = Depends(db)) -> User:
    from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
    # Dependency object is created once below; kept here to avoid global import noise.
    raise RuntimeError("security dependency not initialized")

from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
bearer = HTTPBearer(auto_error=False)
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(db)) -> User:
    if not credentials: raise HTTPException(401, "Authentication required")
    try: payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=["HS256"])
    except jwt.PyJWTError: raise HTTPException(401, "Invalid or expired token")
    user = db.get(User, int(payload["sub"])) if payload.get("sub") else None
    if not user: raise HTTPException(401, "User not found")
    return user

def leader_only(user: User = Depends(get_current_user)) -> User:
    if user.role != "leader": raise HTTPException(403, "Leader access required")
    return user

def streak_for(db: Session, user_id: int, today: date | None = None) -> int:
    today = today or date.today()
    rows = db.scalars(select(ReadingRecord.reading_date).where(ReadingRecord.user_id == user_id).order_by(ReadingRecord.reading_date.desc())).all()
    dates = set(rows)
    if today not in dates: today = today - timedelta(days=1)
    count = 0
    while today in dates:
        count += 1; today -= timedelta(days=1)
    return count

def month_stats(db: Session, user_id: int, today: date | None = None):
    today = today or date.today()
    start = today.replace(day=1)
    count = db.scalar(select(func.count(ReadingRecord.id)).where(ReadingRecord.user_id == user_id, ReadingRecord.reading_date >= start, ReadingRecord.reading_date <= today)) or 0
    return int(count)

class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str
    password: str = Field(min_length=6)
class LoginIn(BaseModel):
    email: str
    password: str
class UserOut(BaseModel):
    id: int; name: str; email: str; role: str
    model_config = ConfigDict(from_attributes=True)
class AuthOut(BaseModel): token: str; user: UserOut
class PrayerIn(BaseModel): text: str = Field(min_length=1, max_length=3000); anonymous: bool = False
class SoapIn(BaseModel):
    scripture: str = Field(min_length=1, max_length=3000)
    observation: str = Field(min_length=1, max_length=5000)
    application: str = Field(min_length=1, max_length=5000)
    prayer: str = Field(min_length=1, max_length=5000)
class GoalIn(BaseModel): title: str; target_days: int = Field(ge=1, le=31); deadline: date

app = FastAPI(title="his_tribes API", version="1.0.0")
origins = [x.strip() for x in settings.cors_origins.split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins or ["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health(): return {"status":"ok","service":"his_tribes-api"}

@app.post("/api/auth/signup", response_model=AuthOut)
def signup(body: SignupIn, db: Session = Depends(db)):
    email = body.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)): raise HTTPException(409, "Email already registered")
    user = User(name=body.name.strip(), email=email, password_hash=password_hash.hash(body.password), role="youth")
    db.add(user); db.commit(); db.refresh(user)
    return {"token": token_for(user), "user": user}

@app.post("/api/auth/login", response_model=AuthOut)
def login(body: LoginIn, db: Session = Depends(db)):
    user = db.scalar(select(User).where(User.email == body.email.strip().lower()))
    if not user or not password_hash.verify(body.password, user.password_hash): raise HTTPException(401, "Invalid email or password")
    return {"token": token_for(user), "user": user}

@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)): return user

@app.post("/api/reading/complete")
def complete_reading(user: User = Depends(get_current_user), db: Session = Depends(db)):
    today = date.today()
    record = db.scalar(select(ReadingRecord).where(ReadingRecord.user_id == user.id, ReadingRecord.reading_date == today))
    if not record:
        db.add(ReadingRecord(user_id=user.id, reading_date=today)); db.commit()
    return reading_stats(user, db)

@app.get("/api/reading/stats")
def reading_stats(user: User = Depends(get_current_user), db: Session = Depends(db)):
    today = date.today(); completed_today = bool(db.scalar(select(ReadingRecord.id).where(ReadingRecord.user_id == user.id, ReadingRecord.reading_date == today)))
    goal = db.scalar(select(MonthlyGoal).order_by(MonthlyGoal.id.desc()))
    return {"completed": completed_today, "readings": month_stats(db, user.id, today), "streak": streak_for(db, user.id, today), "goal": goal.target_days if goal else 21, "goal_title": goal.title if goal else "Monthly Bible Challenge", "deadline": goal.deadline.isoformat() if goal else None}

@app.get("/api/reading/history")
def reading_history(user: User = Depends(get_current_user), db: Session = Depends(db)):
    today = date.today(); start=today.replace(day=1)
    dates=db.scalars(select(ReadingRecord.reading_date).where(ReadingRecord.user_id==user.id, ReadingRecord.reading_date>=start, ReadingRecord.reading_date<=today).order_by(ReadingRecord.reading_date)).all()
    return {"dates":[d.isoformat() for d in dates], "readings":len(dates), "streak":streak_for(db,user.id,today)}

@app.post("/api/soap")
def create_soap(body: SoapIn, user: User = Depends(get_current_user), db: Session = Depends(db)):
    entry=SoapEntry(user_id=user.id, **body.model_dump()); db.add(entry); db.commit(); db.refresh(entry)
    return soap_out(entry,user)

def soap_out(e: SoapEntry, user: User):
    return {"id":e.id,"author":user.name,"leader":user.role=="leader","date":e.created_at.strftime("%B %-d") if os.name != "nt" else e.created_at.strftime("%B %#d"),"scripture":e.scripture,"observation":e.observation,"application":e.application,"prayer":e.prayer}

@app.get("/api/soap")
def list_soap(user: User = Depends(get_current_user), db: Session = Depends(db)):
    entries=db.scalars(select(SoapEntry).where(SoapEntry.user_id==user.id).order_by(SoapEntry.created_at.desc())).all()
    return [soap_out(e,user) for e in entries]

@app.get("/api/leader/soap")
def leader_soap(user: User = Depends(leader_only), db: Session = Depends(db)):
    entries=db.execute(select(SoapEntry,User).join(User,User.id==SoapEntry.user_id).order_by(SoapEntry.created_at.desc())).all()
    return [{**soap_out(e,u)} for e,u in entries]

@app.post("/api/prayers")
def create_prayer(body: PrayerIn, user: User = Depends(get_current_user), db: Session = Depends(db)):
    p=PrayerRequest(user_id=user.id,text=body.text.strip(),anonymous=body.anonymous); db.add(p); db.commit(); db.refresh(p)
    return prayer_out(p,user,user,db)

def prayer_out(p: PrayerRequest, author: User, viewer: User, db: Session):
    count=db.scalar(select(func.count(PrayerReaction.id)).where(PrayerReaction.prayer_id==p.id)) or 0
    return {"id":p.id,"author":"Anonymous" if p.anonymous else author.name,"leader":False if p.anonymous else author.role=="leader","text":p.text,"count":int(count),"mine":p.user_id==viewer.id,"anonymous":p.anonymous,"status":p.status}

@app.get("/api/prayers")
def list_prayers(user: User = Depends(get_current_user), db: Session = Depends(db)):
    rows=db.execute(select(PrayerRequest,User).join(User,User.id==PrayerRequest.user_id).order_by(PrayerRequest.created_at.desc())).all()
    return [prayer_out(p,u,user,db) for p,u in rows]

@app.post("/api/prayers/{prayer_id}/pray")
def pray(prayer_id:int, user:User=Depends(get_current_user), db:Session=Depends(db)):
    p=db.get(PrayerRequest,prayer_id)
    if not p: raise HTTPException(404,"Prayer request not found")
    existing=db.scalar(select(PrayerReaction).where(PrayerReaction.prayer_id==prayer_id,PrayerReaction.user_id==user.id))
    if existing: return {"prayed":True,"count":db.scalar(select(func.count(PrayerReaction.id)).where(PrayerReaction.prayer_id==prayer_id)) or 0}
    db.add(PrayerReaction(prayer_id=prayer_id,user_id=user.id)); db.commit()
    return {"prayed":True,"count":db.scalar(select(func.count(PrayerReaction.id)).where(PrayerReaction.prayer_id==prayer_id)) or 0}

@app.get("/api/scoreboard")
def scoreboard(user:User=Depends(get_current_user),db:Session=Depends(db)):
    users=db.scalars(select(User).order_by(User.name)).all(); today=date.today(); rows=[]
    for u in users:
        rows.append({"name":u.name,"days":month_stats(db,u.id,today),"streak":streak_for(db,u.id,today),"you":u.id==user.id,"leader":u.role=="leader"})
    return sorted(rows,key=lambda x:(-x["days"],-x["streak"],x["name"]))

@app.get("/api/leader/dashboard")
def leader_dashboard(user:User=Depends(leader_only),db:Session=Depends(db)):
    today=date.today(); users=db.scalars(select(User).order_by(User.name)).all(); goal=db.scalar(select(MonthlyGoal).order_by(MonthlyGoal.id.desc()))
    rows=[{"name":u.name,"days":month_stats(db,u.id,today),"streak":streak_for(db,u.id,today),"leader":u.role=="leader"} for u in users if u.role=="youth"]
    total=len(users); active= sum(1 for u in users if month_stats(db,u.id,today)>0)
    return {"youth":len([u for u in users if u.role=="youth"]),"total_reading_days":sum(r["days"] for r in rows),"community":round((active/total)*100) if total else 0,"goal":({"id":goal.id,"title":goal.title,"target_days":goal.target_days,"deadline":goal.deadline.isoformat()} if goal else {"title":"Monthly Bible Challenge","target_days":21,"deadline":today.replace(day=calendar.monthrange(today.year,today.month)[1]).isoformat()}),"rows":sorted(rows,key=lambda x:-x["days"])}

@app.put("/api/leader/monthly-goal")
def update_goal(body:GoalIn,user:User=Depends(leader_only),db:Session=Depends(db)):
    goal=db.scalar(select(MonthlyGoal).order_by(MonthlyGoal.id.desc()))
    if goal: goal.title=body.title; goal.target_days=body.target_days; goal.deadline=body.deadline
    else: goal=MonthlyGoal(**body.model_dump()); db.add(goal)
    db.commit(); db.refresh(goal); return goal

@app.patch("/api/leader/prayers/{prayer_id}")
def update_prayer_status(prayer_id:int, user:User=Depends(leader_only),db:Session=Depends(db)):
    p=db.get(PrayerRequest,prayer_id)
    if not p: raise HTTPException(404,"Prayer request not found")
    p.status="Answered" if p.status=="Active" else "Active"; db.commit(); return {"status":p.status}

@app.on_event("startup")
def seed():
    with SessionLocal() as db:
        if not db.scalar(select(MonthlyGoal)):
            today=date.today(); db.add(MonthlyGoal(title="Monthly Bible Challenge",target_days=21,deadline=today.replace(day=calendar.monthrange(today.year,today.month)[1])))
        if settings.seed_leader_email and settings.seed_leader_password:
            email=settings.seed_leader_email.strip().lower()
            leader=db.scalar(select(User).where(User.email==email))
            if not leader:
                db.add(User(name=settings.seed_leader_name,email=email,password_hash=password_hash.hash(settings.seed_leader_password),role="leader"))
            elif leader.role != "leader":
                leader.role="leader"
        db.commit()
