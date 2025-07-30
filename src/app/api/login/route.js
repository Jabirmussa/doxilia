import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import Client from '@/models/Client';
import Accountant from '@/models/Accountant';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie'; 

const JWT_SECRET = process.env.JWT_SECRET || '6880cc252d82d03f0907a642';

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
    }

    let user = await Admin.findOne({ email });
    let userType = 'admin';

    if (!user) {
      user = await Client.findOne({ email });
      userType = 'client';
    }

    if (!user) {
      user = await Accountant.findOne({ email });
      userType = 'accountant';
    }

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not founded' }), { status: 401 });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: 'Invalid password. Please try again.' }), { status: 401 });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: userType
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );


    const isProduction = process.env.NODE_ENV === 'production';

    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
    });

    return new Response(JSON.stringify({ message: 'Login ok', userType, userId: user._id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie
      }
    });

  } catch (error) {
    console.error('Erro na API login:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}