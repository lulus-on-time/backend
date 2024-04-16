import Joi from 'joi';
import AccessPointRequest from './type';

const validation: Joi.ObjectSchema<AccessPointRequest> = Joi.object({
  type: Joi.string().valid('FeatureCollection').required(),
  features: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid('Feature').required(),
        properties: Joi.object({
          spaceId: Joi.number().required(),
          bssids: Joi.array()
            .items(
              Joi.object({
                bssid: Joi.string().required(),
                ssid: Joi.string().required(),
              }),
            )
            .required(),
        }).required(),
        geometry: Joi.object({
          type: Joi.string().valid('Point').required(),
          coordinates: Joi.array().items(Joi.number()).required(),
        }).required(),
      }),
    )
    .required(),
});

export default validation;
