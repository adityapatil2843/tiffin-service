const Joi = require('joi');

const createMenuItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    category: Joi.string().valid('vegetarian', 'non-vegetarian', 'vegan').default('vegetarian'),
    mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'all').default('all'),
    image: Joi.string().allow('', null),
    tags: Joi.array().items(Joi.string()),
    nutrition: Joi.object({
      calories: Joi.number(),
      protein: Joi.string(),
      carbs: Joi.string(),
    }),
  }),
};

const createMenu = {
  body: Joi.object().keys({
    date: Joi.date().iso().required(),
    mealType: Joi.string().valid('breakfast', 'lunch', 'dinner').required(),
    items: Joi.array().items(Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid menu item ID');
      return value;
    })).min(1).required(),
    specialNote: Joi.string().allow(''),
    isTodaysSpecial: Joi.boolean().default(false),
    status: Joi.string().valid('draft', 'published').default('draft'),
    bannerImage: Joi.string().allow('', null),
  }),
};

const updateMenu = {
  params: Joi.object().keys({
    menuId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid menu ID');
      return value;
    }),
  }),
  body: Joi.object().keys({
    date: Joi.date().iso(),
    mealType: Joi.string().valid('breakfast', 'lunch', 'dinner'),
    items: Joi.array().items(Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid menu item ID');
      return value;
    })),
    specialNote: Joi.string().allow(''),
    isTodaysSpecial: Joi.boolean(),
    status: Joi.string().valid('draft', 'published'),
    bannerImage: Joi.string().allow('', null),
  }).min(1),
};

const updateMenuItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message('Invalid menu item ID');
      return value;
    }),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string().allow(''),
    category: Joi.string().valid('vegetarian', 'non-vegetarian', 'vegan'),
    mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'all'),
    image: Joi.string().allow('', null),
    tags: Joi.array().items(Joi.string()),
    nutrition: Joi.object({
      calories: Joi.number(),
      protein: Joi.string(),
      carbs: Joi.string(),
    }),
  }).min(1),
};

module.exports = {
  createMenuItem,
  updateMenuItem,
  createMenu,
  updateMenu,
};
