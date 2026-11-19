import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Forpass from "./Forpass";
import Otp from "./Otp";
import Reset from "./Reset";
import SignUp from "./Form";
import Category from "./Category";
import Subcategory from "./Subcategory";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import User from "./User";
import Product from "./Product";
import Brands from "./Brands";
import Store from "./Store"
import ProductVariant from "./ProductVarient";
import StoreInventory from "./StoreInventory.jsx";
import Banner from "./Banner"
import Roles from "./Roles"
import EmailTemplates from "./EmailTempalte.jsx"
import Profile from "./Profile.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<Forpass />} />
                <Route path="/otp" element={<Otp />} />
                <Route path="/reset" element={<Reset />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>

                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/user" element={<User />} />
                        <Route path="/category" element={<Category />} />
                        <Route path="/subcategory" element={<Subcategory />} />
                        <Route path="/product" element={<Product />} />
                        <Route path ="/brands" element={<Brands />}/>
                        <Route path ="/store" element ={<Store/>}/>
                        <Route path ="/productvarient" element={<ProductVariant/>}/>
                        <Route path="/storeinventory" element={<StoreInventory/>}/>
                        <Route path="/roles" element={<Roles />} />
                        <Route path="/banners" element={<Banner />} />
                        <Route path="/email-templates" element={<EmailTemplates />} />
                        <Route path ="/profile" element ={<Profile/>}/>
                    </Route>
                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default App;

