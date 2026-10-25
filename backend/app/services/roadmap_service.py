from typing import Dict, Any, List
from app.services.claude_client import call_claude_json

def generate_learning_roadmap(
    target_role: str,
    user_skills: List[str],
    missing_skills: List[str]
) -> Dict[str, Any]:
    system_prompt = (
        "You are an engineering career mentor and curriculum designer. "
        "Create a rigorous, structured 6-week learning sprint designed to bridge the candidate's exact technical gaps. "
        "Return ONLY valid JSON matching the exact schema."
    )

    user_prompt = f"""
Target Role: {target_role}
Candidate Current Skills: {', '.join(user_skills) if user_skills else 'Baseline programming'}
Missing/Gap Skills: {', '.join(missing_skills) if missing_skills else 'Docker, Kubernetes, Cloud Architecture, System Design'}

Create a 6-week curriculum. Return a JSON object with this exact structure:
{{
  "objective": "<1-2 sentence executive learning objective for {target_role}>",
  "total_weeks": 6,
  "milestones": [
    {{
      "week_number": 1,
      "title": "<Sprint Title>",
      "description": "<Deep dive into first priority competency>",
      "skills": ["<Skill 1>", "<Skill 2>"],
      "tasks": [
        "<Hands-on task 1>",
        "<Hands-on task 2>",
        "<Hands-on task 3>"
      ],
      "project_idea": "<Portfolio-ready mini project>",
      "resources": [
        {{"title": "<Official Docs / Course>", "url": "https://docs.docker.com", "type": "Documentation"}},
        {{"title": "<Interactive Tutorial>", "url": "https://roadmap.sh", "type": "Guide"}}
      ]
    }}
  ]
}}
"""

    claude_result = call_claude_json(system_prompt, user_prompt, max_tokens=6000)
    if claude_result and isinstance(claude_result, dict) and "milestones" in claude_result:
        return claude_result

    # High quality fallback roadmap
    gaps = missing_skills or ["Docker", "Kubernetes", "CI/CD", "AWS", "System Design", "Microservices"]
    primary = gaps[0] if len(gaps) > 0 else "Containerization"
    secondary = gaps[1] if len(gaps) > 1 else "Cloud Architecture"

    return {
        "objective": f"Systematically close high-priority technical gaps to achieve production-readiness for {target_role}.",
        "total_weeks": 6,
        "milestones": [
            {
                "week_number": 1,
                "title": f"Foundations of {primary} & Environment Setup",
                "description": f"Master core syntax, configuration patterns, and container architecture for {primary}.",
                "skills": [primary, "CLI", "Environment Variables"],
                "tasks": [
                    f"Set up local development container and configure production build scripts for {primary}.",
                    "Implement multi-stage build optimization to reduce artifact footprint.",
                    "Integrate automated linting and security scanning."
                ],
                "project_idea": "Containerized microservice with health checks and optimized layered caching.",
                "resources": [
                    {"title": f"Official {primary} Documentation", "url": "https://docs.docker.com", "type": "Documentation"},
                    {"title": "Modern Developer Roadmaps", "url": "https://roadmap.sh", "type": "Guide"}
                ]
            },
            {
                "week_number": 2,
                "title": "Orchestration & Resilient Networking",
                "description": "Learn service mesh, container networking, volumes, and deployment definitions.",
                "skills": ["Service Discovery", "Networking", "ConfigMaps"],
                "tasks": [
                    "Configure ingress controllers and reverse proxies with SSL termination.",
                    "Set up persistent storage volumes and stateful services.",
                    "Simulate failover and container self-healing policies."
                ],
                "project_idea": "Multi-container app with Redis cache layer and automated restart policy.",
                "resources": [
                    {"title": "Kubernetes Official Tutorials", "url": "https://kubernetes.io/docs/tutorials/", "type": "Documentation"}
                ]
            },
            {
                "week_number": 3,
                "title": "Production Pipelines & Automated CI/CD",
                "description": "Build automated GitHub Actions workflows running unit, integration, and security checks.",
                "skills": ["GitHub Actions", "CI/CD", "Automated Testing"],
                "tasks": [
                    "Write end-to-end GitHub Actions workflow triggering on pull requests.",
                    "Set up automated unit test matrix and test coverage badge reporting.",
                    "Configure zero-downtime deployment script to cloud registry."
                ],
                "project_idea": "Complete CI/CD delivery pipeline for full-stack repository.",
                "resources": [
                    {"title": "GitHub Actions Documentation", "url": "https://docs.github.com/en/actions", "type": "Documentation"}
                ]
            },
            {
                "week_number": 4,
                "title": f"Cloud Services & Infrastructure ({secondary})",
                "description": f"Deploy serverless or containerized compute using cloud infrastructure primitives in {secondary}.",
                "skills": [secondary, "IAM Policies", "Cloud Storage"],
                "tasks": [
                    "Provision cloud database with automated daily snapshots and backups.",
                    "Configure least-privilege IAM roles and access key management.",
                    "Deploy production service behind a cloud load balancer."
                ],
                "project_idea": "Cloud-native web service with object storage bucket integration.",
                "resources": [
                    {"title": "AWS Free Tier & Architectures", "url": "https://aws.amazon.com/free/", "type": "Guide"}
                ]
            },
            {
                "week_number": 5,
                "title": "Observability, Telemetry & Performance Profiling",
                "description": "Set up structured JSON logging, distributed tracing, and Prometheus metrics monitoring.",
                "skills": ["Telemetry", "Logging", "APM Profiling"],
                "tasks": [
                    "Implement structured request ID tracking across API middlewares.",
                    "Profile SQL database query bottlenecks using execution plan analysis (EXPLAIN).",
                    "Build a monitoring dashboard visualizing request latency p95 and p99."
                ],
                "project_idea": "Telemetry dashboard tracking API throughput, latency, and error rates.",
                "resources": [
                    {"title": "OpenTelemetry Official Guide", "url": "https://opentelemetry.io", "type": "Documentation"}
                ]
            },
            {
                "week_number": 6,
                "title": f"Capstone Delivery & {target_role} Portfolio Proof-of-Work",
                "description": "Consolidate all skills into a deployed capstone project highlighting end-to-end engineering excellence.",
                "skills": ["Portfolio Engineering", "Technical Writing", "Production Architecture"],
                "tasks": [
                    "Publish a clean open-source repository with comprehensive README, architectural diagrams, and live demo link.",
                    "Record a 2-minute video walkthrough explaining architectural tradeoffs.",
                    "Update resume bullets with quantified performance results and GitHub links."
                ],
                "project_idea": f"Production-grade {target_role} showcase application deployed to live URL.",
                "resources": [
                    {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "Repository"}
                ]
            }
        ]
    }
