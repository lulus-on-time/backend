import Joi from "joi"
import WssMessageBody from "../types/WssMessageBody"

const validation = Joi.object<WssMessageBody>({
    reason: Joi.string().valid('fingerprint').required(),
    data: Joi.object({
        fingerprints: Joi.array().items(Joi.object({
            rssi: Joi.number().required(),
            bssid: Joi.string().required()
        })).required()
    }),
    npm: Joi.string().optional()
})

export default validation;