// backend/src/controllers/productController.js

import Product from '../models/Product.js';
import { cloudinary } from '../middleware/upload.js';

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) {
      query.$or = [{ categories: category }, { category }];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = {};
    if (sort === 'price-asc') {
      sortOption.price = 1;
    } else if (sort === 'price-desc') {
      sortOption.price = -1;
    } else if (sort === 'newest') {
      sortOption.createdAt = -1;
    } else if (sort === 'rating') {
      sortOption.averageRating = -1;
    } else {
      sortOption.createdAt = -1;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('ratings.user', 'name')
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('ratings.user', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('ratings.user', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      $or: [{ categories: req.params.category }, { category: req.params.category }],
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, stock, status, featured, specifications, sku, content, categories } = req.body;

    // Handle uploaded images
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter((v) => typeof v === 'string' && v.trim());
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string' && v.trim()) : [];
        } catch {
          return [val];
        }
      }
      return [];
    };

    const parsedCategories = parseArray(categories);
    const primaryCategory = parsedCategories.length > 0 ? parsedCategories[0] : category;

    const product = new Product({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      price,
      discountPrice: discountPrice || 0,
      category: primaryCategory || category,
      categories: parsedCategories,
      stock,
      sku: sku || undefined,
      status: status || 'active',
      featured: featured === 'true' || featured === true,
      specifications: specifications
        ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications)
        : {},
      content: content
        ? (typeof content === 'string' ? JSON.parse(content) : content)
        : [],
      images: imageUrls,
      createdBy: req.user._id,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update fields
    const { name, description, price, discountPrice, category, stock, status, featured, specifications, sku, content, categories } = req.body;
    if (name) {
      product.name = name;
      product.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    if (description !== undefined) {
      product.description = description;
    }
    if (price) {
      product.price = price;
    }
    if (discountPrice !== undefined) {
      product.discountPrice = discountPrice;
    }
    if (category) {
      product.category = category;
    }
    if (categories !== undefined) {
      const parseArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val.filter((v) => typeof v === 'string' && v.trim());
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string' && v.trim()) : [];
          } catch {
            return [val];
          }
        }
        return [];
      };
      product.categories = parseArray(categories);
      if (product.categories.length > 0 && !category) {
        product.category = product.categories[0];
      }
    }
    if (stock !== undefined) {
      product.stock = stock;
    }
    if (sku !== undefined) {
      product.sku = sku;
    }
    if (status) {
      product.status = status;
    }
    if (featured !== undefined) {
      product.featured = featured === 'true' || featured === true;
    }
    if (specifications) {
      try {
        product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch {
        product.specifications = specifications;
      }
    }
    if (content) {
      try {
        product.content = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        product.content = content;
      }
    }

    // If new images uploaded, replace old ones (optionally delete old from cloudinary)
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary (optional)
      for (const oldImage of product.images) {
        try {
          const publicId = oldImage.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`apple-it-zone/products/${publicId}`);
        } catch (err) {
          console.warn('Could not delete old image:', err.message);
        }
      }
      product.images = req.files.map((file) => file.path);
    }

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update rating for a product
// @route   POST /api/products/:id/ratings
// @access  Private
export const addRating = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existingIndex = product.ratings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      product.ratings[existingIndex].rating = rating;
      if (comment) {
        product.ratings[existingIndex].comment = comment;
      }
      product.ratings[existingIndex].createdAt = Date.now();
    } else {
      product.ratings.push({
        user: req.user._id,
        rating,
        comment: comment || '',
      });
    }

    product.averageRating = product.calculateAverageRating();
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete images from Cloudinary
    for (const imageUrl of product.images) {
      try {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`apple-it-zone/products/${publicId}`);
      } catch (err) {
        console.warn('Could not delete image:', err.message);
      }
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
