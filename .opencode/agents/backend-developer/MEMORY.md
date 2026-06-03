# Project Memory: Tech E-Commerce Backend

## Tech Stack
* Runtime: Bun
* Framework: Hono
* Database: MongoDB via Mongoose
* Auth: Better-Auth, JWT, bcrypt
* Validation: Zod

## Core Schemas
1. **User:** name, email, password, gender (male/female), avatarUrl, role.
2. **Product:** title, description, price, discountPercentage, category, brand, model, images (array), stock count.
3. **Comment:** user reference, comment text, timestamp.