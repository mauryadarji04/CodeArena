import nodemailer from 'nodemailer';

let transporter;

export const initializeMailer = () => {
  // Development mode: use test account
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Using test account mode.');
    transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false
    });
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

export const getMailer = () => {
  if (!transporter) {
    return initializeMailer();
  }
  return transporter;
};