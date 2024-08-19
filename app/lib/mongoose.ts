"use server"
import mongoose from "mongoose";
import { NextResponse } from "next/server";

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) return console.log('Already Connected to MongoDB');

    try {
        const mongoLink = process.env.MONGODB_URL as string;
        await mongoose.connect(mongoLink);
        
        isConnected = true;

        console.log('Connected to MongoDB');
        NextResponse.json({ message: 'Database connection tested' }, { status: 200 });
    } catch (error) {
        console.log(error);
    }
}