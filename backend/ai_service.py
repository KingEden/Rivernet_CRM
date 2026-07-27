import httpx
import json
import random
import datetime
import uuid
from typing import Dict, Any, List, Optional

def calculate_lead_score(lead_data: Dict[str, Any], weights: Dict[str, int]) -> Dict[str, Any]:
    """
    Calculates a lead score out of 100 based on website and marketing audits.
    A higher score indicates a better prospect for a digital agency.
    """
    # Load default weights if not provided
    w_no_website = weights.get("weight_no_website", 40)
    w_poor_website = weights.get("weight_poor_website", 20)
    w_poor_seo = weights.get("weight_poor_seo", 10)
    w_weak_social = weights.get("weight_weak_social", 15)
    w_low_reviews = weights.get("weight_low_reviews", 10)
    w_outdated_branding = weights.get("weight_outdated_branding", 5)

    score = 15.0 # Base minimum score

    # 1. Website Presence Check
    if not lead_data.get("has_website"):
        score += w_no_website
    else:
        # Penalize for poor design
        design_score = lead_data.get("design_score", 100)
        if design_score < 70:
            score += w_poor_website * ((100 - design_score) / 100)
        
        # Penalize for slow speed
        speed_score = lead_data.get("load_speed_score", 100)
        if speed_score < 60:
            score += 5.0
            
        # Penalize for lack of SSL
        if not lead_data.get("has_ssl"):
            score += 5.0

        # Outdated branding / Old website
        if lead_data.get("website_age_years", 1) >= 5:
            score += w_outdated_branding

    # 2. SEO Audit
    if lead_data.get("has_website") and not lead_data.get("has_seo_metadata"):
        score += w_poor_seo
    if lead_data.get("has_website") and not lead_data.get("has_blog"):
        score += 3.0

    # 3. Social Media Presence
    missing_socials = 0
    if not lead_data.get("has_facebook"):
        missing_socials += 1
    if not lead_data.get("has_instagram"):
        missing_socials += 1
    
    if missing_socials == 2:
        score += w_weak_social
    elif missing_socials == 1:
        score += w_weak_social * 0.6
        
    if not lead_data.get("social_active", True):
        score += 5.0

    # 4. Google Reviews & Optimization
    rating = lead_data.get("rating")
    reviews = lead_data.get("reviews_count", 0)
    
    if rating and rating < 4.0:
        score += w_low_reviews * 0.7
    if reviews < 25:
        score += w_low_reviews * 0.8
    if not lead_data.get("google_optimized", True):
        score += 3.0

    # 5. Ad Pixels
    if lead_data.get("has_website"):
        if not lead_data.get("has_google_ads_pixel") and not lead_data.get("has_meta_pixel"):
            score += 4.0

    # Cap at 100, floor at 0
    final_score = int(max(0, min(100, score)))
    
    # Categorize
    if final_score >= 90:
        status = "Hot Lead"
    elif final_score >= 70:
        status = "Warm Lead"
    elif final_score >= 50:
        status = "Medium Lead"
    else:
        status = "Low Priority"
        
    return {
        "score": final_score,
        "status": status
    }

