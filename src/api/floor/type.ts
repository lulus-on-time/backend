type FloorRequest = {
  floor: {
    name: string;
    level: number;
  };
  type: string;
  features: {
    type: string;
    properties: {
      category: string,
      name: string;
      poi: number[];
      id: number | undefined;
    };
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }[];
};

export { FloorRequest };
