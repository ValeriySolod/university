import "./styles.css";

export const metadata = {
  title: "НМТ — математичний тренажер",
  description:
    "Повний тест НМТ (22 завдання, 60 хвилин) з офіційним оцінюванням і тематична практика з математики за категорією, складністю та кількістю завдань.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
