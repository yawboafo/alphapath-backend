import db from '../config/database';

async function makeAdmin(email: string) {
  try {
    console.log(`Attempting to update user: ${email}`);
    
    // Check if user exists
    const { rows: users } = await db.query(
      'SELECT id, email, membership_tier FROM users WHERE email = $1',
      [email]
    );

    if (users.length === 0) {
      console.error(`❌ User not found: ${email}`);
      console.log('Please register this email first at the API.');
      process.exit(1);
    }

    console.log('Current user:', users[0]);

    // Update to admin
    const { rows: updated } = await db.query(
      `UPDATE users 
       SET membership_tier = 'admin', updated_at = NOW() 
       WHERE email = $1 
       RETURNING id, email, membership_tier, updated_at`,
      [email]
    );

    console.log('✅ Successfully updated to admin:', updated[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

const email = process.argv[2] || 'admin@alphapath.com';
makeAdmin(email);
