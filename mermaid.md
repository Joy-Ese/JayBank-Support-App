## JayBank Support App flowchart
``` mermaid
flowchart TD;
    FE("Frontend - Angular") --> BE("Backend - FastAPI")
    BE -->|External API Call| AI("AI Engine - OpenAI API")
    FE -->|Register Login| BE
    FE -->|Chat Request| BE
    FE -->|Notification| BE
    BE -->|Auth Request| Database["PostgreSQL"]
    BE -->|Async Task| Queue("Celery Task Queue")
```
