import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username or Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                await dbConnect();

                const identifier = credentials.username;
                const user = await User.findOne({
                    $or: [{ username: identifier }, { email: identifier }]
                });

                if (!user) {
                    throw new Error('No user found with the given username or email');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error('Invalid password');
                }

                return { id: user._id, name: user.username, email: user.email, image: user.image };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.username = user.name;

                // Do NOT store base64 images in the token/cookie (too large, causes 431 error)
                if (user.image && user.image.startsWith('data:')) {
                    token.image = null; // Client side will fetch it
                } else {
                    token.image = user.image;
                }
            }
            // Allow updating the token if session update is triggered
            if (trigger === "update") {
                console.log('JWT UPDATE TRIGGERED'); // DEBUG
                console.log('Session Update Data:', session); // DEBUG
                if (session?.username) token.username = session.username;

                if (session?.image) {
                    if (session.image.startsWith('data:')) {
                        token.image = null;
                    } else {
                        token.image = session.image;
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.image = token.image;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
