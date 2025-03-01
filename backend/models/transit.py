from dataclasses import dataclass
from typing import List, Union
from models.transit_from import TransitFrom
from models.transit_to import TransitTo
from models.transit_through import TransitThrough

@dataclass
class Transit:
  from_: TransitFrom
  through: TransitThrough
  to: List[TransitTo | str] # TODO da testare il caso Internet

  def __post_init__(self):
    self.from_ = TransitFrom(**self.from_) if isinstance(self.from_, dict) else self.from_
    self.through = TransitThrough(**self.through) if isinstance(self.through, dict) else self.through
    self.to = [TransitTo(**to) if isinstance(to, dict) else to for to in self.to]
