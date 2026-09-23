import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// import models
import Brand from './src/models/Brand.js';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';
import Partner from './src/models/Partner.js';
import PageSeo from './src/models/PageSeo.js';
import ShowcaseStory from './src/models/ShowcaseStory.js';
import Document from './src/models/Document.js';

const MONGODB_URI = process.env.MONGODB_URI;

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'import.json'), 'utf8'));

        await Brand.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Partner.deleteMany({});
        await PageSeo.deleteMany({});
        await ShowcaseStory.deleteMany({});
        await Document.deleteMany({});
        console.log('Cleared existing collections');

        const brandMap = {};
        const categoryMap = {};

        // 1. Brands
        if (data.brands) {
            const brandsToInsert = [];
            for (const b of data.brands) {
                const newBrand = new Brand({
                    name: b.name,
                    slug: b.slug,
                    logo: b.logo_url || b.logo || '',
                    description: b.description || ''
                });
                brandMap[b.id] = newBrand._id.toString();
                brandsToInsert.push(newBrand);
            }
            await Brand.insertMany(brandsToInsert, { ordered: false });
            console.log(`Inserted ${data.brands.length} brands`);
        }

        // 2. Categories
        if (data.categories) {
            const categoriesToInsert = [];
            for (const c of data.categories) {
                const newCat = new Category({
                    name: c.name,
                    slug: c.slug,
                    description: c.description || '',
                    image: c.image_url || c.image || '',
                    order: c.sort_order || 0
                });
                categoryMap[c.id] = newCat._id.toString();
                categoriesToInsert.push(newCat);
            }
            await Category.insertMany(categoriesToInsert, { ordered: false });
            console.log(`Inserted ${data.categories.length} categories`);
        }

        // 3. Products
        if (data.products) {
            const productsToInsert = [];
            for (const p of data.products) {
                const newProd = new Product({
                    name: p.name,
                    slug: p.slug,
                    description: p.description || '',
                    images: p.image_url ? [p.image_url] : [],
                    categoryId: p.category_id ? categoryMap[p.category_id] : null,
                    brandId: p.brand_id ? brandMap[p.brand_id] : null,
                    specifications: p.specifications || { columns: [], rows: [] },
                    isFeatured: p.is_featured || false,
                });
                productsToInsert.push(newProd);
            }
            await Product.insertMany(productsToInsert, { ordered: false });
            console.log(`Inserted ${data.products.length} products`);
        }

        // 4. Partners
        if (data.partners) {
            const partnersToInsert = [];
            for (const p of data.partners) {
                const newPartner = new Partner({
                    name: p.name,
                    logo: p.logo_url || '',
                    url: p.website_url || '',
                    order: p.sort_order || 0
                });
                partnersToInsert.push(newPartner);
            }
            await Partner.insertMany(partnersToInsert, { ordered: false });
            console.log(`Inserted ${data.partners.length} partners`);
        }

        // 5. PageSeo
        if (data.page_seo) {
            const pageSeosToInsert = [];
            for (const p of data.page_seo) {
                const newSeo = new PageSeo({
                    page: p.page_key || p.page,
                    title: p.meta_title || p.title || '',
                    description: p.meta_description || p.description || '',
                });
                pageSeosToInsert.push(newSeo);
            }
            await PageSeo.insertMany(pageSeosToInsert, { ordered: false });
            console.log(`Inserted ${data.page_seo.length} page SEOs`);
        }

        // 6. Showcase Stories
        if (data.showcase_stories) {
            const storiesToInsert = [];
            for (const s of data.showcase_stories) {
                const newStory = new ShowcaseStory({
                    brandId: s.brand_id ? brandMap[s.brand_id] : null,
                    title: s.title,
                    coverImage: s.cover_image_url || '',
                    researcherName: s.researcher_name || '',
                    institution: s.institution || '',
                    studyTitle: s.study_title || '',
                    applicationField: s.application_field || '',
                    abstract: s.abstract || '',
                    sections: s.sections || []
                });
                if (!newStory.brandId && Object.values(brandMap).length > 0) {
                    newStory.brandId = Object.values(brandMap)[0];
                }
                if (newStory.brandId) {
                    storiesToInsert.push(newStory);
                }
            }
            if (storiesToInsert.length > 0) {
                await ShowcaseStory.insertMany(storiesToInsert, { ordered: false });
            }
            console.log(`Inserted ${data.showcase_stories.length} stories`);
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
