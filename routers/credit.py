from fastapi import APIRouter, Request, status, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database import get_db
import stripe
import models
import uuid
import schemas
from datetime import datetime
from routers.auth import get_current_user

router = APIRouter()

Destination_ID = "https://dashboard.stripe.com/test/workbench/webhooks/we_1RD9OU2MMgCVdSUSattmscoK"
stripe.api_key = "sk_test_51RD8BL2MMgCVdSUSKqEtFkUifZhd7cKCeMbdTFzl9E16DY9xn0kfxgxkiHjZ9fftV3oS1YV8eNWazVt1xjMtYCWo00gVIOET37"
endpoint_secret = "whsec_VC1rKFHRWL84dvtHmVChPFYbAZirDMAq"

# Implement initialization of checkout for stripe payment
@router.post("/create-checkout-session")
def create_checkout_session(plan: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
  """
  Initialize Stripe Payment

  Args:
    plan: str

  Returns:
    dict: {"checkout_url": str}
  """

  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  db_plan = db.query(models.Credit).filter(models.Credit.plan == plan).first()
  if not db_plan:
    raise HTTPException(status_code=400, detail="This plan does not exist")

  unique_ref = reference_generator()
  print(unique_ref)

  amount = int(db_plan.amount * 100)

  try:
    session = stripe.checkout.Session.create(
      payment_method_types=["card"],
      line_items=
      [{
        "price_data": {
            "currency": "gbp",  
            "product_data": {
              "name": f"{plan.capitalize()} Plan - {db_plan.credits} Credits"
            },
            "unit_amount": amount, 
        },
        "quantity": 1
      }],
      mode="payment",
      customer_email=db_user.email,
      success_url=f"http://localhost:4200/home?session_id={{CHECKOUT_SESSION_ID}}",
      cancel_url="http://localhost:4200/pricing",
      metadata={"user_id": db_user.id, "plan": db_plan.plan, "reference": unique_ref}
    )

    return {"checkout_url": session.url}

  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

# Generate a unique reference string to prevent duplicate transactions
def reference_generator():
  """
  Generate a unique reference string to check for duplicate successful payments
  Takes a UUID, removes hyphens, and returns a 15-character substring.
  """
  # Generate a UUID, convert to string, remove hyphens, and take a 15-character substring
  reference_string = str(uuid.uuid4()).replace("-", "")[1:16]
  return reference_string

# Implement webhook to get successful or failed response from stripe 
@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
  """
  Stripe webhook for deployment to production. 
  Would have to register prod domain name on Stripe's portal.
  """

  payload = await request.body()
  sig_header = request.headers.get("stripe-signature")

  try:
    # event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    event = stripe.Webhook.construct_event(
      payload=payload,
      sig_header=sig_header,
      secret=endpoint_secret
    )
  except stripe.error.SignatureVerificationError:
    return Response(status_code=status.HTTP_400_BAD_REQUEST)
  except ValueError:
    raise HTTPException(status_code=400, detail="Invalid payload")
  except stripe.error.SignatureVerificationError:
    raise HTTPException(status_code=400, detail="Invalid signature")

  if event["type"] == "checkout.session.completed":
    session = event["data"]["object"]
    metadata = session["metadata"]
    user_id = int(metadata["user_id"])
    plan = metadata["plan"] 
    reference = metadata["reference"]

    try:
      db_user = db.query(models.User).filter(models.User.id == user_id).first()
      if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

      db_plan = db.query(models.Credit).filter(models.Credit.plan == plan).first()
      if not db_plan:
        raise HTTPException(status_code=400, detail="This plan does not exist")

      # Use a DB transaction so if payment fails it rolls back. #All_Or_Nothing
      with db.begin():
        # 1. Update user's credits and plan with the new values
        db_user.credits_remaining += db_plan.credits
        db_user.plan_subscribed_to = plan

        # 2. Add new credit transaction record to the db
        new_transaction = models.CreditsTransaction(
          user_id=user_id,
          plan_bought=plan,
          date_purchased=datetime.utcnow(),
          amount=db_plan.amount,
          unique_transaction_reference=reference
        )
        db.add(new_transaction)

      return Response(status_code=status.HTTP_200_OK)

    except SQLAlchemyError as e:
      db.rollback()
      raise HTTPException(status_code=500, detail="Database transaction failed")

