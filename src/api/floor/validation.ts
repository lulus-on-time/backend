import Joi from 'joi';
import { FloorRequest } from './type';

const validation: Joi.ObjectSchema<FloorRequest> = Joi.object({
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
          poi: Joi.array().items(Joi.number()).required(),
          category: Joi.string().valid('room', 'corridor').required()
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
