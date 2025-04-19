## JayBank Support App flowchart Diagram
``` mermaid
flowchart TD;
    FE("Frontend - Angular") --> BE("Backend - FastAPI")
    BE -->|External API Call| AI("AI Engine - Mistral AI API")
    BE -->|Authentication| JWT
    FE -->|Register Login| BE
    FE -->|Chat Request| BE
    FE -->|Notification| BE
    BE -->|Buy Credit| Stripe
    BE -->|Validate User Credentials| Database[(PostgreSQL)]
    BE -->|Async Task| Queue

    style Database fill:#66f,stroke:#f6f,stroke-width:4px
    style FE fill:blue,stroke:black,stroke-width:4px,shadow:shadow
    style BE fill:red,stroke:black,stroke-width:4px,shadow:shadow
    style AI fill:maroon,stroke:black,stroke-width:4px,shadow:shadow
    style JWT fill:maroon,stroke:black,stroke-width:4px,shadow:shadow
    style Queue fill:orange,stroke:black,stroke-width:4px,shadow:shadow
    style Stripe fill:green,stroke:black,stroke-width:4px,shadow:shadow
```

## JayBank Support App Sequence Diagram

``` mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database
    participant JWT as Secure Authentication
    participant AI as AI Engine
    participant Q as TaskQueue
    participant S as Stripe

    U->>FE: Registration Successful
    U->>FE: Attempt Login
    FE->>BE: Send User Credentials (HTTP)
    BE->>DB: Validate Credentials
    BE->>JWT: Authentication
    JWT-->>BE: Get Response
    BE->>FE: Succesful Response
    U->>FE: Initiate Chat
    FE->>BE: Send Chat Query (HTTP)
    BE->>Q: Queue for AI Proccessing
    BE->>AI: Query AI Engine
    AI-->>BE: Get Response
    BE->>DB: Store Notification
    BE->>FE: Return Response
    FE-->>U: Display Chat Response

    U->>FE: Buy Credit
    FE->>BE: Select Credit Tier
    BE->>S: Secure Payment Gateway
    S->>BE: Payment Successful
    BE->>DB: Store Notification 
    BE->>FE: Update User Credit Balance
    FE->>U: Display Updated Credits/Tier

    FE->>BE: Polling For Notification
    BE->>Q: Queue Task for Notification
```