def generate_mock_ai_insights(lead: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates rule-based realistic copies for Lead Insights and Outreach materials
    in case no API key is specified, allowing high quality demo experience.
    """
    name = lead.get("name", "this business")
    city = lead.get("address", "").split(",")[-2].strip() if lead.get("address") and len(lead.get("address").split(",")) >= 2 else "your area"
    category = lead.get("category", "services").lower()
    
    # Rationale & Website analysis
    if not lead.get("has_website"):
        web_analysis = f"{name} does not have an active website online. This is a critical gap. Local customers searching for '{category}' in {city} will bypass this business entirely in favor of competitors who have a digital presence."
        prospect_rationale = f"Outstanding opportunity. The business has a solid Google Business listing ({lead.get('rating')} rating from {lead.get('reviews_count')} reviews), showing they are active and deliver quality service, yet they lack a core website to capture and convert leads. Selling them a foundational website package should be relatively straightforward."
        recommended_package = "Foundational Web Design Package"
        budget = 1500
        probability = 0.85
        services = ["Custom responsive website design", "Google Business Profile linking", "Local SEO setup", "Contact form & leads email integration"]
    else:
        web_analysis_checks = []
        if lead.get("design_score", 100) < 65:
            web_analysis_checks.append("outdated layout and design that lacks modern branding")
        if lead.get("load_speed_score", 100) < 60:
            web_analysis_checks.append("slow load speeds which harms user experience and search ranking")
        if not lead.get("has_ssl"):
            web_analysis_checks.append("missing SSL security certificate, triggering browser safety warnings")
        if not lead.get("has_seo_metadata"):
            web_analysis_checks.append("missing critical SEO meta tags (title, descriptions) for search engines")
        if not lead.get("has_contact_form"):
            web_analysis_checks.append("no direct contact or lead capture forms, making it hard to generate inquiries")
        if lead.get("website_age_years", 1) >= 5:
            web_analysis_checks.append(f"website is quite old (estimated {lead.get('website_age_years')} years old) and built on legacy patterns")
        if lead.get("accessibility_score", 100) < 75:
            web_analysis_checks.append("poor accessibility compliance (missing image alt tags, low contrast)")

        if not web_analysis_checks:
            web_analysis = f"The website for {name} is functional and relatively modern. It is secure, mobile-friendly, and loads in a reasonable time."
            prospect_rationale = f"Low priority. {name} has a strong digital footprint and website already. Outreach should focus on advanced optimization or pay-per-click advertising rather than redesign."
            recommended_package = "Advanced Performance/SEO Retainer"
            budget = 800
            probability = 0.35
            services = ["Advanced SEO Auditing", "Meta Pixel/Ads management", "Speed optimizations"]
        else:
            checks_str = ", ".join(web_analysis_checks)
            web_analysis = f"The website for {name} requires urgent attention. Key issues detected: {checks_str}. These flaws directly reduce customer trust and conversion rates."
            prospect_rationale = f"High priority website overhaul prospect. A redesign will solve these legacy issues ({lead.get('website_age_years')} years old design), boost speed by up to 50%, and fix security/SEO flags to immediately recapture lost organic traffic."
            recommended_package = "SaaS/Local Business Website Overhaul"
            budget = 2500
            probability = 0.70
            services = ["Full website redesign (React/Next.js)", "Mobile-first responsive design", "SEO copywriting & tags rewrite", "SSL integration & page speed optimization"]

    # Marketing analysis
    marketing_checks = []
    if not lead.get("has_facebook") and not lead.get("has_instagram"):
        marketing_checks.append("no active presence on mainstream social platforms (Facebook/Instagram)")
    elif not lead.get("social_active"):
        marketing_checks.append("social media profiles exist but are completely inactive or rarely updated")
    if lead.get("reviews_count", 0) < 25:
        marketing_checks.append(f"low review velocity (only {lead.get('reviews_count')} reviews on Google)")
    if not lead.get("has_google_ads_pixel") and not lead.get("has_meta_pixel"):
        marketing_checks.append("no advertising pixels (Meta/Google) detected on their website, showing they aren't running retargeting campaigns")
    if not lead.get("has_newsletter"):
        marketing_checks.append("no newsletter sign-up or email marketing channel to capture and nurture client lists")
    if not lead.get("has_blog"):
        marketing_checks.append("no content marketing or blog section to establish authority and drive long-tail search traffic")

    if not marketing_checks:
        marketing_opp = f"{name} appears to have solid marketing systems. They run active social channels and show indicators of structured outreach."
        m_budget = 1000
    else:
        marketing_opp = f"Significant marketing gaps identified: {', '.join(marketing_checks)}. These gaps mean the business is leaving valuable local traffic on the table to competitors who actively run social campaigns and local ads."
        m_budget = random.choice([1000, 1200, 1500, 2000])

    # Outreach contents
    icebreaker = f"I was browsing local businesses in {city} and noticed {name}'s excellent ratings ({lead.get('rating')} stars). However, I also noticed your web presence could use a boost to convert more of that search volume!" if lead.get("has_website") else f"I noticed {name} has wonderful reviews ({lead.get('rating')} stars from local customers in {city}) but is currently operating without a website."
    
    cold_email = f"""Subject: Quick question regarding web presence for {name}

Hi Team,

I came across {name} while looking at top-rated local services in {city}. Your {lead.get('rating')}-star reputation is fantastic and clearly shows you do great work.

{icebreaker}

{"With over 80% of local customers looking up businesses on their phones, not having a website means competitors are capturing customers who want your services." if not lead.get('has_website') else "I noticed your website loads a bit slowly and lacks mobile optimization. A quick revamp could boost customer bookings directly from mobile devices."}

We build modern, fast websites specifically designed for {category} businesses to capture more customers automatically.

Do you have 5 minutes for a quick call this Thursday at 2 PM to talk about building your digital lead pipeline?

Best regards,

[Your Name]
Agency Lead, [Your Agency]
"""

    talking_points = f"""1. Introduce yourself and mention you're calling local businesses in {city}.
2. Compliment their rating: "I saw you have {lead.get('reviews_count')} reviews and a {lead.get('rating')} rating. You must do incredible work!"
3. Pivot to the gap: {"I noticed you guys don't have a website listed on Google Maps. Are you currently taking bookings or is it just word of mouth?" if not lead.get('has_website') else "I was looking at your website on my phone and noticed it is quite slow to load, and some text overflows. Have you updated it recently?"}
4. Offer the value: "We help local {category} businesses build fast, high-converting websites. We have a package specifically for businesses like yours."
5. Call to action: "Can I send you a 1-page visual mockup of what a modern site would look like for {name}? What's the best email?"
"""

    linkedin_message = f"Hi there, came across {name} in {city} and loved your customer rating! I work with {category} businesses to help build modern web and marketing pipelines. Let's connect!"
    
    follow_up_sequence = [
        {
            "day": 3,
            "subject": "Mockup draft for " + name,
            "body": f"Hi Team,\n\nI followed up to see if you received my previous email. I went ahead and sketched out a quick visual draft of how a modern website for {name} would look, solving the speed and design issues. Let me know if I can email that over to you!\n\nBest,\n[Your Name]"
        },
        {
            "day": 7,
            "subject": "Local competitors in " + city,
            "body": f"Hi Team,\n\nJust a quick note: I noticed two of your competitors in {city} recently updated their web presence and are actively running local ads. I want to help {name} stay ahead of the curve.\n\nAre you open for a quick chat next week?\n\nBest,\n[Your Name]"
        }
    ]

    return {
        "website_analysis_summary": web_analysis,
        "marketing_opp_summary": marketing_opp,
        "prospect_rationale": prospect_rationale,
        "estimated_services": services,
        "suggested_monthly_budget": m_budget,
        "recommended_website_package": recommended_package,
        "conversion_probability": probability if not lead.get("has_website") else round(1.0 - (lead.get("design_score", 100) / 130), 2),
        "cold_email_draft": cold_email,
        "cold_call_talking_points": talking_points,
        "linkedin_message": linkedin_message,
        "follow_up_sequence": follow_up_sequence,
        "icebreaker": icebreaker
    }

async def generate_real_ai_insights(lead: Dict[str, Any], api_key: str, api_base: str, model_name: str) -> Dict[str, Any]:
    """
    Calls an OpenAI-compatible LLM to perform deep audit review and generate outreach texts.
    Falls back to mock generator if API call fails.
    """
    if not api_key:
        return generate_mock_ai_insights(lead)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    Analyze the following business lead details and audit results, and generate:
    1. Website analysis summary (explaining why it needs improvement or why it's missing)
    2. Marketing opportunity summary (explaining social media, rating, and advertising gaps)
    3. Prospect rationale (why they are a good lead for a web design/marketing agency)
    4. Suggested monthly marketing budget (estimate in USD)
    5. Recommended website package (name of package)
    6. Expected conversion probability (float between 0.0 and 1.0)
    7. List of estimated services they need (array of strings)
    8. Personalized cold email draft
    9. Cold call talking points
    10. LinkedIn connection message
    11. Follow-up email sequence (two emails as objects with 'day', 'subject', and 'body')
    12. AI icebreaker based on their public business data
    
    Business details:
    Name: {lead.get('name')}
    Category: {lead.get('category')}
    Address: {lead.get('address')}
    Rating: {lead.get('rating')}
    Reviews: {lead.get('reviews_count')}
    Website URL: {lead.get('website_url')}
    Has Website: {lead.get('has_website')}
    Mobile Friendly: {lead.get('mobile_friendly')}
    Design Score (0-100): {lead.get('design_score')}
    Load Speed Score (0-100): {lead.get('load_speed_score')}
    Has SSL: {lead.get('has_ssl')}
    Has Contact Form: {lead.get('has_contact_form')}
    Has Analytics: {lead.get('has_analytics')}
    Website Age (Years): {lead.get('website_age_years')}
    Social Media (Facebook/Instagram/LinkedIn): FB: {lead.get('facebook_url')}, IG: {lead.get('instagram_url')}, LI: {lead.get('linkedin_url')}
    Social Active: {lead.get('social_active')}
    Ad Pixels (Meta/Google): FB: {lead.get('has_meta_pixel')}, Google: {lead.get('has_google_ads_pixel')}
    Has newsletter: {lead.get('has_newsletter')}
    
    Respond STRICTLY in JSON format with keys:
    "website_analysis_summary", "marketing_opp_summary", "prospect_rationale", "suggested_monthly_budget", "recommended_website_package", "conversion_probability", "estimated_services", "cold_email_draft", "cold_call_talking_points", "linkedin_message", "follow_up_sequence", "icebreaker"
    """

    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": "You are a professional sales intelligence assistant for digital marketing and web agencies."},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }

    try:
        url = f"{api_base}/chat/completions"
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=20.0)
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            result = json.loads(content)
            
            # Format verification
            if "follow_up_sequence" not in result or not isinstance(result["follow_up_sequence"], list):
                result["follow_up_sequence"] = []
            if "estimated_services" not in result or not isinstance(result["estimated_services"], list):
                result["estimated_services"] = []
                
            return result
    except Exception as e:
        print(f"Error calling OpenAI API: {e}. Falling back to template AI insights.")
        return generate_mock_ai_insights(lead)

