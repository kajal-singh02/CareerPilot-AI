from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.entities import User, InterviewSession, InterviewQuestion, InterviewAnswer
from app.schemas.schemas import InterviewStartRequest, InterviewSessionOut
from app.services.interview_service import generate_interview_questions, evaluate_interview_answer

router = APIRouter()

class AnswerSubmission(BaseModel):
    question_id: int
    user_response: str

@router.post("/start", response_model=InterviewSessionOut)
def start_interview_session(
    req: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    questions_data = generate_interview_questions(
        target_role=req.target_role,
        interview_type=req.interview_type,
        difficulty=req.difficulty,
        total_questions=req.total_questions
    )

    session = InterviewSession(
        user_id=current_user.id,
        target_role=req.target_role,
        interview_type=req.interview_type,
        difficulty=req.difficulty,
        total_questions=len(questions_data),
        current_index=0,
        status="in_progress"
    )
    db.add(session)
    db.flush()

    for idx, q in enumerate(questions_data, start=1):
        question = InterviewQuestion(
            session_id=session.id,
            question_order=idx,
            question_text=q.get("question_text", "Describe your experience."),
            category=q.get("category", "Technical"),
            target_skill=q.get("target_skill", "General")
        )
        db.add(question)

    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=List[InterviewSessionOut])
def list_interview_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.id.desc()).all()


@router.get("/{session_id}", response_model=InterviewSessionOut)
def get_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session


@router.post("/{session_id}/answer")
def submit_question_answer(
    session_id: int,
    submission: AnswerSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == submission.question_id, InterviewQuestion.session_id == session.id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found in this session")

    eval_result = evaluate_interview_answer(
        question_text=question.question_text,
        target_role=session.target_role,
        user_response=submission.user_response
    )

    # Check if answer already exists
    existing = db.query(InterviewAnswer).filter(InterviewAnswer.question_id == question.id).first()
    if existing:
        existing.user_response = submission.user_response
        existing.score = eval_result.get("score", 75.0)
        existing.strengths = eval_result.get("strengths", [])
        existing.weaknesses = eval_result.get("weaknesses", [])
        existing.star_feedback = eval_result.get("star_feedback", {})
        existing.improved_answer = eval_result.get("improved_answer", "")
        answer = existing
    else:
        answer = InterviewAnswer(
            question_id=question.id,
            user_response=submission.user_response,
            score=eval_result.get("score", 75.0),
            strengths=eval_result.get("strengths", []),
            weaknesses=eval_result.get("weaknesses", []),
            star_feedback=eval_result.get("star_feedback", {}),
            improved_answer=eval_result.get("improved_answer", "")
        )
        db.add(answer)

    session.current_index = min(session.current_index + 1, session.total_questions)
    db.commit()

    return {
        "success": True,
        "evaluation": eval_result,
        "next_index": session.current_index
    }


@router.post("/{session_id}/complete", response_model=InterviewSessionOut)
def complete_interview_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    answers = (
        db.query(InterviewAnswer)
        .join(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session.id)
        .all()
    )

    if answers:
        avg_score = sum(a.score for a in answers) / len(answers)
        session.overall_score = round(avg_score, 1)
        session.feedback_summary = (
            f"Candidate successfully completed all {len(answers)} questions with an average score of {session.overall_score}%. "
            f"Demonstrated good clarity and foundational depth with opportunities to incorporate more quantifiable metrics."
        )
    else:
        session.overall_score = 0.0
        session.feedback_summary = "Session closed without submitted answers."

    session.status = "completed"
    db.commit()
    db.refresh(session)
    return session
