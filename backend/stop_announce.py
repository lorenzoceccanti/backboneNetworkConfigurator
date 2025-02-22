from typing import List, Optional
from pydantic import BaseModel, Field, validator
import ipaddress

class StopAnnounce(BaseModel):
    router: str
    asn: int = Field(..., ge=1, le=65534)
    mngt_ip: str
    network_to_stop_announce: str

    @validator("mngt_ip")
    def validate_mngt_ip(cls, v):
        try:
            ipaddress.IPv4Address(v)
        except ValueError:
            print(f"Invalid IP address format: {v}")
            raise ValueError(f"Invalid IP address format: {v}")
        return v
    
    @validator("network_to_stop_announce")
    def validate_network_to_stop_announce(cls, v):
        try:
            ipaddress.IPv4Network(v)
        except ValueError:
            print(f"Invalid network format: {v}")
            raise ValueError(f"Invalid network format: {v}")
        return v