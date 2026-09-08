"use client";

import React, { useEffect, useState } from "react";
import {
  getMenuItems,
  createMenuItem,
  deleteMenuItem,
  planMenu,
  getWeeklyMenu,
  publishMenu,
  cloneMenu,
  deleteMenu,
} from "@/lib/api/menu";
import { MenuItem, Menu, MealCategory, MealType } from "@/types";
import { toast } from "react-hot-toast";
import {
  ChefHat,
  Calendar,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Flame,
  Search,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  Layers,
  ArrowRight,
  Send,
  Eye,
} from "lucide-react";

export default function OwnerMenuPage() {
  const [activeTab, setActiveTab] = useState<"planner" | "dishes">("planner");

  // Dishes State
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);
  const [dishSearch, setDishSearch] = useState("");
  const [dishCategoryFilter, setDishCategoryFilter] = useState<string>("all");

  // New Dish Modal State
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishCategory, setNewDishCategory] = useState<MealCategory>("vegetarian");
  const [newDishMealType, setNewDishMealType] = useState<MealType>("all");
  const [newDishDescription, setNewDishDescription] = useState("");
  const [newDishCalories, setNewDishCalories] = useState("");
  const [newDishProtein, setNewDishProtein] = useState("");
  const [newDishTags, setNewDishTags] = useState("");
  const [isSavingDish, setIsSavingDish] = useState(false);

  // Daily Plan State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner">(
    "lunch"
  );
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [specialNote, setSpecialNote] = useState("");
  const [isTodaysSpecial, setIsTodaysSpecial] = useState(false);
  const [weeklyMenus, setWeeklyMenus] = useState<Menu[]>([]);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(true);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Clone Modal State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneTargetDate, setCloneTargetDate] = useState("");
  const [cloneMenuId, setCloneMenuId] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState(false);

  // Load Dishes
  const fetchDishes = async () => {
    setIsLoadingDishes(true);
    try {
      const items = await getMenuItems();
      setDishes(items);
    } catch (err: any) {
      toast.error("Failed to load dishes catalog");
    } finally {
      setIsLoadingDishes(false);
    }
  };

  // Load Weekly Menus
  const fetchWeeklyMenus = async () => {
    setIsLoadingWeekly(true);
    try {
      const menus = await getWeeklyMenu();
      setWeeklyMenus(menus);
    } catch (err: any) {
      toast.error("Failed to load weekly schedule");
    } finally {
      setIsLoadingWeekly(false);
    }
  };

  useEffect(() => {
    fetchDishes();
    fetchWeeklyMenus();
  }, []);

  // Update selected dishes form when date or mealType changes
  useEffect(() => {
    const targetDateStr = new Date(selectedDate).toDateString();
    const existing = weeklyMenus.find(
      (m) =>
        new Date(m.date).toDateString() === targetDateStr &&
        m.mealType === selectedMealType
    );

    if (existing) {
      const ids = Array.isArray(existing.items)
        ? existing.items.map((it) => (typeof it === "string" ? it : it._id))
        : [];
      setSelectedDishIds(ids);
      setSpecialNote(existing.specialNote || "");
      setIsTodaysSpecial(existing.isTodaysSpecial || false);
    } else {
      setSelectedDishIds([]);
      setSpecialNote("");
      setIsTodaysSpecial(false);
    }
  }, [selectedDate, selectedMealType, weeklyMenus]);

  // Handle Add New Dish
  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) {
      toast.error("Please enter a dish name");
      return;
    }

    setIsSavingDish(true);
    try {
      const tagList = newDishTags
        ? newDishTags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      await createMenuItem({
        name: newDishName.trim(),
        category: newDishCategory,
        mealType: newDishMealType,
        description: newDishDescription.trim() || undefined,
        tags: tagList.length ? tagList : undefined,
        nutrition: {
          calories: newDishCalories ? parseInt(newDishCalories, 10) : undefined,
          protein: newDishProtein.trim() || undefined,
        },
      });

      toast.success("Dish added to catalog!");
      setShowAddDishModal(false);
      // Reset form
      setNewDishName("");
      setNewDishDescription("");
      setNewDishCalories("");
      setNewDishProtein("");
      setNewDishTags("");
      fetchDishes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create dish");
    } finally {
      setIsSavingDish(false);
    }
  };

  // Handle Delete Dish
  const handleDeleteDish = async (dishId: string, dishName: string) => {
    if (!confirm(`Are you sure you want to remove "${dishName}" from the catalog?`)) return;
    try {
      await deleteMenuItem(dishId);
      toast.success("Dish removed");
      setDishes((prev) => prev.filter((d) => d._id !== dishId));
      setSelectedDishIds((prev) => prev.filter((id) => id !== dishId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete dish");
    }
  };

  // Toggle Dish in Plan
  const toggleDishSelection = (dishId: string) => {
    setSelectedDishIds((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  // Save / Plan Menu
  const handleSaveMenuPlan = async () => {
    if (selectedDishIds.length === 0) {
      toast.error("Please select at least one dish for the meal");
      return;
    }

    setIsSavingPlan(true);
    try {
      await planMenu({
        date: selectedDate,
        mealType: selectedMealType,
        items: selectedDishIds,
        specialNote: specialNote.trim() || undefined,
        isTodaysSpecial,
      });

      toast.success(`Menu scheduled for ${selectedMealType}!`);
      fetchWeeklyMenus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to schedule menu");
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Publish existing menu
  const handlePublishMenu = async (menuId: string) => {
    try {
      await publishMenu(menuId);
      toast.success("Menu published for subscribers!");
      fetchWeeklyMenus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish menu");
    }
  };

  // Clone Menu
  const handleCloneMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneMenuId || !cloneTargetDate) {
      toast.error("Please pick a target date");
      return;
    }

    setIsCloning(true);
    try {
      await cloneMenu(cloneMenuId, { date: cloneTargetDate });
      toast.success("Menu copied successfully as draft!");
      setShowCloneModal(false);
      setCloneMenuId(null);
      setCloneTargetDate("");
      fetchWeeklyMenus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clone menu");
    } finally {
      setIsCloning(false);
    }
  };

  // Delete Menu Plan
  const handleDeleteMenuPlan = async (menuId: string) => {
    if (!confirm("Are you sure you want to delete this meal schedule?")) return;
    try {
      await deleteMenu(menuId);
      toast.success("Menu plan removed");
      fetchWeeklyMenus();
      setSelectedDishIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete menu plan");
    }
  };

  // Find existing menu for current selection
  const currentSelectedMenu = weeklyMenus.find(
    (m) =>
      new Date(m.date).toDateString() === new Date(selectedDate).toDateString() &&
      m.mealType === selectedMealType
  );

  // Filter dishes
  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      dish.name.toLowerCase().includes(dishSearch.toLowerCase()) ||
      dish.description?.toLowerCase().includes(dishSearch.toLowerCase()) ||
      dish.tags?.some((t) => t.toLowerCase().includes(dishSearch.toLowerCase()));
    const matchesCategory =
      dishCategoryFilter === "all" || dish.category === dishCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Menu Planner</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Operations
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Schedule daily tiffin meals, craft recipes, and publish weekly dining menus.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab("planner")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "planner"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Daily & Weekly Planner
          </button>
          <button
            onClick={() => setActiveTab("dishes")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "dishes"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ChefHat className="h-3.5 w-3.5" />
            Dishes Catalog ({dishes.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: DAILY & WEEKLY PLANNER ────────────────────────────────────────── */}
      {activeTab === "planner" && (
        <div className="space-y-8">
          {/* Weekly Schedule Preview Strip */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Upcoming 7-Day Overview
              </span>
              <span className="text-xs text-slate-500">
                {weeklyMenus.length} Scheduled Meals
              </span>
            </div>

            {isLoadingWeekly ? (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : weeklyMenus.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-900">
                No menus scheduled for the upcoming week. Pick a date below to plan!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {weeklyMenus.map((menu) => {
                  const menuDate = new Date(menu.date);
                  const isSelected =
                    menuDate.toDateString() === new Date(selectedDate).toDateString() &&
                    menu.mealType === selectedMealType;
                  return (
                    <div
                      key={menu._id}
                      onClick={() => {
                        setSelectedDate(menuDate.toISOString().split("T")[0]);
                        setSelectedMealType(menu.mealType as any);
                      }}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                          : "bg-slate-950/60 border-slate-850 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {menuDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                              menu.status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {menu.status}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-indigo-400 capitalize mt-1 block">
                          {menu.mealType === "breakfast"
                            ? "🌅 Breakfast"
                            : menu.mealType === "lunch"
                            ? "☀️ Lunch"
                            : "🌙 Dinner"}
                        </span>
                        <div className="mt-2 text-xs text-slate-300 font-medium line-clamp-2">
                          {Array.isArray(menu.items)
                            ? menu.items
                                .map((it) => (typeof it === "string" ? "Dish" : it.name))
                                .join(", ")
                            : "No items"}
                        </div>
                      </div>

                      {menu.isTodaysSpecial && (
                        <span className="mt-2 text-[9px] font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> Chef Special
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Planner Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Plan Settings & Action Bar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-indigo-400" />
                  Meal Schedule Configuration
                </h2>

                {/* Target Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Meal Slot */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Meal Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "breakfast", label: "Breakfast", icon: "🌅" },
                      { id: "lunch", label: "Lunch", icon: "☀️" },
                      { id: "dinner", label: "Dinner", icon: "🌙" },
                    ].map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedMealType(slot.id as any)}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          selectedMealType === slot.id
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="text-base">{slot.icon}</span>
                        <span>{slot.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Special Note / Highlights (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra sweet gulab jamun with lunch!"
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Today's Special Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-850">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        Mark as Chef Special
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Highlights meal badge on customer app
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTodaysSpecial}
                    onChange={(e) => setIsTodaysSpecial(e.target.checked)}
                    className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Status Indicator if already exists */}
                {currentSelectedMenu && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Current Status:</span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          currentSelectedMenu.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {currentSelectedMenu.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                      {currentSelectedMenu.status === "draft" && (
                        <button
                          onClick={() => handlePublishMenu(currentSelectedMenu._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          <Send className="h-3 w-3" />
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCloneMenuId(currentSelectedMenu._id);
                          setShowCloneModal(true);
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 text-xs font-semibold"
                        title="Copy to another date"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Clone
                      </button>
                      <button
                        onClick={() => handleDeleteMenuPlan(currentSelectedMenu._id)}
                        className="p-1.5 rounded-lg bg-rose-950/20 text-rose-400 border border-rose-900/30 hover:bg-rose-900/30"
                        title="Delete this meal plan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSaveMenuPlan}
                  disabled={isSavingPlan}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
                >
                  {isSavingPlan ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {currentSelectedMenu ? "Update Scheduled Menu" : "Schedule Meal"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Col: Dish Multi-Selector */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-white">Select Included Dishes</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Selected dishes ({selectedDishIds.length}) will appear on the customer's daily plate.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search dishes..."
                        value={dishSearch}
                        onChange={(e) => setDishSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 w-44"
                      />
                    </div>
                    <button
                      onClick={() => setShowAddDishModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-bold transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New Dish
                    </button>
                  </div>
                </div>

                {isLoadingDishes ? (
                  <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  </div>
                ) : filteredDishes.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-850 rounded-xl bg-slate-950/40">
                    <ChefHat className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-semibold">No dishes found</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Click &quot;New Dish&quot; above to create items in your master catalog.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {filteredDishes.map((dish) => {
                      const isSelected = selectedDishIds.includes(dish._id);
                      return (
                        <div
                          key={dish._id}
                          onClick={() => toggleDishSelection(dish._id)}
                          className={`cursor-pointer rounded-xl p-3.5 border transition-all flex items-start justify-between select-none ${
                            isSelected
                              ? "bg-indigo-950/30 border-indigo-500/50 shadow-sm"
                              : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`mt-0.5 h-4 w-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                                isSelected
                                  ? "bg-indigo-600 border-indigo-500 text-white"
                                  : "border-slate-700 bg-slate-900"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-200 truncate">
                                  {dish.name}
                                </span>
                                <span
                                  className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                                    dish.category === "vegetarian"
                                      ? "bg-emerald-400"
                                      : dish.category === "vegan"
                                      ? "bg-purple-400"
                                      : "bg-rose-400"
                                  }`}
                                  title={dish.category}
                                />
                              </div>

                              {dish.description && (
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {dish.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[9px] font-mono text-slate-500 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                  {dish.mealType}
                                </span>
                                {dish.nutrition?.calories && (
                                  <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                                    <Flame className="h-2.5 w-2.5 text-amber-500" />
                                    {dish.nutrition.calories} kcal
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                <span>Selected: <strong className="text-indigo-400">{selectedDishIds.length}</strong> dishes</span>
                <span>Total Catalog: {dishes.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DISH MASTER CATALOG ────────────────────────────────────────── */}
      {activeTab === "dishes" && (
        <div className="space-y-6">
          {/* Catalog Top Filter & Add Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter recipes..."
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 w-60"
                />
              </div>

              <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                {["all", "vegetarian", "non-vegetarian", "vegan"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDishCategoryFilter(cat)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors ${
                      dishCategoryFilter === cat
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowAddDishModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add New Recipe
            </button>
          </div>

          {/* Dishes Grid */}
          {isLoadingDishes ? (
            <div className="flex justify-center py-32">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="text-center py-24 rounded-2xl border border-dashed border-slate-850 bg-slate-950/40">
              <ChefHat className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-300">No dishes in catalog</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Create new dishes with ingredients, calories, and categories to start planning your daily menus.
              </p>
              <button
                onClick={() => setShowAddDishModal(true)}
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                <Plus className="h-4 w-4" /> Add Dish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map((dish) => (
                <div
                  key={dish._id}
                  className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg flex flex-col justify-between relative group hover:border-slate-800 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{dish.name}</span>
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${
                              dish.category === "vegetarian"
                                ? "bg-emerald-400 ring-4 ring-emerald-400/20"
                                : dish.category === "vegan"
                                ? "bg-purple-400 ring-4 ring-purple-400/20"
                                : "bg-rose-400 ring-4 ring-rose-400/20"
                            }`}
                            title={dish.category}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">
                          {dish.category} • {dish.mealType}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteDish(dish._id, dish.name)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-900/30 transition-all"
                        title="Delete dish"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {dish.description && (
                      <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    )}

                    {dish.tags && dish.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {dish.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-medium bg-slate-950 border border-slate-850 text-slate-400 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nutrition Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-500" />
                      {dish.nutrition?.calories ? `${dish.nutrition.calories} kcal` : "— kcal"}
                    </span>
                    <span>
                      Protein: {dish.nutrition?.protein || "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: ADD NEW DISH ───────────────────────────────────────────────── */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl max-w-lg w-full relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-1">Add Recipe to Catalog</h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter dish details to make it available across daily lunch/dinner meal plans.
            </p>

            <form onSubmit={handleCreateDish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paneer Butter Masala"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Diet Category
                  </label>
                  <select
                    value={newDishCategory}
                    onChange={(e) => setNewDishCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Meal Suitability
                  </label>
                  <select
                    value={newDishMealType}
                    onChange={(e) => setNewDishMealType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Meals</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Rich tomato cashew gravy with cottage cheese cubes"
                  value={newDishDescription}
                  onChange={(e) => setNewDishDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 320"
                    value={newDishCalories}
                    onChange={(e) => setNewDishCalories(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Protein
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14g"
                    value={newDishProtein}
                    onChange={(e) => setNewDishProtein(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="North Indian, Paneer, Gravy, Spicy"
                  value={newDishTags}
                  onChange={(e) => setNewDishTags(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDish}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSavingDish ? "Saving..." : "Save Recipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CLONE MENU ─────────────────────────────────────────────────── */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white mb-1">Clone Meal Schedule</h3>
            <p className="text-xs text-slate-400 mb-4">
              Duplicate this menu to another date as a draft.
            </p>

            <form onSubmit={handleCloneMenu} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Target Date
                </label>
                <input
                  type="date"
                  required
                  value={cloneTargetDate}
                  onChange={(e) => setCloneTargetDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCloning}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isCloning ? "Cloning..." : "Duplicate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
