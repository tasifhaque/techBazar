# Operating Procedures

## 1. Mongoose Schema Rules (CRITICAL)
Every single Mongoose schema MUST strictly include these configuration options at the schema level:
`{ toJSON: { virtuals: true }, toObject: { virtuals: true }, versionKey: false }`

## 2. Validation
* Every API route that accepts data must validate the payload using `Zod` before touching the database.

## 3. Authentication Flow
* **Signup:** Require Name, Email, Password, and Gender (enum: male/female).
* **Avatar Generation:** Automatically assign a random anime avatar URL based on the gender upon successful registration.
* **Sessions:** Use Better-Auth to manage secure, HTTP-only cookies.

## 4. Execution
* Ensure all scripts and configurations are compatible with the `bun` runtime.