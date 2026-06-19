export interface Ingredient {
  id: number;
  amount: number;
  unit: string;
  name: string;
  original: string;
  image: string;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: Ingredient[];
  likes: number;
}

export const mockRecipes: Recipe[] = [
  {
    id: 1,
    title: "Classic Tomato Basil Soup",
    image: "https://images.unsplash.com/photo-1548943487-a2e4f43b4850?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    usedIngredientCount: 3,
    missedIngredientCount: 1,
    likes: 120
  },
  {
    id: 2,
    title: "Garlic Butter Pasta",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    usedIngredientCount: 4,
    missedIngredientCount: 0,
    likes: 345
  },
  {
    id: 3,
    title: "Lemon Herb Chicken",
    image: "https://images.unsplash.com/photo-1598515022228-51fc60156bb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    usedIngredientCount: 2,
    missedIngredientCount: 2,
    likes: 89
  },
  {
    id: 4,
    title: "Avocado Toast with Egg",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    usedIngredientCount: 3,
    missedIngredientCount: 0,
    likes: 540
  }
];
