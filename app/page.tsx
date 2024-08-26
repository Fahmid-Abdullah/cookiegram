"use client";
import Image from "next/image";
import React from "react";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handlePress = () => {
    router.push('/sign-up');
  };

  return (
    <div>
      <div className="relative w-full flex justify-center items-center">
        <div className="relative w-full h-[700px] md:h-[500px] lg:h-[500px] xl:h-[635px]">
          <Image
            src="/landingBg.jpg"
            fill
            style={{ objectFit: 'cover' }}
            alt="Background image"
          />
          <div className="absolute inset-0 flex flex-col xl:p-10 xl:mt-3 md: mt-5 p-5 md:text-left md:items-start text-center items-center md:justify-start justify-center text-white">
            <h1 className="text-4xl xl:text-8xl md:text-6xl font-bold mt-20 md:rotate-2">
              C🍪🍪kieGram
            </h1>
            <p className="xl:text-xl xl:max-w-2xl max-w-md text-sm xl:mt-16 md:mt-10 px-4 md:text-left text-center">
              Welcome to a food lover's paradise, where passion and creativity come together to craft dishes from around the world. 
              Connect with like-minded foodies and join us in bringing the joy of cooking into kitchens everywhere!
            </p>
            <div className="mt-20 lg:ml-16 md:ml-10">
              <Button
                color="primary"
                size="lg"
                radius="full"
                variant="shadow"
                onPress={handlePress}
                className="w-full max-w-xs xl:w-80 xl:h-20 xl:p-8 text-lg xl:text-2xl font-semibold tracking-widest"
              >
                Get Started 🢂
              </Button>
            </div>
            <p className="mt-3 xl:text-lg text-sm lg:ml-16 md:ml-10">
              Already have an account? <a href="/sign-in" className="text-blue-500"><u>Login here</u></a>
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 lg:p-8 text-black">
  <h1 className="text-4xl lg:text-4xl font-bold text-center mt-10">
    Welcome to Our CookieGram
  </h1>
  <p className="mt-4 text-lg text-center font-semibold mx-4 lg:mx-40">
    Cookiegram is a social media platform for foodies to come together and
    share their favorite foods, recipes, and culinary adventures. Whether
    you're a seasoned chef or a passionate home cook, Cookiegram provides
    a space to connect with fellow food enthusiasts, discover new flavors,
    and exchange cooking hacks.
  </p>
  <div className="flex flex-col lg:flex-row text-center mt-10">
    <div className="flex flex-col items-center w-full lg:w-1/3 mt-10 lg:mt-0 px-4">
      <h2 className="text-2xl font-semibold">Capture</h2>
      <p className="mt-5 leading-7">
        Discover a world of delicious recipes, handy tips, and kitchen tricks 
        from chefs around the globe. Whether you're just starting out or already a 
        pro, you'll find everything you need to cook up mouthwatering meals that
        everyone will love.
      </p>
      <div className="flex justify-center mt-5 flex-grow items-center">
        <Image
          src="/capture.gif"
          width={640}
          height={480}
          className="rounded-2xl object-cover"
          alt="capture image"
        />
      </div>
    </div>
    <div className="flex flex-col items-center w-full lg:w-1/3 mt-10 lg:mt-0 px-4">
      <h2 className="text-2xl font-semibold">Cook</h2>
      <p className="mt-5 leading-7">
        Join a lively and welcoming community of food enthusiasts, chefs, and home 
        cooks from all corners of the world. Connect with others who share your passion 
        for cooking, exchange delicious recipes, and discover new techniques to elevate your
        culinary skills and broaden your palate.
      </p>
      <div className="flex justify-center mt-5 flex-grow items-center">
        <Image
          src="/cook.gif"
          width={640}
          height={480}
          className="rounded-2xl object-cover"
          alt="cook image"
        />
      </div>
    </div>
    <div className="flex flex-col items-center w-full lg:w-1/3 mt-10 lg:mt-0 px-4">
      <h2 className="text-2xl font-semibold">Connect</h2>
      <p className="mt-5 leading-7">
        Share your cooking journeys through captivating visuals and inspire others with
        your delicious creations. Let your food come to life with every snapshot, sparking
        the imagination of fellow food lovers and encouraging them to explore new recipes
        and techniques.
      </p>
      <div className="flex justify-center mt-5 flex-grow items-center">
        <Image
          src="/connect.gif"
          width={640}
          height={480}
          className="rounded-2xl object-cover"
          alt="connect image"
        />
      </div>
    </div>
  </div>
</div>
<footer className="bg-gray-200 p-4 text-left">
  <p className="text-gray-600">
    © {new Date().getFullYear()} Fahmid Abdullah. All Rights Reserved.
  </p>
  <div className="mt-2 text-sm"></div>
</footer>
    </div>
  );
}
