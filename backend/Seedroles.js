// First-time setup. Run it from the backend folder.
//
//   NEW or EMPTY database (nobody exists yet) - creates your first SUPER_ADMIN user:
//        node seeders/seedRoles.js your-email@example.com YourPassword "Your Name"
//
//   Database that already has your user - just makes that user SUPER_ADMIN:
//        node seeders/seedRoles.js your-email@example.com
//
// It does ONLY what the Roles page cannot do. After it runs, log in and create
// ADMIN, STORE_MANAGER and every other role from the Roles page, and choose their permissions there.
//
//   1. creates the two roles the system needs
//        SUPER_ADMIN  -> permission "*" (everything). The Roles page cannot give "*"
//        CUSTOMER     -> signup gives this role to every new customer
//   2. makes the email you type a SUPER_ADMIN (and creates the user if it does not exist
//      and you typed a password)
//   3. repairs old users (a role saved as text, or no role at all)
//
// Safe to run again: it never changes the permissions of a role you edited on the Roles page.
// (SUPER_ADMIN is the only role that is refreshed, so it always has everything.)

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Role = require("./models/Role");

const roles = [
    {
        name: "SUPER_ADMIN",
        permissions: ["*"]
    },
    {
        name: "CUSTOMER",
        permissions: [
            "profile.read_own",
            "profile.update_own",
            "product.read",
            "order.create",
            "category.read",            // customers can browse the catalogue
            "subcategory.read",
            "brand.read"
        ]
    }
];

async function seedRoles() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // 1. the two roles
        for (let item of roles) {
            const role = { ...item, status: "active" };

            if (role.name === "SUPER_ADMIN") {
                await Role.findOneAndUpdate(
                    { name: role.name },
                    { $set: role },
                    { upsert: true, new: true }
                );
            }
            else {
                // only created when it is missing, so your changes are kept
                await Role.findOneAndUpdate(
                    { name: role.name },
                    { $setOnInsert: role },
                    { upsert: true, new: true }
                );
            }
        }

        console.log("Roles ready: SUPER_ADMIN, CUSTOMER");

        const users = mongoose.connection.collection("users");
        const allRoles = await Role.find();
        const superAdmin = allRoles.find((r) => r.name === "SUPER_ADMIN");
        const customer = allRoles.find((r) => r.name === "CUSTOMER");

        // 2. old users that have the role as TEXT ("CUSTOMER") -> the real role id
        for (let r of allRoles) {
            await users.updateMany({ role: r.name }, { $set: { role: r._id } });
        }

        // 3. the email you typed becomes SUPER_ADMIN
        const email = process.argv[2];
        const password = process.argv[3];
        const name = process.argv[4] || "Super Admin";

        if (email) {
            let found = await users.findOne({ email: email });

            if (found) {
                await users.updateOne({ email: email }, { $set: { role: superAdmin._id } });
                console.log(`${email} is now SUPER_ADMIN`);
            }
            else if (password) {
                // a new database has nobody yet, so the first user is created here
                if (password.length < 6) {
                    console.log("The password must have at least 6 characters. Nobody was created.");
                }
                else {
                    await users.insertOne({
                        name: name,
                        email: email,
                        password: await bcrypt.hash(password, 10),
                        mobile: "",
                        address: "",
                        status: "active",
                        role: superAdmin._id,
                        __v: 0
                    });
                    console.log(`SUPER_ADMIN user created: ${email}`);
                    console.log("Log in with that password, then change it.");
                }
            }
            else {
                console.log(`No user found with email ${email}.`);
                console.log(`To create it now run:  node seeders/seedRoles.js ${email} YourPassword "Your Name"`);
            }
        }
        else {
            let count = await users.countDocuments({ role: superAdmin._id });

            if (count === 0) {
                console.log("No user is SUPER_ADMIN yet. Run:  node seeders/seedRoles.js your-email@example.com YourPassword");
            }
        }

        // 4. users whose text role is a role that does not exist yet (for example "ADMIN")
        //    become CUSTOMER for now. Create the role on the Roles page and give them the role again.
        let leftovers = await users.find({ role: { $type: "string" } }).toArray();

        for (let user of leftovers) {
            console.log(`  ${user.email} had the role "${user.role}", which does not exist yet -> now CUSTOMER`);
        }

        if (leftovers.length > 0) {
            await users.updateMany({ role: { $type: "string" } }, { $set: { role: customer._id } });
        }

        // 5. everyone who still has no role -> CUSTOMER
        let updated = await users.updateMany(
            { $or: [{ role: { $exists: false } }, { role: null }] },
            { $set: { role: customer._id } }
        );
        console.log(`${updated.modifiedCount} users without a role are now CUSTOMER`);

        console.log("Done. Log in and create the other roles on the Roles page.");
    } catch (error) {
        console.log(error);
    } finally {
        await mongoose.disconnect();
    }
}

if (require.main === module) {
    seedRoles();
}

module.exports = { roles };