## JayBank Support App flowchart
``` mermaid
flowchart TD;
    FE("Frontend - Angular") --> BE("Backend - FastAPI")
    BE -->|External API Call| AI("AI Engine - OpenAI API")
    BE -->|External API Authentication| JWT("Google OAuth")
    FE -->|Register Login| BE
    FE -->|Chat Request| BE
    FE -->|Notification| BE
    BE -->|Validate User Credentials| Database[(PostgreSQL)]
    BE -->|Async Task| Queue("Celery Task Queue")

    style Database fill:#66f,stroke:#f6f,stroke-width:4px
    style FE fill:blue,stroke:black,stroke-width:4px,shadow:shadow
    style BE fill:red,stroke:black,stroke-width:4px,shadow:shadow
```
