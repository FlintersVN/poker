
const names = [
    "Thỏ ngọc",
    "Sói xám",
    "Vịt Donald",
    "Sư tử",
    "Hổ vằn",
    "Hươu cao cổ",
    "Khủng long",
    "Voi còi",
    "Con gà này",
    "Hơi non",
    "Hà mã",
    "Mèo lười",
    "Husky",
    "Gấu trúc",
    "Gấu mèo",
    "Cá sấu",
    "Cá voi",
    "Cá heo",
    "Gà trống",
    "Heo hồng",
    "Gấu nhỏ",
    "Cún con",
    "Nhím",
    "Cậu vàng",
    "Lão hạc",
    "Chị dậu",
    "Xuân tóc đỏ",
    "Cụ cố hồng",
    "Thầy giáo 3",
    "Cà phê",
    "Trà sữa",
    "Nem chua",
    "Mocha",
    "Espresso",
    "Latte",
    "Coldbrew",
    "Mojito",
    "Matcha",
    "Đậu xanh",
    "Rau má",
    "Gin",
    "Rum",
    "Whiskey",
    "Vodka",
    "Tequila",
    "Armagnac",
    "Hennessi",
    "Sake",
    "Johnnie Waker",
    "Bordeaux",
    "Martini",
    "Tokyo",
    "Professor",
    "Berlin",
    "Manila",
    "Nairobin",
    "Moscow",
    "Rio",
    "Denver",
    "Stockholm",
    "Saitama",
    "Luffy",
    "Nico Robin",
    "Nami",
    "Sanji",
    "Zoro",
    "Franky",
    "Chopper",
    "Pikachu"
  ];

export default {
    random() {
        const bytes = new Uint32Array(1);
        const index = crypto.getRandomValues(bytes)[0] % names.length;
        return names[index];
    }
}