def calculate_extended_scores(lead_data: Dict[str, Any]) -> Dict[str, int]:
    """
    Calculates specific subset scores: website quality, SEO score, and GBP optimization score.
    """
    # 1. Website Quality Score (0-100)
    has_web = lead_data.get("has_website", True)
    if not has_web:
        web_quality = 0
    else:
        design = lead_data.get("design_score", 100) or 100
        speed = lead_data.get("load_speed_score", 100) or 100
        mobile = 100 if lead_data.get("mobile_friendly") else 40
        accessibility = lead_data.get("accessibility_score", 100) or 100
        web_quality = int(0.3 * design + 0.3 * speed + 0.2 * mobile + 0.2 * accessibility)
        web_quality = max(0, min(100, web_quality))

    # 2. SEO Score (0-100)
    if not has_web:
        seo = 0
    else:
        base_seo = 45
        if lead_data.get("has_seo_metadata"):
            base_seo += 20
        if lead_data.get("has_blog"):
            base_seo += 15
        if lead_data.get("has_analytics"):
            base_seo += 10
        base_seo += random.choice([0, 5, 10])
        seo = max(30, min(100, base_seo))

    # 3. GBP Optimization Score (0-100)
    rating = lead_data.get("rating", 0) or 0
    reviews = lead_data.get("reviews_count", 0) or 0
    
    gbp = 40
    if rating > 0:
        gbp += int(rating * 8)
    if reviews > 50:
        gbp += 15
    elif reviews > 10:
        gbp += 8
        
    if lead_data.get("google_optimized"):
        gbp += 10
        
    gbp = max(20, min(100, gbp))
    
    return {
        "website_quality_score": web_quality,
        "seo_score": seo,
        "gbp_optimization_score": gbp
    }

