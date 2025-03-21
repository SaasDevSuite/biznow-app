# Admin User Creation Command Guide

This command lets you create a new administrator account in your application’s database. It uses Prisma for database
interaction and bcrypt for password hashing. You can run it directly using ts-node.

## Prerequisites

- **Node.js** and **TypeScript** installed on your system.
- The required npm packages installed:
    - `@prisma/client`
    - `bcryptjs`
    - `ts-node` (if running via ts-node)
- A working Prisma configuration and connected database.

## Command Usage

Run the script with the following syntax:

```bash
ts-node createAdmin.ts <username> <email> <password> [name]
```

### Parameters

- `<username>`: The username for the admin account.
- `<email>`: The email address for the admin.
- `<password>`: The password for the admin account. (This will be securely hashed.)
- `[name]` (optional): The full name of the admin.

### Example

To create an admin with the username `adminUser`, email `admin@example.com`, and password `securePass123`, you would
run:

```bash
ts-node createAdmin.ts adminUser admin@example.com securePass123 "Admin Name"
```

If you choose not to supply a name, simply run:

```bash
ts-node createAdmin.ts adminUser admin@example.com securePass123
```

## What the Script Does

1. **Hashes the Password**:  
   The script uses bcrypt to hash the provided password with a salt round of 10.
2. **Creates the Admin Record**:  
   It creates a new user record with the following settings:
    - **Role**: Set to `ADMIN`
    - **isActive**: Set to `true`
    - **Other fields**: `username`, `email`, and (optionally) `name`
3. **Error Handling**:  
   If there is any issue during user creation (for example, database connection issues or duplicate data), an error
   message is logged and the process exits with an error code.
4. **Clean Up**:  
   After execution, the Prisma client disconnects from the database.

## Related Command

There is also a package script command in your project:

```json
"mgt:user:create": "tsx  ./bin/mgt/user-mgt.ts"
```

This command is set up to run a different script (likely for managing users), which may include creating, updating, or
deleting user records. Use it according to your project’s documentation if you need additional user management
capabilities.