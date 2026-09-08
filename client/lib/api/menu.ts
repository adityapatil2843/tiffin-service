import api from "./client";
import { Menu, MenuItem, ApiResponse } from "@/types";

export async function getTodaysMenu(): Promise<Menu[]> {
  const res = await api.get<ApiResponse<{ menus: Menu[] }>>("/menu/today");
  return res.data.data.menus;
}

export async function getWeeklyMenu(): Promise<Menu[]> {
  const res = await api.get<ApiResponse<{ menus: Menu[] }>>("/menu/week");
  return res.data.data.menus;
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const res = await api.get<ApiResponse<{ items: MenuItem[] }>>("/menu/items");
  return res.data.data.items;
}

export async function createMenuItem(data: {
  name: string;
  category: "vegetarian" | "non-vegetarian" | "vegan";
  mealType?: "breakfast" | "lunch" | "dinner" | "all";
  description?: string;
  tags?: string[];
  nutrition?: {
    calories?: number;
    protein?: string;
    carbs?: string;
  };
}): Promise<MenuItem> {
  const res = await api.post<ApiResponse<{ menuItem: MenuItem }>>("/menu/items", data);
  return res.data.data.menuItem;
}

export async function updateMenuItem(
  itemId: string,
  data: Partial<MenuItem>
): Promise<MenuItem> {
  const res = await api.put<ApiResponse<{ menuItem: MenuItem }>>(`/menu/items/${itemId}`, data);
  return res.data.data.menuItem;
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  await api.delete(`/menu/items/${itemId}`);
}

export async function planMenu(data: {
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
  items: string[];
  specialNote?: string;
  isTodaysSpecial?: boolean;
}): Promise<Menu> {
  const res = await api.post<ApiResponse<{ menu: Menu }>>("/menu", data);
  return res.data.data.menu;
}

export async function getMenuById(menuId: string): Promise<Menu> {
  const res = await api.get<ApiResponse<{ menu: Menu }>>(`/menu/${menuId}`);
  return res.data.data.menu;
}

export async function updateMenu(
  menuId: string,
  data: Partial<Menu> & { items?: string[] }
): Promise<Menu> {
  const res = await api.put<ApiResponse<{ menu: Menu }>>(`/menu/${menuId}`, data);
  return res.data.data.menu;
}

export async function publishMenu(menuId: string): Promise<Menu> {
  const res = await api.put<ApiResponse<{ menu: Menu }>>(`/menu/${menuId}/publish`);
  return res.data.data.menu;
}

export async function cloneMenu(
  menuId: string,
  payload: { date: string; mealType?: "breakfast" | "lunch" | "dinner" }
): Promise<Menu> {
  const res = await api.post<ApiResponse<{ menu: Menu }>>(`/menu/${menuId}/clone`, payload);
  return res.data.data.menu;
}

export async function deleteMenu(menuId: string): Promise<void> {
  await api.delete(`/menu/${menuId}`);
}
