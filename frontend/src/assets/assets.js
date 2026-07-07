import logo from './logo.png';
import search_icon from './search_icon.png';
import basket_icon from './basket_icon.png';
import salad from './salad.jpg';
import rating from './rating.jpg';
import add from './add.png';
import remove from './remove.png';
import cross from './cross.png';
import profile from './profile.jpg';
import bag from './bag.png';
import logout from './logout.png';
import parcel from './parcel.jpg';
import header_video from './header_video.mp4';

/* ---------- ASSETS ---------- */
export const assets = {
  logo,
  search_icon,
  basket_icon,
  rating,
  add,
  remove,
  cross,
  profile,
  bag,
  logout,
  parcel,
  header_video,
};

/* ---------- MENU CATEGORIES ---------- */
/* menu_name MUST match food_list.category */
export const menu = [
  { menu_name: 'salad1', menu_image: salad },
  { menu_name: 'salad2', menu_image: salad },
  { menu_name: 'salad3', menu_image: salad },
  { menu_name: 'salad4', menu_image: salad },
  { menu_name: 'salad5', menu_image: salad },
  { menu_name: 'salad6', menu_image: salad },
  { menu_name: 'salad7', menu_image: salad },
  { menu_name: 'salad8', menu_image: salad },
];

/* ---------- FOOD LIST ---------- */
export const food_list = [
  {
    _id: '1',
    name: 'Greek Salad',
    image: salad,
    price: 12,
    description: 'Food provides essential nutrients for overall health and well-being',
    category: 'salad1',
  },
  {
    _id: '2',
    name: 'Fresh Veg Salad',
    image: salad,
    price: 10,
    description: 'A healthy mix of fresh vegetables with light dressing',
    category: 'salad2',
  },
  {
    _id: '3',
    name: 'Caesar Salad',
    image: salad,
    price: 14,
    description: 'Classic Caesar salad with crunchy croutons',
    category: 'salad3',
  },
  {
    _id: '4',
    name: 'Fruit Salad',
    image: salad,
    price: 9,
    description: 'Seasonal fruits mixed for a refreshing taste',
    category: 'salad4',
  },
];
