function generateKey() {
  const token = jwt.sign(
    {
      user: 'admin',
      role: 'admin'
    },
    key,
    {
      expiresIn: '24h'
    }
  );
  return token;
}

generateKey();