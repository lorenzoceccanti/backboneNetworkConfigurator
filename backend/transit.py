from typing import List, Optional
from pydantic import BaseModel, Field, validator
import ipaddress

class Transit(BaseModel):
    from_: dict
    through: dict
    to: List[dict]

    @validator("from_")
    def validate_from(cls, v):
        if not isinstance(v, dict):
            raise ValueError("From field must be a dictionary.")
        if "asn" not in v:
            raise ValueError("From field must contain an ASN.")
        if "router" not in v:
            raise ValueError("From field must contain a router name.")
        if "router_ip" not in v:
            raise ValueError("From field must contain a router IP.")
        if "mngt_ip" not in v:
            raise ValueError("From field must contain a management IP.")
        return v

    @validator("through")
    def validate_through(cls, v):
        if not isinstance(v, dict):
            raise ValueError("Through field must be a dictionary.")
        if "asn" not in v:
            raise ValueError("Through field must contain an ASN.")
        if "router" not in v:
            raise ValueError("Through field must contain a router name.")
        if "router_ip" not in v:
            raise ValueError("Through field must contain a router IP.")
        if "mngt_ip" not in v:
            raise ValueError("Through field must contain a management IP.")
        return v

    @validator("to")
    def validate_to(cls, v):
        if not isinstance(v, list):
            raise ValueError("To field must be a list.")
        for item in v:
            if not isinstance(item, dict):
                raise ValueError("To field must contain a list of dictionaries.")
            if "asn" not in item:
                raise ValueError("To field must contain an ASN.")
            if "router" not in item:
                raise ValueError("To field must contain a router name.")
            if "router_ip" not in item:
                raise ValueError("To field must contain a router IP.")
            if "mngt_ip" not in item:
                raise ValueError("To field must contain a management IP.")
        return v