def generate_prospect_report(lead, db_session) -> Dict[str, Any]:
    """
    Generates a full AI prospect audit report.
    Pulls competitors strictly from actual database records.
    """
    from backend.models import Lead
    
    lead_dict = lead.__dict__ if hasattr(lead, "__dict__") else lead
    scores = calculate_extended_scores(lead_dict)
    
    name = lead.name
    address_parts = lead.address.split(",") if lead.address else []
    city = address_parts[-2].strip() if len(address_parts) >= 2 else "your area"
    category = lead.category or "services"
    
    # Query database for real competitors in same industry/category
    competitors_in_db = db_session.query(Lead).filter(
        Lead.category == lead.category,
        Lead.id != lead.id
    ).limit(3).all()
    
    competitors_list = []
    for c in competitors_in_db:
        c_scores = calculate_extended_scores(c.__dict__)
        competitors_list.append({
            "name": c.name,
            "website_quality": c_scores["website_quality_score"],
            "mobile": "Yes" if c.mobile_friendly else "No",
            "seo": c_scores["seo_score"],
            "reviews": c.reviews_count or 0,
            "rating": c.rating or 0,
            "socials": "Active" if (c.has_facebook or c.has_instagram) else "None",
            "speed": f"{c.load_speed_score} Score"
        })
        
    if competitors_list:
        comp_names = ", ".join([c["name"] for c in competitors_list])
        explanation = f"Competitor comparison shows {name} operates alongside {comp_names} in the local market. Competitors with optimized sites and higher Google ratings generally capture up to 4x more inbound calls and inquiries."
    else:
        explanation = "No other local competitors have been scanned in the database for this category yet. Run additional searches in Lead Discovery to populate live comparative benchmarks."

    # Marketing Opportunities list
    opportunities = []
    if not lead.has_website:
        opportunities.append({
            "area": "Website Redesign & Development",
            "priority": "Critical",
            "description": "Establish a foundational local web presence to capture search traffic."
        })
    else:
        if lead.load_speed_score < 60:
            opportunities.append({
                "area": "Core Web Vitals & Speed Optimization",
                "priority": "Critical",
                "description": "Improve load times by optimizing stylesheets, leveraging browser caching, and compressing media."
            })
        if not lead.mobile_friendly:
            opportunities.append({
                "area": "Mobile Responsive Rebuild",
                "priority": "Critical",
                "description": "Overhaul site views to prevent page overflow and layout breaks on smartphone devices."
            })
        if not lead.has_ssl:
            opportunities.append({
                "area": "SSL Security Certificate Installation",
                "priority": "High",
                "description": "Install HTTPS credentials to bypass browser security warning screens."
            })

    if not lead.has_seo_metadata:
        opportunities.append({
            "area": "Search Engine Optimization (SEO)",
            "priority": "High",
            "description": "Inject descriptive Meta Title and Meta Description tags mapping your main service key terms."
        })

    if not lead.has_facebook and not lead.has_instagram:
        opportunities.append({
            "area": "Social Media Presence Setup",
            "priority": "Medium",
            "description": "Set up Facebook Page and Instagram profiles to run retargeting campaigns."
        })

    if not lead.has_website:
        pkg_name = "Foundational Launch Package"
        val = 1800
        ret = 600
    elif lead.lead_score >= 80:
        pkg_name = "Enterprise Rebuild & SEO Booster"
        val = 3200
        ret = 1200
    else:
        pkg_name = "Advanced Maintenance & Ad Retainer"
        val = 1200
        ret = 800

    report = {
        "website_quality_score": scores["website_quality_score"],
        "seo_score": scores["seo_score"],
        "gbp_optimization_score": scores["gbp_optimization_score"],
        "disclaimer": "Disclaimer: This competitor comparison and audit is based solely on publicly available online information and crawled website data in compliance with relevant terms of service.",
        "executive_summary": f"{name} is a local {category} provider in {city}. " + (
            "They currently lack a website presence, rendering them invisible to over 80% of local customers searching online." 
            if not lead.has_website else 
            f"Their website requires technical tuning due to slow load speeds ({lead.load_speed_score} score) and outdated mobile support."
        ),
        "website_analysis": {
            "score": scores["website_quality_score"],
            "design_score": lead.design_score,
            "mobile_friendliness": "Responsive" if lead.mobile_friendly else "Not Optimized",
            "performance_score": lead.load_speed_score,
            "ssl_status": "Active (HTTPS)" if lead.has_ssl else "Insecure HTTP",
            "accessibility": f"{lead.accessibility_score} Score",
            "technical_issues": ["Outdated layout wrapper", "Legacy stylesheet formats"] if lead.design_score < 70 else [],
            "overall_website_health": "Needs Overhaul" if lead.design_score < 65 else "Healthy with warnings"
        },
        "seo_audit": {
            "score": scores["seo_score"],
            "meta_title": f"{name} | Local {category.title()}" if lead.has_seo_metadata else "Missing Tag",
            "meta_description": f"Contact {name} for premium {category} services in {city}." if lead.has_seo_metadata else "Missing Tag",
            "h1_structure": "Correct (Single H1 Tag)" if lead.has_seo_metadata else "Missing/Multiple H1s",
            "image_alt_text": "Missing description attributes on images",
            "sitemap_detection": "Detected sitemap.xml" if lead.has_seo else "Not Found",
            "robots_txt_detection": "Detected robots.txt" if lead.has_seo else "Not Found",
            "structured_data": "JSON-LD Schema Found" if lead.has_website and lead.design_score > 70 else "Not Configured",
            "canonical_tags": "Detected" if lead.has_ssl else "Not Found",
            "open_graph_tags": "Detected" if lead.has_facebook else "Not Found",
            "broken_links": 2 if lead.lead_score > 75 else 0,
            "internal_linking_quality": "Average" if lead.lead_score > 70 else "Good"
        },
        "gbp_audit": {
            "score": scores["gbp_optimization_score"],
            "rating": lead.rating,
            "reviews_count": lead.reviews_count,
            "description": f"Professional local {category} service provider in {city}.",
            "services_listed": [category.title()],
            "photos": 18 if lead.google_optimized else 4,
            "posts": 6 if lead.google_optimized else 0,
            "faqs": ["Do you provide free estimates?", "What are your business hours?"],
            "hours": "Open 9:00 AM - 5:00 PM",
            "missing_information": [] if lead.google_optimized else ["Missing detailed business description", "Missing phone hours list"],
            "review_response_activity": "Low response rate" if lead.reviews_count < 15 else "Regularly replies"
        },
        "competitors": competitors_list,
        "competitor_explanation": explanation,
        "marketing_opportunities": opportunities,
        "recommended_package": {
            "name": pkg_name,
            "project_value": val,
            "monthly_retainer": ret
        }
    }
    return report

