# tRPC + TanStack Query + Drizzle ORM Setup

This project is configured with:
- **tRPC**: End-to-end typesafe APIs
- **TanStack Query**: Server state management and data fetching
- **Drizzle ORM**: Type-safe database operations with PostgreSQL

## Prerequisites

1. Make sure your PostgreSQL Docker container is running:
   ```bash
   docker-compose up -d
   ```

2. Set up your environment variables in `.env.local`:
   ```bash
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   
   # Example with your Docker Compose variables:
   # DATABASE_URL=postgresql://${BLUEPRINT_DB_USERNAME}:${BLUEPRINT_DB_PASSWORD}@localhost:${BLUEPRINT_DB_PORT}/${BLUEPRINT_DB_DATABASE}
   ```

## Database Setup

1. **Generate migrations** (creates SQL files based on your schema):
   ```bash
   npm run db:generate
   ```

2. **Push schema to database** (applies schema changes directly):
   ```bash
   npm run db:push
   ```

3. **View database in Drizzle Studio**:
   ```bash
   npm run db:studio
   ```

## Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit the application** at `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── api/trpc/[trpc]/route.ts  # tRPC API endpoint
│   ├── layout.tsx                # Root layout with TRPC provider
│   └── page.tsx                  # Example page with tRPC usage
├── components/
│   └── trpc-provider.tsx         # tRPC and TanStack Query provider
├── db/
│   ├── index.ts                  # Database connection
│   └── schema.ts                 # Drizzle schema definitions
├── server/
│   ├── routers/
│   │   └── _app.ts              # Main tRPC router
│   └── trpc/
│       └── trpc.ts              # tRPC initialization
└── utils/
    └── trpc.ts                  # tRPC client export
```

## Available tRPC Procedures

### Queries
- `hello` - Basic hello world example
- `getUsers` - Fetch all users
- `getUserById` - Fetch user by ID
- `getPosts` - Fetch all posts

### Mutations
- `createUser` - Create a new user
- `createPost` - Create a new post

## Usage Examples

### Using tRPC in React Components

```tsx
'use client';

import { trpc } from '@/components/trpc-provider';

export function UserList() {
  const { data: users, isLoading, error } = trpc.getUsers.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Using Mutations

```tsx
const createUserMutation = trpc.createUser.useMutation({
  onSuccess: () => {
    // Refetch users after creating a new one
    usersQuery.refetch();
  },
});

const handleCreateUser = () => {
  createUserMutation.mutate({
    name: 'John Doe',
    email: 'john@example.com'
  });
};
```

## Database Schema

The current schema includes:

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `name`
- `createdAt`
- `updatedAt`

### Posts Table
- `id` (Primary Key)
- `title`
- `content`
- `published`
- `authorId` (Foreign Key to Users)
- `createdAt`
- `updatedAt`

## Adding New Procedures

1. **Add to the router** in `src/server/routers/_app.ts`:
   ```ts
   export const appRouter = router({
     // ... existing procedures
     newProcedure: procedure
       .input(z.object({ /* input schema */ }))
       .query(async (opts) => {
         // Your logic here
         return result;
       }),
   });
   ```

2. **Use in components**:
   ```tsx
   const { data } = trpc.newProcedure.useQuery({ /* input */ });
   ```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check your `DATABASE_URL` in `.env.local`
- Verify the database exists and is accessible

### tRPC Errors
- Check the browser console for client-side errors
- Check the terminal for server-side errors
- Ensure all imports are correct

### TypeScript Errors
- Run `npm run build` to check for type errors
- Ensure all tRPC procedures have proper input/output types 