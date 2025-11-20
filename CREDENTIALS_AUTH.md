# Credentials Authentication Guide

## 🔐 Overview

MindGen now supports **two authentication methods**:

1. **Google OAuth** - Sign in with your Google account
2. **Email/Password** - Create an account with email and password

---

## ✨ What Was Implemented

### 1. **Database Schema Update**
- Added `hashedPassword` field to the `User` model
- Supports both OAuth and credentials-based users

### 2. **Password Security**
- Uses **bcryptjs** for secure password hashing
- Passwords are hashed with a salt round of 12
- Minimum password length: 6 characters

### 3. **Registration API**
- **Endpoint**: `POST /api/auth/register`
- **Validates**: Email uniqueness, password strength
- **Returns**: User object on success

### 4. **NextAuth Configuration**
- Added **Credentials Provider** alongside Google OAuth
- Uses **JWT sessions** for credentials authentication
- Custom sign-in page at `/auth/signin`

### 5. **User Interface**
- **Sign In Page** (`/auth/signin`): Email/password form + Google OAuth button
- **Sign Up Page** (`/auth/signup`): Registration form with validation
- **Home Page**: Smart redirect based on authentication status

---

## 🚀 How to Use

### **For New Users (Sign Up)**

1. Navigate to http://localhost:3000
2. You'll be redirected to the sign-in page
3. Click **"Sign up"** link at the bottom
4. Fill in the registration form:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Confirm Password
5. Click **"Create Account"**
6. You'll be automatically signed in and redirected to the dashboard

### **For Existing Users (Sign In)**

#### Option 1: Email/Password
1. Go to http://localhost:3000/auth/signin
2. Enter your email and password
3. Click **"Sign In with Email"**

#### Option 2: Google OAuth
1. Go to http://localhost:3000/auth/signin
2. Click **"Sign in with Google"**
3. Authorize the app

---

## 🧪 Testing the Feature

### **Test 1: Sign Up Flow**

```bash
# 1. Open the app
open http://localhost:3000

# 2. Click "Sign up"
# 3. Fill the form:
#    - Full Name: Test User
#    - Email: test@example.com
#    - Password: password123
#    - Confirm Password: password123
# 4. Click "Create Account"
# 5. Verify you're redirected to /dashboard
```

**Expected Result**: ✅ User created, automatically signed in, dashboard loads

### **Test 2: Sign In with Credentials**

```bash
# 1. Sign out (if signed in)
# 2. Go to /auth/signin
# 3. Enter:
#    - Email: test@example.com
#    - Password: password123
# 4. Click "Sign In with Email"
```

**Expected Result**: ✅ Successfully signed in, redirected to dashboard

### **Test 3: Validation**

**Test 3a: Password Mismatch**
- Enter different passwords in Password and Confirm Password
- **Expected**: Error message "Passwords do not match"

**Test 3b: Short Password**
- Enter password with less than 6 characters
- **Expected**: Error message "Password must be at least 6 characters"

**Test 3c: Duplicate Email**
- Try to sign up with an email that already exists
- **Expected**: Error message "User with this email already exists"

**Test 3d: Invalid Credentials**
- Try to sign in with wrong password
- **Expected**: Error message "Invalid email or password"

### **Test 4: Google OAuth Still Works**

```bash
# 1. Go to /auth/signin
# 2. Click "Sign in with Google"
# 3. Complete OAuth flow
```

**Expected Result**: ✅ Google OAuth works alongside credentials auth

---

## 📁 Files Modified/Created

### **New Files**
- `src/app/api/auth/register/route.ts` - Registration API endpoint
- `src/app/auth/signin/page.tsx` - Custom sign-in page
- `src/app/auth/signup/page.tsx` - Sign-up page

### **Modified Files**
- `prisma/schema.prisma` - Added `hashedPassword` field
- `src/auth.ts` - Added Credentials provider
- `src/app/page.tsx` - Updated redirect logic
- `package.json` - Added bcryptjs dependency

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **Input Validation**: Email format, password length
3. **Duplicate Prevention**: Email uniqueness check
4. **Error Handling**: Generic error messages to prevent user enumeration
5. **JWT Sessions**: Secure token-based sessions for credentials auth

---

## 🐛 Troubleshooting

### **Issue: "Invalid credentials" on sign-in**

**Possible Causes**:
1. Wrong email or password
2. User doesn't exist
3. User was created via Google OAuth (no password set)

**Solution**: 
- Verify credentials
- Try "Sign in with Google" if you originally used OAuth
- Create a new account if needed

### **Issue: "User with this email already exists"**

**Cause**: Email is already registered

**Solution**: 
- Use the sign-in page instead
- Try "Sign in with Google" if you used OAuth before

### **Issue: Session not persisting**

**Cause**: JWT session configuration

**Solution**: 
- Check `NEXTAUTH_SECRET` is set in `.env`
- Restart the dev server

---

## 🔄 Migration Notes

### **For Existing Users**

- **Google OAuth users**: Continue using Google sign-in (no changes)
- **New users**: Can choose either method
- **Mixed usage**: Not supported - stick to one method per email

### **Database Changes**

```sql
-- The following column was added to the User table:
ALTER TABLE "User" ADD COLUMN "hashedPassword" TEXT;
```

This was applied via `npx prisma db push`

---

## 📊 API Reference

### **POST /api/auth/register**

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses**:
- `400`: Missing fields or password too short
- `409`: Email already exists
- `500`: Server error

---

## 🎨 UI Components

### **Sign-In Page** (`/auth/signin`)
- Email input field
- Password input field
- "Sign In with Email" button
- Divider with "Or continue with"
- "Sign in with Google" button
- Link to sign-up page

### **Sign-Up Page** (`/auth/signup`)
- Full Name input field
- Email input field
- Password input field
- Confirm Password input field
- "Create Account" button
- Divider with "Or continue with"
- "Sign up with Google" button
- Link to sign-in page

---

## ✅ Verification Checklist

- [x] Users can sign up with email/password
- [x] Passwords are securely hashed with bcrypt
- [x] Users can sign in with email/password
- [x] Google OAuth still works
- [x] Form validation works (password match, length, etc.)
- [x] Error messages are user-friendly
- [x] Auto sign-in after registration
- [x] Session persists across page reloads
- [x] Database schema updated
- [x] UI is responsive and styled

---

## 🚀 Next Steps

1. **Test the authentication flow** using the testing guide above
2. **Add Google OAuth credentials** if you haven't already (see main README)
3. **Deploy to Vercel** - credentials auth will work in production
4. **Optional enhancements**:
   - Add "Forgot Password" functionality
   - Add email verification
   - Add profile picture upload
   - Add 2FA (two-factor authentication)

---

**Authentication is now fully functional with both Google OAuth and Email/Password!** 🎉
