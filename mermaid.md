## JayBank Support App flowchart
``` mermaid
flowchart TD;
    FE("Frontend - Angular") --> BE("Backend - FastAPI")
    BE -->|External API Call| AI("AI Engine - OpenAI API")
    BE -->|External API Authentication| JWT("Google OAuth")
    FE -->|Register| BE
    FE -->|Login| BE
    FE -->|Chat Request| BE
    FE -->|Notification| BE
    BE -->|Validate Credentials| Database["PostgreSQL"]
    BE -->|Async Task| Queue("Celery Task Queue")
```
