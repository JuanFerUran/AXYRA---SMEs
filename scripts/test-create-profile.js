// Node script to test /api/auth/create-profile endpoint
// Usage: set ENV INTERNAL_API_KEY and DEPLOY_URL then run `node scripts/test-create-profile.js`

const fetch = globalThis.fetch;

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

(async () => {
  const secret = process.env.INTERNAL_API_KEY;
  const url = process.env.DEPLOY_URL || 'http://localhost:3000';

  if (!secret) {
    console.error('INTERNAL_API_KEY not set. Skipping test.');
    process.exit(1);
  }

  const userId = uuidv4();
  const payload = {
    userId,
    email: `test+${userId}@example.com`,
    first_name: 'Test',
    last_name: 'User',
    role: 'admin',
  };

  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/api/auth/create-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': secret,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log('Response status:', res.status);
    console.log(text);
    if (!res.ok) process.exit(2);
  } catch (err) {
    console.error('Error calling create-profile:', err);
    process.exit(3);
  }
})();