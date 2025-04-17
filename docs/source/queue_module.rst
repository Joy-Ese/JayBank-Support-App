Queue_Processor Module
======================

.. automodule:: queue_processor
  :members:
  :undoc-members:
  :show-inheritance:

Handles background job processing and queue status tracking for AI response generation.

Key Features
------------

- Assigns a unique `query_id` per user message
- Polls status until the AI completes processing
- Integrates with notification system