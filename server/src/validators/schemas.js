import { z } from 'zod';

// ---- Auth ----
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ---- Contact / Enquiry ----
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30).optional().default(''),
  subject: z.string().max(200).optional().default(''),
  message: z.string().min(1, 'Message is required').max(5000),
});

export const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30).optional().default(''),
  message: z.string().min(1, 'Message is required').max(5000),
  product: z.string().min(1, 'Product name is required').max(200),
});

// ---- Categories ----
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional().default(''),
  description: z.string().max(500).optional().default(''),
  image: z.string().max(2000000).optional().default(''),
  order: z.coerce.number().int().optional().default(0),
});

// ---- Brands ----
export const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional().default(''),
  logo: z.string().max(2000000).optional().default(''),
  description: z.string().max(1000).optional().default(''),
});

// ---- Products ----
export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().max(200).optional().default(''),
  description: z.string().max(10000).optional().default(''),
  images: z.array(z.string()).optional().default([]),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional().default(''),
  specifications: z.any().optional().default({}),
  featured: z.union([z.boolean(), z.string()]).transform(v => v === true || v === 'true').optional().default(false),
});

// ---- Partners ----
export const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  logo: z.string().max(2000000).optional().default(''),
  logos: z.array(z.string().max(2000000)).optional().default([]),
  url: z.string().max(500).optional().default(''),
  order: z.coerce.number().int().optional().default(0),
}).transform((data) => {
  if (!data.logo && data.logos && data.logos.length > 0) {
    data.logo = data.logos[0];
  } else if (data.logo && (!data.logos || data.logos.length === 0)) {
    data.logos = [data.logo];
  }
  return data;
});

// ---- Showcase Stories ----
export const storySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  brandId: z.string().min(1, 'Brand ID is required'),
  coverImage: z.string().max(2000000).optional().default(''),
  researcherName: z.string().max(200).optional().default(''),
  institution: z.string().max(200).optional().default(''),
  studyTitle: z.string().max(500).optional().default(''),
  applicationField: z.string().max(200).optional().default(''),
  abstract: z.string().max(5000).optional().default(''),
  imageUrl: z.string().max(2000000).optional().default(''),
  sections: z.array(z.object({
    heading: z.string().max(200).optional().default(''),
    body: z.string().max(5000).optional().default(''),
    image: z.string().max(2000000).optional().default(''),
    alignment: z.enum(['left', 'right']).optional().default('left'),
  })).optional().default([]),
});

// ---- Documents ----
export const documentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  fileUrl: z.string().max(2000000).optional().default(''),
  fileKey: z.string().max(2000000).optional().default(''),
  fileType: z.string().max(100).optional().default('PDF'),
  type: z.string().max(100).optional().default('PDF'),
  size: z.coerce.number().optional().default(0),
  fileSize: z.coerce.number().optional().default(0),
}).transform((data) => {
  if (!data.fileUrl && data.fileKey) data.fileUrl = data.fileKey;
  if (!data.fileKey && data.fileUrl) data.fileKey = data.fileUrl;
  if (!data.fileType && data.type) data.fileType = data.type;
  if (!data.type && data.fileType) data.type = data.fileType;
  if (!data.size && data.fileSize) data.size = data.fileSize;
  if (!data.fileSize && data.size) data.fileSize = data.size;
  return data;
});

// ---- Page SEO ----
export const pageSeoSchema = z.object({
  title: z.string().max(200).optional().default(''),
  description: z.string().max(500).optional().default(''),
  keywords: z.string().max(500).optional().default(''),
});

// ---- Media ----
export const mediaUpdateSchema = z.object({
  altText: z.string().max(500).optional().default(''),
});

// ---- Settings ----
export const settingsSchema = z.object({
  siteName: z.string().max(200).optional().default('Sentron Asia International'),
  contactEmail: z.string().email('Invalid email address').optional().default('sentronasia@yahoo.com'),
  phoneNumbers: z.string().max(500).optional().default('+92-42-35838165'),
  inquiryRouting: z.string().max(500).optional().default('sentronasia@yahoo.com'),
});
