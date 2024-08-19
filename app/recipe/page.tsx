"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getRecipe } from "../lib/actions/post.actions";
import NavBar from "../components/navbar";

export default function Page() {
  const [recipe, setRecipe] = useState<string>(
    "<h2><strong>Ingredients</strong></h2><ul><li></li></ul><h2><strong>Instructions</strong></h2><ul><li></li></ul>"
  );
  const [creator, setCreator] = useState<string>("")
  const [loading, setLoading] = useState(true);
  const [recipeName, setRecipeName] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  const urlParams = useSearchParams();

  const fetchRecipe = async () => {
    try {
      setLoading(true); // Start loading
      const id = urlParams.get("postId");
      if (!id) {
        console.error("No id found.");
        return;
      } else {
        const recipeStr = await getRecipe(id);
        if (id) {
          setRecipe(recipeStr.recipe);
          setCreator(recipeStr.creator)
        } else {
          throw new Error("Recipe not found");
        }
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchRecipe();
    document.getElementById("recipeNameInput")?.focus();
  }, []);

  const handleSave = () => {
    if (recipeName.trim() === "") {
      alert("Please enter a recipe name.");
      return;
    }

    setIsEditing(false);

    // Trigger print dialog after saving
    setTimeout(() => {
      window.print();
    }, 0);
  };

  return (
    <div>
        <div className="print:hidden">
        <NavBar /> </div>
        <div className="bg-white text-black justify-center p-10">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
          <img
            src="/cookieLoad.gif"
            alt="Loading"
            className="lg:w-[15vw] lg:h-[15vw] w-[25vw] h-[25vw]"
          />
        </div>
      )}

    <div className="hidden print:flex mb-10">
    <img src="/cookieLogo.png" alt="CookieGram Logo" className="w-48" />
    </div>

      {isEditing ? (
        <div className="flex items-center justify-center mt-20">
          <div className="p-4 rounded bg-white shadow-lg w-full max-w-md">
            <div className="flex items-center space-x-4">
              <input
                id="recipeNameInput"
                type="text"
                placeholder="Give your recipe a name..."
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="border p-2 flex-1"
              />
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-700 text-white rounded px-4 py-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-center items-center">
                <h1 className="text-3xl font-bold mr-5">{recipeName}</h1>
                <div className="print:hidden">
                <i
                    className="fa-solid fa-pen-to-square ml-3 text-2xl mt-1 hover:text-blue-500 transition-transform duration-300 hover:scale-110 cursor-pointer"
                    onClick={() => setIsEditing(true)}
                ></i>
                </div>
            </div>
            {recipe ? (
            <>
            <div
            className="prose lg:prose-lg mt-5"
            dangerouslySetInnerHTML={{
                __html: recipe
                .replace(/<ul>/g, '<ul class="list-disc pl-5">')
                .replace(/<ol>/g, '<ol class="list-decimal pl-5">')
                .replace(/<li>/g, '<li class="mb-2">'),
            }}
            />
            <p className="mt-5 flex justify-end">By {creator}</p>
            </>
            ) : (
            <p>No recipe available.</p>
            )}
        </div>
      )}
      </div>
    </div>
  );
}
