import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

const handler = NextAuth({
  site: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google signup
      if (account?.provider === 'google') {
        try {
          const axios = (await import('axios')).default;
          const response = await axios.post('http://localhost:3001/auth/google-signup', {
            name: user.name,
            email: user.email,
            picture: user.image
          });
          
          if (response.status === 200 || response.status === 201) {
            // Update user object with backend data
            user.id = response.data.user._id;
            user.role = response.data.user.role;
            user.phone = response.data.user.phone;
            user.address = response.data.user.address;
            user.gender = response.data.user.gender;
            user.createdAt = response.data.user.createdAt;
            user.profilePic = response.data.user.profilePic;
            return true;
          }
        } catch (error) {
          console.error('Google signup error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Add user id to token when user signs in
      if (user) {
        token.role = user.role;
        token.id = user.id || user._id; // Always set id from either field
        token.phone = user.phone;
        token.address = user.address;
        token.gender = user.gender;
        token.createdAt = user.createdAt;
      }
      
      // Handle session update trigger
      if (trigger === "update" && session) {
        token.name = session.name;
        token.phone = session.phone;
        token.address = session.address;
        token.gender = session.gender;
        token.picture = session.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add role and id to session
      if (token) {
        session.user.role = token.role;
        if (token.id) session.user.id = token.id;
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.gender = token.gender;
        session.user.createdAt = token.createdAt;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // GitHubProvider({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
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
              image: response.data.user.profilePic,
              token: response.data.token,
              role: response.data.user.role || response.data.role,
              phone: response.data.user.phone,
              address: response.data.user.address,
              gender: response.data.user.gender,
              createdAt: response.data.user.createdAt,
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
