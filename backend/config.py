import os
from dotenv import load_dotenv

load_dotenv()

class Config:
  TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")
  CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")
  USERNAME = os.getenv("USERNAME")
  PASSWORD = os.getenv("PASSWORD")