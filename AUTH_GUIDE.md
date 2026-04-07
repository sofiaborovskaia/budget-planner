# Authentication Implementation Guide

## 🎓 What You Learned

### Core Concepts

1. **Authentication vs Authorization**
   - Authentication = "Who are you?" (login)
   - Authorization = "What can you do?" (permissions)

2. **Password Security**
   - NEVER store plain text passwords
   - Always use bcrypt hashing (one-way encryption)
   - Hash format: `$2b$10$...` (includes salt + algorithm + iterations)

3. **Session Management**
   - Sessions stored in encrypted HTTP-only cookies
   - Cannot be accessed by JavaScript (XSS protection)
   - Automatically sent with requests

4. **Next.js Architecture**
   - **Server Components**: Render on server, can access database
   - **Client Components**: Interactive, use hooks, run in browser
   - **Server Actions**: Server functions called from client
   - **Middleware**: Runs before every request (edge runtime)

## 📁 File Structure

```
/
├── .env.local              # Environment variables (AUTH_SECRET, DATABASE_URL)
├── auth.config.ts          # Edge-compatible auth config (middleware)
├── auth.ts                 # Main auth config (Node.js APIs)
├── middleware.ts           # Route protection
├── prisma/
│   └── schema.prisma       # Database schema (added password field)
└── app/
    ├── login/
    │   └── page.tsx        # Login page
    ├── components/
    │   └── auth/
    │       └── LoginForm.tsx  # Login form component
    └── lib/
        └── actions/
            └── auth.ts     # Server Actions (authenticate, signOut)
```

## 🔑 How It Works

### Login Flow

1. User visits `/profile` (protected route)
2. Middleware checks auth → not logged in
3. Redirects to `/login`
4. User enters email + password
5. Form submits to `authenticate()` Server Action
6. Server Action calls NextAuth `signIn('credentials', formData)`
7. NextAuth calls your `authorize()` function
8. `authorize()` validates format with Zod
9. `authorize()` fetches user from database
10. `authorize()` compares bcrypt hashes
11. If match: Creates encrypted session cookie
12. Redirects to `/profile`

### Route Protection

Middleware (`middleware.ts`) runs on EVERY request:

- Checks if user has valid session
- If accessing `/profile` or `/period/*` without login → redirect to `/login`
- If logged in and accessing `/login` → redirect to `/profile`
- All other routes pass through

### Logout Flow

1. User clicks "Logout" button
2. Button calls `signOut()` Server Action
3. Server Action calls NextAuth `signOut({ redirectTo: '/' })`
4. Session cookie is cleared
5. User redirects to home page

## 🛠️ Key Technologies

1. **NextAuth.js (v5)**
   - Industry-standard authentication for Next.js
   - Handles sessions, cookies, CSRF protection
   - Providers: OAuth (Google, GitHub), Email, Credentials

2. **bcryptjs**
   - Password hashing library
   - Pure JavaScript (works everywhere)
   - Automatically generates salt

3. **Zod**
   - Schema validation
   - Type-safe input validation
   - Runtime + compile-time safety

4. **Prisma**
   - Database ORM
   - Type-safe database queries
   - Automatic migrations

## 🧑‍💻 Your Database

### User Table

```sql
CREATE TABLE "User" (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,  -- bcrypt hash
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP
);
```

### Current User

- **Email**: Check your database
- **Password**: `changeme123` (temporary - should be changed!)

## 🔐 Security Best Practices Implemented

✅ **Password Hashing**: bcrypt with 10 rounds (industry standard)
✅ **HTTP-Only Cookies**: Session cannot be accessed by JavaScript  
✅ **CSRF Protection**: Built into NextAuth.js
✅ **Route Protection**: Middleware prevents unauthorized access
✅ **Server-Side Validation**: Never trust client input
✅ **Environment Variables**: Secrets not in code

## 📚 Next Steps

### Immediate

1. Test login with your email + "changeme123"
2. Add "Change Password" feature
3. Add "Forgot Password" flow

### Advanced

1. Add OAuth (Google, GitHub)
2. Add two-factor authentication (2FA)
3. Add email verification
4. Add password reset emails
5. Add session management (view active sessions)

## 🐛 Debugging

### Check if user is logged in

```typescript
import { auth } from '@/auth';

export default async function MyPage() {
  const session = await auth();
  console.log('User:', session?.user);
  return <div>...</div>;
}
```

### View Prisma data

```bash
pnpm prisma studio
# Opens http://localhost:5555
```

### Check environment variables

```bash
cat .env.local
# Should see AUTH_SECRET and DATABASE_URL
```

## 💡 Key Takeaways

1. **Two-file pattern**: `auth.config.ts` (edge) + `auth.ts` (Node.js)
2. **Middleware is powerful**: Runs before routes even render
3. **Server Actions are awesome**: Type-safe server functions from client
4. **Never store plain passwords**: Always hash with bcrypt
5. **Sessions in HTTP-only cookies**: Most secure approach

## 📖 Resources

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Next.js Authentication Guide](https://nextjs.org/learn/dashboard-app/adding-authentication)
- [bcrypt Explained](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/)
- [Session vs Token Auth](https://stackoverflow.com/questions/43452896/authentication-jwt-usage-vs-session)

---

**Congratulations!** 🎉 You've implemented production-grade authentication with modern best practices!
