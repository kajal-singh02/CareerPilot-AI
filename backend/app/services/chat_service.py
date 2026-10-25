import json
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.entities import (
    User, Resume, ResumeAnalysis, Job,
    JobApplication, ChatConversation,
    ChatMessage, ChatPendingAction
)
from app.services.claude_client import get_anthropic_client
from app.services.job_matcher import match_job_description

logger = logging.getLogger(__name__)

def utcnow():
    return datetime.now(timezone.utc)

# -------------------------------------------------------------------------
# Tool Definitions for Anthropic Claude
# -------------------------------------------------------------------------
ASSISTANT_TOOLS = [
    {
        "name": "get_user_profile",
        "description": "Retrieve the authenticated candidate's active profile, preferred role, career goals, years of experience, and known skills.",
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "get_selected_resume",
        "description": "Retrieve content summary and extracted skills from candidate's resume.",
        "input_schema": {
            "type": "object",
            "properties": {
                "resume_id": {"type": "integer", "description": "Optional specific resume ID. Defaults to current active resume."}
            }
        }
    },
    {
        "name": "analyze_resume",
        "description": "Retrieve detailed ATS 100-point score, rubric breakdown, impact score, and weakness findings for a resume.",
        "input_schema": {
            "type": "object",
            "properties": {
                "resume_id": {"type": "integer", "description": "Optional resume ID."}
            }
        }
    },
    {
        "name": "search_available_jobs",
        "description": "Search verified job openings in the database by role title, keyword, or tech stack.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query e.g. 'Frontend', 'Python', 'DevOps'"},
                "location": {"type": "string", "description": "Optional location filter e.g. 'Remote'"}
            }
        }
    },
    {
        "name": "match_resume_to_job",
        "description": "Calculate deterministic skill match score and gap analysis between candidate's resume and a specific job opening.",
        "input_schema": {
            "type": "object",
            "properties": {
                "job_id": {"type": "integer", "description": "ID of target job in database"},
                "resume_id": {"type": "integer", "description": "Optional resume ID"}
            },
            "required": ["job_id"]
        }
    },
    {
        "name": "get_skill_gaps",
        "description": "Compare candidate's resume against target role requirements and identify prioritized missing competencies.",
        "input_schema": {
            "type": "object",
            "properties": {
                "target_role": {"type": "string", "description": "Target job title or specialization"}
            }
        }
    },
    {
        "name": "get_interview_questions",
        "description": "Retrieve role-specific technical, behavioral STAR, or system design interview practice questions.",
        "input_schema": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "enum": ["technical", "behavioral", "system_design"], "description": "Category of interview questions"}
            }
        }
    },
    {
        "name": "get_application_summary",
        "description": "Retrieve candidate's active job application pipeline status (applied, screening, interviewing, offered).",
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "propose_save_job",
        "description": "Propose saving a specific job to candidate's saved vacancies. (Requires user confirmation before execution).",
        "input_schema": {
            "type": "object",
            "properties": {
                "job_id": {"type": "integer", "description": "ID of the job to save"}
            },
            "required": ["job_id"]
        }
    },
    {
        "name": "propose_create_learning_roadmap",
        "description": "Propose generating and saving a personalized 6-week skill gap learning roadmap. (Requires user confirmation before execution).",
        "input_schema": {
            "type": "object",
            "properties": {
                "target_role": {"type": "string", "description": "Target job title"},
                "skills_to_learn": {"type": "array", "items": {"type": "string"}, "description": "List of key skills to prioritize"}
            },
            "required": ["target_role", "skills_to_learn"]
        }
    },
    {
        "name": "propose_create_job_application",
        "description": "Propose creating a new tracked job application record. (Requires user confirmation before execution).",
        "input_schema": {
            "type": "object",
            "properties": {
                "company_name": {"type": "string"},
                "job_title": {"type": "string"},
                "job_id": {"type": "integer", "description": "Optional associated job ID"}
            },
            "required": ["company_name", "job_title"]
        }
    }
]


