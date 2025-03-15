import os
from dotenv import load_dotenv

load_dotenv()

class Config:
  TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")
  CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")
  USERNAME = os.getenv("USERNAME")
  PASSWORD = os.getenv("PASSWORD")
  INTERNET_ROUTER_NAME = "Internet_router"
  INTERNET_ASN = 54000
  INTERNET_HOST_NAME = "Internet_host"
  INTERNET_HOST_IP = "192.168.114.10"
  INTERNET_ROUTER_IP = "192.168.114.1"
  INTERNET_IFACE_ROUTER = "Ethernet1"
  INTERNET_IFACE_HOST = "Ethernet1"