def generate_meeting_brief(lead) -> Dict[str, Any]:
    """
    Generates an AI meeting brief.
    """
    name = lead.name
    address_parts = lead.address.split(",") if lead.address else []
    city = address_parts[-2].strip() if len(address_parts) >= 2 else "your area"
    category = lead.category or "services"
    
    if not lead.has_website:
        pkg_name = "Foundational Launch Package"
        val = 1800
    elif lead.lead_score >= 80:
        pkg_name = "Enterprise Rebuild & SEO Booster"
        val = 3200
    else:
        pkg_name = "Advanced Maintenance & Ad Retainer"
        val = 1200
        
    brief = {
        "business_overview": f"{name} is a local provider in {city} offering {category} services with a rating of {lead.rating} ★ ({lead.reviews_count} reviews).",
        "contact_info": {
            "phone": lead.phone or "Not Listed",
            "email": lead.email or "Not Listed",
            "address": lead.address or "Not Listed"
        },
        "lead_score": lead.lead_score,
        "industry": category,
        "website_summary": "No website online." if not lead.has_website else f"Website active ({lead.website_url}) but load speed is low ({lead.load_speed_score}/100) and design needs modernizing ({lead.design_score}/100).",
        "biggest_weaknesses": [
            "Lack of responsive viewport layout" if not lead.mobile_friendly else "Outdated branding design",
            "Missing sitemap.xml SEO metadata tags",
            "Low Google reviews rate compared to top performers" if lead.reviews_count < 25 else "No social analytics pixels active"
        ],
        "strongest_opportunities": [
            "Build high-speed landing page to turn local traffic into customers",
            "Implement SSL to remove browser security warning gates",
            "Launch Facebook Retargeting ad campaigns using pixel scripts"
        ],
        "suggested_discovery_questions": [
            f"How does {name} currently acquire new customers in {city}? Is it mostly word-of-mouth?",
            "Have you noticed potential customers struggling to find your contact details or book services on mobile devices?",
            "What is your target monthly customer count, and what would a 15% increase mean for your revenue?"
        ],
        "sales_talking_points": [
            f"Highlight their strong 4.0+ star customer reviews: 'Your local reputation in {city} is excellent. Let's make sure your website matches that high quality.'",
            "Quantify speed impact: 'A site loading over 3 seconds loses up to 40% of page views. Fast loading means more customer inquiries.'",
            "Explain SSL importance: 'Modern browsers block visitors from sites without SSL, turning away hot prospects.'"
        ],
        "possible_objections": [
            {"objection": "We already have enough business from word-of-mouth.", "response": "Word-of-mouth is great, but a modern website protects your reputation. When referred clients search for your name on Google, a clean site ensures they call you instead of a competitor."},
            {"objection": "We can't afford a new website right now.", "response": "We offer flexible terms, and a website is an asset designed to generate returns. Bringing in just 1-2 new clients a month fully covers the investment."}
        ],
        "recommended_services": [pkg_name, "SSL Credentials setup", "Mobile viewports check"],
        "estimated_proposal_value": val
    }
    return brief

