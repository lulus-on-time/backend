import Joi from 'joi';
import { RoomRequest } from './type';

const validation: Joi.ObjectSchema<RoomRequest> = Joi.object({
  floor: Joi.object({
    name: Joi.string().required(),
    level: Joi.number().required()
  }),
  type: Joi.string().valid('FeatureCollection').required(),
  features: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid('Feature').required(),
        properties: Joi.object({
          name: Joi.string().required(),
          centroid: Joi.array().items(Joi.number()).required(),
        }).required(),
        geometry: Joi.object({
          type: Joi.string().valid('Polygon').required(),
          coordinates: Joi.array()
            .items(Joi.array().items(Joi.array().items(Joi.number())))
            .required(),
        }).required(),
      }),
    )
    .required(),
});

export default validation;
