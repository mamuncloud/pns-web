import { Product } from "@/types/product";

export const dummyProducts: Product[] = [
  {
    id: "p1",
    name: "Basreng Pedas Daun Jeruk",
    description: "Potongan bakso goreng renyah dengan aroma jeruk segar.",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJsdhRZKYL6zo9Mdx9cVWQNU0HwZ9QwfXqgM_27Ox0k3OW_uxNGhStPMZFVkHJL6_6nr9Ya29juAaUCVAf8DDS0O9fk6V3VYQupkrdozVqEDpY6B6eGeENijGmV_9_wAUobFiP1AhRo0GaoTFwN49ojRNxaT7zh27-Fzv20M-zb3UcANMpR4GB_C0vykgSr-C70QQmjpyE-WUU4o9eYFpXe73LiH8eZBi6e9wkbdGvUK2XFbXFMKI8bV5niZcKTM2BbNs4q9lzCmk",
    taste: "Pedas",
    variants: [
      { package: "250gr", price: 15000 },
      { package: "500gr", price: 28000 },
      { package: "1kg", price: 50000 },
    ]
  },
  {
    id: "p2",
    name: "Keripik Singkong Balado",
    description: "Irisan tipis singkong pilihan dengan bumbu balado rahasia.",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYlTJfJxTnu08u5oYEkJ5si5z_NvEZxm2ejbqR1ly1iI2-X5j8MTd77Kbgkw2HQluDZ6FHJ6eUgQMv_nSnBpgMQn46Dbr7D2lRLmsI1Rfy6uC3C28N5I7afW-fhIOAylHKFWJ69AE1AAAZIHk94w6Hr99QaiPPS0IJrG492gZQyVjXJXSqBEQ1ivFjYYksIvndXeDh5A3O5Xs1yQeatU9vrqgqujl18dPQ3iRnfvZaKkd5_ycKZ5oXyBJTRJ-Cn5Exkz9ru4wSAPg",
    taste: "Pedas",
    variants: [
      { package: "500gr", price: 20000 },
      { package: "10rb", price: 10000 },
    ]
  },
  {
    id: "p3",
    name: "Makaroni Spiral Pedas",
    description: "Tekstur renyah makaroni spiral dengan taburan cabai asli.",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuTLDzRqM4SeLC0vGrkDDAUEOfhKCDO6IGUYQRklPCyyL-bn8Q1K-4kXUzt-YFvRyE4uDFqRE52zcEvigeATKX_zMDOyprw9S5OvXAMe8l-crauNULUAHXZP2qZ7igAy2T8FGdsKqelZRDDd1VHD1Te4psvE5F_iHZHi5DC1mA9Aoz_6C6h9OwEKtn3nSBwUCQ4b4BYkiyceBakqfVVW7eVqTIP9YzVvORNqBGKlA0fXMXXnC8uD_PdWRFBIZHYTQhsQMZ2Tu9cpg",
    taste: "Pedas",
    variants: [
      { package: "bal", price: 90000 },
      { package: "1kg", price: 55000 },
      { package: "5rb", price: 5000 }
    ]
  },
  {
    id: "p4",
    name: "Kacang Telur Gurih",
    description: "Kacang telur berlapis bumbu gurih renyah tanpa pengawet.",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXxjqJKU_Wih6MwtC_xCZQ8eMt384AzUglFGGRMxHvG3xuxf2MjfpJLJyPB4c0izw8w8Cw-HubwVCvZ6JxCN4BBcAqrknbTGE51Lh4uQ_az2jo55I9K-LibMiKCNtFp6UPuwCECdbTcyBk3i0lHG90W_Uxu-ngQHrYxZaeC_QpmofQaXq-H1gUs_AgWX1N4m42XkUlIXkcxwTzfoa1F08U7ybS46O6lYjPLhynwo3_PhVYD1_LwBmrAiuSARGKZxRjIiu4AwdT3gM",
    taste: "Gurih",
    variants: [
      { package: "250gr", price: 12000 },
      { package: "10rb", price: 10000 }
    ]
  },
  {
    id: "p5",
    name: "Kue Sus Kering Coklat",
    description: "Kue sus mini dengan isian pasta coklat lumer di mulut.",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7l4XM6prYMremY1Rbk1zAMlV1iebaIr0rZrqazt1uJnAUIXJgWWeCIpy6T7vCsHpBeZdhVD_OB3Ds1ryTn7YZjgV3CChJMLkW6zIvNNuTV7KmzC5hXEVZtng0WxT1g-InIGc0nlzLP3JhuOUfqM9BQlycEv6IjFuCyPaCLqyDCMAc1bN9J-XECUZfZDsgj4GaML0cDIwhfpoJII5DAKj9L54OfeXlbFs9oznCOgh2WNqxS5ioPsfVNB7Kjm-gsE_z4c6AkbtjEsw",
    taste: "Manis",
    variants: [
      { package: "250gr", price: 18000 },
      { package: "500gr", price: 35000 }
    ]
  }
];