# Implement verification of payement via session_id returned by the webhook
@router.get("/verify-session", response_model=schemas.VerifyStripe)
def verify_checkout_session(session_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
  """
  Verify Stripe Payment using Stripe's generated session ID

  Args:
    session_id: str

  Returns:
    dict: {"checkout_url": str}
  """

  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  try:
    # Fetch the session from Stripe
    session = stripe.checkout.Session.retrieve(session_id)

    # Check payment status
    if session.payment_status != "paid":
      raise HTTPException(status_code=400, detail="Payment not completed.")

    db_plan = db.query(models.Credit).filter(models.Credit.plan == session.metadata.get("plan")).first()
    if not db_plan:
      raise HTTPException(status_code=400, detail="This plan does not exist")

    # Optional: Prevent duplicate transactions if webhook already created one
    existing_transaction = db.query(models.CreditsTransaction).filter_by(
      user_id=db_user.id, 
      plan_bought=db_plan.plan, 
      amount=session.amount_total / 100, 
      unique_transaction_reference=session.metadata.get("reference")
    ).first()

    if existing_transaction:
      return {
        "message": "Payment already processed",
        "payment_status": session.payment_status,
        "credits": db_plan.credits,
        "plan": db_plan.plan
      }

    # Update user credits (optional fallback in case webhook didn't run)
    db_user.credits_remaining += db_plan.credits
    db_user.plan_subscribed_to = db_plan.plan

    amount = session.amount_total / 100 

    # Save new transaction
    new_transaction = models.CreditsTransaction(
      user_id=db_user.id,
      plan_bought=db_plan.plan,
      amount=amount,
      date_purchased = datetime.fromtimestamp(session.created),  # Stripe timestamp
      unique_transaction_reference=session.metadata.get("reference")
    )
    db.add(new_transaction)
    db.commit()

    # Save new notification
    notification = models.Notification(
      user_id=db_user.id,
      message=f"You have successfully purchased {db_plan.credits} credits. You are now on the {db_plan.plan} Plan.",
      status="unread",
      time_stamp=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # return {
    #   "message": f"Payment verified and {db_plan.credits } credits added.",
    #   "payment_status": session.payment_status,
    #   "plan": db_plan.plan,
    #   "credits_added": db_plan.credits,
    # }
    return schemas.VerifyStripe(
      message=f"Payment verified and {db_plan.credits } credits added.",
      payment_status=session.payment_status,
      plan=db_plan.plan,
      credits_added=db_plan.credits
    )

  except stripe.error.StripeError as e:
    raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error verifying session: {str(e)}")


# Get list of credits seeded to display in the frontend
@router.get("/all-credits", dependencies=[Depends(get_current_user)])
def get_all_credits(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
  """
  Gets list of credits seeded into the database

  Returns:
  list: Credit{dict}
    [
      {
        id: int,
        plan: str,
        amount: float,
        benefits: str,
        credits: int
      }
    ]
  """

  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  # Exclude "Free" plan
  all_credits = db.query(models.Credit).filter(models.Credit.plan != "Free").all()

  return all_credits

# Get credit balance for user
@router.get("/balance", response_model=schemas.CreditBalance, dependencies=[Depends(get_current_user)])
def get_credit_balance(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
  """
  Gets user's credit balance for frontend polling to send a notification when credit balance gets to 10.

  Returns:
    int: credit balance.
  """

  db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
  if not db_user:
    raise HTTPException(status_code=404, detail="User not found")

  if db_user.credits_remaining <= 10:
    notification = models.Notification(
      user_id=db_user.id,
      message="Your credit balance is less than 10.",
      status="unread",
      time_stamp=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

  return schemas.CreditBalance(
    credits=db_user.credits_remaining
  )

