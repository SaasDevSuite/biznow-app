## 🗃️ Project Structure

```
src/
├── actions/                 # Action handlers for various features (e.g., invoice, plan, subscription, user)
│   ├── invoice/             # Invoice-related action handlers
│   ├── plan/                # Plan-related action handlers
│   ├── subscription/        # Subscription-related action handlers
│   └── user/                # User-related action handlers
├── app/                     # Application code
│   ├── (auth)/              # Authentication-related components
│   │   ├── reset-password/  # Reset password functionality
│   │   │   └── [token]/     # Token-based password reset
│   │   ├── set-password/    # Set password functionality
│   │   ├── sign-in/         # Sign-in functionality
│   │   ├── sign-up/         # Sign-up functionality
│   │   └── verify/          # Verification functionality
│   │       └── [type]/      # Type-based verification (e.g., email, phone)
│   │           └── [token]/ # Token-based verification
│   ├── (dashboard)/        # Dashboard-related features
│   │   ├── admin/           # Admin interface
│   │   │   ├── invoice/     # Invoice management
│   │   │   ├── plan/        # Plan management
│   │   │   ├── settings/    # Settings management
│   │   │   ├── subscription/ # Subscription management
│   │   │   └── user/        # User management
│   │   ├── app/             # Application-specific features
│   │   └── checkout/        # Checkout process
│   │       ├── result/      # Checkout result
│   │       │   └── [invoiceId]/ # Invoice ID-based result
│   │       └── [planId]/    # Plan ID-based checkout
│   ├── api/                 # API endpoints
│   │   ├── auth/            # Authentication-related API endpoints
│   │   │   ├── reset-password/ # Reset password API endpoint
│   │   │   ├── verify-email/  # Verify email API endpoint
│   │   │   └── confirm/      # Confirm API endpoint
│   │   │   ├── signup/       # Signup API endpoint
│   │   │   └── [...nextauth]/ # NextAuth API endpoints
│   │   ├── invoice/         # Invoice-related API endpoints
│   │   │   ├── create/      # Create invoice API endpoint
│   │   │   └── [invoiceId]/  # Invoice ID-based API endpoint
│   │   ├── plans/           # Plan-related API endpoints
│   │   │   ├── all/         # All plans API endpoint
│   │   │   └── select/      # Select plan API endpoint
│   │   │       └── [planId]/ # Plan ID-based API endpoint
│   │   └── subscription/    # Subscription-related API endpoints
├── components/             # Reusable UI components
│   ├── admin/               # Admin-specific UI components
│   ├── app/                 # Application-specific UI components
│   ├── custom/              # Custom UI components
│   └── ui/                  # General UI components
├── contexts/               # Context providers for various features
│   └── data/                # Data context provider
└── lib/                     # Utility libraries and helper functions
```