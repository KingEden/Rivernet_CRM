import os
import io
import datetime
import uuid
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status, Query, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
import hashlib
import secrets

# Standard Python imports (no heavy top-level data libraries required)

try:
    from backend.database import get_db, Base, engine, SessionLocal
    from backend.models import User, Lead, Settings, ReportHistory, MeetingHistory
    from backend.scrapers import perform_website_audit, query_google_places, generate_mock_leads, scrape_real_openstreetmap_leads
    from backend.ai_service import (
        calculate_lead_score, 
        generate_mock_ai_insights, 
        generate_real_ai_insights,
        generate_prospect_report,
        generate_meeting_brief,
        compute_similarity_leads,
        calculate_extended_scores
    )
    from backend.migrations import apply_migrations
except ImportError:
    from database import get_db, Base, engine, SessionLocal
    from models import User, Lead, Settings, ReportHistory, MeetingHistory
    from scrapers import perform_website_audit, query_google_places, generate_mock_leads, scrape_real_openstreetmap_leads
    from ai_service import (
        calculate_lead_score, 
        generate_mock_ai_insights, 
        generate_real_ai_insights,
        generate_prospect_report,
        generate_meeting_brief,
        compute_similarity_leads,
        calculate_extended_scores
    )
    from migrations import apply_migrations

# Initialize Database tables safely
try:
    Base.metadata.create_all(bind=engine)
    apply_migrations()
except Exception as e:
    print(f"Startup DB migration warning: {e}")

app = FastAPI(title="Rivernet Prospector Backend")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend host
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "rivernet_super_secret_signing_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 hours

# Auth Helpers
def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(8)
    key = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000
    )
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, key_hex = hashed_password.split("$")
        key = hashlib.pbkdf2_hmac(
            'sha256', 
            plain_password.encode('utf-8'), 
            salt.encode('utf-8'), 
            100000
        )
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False

# Pre-seed default user if database is fresh
try:
    db_session = SessionLocal()
    try:
        default_email = "agency@rivernet.io"
        db_user = db_session.query(User).filter(User.email == default_email).first()
        if not db_user:
            hashed_pwd = get_password_hash("rivernet2026")
            default_user = User(email=default_email, hashed_password=hashed_pwd)
            db_session.add(default_user)
            db_session.commit()
    finally:
        db_session.close()
except Exception as e:
    print(f"Startup user seeding warning: {e}")

# Pydantic Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SettingsUpdate(BaseModel):
    google_maps_api_key: Optional[str] = ""
    openai_api_key: Optional[str] = ""
    openai_api_base: Optional[str] = "https://api.openai.com/v1"
    openai_model: Optional[str] = "gpt-4o-mini"
    weight_no_website: Optional[int] = 40
    weight_poor_website: Optional[int] = 20
    weight_poor_seo: Optional[int] = 10
    weight_weak_social: Optional[int] = 15
    weight_low_reviews: Optional[int] = 10
    weight_outdated_branding: Optional[int] = 5
    tier1_setup_price: Optional[int] = 3500
    tier1_monthly_retainer: Optional[int] = 1500
    tier2_setup_price: Optional[int] = 2200
    tier2_monthly_retainer: Optional[int] = 1200
    tier3_setup_price: Optional[int] = 1200
    tier3_monthly_retainer: Optional[int] = 800
    tier4_setup_price: Optional[int] = 500
    tier4_monthly_retainer: Optional[int] = 500

class SearchRequest(BaseModel):
    country: str
    city: str
    industry: str
    category: Optional[str] = ""
    metro_expansion: Optional[bool] = False

class CRMUpdate(BaseModel):
    crm_status: Optional[str] = None
    crm_notes: Optional[str] = None
    reminder_date: Optional[str] = None # ISO format string
    setup_price: Optional[int] = None
    suggested_monthly_budget: Optional[int] = None
    recommended_website_package: Optional[str] = None
    estimated_services: Optional[List[str]] = None
    lead_score: Optional[int] = None
    lead_status: Optional[str] = None

