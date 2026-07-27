import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, JSON
try:
    from backend.database import Base
except ImportError:
    from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    maps_url = Column(String, nullable=True)
    category = Column(String, index=True, nullable=True)
    rating = Column(Float, nullable=True)
    reviews_count = Column(Integer, nullable=True)
    website_url = Column(String, nullable=True)
    
    # Social links
    facebook_url = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    
    # Favorites & Map Position
    is_favorite = Column(Boolean, default=False, index=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    
    # Additional filters
    business_size = Column(String, nullable=True)  # "Small", "Medium", "Large"
    recently_opened = Column(Boolean, default=False)
    
    # Website Audit Info
    has_website = Column(Boolean, default=True)
    mobile_friendly = Column(Boolean, default=True)
    load_speed_score = Column(Integer, default=100) # 0-100
    has_ssl = Column(Boolean, default=True)
    has_broken_pages = Column(Boolean, default=False)
    design_score = Column(Integer, default=100) # 0-100
    has_seo_metadata = Column(Boolean, default=True)
    has_contact_form = Column(Boolean, default=True)
    has_analytics = Column(Boolean, default=True)
    website_age_years = Column(Integer, default=1)
    accessibility_score = Column(Integer, default=100) # 0-100
    
    # Marketing Audit Info
    has_facebook = Column(Boolean, default=True)
    has_instagram = Column(Boolean, default=True)
    social_active = Column(Boolean, default=True)
    google_optimized = Column(Boolean, default=True)
    has_blog = Column(Boolean, default=True)
    has_seo = Column(Boolean, default=True)
    has_google_ads_pixel = Column(Boolean, default=False)
    has_meta_pixel = Column(Boolean, default=False)
    has_newsletter = Column(Boolean, default=False)
    
    # Scoring & AI Insights
    lead_score = Column(Integer, index=True, default=50) # 0-100
    lead_status = Column(String, default="Low Priority") # "Hot Lead", "Warm Lead", "Medium Lead", "Low Priority"
    website_analysis_summary = Column(Text, nullable=True)
    marketing_opp_summary = Column(Text, nullable=True)
    prospect_rationale = Column(Text, nullable=True)
    estimated_services = Column(JSON, nullable=True)  # List of strings
    setup_price = Column(Integer, nullable=True)
    suggested_monthly_budget = Column(Integer, nullable=True)
    recommended_website_package = Column(String, nullable=True)
    conversion_probability = Column(Float, nullable=True)
    
    # Outreach Material
    cold_email_draft = Column(Text, nullable=True)
    cold_call_talking_points = Column(Text, nullable=True)
    linkedin_message = Column(Text, nullable=True)
    follow_up_sequence = Column(JSON, nullable=True)  # List of sequences/emails
    icebreaker = Column(Text, nullable=True)
    
    # CRM State
    crm_status = Column(String, index=True, default="NEW") # "NEW", "OUTREACHED", "PROPOSAL_SENT", "MEETING_SCHEDULED", "WON", "LOST"
    crm_notes = Column(Text, default="")
    reminder_date = Column(DateTime, nullable=True)
    
    # New AI Reports & Shares Columns
    website_quality_score = Column(Integer, nullable=True)
    seo_score = Column(Integer, nullable=True)
    gbp_optimization_score = Column(Integer, nullable=True)
    share_token_report = Column(String, unique=True, index=True, nullable=True)
    share_token_meeting = Column(String, unique=True, index=True, nullable=True)
    share_token_expires_at = Column(DateTime, nullable=True)
    report_link_views = Column(Integer, default=0)
    report_link_last_viewed_at = Column(DateTime, nullable=True)
    prospect_report = Column(JSON, nullable=True)
    meeting_brief = Column(JSON, nullable=True)
    report_generated_at = Column(DateTime, nullable=True)
    report_version = Column(Integer, default=1)
    meeting_generated_at = Column(DateTime, nullable=True)
    meeting_version = Column(Integer, default=1)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    google_maps_api_key = Column(String, default="")
    openai_api_key = Column(String, default="")
    openai_api_base = Column(String, default="https://api.openai.com/v1")
    openai_model = Column(String, default="gpt-4o-mini")
    
    # Scoring weights
    weight_no_website = Column(Integer, default=40)
    weight_poor_website = Column(Integer, default=20)
    weight_poor_seo = Column(Integer, default=10)
    weight_weak_social = Column(Integer, default=15)
    weight_low_reviews = Column(Integer, default=10)
    weight_outdated_branding = Column(Integer, default=5)

    # Tier Default Prices
    tier1_setup_price = Column(Integer, default=3500)
    tier1_monthly_retainer = Column(Integer, default=1500)
    tier2_setup_price = Column(Integer, default=2200)
    tier2_monthly_retainer = Column(Integer, default=1200)
    tier3_setup_price = Column(Integer, default=1200)
    tier3_monthly_retainer = Column(Integer, default=800)
    tier4_setup_price = Column(Integer, default=500)
    tier4_monthly_retainer = Column(Integer, default=500)

class ReportHistory(Base):
    __tablename__ = "report_history"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, index=True, nullable=False)
    report_data = Column(JSON, nullable=False)
    version = Column(Integer, nullable=False)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

class MeetingHistory(Base):
    __tablename__ = "meeting_history"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, index=True, nullable=False)
    brief_data = Column(JSON, nullable=False)
    version = Column(Integer, nullable=False)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
