# Fix Gmail Authentication Error (EAUTH 535)

## The Problem
You're seeing this error:
```
code: 'EAUTH',
responseCode: 535,
response: '535-5.7.8 Username and Password not accepted'
```

This means Gmail is rejecting your credentials because you're using your **regular Gmail password** instead of an **App Password**.

## Solution: Use Gmail App Password

Gmail no longer allows apps to use regular passwords. You **MUST** use an App Password.

### Step-by-Step Fix:

1. **Enable 2-Step Verification** (if not already enabled)
   - Go to: https://myaccount.google.com/security
   - Click on "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → App passwords
   - Select "Mail" from the dropdown
   - Select "Other (Custom name)"
   - Enter name: "E-commerce App"
   - Click "Generate"
   - **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

3. **Update your .env file**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```
   
   **Important:**
   - Remove any spaces from the App Password
   - Use the full 16 characters
   - Don't use quotes around the password
   - Make sure there are no extra spaces before/after

4. **Example .env file:**
   ```env
   MONGO_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-secret-key
   EMAIL_SERVICE=gmail
   EMAIL_USER=myemail@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   PORT=5000
   NODE_ENV=development
   ```

5. **Restart your server**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   cd backend
   npm run dev
   ```

## Verify It Works

Test your email configuration:
```bash
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@gmail.com"}'
```

## Common Mistakes

❌ **Wrong:** Using your regular Gmail password
```env
EMAIL_PASSWORD=mypassword123
```

✅ **Correct:** Using App Password
```env
EMAIL_PASSWORD=abcdefghijklmnop
```

❌ **Wrong:** App Password with spaces
```env
EMAIL_PASSWORD="abcd efgh ijkl mnop"
```

✅ **Correct:** App Password without spaces
```env
EMAIL_PASSWORD=abcdefghijklmnop
```

## Still Having Issues?

1. **Check if 2-Step Verification is enabled**
   - Go to: https://myaccount.google.com/security
   - Make sure "2-Step Verification" shows as "On"

2. **Verify App Password was generated**
   - Go to: https://myaccount.google.com/apppasswords
   - You should see "E-commerce App" listed

3. **Check .env file location**
   - Make sure `.env` is in the `backend` directory
   - Not in the root or frontend directory

4. **Check for typos**
   - Verify EMAIL_USER is correct
   - Verify EMAIL_PASSWORD has no spaces
   - Make sure there are no quotes around values

5. **Check server logs**
   - Look for the exact error message
   - The improved error handler will now show specific guidance

## Alternative: Use Different Email Service

If you can't use Gmail App Passwords, you can use:
- Outlook/Hotmail
- Custom SMTP server
- Email services like SendGrid, Mailgun, etc.

See `EMAIL_SETUP.md` for other email service configurations.

