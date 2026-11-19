const Store = require("../models/Store");
const User = require("../models/User");

// populate("manager", "name email") -> sends { _id, name, email } instead of only an id
const managerFields = "name email";

const createStore = async (req, res) => {
    try {
        let { name, code, manager, phone, address, location, serviceRadius } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                message: "Name and code are required"
            });
        }

        let existingStore = await Store.findOne({ code });

        if (existingStore) {
            return res.status(409).json({
                message: "Store code already exists"
            });
        }

        // manager is optional, but if sent it must be a real user
        if (manager) {
            let managerDoc = await User.findById(manager);

            if (!managerDoc) {
                return res.status(400).json({
                    message: "Invalid manager"
                });
            }
        }

        let store = await Store.create({
            name,
            code,
            manager: manager || undefined,
            phone,
            address,
            location,
            serviceRadius
        });

        store = await store.populate("manager", managerFields);

        return res.status(201).json({
            message: "Store created successfully",
            store: store
        });

    } catch (err) {
        console.log("Store creation error:", err);

        return res.status(500).json({
            message: err.message || "Store creation failed"
        });
    }
};

const getallStore = async (req, res) => {
    try {

        let stores = await Store.find().populate("manager", managerFields);

        return res.status(200).json({
            stores: stores
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Stores not found"
        });
    }
};

const getStoreById = async (req, res) => {
    try {

        let store = await Store.findById(req.params.id)
            .populate("manager", managerFields);

        if (!store) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        return res.status(200).json({
            store: store
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Store not found"
        });
    }
};

const updateStore = async (req, res) => {
    try {

        let { name, code, manager, phone, address, location, serviceRadius } = req.body;

        // code must stay unique (ignore this same store)
        if (code) {
            let duplicate = await Store.findOne({ code, _id: { $ne: req.params.id } });

            if (duplicate) {
                return res.status(409).json({
                    message: "Store code already exists"
                });
            }
        }

        let updateData = {
            name,
            code,
            phone,
            address,
            location,
            serviceRadius
        };

        // empty string = remove manager, id = change manager
        if (manager) {
            let managerDoc = await User.findById(manager);

            if (!managerDoc) {
                return res.status(400).json({
                    message: "Invalid manager"
                });
            }

            updateData.manager = manager;
        } else if (manager === "") {
            updateData.manager = null;
        }

        let store = await Store.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate("manager", managerFields);

        if (!store) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        return res.status(200).json({
            message: "Store updated successfully",
            store: store
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Store update failed"
        });
    }
};

const deleteStore = async (req, res) => {
    try {

        let store = await Store.findByIdAndDelete(req.params.id);

        if (!store) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        return res.status(200).json({
            message: "Store deleted successfully"
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Store deletion failed"
        });
    }
};

const viewStore = async (req, res) => {
    let { id } = req.params;

    try {

        let store = await Store.findById(id).populate("manager", managerFields);

        if (!store) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        return res.status(200).json({
            message: "Store found successfully",
            store: store
        });

    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const storeStatus = async (req, res) => {
    try {

        let { status } = req.body;

        let store = await Store.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        ).populate("manager", managerFields);

        if (!store) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        return res.status(200).json({
            message: "Status updated successfully",
            store: store
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createStore,
    getallStore,
    getStoreById,
    updateStore,
    deleteStore,
    viewStore,
    storeStatus
};