# -------------------------------------------------------------------------
# Tool Execution Handlers
# -------------------------------------------------------------------------
def execute_tool(
    tool_name: str,
    tool_input: Dict[str, Any],
    user: User,
    db: Session,
    conv_id: int
) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
    """
    Executes a registered tool. Returns (result_dict, pending_action_or_none).
    """
    profile = user.profile
    pending_action = None

    if tool_name == "get_user_profile":
        return {
            "full_name": user.full_name,
            "preferred_role": profile.preferred_role if profile else "Software Engineer",
            "years_of_experience": profile.years_of_experience if profile else 1.0,
            "existing_skills": profile.existing_skills if profile and profile.existing_skills else [],
            "career_goals": profile.career_goals if profile else "Advance in tech",
            "work_mode": profile.work_mode if profile else "remote"
        }, None

    elif tool_name == "get_selected_resume":
        resume_id = tool_input.get("resume_id")
        q = db.query(Resume).filter(Resume.user_id == user.id)
        resume = q.filter(Resume.id == resume_id).first() if resume_id else q.order_by(Resume.id.desc()).first()
        if not resume:
            return {"error": "No resume found for this candidate."}, None

        ext = resume.extracted_data or {}
        return {
            "resume_id": resume.id,
            "filename": resume.filename,
            "skills": ext.get("skills", []),
            "experience_years": ext.get("experience_years", 0.0),
            "education": ext.get("education", []),
            "raw_text_snippet": (resume.raw_text[:500] + "...") if resume.raw_text else ""
        }, None

    elif tool_name == "analyze_resume":
        resume_id = tool_input.get("resume_id")
        q = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == user.id)
        analysis = q.filter(ResumeAnalysis.resume_id == resume_id).first() if resume_id else q.order_by(ResumeAnalysis.id.desc()).first()
        if not analysis:
            return {"error": "No ATS analysis available yet. Suggest running an audit from the Resume Library."}, None

        overview = analysis.overview or {}
        verdict = overview.get("verdict")
        if not verdict:
            verdict = "Strong Profile" if analysis.overall_score >= 80 else ("Moderate Alignment" if analysis.overall_score >= 60 else "Needs Attention")

        return {
            "overall_score": analysis.overall_score,
            "verdict": verdict,
            "rubric_scores": analysis.rubric_scores or {},
            "strengths": analysis.strengths or [],
            "weaknesses": analysis.weaknesses or [],
            "missing_info": analysis.missing_info or [],
            "improvements": analysis.improvements or []
        }, None

    elif tool_name == "search_available_jobs":
        query_str = tool_input.get("query", "").lower()
        loc = tool_input.get("location", "").lower()
        jobs_q = db.query(Job)
        if query_str:
            jobs_q = jobs_q.filter(Job.title.ilike(f"%{query_str}%") | Job.description.ilike(f"%{query_str}%"))
        if loc:
            jobs_q = jobs_q.filter(Job.location.ilike(f"%{loc}%"))
        matched_jobs = jobs_q.limit(4).all()

        return {
            "jobs_count": len(matched_jobs),
            "jobs": [
                {
                    "id": j.id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "work_mode": j.work_mode,
                    "salary_range": j.salary_range or "Competitive",
                    "required_skills": j.required_skills or []
                }
                for j in matched_jobs
            ]
        }, None

    elif tool_name == "match_resume_to_job":
        job_id = tool_input.get("job_id")
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": f"Job ID {job_id} not found."}, None

        resume_id = tool_input.get("resume_id")
        q = db.query(Resume).filter(Resume.user_id == user.id)
        resume = q.filter(Resume.id == resume_id).first() if resume_id else q.order_by(Resume.id.desc()).first()

        resume_skills = (resume.extracted_data or {}).get("skills", []) if resume else []
        candidate_skills = resume_skills if resume_skills else (profile.existing_skills if profile else [])
        match_res = match_job_description(
            resume_text=resume.raw_text if resume else f"Skills: {', '.join(candidate_skills)}",
            job_title=job.title,
            job_description=job.description,
            company_name=job.company
        )
        return {
            "job_title": job.title,
            "company": job.company,
            "overall_match": match_res.get("overall_match_score", 75),
            "matched_skills": match_res.get("matched_skills", []),
            "missing_skills": match_res.get("missing_skills", []),
            "verdict": match_res.get("verdict", "Good Match")
        }, None

    elif tool_name == "get_skill_gaps":
        target_role = tool_input.get("target_role") or (profile.preferred_role if profile else "Full Stack Developer")
        cand_skills = profile.existing_skills if profile and profile.existing_skills else []
        latest_res = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.id.desc()).first()
        latest_res_skills = (latest_res.extracted_data or {}).get("skills", []) if latest_res else []
        if latest_res_skills:
            cand_skills = list(set(cand_skills + latest_res_skills))

        # Benchmarks
        benchmarks = {
            "frontend": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux", "Testing", "Web Performance"],
            "backend": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "Microservices", "System Design"],
            "full stack": ["TypeScript", "React", "Python", "Docker", "PostgreSQL", "REST APIs", "AWS"],
            "devops": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Monitoring"],
            "ai": ["Python", "PyTorch", "LLMs", "RAG", "LangChain", "Vector Databases", "Prompt Engineering"]
        }
        matched_bench = benchmarks.get("full stack")
        for k, v in benchmarks.items():
            if k in target_role.lower():
                matched_bench = v
                break

        missing = [s for s in matched_bench if not any(cs.lower() == s.lower() for cs in cand_skills)]
        present = [s for s in matched_bench if any(cs.lower() == s.lower() for cs in cand_skills)]

        return {
            "target_role": target_role,
            "possessed_competencies": present,
            "critical_skill_gaps": missing,
            "gap_count": len(missing)
        }, None

    elif tool_name == "get_interview_questions":
        category = tool_input.get("category", "technical")
        questions_bank = {
            "technical": [
                {
                    "q": "How would you optimize a slow database query in a high-throughput REST API service?",
                    "eval": "Looks for EXPLAIN ANALYZE understanding, indexing strategy (B-tree, composite), query caching, and connection pooling."
                },
                {
                    "q": "Explain the difference between synchronous blocking I/O and asynchronous event loops in modern web runtimes.",
                    "eval": "Assesses non-blocking execution, event loop architecture, async/await mechanics, and CPU vs I/O bound tasks."
                }
            ],
            "behavioral": [
                {
                    "q": "Describe a scenario where you faced conflicting technical priorities under a strict deployment deadline.",
                    "eval": "Requires STAR format: Situation, Task, Action, Result. Demonstrates engineering pragmatism and stakeholder communication."
                },
                {
                    "q": "Tell me about a time you noticed an unaddressed architectural bug in production and took ownership.",
                    "eval": "Evaluates proactive ownership, root cause analysis (RCA), and blame-free post-mortem execution."
                }
            ],
            "system_design": [
                {
                    "q": "Design an end-to-end scalable resume processing and ATS ranking pipeline capable of handling 50k resumes daily.",
                    "eval": "Focuses on asynchronous job queues (Celery/RabbitMQ), S3 storage, OCR extraction workers, and vectorized similarity indexing."
                }
            ]
        }
        return {"category": category, "questions": questions_bank.get(category, questions_bank["technical"])}, None

    elif tool_name == "get_application_summary":
        apps = db.query(JobApplication).filter(JobApplication.user_id == user.id).all()
        by_status = {}
        for a in apps:
            by_status[a.status] = by_status.get(a.status, 0) + 1
        return {
            "total_applications": len(apps),
            "by_status": by_status,
            "recent": [
                {"company": a.company_name, "title": a.job_title, "status": a.status, "applied_at": str(a.applied_date)}
                for a in apps[:3]
            ]
        }, None

    # --- CONSEQUENTIAL TOOLS (Requires User Approval) ---
    elif tool_name == "propose_save_job":
        job_id = tool_input.get("job_id")
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found"}, None

        act_id = f"act_{uuid.uuid4().hex[:12]}"
        action = ChatPendingAction(
            id=act_id,
            user_id=user.id,
            conversation_id=conv_id,
            action_type="save_job",
            description=f"Save job opening: {job.title} at {job.company}",
            payload={"job_id": job.id, "title": job.title, "company": job.company},
            status="pending",
            expires_at=utcnow() + timedelta(minutes=15)
        )
        db.add(action)
        db.commit()

        pending_action = {
            "action_id": act_id,
            "action_type": "save_job",
            "description": f"Save '{job.title}' at {job.company} to your saved vacancies",
            "payload": action.payload,
            "expires_in_minutes": 15
        }
        return {"proposal_registered": True, "action_id": act_id, "requires_confirmation": True}, pending_action

    elif tool_name == "propose_create_learning_roadmap":
        target_role = tool_input.get("target_role", "Software Engineer")
        skills = tool_input.get("skills_to_learn", ["Docker", "Kubernetes", "AWS"])

        act_id = f"act_{uuid.uuid4().hex[:12]}"
        action = ChatPendingAction(
            id=act_id,
            user_id=user.id,
            conversation_id=conv_id,
            action_type="create_learning_roadmap",
            description=f"Generate 6-week skill gap roadmap for {target_role} ({', '.join(skills)})",
            payload={"target_role": target_role, "missing_skills": skills},
            status="pending",
            expires_at=utcnow() + timedelta(minutes=15)
        )
        db.add(action)
        db.commit()

        pending_action = {
            "action_id": act_id,
            "action_type": "create_learning_roadmap",
            "description": f"Create and save a personalized 6-week sprint roadmap for {target_role}",
            "payload": action.payload,
            "expires_in_minutes": 15
        }
        return {"proposal_registered": True, "action_id": act_id, "requires_confirmation": True}, pending_action

    elif tool_name == "propose_create_job_application":
        comp = tool_input.get("company_name", "Tech Corp")
        title = tool_input.get("job_title", "Software Engineer")
        job_id = tool_input.get("job_id")

        act_id = f"act_{uuid.uuid4().hex[:12]}"
        action = ChatPendingAction(
            id=act_id,
            user_id=user.id,
            conversation_id=conv_id,
            action_type="create_job_application",
            description=f"Track job application for {title} at {comp}",
            payload={"company_name": comp, "job_title": title, "job_id": job_id, "status": "Applied"},
            status="pending",
            expires_at=utcnow() + timedelta(minutes=15)
        )
        db.add(action)
        db.commit()

        pending_action = {
            "action_id": act_id,
            "action_type": "create_job_application",
            "description": f"Add {title} at {comp} to Application Tracker",
            "payload": action.payload,
            "expires_in_minutes": 15
        }
        return {"proposal_registered": True, "action_id": act_id, "requires_confirmation": True}, pending_action

    return {"error": f"Unknown tool: {tool_name}"}, None


