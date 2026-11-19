
"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

const currentYear = new Date().getFullYear();

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    alert("Thank you for subscribing!");
    setEmail("");
  };

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-6">

        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* About */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">
              MyStore<span className="text-blue-500">.</span>
            </h2>

            <p className="mb-5 text-sm leading-7 text-gray-400">
              Discover quality products at the best prices.
              Shop your favorite products with a smooth and
              secure shopping experience.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 font-bold transition hover:-translate-y-1 hover:bg-blue-600 hover:text-white"
              >
                f
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 font-bold transition hover:-translate-y-1 hover:bg-pink-600 hover:text-white"
              >
                ig
              </a>

              <a
                href="#"
                aria-label="X"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 font-bold transition hover:-translate-y-1 hover:bg-sky-500 hover:text-white"
              >
                X
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 font-bold transition hover:-translate-y-1 hover:bg-blue-700 hover:text-white"
              >
                in
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">
              {[
                { name: "Home", href: "/" },
                { name: "Products", href: "/products" },
                { name: "Categories", href: "/categories" },
                { name: "About Us", href: "/about" },
                { name: "Contact Us", href: "/contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block transition-all hover:translate-x-2 hover:text-blue-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Customer Service
            </h3>

            <ul className="space-y-3 text-sm">
              {[
                { name: "My Orders", href: "/my-orders" },
                { name: "Wishlist", href: "/wishlist" },
                { name: "Shopping Cart", href: "/cart" },
                { name: "FAQs", href: "/faq" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms & Conditions", href: "/terms" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block transition-all hover:translate-x-2 hover:text-blue-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Contact Us
            </h3>

            <div className="space-y-4 text-sm text-gray-400">
              <p className="flex items-center gap-3">
                <Mail size={17} className="text-blue-400" />
                support@mystore.com
              </p>

              <p className="flex items-center gap-3">
                <Phone size={17} className="text-blue-400" />
                +91 98765 43210
              </p>

              <p className="flex items-center gap-3">
                <MapPin size={17} className="text-blue-400" />
                India
              </p>
            </div>

            {/* Newsletter */}
            <h3 className="mb-3 mt-6 font-semibold text-white">
              Subscribe to Newsletter
            </h3>

            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="min-w-0 flex-1 rounded-l-lg bg-gray-800 px-3 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="rounded-r-lg bg-blue-600 px-4 text-white transition hover:bg-blue-700"
                aria-label="Subscribe"
              >
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 text-center text-sm sm:flex-row">

          <p className="text-gray-400">
            © {currentYear} MyStore. All rights reserved.
          </p>

          <p className="text-gray-400">
            Made with <span className="text-red-500">♥</span> in India
          </p>

          <div className="flex gap-5">
            <Link
              href="/privacy-policy"
              className="transition hover:text-blue-400"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-blue-400"
            >
              Terms
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
