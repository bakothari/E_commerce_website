
const mongoose = require("mongoose");
const EmailTemplate = require("./models/Emailtempalte");
const { DEFAULT_TEMPLATES } = require("../utills/defaultTemplates");

async function seedEmailTemplates() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/project");

        for (let key of Object.keys(DEFAULT_TEMPLATES)) {
            let item = DEFAULT_TEMPLATES[key];

            await EmailTemplate.updateOne(
                { key: key },
                {
                    $setOnInsert: {
                        name: item.name,
                        key: key,
                        subject: item.subject,
                        body: item.body,
                        status: "active",
                        isDeleted: false
                    }
                },
                { upsert: true }
            );
        }

        console.log("Email templates added successfully");
    } catch (error) {
        console.log(error);
    } finally {
        await mongoose.disconnect();
    }
}

if (require.main === module) {
    seedEmailTemplates();
}

module.exports = { seedEmailTemplates };