# -------------------------------------------------------------------------
# Core Assistant Pipeline
# -------------------------------------------------------------------------
def generate_assistant_response(
    db: Session,
    current_user: User,
    conversation: ChatConversation,
    user_query: str,
    selected_resume_id: Optional[int] = None,
    selected_job_id: Optional[int] = None
) -> Tuple[str, Optional[Dict[str, Any]]]:
    """
    Orchestrates the conversation turn using Anthropic Claude with Tool Use,
    or falls back to deterministic data-grounded intelligence.
    """
    client = get_anthropic_client()
    profile = current_user.profile

    # Determine context details
    q_resume = db.query(Resume).filter(Resume.user_id == current_user.id)
    resume = q_resume.filter(Resume.id == selected_resume_id).first() if selected_resume_id else q_resume.order_by(Resume.id.desc()).first()

    target_job = db.query(Job).filter(Job.id == selected_job_id).first() if selected_job_id else None

    # Retrieve recent message history
    history_records = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.created_at.asc())
        .limit(12)
        .all()
    )

    system_instruction = (
        "You are 'CareerPilot Assistant', an authoritative, highly knowledgeable, and honest AI career strategist and senior engineering recruiter.\n"
        "Your mission is to guide tech candidates with factual, rigorous, and explainable career intelligence.\n\n"
        "CORE PRINCIPLES:\n"
        "1. Never invent job listings, salaries, hiring guarantees, or fake resume accomplishments.\n"
        "2. Ground your advice in the user's actual database profile and resume evidence.\n"
        "3. Use the provided tools to inspect candidate records, search jobs, match qualifications, or practice interviews.\n"
        "4. If suggesting consequential changes (e.g. saving a job, creating an application, generating a roadmap), call the appropriate propose_* tool so the candidate can confirm.\n"
        "5. Format responses cleanly in GitHub-flavored Markdown with bold callouts, bullet lists, code blocks, or structured tables.\n\n"
        f"CANDIDATE CONTEXT:\n"
        f"- Full Name: {current_user.full_name}\n"
        f"- Target Role: {profile.preferred_role if profile else 'Full Stack Developer'}\n"
        f"- Experience Level: {profile.years_of_experience if profile else 1.0} years\n"
        f"- Active Resume: {resume.filename if resume else 'None uploaded'}\n"
        f"- Target Job Context: {target_job.title + ' at ' + target_job.company if target_job else 'None explicitly selected'}\n"
    )

    pending_action = None

    if client:
        try:
            model_name = settings.ANTHROPIC_MODEL or "claude-haiku-5-5"

            # Build messages array for Claude
            claude_messages: List[Dict[str, Any]] = []
            for h in history_records[:-1]:  # previous messages
                if h.role in ["user", "assistant"]:
                    claude_messages.append({"role": h.role, "content": h.content})

            # Append current user prompt
            claude_messages.append({"role": "user", "content": user_query})

            # Initial call to Claude with tools
            response = client.messages.create(
                model=model_name,
                max_tokens=2048,
                system=system_instruction,
                messages=claude_messages,
                tools=ASSISTANT_TOOLS
            )

            # Check if Claude called any tools
            tool_calls = [c for c in response.content if getattr(c, "type", "") == "tool_use"]

            if tool_calls:
                # Add assistant turn with tool_use blocks
                claude_messages.append({
                    "role": "assistant",
                    "content": response.content
                })

                tool_results_content = []
                for tc in tool_calls:
                    tool_res, act = execute_tool(tc.name, tc.input, current_user, db, conversation.id)
                    if act:
                        pending_action = act
                    tool_results_content.append({
                        "type": "tool_result",
                        "tool_use_id": tc.id,
                        "content": json.dumps(tool_res)
                    })

                claude_messages.append({
                    "role": "user",
                    "content": tool_results_content
                })

                # Second turn: Claude synthesizes tool results
                second_response = client.messages.create(
                    model=model_name,
                    max_tokens=2048,
                    system=system_instruction,
                    messages=claude_messages
                )

                reply_text = "".join(
                    block.text for block in second_response.content if getattr(block, "type", "") == "text" or hasattr(block, "text")
                ).strip()

                if pending_action:
                    reply_text += (
                        f"\n\n---\n> **Approval Required**: I have prepared the requested action: "
                        f"**{pending_action['description']}**. Please confirm using the action card below."
                    )

                return reply_text, pending_action

            else:
                # Direct text response without tool call
                reply_text = "".join(
                    block.text for block in response.content if getattr(block, "type", "") == "text" or hasattr(block, "text")
                ).strip()
                return reply_text, None

        except Exception as e:
            logger.warning(f"Anthropic Claude API call encountered error: {e}. Falling back to deterministic engine.")

    # -------------------------------------------------------------------------
    # Deterministic Career Intelligence Fallback
    # -------------------------------------------------------------------------
    query_lower = user_query.lower()

    if any(k in query_lower for k in ["analyze", "audit", "score", "ats"]):
        res_info, _ = execute_tool("analyze_resume", {"resume_id": selected_resume_id}, current_user, db, conversation.id)
        if "error" in res_info:
            return (
                "### 📄 Resume Analysis Notice\n\n"
                "I couldn't locate an existing ATS audit for your profile yet. "
                "Head over to the **[Resume Library](/resumes)** and upload or trigger a 100-point audit to see explainable rubric scores.",
                None
            )
        return (
            f"### 🎯 Resume Intelligence Audit Overview\n\n"
            f"Here is the ATS breakdown for your active resume:\n\n"
            f"- **Overall ATS Score:** `{res_info.get('overall_score', 0)} / 100` ({res_info.get('verdict', 'Needs Attention')})\n"
            f"- **Structure & Readability:** `{res_info.get('rubric_scores', {}).get('structure_readability', 0)} / 25`\n"
            f"- **Skills & Technical Relevance:** `{res_info.get('rubric_scores', {}).get('skills_technical_relevance', 0)} / 30`\n"
            f"- **Projects & Experience:** `{res_info.get('rubric_scores', {}).get('projects_experience', 0)} / 20`\n"
            f"- **Clarity & Impact:** `{res_info.get('rubric_scores', {}).get('clarity_impact', 0)} / 15`\n\n"
            f"**High-Priority Weaknesses Detected:**\n"
            + "\n".join([f"- {w}" for w in res_info.get("weaknesses", [])[:3]])
            + "\n\n💡 *Actionable Advice:* Rewrite your latest bullet points using Google's XYZ formula: *'Accomplished [X], measured by [Y], by doing [Z]'*.",
            None
        )

    elif any(k in query_lower for k in ["job", "vacanc", "opening", "find", "search"]):
        job_res, _ = execute_tool("search_available_jobs", {"query": profile.preferred_role if profile else "Software"}, current_user, db, conversation.id)
        job_cards = []
        for j in job_res.get("jobs", []):
            job_cards.append(
                f"1. **{j['title']}** at **{j['company']}**\n"
                f"   - 📍 Location: `{j['location']}` ({j['work_mode']})\n"
                f"   - 💰 Compensation: `{j['salary_range']}`\n"
                f"   - 🛠 Key Skills: {', '.join(j['required_skills'][:4])}"
            )
        return (
            "### 💼 Verified Matching Vacancies\n\n"
            "I scanned the CareerPilot database for verified roles matching your background:\n\n"
            + "\n\n".join(job_cards)
            + "\n\nWould you like me to match your resume against any of these roles, or save one to your tracker?",
            None
        )

    elif any(k in query_lower for k in ["gap", "missing skill", "skills"]):
        gap_res, _ = execute_tool("get_skill_gaps", {}, current_user, db, conversation.id)
        missing = gap_res.get("critical_skill_gaps", [])
        return (
            f"### 🔍 Skill Gap Analysis for **{gap_res.get('target_role')}**\n\n"
            f"Comparing your resume against current market requirements, here are your prioritized skill gaps:\n\n"
            + "\n".join([f"- **{s}**: Essential for mid-to-senior tech screening rubrics." for s in missing[:4]])
            + "\n\n🚀 Would you like me to generate a personalized **6-week sprint roadmap** to bridge these gaps?",
            None
        )

    elif any(k in query_lower for k in ["roadmap", "learning", "plan", "sprint"]):
        # Propose creating a roadmap
        _, pending_action = execute_tool(
            "propose_create_learning_roadmap",
            {"target_role": profile.preferred_role if profile else "Full Stack Developer", "skills_to_learn": ["Docker", "Kubernetes", "AWS"]},
            current_user, db, conversation.id
        )
        return (
            f"### 🗺️ Proposed 6-Week Learning Sprint\n\n"
            f"I have designed a 6-week technical acceleration roadmap targeting **{profile.preferred_role if profile else 'Full Stack Developer'}**.\n\n"
            f"Because generating and storing this roadmap updates your saved career roadmaps, please approve the proposal below.",
            pending_action
        )

    elif any(k in query_lower for k in ["interview", "mock", "star", "question"]):
        cat = "behavioral" if "behavioral" in query_lower else "technical"
        iq_res, _ = execute_tool("get_interview_questions", {"category": cat}, current_user, db, conversation.id)
        first_q = iq_res.get("questions", [{}])[0]
        return (
            f"### 🎙️ Mock Interview Practice: {cat.capitalize()}\n\n"
            f"**Question:**\n> {first_q.get('q', 'Tell me about an impactful engineering project.')}\n\n"
            f"**Recruiter Rubric:**\n{first_q.get('eval', 'Evaluates structural clarity, depth, and quantifiable impact.')}\n\n"
            f"Try typing your answer below! I will grade it on technical depth and structural delivery.",
            None
        )

    elif any(k in query_lower for k in ["code", "python", "javascript", "sql", "function", "complexity"]):
        return (
            "### 💻 Technical Coding Assistance\n\n"
            "Here is an example of an optimized LRU Cache implementation in Python with **O(1)** `get` and `put` time complexity:\n\n"
            "```python\n"
            "from collections import OrderedDict\n\n"
            "class LRUCache:\n"
            "    def __init__(self, capacity: int):\n"
            "        self.capacity = capacity\n"
            "        self.cache = OrderedDict()\n\n"
            "    def get(self, key: int) -> int:\n"
            "        if key not in self.cache:\n"
            "            return -1\n"
            "        self.cache.move_to_end(key)\n"
            "        return self.cache[key]\n\n"
            "    def put(self, key: int, value: int) -> None:\n"
            "        if key in self.cache:\n"
            "            self.cache.move_to_end(key)\n"
            "        self.cache[key] = value\n"
            "        if len(self.cache) > self.capacity:\n"
            "            self.cache.popitem(last=False)  # Evict oldest\n"
            "```\n\n"
            "- **Time Complexity:** $O(1)$ for both `get` and `put` using hash map + doubly linked list order.\n"
            "- **Space Complexity:** $O(C)$ where $C$ is cache capacity.\n\n"
            "Feel free to paste any of your own code snippets for optimization or bug review!",
            None
        )

    # General Career Strategy Response
    return (
        f"Hello {current_user.full_name.split()[0]}! I am **CareerPilot Assistant**, your AI career strategist and engineering mentor.\n\n"
        f"Grounded in your profile as a **{profile.preferred_role if profile else 'Candidate'}**, here is how I can assist you today:\n\n"
        f"- **Audit Resume Bullets:** Rewrite project achievements into Google's XYZ metrics.\n"
        f"- **Identify Skill Gaps:** Run benchmark comparisons against modern market standards.\n"
        f"- **Search Real Vacancies:** Match your skills against active roles in our database.\n"
        f"- **Technical & STAR Mock Practice:** Drill system design, algorithms, and behavioral questions.\n\n"
        f"Select a prompt below or type your question to get started!",
        None
    )
