import nodemailer, {Transporter} from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import dotenv from "dotenv";
dotenv.config();

interface IMailOptions {
    email:string
    subject:string
    template:string
    data: {[key:string]:any}
}

const sendMail = async (options:IMailOptions): Promise<void> => {
    const transporter: Transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP__MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const {email, subject, template, data} = options;
    const templatePath = path.join(__dirname, `../mails`, template);

    const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: subject,
        html
    };

    await transporter.sendMail(mailOptions);
}

export default sendMail;