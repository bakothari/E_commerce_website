
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type CartItem = {
    _id: string;
    variantId: string;
    name: string;
    price: number;
    mrp?: number;
    image?: string;
    quantity: number;
};

export default function CheckoutPage() {
    const router = useRouter();

    const [items, setItems] = useState<CartItem[]>([]);

    const [address, setAddress] = useState({
        name: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [savedAddress, setSavedAddress] = useState(false);

    const FREE_DELIVERY_ABOVE = 500;
    const DELIVERY_FEE = 40;

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setItems(cart);
    }, [router]);

    const subtotal = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const total = subtotal + delivery;

    function saveAddress() {
        if (
            !address.name.trim() ||
            !address.mobile.trim() ||
            !address.address.trim() ||
            !address.city.trim() ||
            !address.state.trim() ||
            !address.pincode.trim()
        ) {
            toast.error("Please fill all address details");
            return;
        }

        if (!/^[0-9]{10}$/.test(address.mobile)) {
            toast.error("Enter a valid 10 digit mobile number");
            return;
        }

        if (!/^[0-9]{6}$/.test(address.pincode)) {
            toast.error("Enter a valid 6 digit pincode");
            return;
        }

        setSavedAddress(true);
        setShowAddressForm(false);

        toast.success("Address added successfully");
    }

    function placeOrder() {
        if (!savedAddress) {
            toast.error("Please add your delivery address");
            return;
        }

        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        toast.success("Checkout details submitted successfully!");
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4">

                <h1 className="text-3xl font-bold mb-8">
                    Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">

                        {/* Delivery Address */}

                        <div className="bg-white rounded-2xl border p-6">

                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold">
                                    Delivery Address
                                </h2>

                                {!showAddressForm && (
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                                    >
                                        {savedAddress ? "Edit Address" : "+ Add New Address"}
                                    </button>
                                )}
                            </div>

                            {/* Show Saved Address */}

                            {savedAddress && !showAddressForm && (
                                <div className="border rounded-xl p-4 bg-gray-50">

                                    <h3 className="font-semibold text-lg">
                                        {address.name}
                                    </h3>

                                    <p className="text-gray-600 text-sm mt-2">
                                        {address.address}
                                    </p>

                                    <p className="text-gray-600 text-sm">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>

                                    <p className="text-gray-600 text-sm mt-2">
                                        Mobile: {address.mobile}
                                    </p>

                                    <p className="text-green-700 text-sm font-semibold mt-3">
                                        Delivery Address Saved
                                    </p>

                                </div>
                            )}

                            {!savedAddress && !showAddressForm && (
                                <p className="text-gray-500 text-sm">
                                    Please add your delivery address.
                                </p>
                            )}

                            {/* Add / Edit Address Form */}

                            {showAddressForm && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={address.name}
                                        onChange={(e) =>
                                            setAddress({ ...address, name: e.target.value })
                                        }
                                        className="border rounded-lg p-3 outline-none focus:border-green-600"
                                    />

                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={address.mobile}
                                        onChange={(e) =>
                                            setAddress({ ...address, mobile: e.target.value })
                                        }
                                        className="border rounded-lg p-3 outline-none focus:border-green-600"
                                    />

                                    <textarea
                                        placeholder="Full Address"
                                        value={address.address}
                                        onChange={(e) =>
                                            setAddress({ ...address, address: e.target.value })
                                        }
                                        className="border rounded-lg p-3 outline-none focus:border-green-600 sm:col-span-2"
                                    />

                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={address.city}
                                        onChange={(e) =>
                                            setAddress({ ...address, city: e.target.value })
                                        }
                                        className="border rounded-lg p-3 outline-none focus:border-green-600"
                                    />

                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={address.state}
                                        onChange={(e) =>
                                            setAddress({ ...address, state: e.target.value })
                                        }
                                        className="border rounded-lg p-3 outline-none focus:border-green-600"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        value={address.pincode}
                                        onChange={(e) =>
                                            setAddress({ ...address, pincode: e.target.value })
                                        }
                                        className="border rounded-lg p-3 outline-none focus:border-green-600"
                                    />

                                    <button
                                        onClick={saveAddress}
                                        className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 sm:col-span-2"
                                    >
                                        Save Address
                                    </button>

                                    <button
                                        onClick={() => setShowAddressForm(false)}
                                        className="border py-3 rounded-lg font-semibold hover:bg-gray-50 sm:col-span-2"
                                    >
                                        Cancel
                                    </button>

                                </div>
                            )}

                        </div>

                        {/* Products */}

                        <div className="bg-white rounded-2xl border p-6">

                            <h2 className="text-xl font-bold mb-5">
                                Order Items ({items.length})
                            </h2>

                            <div className="space-y-5">

                                {items.map((item) => (
                                    <div
                                        key={item._id + item.variantId}
                                        className="flex items-center gap-4 border-b pb-4 last:border-0"
                                    >

                                        <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold">
                                                {item.name}
                                            </h3>

                                            <p className="text-sm text-gray-500">
                                                Quantity: {item.quantity}
                                            </p>

                                            <p className="text-green-700 font-semibold">
                                                ₹{item.price * item.quantity}
                                            </p>
                                        </div>

                                    </div>
                                ))}

                                {items.length === 0 && (
                                    <p className="text-gray-500">
                                        Your cart is empty.
                                    </p>
                                )}

                            </div>

                        </div>

                        {/* Payment Method */}

                        <div className="bg-white rounded-2xl border p-6">

                            <h2 className="text-xl font-bold mb-5">
                                Payment Method
                            </h2>

                            <label className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer">

                                <input
                                    type="radio"
                                    value="COD"
                                    checked={paymentMethod === "COD"}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                />

                                <div>
                                    <p className="font-semibold">
                                        Cash on Delivery
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Pay when your order arrives
                                    </p>
                                </div>

                            </label>

                            <label className="flex items-center gap-3 border rounded-xl p-4 mt-3 cursor-pointer">

                                <input
                                    type="radio"
                                    value="ONLINE"
                                    checked={paymentMethod === "ONLINE"}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                />

                                <div>
                                    <p className="font-semibold">
                                        Online Payment
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        UPI, Debit Card, Credit Card
                                    </p>
                                </div>

                            </label>

                        </div>

                    </div>

                    {/* Price Summary */}

                    <div className="h-fit bg-white rounded-2xl border p-6 lg:sticky lg:top-24">

                        <h2 className="text-xl font-bold mb-5">
                            Price Details
                        </h2>

                        <div className="space-y-4 text-sm">

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Subtotal
                                </span>

                                <span>
                                    ₹{subtotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Delivery Fee
                                </span>

                                <span>
                                    {delivery === 0 ? "Free" : `₹${delivery}`}
                                </span>
                            </div>

                            <div className="border-t pt-4 flex justify-between text-lg font-bold">
                                <span>Total Amount</span>

                                <span className="text-green-700">
                                    ₹{total.toFixed(2)}
                                </span>
                            </div>

                        </div>

                        <button
                            onClick={placeOrder}
                            className="w-full mt-6 rounded-xl bg-green-600 text-white py-3 font-semibold hover:bg-green-700 transition"
                        >
                            Place Order
                        </button>

                        <button
                            onClick={() => router.push("/cart")}
                            className="w-full mt-3 rounded-xl border py-3 font-medium hover:bg-gray-50"
                        >
                            Back to Cart
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}
