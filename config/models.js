const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: 'categories', key: 'id' },
  },
  village_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: { model: 'villages', key: 'id' },
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(180),
    allowNull: false,
    unique: true,
  },
  sku: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
  },
  description: { type: DataTypes.TEXT },
  short_description: { type: DataTypes.STRING(255) },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  stock: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    validate: { min: 0 },
  },
  weight_gram: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 500,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: { min: 0, max: 5 },
  },
  total_reviews: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  sold_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  view_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  image_url: { type: DataTypes.STRING(255) },
  gallery: { type: DataTypes.JSON },
  specifications: { type: DataTypes.JSON },
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['slug'] },
    { fields: ['category_id'] },
    { fields: ['village_id'] },
    { fields: ['price'] },
    { fields: ['is_featured'] },
  ],
});

// Associations
Product.associate = (models) => {
  Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  Product.belongsTo(models.Village, { foreignKey: 'village_id', as: 'village' });
  Product.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
  Product.hasMany(models.Review, { foreignKey: 'product_id', as: 'reviews', scope: { is_approved: true } });
  Product.hasMany(models.HyperlocalSupply, { foreignKey: 'product_id', as: 'supplies' });
};

module.exports = Product;