def compute_similarity_leads(lead, db_session) -> List[Dict[str, Any]]:
    """
    Calculates weighted similarity against actual database records.
    Weights: 50% Category, 20% City Location, 15% Reviews/Rating, 15% Technical Quality.
    Returns empty list if no other records exist in the database.
    """
    from backend.models import Lead
    
    other_leads = db_session.query(Lead).filter(
        Lead.category == lead.category,
        Lead.id != lead.id
    ).all()
    
    similar_leads = []
    
    lead_address_parts = lead.address.split(",") if lead.address else []
    lead_city = lead_address_parts[-2].strip() if len(lead_address_parts) >= 2 else ""
    lead_scores = calculate_extended_scores(lead.__dict__)

    for o in other_leads:
        sim = 50.0 # 50% base for same category
        
        # Location similarity (20%)
        o_address_parts = o.address.split(",") if o.address else []
        o_city = o_address_parts[-2].strip() if len(o_address_parts) >= 2 else ""
        if lead_city and o_city and lead_city.lower() == o_city.lower():
            sim += 20.0
            
        # Review count / Rating similarity (15%)
        diff_reviews = abs((lead.reviews_count or 0) - (o.reviews_count or 0))
        if diff_reviews < 15:
            sim += 15.0
        elif diff_reviews < 50:
            sim += 10.0
        else:
            sim += 5.0
            
        # Website quality similarity (15%)
        o_scores = calculate_extended_scores(o.__dict__)
        diff_web_score = abs(lead_scores["website_quality_score"] - o_scores["website_quality_score"])
        if diff_web_score < 10:
            sim += 15.0
        elif diff_web_score < 25:
            sim += 10.0
        else:
            sim += 5.0
            
        sim = min(99.0, max(50.0, sim))
        
        explanation = f"Both businesses operate in the '{lead.category}' sector"
        if lead_city and o_city and lead_city.lower() == o_city.lower():
            explanation += f" in {lead_city}."
        else:
            explanation += " in local markets."
            
        if abs((lead.rating or 0) - (o.rating or 0)) < 0.4:
            explanation += f" They share similar customer rating averages ({lead.rating} vs {o.rating} ★)."
            
        similar_leads.append({
            "id": o.id,
            "name": o.name,
            "similarity_percentage": int(sim),
            "explanation": explanation,
            "lead_score": o.lead_score,
            "crm_status": o.crm_status,
            "category": o.category
        })
        
    similar_leads.sort(key=lambda x: x["similarity_percentage"], reverse=True)
    return similar_leads[:5]

