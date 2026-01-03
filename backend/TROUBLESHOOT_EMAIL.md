# Troubleshooting Email Authentication

## Quick Diagnostic Steps

### Step 1: Check Your Configuration

Visit this URL in your browser or use curl:
```
http://localhost:5000/api/check-email-config
```

This will show you:
- If EMAIL_USER and EMAIL_PASSWORD are set
- The length of your password
- If there are spaces in the password
- Any configuration issues

### Step 2: Common Issues and Fixes

#### Issue 1: Password Contains Spaces
**Symptom:** `hasSpaces: true` in diagnostic

**Fix:**
1. Open your `.env` file in `backend` directory
2. Find the line: `EMAIL_PASSWORD=...`
3. Remove ALL spaces from the App Password
4. Example:
   ```
   ❌ Wrong: EMAIL_PASSWORD=abcd efgh ijkl mnop
   ✅ Correct: EMAIL_PASSWORD=abcdefghijklmnop
   ```

#### Issue 2: Password Length is Not 16
**Symptom:** `emailPasswordLength` is not 16

**Fix:**
- App Passwords are exactly 16 characters
- Make sure you copied the entire password
- Don't include any extra characters

#### Issue 3: .env File Not Being Read
**Symptom:** `configured: false` in diagnostic

**Fix:**
1. Make sure `.env` file is in `backend` directory (not root)
2. Make sure there are NO quotes around values:
   ```
   ❌ Wrong: EMAIL_PASSWORD="abcdefghijklmnop"
   ✅ Correct: EMAIL_PASSWORD=abcdefghijklmnop
   ```
3. Make sure there are NO spaces around the `=` sign:
   ```
   ❌ Wrong: EMAIL_PASSWORD = abcdefghijklmnop
   ✅ Correct: EMAIL_PASSWORD=abcdefghijklmnop
   ```
4. Restart your server after making changes

#### Issue 4: Wrong Email Address
**Symptom:** Still getting EAUTH error even with correct App Password

**Fix:**
- Make sure `EMAIL_USER` matches the Gmail account where you generated the App Password
- Example:
   ```
   EMAIL_USER=myemail@gmail.com
   ```

### Step 3: Verify .env File Format

Your `.env` file should look exactly like this (no quotes, no spaces):

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key
EMAIL_SERVICE=gmail
EMAIL_USER=myemail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
PORT=5000
NODE_ENV=development
```

**Important Rules:**
- ✅ No quotes around values
- ✅ No spaces around `=`
- ✅ No spaces in App Password
- ✅ One variable per line
- ✅ No trailing spaces

### Step 4: Generate a Fresh App Password

If you're still having issues, generate a NEW App Password:

1. Go to: https://myaccount.google.com/apppasswords
2. Delete the old "E-commerce App" password (if exists)
3. Generate a new one:
   - Select "Mail"
   - Select "Other (Custom name)"
   - Name: "E-commerce App"
   - Click "Generate"
4. **Immediately copy** the 16-character password (it's shown only once!)
5. Update your `.env` file with the new password
6. Restart your server

### Step 5: Test Again

After fixing the issues:

1. **Check configuration:**
   ```bash
   curl http://localhost:5000/api/check-email-config
   ```

2. **Test sending email:**
   ```bash
   curl -X POST http://localhost:5000/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"testEmail": "your-email@gmail.com"}'
   ```

3. **Check server logs** for detailed error messages

## Still Not Working?

### Check Server Logs

When you try to send an email, check your server console. You should see:
```
Email Config Check:
  EMAIL_USER: your-email@gmail.com
  EMAIL_PASSWORD length: 16 characters
  EMAIL_SERVICE: gmail
```

If you see warnings about spaces or wrong length, fix those issues.

### Verify App Password is Correct

1. Make sure 2-Step Verification is enabled on your Google Account
2. Make sure you're using the App Password, not your regular password
3. Try generating a completely new App Password

### Alternative: Use Different Email Service

If Gmail continues to cause issues, consider using:
- Outlook/Hotmail
- SendGrid
- Mailgun
- Custom SMTP server

See `EMAIL_SETUP.md` for configuration details.

