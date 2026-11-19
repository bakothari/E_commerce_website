// The two emails your project already sends. They are used:
//   1. by seeders/seedEmailTemplates.js to put them in the database
//   2. as a safety net: if the template is deleted, inactive or missing,
//      sendTemplateMail still sends this text, so no email ever breaks.

const DEFAULT_TEMPLATES = {
    welcome_user: {
        name: "Welcome email (new user)",
        subject: "Welcome to {{appName}}, {{name}}",
        body: `<h2>Welcome {{name}}</h2>
<p>Your account has been created successfully.</p>
<p><b>Email:</b> {{email}}</p>
<p><b>Temporary Password:</b> {{password}}</p>
<p>Please use this password to login to the platform.</p>
<p>We recommend changing your password after logging in.</p>`
    },
    forgot_password_otp: {
        name: "Forgot password OTP",
        subject: "Your OTP",
        body: `<p>Hello {{name}},</p>
<p>Your OTP is <b>{{otp}}</b></p>
<p>Do not share it with anyone.</p>`
    }
};

// these two cannot be deleted from the admin page, because the code uses them
const SYSTEM_KEYS = Object.keys(DEFAULT_TEMPLATES);

module.exports = { DEFAULT_TEMPLATES, SYSTEM_KEYS };