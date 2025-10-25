import Joi from 'joi';

export const validateUserUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
    country: Joi.string().max(100),
    city: Joi.string().max(100),
    timezone: Joi.string(),
    language: Joi.string(),
    bio: Joi.string().max(500),
    dateOfBirth: Joi.date(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const validatePreferences = (data) => {
  const schema = Joi.object({
    emailNotifications: Joi.boolean(),
    smsNotifications: Joi.boolean(),
    pushNotifications: Joi.boolean(),
    marketingEmails: Joi.boolean(),
    theme: Joi.string().valid('light', 'dark'),
    language: Joi.string(),
  });

  return schema.validate(data, { abortEarly: false });
};