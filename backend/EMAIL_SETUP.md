# Email Configuration Guide

## Quick Setup for Gmail

1. **Enable 2-Step Verification**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security → 2-Step Verification
   - Enable it if not already enabled

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Select "Other (Custom name)" as device
   - Enter "E-commerce App" as the name
   - Click "Generate"
   - Copy the 16-character password (no spaces)

3. **Update .env file**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```

4. **Restart your server**
   ```bash
   npm run dev
   ```

## Testing Email Configuration

You can test your email configuration using the test endpoint:

```bash
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@gmail.com"}'
```

Or use Postman/Thunder Client:
- Method: POST
- URL: `http://localhost:5000/api/test-email`
- Body (JSON):
  ```json
  {
    "testEmail": "your-email@gmail.com"
  }
  ```

## Common Issues

### 1. "Email authentication failed"
- **Solution**: Make sure you're using an App Password, not your regular Gmail password
- Verify EMAIL_USER and EMAIL_PASSWORD are correct in .env
- Make sure there are no extra spaces in the .env file

### 2. "Email service not configured"
- **Solution**: Add EMAIL_USER and EMAIL_PASSWORD to your .env file
- Make sure the .env file is in the `backend` directory
- Restart the server after updating .env

### 3. "Failed to connect to email server"
- **Solution**: Check your internet connection
- For Gmail, make sure "Less secure app access" is enabled (if using regular password)
- Better: Use App Password instead

### 4. OTP not received
- Check spam/junk folder
- Verify the email address is correct
- Check server logs for detailed error messages
- Test using the `/api/test-email` endpoint

## Using Other Email Services

### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Custom SMTP Server
```env
EMAIL_SERVICE=
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
```

## Environment Variables Required

Make sure these are in your `backend/.env` file:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Important**: Never commit your .env file to version control!

