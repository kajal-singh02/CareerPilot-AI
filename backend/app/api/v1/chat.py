import logging
from typing import List
from datetime import timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.entities import (
    User, ChatConversation, ChatMessage, ChatPendingAction,
    SavedJob, LearningRoadmap, RoadmapMilestone, JobApplication
)
from app.schemas.schemas import (
    ChatMessageCreate, ConversationCreate,
    ConversationUpdate, ConversationOut, ToolConfirmationRequest,
    ToolConfirmationResponse
)
from app.services.chat_service import generate_assistant_response, utcnow
from app.services.roadmap_service import generate_learning_roadmap

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/")
def send_chat_message(
    msg_in: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sends a message to the AI career assistant. Orchestrates tool calling and context grounding.
    """
    if not msg_in.content or not msg_in.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")

    conv = None
    if msg_in.conversation_id:
        conv = (
            db.query(ChatConversation)
            .filter(ChatConversation.id == msg_in.conversation_id, ChatConversation.user_id == current_user.id)
            .first()
        )

    if not conv:
        # Create a new conversation with automatic title
        title = (msg_in.content[:40] + "...") if len(msg_in.content) > 40 else msg_in.content
        conv = ChatConversation(
            user_id=current_user.id,
            title=title,
            selected_resume_id=msg_in.selected_resume_id,
            selected_job_id=msg_in.selected_job_id
        )
        db.add(conv)
        db.flush()
    else:
        # Update conversation context if provided
        if msg_in.selected_resume_id is not None:
            conv.selected_resume_id = msg_in.selected_resume_id
        if msg_in.selected_job_id is not None:
            conv.selected_job_id = msg_in.selected_job_id

    # Record User Message
    user_msg = ChatMessage(conversation_id=conv.id, role="user", content=msg_in.content.strip())
    db.add(user_msg)
    db.flush()

    # Generate Assistant Response (with Claude / tools / data grounding)
    reply_text, pending_action = generate_assistant_response(
        db=db,
        current_user=current_user,
        conversation=conv,
        user_query=msg_in.content.strip(),
        selected_resume_id=conv.selected_resume_id,
        selected_job_id=conv.selected_job_id
    )

    metadata = None
    if pending_action:
        metadata = {"action_required": pending_action}

    bot_msg = ChatMessage(
        conversation_id=conv.id,
        role="assistant",
        content=reply_text,
        metadata_json=metadata
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return {
        "conversation_id": conv.id,
        "message_id": bot_msg.id,
        "role": "assistant",
        "content": bot_msg.content,
        "metadata_json": bot_msg.metadata_json,
        "created_at": bot_msg.created_at
    }


@router.get("/conversations", response_model=List[ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lists all saved conversations for the authenticated candidate.
    """
    return (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id)
        .order_by(ChatConversation.updated_at.desc(), ChatConversation.id.desc())
        .all()
    )


