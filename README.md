# FoundIt

FoundIt is a secure and modern platform designed to reunite people with their lost belongings, or safely return items they've found. It focuses on free, local community-driven recovery with robust verification and anonymous communication.

## Features

- **Public Listings**: Create detailed lost and found reports.
- **Anonymous Messaging**: Coordinate returns safely without exchanging phone numbers.
- **Private Verification**: Claimants must provide non-public details about the item to prove ownership.
- **Location Based**: Discover matching items in your immediate vicinity.
- **100% Free**: No subscriptions, no hidden fees.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase) via Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: Custom secure email OTP authentication
- **Email Delivery**: Nodemailer

## Requirements

- Node.js 18+
- PostgreSQL database (e.g. Supabase)
- SMTP Server (for transactional emails)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/foundit.git
   cd foundit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in the necessary values in `.env`:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A secure random string for session tokens.
   - `SMTP_*`: Your email provider details.
   - `NEXT_PUBLIC_APP_URL`: Set to `http://localhost:3000` for local development.

4. **Database Migration**
   Apply the migrations to your PostgreSQL database:
   ```bash
   npx prisma migrate dev
   ```
   *(Note: if applying to an existing populated database, you may need to use `npx prisma migrate resolve --applied 20260819112145_init` and then `npx prisma migrate deploy`)*

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Production Deployment

This application is designed to be deployed on platforms like Vercel, Railway, or standard Node.js servers.

### Database Migrations in Production

Run the following command during the build or deployment phase:
```bash
npx prisma migrate deploy
```

### Environment Configuration

Ensure all variables from `.env.example` are securely set in your deployment environment. `NODE_ENV` should automatically be set to `production` by your hosting provider.

## Contact & Support

For issues, please open a GitHub issue or contact the maintainers.
