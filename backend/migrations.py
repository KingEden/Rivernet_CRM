from sqlalchemy import inspect, text
try:
    from backend.database import engine
except ImportError:
    from database import engine

def apply_migrations():
    """
    Safely applies migrations to add new columns to the 'leads' table in SQLite.
    New tables (like report_history and meeting_history) will be created automatically 
    by SQLAlchemy's create_all(), but existing tables require manual ALTER statements.
    """
    inspector = inspect(engine)
    
    # Verify if leads table exists
    if "leads" not in inspector.get_table_names():
        return
        
    columns = [c["name"] for c in inspector.get_columns("leads")]
    
    # Columns to add and their SQL types
    migrations = [
        ("website_quality_score", "INTEGER"),
        ("seo_score", "INTEGER"),
        ("gbp_optimization_score", "INTEGER"),
        ("share_token_report", "VARCHAR(255)"),
        ("share_token_meeting", "VARCHAR(255)"),
        ("share_token_expires_at", "DATETIME"),
        ("report_link_views", "INTEGER DEFAULT 0"),
        ("report_link_last_viewed_at", "DATETIME"),
        ("prospect_report", "JSON"),
        ("meeting_brief", "JSON"),
        ("report_generated_at", "DATETIME"),
        ("report_version", "INTEGER DEFAULT 1"),
        ("meeting_generated_at", "DATETIME"),
        ("meeting_version", "INTEGER DEFAULT 1")
    ]
    
    with engine.begin() as conn:
        for col_name, col_type in migrations:
            if col_name not in columns:
                try:
                    conn.execute(text(f"ALTER TABLE leads ADD COLUMN {col_name} {col_type}"))
                    print(f"Migration applied: Added column '{col_name}' to table 'leads'")
                except Exception as e:
                    print(f"Error applying migration for column '{col_name}': {e}")
