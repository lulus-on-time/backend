type RoomRequest = {
  floor: {
    name: string;
    level: number;
  };
  type: string;
  features: {
    type: string;
    properties: {
      name: string;
      centroid: number[];
    };
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }[];
};

export { RoomRequest };
