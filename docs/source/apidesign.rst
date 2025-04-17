API Design
==========

This section explains the architectural layout and design decisions behind the JB AI Support API.

Overview
--------

The JB AI Support system uses **FastAPI** for its backend, offering a high-performance, asynchronous web API with automatic interactive documentation via OpenAPI (formerly Swagger) and ReDoc.

All developer-facing API details (such as endpoints, request/response formats, schemas, etc.) are documented automatically via FastAPI.

Visit the live documentation:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc UI:** http://127.0.0.1:8000/redoc

### Key Design Patterns:
- **RESTful API** structure with clear route naming (`/auth/register`, `/auth/login`, `/chat/query`, etc.)
- **JWT-based Authentication** for secure access
- **AES-Data Encryption** for secure user data handling
- **Credit System** to control AI usage
- **Queue System** for managing user submissions asynchronously
- **Notifications** for job status updates
- **Role-based Access Control (RBAC)** for admin vs. user permissions

### Technologies Used:
- **FastAPI**
- **PostgreSQL**
- **Stripe** (for credit payments)
- **Mistral AI API** (for AI chat backend)

Endpoints Overview
------------------

Some key routes include:

- `/auth/register`: User registration
- `/auth/login`: User login
- `/credit/create-checkout-session`: Purchase credits
- `/chat/query`: Send a query to the AI
- `/chat/ai_response/{query_id}`: Poll response for a query
- `/notifications/unread`: View system alerts
