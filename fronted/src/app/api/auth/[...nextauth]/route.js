import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

const handler = NextAuth({
  site: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const axios = (await import('axios')).default;
          const response = await axios.post('http://localhost:3001/signin/login', {
            email: credentials.email,
            password: credentials.password,
          });
          if (response.status === 200 && response.data.user) {
            return {
              id: response.data.user._id,
              name: response.data.user.name,
              email: response.data.user.email,
              token: response.data.token,
              role: response.data.user.role || response.data.role,
            };
          }
          throw new Error(response.data.message || 'Invalid email or password');
        } catch (error) {
          // If error.response exists, use its message
          if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
          }
          throw new Error('Invalid email or password');
        }
      },
    }),
  ],
});
export { handler as GET, handler as POST };