class BulkCRMUpdate(BaseModel):
    lead_ids: List[int]
    crm_status: str

class BulkDeleteRequest(BaseModel):
    lead_ids: List[int]

# Hashing helpers defined above

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_email(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return "agency@rivernet.io"
    try:
        parts = auth_header.split(" ")
        if len(parts) < 2:
            return "agency@rivernet.io"
        token = parts[1]
        if token == "demo_jwt_token_rivernet":
            return "agency@rivernet.io"
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token details")
        return email
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

def lead_to_dict(lead: Lead) -> dict:
    if not lead:
        return {}
    res = {}
    for col in lead.__table__.columns:
        val = getattr(lead, col.name)
        if isinstance(val, (datetime.datetime, datetime.date)):
            val = val.isoformat()
        res[col.name] = val
    return res

# Ensure global settings exist
def get_system_settings(db: Session) -> Settings:
    settings = db.query(Settings).first()
    if not settings:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

# Authentication Endpoints
@app.post("/api/auth/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
def login(user_data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Settings Endpoints
@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = get_system_settings(db)
    return settings

@app.post("/api/settings")
def update_settings(settings_data: SettingsUpdate, db: Session = Depends(get_db)):
    settings = get_system_settings(db)
    for key, value in settings_data.dict().items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings

# Lead Search and Discovery Endpoint
@app.post("/api/leads/search")
async def search_leads(search_req: SearchRequest, db: Session = Depends(get_db)):
    settings = get_system_settings(db)
    query = f"{search_req.industry} in {search_req.city}, {search_req.country}"
    
    # 1. Discover raw business profiles
    if settings.google_maps_api_key:
        discovered_leads = query_google_places(query, settings.google_maps_api_key)
    else:
        # First try real OpenStreetMap scraper for 100% real business places
        real_osm = scrape_real_openstreetmap_leads(
            search_req.city, search_req.country, search_req.industry, search_req.category
        )
        discovered_leads = real_osm
        if len(discovered_leads) < 25:
            # Supplement with high-density mock generator & metro satellite expansion
            extra_leads = generate_mock_leads(
                search_req.city, search_req.country, search_req.industry, search_req.category, search_req.metro_expansion
            )
            discovered_leads.extend(extra_leads)
        
    saved_lead_ids = []
    
    # 2. Audit and Score each business
    for item in discovered_leads:
        # Check duplicate
        exists = db.query(Lead).filter(Lead.name == item["name"], Lead.address == item["address"]).first()
        if exists:
            saved_lead_ids.append(exists.id)
            continue
            
        # Website audit
        audit_data = {}
        if item.get("website_url"):
            # Real scraper
            if settings.google_maps_api_key:
                audit_data = perform_website_audit(item["website_url"])
            else:
                # Use pre-filled mockup scraper stats from generate_mock_leads
                audit_data = {
                    k: item[k] for k in [
                        "has_website", "mobile_friendly", "load_speed_score", "has_ssl", 
                        "has_broken_pages", "design_score", "has_seo_metadata", "has_contact_form", 
                        "has_analytics", "website_age_years", "accessibility_score",
                        "has_facebook", "has_instagram", "social_active", "google_optimized",
                        "has_blog", "has_seo", "has_google_ads_pixel", "has_meta_pixel", "has_newsletter"
                    ]
                }
        else:
            # No website parameters
            audit_data = {
                "has_website": False,
                "mobile_friendly": False,
                "load_speed_score": 0,
                "has_ssl": False,
                "has_broken_pages": False,
                "design_score": 0,
                "has_seo_metadata": False,
                "has_contact_form": False,
                "has_analytics": False,
                "website_age_years": 0,
                "accessibility_score": 0,
                "has_facebook": item.get("facebook_url") is not None,
                "has_instagram": item.get("instagram_url") is not None,
                "social_active": False,
                "google_optimized": False,
                "has_blog": False,
                "has_seo": False,
                "has_google_ads_pixel": False,
                "has_meta_pixel": False,
                "has_newsletter": False
            }

        # Scoring weights
        weights_dict = {
            "weight_no_website": settings.weight_no_website,
            "weight_poor_website": settings.weight_poor_website,
            "weight_poor_seo": settings.weight_poor_seo,
            "weight_weak_social": settings.weight_weak_social,
            "weight_low_reviews": settings.weight_low_reviews,
            "weight_outdated_branding": settings.weight_outdated_branding
        }
        
        scoring = calculate_lead_score(
            {**item, **audit_data},
            weights_dict
        )
        
        # Merge basic data + audit data
        full_lead_dict = {**item, **audit_data}
        
        # AI Insights and Outreach text
        if settings.openai_api_key:
            ai_data = await generate_real_ai_insights(
                full_lead_dict, 
                settings.openai_api_key, 
                settings.openai_api_base, 
                settings.openai_model
            )
        else:
            ai_data = generate_mock_ai_insights(full_lead_dict)
            
        full_lead_dict.update(ai_data)
        
        # Create SQLAlchemy instance
        new_lead = Lead(
            name=full_lead_dict.get("name"),
            address=full_lead_dict.get("address"),
            phone=full_lead_dict.get("phone"),
            email=full_lead_dict.get("email"),
            maps_url=full_lead_dict.get("maps_url"),
            category=search_req.category or search_req.industry or full_lead_dict.get("category"),
            rating=full_lead_dict.get("rating"),
            reviews_count=full_lead_dict.get("reviews_count"),
            website_url=full_lead_dict.get("website_url"),
            facebook_url=full_lead_dict.get("facebook_url"),
            instagram_url=full_lead_dict.get("instagram_url"),
            linkedin_url=full_lead_dict.get("linkedin_url"),
            business_size=full_lead_dict.get("business_size"),
            recently_opened=full_lead_dict.get("recently_opened", False),
            
            # Audit Info
            has_website=full_lead_dict.get("has_website"),
            mobile_friendly=full_lead_dict.get("mobile_friendly"),
            load_speed_score=full_lead_dict.get("load_speed_score"),
            has_ssl=full_lead_dict.get("has_ssl"),
            has_broken_pages=full_lead_dict.get("has_broken_pages"),
            design_score=full_lead_dict.get("design_score"),
            has_seo_metadata=full_lead_dict.get("has_seo_metadata"),
            has_contact_form=full_lead_dict.get("has_contact_form"),
            has_analytics=full_lead_dict.get("has_analytics"),
            website_age_years=full_lead_dict.get("website_age_years"),
            accessibility_score=full_lead_dict.get("accessibility_score"),
            
            # Marketing
            has_facebook=full_lead_dict.get("has_facebook"),
            has_instagram=full_lead_dict.get("has_instagram"),
            social_active=full_lead_dict.get("social_active"),
            google_optimized=full_lead_dict.get("google_optimized"),
            has_blog=full_lead_dict.get("has_blog"),
            has_seo=full_lead_dict.get("has_seo"),
            has_google_ads_pixel=full_lead_dict.get("has_google_ads_pixel"),
            has_meta_pixel=full_lead_dict.get("has_meta_pixel"),
            has_newsletter=full_lead_dict.get("has_newsletter"),
            
            # Score
            lead_score=scoring["score"],
            lead_status=scoring["status"],
            
            # AI Insights
            website_analysis_summary=full_lead_dict.get("website_analysis_summary"),
            marketing_opp_summary=full_lead_dict.get("marketing_opp_summary"),
            prospect_rationale=full_lead_dict.get("prospect_rationale"),
            estimated_services=full_lead_dict.get("estimated_services"),
            suggested_monthly_budget=full_lead_dict.get("suggested_monthly_budget"),
            recommended_website_package=full_lead_dict.get("recommended_website_package"),
            conversion_probability=full_lead_dict.get("conversion_probability"),
            
            # Outreach Drafts
            cold_email_draft=full_lead_dict.get("cold_email_draft"),
            cold_call_talking_points=full_lead_dict.get("cold_call_talking_points"),
            linkedin_message=full_lead_dict.get("linkedin_message"),
            follow_up_sequence=full_lead_dict.get("follow_up_sequence"),
            icebreaker=full_lead_dict.get("icebreaker"),
            
            # CRM
            crm_status="NEW",
            crm_notes=""
        )
        
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)
        saved_lead_ids.append(new_lead.id)
        
    if not saved_lead_ids:
        return []
    leads = db.query(Lead).filter(Lead.id.in_(saved_lead_ids)).order_by(Lead.lead_score.desc()).all()
    return [lead_to_dict(l) for l in leads]

# Retrieve Leads Endpoints
@app.get("/api/leads")
def get_leads(
    db: Session = Depends(get_db),
    crm_status: Optional[str] = Query(None),
    lead_status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    has_website: Optional[bool] = Query(None),
    min_rating: Optional[float] = Query(None),
    min_score: Optional[int] = Query(None),
    search_query: Optional[str] = Query(None)
):
    query = db.query(Lead)
    
    if crm_status:
        query = query.filter(Lead.crm_status == crm_status)
    if lead_status:
        query = query.filter(Lead.lead_status == lead_status)
    if category:
        query = query.filter(Lead.category == category)
    if has_website is not None:
        query = query.filter(Lead.has_website == has_website)
    if min_rating is not None:
        query = query.filter(Lead.rating >= min_rating)
    if min_score is not None:
        query = query.filter(Lead.lead_score >= min_score)
    if search_query:
        query = query.filter(Lead.name.ilike(f"%{search_query}%") | Lead.address.ilike(f"%{search_query}%"))
        
    # Return sorted by score descending by default
    leads = query.order_by(Lead.lead_score.desc()).all()
    return [lead_to_dict(l) for l in leads]

@app.post("/api/leads/bulk-crm")
def bulk_update_crm(req: BulkCRMUpdate, db: Session = Depends(get_db)):
    if not req.lead_ids:
        return {"updated": 0}
    db.query(Lead).filter(Lead.id.in_(req.lead_ids)).update(
        {Lead.crm_status: req.crm_status},
        synchronize_session=False
    )
    db.commit()
    return {"updated": len(req.lead_ids), "crm_status": req.crm_status}

@app.post("/api/leads/bulk-delete")
def bulk_delete_leads(req: BulkDeleteRequest, db: Session = Depends(get_db)):
    if not req.lead_ids:
        return {"deleted": 0}
    db.query(Lead).filter(Lead.id.in_(req.lead_ids)).delete(synchronize_session=False)
    db.commit()
    return {"deleted": len(req.lead_ids)}

@app.get("/api/export/leads")
def export_leads(
    format: str = Query("csv"),
    crm_status: Optional[str] = Query(None),
    lead_status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Lead)
    if crm_status:
        query = query.filter(Lead.crm_status == crm_status)
    if lead_status:
        query = query.filter(Lead.lead_status == lead_status)
        
    leads = query.all()
    
    flat_data = []
    for l in leads:
        flat_data.append({
            "ID": l.id,
            "Business Name": l.name,
            "Category": l.category,
            "Address": l.address,
            "Phone": l.phone,
            "Email": l.email,
            "Google Rating": l.rating,
            "Reviews Count": l.reviews_count,
            "Website URL": l.website_url,
            "Facebook Page": l.facebook_url,
            "Instagram Handle": l.instagram_url,
            "LinkedIn Page": l.linkedin_url,
            "Lead Score": l.lead_score,
            "Lead Category": l.lead_status,
            "CRM Status": l.crm_status,
            "Has Website": l.has_website,
            "Mobile Friendly": l.mobile_friendly,
            "Design Score": l.design_score,
            "Speed Score": l.load_speed_score,
            "Has SSL": l.has_ssl,
            "Missing Socials": not l.has_facebook and not l.has_instagram,
            "Suggested Monthly Budget ($)": l.suggested_monthly_budget,
            "Recommended Website Package": l.recommended_website_package,
            "CRM Notes": l.crm_notes,
            "Discovered Date": l.created_at.strftime("%Y-%m-%d") if l.created_at else ""
        })
        
    if format.lower() == "json":
        import json
        return Response(
            content=json.dumps(flat_data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=rivernet_leads.json"}
        )
        
    elif format.lower() == "excel":
        try:
            import pandas as pd
            output = io.BytesIO()
            df = pd.DataFrame(flat_data)
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                df.to_excel(writer, index=False, sheet_name="Leads")
            output.seek(0)
            return StreamingResponse(
                output,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=rivernet_leads.xlsx"}
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Excel export requires pandas and openpyxl. Use CSV export format instead.")
        
    else:  # Default to CSV
        import csv
        output = io.StringIO()
        if flat_data:
            writer = csv.DictWriter(output, fieldnames=list(flat_data[0].keys()))
            writer.writeheader()
            writer.writerows(flat_data)
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=rivernet_leads.csv"}
        )

@app.get("/api/leads/{lead_id}")
def get_lead_detail(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead_to_dict(lead)

@app.patch("/api/leads/{lead_id}")
def update_lead_crm(lead_id: int, crm_data: CRMUpdate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if crm_data.crm_status is not None:
        lead.crm_status = crm_data.crm_status
    if crm_data.crm_notes is not None:
        lead.crm_notes = crm_data.crm_notes
    if crm_data.setup_price is not None:
        lead.setup_price = crm_data.setup_price
    if crm_data.suggested_monthly_budget is not None:
        lead.suggested_monthly_budget = crm_data.suggested_monthly_budget
    if crm_data.recommended_website_package is not None:
        lead.recommended_website_package = crm_data.recommended_website_package
    if crm_data.estimated_services is not None:
        lead.estimated_services = crm_data.estimated_services
    if crm_data.lead_score is not None:
        lead.lead_score = crm_data.lead_score
    if crm_data.lead_status is not None:
        lead.lead_status = crm_data.lead_status
    if crm_data.reminder_date is not None:
        if crm_data.reminder_date == "":
            lead.reminder_date = None
        else:
            try:
                lead.reminder_date = datetime.datetime.fromisoformat(crm_data.reminder_date.replace("Z", "+00:00"))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format, use ISO string")
                
    db.commit()
    db.refresh(lead)
    return lead_to_dict(lead)

@app.patch("/api/leads/{lead_id}/favorite")
def toggle_lead_favorite(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.is_favorite = not bool(lead.is_favorite)
    db.commit()
    db.refresh(lead)
    return lead_to_dict(lead)

@app.delete("/api/leads/{lead_id}")
def delete_lead(
    lead_id: int, 
    db: Session = Depends(get_db), 
    current_user: str = Depends(get_current_user_email),
    password: Optional[str] = Query(None)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Enforce closed pipeline delete protection
    if lead.crm_status in ["WON", "LOST"]:
        is_admin = current_user == "agency@rivernet.io" or current_user.endswith("@rivernet.io")
        if not is_admin:
            raise HTTPException(
                status_code=403, 
                detail="Only the main account or administrator can delete leads from the Closed Pipeline (WON/LOST stages)"
            )
            
        if not password:
            raise HTTPException(
                status_code=400,
                detail="Administrator password confirmation is required."
            )
            
        admin_user = db.query(User).filter(User.email == current_user).first()
        if not admin_user or not verify_password(password, admin_user.hashed_password):
            raise HTTPException(
                status_code=400,
                detail="Incorrect administrator password. Deletion denied."
            )
            
    db.delete(lead)
    db.commit()
    return {"detail": "Lead deleted successfully"}

# --- AI PROSPECT REPORT & MEETING PREP MODULES ---

@app.get("/api/leads/{lead_id}/report")
def get_lead_report(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if not lead.prospect_report:
        report_data = generate_prospect_report(lead, db)
        lead.prospect_report = report_data
        lead.report_generated_at = datetime.datetime.utcnow()
        lead.report_version = 1
        lead.share_token_report = str(uuid.uuid4())
        lead.share_token_expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=14)
        
        lead.website_quality_score = report_data.get("website_quality_score")
        lead.seo_score = report_data.get("seo_score")
        lead.gbp_optimization_score = report_data.get("gbp_optimization_score")
        
        db.commit()
        db.refresh(lead)

    history_entries = db.query(ReportHistory).filter(ReportHistory.lead_id == lead.id).order_by(ReportHistory.version.desc()).all()
    history_list = [{
        "version": h.version,
        "generated_at": h.generated_at.isoformat(),
        "summary": h.report_data.get("executive_summary", "")
    } for h in history_entries]

    return {
        "report": lead.prospect_report,
        "version": lead.report_version or 1,
        "generated_at": lead.report_generated_at.isoformat() if lead.report_generated_at else None,
        "share_token": lead.share_token_report,
        "expires_at": lead.share_token_expires_at.isoformat() if lead.share_token_expires_at else None,
        "views": lead.report_link_views or 0,
        "last_viewed_at": lead.report_link_last_viewed_at.isoformat() if lead.report_link_last_viewed_at else None,
        "history": history_list
    }

@app.post("/api/leads/{lead_id}/report/regenerate")
def regenerate_lead_report(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if lead.prospect_report:
        old_history = ReportHistory(
            lead_id=lead.id,
            report_data=lead.prospect_report,
            version=lead.report_version or 1,
            generated_at=lead.report_generated_at or datetime.datetime.utcnow()
        )
        db.add(old_history)

    report_data = generate_prospect_report(lead, db)
    lead.prospect_report = report_data
    lead.report_generated_at = datetime.datetime.utcnow()
    lead.report_version = (lead.report_version or 1) + 1
    if not lead.share_token_report:
        lead.share_token_report = str(uuid.uuid4())
    lead.share_token_expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=14)
    
    lead.website_quality_score = report_data.get("website_quality_score")
    lead.seo_score = report_data.get("seo_score")
    lead.gbp_optimization_score = report_data.get("gbp_optimization_score")
    
    db.commit()
    db.refresh(lead)

    history_entries = db.query(ReportHistory).filter(ReportHistory.lead_id == lead.id).order_by(ReportHistory.version.desc()).all()
    history_list = [{
        "version": h.version,
        "generated_at": h.generated_at.isoformat(),
        "summary": h.report_data.get("executive_summary", "")
    } for h in history_entries]

    return {
        "report": lead.prospect_report,
        "version": lead.report_version,
        "generated_at": lead.report_generated_at.isoformat(),
        "share_token": lead.share_token_report,
        "expires_at": lead.share_token_expires_at.isoformat(),
        "views": lead.report_link_views or 0,
        "last_viewed_at": lead.report_link_last_viewed_at.isoformat() if lead.report_link_last_viewed_at else None,
        "history": history_list
    }

@app.get("/api/leads/{lead_id}/meeting-brief")
def get_meeting_brief_endpoint(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if not lead.meeting_brief:
        brief_data = generate_meeting_brief(lead)
        lead.meeting_brief = brief_data
        lead.meeting_generated_at = datetime.datetime.utcnow()
        lead.meeting_version = 1
        lead.share_token_meeting = str(uuid.uuid4())
        db.commit()
        db.refresh(lead)

    history_entries = db.query(MeetingHistory).filter(MeetingHistory.lead_id == lead.id).order_by(MeetingHistory.version.desc()).all()
    history_list = [{
        "version": h.version,
        "generated_at": h.generated_at.isoformat(),
        "overview": h.brief_data.get("business_overview", "")
    } for h in history_entries]

    return {
        "brief": lead.meeting_brief,
        "version": lead.meeting_version or 1,
        "generated_at": lead.meeting_generated_at.isoformat() if lead.meeting_generated_at else None,
        "share_token": lead.share_token_meeting,
        "history": history_list
    }

@app.post("/api/leads/{lead_id}/meeting-brief/regenerate")
def regenerate_meeting_brief_endpoint(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if lead.meeting_brief:
        old_history = MeetingHistory(
            lead_id=lead.id,
            brief_data=lead.meeting_brief,
            version=lead.meeting_version or 1,
            generated_at=lead.meeting_generated_at or datetime.datetime.utcnow()
        )
        db.add(old_history)

    brief_data = generate_meeting_brief(lead)
    lead.meeting_brief = brief_data
    lead.meeting_generated_at = datetime.datetime.utcnow()
    lead.meeting_version = (lead.meeting_version or 1) + 1
    if not lead.share_token_meeting:
        lead.share_token_meeting = str(uuid.uuid4())
        
    db.commit()
    db.refresh(lead)

    history_entries = db.query(MeetingHistory).filter(MeetingHistory.lead_id == lead.id).order_by(MeetingHistory.version.desc()).all()
    history_list = [{
        "version": h.version,
        "generated_at": h.generated_at.isoformat(),
        "overview": h.brief_data.get("business_overview", "")
    } for h in history_entries]

    return {
        "brief": lead.meeting_brief,
        "version": lead.meeting_version,
        "generated_at": lead.meeting_generated_at.isoformat(),
        "share_token": lead.share_token_meeting,
        "history": history_list
    }

@app.get("/api/leads/{lead_id}/similar")
def get_similar_leads_endpoint(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    similar_leads = compute_similarity_leads(lead, db)
    return similar_leads

# PUBLIC UNAUTHENTICATED SHARE ENDPOINTS
@app.get("/api/public/report/{token}")
def get_public_report(token: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.share_token_report == token).first()
    if not lead or not lead.prospect_report:
        raise HTTPException(status_code=404, detail="Shared prospect report link not found.")
        
    if lead.share_token_expires_at and lead.share_token_expires_at < datetime.datetime.utcnow():
        raise HTTPException(
            status_code=410, 
            detail="This shared prospect report link has expired (14-day expiration reached). Please request a fresh link from the administrator."
        )

    lead.report_link_views = (lead.report_link_views or 0) + 1
    lead.report_link_last_viewed_at = datetime.datetime.utcnow()
    db.commit()

    return {
        "lead_name": lead.name,
        "category": lead.category,
        "address": lead.address,
        "phone": lead.phone,
        "email": lead.email,
        "website_url": lead.website_url,
        "report": lead.prospect_report,
        "version": lead.report_version,
        "generated_at": lead.report_generated_at.isoformat() if lead.report_generated_at else None
    }

@app.get("/api/public/meeting-brief/{token}")
def get_public_meeting_brief(token: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.share_token_meeting == token).first()
    if not lead or not lead.meeting_brief:
        raise HTTPException(status_code=404, detail="Shared meeting brief link not found.")

    return {
        "lead_name": lead.name,
        "brief": lead.meeting_brief,
        "version": lead.meeting_version,
        "generated_at": lead.meeting_generated_at.isoformat() if lead.meeting_generated_at else None
    }

# Dashboard Analytics Statistics
@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    leads = db.query(Lead).all()
    
    total_leads = len(leads)
    hot_leads = sum(1 for l in leads if l.lead_score >= 90)
    warm_leads = sum(1 for l in leads if 70 <= l.lead_score < 90)
    medium_leads = sum(1 for l in leads if 50 <= l.lead_score < 70)
    low_priority = sum(1 for l in leads if l.lead_score < 50)
    
    # Calculate average score
    avg_score = round(sum(l.lead_score for l in leads) / total_leads, 1) if total_leads > 0 else 0
    
    # CRM Funnel counts
    crm_stats = {
        "NEW": 0,
        "OUTREACHED": 0,
        "PROPOSAL_SENT": 0,
        "MEETING_SCHEDULED": 0,
        "WON": 0,
        "LOST": 0
    }
    
    pipeline_value = 0
    for l in leads:
        crm_stats[l.crm_status] = crm_stats.get(l.crm_status, 0) + 1
        # Add to pipeline if not lost
        if l.crm_status != "LOST" and l.suggested_monthly_budget:
            # We count expected value based on conversion probability or standard pricing
            # Standard pricing estimation: website package + monthly retainer
            pipeline_value += l.suggested_monthly_budget
            
    # Chart distributions
    # 1. Lead Score Ranges
    score_ranges = [
        {"name": "0-49 (Low)", "count": low_priority},
        {"name": "50-69 (Medium)", "count": medium_leads},
        {"name": "70-89 (Warm)", "count": warm_leads},
        {"name": "90-100 (Hot)", "count": hot_leads}
    ]
    
    # 2. Industry Categories
    categories = {}
    for l in leads:
        cat = l.category or "Other"
        categories[cat] = categories.get(cat, 0) + 1
    category_chart = [{"name": name, "value": count} for name, count in categories.items()]
    
    # 3. CRM Funnel Chart Data
    crm_chart = [
        {"stage": "Discovered", "leads": total_leads},
        {"stage": "Contacted", "leads": crm_stats["OUTREACHED"] + crm_stats["PROPOSAL_SENT"] + crm_stats["MEETING_SCHEDULED"] + crm_stats["WON"]},
        {"stage": "Proposal Sent", "leads": crm_stats["PROPOSAL_SENT"] + crm_stats["MEETING_SCHEDULED"] + crm_stats["WON"]},
        {"stage": "Meetings Set", "leads": crm_stats["MEETING_SCHEDULED"] + crm_stats["WON"]},
        {"stage": "Closed Won", "leads": crm_stats["WON"]}
    ]
    
    # Audit statistics
    no_website_count = sum(1 for l in leads if not l.has_website)
    poor_design_count = sum(1 for l in leads if l.has_website and l.design_score < 70)
    slow_speed_count = sum(1 for l in leads if l.has_website and l.load_speed_score < 60)
    no_ssl_count = sum(1 for l in leads if l.has_website and not l.has_ssl)
    no_socials_count = sum(1 for l in leads if not l.has_facebook and not l.has_instagram)
    
    audit_stats = {
        "no_website": no_website_count,
        "poor_design": poor_design_count,
        "slow_speed": slow_speed_count,
        "no_ssl": no_ssl_count,
        "no_socials": no_socials_count
    }

    return {
        "total_leads": total_leads,
        "hot_leads": hot_leads,
        "average_score": avg_score,
        "pipeline_value": pipeline_value,
        "score_ranges": score_ranges,
        "categories": category_chart,
        "crm_stats": crm_stats,
        "crm_chart": crm_chart,
        "audit_stats": audit_stats
    }

# Reset Database Endpoint (Admin & Password Protected)
class ResetDatabaseRequest(BaseModel):
    password: str

@app.post("/api/settings/reset-database")
def reset_database(
    req: ResetDatabaseRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user_email)
):
    is_admin = current_user == "agency@rivernet.io" or current_user.endswith("@rivernet.io")
    if not is_admin:
        raise HTTPException(
            status_code=403,
            detail="Only the main account or administrator can reset the database."
        )
        
    admin_user = db.query(User).filter(User.email == current_user).first()
    if not admin_user or not verify_password(req.password, admin_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect administrator password. Database reset denied."
        )

    # Clear leads, report histories, meeting histories, and settings
    db.query(ReportHistory).delete()
    db.query(MeetingHistory).delete()
    db.query(Lead).delete()
    db.query(Settings).delete()
    db.commit()

    # Re-seed default settings
    default_settings = Settings(
        google_maps_api_key="",
        openai_api_key="",
        openai_api_base="https://api.openai.com/v1",
        openai_model="gpt-4o-mini"
    )
    db.add(default_settings)
    db.commit()

    return {"detail": "Database reset successfully. All lead entries and audit records have been cleared."}
