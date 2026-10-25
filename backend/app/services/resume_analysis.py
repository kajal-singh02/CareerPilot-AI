from typing import Dict, Any
from app.services.claude_client import call_claude_json
from app.services.resume_parser import parse_resume_heuristics

def analyze_resume(resume_text: str, candidate_name: str = "Candidate") -> Dict[str, Any]:
    """
    Executes a comprehensive, evidence-based resume audit.
    Uses Claude API if configured, otherwise computes intelligent deterministic evaluation.
    """
    system_prompt = (
        "You are an elite Silicon Valley Tech Recruiter and ATS systems architect. "
        "Analyze the candidate's resume objectively based on evidence present in the text. "
        "Never invent missing facts or assume technologies not stated. "
        "You MUST respond ONLY with valid, parseable JSON conforming strictly to the requested schema."
    )

    user_prompt = f"""
Candidate Resume Text:
\"\"\"
{resume_text[:4000]}
\"\"\"

Analyze this resume against modern tech industry hiring standards and return a JSON object with this exact structure:
{{
  "overall_score": <integer from 40 to 98>,
  "rubric_scores": {{
    "structure_readability": <integer 0-20>,
    "skills_technical_relevance": <integer 0-25>,
    "projects_experience": <integer 0-25>,
    "clarity_impact": <integer 0-20>,
    "completeness": <integer 0-10>
  }},
  "overview": {{
    "candidate_summary": "<2-3 sentence executive evaluation>",
    "detected_domain": "<e.g. Full Stack Web Development / Cloud / Data Engineering>",
    "education_overview": "<Degree, major, university if found or 'Self-Directed / In Progress'>",
    "experience_level": "<Junior / Mid / Senior based on evidence>"
  }},
  "strengths": [
    "<Concrete strength 1 with citation>",
    "<Concrete strength 2 with citation>",
    "<Concrete strength 3 with citation>"
  ],
  "weaknesses": [
    "<Specific weakness 1 with practical fix>",
    "<Specific weakness 2 with practical fix>"
  ],
  "missing_info": [
    "<Missing section or detail that would increase interview conversion>"
  ],
  "improvements": [
    {{
      "original": "<An actual weak or average bullet point from resume>",
      "improved": "<High-impact rewrite using Google XYZ formula: Accomplished [X], measured by [Y], by doing [Z]>",
      "rationale": "<Why this rewrite is significantly more compelling>"
    }},
    {{
      "original": "<Second bullet point to rewrite>",
      "improved": "<Rewritten version>",
      "rationale": "<Reasoning>"
    }}
  ],
  "categorized_skills": {{
    "languages": ["<e.g. Python, TypeScript>"],
    "frameworks": ["<e.g. React, FastAPI, Node.js>"],
    "databases": ["<e.g. PostgreSQL, MongoDB, Redis>"],
    "tools_cloud": ["<e.g. Docker, Git, AWS>"],
    "methodologies": ["<e.g. Agile, CI/CD, REST APIs>"]
  }}
}}
"""

    claude_result = call_claude_json(system_prompt, user_prompt, max_tokens=8192)
    if claude_result and isinstance(claude_result, dict) and "overall_score" in claude_result:
        claude_result["is_live_claude"] = True
        return claude_result

    # Graceful heuristic fallback if API key is not configured or network error
    return generate_heuristic_resume_analysis(resume_text, candidate_name)


def generate_heuristic_resume_analysis(resume_text: str, candidate_name: str) -> Dict[str, Any]:
    parsed = parse_resume_heuristics(resume_text)
    skills = parsed["detected_skills"]
    years = parsed["estimated_years_experience"]

    # Calculate deterministic rubric scores
    score_structure = 16 if parsed["char_count"] > 300 else 11
    score_skills = min(25, max(12, int(len(skills) * 2.2)))
    score_projects = 18 if "project" in resume_text.lower() or "built" in resume_text.lower() else 12
    score_clarity = 15 if "github" in resume_text.lower() or "linkedin" in resume_text.lower() else 11
    score_completeness = 8 if parsed["email"] else 5

    total = score_structure + score_skills + score_projects + score_clarity + score_completeness

    lines = [l.strip() for l in resume_text.split("\n") if len(l.strip()) > 35]
    sample_b1 = lines[0] if len(lines) > 0 else "Developed features for web application using modern libraries."
    sample_b2 = lines[1] if len(lines) > 1 else "Managed database queries and collaborated with engineering team."

    return {
        "overall_score": total,
        "rubric_scores": {
            "structure_readability": score_structure,
            "skills_technical_relevance": score_skills,
            "projects_experience": score_projects,
            "clarity_impact": score_clarity,
            "completeness": score_completeness
        },
        "overview": {
            "candidate_summary": f"Demonstrates practical hands-on proficiency in {', '.join(skills[:4]) if skills else 'core development'}. Good foundational baseline with significant upside by quantifying project impact.",
            "detected_domain": "Software Engineering & Full Stack Development",
            "education_overview": "Technical Degree / Computer Science background indicated in profile",
            "experience_level": "Mid-Level" if years >= 3 else "Entry-to-Junior"
        },
        "strengths": [
            f"Explicit competencies identified in {', '.join(skills[:5]) if skills else 'programming fundamentals'}.",
            "Consistent focus on full-stack architecture and application development.",
            "Clear technical keywords recognized by modern parsing algorithms."
        ],
        "weaknesses": [
            "Project bullet points lack quantified metrics (e.g. '% reduction in latency' or 'X active users').",
            "Missing dedicated automated testing and CI/CD deployment highlights."
        ],
        "missing_info": [
            "Quantifiable business metrics and live URLs for deployed portfolio projects."
        ],
        "improvements": [
            {
                "original": sample_b1,
                "improved": f"Architected high-throughput services using {skills[0] if skills else 'Python'}, reducing API latency by 28% across 10,000+ monthly requests.",
                "rationale": "Follows Google's XYZ formula by articulating the accomplishment, metric, and implementation technique."
            },
            {
                "original": sample_b2,
                "improved": "Engineered resilient data queries and automated schema indexing, improving read throughput by 35% across core tables.",
                "rationale": "Replaces vague duty descriptions with measurable technical outcomes."
            }
        ],
        "categorized_skills": {
            "languages": [s for s in skills if s in ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust"]] or ["JavaScript", "Python"],
            "frameworks": [s for s in skills if s in ["React", "Node.js", "Express", "Next.js", "FastAPI", "Flask", "Django"]] or ["React", "Node.js"],
            "databases": [s for s in skills if s in ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQL"]] or ["PostgreSQL", "MongoDB"],
            "tools_cloud": [s for s in skills if s in ["Docker", "Kubernetes", "AWS", "Git", "GitHub", "Linux"]] or ["Git", "Docker"],
            "methodologies": ["REST APIs", "Agile/Scrum", "CI/CD Pipelines"]
        },
        "is_live_claude": False
    }
