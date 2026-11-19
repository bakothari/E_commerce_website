// Use it anywhere you send an email:
//
//     const { sendTemplateMail } = require("../utills/emailTemplate");
//     await sendTemplateMail("welcome_user", email, { name, email, password });
//
// It finds the template by key (active and not deleted), fills in the {{placeholders}}
// and sends it with your transporter.

const EmailTemplate = require("../models/Emailtempalte");
const transporter = require("./transporter");
const { DEFAULT_TEMPLATES } = require("./defaultTemplates");

// values go into HTML, so  <script>  typed as a name cannot become real HTML
const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

// replaces {{name}} with data.name   (a placeholder with no value becomes empty)
const fill = (text, data, clean) =>
    String(text ?? "").replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => clean(data[name] ?? ""));

const renderBody = (body, data) => fill(body, data, escapeHtml);

// the subject is plain text: no HTML escaping, but no line breaks (header injection)
const renderSubject = (subject, data) =>
    fill(subject, data, (value) => String(value).replace(/[\r\n]+/g, " ")).trim();

const sendTemplateMail = async (key, to, data = {}) => {

    let saved = await EmailTemplate.findOne({ key, status: "active", isDeleted: false });

    let source = saved || DEFAULT_TEMPLATES[key];

    if (!source) {
        throw new Error(`Email template "${key}" not found`);
    }

    let values = { appName: "YourApp", ...data };

    return transporter.sendMail({
        from: transporter.options?.auth?.user,
        to: to,
        subject: renderSubject(source.subject, values),
        html: renderBody(source.body, values)
    });
};

module.exports = { sendTemplateMail, renderBody, renderSubject };