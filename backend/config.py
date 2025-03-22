import os
from dotenv import load_dotenv

load_dotenv()

class Config:
  TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")
  CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")
  USERNAME = os.getenv("USERNAME")
  PASSWORD = os.getenv("PASSWORD")
  INTERNET_ROUTER_NAME = os.getenv("INTERNET_ROUTER_NAME")
  INTERNET_ROUTER_MNGT_IP = os.getenv("INTERNET_ROUTER_MNGT_IP")
  INTERNET_ASN = int(os.getenv("INTERNET_ASN"))
  INTERNET_HOST_NAME = os.getenv("INTERNET_HOST_NAME")
  INTERNET_HOST_IP = os.getenv("INTERNET_HOST_IP")
  INTERNET_ROUTER_IP = os.getenv("INTERNET_ROUTER_IP")
  INTERNET_IFACE_ROUTER = os.getenv("INTERNET_IFACE_ROUTER")
  INTERNET_IFACE_HOST = os.getenv("INTERNET_IFACE_HOST")
