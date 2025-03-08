## JayBank Support App flowchart Diagram
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
    style AI fill:maroon,stroke:black,stroke-width:4px,shadow:shadow
    style JWT fill:maroon,stroke:black,stroke-width:4px,shadow:shadow
    style Queue fill:orange,stroke:black,stroke-width:4px,shadow:shadow
```

## JayBank Support App Sequence Diagram

``` mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database
    participant JWT as Google OAuth
    participant AI as AI Engine
    participant Q as TaskQueue

    U->>FE: Registration Successful
    U->>FE: Attempt Login
    FE->>BE: Send User Credentials (HTTP)
    BE->>DB: Validate Credentials
    BE->>JWT: External Authentication
    U->>FE: Initiate Chat
    FE->>BE: Send Chat Request (HTTP)
    BE->>AI: Query AI Engine
    AI-->>BE: Get Response
    BE->>FE: Return Response
    FE-->>U: Display Chat Response

    FE->>BE: Request Notification
    BE->>DB: Store Notification Request
    BE->>Q: Queue Task for Notification
```
