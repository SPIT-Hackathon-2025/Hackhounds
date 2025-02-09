import streamlit as st
import re
from pymongo import MongoClient
from datetime import datetime

# MongoDB Connection (check your connection and whitelist your IP in MongoDB Atlas)
try:
    client = MongoClient("mongodb+srv://maureenmiranda22:PqxEHalWziPVqy7n@cluster0.ive9g.mongodb.net/hack_05d?retryWrites=true&w=majority&appName=Cluster0")
    client.server_info()  # Check the connection
    st.success("Connected to MongoDB!")
except Exception as e:
    st.error(f"Failed to connect to MongoDB: {e}")

db = client["workflowDB"]
workflow_collection = db["workflows"]

# Streamlit UI
st.title("Automatic Workflow Extractor & Saver")
st.write("Enter your workflow query below:")

# User input
user_query = st.text_area("Enter your query", placeholder="E.g., When I receive a mail, send a Slack notification to this channel and send a mail saying thank you.")

def extract_workflow(query):
    """Function to extract key components from the user query."""
    extracted_data = {
        "trigger": "",
        "calendar": [],
        "slack": [],
        "mail": []
    }
    
    # Extract trigger
    trigger_match = re.search(r"\b(receive a mail|new email)\b", query, re.IGNORECASE)
    if trigger_match:
        extracted_data["trigger"] = trigger_match.group(0)
    
    # Extract Slack details
    slack_match = re.search(r"\bsend a Slack notification to (.*?) channel\b", query, re.IGNORECASE)
    if slack_match:
        extracted_data["slack"].append({
            "channel": slack_match.group(1),
            "text": "Notification text here",  # Placeholder text, modify if needed
            "order": 1
        })
    
    # Extract Mail details
    mail_match = re.search(r"\bsend a mail saying (.*?)\b", query, re.IGNORECASE)
    if mail_match:
        extracted_data["mail"].append({
            "subject": "Auto-generated reply",
            "message": mail_match.group(1),
            "description": "Reply description here",
            "order": 2
        })
    
    return extracted_data

if st.button("Generate & Save Workflow"):
    if user_query:
        workflow_data = extract_workflow(user_query)
        workflow_data["createdBy"] = "admin_user"  # Replace with dynamic user data
        workflow_data["createdAt"] = datetime.now()
        
        # MongoDB insertion with error handling
        try:
            result = workflow_collection.insert_one(workflow_data)
            st.success(f"Workflow extracted and saved successfully with ID: {result.inserted_id}")
            st.json(workflow_data)  # Display extracted data as JSON
        except Exception as e:
            st.error(f"Failed to save workflow: {e}")
    else:
        st.warning("Please enter a query.")