@router.post("/conversations", response_model=ConversationOut)
def create_conversation(
    conv_in: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new conversation thread with optional selected context.
    """
    conv = ChatConversation(
        user_id=current_user.id,
        title=conv_in.title or "New Career Strategy Session",
        selected_resume_id=conv_in.selected_resume_id,
        selected_job_id=conv_in.selected_job_id
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@router.get("/conversations/{conv_id}", response_model=ConversationOut)
def get_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves a single conversation with complete message history.
    """
    conv = (
        db.query(ChatConversation)
        .filter(ChatConversation.id == conv_id, ChatConversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.patch("/conversations/{conv_id}", response_model=ConversationOut)
def update_conversation(
    conv_id: int,
    conv_up: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Renames a conversation or updates active context (resume/job).
    """
    conv = (
        db.query(ChatConversation)
        .filter(ChatConversation.id == conv_id, ChatConversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conv_up.title is not None:
        conv.title = conv_up.title.strip()
    if conv_up.selected_resume_id is not None:
        conv.selected_resume_id = conv_up.selected_resume_id
    if conv_up.selected_job_id is not None:
        conv.selected_job_id = conv_up.selected_job_id

    db.commit()
    db.refresh(conv)
    return conv


@router.delete("/conversations/{conv_id}")
def delete_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletes a conversation and its messages.
    """
    conv = (
        db.query(ChatConversation)
        .filter(ChatConversation.id == conv_id, ChatConversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully", "id": conv_id}


@router.post("/tool-confirmations/{action_id}", response_model=ToolConfirmationResponse)
def confirm_tool_action(
    action_id: str,
    req: ToolConfirmationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes or cancels a consequential tool action previously proposed by the AI Assistant.
    """
    action = (
        db.query(ChatPendingAction)
        .filter(ChatPendingAction.id == action_id, ChatPendingAction.user_id == current_user.id)
        .first()
    )
    if not action:
        raise HTTPException(status_code=404, detail="Pending action not found or unauthorized.")

    if action.status != "pending":
        raise HTTPException(status_code=400, detail=f"Action has already been {action.status}.")

    # Make expires_at timezone aware if needed
    exp = action.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)

    if utcnow() > exp:
        action.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="This action confirmation request has expired.")

    # User declined action
    if not req.confirmed:
        action.status = "cancelled"
        decline_msg = ChatMessage(
            conversation_id=action.conversation_id,
            role="assistant",
            content=f"❌ **Action Cancelled**: You chose not to execute: *{action.description}*."
        )
        db.add(decline_msg)
        db.commit()
        return ToolConfirmationResponse(
            success=False,
            message="Action was cancelled.",
            action_type=action.action_type,
            conversation_id=action.conversation_id
        )

    # User confirmed action - execute server-side!
    result_data = None
    exec_summary = action.description

    try:
        if action.action_type == "save_job":
            job_id = action.payload.get("job_id")
            existing = (
                db.query(SavedJob)
                .filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id)
                .first()
            )
            if not existing:
                saved = SavedJob(user_id=current_user.id, job_id=job_id)
                db.add(saved)
            result_data = {"saved_job_id": job_id}
            exec_summary = f"Saved job '{action.payload.get('title')}' to your saved opportunities"

        elif action.action_type == "create_learning_roadmap":
            target_role = action.payload.get("target_role", "Engineering")
            missing = action.payload.get("missing_skills", ["Cloud", "System Design"])
            profile = current_user.profile
            user_skills = profile.existing_skills if profile and profile.existing_skills else []

            roadmap_dict = generate_learning_roadmap(target_role, user_skills, missing)
            roadmap = LearningRoadmap(
                user_id=current_user.id,
                target_role=target_role,
                objective=roadmap_dict.get("objective", f"Bridge key competencies for {target_role}"),
                total_weeks=roadmap_dict.get("total_weeks", 6)
            )
            db.add(roadmap)
            db.flush()

            for m in roadmap_dict.get("milestones", []):
                db.add(RoadmapMilestone(
                    roadmap_id=roadmap.id,
                    week_number=m.get("week_number", 1),
                    title=m.get("title", "Milestone"),
                    description=m.get("description", ""),
                    skills=m.get("skills", []),
                    tasks=m.get("tasks", []),
                    project_idea=m.get("project_idea"),
                    resources=m.get("resources", []),
                    is_completed=False
                ))

            result_data = {"roadmap_id": roadmap.id, "target_role": target_role}
            exec_summary = f"Created and saved a personalized 6-week roadmap for '{target_role}'"

        elif action.action_type == "create_job_application":
            app_rec = JobApplication(
                user_id=current_user.id,
                job_id=action.payload.get("job_id"),
                company_name=action.payload.get("company_name", "Company"),
                job_title=action.payload.get("job_title", "Software Engineer"),
                status=action.payload.get("status", "Applied")
            )
            db.add(app_rec)
            db.flush()
            result_data = {"application_id": app_rec.id}
            exec_summary = f"Tracked application for '{app_rec.job_title}' at {app_rec.company_name}"

        action.status = "executed"

        # Record system feedback in conversation
        confirm_msg = ChatMessage(
            conversation_id=action.conversation_id,
            role="assistant",
            content=f"✅ **Action Confirmed & Executed**: {exec_summary}."
        )
        db.add(confirm_msg)
        db.commit()

        return ToolConfirmationResponse(
            success=True,
            message=f"Successfully executed: {exec_summary}",
            action_type=action.action_type,
            conversation_id=action.conversation_id,
            result=result_data
        )

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to execute confirmed action {action_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error executing action: {str(e)}")
