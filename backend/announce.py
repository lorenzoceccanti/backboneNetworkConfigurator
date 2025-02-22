from typing import List, Optional
from pydantic import BaseModel, Field, validator
import ipaddress

class Neighbor(BaseModel):
    asn: int = Field(..., ge=1, le=65534)
    his_router_ip: str

    @validator("his_router_ip")
    def validate_his_router_ip(cls, v):
        try:
            ipaddress.IPv4Address(v)
        except ValueError:
            print(f"Invalid IP address format: {v}")
            raise ValueError(f"Invalid IP address format: {v}")
        return v

class Announce(BaseModel):
    router: str
    asn: int = Field(..., ge=1, le=65534)
    mngt_ip: str
    network_to_announce: str
    to: List[Neighbor]

    @validator("mngt_ip")
    def validate_mngt_ip(cls, v):
        try:
            ipaddress.IPv4Address(v)
        except ValueError:
            print(f"Invalid IP address format: {v}")
            raise ValueError(f"Invalid IP address format: {v}")
        return v

    @validator("network_to_announce")
    def validate_network_to_announce(cls, v):
        try:
            ipaddress.IPv4Network(v)
        except ValueError:
            print(f"Invalid network format: {v}")
            raise ValueError(f"Invalid network format: {v}")
        return

    @validator("to", pre=True)
    def validate_to(cls, v):
        if len(v) == 0:
            print(f"Must specify at least one neighbor.")
            raise ValueError("Must specify at least one neighbor.")
        return v
