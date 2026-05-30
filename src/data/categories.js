import lipCareImg from "../assets/images/categories/lip-care.png";
import skincareImg from "../assets/images/categories/skin-care.png";
import accessoriesImg from "../assets/images/categories/accessories.png";
import beautyToolsImg from "../assets/images/categories/beauty-tools.png";

const categories = [
  {
    id: 1,
    name: "Lip Care",
    slug: "Lip Care",
    image: lipCareImg,
    tagline: "Gloss, balm & soft shine",
  },
  {
    id: 2,
    name: "Skincare",
    slug: "Skincare",
    image: skincareImg,
    tagline: "Masks, glow & self-care",
  },
  {
    id: 3,
    name: "Hair Accessories",
    slug: "Accessories",
    image: accessoriesImg,
    tagline: "Scrunchies, clips & style",
  },
  {
    id: 4,
    name: "Beauty Tools",
    slug: "Beauty Tools",
    image: beautyToolsImg,
    tagline: "Sponges, brushes & essentials",
  },
];

export default categories;