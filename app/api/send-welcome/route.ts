import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and Name are required' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Columbia GS Business Society <admin@columbiagsbs.com>',
      to: [email],
      replyTo: 'gsbssociety@gmail.com',
      subject: 'Welcome to the GS Business Society!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0f4d92;">Welcome to GSBS, ${name}!</h2>
          <p>Congratulations! Your access to the Columbia GS Business Society dashboard has been approved.</p>
          <p>You can now log in using your Columbia Google account to access exclusive interview tips, newsletters, and upcoming events.</p>
          <p style="margin-top: 30px;">
            <a href="https://gsbusinesssociety.github.io/login" style="background-color: #0f4d92; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Access the Dashboard
            </a>
          </p>
          <p style="margin-top: 40px; font-size: 14px; color: #666;">
            Best,<br>
            The Columbia GS Business Society Board
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
