from sqlalchemy.orm import Session
import models

def seed_credits(db: Session):
  """Check if the Credits table is empty and seed default plans."""
  default_plans = [
    {
      "plan": "Free", 
      "amount": 0.00, 
      "benefits": "20 AI Support Credits. Email Support.",
      "credits" : 20
    },
    {
      "plan": "Starter", 
      "amount": 9.99, 
      "benefits": "50 AI Support Credits. Email Support.",
      "credits" : 30
    },
    {
      "plan": "Professional", 
      "amount": 29.99, 
      "benefits": "200 AI Support Credits. Priority Email & Chat Support.",
      "credits" : 50
    },
    {
      "plan": "Enterprise", 
      "amount": 99.99, 
      "benefits": "Unlimited AI Support Credits. 24/7 Dedicated Support Agents.",
      "credits" : 200
    },
  ]

  # Check if table is already populated
  if not db.query(models.Credit).first():
    for plan in default_plans:
      db.add(models.Credit(**plan))
    db.commit()
    print("✅ Default credit plans seeded.")
  else:
    print("✅ Credit plans already exist.")

