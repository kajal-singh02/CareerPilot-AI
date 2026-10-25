import logging
from sqlalchemy.orm import Session
from app.models.entities import User, UserProfile, Job
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

SAMPLE_JOBS = [
    {
        "title": "Full Stack Engineer (React & Python)",
        "company": "Veloce Technologies",
        "description": "We are seeking a Full Stack Engineer to build responsive customer portals and high-throughput microservices. You will collaborate closely with product managers and designers to engineer features using React, TypeScript, FastAPI, and PostgreSQL.",
        "location": "San Francisco, CA (Remote)",
        "work_mode": "remote",
        "experience_level": "Mid-Level",
        "salary_range": "$115,000 - $145,000",
        "required_skills": ["React", "Python", "TypeScript", "FastAPI", "PostgreSQL", "Docker", "Git"],
        "preferred_skills": ["Redis", "AWS", "CI/CD", "Tailwind CSS"],
        "application_url": "https://example.com/careers/veloce-fullstack",
        "is_sample": True
    },
    {
        "title": "Senior Frontend Developer",
        "company": "Aura Labs",
        "description": "Lead the frontend architecture of our analytics web application. Create sleek design systems, optimize Core Web Vitals, and mentor engineers. Experience with state management, accessible web standards, and TypeScript is essential.",
        "location": "New York, NY (Hybrid)",
        "work_mode": "hybrid",
        "experience_level": "Senior",
        "salary_range": "$140,000 - $175,000",
        "required_skills": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux", "REST API"],
        "preferred_skills": ["GraphQL", "Jest", "WebSockets", "Figma"],
        "application_url": "https://example.com/careers/aura-frontend",
        "is_sample": True
    },
    {
        "title": "Backend Systems Engineer",
        "company": "Nexus Cloud Infrastructure",
        "description": "Build resilient distributed data pipelines and cloud backend APIs. You will implement caching layers, design relational and NoSQL schemas, and ensure 99.99% service availability.",
        "location": "Austin, TX (Remote)",
        "work_mode": "remote",
        "experience_level": "Mid-Level",
        "salary_range": "$125,000 - $155,000",
        "required_skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "Docker", "Redis", "Kafka"],
        "preferred_skills": ["Kubernetes", "AWS", "Microservices", "Prometheus"],
        "application_url": "https://example.com/careers/nexus-backend",
        "is_sample": True
    },
    {
        "title": "Cloud & DevOps Engineer",
        "company": "Stratus Systems",
        "description": "Design and maintain our cloud infrastructure on AWS. Automate CI/CD pipelines, implement Infrastructure as Code using Terraform, and ensure robust security monitoring.",
        "location": "Seattle, WA (Remote)",
        "work_mode": "remote",
        "experience_level": "Mid-to-Senior",
        "salary_range": "$135,000 - $165,000",
        "required_skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Git", "Terraform"],
        "preferred_skills": ["Python", "Bash", "Prometheus", "Helm"],
        "application_url": "https://example.com/careers/stratus-devops",
        "is_sample": True
    },
    {
        "title": "AI / Machine Learning Engineer",
        "company": "Cognitive Mind AI",
        "description": "Develop and deploy machine learning models, retrieval-augmented generation pipelines, and LLM integrations. Work with data engineers to build production inference services.",
        "location": "Boston, MA (Hybrid)",
        "work_mode": "hybrid",
        "experience_level": "Mid-Level",
        "salary_range": "$130,000 - $160,000",
        "required_skills": ["Python", "Machine Learning", "PyTorch", "Pandas", "NumPy", "FastAPI", "Docker"],
        "preferred_skills": ["LangChain", "Vector Databases", "MLflow", "AWS"],
        "application_url": "https://example.com/careers/cognitive-ml",
        "is_sample": True
    },
    {
        "title": "Junior Software Engineer",
        "company": "Spark Interactive",
        "description": "Exciting opportunity for entry-level developers or recent graduates. Learn on the job while contributing to customer-facing web applications using modern JavaScript and Python.",
        "location": "Chicago, IL (Onsite)",
        "work_mode": "onsite",
        "experience_level": "Entry-Level",
        "salary_range": "$80,000 - $95,000",
        "required_skills": ["JavaScript", "Python", "HTML", "CSS", "Git", "SQL"],
        "preferred_skills": ["React", "FastAPI", "PostgreSQL"],
        "application_url": "https://example.com/careers/spark-junior",
        "is_sample": True
    }
]

def seed_database(db: Session):
    # Check if demo user already exists
    demo_user = db.query(User).filter(User.email == "demo@careerpilot.ai").first()
    if not demo_user:
        demo_user = User(
            email="demo@careerpilot.ai",
            full_name="Alex Johnson",
            hashed_password=get_password_hash("CareerPilot2026!"),
            is_active=True,
            is_superuser=False
        )
        db.add(demo_user)
        db.flush()

        profile = UserProfile(
            user_id=demo_user.id,
            phone="+1 (555) 234-5678",
            degree="Bachelor of Science in Computer Science",
            graduation_year=2024,
            years_of_experience=2.0,
            preferred_role="Full Stack Engineer",
            preferred_location="Remote",
            work_mode="remote",
            target_industry="Technology / SaaS",
            existing_skills=["Python", "JavaScript", "TypeScript", "React", "FastAPI", "PostgreSQL", "Git"],
            career_goals="Land a high-impact full-stack software engineering role at an innovative technology company."
        )
        db.add(profile)
        db.commit()
        logger.info("Demo user 'demo@careerpilot.ai' created.")

    # Seed Sample Jobs
    existing_jobs = db.query(Job).count()
    if existing_jobs == 0:
        for job_data in SAMPLE_JOBS:
            job = Job(**job_data)
            db.add(job)
        db.commit()
        logger.info(f"Seeded {len(SAMPLE_JOBS)} sample jobs.")
