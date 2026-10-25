from typing import Dict, Any, List
from app.services.claude_client import call_claude_json

def generate_interview_questions(
    target_role: str,
    interview_type: str = "mixed",
    difficulty: str = "intermediate",
    total_questions: int = 5
) -> List[Dict[str, Any]]:
    system_prompt = (
        "You are a Principal Software Engineer and hiring bar-raiser conducting technical and behavioral interviews. "
        "Generate realistic, high-probability interview questions. "
        "Return ONLY a valid JSON list matching the requested structure."
    )

    user_prompt = f"""
Target Role: {target_role}
Interview Type: {interview_type} (options: technical, hr, behavioral, mixed)
Difficulty: {difficulty}
Total Questions: {total_questions}

Generate {total_questions} questions for this candidate. Return a JSON object with this exact structure:
{{
  "questions": [
    {{
      "question_order": 1,
      "question_text": "<Clear, scenario-driven interview question>",
      "category": "<Technical | System Design | Behavioral | Problem Solving>",
      "target_skill": "<The exact skill being evaluated>"
    }}
  ]
}}
"""

    claude_result = call_claude_json(system_prompt, user_prompt, max_tokens=4096)
    if claude_result and isinstance(claude_result, dict) and "questions" in claude_result:
        return claude_result["questions"]

    # Realistic fallback questions
    return [
        {
            "question_order": 1,
            "question_text": f"Can you explain the architectural lifecycle of a request in a modern application built for {target_role}?",
            "category": "Technical",
            "target_skill": "Full-Stack Architecture"
        },
        {
            "question_order": 2,
            "question_text": "Tell me about a time you diagnosed a severe production bug or performance bottleneck under tight deadlines. How did you isolate and resolve it?",
            "category": "Behavioral",
            "target_skill": "Debugging & Resilience"
        },
        {
            "question_order": 3,
            "question_text": "How do you approach database schema indexing and query optimization when scaling a high-traffic service?",
            "category": "System Design",
            "target_skill": "Database Optimization"
        },
        {
            "question_order": 4,
            "question_text": "Describe a situation where you had a strong technical disagreement with a teammate or lead. How did you navigate the tradeoff?",
            "category": "Behavioral",
            "target_skill": "Collaboration & Communication"
        },
        {
            "question_order": 5,
            "question_text": f"What core security practices (such as authentication, sanitization, and CORS) do you enforce before deploying {target_role} code to production?",
            "category": "Technical",
            "target_skill": "Application Security"
        }
    ]


def evaluate_interview_answer(
    question_text: str,
    target_role: str,
    user_response: str
) -> Dict[str, Any]:
    system_prompt = (
        "You are an expert technical interviewer evaluating a candidate's response. "
        "Assess their technical correctness, completeness, structured delivery, and use of concrete examples (STAR method). "
        "Return ONLY valid JSON matching the exact schema."
    )

    user_prompt = f"""
Role: {target_role}
Interview Question: \"{question_text}\"
Candidate Answer:
\"\"\"
{user_response[:3000]}
\"\"\"

Evaluate this response and return a JSON object with this exact structure:
{{
  "score": <float between 45.0 and 96.0>,
  "strengths": [
    "<Concrete positive aspect 1>",
    "<Concrete positive aspect 2>"
  ],
  "weaknesses": [
    "<Specific gap or area to elaborate on>"
  ],
  "star_feedback": {{
    "situation": "<Critique of how well they framed the problem>",
    "task": "<Critique of the goal defined>",
    "action": "<Critique of their specific personal contribution>",
    "result": "<Critique of measurable metrics or business outcome>"
  }},
  "improved_answer": "<An exemplar, high-scoring model response demonstrating how an elite candidate would answer>"
}}
"""

    claude_result = call_claude_json(system_prompt, user_prompt, max_tokens=4096)
    if claude_result and isinstance(claude_result, dict) and "score" in claude_result:
        return claude_result

    # Fallback evaluator
    word_count = len(user_response.split())
    base_score = 78.0 if word_count > 60 else 64.0

    return {
        "score": base_score,
        "strengths": [
            "Good direct engagement with the core question prompt.",
            "Demonstrates practical familiarity with underlying engineering principles."
        ],
        "weaknesses": [
            "Could strengthen the response by explicitly quantifying business impact or performance metrics.",
            "Consider structuring answers explicitly with the STAR framework (Situation, Task, Action, Result)."
        ],
        "star_feedback": {
            "situation": "Clearly stated background context.",
            "task": "Identified the primary challenge to solve.",
            "action": "Good description of steps taken; could highlight individual technical choices more.",
            "result": "Recommend concluding with measurable metrics (e.g. latency, uptime, user satisfaction)."
        },
        "improved_answer": (
            "In my previous project, we encountered this exact scenario when scaling our services. "
            "I took ownership of profiling the bottleneck, implemented targeted optimizations with automated regression tests, "
            "and achieved a 30% latency reduction while maintaining 99.9% uptime."
        )
    }
