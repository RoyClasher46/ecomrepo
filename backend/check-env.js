// Quick script to check if environment variables are loaded
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

console.log('\n=== Environment Variables Check ===\n');

const requiredVars = {
    'MONGO_URI': process.env.MONGO_URI,
    'JWT_SECRET': process.env.JWT_SECRET,
    'EMAIL_SERVICE': process.env.EMAIL_SERVICE,
    'EMAIL_USER': process.env.EMAIL_USER,
    'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD,
    'CLOUDINARY_CLOUD_NAME': process.env.CLOUDINARY_CLOUD_NAME,
    'CLOUDINARY_API_KEY': process.env.CLOUDINARY_API_KEY,
    'CLOUDINARY_API_SECRET': process.env.CLOUDINARY_API_SECRET,
};

console.log('Required Variables Status:');
console.log('----------------------------------------');

let allPresent = true;

for (const [key, value] of Object.entries(requiredVars)) {
    const isPresent = value !== undefined && value !== '';
    const status = isPresent ? '✅' : '❌';
    const displayValue = key.includes('PASSWORD') || key.includes('SECRET') 
        ? (value ? '*'.repeat(value.length) : 'NOT SET')
        : (value || 'NOT SET');
    
    console.log(`${status} ${key}: ${displayValue}`);
    
    if (!isPresent) {
        allPresent = false;
    }
}

console.log('----------------------------------------\n');

if (allPresent) {
    console.log('✅ All required environment variables are set!');
} else {
    console.log('❌ Some environment variables are missing!');
    console.log('\nPlease check your .env file in the backend directory.');
    console.log('Make sure:');
    console.log('  1. .env file is in the backend/ directory');
    console.log('  2. No quotes around values');
    console.log('  3. No spaces around = sign');
    console.log('  4. Restart server after changes');
}

console.log('\n=== Email Configuration Details ===\n');
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    const emailUser = process.env.EMAIL_USER.trim();
    const emailPassword = process.env.EMAIL_PASSWORD.trim();
    
    console.log(`EMAIL_USER: ${emailUser}`);
    console.log(`EMAIL_PASSWORD length: ${emailPassword.length} characters`);
    console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'gmail'}`);
    
    if (emailPassword.includes(' ')) {
        console.log('\n⚠️  WARNING: EMAIL_PASSWORD contains spaces!');
        console.log('   Remove all spaces from your App Password.');
    }
    
    if (emailPassword.length !== 16) {
        console.log('\n⚠️  WARNING: App Password should be exactly 16 characters.');
        console.log(`   Current length: ${emailPassword.length}`);
    }
} else {
    console.log('❌ EMAIL_USER or EMAIL_PASSWORD not set!');
}

console.log('\n');






